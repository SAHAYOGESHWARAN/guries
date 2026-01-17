import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getOKRs = async (req: any, res: any) => {
    try {
        const result = await pool.query(`
            SELECT 
                o.*,
                u.name as owner_name,
                r.name as reviewer_name
            FROM okrs o
            LEFT JOIN users u ON o.owner_id = u.id
            LEFT JOIN users r ON o.reviewer_id = r.id
            ORDER BY o.created_at DESC
        `);

        // Parse JSON fields
        const items = result.rows.map((item: any) => ({
            ...item,
            key_results: item.key_results ? (typeof item.key_results === 'string' ? JSON.parse(item.key_results) : item.key_results) : [],
            evidence_links: item.evidence_links ? (typeof item.evidence_links === 'string' ? JSON.parse(item.evidence_links) : item.evidence_links) : []
        }));

        res.status(200).json(items);
    } catch (error: any) {
        console.error('Error fetching OKRs:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createOKR = async (req: any, res: any) => {
    const {
        objective_title, objective_type, department, owner_id, cycle,
        objective_description, why_this_matters, expected_outcome, target_date,
        alignment, parent_okr_id, key_results, reviewer_id, review_notes,
        evidence_links, status, progress
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO okrs (
                objective_title, objective_type, department, owner_id, cycle,
                objective_description, why_this_matters, expected_outcome, target_date,
                alignment, parent_okr_id, key_results, reviewer_id, review_notes,
                evidence_links, status, progress, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *`,
            [
                objective_title,
                objective_type || 'Department',
                department || null,
                owner_id || null,
                cycle || 'Q1',
                objective_description || null,
                why_this_matters || null,
                expected_outcome || null,
                target_date || null,
                alignment || null,
                parent_okr_id || null,
                JSON.stringify(key_results || []),
                reviewer_id || null,
                review_notes || null,
                JSON.stringify(evidence_links || []),
                status || 'Draft',
                progress || 0,
                new Date().toISOString(),
                new Date().toISOString()
            ]
        );

        // Fetch with joined data
        const newItem = await pool.query(`
            SELECT 
                o.*,
                u.name as owner_name,
                r.name as reviewer_name
            FROM okrs o
            LEFT JOIN users u ON o.owner_id = u.id
            LEFT JOIN users r ON o.reviewer_id = r.id
            WHERE o.id = $1
        `, [result.rows[0].id]);

        const item = {
            ...newItem.rows[0],
            key_results: newItem.rows[0].key_results ? JSON.parse(newItem.rows[0].key_results) : [],
            evidence_links: newItem.rows[0].evidence_links ? JSON.parse(newItem.rows[0].evidence_links) : []
        };

        getSocket().emit('okr_created', item);
        res.status(201).json(item);
    } catch (error: any) {
        console.error('Error creating OKR:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateOKR = async (req: any, res: any) => {
    const { id } = req.params;
    const {
        objective_title, objective_type, department, owner_id, cycle,
        objective_description, why_this_matters, expected_outcome, target_date,
        alignment, parent_okr_id, key_results, reviewer_id, review_notes,
        evidence_links, status, progress
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE okrs SET
                objective_title=COALESCE($1, objective_title),
                objective_type=COALESCE($2, objective_type),
                department=COALESCE($3, department),
                owner_id=COALESCE($4, owner_id),
                cycle=COALESCE($5, cycle),
                objective_description=COALESCE($6, objective_description),
                why_this_matters=COALESCE($7, why_this_matters),
                expected_outcome=COALESCE($8, expected_outcome),
                target_date=COALESCE($9, target_date),
                alignment=COALESCE($10, alignment),
                parent_okr_id=COALESCE($11, parent_okr_id),
                key_results=COALESCE($12, key_results),
                reviewer_id=COALESCE($13, reviewer_id),
                review_notes=COALESCE($14, review_notes),
                evidence_links=COALESCE($15, evidence_links),
                status=COALESCE($16, status),
                progress=COALESCE($17, progress),
                updated_at=$18
            WHERE id=$19 RETURNING *`,
            [
                objective_title, objective_type, department, owner_id, cycle,
                objective_description, why_this_matters, expected_outcome, target_date,
                alignment, parent_okr_id,
                key_results ? JSON.stringify(key_results) : null,
                reviewer_id, review_notes,
                evidence_links ? JSON.stringify(evidence_links) : null,
                status, progress,
                new Date().toISOString(),
                id
            ]
        );

        // Fetch with joined data
        const updatedItem = await pool.query(`
            SELECT 
                o.*,
                u.name as owner_name,
                r.name as reviewer_name
            FROM okrs o
            LEFT JOIN users u ON o.owner_id = u.id
            LEFT JOIN users r ON o.reviewer_id = r.id
            WHERE o.id = $1
        `, [id]);

        const item = {
            ...updatedItem.rows[0],
            key_results: updatedItem.rows[0].key_results ? JSON.parse(updatedItem.rows[0].key_results) : [],
            evidence_links: updatedItem.rows[0].evidence_links ? JSON.parse(updatedItem.rows[0].evidence_links) : []
        };

        getSocket().emit('okr_updated', item);
        res.status(200).json(item);
    } catch (error: any) {
        console.error('Error updating OKR:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteOKR = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM okrs WHERE id = $1', [req.params.id]);
        getSocket().emit('okr_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        console.error('Error deleting OKR:', error);
        res.status(500).json({ error: error.message });
    }
};
