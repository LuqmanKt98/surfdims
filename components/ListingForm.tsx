
import React, { useState, useEffect } from 'react';
import { Surfboard, Condition, FinSystem, User, FinSetup, Dimension, SurfboardStatus } from '../types';
import { FIN_SYSTEMS_OPTIONS, FIN_SETUP_OPTIONS } from '../constants';
import { getCurrencySymbol, COUNTRIES, getNewBoardFee } from '../countries';
import XIcon from './icons/XIcon';
import StarIcon from './icons/StarIcon';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { compressImage } from '../utils/imageCompression';

interface ListingFormProps {
    onClose: () => void;
    currentUser: User;
    editingBoard?: Surfboard | null;
    onUpdateBoard: (board: Surfboard) => void;
    onAddUsedBoard: (board: Omit<Surfboard, 'id'>, location?: { region: string, suburb: string }) => void;
    onDonateAndList: (board: Omit<Surfboard, 'id'>, donationAmount: number, location?: { region: string, suburb: string }) => void;
    onStageAndReset: (boards: Omit<Surfboard, 'id'>[], location?: { region: string; suburb: string }) => void;
    onStageAndPay: (boards: Omit<Surfboard, 'id'>[], location?: { region: string; suburb: string }) => void;
    stagedCount: number;
    totalEntries: number;
    onOpenLearnMore: () => void;
    onOpenCharityModal: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const FormInput: React.FC<{
    label: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    type?: string;
    placeholder?: string;
    required?: boolean;
    step?: string;
    rows?: number;
}> = ({ label, name, value, onChange, type = 'text', placeholder, required = true, step, rows }) => (
    <div className="w-full">
        <label htmlFor={name} className="block text-sm font-semibold text-[#4a5568] mb-1">{label}</label>
        {rows ? (
            <textarea id={name} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} rows={rows} className="w-full px-3 py-2 border border-[#cbd5e0] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900" />
        ) : (
            <input id={name} type={type} name={name} value={type === 'number' && value === 0 ? '' : value} onChange={onChange} required={required} placeholder={placeholder} step={step} className="w-full px-3 py-2 border border-[#cbd5e0] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900" />
        )}
    </div>
);

