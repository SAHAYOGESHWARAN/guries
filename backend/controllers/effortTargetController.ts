import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getEffortTargets = async (req: any, res: any) => {
    try {
        const result = await pool.query(`
            SELECT 
                e.*,
                u.name as owner_name,
                r.name as reviewer_name
            FROM effort_targets e
            LEFT JOIN users u ON e.owner_id = u.id
            LEFT JOIN users r ON e.reviewer_id = r.id
            ORDER BY e.created_at DESC
        `);

        res.status(200).json(result.rows);
    } catch (error: any) {
        console.error('Error fetching effort targets:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createEffortTarget = async (req: any, res: any) => {
    const {
        department, role, kpi_category, effort_metric, effective_date, status,
        monthly_target, weekly_target, daily_target, max_capacity, min_completion_percent,
        weightage_percent, enable_ai_assignment, enable_load_balancing, enable_complexity_scoring,
        prevent_overload, reassign_if_target_not_met, max_tasks_per_day, max_tasks_per_campaign,
        allowed_rework_percent, delay_tolerance_percent, auto_assign_rules_summary,
        validation_rules, owner_id, reviewer_id, created_by
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO effort_targets (
                department, role, kpi_category, effort_metric, effective_date, status,
                monthly_target, weekly_target, daily_target, max_capacity, min_completion_percent,
                weightage_percent, enable_ai_assignment, enable_load_balancing, enable_complexity_scoring,
                prevent_overload, reassign_if_target_not_met, max_tasks_per_day, max_tasks_per_campaign,
                allowed_rework_percent, delay_tolerance_percent, auto_assign_rules_summary,
                validation_rules, owner_id, reviewer_id, created_by, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28) RETURNING *`,
            [
                department, role, kpi_category, effort_metric, effective_date, status || 'Draft',
                monthly_target || 0, weekly_target || 0, daily_target || 0, max_capacity || 0, min_completion_percent || 90,
                weightage_percent || 0, enable_ai_assignment ? 1 : 0, enable_load_balancing ? 1 : 0, enable_complexity_scoring ? 1 : 0,
                prevent_overload ? 1 : 0, reassign_if_target_not_met ? 1 : 0, max_tasks_per_day || 5, max_tasks_per_campaign || 20,
                allowed_rework_percent || 10, delay_tolerance_percent || 15, auto_assign_rules_summary || '',
                validation_rules ? JSON.stringify(validation_rules) : null, owner_id || null, reviewer_id || null, created_by || null,
                new Date().toISOString(), new Date().toISOString()
            ]
        );

        // Fetch with joined data
        const newItem = await pool.query(`
            SELECT 
                e.*,
                u.name as owner_name,
                r.name as reviewer_name
            FROM effort_targets e
            LEFT JOIN users u ON e.owner_id = u.id
            LEFT JOIN users r ON e.reviewer_id = r.id
            WHERE e.id = $1
        `, [result.rows[0].id]);

        const item = {
            ...newItem.rows[0],
            validation_rules: newItem.rows[0].validation_rules ? JSON.parse(newItem.rows[0].validation_rules) : []
        };

        getSocket().emit('effort_target_created', item);
        res.status(201).json(item);
    } catch (error: any) {
        console.error('Error creating effort target:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateEffortTarget = async (req: any, res: any) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const fields = Object.keys(updates).filter(key => updates[key] !== undefined);
        if (fields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const setClause = fields.map((field, i) => `${field}=$${i + 1}`).join(', ');
        const values = fields.map(field => {
            if (field === 'validation_rules' && typeof updates[field] === 'object') {
                return JSON.stringify(updates[field]);
            }
            if (['enable_ai_assignment', 'enable_load_balancing', 'enable_complexity_scoring', 'prevent_overload', 'reassign_if_target_not_met'].includes(field)) {
                return updates[field] ? 1 : 0;
            }
            return updates[field];
        });

        const result = await pool.query(
            `UPDATE effort_targets SET ${setClause}, updated_at=$${fields.length + 1} WHERE id=$${fields.length + 2} RETURNING *`,
            [...values, new Date().toISOString(), id]
        );

        // Fetch with joined data
        const updatedItem = await pool.query(`
            SELECT 
                e.*,
                u.name as owner_name,
                r.name as reviewer_name
            FROM effort_targets e
            LEFT JOIN users u ON e.owner_id = u.id
            LEFT JOIN users r ON e.reviewer_id = r.id
            WHERE e.id = $1
        `, [id]);

        const item = {
            ...updatedItem.rows[0],
            validation_rules: updatedItem.rows[0].validation_rules ? JSON.parse(updatedItem.rows[0].validation_rules) : []
        };

        getSocket().emit('effort_target_updated', item);
        res.status(200).json(item);
    } catch (error: any) {
        console.error('Error updating effort target:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteEffortTarget = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM effort_targets WHERE id = $1', [req.params.id]);
        getSocket().emit('effort_target_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        console.error('Error deleting effort target:', error);
        res.status(500).json({ error: error.message });
    }
};
