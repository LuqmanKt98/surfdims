import React, { useState } from 'react';
import { User } from '../types';
import { reverseGeocode } from '../locationUtils';
import XIcon from './icons/XIcon';
import MapPinIcon from './icons/MapPinIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import { COUNTRIES } from '../countries';

interface LocationPermissionModalProps {
    currentUser: User;
    onClose: () => void;
    onUpdateCountry: (countryCode: string) => void;
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({ currentUser, onClose, onUpdateCountry }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleAllowAccess = () => {
        setIsProcessing(true);
        setError('');

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            setIsProcessing(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const countryCode = await reverseGeocode(latitude, longitude);
                    onUpdateCountry(countryCode);
                } catch (err) {
                    setError('Could not determine country from your location.');
                    setIsProcessing(false);
                }
            },
            (err) => {
                if (err.code === err.PERMISSION_DENIED) {
                     setError("Location access was denied. You can set your country manually in your account settings.");
                } else {
                    setError("Could not get your location. Please try again or set your country manually.");
                }
                setIsProcessing(false);
            }
        );
    };

    const defaultCountryName = COUNTRIES.find(c => c.code === currentUser.country)?.name || 'New Zealand';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md relative animate-fade-in-down text-center">
                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition">
                    <XIcon />
                </button>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                    <MapPinIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {currentUser.name}!</h2>
                <p className="text-gray-600 mb-6">
                   To show you relevant listings, we've set your country to <span className="font-semibold">{defaultCountryName}</span>. For a more accurate setting, allow us to access your location.
                </p>

                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md mb-4">{error}</p>}

                <div className="flex flex-col gap-4">
                    <button
                        onClick={handleAllowAccess}
                        disabled={isProcessing}
                        className="w-full flex justify-center items-center gap-3 py-3 px-4 font-semibold rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:bg-blue-400"
                    >
                        {isProcessing ? <SpinnerIcon /> : 'Use My Current Location'}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="w-full py-3 px-4 font-semibold rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationPermissionModal;
