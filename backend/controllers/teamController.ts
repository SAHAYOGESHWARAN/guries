
import { Request, Response } from 'express';
import { pool } from '../config/db';

export const getTeams = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM teams ORDER BY name ASC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createTeam = async (req: Request, res: Response) => {
    const { name, lead_user_id, description } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO teams (name, lead_user_id, description, created_at) VALUES (?, ?, ?, datetime('now'))",
            [name, lead_user_id, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateTeam = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, lead_user_id, description } = req.body;
    try {
        const result = await pool.query(
            'UPDATE teams SET name=?, lead_user_id=?, description=? WHERE id=?',
            [name, lead_user_id, description, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteTeam = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM teams WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};



