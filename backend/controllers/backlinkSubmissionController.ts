import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getSubmissions = async (req: any, res: any) => {
    try {
        const result = await pool.query(`
            SELECT 
                bs.*,
                s.service_name,
                ss.sub_service_name,
                u.name as seo_owner_name
            FROM backlink_submissions bs
            LEFT JOIN services s ON bs.service_id = s.id
            LEFT JOIN sub_services ss ON bs.sub_service_id = ss.id
            LEFT JOIN users u ON bs.seo_owner_id = u.id
            ORDER BY bs.created_at DESC
        `);
        res.status(200).json(result.rows);
    } catch (error: any) {
        console.error('Error fetching backlink submissions:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createSubmission = async (req: any, res: any) => {
    const {
        domain,
        opportunity_type,
        category,
        target_url,
        anchor_text,
        content_used,
        da_score,
        spam_score,
        country,
        service_id,
        sub_service_id,
        seo_owner_id,
        is_paid,
        submission_status
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO backlink_submissions (
                domain, opportunity_type, category, target_url, anchor_text, 
                content_used, da_score, spam_score, country, service_id, 
                sub_service_id, seo_owner_id, is_paid, submission_status, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
            [
                domain,
                opportunity_type || 'Guest Post',
                category || null,
                target_url,
                anchor_text,
                content_used || null,
                da_score || null,
                spam_score || null,
                country || null,
                service_id || null,
                sub_service_id || null,
                seo_owner_id || null,
                is_paid ? 1 : 0,
                submission_status || 'Pending',
                new Date().toISOString(),
                new Date().toISOString()
            ]
        );

        // Fetch with joined data
        const newItem = await pool.query(`
            SELECT 
                bs.*,
                s.service_name,
                ss.sub_service_name,
                u.name as seo_owner_name
            FROM backlink_submissions bs
            LEFT JOIN services s ON bs.service_id = s.id
            LEFT JOIN sub_services ss ON bs.sub_service_id = ss.id
            LEFT JOIN users u ON bs.seo_owner_id = u.id
            WHERE bs.id = $1
        `, [result.rows[0].id]);

        getSocket().emit('submission_created', newItem.rows[0]);
        res.status(201).json(newItem.rows[0]);
    } catch (error: any) {
        console.error('Error creating backlink submission:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateSubmission = async (req: any, res: any) => {
    const { id } = req.params;
    const {
        domain,
        opportunity_type,
        category,
        target_url,
        anchor_text,
        content_used,
        da_score,
        spam_score,
        country,
        service_id,
        sub_service_id,
        seo_owner_id,
        is_paid,
        submission_status
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE backlink_submissions SET 
                domain=COALESCE($1, domain),
                opportunity_type=COALESCE($2, opportunity_type),
                category=COALESCE($3, category),
                target_url=COALESCE($4, target_url), 
                anchor_text=COALESCE($5, anchor_text), 
                content_used=COALESCE($6, content_used), 
                da_score=COALESCE($7, da_score),
                spam_score=COALESCE($8, spam_score),
                country=COALESCE($9, country),
                service_id=COALESCE($10, service_id),
                sub_service_id=COALESCE($11, sub_service_id),
                seo_owner_id=COALESCE($12, seo_owner_id),
                is_paid=COALESCE($13, is_paid),
                submission_status=COALESCE($14, submission_status),
                updated_at=$15
            WHERE id=$16 RETURNING *`,
            [
                domain,
                opportunity_type,
                category,
                target_url,
                anchor_text,
                content_used,
                da_score,
                spam_score,
                country,
                service_id,
                sub_service_id,
                seo_owner_id,
                is_paid !== undefined ? (is_paid ? 1 : 0) : null,
                submission_status,
                new Date().toISOString(),
                id
            ]
        );

        // Fetch with joined data
        const updatedItem = await pool.query(`
            SELECT 
                bs.*,
                s.service_name,
                ss.sub_service_name,
                u.name as seo_owner_name
            FROM backlink_submissions bs
            LEFT JOIN services s ON bs.service_id = s.id
            LEFT JOIN sub_services ss ON bs.sub_service_id = ss.id
            LEFT JOIN users u ON bs.seo_owner_id = u.id
            WHERE bs.id = $1
        `, [id]);

        getSocket().emit('submission_updated', updatedItem.rows[0]);
        res.status(200).json(updatedItem.rows[0]);
    } catch (error: any) {
        console.error('Error updating backlink submission:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteSubmission = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM backlink_submissions WHERE id = $1', [req.params.id]);
        getSocket().emit('submission_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        console.error('Error deleting backlink submission:', error);
        res.status(500).json({ error: error.message });
    }
};
