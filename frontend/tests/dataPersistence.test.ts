/**
 * Data Persistence Test Suite
 * Tests for cache invalidation, data refresh, and navigation flows
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { dataCache } from '../hooks/useDataCache';

describe('DataCache - Cache Invalidation & Freshness', () => {
    beforeEach(() => {
        dataCache.clear();
    });

    describe('markStale() - Enhanced Implementation', () => {
        test('should mark existing cache entry as stale', () => {
            // Setup: Create a cache entry
            const testData = [{ id: 1, name: 'Test' }];
            dataCache.set('projects', testData);

            // Verify cache is fresh
            expect(dataCache.isStale('projects')).toBe(false);

            // Mark as stale
            dataCache.markStale('projects');

            // Verify cache is now stale
            expect(dataCache.isStale('projects')).toBe(true);
        });

        test('should create stale entry if cache does not exist', () => {
            // Verify cache doesn't exist
            expect(dataCache.get('campaigns')).toBeNull();

            // Mark as stale (should create entry)
            dataCache.markStale('campaigns');

            // Verify stale entry was created
            expect(dataCache.isStale('campaigns')).toBe(true);
            // get() returns cached data even when stale; markStale creates an empty entry
            expect(dataCache.get('campaigns')).toEqual([]);
        });

        test('should handle multiple collections being marked stale', () => {
            const collections = ['projects', 'campaigns', 'tasks', 'content', 'assetLibrary'];

            // Mark all as stale
            collections.forEach(col => dataCache.markStale(col));

            // Verify all are stale
            collections.forEach(col => {
                expect(dataCache.isStale(col)).toBe(true);
            });
        });
    });

    describe('forceRefresh() - New Method', () => {
        test('should completely clear cache for a collection', () => {
            // Setup: Create cache entry
            const testData = [{ id: 1, name: 'Test' }];
            dataCache.set('projects', testData);
            expect(dataCache.get('projects')).not.toBeNull();

            // Force refresh
            dataCache.forceRefresh('projects');

            // Verify cache is cleared
            expect(dataCache.get('projects')).toBeNull();
            expect(dataCache.isStale('projects')).toBe(true);
        });

        test('should notify listeners on force refresh', () => {
            const callback = vi.fn();
            dataCache.onInvalidate('projects', callback);

            dataCache.forceRefresh('projects');

            expect(callback).toHaveBeenCalled();
        });
    });

    describe('Cache Freshness Checking', () => {
        test('should identify fresh cache correctly', () => {
            const testData = [{ id: 1, name: 'Test' }];
            dataCache.set('projects', testData);

            expect(dataCache.isStale('projects')).toBe(false);
            expect(dataCache.get('projects')).toEqual(testData);
        });

        test('should identify stale cache correctly after TTL expires', () => {
            vi.useFakeTimers();
            const testData = [{ id: 1, name: 'Test' }];
            dataCache.set('projects', testData, 100); // 100ms TTL

            expect(dataCache.isStale('projects')).toBe(false);

            vi.advanceTimersByTime(150);
            expect(dataCache.isStale('projects')).toBe(true);
            // get() still returns cached data even if stale
            expect(dataCache.get('projects')).toEqual(testData);
            vi.useRealTimers();
        });

        test('should handle non-existent cache as stale', () => {
            expect(dataCache.isStale('nonexistent')).toBe(true);
            expect(dataCache.get('nonexistent')).toBeNull();
        });
    });

    describe('Optimistic Operations', () => {
        test('should apply optimistic create', () => {
            const existing = [{ id: 1, name: 'Existing' }];
            dataCache.set('projects', existing);

            const newItem = { id: 2, name: 'New' };
            dataCache.applyOptimisticCreate('projects', newItem);

            const result = dataCache.get('projects');
            expect(result).toHaveLength(2);
            expect(result?.[0]).toEqual(newItem); // New item should be first
            expect(result?.[1]).toEqual(existing[0]);
        });

        test('should apply optimistic update', () => {
            const existing = [{ id: 1, name: 'Old' }];
            dataCache.set('projects', existing);

            const updated = { id: 1, name: 'Updated' };
            dataCache.applyOptimisticUpdate('projects', updated);

            const result = dataCache.get('projects');
            expect(result).toHaveLength(1);
            expect(result?.[0]).toEqual(updated);
        });

        test('should apply optimistic delete', () => {
            const existing = [
                { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }
            ];
            dataCache.set('projects', existing);

            dataCache.applyOptimisticDelete('projects', 1);

            const result = dataCache.get('projects');
            expect(result).toHaveLength(1);
            expect(result?.[0].id).toBe(2);
        });
    });

    describe('Cache Statistics', () => {
        test('should track cache size correctly', () => {
            expect(dataCache.getStats().size).toBe(0);

            dataCache.set('projects', [{ id: 1 }]);
            expect(dataCache.getStats().size).toBe(1);

            dataCache.set('campaigns', [{ id: 1 }]);
            expect(dataCache.getStats().size).toBe(2);

            dataCache.invalidate('projects');
            expect(dataCache.getStats().size).toBe(1);
        });

        test('should list all cached keys', () => {
            dataCache.set('projects', [{ id: 1 }]);
            dataCache.set('campaigns', [{ id: 1 }]);
            dataCache.set('tasks', [{ id: 1 }]);

            const stats = dataCache.getStats();
            expect(stats.keys).toContain('projects');
            expect(stats.keys).toContain('campaigns');
            expect(stats.keys).toContain('tasks');
            expect(stats.keys).toHaveLength(3);
        });
    });

    describe('Invalidation Listeners', () => {
        test('should notify listeners on invalidation', () => {
            const callback = vi.fn();
            dataCache.onInvalidate('projects', callback);

            dataCache.invalidate('projects');

            expect(callback).toHaveBeenCalled();
        });

        test('should support multiple listeners', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            dataCache.onInvalidate('projects', callback1);
            dataCache.onInvalidate('projects', callback2);

            dataCache.invalidate('projects');

            expect(callback1).toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
        });

        test('should allow unsubscribing from listeners', () => {
            const callback = vi.fn();
            const unsubscribe = dataCache.onInvalidate('projects', callback);

            unsubscribe();
            dataCache.invalidate('projects');

            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe('Collection-Specific TTLs', () => {
        test('should use collection-specific TTL for campaigns', () => {
            vi.useFakeTimers();
            const testData = [{ id: 1, name: 'Campaign' }];
            dataCache.set('campaigns', testData);

            expect(dataCache.isStale('campaigns')).toBe(false);

            // Wait for 2 minutes + 1 second (campaigns TTL is 2 minutes)
            vi.advanceTimersByTime(121000);
            expect(dataCache.isStale('campaigns')).toBe(true);
            vi.useRealTimers();
        });

        test('should use default TTL for unknown collections', () => {
            vi.useFakeTimers();
            const testData = [{ id: 1, name: 'Unknown' }];
            dataCache.set('unknownCollection', testData);

            expect(dataCache.isStale('unknownCollection')).toBe(false);

            // Wait for default TTL (2 minutes) + 1 second
            vi.advanceTimersByTime(121000);
            expect(dataCache.isStale('unknownCollection')).toBe(true);
            vi.useRealTimers();
        });
    });

    describe('Clear All', () => {
        test('should clear all caches and listeners', () => {
            dataCache.set('projects', [{ id: 1 }]);
            dataCache.set('campaigns', [{ id: 1 }]);

            const callback = vi.fn();
            dataCache.onInvalidate('projects', callback);

            dataCache.clear();

            expect(dataCache.getStats().size).toBe(0);
            expect(dataCache.get('projects')).toBeNull();
            expect(dataCache.get('campaigns')).toBeNull();
        });
    });
});

describe('Navigation & Cache Invalidation Flow', () => {
    beforeEach(() => {
        dataCache.clear();
    });

    test('should invalidate all collections on navigation', () => {
        const collectionsToInvalidate = [
            'campaigns', 'projects', 'tasks', 'content', 'assetLibrary',
            'users', 'brands', 'services', 'subServices', 'keywords'
        ];

        // Setup: Create cache entries for all collections
        collectionsToInvalidate.forEach(col => {
            dataCache.set(col, [{ id: 1, name: col }]);
        });

        // Verify all are fresh
        collectionsToInvalidate.forEach(col => {
            expect(dataCache.isStale(col)).toBe(false);
        });

        // Simulate navigation: mark all as stale
        collectionsToInvalidate.forEach(col => {
            dataCache.markStale(col);
        });

        // Verify all are now stale
        collectionsToInvalidate.forEach(col => {
            expect(dataCache.isStale(col)).toBe(true);
        });
    });

    test('should handle navigation with empty cache', () => {
        const collectionsToInvalidate = ['campaigns', 'projects', 'tasks'];

        // Simulate navigation without any cached data
        collectionsToInvalidate.forEach(col => {
            dataCache.markStale(col);
        });

        // Verify all are marked as stale (even though they didn't exist)
        collectionsToInvalidate.forEach(col => {
            expect(dataCache.isStale(col)).toBe(true);
        });
    });

    test('should handle rapid navigation', () => {
        const collections = ['projects', 'campaigns', 'tasks'];

        // First navigation
        collections.forEach(col => dataCache.markStale(col));
        expect(dataCache.isStale('projects')).toBe(true);

        // Add some data
        dataCache.set('projects', [{ id: 1 }]);
        expect(dataCache.isStale('projects')).toBe(false);

        // Second navigation
        collections.forEach(col => dataCache.markStale(col));
        expect(dataCache.isStale('projects')).toBe(true);
    });
});

describe('Data Consistency Across Operations', () => {
    beforeEach(() => {
        dataCache.clear();
    });

    test('should maintain consistency after create, update, delete', () => {
        const initialData = [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' }
        ];

        dataCache.set('projects', initialData);

        // Create
        const newItem = { id: 3, name: 'Item 3' };
        dataCache.applyOptimisticCreate('projects', newItem);
        let result = dataCache.get('projects');
        expect(result).toHaveLength(3);

        // Update
        const updated = { id: 1, name: 'Updated Item 1' };
        dataCache.applyOptimisticUpdate('projects', updated);
        result = dataCache.get('projects');
        expect(result?.find(i => i.id === 1)?.name).toBe('Updated Item 1');

        // Delete
        dataCache.applyOptimisticDelete('projects', 2);
        result = dataCache.get('projects');
        expect(result).toHaveLength(2);
        expect(result?.find(i => i.id === 2)).toBeUndefined();
    });

    test('should handle concurrent operations', () => {
        const initialData = [{ id: 1, name: 'Item 1' }];
        dataCache.set('projects', initialData);

        // Simulate concurrent operations
        dataCache.applyOptimisticCreate('projects', { id: 2, name: 'Item 2' });
        dataCache.applyOptimisticCreate('projects', { id: 3, name: 'Item 3' });
        dataCache.applyOptimisticUpdate('projects', { id: 1, name: 'Updated' });

        const result = dataCache.get('projects');
        expect(result).toHaveLength(3);
        expect(result?.find(i => i.id === 1)?.name).toBe('Updated');
    });
});
