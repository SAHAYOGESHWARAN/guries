import { useEffect, useRef } from 'react';

/**
 * Hook to automatically refresh data at regular intervals
 * Useful for keeping asset library and other data in sync
 */
export function useAutoRefresh(
    refreshCallback: () => void,
    intervalMs: number = 5000, // Default 5 seconds
    enabled: boolean = true
) {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!enabled) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Initial refresh
        refreshCallback();

        // Set up interval for auto-refresh
        intervalRef.current = setInterval(() => {
            refreshCallback();
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
    const stopAutoRefresh = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    // Function to manually start auto-refresh
    const startAutoRefresh = () => {
        if (!intervalRef.current && enabled) {
            refreshCallback();
            intervalRef.current = setInterval(() => {
                refreshCallback();
            }, intervalMs);
        }
    };

    return { stopAutoRefresh, startAutoRefresh };
}
