





import React, { useState } from 'react';
import { Surfboard, User, Condition, SurfboardStatus } from '../types';
import { getCurrencySymbol, getCountryName } from '../countries';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import HeartIcon from './icons/HeartIcon';
import ShareIcon from './icons/ShareIcon';
import ExpandIcon from './icons/ExpandIcon';
import FullscreenImageViewer from './FullscreenImageViewer';
import CheckCircleIcon from './icons/CheckCircleIcon';
import RefreshIcon from './icons/RefreshIcon';
import TrashIcon from './icons/TrashIcon';
import EditIcon from './icons/EditIcon';
import ExternalLinkIcon from './icons/ExternalLinkIcon';
import ClockIcon from './icons/ClockIcon';

interface ListingDetailProps {
    board: Surfboard;
    seller: User;
    currentUser: User | null;
    onClose: () => void;
    isFavourited: boolean;
    onToggleFavs: (boardId: string) => void;
    onViewSellerListings: (sellerId: string) => void;
    onMarkAsSold: (boardId: string) => void;
    onRenewListing: (boardId: string) => void;
    onRelistBoard: (boardId: string) => void;
    onDeleteListing: (boardId: string) => void;
    onEditListing: (board: Surfboard) => void;
    onShare: (board: Surfboard) => void;
    onLoginClick: () => void;
}

const DetailItem: React.FC<{ label: string, value: string | number }> = ({ label, value }) => (
    <div className="text-center bg-gray-100 p-3 rounded-lg">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-bold text-lg text-gray-800">{value}</p>
    </div>
);

