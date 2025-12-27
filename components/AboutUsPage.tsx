import React from 'react';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface AboutUsPageProps {
    onClose: () => void;
    onSignupClick: () => void;
}

const AboutUsPage: React.FC<AboutUsPageProps> = ({ onClose, onSignupClick }) => {
    return (
        <div className="fixed inset-0 bg-gray-100 z-50 animate-fade-in overflow-y-auto">
            <div className="container mx-auto p-4 lg:p-6">
                <div className="max-w-3xl mx-auto">
                    <button onClick={onClose} className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition mb-6">
                        <ArrowLeftIcon />
                        Back to Listings
                    </button>
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">About SurfDims.</h1>
                        
                        <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
                            <p>
                                SurfDims was developed by a New Zealand disabled surfer frustrated with having to browse multiple platforms to find a board that fit his dimensions.
                            </p>
                            
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span><span className="font-bold">FREE</span> to search. Filter board listings by country, dimension, fin setup and system and then order by price.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span><span className="font-bold">FREE</span> accounts let you save favourites and setup notifications.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span><span className="font-bold">FREE</span> to list used board or pay a small fee for new.</span>
                                </li>
                            </ul>
                            
                            <p className="text-center font-medium italic text-gray-600 mt-6">
                                We hope you find it useful.
                            </p>

                            <div className="flex justify-center pt-6">
                                <button 
                                    onClick={onSignupClick}
                                    className="py-3 px-10 text-xl font-bold rounded-lg shadow-lg bg-blue-600 hover:bg-blue-700 text-white transition-all transform hover:scale-105 active:scale-95"
                                >
                                    Sign-up now!
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUsPage;