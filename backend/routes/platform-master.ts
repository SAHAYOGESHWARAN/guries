import express, { Request, Response } from 'express';
import { db } from '../config/db-sqlite';

const router = express.Router();

// Get all platforms
router.get('/', (req: Request, res: Response) => {
    try {
        const platforms = db.prepare(`
      SELECT 
        pm.id,
        pm.platform_name,
        pm.platform_code,
        pm.description,
        pm.status,
        pm.created_at,
        pm.updated_at,
        COUNT(DISTINCT pct.content_type_id) as content_type_count,
        COUNT(DISTINCT pat.asset_type_id) as asset_type_count
      FROM platform_master pm
      LEFT JOIN platform_content_types pct ON pm.id = pct.platform_id
      LEFT JOIN platform_asset_types pat ON pm.id = pat.platform_id
      GROUP BY pm.id
      ORDER BY pm.platform_name
    `).all();

        res.json(platforms);
    } catch (error) {
        console.error('Error fetching platforms:', error);
        res.status(500).json({ error: 'Failed to fetch platforms' });
    }
});

// Get platform by ID with all details
router.get('/:id', (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const platform = db.prepare(`
      SELECT * FROM platform_master WHERE id = ?
    `).get(id) as any;

        if (!platform) {
            return res.status(404).json({ error: 'Platform not found' });
        }

        // Get content types
        const contentTypes = db.prepare(`
      SELECT ct.id, ct.content_type, ct.category
      FROM content_types ct
      INNER JOIN platform_content_types pct ON ct.id = pct.content_type_id
      WHERE pct.platform_id = ?
    `).all(id);

        // Get asset types
        const assetTypes = db.prepare(`
      SELECT at.id, at.asset_type, at.dimension
      FROM asset_types at
      INNER JOIN platform_asset_types pat ON at.id = pat.asset_type_id
      WHERE pat.platform_id = ?
    `).all(id);

        // Get recommended sizes
        const recommendedSizes = db.prepare(`
      SELECT 
        prs.id,
        prs.asset_type_id,
        at.asset_type,
        prs.recommended_dimension,
        prs.file_format,
        prs.notes
      FROM platform_recommended_sizes prs
      LEFT JOIN asset_types at ON prs.asset_type_id = at.id
      WHERE prs.platform_id = ?
    `).all(id);

        // Get scheduling options
        const schedulingOptions = db.prepare(`
      SELECT scheduling_type, is_enabled
      FROM platform_scheduling_options
      WHERE platform_id = ?
    `).all(id);

        res.json({
            ...(platform as Record<string, any>),
            contentTypes,
            assetTypes,
            recommendedSizes,
            schedulingOptions
        });
    } catch (error) {
        console.error('Error fetching platform details:', error);
        res.status(500).json({ error: 'Failed to fetch platform details' });
    }
});

// Create new platform
router.post('/', (req: Request, res: Response) => {
    try {
        const {
            platform_name,
            platform_code,
            description,
            contentTypeIds = [],
            assetTypeIds = [],
            recommendedSizes = [],
            schedulingOptions = []
        } = req.body;

        if (!platform_name) {
            return res.status(400).json({ error: 'Platform name is required' });
        }

        // Insert platform
        const result = db.prepare(`
      INSERT INTO platform_master (platform_name, platform_code, description, status)
      VALUES (?, ?, ?, 'active')
    `).run(platform_name, platform_code || null, description || null);

        const platformId = result.lastInsertRowid;

        // Insert content types
        if (contentTypeIds.length > 0) {
            const insertContentType = db.prepare(`
        INSERT INTO platform_content_types (platform_id, content_type_id)
        VALUES (?, ?)
      `);

            for (const ctId of contentTypeIds) {
                insertContentType.run(platformId, ctId);
            }
        }

        // Insert asset types
        if (assetTypeIds.length > 0) {
            const insertAssetType = db.prepare(`
        INSERT INTO platform_asset_types (platform_id, asset_type_id)
        VALUES (?, ?)
      `);

            for (const atId of assetTypeIds) {
                insertAssetType.run(platformId, atId);
            }
        }

        // Insert recommended sizes
        if (recommendedSizes.length > 0) {
            const insertSize = db.prepare(`
        INSERT INTO platform_recommended_sizes 
        (platform_id, asset_type_id, recommended_dimension, file_format, notes)
        VALUES (?, ?, ?, ?, ?)
      `);

            for (const size of recommendedSizes) {
                insertSize.run(
                    platformId,
                    size.asset_type_id,
                    size.recommended_dimension,
                    size.file_format || null,
                    size.notes || null
                );
            }
        }

        // Insert scheduling options
        if (schedulingOptions.length > 0) {
            const insertScheduling = db.prepare(`
        INSERT INTO platform_scheduling_options (platform_id, scheduling_type, is_enabled)
        VALUES (?, ?, ?)
      `);

            for (const option of schedulingOptions) {
                insertScheduling.run(platformId, option.type, option.enabled ? 1 : 0);
            }
        }

        res.status(201).json({
            id: platformId,
            platform_name,
            platform_code,
            description,
            status: 'active',
            message: 'Platform created successfully'
        });
    } catch (error: any) {
        console.error('Error creating platform:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Platform name already exists' });
        }
        res.status(500).json({ error: 'Failed to create platform' });
    }
});

