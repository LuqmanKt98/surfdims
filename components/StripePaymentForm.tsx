import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { StripeCardElement } from '@stripe/stripe-js';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import SpinnerIcon from './icons/SpinnerIcon';

interface StripePaymentFormProps {
    amount: number;
    currency: string;
    currencySymbol?: string;
    onSuccess: (paymentIntentId: string) => void;
    onCancel: () => void;
}

// ... (options object unchanged)
const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            color: '#1f2937',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#9ca3af',
            },
        },
        invalid: {
            color: '#ef4444',
            iconColor: '#ef4444',
        },
    },
};

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ amount, currency, currencySymbol = '$', onSuccess, onCancel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            setError('Stripe has not loaded yet. Please try again.');
            return;
        }

        setIsProcessing(true);
        setError(null);

        const cardElement = elements.getElement(CardElement) as unknown as StripeCardElement;

        if (!cardElement) {
            setError('Card element not found');
            setIsProcessing(false);
            return;
        }

        try {
            // Create a PaymentIntent on the server via Cloud Function
            const paymentIntent = await createPaymentIntent(amount, currency);

            // Confirm the payment on the client
            const { error: stripeError, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(
                paymentIntent.client_secret,
                {
                    payment_method: {
                        card: cardElement,
                    },
                }
            );

            if (stripeError) {
                setError(stripeError.message || 'Payment failed');
                setIsProcessing(false);
            } else if (confirmedPayment && confirmedPayment.status === 'succeeded') {
                onSuccess(confirmedPayment.id);
                setIsProcessing(false);
            }
        } catch (err: any) {
            console.error("Payment Error:", err);
            setError(err.message || 'An unexpected error occurred');
            setIsProcessing(false);
        }
    };

    const createPaymentIntent = async (amount: number, currency: string) => {
        try {
            // Uses Vercel serverless function
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount, currency }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Payment initialization failed');
            }

            const data = await response.json();
            return {
                client_secret: data.clientSecret || data.client_secret,
                id: data.id
            };
        } catch (error: any) {
            console.error("Error creating payment intent:", error);
            throw new Error(error.message || 'Failed to initialize payment');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Details
                </label>
                <div className="border border-gray-300 rounded-md p-3 bg-white">
                    <CardElement options={CARD_ELEMENT_OPTIONS} />
                </div>
            </div>

            {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                </div>
            )}

            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="flex-1 py-3 px-4 font-semibold rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 text-gray-700 focus:outline-none transition disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!stripe || isProcessing}
                    className="flex-1 flex justify-center items-center gap-3 py-3 px-4 text-lg font-semibold rounded-lg shadow-md bg-green-600 hover:bg-green-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition disabled:bg-green-400 disabled:cursor-not-allowed"
                >
                    {isProcessing ? (
                        <>
                            <SpinnerIcon /> Processing...
                        </>
                    ) : (
                        `Pay ${currencySymbol}${amount.toFixed(2)}`
                    )}
                </button>
            </div>


        </form>
    );
};

export default StripePaymentForm;
