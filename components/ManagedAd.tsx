import React from 'react';
import { AdminAd } from '../types';

interface ManagedAdProps {
    adData?: AdminAd;
}

const ManagedAd: React.FC<ManagedAdProps> = ({ adData }) => {
    if (!adData) {
        return (
            <div className="bg-white rounded-xl overflow-hidden flex flex-col items-center justify-center h-full min-h-[300px] p-4 text-center border-2 border-dashed border-gray-200">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Advertisement</p>
                <div className="text-gray-300 italic text-sm">Space Reserved</div>
            </div>
        );
    }

    return (
        <a
            href={adData.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.02]"
        >
            <div className="relative w-full">
                <img
                    src={adData.imageUrl}
                    alt={adData.name}
                    className="w-full h-auto object-cover display-block"
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-30 text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold backdrop-blur-sm">
                    Ad
                </div>
            </div>
        </a>
    );
};

export default ManagedAd;