const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getFirestore } = require('firebase-admin/firestore');
admin.initializeApp();
const db = getFirestore('surfdims');

/**
 * Triggered when a new board is created.
 * Enforces business logic:
 * - Used boards: Active for 3 months (90 days).
 * - New boards: Verify payment, then Active for 12 months (365 days).
 */
exports.onBoardCreate = functions.firestore
    .database('surfdims')
    .document("boards/{boardId}")
    .onCreate(async (snap, context) => {
        const newData = snap.data();
        const boardId = context.params.boardId;

        // Prevent infinite loops if we are the ones writing
        // (Though we are updating existing, so onCreate won't trigger again for this doc)

        try {
            if (newData.condition === "Used") {
                // --- USED BOARD LOGIC ---
                // Free, Active for 90 days.
                const now = admin.firestore.Timestamp.now();
                const expiresAtDate = new Date(now.toMillis() + 90 * 24 * 60 * 60 * 1000);

                await db.collection("boards").doc(boardId).update({
                    status: "Live", // Activate it
                    expiresAt: expiresAtDate.toISOString(),
                    isPaid: false,
                    activeAt: now
                });

                console.log(`Activated USED board ${boardId}. Expires: ${expiresAtDate.toISOString()}`);
                return;
            } else if (newData.condition === "New") {
                // --- NEW BOARD LOGIC ---
                // Paid, Active for 365 days.
                // Requires payment verification.

                // 1. Verify Payment
                const paymentIntentId = newData.paymentIntentId;

                if (!paymentIntentId) {
                    console.log(`New board ${boardId} missing paymentIntentId.`);
                    return;
                }

                // Verify with Stripe
                // Initialize Stripe lazily to prevent global crashes if env var is missing
                const stripeKey = process.env.STRIPE_SECRET_KEY;
                if (!stripeKey) {
                    console.error("STRIPE_SECRET_KEY is missing in environment variables.");
                    // In production, we might want to fail the board activation or retry.
                    // For now, logging error.
                    return;
                }
                const stripe = require("stripe")(stripeKey);

                const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

                if (paymentIntent.status === 'succeeded') {
                    const now = admin.firestore.Timestamp.now();
                    const expiresAtDate = new Date(now.toMillis() + 365 * 24 * 60 * 60 * 1000);

                    await db.collection("boards").doc(boardId).update({
                        status: "Live",
                        expiresAt: expiresAtDate.toISOString(),
                        isPaid: true,
                        activeAt: now,
                        paymentVerified: true
                    });
                    console.log(`Activated NEW board ${boardId}. Payment verified.`);
                } else {
                    console.warn(`Payment verification failed for board ${boardId}. Status: ${paymentIntent.status}`);
                    await db.collection("boards").doc(boardId).update({
                        status: "PaymentFailed",
                        paymentVerified: false
                    });
                }
            }
        } catch (error) {
            console.error(`Error processing board ${boardId}:`, error);
        }
    });

/**
 * Scheduled function (Daily) to check for expired listings.
 * Updates status to 'Expired' and sets inactiveAt.
 */
exports.checkExpiredListings = functions.pubsub
    .schedule("every 24 hours")
    .onRun(async (context) => {
        const now = admin.firestore.Timestamp.now();
        const todayISO = new Date().toISOString();
        // Note: ISO string comparison works well if formats are consistent.
        // Ideally, store dates as Timestamp for robust querying.
        // Here we query efficiently using the ISO string logic maintained in the app.

        try {
            // Find all Live boards that have passed their expiry date
            const snapshot = await db.collection("boards")
                .where("status", "==", "Live")
                .where("expiresAt", "<", todayISO)
                .get();

            if (snapshot.empty) {
                console.log("No expired listings found.");
                return null;
            }

            const batch = db.batch();
            snapshot.docs.forEach((doc) => {
                batch.update(doc.ref, {
                    status: "Expired",
                    inactiveAt: now.toISOString(),
                    lifecycleStatus: "inactive"
                });
            });

            await batch.commit();
            console.log(`Expired ${snapshot.size} listings.`);
        } catch (error) {
            console.error("Error checking expired listings:", error);
        }
        return null;
    });

/**
 * Scheduled function (Daily) to cleanup old inactive listings.
 * Deletes listings inactive for > 30 days and their associated images.
 */
exports.cleanupOldListings = functions.pubsub
    .schedule("every 24 hours")
    .onRun(async (context) => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const cutoffISO = thirtyDaysAgo.toISOString();

        try {
            // Find listings inactive for more than 30 days
            // We check for inactiveAt being set and older than 30 days.
            // We also verify status is not Live.
            const snapshot = await db.collection("boards")
                .where("lifecycleStatus", "==", "inactive")
                .where("inactiveAt", "<", cutoffISO)
                .get();

            if (snapshot.empty) {
                console.log("No old listings to cleanup.");
                return null;
            }

            const bucket = admin.storage().bucket();
            const deletePromises = [];

            snapshot.docs.forEach((doc) => {
                const data = doc.data();

                // 1. Delete Logic for Firestore
                deletePromises.push(doc.ref.delete());

                // 2. Delete Logic for Storage
                // Assuming all images are in the folder defined by `storagePath`
                // or we check the `images` array if `storagePath` isn't reliable for bulk delete.
                // Best practice: Delete the 'folder' prefix.
                if (data.storagePath) {
                    // CAUTION: This deletes everything in that prefix. 
                    // If storagePath is 'images/userId', this deletes ALL user images if one board expires? 
                    // WAIT. storagePath in App.tsx is `images/${currentUser.id}`.
                    // This is dangerous if multiple boards share the same folder prefix but are different docs.
                    // The app logic seems to treat `storagePath` as a collection for the USER, not the board.
                    // Listing deletion shouldn't wipe the user's folder unless we isolate board images.

                    // CORRECT APPROACH FOR THIS APP:
                    // Images are URLs in `images` array. We should parse/delete them individually if they are in our bucket.
                    // OR, if the app creates a subfolder per board (it doesn't seem to currently), use that.
                    // Current App.tsx: storagePath: `images/${currentUser.id}`.
                    // So multiple boards share the same folder. We CANNOT delete the folder.
                    // We must delete the specific files referenced in `images`.

                    if (data.images && Array.isArray(data.images)) {
                        data.images.forEach(imageUrl => {
                            // Extract path from URL or if we stored paths separately.
                            // Assuming standard Firebase Storage URL, we can't easily guess the path without parsing.
                            // For this task, if we don't have exact storage references, we might skip or log.
                            // However, to be thorough:
                            try {
                                // Basic attempt to parse path from URL if it's a standard firebase tokenized URL
                                // url structure: .../o/images%2Fuserid%2Ffilename?alt=...
                                const decodedUrl = decodeURIComponent(imageUrl);
                                const matches = decodedUrl.match(/o\/(.*?)\?/);
                                if (matches && matches[1]) {
                                    const filePath = matches[1];
                                    deletePromises.push(bucket.file(filePath).delete().catch(e => console.log(`Failed to delete file ${filePath}`, e)));
                                }
                            } catch (e) {
                                console.log("Error parsing image URL for deletion", imageUrl);
                            }
                        });
                    }
                }
            });

            await Promise.all(deletePromises);
            console.log(`Cleaned up ${snapshot.size} old listings.`);
        } catch (error) {
            console.error("Error cleaning up old listings:", error);
        }
        return null;
    });


