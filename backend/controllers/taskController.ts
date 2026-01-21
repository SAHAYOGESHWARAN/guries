
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getTasks = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT 
                t.*,
                p.project_name,
                c.campaign_name,
                c.campaign_type,
                u.name as assignee_name
            FROM tasks t
            LEFT JOIN projects p ON t.project_id = p.id
            LEFT JOIN campaigns c ON t.campaign_id = c.id
            LEFT JOIN users u ON t.assigned_to = u.id
            ORDER BY t.due_date ASC
        `);
        // Add 'name' alias for 'task_name' for frontend compatibility
        const tasksWithNameAlias = result.rows.map((task: any) => ({
            ...task,
            name: task.task_name || task.name // Ensure 'name' field exists for frontend
        }));
        res.status(200).json(tasksWithNameAlias);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createTask = async (req: Request, res: Response) => {
    const {
        task_name, name, description, status, priority, assigned_to, project_id,
        campaign_id, due_date, campaign_type, sub_campaign, progress_stage,
        qc_stage, estimated_hours, tags, repo_links
    } = req.body;

    const taskName = task_name || name; // Support both field names

    try {
        const result = await pool.query(
            `INSERT INTO tasks (
                task_name, description, status, priority, assigned_to, project_id, 
                campaign_id, due_date, campaign_type, sub_campaign, progress_stage, 
                qc_stage, estimated_hours, tags, repo_links, rework_count, repo_link_count,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            [
                taskName, description, status || 'pending', priority || 'Medium',
                assigned_to || null, project_id || null, campaign_id || null, due_date || null,
                campaign_type || null, sub_campaign || null, progress_stage || 'Not Started',
                qc_stage || 'Pending', estimated_hours || null, tags || null, repo_links || null,
                0, 0
            ]
        );

        const newTask = result.rows[0];
        getSocket().emit('task_created', newTask);
        res.status(201).json(newTask);
    } catch (error: any) {
        console.error('Create task error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateTask = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        task_name, name, description, status, priority, assigned_to, project_id,
        campaign_id, due_date, campaign_type, sub_campaign, progress_stage,
        qc_stage, rework_count, repo_link_count, estimated_hours, tags, repo_links
    } = req.body;

    const taskName = task_name || name;

    try {
        const result = await pool.query(
            `UPDATE tasks SET 
                task_name = COALESCE(?, task_name),
                description = COALESCE(?, description),
                status = COALESCE(?, status), 
                priority = COALESCE(?, priority),
                assigned_to = COALESCE(?, assigned_to),
                project_id = COALESCE(?, project_id),
                campaign_id = COALESCE(?, campaign_id),
                due_date = COALESCE(?, due_date),
                campaign_type = COALESCE(?, campaign_type),
                sub_campaign = COALESCE(?, sub_campaign),
                progress_stage = COALESCE(?, progress_stage), 
                qc_stage = COALESCE(?, qc_stage),
                rework_count = COALESCE(?, rework_count),
                repo_link_count = COALESCE(?, repo_link_count),
                estimated_hours = COALESCE(?, estimated_hours),
                tags = COALESCE(?, tags),
                repo_links = COALESCE(?, repo_links),
                updated_at = datetime('now')
            WHERE id = ?`,
            [
                taskName, description, status, priority, assigned_to, project_id,
                campaign_id, due_date, campaign_type, sub_campaign, progress_stage,
                qc_stage, rework_count, repo_link_count, estimated_hours, tags, repo_links, id
            ]
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

export const deleteTask = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
        getSocket().emit('task_deleted', { id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};



