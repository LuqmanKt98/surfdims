# Deployment Guide for Stripe Integration

## 1. Set Production Environment Variables
Your `.env` file is not uploaded to Firebase Cloud Functions for security reasons. You must set the Stripe Secret Key in the Firebase Environment Configuration.

Run the following command in your terminal (replace `sk_live_...` with your actual Stripe Secret Key):

```sh
firebase functions:config:set stripe.secret="sk_live_..."
```

## 2. Deploy the Functions
After setting the config, deploy the functions again:

```sh
firebase deploy --only functions
```

## 3. Verify
Once deployed, the `createPaymentIntent` function will be able to access the key via `functions.config().stripe.secret`.

## Troubleshooting
If you still see CORS errors:
1. Check the Firebase Functions logs in the Google Cloud Console.
2. Ensure you are using the correct Project ID in your frontend `.env` (it seems you are using `gen-lang-client-0093965307`).
