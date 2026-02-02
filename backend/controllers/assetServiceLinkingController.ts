import { Request, Response } from 'express';
import { pool } from '../config/db';

/**
 * Asset-Service Linking Controller
 * Handles static (immutable) and dynamic (mutable) asset-service relationships
 */

// Link asset to service (static - cannot be removed)
export const linkAssetToServiceStatic = async (req: Request, res: Response) => {
    const { asset_id, service_id, sub_service_id } = req.body;
    const created_by = (req as any).user?.id;

    try {
        if (!asset_id || !service_id) {
            return res.status(400).json({ error: 'asset_id and service_id are required' });
        }

        // Check if asset exists
        const assetCheck = await pool.query('SELECT id FROM assets WHERE id = ?', [asset_id]);
        if (assetCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        // Check if service exists
        const serviceCheck = await pool.query('SELECT id FROM services WHERE id = ?', [service_id]);
        if (serviceCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }

        // If sub_service_id provided, check it exists
        if (sub_service_id) {
            const subServiceCheck = await pool.query('SELECT id FROM sub_services WHERE id = ?', [sub_service_id]);
            if (subServiceCheck.rows.length === 0) {
                return res.status(404).json({ error: 'Sub-service not found' });
            }
        }

        // Create static link in service_asset_links
        const result = await pool.query(
            `INSERT INTO service_asset_links (asset_id, service_id, sub_service_id, is_static, created_by, created_at)
             VALUES (?, ?, ?, 1, ?, CURRENT_TIMESTAMP)
             ON CONFLICT(asset_id, service_id, sub_service_id) DO UPDATE SET is_static = 1`,
            [asset_id, service_id, sub_service_id || null, created_by]
        );

        // If sub_service_id provided, also create link in subservice_asset_links
        if (sub_service_id) {
            await pool.query(
                `INSERT INTO subservice_asset_links (asset_id, sub_service_id, is_static, created_by, created_at)
                 VALUES (?, ?, 1, ?, CURRENT_TIMESTAMP)
                 ON CONFLICT(asset_id, sub_service_id) DO UPDATE SET is_static = 1`,
                [asset_id, sub_service_id, created_by]
            );
        }

        // Update asset's static_service_links JSON field
        const existingLinks = await pool.query(
            'SELECT static_service_links FROM assets WHERE id = ?',
            [asset_id]
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
            service_id,
            sub_service_id: sub_service_id || null,
            created_at: new Date().toISOString()
        };

        // Check if link already exists
        const linkExists = staticLinks.some(
            (link: any) => link.service_id === service_id && link.sub_service_id === sub_service_id
        );

        if (!linkExists) {
            staticLinks.push(linkEntry);
        }

        await pool.query(
            'UPDATE assets SET static_service_links = ? WHERE id = ?',
            [JSON.stringify(staticLinks), asset_id]
        );

        res.status(201).json({
            message: 'Asset linked to service successfully',
            link: {
                asset_id,
                service_id,
                sub_service_id: sub_service_id || null,
                is_static: 1
            }
        });
    } catch (error: any) {
        console.error('Error linking asset to service:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get assets linked to a service
export const getServiceLinkedAssets = async (req: Request, res: Response) => {
    const { service_id } = req.params;
    const { sub_service_id } = req.query;

    try {
        let query = `
            SELECT DISTINCT a.* FROM assets a
            INNER JOIN service_asset_links sal ON a.id = sal.asset_id
            WHERE sal.service_id = ?
        `;
        const params: any[] = [service_id];

        if (sub_service_id) {
            query += ` AND sal.sub_service_id = ?`;
            params.push(sub_service_id);
        }

        query += ` ORDER BY a.created_at DESC`;

        const result = await pool.query(query, params);

        // Parse JSON fields
        const assets = result.rows.map((asset: any) => ({
            ...asset,
            linked_service_ids: asset.linked_service_ids ? JSON.parse(asset.linked_service_ids) : [],
            linked_sub_service_ids: asset.linked_sub_service_ids ? JSON.parse(asset.linked_sub_service_ids) : [],
            keywords: asset.keywords ? JSON.parse(asset.keywords) : [],
            static_service_links: asset.static_service_links ? JSON.parse(asset.static_service_links) : []
        }));

        res.status(200).json(assets);
    } catch (error: any) {
        console.error('Error fetching service linked assets:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get assets linked to a sub-service
export const getSubServiceLinkedAssets = async (req: Request, res: Response) => {
    const { sub_service_id } = req.params;

    try {
        const result = await pool.query(
            `SELECT DISTINCT a.* FROM assets a
             INNER JOIN subservice_asset_links sal ON a.id = sal.asset_id
             WHERE sal.sub_service_id = ?
             ORDER BY a.created_at DESC`,
            [sub_service_id]
        );

        // Parse JSON fields
        const assets = result.rows.map((asset: any) => ({
            ...asset,
            linked_service_ids: asset.linked_service_ids ? JSON.parse(asset.linked_service_ids) : [],
            linked_sub_service_ids: asset.linked_sub_service_ids ? JSON.parse(asset.linked_sub_service_ids) : [],
            keywords: asset.keywords ? JSON.parse(asset.keywords) : [],
            static_service_links: asset.static_service_links ? JSON.parse(asset.static_service_links) : []
        }));

        res.status(200).json(assets);
    } catch (error: any) {
        console.error('Error fetching sub-service linked assets:', error);
        res.status(500).json({ error: error.message });
    }
};

// Check if asset link is static (immutable)
export const isAssetLinkStatic = async (req: Request, res: Response) => {
    const { asset_id, service_id, sub_service_id } = req.query;

    try {
        const result = await pool.query(
            `SELECT is_static FROM service_asset_links
             WHERE asset_id = ? AND service_id = ? AND (sub_service_id = ? OR (sub_service_id IS NULL AND ? IS NULL))`,
            [asset_id, service_id, sub_service_id || null, sub_service_id || null]
        );

        const isStatic = result.rows.length > 0 && result.rows[0].is_static === 1;

        res.status(200).json({ is_static: isStatic });
    } catch (error: any) {
        console.error('Error checking if link is static:', error);
        res.status(500).json({ error: error.message });
    }
};

// Unlink asset from service (only if not static)
export const unlinkAssetFromService = async (req: Request, res: Response) => {
    const { asset_id, service_id, sub_service_id } = req.body;

    try {
        // Check if link is static
        const linkCheck = await pool.query(
            `SELECT is_static FROM service_asset_links
             WHERE asset_id = ? AND service_id = ? AND (sub_service_id = ? OR (sub_service_id IS NULL AND ? IS NULL))`,
            [asset_id, service_id, sub_service_id || null, sub_service_id || null]
        );

        if (linkCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Link not found' });
        }

        if (linkCheck.rows[0].is_static === 1) {
            return res.status(403).json({
                error: 'Cannot unlink static asset. This asset was linked during upload and cannot be removed.'
            });
        }

        // Delete the link
        await pool.query(
            `DELETE FROM service_asset_links
             WHERE asset_id = ? AND service_id = ? AND (sub_service_id = ? OR (sub_service_id IS NULL AND ? IS NULL))`,
            [asset_id, service_id, sub_service_id || null, sub_service_id || null]
        );

        // If sub_service_id provided, also delete from subservice_asset_links
        if (sub_service_id) {
            await pool.query(
                `DELETE FROM subservice_asset_links WHERE asset_id = ? AND sub_service_id = ?`,
                [asset_id, sub_service_id]
            );
        }

        res.status(200).json({ message: 'Asset unlinked from service successfully' });
    } catch (error: any) {
        console.error('Error unlinking asset from service:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all static links for an asset
export const getAssetStaticLinks = async (req: Request, res: Response) => {
    const { asset_id } = req.params;

    try {
        const result = await pool.query(
            `SELECT sal.*, s.service_name, ss.sub_service_name
             FROM service_asset_links sal
             LEFT JOIN services s ON sal.service_id = s.id
             LEFT JOIN sub_services ss ON sal.sub_service_id = ss.id
             WHERE sal.asset_id = ? AND sal.is_static = 1
             ORDER BY sal.created_at DESC`,
            [asset_id]
        );

        res.status(200).json(result.rows);
    } catch (error: any) {
        console.error('Error fetching asset static links:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get service asset count (including linked assets)
export const getServiceAssetCount = async (req: Request, res: Response) => {
    const { service_id } = req.params;

    try {
        const result = await pool.query(
            `SELECT COUNT(DISTINCT asset_id) as asset_count
             FROM service_asset_links
             WHERE service_id = ?`,
            [service_id]
        );

        const count = result.rows[0]?.asset_count || 0;

        res.status(200).json({ service_id, asset_count: count });
    } catch (error: any) {
        console.error('Error fetching service asset count:', error);
        res.status(500).json({ error: error.message });
    }
};
