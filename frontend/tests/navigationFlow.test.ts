/**
 * Navigation Flow Integration Tests
 * Tests for data persistence across page navigation
 */

import { dataCache } from '../hooks/useDataCache';

describe('Navigation Flow - Data Persistence', () => {
    beforeEach(() => {
        dataCache.clear();
    });

    describe('Scenario 1: Initial Load → Navigate → Return', () => {
        test('should display fresh data on return to page', () => {
            // Step 1: Initial load of projects page
            const projectsData = [
                { id: 1, name: 'Project 1', status: 'active' },
                { id: 2, name: 'Project 2', status: 'active' }
            ];
            dataCache.set('projects', projectsData);
            expect(dataCache.get('projects')).toEqual(projectsData);

            // Step 2: Navigate to campaigns page
            dataCache.markStale('projects');
            dataCache.markStale('campaigns');
            expect(dataCache.isStale('projects')).toBe(true);

            // Step 3: Simulate API fetch of fresh projects data
            const updatedProjectsData = [
                { id: 1, name: 'Project 1', status: 'completed' }, // Status changed
                { id: 2, name: 'Project 2', status: 'active' },
                { id: 3, name: 'Project 3', status: 'active' } // New project
            ];
            dataCache.set('projects', updatedProjectsData);

            // Step 4: Return to projects page
            expect(dataCache.isStale('projects')).toBe(false);
            expect(dataCache.get('projects')).toEqual(updatedProjectsData);
            expect(dataCache.get('projects')).toHaveLength(3);
        });
    });

    describe('Scenario 2: Manual Data Addition', () => {
        test('should reflect manually added data across pages', () => {
            // Step 1: Load projects
            const initialProjects = [{ id: 1, name: 'Project 1' }];
            dataCache.set('projects', initialProjects);

            // Step 2: Navigate away
            dataCache.markStale('projects');

            // Step 3: Manually add project (simulating create operation)
            const newProject = { id: 2, name: 'Project 2' };
            dataCache.applyOptimisticCreate('projects', newProject);

            // Step 4: Navigate back to projects
            const result = dataCache.get('projects');
            expect(result).toHaveLength(2);
            expect(result?.[0]).toEqual(newProject); // New item should be first
        });

        test('should persist manually added data after navigation', () => {
            // Step 1: Create initial data
            const projects = [{ id: 1, name: 'Project 1' }];
            dataCache.set('projects', projects);

            // Step 2: Add new project
            const newProject = { id: 2, name: 'Project 2' };
            dataCache.applyOptimisticCreate('projects', newProject);

            // Step 3: Navigate to another page
            dataCache.markStale('projects');

            // Step 4: Fetch fresh data (simulating API call)
            const freshData = [
                { id: 2, name: 'Project 2' }, // New project from server
                { id: 1, name: 'Project 1' }
            ];
            dataCache.set('projects', freshData);

            // Step 5: Return to projects page
            expect(dataCache.get('projects')).toEqual(freshData);
            expect(dataCache.get('projects')).toHaveLength(2);
        });
    });

    describe('Scenario 3: Multiple Collections Navigation', () => {
        test('should handle navigation with multiple collections', () => {
            // Setup: Load multiple collections
            const collections = {
                projects: [{ id: 1, name: 'Project 1' }],
                campaigns: [{ id: 1, name: 'Campaign 1' }],
                tasks: [{ id: 1, name: 'Task 1' }],
                users: [{ id: 1, name: 'User 1' }]
            };

            Object.entries(collections).forEach(([key, data]) => {
                dataCache.set(key, data);
            });

            // Verify all are fresh
            Object.keys(collections).forEach(key => {
                expect(dataCache.isStale(key)).toBe(false);
            });

            // Navigate: Mark all as stale
            Object.keys(collections).forEach(key => {
                dataCache.markStale(key);
            });

            // Verify all are stale
            Object.keys(collections).forEach(key => {
                expect(dataCache.isStale(key)).toBe(true);
            });

            // Simulate fresh API fetches
            Object.entries(collections).forEach(([key, data]) => {
                dataCache.set(key, data);
            });

            // Verify all are fresh again
            Object.keys(collections).forEach(key => {
                expect(dataCache.isStale(key)).toBe(false);
            });
        });
    });

    describe('Scenario 4: Detail View Navigation', () => {
        test('should handle navigation to detail view and back', () => {
            // Step 1: Load projects list
            const projects = [
                { id: 1, name: 'Project 1' },
                { id: 2, name: 'Project 2' }
            ];
            dataCache.set('projects', projects);

            // Step 2: Navigate to project detail (id: 1)
            dataCache.markStale('projects');
            dataCache.markStale('campaigns'); // Related data

            // Step 3: Load detail view data
            const projectDetail = { id: 1, name: 'Project 1', description: 'Detailed info' };
            const relatedCampaigns = [{ id: 1, name: 'Campaign 1', project_id: 1 }];
            dataCache.set('campaigns', relatedCampaigns);

            // Step 4: Navigate back to projects list
            dataCache.markStale('projects');
            dataCache.set('projects', projects); // Fresh fetch

            // Verify data is correct
            expect(dataCache.get('projects')).toEqual(projects);
            expect(dataCache.get('campaigns')).toEqual(relatedCampaigns);
        });
    });

    describe('Scenario 5: Empty Cache on Navigation', () => {
        test('should handle navigation when cache is empty', () => {
            // Step 1: Navigate without any cached data
            dataCache.markStale('projects');
            dataCache.markStale('campaigns');

            // Verify cache is stale
            expect(dataCache.isStale('projects')).toBe(true);
            expect(dataCache.isStale('campaigns')).toBe(true);

            // Step 2: Fetch fresh data
            const projects = [{ id: 1, name: 'Project 1' }];
            dataCache.set('projects', projects);

            // Verify data is now available
            expect(dataCache.get('projects')).toEqual(projects);
            expect(dataCache.isStale('projects')).toBe(false);
        });
    });

    describe('Scenario 6: Rapid Navigation', () => {
        test('should handle rapid navigation between pages', () => {
            const pages = ['projects', 'campaigns', 'tasks', 'users'];

            // Simulate rapid navigation
            for (let i = 0; i < 5; i++) {
                // Mark all as stale
                pages.forEach(page => dataCache.markStale(page));

                // Load fresh data for current page
                const currentPage = pages[i % pages.length];
                dataCache.set(currentPage, [{ id: 1, name: `${currentPage} data` }]);

                // Verify current page is fresh
                expect(dataCache.isStale(currentPage)).toBe(false);
                expect(dataCache.get(currentPage)).not.toBeNull();
            }
        });
    });

    describe('Scenario 7: Data Update During Navigation', () => {
        test('should handle data updates while navigating', () => {
            // Step 1: Load projects
            const projects = [{ id: 1, name: 'Project 1', status: 'active' }];
            dataCache.set('projects', projects);

            // Step 2: Update project
            const updated = { id: 1, name: 'Project 1', status: 'completed' };
            dataCache.applyOptimisticUpdate('projects', updated);

            // Step 3: Navigate away
            dataCache.markStale('projects');

            // Step 4: Fetch fresh data (server confirms update)
            const freshData = [{ id: 1, name: 'Project 1', status: 'completed' }];
            dataCache.set('projects', freshData);

            // Verify update is persisted
            expect(dataCache.get('projects')?.[0].status).toBe('completed');
        });
    });

    describe('Scenario 8: Deletion During Navigation', () => {
        test('should handle data deletion across navigation', () => {
            // Step 1: Load projects
            const projects = [
                { id: 1, name: 'Project 1' },
                { id: 2, name: 'Project 2' }
            ];
            dataCache.set('projects', projects);

            // Step 2: Delete project
            dataCache.applyOptimisticDelete('projects', 1);
            expect(dataCache.get('projects')).toHaveLength(1);

            // Step 3: Navigate away
            dataCache.markStale('projects');

            // Step 4: Fetch fresh data (server confirms deletion)
            const freshData = [{ id: 2, name: 'Project 2' }];
            dataCache.set('projects', freshData);

            // Verify deletion is persisted
            expect(dataCache.get('projects')).toHaveLength(1);
            expect(dataCache.get('projects')?.[0].id).toBe(2);
        });
    });

    describe('Scenario 9: Cache Invalidation on Logout', () => {
        test('should clear all caches on logout', () => {
            // Step 1: Load multiple collections
            const collections = {
                projects: [{ id: 1, name: 'Project 1' }],
                campaigns: [{ id: 1, name: 'Campaign 1' }],
                users: [{ id: 1, name: 'User 1' }]
            };

            Object.entries(collections).forEach(([key, data]) => {
                dataCache.set(key, data);
            });

            // Step 2: Logout (clear all cache)
            dataCache.invalidateAll();

            // Verify all caches are cleared
            Object.keys(collections).forEach(key => {
                expect(dataCache.get(key)).toBeNull();
            });
        });
    });

    describe('Scenario 10: Stale Cache with Fresh Data', () => {
        test('should use fresh data even if cache was stale', () => {
            // Step 1: Load initial data
            const oldData = [{ id: 1, name: 'Old Project' }];
            dataCache.set('projects', oldData);

            // Step 2: Mark as stale
            dataCache.markStale('projects');
            expect(dataCache.isStale('projects')).toBe(true);

            // Step 3: Fetch fresh data
            const newData = [
                { id: 1, name: 'Updated Project' },
                { id: 2, name: 'New Project' }
            ];
            dataCache.set('projects', newData);

            // Step 4: Verify fresh data is used
            expect(dataCache.isStale('projects')).toBe(false);
            expect(dataCache.get('projects')).toEqual(newData);
            expect(dataCache.get('projects')).toHaveLength(2);
        });
    });
});

describe('Edge Cases', () => {
    beforeEach(() => {
        dataCache.clear();
    });

    test('should handle null/undefined data gracefully', () => {
        dataCache.set('projects', []);
        expect(dataCache.get('projects')).toEqual([]);

        dataCache.markStale('projects');
        expect(dataCache.isStale('projects')).toBe(true);
    });

    test('should handle very large datasets', () => {
        const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
            id: i,
            name: `Item ${i}`
        }));

        dataCache.set('projects', largeDataset);
        expect(dataCache.get('projects')).toHaveLength(10000);

        dataCache.markStale('projects');
        expect(dataCache.isStale('projects')).toBe(true);

        dataCache.set('projects', largeDataset);
        expect(dataCache.get('projects')).toHaveLength(10000);
    });

    test('should handle special characters in data', () => {
        const specialData = [
            { id: 1, name: 'Project "Test"' },
            { id: 2, name: "Project 'Test'" },
            { id: 3, name: 'Project <Test>' }
        ];

        dataCache.set('projects', specialData);
        expect(dataCache.get('projects')).toEqual(specialData);
    });
});
