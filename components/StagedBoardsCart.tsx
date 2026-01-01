import React from 'react';
import { Surfboard } from '../types';
import { getCurrencySymbol, getNewBoardFee } from '../countries';
import TrashIcon from './icons/TrashIcon';
import XIcon from './icons/XIcon';
import EditIcon from './icons/EditIcon';

interface StagedBoardsCartProps {
    stagedBoards: Omit<Surfboard, 'id'>[];
    onRemoveBoard: (index: number) => void;
    onEditBoard: (index: number) => void;
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
    onEditBoard,
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
                <div className="sticky top-0 bg-white p-6 flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 flex-1">Your Cart</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
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
                            <div className="space-y-3 mb-6">
                                {stagedBoards.map((board, index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    {board.brand}
                                                </h3>
                                                <p className="text-gray-600 mt-1">
                                                    {board.model}
                                                </p>
                                                <p className="text-blue-600 text-sm mt-2">
                                                    {board.dimensions.length} size{board.dimensions.length > 1 ? 's' : ''} listed
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl font-bold text-gray-900">
                                                    {currencySymbol}{(board.price * board.dimensions.length).toFixed(2)}
                                                </span>
                                                <button
                                                    onClick={() => onEditBoard(index)}
                                                    className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded transition"
                                                    title="Edit listing"
                                                >
                                                    <EditIcon />
                                                </button>
                                                <button
                                                    onClick={() => onRemoveBoard(index)}
                                                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition"
                                                    title="Delete listing"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-2xl font-bold text-gray-900">Total:</span>
                                    <span className="text-3xl font-bold text-blue-600">{currencySymbol}{totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                <button
                                    onClick={onProceedToPayment}
                                    className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl shadow-md transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Proceed to Checkout
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-3 px-4 text-gray-600 hover:text-gray-800 font-semibold rounded-lg transition focus:outline-none"
                                >
                                    Keep Shopping
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
