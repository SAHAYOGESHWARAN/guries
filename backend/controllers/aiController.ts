
import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getSocket } from '../socket';

export const generateEvaluation = async (req: Request, res: Response) => {
    const { userId, type, summary, strengths, weaknesses, recommendations } = req.body;
    
    try {
        const result = await pool.query(
            `INSERT INTO employee_evaluations (
                user_id, evaluation_type, summary, strengths, weaknesses, recommendations, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
            [userId, type || 'Automated', summary, strengths || [], weaknesses || [], recommendations || []]
        );
        
        const newEval = result.rows[0];
        getSocket().emit('evaluation_created', newEval);
        
        res.status(200).json({ 
            status: 'success', 
            message: 'Evaluation generated and saved.', 
            data: newEval
        });
    } catch (error: any) {
        console.error('AI Evaluation Error:', error);
        res.status(500).json({ error: error.message });
    }
};




