import express, { Request, Response } from 'express';
import { pool } from "../config/db";

const router = express.Router();

// Get all evaluation reports
router.get('/reports', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT * FROM ai_evaluation_reports
      ORDER BY evaluation_date DESC
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching evaluation reports:', error);
        res.status(500).json({ error: 'Failed to fetch evaluation reports' });
    }
});

// Get evaluation report by ID
router.get('/reports/:reportId', async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;

        const reportResult = await pool.query(`
      SELECT * FROM ai_evaluation_reports WHERE report_id = $1
    `, [reportId]);

        const report = reportResult.rows[0];

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        const dataSourcesResult = await pool.query(`
      SELECT * FROM ai_input_data_sources WHERE report_id = $1
    `, [reportId]);

        const performanceScoresResult = await pool.query(`
      SELECT * FROM ai_performance_scores WHERE report_id = $1
    `, [reportId]);

        const riskFactorsResult = await pool.query(`
      SELECT * FROM ai_risk_factors_detected WHERE report_id = $1
      ORDER BY severity DESC
    `, [reportId]);

        const opportunitiesResult = await pool.query(`
      SELECT * FROM ai_improvement_opportunities WHERE report_id = $1
      ORDER BY priority DESC
    `, [reportId]);

        const recommendationsResult = await pool.query(`
      SELECT * FROM ai_recommendations WHERE report_id = $1
      ORDER BY priority DESC
    `, [reportId]);

        const reasoningResult = await pool.query(`
      SELECT * FROM ai_evaluation_reasoning WHERE report_id = $1
    `, [reportId]);

        const historyResult = await pool.query(`
      SELECT * FROM ai_evaluation_history WHERE report_id = $1
      ORDER BY evaluation_date DESC
      LIMIT 12
    `, [reportId]);

        res.json({
            ...report,
            dataSources: dataSourcesResult.rows,
            performanceScores: performanceScoresResult.rows,
            riskFactors: riskFactorsResult.rows,
            opportunities: opportunitiesResult.rows,
            recommendations: recommendationsResult.rows,
            reasoning: reasoningResult.rows,
            history: historyResult.rows
        });
    } catch (error) {
        console.error('Error fetching evaluation report:', error);
        res.status(500).json({ error: 'Failed to fetch evaluation report' });
    }
});

