import React, { useState } from 'react';
import { User } from '../types';
import { getCurrencySymbol } from '../countries';
import XIcon from './icons/XIcon';
import CreditCardIcon from './icons/CreditCardIcon';
import SpinnerIcon from './icons/SpinnerIcon';

interface PaymentModalProps {
    amount: number;
    itemDescription: string;
    currentUser: User;
    onClose: () => void;
    onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ amount, itemDescription, currentUser, onClose, onPaymentSuccess }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setError('');

        // Simulate API call to payment gateway
        setTimeout(() => {
            // Simulate a random failure for demonstration
            if (Math.random() > 0.9) {
                setError('Payment failed. Please check your card details and try again.');
                setIsProcessing(false);
            } else {
                onPaymentSuccess();
            }
        }, 2000);
    };
    
    const currencySymbol = getCurrencySymbol(currentUser.country);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg relative animate-fade-in-down">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition" disabled={isProcessing}>
                    <XIcon />
                </button>
                <div className="text-center mb-6">
                     <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                        <CreditCardIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">Complete Payment</h2>
                    <p className="text-gray-600 mt-1">Secure payment gateway</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex justify-between items-center text-gray-700">
                        <p>Item(s): <span className="font-semibold">{itemDescription}</span></p>
                        <p className="font-bold text-lg">{currencySymbol}{amount.toFixed(2)}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Card Number</label>
                        <input type="text" placeholder="**** **** **** 1234" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [-webkit-appearance:none]"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                            <input type="text" placeholder="MM / YY" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [-webkit-appearance:none]"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">CVC</label>
                            <input type="text" placeholder="123" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [-webkit-appearance:none]"/>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Name on Card</label>
                        <input type="text" placeholder="John D. Surfer" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [-webkit-appearance:none]"/>
                    </div>
                    
                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

                    <div className="pt-2">
                        <button type="submit" disabled={isProcessing} className="w-full flex justify-center items-center gap-3 py-3 px-4 text-lg font-semibold rounded-lg shadow-md bg-green-600 hover:bg-green-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition disabled:bg-green-400 disabled:cursor-not-allowed">
                            {isProcessing ? <SpinnerIcon /> : `Pay ${currencySymbol}${amount.toFixed(2)}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
