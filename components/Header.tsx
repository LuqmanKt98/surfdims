
import React, { useState, useRef, useEffect } from 'react';
import { User, BrandingState, AppNotification } from '../types';
import UserIcon from './icons/UserIcon';
import CogIcon from './icons/CogIcon';
import QuestionIcon from './icons/QuestionIcon';
import AdminIcon from './icons/AdminIcon';
import BellIcon from './icons/BellIcon';
import CartIcon from './icons/CartIcon';
import NotificationsDropdown from './NotificationsDropdown';

interface HeaderProps {
    branding: BrandingState;
    currentUser: User | null;
    onListBoardClick: () => void;
    onLoginClick: () => void;
    onLogout: () => void;
    onShowFavs: () => void;
    onShowMyListings: () => void;
    onShowAll: () => void;
    onAccountSettingsClick: () => void;
    onFaqClick: () => void;
    onContactClick: () => void;
    onAdminClick: () => void;
    notifications: AppNotification[];
    onNotificationClick: (notification: AppNotification) => void;
    onMarkAllNotificationsAsRead: () => void;
    onClearAllNotifications: () => void;
    stagedBoardsCount: number;
    onCartClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
    branding,
    currentUser,
    onListBoardClick,
    onLoginClick,
    onLogout,
    onShowFavs,
    onShowMyListings,
    onShowAll,
    onAccountSettingsClick,
    onFaqClick,
    onContactClick,
    onAdminClick,
    notifications,
    onNotificationClick,
    onMarkAllNotificationsAsRead,
    onClearAllNotifications,
    stagedBoardsCount,
    onCartClick,
}) => {
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const userDropdownRef = useRef<HTMLDivElement>(null);
    const helpDropdownRef = useRef<HTMLDivElement>(null);
    const notificationsDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
                setIsUserDropdownOpen(false);
            }
            if (helpDropdownRef.current && !helpDropdownRef.current.contains(event.target as Node)) {
                setIsHelpDropdownOpen(false);
            }
            if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <header className="bg-[#25425c] shadow-md sticky top-0 z-20">
            <div className="container mx-auto px-4 lg:px-6 flex justify-between items-center">
                <div
                    className="cursor-pointer"
                    onClick={onShowAll}
                >
                    {/* Logo for desktop and tablet */}
                    <div className="hidden md:block">
                        <img src={branding.desktopLogo} alt="SurfDims Logo" className="h-16" />
                    </div>

                    {/* Logo for mobile */}
                    <div className="md:hidden py-2">
                        {branding.mobileLogo ? (
                            <img src={branding.mobileLogo} alt="SurfDims Logo" className="h-10" />
                        ) : (
                            <h1 className="text-3xl font-extrabold text-[#4abacf] tracking-tight">
                                <span className="text-white">Surf</span>Dims
                            </h1>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onListBoardClick}
                        className="px-4 md:px-6 py-2 bg-[#49b9ce] text-white font-semibold rounded-lg shadow-md hover:bg-[#41a5b9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#25425c] focus:ring-[#49b9ce] transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={!!currentUser && !currentUser.isVerified}
                        title={!!currentUser && !currentUser.isVerified ? "Please verify your account to list a board" : "List a new or used surfboard"}
                    >
                        <span className="md:hidden">LIST</span>
                        <span className="hidden md:inline">List Board</span>
                    </button>

                    {/* Staged Boards Cart Button */}
                    {currentUser && stagedBoardsCount > 0 && (
                        <button
                            onClick={onCartClick}
                            className="relative px-3 py-2 bg-[#49b9ce] text-white font-semibold rounded-lg shadow-md hover:bg-[#41a5b9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#25425c] focus:ring-[#49b9ce] transition duration-150 ease-in-out"
                            title="View staged boards"
                        >
                            <CartIcon className="w-6 h-6" />
                            {stagedBoardsCount > 0 && (
                                <span className="absolute -top-1 -right-1 block h-5 w-5 transform rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center ring-2 ring-[#25425c]">
                                    {stagedBoardsCount}
                                </span>
                            )}
                        </button>
                    )}

                    {/* Help Dropdown */}
                    <div className="relative" ref={helpDropdownRef}>
                        <button onClick={() => setIsHelpDropdownOpen(!isHelpDropdownOpen)} className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#25425c] focus:ring-cyan-400 rounded-full">
                            <QuestionIcon className="h-10 w-10 p-1.5 rounded-full text-white border-2 border-[#3e90a6]" />
                        </button>
                        {isHelpDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-20 py-1">
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); onFaqClick(); setIsHelpDropdownOpen(false); }}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    FAQ
                                </a>
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); onContactClick(); setIsHelpDropdownOpen(false); }}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Contact Us
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Notifications Dropdown */}
                    {currentUser && (
                        <div className="relative" ref={notificationsDropdownRef}>
                            <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#25425c] focus:ring-cyan-400 rounded-full">
                                <BellIcon className="h-10 w-10 p-1.5 rounded-full text-white border-2 border-[#3e90a6]" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 block h-4 w-4 transform rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center ring-2 ring-[#25425c]">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            {isNotificationsOpen && (
                                <NotificationsDropdown
                                    notifications={notifications}
                                    onNotificationClick={(notification) => {
                                        onNotificationClick(notification);
                                        setIsNotificationsOpen(false);
                                    }}
                                    onMarkAllAsRead={onMarkAllNotificationsAsRead}
                                    onClearAll={onClearAllNotifications}
                                />
                            )}
                        </div>
                    )}


                    {/* User Dropdown */}
                    {currentUser ? (
                        <div className="relative" ref={userDropdownRef}>
                            <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#25425c] focus:ring-cyan-400 rounded-full">
                                {currentUser.avatar ? (
                                    <img src={currentUser.avatar} alt="User Avatar" className="h-10 w-10 rounded-full object-cover" />
                                ) : (
                                    <UserIcon className="h-10 w-10 p-2 rounded-full bg-slate-200 text-[#25425c]" />
                                )}
                            </button>
                            {isUserDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-20 py-1">
                                    <a
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); onShowMyListings(); setIsUserDropdownOpen(false); }}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        My Listings
                                    </a>
                                    <a
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); onShowFavs(); setIsUserDropdownOpen(false); }}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        My Favs
                                    </a>
                                    <a
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); onAccountSettingsClick(); setIsUserDropdownOpen(false); }}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <CogIcon />
                                        Account Settings
                                    </a>
                                    {currentUser.role === 'admin' && (
                                        <a
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); onAdminClick(); setIsUserDropdownOpen(false); }}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <AdminIcon />
                                            Admin Panel
                                        </a>
                                    )}
                                    <div className="border-t my-1"></div>
                                    <a
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); onLogout(); setIsUserDropdownOpen(false); }}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Logout
                                    </a>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={onLoginClick}
                            className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#25425c] focus:ring-cyan-400 rounded-full"
                        >
                            <UserIcon className="h-10 w-10 p-2 rounded-full bg-slate-200 text-[#25425c]" />
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
