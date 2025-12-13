
import React, { useState, useEffect } from 'react';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface ImageCarouselProps {
    images: string[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
        }, 4000); // Change image every 4 seconds

        return () => clearInterval(interval);
    }, [images.length]);

    if (images.length === 0) {
        return null;
    }

    return (
        <div className="relative w-full max-w-2xl mx-auto h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden shadow-lg mt-6 bg-white">
            {images.map((image, index) => (
                <img
                    key={index}
                    src={image}
                    alt={`Giveaway prize ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ease-in-out ${
                        index === currentIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                />
            ))}
        </div>
    );
};


interface LearnMoreModalProps {
    onClose: () => void;
    giveawayImages: string[];
}

const LearnMoreModal: React.FC<LearnMoreModalProps> = ({ onClose, giveawayImages }) => {
    return (
        <div className="fixed inset-0 bg-gray-100 z-50 animate-fade-in overflow-y-auto">
            <div className="container mx-auto p-4 lg:p-6">
                <div className="max-w-4xl mx-auto">
                    <button onClick={onClose} className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition mb-6">
                        <ArrowLeftIcon />
                        Back to Listings
                    </button>
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <div className="text-center">
                            <div className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">What is SurfDims.</h2>
                                <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                                    SurfDims is a web app that lets you list and search boards by dimension. Browse anonymously or create a FREE account to save favourites, manage notifications and create listings.
                                </p>
                            </div>
                            <div className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">List to WIN.</h2>
                                <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                                    Every used board you list is an entry into our monthly draw to win.
                                </p>
                                <ImageCarousel images={giveawayImages} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">How will I know if I won?</h2>
                                <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                                    Winners announced on our social channels and contacted by email
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LearnMoreModal;