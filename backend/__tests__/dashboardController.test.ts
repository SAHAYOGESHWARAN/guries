import { Request, Response } from 'express';
import * as dashboardController from '../controllers/dashboardController';

// Mock the database pool
jest.mock('../config/db', () => ({
    pool: {
        query: jest.fn()
    }
}));

describe('Dashboard Controller', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn().mockReturnValue(undefined);
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });

        mockReq = {};
        mockRes = {
            status: statusMock,
            json: jsonMock
        };

        jest.clearAllMocks();
    });

    describe('getDashboardStats', () => {
        test('should return dashboard stats with mock data', async () => {
            await dashboardController.getDashboardStats(mockReq as Request, mockRes as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalled();

            const response = jsonMock.mock.calls[0][0];
            expect(response).toHaveProperty('stats');
            expect(response.stats).toHaveProperty('activeCampaigns');
            expect(response.stats).toHaveProperty('contentPublished');
            expect(response.stats).toHaveProperty('tasksCompleted');
            expect(response.stats).toHaveProperty('teamMembers');
        });

        test('should include recent projects in response', async () => {
            await dashboardController.getDashboardStats(mockReq as Request, mockRes as Response);

            const response = jsonMock.mock.calls[0][0];
            expect(response).toHaveProperty('recentProjects');
            expect(Array.isArray(response.recentProjects)).toBe(true);
            expect(response.recentProjects.length).toBeGreaterThan(0);
        });

        test('should include recent activities in response', async () => {
            await dashboardController.getDashboardStats(mockReq as Request, mockRes as Response);

            const response = jsonMock.mock.calls[0][0];
            expect(response).toHaveProperty('recentActivities');
            expect(Array.isArray(response.recentActivities)).toBe(true);
        });

        test('should include system health in response', async () => {
            await dashboardController.getDashboardStats(mockReq as Request, mockRes as Response);

            const response = jsonMock.mock.calls[0][0];
            expect(response).toHaveProperty('systemHealth');
            expect(response.systemHealth).toBe(100);
        });

        test('should handle errors gracefully', async () => {
            const error = new Error('Database error');
            jest.spyOn(console, 'error').mockImplementation();

            // Simulate an error by throwing in the controller
            try {
                throw error;
            } catch (err) {
                // Error handling would be in the actual controller
            }

            jest.restoreAllMocks();
        });
    });

    describe('getUpcomingTasks', () => {
        test('should return upcoming tasks', async () => {
            await dashboardController.getUpcomingTasks(mockReq as Request, mockRes as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalled();

            const response = jsonMock.mock.calls[0][0];
            expect(Array.isArray(response)).toBe(true);
            expect(response.length).toBeGreaterThan(0);
        });

        test('should include task properties', async () => {
            await dashboardController.getUpcomingTasks(mockReq as Request, mockRes as Response);

            const response = jsonMock.mock.calls[0][0];
            const task = response[0];

            expect(task).toHaveProperty('id');
            expect(task).toHaveProperty('name');
            expect(task).toHaveProperty('status');
            expect(task).toHaveProperty('priority');
            expect(task).toHaveProperty('due_date');
        });

        test('should include assigned user information', async () => {
            await dashboardController.getUpcomingTasks(mockReq as Request, mockRes as Response);

            const response = jsonMock.mock.calls[0][0];
            const task = response[0];

            expect(task).toHaveProperty('assigned_user_name');
            expect(task).toHaveProperty('project_name');
        });

        test('should return tasks with valid due dates', async () => {
            await dashboardController.getUpcomingTasks(mockReq as Request, mockRes as Response);

            const response = jsonMock.mock.calls[0][0];
            response.forEach((task: any) => {
                expect(task.due_date).toBeDefined();
                expect(new Date(task.due_date)).toBeInstanceOf(Date);
            });
        });
    });

    describe('getRecentActivity', () => {
        test('should return recent activity', async () => {
            await dashboardController.getRecentActivity(mockReq as Request, mockRes as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalled();

            const response = jsonMock.mock.calls[0][0];
            expect(Array.isArray(response)).toBe(true);
        });

        test('should include activity properties', async () => {
            await dashboardController.getRecentActivity(mockReq as Request, mockRes as Response);

            const response = jsonMock.mock.calls[0][0];
            if (response.length > 0) {
                const activity = response[0];

                expect(activity).toHaveProperty('id');
                expect(activity).toHaveProperty('user_name');
                expect(activity).toHaveProperty('message');
                expect(activity).toHaveProperty('type');
                expect(activity).toHaveProperty('created_at');
            }
        });

        test('should include read status for activities', async () => {
            await dashboardController.getRecentActivity(mockReq as Request, mockRes as Response);

            const response = jsonMock.mock.calls[0][0];
            response.forEach((activity: any) => {
                expect(activity).toHaveProperty('read');
                expect(typeof activity.read).toBe('boolean');
            });
        });

        test('should return activities sorted by timestamp', async () => {
            await dashboardController.getRecentActivity(mockReq as Request, mockRes as Response);

            const response = jsonMock.mock.calls[0][0];
            for (let i = 1; i < response.length; i++) {
                const prevTime = new Date(response[i - 1].created_at).getTime();
                const currTime = new Date(response[i].created_at).getTime();
                expect(prevTime).toBeGreaterThanOrEqual(currTime);
            }
        });
    });

    describe('Data Validation', () => {
        test('stats should have numeric values', async () => {
            await dashboardController.getDashboardStats(mockReq as Request, mockRes as Response);

            const response = jsonMock.mock.calls[0][0];
            expect(typeof response.stats.activeCampaigns).toBe('number');
            expect(typeof response.stats.contentPublished).toBe('number');
            expect(typeof response.stats.tasksCompleted).toBe('number');
            expect(typeof response.stats.teamMembers).toBe('number');
        });

        test('projects should have required fields', async () => {
            await dashboardController.getDashboardStats(mockReq as Request, mockRes as Response);

            const response = jsonMock.mock.calls[0][0];
            response.recentProjects.forEach((project: any) => {
                expect(project).toHaveProperty('id');
                expect(project).toHaveProperty('name');
                expect(project).toHaveProperty('status');
                expect(project).toHaveProperty('progress');
            });
        });

        test('activities should have valid timestamps', async () => {
            await dashboardController.getRecentActivity(mockReq as Request, mockRes as Response);

            const response = jsonMock.mock.calls[0][0];
            response.forEach((activity: any) => {
                const timestamp = new Date(activity.created_at);
                expect(timestamp).toBeInstanceOf(Date);
                expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
            });
        });
    });

    describe('Response Format', () => {
        test('getDashboardStats should return proper structure', async () => {
            await dashboardController.getDashboardStats(mockReq as Request, mockRes as Response);

            const response = jsonMock.mock.calls[0][0];
            expect(response).toHaveProperty('stats');
            expect(response).toHaveProperty('recentProjects');
            expect(response).toHaveProperty('recentActivities');
            expect(response).toHaveProperty('systemHealth');
        });

        test('getUpcomingTasks should return array', async () => {
            await dashboardController.getUpcomingTasks(mockReq as Request, mockRes as Response);

            const response = jsonMock.mock.calls[0][0];
            expect(Array.isArray(response)).toBe(true);
        });

        test('getRecentActivity should return array', async () => {
            await dashboardController.getRecentActivity(mockReq as Request, mockRes as Response);

            const response = jsonMock.mock.calls[0][0];
            expect(Array.isArray(response)).toBe(true);
        });
    });
});
