/**
 * Data Persistence Test Suite
 * Tests that data persists across route changes and component remounts
 * 
 * This test verifies the fix for the issue where data was disappearing
 * when switching between routes (modules).
 */

import { dataCache } from '../hooks/useDataCache';

describe('Data Persistence Across Route Changes', () => {
    beforeEach(() => {
        // Clear cache before each test
        dataCache.invalidateAll();
    });

    describe('Global Data Cache', () => {
        test('should cache data when set', () => {
            const testData = [
                { id: 1, name: 'Project 1' },
                { id: 2, name: 'Project 2' }
            ];

            dataCache.set('projects', testData);
            const cached = dataCache.get('projects');

            expect(cached).toEqual(testData);
            expect(cached?.length).toBe(2);
        });

        test('should return null for uncached collection', () => {
            const cached = dataCache.get('projects');
            expect(cached).toBeNull();
        });

        test('should invalidate cache for specific collection', () => {
            const testData = [{ id: 1, name: 'Project 1' }];
            dataCache.set('projects', testData);

            expect(dataCache.get('projects')).not.toBeNull();

            dataCache.invalidate('projects');
            expect(dataCache.get('projects')).toBeNull();
        });

        test('should invalidate all caches', () => {
            dataCache.set('projects', [{ id: 1 }]);
            dataCache.set('tasks', [{ id: 1 }]);

            expect(dataCache.get('projects')).not.toBeNull();
            expect(dataCache.get('tasks')).not.toBeNull();

            dataCache.invalidateAll();

            expect(dataCache.get('projects')).toBeNull();
            expect(dataCache.get('tasks')).toBeNull();
        });

        test('should detect stale cache after 5 minutes', () => {
            const testData = [{ id: 1, name: 'Project 1' }];
            dataCache.set('projects', testData);

            // Initially not stale
            expect(dataCache.isStale('projects')).toBe(false);

            // Mock time passage (5+ minutes)
            const now = Date.now;
            Date.now = jest.fn(() => now() + 6 * 60 * 1000);

            expect(dataCache.isStale('projects')).toBe(true);

            // Restore Date.now
            Date.now = now;
        });

        test('should return stale data but mark as stale', () => {
            const testData = [{ id: 1, name: 'Project 1' }];
            dataCache.set('projects', testData);

            // Mock time passage
            const now = Date.now;
            Date.now = jest.fn(() => now() + 6 * 60 * 1000);

            const cached = dataCache.get('projects');
            expect(cached).toEqual(testData); // Still returns data
            expect(dataCache.isStale('projects')).toBe(true); // But marked as stale

            Date.now = now;
        });

        test('should provide cache statistics', () => {
            dataCache.set('projects', [{ id: 1 }, { id: 2 }]);
            dataCache.set('tasks', [{ id: 1 }]);

            const stats = dataCache.getStats();

            expect(stats.length).toBe(2);
            expect(stats.find(s => s.collection === 'projects')?.items).toBe(2);
            expect(stats.find(s => s.collection === 'tasks')?.items).toBe(1);
        });
    });

    describe('Route Navigation Scenario', () => {
        test('should persist projects data when navigating away and back', () => {
            const projectsData = [
                { id: 1, project_name: 'Website Redesign', status: 'In Progress' },
                { id: 2, project_name: 'SEO Optimization', status: 'In Progress' }
            ];

            // Simulate: User on ProjectsView, data loaded
            dataCache.set('projects', projectsData);
            expect(dataCache.get('projects')?.length).toBe(2);

            // Simulate: User navigates to TasksView (ProjectsView unmounts)
            // Cache should still have data
            expect(dataCache.get('projects')?.length).toBe(2);

            // Simulate: User navigates back to ProjectsView (ProjectsView remounts)
            // Data should be restored from cache
            const restoredData = dataCache.get('projects');
            expect(restoredData).toEqual(projectsData);
            expect(restoredData?.length).toBe(2);
        });

        test('should persist multiple collections simultaneously', () => {
            const projectsData = [{ id: 1, project_name: 'Project 1' }];
            const tasksData = [{ id: 1, task_name: 'Task 1' }];
            const usersData = [{ id: 1, name: 'User 1' }];

            // Cache all collections
            dataCache.set('projects', projectsData);
            dataCache.set('tasks', tasksData);
            dataCache.set('users', usersData);

            // Navigate between routes
            expect(dataCache.get('projects')).toEqual(projectsData);
            expect(dataCache.get('tasks')).toEqual(tasksData);
            expect(dataCache.get('users')).toEqual(usersData);

            // All should still be available
            const stats = dataCache.getStats();
            expect(stats.length).toBe(3);
        });

        test('should invalidate cache on create/update/delete operations', () => {
            const projectsData = [{ id: 1, project_name: 'Project 1' }];
            dataCache.set('projects', projectsData);

            expect(dataCache.get('projects')).not.toBeNull();

            // Simulate: User creates a new project
            dataCache.invalidate('projects');

            // Cache should be cleared to force fresh fetch
            expect(dataCache.get('projects')).toBeNull();
        });
    });

    describe('Cache Hit Logging', () => {
        test('should log cache hits for debugging', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            const testData = [{ id: 1 }];
            dataCache.set('projects', testData);
            dataCache.get('projects');

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('[DataCache]'),
                expect.stringContaining('Cache hit')
            );

            consoleSpy.mockRestore();
        });

        test('should log cache misses for debugging', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            dataCache.get('projects');

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('[DataCache]'),
                expect.stringContaining('No cache')
            );

            consoleSpy.mockRestore();
        });

        test('should log stale cache detection', () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            dataCache.set('projects', [{ id: 1 }]);

            // Mock time passage
            const now = Date.now;
            Date.now = jest.fn(() => now() + 6 * 60 * 1000);

            dataCache.get('projects');

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('[DataCache]'),
                expect.stringContaining('stale')
            );

            Date.now = now;
            consoleSpy.mockRestore();
        });
    });

    describe('Real-World Workflow', () => {
        test('complete workflow: load -> navigate -> return -> verify data', () => {
            // Step 1: Load projects on ProjectsView
            const projectsData = [
                { id: 1, project_name: 'Website Redesign', progress: 65 },
                { id: 2, project_name: 'SEO Optimization', progress: 45 }
            ];
            dataCache.set('projects', projectsData);

            // Step 2: Load tasks on TasksView
            const tasksData = [
                { id: 101, task_name: 'Design Homepage', status: 'in_progress' },
                { id: 102, task_name: 'Conduct Keyword Research', status: 'completed' }
            ];
            dataCache.set('tasks', tasksData);

            // Step 3: Navigate to another module (e.g., Campaigns)
            // Both projects and tasks should still be cached
            expect(dataCache.get('projects')).toEqual(projectsData);
            expect(dataCache.get('tasks')).toEqual(tasksData);

            // Step 4: Navigate back to ProjectsView
            const restoredProjects = dataCache.get('projects');
            expect(restoredProjects).toEqual(projectsData);
            expect(restoredProjects?.length).toBe(2);

            // Step 5: Navigate back to TasksView
            const restoredTasks = dataCache.get('tasks');
            expect(restoredTasks).toEqual(tasksData);
            expect(restoredTasks?.length).toBe(2);

            // Step 6: Create new task (invalidates cache)
            dataCache.invalidate('tasks');
            expect(dataCache.get('tasks')).toBeNull();

            // Step 7: Projects should still be cached
            expect(dataCache.get('projects')).toEqual(projectsData);
        });
    });
});
