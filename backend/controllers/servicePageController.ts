
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { getSocket } from '../socket';

export const getServicePages = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM service_pages ORDER BY id DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createServicePage = async (req: any, res: any) => {
    const { page_title, url, page_type, service_name, sub_service_name, seo_score, audit_score, primary_keyword, last_audit, status } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO service_pages (page_title, url, page_type, service_name, sub_service_name, seo_score, audit_score, primary_keyword, last_audit, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [page_title, url, page_type, service_name, sub_service_name, seo_score, audit_score, primary_keyword, last_audit, status]
        );
        const newItem = result.rows[0];
        getSocket().emit('service_page_created', newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateServicePage = async (req: any, res: any) => {
    const { id } = req.params;
    const { page_title, url, status, seo_score, audit_score, last_audit } = req.body;
    try {
        const result = await pool.query(
            'UPDATE service_pages SET page_title=COALESCE($1, page_title), url=COALESCE($2, url), status=COALESCE($3, status), seo_score=COALESCE($4, seo_score), audit_score=COALESCE($5, audit_score), last_audit=COALESCE($6, last_audit) WHERE id=$7 RETURNING *',
            [page_title, url, status, seo_score, audit_score, last_audit, id]
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
