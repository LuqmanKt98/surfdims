
import React, { useState, useEffect } from 'react';
import { Surfboard, Condition, FinSystem, User, FinSetup, Dimension, SurfboardStatus } from '../types';
import { FIN_SYSTEMS_OPTIONS, FIN_SETUP_OPTIONS } from '../constants';
import { getCurrencySymbol, COUNTRIES, getNewBoardFee } from '../countries';
import XIcon from './icons/XIcon';
import JsTractorLogo from './icons/JsTractorLogo';
import TrashIcon from './icons/TrashIcon';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ListingFormProps {
    onClose: () => void;
    currentUser: User;
    editingBoard?: Surfboard | null;
    onUpdateBoard: (board: Surfboard) => void;
    onAddUsedBoard: (board: Omit<Surfboard, 'id'>, location?: { region: string, suburb: string }) => void;
    onDonateAndList: (board: Omit<Surfboard, 'id'>, donationAmount: number, location?: { region: string, suburb: string }) => void;
    onStageAndReset: (boards: Omit<Surfboard, 'id'>[], location?: { region: string, suburb: string }) => void;
    onStageAndPay: (boards: Omit<Surfboard, 'id'>[], location?: { region: string, suburb: string }) => void;
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
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {rows ? (
            <textarea id={name} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} rows={rows} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [-webkit-appearance:none]" />
        ) : (
            <input id={name} type={type} name={name} value={type === 'number' && value === 0 ? '' : value} onChange={onChange} required={required} placeholder={placeholder} step={step} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [-webkit-appearance:none]" />
        )}
    </div>
);


