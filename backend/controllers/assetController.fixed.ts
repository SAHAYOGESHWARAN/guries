// This file contains the fixed createAssetLibraryItem function
// Copy this to replace the broken version in assetController.ts

import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getSocket } from '../socket';

export const createAssetLibraryItem = async (req: Request, res: Response) => {
    const {
        name, type, repository, file_url, thumbnail_url, file_size, file_type, date,
        asset_category, asset_format, content_type, status, linked_service_ids, linked_sub_service_ids,
        linked_task_id, linked_campaign_id, linked_project_id, linked_service_id, linked_sub_service_id,
        linked_repository_item_id, designed_by, published_by, verified_by, version_number, created_by,
        application_type, keywords, content_keywords, seo_keywords,
        web_title, web_description, web_meta_description, web_keywords, web_url, web_h1, web_h2_1, web_h2_2, web_h3_tags,
        web_thumbnail, web_body_content, smm_platform, smm_title, smm_tag, smm_url, smm_description,
        smm_hashtags, smm_media_url, smm_media_type, seo_score, grammar_score, ai_plagiarism_score,
        submitted_by, workflow_stage, qc_status, resource_files
    } = req.body;

    try {
        // Validate required fields
        if (!name?.trim()) {
            return res.status(400).json({ error: 'Asset name is required' });
        }

        if (!application_type) {
            return res.status(400).json({ error: 'Application type (WEB, SEO, SMM) is required' });
        }

        // Validate scores for submission
        if (status === 'Pending QC Review') {
            if (seo_score === undefined || seo_score === null || seo_score < 0 || seo_score > 100) {
                return res.status(400).json({ error: 'SEO score (0-100) is required for submission' });
            }
            if (grammar_score === undefined || grammar_score === null || grammar_score < 0 || grammar_score > 100) {
                return res.status(400).json({ error: 'Grammar score (0-100) is required for submission' });
            }
        }

        // Create workflow log entry
        const workflowLog = [{
            action: status === 'Pending QC Review' ? 'submitted' : 'created',
            timestamp: new Date().toISOString(),
            user_id: submitted_by || created_by,
            status: status || null,
            workflow_stage: workflow_stage || 'Add'
        }];

        // Create version history entry
        const versionHistory = [{
            version: version_number || 'v1.0',
            date: new Date().toISOString(),
            action: 'Created',
            user_id: created_by || submitted_by
        }];

        const result = await pool.query(
            `INSERT INTO assets(
                asset_name, asset_type, asset_category, asset_format, content_type, status,
                file_url, thumbnail_url, og_image_url, file_size, file_type,
                linked_service_ids, linked_sub_service_ids, linked_task_id, linked_campaign_id,
                linked_project_id, linked_service_id, linked_sub_service_id, linked_repository_item_id,
                designed_by, published_by, verified_by, version_number, created_at, created_by,
                application_type, keywords, content_keywords, seo_keywords,
                web_title, web_description, web_meta_description, web_keywords, web_url, web_h1, web_h2_1, web_h2_2, web_h3_tags,
                web_thumbnail, web_body_content, smm_platform, smm_title, smm_tag, smm_url, smm_description,
                smm_hashtags, smm_media_url, smm_media_type, seo_score, grammar_score, ai_plagiarism_score,
                submitted_by, submitted_at, workflow_stage, qc_status, resource_files,
                workflow_log, version_history, linking_active, usage_status
            ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name, type, asset_category, asset_format, content_type || null, status || 'draft',
                file_url || null, thumbnail_url || null, thumbnail_url || null, file_size || null, file_type || null,
                linked_service_ids ? JSON.stringify(linked_service_ids) : null,
                linked_sub_service_ids ? JSON.stringify(linked_sub_service_ids) : null,
                linked_task_id || null, linked_campaign_id || null, linked_project_id || null,
                linked_service_id || null, linked_sub_service_id || null, linked_repository_item_id || null,
                designed_by || null, published_by || null, verified_by || null, version_number || 'v1.0',
                date || new Date().toISOString(), created_by || submitted_by || null,
                application_type || null, keywords ? JSON.stringify(keywords) : null,
                content_keywords ? JSON.stringify(content_keywords) : null,
                seo_keywords ? JSON.stringify(seo_keywords) : null,
                web_title || null, web_description || null, web_meta_description || null, web_keywords || null,
                web_url || null, web_h1 || null, web_h2_1 || null, web_h2_2 || null,
                web_h3_tags ? JSON.stringify(web_h3_tags) : null,
                web_thumbnail || null, web_body_content || null, smm_platform || null, smm_title || null,
                smm_tag || null, smm_url || null, smm_description || null,
                smm_hashtags || null, smm_media_url || null, smm_media_type || null,
                seo_score || null, grammar_score || null, ai_plagiarism_score || null,
                submitted_by || null,
                status === 'Pending QC Review' ? new Date().toISOString() : null,
                workflow_stage || 'Add', qc_status || null,
                resource_files ? JSON.stringify(resource_files) : null,
                JSON.stringify(workflowLog), JSON.stringify(versionHistory), 0, 'Available'
            ]
        );

        // Get the inserted asset
        let assetId = result.rows[0]?.id;

        if (!assetId) {
            // Fallback: fetch by name
            const selectResult = await pool.query(
                `SELECT * FROM assets WHERE asset_name = ? ORDER BY id DESC LIMIT 1`,
                [name]
            );
            if (!selectResult.rows || selectResult.rows.length === 0) {
                return res.status(500).json({ error: 'Asset created but could not retrieve data' });
            }
            assetId = selectResult.rows[0].id;
            result.rows = selectResult.rows;
        }

        const rawAsset = result.rows[0];

        // Create static service links if services are selected
        if (linked_service_id || (linked_sub_service_ids && linked_sub_service_ids.length > 0)) {
            try {
                if (linked_service_id) {
                    await pool.query(
                        `INSERT INTO service_asset_links 
                         (asset_id, service_id, is_static, created_by, created_at) 
                         VALUES (?, ?, 1, ?, CURRENT_TIMESTAMP)`,
                        [assetId, linked_service_id, created_by || submitted_by || null]
                    );
                }

                if (linked_sub_service_ids && linked_sub_service_ids.length > 0) {
                    for (const subServiceId of linked_sub_service_ids) {
                        await pool.query(
                            `INSERT INTO subservice_asset_links 
                             (asset_id, sub_service_id, is_static, created_by, created_at) 
                             VALUES (?, ?, 1, ?, CURRENT_TIMESTAMP)`,
                            [assetId, subServiceId, created_by || submitted_by || null]
                        );
                    }
                }

                const staticLinks = [];
                if (linked_service_id) staticLinks.push({ service_id: linked_service_id, type: 'service' });
                if (linked_sub_service_ids && linked_sub_service_ids.length > 0) {
                    linked_sub_service_ids.forEach(id => staticLinks.push({ sub_service_id: id, type: 'subservice' }));
                }

                await pool.query(
                    `UPDATE assets SET static_service_links = ? WHERE id = ?`,
                    [JSON.stringify(staticLinks), assetId]
                );
            } catch (linkError) {
                console.error('Error creating static service links:', linkError);
            }
        }

        const newAsset = {
            id: assetId,
            ...rawAsset,
            name: rawAsset.asset_name,
            type: rawAsset.asset_type,
            repository: repository || 'Content Repository',
            usage_status: 'Available',
            thumbnail_url: rawAsset.thumbnail_url || rawAsset.file_url,
            date: rawAsset.created_at,
            linked_service_ids: rawAsset.linked_service_ids ? JSON.parse(rawAsset.linked_service_ids) : [],
            linked_sub_service_ids: rawAsset.linked_sub_service_ids ? JSON.parse(rawAsset.linked_sub_service_ids) : [],
            keywords: rawAsset.keywords ? JSON.parse(rawAsset.keywords) : [],
            content_keywords: rawAsset.content_keywords ? JSON.parse(rawAsset.content_keywords) : [],
            seo_keywords: rawAsset.seo_keywords ? JSON.parse(rawAsset.seo_keywords) : [],
            web_h3_tags: rawAsset.web_h3_tags ? JSON.parse(rawAsset.web_h3_tags) : [],
            resource_files: rawAsset.resource_files ? JSON.parse(rawAsset.resource_files) : [],
            version_history: rawAsset.version_history ? JSON.parse(rawAsset.version_history) : [],
            static_service_links: rawAsset.static_service_links ? JSON.parse(rawAsset.static_service_links) : []
        };

        try {
            getSocket().emit('assetLibrary_created', newAsset);
        } catch (socketError) {
            console.warn('Socket.io not available:', socketError);
        }

        res.status(201).json({ asset: newAsset, id: assetId, message: 'Asset created successfully' });
    } catch (error: any) {
        console.error('Error creating asset:', error);
        res.status(500).json({ error: error.message });
    }
};
