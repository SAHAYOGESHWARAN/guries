
import { Request, Response } from 'express';
import { pool } from '../config/db';

export const getTrafficData = async (req: Request, res: Response) => {
    try {
        // Fetch last 30 days of traffic from real DB table
        const result = await pool.query(`
            SELECT date, value 
            FROM analytics_daily_traffic 
            ORDER BY date ASC 
            LIMIT 30
        `);
        
        const formatted = result.rows.map(row => {
            const d = new Date(row.date);
            return {
                date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: row.value
            };
        });
        
        // Return actual data or empty array (No Mocking)
        return res.status(200).json(formatted);

    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch traffic data', details: error.message });
    }
};

export const getKPISummary = async (req: Request, res: Response) => {
    try {
        const activeCampaigns = await pool.query("SELECT COUNT(*) FROM campaigns WHERE status = 'active'");
        const completedTasks = await pool.query("SELECT COUNT(*) FROM tasks WHERE status = 'completed'");
        const organicKeywords = await pool.query("SELECT COUNT(*) FROM keywords WHERE status = 'active'");
        
        // Calculate real traffic sum if table exists, else 0
        const trafficSum = await pool.query("SELECT SUM(value) as total FROM analytics_daily_traffic");

        const kpis = {
            activeCampaigns: parseInt(activeCampaigns.rows[0].count),
            completedTasks: parseInt(completedTasks.rows[0].count),
            organicKeywords: parseInt(organicKeywords.rows[0].count),
            globalTraffic: parseInt(trafficSum.rows[0].total) || 0
        };
        res.status(200).json(kpis);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch KPIs', details: error.message });
    }
};

export const getDashboardMetrics = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM kpi_snapshots ORDER BY id ASC');
        // Return actual rows or empty array
        return res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch dashboard metrics', details: error.message });
    }
};


