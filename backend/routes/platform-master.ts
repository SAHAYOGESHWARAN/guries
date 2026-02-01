import express, { Request, Response } from 'express';
import { pool } from "../config/db";

const router = express.Router();

// Get all platforms
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
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
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching platforms:', error);
        res.status(500).json({ error: 'Failed to fetch platforms' });
    }
});

// Get platform by ID with all details
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const platformResult = await pool.query(`
      SELECT * FROM platform_master WHERE id = $1
    `, [id]);

        const platform = platformResult.rows[0];

        if (!platform) {
            return res.status(404).json({ error: 'Platform not found' });
        }

        // Get content types
        const contentTypesResult = await pool.query(`
      SELECT ct.id, ct.content_type, ct.category
      FROM content_types ct
      INNER JOIN platform_content_types pct ON ct.id = pct.content_type_id
      WHERE pct.platform_id = $1
    `, [id]);

        // Get asset types
        const assetTypesResult = await pool.query(`
      SELECT at.id, at.asset_type, at.dimension
      FROM asset_types at
      INNER JOIN platform_asset_types pat ON at.id = pat.asset_type_id
      WHERE pat.platform_id = $1
    `, [id]);

        // Get recommended sizes
        const recommendedSizesResult = await pool.query(`
      SELECT 
        prs.id,
        prs.asset_type_id,
        at.asset_type,
        prs.recommended_dimension,
        prs.file_format,
        prs.notes
      FROM platform_recommended_sizes prs
      LEFT JOIN asset_types at ON prs.asset_type_id = at.id
      WHERE prs.platform_id = $1
    `, [id]);

        // Get scheduling options
        const schedulingOptionsResult = await pool.query(`
      SELECT scheduling_type, is_enabled
      FROM platform_scheduling_options
      WHERE platform_id = $1
    `, [id]);

        res.json({
            ...platform,
            contentTypes: contentTypesResult.rows,
            assetTypes: assetTypesResult.rows,
            recommendedSizes: recommendedSizesResult.rows,
            schedulingOptions: schedulingOptionsResult.rows
        });
    } catch (error) {
        console.error('Error fetching platform details:', error);
        res.status(500).json({ error: 'Failed to fetch platform details' });
    }
});

// Create new platform
router.post('/', async (req: Request, res: Response) => {
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
        const result = await pool.query(`
      INSERT INTO platform_master (platform_name, platform_code, description, status)
      VALUES ($1, $2, $3, 'active')
      RETURNING id
    `, [platform_name, platform_code || null, description || null]);

        const platformId = result.rows[0].id;

        // Insert content types
        if (contentTypeIds.length > 0) {
            for (const ctId of contentTypeIds) {
                await pool.query(`
        INSERT INTO platform_content_types (platform_id, content_type_id)
        VALUES ($1, $2)
      `, [platformId, ctId]);
            }
        }

        // Insert asset types
        if (assetTypeIds.length > 0) {
            for (const atId of assetTypeIds) {
                await pool.query(`
        INSERT INTO platform_asset_types (platform_id, asset_type_id)
        VALUES ($1, $2)
      `, [platformId, atId]);
            }
        }

        // Insert recommended sizes
        if (recommendedSizes.length > 0) {
            for (const size of recommendedSizes) {
                await pool.query(`
        INSERT INTO platform_recommended_sizes 
        (platform_id, asset_type_id, recommended_dimension, file_format, notes)
        VALUES ($1, $2, $3, $4, $5)
      `, [
                    platformId,
                    size.asset_type_id,
                    size.recommended_dimension,
                    size.file_format || null,
                    size.notes || null
                ]);
            }
        }

        // Insert scheduling options
        if (schedulingOptions.length > 0) {
            for (const option of schedulingOptions) {
                await pool.query(`
        INSERT INTO platform_scheduling_options (platform_id, scheduling_type, is_enabled)
        VALUES ($1, $2, $3)
      `, [platformId, option.type, option.enabled ? true : false]);
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
router.put('/:id', async (req: Request, res: Response) => {
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
        await pool.query(`
      UPDATE platform_master 
      SET platform_name = $1, platform_code = $2, description = $3, status = $4, updated_at = NOW()
      WHERE id = $5
    `, [platform_name, platform_code || null, description || null, status || 'active', id]);

        // Clear and re-insert content types
        await pool.query('DELETE FROM platform_content_types WHERE platform_id = $1', [id]);
        if (contentTypeIds.length > 0) {
            for (const ctId of contentTypeIds) {
                await pool.query(`
        INSERT INTO platform_content_types (platform_id, content_type_id)
        VALUES ($1, $2)
      `, [id, ctId]);
            }
        }

        // Clear and re-insert asset types
        await pool.query('DELETE FROM platform_asset_types WHERE platform_id = $1', [id]);
        if (assetTypeIds.length > 0) {
            for (const atId of assetTypeIds) {
                await pool.query(`
        INSERT INTO platform_asset_types (platform_id, asset_type_id)
        VALUES ($1, $2)
      `, [id, atId]);
            }
        }

        // Clear and re-insert recommended sizes
        await pool.query('DELETE FROM platform_recommended_sizes WHERE platform_id = $1', [id]);
        if (recommendedSizes.length > 0) {
            for (const size of recommendedSizes) {
                await pool.query(`
        INSERT INTO platform_recommended_sizes 
        (platform_id, asset_type_id, recommended_dimension, file_format, notes)
        VALUES ($1, $2, $3, $4, $5)
      `, [
                    id,
                    size.asset_type_id,
                    size.recommended_dimension,
                    size.file_format || null,
                    size.notes || null
                ]);
            }
        }

        // Clear and re-insert scheduling options
        await pool.query('DELETE FROM platform_scheduling_options WHERE platform_id = $1', [id]);
        if (schedulingOptions.length > 0) {
            for (const option of schedulingOptions) {
                await pool.query(`
        INSERT INTO platform_scheduling_options (platform_id, scheduling_type, is_enabled)
        VALUES ($1, $2, $3)
      `, [id, option.type, option.enabled ? true : false]);
            }
        }

        res.json({ message: 'Platform updated successfully' });
    } catch (error) {
        console.error('Error updating platform:', error);
        res.status(500).json({ error: 'Failed to update platform' });
    }
});

// Delete platform
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Delete related records
        await pool.query('DELETE FROM platform_content_types WHERE platform_id = $1', [id]);
        await pool.query('DELETE FROM platform_asset_types WHERE platform_id = $1', [id]);
        await pool.query('DELETE FROM platform_recommended_sizes WHERE platform_id = $1', [id]);
        await pool.query('DELETE FROM platform_scheduling_options WHERE platform_id = $1', [id]);

        // Delete platform
        const result = await pool.query('DELETE FROM platform_master WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Platform not found' });
        }

        res.json({ message: 'Platform deleted successfully' });
    } catch (error) {
        console.error('Error deleting platform:', error);
        res.status(500).json({ error: 'Failed to delete platform' });
    }
});

export default router;
