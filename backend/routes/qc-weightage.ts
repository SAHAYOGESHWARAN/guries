import express, { Request, Response } from 'express';
import { pool } from "../config/db";

const router = express.Router();

const WORKFLOW_STAGES = ['Draft', 'Review', 'Approved', 'Published', 'Pre-Publish', 'Post-Publish'];

// Get all QC weightage configurations
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT 
        qwc.id,
        qwc.config_name,
        qwc.description,
        qwc.total_weight,
        qwc.is_valid,
        qwc.status,
        qwc.created_at,
        qwc.updated_at,
        COUNT(DISTINCT qwi.id) as item_count
      FROM qc_weightage_configs qwc
      LEFT JOIN qc_weightage_items qwi ON qwc.id = qwi.config_id
      GROUP BY qwc.id
      ORDER BY qwc.config_name
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching QC weightage configs:', error);
        res.status(500).json({ error: 'Failed to fetch QC weightage configs' });
    }
});

// Get QC weightage configuration by ID with items
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const configResult = await pool.query(`
      SELECT * FROM qc_weightage_configs WHERE id = $1
    `, [id]);

        const config = configResult.rows[0];

        if (!config) {
            return res.status(404).json({ error: 'QC weightage config not found' });
        }

        const itemsResult = await pool.query(`
      SELECT 
        qwi.id,
        qwi.checklist_id,
        qwi.checklist_type,
        qwi.weight_percentage,
        qwi.is_mandatory,
        qwi.applies_to_stage,
        qwi.item_order,
        ac.checklist_name
      FROM qc_weightage_items qwi
      LEFT JOIN audit_checklists ac ON qwi.checklist_id = ac.id
      WHERE qwi.config_id = $1
      ORDER BY qwi.item_order
    `, [id]);

        res.json({
            ...config,
            items: itemsResult.rows
        });
    } catch (error) {
        console.error('Error fetching QC weightage config:', error);
        res.status(500).json({ error: 'Failed to fetch QC weightage config' });
    }
});

// Create new QC weightage configuration
router.post('/', async (req: Request, res: Response) => {
    try {
        const { config_name, description, items } = req.body;

        if (!config_name) {
            return res.status(400).json({ error: 'Config name is required' });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'At least one checklist item is required' });
        }

        // Calculate total weight
        const totalWeight = items.reduce((sum: number, item: any) => sum + (item.weight_percentage || 0), 0);

        if (totalWeight !== 100) {
            return res.status(400).json({ error: `Total weight must equal 100%, currently ${totalWeight}%` });
        }

        // Insert config
        const result = await pool.query(`
      INSERT INTO qc_weightage_configs (config_name, description, total_weight, is_valid, status)
      VALUES ($1, $2, $3, $4, 'active')
      RETURNING id
    `, [config_name, description || null, totalWeight, true]);

        const configId = result.rows[0].id;

        // Insert items
        for (let index = 0; index < items.length; index++) {
            const item = items[index];
            await pool.query(`
      INSERT INTO qc_weightage_items (
        config_id, checklist_id, checklist_type, weight_percentage, is_mandatory, applies_to_stage, item_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
                configId,
                item.checklist_id,
                item.checklist_type,
                item.weight_percentage,
                item.is_mandatory ? true : false,
                item.applies_to_stage || null,
                index + 1
            ]);
        }

        res.status(201).json({
            id: configId,
            config_name,
            description,
            total_weight: totalWeight,
            status: 'active',
            message: 'QC weightage config created successfully'
        });
    } catch (error: any) {
        console.error('Error creating QC weightage config:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Config name already exists' });
        }
        res.status(500).json({ error: 'Failed to create QC weightage config' });
    }
});

// Update QC weightage configuration
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { config_name, description, status, items } = req.body;

        if (!config_name) {
            return res.status(400).json({ error: 'Config name is required' });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'At least one checklist item is required' });
        }

        // Calculate total weight
        const totalWeight = items.reduce((sum: number, item: any) => sum + (item.weight_percentage || 0), 0);

        if (totalWeight !== 100) {
            return res.status(400).json({ error: `Total weight must equal 100%, currently ${totalWeight}%` });
        }

        // Update config
        await pool.query(`
      UPDATE qc_weightage_configs
      SET config_name = $1, description = $2, total_weight = $3, is_valid = $4, status = $5, updated_at = NOW()
      WHERE id = $6
    `, [config_name, description || null, totalWeight, true, status || 'active', id]);

        // Clear and re-insert items
        await pool.query('DELETE FROM qc_weightage_items WHERE config_id = $1', [id]);

        for (let index = 0; index < items.length; index++) {
            const item = items[index];
            await pool.query(`
      INSERT INTO qc_weightage_items (
        config_id, checklist_id, checklist_type, weight_percentage, is_mandatory, applies_to_stage, item_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
                id,
                item.checklist_id,
                item.checklist_type,
                item.weight_percentage,
                item.is_mandatory ? true : false,
                item.applies_to_stage || null,
                index + 1
            ]);
        }

        res.json({ message: 'QC weightage config updated successfully' });
    } catch (error: any) {
        console.error('Error updating QC weightage config:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Config name already exists' });
        }
        res.status(500).json({ error: 'Failed to update QC weightage config' });
    }
});

