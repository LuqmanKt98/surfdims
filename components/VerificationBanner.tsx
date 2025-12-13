import React from 'react';
import { VerificationFlowStatus } from '../types';

interface VerificationBannerProps {
    onVerify: () => void;
    status: VerificationFlowStatus;
}

const VerificationBanner: React.FC<VerificationBannerProps> = ({ onVerify, status }) => {
    return (
        <div className="bg-yellow-100 border-b-2 border-yellow-300 text-center p-3 sticky top-[76px] z-10">
            <p className="text-sm text-yellow-800">
                {status === 'pending' ? (
                    'Verification email sent! Please check your inbox.'
                ) : (
                    <>
                        Your account is not verified. Please check your email or{' '}
                        <button onClick={onVerify} className="font-bold underline hover:text-yellow-900 focus:outline-none">
                            click here to verify
                        </button>
                        {' '}to get full access.
                    </>
                )}
            </p>
        </div>
    );
};

export default VerificationBanner;