import express, { Request, Response } from 'express';
import { pool } from "../config/db";

const router = express.Router();

// Get all employee scorecards
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT * FROM employee_scorecards
      ORDER BY employee_name
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching scorecards:', error);
        res.status(500).json({ error: 'Failed to fetch scorecards' });
    }
});

// Get employee scorecard by ID
router.get('/:employeeId', async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;

        const scorecardResult = await pool.query(`
      SELECT * FROM employee_scorecards WHERE employee_id = $1
    `, [employeeId]);

        const scorecard = scorecardResult.rows[0];

        if (!scorecard) {
            return res.status(404).json({ error: 'Employee scorecard not found' });
        }

        const kpiContributionResult = await pool.query(`
      SELECT * FROM kpi_contributions WHERE employee_id = $1
    `, [employeeId]);

        const qcHistoryResult = await pool.query(`
      SELECT * FROM qc_performance_history WHERE employee_id = $1
      ORDER BY date_recorded DESC
      LIMIT 10
    `, [employeeId]);

        const attendanceResult = await pool.query(`
      SELECT * FROM attendance_discipline WHERE employee_id = $1
    `, [employeeId]);

        const monthlyContributionResult = await pool.query(`
      SELECT * FROM monthly_contributions WHERE employee_id = $1
      ORDER BY month_year DESC
      LIMIT 12
    `, [employeeId]);

        const aiAnalysisResult = await pool.query(`
      SELECT * FROM ai_performance_analysis WHERE employee_id = $1
      ORDER BY generated_at DESC
      LIMIT 1
    `, [employeeId]);

        const goalsResult = await pool.query(`
      SELECT * FROM performance_goals WHERE employee_id = $1
      ORDER BY due_date
    `, [employeeId]);

        res.json({
            ...scorecard,
            kpiContribution: kpiContributionResult.rows[0] || null,
            qcHistory: qcHistoryResult.rows,
            attendance: attendanceResult.rows[0] || null,
            monthlyContribution: monthlyContributionResult.rows,
            aiAnalysis: aiAnalysisResult.rows[0] || null,
            goals: goalsResult.rows
        });
    } catch (error) {
        console.error('Error fetching employee scorecard:', error);
        res.status(500).json({ error: 'Failed to fetch employee scorecard' });
    }
});

// Create employee scorecard
router.post('/', async (req: Request, res: Response) => {
    try {
        const {
            employee_id,
            employee_name,
            department,
            position,
            reporting_manager,
            effort_score,
            qc_score,
            contribution_score,
            performance_rating
        } = req.body;

        if (!employee_id || !employee_name) {
            return res.status(400).json({ error: 'Employee ID and name are required' });
        }

        const result = await pool.query(`
      INSERT INTO employee_scorecards (
        employee_id, employee_name, department, position, reporting_manager,
        effort_score, qc_score, contribution_score, performance_rating, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING id
    `, [
            employee_id,
            employee_name,
            department || null,
            position || null,
            reporting_manager || null,
            effort_score || 0,
            qc_score || 0,
            contribution_score || 0,
            performance_rating || 'Pending'
        ]);

        res.status(201).json({
            id: result.rows[0].id,
            employee_id,
            message: 'Employee scorecard created successfully'
        });
    } catch (error: any) {
        console.error('Error creating employee scorecard:', error);
        if (error.message.includes('unique constraint')) {
            return res.status(400).json({ error: 'Employee ID already exists' });
        }
        res.status(500).json({ error: 'Failed to create employee scorecard' });
    }
});

// Update employee scorecard
router.put('/:employeeId', async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;
        const {
            employee_name,
            department,
            position,
            reporting_manager,
            effort_score,
            qc_score,
            contribution_score,
            performance_rating,
            performance_rating_percentage,
            self_rating_score,
            uniformity_score
        } = req.body;

        await pool.query(`
      UPDATE employee_scorecards
      SET employee_name = $1, department = $2, position = $3, reporting_manager = $4,
          effort_score = $5, qc_score = $6, contribution_score = $7,
          performance_rating = $8, performance_rating_percentage = $9,
          self_rating_score = $10, uniformity_score = $11, updated_at = NOW()
      WHERE employee_id = $12
    `, [
            employee_name,
            department || null,
            position || null,
            reporting_manager || null,
            effort_score || 0,
            qc_score || 0,
            contribution_score || 0,
            performance_rating || 'Pending',
            performance_rating_percentage || 0,
            self_rating_score || 0,
            uniformity_score || 0,
            employeeId
        ]);

        res.json({ message: 'Employee scorecard updated successfully' });
    } catch (error) {
        console.error('Error updating employee scorecard:', error);
        res.status(500).json({ error: 'Failed to update employee scorecard' });
    }
});

