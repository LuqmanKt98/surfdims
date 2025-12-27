import React from 'react';
import { Advertisement, AppSettingsState } from '../types';
import ManagedAd from './ManagedAd';
import GoogleAd from './GoogleAd';

interface AdCardProps {
    ad: Advertisement;
    appSettings?: AppSettingsState;
}

const AdCard: React.FC<AdCardProps> = ({ ad, appSettings }) => {
    if (ad.adData) {
        return <ManagedAd adData={ad.adData} />;
    }

    // Fallback to Google AdSense if no adData
    if (appSettings?.adsenseCode) {
        return <GoogleAd />;
    }

    // Fallback for empty ad slot
    return <ManagedAd />;
};

export default AdCard;