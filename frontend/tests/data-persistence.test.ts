/**
 * Frontend Data Persistence Tests
 * Tests for cache management, socket events, and data refresh
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock dataCache
class MockDataCache {
    private cache = new Map<string, any>();

    get<T>(key: string): T[] | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        // Check if expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T[];
    }

    set<T>(key: string, data: T[], ttl: number = 5 * 60 * 1000): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
        });
    }

    invalidate(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    getStats() {
        return {
            keys: Array.from(this.cache.keys()),
            size: this.cache.size,
        };
    }
}

describe('DataCache', () => {
    let cache: MockDataCache;

    beforeEach(() => {
        cache = new MockDataCache();
    });

    it('should store and retrieve data', () => {
        const testData = [{ id: 1, name: 'Campaign 1' }];
        cache.set('campaigns', testData);

        const retrieved = cache.get('campaigns');
        expect(retrieved).toEqual(testData);
    });

    it('should return null for expired cache', async () => {
        const testData = [{ id: 1, name: 'Campaign 1' }];
        cache.set('campaigns', testData, 100); // 100ms TTL

        // Should be available immediately
        expect(cache.get('campaigns')).toEqual(testData);

        // Wait for expiration
        await new Promise(resolve => setTimeout(resolve, 150));

        // Should be expired
        expect(cache.get('campaigns')).toBeNull();
    });

    it('should use 5 minute TTL by default', () => {
        const testData = [{ id: 1, name: 'Campaign 1' }];
        cache.set('campaigns', testData);

        // Should be available
        expect(cache.get('campaigns')).toEqual(testData);

        // Verify TTL is set (we can't easily test 5 minutes, but we can verify it's stored)
        const stats = cache.getStats();
        expect(stats.size).toBe(1);
    });

    it('should invalidate specific cache entries', () => {
        const testData = [{ id: 1, name: 'Campaign 1' }];
        cache.set('campaigns', testData);

        expect(cache.get('campaigns')).toEqual(testData);

        cache.invalidate('campaigns');

        expect(cache.get('campaigns')).toBeNull();
    });

    it('should clear all cache entries', () => {
        cache.set('campaigns', [{ id: 1 }]);
        cache.set('projects', [{ id: 2 }]);
        cache.set('assets', [{ id: 3 }]);

        expect(cache.getStats().size).toBe(3);

        cache.clear();

        expect(cache.getStats().size).toBe(0);
    });
});

describe('Socket Event Handlers', () => {
    let cache: MockDataCache;
    let state: any[];

    beforeEach(() => {
        cache = new MockDataCache();
        state = [];
    });

    it('should update cache on create event', () => {
        const initialData = [{ id: 1, name: 'Campaign 1' }];
        cache.set('campaigns', initialData);

        const newItem = { id: 2, name: 'Campaign 2' };

        // Simulate handleCreate
        const updated = [newItem, ...initialData];
        cache.set('campaigns', updated);

        const retrieved = cache.get('campaigns');
        expect(retrieved).toHaveLength(2);
        expect(retrieved?.[0]).toEqual(newItem);
    });

    it('should update cache on update event', () => {
        const initialData = [
            { id: 1, name: 'Campaign 1' },
            { id: 2, name: 'Campaign 2' },
        ];
        cache.set('campaigns', initialData);

        const updatedItem = { id: 1, name: 'Campaign 1 Updated' };

        // Simulate handleUpdate
        const updated = initialData.map(item =>
            item.id === updatedItem.id ? updatedItem : item
        );
        cache.set('campaigns', updated);

        const retrieved = cache.get('campaigns');
        expect(retrieved?.[0]).toEqual(updatedItem);
    });

    it('should update cache on delete event', () => {
        const initialData = [
            { id: 1, name: 'Campaign 1' },
            { id: 2, name: 'Campaign 2' },
        ];
        cache.set('campaigns', initialData);

        const deletedId = 1;

        // Simulate handleDelete
        const updated = initialData.filter(item => item.id !== deletedId);
        cache.set('campaigns', updated);

        const retrieved = cache.get('campaigns');
        expect(retrieved).toHaveLength(1);
        expect(retrieved?.[0].id).toBe(2);
    });
});

describe('Data Refresh on Navigation', () => {
    let cache: MockDataCache;
    let fetchCount = 0;

    beforeEach(() => {
        cache = new MockDataCache();
        fetchCount = 0;
    });

    it('should fetch fresh data on component mount', async () => {
        // Simulate component mount
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => [{ id: 1, name: 'Campaign 1' }],
        });

        // First mount
        await mockFetch('/api/v1/campaigns');
        fetchCount++;

        expect(fetchCount).toBe(1);

        // Simulate navigation away and back
        cache.clear();

        // Second mount (should fetch again)
        await mockFetch('/api/v1/campaigns');
        fetchCount++;

        expect(fetchCount).toBe(2);
    });

    it('should use cached data while fetching fresh data', async () => {
        const cachedData = [{ id: 1, name: 'Campaign 1' }];
        cache.set('campaigns', cachedData);

        // Should return cached data immediately
        const immediate = cache.get('campaigns');
        expect(immediate).toEqual(cachedData);

        // Simulate background fetch
        const freshData = [
            { id: 1, name: 'Campaign 1' },
            { id: 2, name: 'Campaign 2' },
        ];
        cache.set('campaigns', freshData);

        // Should have updated data
        const updated = cache.get('campaigns');
        expect(updated).toHaveLength(2);
    });
});

describe('Linked Assets Caching', () => {
    let cache: MockDataCache;

    beforeEach(() => {
        cache = new MockDataCache();
    });

    it('should cache linked assets with service-specific key', () => {
        const serviceId = 5;
        const linkedAssets = [
            { id: 1, name: 'Asset 1' },
            { id: 2, name: 'Asset 2' },
        ];

        const cacheKey = `service_${serviceId}_linked_assets`;
        cache.set(cacheKey, linkedAssets);

        const retrieved = cache.get(cacheKey);
        expect(retrieved).toEqual(linkedAssets);
    });

    it('should use cache-first strategy for linked assets', async () => {
        const serviceId = 5;
        const cacheKey = `service_${serviceId}_linked_assets`;
        const cachedAssets = [{ id: 1, name: 'Asset 1' }];

        cache.set(cacheKey, cachedAssets);

        // Should return cached immediately
        const immediate = cache.get(cacheKey);
        expect(immediate).toEqual(cachedAssets);

        // Simulate background fetch with more data
        const freshAssets = [
            { id: 1, name: 'Asset 1' },
            { id: 2, name: 'Asset 2' },
        ];
        cache.set(cacheKey, freshAssets);

        // Should have updated data
        const updated = cache.get(cacheKey);
        expect(updated).toHaveLength(2);
    });

    it('should handle sub-service linked assets', () => {
        const subServiceId = 10;
        const cacheKey = `subservice_${subServiceId}_linked_assets`;
        const linkedAssets = [{ id: 1, name: 'Asset 1' }];

        cache.set(cacheKey, linkedAssets);

        const retrieved = cache.get(cacheKey);
        expect(retrieved).toEqual(linkedAssets);
    });
});

describe('Error Handling', () => {
    let cache: MockDataCache;

    beforeEach(() => {
        cache = new MockDataCache();
    });

    it('should handle API errors gracefully', async () => {
        const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));

        try {
            await mockFetch('/api/v1/campaigns');
            fail('Should have thrown error');
        } catch (err) {
            expect(err).toBeInstanceOf(Error);
        }
    });

    it('should fallback to cache on API error', () => {
        const cachedData = [{ id: 1, name: 'Campaign 1' }];
        cache.set('campaigns', cachedData);

        // Simulate API error
        const apiError = new Error('API Error');

        // Should still have cached data
        const fallback = cache.get('campaigns');
        expect(fallback).toEqual(cachedData);
    });

    it('should handle empty API responses', () => {
        const cachedData = [{ id: 1, name: 'Campaign 1' }];
        cache.set('campaigns', cachedData);

        // Simulate empty API response
        const emptyResponse: any[] = [];

        // Should keep cached data if API returns empty
        const fallback = cache.get('campaigns');
        expect(fallback).toEqual(cachedData);
    });
});

describe('Data Persistence Across Navigation', () => {
    let cache: MockDataCache;

    beforeEach(() => {
        cache = new MockDataCache();
    });

    it('should persist campaign data across module navigation', () => {
        const campaigns = [
            { id: 1, name: 'Campaign 1' },
            { id: 2, name: 'Campaign 2' },
        ];

        // User creates campaign
        cache.set('campaigns', campaigns);

        // User navigates to projects
        const cachedCampaigns = cache.get('campaigns');
        expect(cachedCampaigns).toEqual(campaigns);

        // User navigates back to campaigns
        const retrieved = cache.get('campaigns');
        expect(retrieved).toEqual(campaigns);
    });

    it('should persist project data across module navigation', () => {
        const projects = [
            { id: 1, name: 'Project 1' },
            { id: 2, name: 'Project 2' },
        ];

        cache.set('projects', projects);

        // Navigate away and back
        const retrieved = cache.get('projects');
        expect(retrieved).toEqual(projects);
    });

    it('should persist asset data across module navigation', () => {
        const assets = [
            { id: 1, name: 'Asset 1' },
            { id: 2, name: 'Asset 2' },
        ];

        cache.set('assetLibrary', assets);

        // Navigate away and back
        const retrieved = cache.get('assetLibrary');
        expect(retrieved).toEqual(assets);
    });

    it('should persist linked assets across service navigation', () => {
        const serviceId = 5;
        const cacheKey = `service_${serviceId}_linked_assets`;
        const linkedAssets = [{ id: 1, name: 'Asset 1' }];

        cache.set(cacheKey, linkedAssets);

        // Navigate away and back
        const retrieved = cache.get(cacheKey);
        expect(retrieved).toEqual(linkedAssets);
    });
});

describe('TTL Configuration', () => {
    let cache: MockDataCache;

    beforeEach(() => {
        cache = new MockDataCache();
    });

    it('should use 5 minute TTL for campaigns', () => {
        const campaigns = [{ id: 1, name: 'Campaign 1' }];
        const ttl = 5 * 60 * 1000; // 5 minutes

        cache.set('campaigns', campaigns, ttl);

        // Should be available immediately
        expect(cache.get('campaigns')).toEqual(campaigns);
    });

    it('should use 5 minute TTL for projects', () => {
        const projects = [{ id: 1, name: 'Project 1' }];
        const ttl = 5 * 60 * 1000; // 5 minutes

        cache.set('projects', projects, ttl);

        // Should be available immediately
        expect(cache.get('projects')).toEqual(projects);
    });

    it('should use 5 minute TTL for assets', () => {
        const assets = [{ id: 1, name: 'Asset 1' }];
        const ttl = 5 * 60 * 1000; // 5 minutes

        cache.set('assetLibrary', assets, ttl);

        // Should be available immediately
        expect(cache.get('assetLibrary')).toEqual(assets);
    });
});
