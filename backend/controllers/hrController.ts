
import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getSocket } from '../socket';

// Get calculated workload forecast based on active tasks
export const getWorkloadForecast = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.id, 
                u.name, 
                u.role,
                COUNT(t.id) as current_load,
                -- Predictive load logic
                (COUNT(t.id) + 2) as predicted_load,
                25 as capacity
            FROM users u
            LEFT JOIN tasks t ON u.id = t.primary_owner_id AND t.status IN ('active', 'in_progress', 'pending')
            WHERE u.status = 'active'
            GROUP BY u.id, u.name, u.role
        `);

        const formatted = result.rows.map((row: any) => ({
            userId: row.id,
            initials: row.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
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

export const getRewardRecommendations = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT r.*, u.name, u.role 
            FROM reward_recommendations r
            JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC
        `);

        const formatted = result.rows.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            name: row.name,
            role: row.role,
            tier: row.tier,
            rank: 0, // Calculated frontend side or add ranking logic
            score: row.performance_score,
            recommendedBonus: parseFloat(row.recommended_bonus),
            status: row.status,
            achievements: row.achievements_summary ? row.achievements_summary.split(',') : []
        }));

        res.status(200).json(formatted);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateRewardStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body; // 'Approved' or 'Rejected'

    try {
        const result = await pool.query(
            "UPDATE reward_recommendations SET status = ?, updated_at = datetime('now') WHERE id = ?",
            [status, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'Reward not found' });

        const updatedReward = result.rows[0];
        getSocket().emit('reward_updated', updatedReward);
        res.status(200).json(updatedReward);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getEmployeeRankings = async (req: Request, res: Response) => {
    try {
        // Complex query to aggregate performance data
        const query = `
            SELECT 
                u.id, 
                u.name, 
                u.role, 
                u.department,
                (SELECT COUNT(*) FROM tasks t WHERE t.primary_owner_id = u.id AND t.status = 'completed') as tasks_completed,
                (SELECT AVG(final_score_percentage) FROM qc_runs qc WHERE qc.qc_owner_id = u.id) as avg_qc
            FROM users u
            WHERE u.status = 'active'
        `;
        const result = await pool.query(query);

        const rankings = result.rows.map((u: any, idx: number) => {
            const baseScore = 70 + (parseInt(u.tasks_completed || 0) * 2);

            return {
                rank: 0,
                id: u.id,
                name: u.name,
                role: u.role,
                department: u.department || 'Marketing',
                composite_score: Math.min(100, baseScore),
                qc_score: Math.round(u.avg_qc || 75),
                performance_score: Math.min(100, baseScore + 5),
                trend: baseScore > 85 ? 'Up' : 'Flat'
            };
        }).sort((a: any, b: any) => b.composite_score - a.composite_score);

        rankings.forEach((r: any, i: number) => r.rank = i + 1);

        res.status(200).json(rankings);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getEmployeeSkills = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM employee_skills ORDER BY score DESC');
        res.status(200).json(result.rows.map((r: any) => ({
            name: r.skill_name,
            score: r.score,
            category: r.category
        })));
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getEmployeeAchievements = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM employee_achievements ORDER BY date_awarded DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};