// Delete employee scorecard
router.delete('/:employeeId', async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;

        // Delete related data
        await pool.query('DELETE FROM kpi_contributions WHERE employee_id = $1', [employeeId]);
        await pool.query('DELETE FROM qc_performance_history WHERE employee_id = $1', [employeeId]);
        await pool.query('DELETE FROM attendance_discipline WHERE employee_id = $1', [employeeId]);
        await pool.query('DELETE FROM monthly_contributions WHERE employee_id = $1', [employeeId]);
        await pool.query('DELETE FROM ai_performance_analysis WHERE employee_id = $1', [employeeId]);
        await pool.query('DELETE FROM performance_goals WHERE employee_id = $1', [employeeId]);

        // Delete scorecard
        const result = await pool.query('DELETE FROM employee_scorecards WHERE employee_id = $1', [employeeId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Employee scorecard not found' });
        }

        res.json({ message: 'Employee scorecard deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee scorecard:', error);
        res.status(500).json({ error: 'Failed to delete employee scorecard' });
    }
});

// Get KPI contribution
router.get('/:employeeId/kpi', async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;

        const result = await pool.query(`
      SELECT * FROM kpi_contributions WHERE employee_id = $1
    `, [employeeId]);

        res.json(result.rows[0] || {});
    } catch (error) {
        console.error('Error fetching KPI contribution:', error);
        res.status(500).json({ error: 'Failed to fetch KPI contribution' });
    }
});

// Update KPI contribution
router.put('/:employeeId/kpi', async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;
        const { tasks_completed, error_rate, rework_percentage } = req.body;

        const existingResult = await pool.query(`
      SELECT id FROM kpi_contributions WHERE employee_id = $1
    `, [employeeId]);

        if (existingResult.rows.length > 0) {
            await pool.query(`
        UPDATE kpi_contributions
        SET tasks_completed = $1, error_rate = $2, rework_percentage = $3, updated_at = NOW()
        WHERE employee_id = $4
      `, [tasks_completed || 0, error_rate || 0, rework_percentage || 0, employeeId]);
        } else {
            await pool.query(`
        INSERT INTO kpi_contributions (employee_id, tasks_completed, error_rate, rework_percentage, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
      `, [employeeId, tasks_completed || 0, error_rate || 0, rework_percentage || 0]);
        }

        res.json({ message: 'KPI contribution updated successfully' });
    } catch (error) {
        console.error('Error updating KPI contribution:', error);
        res.status(500).json({ error: 'Failed to update KPI contribution' });
    }
});

// Get QC performance history
router.get('/:employeeId/qc-history', async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;

        const result = await pool.query(`
      SELECT * FROM qc_performance_history WHERE employee_id = $1
      ORDER BY date_recorded DESC
    `, [employeeId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching QC history:', error);
        res.status(500).json({ error: 'Failed to fetch QC history' });
    }
});

// Add QC performance record
router.post('/:employeeId/qc-history', async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;
        const { date_recorded, task_name, score, status, feedback, result } = req.body;

        const resultObj = await pool.query(`
      INSERT INTO qc_performance_history (
        employee_id, date_recorded, task_name, score, status, feedback, result, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id
    `, [
            employeeId,
            date_recorded || new Date().toISOString(),
            task_name || null,
            score || 0,
            status || 'Pending',
            feedback || null,
            result || null
        ]);

        res.status(201).json({
            id: resultObj.rows[0].id,
            message: 'QC performance record created successfully'
        });
    } catch (error) {
        console.error('Error creating QC performance record:', error);
        res.status(500).json({ error: 'Failed to create QC performance record' });
    }
});

// Get attendance & discipline
router.get('/:employeeId/attendance', async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;

        const result = await pool.query(`
      SELECT * FROM attendance_discipline WHERE employee_id = $1
    `, [employeeId]);

        res.json(result.rows[0] || {});
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
});

// Update attendance & discipline
router.put('/:employeeId/attendance', async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;
        const { present_days, absent_days, warnings, disciplinary_actions } = req.body;

        const existingResult = await pool.query(`
      SELECT id FROM attendance_discipline WHERE employee_id = $1
    `, [employeeId]);

        if (existingResult.rows.length > 0) {
            await pool.query(`
        UPDATE attendance_discipline
        SET present_days = $1, absent_days = $2, warnings = $3, disciplinary_actions = $4, updated_at = NOW()
        WHERE employee_id = $5
      `, [present_days || 0, absent_days || 0, warnings || 0, disciplinary_actions || 0, employeeId]);
        } else {
            await pool.query(`
        INSERT INTO attendance_discipline (employee_id, present_days, absent_days, warnings, disciplinary_actions, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      `, [employeeId, present_days || 0, absent_days || 0, warnings || 0, disciplinary_actions || 0]);
        }

        res.json({ message: 'Attendance & discipline updated successfully' });
    } catch (error) {
        console.error('Error updating attendance:', error);
        res.status(500).json({ error: 'Failed to update attendance' });
    }
});

