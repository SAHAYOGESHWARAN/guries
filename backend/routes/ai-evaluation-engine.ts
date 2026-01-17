import express, { Request, Response } from 'express';
import { db } from '../config/db-sqlite';

const router = express.Router();

// Get all evaluation reports
router.get('/reports', (req: Request, res: Response) => {
    try {
        const reports = db.prepare(`
      SELECT * FROM ai_evaluation_reports
      ORDER BY evaluation_date DESC
    `).all();

        res.json(reports);
    } catch (error) {
        console.error('Error fetching evaluation reports:', error);
        res.status(500).json({ error: 'Failed to fetch evaluation reports' });
    }
});

// Get evaluation report by ID
router.get('/reports/:reportId', (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;

        const report = db.prepare(`
      SELECT * FROM ai_evaluation_reports WHERE report_id = ?
    `).get(reportId) as any;

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        const dataSources = db.prepare(`
      SELECT * FROM ai_input_data_sources WHERE report_id = ?
    `).all(reportId);

        const performanceScores = db.prepare(`
      SELECT * FROM ai_performance_scores WHERE report_id = ?
    `).all(reportId);

        const riskFactors = db.prepare(`
      SELECT * FROM ai_risk_factors_detected WHERE report_id = ?
      ORDER BY severity DESC
    `).all(reportId);

        const opportunities = db.prepare(`
      SELECT * FROM ai_improvement_opportunities WHERE report_id = ?
      ORDER BY priority DESC
    `).all(reportId);

        const recommendations = db.prepare(`
      SELECT * FROM ai_recommendations WHERE report_id = ?
      ORDER BY priority DESC
    `).all(reportId);

        const reasoning = db.prepare(`
      SELECT * FROM ai_evaluation_reasoning WHERE report_id = ?
    `).all(reportId);

        const history = db.prepare(`
      SELECT * FROM ai_evaluation_history WHERE report_id = ?
      ORDER BY evaluation_date DESC
      LIMIT 12
    `).all(reportId);

        res.json({
            ...(report as Record<string, any>),
            dataSources,
            performanceScores,
            riskFactors,
            opportunities,
            recommendations,
            reasoning,
            history
        });
    } catch (error) {
        console.error('Error fetching evaluation report:', error);
        res.status(500).json({ error: 'Failed to fetch evaluation report' });
    }
});

// Create evaluation report
router.post('/reports', (req: Request, res: Response) => {
    try {
        const {
            report_id,
            evaluation_period,
            total_records,
            status
        } = req.body;

        if (!report_id) {
            return res.status(400).json({ error: 'Report ID is required' });
        }

        const result = db.prepare(`
      INSERT INTO ai_evaluation_reports (
        report_id, evaluation_period, total_records, status
      )
      VALUES (?, ?, ?, ?)
    `).run(
            report_id,
            evaluation_period || 'This Month',
            total_records || 0,
            status || 'Completed'
        );

        res.status(201).json({
            id: result.lastInsertRowid,
            report_id,
            message: 'Evaluation report created successfully'
        });
    } catch (error: any) {
        console.error('Error creating evaluation report:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Report ID already exists' });
        }
        res.status(500).json({ error: 'Failed to create evaluation report' });
    }
});

// Update evaluation report
router.put('/reports/:reportId', (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const { evaluation_period, total_records, status } = req.body;

        db.prepare(`
      UPDATE ai_evaluation_reports
      SET evaluation_period = ?, total_records = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE report_id = ?
    `).run(evaluation_period, total_records, status, reportId);

        res.json({ message: 'Evaluation report updated successfully' });
    } catch (error) {
        console.error('Error updating evaluation report:', error);
        res.status(500).json({ error: 'Failed to update evaluation report' });
    }
});

