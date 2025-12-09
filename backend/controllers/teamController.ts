
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';

export const getTeams = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM teams ORDER BY name ASC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createTeam = async (req: any, res: any) => {
    const { name, lead_user_id, description } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO teams (name, lead_user_id, description, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
            [name, lead_user_id, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateTeam = async (req: any, res: any) => {
    const { id } = req.params;
    const { name, lead_user_id, description } = req.body;
    try {
        const result = await pool.query(
            'UPDATE teams SET name=$1, lead_user_id=$2, description=$3 WHERE id=$4 RETURNING *',
            [name, lead_user_id, description, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteTeam = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM teams WHERE id = $1', [req.params.id]);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
