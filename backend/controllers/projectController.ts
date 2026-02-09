import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getSocket } from '../socket';

// Get all projects with related data
export const getProjects = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT p.*, 
                u.name as owner_name,
                b.name as brand_name,
                (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status != 'completed') as open_tasks,
                (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completed') as closed_tasks
            FROM projects p
            LEFT JOIN users u ON p.owner_id = u.id
            LEFT JOIN brands b ON p.brand_id = b.id
            ORDER BY p.created_at DESC
        `);
        res.status(200).json(result.rows);
    } catch (error: any) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects', details: error.message });
    }
};

// Get single project with full details
export const getProjectById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT p.*, 
                u.name as owner_name,
                b.name as brand_name
            FROM projects p
            LEFT JOIN users u ON p.owner_id = u.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.id = ?
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};

// Create new project
export const createProject = async (req: Request, res: Response) => {
    const {
        project_name,
        project_code,
        description,
        status,
        start_date,
        end_date,
        budget,
        owner_id,
        brand_id,
        linked_service_id,
        priority,
        sub_services,
        outcome_kpis,
        expected_outcome,
        team_members,
        weekly_report
    } = req.body;

    try {
        const query = `
            INSERT INTO projects (
                project_name, project_code, description, status, 
                start_date, end_date, budget, owner_id, brand_id,
                linked_service_id, priority, sub_services, outcome_kpis,
                expected_outcome, team_members, weekly_report,
                created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'));
        `;
        const values = [
            project_name,
            project_code || `PRJ-${Date.now()}`,
            description || null,
            status || 'Planned',
            start_date || null,
            end_date || null,
            budget || null,
            owner_id || null,
            brand_id || null,
            linked_service_id || null,
            priority || 'Medium',
            sub_services || null,
            outcome_kpis || null,
            expected_outcome || null,
            team_members || null,
            weekly_report !== undefined ? (weekly_report ? 1 : 0) : 1
        ];

        const insertResult = await pool.query(query, values);
        const projectId = insertResult.rows[0]?.id || insertResult.lastID;

        // Fetch the complete project record with related data
        const selectResult = await pool.query(`
            SELECT p.*, 
                u.name as owner_name,
                b.name as brand_name
            FROM projects p
            LEFT JOIN users u ON p.owner_id = u.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.id = ?
        `, [projectId]);

        const newProject = selectResult.rows[0];

        getSocket().emit('project_created', newProject);
        res.status(201).json(newProject);
    } catch (error: any) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project', details: error.message });
    }
};

// Update project
export const updateProject = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        project_name, description, status, start_date, end_date,
        owner_id, brand_id, linked_service_id, priority,
        sub_services, outcome_kpis, expected_outcome, team_members, weekly_report
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE projects SET 
                project_name = COALESCE(?, project_name), 
                description = COALESCE(?, description), 
                status = COALESCE(?, status),
                start_date = COALESCE(?, start_date),
                end_date = COALESCE(?, end_date),
                owner_id = COALESCE(?, owner_id),
                brand_id = COALESCE(?, brand_id),
                linked_service_id = COALESCE(?, linked_service_id),
                priority = COALESCE(?, priority),
                sub_services = COALESCE(?, sub_services),
                outcome_kpis = COALESCE(?, outcome_kpis),
                expected_outcome = COALESCE(?, expected_outcome),
                team_members = COALESCE(?, team_members),
                weekly_report = COALESCE(?, weekly_report),
                updated_at = datetime('now')
            WHERE id = ?`,
            [
                project_name, description, status, start_date, end_date,
                owner_id, brand_id, linked_service_id, priority,
                sub_services, outcome_kpis, expected_outcome, team_members,
                weekly_report !== undefined ? (weekly_report ? 1 : 0) : null,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const updatedProject = result.rows[0];
        getSocket().emit('project_updated', updatedProject);
        res.status(200).json(updatedProject);
    } catch (error: any) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Update failed', details: error.message });
    }
};

// Delete project
export const deleteProject = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM projects WHERE id = ?', [id]);
        getSocket().emit('project_deleted', { id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: 'Delete failed', details: error.message });
    }
};