// Update platform
router.put('/:id', (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            platform_name,
            platform_code,
            description,
            status,
            contentTypeIds = [],
            assetTypeIds = [],
            recommendedSizes = [],
            schedulingOptions = []
        } = req.body;

        // Update platform
        db.prepare(`
      UPDATE platform_master 
      SET platform_name = ?, platform_code = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(platform_name, platform_code || null, description || null, status || 'active', id);

        // Clear and re-insert content types
        db.prepare('DELETE FROM platform_content_types WHERE platform_id = ?').run(id);
        if (contentTypeIds.length > 0) {
            const insertContentType = db.prepare(`
        INSERT INTO platform_content_types (platform_id, content_type_id)
        VALUES (?, ?)
      `);
            for (const ctId of contentTypeIds) {
                insertContentType.run(id, ctId);
            }
        }

        // Clear and re-insert asset types
        db.prepare('DELETE FROM platform_asset_types WHERE platform_id = ?').run(id);
        if (assetTypeIds.length > 0) {
            const insertAssetType = db.prepare(`
        INSERT INTO platform_asset_types (platform_id, asset_type_id)
        VALUES (?, ?)
      `);
            for (const atId of assetTypeIds) {
                insertAssetType.run(id, atId);
            }
        }

        // Clear and re-insert recommended sizes
        db.prepare('DELETE FROM platform_recommended_sizes WHERE platform_id = ?').run(id);
        if (recommendedSizes.length > 0) {
            const insertSize = db.prepare(`
        INSERT INTO platform_recommended_sizes 
        (platform_id, asset_type_id, recommended_dimension, file_format, notes)
        VALUES (?, ?, ?, ?, ?)
      `);
            for (const size of recommendedSizes) {
                insertSize.run(
                    id,
                    size.asset_type_id,
                    size.recommended_dimension,
                    size.file_format || null,
                    size.notes || null
                );
            }
        }

        // Clear and re-insert scheduling options
        db.prepare('DELETE FROM platform_scheduling_options WHERE platform_id = ?').run(id);
        if (schedulingOptions.length > 0) {
            const insertScheduling = db.prepare(`
        INSERT INTO platform_scheduling_options (platform_id, scheduling_type, is_enabled)
        VALUES (?, ?, ?)
      `);
            for (const option of schedulingOptions) {
                insertScheduling.run(id, option.type, option.enabled ? 1 : 0);
            }
        }

        res.json({ message: 'Platform updated successfully' });
    } catch (error) {
        console.error('Error updating platform:', error);
        res.status(500).json({ error: 'Failed to update platform' });
    }
});

// Delete platform
router.delete('/:id', (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Delete related records
        db.prepare('DELETE FROM platform_content_types WHERE platform_id = ?').run(id);
        db.prepare('DELETE FROM platform_asset_types WHERE platform_id = ?').run(id);
        db.prepare('DELETE FROM platform_recommended_sizes WHERE platform_id = ?').run(id);
        db.prepare('DELETE FROM platform_scheduling_options WHERE platform_id = ?').run(id);

        // Delete platform
        const result = db.prepare('DELETE FROM platform_master WHERE id = ?').run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Platform not found' });
        }

        res.json({ message: 'Platform deleted successfully' });
    } catch (error) {
        console.error('Error deleting platform:', error);
        res.status(500).json({ error: 'Failed to delete platform' });
    }
});

export default router;
