import { useEffect } from 'react';
import { dataCache } from './useDataCache';

/**
 * Hook to refresh data when cache becomes stale
 * Triggers a refresh when navigating to a page if cache is stale
 */
export function useCacheRefresh(collection: string, onRefresh: () => void) {
    useEffect(() => {
        // Check if cache is stale and trigger refresh if needed
        if (dataCache.isStale(collection)) {
            console.log(`[useCacheRefresh] Cache is stale for ${collection}, triggering refresh`);
            onRefresh();
        }
    }, [collection, onRefresh]);
}

/**
 * Hook to invalidate cache for a collection
 * Useful when you know data has changed and need to force a refresh
 */
export function useInvalidateCache(collection: string) {
    return () => {
        console.log(`[useInvalidateCache] Invalidating cache for ${collection}`);
        dataCache.invalidate(collection);
    };
}

/**
 * Hook to subscribe to cache invalidation events
 * Useful for components that need to react to cache changes
 */
export function useOnCacheInvalidate(collection: string, callback: () => void) {
    useEffect(() => {
        const unsubscribe = dataCache.onInvalidate(collection, callback);
        return unsubscribe;
    }, [collection, callback]);
}