// Delete QC weightage configuration
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Delete items (cascade handled by DB)
        await pool.query('DELETE FROM qc_weightage_items WHERE config_id = $1', [id]);

        // Delete config
        const result = await pool.query('DELETE FROM qc_weightage_configs WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'QC weightage config not found' });
        }

        res.json({ message: 'QC weightage config deleted successfully' });
    } catch (error) {
        console.error('Error deleting QC weightage config:', error);
        res.status(500).json({ error: 'Failed to delete QC weightage config' });
    }
});

// Get all checklists for dropdown
router.get('/list/checklists', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT 
        id,
        checklist_name,
        checklist_type,
        checklist_category,
        status
      FROM audit_checklists
      WHERE status = 'active'
      ORDER BY checklist_name
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching checklists:', error);
        res.status(500).json({ error: 'Failed to fetch checklists' });
    }
});

// Get workflow stages
router.get('/list/stages', (req: Request, res: Response) => {
    res.json(WORKFLOW_STAGES);
});

// Validate weightage configuration
router.post('/:id/validate', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const itemsResult = await pool.query(`
      SELECT weight_percentage FROM qc_weightage_items WHERE config_id = $1
    `, [id]);

        const totalWeight = itemsResult.rows.reduce((sum: number, item: any) => sum + item.weight_percentage, 0);
        const isValid = totalWeight === 100;

        // Update config validity
        await pool.query(`
      UPDATE qc_weightage_configs
      SET is_valid = $1, updated_at = NOW()
      WHERE id = $2
    `, [isValid, id]);

        res.json({
            is_valid: isValid,
            total_weight: totalWeight,
            message: isValid ? 'Configuration is valid' : `Total weight is ${totalWeight}%, must be 100%`
        });
    } catch (error) {
        console.error('Error validating weightage config:', error);
        res.status(500).json({ error: 'Failed to validate weightage config' });
    }
});

// Get checklist usage statistics
router.get('/:checklistId/usage', async (req: Request, res: Response) => {
    try {
        const { checklistId } = req.params;

        const result = await pool.query(`
      SELECT * FROM qc_checklist_usage
      WHERE checklist_id = $1
      ORDER BY usage_count DESC
    `, [checklistId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching checklist usage:', error);
        res.status(500).json({ error: 'Failed to fetch checklist usage' });
    }
});

// Update checklist usage
router.post('/:checklistId/usage', async (req: Request, res: Response) => {
    try {
        const { checklistId } = req.params;
        const { asset_type, usage_context } = req.body;

        if (!asset_type) {
            return res.status(400).json({ error: 'Asset type is required' });
        }

        // Check if usage record exists
        const existingResult = await pool.query(`
      SELECT id FROM qc_checklist_usage
      WHERE checklist_id = $1 AND asset_type = $2 AND usage_context = $3
    `, [checklistId, asset_type, usage_context || null]);

        const existing = existingResult.rows[0];

        if (existing) {
            // Update existing
            await pool.query(`
        UPDATE qc_checklist_usage
        SET usage_count = usage_count + 1, last_used = NOW(), updated_at = NOW()
        WHERE id = $1
      `, [existing.id]);
        } else {
            // Insert new
            await pool.query(`
        INSERT INTO qc_checklist_usage (checklist_id, asset_type, usage_context, usage_count, last_used)
        VALUES ($1, $2, $3, 1, NOW())
      `, [checklistId, asset_type, usage_context || null]);
        }

        res.json({ message: 'Checklist usage updated successfully' });
    } catch (error) {
        console.error('Error updating checklist usage:', error);
        res.status(500).json({ error: 'Failed to update checklist usage' });
    }
});

export default router;

