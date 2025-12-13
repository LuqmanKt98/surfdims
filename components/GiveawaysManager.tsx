

import React from 'react';
import TrashIcon from './icons/TrashIcon';

interface GiveawaysManagerProps {
    images: string[];
    onUpdate: (images: string[]) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const GiveawaysManager: React.FC<GiveawaysManagerProps> = ({ images, onUpdate }) => {

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            try {
                const files = Array.from(e.target.files).filter(file => {
                    const f = file as File;
                    return f && typeof f.type === 'string' && f.type.startsWith('image/');
                });
                const base64Promises = files.map(file => fileToBase64(file as File));
                const newImages = await Promise.all(base64Promises);
                onUpdate([...images, ...newImages]);
            } catch (error) {
                console.error("Error processing giveaway images:", error);
                alert("There was an error uploading one or more images. Please try again.");
            }
        }
    };

    const handleDeleteImage = (indexToDelete: number) => {
        const newImages = images.filter((_, index) => index !== indexToDelete);
        onUpdate(newImages);
    };

    return (
        <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Manage Giveaway Gallery Images</h3>
            <p className="text-sm text-gray-500 mb-6">
                Upload images of prizes for the monthly draw. These will be displayed in a fading gallery on the 'Learn More' page.
            </p>
            <div className="mb-6">
                <label htmlFor="giveaway-upload" className="block text-sm font-medium text-gray-700 mb-2">Upload New Images</label>
                <input
                    id="giveaway-upload"
                    type="file"
                    multiple
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>

            <div>
                <h4 className="font-semibold text-gray-800 mb-4">Current Gallery Images ({images.length})</h4>
                {images.length === 0 ? (
                    <p className="text-center text-gray-500 py-8 bg-white border rounded-lg">No images uploaded yet.</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {images.map((image, index) => (
                            <div key={index} className="relative group shadow-md rounded-lg overflow-hidden">
                                <img src={image} alt={`Giveaway prize ${index + 1}`} className="w-full h-32 object-cover" />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-colors flex items-center justify-center">
                                    <button
                                        onClick={() => handleDeleteImage(index)}
                                        className="p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100"
                                        aria-label="Delete image"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GiveawaysManager;