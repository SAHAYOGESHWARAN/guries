import express, { Request, Response } from 'express';
import { db } from '../config/db-sqlite';

const router = express.Router();

// Constants
const CHECKLIST_TYPES = ['Content', 'SEO', 'Web', 'SMM', 'Analytics', 'Backlink', 'Competitor', 'Repository', 'Other'];
const CHECKLIST_CATEGORIES = ['Editorial', 'Technical SEO', 'Brand & Compliance', 'Editorial', 'Technical SEO', 'Promotional'];
const SEVERITY_LEVELS = ['Low', 'Medium', 'High'];
const SCORING_MODES = ['Binary', 'Weighted'];
const QC_OUTPUT_TYPES = ['Percentage', 'Pass/Fail', 'Pass/Rework/Fail'];
const MODULES = ['Content Campaign', 'SEO Campaign', 'Web Developer Campaign', 'SMM Campaign', 'Analytics & Reporting', 'Backlink Campaign', 'Competitor Research'];
const OUTCOMES = ['Pass', 'Fail', 'Rework'];

// Get all checklists
router.get('/', (req: Request, res: Response) => {
    try {
        const checklists = db.prepare(`
      SELECT 
        ac.id,
        ac.checklist_name,
        ac.checklist_type,
        ac.checklist_category,
        ac.status,
        ac.scoring_mode,
        ac.pass_threshold,
        ac.rework_threshold,
        ac.qc_output_type,
        ac.created_at,
        ac.updated_at,
        COUNT(DISTINCT aci.id) as item_count,
        COUNT(DISTINCT acm.id) as module_count
      FROM audit_checklists ac
      LEFT JOIN audit_checklist_items aci ON ac.id = aci.checklist_id
      LEFT JOIN audit_checklist_modules acm ON ac.id = acm.checklist_id
      GROUP BY ac.id
      ORDER BY ac.checklist_name
    `).all();

        res.json(checklists);
    } catch (error) {
        console.error('Error fetching checklists:', error);
        res.status(500).json({ error: 'Failed to fetch checklists' });
    }
});

// Get checklist by ID with all details
router.get('/:id', (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const checklist = db.prepare(`
      SELECT * FROM audit_checklists WHERE id = ?
    `).get(id) as any;

        if (!checklist) {
            return res.status(404).json({ error: 'Checklist not found' });
        }

        const items = db.prepare(`
      SELECT * FROM audit_checklist_items
      WHERE checklist_id = ?
      ORDER BY item_order
    `).all(id);

        const modules = db.prepare(`
      SELECT module_name FROM audit_checklist_modules
      WHERE checklist_id = ?
      ORDER BY module_name
    `).all(id);

        const campaigns = db.prepare(`
      SELECT * FROM audit_linked_campaigns
      WHERE checklist_id = ?
      ORDER BY campaign_name
    `).all(id);

        const scoreLogs = db.prepare(`
      SELECT * FROM audit_qc_score_logs
      WHERE checklist_id = ?
      ORDER BY review_date DESC
      LIMIT 10
    `).all(id);

        res.json({
            ...(checklist as Record<string, any>),
            items,
            modules: modules.map((m: any) => m.module_name),
            campaigns,
            scoreLogs
        });
    } catch (error) {
        console.error('Error fetching checklist:', error);
        res.status(500).json({ error: 'Failed to fetch checklist' });
    }
});

