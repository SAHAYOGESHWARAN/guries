import { useEffect, useRef } from 'react';
import { dataCache } from './useDataCache';
import { db } from '../utils/storage';

/**
 * Hook to ensure data persists across route changes
 * Syncs cache and localStorage bidirectionally
 * Prevents data loss when navigating between modules
 */
export function usePersistentData<T>(collection: string, data: T[]) {
    const previousDataRef = useRef<T[]>(data);

    useEffect(() => {
        // Sync data to both cache and localStorage whenever it changes
        if (data && Array.isArray(data)) {
            console.log(`[usePersistentData] Syncing ${collection} with ${data.length} items`);

            // Update global cache
            dataCache.set(collection, data);

            // Update localStorage using the proper DataService
            const service = (db as any)[collection];
            if (service) {
                try {
                    // Use the service's save method to properly persist data
                    localStorage.setItem(service.key, JSON.stringify(data));
                    console.log(`[usePersistentData] Saved ${collection} to localStorage with ${data.length} items`);
                    // Dispatch custom event to notify other listeners
                    window.dispatchEvent(new CustomEvent('local-storage-update', { detail: { key: service.key } }));
                } catch (e) {
                    console.warn(`[usePersistentData] Failed to save ${collection} to localStorage:`, e);
                }
            } else {
                console.warn(`[usePersistentData] No DataService found for collection: ${collection}`);
            }
        }

        previousDataRef.current = data;
    }, [collection, data]);

    // On unmount, ensure data is saved
    useEffect(() => {
        return () => {
            if (previousDataRef.current && previousDataRef.current.length > 0) {
                console.log(`[usePersistentData] Component unmounting - ensuring ${collection} is persisted`);
                dataCache.set(collection, previousDataRef.current);

                const service = (db as any)[collection];
                if (service) {
                    try {
                        localStorage.setItem(service.key, JSON.stringify(previousDataRef.current));
                        window.dispatchEvent(new CustomEvent('local-storage-update', { detail: { key: service.key } }));
                    } catch (e) {
                        console.warn(`[usePersistentData] Failed to persist ${collection} on unmount:`, e);
                    }
                }
            }
        };
    }, [collection]);
}

/**
 * Hook to restore data from cache/localStorage on component mount
 * Useful for views that need to restore data when returning from navigation
 */
export function useRestoreData<T>(collection: string): T[] | null {
    // Try cache first, then localStorage
    const cachedData = dataCache.get<T>(collection);
    if (cachedData && cachedData.length > 0) {
        console.log(`[useRestoreData] Restored ${collection} from cache with ${cachedData.length} items`);
        return cachedData;
    }

    try {
        const service = (db as any)[collection];
        if (service) {
            const localData = service.getAll() || [];
            if (localData.length > 0) {
                console.log(`[useRestoreData] Restored ${collection} from localStorage with ${localData.length} items`);
                // Also update cache for future access
                dataCache.set(collection, localData);
                return localData;
            }
        } else {
            console.warn(`[useRestoreData] No DataService found for collection: ${collection}`);
        }
    } catch (e) {
        console.warn(`[useRestoreData] Failed to restore ${collection}:`, e);
    }

    return null;
}

/**
 * Hook to listen for storage updates from other tabs/windows
 * Useful for real-time sync across browser tabs
 */
export function useStorageListener<T>(collection: string, onUpdate: (data: T[]) => void) {
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            const service = (db as any)[collection];
            if (service && event.key === service.key) {
                try {
                    const newData = event.newValue ? JSON.parse(event.newValue) : [];
                    console.log(`[useStorageListener] Storage updated for ${collection} from another tab`);
                    onUpdate(newData);
                } catch (e) {
                    console.warn(`[useStorageListener] Failed to parse storage update for ${collection}:`, e);
                }
            }
        };

        const handleLocalStorageUpdate = (event: Event) => {
            const customEvent = event as CustomEvent;
            const service = (db as any)[collection];
            if (service && customEvent.detail?.key === service.key) {
                try {
                    const newData = service.getAll() || [];
                    console.log(`[useStorageListener] Local storage updated for ${collection}`);
                    onUpdate(newData);
                } catch (e) {
                    console.warn(`[useStorageListener] Failed to handle local storage update for ${collection}:`, e);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('local-storage-update', handleLocalStorageUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('local-storage-update', handleLocalStorageUpdate);
        };
    }, [collection, onUpdate]);
}
