import express, { Request, Response } from 'express';
import { pool } from "../config/db";

const router = express.Router();

const COLOR_OPTIONS = ['blue', 'orange', 'green', 'purple', 'pink', 'red', 'indigo', 'gray'];

// Get all workflows
router.get('/', (req: Request, res: Response) => {
    try {
        const workflows = db.prepare(`
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
    `).all();

        res.json(workflows);
    } catch (error) {
        console.error('Error fetching workflows:', error);
        res.status(500).json({ error: 'Failed to fetch workflows' });
    }
});

// Get workflow by ID with stages
router.get('/:id', (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const workflow = db.prepare(`
      SELECT * FROM workflow_master_new WHERE id = ?
    `).get(id) as any;

        if (!workflow) {
            return res.status(404).json({ error: 'Workflow not found' });
        }

        const stages = db.prepare(`
      SELECT * FROM workflow_stage_items
      WHERE workflow_id = ?
      ORDER BY stage_order
    `).all(id);

        res.json({
            ...(workflow as Record<string, any>),
            stages
        });
    } catch (error) {
        console.error('Error fetching workflow:', error);
        res.status(500).json({ error: 'Failed to fetch workflow' });
    }
});

// Create new workflow
router.post('/', (req: Request, res: Response) => {
    try {
        const { workflow_name, description, stages } = req.body;

        if (!workflow_name) {
            return res.status(400).json({ error: 'Workflow name is required' });
        }

        // Insert workflow
        const result = db.prepare(`
      INSERT INTO workflow_master_new (workflow_name, description, status)
      VALUES (?, ?, 'active')
    `).run(workflow_name, description || null);

        const workflowId = result.lastInsertRowid;

        // Insert stages
        if (stages && stages.length > 0) {
            const insertStage = db.prepare(`
        INSERT INTO workflow_stage_items (
          workflow_id, stage_order, stage_title, stage_label, color_tag, mandatory_qc
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `);

            stages.forEach((stage: any, index: number) => {
                insertStage.run(
                    workflowId,
                    index + 1,
                    stage.stage_title,
                    stage.stage_label || null,
                    stage.color_tag || 'blue',
                    stage.mandatory_qc ? 1 : 0
                );
            });
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
router.put('/:id', (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { workflow_name, description, status, stages } = req.body;

        if (!workflow_name) {
            return res.status(400).json({ error: 'Workflow name is required' });
        }

        // Update workflow
        db.prepare(`
      UPDATE workflow_master_new
      SET workflow_name = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(workflow_name, description || null, status || 'active', id);

        // Clear and re-insert stages
        db.prepare('DELETE FROM workflow_stage_items WHERE workflow_id = ?').run(id);

        if (stages && stages.length > 0) {
            const insertStage = db.prepare(`
        INSERT INTO workflow_stage_items (
          workflow_id, stage_order, stage_title, stage_label, color_tag, mandatory_qc
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `);

            stages.forEach((stage: any, index: number) => {
                insertStage.run(
                    id,
                    index + 1,
                    stage.stage_title,
                    stage.stage_label || null,
                    stage.color_tag || 'blue',
                    stage.mandatory_qc ? 1 : 0
                );
            });
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
router.delete('/:id', (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Delete stages
        db.prepare('DELETE FROM workflow_stage_items WHERE workflow_id = ?').run(id);

        // Delete workflow
        const result = db.prepare('DELETE FROM workflow_master_new WHERE id = ?').run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Workflow not found' });
        }

        res.json({ message: 'Workflow deleted successfully' });
    } catch (error) {
        console.error('Error deleting workflow:', error);
        res.status(500).json({ error: 'Failed to delete workflow' });
    }
});

// Reorder stages
router.put('/:id/reorder-stages', (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { stages } = req.body;

        if (!stages || !Array.isArray(stages)) {
            return res.status(400).json({ error: 'Stages array is required' });
        }

        const updateStage = db.prepare(`
      UPDATE workflow_stage_items
      SET stage_order = ?
      WHERE id = ?
    `);

        stages.forEach((stage: any) => {
            updateStage.run(stage.stage_order, stage.id);
        });

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

