import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to automatically refresh data at regular intervals
 * Useful for keeping asset library and other data in sync
 * Aggressive refresh for real-time updates
 */
export function useAutoRefresh(
    refreshCallback: () => void,
    intervalMs: number = 3000, // Default 3 seconds for faster updates
    enabled: boolean = true
) {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isRefreshingRef = useRef(false);
    const refreshCallbackRef = useRef(refreshCallback);

    // Keep callback ref in sync
    useEffect(() => {
        refreshCallbackRef.current = refreshCallback;
    }, [refreshCallback]);

    useEffect(() => {
        if (!enabled) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Call refresh immediately on mount
        if (!isRefreshingRef.current) {
            isRefreshingRef.current = true;
            refreshCallbackRef.current();
            // Reset flag after callback completes
            setTimeout(() => {
                isRefreshingRef.current = false;
            }, 100);
        }

        // Set up interval for auto-refresh
        intervalRef.current = setInterval(() => {
            if (!isRefreshingRef.current) {
                isRefreshingRef.current = true;
                refreshCallbackRef.current();
                // Reset flag after callback completes
                setTimeout(() => {
                    isRefreshingRef.current = false;
                }, 100);
            }
        }, intervalMs);

        // Cleanup on unmount or when disabled
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [intervalMs, enabled]);

    // Function to manually stop auto-refresh
    const stopAutoRefresh = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Function to manually start auto-refresh
    const startAutoRefresh = useCallback(() => {
        if (!intervalRef.current && enabled) {
            if (!isRefreshingRef.current) {
                isRefreshingRef.current = true;
                refreshCallbackRef.current();
                setTimeout(() => {
                    isRefreshingRef.current = false;
                }, 100);
            }
            intervalRef.current = setInterval(() => {
                if (!isRefreshingRef.current) {
                    isRefreshingRef.current = true;
                    refreshCallbackRef.current();
                    setTimeout(() => {
                        isRefreshingRef.current = false;
                    }, 100);
                }
            }, intervalMs);
        }
    }, [enabled, intervalMs]);

    return { stopAutoRefresh, startAutoRefresh };
}
