
import React from 'react';
import { AppNotification } from '../types';
import TrashIcon from './icons/TrashIcon';
import BellIcon from './icons/BellIcon';

interface NotificationsDropdownProps {
    notifications: AppNotification[];
    onNotificationClick: (notification: AppNotification) => void;
    onMarkAllAsRead: () => void;
    onClearAll: () => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
    notifications,
    onNotificationClick,
    onMarkAllAsRead,
    onClearAll,
}) => {
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-xl z-20 border border-gray-200">
            <div className="p-3 border-b flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                {unreadCount > 0 && (
                     <button
                        onClick={onMarkAllAsRead}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                        Mark all as read
                    </button>
                )}
            </div>
            <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="text-center py-10 px-4">
                        <BellIcon className="h-12 w-12 text-gray-300 mx-auto" />
                        <p className="text-gray-500 text-sm mt-3">You're all caught up!</p>
                        <p className="text-gray-400 text-xs">We'll notify you here about your listings.</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification.id}
                            onClick={() => onNotificationClick(notification)}
                            className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                        >
                            <div className="flex items-start gap-3">
                                {!notification.isRead && (
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                                )}
                                <p className={`text-sm text-gray-700 ${!notification.isRead ? 'font-medium' : 'pl-5'}`}>
                                    {notification.message}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
             {notifications.length > 0 && (
                <div className="p-2 text-center border-t">
                    <button
                        onClick={onClearAll}
                        className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded"
                    >
                       <TrashIcon /> Clear All Notifications
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationsDropdown;
