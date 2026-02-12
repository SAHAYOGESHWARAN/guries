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
        if (data && Array.isArray(data) && data.length > 0) {
            console.log(`[usePersistentData] Syncing ${collection} with ${data.length} items`);

            // Update global cache
            dataCache.set(collection, data);

            // Update localStorage
            if ((db as any)[collection]) {
                try {
                    localStorage.setItem((db as any)[collection].key, JSON.stringify(data));
                    console.log(`[usePersistentData] Saved ${collection} to localStorage`);
                } catch (e) {
                    console.warn(`[usePersistentData] Failed to save ${collection} to localStorage:`, e);
                }
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

                if ((db as any)[collection]) {
                    try {
                        localStorage.setItem((db as any)[collection].key, JSON.stringify(previousDataRef.current));
                    } catch (e) {
                        // Ignore
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
        if ((db as any)[collection]) {
            const localData = (db as any)[collection].getAll() || [];
            if (localData.length > 0) {
                console.log(`[useRestoreData] Restored ${collection} from localStorage with ${localData.length} items`);
                return localData;
            }
        }
    } catch (e) {
        console.warn(`[useRestoreData] Failed to restore ${collection}:`, e);
    }

    return null;
}