// Create evaluation report
router.post('/reports', async (req: Request, res: Response) => {
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

        const result = await pool.query(`
      INSERT INTO ai_evaluation_reports (
        report_id, evaluation_period, total_records, status
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [
            report_id,
            evaluation_period || 'This Month',
            total_records || 0,
            status || 'Completed'
        ]);

        res.status(201).json({
            id: result.rows[0].id,
            report_id,
            message: 'Evaluation report created successfully'
        });
    } catch (error: any) {
        console.error('Error creating evaluation report:', error);
        if (error.message.includes('unique constraint') || error.code === '23505') {
            return res.status(400).json({ error: 'Report ID already exists' });
        }
        res.status(500).json({ error: 'Failed to create evaluation report' });
    }
});

// Update evaluation report
router.put('/reports/:reportId', async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const { evaluation_period, total_records, status } = req.body;

        await pool.query(`
      UPDATE ai_evaluation_reports
      SET evaluation_period = $1, total_records = $2, status = $3, updated_at = CURRENT_TIMESTAMP
      WHERE report_id = $4
    `, [evaluation_period, total_records, status, reportId]);

        res.json({ message: 'Evaluation report updated successfully' });
    } catch (error) {
        console.error('Error updating evaluation report:', error);
        res.status(500).json({ error: 'Failed to update evaluation report' });
    }
});

// Delete evaluation report
router.delete('/reports/:reportId', async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;

        // Delete related data
        await pool.query('DELETE FROM ai_input_data_sources WHERE report_id = $1', [reportId]);
        await pool.query('DELETE FROM ai_performance_scores WHERE report_id = $1', [reportId]);
        await pool.query('DELETE FROM ai_risk_factors_detected WHERE report_id = $1', [reportId]);
        await pool.query('DELETE FROM ai_improvement_opportunities WHERE report_id = $1', [reportId]);
        await pool.query('DELETE FROM ai_recommendations WHERE report_id = $1', [reportId]);
        await pool.query('DELETE FROM ai_evaluation_reasoning WHERE report_id = $1', [reportId]);
        await pool.query('DELETE FROM ai_evaluation_history WHERE report_id = $1', [reportId]);

        const result = await pool.query('DELETE FROM ai_evaluation_reports WHERE report_id = $1', [reportId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json({ message: 'Evaluation report deleted successfully' });
    } catch (error) {
        console.error('Error deleting evaluation report:', error);
        res.status(500).json({ error: 'Failed to delete evaluation report' });
    }
});

// Get input data sources
router.get('/reports/:reportId/data-sources', async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;

        const result = await pool.query(`
      SELECT * FROM ai_input_data_sources WHERE report_id = $1
    `, [reportId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching data sources:', error);
        res.status(500).json({ error: 'Failed to fetch data sources' });
    }
});

// Add input data source
router.post('/reports/:reportId/data-sources', async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const { source_name, record_count, data_type, status } = req.body;

        if (!source_name) {
            return res.status(400).json({ error: 'Source name is required' });
        }

        const result = await pool.query(`
      INSERT INTO ai_input_data_sources (
        report_id, source_name, record_count, data_type, status
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [reportId, source_name, record_count || 0, data_type || null, status || 'Active']);

        res.status(201).json({
            id: result.rows[0].id,
            message: 'Data source added successfully'
        });
    } catch (error) {
        console.error('Error adding data source:', error);
        res.status(500).json({ error: 'Failed to add data source' });
    }
});

// Get performance scores
router.get('/reports/:reportId/performance-scores', async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;

        const result = await pool.query(`
      SELECT * FROM ai_performance_scores WHERE report_id = $1
    `, [reportId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching performance scores:', error);
        res.status(500).json({ error: 'Failed to fetch performance scores' });
    }
});

// Add performance score
router.post('/reports/:reportId/performance-scores', async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const { metric_name, score, trend, status } = req.body;

        if (!metric_name) {
            return res.status(400).json({ error: 'Metric name is required' });
        }

        const result = await pool.query(`
      INSERT INTO ai_performance_scores (
        report_id, metric_name, score, trend, status
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [reportId, metric_name, score || 0, trend || 'Stable', status || 'Active']);

        res.status(201).json({
            id: result.rows[0].id,
            message: 'Performance score added successfully'
        });
    } catch (error) {
        console.error('Error adding performance score:', error);
        res.status(500).json({ error: 'Failed to add performance score' });
    }
});

// Get risk factors
router.get('/reports/:reportId/risk-factors', async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;

        const result = await pool.query(`
      SELECT * FROM ai_risk_factors_detected WHERE report_id = $1
      ORDER BY severity DESC
    `, [reportId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching risk factors:', error);
        res.status(500).json({ error: 'Failed to fetch risk factors' });
    }
});

// Add risk factor
router.post('/reports/:reportId/risk-factors', async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const { risk_factor, severity, impact_percentage, description, recommendation, status } = req.body;

        if (!risk_factor) {
            return res.status(400).json({ error: 'Risk factor is required' });
        }

        const result = await pool.query(`
      INSERT INTO ai_risk_factors_detected (
        report_id, risk_factor, severity, impact_percentage, description, recommendation, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [
            reportId,
            risk_factor,
            severity || 'Medium',
            impact_percentage || 0,
            description || null,
            recommendation || null,
            status || 'Active'
        ]);

        res.status(201).json({
            id: result.rows[0].id,
            message: 'Risk factor added successfully'
        });
    } catch (error) {
        console.error('Error adding risk factor:', error);
        res.status(500).json({ error: 'Failed to add risk factor' });
    }
});

