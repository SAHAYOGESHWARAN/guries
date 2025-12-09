
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

// Get all projects
export const getProjects = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects', details: error.message });
    }
};

// Get single project
export const getProjectById = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};

// Create new project
export const createProject = async (req: any, res: any) => {
    const { 
        brand_id, 
        project_name, 
        project_type, 
        project_status, 
        project_owner_id, 
        project_start_date, 
        project_end_date,
        objective,
        linked_services
    } = req.body;
    
    try {
        const query = `
            INSERT INTO projects (
                brand_id, project_name, project_type, project_status, 
                project_owner_id, project_start_date, project_end_date,
                objective, linked_services, created_at, last_updated
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
            RETURNING *;
        `;
        // Ensure array is stringified for JSONB column if using Postgres JSON type, 
        // or passed as array for TEXT[] array type. Assuming TEXT[] or JSONB.
        // Using JSON.stringify for safety if column is JSON/TEXT
        const values = [
            brand_id, project_name, project_type, project_status || 'planning', 
            project_owner_id, project_start_date, project_end_date,
            objective, JSON.stringify(linked_services || [])
        ];
        
        const result = await pool.query(query, values);
        const newProject = result.rows[0];
        
        getSocket().emit('project_created', newProject);
        
        res.status(201).json(newProject);
    } catch (error: any) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project', details: error.message });
    }
};

// Update project
export const updateProject = async (req: any, res: any) => {
    const { id } = req.params;
    const { 
        project_name, project_status, project_end_date, objective, 
        linked_services, project_owner_id, project_start_date 
    } = req.body;
    
    try {
        const result = await pool.query(
            `UPDATE projects SET 
                project_name = COALESCE($1, project_name), 
                project_status = COALESCE($2, project_status), 
                project_end_date = COALESCE($3, project_end_date),
                project_start_date = COALESCE($4, project_start_date),
                objective = COALESCE($5, objective),
                linked_services = COALESCE($6, linked_services),
                project_owner_id = COALESCE($7, project_owner_id),
                last_updated = NOW()
            WHERE id = $8 RETURNING *`,
            [
                project_name, project_status, project_end_date, project_start_date, 
                objective, JSON.stringify(linked_services), project_owner_id, id
            ]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        const updatedProject = result.rows[0];
        getSocket().emit('project_updated', updatedProject);
        
        res.status(200).json(updatedProject);
    } catch (error: any) {
        res.status(500).json({ error: 'Update failed', details: error.message });
    }
};

// Delete project
export const deleteProject = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        // Optional: Check for linked campaigns before delete
        // await pool.query('DELETE FROM campaigns WHERE project_id = $1', [id]);
        
        await pool.query('DELETE FROM projects WHERE id = $1', [id]);
        getSocket().emit('project_deleted', { id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: 'Delete failed', details: error.message });
    }
};
