import React, { useState, useEffect } from 'react';
import SpinnerIcon from './icons/SpinnerIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface VerificationStatusModalProps {
    onVerified: () => void;
    onClose: () => void;
}

const VerificationStatusModal: React.FC<VerificationStatusModalProps> = ({ onVerified, onClose }) => {
    const [status, setStatus] = useState<'verifying' | 'success'>('verifying');

    useEffect(() => {
        const timer = setTimeout(() => {
            onVerified();
            setStatus('success');
        }, 2500); // Simulate network delay for verification

        return () => clearTimeout(timer);
    }, [onVerified]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-sm relative animate-fade-in-down text-center">
                {status === 'verifying' ? (
                    <>
                        <SpinnerIcon className="h-12 w-12 text-blue-600 mx-auto animate-spin" />
                        <h2 className="text-2xl font-bold text-gray-800 mt-4">Verifying your account...</h2>
                        <p className="text-gray-600 mt-2">This will only take a moment.</p>
                    </>
                ) : (
                    <>
                         <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                            <CheckCircleIcon className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Success!</h2>
                        <p className="text-gray-600 mt-2 mb-6">Your account is now verified.</p>
                        <button
                            onClick={onClose}
                            className="w-full py-3 px-4 font-semibold rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                        >
                            Awesome!
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerificationStatusModal;
