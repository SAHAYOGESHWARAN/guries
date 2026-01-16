
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getTasks = async (req: any, res: any) => {
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

export const createTask = async (req: any, res: any) => {
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
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, datetime('now'), datetime('now')) RETURNING *`,
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

export const updateTask = async (req: any, res: any) => {
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
                task_name = COALESCE($1, task_name),
                description = COALESCE($2, description),
                status = COALESCE($3, status), 
                priority = COALESCE($4, priority),
                assigned_to = COALESCE($5, assigned_to),
                project_id = COALESCE($6, project_id),
                campaign_id = COALESCE($7, campaign_id),
                due_date = COALESCE($8, due_date),
                campaign_type = COALESCE($9, campaign_type),
                sub_campaign = COALESCE($10, sub_campaign),
                progress_stage = COALESCE($11, progress_stage), 
                qc_stage = COALESCE($12, qc_stage),
                rework_count = COALESCE($13, rework_count),
                repo_link_count = COALESCE($14, repo_link_count),
                estimated_hours = COALESCE($15, estimated_hours),
                tags = COALESCE($16, tags),
                repo_links = COALESCE($17, repo_links),
                updated_at = datetime('now')
            WHERE id = $18 RETURNING *`,
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