const ListingForm: React.FC<ListingFormProps> = ({ onClose, currentUser, editingBoard, onUpdateBoard, onAddUsedBoard, onStageAndReset, onStageAndPay, stagedCount, totalEntries, onDonateAndList, onOpenLearnMore, onOpenCharityModal }) => {
    const isEditing = !!editingBoard;

    const initialBoardState: Omit<Surfboard, 'id' | 'sellerId' | 'listedDate' | 'status' | 'type'> = {
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
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [condition, setCondition] = useState<Condition>(Condition.Used);
    const [region, setRegion] = useState('');
    const [suburb, setSuburb] = useState('');
    const [donationAmount, setDonationAmount] = useState(5);
    const [isUploading, setIsUploading] = useState(false);

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
        setImagePreviews([]);
        setImageFiles([]);
        setCondition(Condition.Used);
        setSuburb('');
        if (regionsForSelectedCountry.length > 0) {
            setRegion(regionsForSelectedCountry[0].name);
        }
    };

    useEffect(() => {
        if (isEditing) {
            const { sellerId, listedDate, status, type, id, ...formData } = editingBoard;
            setBoard(formData);
            setImagePreviews(formData.images);
            // We don't have existing *files*, only URLs. So imageFiles starts empty. 
            // If they add more, we append.
            setCondition(formData.condition);
        } else {
            resetForm();
        }
    }, [editingBoard, isEditing]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'condition') {
            const newCondition = value as Condition;
            setCondition(newCondition);
        } else {
            setBoard(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) || 0 : value }));
        }
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
                // Generate previews
                const base64Promises = files.map(file => fileToBase64(file as File));
                const newImages = await Promise.all(base64Promises);

                setImagePreviews(prev => [...prev, ...newImages]);
                // Store actual files for upload later
                setImageFiles(prev => [...prev, ...files]);

                // For UI state only, we might want to update board.images with previews temporarily?
                // Actually the previews state handles the UI. board.images will be filled on submit.
                // UNLESS it's edit mode, where board.images has existing URLs.
                // So let's keep board.images synced with existing URLs + new previews for now?
                // No, better to keep distinction: 
                // Board.images: strings (URLs)
                // imageFiles: Files (to be uploaded)
                // The final submission loop should combine: existing URLs + uploaded URLs.
            } catch (error) {
                console.error("Error processing images:", error);
                alert("There was an error uploading one or more images. Please try again.");
            }
        }
    };

    const uploadImages = async (): Promise<string[]> => {
        if (imageFiles.length === 0) return [];

        const uploadedUrls: string[] = [];
        for (const file of imageFiles) {
            // Uniqiue path: images/{userId}/{timestamp}_{random}_{filename}
            const path = `images/${currentUser.id}/${Date.now()}_${Math.floor(Math.random() * 1000)}_${file.name}`;
            const storageRef = ref(storage, path);
            try {
                const snapshot = await uploadBytes(storageRef, file);
                const url = await getDownloadURL(snapshot.ref);
                uploadedUrls.push(url);
            } catch (error) {
                console.error("Upload failed for file " + file.name, error);
                // Continue with other files or abort? Let's throw to stop incomplete listings.
                throw new Error("Failed to upload image: " + file.name);
            }
        }
        return uploadedUrls;
    };

    const processAndValidateBoard = () => {
        if (!currentUser) {
            alert('You must be logged in.');
            return null;
        }
        // Check previews length because board.images might not be updated with new files yet if we only use imageFiles
        // Actually, let's check total images count = (existing URLs in board.images or previews length?)
        // In edit mode: board.images initially has URLs. imagePreviews has URLs.
        // When adding new: imagePreviews adds base64. imageFiles adds Files.
        // So imagePreviews.length is the truth for "how many images total".
        if (imagePreviews.length === 0) {
            alert('Please upload at least one image.');
            return null;
        }

        const areDimensionsValid = board.dimensions.every(dim =>
            dim.length > 0 && dim.width > 0 && dim.thickness > 0 && dim.volume > 0
        );
        if (!areDimensionsValid) {
            alert('All dimension fields are required to be filled before payment can be made.');
            return null;
        }

        return {
            ...board,
            brand: board.brand.trim(),
            model: board.model.trim(),
            // We will overwrite images later
        };
    }

    // Updated to be Async
    const getListingData = async (): Promise<Omit<Surfboard, 'id'>[] | null> => {
        setIsUploading(true);
        try {
            const processedBoard = processAndValidateBoard();
            if (!processedBoard) {
                setIsUploading(false);
                return null;
            }

            // existing images are those in board.images that are NOT base64 (assuming base64 are new previews)
            // But wait, in edit mode board.images are URLs.
            // When we added new files, we didn't add them to board.images yet.
            // So board.images contains only the PRE-EXISTING images (if editing).
            const existingImages = board.images.filter(img => img.startsWith('http'));

            // Upload new files
            const newImageUrls = await uploadImages();

            const finalImages = [...existingImages, ...newImageUrls];

            const baseData = {
                ...processedBoard,
                images: finalImages,
                type: 'board' as const,
                condition: condition,
                sellerId: currentUser.id,
                status: SurfboardStatus.Live,
                listedDate: new Date().toISOString()
            };

            if (condition === Condition.New) {
                return [{ ...baseData, dimensions: board.dimensions }];
            } else {
                // For used boards, it's just one board
                return [{
                    ...baseData,
                    dimensions: board.dimensions.slice(0, 1) // Ensure only one dimension for used boards
                }];
            }
        } catch (error) {
            console.error("Error preparing listing data:", error);
            alert("Failed to create listing. Please try again.");
            return null;
        } finally {
            setIsUploading(false);
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

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const processedBoard = processAndValidateBoard();
        if (!processedBoard || !isEditing) return;

        setIsUploading(true);
        try {
            // Separate existing URLs from new files
            const existingImages = board.images.filter(img => img.startsWith('http'));
            // Upload new files
            const newImageUrls = await uploadImages();
            const finalImages = [...existingImages, ...newImageUrls];

            const updatedBoardData = {
                ...editingBoard,
                ...processedBoard,
                images: finalImages,
                condition,
            };
            onUpdateBoard(updatedBoardData);
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update listing.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveAndListAnother = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const listingData = await getListingData();
        const locationData = getLocationData();
        if (listingData && (currentUser.location || locationData)) {
            onStageAndReset(listingData, locationData);
            resetForm();
        }
    };

    const handlePayAndList = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const listingData = await getListingData();
        const locationData = getLocationData();
        if (listingData && (currentUser.location || locationData)) {
            onStageAndPay(listingData, locationData);
        }
    };

    const handleAddUsed = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const listingDataArray = await getListingData();
        const locationData = getLocationData();
        if (listingDataArray && listingDataArray[0] && (currentUser.location || locationData)) {
            onAddUsedBoard(listingDataArray[0], locationData);
        }
    };

    const handleDonate = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const listingDataArray = await getListingData();
        const locationData = getLocationData();
        if (listingDataArray && listingDataArray[0] && (currentUser.location || locationData)) {
            onDonateAndList(listingDataArray[0], donationAmount, locationData);
        }
    };

    const isPaidListing = condition === Condition.New;
    const currencySymbol = getCurrencySymbol(currentUser.country);
    const newBoardFee = getNewBoardFee(currentUser.country);
    const totalNewBoards = stagedCount + (isPaidListing ? board.dimensions.length : 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start py-10 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl relative animate-fade-in-down">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition">
                    <XIcon />
                </button>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">{isEditing ? 'Edit Your Listing' : 'List a board'}</h2>

                {/* Disabled Overlay if Uploading */}
                {isUploading && (
                    <div className="absolute inset-0 bg-white bg-opacity-70 z-10 flex items-center justify-center rounded-lg">
                        <div className="text-xl font-bold text-blue-600 animate-pulse">Uploading images...</div>
                    </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput label="Brand" name="brand" value={board.brand} onChange={handleChange} required={false} />
                        <FormInput label="Model" name="model" value={board.model} onChange={handleChange} required={false} />
                    </div>

                    <div>
                        <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">Condition / Type</label>
                        <div className="flex rounded-md shadow-sm">
                            <button
                                type="button"
                                onClick={() => setCondition(Condition.Used)}
                                className={`flex-1 py-2 px-2 sm:px-4 rounded-l-md border border-gray-300 text-sm sm:text-base ${condition === Condition.Used ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                Used
                            </button>
                            <button
                                type="button"
                                onClick={() => setCondition(Condition.New)}
                                className={`flex-1 py-2 px-2 sm:px-4 rounded-r-md border border-gray-300 -ml-px text-sm sm:text-base ${condition === Condition.New ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                            >
                                New
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">Dimensions</label>
                        {board.dimensions.map((dim, index) => (
                            <div key={index} className="grid grid-cols-4 sm:grid-cols-5 gap-2 items-end p-2 bg-gray-50 rounded-md">
                                <FormInput label="Length (ft)" name="length" value={dim.length} onChange={(e) => handleDimensionChange(index, 'length', e.target.value)} type="number" step="0.01" />
                                <FormInput label="Width (in)" name="width" value={dim.width} onChange={(e) => handleDimensionChange(index, 'width', e.target.value)} type="number" step="0.01" />
                                <FormInput label="Thickness (in)" name="thickness" value={dim.thickness} onChange={(e) => handleDimensionChange(index, 'thickness', e.target.value)} type="number" step="0.01" />
                                <FormInput label="Volume (L)" name="volume" value={dim.volume} onChange={(e) => handleDimensionChange(index, 'volume', e.target.value)} type="number" step="0.1" />
                                <div className="text-right">
                                    {board.dimensions.length > 1 && (
                                        <button type="button" onClick={() => handleRemoveDimensionRow(index)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full">
                                            <TrashIcon />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {condition === Condition.New && (
                            <div className="p-3 bg-green-50 border-l-4 border-green-400">
                                <p className="text-sm text-green-800 font-medium">Have multiple sizes of same model? Add dims for each size on the one listing. Listing fee applies for each board.</p>
                            </div>
                        )}

                        {(condition === Condition.New) && (
                            <button type="button" onClick={handleAddDimensionRow} className="text-sm font-semibold text-blue-600 hover:underline">
                                + Add another size
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput label="Price" name="price" value={board.price} onChange={handleChange} type="number" step="0.01" />
                        <div>
                            <label htmlFor="finSetup" className="block text-sm font-medium text-gray-700 mb-1">Fin Setup</label>
                            <select id="finSetup" name="finSetup" value={board.finSetup} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [-webkit-appearance:none]">
                                {FIN_SETUP_OPTIONS.map(fs => <option key={fs} value={fs}>{fs}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="finSystem" className="block text-sm font-medium text-gray-700 mb-1">Fin System</label>
                            <select id="finSystem" name="finSystem" value={board.finSystem} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 [-webkit-appearance:none]">
                                {FIN_SYSTEMS_OPTIONS.map(fs => <option key={fs} value={fs}>{fs}</option>)}
                            </select>
                        </div>
                        {isPaidListing && (
                            <FormInput label="Website (optional)" name="website" value={board.website || ''} onChange={handleChange} required={false} placeholder="e.g. yourbrand.com" />
                        )}
                    </div>

                    <FormInput label="Description" name="description" value={board.description} onChange={handleChange} rows={4} placeholder="Tell us about your board..." />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Upload Images</label>
                        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        <div className="mt-2 flex flex-wrap gap-2">
                            {imagePreviews.map((src, index) => <img key={index} src={src} alt="preview" className="w-24 h-24 object-cover rounded" />)}
                        </div>
                    </div>

                    {!isEditing && !currentUser.location && (
                        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                            <h4 className="font-bold text-yellow-800">Your Location</h4>
                            <p className="text-sm text-yellow-700 mt-1">Since this is your first listing, please provide your location. This will be saved to your profile for future listings.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                                <div>
                                    <label htmlFor="region" className="block text-sm font-medium text-gray-700">City/Region</label>
                                    <select id="region" value={region} onChange={e => setRegion(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        {regionsForSelectedCountry.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="suburb" className="block text-sm font-medium text-gray-700">Suburb</label>
                                    <input id="suburb" type="text" value={suburb} onChange={e => setSuburb(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                        </div>
                    )}

                    {isEditing ? (
                        <button type="submit" disabled={isUploading} className="w-full py-3 px-4 text-lg font-semibold rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50">
                            {isUploading ? 'Saving...' : 'Save Changes'}
                        </button>
                    ) : (
                        isPaidListing ? (
                            <div className="p-4 border-t-2 border-dashed">
                                <div className="flex justify-between items-center text-lg font-bold text-gray-800 mb-4">
                                    <span>Total:</span>
                                    <span>{currencySymbol}{(newBoardFee * totalNewBoards).toFixed(2)}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button onClick={handleSaveAndListAnother} disabled={isUploading} className="flex-1 py-3 px-4 font-semibold rounded-lg shadow-md bg-gray-600 hover:bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition disabled:opacity-50">
                                        {isUploading ? 'Processing...' : 'Save & List Another'}
                                    </button>
                                    <button onClick={handlePayAndList} disabled={isUploading} className="flex-1 py-3 px-4 text-lg font-semibold rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50">
                                        {isUploading ? 'Processing...' : `Pay & List (${totalNewBoards})`}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-center text-sm text-gray-600 mb-4">
                                    Each used board you list enters you in our{' '}
                                    <button type="button" onClick={onOpenLearnMore} className="font-bold text-blue-600 hover:underline focus:outline-none">
                                        monthly prize draw
                                    </button>
                                    . Donating to{' '}
                                    <button type="button" onClick={onOpenCharityModal} className="font-bold text-blue-600 hover:underline focus:outline-none">
                                        Disabled Surfing
                                    </button>
                                    {' '}increases your chances. There are currently {totalEntries} entries this month.
                                </p>
                                <div className="flex items-center justify-center gap-4 mb-6">
                                    <label htmlFor="donation" className="font-semibold text-gray-700">Donation:</label>
                                    <select id="donation" value={donationAmount} onChange={e => setDonationAmount(parseInt(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value={5}>{currencySymbol}5 (5 Entries)</option>
                                        <option value={10}>{currencySymbol}10 (10 Entries)</option>
                                        <option value={20}>{currencySymbol}20 (20 Entries)</option>
                                        <option value={50}>{currencySymbol}50 (50 Entries)</option>
                                    </select>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button onClick={handleAddUsed} disabled={isUploading} className="flex-1 py-3 px-4 font-semibold rounded-lg shadow-md bg-gray-200 hover:bg-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition disabled:opacity-50">
                                        {isUploading ? 'Processing...' : 'List for Free'}
                                    </button>
                                    <button onClick={handleDonate} disabled={isUploading} className="flex-1 py-3 px-4 text-lg font-semibold rounded-lg shadow-md bg-green-600 hover:bg-green-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition disabled:opacity-50">
                                        {isUploading ? 'Processing...' : 'Donate & List'}
                                    </button>
                                </div>
                            </div>
                        )
                    )}
                </form>
            </div>
        </div>
    );
};

export default ListingForm;
