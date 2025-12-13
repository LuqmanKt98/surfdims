import React, { useState } from 'react';
import { Surfboard } from '../types';
import XIcon from './icons/XIcon';
import CopyIcon from './icons/CopyIcon';
import EmailIcon from './icons/EmailIcon';
import WhatsappIcon from './icons/WhatsappIcon';
import SmsIcon from './icons/SmsIcon';

interface ShareModalProps {
    board: Surfboard;
    onClose: () => void;
}

const ShareButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    href?: string;
}> = ({ icon, label, onClick, href }) => (
    <a
        href={href}
        onClick={onClick}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-center"
    >
        <div className="w-12 h-12 flex items-center justify-center">{icon}</div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
    </a>
);


const ShareModal: React.FC<ShareModalProps> = ({ board, onClose }) => {
    const [copyButtonText, setCopyButtonText] = useState('Copy Link');

    const boardUrl = `${window.location.origin}?boardId=${board.id}`;
    const shareTitle = [board.brand, board.model].filter(Boolean).join(' ');

    const firstDim = board.dimensions?.[0];
    const dimensionText = (firstDim && typeof firstDim.length === 'number' && !isNaN(firstDim.length)) ? `${firstDim.length}' ` : '';

    const shareText = `Check out this ${shareTitle ? `${dimensionText}${shareTitle}` : 'surfboard'} on SurfDims! ${boardUrl}`;

    const handleCopy = () => {
        try {
            if (navigator?.clipboard?.writeText) {
                navigator.clipboard.writeText(boardUrl).then(() => {
                    setCopyButtonText('Copied!');
                    setTimeout(() => setCopyButtonText('Copy Link'), 2000);
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                    alert('Failed to copy link. Please copy manually.');
                });
            } else {
                alert('Clipboard access not available. Please copy the link manually.');
            }
        } catch (e) {
            console.error('Clipboard error:', e);
            alert('Clipboard access not available. Please copy the link manually.');
        }
    };

    const imageUrl = board.images && board.images.length > 0
        ? board.images[0]
        : `https://placehold.co/800x600/f0f4f8/25425c?text=${encodeURIComponent(shareTitle || 'Surfboard')}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg relative animate-fade-in-down">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition">
                    <XIcon />
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Share This Board</h2>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                    <img src={imageUrl} alt={shareTitle} className="w-20 h-20 object-cover rounded-md" />
                    <div>
                        <p className="font-bold text-lg text-gray-900">{board.brand}</p>
                        <p className="text-gray-600">{board.model}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <ShareButton
                        icon={<CopyIcon />}
                        label={copyButtonText}
                        onClick={handleCopy}
                    />
                    <ShareButton
                        icon={<EmailIcon />}
                        label="Email"
                        href={`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText)}`}
                    />
                    <ShareButton
                        icon={<WhatsappIcon />}
                        label="WhatsApp"
                        href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                    />
                    <ShareButton
                        icon={<SmsIcon />}
                        label="Text"
                        href={`sms:?&body=${encodeURIComponent(shareText)}`}
                    />
                </div>
            </div>
        </div>
    );
};

export default ShareModal;