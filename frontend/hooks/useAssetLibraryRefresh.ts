import { useCallback } from 'react';
import { useData } from './useData';

/**
 * Hook to manage asset library refresh after QC operations
 * Ensures asset library data is updated when QC status changes
 */
export function useAssetLibraryRefresh() {
    const { refresh } = useData('assetLibrary');

    const refreshAssetLibrary = useCallback(async () => {
        // Refresh asset library data
        refresh();
    }, [refresh]);

    return { refreshAssetLibrary };
}
