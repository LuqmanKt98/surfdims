import React from 'react';
import { Surfboard } from '../types';
import XIcon from './icons/XIcon';
import BellIcon from './icons/BellIcon';

interface NotificationModalProps {
    board?: Surfboard;
    searchTerm?: string;
    onClose: () => void;
    onConfirm: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ board, searchTerm, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md relative animate-fade-in-down text-center">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition">
                    <XIcon />
                </button>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                    <BellIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Get Notified?</h2>
                <p className="text-gray-600 mb-6">
                    {board
                        ? <>Would you like to receive notifications when boards similar to the <span className="font-semibold">{board.brand} {board.model}</span> are listed?</>
                        : <>Would you like to receive notifications for new listings matching your search for <span className="font-semibold">"{searchTerm}"</span>?</>
                    }
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={onConfirm}
                        className="w-full py-3 px-4 font-semibold rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                    >
                        Yes, please!
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-3 px-4 font-semibold rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition"
                    >
                        No, thanks
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;