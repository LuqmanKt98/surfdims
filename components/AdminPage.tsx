import React, { useState, useMemo, useCallback } from 'react';
import { Surfboard, User, BrandingState, AppSettingsState, DonationEntry } from '../types';
import { DEFAULT_BRANDING } from '../constants';
import { COUNTRIES } from '../countries';
import XIcon from './icons/XIcon';
import TrashIcon from './icons/TrashIcon';
import AppIntegrations from './AppIntegrations';
import GiveawaysManager from './GiveawaysManager';
import EntriesManager from './EntriesManager';
import TicketIcon from './icons/TicketIcon';
import SearchIcon from './icons/SearchIcon';
import DownloadIcon from './icons/DownloadIcon';

interface AdminPageProps {
    boards: Surfboard[];
    users: User[];
    donationEntries: DonationEntry[];
    branding: BrandingState;
    appSettings: AppSettingsState;
    giveawayImages: string[];
    onAdminDeleteListing: (boardId: string) => void;
    onAdminApproveListing: (boardId: string) => void;
    onAdminToggleUserBlock: (userId: string) => void;
    onBrandingUpdate: (newBranding: BrandingState) => void;
    onAppSettingsUpdate: (newSettings: AppSettingsState) => void;
    onGiveawayImagesUpdate: (images: string[]) => void;

}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const BrandingManager: React.FC<{
    currentBranding: BrandingState,
    onUpdateBranding: (newBranding: BrandingState) => void,
}> = ({ currentBranding, onUpdateBranding }) => {
    const [branding, setBranding] = useState(currentBranding);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'desktop' | 'mobile') => {
        if (e.target.files && e.target.files[0]) {
            try {
                const file = e.target.files[0];
                const base64 = await fileToBase64(file as File);
                setBranding(prev => ({
                    ...prev,
                    [type === 'desktop' ? 'desktopLogo' : 'mobileLogo']: base64
                }));
            } catch (error) {
                console.error("Error processing branding image:", error);
                alert("There was an error uploading the image. Please try again.");
            }
        }
    };

    const handleSaveChanges = () => {
        onUpdateBranding(branding);
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset the branding to the default?')) {
            setBranding(DEFAULT_BRANDING);
            onUpdateBranding(DEFAULT_BRANDING);
        }
    };

    return (
        <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-6">Manage Site Branding</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Desktop Logo */}
                <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Desktop Logo</h4>
                    <p className="text-sm text-gray-500 mb-3">Recommended: SVG or transparent PNG.</p>
                    <input type="file" accept="image/svg+xml, image/png, image/jpeg" onChange={(e) => handleImageUpload(e, 'desktop')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4" />
                    <div className="p-4 border rounded-lg bg-white">
                        <p className="text-xs text-gray-500 mb-2">Preview:</p>
                        <div className="bg-[#25425c] p-4 rounded-md">
                            <img src={branding.desktopLogo} alt="Desktop logo preview" className="h-10" />
                        </div>
                    </div>
                </div>
                {/* Mobile Logo */}
                <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Mobile Logo (Optional)</h4>
                    <p className="text-sm text-gray-500 mb-3">A compact version for small screens. If not provided, a default will be used.</p>
                    <input type="file" accept="image/svg+xml, image/png, image/jpeg" onChange={(e) => handleImageUpload(e, 'mobile')} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4" />
                    <div className="p-4 border rounded-lg bg-white">
                        <p className="text-xs text-gray-500 mb-2">Preview:</p>
                        <div className="bg-[#25425c] p-4 rounded-md">
                            {branding.mobileLogo ? <img src={branding.mobileLogo} alt="Mobile logo preview" className="h-10" /> : <p className="text-sm text-gray-400">No mobile logo set.</p>}
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-8 flex gap-4">
                <button onClick={handleSaveChanges} className="py-2 px-6 font-semibold rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition">
                    Save Changes
                </button>
                <button onClick={handleReset} className="py-2 px-6 font-semibold rounded-lg shadow-md bg-gray-600 hover:bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition">
                    Reset to Default
                </button>
            </div>
        </div>
    );
};

