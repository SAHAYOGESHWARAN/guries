import React, { createContext, useContext, useCallback } from 'react';
import { dataCache } from '../hooks/useDataCache';

/**
 * DataContext provides global data management and cache control
 * Enables components to access cache status and trigger refreshes
 */

interface DataContextType {
    // Cache management
    getCacheStats: () => Array<{ collection: string; items: number; age: number; isStale: boolean }>;
    clearCache: (collection?: string) => void;
    refreshCollection: (collection: string) => Promise<void>;

    // Cache status
    isCacheStale: (collection: string) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const getCacheStats = useCallback(() => {
        return dataCache.getStats();
    }, []);

    const clearCache = useCallback((collection?: string) => {
        if (collection) {
            dataCache.invalidate(collection);
            console.log(`[DataContext] Cleared cache for ${collection}`);
        } else {
            dataCache.invalidateAll();
            console.log('[DataContext] Cleared all caches');
        }
    }, []);

    const refreshCollection = useCallback(async (collection: string) => {
        // Mark as stale to trigger refresh on next fetch
        dataCache.markStale(collection);
        console.log(`[DataContext] Marked ${collection} as stale for refresh`);
    }, []);

    const isCacheStale = useCallback((collection: string) => {
        return dataCache.isStale(collection);
    }, []);

    const value: DataContextType = {
        getCacheStats,
        clearCache,
        refreshCollection,
        isCacheStale,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

/**
 * Hook to use DataContext
 * Provides access to cache management functions
 */
export const useDataContext = (): DataContextType => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useDataContext must be used within DataProvider');
    }
    return context;
};