const ListingForm: React.FC<ListingFormProps> = ({ onClose, currentUser, editingBoard, onUpdateBoard, onAddUsedBoard, onStageAndReset, onStageAndPay, stagedCount, totalEntries, onDonateAndList, onOpenLearnMore, onOpenCharityModal }) => {
    const isEditing = !!editingBoard;

    const initialBoardState: Omit<Surfboard, 'id' | 'sellerId' | 'listedDate' | 'status' | 'type' | 'expiresAt' | 'isPaid'> = {
        brand: '',
        model: '',
        dimensions: [{ length: 0, width: 0, thickness: 0, volume: 0 }],
        finSystem: FinSystem.FCS2,
        finSetup: FinSetup.Thruster,
        condition: Condition.Used,
        price: 0,
        description: '',
        images: [],
        website: ''
    };

    const [board, setBoard] = useState(initialBoardState);
    const [condition, setCondition] = useState<Condition>(Condition.Used);
    const [region, setRegion] = useState('');
    const [suburb, setSuburb] = useState('');
    const [donationAmount, setDonationAmount] = useState(5);
    const [isSaving, setIsSaving] = useState(false); // To prevent double submission internally

    // Store compressed blobs for new uploads: Map<previewUrl, { full: Blob, thumb: Blob }>
    const newImageBlobs = React.useRef<Map<string, { full: Blob, thumb: Blob }>>(new Map());

    const regionsForSelectedCountry = COUNTRIES.find(c => c.code === currentUser.country)?.regions || [];

    useEffect(() => {
        if (!isEditing && !currentUser.location) {
            if (regionsForSelectedCountry.length > 0) {
                setRegion(regionsForSelectedCountry[0].name);
            } else {
                setRegion('');
            }
        }
    }, [currentUser.country, currentUser.location, isEditing, regionsForSelectedCountry]);

    const resetForm = () => {
        setBoard(initialBoardState);
        setCondition(Condition.Used);
        setSuburb('');
        if (regionsForSelectedCountry.length > 0) {
            setRegion(regionsForSelectedCountry[0].name);
        }
    };

    useEffect(() => {
        if (isEditing && editingBoard) {
            const { sellerId, listedDate, status, type, id, isPaid, expiresAt, ...formData } = editingBoard;
            setBoard(formData);
            setCondition(formData.condition);
        } else {
            resetForm();
        }
    }, [editingBoard, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setBoard(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) || 0 : value }));
    };

    const handleConditionChange = (newCondition: Condition) => {
        setCondition(newCondition);
    };

    const handleDimensionChange = (index: number, field: keyof Dimension, value: string) => {
        const newDimensions = [...board.dimensions];
        newDimensions[index] = { ...newDimensions[index], [field]: parseFloat(value) || 0 };
        setBoard(prev => ({ ...prev, dimensions: newDimensions }));
    };

    const handleAddDimensionRow = () => {
        setBoard(prev => ({
            ...prev,
            dimensions: [...prev.dimensions, { length: 0, width: 0, thickness: 0, volume: 0 }]
        }));
    };

    const handleRemoveDimensionRow = (index: number) => {
        setBoard(prev => ({
            ...prev,
            dimensions: prev.dimensions.filter((_, i) => i !== index)
        }));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).filter(file => {
                const f = file as File;
                return f && typeof f.type === 'string' && f.type.startsWith('image/');
            });

            try {
                const newPreviewUrls: string[] = [];
                for (const fileObj of files) {
                    const file = fileObj as File;
                    // Create Full Version (WebP, max 1200px, 0.8 quality) - good for full screen
                    const fullBlob = await compressImage(file, { maxWidth: 1200, quality: 0.8, type: 'image/webp' });

                    // Create Thumbnail Version (WebP, max 400px, 0.6 quality) - good for grid
                    const thumbBlob = await compressImage(file, { maxWidth: 400, quality: 0.6, type: 'image/webp' });

                    // Use thumbnail for preview (faster)
                    const previewUrl = URL.createObjectURL(thumbBlob);

                    newImageBlobs.current.set(previewUrl, { full: fullBlob, thumb: thumbBlob });
                    newPreviewUrls.push(previewUrl);
                }

                setBoard(prev => ({ ...prev, images: [...(prev.images || []), ...newPreviewUrls] }));
            } catch (error) {
                console.error("Error processing images:", error);
                alert("There was an error processing one or more images. Please try again.");
            }
        }
    };

    const handleRemoveImage = (index: number) => {
        setBoard(prev => ({
            ...prev,
            images: (prev.images || []).filter((_, i) => i !== index)
        }));
    };

    const handleSetFeatureImage = (index: number) => {
        if (index === 0) return;
        setBoard(prev => {
            const newImages = [...(prev.images || [])];
            const [selectedImage] = newImages.splice(index, 1);
            newImages.unshift(selectedImage);
            return { ...prev, images: newImages };
        });
    };

    const processAndValidateBoard = () => {
        if (!currentUser) {
            alert('You must be logged in.');
            return null;
        }
        if (!board.images || board.images.length === 0) {
            alert('Please upload at least one image.');
            return null;
        }

        const areDimensionsValid = board.dimensions.every(dim =>
            dim.length > 0 && dim.width > 0 && dim.thickness > 0 && dim.volume > 0
        );
        if (!areDimensionsValid) {
            alert('All dimension fields are required to be filled.');
            return null;
        }

        return {
            ...board,
            brand: (board.brand || '').trim(),
            model: (board.model || '').trim(),
        };
    }

    const uploadImages = async (imageParams: string[]): Promise<{ images: string[], thumbnails: string[] }> => {
        const uploadedUrls: string[] = [];
        const uploadedThumbnails: string[] = [];

        for (const img of imageParams) {
            if (img.startsWith('http')) {
                // Existing image
                uploadedUrls.push(img);

                // Find corresponding thumbnail if possible
                let thumbUrl = img; // Fallback to main image
                if (editingBoard && editingBoard.images && editingBoard.thumbnails) {
                    const originalIndex = editingBoard.images.indexOf(img);
                    if (originalIndex !== -1 && editingBoard.thumbnails[originalIndex]) {
                        thumbUrl = editingBoard.thumbnails[originalIndex];
                    }
                }
                uploadedThumbnails.push(thumbUrl);

            } else if (img.startsWith('blob:')) {
                // New image
                const blobs = newImageBlobs.current.get(img);
                if (blobs) {
                    const timestamp = Date.now();
                    const random = Math.floor(Math.random() * 1000);

                    // Upload Full
                    const fullPath = `images/${currentUser.id}/${timestamp}_${random}.webp`;
                    const fullRef = ref(storage, fullPath);
                    const fullSnapshot = await uploadBytes(fullRef, blobs.full);
                    const fullUrl = await getDownloadURL(fullSnapshot.ref);
                    uploadedUrls.push(fullUrl);

                    // Upload Thumbnail
                    const thumbPath = `images/${currentUser.id}/${timestamp}_${random}_thumb.webp`;
                    const thumbRef = ref(storage, thumbPath);
                    const thumbSnapshot = await uploadBytes(thumbRef, blobs.thumb);
                    const thumbUrl = await getDownloadURL(thumbSnapshot.ref);
                    uploadedThumbnails.push(thumbUrl);
                }
            }
        }
        return { images: uploadedUrls, thumbnails: uploadedThumbnails };
    }

    const getListingData = async (): Promise<Omit<Surfboard, 'id'> | null> => {
        setIsSaving(true);
        try {
            const processedBoard = processAndValidateBoard();
            if (!processedBoard) return null;

            // Upload Images
            const { images: finalImages, thumbnails: finalThumbnails } = await uploadImages(board.images);

            return {
                ...processedBoard,
                images: finalImages,
                thumbnails: finalThumbnails,
                type: 'board' as const,
                condition: condition,
                sellerId: currentUser.id,
                status: SurfboardStatus.Live,
                listedDate: new Date().toISOString(),
                isPaid: false, // Default
                expiresAt: '', // Default
            };
        } catch (error) {
            console.error(error);
            alert("Failed to create listing (image upload).");
            return null;
        } finally {
            setIsSaving(false);
        }
    };

    const getLocationData = () => {
        if (!isEditing && !currentUser.location) {
            if (!region || !suburb.trim()) {
                alert('Please provide your City/Region and Suburb to continue.');
                return null;
            }
            return { region, suburb: suburb.trim() };
        }
        return undefined;
    };

    const handleFormSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const processedBoard = processAndValidateBoard();
        if (!processedBoard || !isEditing || !editingBoard) return;

        setIsSaving(true);
        try {
            const { images: finalImages, thumbnails: finalThumbnails } = await uploadImages(board.images);
            const updatedBoardData: Surfboard = {
                ...editingBoard,
                ...processedBoard,
                images: finalImages,
                thumbnails: finalThumbnails,
                condition,
            };
            onUpdateBoard(updatedBoardData);
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update listing.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAndListAnother = async () => {
        const data = await getListingData();
        if (!data) return;
        const location = getLocationData();
        if (!isEditing && !currentUser.location && !location) return;

        onStageAndReset([data], location);
        alert('Board added to cart! Click the cart icon in the header to review or proceed to payment.');
        resetForm();
    };

    const handleFinalSubmit = async () => {
        const data = await getListingData();
        if (!data) return;
        const location = getLocationData();
        if (!isEditing && !currentUser.location && !location) return;

        if (condition === Condition.Used) {
            if (donationAmount > 0) {
                onDonateAndList(data, donationAmount, location);
            } else {
                onAddUsedBoard(data, location);
            }
        } else {
            onStageAndPay([data], location);
        }
    };

    const handleListFree = async () => {
        const data = await getListingData();
        if (!data) return;
        const location = getLocationData();
        if (!isEditing && !currentUser.location && !location) return;

        onAddUsedBoard(data, location);
    };

    const handleListAndDonate = () => {
        if (donationAmount === 0) {
            alert("Please select a donation amount or choose 'List Free'");
            return;
        }
        handleFinalSubmit(); // Will route to onDonateAndList
    };

    const currencySymbol = getCurrencySymbol(currentUser.country);
    const newBoardFee = getNewBoardFee(currentUser.country);
    const currentTotal = condition === Condition.New
        ? (board.dimensions.length + stagedCount) * newBoardFee
        : donationAmount;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start py-10 overflow-y-auto px-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl relative animate-fade-in-down overflow-hidden">
                <button onClick={onClose} className="absolute top-4 right-4 text-[#4a5568] hover:text-gray-800 transition z-10">
                    <XIcon />
                </button>

                <div className="p-8 pb-4">
                    <h2 className="text-[28px] font-bold text-[#1a202c] mb-6">{isEditing ? 'Edit listing' : 'List a board'}</h2>

                    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                        {/* Brand & Model */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput label="Brand" name="brand" value={board.brand} onChange={handleChange} />
                            <FormInput label="Model" name="model" value={board.model} onChange={handleChange} />
                        </div>

                        {/* Condition Selector */}
                        <div>
                            <label className="block text-sm font-semibold text-[#4a5568] mb-1">Condition / Type</label>
                            <div className="flex w-full border border-[#cbd5e0] rounded-md overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => handleConditionChange(Condition.Used)}
                                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${condition === Condition.Used ? 'bg-white text-gray-800' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    Used
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleConditionChange(Condition.New)}
                                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${condition === Condition.New ? 'bg-[#28a745] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    New
                                </button>
                            </div>
                        </div>

                        {/* Dimensions Group */}
                        <div>
                            <label className="block text-sm font-semibold text-[#4a5568] mb-1">Dimensions</label>
                            <div className="bg-[#f8f9fa] p-4 rounded-md space-y-4">
                                {board.dimensions.map((dim, index) => (
                                    <div key={index} className="relative flex flex-col gap-4">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            <FormInput label="Length (ft)" name="length" type="number" step="0.01" value={dim.length} onChange={(e) => handleDimensionChange(index, 'length', e.target.value)} />
                                            <FormInput label="Width (in)" name="width" type="number" step="0.01" value={dim.width} onChange={(e) => handleDimensionChange(index, 'width', e.target.value)} />
                                            <FormInput label="Thickness (in)" name="thickness" type="number" step="0.01" value={dim.thickness} onChange={(e) => handleDimensionChange(index, 'thickness', e.target.value)} />
                                            <FormInput label="Volume (L)" name="volume" type="number" step="0.1" value={dim.volume} onChange={(e) => handleDimensionChange(index, 'volume', e.target.value)} />
                                        </div>
                                        {board.dimensions.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveDimensionRow(index)} className="absolute -right-2 -top-2 text-red-500 hover:text-red-700 bg-white rounded-full shadow-sm p-1">
                                                <XIcon />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {condition === Condition.New && (
                                    <div className="bg-[#e9f7ef] border-l-4 border-[#28a745] p-3 text-sm text-[#155724]">
                                        Have multiple sizes of same model? Add dims for each size on the one listing. Listing fee applies for each board.
                                    </div>
                                )}
                            </div>
                            <button type="button" onClick={handleAddDimensionRow} className="mt-2 text-sm font-semibold text-[#0056b3] hover:underline">
                                + Add another size
                            </button>
                        </div>

                        {/* Price & Fin Setup */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput label="Price" name="price" type="number" value={board.price} onChange={handleChange} />
                            <div>
                                <label className="block text-sm font-semibold text-[#4a5568] mb-1">Fin Setup</label>
                                <select name="finSetup" value={board.finSetup} onChange={handleChange} className="w-full px-3 py-2 border border-[#cbd5e0] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900">
                                    {FIN_SETUP_OPTIONS.map(fs => <option key={fs} value={fs}>{fs}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Fin System & Website */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-[#4a5568] mb-1">Fin System</label>
                                <select name="finSystem" value={board.finSystem} onChange={handleChange} className="w-full px-3 py-2 border border-[#cbd5e0] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-900">
                                    {FIN_SYSTEMS_OPTIONS.map(fs => <option key={fs} value={fs}>{fs}</option>)}
                                </select>
                            </div>
                            <FormInput label="Website (optional)" name="website" value={board.website || ''} onChange={handleChange} placeholder="e.g. yourbrand.com" required={false} />
                        </div>

                        <FormInput label="Description" name="description" value={board.description} onChange={handleChange} rows={4} placeholder="Tell us about your board..." />

                        {/* Image Upload UI */}
                        <div>
                            <label className="block text-sm font-semibold text-[#4a5568] mb-2">Upload Images</label>
                            <p className="text-xs text-gray-500 mb-2">Click the star on an image to set it as the feature image.</p>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-4">
                                    <label className="px-4 py-1.5 bg-[#f8f9fa] border border-[#cbd5e0] rounded-full text-sm font-semibold text-[#4a5568] cursor-pointer hover:bg-gray-100 transition-colors">
                                        Choose files
                                        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                    <span className="text-sm text-gray-500">{board.images.length > 0 ? `${board.images.length} files chosen` : 'No file chosen'}</span>
                                </div>
                                {board.images.length > 0 && (
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
                                        {board.images.map((img, idx) => (
                                            <div key={idx} className={`relative aspect-square rounded-md overflow-hidden border ${idx === 0 ? 'border-[#28a745] ring-2 ring-[#28a745]' : 'border-gray-200'} group`}>
                                                <img src={img} className="w-full h-full object-cover" alt="Preview" />

                                                {/* Star button to set feature */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetFeatureImage(idx)}
                                                    className={`absolute bottom-0 left-0 p-1 transition-colors ${idx === 0 ? 'bg-[#28a745] text-white' : 'bg-black bg-opacity-40 text-gray-300 hover:text-white hover:bg-opacity-60'}`}
                                                    title={idx === 0 ? "Feature Image" : "Set as Feature Image"}
                                                >
                                                    <StarIcon className="h-3.5 w-3.5" isFilled={idx === 0} />
                                                </button>

                                                {/* Remove button */}
                                                <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute top-0 right-0 p-0.5 bg-black bg-opacity-50 text-white hover:bg-opacity-70">
                                                    <XIcon />
                                                </button>

                                                {idx === 0 && (
                                                    <div className="absolute top-0 left-0 bg-[#28a745] text-white text-[8px] font-bold px-1 py-0.5 rounded-br">
                                                        FEATURE
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Location Check */}
                        {!isEditing && !currentUser.location && (
                            <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                                <h3 className="font-semibold text-blue-800">Your location</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-blue-700 mb-1">City / Region</label>
                                        <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full px-3 py-2 border border-blue-200 rounded-md bg-white">
                                            {regionsForSelectedCountry.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-blue-700 mb-1">Suburb</label>
                                        <input type="text" value={suburb} onChange={(e) => setSuburb(e.target.value)} placeholder="e.g. Raglan" className="w-full px-3 py-2 border border-blue-200 rounded-md bg-white" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Used Board Promotion - Centered */}
                        {!isEditing && condition === Condition.Used && (
                            <div className="bg-[#e9f7ef] p-6 rounded-lg text-center">
                                <p className="text-[#155724] text-base mb-4">
                                    Please consider donating to{' '}
                                    <button
                                        type="button"
                                        onClick={onOpenCharityModal}
                                        className="font-bold underline hover:text-[#0b2e13] focus:outline-none"
                                    >
                                        Disabled Surfing
                                    </button>.
                                </p>
                                <div className="flex flex-wrap justify-center items-center gap-3">
                                    {[5, 10, 20, 50].map(amount => (
                                        <button
                                            key={amount}
                                            type="button"
                                            onClick={() => setDonationAmount(amount)}
                                            className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-colors min-w-[60px] ${donationAmount === amount
                                                ? 'bg-[#28a745] border-[#28a745] text-white'
                                                : 'bg-white border-[#28a745] text-[#28a745] hover:bg-[#e9f7ef]'
                                                }`}
                                        >
                                            {currencySymbol}{amount}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Section matching reference */}
                <div className="p-8 pt-0">
                    <div className="border-t border-dashed border-[#cbd5e0] mb-4"></div>

                    <div className="flex justify-between items-center mb-6">
                        <span className="text-xl font-bold text-[#1a202c]">Total:</span>
                        <span className="text-xl font-bold text-[#4a5568]">
                            {COUNTRIES.find(c => c.code === currentUser.country)?.symbol || '$'}
                            {currentTotal.toFixed(2)}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {isEditing ? (
                            <button
                                type="button"
                                onClick={() => handleFormSubmit()}
                                disabled={isSaving}
                                className="col-span-full py-3 px-6 text-base font-bold rounded-lg bg-[#5d87f5] hover:bg-blue-600 text-white transition-colors disabled:opacity-50"
                            >
                                {isSaving ? 'Processing...' : 'Save Changes'}
                            </button>
                        ) : condition === Condition.Used ? (
                            <>
                                <button
                                    type="button"
                                    onClick={handleListFree}
                                    disabled={isSaving}
                                    className="py-3 px-6 text-base font-bold rounded-lg bg-[#838996] hover:bg-gray-600 text-white transition-colors disabled:opacity-50"
                                >
                                    {isSaving ? 'Processing...' : 'List Free'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleListAndDonate}
                                    disabled={isSaving}
                                    className="py-3 px-6 text-base font-bold rounded-lg bg-[#5d87f5] hover:bg-blue-600 text-white transition-colors disabled:opacity-50"
                                >
                                    {isSaving ? 'Processing...' : 'List & Donate'}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={handleSaveAndListAnother}
                                    disabled={isSaving}
                                    className="py-3 px-6 text-base font-bold rounded-lg bg-[#838996] hover:bg-gray-600 text-white transition-colors disabled:opacity-50"
                                >
                                    {isSaving ? 'Processing...' : 'Save & List Another'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleFinalSubmit}
                                    disabled={isSaving}
                                    className="py-3 px-6 text-base font-bold rounded-lg bg-[#5d87f5] hover:bg-blue-600 text-white transition-colors disabled:opacity-50"
                                >
                                    {isSaving ? 'Processing...' : `Pay & List (${stagedCount + board.dimensions.length})`}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingForm;
