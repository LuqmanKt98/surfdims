
import React, { useState, useEffect } from 'react';
import { AppSettingsState } from '../types';
import EyeIcon from './icons/EyeIcon';
import EyeOffIcon from './icons/EyeOffIcon';

interface AppIntegrationsProps {
    appSettings: AppSettingsState;
    onUpdate: (newSettings: AppSettingsState) => void;
}

const AppIntegrations: React.FC<AppIntegrationsProps> = ({ appSettings, onUpdate }) => {
    const [mailchimpKey, setMailchimpKey] = useState(appSettings.mailchimpApiKey);
    const [adsenseCode, setAdsenseCode] = useState(appSettings.adsenseCode || '');
    const [contactEmail, setContactEmail] = useState(appSettings.contactEmail || 'hello@surfdims.com');
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        setMailchimpKey(appSettings.mailchimpApiKey);
        setAdsenseCode(appSettings.adsenseCode || '');
        setContactEmail(appSettings.contactEmail || 'hello@surfdims.com');
    }, [appSettings]);

    const handleSave = () => {
        onUpdate({
            ...appSettings,
            mailchimpApiKey: mailchimpKey,
            adsenseCode: adsenseCode,
            contactEmail: contactEmail,
        });
    };

    return (
        <div className="space-y-8">
            {/* Mailchimp Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">MailChimp</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Automatically syncs new user sign-ups with your MailChimp audience.
                </p>
                <div className="space-y-4 max-w-lg">
                    <div>
                        <label htmlFor="mailchimp-api-key" className="block text-sm font-medium text-gray-700">
                            MailChimp API Key
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <input
                                id="mailchimp-api-key"
                                type={showKey ? 'text' : 'password'}
                                value={mailchimpKey}
                                onChange={(e) => setMailchimpKey(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                placeholder="Enter your API key"
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                aria-label={showKey ? 'Hide API key' : 'Show API key'}
                            >
                                {showKey ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* AdSense Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">AdSense</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Paste your Google AdSense code block (the &lt;ins&gt; tag) to show ads in listings.
                </p>
                <div className="space-y-4 max-w-lg">
                    <div>
                        <label htmlFor="adsense-code" className="block text-sm font-medium text-gray-700">
                            AdSense Ad Unit Code
                        </label>
                        <textarea
                            id="adsense-code"
                            rows={6}
                            value={adsenseCode}
                            onChange={(e) => setAdsenseCode(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                            placeholder='<ins class="adsbygoogle" ...></ins>'
                        />
                    </div>
                </div>
            </div>

            {/* Contact Email Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Contact Form</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Set the email address where contact form submissions will be sent.
                </p>
                <div className="space-y-4 max-w-lg">
                    <div>
                        <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700">
                            Support Email Address
                        </label>
                        <input
                            id="contact-email"
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="hello@surfdims.com"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <button
                    onClick={handleSave}
                    className="py-3 px-10 font-bold rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                >
                    Save App Settings
                </button>
            </div>
        </div>
    );
};

export default AppIntegrations;
