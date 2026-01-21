
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getServicePages = async (req: Request, res: Response) => {
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

export const createServicePage = async (req: Request, res: Response) => {
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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
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

export const updateServicePage = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        page_title, url, url_slug, page_type, service_id, sub_service_id,
        industry, target_keyword, primary_keyword, seo_score, audit_score,
        last_audit, status, meta_description, writer_id, seo_id, developer_id
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE service_pages SET 
                page_title=COALESCE(?, page_title),
                url=COALESCE(?, url),
                url_slug=COALESCE(?, url_slug),
                page_type=COALESCE(?, page_type),
                service_id=COALESCE(?, service_id),
                sub_service_id=COALESCE(?, sub_service_id),
                industry=COALESCE(?, industry),
                target_keyword=COALESCE(?, target_keyword),
                primary_keyword=COALESCE(?, primary_keyword),
                seo_score=COALESCE(?, seo_score),
                audit_score=COALESCE(?, audit_score),
                last_audit=COALESCE(?, last_audit),
                status=COALESCE(?, status),
                meta_description=COALESCE(?, meta_description),
                writer_id=COALESCE(?, writer_id),
                seo_id=COALESCE(?, seo_id),
                developer_id=COALESCE(?, developer_id),
                updated_at=datetime('now')
            WHERE id=?`,
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

export const deleteServicePage = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM service_pages WHERE id = ?', [req.params.id]);
        getSocket().emit('service_page_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
