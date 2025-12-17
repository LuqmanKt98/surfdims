import { loadStripe } from '@stripe/stripe-js';

// Your Stripe publishable key (test key)
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Load Stripe
export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);


// Your Stripe secret key
// NOTE: Ideally this should be server-side only. We expose it here for the client-side demo only.
// export const STRIPE_SECRET_KEY = import.meta.env.VITE_STRIPE_SECRET_KEY; // DEPRECATED: Moved to backend

