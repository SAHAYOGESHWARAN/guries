import { Request, Response } from 'express';
import { pool } from '../config/db';

/**
 * Asset Upload Controller
 * Handles asset creation with automatic service linking
 */

// Create asset with automatic service linking
export const createAssetWithServiceLink = async (req: Request, res: Response) => {
    const {
        name,
        type,
        asset_category,
        asset_format,
        content_type,
        application_type,
        linked_service_id,
        linked_sub_service_id,
        file_url,
        thumbnail_url,
        file_size,
        file_type,
        seo_score,
        grammar_score,
        keywords,
        created_by,
        status = 'Draft'
    } = req.body;

    try {
        // Validate required fields
        if (!name?.trim()) {
            return res.status(400).json({ error: 'Asset name is required' });
        }

        if (!application_type) {
            return res.status(400).json({ error: 'Application type (WEB, SEO, SMM) is required' });
        }

        // If service is linked, verify it exists
        if (linked_service_id) {
            const serviceCheck = await pool.query(
                'SELECT id FROM services WHERE id = ?',
                [linked_service_id]
            );
            if (serviceCheck.rows.length === 0) {
                return res.status(404).json({ error: 'Linked service not found' });
            }
        }

        // If sub-service is linked, verify it exists
        if (linked_sub_service_id) {
            const subServiceCheck = await pool.query(
                'SELECT id FROM sub_services WHERE id = ?',
                [linked_sub_service_id]
            );
            if (subServiceCheck.rows.length === 0) {
                return res.status(404).json({ error: 'Linked sub-service not found' });
            }
        }

        // Create workflow log entry
        const workflowLog = [{
            action: 'created',
            timestamp: new Date().toISOString(),
            user_id: created_by,
            status: status,
            workflow_stage: 'Add'
        }];

        // Create asset
        const result = await pool.query(
            `INSERT INTO assets (
                asset_name, asset_type, asset_category, asset_format, content_type,
                application_type, status, file_url, thumbnail_url, file_size, file_type,
                linked_service_ids, linked_sub_service_ids,
                linked_service_id, linked_sub_service_id,
                seo_score, grammar_score, keywords,
                created_by, created_at, workflow_stage, qc_status,
                workflow_log, linking_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                type,
                asset_category,
                asset_format,
                content_type || null,
                application_type,
                status,
                file_url || null,
                thumbnail_url || null,
                file_size || null,
                file_type || null,
                linked_service_id ? JSON.stringify([linked_service_id]) : null,
                linked_sub_service_id ? JSON.stringify([linked_sub_service_id]) : null,
                linked_service_id || null,
                linked_sub_service_id || null,
                seo_score || null,
                grammar_score || null,
                keywords ? JSON.stringify(keywords) : null,
                created_by || null,
                new Date().toISOString(),
                'Add',
                'Pending',
                JSON.stringify(workflowLog),
                0 // linking_active is 0 until QC approval
            ]
        );

        const assetId = result.lastID;

        // If service is linked, create static link
        if (linked_service_id) {
            await createStaticServiceLink(assetId, linked_service_id, linked_sub_service_id, created_by);
        }

        // Get created asset
        const createdAsset = await pool.query('SELECT * FROM assets WHERE id = ?', [assetId]);
        const parsed = parseAssetRow(createdAsset.rows[0]);

        res.status(201).json({
            message: 'Asset created successfully with service link',
            asset: parsed
        });
    } catch (error: any) {
        console.error('Error creating asset with service link:', error);
        res.status(500).json({ error: error.message });
    }
};

// Create static service link (immutable)
async function createStaticServiceLink(
    assetId: number,
    serviceId: number,
    subServiceId: number | null,
    createdBy: number | null
) {
    try {
        // Create link in service_asset_links
        await pool.query(
            `INSERT INTO service_asset_links (asset_id, service_id, sub_service_id, is_static, created_by, created_at)
             VALUES (?, ?, ?, 1, ?, CURRENT_TIMESTAMP)
             ON CONFLICT(asset_id, service_id, sub_service_id) DO UPDATE SET is_static = 1`,
            [assetId, serviceId, subServiceId || null, createdBy]
        );

        // If sub-service is linked, also create link in subservice_asset_links
        if (subServiceId) {
            await pool.query(
                `INSERT INTO subservice_asset_links (asset_id, sub_service_id, is_static, created_by, created_at)
                 VALUES (?, ?, 1, ?, CURRENT_TIMESTAMP)
                 ON CONFLICT(asset_id, sub_service_id) DO UPDATE SET is_static = 1`,
                [assetId, subServiceId, createdBy]
            );
        }

        // Update asset's static_service_links JSON field
        const existingLinks = await pool.query(
            'SELECT static_service_links FROM assets WHERE id = ?',
            [assetId]
        );

        let staticLinks = [];
        if (existingLinks.rows.length > 0 && existingLinks.rows[0].static_service_links) {
            try {
                staticLinks = JSON.parse(existingLinks.rows[0].static_service_links);
            } catch (e) {
                staticLinks = [];
            }
        }

        const linkEntry = {
            service_id: serviceId,
            sub_service_id: subServiceId || null,
            created_at: new Date().toISOString()
        };

        // Check if link already exists
        const linkExists = staticLinks.some(
            (link: any) => link.service_id === serviceId && link.sub_service_id === subServiceId
        );

        if (!linkExists) {
            staticLinks.push(linkEntry);
            await pool.query(
                'UPDATE assets SET static_service_links = ? WHERE id = ?',
                [JSON.stringify(staticLinks), assetId]
            );
        }
    } catch (error) {
        console.error('Error creating static service link:', error);
        throw error;
    }
}

// Helper function to parse asset row with JSON fields
function parseAssetRow(asset: any) {
    if (!asset) return null;

    const jsonFields = [
        'keywords', 'content_keywords', 'seo_keywords', 'web_h3_tags',
        'resource_files', 'qc_checklist_items', 'workflow_log', 'linked_service_ids',
        'linked_sub_service_ids', 'static_service_links'
    ];

    const parsed = { ...asset };
    jsonFields.forEach(field => {
        if (parsed[field] && typeof parsed[field] === 'string') {
            try {
                parsed[field] = JSON.parse(parsed[field]);
            } catch (e) {
                parsed[field] = [];
            }
        }
    });
    return parsed;
}