// Delete evaluation report
router.delete('/reports/:reportId', (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;

        // Delete related data
        db.prepare('DELETE FROM ai_input_data_sources WHERE report_id = ?').run(reportId);
        db.prepare('DELETE FROM ai_performance_scores WHERE report_id = ?').run(reportId);
        db.prepare('DELETE FROM ai_risk_factors_detected WHERE report_id = ?').run(reportId);
        db.prepare('DELETE FROM ai_improvement_opportunities WHERE report_id = ?').run(reportId);
        db.prepare('DELETE FROM ai_recommendations WHERE report_id = ?').run(reportId);
        db.prepare('DELETE FROM ai_evaluation_reasoning WHERE report_id = ?').run(reportId);
        db.prepare('DELETE FROM ai_evaluation_history WHERE report_id = ?').run(reportId);

        const result = db.prepare('DELETE FROM ai_evaluation_reports WHERE report_id = ?').run(reportId);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json({ message: 'Evaluation report deleted successfully' });
    } catch (error) {
        console.error('Error deleting evaluation report:', error);
        res.status(500).json({ error: 'Failed to delete evaluation report' });
    }
});

// Get input data sources
router.get('/reports/:reportId/data-sources', (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;

        const sources = db.prepare(`
      SELECT * FROM ai_input_data_sources WHERE report_id = ?
    `).all(reportId);

        res.json(sources);
    } catch (error) {
        console.error('Error fetching data sources:', error);
        res.status(500).json({ error: 'Failed to fetch data sources' });
    }
});

// Add input data source
router.post('/reports/:reportId/data-sources', (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const { source_name, record_count, data_type, status } = req.body;

        if (!source_name) {
            return res.status(400).json({ error: 'Source name is required' });
        }

        const result = db.prepare(`
      INSERT INTO ai_input_data_sources (
        report_id, source_name, record_count, data_type, status
      )
      VALUES (?, ?, ?, ?, ?)
    `).run(reportId, source_name, record_count || 0, data_type || null, status || 'Active');

        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Data source added successfully'
        });
    } catch (error) {
        console.error('Error adding data source:', error);
        res.status(500).json({ error: 'Failed to add data source' });
    }
});

// Get performance scores
router.get('/reports/:reportId/performance-scores', (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;

        const scores = db.prepare(`
      SELECT * FROM ai_performance_scores WHERE report_id = ?
    `).all(reportId);

        res.json(scores);
    } catch (error) {
        console.error('Error fetching performance scores:', error);
        res.status(500).json({ error: 'Failed to fetch performance scores' });
    }
});

// Add performance score
router.post('/reports/:reportId/performance-scores', (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const { metric_name, score, trend, status } = req.body;

        if (!metric_name) {
            return res.status(400).json({ error: 'Metric name is required' });
        }

        const result = db.prepare(`
      INSERT INTO ai_performance_scores (
        report_id, metric_name, score, trend, status
      )
      VALUES (?, ?, ?, ?, ?)
    `).run(reportId, metric_name, score || 0, trend || 'Stable', status || 'Active');

        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Performance score added successfully'
        });
    } catch (error) {
        console.error('Error adding performance score:', error);
        res.status(500).json({ error: 'Failed to add performance score' });
    }
});

// Get risk factors
router.get('/reports/:reportId/risk-factors', (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;

        const factors = db.prepare(`
      SELECT * FROM ai_risk_factors_detected WHERE report_id = ?
      ORDER BY severity DESC
    `).all(reportId);

        res.json(factors);
    } catch (error) {
        console.error('Error fetching risk factors:', error);
        res.status(500).json({ error: 'Failed to fetch risk factors' });
    }
});

// Add risk factor
router.post('/reports/:reportId/risk-factors', (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const { risk_factor, severity, impact_percentage, description, recommendation, status } = req.body;

        if (!risk_factor) {
            return res.status(400).json({ error: 'Risk factor is required' });
        }

        const result = db.prepare(`
      INSERT INTO ai_risk_factors_detected (
        report_id, risk_factor, severity, impact_percentage, description, recommendation, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
            reportId,
            risk_factor,
            severity || 'Medium',
            impact_percentage || 0,
            description || null,
            recommendation || null,
            status || 'Active'
        );

        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Risk factor added successfully'
        });
    } catch (error) {
        console.error('Error adding risk factor:', error);
        res.status(500).json({ error: 'Failed to add risk factor' });
    }
});

// Get improvement opportunities
router.get('/reports/:reportId/opportunities', (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;

        const opportunities = db.prepare(`
      SELECT * FROM ai_improvement_opportunities WHERE report_id = ?
      ORDER BY priority DESC
    `).all(reportId);

        res.json(opportunities);
    } catch (error) {
        console.error('Error fetching opportunities:', error);
        res.status(500).json({ error: 'Failed to fetch opportunities' });
    }
});

// Add improvement opportunity
router.post('/reports/:reportId/opportunities', (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const {
            opportunity_name,
            category,
            potential_impact,
            priority,
            implementation_effort,
            description,
            action_items,
            status
        } = req.body;

        if (!opportunity_name) {
            return res.status(400).json({ error: 'Opportunity name is required' });
        }

        const result = db.prepare(`
      INSERT INTO ai_improvement_opportunities (
        report_id, opportunity_name, category, potential_impact, priority,
        implementation_effort, description, action_items, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            reportId,
            opportunity_name,
            category || null,
            potential_impact || 0,
            priority || 'Medium',
            implementation_effort || 'Medium',
            description || null,
            action_items || null,
            status || 'Active'
        );

        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Improvement opportunity added successfully'
        });
    } catch (error) {
        console.error('Error adding improvement opportunity:', error);
        res.status(500).json({ error: 'Failed to add improvement opportunity' });
    }
});

