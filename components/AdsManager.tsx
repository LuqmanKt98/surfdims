import React, { useState } from 'react';
import { AdminAd } from '../types';
import TrashIcon from './icons/TrashIcon';
import EditIcon from './icons/EditIcon';
import XIcon from './icons/XIcon';

interface AdsManagerProps {
    ads: AdminAd[];
    onUpdate: (ads: AdminAd[]) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const AdForm: React.FC<{
    ad?: AdminAd;
    onSave: (ad: Omit<AdminAd, 'id'> | AdminAd) => void;
    onCancel: () => void;
}> = ({ ad, onSave, onCancel }) => {
    const [name, setName] = useState(ad?.name || '');
    const [linkUrl, setLinkUrl] = useState(ad?.linkUrl || '');
    const [imageUrl, setImageUrl] = useState(ad?.imageUrl || '');
    const [isActive, setIsActive] = useState(ad?.isActive ?? true);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const base64 = await fileToBase64(e.target.files[0]);
                setImageUrl(base64);
            } catch (err) {
                alert("Failed to upload image.");
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageUrl) {
            alert("Please upload an image.");
            return;
        }
        onSave({
            ...(ad ? { id: ad.id } : {}),
            name,
            linkUrl,
            imageUrl,
            isActive
        } as AdminAd);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md relative">
                <button onClick={onCancel} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    <XIcon />
                </button>
                <h3 className="text-2xl font-bold mb-6">{ad ? 'Edit Ad' : 'Create Ad'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ad Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full px-3 py-2 border rounded-md" placeholder="e.g. Summer Sale Banner" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Link URL</label>
                        <input type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} required className="mt-1 w-full px-3 py-2 border rounded-md" placeholder="https://..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Image</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700" />
                        {imageUrl && (
                            <img src={imageUrl} alt="Preview" className="mt-2 w-full h-32 object-cover rounded border" />
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4 text-blue-600 rounded" />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="flex-1 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Save Ad</button>
                        <button type="button" onClick={onCancel} className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdsManager: React.FC<AdsManagerProps> = ({ ads, onUpdate }) => {
    const [editingAd, setEditingAd] = useState<AdminAd | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = (newAdData: Omit<AdminAd, 'id'>) => {
        const newAd = { ...newAdData, id: `ad-${Date.now()}` };
        onUpdate([...ads, newAd]);
        setIsCreating(false);
    };

    const handleEdit = (updatedAd: AdminAd) => {
        onUpdate(ads.map(a => a.id === updatedAd.id ? updatedAd : a));
        setEditingAd(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Delete this ad?")) {
            onUpdate(ads.filter(a => a.id !== id));
        }
    };

    const toggleStatus = (ad: AdminAd) => {
        onUpdate(ads.map(a => a.id === ad.id ? { ...a, isActive: !a.isActive } : a));
    };

    return (
        <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-700">Manage Advertisements</h3>
                <button onClick={() => setIsCreating(true)} className="py-2 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
                    Create Ad
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ads.map(ad => (
                    <div key={ad.id} className="bg-white p-4 rounded-lg shadow-sm border flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-gray-800">{ad.name}</h4>
                                <p className="text-xs text-blue-600 truncate max-w-[200px]">{ad.linkUrl}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => toggleStatus(ad)} className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${ad.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {ad.isActive ? 'On' : 'Off'}
                                </button>
                                <button onClick={() => setEditingAd(ad)} className="p-1.5 text-gray-500 hover:text-blue-600"><EditIcon className="h-4 w-4" /></button>
                                <button onClick={() => handleDelete(ad.id)} className="p-1.5 text-gray-500 hover:text-red-600"><TrashIcon className="h-4 w-4" /></button>
                            </div>
                        </div>
                        <img src={ad.imageUrl} alt={ad.name} className="w-full h-32 object-cover rounded border" />
                    </div>
                ))}
                {ads.length === 0 && <p className="text-center text-gray-400 py-8 col-span-full">No ads created yet.</p>}
            </div>

            {isCreating && (
                <AdForm onSave={handleCreate} onCancel={() => setIsCreating(false)} />
            )}
            {editingAd && (
                <AdForm ad={editingAd} onSave={(updated) => handleEdit(updated as AdminAd)} onCancel={() => setEditingAd(null)} />
            )}
        </div>
    );
};

export default AdsManager;