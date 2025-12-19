import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  }
}

const db = admin.apps.length ? admin.firestore() : null;
if (db) {
  db.settings({ databaseId: 'surfdims' });
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const boardId = paymentIntent.metadata.boardId;
  if (boardId && boardId !== 'unknown' && db) {
    const now = admin.firestore.Timestamp.now();
    const expiresAtDate = new Date(now.toMillis() + 365 * 24 * 60 * 60 * 1000);

    try {
      await db.collection('boards').doc(boardId).update({
        status: 'Live',
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

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const boardId = paymentIntent.metadata.boardId;
  if (boardId && boardId !== 'unknown' && db) {
    try {
      await db.collection('boards').doc(boardId).update({
        status: 'PaymentFailed',
        paymentVerified: false
      });
    } catch (e) {
      console.error(`Failed to update board ${boardId} after failure:`, e);
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'] as string;
  
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  // Get raw body
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const rawBody = Buffer.concat(chunks);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return res.status(200).json({ received: true });
}

