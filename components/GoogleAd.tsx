import React, { useEffect } from 'react';

const GoogleAd: React.FC = () => {
    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                const w = window as any;
                // Safety check for array or object
                if (!w.adsbygoogle) {
                     w.adsbygoogle = [];
                }
                w.adsbygoogle.push({});
            }
        } catch (e) {
            // AdSense can throw errors if the slot is hidden or configured incorrectly.
            // We silence these to prevent app-level crashes.
        }
    }, []);

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col items-center justify-center h-full min-h-[300px] p-4 text-center">
             <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Advertisement</p>
             <ins className="adsbygoogle"
                 style={{ display: 'block', width: '100%' }}
                 data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
                 data-ad-slot="YOUR_AD_SLOT_ID"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
        </div>
    );
};

export default GoogleAd;