// Get recommendations
router.get('/reports/:reportId/recommendations', (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;

        const recommendations = db.prepare(`
      SELECT * FROM ai_recommendations WHERE report_id = ?
      ORDER BY priority DESC
    `).all(reportId);

        res.json(recommendations);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

// Add recommendation
router.post('/reports/:reportId/recommendations', (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const {
            recommendation_text,
            category,
            priority,
            estimated_impact,
            implementation_timeline,
            status
        } = req.body;

        if (!recommendation_text) {
            return res.status(400).json({ error: 'Recommendation text is required' });
        }

        const result = db.prepare(`
      INSERT INTO ai_recommendations (
        report_id, recommendation_text, category, priority, estimated_impact,
        implementation_timeline, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
            reportId,
            recommendation_text,
            category || null,
            priority || 'Medium',
            estimated_impact || 0,
            implementation_timeline || null,
            status || 'Active'
        );

        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Recommendation added successfully'
        });
    } catch (error) {
        console.error('Error adding recommendation:', error);
        res.status(500).json({ error: 'Failed to add recommendation' });
    }
});

// Get evaluation reasoning
router.get('/reports/:reportId/reasoning', (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;

        const reasoning = db.prepare(`
      SELECT * FROM ai_evaluation_reasoning WHERE report_id = ?
    `).all(reportId);

        res.json(reasoning);
    } catch (error) {
        console.error('Error fetching reasoning:', error);
        res.status(500).json({ error: 'Failed to fetch reasoning' });
    }
});

// Add evaluation reasoning
router.post('/reports/:reportId/reasoning', (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const {
            reasoning_section,
            reasoning_text,
            key_findings,
            methodology,
            confidence_score
        } = req.body;

        if (!reasoning_section) {
            return res.status(400).json({ error: 'Reasoning section is required' });
        }

        const result = db.prepare(`
      INSERT INTO ai_evaluation_reasoning (
        report_id, reasoning_section, reasoning_text, key_findings, methodology, confidence_score
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
            reportId,
            reasoning_section,
            reasoning_text || null,
            key_findings || null,
            methodology || null,
            confidence_score || 0
        );

        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Reasoning added successfully'
        });
    } catch (error) {
        console.error('Error adding reasoning:', error);
        res.status(500).json({ error: 'Failed to add reasoning' });
    }
});

// Get evaluation history
router.get('/reports/:reportId/history', (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;

        const history = db.prepare(`
      SELECT * FROM ai_evaluation_history WHERE report_id = ?
      ORDER BY evaluation_date DESC
    `).all(reportId);

        res.json(history);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Add evaluation history entry
router.post('/reports/:reportId/history', (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const { evaluation_date, overall_score, trend, key_metrics } = req.body;

        const result = db.prepare(`
      INSERT INTO ai_evaluation_history (
        report_id, evaluation_date, overall_score, trend, key_metrics
      )
      VALUES (?, ?, ?, ?, ?)
    `).run(
            reportId,
            evaluation_date || new Date().toISOString(),
            overall_score || 0,
            trend || 'Stable',
            key_metrics || null
        );

        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'History entry added successfully'
        });
    } catch (error) {
        console.error('Error adding history entry:', error);
        res.status(500).json({ error: 'Failed to add history entry' });
    }
});

export default router;