const AdminPage: React.FC<AdminPageProps> = ({ boards, users, onAdminDeleteListing, onAdminToggleUserBlock, branding, onBrandingUpdate, appSettings, onAppSettingsUpdate, giveawayImages, onGiveawayImagesUpdate, donationEntries }) => {
    const [activeTab, setActiveTab] = useState<'listings' | 'users' | 'branding' | 'apps' | 'giveaways' | 'entries'>('listings');
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [listingSearchTerm, setListingSearchTerm] = useState('');

    const sellerMap: Map<string, User> = useMemo(() => new Map<string, User>(users.map(u => [u.id, u])), [users]);

    const filteredUsers = useMemo(() => {
        if (!userSearchTerm.trim()) {
            return users;
        }
        const lowercasedFilter = userSearchTerm.toLowerCase();
        return users.filter(user =>
            user.name.toLowerCase().includes(lowercasedFilter) ||
            user.email.toLowerCase().includes(lowercasedFilter)
        );
    }, [users, userSearchTerm]);

    const filteredBoards = useMemo(() => {
        if (!listingSearchTerm.trim()) {
            return boards;
        }
        const lowercasedFilter = listingSearchTerm.toLowerCase();
        return boards.filter(board => {
            const seller = sellerMap.get(board.sellerId);
            const searchString = [
                board.brand,
                board.model,
                seller?.name,
                seller?.email
            ].filter(Boolean).join(' ').toLowerCase();
            return searchString.includes(lowercasedFilter);
        });
    }, [boards, listingSearchTerm, sellerMap]);

    const handleDownloadUsersCSV = useCallback(() => {
        const sortedUsers = [...users].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        const headers = ['ID', 'Name', 'Email', 'Phone', 'Location', 'Country', 'Verified', 'Blocked', 'Role', 'Signed Up At'];

        const escapeCsvField = (field: any) => {
            const stringField = String(field ?? '');
            if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
                return `"${stringField.replace(/"/g, '""')}"`;
            }
            return stringField;
        };

        const csvRows = [
            headers.join(','),
            ...sortedUsers.map(user =>
                [
                    user.id,
                    user.name,
                    user.email,
                    user.phone,
                    user.location,
                    user.country,
                    user.isVerified,
                    user.isBlocked,
                    user.role || 'user',
                    new Date(user.createdAt).toLocaleString(),
                ]
                    .map(escapeCsvField)
                    .join(',')
            )
        ];

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        const today = new Date().toISOString().slice(0, 10);
        link.setAttribute('download', `surfdims_users_${today}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [users]);


    const TabButton: React.FC<{ tabName: typeof activeTab; children: React.ReactNode }> = ({ tabName, children }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`whitespace-nowrap py-3 px-4 font-medium text-sm transition-colors rounded-t-lg ${activeTab === tabName
                ? 'bg-white border-b-0 text-blue-600'
                : 'bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
        >
            {children}
        </button>
    );

    return (
        <div className="container mx-auto p-4 lg:p-6 pb-20">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full animate-fade-in-down">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Panel</h2>

                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-2 overflow-x-auto" aria-label="Tabs">
                        <TabButton tabName="listings">Manage Listings ({boards.length})</TabButton>
                        <TabButton tabName="users">Manage Users ({users.length})</TabButton>
                        <TabButton tabName="entries">Entries ({donationEntries.length})</TabButton>
                        <TabButton tabName="branding">Branding</TabButton>
                        <TabButton tabName="giveaways">Giveaways</TabButton>
                        <TabButton tabName="apps">Apps</TabButton>
                    </nav>
                </div>

                <div className="mt-8">
                    {activeTab === 'listings' && (
                        <div>
                            <div className="mb-4 relative">
                                <input
                                    type="text"
                                    placeholder="Search by brand, model, seller name or email..."
                                    value={listingSearchTerm}
                                    onChange={(e) => setListingSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                                {filteredBoards.length > 0 ? filteredBoards.map(board => {
                                    const seller = sellerMap.get(board.sellerId);
                                    const imageUrl = board.images && board.images.length > 0
                                        ? board.images[0]
                                        : `https://placehold.co/200x160/f0f4f8/25425c?text=${encodeURIComponent(board.brand || 'No Image')}`;
                                    return (
                                        <div key={board.id} className="bg-white p-3 rounded-lg shadow-sm border flex items-center gap-4">
                                            <img src={imageUrl} alt="Board" className="w-20 h-16 object-cover rounded" />
                                            <div className="flex-grow">
                                                <p className="font-bold text-gray-800">{board.brand} {board.model}</p>
                                                <p className="text-sm text-gray-500">
                                                    Listed by: <span className="font-medium text-gray-600">{seller?.name || 'Unknown'}</span> ({seller?.email})
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500">Status</p>
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${board.status === 'Live' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{board.status}</span>
                                            </div>
                                            <button onClick={() => onAdminDeleteListing(board.id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full" aria-label="Delete listing">
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    )
                                }) : (
                                    <div className="text-center py-10">
                                        <p className="text-gray-500">No listings found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {activeTab === 'users' && (
                        <div>
                            <div className="mb-4 flex justify-between items-center">
                                <div className="relative flex-grow">
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={userSearchTerm}
                                        onChange={(e) => setUserSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <SearchIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                                <button
                                    onClick={handleDownloadUsersCSV}
                                    className="ml-4 flex-shrink-0 flex items-center gap-2 py-2 px-4 font-semibold rounded-lg shadow-md bg-green-600 hover:bg-green-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
                                >
                                    <DownloadIcon />
                                    Download List
                                </button>
                            </div>
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                                {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                    <div key={user.id} className="bg-white p-3 rounded-lg shadow-sm border flex items-center gap-4">
                                        <img src={user.avatar} alt="User" className="w-12 h-12 object-cover rounded-full" />
                                        <div className="flex-grow">
                                            <p className="font-bold text-gray-800">{user.name}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => onAdminToggleUserBlock(user.id)}
                                                className={`w-24 text-sm font-semibold py-1 px-3 rounded-md ${user.isBlocked ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                                            >
                                                {user.isBlocked ? 'Unblock' : 'Block'}
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10">
                                        <p className="text-gray-500">No users found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {activeTab === 'entries' && (
                        <EntriesManager entries={donationEntries} users={users} />
                    )}
                    {activeTab === 'branding' && (
                        <BrandingManager
                            currentBranding={branding}
                            onUpdateBranding={onBrandingUpdate}
                        />
                    )}
                    {activeTab === 'giveaways' && (
                        <GiveawaysManager
                            images={giveawayImages}
                            onUpdate={onGiveawayImagesUpdate}
                        />
                    )}
                    {activeTab === 'apps' && (
                        <AppIntegrations
                            appSettings={appSettings}
                            onUpdate={onAppSettingsUpdate}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;