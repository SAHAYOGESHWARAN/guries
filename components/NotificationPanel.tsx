import React, { useState } from 'react';
import type { Notification } from '../types';

interface NotificationPanelProps {
    notifications: Notification[];
    onMarkAsRead?: (id: number) => void;
    onMarkAllAsRead?: () => void;
    onClearAll?: () => void;
    className?: string;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onClearAll,
    className = ""
}) => {
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

    const unreadCount = notifications.filter(n => !n.read).length;

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread') return !notification.read;
        if (filter === 'read') return notification.read;
        return true;
    });

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            case 'warning':
                return (
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                );
            case 'error':
                return (
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    const formatTime = (timeString: string) => {
        try {
            const date = new Date(timeString);
            const now = new Date();
            const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

            if (diffInMinutes < 1) return 'Just now';
            if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
            if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
            return `${Math.floor(diffInMinutes / 1440)}d ago`;
        } catch {
            return timeString;
        }
    };

    return (
        <div className={`bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden ${className}`}>
            {/* Header */}
            <div className="px-4 lg:px-6 py-4 border-b border-slate-200 bg-slate-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h3 className="font-semibold text-slate-800 text-lg">Notifications</h3>
                        <p className="text-sm text-slate-600">
                            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && onMarkAllAsRead && (
                            <button
                                onClick={onMarkAllAsRead}
                                className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                            >
                                Mark all read
                            </button>
                        )}
                        {notifications.length > 0 && onClearAll && (
                            <button
                                onClick={onClearAll}
                                className="text-sm text-slate-500 hover:text-slate-700"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1 mt-4">
                    {[
                        { key: 'all', label: 'All', count: notifications.length },
                        { key: 'unread', label: 'Unread', count: unreadCount },
                        { key: 'read', label: 'Read', count: notifications.length - unreadCount }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key as any)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${filter === tab.key
                                    ? 'bg-white text-brand-700 shadow-sm border border-brand-200'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${filter === tab.key
                                        ? 'bg-brand-100 text-brand-700'
                                        : 'bg-slate-200 text-slate-600'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
                {filteredNotifications.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`px-4 lg:px-6 py-4 hover:bg-slate-25 transition-colors ${!notification.read ? 'bg-blue-50/30' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    {getNotificationIcon(notification.type)}

                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm leading-relaxed ${!notification.read ? 'text-slate-900 font-medium' : 'text-slate-700'
                                            }`}>
                                            {notification.text}
                                        </p>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-xs text-slate-500">
                                                {formatTime(notification.time)}
                                            </p>
                                            {!notification.read && onMarkAsRead && (
                                                <button
                                                    onClick={() => onMarkAsRead(notification.id)}
                                                    className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                                                >
                                                    Mark as read
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {!notification.read && (
                                        <div className="w-2 h-2 bg-brand-500 rounded-full flex-shrink-0 mt-2"></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="px-4 lg:px-6 py-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <h4 className="text-sm font-medium text-slate-900 mb-1">
                            {filter === 'unread' ? 'No unread notifications' :
                                filter === 'read' ? 'No read notifications' : 'No notifications'}
                        </h4>
                        <p className="text-xs text-slate-500">
                            {filter === 'unread'
                                ? 'All your notifications have been read'
                                : filter === 'read'
                                    ? 'No notifications have been read yet'
                                    : 'You\'re all caught up! New notifications will appear here.'
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            {filteredNotifications.length > 5 && (
                <div className="px-4 lg:px-6 py-3 border-t border-slate-100 bg-slate-50">
                    <button className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                        View all notifications →
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;