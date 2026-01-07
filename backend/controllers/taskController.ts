
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getTasks = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY due_date ASC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createTask = async (req: any, res: any) => {
    const {
        task_name, name, description, status, priority, assigned_to, project_id, due_date
    } = req.body;

    const taskName = task_name || name; // Support both field names

    try {
        const result = await pool.query(
            `INSERT INTO tasks (
                task_name, description, status, priority, assigned_to, project_id, due_date, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, datetime('now'), datetime('now')) RETURNING *`,
            [taskName, description, status || 'pending', priority || 'medium', assigned_to, project_id, due_date]
        );

        const newTask = result.rows[0];
        getSocket().emit('task_created', newTask);
        res.status(201).json(newTask);
    } catch (error: any) {
        console.error('Create task error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateTask = async (req: any, res: any) => {
    const { id } = req.params;
    const { status, progress_stage, qc_stage, rework_count, repo_link_count } = req.body;

    try {
        const result = await pool.query(
            `UPDATE tasks SET 
                status = COALESCE($1, status), 
                progress_stage = COALESCE($2, progress_stage), 
                qc_stage = COALESCE($3, qc_stage),
                rework_count = COALESCE($4, rework_count),
                repo_link_count = COALESCE($5, repo_link_count),
                updated_at = NOW()
            WHERE id = $6 RETURNING *`,
            [status, progress_stage, qc_stage, rework_count, repo_link_count, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const updatedTask = result.rows[0];
        getSocket().emit('task_updated', updatedTask);
        res.status(200).json(updatedTask);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteTask = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        getSocket().emit('task_deleted', { id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
