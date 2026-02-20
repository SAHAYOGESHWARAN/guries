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
    private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
    private invalidationListeners = new Map<string, Set<() => void>>();

    /**
     * Get cached data
     */
    get<T>(key: string): T[] | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        // Check if cache has expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T[];
    }

    /**
     * Set cached data
     */
    set<T>(key: string, data: T[], ttl = this.DEFAULT_TTL): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
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
