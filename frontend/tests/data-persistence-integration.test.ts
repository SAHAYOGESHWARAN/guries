/**
 * Integration tests for data persistence across route changes
 * Tests the complete flow of data caching and retrieval
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dataCache } from '../hooks/useDataCache';

describe('Data Persistence Integration Tests', () => {
    beforeEach(() => {
        // Clear cache before each test
        dataCache.invalidateAll();
    });

    describe('Cache Persistence Across Route Changes', () => {
        it('should preserve project data when navigating away and back', () => {
            // Simulate: User views Projects
            const projects = [
                { id: 1, name: 'Project A', status: 'Active' },
                { id: 2, name: 'Project B', status: 'Planned' },
            ];
            dataCache.set('projects', projects);

            // Verify cache is populated
            expect(dataCache.get('projects')).toEqual(projects);

            // Simulate: User navigates to Campaigns
            // (component unmounts, cache persists)

            // Simulate: User navigates back to Projects
            const cachedProjects = dataCache.get('projects');

            // Verify data is still available
            expect(cachedProjects).toEqual(projects);
            expect(cachedProjects?.length).toBe(2);
        });

        it('should preserve multiple collections simultaneously', () => {
            const projects = [{ id: 1, name: 'Project A' }];
            const campaigns = [{ id: 1, name: 'Campaign A' }];
            const tasks = [{ id: 1, name: 'Task A' }];

            dataCache.set('projects', projects);
            dataCache.set('campaigns', campaigns);
            dataCache.set('tasks', tasks);

            // Navigate away and back
            expect(dataCache.get('projects')).toEqual(projects);
            expect(dataCache.get('campaigns')).toEqual(campaigns);
            expect(dataCache.get('tasks')).toEqual(tasks);
        });
    });

    describe('Optimistic Updates', () => {
        it('should apply optimistic create without deleting cache', () => {
            const initialProjects = [
                { id: 1, name: 'Project A' },
                { id: 2, name: 'Project B' },
            ];
            dataCache.set('projects', initialProjects);

            const newProject = { id: 3, name: 'Project C' };
            dataCache.applyOptimisticCreate('projects', newProject);

            const updated = dataCache.get('projects');
            expect(updated).toHaveLength(3);
            expect(updated?.[0]).toEqual(newProject); // New item at front
            // Verify original items are preserved (order may vary)
            const ids = updated?.map(p => p.id) || [];
            expect(ids).toContain(1);
            expect(ids).toContain(2);
            expect(ids).toContain(3);
        });

        it('should apply optimistic update without deleting cache', () => {
            const projects = [
                { id: 1, name: 'Project A', status: 'Active' },
                { id: 2, name: 'Project B', status: 'Planned' },
            ];
            dataCache.set('projects', projects);

            const updated = { id: 1, name: 'Project A', status: 'Completed' };
            dataCache.applyOptimisticUpdate('projects', updated);

            const cached = dataCache.get('projects');
            expect(cached?.[0]).toEqual(updated);
            expect(cached?.[1]).toEqual(projects[1]); // Other items preserved
        });

        it('should apply optimistic delete without deleting cache', () => {
            const projects = [
                { id: 1, name: 'Project A' },
                { id: 2, name: 'Project B' },
                { id: 3, name: 'Project C' },
            ];
            dataCache.set('projects', projects);

            dataCache.applyOptimisticDelete('projects', 2);

            const cached = dataCache.get('projects');
            expect(cached).toHaveLength(2);
            expect(cached?.map(p => p.id)).toEqual([1, 3]);
        });
    });

    describe('Cache Staleness', () => {
        it('should mark cache as stale without deleting data', () => {
            const projects = [{ id: 1, name: 'Project A' }];
            dataCache.set('projects', projects);

            dataCache.markStale('projects');

            // Data should still be available
            expect(dataCache.get('projects')).toEqual(projects);
            // But marked as stale
            expect(dataCache.isStale('projects')).toBe(true);
        });

        it('should return stale data while refreshing', () => {
            const projects = [{ id: 1, name: 'Project A' }];
            dataCache.set('projects', projects);

            // Wait for cache to become stale (simulated by marking)
            dataCache.markStale('projects');

            // Should still return data
            const cached = dataCache.get('projects');
            expect(cached).toEqual(projects);
        });
    });

    describe('Cache Statistics', () => {
        it('should track cache stats correctly', () => {
            const projects = [{ id: 1 }, { id: 2 }];
            const campaigns = [{ id: 1 }];

            dataCache.set('projects', projects);
            dataCache.set('campaigns', campaigns);

            const stats = dataCache.getStats();
            expect(stats).toHaveLength(2);

            const projectStats = stats.find(s => s.collection === 'projects');
            expect(projectStats?.items).toBe(2);
            expect(projectStats?.isStale).toBe(false);

            const campaignStats = stats.find(s => s.collection === 'campaigns');
            expect(campaignStats?.items).toBe(1);
        });

        it('should show age of cached data', () => {
            const projects = [{ id: 1 }];
            dataCache.set('projects', projects);

            const stats = dataCache.getStats();
            const projectStats = stats.find(s => s.collection === 'projects');

            expect(projectStats?.age).toBeGreaterThanOrEqual(0);
            expect(projectStats?.age).toBeLessThan(100); // Should be very recent
        });
    });

    describe('Cache Invalidation', () => {
        it('should invalidate specific collection', () => {
            const projects = [{ id: 1 }];
            const campaigns = [{ id: 1 }];

            dataCache.set('projects', projects);
            dataCache.set('campaigns', campaigns);

            dataCache.invalidate('projects');

            expect(dataCache.get('projects')).toBeNull();
            expect(dataCache.get('campaigns')).toEqual(campaigns); // Other collections unaffected
        });

        it('should invalidate all collections', () => {
            dataCache.set('projects', [{ id: 1 }]);
            dataCache.set('campaigns', [{ id: 1 }]);
            dataCache.set('tasks', [{ id: 1 }]);

            dataCache.invalidateAll();

            expect(dataCache.get('projects')).toBeNull();
            expect(dataCache.get('campaigns')).toBeNull();
            expect(dataCache.get('tasks')).toBeNull();
        });
    });

    describe('Data Consistency', () => {
        it('should maintain data consistency across mutations', () => {
            const projects = [
                { id: 1, name: 'Project A', status: 'Active' },
                { id: 2, name: 'Project B', status: 'Planned' },
            ];
            dataCache.set('projects', projects);

            // Create
            dataCache.applyOptimisticCreate('projects', { id: 3, name: 'Project C' });
            expect(dataCache.get('projects')).toHaveLength(3);

            // Update
            dataCache.applyOptimisticUpdate('projects', { id: 1, name: 'Project A Updated', status: 'Completed' });
            const updated = dataCache.get('projects');
            expect(updated?.find(p => p.id === 1)?.name).toBe('Project A Updated');

            // Delete
            dataCache.applyOptimisticDelete('projects', 2);
            expect(dataCache.get('projects')).toHaveLength(2);

            // Verify all operations preserved data
            expect(dataCache.get('projects')).not.toBeNull();
        });

        it('should handle rapid mutations without data loss', () => {
            const projects = [{ id: 1, name: 'Project A' }];
            dataCache.set('projects', projects);

            // Rapid mutations
            for (let i = 2; i <= 10; i++) {
                dataCache.applyOptimisticCreate('projects', { id: i, name: `Project ${String.fromCharCode(64 + i)}` });
            }

            const cached = dataCache.get('projects');
            expect(cached).toHaveLength(10);
            expect(cached?.[0].id).toBe(10); // Last created at front
            expect(cached?.[9].id).toBe(1); // Original at end
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty collections', () => {
            dataCache.set('projects', []);

            expect(dataCache.get('projects')).toEqual([]);
            expect(dataCache.get('projects')).not.toBeNull();
        });

        it('should handle non-existent collections gracefully', () => {
            expect(dataCache.get('nonexistent')).toBeNull();
            expect(dataCache.isStale('nonexistent')).toBe(true);
        });

        it('should handle optimistic operations on non-existent collections', () => {
            // Should not throw
            dataCache.applyOptimisticCreate('nonexistent', { id: 1 });
            dataCache.applyOptimisticUpdate('nonexistent', { id: 1 });
            dataCache.applyOptimisticDelete('nonexistent', 1);

            expect(dataCache.get('nonexistent')).toBeNull();
        });

        it('should handle large datasets', () => {
            const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
                id: i + 1,
                name: `Item ${i + 1}`,
            }));

            dataCache.set('large', largeDataset);

            const cached = dataCache.get('large');
            expect(cached).toHaveLength(1000);
            expect(cached?.[0].id).toBe(1);
            expect(cached?.[999].id).toBe(1000);
        });
    });

    describe('Cache Refresh Callbacks', () => {
        it('should register and call refresh callbacks', () => {
            let callCount = 0;
            const callback = () => {
                callCount++;
            };
            const unsubscribe = dataCache.onRefresh('projects', callback);

            dataCache.notifyRefresh('projects');

            expect(callCount).toBe(1);
            unsubscribe();
        });

        it('should allow unsubscribing from callbacks', () => {
            let callCount = 0;
            const callback = () => {
                callCount++;
            };
            const unsubscribe = dataCache.onRefresh('projects', callback);

            unsubscribe();
            dataCache.notifyRefresh('projects');

            expect(callCount).toBe(0);
        });
    });
});
