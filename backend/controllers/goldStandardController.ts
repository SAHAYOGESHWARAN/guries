import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getGoldStandards = async (req: Request, res: Response) => {
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

export const createGoldStandard = async (req: Request, res: Response) => {
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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
            WHERE g.id = ?
        `, [result.rows[0].id]);

        getSocket().emit('gold_standard_created', newItem.rows[0]);
        res.status(201).json(newItem.rows[0]);
    } catch (error: any) {
        console.error('Error creating gold standard:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateGoldStandard = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        metric_name, category, description, why_matters, gold_standard_value,
        acceptable_range_min, acceptable_range_max, unit, source, evidence_link,
        file_upload, additional_notes, owner_id, reviewer_id, review_frequency, status, next_review_date, governance_notes
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE gold_standards SET
                metric_name=COALESCE(?, metric_name),
                category=COALESCE(?, category),
                description=COALESCE(?, description),
                why_matters=COALESCE(?, why_matters),
                gold_standard_value=COALESCE(?, gold_standard_value),
                acceptable_range_min=COALESCE(?, acceptable_range_min),
                acceptable_range_max=COALESCE(?, acceptable_range_max),
                unit=COALESCE(?, unit),
                source=COALESCE(?, source),
                evidence_link=COALESCE(?, evidence_link),
                file_upload=COALESCE(?, file_upload),
                additional_notes=COALESCE(?, additional_notes),
                owner_id=COALESCE(?, owner_id),
                reviewer_id=COALESCE(?, reviewer_id),
                review_frequency=COALESCE(?, review_frequency),
                status=COALESCE(?, status),
                next_review_date=COALESCE(?, next_review_date),
                governance_notes=COALESCE(?, governance_notes),
                updated_at=?
            WHERE id=?`,
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
            WHERE g.id = ?
        `, [id]);

        getSocket().emit('gold_standard_updated', updatedItem.rows[0]);
        res.status(200).json(updatedItem.rows[0]);
    } catch (error: any) {
        console.error('Error updating gold standard:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteGoldStandard = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM gold_standards WHERE id = ?', [req.params.id]);
        getSocket().emit('gold_standard_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        console.error('Error deleting gold standard:', error);
        res.status(500).json({ error: error.message });
    }
};
