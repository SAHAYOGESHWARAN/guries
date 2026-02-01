import express, { Request, Response } from 'express';
import { pool } from "../config/db";

const router = express.Router();

// Get employee performance ranking
router.get('/ranking', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT * FROM employee_performance_ranking
      ORDER BY rank_position ASC
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching employee ranking:', error);
        res.status(500).json({ error: 'Failed to fetch employee ranking' });
    }
});

// Get best performers
router.get('/best-performers', async (req: Request, res: Response) => {
    try {
        const { period } = req.query;
        let query = 'SELECT * FROM best_performers';
        const params: any[] = [];
        let paramIndex = 1;

        if (period) {
            query += ` WHERE period = $${paramIndex++}`;
            params.push(period);
        }

        query += ' ORDER BY performance_score DESC LIMIT 10';
        const result = await pool.query(query, params);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching best performers:', error);
        res.status(500).json({ error: 'Failed to fetch best performers' });
    }
});

// Get weekly performance heatmap
router.get('/weekly-heatmap', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT * FROM weekly_performance_heatmap
      ORDER BY week_number DESC
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching weekly heatmap:', error);
        res.status(500).json({ error: 'Failed to fetch weekly heatmap' });
    }
});

// Get underperforming employees
router.get('/underperforming', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT * FROM underperforming_employees
      WHERE status != 'Resolved'
      ORDER BY gap DESC
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching underperforming employees:', error);
        res.status(500).json({ error: 'Failed to fetch underperforming employees' });
    }
});

// Get performance comparison matrix
router.get('/comparison-matrix', async (req: Request, res: Response) => {
    try {
        const { employee_id_1, employee_id_2 } = req.query;

        if (!employee_id_1 || !employee_id_2) {
            return res.status(400).json({ error: 'Both employee IDs are required' });
        }

        const result = await pool.query(`
      SELECT * FROM performance_comparison_matrix
      WHERE (employee_id_1 = $1 AND employee_id_2 = $2) OR (employee_id_1 = $3 AND employee_id_2 = $4)
    `, [employee_id_1, employee_id_2, employee_id_2, employee_id_1]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching comparison matrix:', error);
        res.status(500).json({ error: 'Failed to fetch comparison matrix' });
    }
});

// Get top performers radar data
router.get('/top-performers-radar', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT * FROM top_performers_radar
      ORDER BY employee_id, metric_name
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching radar data:', error);
        res.status(500).json({ error: 'Failed to fetch radar data' });
    }
});

// Get department performance summary
router.get('/department-summary', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT * FROM department_performance_summary
      ORDER BY average_performance DESC
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching department summary:', error);
        res.status(500).json({ error: 'Failed to fetch department summary' });
    }
});

