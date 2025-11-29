
import { Request, Response } from 'express';
import { pool } from '../config/db';

export const getUsers = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY name ASC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createUser = async (req: any, res: any) => {
    const { name, email, role, department, country, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO users (name, email, role, department, country, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
            [name, email, role, department, country, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateUser = async (req: any, res: any) => {
    const { id } = req.params;
    const { name, email, role, department, country, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE users SET name=$1, email=$2, role=$3, department=$4, country=$5, status=$6 WHERE id=$7 RETURNING *',
            [name, email, role, department, country, status, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteUser = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
