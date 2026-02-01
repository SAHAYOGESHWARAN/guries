import express, { Request, Response } from 'express';
import { pool } from "../config/db";

const router = express.Router();

const COLOR_OPTIONS = ['blue', 'orange', 'green', 'purple', 'pink', 'red', 'indigo', 'gray'];

// Get all workflows
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT 
        wm.id,
        wm.workflow_name,
        wm.description,
        wm.status,
        wm.created_at,
        wm.updated_at,
        COUNT(ws.id) as stage_count
      FROM workflow_master_new wm
      LEFT JOIN workflow_stage_items ws ON wm.id = ws.workflow_id
      GROUP BY wm.id
      ORDER BY wm.workflow_name
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching workflows:', error);
        res.status(500).json({ error: 'Failed to fetch workflows' });
    }
});

// Get workflow by ID with stages
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const workflowResult = await pool.query(`
      SELECT * FROM workflow_master_new WHERE id = $1
    `, [id]);

        const workflow = workflowResult.rows[0];

        if (!workflow) {
            return res.status(404).json({ error: 'Workflow not found' });
        }

        const stagesResult = await pool.query(`
      SELECT * FROM workflow_stage_items
      WHERE workflow_id = $1
      ORDER BY stage_order
    `, [id]);

        res.json({
            ...workflow,
            stages: stagesResult.rows
        });
    } catch (error) {
        console.error('Error fetching workflow:', error);
        res.status(500).json({ error: 'Failed to fetch workflow' });
    }
});

// Create new workflow
router.post('/', async (req: Request, res: Response) => {
    try {
        const { workflow_name, description, stages } = req.body;

        if (!workflow_name) {
            return res.status(400).json({ error: 'Workflow name is required' });
        }

        // Insert workflow
        const result = await pool.query(`
      INSERT INTO workflow_master_new (workflow_name, description, status)
      VALUES ($1, $2, 'active')
      RETURNING id
    `, [workflow_name, description || null]);

        const workflowId = result.rows[0].id;

        // Insert stages
        if (stages && stages.length > 0) {
            for (let index = 0; index < stages.length; index++) {
                const stage = stages[index];
                await pool.query(`
        INSERT INTO workflow_stage_items (
          workflow_id, stage_order, stage_title, stage_label, color_tag, mandatory_qc
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
                    workflowId,
                    index + 1,
                    stage.stage_title,
                    stage.stage_label || null,
                    stage.color_tag || 'blue',
                    stage.mandatory_qc ? true : false
                ]);
            }
        }

        res.status(201).json({
            id: workflowId,
            workflow_name,
            description,
            status: 'active',
            stages: stages || [],
            message: 'Workflow created successfully'
        });
    } catch (error: any) {
        console.error('Error creating workflow:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Workflow name already exists' });
        }
        res.status(500).json({ error: 'Failed to create workflow' });
    }
});

// Update workflow
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { workflow_name, description, status, stages } = req.body;

        if (!workflow_name) {
            return res.status(400).json({ error: 'Workflow name is required' });
        }

        // Update workflow
        await pool.query(`
      UPDATE workflow_master_new
      SET workflow_name = $1, description = $2, status = $3, updated_at = NOW()
      WHERE id = $4
    `, [workflow_name, description || null, status || 'active', id]);

        // Clear and re-insert stages
        await pool.query('DELETE FROM workflow_stage_items WHERE workflow_id = $1', [id]);

        if (stages && stages.length > 0) {
            for (let index = 0; index < stages.length; index++) {
                const stage = stages[index];
                await pool.query(`
        INSERT INTO workflow_stage_items (
          workflow_id, stage_order, stage_title, stage_label, color_tag, mandatory_qc
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
                    id,
                    index + 1,
                    stage.stage_title,
                    stage.stage_label || null,
                    stage.color_tag || 'blue',
                    stage.mandatory_qc ? true : false
                ]);
            }
        }

        res.json({ message: 'Workflow updated successfully' });
    } catch (error: any) {
        console.error('Error updating workflow:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Workflow name already exists' });
        }
        res.status(500).json({ error: 'Failed to update workflow' });
    }
});

// Delete workflow
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Delete stages
        await pool.query('DELETE FROM workflow_stage_items WHERE workflow_id = $1', [id]);

        // Delete workflow
        const result = await pool.query('DELETE FROM workflow_master_new WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Workflow not found' });
        }

        res.json({ message: 'Workflow deleted successfully' });
    } catch (error) {
        console.error('Error deleting workflow:', error);
        res.status(500).json({ error: 'Failed to delete workflow' });
    }
});

// Reorder stages
router.put('/:id/reorder-stages', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { stages } = req.body;

        if (!stages || !Array.isArray(stages)) {
            return res.status(400).json({ error: 'Stages array is required' });
        }

        for (const stage of stages) {
            await pool.query(`
      UPDATE workflow_stage_items
      SET stage_order = $1
      WHERE id = $2
    `, [stage.stage_order, stage.id]);
        }

        res.json({ message: 'Stages reordered successfully' });
    } catch (error) {
        console.error('Error reordering stages:', error);
        res.status(500).json({ error: 'Failed to reorder stages' });
    }
});

// Get color options
router.get('/list/colors', (req: Request, res: Response) => {
    try {
        res.json(COLOR_OPTIONS);
    } catch (error) {
        console.error('Error fetching colors:', error);
        res.status(500).json({ error: 'Failed to fetch colors' });
    }
});

export default router;

