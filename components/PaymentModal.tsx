import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../stripe';
import { User } from '../types';
import { getCurrencySymbol } from '../countries';
import XIcon from './icons/XIcon';
import CreditCardIcon from './icons/CreditCardIcon';
import StripePaymentForm from './StripePaymentForm';

interface PaymentModalProps {
    amount: number;
    itemDescription: string;
    currentUser: User;
    onClose: () => void;
    onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ amount, itemDescription, currentUser, onClose, onPaymentSuccess }) => {
    const currencySymbol = getCurrencySymbol(currentUser.country);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg relative animate-fade-in-down">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition">
                    <XIcon />
                </button>
                <div className="text-center mb-6">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                        <CreditCardIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">Complete Payment</h2>
                    <p className="text-gray-600 mt-1">Secure payment powered by Stripe</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex justify-between items-center text-gray-700">
                        <p>Item(s): <span className="font-semibold">{itemDescription}</span></p>
                        <p className="font-bold text-lg">{currencySymbol}{amount.toFixed(2)}</p>
                    </div>
                </div>

                <Elements stripe={stripePromise}>
                    <StripePaymentForm
                        amount={amount}
                        currency={currentUser.country === 'NZ' ? 'nzd' : currentUser.country === 'AU' ? 'aud' : 'usd'}
                        onSuccess={onPaymentSuccess}
                        onCancel={onClose}
                    />
                </Elements>
            </div>
        </div>
    );
};

export default PaymentModal;
