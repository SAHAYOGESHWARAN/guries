import { Request, Response } from 'express';
import { pool } from '../config/db';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        // Return mock data for dashboard - tables may not exist in development
        const mockData = {
            stats: {
                activeCampaigns: 5,
                activeCampaignsChange: 12,
                contentPublished: 24,
                contentPublishedChange: 8,
                tasksCompleted: 18,
                tasksCompletedChange: -3,
                teamMembers: 12,
                teamMembersChange: 2,
                pendingTasks: 7,
                totalTasks: 25,
                totalCampaigns: 8
            },
            recentProjects: [
                {
                    id: 1,
                    name: "Website Redesign",
                    status: "In Progress",
                    progress: 65,
                    start_date: "2026-01-15",
                    end_date: "2026-03-15",
                    created_at: "2026-01-15T10:00:00Z",
                    updated_at: "2026-02-18T11:00:00Z"
                },
                {
                    id: 2,
                    name: "Marketing Automation",
                    status: "Planning",
                    progress: 25,
                    start_date: "2026-02-01",
                    end_date: "2026-04-01",
                    created_at: "2026-02-01T10:00:00Z",
                    updated_at: "2026-02-18T11:00:00Z"
                },
                {
                    id: 3,
                    name: "SEO Optimization",
                    status: "In Progress",
                    progress: 80,
                    start_date: "2026-01-01",
                    end_date: "2026-02-28",
                    created_at: "2026-01-01T10:00:00Z",
                    updated_at: "2026-02-18T11:00:00Z"
                },
                {
                    id: 4,
                    name: "Content Strategy",
                    status: "Completed",
                    progress: 100,
                    start_date: "2025-12-01",
                    end_date: "2026-01-31",
                    created_at: "2025-12-01T10:00:00Z",
                    updated_at: "2026-02-18T11:00:00Z"
                }
            ],
            recentActivities: [
                {
                    id: 1,
                    user_name: "John Designer",
                    action: "created",
                    target: "new asset",
                    type: "asset_created",
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 2,
                    user_name: "Sarah Writer",
                    action: "completed",
                    target: "QC review",
                    type: "qc_completed",
                    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 3,
                    user_name: "Mike Manager",
                    action: "approved",
                    target: "campaign",
                    type: "campaign_approved",
                    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
                }
            ],
            systemHealth: 100
        };

        res.status(200).json(mockData);
    } catch (error: any) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ error: 'Failed to generate dashboard statistics' });
    }
};

// Get upcoming tasks for dashboard
export const getUpcomingTasks = async (req: Request, res: Response) => {
    try {
        // Return mock upcoming tasks
        const mockTasks = [
            {
                id: 1,
                name: "Design Homepage Banner",
                status: "In Progress",
                priority: "high",
                assigned_user_name: "John Designer",
                project_name: "Website Redesign",
                due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 2,
                name: "Write SEO Article",
                status: "Pending",
                priority: "medium",
                assigned_user_name: "Sarah Writer",
                project_name: "Content Strategy",
                due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 3,
                name: "Review QC Assets",
                status: "Pending",
                priority: "high",
                assigned_user_name: "Mike Manager",
                project_name: "Asset Management",
                due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 4,
                name: "Update Meta Tags",
                status: "In Progress",
                priority: "medium",
                assigned_user_name: "Emma SEO",
                project_name: "SEO Optimization",
                due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        res.status(200).json(mockTasks);
    } catch (error: any) {
        console.error('Upcoming Tasks Error:', error);
        res.status(500).json({ error: 'Failed to fetch upcoming tasks' });
    }
};

// Get recent activity for dashboard
export const getRecentActivity = async (req: Request, res: Response) => {
    try {
        // Return mock recent activity
        const mockActivity = [
            {
                id: 1,
                user_name: "John Designer",
                text: "Created new asset",
                message: "Created new asset",
                type: "asset_created",
                created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                read: false
            },
            {
                id: 2,
                user_name: "Sarah Writer",
                text: "Completed QC review",
                message: "Completed QC review",
                type: "qc_completed",
                created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                read: false
            },
            {
                id: 3,
                user_name: "Mike Manager",
                text: "Approved campaign",
                message: "Approved campaign",
                type: "campaign_approved",
                created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                read: true
            },
            {
                id: 4,
                user_name: "Emma SEO",
                text: "Updated meta tags",
                message: "Updated meta tags",
                type: "metadata_updated",
                created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                read: true
            },
            {
                id: 5,
                user_name: "Alex Developer",
                text: "Deployed new version",
                message: "Deployed new version",
                type: "deployment",
                created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
                read: true
            }
        ];

        res.status(200).json(mockActivity);
    } catch (error: any) {
        console.error('Recent Activity Error:', error);
        res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
};


