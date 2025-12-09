
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

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
        const newUser = result.rows[0];
        getSocket().emit('user_created', newUser);
        res.status(201).json(newUser);
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
        const updatedUser = result.rows[0];
        getSocket().emit('user_updated', updatedUser);
        res.status(200).json(updatedUser);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteUser = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        getSocket().emit('user_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- Roles ---

export const getRoles = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM roles ORDER BY role_name ASC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createRole = async (req: any, res: any) => {
    const { role_name, permissions, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO roles (role_name, permissions, status, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
            [role_name, JSON.stringify(permissions || {}), status || 'Active']
        );
        const newRole = result.rows[0];
        getSocket().emit('role_created', newRole);
        res.status(201).json(newRole);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateRole = async (req: any, res: any) => {
    const { id } = req.params;
    const { role_name, permissions, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE roles SET role_name=COALESCE($1, role_name), permissions=COALESCE($2, permissions), status=COALESCE($3, status) WHERE id=$4 RETURNING *',
            [role_name, JSON.stringify(permissions), status, id]
        );
        const updatedRole = result.rows[0];
        getSocket().emit('role_updated', updatedRole);
        res.status(200).json(updatedRole);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteRole = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM roles WHERE id = $1', [req.params.id]);
        getSocket().emit('role_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
