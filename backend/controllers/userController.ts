
import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getSocket } from '../socket';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY name ASC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createUser = async (req: Request, res: Response) => {
    const { name, email, role, department, country, status } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO users (name, email, role, department, country, status, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))",
            [name, email, role, department, country, status]
        );
        const newUser = result.rows[0];
        getSocket().emit('user_created', newUser);
        res.status(201).json(newUser);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email, role, department, country, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE users SET name=?, email=?, role=?, department=?, country=?, status=? WHERE id=?',
            [name, email, role, department, country, status, id]
        );
        const updatedUser = result.rows[0];
        getSocket().emit('user_updated', updatedUser);
        res.status(200).json(updatedUser);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        getSocket().emit('user_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- Roles ---

export const getRoles = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM roles ORDER BY role_name ASC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createRole = async (req: Request, res: Response) => {
    const { role_name, permissions, status } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO roles (role_name, permissions, status, created_at) VALUES (?, ?, ?, datetime('now'))",
            [role_name, JSON.stringify(permissions || {}), status || 'Active']
        );
        const newRole = result.rows[0];
        getSocket().emit('role_created', newRole);
        res.status(201).json(newRole);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateRole = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role_name, permissions, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE roles SET role_name=COALESCE(?, role_name), permissions=COALESCE(?, permissions), status=COALESCE(?, status) WHERE id=?',
            [role_name, JSON.stringify(permissions), status, id]
        );
        const updatedRole = result.rows[0];
        getSocket().emit('role_updated', updatedRole);
        res.status(200).json(updatedRole);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteRole = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM roles WHERE id = ?', [req.params.id]);
        getSocket().emit('role_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};




