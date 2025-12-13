import React from 'react';
import { Advertisement } from '../types';
import GoogleAd from './GoogleAd';

interface AdCardProps {
    ad: Advertisement;
}

const AdCard: React.FC<AdCardProps> = () => {
    return (
        <GoogleAd />
    );
};

export default AdCard;