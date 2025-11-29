
import { Request, Response } from 'express';
import { pool } from '../config/db';

// Get calculated workload forecast based on active tasks
export const getWorkloadForecast = async (req: any, res: any) => {
    try {
        // Advanced SQL query to calculate workload based on assigned tasks
        const result = await pool.query(`
            SELECT 
                u.id, 
                u.name, 
                u.role,
                COUNT(t.id) as current_load,
                -- Simulate predictive load based on historical averages (randomized for demo)
                (COUNT(t.id) + CAST(FLOOR(RANDOM() * 5) AS INT)) as predicted_load,
                25 as capacity
            FROM users u
            LEFT JOIN tasks t ON u.id = t.primary_owner_id AND t.status IN ('active', 'in_progress', 'pending')
            WHERE u.status = 'active'
            GROUP BY u.id, u.name, u.role
        `);
        
        const formatted = result.rows.map((row: any) => ({
            userId: row.id,
            initials: row.name.split(' ').map((n:string) => n[0]).join('').toUpperCase(),
            name: row.name,
            role: row.role,
            currentLoad: parseInt(row.current_load),
            predictedLoad: parseInt(row.predicted_load),
            capacity: row.capacity,
            utilization: Math.round((parseInt(row.predicted_load) / row.capacity) * 100),
            riskLevel: parseInt(row.predicted_load) > row.capacity ? 'High' : 'Low'
        }));

        res.status(200).json(formatted);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getRewardRecommendations = async (req: any, res: any) => {
    try {
        // In a production system, this would run complex logic over the 'qc_runs' and 'tasks' tables
        // to calculate performance scores. For this view, we return structured data.
        
        const users = await pool.query("SELECT id, name, role FROM users WHERE status = 'active' LIMIT 5");
        
        const recommendations = users.rows.map((u: any, idx: number) => ({
            id: idx + 1,
            userId: u.id,
            name: u.name,
            role: u.role,
            tier: idx === 0 ? 'Tier 1 (Top 5%)' : idx === 1 ? 'Tier 2 (Top 10%)' : 'Tier 3 (Standard)',
            rank: idx + 1,
            score: 95 - (idx * 5),
            recommendedBonus: 15000 - (idx * 2500),
            status: 'Pending',
            achievements: idx === 0 ? ['Perfect QC Streak', 'Project Lead'] : ['Consistent Output']
        }));

        res.status(200).json(recommendations);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getEmployeeRankings = async (req: any, res: any) => {
    try {
        const query = `
            SELECT 
                u.id, 
                u.name, 
                u.role, 
                u.department
            FROM users u
            WHERE u.status = 'active'
        `;
        const result = await pool.query(query);
        
        // Simulate composite scoring logic
        const rankings = result.rows.map((u: any, idx: number) => {
            // Generate deterministic pseudo-random scores based on ID for consistency during demo
            const seed = u.id * 13;
            const baseScore = 70 + (seed % 25); 
            
            return {
                rank: 0, // Assigned after sort
                id: u.id,
                name: u.name,
                role: u.role,
                department: u.department || 'Marketing',
                composite_score: baseScore,
                qc_score: Math.min(100, baseScore + (seed % 10)),
                effort_score: Math.min(100, baseScore - (seed % 5)),
                performance_score: Math.min(100, baseScore + (seed % 8)),
                trend: baseScore > 85 ? 'Up' : baseScore < 75 ? 'Down' : 'Flat'
            };
        }).sort((a: any, b: any) => b.composite_score - a.composite_score);

        // Assign ranks
        rankings.forEach((r: any, i: number) => r.rank = i + 1);

        res.status(200).json(rankings);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getEmployeeSkills = async (req: any, res: any) => {
    // Returns skills for the employee scorecard
    const skills = [
        { name: 'Content Strategy', score: 92, category: 'Strategy' },
        { name: 'SEO Optimization', score: 88, category: 'Technical' },
        { name: 'Data Analytics', score: 75, category: 'Data' },
        { name: 'Project Mgmt', score: 85, category: 'Soft Skills' },
        { name: 'Copywriting', score: 95, category: 'Content' }
    ];
    res.status(200).json(skills);
};

export const getEmployeeAchievements = async (req: any, res: any) => {
    const achievements = [
        { id: 1, title: 'Top Performer Q1', date: '2025-03-15', icon: '🏆', description: 'Highest composite score in Q1' },
        { id: 2, title: 'Bug Squasher', date: '2025-02-10', icon: '🐛', description: 'Resolved 50+ UX issues' },
        { id: 3, title: 'Viral Campaign', date: '2025-01-20', icon: '🚀', description: 'Campaign reached 1M+ views' }
    ];
    res.status(200).json(achievements);
};