// Create employee performance ranking
router.post('/ranking', async (req: Request, res: Response) => {
    try {
        const {
            employee_id,
            employee_name,
            department,
            rank_position,
            completion_score,
            qc_score,
            contribution_score,
            performance_rating,
            trend
        } = req.body;

        if (!employee_id || !employee_name) {
            return res.status(400).json({ error: 'Employee ID and name are required' });
        }

        const result = await pool.query(`
      INSERT INTO employee_performance_ranking (
        employee_id, employee_name, department, rank_position,
        completion_score, qc_score, contribution_score, performance_rating, trend
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [
            employee_id,
            employee_name,
            department || null,
            rank_position || null,
            completion_score || 0,
            qc_score || 0,
            contribution_score || 0,
            performance_rating || 'Pending',
            trend || 'Stable'
        ]);

        res.status(201).json({
            id: result.rows[0].id,
            message: 'Employee ranking created successfully'
        });
    } catch (error: any) {
        console.error('Error creating employee ranking:', error);
        if (error.code === '23505' || error.message.includes('unique constraint')) {
            return res.status(400).json({ error: 'Employee ranking already exists' });
        }
        res.status(500).json({ error: 'Failed to create employee ranking' });
    }
});

// Update employee performance ranking
router.put('/ranking/:employeeId', async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;
        const {
            employee_name,
            department,
            rank_position,
            completion_score,
            qc_score,
            contribution_score,
            performance_rating,
            trend
        } = req.body;

        await pool.query(`
      UPDATE employee_performance_ranking
      SET employee_name = $1, department = $2, rank_position = $3,
          completion_score = $4, qc_score = $5, contribution_score = $6,
          performance_rating = $7, trend = $8, updated_at = CURRENT_TIMESTAMP
      WHERE employee_id = $9
    `, [
            employee_name,
            department || null,
            rank_position || null,
            completion_score || 0,
            qc_score || 0,
            contribution_score || 0,
            performance_rating || 'Pending',
            trend || 'Stable',
            employeeId
        ]);

        res.json({ message: 'Employee ranking updated successfully' });
    } catch (error) {
        console.error('Error updating employee ranking:', error);
        res.status(500).json({ error: 'Failed to update employee ranking' });
    }
});

// Delete employee performance ranking
router.delete('/ranking/:employeeId', async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;

        const result = await pool.query('DELETE FROM employee_performance_ranking WHERE employee_id = $1', [employeeId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Employee ranking not found' });
        }

        res.json({ message: 'Employee ranking deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee ranking:', error);
        res.status(500).json({ error: 'Failed to delete employee ranking' });
    }
});

// Create best performer record
router.post('/best-performers', async (req: Request, res: Response) => {
    try {
        const {
            employee_id,
            employee_name,
            department,
            performance_score,
            achievement_percentage,
            period
        } = req.body;

        if (!employee_id || !employee_name) {
            return res.status(400).json({ error: 'Employee ID and name are required' });
        }

        const result = await pool.query(`
      INSERT INTO best_performers (
        employee_id, employee_name, department, performance_score, achievement_percentage, period
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [
            employee_id,
            employee_name,
            department || null,
            performance_score || 0,
            achievement_percentage || 0,
            period || 'Monthly'
        ]);

        res.status(201).json({
            id: result.rows[0].id,
            message: 'Best performer record created successfully'
        });
    } catch (error) {
        console.error('Error creating best performer record:', error);
        res.status(500).json({ error: 'Failed to create best performer record' });
    }
});

// Create weekly performance heatmap entry
router.post('/weekly-heatmap', async (req: Request, res: Response) => {
    try {
        const {
            employee_id,
            employee_name,
            week_number,
            performance_percentage,
            status
        } = req.body;

        if (!employee_id || !employee_name || week_number === undefined) {
            return res.status(400).json({ error: 'Employee ID, name, and week number are required' });
        }

        const result = await pool.query(`
      INSERT INTO weekly_performance_heatmap (
        employee_id, employee_name, week_number, performance_percentage, status
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [
            employee_id,
            employee_name,
            week_number,
            performance_percentage || 0,
            status || 'Normal'
        ]);

        res.status(201).json({
            id: result.rows[0].id,
            message: 'Weekly heatmap entry created successfully'
        });
    } catch (error: any) {
        console.error('Error creating weekly heatmap entry:', error);
        if (error.code === '23505' || error.message.includes('unique constraint')) {
            return res.status(400).json({ error: 'Heatmap entry for this week already exists' });
        }
        res.status(500).json({ error: 'Failed to create weekly heatmap entry' });
    }
});

// Create underperforming employee record
router.post('/underperforming', async (req: Request, res: Response) => {
    try {
        const {
            employee_id,
            employee_name,
            department,
            current_score,
            target_score,
            gap,
            reason,
            status
        } = req.body;

        if (!employee_id || !employee_name) {
            return res.status(400).json({ error: 'Employee ID and name are required' });
        }

        const result = await pool.query(`
      INSERT INTO underperforming_employees (
        employee_id, employee_name, department, current_score, target_score,
        gap, reason, detection_date, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, $8)
      RETURNING id
    `, [
            employee_id,
            employee_name,
            department || null,
            current_score || 0,
            target_score || 0,
            gap || 0,
            reason || null,
            status || 'Active'
        ]);

        res.status(201).json({
            id: result.rows[0].id,
            message: 'Underperforming employee record created successfully'
        });
    } catch (error: any) {
        console.error('Error creating underperforming employee record:', error);
        if (error.code === '23505' || error.message.includes('unique constraint')) {
            return res.status(400).json({ error: 'Record for this employee already exists' });
        }
        res.status(500).json({ error: 'Failed to create underperforming employee record' });
    }
});

// Update underperforming employee record
router.put('/underperforming/:employeeId', async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;
        const { current_score, target_score, gap, reason, status } = req.body;

        await pool.query(`
      UPDATE underperforming_employees
      SET current_score = $1, target_score = $2, gap = $3, reason = $4, status = $5, updated_at = CURRENT_TIMESTAMP
      WHERE employee_id = $6
    `, [
            current_score || 0,
            target_score || 0,
            gap || 0,
            reason || null,
            status || 'Active',
            employeeId
        ]);

        res.json({ message: 'Underperforming employee record updated successfully' });
    } catch (error) {
        console.error('Error updating underperforming employee record:', error);
        res.status(500).json({ error: 'Failed to update underperforming employee record' });
    }
});

// Create performance comparison matrix entry
router.post('/comparison-matrix', async (req: Request, res: Response) => {
    try {
        const {
            employee_id_1,
            employee_id_2,
            employee_name_1,
            employee_name_2,
            metric_name,
            value_1,
            value_2,
            difference
        } = req.body;

        if (!employee_id_1 || !employee_id_2 || !metric_name) {
            return res.status(400).json({ error: 'Employee IDs and metric name are required' });
        }

        const result = await pool.query(`
      INSERT INTO performance_comparison_matrix (
        employee_id_1, employee_id_2, employee_name_1, employee_name_2,
        metric_name, value_1, value_2, difference
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
            employee_id_1,
            employee_id_2,
            employee_name_1 || null,
            employee_name_2 || null,
            metric_name,
            value_1 || 0,
            value_2 || 0,
            difference || 0
        ]);

        res.status(201).json({
            id: result.rows[0].id,
            message: 'Comparison matrix entry created successfully'
        });
    } catch (error) {
        console.error('Error creating comparison matrix entry:', error);
        res.status(500).json({ error: 'Failed to create comparison matrix entry' });
    }
});

// Create top performers radar data
router.post('/top-performers-radar', async (req: Request, res: Response) => {
    try {
        const {
            employee_id,
            employee_name,
            metric_name,
            metric_value
        } = req.body;

        if (!employee_id || !employee_name || !metric_name) {
            return res.status(400).json({ error: 'Employee ID, name, and metric name are required' });
        }

        const result = await pool.query(`
      INSERT INTO top_performers_radar (
        employee_id, employee_name, metric_name, metric_value
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [
            employee_id,
            employee_name,
            metric_name,
            metric_value || 0
        ]);

        res.status(201).json({
            id: result.rows[0].id,
            message: 'Radar data created successfully'
        });
    } catch (error: any) {
        console.error('Error creating radar data:', error);
        if (error.code === '23505' || error.message.includes('unique constraint')) {
            return res.status(400).json({ error: 'Radar data for this metric already exists' });
        }
        res.status(500).json({ error: 'Failed to create radar data' });
    }
});

// Update top performers radar data
router.put('/top-performers-radar/:employeeId/:metricName', async (req: Request, res: Response) => {
    try {
        const { employeeId, metricName } = req.params;
        const { metric_value } = req.body;

        await pool.query(`
      UPDATE top_performers_radar
      SET metric_value = $1, updated_at = CURRENT_TIMESTAMP
      WHERE employee_id = $2 AND metric_name = $3
    `, [metric_value || 0, employeeId, metricName]);

        res.json({ message: 'Radar data updated successfully' });
    } catch (error) {
        console.error('Error updating radar data:', error);
        res.status(500).json({ error: 'Failed to update radar data' });
    }
});

// Create department performance summary
router.post('/department-summary', async (req: Request, res: Response) => {
    try {
        const {
            department,
            average_performance,
            top_performer_name,
            underperformer_count,
            total_employees
        } = req.body;

        if (!department) {
            return res.status(400).json({ error: 'Department is required' });
        }

        const result = await pool.query(`
      INSERT INTO department_performance_summary (
        department, average_performance, top_performer_name, underperformer_count, total_employees
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [
            department,
            average_performance || 0,
            top_performer_name || null,
            underperformer_count || 0,
            total_employees || 0
        ]);

        res.status(201).json({
            id: result.rows[0].id,
            message: 'Department summary created successfully'
        });
    } catch (error: any) {
        console.error('Error creating department summary:', error);
        if (error.code === '23505' || error.message.includes('unique constraint')) {
            return res.status(400).json({ error: 'Summary for this department already exists' });
        }
        res.status(500).json({ error: 'Failed to create department summary' });
    }
});

// Update department performance summary
router.put('/department-summary/:department', async (req: Request, res: Response) => {
    try {
        const { department } = req.params;
        const {
            average_performance,
            top_performer_name,
            underperformer_count,
            total_employees
        } = req.body;

        await pool.query(`
      UPDATE department_performance_summary
      SET average_performance = $1, top_performer_name = $2, underperformer_count = $3,
          total_employees = $4, updated_at = CURRENT_TIMESTAMP
      WHERE department = $5
    `, [
            average_performance || 0,
            top_performer_name || null,
            underperformer_count || 0,
            total_employees || 0,
            department
        ]);

        res.json({ message: 'Department summary updated successfully' });
    } catch (error) {
        console.error('Error updating department summary:', error);
        res.status(500).json({ error: 'Failed to update department summary' });
    }
});

export default router;

