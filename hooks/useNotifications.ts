import { useEffect, useRef, useCallback } from 'react';
import { useData } from './useData';
import type { Notification } from '../types';

interface UseNotificationsOptions {
    enableSound?: boolean;
    enableBrowserNotifications?: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
    const { enableSound = true, enableBrowserNotifications = true } = options;
    const { data: notifications, create, update, remove } = useData<Notification>('notifications');
    const prevCountRef = useRef(notifications.length);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio element for notification sound
    useEffect(() => {
        if (enableSound && typeof window !== 'undefined') {
            // Create a simple beep sound using Web Audio API
            audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQYAHIveli8AAAB4nJF0RjNLfKe8qH1HHCF0qNDdqGgPABqL3pYvAAAAeJyRdEYzS3ynvKh9RxwhdKjQ3ahoD');
        }
    }, [enableSound]);

    // Request browser notification permission
    useEffect(() => {
        if (enableBrowserNotifications && 'Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }, [enableBrowserNotifications]);

    // Play sound when new notification arrives
    useEffect(() => {
        if (notifications.length > prevCountRef.current) {
            // New notification arrived
            if (enableSound && audioRef.current) {
                audioRef.current.play().catch(() => {
                    // Audio play failed (user hasn't interacted with page yet)
                });
            }

            // Show browser notification
            if (enableBrowserNotifications && 'Notification' in window && Notification.permission === 'granted') {
                const latestNotification = notifications[0];
                if (latestNotification) {
                    new Notification('New Notification', {
                        body: latestNotification.text,
                        icon: '/favicon.ico',
                        tag: `notification-${latestNotification.id}`,
                    });
                }
            }
        }
        prevCountRef.current = notifications.length;
    }, [notifications.length, enableSound, enableBrowserNotifications]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = useCallback((id: number) => {
        update(id, { read: true });
    }, [update]);

    const markAllAsRead = useCallback(() => {
        notifications.filter(n => !n.read).forEach(n => {
            update(n.id, { read: true });
        });
    }, [notifications, update]);

    const clearAll = useCallback(() => {
        notifications.forEach(n => {
            remove(n.id);
        });
    }, [notifications, remove]);

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read' | 'time' | 'created_at'>) => {
        const now = new Date();
        return create({
            ...notification,
            read: false,
            time: now.toISOString(),
            created_at: now.toISOString(),
        });
    }, [create]);

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll,
        addNotification,
    };
}
