import { useCallback, useEffect, useState } from 'react';
import { dataCache } from './useDataCache';

/**
 * Hook for managing cache refresh and monitoring
 * Provides utilities for components to refresh specific collections
 * and monitor cache staleness
 */

interface UseCacheRefreshOptions {
    collection: string;
    autoRefreshInterval?: number; // ms, 0 to disable
}

export const useCacheRefresh = (options: UseCacheRefreshOptions) => {
    const { collection, autoRefreshInterval = 0 } = options;
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isCacheStale, setIsCacheStale] = useState(false);

    // Check if cache is stale
    useEffect(() => {
        const checkStale = () => {
            setIsCacheStale(dataCache.isStale(collection));
        };

        checkStale();

        // Check periodically
        const interval = setInterval(checkStale, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, [collection]);

    // Auto-refresh if interval is set
    useEffect(() => {
        if (autoRefreshInterval <= 0) return;

        const interval = setInterval(() => {
            if (dataCache.isStale(collection)) {
                dataCache.markStale(collection);
            }
        }, autoRefreshInterval);

        return () => clearInterval(interval);
    }, [collection, autoRefreshInterval]);

    // Manual refresh trigger
    const refresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            dataCache.markStale(collection);
            // Give time for background refresh to start
            await new Promise(resolve => setTimeout(resolve, 100));
        } finally {
            setIsRefreshing(false);
        }
    }, [collection]);

    // Get cache stats for this collection
    const getCacheStats = useCallback(() => {
        const stats = dataCache.getStats();
        return stats.find(s => s.collection === collection);
    }, [collection]);

    return {
        isCacheStale,
        isRefreshing,
        refresh,
        getCacheStats,
    };
};

/**
 * Hook for monitoring multiple collections
 */
export const useMultipleCacheRefresh = (collections: string[]) => {
    const [staleCollections, setStaleCollections] = useState<Set<string>>(new Set());

    useEffect(() => {
        const checkStale = () => {
            const stale = new Set<string>();
            collections.forEach(collection => {
                if (dataCache.isStale(collection)) {
                    stale.add(collection);
                }
            });
            setStaleCollections(stale);
        };

        checkStale();
        const interval = setInterval(checkStale, 5000);
        return () => clearInterval(interval);
    }, [collections]);

    const refreshAll = useCallback(async () => {
        collections.forEach(collection => {
            dataCache.markStale(collection);
        });
        await new Promise(resolve => setTimeout(resolve, 100));
    }, [collections]);

    const refreshCollection = useCallback((collection: string) => {
        dataCache.markStale(collection);
    }, []);

    return {
        staleCollections,
        refreshAll,
        refreshCollection,
        hasStaleData: staleCollections.size > 0,
    };
};
