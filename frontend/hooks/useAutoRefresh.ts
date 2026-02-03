import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to automatically refresh data at regular intervals
 * Useful for keeping asset library and other data in sync
 * Optimized to prevent excessive API calls
 */
export function useAutoRefresh(
    refreshCallback: () => void,
    intervalMs: number = 10000, // Default 10 seconds (increased from 5s)
    enabled: boolean = true
) {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastRefreshRef = useRef<number>(0);

    useEffect(() => {
        if (!enabled) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Set up interval for auto-refresh
        intervalRef.current = setInterval(() => {
            const now = Date.now();
            // Only refresh if enough time has passed since last refresh
            if (now - lastRefreshRef.current >= intervalMs) {
                lastRefreshRef.current = now;
                refreshCallback();
            }
        }, intervalMs);

        // Cleanup on unmount or when disabled
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [refreshCallback, intervalMs, enabled]);

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
            intervalRef.current = setInterval(() => {
                const now = Date.now();
                if (now - lastRefreshRef.current >= intervalMs) {
                    lastRefreshRef.current = now;
                    refreshCallback();
                }
            }, intervalMs);
        }
    }, [enabled, intervalMs, refreshCallback]);

    return { stopAutoRefresh, startAutoRefresh };
}
