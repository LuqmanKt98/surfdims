import React from 'react';
import XIcon from './icons/XIcon';

interface CharityModalProps {
    onClose: () => void;
    totalRaised: number;
    currencySymbol: string;
}

const CharityModal: React.FC<CharityModalProps> = ({ onClose, totalRaised, currencySymbol }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg relative animate-fade-in-down">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition">
                    <XIcon />
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Disabled Surfing</h2>
                <p className="text-gray-600 leading-relaxed">
                    SurfDims have been actively involved with disability surfing for over a decade and are passionate about it's promotion and funding. 
                    Any money received will be distributed to a disabled surfing initiative in the country it was donated from.
                </p>
                <p className="text-gray-800 font-semibold mt-4">
                    Total amount raised to date is {currencySymbol}{totalRaised.toFixed(2)}
                </p>
            </div>
        </div>
    );
};

export default CharityModal;
