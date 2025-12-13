
export enum FinSystem {
    FCS = 'FCS',
    FCS2 = 'FCS II',
    Futures = 'Futures',
    GlassOn = 'Glass On',
    Other = 'Other'
}

export enum FinSetup {
    Single = 'Single',
    Twin = 'Twin',
    Thruster = 'Thruster',
    Quad = 'Quad',
    Bonzer = 'Bonzer',
    Other = 'Other'
}

export enum Condition {
    New = 'New',
    Used = 'Used'
}

export enum SurfboardStatus {
    Live = 'Live',
    Expired = 'Expired',
    Sold = 'Sold'
}

export interface Dimension {
    length: number; // in feet
    width: number; // in inches
    thickness: number; // in inches
    volume: number; // in litres
}

export interface Surfboard {
    id: string;
    type: 'board';
    sellerId: string;
    brand: string;
    model: string;
    dimensions: Dimension[];
    finSystem: FinSystem;
    finSetup: FinSetup;
    condition: Condition;
    price: number;
    description: string;
    images: string[];
    listedDate: string;
    expiresAt: string;
    isPaid: boolean;
    status: SurfboardStatus;
    website?: string;
}

export interface FilterState {
    brand: string;
    country: string;
    finSystem: FinSystem | 'All';
    finSetup: FinSetup | 'All';
    minLength: number;
    maxLength: number;
    minWidth: number;
    maxWidth: number;
    minThickness: number;
    maxThickness: number;
    minVolume: number;
    maxVolume: number;
    sellerId?: string;
}

export interface Alert {
    id: string;
    brand: string;
    model: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    location: string;
    country: string; // e.g., 'NZ', 'AU', 'US'
    avatar: string;
    favs: string[]; // Array of surfboard IDs
    alerts: Alert[];
    isBlocked: boolean;
    isVerified: boolean;
    role?: 'admin' | 'user';
    createdAt: string;
}

export interface Advertisement {
    id: string;
    type: 'ad';
}

export type ListItem = Surfboard | Advertisement;

export type SortOption = 'date_desc' | 'date_asc' | 'price_asc' | 'price_desc';

export type VerificationFlowStatus = 'unverified' | 'pending' | 'verifying';

export interface BrandingState {
    desktopLogo: string;
    mobileLogo: string | null;
}

export interface AppNotification {
    id: string;
    message: string;
    boardId: string;
    isRead: boolean;
    createdAt: string;
}

export interface AppSettingsState {
    mailchimpApiKey: string;
}

export interface DonationEntry {
    id: string;
    userId: string;
    userEmail: string;
    entries: number;
    amount: number;
    date: string;
}