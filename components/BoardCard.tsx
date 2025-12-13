




import React from 'react';
import { Surfboard, Condition, SurfboardStatus, User } from '../types';
import HeartIcon from './icons/HeartIcon';
import ShareIcon from './icons/ShareIcon';
import { getCurrencySymbol } from '../countries';

interface BoardCardProps {
    board: Surfboard;
    seller: User;
    isFavourited: boolean;
    onToggleFavs: (boardId: string) => void;
    onSelect: () => void;
    currentUser: User | null;
    onShare: (board: Surfboard) => void;
}

const BoardCard: React.FC<BoardCardProps> = ({ board, seller, isFavourited, onToggleFavs, onSelect, currentUser, onShare }) => {
    let conditionStyles = 'bg-blue-100 text-blue-800';
    if (board.condition === Condition.New) {
        conditionStyles = 'bg-green-100 text-green-800';
    }

    const handleShareClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onShare(board);
    };

    const handleFavsClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleFavs(board.id);
    };

    const { dimensions } = board;
    let lengthDisplay = '—';
    let volumeDisplay = '—';

    if (dimensions && dimensions.length > 0) {
        if (dimensions.length > 1) {
            const lengths = dimensions.map(d => d.length).filter(l => typeof l === 'number' && l > 0);
            const volumes = dimensions.map(d => d.volume).filter(v => typeof v === 'number' && v > 0);

            if (lengths.length > 0) {
                const minL = Math.min(...lengths);
                const maxL = Math.max(...lengths);
                lengthDisplay = minL === maxL ? `${minL.toFixed(1)}'` : `${minL.toFixed(1)}' - ${maxL.toFixed(1)}'`;
            }
            if (volumes.length > 0) {
                const minV = Math.min(...volumes);
                const maxV = Math.max(...volumes);
                volumeDisplay = minV === maxV ? `${minV.toFixed(1)}` : `${minV.toFixed(1)} - ${maxV.toFixed(1)}`;
            }
        } else { // length === 1
            const firstDim = dimensions[0];
            if (firstDim) {
                lengthDisplay = typeof firstDim.length === 'number' && firstDim.length > 0 ? `${firstDim.length.toFixed(2)}'` : '—';
                volumeDisplay = typeof firstDim.volume === 'number' && firstDim.volume > 0 ? `${firstDim.volume.toFixed(1)}` : '—';
            }
        }
    }

    const isOwner = currentUser?.id === board.sellerId;
    const isClickable = board.status === SurfboardStatus.Live || isOwner;

    const imageUrl = board.images && board.images.length > 0
        ? board.images[0]
        : `https://placehold.co/800x600/f0f4f8/25425c?text=${encodeURIComponent([board.brand, board.model].filter(Boolean).join(' ') || 'Surfboard')}`;

    return (
        <div
            onClick={isClickable ? onSelect : undefined}
            className={`bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group ${isClickable ? 'cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-2xl' : ''}`}
        >
            <div className="relative">
                <img className="w-full h-56 object-cover" src={imageUrl} alt={`${board.brand} ${board.model}`} />

                {board.status !== SurfboardStatus.Live && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                        <span className={`text-white text-2xl font-bold px-4 py-2 rounded-lg ${board.status === SurfboardStatus.Sold ? 'bg-gray-800' : 'bg-yellow-600'} bg-opacity-80`}>
                            {board.status}
                        </span>
                    </div>
                )}

                <div className={`absolute top-2 right-2 px-3 py-1 text-sm font-semibold rounded-full ${conditionStyles}`}>
                    {board.condition}
                </div>
                {board.dimensions.length > 1 && (
                    <div className="absolute top-10 right-2 px-2 py-0.5 text-xs font-bold rounded-full bg-cyan-100 text-cyan-800 shadow">
                        Multiple Sizes
                    </div>
                )}
                <div className="absolute top-2 left-2 flex gap-2">
                    <button onClick={handleFavsClick} className={`p-2 rounded-full bg-white bg-opacity-70 backdrop-blur-sm text-gray-800 hover:bg-opacity-100 transition-transform duration-200 ${isFavourited ? 'text-[#49b9ce]' : 'text-gray-600 hover:scale-110'}`}>
                        <HeartIcon isFilled={isFavourited} />
                    </button>
                    <button onClick={handleShareClick} className="p-2 rounded-full bg-white bg-opacity-70 backdrop-blur-sm text-gray-600 hover:text-gray-800 hover:scale-110 transition-transform duration-200">
                        <ShareIcon />
                    </button>
                </div>
            </div>
            <div className="p-5 flex-grow flex flex-col">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 leading-tight">{board.brand || '\u00A0'}</h3>
                        <p className="text-xl text-gray-700 leading-tight">{board.model || '\u00A0'}</p>
                    </div>
                    <p className="text-2xl font-extrabold text-[#306cf6] text-right whitespace-nowrap">
                        {getCurrencySymbol(seller.country)}{board.price}
                    </p>
                </div>

                <div className="mt-auto pt-4 grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                            Length
                        </p>
                        <p className="font-semibold text-gray-800 text-lg">{lengthDisplay}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                            Volume (L)
                        </p>
                        <p className="font-semibold text-gray-800 text-lg">{volumeDisplay}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                            Fins
                        </p>
                        <p className="font-semibold text-gray-800 text-lg">{board.finSystem}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoardCard;