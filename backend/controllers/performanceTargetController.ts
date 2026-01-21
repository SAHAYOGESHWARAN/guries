import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getPerformanceTargets = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT 
                p.*,
                u.name as owner_name,
                r.name as reviewer_name
            FROM performance_targets p
            LEFT JOIN users u ON p.owner_id = u.id
            LEFT JOIN users r ON p.reviewer_id = r.id
            ORDER BY p.created_at DESC
        `);

        res.status(200).json(result.rows);
    } catch (error: any) {
        console.error('Error fetching performance targets:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createPerformanceTarget = async (req: Request, res: Response) => {
    const {
        target_level, brand_id, brand_name, tutorials_india, department_function, applies_to,
        kpi_name, metric_type, unit, direction, examples, baseline_value, current_performance,
        target_value, desired_performance, cycle_type, period_from, period_to, tolerance_min,
        tolerance_max, gold_standard_metric_id, gold_standard_value, competitor_benchmark,
        your_target, your_current, competitor_current, review_frequency, auto_evaluate,
        data_source, validation_rules, auto_calculate_score, trigger_alert_70_percent,
        trigger_alert_110_percent, trigger_alert_downward_trend, use_in_okr_evaluation,
        use_in_employee_scorecards, use_in_project_health_score, use_in_dashboard_highlights,
        performance_scoring_logic, achievement_calculation, score_capping_logic,
        status_achieved_green, status_on_track_yellow, status_off_track_red,
        owner_id, reviewer_id, responsible_roles, created_by
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO performance_targets (
                target_level, brand_id, brand_name, tutorials_india, department_function, applies_to,
                kpi_name, metric_type, unit, direction, examples, baseline_value, current_performance,
                target_value, desired_performance, cycle_type, period_from, period_to, tolerance_min,
                tolerance_max, gold_standard_metric_id, gold_standard_value, competitor_benchmark,
                your_target, your_current, competitor_current, review_frequency, auto_evaluate,
                data_source, validation_rules, auto_calculate_score, trigger_alert_70_percent,
                trigger_alert_110_percent, trigger_alert_downward_trend, use_in_okr_evaluation,
                use_in_employee_scorecards, use_in_project_health_score, use_in_dashboard_highlights,
                performance_scoring_logic, achievement_calculation, score_capping_logic,
                status_achieved_green, status_on_track_yellow, status_off_track_red,
                owner_id, reviewer_id, responsible_roles, created_by, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                target_level, brand_id, brand_name, tutorials_india, department_function, applies_to,
                kpi_name, metric_type, unit, direction, examples, baseline_value, current_performance,
                target_value, desired_performance, cycle_type || 'Monthly', period_from, period_to, tolerance_min,
                tolerance_max, gold_standard_metric_id, gold_standard_value, competitor_benchmark,
                your_target, your_current, competitor_current, review_frequency || 'Monthly', auto_evaluate ? 1 : 0,
                data_source, validation_rules ? JSON.stringify(validation_rules) : null, auto_calculate_score ? 1 : 0,
                trigger_alert_70_percent ? 1 : 0, trigger_alert_110_percent ? 1 : 0, trigger_alert_downward_trend ? 1 : 0,
                use_in_okr_evaluation ? 1 : 0, use_in_employee_scorecards ? 1 : 0, use_in_project_health_score ? 1 : 0,
                use_in_dashboard_highlights ? 1 : 0, performance_scoring_logic, achievement_calculation, score_capping_logic,
                status_achieved_green, status_on_track_yellow, status_off_track_red,
                owner_id || null, reviewer_id || null, responsible_roles, created_by || null,
                new Date().toISOString(), new Date().toISOString()
            ]
        );

        // Fetch with joined data
        const newItem = await pool.query(`
            SELECT 
                p.*,
                u.name as owner_name,
                r.name as reviewer_name
            FROM performance_targets p
            LEFT JOIN users u ON p.owner_id = u.id
            LEFT JOIN users r ON p.reviewer_id = r.id
            WHERE p.id = ?
        `, [result.rows[0].id]);

        const item = {
            ...newItem.rows[0],
            validation_rules: newItem.rows[0].validation_rules ? JSON.parse(newItem.rows[0].validation_rules) : []
        };

        getSocket().emit('performance_target_created', item);
        res.status(201).json(item);
    } catch (error: any) {
        console.error('Error creating performance target:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updatePerformanceTarget = async (req: Request, res: Response) => {
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
            if (['auto_evaluate', 'auto_calculate_score', 'trigger_alert_70_percent', 'trigger_alert_110_percent', 'trigger_alert_downward_trend', 'use_in_okr_evaluation', 'use_in_employee_scorecards', 'use_in_project_health_score', 'use_in_dashboard_highlights'].includes(field)) {
                return updates[field] ? 1 : 0;
            }
            return updates[field];
        });

        const result = await pool.query(
            `UPDATE performance_targets SET ${setClause}, updated_at=$${fields.length + 1} WHERE id=$${fields.length + 2}`,
            [...values, new Date().toISOString(), id]
        );

        // Fetch with joined data
        const updatedItem = await pool.query(`
            SELECT 
                p.*,
                u.name as owner_name,
                r.name as reviewer_name
            FROM performance_targets p
            LEFT JOIN users u ON p.owner_id = u.id
            LEFT JOIN users r ON p.reviewer_id = r.id
            WHERE p.id = ?
        `, [id]);

        const item = {
            ...updatedItem.rows[0],
            validation_rules: updatedItem.rows[0].validation_rules ? JSON.parse(updatedItem.rows[0].validation_rules) : []
        };

        getSocket().emit('performance_target_updated', item);
        res.status(200).json(item);
    } catch (error: any) {
        console.error('Error updating performance target:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deletePerformanceTarget = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM performance_targets WHERE id = ?', [req.params.id]);
        getSocket().emit('performance_target_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        console.error('Error deleting performance target:', error);
        res.status(500).json({ error: error.message });
    }
};

