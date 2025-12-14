import React from 'react';
import { Surfboard } from '../types';
import { getCurrencySymbol, getNewBoardFee } from '../countries';
import TrashIcon from './icons/TrashIcon';
import XIcon from './icons/XIcon';

interface StagedBoardsCartProps {
    stagedBoards: Omit<Surfboard, 'id'>[];
    onRemoveBoard: (index: number) => void;
    onClearAll: () => void;
    onProceedToPayment: () => void;
    currencySymbol: string;
    boardFee: number;
    isOpen: boolean;
    onClose: () => void;
}

const StagedBoardsCart: React.FC<StagedBoardsCartProps> = ({
    stagedBoards,
    onRemoveBoard,
    onClearAll,
    onProceedToPayment,
    currencySymbol,
    boardFee,
    isOpen,
    onClose
}) => {
    if (!isOpen) return null;

    const totalBoardCount = stagedBoards.reduce((count, board) => count + board.dimensions.length, 0);
    const totalAmount = boardFee * totalBoardCount;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-end">
            <div className="bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Staged Listings ({totalBoardCount})
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition">
                        <XIcon />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {stagedBoards.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No boards staged yet</p>
                            <p className="text-gray-400 text-sm mt-2">
                                Use "Save & List Another" to add boards here
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Staged Boards List */}
                            <div className="space-y-4 mb-6">
                                {stagedBoards.map((board, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                                        <div className="flex gap-4">
                                            {/* Image */}
                                            {board.images.length > 0 && (
                                                <img
                                                    src={board.images[0]}
                                                    alt={`${board.brand} ${board.model}`}
                                                    className="w-20 h-20 object-cover rounded"
                                                />
                                            )}

                                            {/* Details */}
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800">
                                                    {board.brand} {board.model}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {currencySymbol}{board.price.toFixed(2)}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {board.dimensions.length} size{board.dimensions.length > 1 ? 's' : ''}
                                                </p>
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {board.dimensions.map((dim, dimIdx) => (
                                                        <span key={dimIdx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                            {dim.length}' × {dim.width}" × {dim.thickness}"
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => onRemoveBoard(index)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition"
                                                title="Remove from cart"
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary */}
                            <div className="border-t border-gray-200 pt-4 pb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Total Boards:</span>
                                    <span className="font-semibold text-gray-800">{totalBoardCount}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Fee per board:</span>
                                    <span className="font-semibold text-gray-800">{currencySymbol}{boardFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-lg font-bold border-t border-gray-200 pt-2 mt-2">
                                    <span>Total:</span>
                                    <span className="text-blue-600">{currencySymbol}{totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                <button
                                    onClick={onProceedToPayment}
                                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Proceed to Payment ({currencySymbol}{totalAmount.toFixed(2)})
                                </button>
                                <button
                                    onClick={onClearAll}
                                    className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition focus:outline-none"
                                >
                                    Clear All
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StagedBoardsCart;
