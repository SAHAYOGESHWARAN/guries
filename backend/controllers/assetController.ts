
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
                asset_category,
                asset_format,
                tags as repository,
                description as usage_status,
                status,
                file_url,
                COALESCE(og_image_url, thumbnail_url, file_url) as thumbnail_url,
                file_size,
                file_type,
                created_at as date,
                linked_service_ids,
                linked_sub_service_ids,
                application_type,
                web_title,
                web_description,
                web_keywords,
                web_url,
                web_h1,
                web_h2_1,
                web_h2_2,
                web_thumbnail,
                web_body_content,
                smm_platform,
                smm_title,
                smm_tag,
                smm_url,
                smm_description,
                smm_hashtags,
                smm_media_url,
                smm_media_type
            FROM assets 
            ORDER BY created_at DESC
        `);

        // Parse JSON arrays for linked IDs
        const parsed = result.rows.map(row => ({
            ...row,
            repository: row.repository || 'Content Repository',
            usage_status: row.usage_status || 'Available',
            linked_service_ids: row.linked_service_ids ? JSON.parse(row.linked_service_ids) : [],
            linked_sub_service_ids: row.linked_sub_service_ids ? JSON.parse(row.linked_sub_service_ids) : []
        }));

        res.status(200).json(parsed);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createAssetLibraryItem = async (req: any, res: any) => {
    const {
        name, type, repository, usage_status, file_url, thumbnail_url, file_size, file_type, date,
        asset_category, asset_format, status, linked_service_ids, linked_sub_service_ids,
        application_type, web_title, web_description, web_keywords, web_url, web_h1, web_h2_1, web_h2_2,
        web_thumbnail, web_body_content, smm_platform, smm_title, smm_tag, smm_url, smm_description,
        smm_hashtags, smm_media_url, smm_media_type
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO assets (
                asset_name, asset_type, asset_category, asset_format, tags, description, status,
                file_url, og_image_url, thumbnail_url, file_size, file_type,
                linked_service_ids, linked_sub_service_ids, created_at,
                application_type, web_title, web_description, web_keywords, web_url, web_h1, web_h2_1, web_h2_2,
                web_thumbnail, web_body_content, smm_platform, smm_title, smm_tag, smm_url, smm_description,
                smm_hashtags, smm_media_url, smm_media_type
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33) RETURNING 
                id,
                asset_name as name,
                asset_type as type,
                asset_category,
                asset_format,
                tags as repository,
                description as usage_status,
                status,
                file_url,
                COALESCE(og_image_url, thumbnail_url, file_url) as thumbnail_url,
                file_size,
                file_type,
                linked_service_ids,
                linked_sub_service_ids,
                created_at as date,
                application_type,
                web_title, web_description, web_keywords, web_url, web_h1, web_h2_1, web_h2_2, web_thumbnail, web_body_content,
                smm_platform, smm_title, smm_tag, smm_url, smm_description, smm_hashtags, smm_media_url, smm_media_type`,
            [
                name, type, asset_category, asset_format, repository, usage_status, status,
                file_url, thumbnail_url, thumbnail_url, file_size, file_type,
                linked_service_ids ? JSON.stringify(linked_service_ids) : null,
                linked_sub_service_ids ? JSON.stringify(linked_sub_service_ids) : null,
                date || new Date().toISOString(),
                application_type, web_title, web_description, web_keywords, web_url, web_h1, web_h2_1, web_h2_2,
                web_thumbnail, web_body_content, smm_platform, smm_title, smm_tag, smm_url, smm_description,
                smm_hashtags, smm_media_url, smm_media_type
            ]
        );

        const newAsset = {
            ...result.rows[0],
            repository: result.rows[0].repository || 'Content Repository',
            usage_status: result.rows[0].usage_status || 'Available',
            linked_service_ids: result.rows[0].linked_service_ids ? JSON.parse(result.rows[0].linked_service_ids) : [],
            linked_sub_service_ids: result.rows[0].linked_sub_service_ids ? JSON.parse(result.rows[0].linked_sub_service_ids) : []
        };

        getSocket().emit('assetLibrary_created', newAsset);
        res.status(201).json(newAsset);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateAssetLibraryItem = async (req: any, res: any) => {
    const { id } = req.params;
    const {
        name, type, repository, usage_status, file_url, thumbnail_url, linked_service_ids, linked_sub_service_ids,
        asset_category, asset_format, status,
        application_type, web_title, web_description, web_keywords, web_url, web_h1, web_h2_1, web_h2_2,
        web_thumbnail, web_body_content, smm_platform, smm_title, smm_tag, smm_url, smm_description,
        smm_hashtags, smm_media_url, smm_media_type
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE assets SET 
                asset_name = COALESCE($1, asset_name), 
                asset_type = COALESCE($2, asset_type),
                asset_category = COALESCE($3, asset_category),
                asset_format = COALESCE($4, asset_format),
                tags = COALESCE($5, tags),
                description = COALESCE($6, description),
                status = COALESCE($7, status),
                file_url = COALESCE($8, file_url),
                og_image_url = COALESCE($9, og_image_url),
                thumbnail_url = COALESCE($10, thumbnail_url),
                linked_service_ids = COALESCE($11, linked_service_ids),
                linked_sub_service_ids = COALESCE($12, linked_sub_service_ids),
                application_type = COALESCE($13, application_type),
                web_title = COALESCE($14, web_title),
                web_description = COALESCE($15, web_description),
                web_keywords = COALESCE($16, web_keywords),
                web_url = COALESCE($17, web_url),
                web_h1 = COALESCE($18, web_h1),
                web_h2_1 = COALESCE($19, web_h2_1),
                web_h2_2 = COALESCE($20, web_h2_2),
                web_thumbnail = COALESCE($21, web_thumbnail),
                web_body_content = COALESCE($22, web_body_content),
                smm_platform = COALESCE($23, smm_platform),
                smm_title = COALESCE($24, smm_title),
                smm_tag = COALESCE($25, smm_tag),
                smm_url = COALESCE($26, smm_url),
                smm_description = COALESCE($27, smm_description),
                smm_hashtags = COALESCE($28, smm_hashtags),
                smm_media_url = COALESCE($29, smm_media_url),
                smm_media_type = COALESCE($30, smm_media_type),
                updated_at = NOW()
            WHERE id = $31 RETURNING 
                id,
                asset_name as name,
                asset_type as type,
                asset_category,
                asset_format,
                tags as repository,
                description as usage_status,
                status,
                file_url,
                COALESCE(og_image_url, thumbnail_url, file_url) as thumbnail_url,
                file_size,
                file_type,
                created_at as date,
                linked_service_ids,
                linked_sub_service_ids,
                application_type,
                web_title, web_description, web_keywords, web_url, web_h1, web_h2_1, web_h2_2, web_thumbnail, web_body_content,
                smm_platform, smm_title, smm_tag, smm_url, smm_description, smm_hashtags, smm_media_url, smm_media_type`,
            [
                name, type, asset_category, asset_format, repository, usage_status, status,
                file_url, thumbnail_url, thumbnail_url,
                linked_service_ids ? JSON.stringify(linked_service_ids) : null,
                linked_sub_service_ids ? JSON.stringify(linked_sub_service_ids) : null,
                application_type, web_title, web_description, web_keywords, web_url, web_h1, web_h2_1, web_h2_2,
                web_thumbnail, web_body_content, smm_platform, smm_title, smm_tag, smm_url, smm_description,
                smm_hashtags, smm_media_url, smm_media_type, id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        const updatedAsset = {
            ...result.rows[0],
            repository: result.rows[0].repository || 'Content Repository',
            usage_status: result.rows[0].usage_status || 'Available',
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
