const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
// This expects GOOGLE_APPLICATION_CREDENTIALS to be set in .env or environment
// OR existing default credentials if running in a cloud environment (like GCP).
// For local dev, a serviceAccountKey.json is often easiest.
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp();
} else {
    try {
        const serviceAccount = require('./serviceAccountKey.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (e) {
        console.warn("Warning: Could not initialize Firebase Admin with serviceAccountKey.json or GOOGLE_APPLICATION_CREDENTIALS.");
        console.warn("Firestore updates will fail until credentials are provided.");
        // We initialize with default as a fallback, might work if gcloud auth is set.
        try { admin.initializeApp(); } catch (err) { }
    }
}

const db = admin.firestore();
db.settings({ databaseId: 'surfdims' }); // Ensure we target the right DB if needed

const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(cors({ origin: true })); // Allow all origins for now, verify for prod
app.use((req, res, next) => {
    if (req.originalUrl === '/webhook') {
        next();
    } else {
        express.json()(req, res, next);
    }
});

// Verify Stripe Key
if (!process.env.STRIPE_SECRET_KEY) {
    console.error("CRITICAL: STRIPE_SECRET_KEY is missing from .env");
}

// Routes
app.get('/', (req, res) => {
    res.send('Surfdims API is running');
});

/**
 * create-payment-intent
 * Creates a Stripe PaymentIntent for a specific board.
 */
app.post('/create-payment-intent', async (req, res) => {
    const { amount, currency, boardId } = req.body;

    if (!amount || !currency) {
        return res.status(400).json({ error: 'Missing required parameters: amount, currency' });
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: currency,
            automatic_payment_methods: { enabled: true },
            metadata: {
                boardId: boardId || 'unknown'
            }
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id
        });
    } catch (e) {
        console.error("Error creating payment intent:", e);
        res.status(500).send({ error: e.message });
    }
});

/**
 * Webhook Handler
 */
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
            await handlePaymentSuccess(paymentIntent);
            break;
        case 'payment_intent.payment_failed':
            const paymentFailed = event.data.object;
            console.log(`PaymentIntent ${paymentFailed.id} failed.`);
            await handlePaymentFailure(paymentFailed);
            break;
        default:
            // Unexpected event type
            console.log(`Unhandled event type ${event.type}.`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.send();
});

// Helper Functions
async function handlePaymentSuccess(paymentIntent) {
    const boardId = paymentIntent.metadata.boardId;
    if (boardId && boardId !== 'unknown') {
        const now = admin.firestore.Timestamp.now();
        const expiresAtDate = new Date(now.toMillis() + 365 * 24 * 60 * 60 * 1000); // 1 year

        try {
            await db.collection("boards").doc(boardId).update({
                status: "Live",
                expiresAt: expiresAtDate.toISOString(),
                isPaid: true,
                activeAt: now,
                paymentVerified: true,
                paymentIntentId: paymentIntent.id
            });
            console.log(`Successfully activated board ${boardId}`);
        } catch (e) {
            console.error(`Failed to update board ${boardId} after success:`, e);
        }
    }
}

async function handlePaymentFailure(paymentIntent) {
    const boardId = paymentIntent.metadata.boardId;
    if (boardId && boardId !== 'unknown') {
        try {
            await db.collection("boards").doc(boardId).update({
                status: "PaymentFailed",
                paymentVerified: false
            });
        } catch (e) {
            console.error(`Failed to update board ${boardId} after failure:`, e);
        }
    }
}

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
    console.log(`Node server listening on port ${PORT}`);
});
