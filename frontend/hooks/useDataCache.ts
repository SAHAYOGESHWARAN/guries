/**
 * Global Data Cache
 * Persists fetched data across route changes and component remounts
 * Prevents unnecessary API calls and maintains data consistency
 */

interface CacheEntry<T> {
    data: T[];
    timestamp: number;
    isStale: boolean;
}

class DataCache {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
     * Invalidate cache for a collection
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
