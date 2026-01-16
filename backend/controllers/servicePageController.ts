
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getServicePages = async (req: any, res: any) => {
    try {
        const result = await pool.query(`
            SELECT 
                sp.*,
                s.service_name,
                ss.sub_service_name,
                w.name as writer_name,
                seo.name as seo_name,
                dev.name as developer_name
            FROM service_pages sp
            LEFT JOIN services s ON sp.service_id = s.id
            LEFT JOIN sub_services ss ON sp.sub_service_id = ss.id
            LEFT JOIN users w ON sp.writer_id = w.id
            LEFT JOIN users seo ON sp.seo_id = seo.id
            LEFT JOIN users dev ON sp.developer_id = dev.id
            ORDER BY sp.updated_at DESC
        `);
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createServicePage = async (req: any, res: any) => {
    const {
        page_title, url, url_slug, page_type, service_id, sub_service_id,
        industry, target_keyword, primary_keyword, seo_score, audit_score,
        last_audit, status, meta_description, writer_id, seo_id, developer_id
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO service_pages (
                page_title, url, url_slug, page_type, service_id, sub_service_id,
                industry, target_keyword, primary_keyword, seo_score, audit_score,
                last_audit, status, meta_description, writer_id, seo_id, developer_id,
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, datetime('now'), datetime('now')) RETURNING *`,
            [
                page_title, url || `/services/${url_slug || ''}`, url_slug, page_type || 'Service Page',
                service_id || null, sub_service_id || null, industry || null,
                target_keyword || null, primary_keyword || target_keyword || null,
                seo_score || 0, audit_score || 0, last_audit || null,
                status || 'Draft', meta_description || null,
                writer_id || null, seo_id || null, developer_id || null
            ]
        );
        const newItem = result.rows[0];
        getSocket().emit('service_page_created', newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        console.error('Create service page error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateServicePage = async (req: any, res: any) => {
    const { id } = req.params;
    const {
        page_title, url, url_slug, page_type, service_id, sub_service_id,
        industry, target_keyword, primary_keyword, seo_score, audit_score,
        last_audit, status, meta_description, writer_id, seo_id, developer_id
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE service_pages SET 
                page_title=COALESCE($1, page_title),
                url=COALESCE($2, url),
                url_slug=COALESCE($3, url_slug),
                page_type=COALESCE($4, page_type),
                service_id=COALESCE($5, service_id),
                sub_service_id=COALESCE($6, sub_service_id),
                industry=COALESCE($7, industry),
                target_keyword=COALESCE($8, target_keyword),
                primary_keyword=COALESCE($9, primary_keyword),
                seo_score=COALESCE($10, seo_score),
                audit_score=COALESCE($11, audit_score),
                last_audit=COALESCE($12, last_audit),
                status=COALESCE($13, status),
                meta_description=COALESCE($14, meta_description),
                writer_id=COALESCE($15, writer_id),
                seo_id=COALESCE($16, seo_id),
                developer_id=COALESCE($17, developer_id),
                updated_at=datetime('now')
            WHERE id=$18 RETURNING *`,
            [
                page_title, url, url_slug, page_type, service_id, sub_service_id,
                industry, target_keyword, primary_keyword, seo_score, audit_score,
                last_audit, status, meta_description, writer_id, seo_id, developer_id, id
            ]
        );
        const updatedItem = result.rows[0];
        getSocket().emit('service_page_updated', updatedItem);
        res.status(200).json(updatedItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteServicePage = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM service_pages WHERE id = $1', [req.params.id]);
        getSocket().emit('service_page_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