// Get improvement opportunities
router.get('/reports/:reportId/opportunities', async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;

        const result = await pool.query(`
      SELECT * FROM ai_improvement_opportunities WHERE report_id = $1
      ORDER BY priority DESC
    `, [reportId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching opportunities:', error);
        res.status(500).json({ error: 'Failed to fetch opportunities' });
    }
});

// Add improvement opportunity
router.post('/reports/:reportId/opportunities', async (req: Request, res: Response) => {
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

        const result = await pool.query(`
      INSERT INTO ai_improvement_opportunities (
        report_id, opportunity_name, category, potential_impact, priority,
        implementation_effort, description, action_items, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [
            reportId,
            opportunity_name,
            category || null,
            potential_impact || 0,
            priority || 'Medium',
            implementation_effort || 'Medium',
            description || null,
            action_items || null,
            status || 'Active'
        ]);

        res.status(201).json({
            id: result.rows[0].id,
            message: 'Improvement opportunity added successfully'
        });
    } catch (error) {
        console.error('Error adding improvement opportunity:', error);
        res.status(500).json({ error: 'Failed to add improvement opportunity' });
    }
});

// Get recommendations
router.get('/reports/:reportId/recommendations', async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;

        const result = await pool.query(`
      SELECT * FROM ai_recommendations WHERE report_id = $1
      ORDER BY priority DESC
    `, [reportId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

// Add recommendation
router.post('/reports/:reportId/recommendations', async (req: Request, res: Response) => {
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

        const result = await pool.query(`
      INSERT INTO ai_recommendations (
        report_id, recommendation_text, category, priority, estimated_impact,
        implementation_timeline, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [
            reportId,
            recommendation_text,
            category || null,
            priority || 'Medium',
            estimated_impact || 0,
            implementation_timeline || null,
            status || 'Active'
        ]);

        res.status(201).json({
            id: result.rows[0].id,
            message: 'Recommendation added successfully'
        });
    } catch (error) {
        console.error('Error adding recommendation:', error);
        res.status(500).json({ error: 'Failed to add recommendation' });
    }
});

// Get evaluation reasoning
router.get('/reports/:reportId/reasoning', async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;

        const result = await pool.query(`
      SELECT * FROM ai_evaluation_reasoning WHERE report_id = $1
    `, [reportId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching reasoning:', error);
        res.status(500).json({ error: 'Failed to fetch reasoning' });
    }
});

// Add evaluation reasoning
router.post('/reports/:reportId/reasoning', async (req: Request, res: Response) => {
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

        const result = await pool.query(`
      INSERT INTO ai_evaluation_reasoning (
        report_id, reasoning_section, reasoning_text, key_findings, methodology, confidence_score
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [
            reportId,
            reasoning_section,
            reasoning_text || null,
            key_findings || null,
            methodology || null,
            confidence_score || 0
        ]);

        res.status(201).json({
            id: result.rows[0].id,
            message: 'Reasoning added successfully'
        });
    } catch (error) {
        console.error('Error adding reasoning:', error);
        res.status(500).json({ error: 'Failed to add reasoning' });
    }
});

// Get evaluation history
router.get('/reports/:reportId/history', async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;

        const result = await pool.query(`
      SELECT * FROM ai_evaluation_history WHERE report_id = $1
      ORDER BY evaluation_date DESC
    `, [reportId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Add evaluation history entry
router.post('/reports/:reportId/history', async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const { evaluation_date, overall_score, trend, key_metrics } = req.body;

        const result = await pool.query(`
      INSERT INTO ai_evaluation_history (
        report_id, evaluation_date, overall_score, trend, key_metrics
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [
            reportId,
            evaluation_date || new Date().toISOString(),
            overall_score || 0,
            trend || 'Stable',
            key_metrics || null
        ]);

        res.status(201).json({
            id: result.rows[0].id,
            message: 'History entry added successfully'
        });
    } catch (error) {
        console.error('Error adding history entry:', error);
        res.status(500).json({ error: 'Failed to add history entry' });
    }
});

export default router;

