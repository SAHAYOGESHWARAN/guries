import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getGoldStandards = async (req: any, res: any) => {
    try {
        const result = await pool.query(`
            SELECT 
                g.*,
                u.name as owner_name,
                r.name as reviewer_name
            FROM gold_standards g
            LEFT JOIN users u ON g.owner_id = u.id
            LEFT JOIN users r ON g.reviewer_id = r.id
            ORDER BY g.created_at DESC
        `);

        res.status(200).json(result.rows);
    } catch (error: any) {
        console.error('Error fetching gold standards:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createGoldStandard = async (req: any, res: any) => {
    const {
        metric_name, category, description, why_matters, gold_standard_value,
        acceptable_range_min, acceptable_range_max, unit, source, evidence_link,
        file_upload, additional_notes, owner_id, reviewer_id, review_frequency, status, next_review_date, governance_notes
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO gold_standards (
                metric_name, category, description, why_matters, gold_standard_value,
                acceptable_range_min, acceptable_range_max, unit, source, evidence_link,
                file_upload, additional_notes, owner_id, reviewer_id, review_frequency, status, next_review_date, governance_notes, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) RETURNING *`,
            [
                metric_name,
                category,
                description || null,
                why_matters || null,
                gold_standard_value,
                acceptable_range_min || null,
                acceptable_range_max || null,
                unit || null,
                source || null,
                evidence_link || null,
                file_upload || null,
                additional_notes || null,
                owner_id || null,
                reviewer_id || null,
                review_frequency || 'Quarterly',
                status || 'Active',
                next_review_date || null,
                governance_notes || null,
                new Date().toISOString(),
                new Date().toISOString()
            ]
        );

        // Fetch with joined data
        const newItem = await pool.query(`
            SELECT 
                g.*,
                u.name as owner_name,
                r.name as reviewer_name
            FROM gold_standards g
            LEFT JOIN users u ON g.owner_id = u.id
            LEFT JOIN users r ON g.reviewer_id = r.id
            WHERE g.id = $1
        `, [result.rows[0].id]);

        getSocket().emit('gold_standard_created', newItem.rows[0]);
        res.status(201).json(newItem.rows[0]);
    } catch (error: any) {
        console.error('Error creating gold standard:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateGoldStandard = async (req: any, res: any) => {
    const { id } = req.params;
    const {
        metric_name, category, description, why_matters, gold_standard_value,
        acceptable_range_min, acceptable_range_max, unit, source, evidence_link,
        file_upload, additional_notes, owner_id, reviewer_id, review_frequency, status, next_review_date, governance_notes
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE gold_standards SET
                metric_name=COALESCE($1, metric_name),
                category=COALESCE($2, category),
                description=COALESCE($3, description),
                why_matters=COALESCE($4, why_matters),
                gold_standard_value=COALESCE($5, gold_standard_value),
                acceptable_range_min=COALESCE($6, acceptable_range_min),
                acceptable_range_max=COALESCE($7, acceptable_range_max),
                unit=COALESCE($8, unit),
                source=COALESCE($9, source),
                evidence_link=COALESCE($10, evidence_link),
                file_upload=COALESCE($11, file_upload),
                additional_notes=COALESCE($12, additional_notes),
                owner_id=COALESCE($13, owner_id),
                reviewer_id=COALESCE($14, reviewer_id),
                review_frequency=COALESCE($15, review_frequency),
                status=COALESCE($16, status),
                next_review_date=COALESCE($17, next_review_date),
                governance_notes=COALESCE($18, governance_notes),
                updated_at=$19
            WHERE id=$20 RETURNING *`,
            [
                metric_name, category, description, why_matters, gold_standard_value,
                acceptable_range_min, acceptable_range_max, unit, source, evidence_link,
                file_upload, additional_notes, owner_id, reviewer_id, review_frequency, status, next_review_date, governance_notes,
                new Date().toISOString(),
                id
            ]
        );

        // Fetch with joined data
        const updatedItem = await pool.query(`
            SELECT 
                g.*,
                u.name as owner_name,
                r.name as reviewer_name
            FROM gold_standards g
            LEFT JOIN users u ON g.owner_id = u.id
            LEFT JOIN users r ON g.reviewer_id = r.id
            WHERE g.id = $1
        `, [id]);

        getSocket().emit('gold_standard_updated', updatedItem.rows[0]);
        res.status(200).json(updatedItem.rows[0]);
    } catch (error: any) {
        console.error('Error updating gold standard:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteGoldStandard = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM gold_standards WHERE id = $1', [req.params.id]);
        getSocket().emit('gold_standard_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        console.error('Error deleting gold standard:', error);
        res.status(500).json({ error: error.message });
    }
};
