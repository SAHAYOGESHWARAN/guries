/**
 * Global Data Cache
 * Persists fetched data across route changes and component remounts
 * Prevents unnecessary API calls and maintains data consistency
 * 
 * Key improvements:
 * - Smart invalidation: Only marks cache as stale instead of deleting
 * - Optimistic updates: Applies mutations immediately to cache
 * - Fallback to stale data: Returns stale data while refreshing
 * - Prevents data loss on route changes
 */

interface CacheEntry<T> {
    data: T[];
    timestamp: number;
    isStale: boolean;
}

class DataCache {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes (increased from 5)
    private refreshCallbacks: Map<string, Set<() => void>> = new Map();

    /**
     * Get cached data for a collection
     */
    get<T>(collection: string): T[] | null {
        const entry = this.cache.get(collection);

        if (!entry) {
            console.log(`[DataCache] No cache for ${collection}`);
            return null;
        }

        // Check if cache is stale
        const age = Date.now() - entry.timestamp;
        if (age > this.CACHE_DURATION) {
            console.log(`[DataCache] Cache for ${collection} is stale (${age}ms old)`);
            entry.isStale = true;
            return entry.data; // Return stale data but mark as stale
        }

        console.log(`[DataCache] Cache hit for ${collection} (${age}ms old, ${entry.data.length} items)`);
        return entry.data;
    }

    /**
     * Set cached data for a collection
     */
    set<T>(collection: string, data: T[]): void {
        console.log(`[DataCache] Caching ${collection} with ${data.length} items`);
        this.cache.set(collection, {
            data,
            timestamp: Date.now(),
            isStale: false
        });
    }

    /**
     * Check if cache is stale
     */
    isStale(collection: string): boolean {
        const entry = this.cache.get(collection);
        if (!entry) return true;

        const age = Date.now() - entry.timestamp;
        return age > this.CACHE_DURATION;
    }

    /**
     * Mark cache as stale (instead of deleting) to preserve data
     * This allows fallback to stale data while refreshing
     */
    markStale(collection: string): void {
        const entry = this.cache.get(collection);
        if (entry) {
            console.log(`[DataCache] Marking ${collection} as stale (will refresh on next fetch)`);
            entry.isStale = true;
            // Set timestamp to trigger refresh but keep data available
            entry.timestamp = Date.now() - this.CACHE_DURATION - 1000;
        }
    }

    /**
     * Invalidate cache for a collection (hard delete)
     * Use sparingly - prefer markStale() to preserve data
     */
    invalidate(collection: string): void {
        console.log(`[DataCache] Invalidating cache for ${collection}`);
        this.cache.delete(collection);
    }

    /**
     * Invalidate all caches
     */
    invalidateAll(): void {
        console.log(`[DataCache] Invalidating all caches`);
        this.cache.clear();
    }

    /**
     * Apply optimistic update to cached data
     * Immediately updates cache with mutation, preventing data loss
     */
    applyOptimisticUpdate<T>(collection: string, item: T & { id: number | string }): void {
        const entry = this.cache.get(collection);
        if (!entry) return;

        const index = entry.data.findIndex((d: any) => d.id === item.id);
        if (index >= 0) {
            entry.data[index] = item;
            console.log(`[DataCache] Applied optimistic update to ${collection} item ${item.id}`);
        }
    }

    /**
     * Apply optimistic create to cached data
     * Adds new item to cache immediately
     */
    applyOptimisticCreate<T>(collection: string, item: T): void {
        const entry = this.cache.get(collection);
        if (!entry) return;

        entry.data.unshift(item);
        console.log(`[DataCache] Applied optimistic create to ${collection}`);
    }

    /**
     * Apply optimistic delete to cached data
     * Removes item from cache immediately
     */
    applyOptimisticDelete(collection: string, id: number | string): void {
        const entry = this.cache.get(collection);
        if (!entry) return;

        entry.data = entry.data.filter((d: any) => d.id !== id);
        console.log(`[DataCache] Applied optimistic delete to ${collection} item ${id}`);
    }

    /**
     * Register callback to be called when cache is refreshed
     */
    onRefresh(collection: string, callback: () => void): () => void {
        if (!this.refreshCallbacks.has(collection)) {
            this.refreshCallbacks.set(collection, new Set());
        }
        this.refreshCallbacks.get(collection)!.add(callback);

        // Return unsubscribe function
        return () => {
            this.refreshCallbacks.get(collection)?.delete(callback);
        };
    }

    /**
     * Notify all listeners that cache has been refreshed
     */
    notifyRefresh(collection: string): void {
        const callbacks = this.refreshCallbacks.get(collection);
        if (callbacks) {
            callbacks.forEach(cb => cb());
        }
    }

    /**
     * Get cache stats
     */
    getStats(): { collection: string; items: number; age: number; isStale: boolean }[] {
        return Array.from(this.cache.entries()).map(([collection, entry]) => ({
            collection,
            items: entry.data.length,
            age: Date.now() - entry.timestamp,
            isStale: entry.isStale
        }));
    }
}

// Global singleton instance
export const dataCache = new DataCache();