// Create new checklist
router.post('/', (req: Request, res: Response) => {
    try {
        const {
            checklist_name,
            checklist_type,
            checklist_category,
            description,
            scoring_mode,
            pass_threshold,
            rework_threshold,
            auto_fail_required,
            auto_fail_critical,
            qc_output_type,
            items,
            modules,
            campaigns
        } = req.body;

        if (!checklist_name || !checklist_type || !checklist_category) {
            return res.status(400).json({ error: 'Checklist name, type, and category are required' });
        }

        // Insert checklist
        const result = db.prepare(`
      INSERT INTO audit_checklists (
        checklist_name, checklist_type, checklist_category, description,
        scoring_mode, pass_threshold, rework_threshold,
        auto_fail_required, auto_fail_critical, qc_output_type, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `).run(
            checklist_name,
            checklist_type,
            checklist_category,
            description || null,
            scoring_mode || 'weighted',
            pass_threshold || 85,
            rework_threshold || 70,
            auto_fail_required ? 1 : 0,
            auto_fail_critical ? 1 : 0,
            qc_output_type || 'percentage'
        );

        const checklistId = result.lastInsertRowid;

        // Insert items
        if (items && Array.isArray(items)) {
            const insertItem = db.prepare(`
        INSERT INTO audit_checklist_items (
          checklist_id, item_order, item_name, severity, is_required, default_score
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `);

            items.forEach((item: any, index: number) => {
                insertItem.run(
                    checklistId,
                    index + 1,
                    item.item_name,
                    item.severity,
                    item.is_required ? 1 : 0,
                    item.default_score || 1
                );
            });
        }

        // Insert modules
        if (modules && Array.isArray(modules)) {
            const insertModule = db.prepare(`
        INSERT INTO audit_checklist_modules (checklist_id, module_name)
        VALUES (?, ?)
      `);

            modules.forEach((module: string) => {
                insertModule.run(checklistId, module);
            });
        }

        // Insert campaigns
        if (campaigns && Array.isArray(campaigns)) {
            const insertCampaign = db.prepare(`
        INSERT INTO audit_linked_campaigns (checklist_id, campaign_name, campaign_type, usage_type)
        VALUES (?, ?, ?, ?)
      `);

            campaigns.forEach((campaign: any) => {
                insertCampaign.run(checklistId, campaign.campaign_name, campaign.campaign_type || null, campaign.usage_type || null);
            });
        }

        res.status(201).json({
            id: checklistId,
            checklist_name,
            checklist_type,
            checklist_category,
            status: 'active',
            message: 'Checklist created successfully'
        });
    } catch (error: any) {
        console.error('Error creating checklist:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Checklist name already exists' });
        }
        res.status(500).json({ error: 'Failed to create checklist' });
    }
});