// Get monthly contributions
router.get('/:employeeId/monthly-contributions', async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;

        const result = await pool.query(`
      SELECT * FROM monthly_contributions WHERE employee_id = $1
      ORDER BY month_year DESC
    `, [employeeId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching monthly contributions:', error);
        res.status(500).json({ error: 'Failed to fetch monthly contributions' });
    }
});

// Get AI performance analysis
router.get('/:employeeId/ai-analysis', async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;

        const result = await pool.query(`
      SELECT * FROM ai_performance_analysis WHERE employee_id = $1
      ORDER BY generated_at DESC
      LIMIT 1
    `, [employeeId]);

        res.json(result.rows[0] || {});
    } catch (error) {
        console.error('Error fetching AI analysis:', error);
        res.status(500).json({ error: 'Failed to fetch AI analysis' });
    }
});

// Create AI performance analysis
router.post('/:employeeId/ai-analysis', async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;
        const { analysis_text, strengths, areas_for_improvement, recommendations } = req.body;

        const result = await pool.query(`
      INSERT INTO ai_performance_analysis (
        employee_id, analysis_text, strengths, areas_for_improvement, recommendations, generated_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id
    `, [
            employeeId,
            analysis_text || null,
            strengths || null,
            areas_for_improvement || null,
            recommendations || null
        ]);

        res.status(201).json({
            id: result.rows[0].id,
            message: 'AI analysis created successfully'
        });
    } catch (error) {
        console.error('Error creating AI analysis:', error);
        res.status(500).json({ error: 'Failed to create AI analysis' });
    }
});

// Get performance goals
router.get('/:employeeId/goals', async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;

        const result = await pool.query(`
      SELECT * FROM performance_goals WHERE employee_id = $1
      ORDER BY due_date
    `, [employeeId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching performance goals:', error);
        res.status(500).json({ error: 'Failed to fetch performance goals' });
    }
});

// Create performance goal
router.post('/:employeeId/goals', async (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;
        const { goal_name, goal_description, target_value, current_value, status, due_date } = req.body;

        if (!goal_name) {
            return res.status(400).json({ error: 'Goal name is required' });
        }

        const result = await pool.query(`
      INSERT INTO performance_goals (
        employee_id, goal_name, goal_description, target_value, current_value, status, due_date, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id
    `, [
            employeeId,
            goal_name,
            goal_description || null,
            target_value || 0,
            current_value || 0,
            status || 'In Progress',
            due_date || null
        ]);

        res.status(201).json({
            id: result.rows[0].id,
            message: 'Performance goal created successfully'
        });
    } catch (error) {
        console.error('Error creating performance goal:', error);
        res.status(500).json({ error: 'Failed to create performance goal' });
    }
});

// Update performance goal
router.put('/:employeeId/goals/:goalId', async (req: Request, res: Response) => {
    try {
        const { employeeId, goalId } = req.params;
        const { goal_name, goal_description, target_value, current_value, status, due_date } = req.body;

        await pool.query(`
      UPDATE performance_goals
      SET goal_name = $1, goal_description = $2, target_value = $3, current_value = $4, status = $5, due_date = $6, updated_at = NOW()
      WHERE id = $7 AND employee_id = $8
    `, [
            goal_name,
            goal_description || null,
            target_value || 0,
            current_value || 0,
            status || 'In Progress',
            due_date || null,
            goalId,
            employeeId
        ]);

        res.json({ message: 'Performance goal updated successfully' });
    } catch (error) {
        console.error('Error updating performance goal:', error);
        res.status(500).json({ error: 'Failed to update performance goal' });
    }
});

// Delete performance goal
router.delete('/:employeeId/goals/:goalId', async (req: Request, res: Response) => {
    try {
        const { employeeId, goalId } = req.params;

        const result = await pool.query(`
      DELETE FROM performance_goals WHERE id = $1 AND employee_id = $2
    `, [goalId, employeeId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Performance goal not found' });
        }

        res.json({ message: 'Performance goal deleted successfully' });
    } catch (error) {
        console.error('Error deleting performance goal:', error);
        res.status(500).json({ error: 'Failed to delete performance goal' });
    }
});

export default router;