const ListingDetail: React.FC<ListingDetailProps> = ({ board, seller, currentUser, onClose, isFavourited, onToggleFavs, onViewSellerListings, onMarkAsSold, onRenewListing, onRelistBoard, onDeleteListing, onEditListing, onShare, onLoginClick }) => {
    const placeholderImg = `https://placehold.co/800x600/f0f4f8/25425c?text=${encodeURIComponent([board.brand, board.model].filter(Boolean).join(' ') || 'Surfboard')}`;
    const hasImages = board.images && board.images.length > 0;

    const [mainImage, setMainImage] = useState(hasImages ? board.images[0] : placeholderImg);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewerStartIndex, setViewerStartIndex] = useState(0);

    const openViewer = (index: number) => {
        setViewerStartIndex(index);
        setIsViewerOpen(true);
    };

    const handleShareClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onShare(board);
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to permanently delete this listing? This action cannot be undone.')) {
            onDeleteListing(board.id);
        }
    };

    let conditionStyles = 'bg-blue-100 text-blue-800';
    if (board.condition === Condition.New) {
        conditionStyles = 'bg-green-100 text-green-800';
    }

    const isSeller = currentUser?.id === seller.id;

    const getExpiryText = () => {
        if (board.status !== SurfboardStatus.Live) {
            return null;
        }

        const now = new Date();
        const listedDate = new Date(board.listedDate);
        // Expiry: 1 year for new, 3 months (90 days) for used
        const expiryDurationDays = board.condition === Condition.New ? 365 : 90;

        const expiryDate = new Date(listedDate.getTime());
        expiryDate.setDate(listedDate.getDate() + expiryDurationDays);

        const timeDiff = expiryDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (daysRemaining <= 0) {
            return "Expires today";
        }
        if (daysRemaining === 1) {
            return "Expires in 1 day";
        }
        return `Expires in ${daysRemaining} days`;
    };

    const expiryText = getExpiryText();
    const countryName = getCountryName(seller.country);
    const fullLocation = [seller.location, countryName].filter(Boolean).join(', ');

    return (
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg animate-fade-in-down">
            <div className="mb-6">
                <button onClick={onClose} className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition">
                    <ArrowLeftIcon />
                    Back to Listings
                </button>
            </div>

            {board.status !== SurfboardStatus.Live && (
                <div className={`p-4 mb-6 rounded-lg text-center font-bold text-base ${board.status === SurfboardStatus.Sold ? 'bg-gray-200 text-gray-700' : 'bg-yellow-100 text-yellow-800'}`}>
                    This listing is currently {board.status}.
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Image Gallery */}
                <div className="lg:w-1/2">
                    <div className="relative group">
                        <img
                            src={mainImage}
                            alt={`${board.brand} ${board.model}`}
                            className={`w-full h-auto object-cover rounded-lg shadow-md aspect-[4/3] ${hasImages ? 'cursor-pointer' : ''}`}
                            onClick={hasImages ? () => openViewer(board.images.indexOf(mainImage)) : undefined}
                        />
                        <div
                            className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex justify-center items-center rounded-lg ${hasImages ? 'cursor-pointer' : ''}`}
                            onClick={hasImages ? () => openViewer(board.images.indexOf(mainImage)) : undefined}
                        >
                            {hasImages && <ExpandIcon className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 group-hover:scale-110 transform transition-all duration-300" />}
                        </div>
                    </div>
                    {board.images.length > 1 && (
                        <div className="flex gap-2 mt-3 overflow-x-auto">
                            {board.images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`thumbnail ${index + 1}`}
                                    className={`w-20 h-20 object-cover rounded-md cursor-pointer transition-all duration-200 ${mainImage === img ? 'ring-4 ring-blue-500' : 'opacity-70 hover:opacity-100'}`}
                                    onClick={() => setMainImage(img)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Board Details */}
                <div className="lg:w-1/2">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${conditionStyles}`}>{board.condition}</span>
                            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mt-2">{board.brand}</h1>
                            <h2 className="text-2xl text-gray-700">{board.model}</h2>
                        </div>
                        <p className="text-3xl lg:text-4xl font-black text-[#25425c] whitespace-nowrap">
                            {getCurrencySymbol(seller.country)}{board.price}
                        </p>
                    </div>

                    {(board.condition === Condition.New) && board.website && (
                        <div className="mt-4">
                            <a
                                href={!board.website.startsWith('http') ? `//${board.website}` : board.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                            >
                                <ExternalLinkIcon />
                                Visit Seller's Website
                            </a>
                        </div>
                    )}

                    <div className="mt-6">
                        <h3 className="font-bold text-lg text-gray-800 mb-3">Dimensions</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left table-auto border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-3 text-sm font-semibold text-gray-600">Length</th>
                                        <th className="p-3 text-sm font-semibold text-gray-600">Width</th>
                                        <th className="p-3 text-sm font-semibold text-gray-600">Thickness</th>
                                        <th className="p-3 text-sm font-semibold text-gray-600">Volume</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {board.dimensions.map((dim, index) => (
                                        <tr key={index} className="border-b border-gray-200">
                                            <td className="p-3 font-medium text-gray-800">{dim.length}'</td>
                                            <td className="p-3 font-medium text-gray-800">{dim.width}"</td>
                                            <td className="p-3 font-medium text-gray-800">{dim.thickness}"</td>
                                            <td className="p-3 font-medium text-gray-800">{dim.volume}L</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <DetailItem label="Fin System" value={board.finSystem} />
                        <DetailItem label="Fin Setup" value={board.finSetup} />
                    </div>

                    <div className="mt-6 border-t pt-6">
                        <h3 className="font-bold text-gray-800 mb-2">Description</h3>
                        <p className="text-gray-600 whitespace-pre-wrap">{board.description}</p>
                    </div>

                    <div className="mt-6 flex items-center gap-4">
                        {isSeller ? (
                            <button onClick={() => onEditListing(board)} className="flex-1 flex items-center justify-center gap-2 py-3 px-4 text-lg font-semibold rounded-lg shadow-md transition-colors border-2 border-blue-600 bg-blue-50 text-blue-700 hover:bg-blue-100">
                                <EditIcon />
                                Edit Listing
                            </button>
                        ) : (
                            <button onClick={() => onToggleFavs(board.id)} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-lg font-semibold rounded-lg shadow-md transition-colors border-2 ${isFavourited ? 'border-[#49b9ce] bg-[#49b9ce] bg-opacity-10 text-[#49b9ce]' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'} ${board.status !== SurfboardStatus.Live ? 'opacity-50 pointer-events-none' : ''}`}>
                                <HeartIcon isFilled={isFavourited} className={isFavourited ? 'text-[#49b9ce]' : ''} />
                                {isFavourited ? 'In Favs' : 'Add to Favs'}
                            </button>
                        )}
                        <button onClick={handleShareClick} className="flex-1 flex items-center justify-center gap-2 py-3 px-4 text-lg font-semibold rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                            <ShareIcon />
                            Share
                        </button>
                    </div>
                </div>
            </div>

            {/* Seller Management Panel */}
            {isSeller && (
                <div className="mt-10 border-t pt-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Manage Listing</h3>
                    <div className="bg-gray-50 p-6 rounded-lg">
                        {board.status === SurfboardStatus.Live && (
                            <div className="space-y-8">
                                <div>
                                    {expiryText && (
                                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                                            <ClockIcon className="h-5 w-5" />
                                            <p>{expiryText}.</p>
                                        </div>
                                    )}
                                    {board.condition === Condition.New ? (
                                        <p className="text-gray-600 mb-4">New listings are active for 1 year. No renewal needed until expiry.</p>
                                    ) : (
                                        <>
                                            <p className="text-gray-600 mb-4">Used listings active for 3 months. Extend anytime for free.</p>
                                            <button onClick={() => onRenewListing(board.id)} className="w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-6 font-semibold rounded-lg shadow-md bg-green-600 hover:bg-green-700 text-white transition-colors">
                                                <RefreshIcon />
                                                Extend Listing
                                            </button>
                                        </>
                                    )}
                                </div>
                                <div className="pt-8 border-t border-gray-200">
                                    <p className="text-gray-600 mb-4">Is the board sold? Mark it as sold to remove it from public listings. You have 30 days to renew should the sale fall through.</p>
                                    <button onClick={() => onMarkAsSold(board.id)} className="w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-6 font-semibold rounded-lg shadow-md bg-gray-600 hover:bg-gray-700 text-white transition-colors">
                                        <CheckCircleIcon />
                                        Mark as Sold
                                    </button>
                                </div>
                            </div>
                        )}
                        {board.status === SurfboardStatus.Expired && (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-gray-600 mb-4">
                                        {board.condition === Condition.New
                                            ? "This listing has expired because it is over 1 year old. Renewing requires payment."
                                            : "This listing expired because it's over 3 months old. Renew it for free to make it live again."
                                        }
                                    </p>
                                    <button onClick={() => onRenewListing(board.id)} className="w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-6 font-semibold rounded-lg shadow-md bg-green-600 hover:bg-green-700 text-white transition-colors">
                                        <RefreshIcon />
                                        {board.condition === Condition.New ? 'Reactivate (Payment Required)' : 'Renew Listing'}
                                    </button>
                                </div>
                                <div className="pt-4 mt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-600 mb-2">Or, permanently remove this listing.</p>
                                    <button
                                        onClick={handleDelete}
                                        className="flex items-center justify-center gap-2 py-2 px-4 text-sm font-semibold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                    >
                                        <TrashIcon />
                                        Delete listing
                                    </button>
                                </div>
                            </div>
                        )}
                        {board.status === SurfboardStatus.Sold && (
                            <div>
                                <p className="text-gray-600 mb-4">This board was marked as sold. If the sale fell through or you have a similar board, you can relist it.</p>
                                <button onClick={() => onRelistBoard(board.id)} className="w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-6 font-semibold rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                                    <RefreshIcon />
                                    Relist Board
                                </button>
                            </div>
                        )}
                    </div>
                    {board.status === SurfboardStatus.Expired && (
                        <p className="text-xs text-gray-500 text-center mt-4">
                            Please note that listings left expired for 30 days are deleted.
                        </p>
                    )}
                </div>
            )}


            {/* Seller Info */}
            <div className="mt-10 border-t pt-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Seller Information</h3>
                <div className="bg-gray-50 p-6 rounded-lg flex items-start sm:items-center gap-6">
                    <img src={seller.avatar} alt={seller.name} className="w-20 h-20 rounded-full object-cover flex-shrink-0" />
                    <div className="flex-grow">
                        <p className="text-xl font-bold text-gray-900">{seller.name}</p>
                        <p className="text-gray-600">{fullLocation}</p>

                        <div className={`mt-2 text-sm ${board.status !== SurfboardStatus.Live && !isSeller ? 'pointer-events-none' : ''}`}>
                            <a href={`mailto:${seller.email}`} className="text-blue-600 hover:underline break-all">{seller.email}</a>
                            {seller.phone && <span className="text-gray-400 mx-2 hidden sm:inline">|</span>}
                            {seller.phone && <a href={`tel:${seller.phone}`} className="text-blue-600 hover:underline block sm:inline mt-1 sm:mt-0">{seller.phone}</a>}
                        </div>

                        <button
                            onClick={() => onViewSellerListings(seller.id)}
                            className="mt-3 text-sm font-semibold text-blue-600 hover:underline focus:outline-none"
                        >
                            View seller's other listings
                        </button>
                    </div>
                </div>
            </div>

            {isViewerOpen && hasImages && (
                <FullscreenImageViewer
                    images={board.images}
                    startIndex={viewerStartIndex}
                    onClose={() => setIsViewerOpen(false)}
                />
            )}
        </div>
    );
};

export default ListingDetail;