// Update checklist
router.put('/:id', (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            checklist_name,
            checklist_type,
            checklist_category,
            description,
            status,
            scoring_mode,
            pass_threshold,
            rework_threshold,
            auto_fail_required,
            auto_fail_critical,
            qc_output_type,
            items,
            modules,
            campaigns
        } = req.body;

        if (!checklist_name || !checklist_type || !checklist_category) {
            return res.status(400).json({ error: 'Checklist name, type, and category are required' });
        }

        // Update checklist
        db.prepare(`
      UPDATE audit_checklists
      SET checklist_name = ?, checklist_type = ?, checklist_category = ?,
          description = ?, status = ?, scoring_mode = ?, pass_threshold = ?,
          rework_threshold = ?, auto_fail_required = ?, auto_fail_critical = ?,
          qc_output_type = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
            checklist_name,
            checklist_type,
            checklist_category,
            description || null,
            status || 'active',
            scoring_mode || 'weighted',
            pass_threshold || 85,
            rework_threshold || 70,
            auto_fail_required ? 1 : 0,
            auto_fail_critical ? 1 : 0,
            qc_output_type || 'percentage',
            id
        );

        // Clear and re-insert items
        db.prepare('DELETE FROM audit_checklist_items WHERE checklist_id = ?').run(id);
        if (items && Array.isArray(items)) {
            const insertItem = db.prepare(`
        INSERT INTO audit_checklist_items (
          checklist_id, item_order, item_name, severity, is_required, default_score
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `);

            items.forEach((item: any, index: number) => {
                insertItem.run(
                    id,
                    index + 1,
                    item.item_name,
                    item.severity,
                    item.is_required ? 1 : 0,
                    item.default_score || 1
                );
            });
        }

        // Clear and re-insert modules
        db.prepare('DELETE FROM audit_checklist_modules WHERE checklist_id = ?').run(id);
        if (modules && Array.isArray(modules)) {
            const insertModule = db.prepare(`
        INSERT INTO audit_checklist_modules (checklist_id, module_name)
        VALUES (?, ?)
      `);

            modules.forEach((module: string) => {
                insertModule.run(id, module);
            });
        }

        // Clear and re-insert campaigns
        db.prepare('DELETE FROM audit_linked_campaigns WHERE checklist_id = ?').run(id);
        if (campaigns && Array.isArray(campaigns)) {
            const insertCampaign = db.prepare(`
        INSERT INTO audit_linked_campaigns (checklist_id, campaign_name, campaign_type, usage_type)
        VALUES (?, ?, ?, ?)
      `);

            campaigns.forEach((campaign: any) => {
                insertCampaign.run(id, campaign.campaign_name, campaign.campaign_type || null, campaign.usage_type || null);
            });
        }

        res.json({ message: 'Checklist updated successfully' });
    } catch (error: any) {
        console.error('Error updating checklist:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Checklist name already exists' });
        }
        res.status(500).json({ error: 'Failed to update checklist' });
    }
});

// Delete checklist
router.delete('/:id', (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Delete related data (cascade handled by DB)
        db.prepare('DELETE FROM audit_checklist_items WHERE checklist_id = ?').run(id);
        db.prepare('DELETE FROM audit_checklist_modules WHERE checklist_id = ?').run(id);
        db.prepare('DELETE FROM audit_linked_campaigns WHERE checklist_id = ?').run(id);
        db.prepare('DELETE FROM audit_qc_score_logs WHERE checklist_id = ?').run(id);

        // Delete checklist
        const result = db.prepare('DELETE FROM audit_checklists WHERE id = ?').run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Checklist not found' });
        }

        res.json({ message: 'Checklist deleted successfully' });
    } catch (error) {
        console.error('Error deleting checklist:', error);
        res.status(500).json({ error: 'Failed to delete checklist' });
    }
});

// Reorder items
router.put('/:id/reorder-items', (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { items } = req.body;

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ error: 'Items array is required' });
        }

        const updateItem = db.prepare(`
      UPDATE audit_checklist_items
      SET item_order = ?
      WHERE id = ?
    `);

        items.forEach((item: any) => {
            updateItem.run(item.item_order, item.id);
        });

        res.json({ message: 'Items reordered successfully' });
    } catch (error) {
        console.error('Error reordering items:', error);
        res.status(500).json({ error: 'Failed to reorder items' });
    }
});

// Add QC score log
router.post('/:id/score-log', (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { asset_id, reviewed_by, score, outcome } = req.body;

        if (!asset_id || !reviewed_by || score === undefined || !outcome) {
            return res.status(400).json({ error: 'Asset ID, reviewer, score, and outcome are required' });
        }

        const result = db.prepare(`
      INSERT INTO audit_qc_score_logs (checklist_id, asset_id, reviewed_by, score, outcome)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, asset_id, reviewed_by, score, outcome);

        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Score log created successfully'
        });
    } catch (error) {
        console.error('Error creating score log:', error);
        res.status(500).json({ error: 'Failed to create score log' });
    }
});

// Get reference data
router.get('/list/types', (req: Request, res: Response) => {
    res.json(CHECKLIST_TYPES);
});

router.get('/list/categories', (req: Request, res: Response) => {
    res.json(CHECKLIST_CATEGORIES);
});

router.get('/list/severities', (req: Request, res: Response) => {
    res.json(SEVERITY_LEVELS);
});

router.get('/list/scoring-modes', (req: Request, res: Response) => {
    res.json(SCORING_MODES);
});

router.get('/list/output-types', (req: Request, res: Response) => {
    res.json(QC_OUTPUT_TYPES);
});

router.get('/list/modules', (req: Request, res: Response) => {
    res.json(MODULES);
});

router.get('/list/outcomes', (req: Request, res: Response) => {
    res.json(OUTCOMES);
});

export default router;
