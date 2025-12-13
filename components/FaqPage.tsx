
import React from 'react';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface FaqPageProps {
    onClose: () => void;
    onContactClick: () => void;
    onOpenLearnMore: () => void;
    onInstallClick: () => void;
    canInstall: boolean;
}

const FaqItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => (
    <details className="group border-b border-gray-200 py-4">
        <summary className="flex justify-between items-center font-semibold text-lg text-gray-800 cursor-pointer list-none">
            {question}
            <span className="transition-transform duration-300 transform group-open:rotate-180">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </span>
        </summary>
        <div className="mt-4 text-gray-600 leading-relaxed">
            {children}
        </div>
    </details>
);

const FaqPage: React.FC<FaqPageProps> = ({ onClose, onContactClick, onOpenLearnMore, onInstallClick, canInstall }) => {
    return (
        <div className="fixed inset-0 bg-gray-100 z-50 animate-fade-in overflow-y-auto">
            <div className="container mx-auto p-4 lg:p-6">
                <div className="max-w-4xl mx-auto">
                    <button onClick={onClose} className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition mb-6">
                        <ArrowLeftIcon />
                        Back to Listings
                    </button>
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Frequently Asked Questions</h1>
                        
                        <div className="space-y-2">
                             <FaqItem question="What is SurfDims?">
                                <p>SurfDims is a web app that lets you list and search boards by dimension. Browse anonymously or create a FREE account to save favourites, manage notifications and create listings.</p>
                            </FaqItem>
                             <FaqItem question="How do I list my surfboard?">
                                <p>Click the "List a board" button in the header. If you're not logged in, you'll be prompted to sign up or log in first. Then, simply fill out the form with your board's details, upload some photos, and submit!</p>
                            </FaqItem>
                            <FaqItem question="Is it free to list a used surfboard?">
                                <p>
                                    Yes! Listing a second-hand or used surfboard is completely free. It also puts you in our{' '}
                                    <button onClick={onOpenLearnMore} className="text-blue-600 hover:underline font-semibold focus:outline-none">
                                        monthly draw
                                    </button>
                                    {' '}to win prizes.
                                </p>
                            </FaqItem>
                            <FaqItem question="How much does it cost to list a new surfboard?">
                                <p>There is a one-time fee of $5-$10 depending on country you list in.</p>
                            </FaqItem>
                            <FaqItem question="Can I edit my listing after posting it?">
                                <p>Absolutely! Go to "My Listings" from the user dropdown menu in the header. Click on the listing you want to change, and on the detail page, you'll find an "Edit Listing" button. This will open the listing form with all your current information pre-filled, ready for you to update.</p>
                            </FaqItem>
                            <FaqItem question="How long does my listing stay active?">
                                <p>Used listings stay active for 3 months. After that, they expire but are not deleted. You can find them in "My Listings" and renew them free.</p>
                                <p className="mt-2">New listings stay active for 12 months then require payment to renew.</p>
                                <p className="mt-2 font-semibold text-red-600">Please note that any listing left in an expired state for 30 days is deleted.</p>
                            </FaqItem>
                             <FaqItem question="How do I manage my notifications?">
                                <p>You have full control over your alerts. Click on your profile icon and go to "Account Settings". Inside, you'll find a "My Alerts" tab where you can see all your active notifications, delete ones you no longer need, and even create new alerts for specific brands and models you're interested in.</p>
                            </FaqItem>
                            {canInstall && (
                                <FaqItem question="Add SurfDims to your home screen">
                                    <p>
                                        <button onClick={onInstallClick} className="text-blue-600 hover:underline font-semibold focus:outline-none">
                                            Click Here
                                        </button>
                                    </p>
                                </FaqItem>
                            )}
                        </div>

                        <div className="mt-10 pt-6 border-t border-gray-200 text-center">
                            <h3 className="text-xl font-semibold text-gray-800">Unanswered question?</h3>
                            <button onClick={onContactClick} className="mt-2 text-lg font-semibold text-blue-600 hover:underline">
                                Contact us
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaqPage;