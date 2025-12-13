import React, { useState, useEffect, useCallback } from 'react';
import XIcon from './icons/XIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

interface FullscreenImageViewerProps {
    images: string[];
    startIndex: number;
    onClose: () => void;
}

const FullscreenImageViewer: React.FC<FullscreenImageViewerProps> = ({ images, startIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const [touchStart, setTouchStart] = useState<number | null>(null);

    const goToPrevious = useCallback(() => {
        setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images.length]);

    const goToNext = useCallback(() => {
        setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    }, [images.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') goToPrevious();
            if (e.key === 'ArrowRight') goToNext();
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToPrevious, goToNext, onClose]);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStart === null) return;
        const touchEnd = e.targetTouches[0].clientX;
        const delta = touchStart - touchEnd;

        if (delta > 75) { // Swipe left
            goToNext();
            setTouchStart(null);
        } else if (delta < -75) { // Swipe right
            goToPrevious();
            setTouchStart(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center animate-fade-in" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
            <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300 z-50">
                <XIcon />
            </button>
            
            <div className="relative w-full h-full flex items-center justify-center">
                {images.length > 1 && (
                    <button onClick={goToPrevious} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 z-50">
                        <ChevronLeftIcon />
                    </button>
                )}

                <div className="w-full h-full flex items-center justify-center p-4">
                    <img src={images[currentIndex]} alt={`View ${currentIndex + 1}`} className="max-h-full max-w-full object-contain"/>
                </div>
                
                {images.length > 1 && (
                    <button onClick={goToNext} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 z-50">
                        <ChevronRightIcon />
                    </button>
                )}
            </div>

             {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
                    {currentIndex + 1} / {images.length}
                </div>
            )}
        </div>
    );
};

export default FullscreenImageViewer;
