import request from 'supertest';
import express from 'express';
import * as dashboardController from '../controllers/dashboardController';

// Create a test app
const app = express();
app.use(express.json());

// Mount dashboard routes
app.get('/dashboard/stats', dashboardController.getDashboardStats);
app.get('/dashboard/upcoming-tasks', dashboardController.getUpcomingTasks);
app.get('/dashboard/recent-activity', dashboardController.getRecentActivity);

describe('Dashboard Integration Tests', () => {
    describe('GET /dashboard/stats', () => {
        test('should return 200 status code', async () => {
            const response = await request(app)
                .get('/dashboard/stats')
                .expect(200);

            expect(response.body).toBeDefined();
        });

        test('should return stats object with required fields', async () => {
            const response = await request(app)
                .get('/dashboard/stats')
                .expect(200);

            expect(response.body).toHaveProperty('stats');
            expect(response.body.stats).toHaveProperty('activeCampaigns');
            expect(response.body.stats).toHaveProperty('contentPublished');
            expect(response.body.stats).toHaveProperty('tasksCompleted');
            expect(response.body.stats).toHaveProperty('teamMembers');
            expect(response.body.stats).toHaveProperty('pendingTasks');
        });

        test('should return recent projects array', async () => {
            const response = await request(app)
                .get('/dashboard/stats')
                .expect(200);

            expect(response.body).toHaveProperty('recentProjects');
            expect(Array.isArray(response.body.recentProjects)).toBe(true);
        });

        test('should return recent activities array', async () => {
            const response = await request(app)
                .get('/dashboard/stats')
                .expect(200);

            expect(response.body).toHaveProperty('recentActivities');
            expect(Array.isArray(response.body.recentActivities)).toBe(true);
        });

        test('should return system health metric', async () => {
            const response = await request(app)
                .get('/dashboard/stats')
                .expect(200);

            expect(response.body).toHaveProperty('systemHealth');
            expect(typeof response.body.systemHealth).toBe('number');
            expect(response.body.systemHealth).toBeGreaterThanOrEqual(0);
            expect(response.body.systemHealth).toBeLessThanOrEqual(100);
        });

        test('stats values should be non-negative', async () => {
            const response = await request(app)
                .get('/dashboard/stats')
                .expect(200);

            const stats = response.body.stats;
            expect(stats.activeCampaigns).toBeGreaterThanOrEqual(0);
            expect(stats.contentPublished).toBeGreaterThanOrEqual(0);
            expect(stats.tasksCompleted).toBeGreaterThanOrEqual(0);
            expect(stats.teamMembers).toBeGreaterThanOrEqual(0);
            expect(stats.pendingTasks).toBeGreaterThanOrEqual(0);
        });

        test('projects should have valid structure', async () => {
            const response = await request(app)
                .get('/dashboard/stats')
                .expect(200);

            response.body.recentProjects.forEach((project: any) => {
                expect(project).toHaveProperty('id');
                expect(project).toHaveProperty('name');
                expect(project).toHaveProperty('status');
                expect(project).toHaveProperty('progress');
                expect(typeof project.progress).toBe('number');
                expect(project.progress).toBeGreaterThanOrEqual(0);
                expect(project.progress).toBeLessThanOrEqual(100);
            });
        });

        test('activities should have valid structure', async () => {
            const response = await request(app)
                .get('/dashboard/stats')
                .expect(200);

            response.body.recentActivities.forEach((activity: any) => {
                expect(activity).toHaveProperty('id');
                expect(activity).toHaveProperty('user_name');
                expect(activity).toHaveProperty('action');
                expect(activity).toHaveProperty('target');
                expect(activity).toHaveProperty('type');
                expect(activity).toHaveProperty('timestamp');
            });
        });
    });

    describe('GET /dashboard/upcoming-tasks', () => {
        test('should return 200 status code', async () => {
            const response = await request(app)
                .get('/dashboard/upcoming-tasks')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        test('should return array of tasks', async () => {
            const response = await request(app)
                .get('/dashboard/upcoming-tasks')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        test('tasks should have required properties', async () => {
            const response = await request(app)
                .get('/dashboard/upcoming-tasks')
                .expect(200);

            response.body.forEach((task: any) => {
                expect(task).toHaveProperty('id');
                expect(task).toHaveProperty('name');
                expect(task).toHaveProperty('status');
                expect(task).toHaveProperty('priority');
                expect(task).toHaveProperty('due_date');
            });
        });

        test('tasks should have valid priority values', async () => {
            const response = await request(app)
                .get('/dashboard/upcoming-tasks')
                .expect(200);

            const validPriorities = ['high', 'medium', 'low'];
            response.body.forEach((task: any) => {
                expect(validPriorities).toContain(task.priority.toLowerCase());
            });
        });

        test('tasks should have valid status values', async () => {
            const response = await request(app)
                .get('/dashboard/upcoming-tasks')
                .expect(200);

            const validStatuses = ['pending', 'in progress', 'completed'];
            response.body.forEach((task: any) => {
                expect(validStatuses).toContain(task.status.toLowerCase());
            });
        });

        test('due dates should be valid ISO strings', async () => {
            const response = await request(app)
                .get('/dashboard/upcoming-tasks')
                .expect(200);

            response.body.forEach((task: any) => {
                const date = new Date(task.due_date);
                expect(date).toBeInstanceOf(Date);
                expect(date.getTime()).not.toBeNaN();
            });
        });
    });

    describe('GET /dashboard/recent-activity', () => {
        test('should return 200 status code', async () => {
            const response = await request(app)
                .get('/dashboard/recent-activity')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        test('should return array of activities', async () => {
            const response = await request(app)
                .get('/dashboard/recent-activity')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        test('activities should have required properties', async () => {
            const response = await request(app)
                .get('/dashboard/recent-activity')
                .expect(200);

            response.body.forEach((activity: any) => {
                expect(activity).toHaveProperty('id');
                expect(activity).toHaveProperty('user_name');
                expect(activity).toHaveProperty('message');
                expect(activity).toHaveProperty('type');
                expect(activity).toHaveProperty('created_at');
                expect(activity).toHaveProperty('read');
            });
        });

        test('read property should be boolean', async () => {
            const response = await request(app)
                .get('/dashboard/recent-activity')
                .expect(200);

            response.body.forEach((activity: any) => {
                expect(typeof activity.read).toBe('boolean');
            });
        });

        test('timestamps should be valid ISO strings', async () => {
            const response = await request(app)
                .get('/dashboard/recent-activity')
                .expect(200);

            response.body.forEach((activity: any) => {
                const date = new Date(activity.created_at);
                expect(date).toBeInstanceOf(Date);
                expect(date.getTime()).not.toBeNaN();
            });
        });

        test('activities should be sorted by timestamp (newest first)', async () => {
            const response = await request(app)
                .get('/dashboard/recent-activity')
                .expect(200);

            for (let i = 1; i < response.body.length; i++) {
                const prevTime = new Date(response.body[i - 1].created_at).getTime();
                const currTime = new Date(response.body[i].created_at).getTime();
                expect(prevTime).toBeGreaterThanOrEqual(currTime);
            }
        });
    });

    describe('Response Headers', () => {
        test('should return JSON content type', async () => {
            const response = await request(app)
                .get('/dashboard/stats');

            expect(response.headers['content-type']).toMatch(/json/);
        });

        test('should not have caching headers for dynamic data', async () => {
            const response = await request(app)
                .get('/dashboard/stats');

            // Dashboard data should not be cached
            expect(response.headers['cache-control']).not.toMatch(/public/);
        });
    });

    describe('Error Handling', () => {
        test('should handle missing endpoints gracefully', async () => {
            const response = await request(app)
                .get('/dashboard/nonexistent')
                .expect(404);
        });
    });

    describe('Performance', () => {
        test('stats endpoint should respond within reasonable time', async () => {
            const start = Date.now();
            await request(app)
                .get('/dashboard/stats')
                .expect(200);
            const duration = Date.now() - start;

            // Should respond within 1 second
            expect(duration).toBeLessThan(1000);
        });

        test('tasks endpoint should respond within reasonable time', async () => {
            const start = Date.now();
            await request(app)
                .get('/dashboard/upcoming-tasks')
                .expect(200);
            const duration = Date.now() - start;

            expect(duration).toBeLessThan(1000);
        });

        test('activity endpoint should respond within reasonable time', async () => {
            const start = Date.now();
            await request(app)
                .get('/dashboard/recent-activity')
                .expect(200);
            const duration = Date.now() - start;

            expect(duration).toBeLessThan(1000);
        });
    });
});
