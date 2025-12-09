
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';

export const getDashboardStats = async (req: any, res: any) => {
    try {
        // Run aggregations in parallel for performance
        const [
            activeCampaigns, 
            completedTasks, 
            keywords, 
            toxicLinks,
            notifications,
            traffic
        ] = await Promise.all([
            pool.query("SELECT COUNT(*) FROM campaigns WHERE status = 'active'"),
            pool.query("SELECT COUNT(*) FROM tasks WHERE status = 'completed'"),
            pool.query("SELECT COUNT(*) FROM keywords WHERE status = 'active'"),
            pool.query("SELECT COUNT(*) FROM toxic_backlinks WHERE status = 'Pending'"),
            pool.query("SELECT * FROM notifications WHERE read = false ORDER BY created_at DESC LIMIT 5"),
            pool.query("SELECT date, value FROM analytics_daily_traffic ORDER BY date ASC LIMIT 30")
        ]);

        const trafficData = traffic.rows.map((row: any) => ({
            date: new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: row.value
        }));

        const data = {
            counts: {
                activeCampaigns: parseInt(activeCampaigns.rows[0].count),
                completedTasks: parseInt(completedTasks.rows[0].count),
                activeKeywords: parseInt(keywords.rows[0].count),
                toxicLinkAlerts: parseInt(toxicLinks.rows[0].count)
            },
            trafficTrend: trafficData, // Returns empty array if no data in DB
            recentNotifications: notifications.rows,
            systemHealth: 100 // Default healthy state
        };

        res.status(200).json(data);
    } catch (error: any) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ error: 'Failed to generate dashboard statistics' });
    }
};
