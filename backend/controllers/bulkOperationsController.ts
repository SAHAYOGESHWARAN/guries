import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getSocket } from '../socket';

/**
 * Bulk delete operation
 * DELETE /api/v1/bulk/delete
 * Body: { entity: string, ids: number[] }
 */
export const bulkDelete = async (req: Request, res: Response) => {
    const { entity, ids } = req.body;

    if (!entity || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Invalid entity or ids' });
    }

    try {
        const tableName = getTableName(entity);
        if (!tableName) {
            return res.status(400).json({ error: 'Unknown entity type' });
        }

        const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
        await pool.query(`DELETE FROM ${tableName} WHERE id IN (${placeholders})`, ids);

        getSocket().emit(`${entity}_bulk_deleted`, { ids, count: ids.length });
        res.status(200).json({ success: true, deleted: ids.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Bulk update operation
 * PATCH /api/v1/bulk/update
 * Body: { entity: string, ids: number[], updates: object }
 */
export const bulkUpdate = async (req: Request, res: Response) => {
    const { entity, ids, updates } = req.body;

    if (!entity || !Array.isArray(ids) || ids.length === 0 || !updates) {
        return res.status(400).json({ error: 'Invalid parameters' });
    }

    try {
        const tableName = getTableName(entity);
        if (!tableName) {
            return res.status(400).json({ error: 'Unknown entity type' });
        }

        const updateFields = Object.keys(updates);
        const setClause = updateFields.map((field, i) => `${field}=$${i + 1}`).join(', ');
        const values = [...Object.values(updates), ...ids];
        const placeholders = ids.map((_, i) => `$${updateFields.length + i + 1}`).join(',');

        const result = await pool.query(
            `UPDATE ${tableName} SET ${setClause}, updated_at=datetime('now') WHERE id IN (${placeholders})`,
            values
        );

        getSocket().emit(`${entity}_bulk_updated`, { ids, count: result.rows.length });
        res.status(200).json({ success: true, updated: result.rows.length, data: result.rows });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Bulk status change
 * PATCH /api/v1/bulk/status
 * Body: { entity: string, ids: number[], status: string }
 */
export const bulkStatusChange = async (req: Request, res: Response) => {
    const { entity, ids, status } = req.body;

    if (!entity || !Array.isArray(ids) || ids.length === 0 || !status) {
        return res.status(400).json({ error: 'Invalid parameters' });
    }

    try {
        const tableName = getTableName(entity);
        if (!tableName) {
            return res.status(400).json({ error: 'Unknown entity type' });
        }

        const placeholders = ids.map((_, i) => `$${i + 2}`).join(',');
        const result = await pool.query(
            `UPDATE ${tableName} SET status=?, updated_at=datetime('now') WHERE id IN (${placeholders})`,
            [status, ...ids]
        );

        getSocket().emit(`${entity}_bulk_status_changed`, { ids, status, count: result.rows.length });
        res.status(200).json({ success: true, updated: result.rows.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Bulk assign to user
 * PATCH /api/v1/bulk/assign
 * Body: { entity: string, ids: number[], userId: number, field: string }
 */
export const bulkAssign = async (req: Request, res: Response) => {
    const { entity, ids, userId, field = 'assigned_to_id' } = req.body;

    if (!entity || !Array.isArray(ids) || ids.length === 0 || !userId) {
        return res.status(400).json({ error: 'Invalid parameters' });
    }

    try {
        const tableName = getTableName(entity);
        if (!tableName) {
            return res.status(400).json({ error: 'Unknown entity type' });
        }

        const placeholders = ids.map((_, i) => `$${i + 2}`).join(',');
        const result = await pool.query(
            `UPDATE ${tableName} SET ${field}=?, updated_at=datetime('now') WHERE id IN (${placeholders})`,
            [userId, ...ids]
        );

        getSocket().emit(`${entity}_bulk_assigned`, { ids, userId, count: result.rows.length });
        res.status(200).json({ success: true, assigned: result.rows.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Bulk duplicate/clone operation
 * POST /api/v1/bulk/duplicate
 * Body: { entity: string, ids: number[] }
 */
export const bulkDuplicate = async (req: Request, res: Response) => {
    const { entity, ids } = req.body;

    if (!entity || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Invalid parameters' });
    }

    try {
        const tableName = getTableName(entity);
        if (!tableName) {
            return res.status(400).json({ error: 'Unknown entity type' });
        }

        const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
        const sourceRows = await pool.query(
            `SELECT * FROM ${tableName} WHERE id IN (${placeholders})`,
            ids
        );

        const newIds: number[] = [];
        for (const row of sourceRows.rows) {
            const { id, created_at, updated_at, ...dataWithoutId } = row;
            const columns = Object.keys(dataWithoutId);
            const values = Object.values(dataWithoutId);
            const columnList = columns.join(', ');
            const valueList = columns.map((_, i) => `$${i + 1}`).join(', ');

            const result = await pool.query(
                `INSERT INTO ${tableName} (${columnList}, created_at, updated_at) VALUES (${valueList}, datetime('now'), datetime('now')) RETURNING id`,
                values
            );

            if (result.rows[0]) {
                newIds.push(result.rows[0].id);
            }
        }

        getSocket().emit(`${entity}_bulk_duplicated`, { sourceIds: ids, newIds, count: newIds.length });
        res.status(201).json({ success: true, duplicated: newIds.length, newIds });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Bulk export data
 * POST /api/v1/bulk/export
 * Body: { entity: string, ids: number[], format: 'csv' | 'json' }
 */
export const bulkExport = async (req: Request, res: Response) => {
    const { entity, ids, format = 'json' } = req.body;

    if (!entity || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Invalid parameters' });
    }

    try {
        const tableName = getTableName(entity);
        if (!tableName) {
            return res.status(400).json({ error: 'Unknown entity type' });
        }

        const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
        const result = await pool.query(
            `SELECT * FROM ${tableName} WHERE id IN (${placeholders})`,
            ids
        );

        if (format === 'csv') {
            const headers = Object.keys(result.rows[0] || {});
            const csvContent = [
                headers.join(','),
                ...result.rows.map(row =>
                    headers.map(h => {
                        const val = row[h];
                        if (val === null) return '';
                        if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
                        return val;
                    }).join(',')
                )
            ].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${entity}_export.csv"`);
            res.send(csvContent);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="${entity}_export.json"`);
            res.json(result.rows);
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Helper function to map entity names to table names
 */
function getTableName(entity: string): string | null {
    const mapping: Record<string, string> = {
        services: 'services',
        subServices: 'sub_services',
        tasks: 'tasks',
        campaigns: 'campaigns',
        projects: 'projects',
        assetLibrary: 'assets',
        assets: 'assets',
        keywords: 'keywords',
        users: 'users',
        teams: 'teams',
        brands: 'brands',
        content: 'content_repository',
        backlinks: 'backlinks',
        competitors: 'competitors',
        urlErrors: 'url_errors',
        onPageSeoAudits: 'on_page_seo_audits',
        toxicBacklinks: 'toxic_backlinks',
        uxIssues: 'ux_issues'
    };

    return mapping[entity] || null;
}




