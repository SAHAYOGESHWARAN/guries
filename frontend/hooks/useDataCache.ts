/**
 * Global Data Cache for useData Hook
 * Provides centralized caching and invalidation
 */

interface CacheEntry<T> {
    data: T[];
    timestamp: number;
    ttl: number; // Time to live in milliseconds
}

class DataCache {
    private cache = new Map<string, CacheEntry<any>>();
    private readonly DEFAULT_TTL = 2 * 60 * 1000; // 2 minutes
    private readonly COLLECTION_TTL: Record<string, number> = {
        'campaigns': 2 * 60 * 1000, // 2 minutes
        'projects': 2 * 60 * 1000, // 2 minutes
        'tasks': 2 * 60 * 1000, // 2 minutes
        'content': 2 * 60 * 1000, // 2 minutes
        'assetLibrary': 2 * 60 * 1000, // 2 minutes for assets
    };
    private invalidationListeners = new Map<string, Set<() => void>>();

    /**
     * Get cached data
     */
    get<T>(key: string): T[] | null {
        const entry = this.cache.get(key);
        if (!entry) return null;
        // NOTE: We intentionally return cached data even if it's stale/expired.
        // Staleness is tracked separately via `isStale()` so callers (like `useData`)
        // can show cached data while fetching a refresh, which prevents "data disappears
        // on navigation" and supports optimistic updates on stale caches.
        return entry.data as T[];
    }

    /**
     * Set cached data
     */
    set<T>(key: string, data: T[], ttl?: number): void {
        // Use collection-specific TTL if available, otherwise use provided TTL or default
        const finalTtl = ttl ?? (this.COLLECTION_TTL[key] || this.DEFAULT_TTL);
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: finalTtl
        });
    }

    /**
     * Invalidate cache for a specific key
     */
    invalidate(key: string): void {
        this.cache.delete(key);
        this.notifyListeners(key);
    }

    /**
     * Invalidate all caches
     */
    invalidateAll(): void {
        this.cache.clear();
        for (const listeners of this.invalidationListeners.values()) {
            listeners.forEach(listener => listener());
        }
    }

    /**
     * Subscribe to cache invalidation events
     */
    onInvalidate(key: string, callback: () => void): () => void {
        if (!this.invalidationListeners.has(key)) {
            this.invalidationListeners.set(key, new Set());
        }
        this.invalidationListeners.get(key)!.add(callback);

        // Return unsubscribe function
        return () => {
            this.invalidationListeners.get(key)?.delete(callback);
        };
    }

    /**
     * Notify listeners of invalidation
     */
    private notifyListeners(key: string): void {
        const listeners = this.invalidationListeners.get(key);
        if (listeners) {
            listeners.forEach(listener => listener());
        }
    }

    /**
     * Mark cache as stale (needs refresh)
     */
    markStale(key: string): void {
        const entry = this.cache.get(key);
        if (entry) {
            // Set timestamp to past to force refresh on next get
            entry.timestamp = Date.now() - entry.ttl - 1;
        } else {
            // If cache doesn't exist, create a stale entry to force fetch
            this.cache.set(key, {
                data: [],
                timestamp: Date.now() - (this.COLLECTION_TTL[key] || this.DEFAULT_TTL) - 1,
                ttl: this.COLLECTION_TTL[key] || this.DEFAULT_TTL
            });
        }
    }

    /**
     * Check if cache is stale
     */
    isStale(key: string): boolean {
        const entry = this.cache.get(key);
        if (!entry) return true;
        return Date.now() - entry.timestamp > entry.ttl;
    }

    /**
     * Apply optimistic create operation
     */
    applyOptimisticCreate<T extends { id: any }>(key: string, item: T): void {
        const current = this.get<T>(key) || [];
        this.set(key, [item, ...current]);
    }

    /**
     * Apply optimistic update operation
     */
    applyOptimisticUpdate<T extends { id: any }>(key: string, item: T): void {
        const current = this.get<T>(key) || [];
        const updated = current.map(existing => existing.id === item.id ? item : existing);
        this.set(key, updated);
    }

    /**
     * Apply optimistic delete operation
     */
    applyOptimisticDelete<T extends { id: any }>(key: string, id: any): void {
        const current = this.get<T>(key) || [];
        const updated = current.filter(item => item.id !== id);
        this.set(key, updated);
    }

    /**
     * Get cache stats
     */
    getStats(): { keys: string[]; size: number } {
        return {
            keys: Array.from(this.cache.keys()),
            size: this.cache.size
        };
    }

    /**
     * Force refresh a collection by marking it stale and clearing it
     */
    forceRefresh(key: string): void {
        this.cache.delete(key);
        this.notifyListeners(key);
    }

    /**
     * Clear all caches and listeners
     */
    clear(): void {
        this.cache.clear();
        this.invalidationListeners.clear();
    }
}

// Export singleton instance
export const dataCache = new DataCache();

/**
 * Hook to subscribe to cache invalidation
 */
export function useCacheInvalidation(key: string, callback: () => void) {
    React.useEffect(() => {
        return dataCache.onInvalidate(key, callback);
    }, [key, callback]);
}

// Import React for the hook
import React from 'react';
