import React, { useState, useRef } from 'react';
import { User } from '../types';
import { COUNTRIES } from '../countries';
import XIcon from './icons/XIcon';
import BellIcon from './icons/BellIcon';
import TrashIcon from './icons/TrashIcon';
import UserIcon from './icons/UserIcon';

interface AccountSettingsModalProps {
    currentUser: User;
    onClose: () => void;
    onUpdateUser: (updatedUser: User) => void;
    onAddAlert: (brand: string, model: string) => void;
    onDeleteAlert: (alertId: string) => void;
}

const ProfileSettings: React.FC<{
    currentUser: User;
    onUpdateUser: (updatedUser: User) => void;
}> = ({ currentUser, onUpdateUser }) => {
    const [name, setName] = useState(currentUser.name);
    const [location, setLocation] = useState(currentUser.location);
    const [country, setCountry] = useState(currentUser.country);
    const [phone, setPhone] = useState(currentUser.phone || '');
    const [avatar, setAvatar] = useState(currentUser.avatar);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateUser({
            ...currentUser,
            name,
            location,
            country,
            phone,
            avatar,
        });
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <img src={avatar} alt="Current Avatar" className="w-20 h-20 rounded-full object-cover shadow-sm" />
                <div>
                     <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="px-4 py-2 bg-white border border-gray-300 text-sm font-semibold text-gray-700 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Change Avatar
                    </button>
                     <input
                        type="file"
                        ref={avatarInputRef}
                        className="hidden"
                        accept="image/png, image/jpeg"
                        onChange={handleAvatarChange}
                    />
                    <p className="text-xs text-gray-500 mt-2">PNG or JPG. 2MB max.</p>
                </div>
            </div>

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [-webkit-appearance:none]"/>
            </div>
                <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input id="email" type="email" value={currentUser.email} disabled className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed"/>
            </div>
                <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone (Optional)</label>
                <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 123-456-7890" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [-webkit-appearance:none]"/>
            </div>
                <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location (City, State/Region)</label>
                <input id="location" type="text" value={location} onChange={e => setLocation(e.target.value)} required placeholder="e.g. Auckland" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [-webkit-appearance:none]"/>
            </div>
            <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                <select id="country" value={country} onChange={e => setCountry(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [-webkit-appearance:none]">
                    {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                </select>
            </div>
            <div className="pt-2">
                <button type="submit" className="w-full py-3 px-4 font-semibold rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition">
                    Save Changes
                </button>
            </div>
        </form>
    );
};

const MyAlerts: React.FC<{
    currentUser: User;
    onAddAlert: (brand: string, model: string) => void;
    onDeleteAlert: (alertId: string) => void;
}> = ({ currentUser, onAddAlert, onDeleteAlert }) => {
    const [newAlertBrand, setNewAlertBrand] = useState('');
    const [newAlertModel, setNewAlertModel] = useState('');

    const handleAddAlertSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newAlertBrand.trim()) {
            onAddAlert(newAlertBrand.trim(), newAlertModel.trim());
            setNewAlertBrand('');
            setNewAlertModel('');
        }
    };

    return (
        <div className="mt-6 space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Create a New Alert</h3>
                <form onSubmit={handleAddAlertSubmit} className="p-4 bg-gray-50 rounded-lg space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="alertBrand" className="block text-sm font-medium text-gray-700">Brand</label>
                            <input
                                id="alertBrand"
                                type="text"
                                value={newAlertBrand}
                                onChange={e => setNewAlertBrand(e.target.value)}
                                required
                                placeholder="e.g. Pyzel"
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [-webkit-appearance:none]"
                            />
                        </div>
                        <div>
                             <label htmlFor="alertModel" className="block text-sm font-medium text-gray-700">Model (Optional)</label>
                             <input
                                id="alertModel"
                                type="text"
                                value={newAlertModel}
                                onChange={e => setNewAlertModel(e.target.value)}
                                placeholder="e.g. Ghost"
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [-webkit-appearance:none]"
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-2 px-4 font-semibold rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition">
                        Add Alert
                    </button>
                </form>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Active Alerts</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {currentUser.alerts.length === 0 ? (
                        <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-md">You have no active alerts. Add one above or by favoriting a board!</p>
                    ) : (
                        currentUser.alerts.map(alert => (
                            <div key={alert.id} className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm border">
                                <div>
                                    <p className="font-semibold text-gray-800">{alert.brand}</p>
                                    <p className="text-sm text-gray-500">{alert.model || 'Any Model'}</p>
                                </div>
                                <button
                                    onClick={() => onDeleteAlert(alert.id)}
                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                                    aria-label="Delete alert"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};


const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ currentUser, onClose, onUpdateUser, onAddAlert, onDeleteAlert }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'alerts'>('profile');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg relative animate-fade-in-down">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition">
                    <XIcon />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">Account Settings</h2>
                
                 <div className="mt-4 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'profile'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                           <UserIcon className="h-5 w-5"/> Profile
                        </button>
                        <button
                           onClick={() => setActiveTab('alerts')}
                           className={`flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === 'alerts'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                           <BellIcon className="h-5 w-5"/> My Alerts
                        </button>
                    </nav>
                </div>
                
                {activeTab === 'profile' && <ProfileSettings currentUser={currentUser} onUpdateUser={onUpdateUser} />}
                {activeTab === 'alerts' && <MyAlerts currentUser={currentUser} onAddAlert={onAddAlert} onDeleteAlert={onDeleteAlert} />}

            </div>
        </div>
    );
};

export default AccountSettingsModal;