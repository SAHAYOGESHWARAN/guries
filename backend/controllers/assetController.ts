
import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getSocket } from '../socket';

export const getAssets = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM assets ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createAsset = async (req: any, res: any) => {
    const { name, type, repository, linked_task, owner_id, usage_status, social_meta } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO assets (
                asset_name, asset_type, file_url, description, tags, social_meta, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
            [name, type, repository, linked_task, owner_id, JSON.stringify(social_meta || {})]
        );

        const newAsset = result.rows[0];
        getSocket().emit('asset_created', newAsset);
        res.status(201).json(newAsset);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateAsset = async (req: any, res: any) => {
    const { id } = req.params;
    const { name, usage_status, linked_task, repository, type, social_meta } = req.body;

    try {
        const result = await pool.query(
            `UPDATE assets SET 
                asset_name = COALESCE($1, asset_name), 
                tags = COALESCE($2, tags), 
                file_url = COALESCE($3, file_url),
                description = COALESCE($4, description),
                asset_type = COALESCE($5, asset_type),
                social_meta = COALESCE($6, social_meta)
            WHERE id = $7 RETURNING *`,
            [name, usage_status, repository, linked_task, type, JSON.stringify(social_meta || {}), id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        const updatedAsset = result.rows[0];
        getSocket().emit('asset_updated', updatedAsset);
        res.status(200).json(updatedAsset);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteAsset = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM assets WHERE id = $1', [id]);
        getSocket().emit('asset_deleted', { id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Asset Library endpoints
export const getAssetLibrary = async (req: any, res: any) => {
    try {
        const result = await pool.query(`
            SELECT 
                id,
                asset_name as name,
                asset_type as type,
                COALESCE(tags, 'Content Repository') as repository,
                COALESCE(description, 'Available') as usage_status,
                file_url,
                og_image_url as thumbnail_url,
                created_at as date,
                linked_service_ids,
                linked_sub_service_ids
            FROM assets 
            ORDER BY created_at DESC
        `);

        // Parse JSON arrays for linked IDs
        const parsed = result.rows.map(row => ({
            ...row,
            linked_service_ids: row.linked_service_ids ? JSON.parse(row.linked_service_ids) : [],
            linked_sub_service_ids: row.linked_sub_service_ids ? JSON.parse(row.linked_sub_service_ids) : []
        }));

        res.status(200).json(parsed);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createAssetLibraryItem = async (req: any, res: any) => {
    const { name, type, repository, usage_status, file_url, thumbnail_url, file_size, file_type, date } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO assets (
                asset_name, asset_type, tags, description, file_url, og_image_url, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING 
                id,
                asset_name as name,
                asset_type as type,
                tags as repository,
                description as usage_status,
                file_url,
                og_image_url as thumbnail_url,
                created_at as date`,
            [name, type, repository, usage_status, file_url, thumbnail_url, date || new Date().toISOString()]
        );

        const newAsset = result.rows[0];
        getSocket().emit('assetLibrary_created', newAsset);
        res.status(201).json(newAsset);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateAssetLibraryItem = async (req: any, res: any) => {
    const { id } = req.params;
    const { name, type, repository, usage_status, file_url, thumbnail_url, linked_service_ids, linked_sub_service_ids } = req.body;

    try {
        const result = await pool.query(
            `UPDATE assets SET 
                asset_name = COALESCE($1, asset_name), 
                asset_type = COALESCE($2, asset_type), 
                tags = COALESCE($3, tags),
                description = COALESCE($4, description),
                file_url = COALESCE($5, file_url),
                og_image_url = COALESCE($6, og_image_url),
                linked_service_ids = COALESCE($7, linked_service_ids),
                linked_sub_service_ids = COALESCE($8, linked_sub_service_ids),
                updated_at = NOW()
            WHERE id = $9 RETURNING 
                id,
                asset_name as name,
                asset_type as type,
                tags as repository,
                description as usage_status,
                file_url,
                og_image_url as thumbnail_url,
                created_at as date,
                linked_service_ids,
                linked_sub_service_ids`,
            [
                name,
                type,
                repository,
                usage_status,
                file_url,
                thumbnail_url,
                linked_service_ids ? JSON.stringify(linked_service_ids) : null,
                linked_sub_service_ids ? JSON.stringify(linked_sub_service_ids) : null,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        const updatedAsset = {
            ...result.rows[0],
            linked_service_ids: result.rows[0].linked_service_ids ? JSON.parse(result.rows[0].linked_service_ids) : [],
            linked_sub_service_ids: result.rows[0].linked_sub_service_ids ? JSON.parse(result.rows[0].linked_sub_service_ids) : []
        };

        getSocket().emit('assetLibrary_updated', updatedAsset);
        res.status(200).json(updatedAsset);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteAssetLibraryItem = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM assets WHERE id = $1', [id]);
        getSocket().emit('assetLibrary_deleted', { id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
