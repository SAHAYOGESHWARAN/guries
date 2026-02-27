/**
 * Data Synchronization Manager
 * Ensures data is properly synced across cache, localStorage, and components
 * Handles cross-tab synchronization and cache invalidation
 */

import { db } from './storage';
import { dataCache } from '../hooks/useDataCache';

class DataSyncManager {
    private syncListeners = new Map<string, Set<(data: any[]) => void>>();
    private lastSyncTime = new Map<string, number>();
    private readonly SYNC_DEBOUNCE = 100; // ms

    /**
     * Initialize sync manager - set up listeners for storage changes
     */
    init() {
        // Listen for storage changes from other tabs
        window.addEventListener('storage', this.handleStorageChange.bind(this));

        // Listen for local storage updates from this tab
        window.addEventListener('local-storage-update', this.handleLocalStorageUpdate.bind(this));

        console.log('[DataSyncManager] Initialized');
    }

    /**
     * Handle storage changes from other browser tabs
     */
    private handleStorageChange(event: StorageEvent) {
        if (!event.key) return;

        // Find which collection this key belongs to
        for (const [collection, service] of Object.entries(db)) {
            if ((service as any).key === event.key) {
                console.log(`[DataSyncManager] Storage changed for ${collection} from another tab`);
                this.syncCollection(collection);
                break;
            }
        }
    }

    /**
     * Handle local storage updates from this tab
     */
    private handleLocalStorageUpdate(event: Event) {
        const customEvent = event as CustomEvent;
        const key = customEvent.detail?.key;

        if (!key) return;

        // Find which collection this key belongs to
        for (const [collection, service] of Object.entries(db)) {
            if ((service as any).key === key) {
                console.log(`[DataSyncManager] Local storage updated for ${collection}`);
                this.syncCollection(collection);
                break;
            }
        }
    }

    /**
     * Sync a collection across cache and localStorage
     */
    syncCollection(collection: string) {
        const now = Date.now();
        const lastSync = this.lastSyncTime.get(collection) || 0;

        // Debounce rapid syncs
        if (now - lastSync < this.SYNC_DEBOUNCE) {
            return;
        }

        this.lastSyncTime.set(collection, now);

        try {
            const service = (db as any)[collection];
            if (!service) {
                console.warn(`[DataSyncManager] No service found for collection: ${collection}`);
                return;
            }

            // Load from localStorage
            const localData = service.getAll() || [];
            console.log(`[DataSyncManager] Syncing ${collection}: ${localData.length} items from localStorage`);

            // Update global cache
            if (localData.length > 0) {
                dataCache.set(collection, localData);
                console.log(`[DataSyncManager] Updated cache for ${collection}`);
            }

            // Notify listeners
            this.notifyListeners(collection, localData);
        } catch (e) {
            console.error(`[DataSyncManager] Failed to sync ${collection}:`, e);
        }
    }

    /**
     * Subscribe to collection changes
     */
    subscribe(collection: string, callback: (data: any[]) => void): () => void {
        if (!this.syncListeners.has(collection)) {
            this.syncListeners.set(collection, new Set());
        }

        this.syncListeners.get(collection)!.add(callback);

        // Return unsubscribe function
        return () => {
            this.syncListeners.get(collection)?.delete(callback);
        };
    }

    /**
     * Notify all listeners for a collection
     */
    private notifyListeners(collection: string, data: any[]) {
        const listeners = this.syncListeners.get(collection);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(data);
                } catch (e) {
                    console.error(`[DataSyncManager] Error in listener for ${collection}:`, e);
                }
            });
        }
    }

    /**
     * Force sync all collections
     */
    syncAll() {
        console.log('[DataSyncManager] Syncing all collections');
        for (const collection of Object.keys(db)) {
            this.syncCollection(collection);
        }
    }

    /**
     * Clear all data for a collection
     */
    clearCollection(collection: string) {
        try {
            const service = (db as any)[collection];
            if (service) {
                localStorage.removeItem(service.key);
                dataCache.invalidate(collection);
                console.log(`[DataSyncManager] Cleared ${collection}`);
            }
        } catch (e) {
            console.error(`[DataSyncManager] Failed to clear ${collection}:`, e);
        }
    }

    /**
     * Get data for a collection from cache or localStorage
     */
    getData<T>(collection: string): T[] {
        // Try cache first
        const cachedData = dataCache.get<T>(collection);
        if (cachedData && cachedData.length > 0) {
            return cachedData;
        }

        // Fall back to localStorage
        try {
            const service = (db as any)[collection];
            if (service) {
                const localData = service.getAll() || [];
                if (localData.length > 0) {
                    // Also update cache
                    dataCache.set(collection, localData);
                }
                return localData;
            }
        } catch (e) {
            console.error(`[DataSyncManager] Failed to get data for ${collection}:`, e);
        }

        return [];
    }
}

// Export singleton instance
export const dataSyncManager = new DataSyncManager();

// Initialize on import
if (typeof window !== 'undefined') {
    dataSyncManager.init();
}
