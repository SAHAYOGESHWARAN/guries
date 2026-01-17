import express, { Request, Response } from 'express';
import { db } from '../config/db-sqlite';

const router = express.Router();

// Get all employee scorecards
router.get('/', (req: Request, res: Response) => {
    try {
        const scorecards = db.prepare(`
      SELECT * FROM employee_scorecards
      ORDER BY employee_name
    `).all();

        res.json(scorecards);
    } catch (error) {
        console.error('Error fetching scorecards:', error);
        res.status(500).json({ error: 'Failed to fetch scorecards' });
    }
});

// Get employee scorecard by ID
router.get('/:employeeId', (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;

        const scorecard = db.prepare(`
      SELECT * FROM employee_scorecards WHERE employee_id = ?
    `).get(employeeId);

        if (!scorecard) {
            return res.status(404).json({ error: 'Employee scorecard not found' });
        }

        const kpiContribution = db.prepare(`
      SELECT * FROM kpi_contributions WHERE employee_id = ?
    `).get(employeeId);

        const qcHistory = db.prepare(`
      SELECT * FROM qc_performance_history WHERE employee_id = ?
      ORDER BY date_recorded DESC
      LIMIT 10
    `).all(employeeId);

        const attendance = db.prepare(`
      SELECT * FROM attendance_discipline WHERE employee_id = ?
    `).get(employeeId);

        const monthlyContribution = db.prepare(`
      SELECT * FROM monthly_contributions WHERE employee_id = ?
      ORDER BY month_year DESC
      LIMIT 12
    `).all(employeeId);

        const aiAnalysis = db.prepare(`
      SELECT * FROM ai_performance_analysis WHERE employee_id = ?
      ORDER BY generated_at DESC
      LIMIT 1
    `).get(employeeId);

        const goals = db.prepare(`
      SELECT * FROM performance_goals WHERE employee_id = ?
      ORDER BY due_date
    `).all(employeeId);

        res.json({
            ...scorecard,
            kpiContribution,
            qcHistory,
            attendance,
            monthlyContribution,
            aiAnalysis,
            goals
        });
    } catch (error) {
        console.error('Error fetching employee scorecard:', error);
        res.status(500).json({ error: 'Failed to fetch employee scorecard' });
    }
});

// Create employee scorecard
router.post('/', (req: Request, res: Response) => {
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

        const result = db.prepare(`
      INSERT INTO employee_scorecards (
        employee_id, employee_name, department, position, reporting_manager,
        effort_score, qc_score, contribution_score, performance_rating
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            employee_id,
            employee_name,
            department || null,
            position || null,
            reporting_manager || null,
            effort_score || 0,
            qc_score || 0,
            contribution_score || 0,
            performance_rating || 'Pending'
        );

        res.status(201).json({
            id: result.lastInsertRowid,
            employee_id,
            message: 'Employee scorecard created successfully'
        });
    } catch (error: any) {
        console.error('Error creating employee scorecard:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Employee ID already exists' });
        }
        res.status(500).json({ error: 'Failed to create employee scorecard' });
    }
});

// Update employee scorecard
router.put('/:employeeId', (req: Request, res: Response) => {
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

        db.prepare(`
      UPDATE employee_scorecards
      SET employee_name = ?, department = ?, position = ?, reporting_manager = ?,
          effort_score = ?, qc_score = ?, contribution_score = ?,
          performance_rating = ?, performance_rating_percentage = ?,
          self_rating_score = ?, uniformity_score = ?, updated_at = CURRENT_TIMESTAMP
      WHERE employee_id = ?
    `).run(
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
        );

        res.json({ message: 'Employee scorecard updated successfully' });
    } catch (error) {
        console.error('Error updating employee scorecard:', error);
        res.status(500).json({ error: 'Failed to update employee scorecard' });
    }
});

// Delete employee scorecard
router.delete('/:employeeId', (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;

        // Delete related data
        db.prepare('DELETE FROM kpi_contributions WHERE employee_id = ?').run(employeeId);
        db.prepare('DELETE FROM qc_performance_history WHERE employee_id = ?').run(employeeId);
        db.prepare('DELETE FROM attendance_discipline WHERE employee_id = ?').run(employeeId);
        db.prepare('DELETE FROM monthly_contributions WHERE employee_id = ?').run(employeeId);
        db.prepare('DELETE FROM ai_performance_analysis WHERE employee_id = ?').run(employeeId);
        db.prepare('DELETE FROM performance_goals WHERE employee_id = ?').run(employeeId);

        // Delete scorecard
        const result = db.prepare('DELETE FROM employee_scorecards WHERE employee_id = ?').run(employeeId);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Employee scorecard not found' });
        }

        res.json({ message: 'Employee scorecard deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee scorecard:', error);
        res.status(500).json({ error: 'Failed to delete employee scorecard' });
    }
});

// Get KPI contribution
router.get('/:employeeId/kpi', (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;

        const kpi = db.prepare(`
      SELECT * FROM kpi_contributions WHERE employee_id = ?
    `).get(employeeId);

        res.json(kpi || {});
    } catch (error) {
        console.error('Error fetching KPI contribution:', error);
        res.status(500).json({ error: 'Failed to fetch KPI contribution' });
    }
});

// Update KPI contribution
router.put('/:employeeId/kpi', (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;
        const { tasks_completed, error_rate, rework_percentage } = req.body;

        const existing = db.prepare(`
      SELECT id FROM kpi_contributions WHERE employee_id = ?
    `).get(employeeId);

        if (existing) {
            db.prepare(`
        UPDATE kpi_contributions
        SET tasks_completed = ?, error_rate = ?, rework_percentage = ?, updated_at = CURRENT_TIMESTAMP
        WHERE employee_id = ?
      `).run(tasks_completed || 0, error_rate || 0, rework_percentage || 0, employeeId);
        } else {
            db.prepare(`
        INSERT INTO kpi_contributions (employee_id, tasks_completed, error_rate, rework_percentage)
        VALUES (?, ?, ?, ?)
      `).run(employeeId, tasks_completed || 0, error_rate || 0, rework_percentage || 0);
        }

        res.json({ message: 'KPI contribution updated successfully' });
    } catch (error) {
        console.error('Error updating KPI contribution:', error);
        res.status(500).json({ error: 'Failed to update KPI contribution' });
    }
});

// Get QC performance history
router.get('/:employeeId/qc-history', (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;

        const history = db.prepare(`
      SELECT * FROM qc_performance_history WHERE employee_id = ?
      ORDER BY date_recorded DESC
    `).all(employeeId);

        res.json(history);
    } catch (error) {
        console.error('Error fetching QC history:', error);
        res.status(500).json({ error: 'Failed to fetch QC history' });
    }
});

// Add QC performance record
router.post('/:employeeId/qc-history', (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;
        const { date_recorded, task_name, score, status, feedback, result } = req.body;

        const result_obj = db.prepare(`
      INSERT INTO qc_performance_history (
        employee_id, date_recorded, task_name, score, status, feedback, result
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
            employeeId,
            date_recorded || new Date().toISOString(),
            task_name || null,
            score || 0,
            status || 'Pending',
            feedback || null,
            result || null
        );

        res.status(201).json({
            id: result_obj.lastInsertRowid,
            message: 'QC performance record created successfully'
        });
    } catch (error) {
        console.error('Error creating QC performance record:', error);
        res.status(500).json({ error: 'Failed to create QC performance record' });
    }
});

// Get attendance & discipline
router.get('/:employeeId/attendance', (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;

        const attendance = db.prepare(`
      SELECT * FROM attendance_discipline WHERE employee_id = ?
    `).get(employeeId);

        res.json(attendance || {});
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
});

// Update attendance & discipline
router.put('/:employeeId/attendance', (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;
        const { present_days, absent_days, warnings, disciplinary_actions } = req.body;

        const existing = db.prepare(`
      SELECT id FROM attendance_discipline WHERE employee_id = ?
    `).get(employeeId);

        if (existing) {
            db.prepare(`
        UPDATE attendance_discipline
        SET present_days = ?, absent_days = ?, warnings = ?, disciplinary_actions = ?, updated_at = CURRENT_TIMESTAMP
        WHERE employee_id = ?
      `).run(present_days || 0, absent_days || 0, warnings || 0, disciplinary_actions || 0, employeeId);
        } else {
            db.prepare(`
        INSERT INTO attendance_discipline (employee_id, present_days, absent_days, warnings, disciplinary_actions)
        VALUES (?, ?, ?, ?, ?)
      `).run(employeeId, present_days || 0, absent_days || 0, warnings || 0, disciplinary_actions || 0);
        }

        res.json({ message: 'Attendance & discipline updated successfully' });
    } catch (error) {
        console.error('Error updating attendance:', error);
        res.status(500).json({ error: 'Failed to update attendance' });
    }
});

// Get monthly contributions
router.get('/:employeeId/monthly-contributions', (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;

        const contributions = db.prepare(`
      SELECT * FROM monthly_contributions WHERE employee_id = ?
      ORDER BY month_year DESC
    `).all(employeeId);

        res.json(contributions);
    } catch (error) {
        console.error('Error fetching monthly contributions:', error);
        res.status(500).json({ error: 'Failed to fetch monthly contributions' });
    }
});

// Get AI performance analysis
router.get('/:employeeId/ai-analysis', (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;

        const analysis = db.prepare(`
      SELECT * FROM ai_performance_analysis WHERE employee_id = ?
      ORDER BY generated_at DESC
      LIMIT 1
    `).get(employeeId);

        res.json(analysis || {});
    } catch (error) {
        console.error('Error fetching AI analysis:', error);
        res.status(500).json({ error: 'Failed to fetch AI analysis' });
    }
});

// Create AI performance analysis
router.post('/:employeeId/ai-analysis', (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;
        const { analysis_text, strengths, areas_for_improvement, recommendations } = req.body;

        const result = db.prepare(`
      INSERT INTO ai_performance_analysis (
        employee_id, analysis_text, strengths, areas_for_improvement, recommendations
      )
      VALUES (?, ?, ?, ?, ?)
    `).run(
            employeeId,
            analysis_text || null,
            strengths || null,
            areas_for_improvement || null,
            recommendations || null
        );

        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'AI analysis created successfully'
        });
    } catch (error) {
        console.error('Error creating AI analysis:', error);
        res.status(500).json({ error: 'Failed to create AI analysis' });
    }
});

// Get performance goals
router.get('/:employeeId/goals', (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;

        const goals = db.prepare(`
      SELECT * FROM performance_goals WHERE employee_id = ?
      ORDER BY due_date
    `).all(employeeId);

        res.json(goals);
    } catch (error) {
        console.error('Error fetching performance goals:', error);
        res.status(500).json({ error: 'Failed to fetch performance goals' });
    }
});

// Create performance goal
router.post('/:employeeId/goals', (req: Request, res: Response) => {
    try {
        const { employeeId } = req.params;
        const { goal_name, goal_description, target_value, current_value, status, due_date } = req.body;

        if (!goal_name) {
            return res.status(400).json({ error: 'Goal name is required' });
        }

        const result = db.prepare(`
      INSERT INTO performance_goals (
        employee_id, goal_name, goal_description, target_value, current_value, status, due_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
            employeeId,
            goal_name,
            goal_description || null,
            target_value || 0,
            current_value || 0,
            status || 'In Progress',
            due_date || null
        );

        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Performance goal created successfully'
        });
    } catch (error) {
        console.error('Error creating performance goal:', error);
        res.status(500).json({ error: 'Failed to create performance goal' });
    }
});

// Update performance goal
router.put('/:employeeId/goals/:goalId', (req: Request, res: Response) => {
    try {
        const { employeeId, goalId } = req.params;
        const { goal_name, goal_description, target_value, current_value, status, due_date } = req.body;

        db.prepare(`
      UPDATE performance_goals
      SET goal_name = ?, goal_description = ?, target_value = ?, current_value = ?, status = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND employee_id = ?
    `).run(
            goal_name,
            goal_description || null,
            target_value || 0,
            current_value || 0,
            status || 'In Progress',
            due_date || null,
            goalId,
            employeeId
        );

        res.json({ message: 'Performance goal updated successfully' });
    } catch (error) {
        console.error('Error updating performance goal:', error);
        res.status(500).json({ error: 'Failed to update performance goal' });
    }
});

// Delete performance goal
router.delete('/:employeeId/goals/:goalId', (req: Request, res: Response) => {
    try {
        const { employeeId, goalId } = req.params;

        const result = db.prepare(`
      DELETE FROM performance_goals WHERE id = ? AND employee_id = ?
    `).run(goalId, employeeId);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Performance goal not found' });
        }

        res.json({ message: 'Performance goal deleted successfully' });
    } catch (error) {
        console.error('Error deleting performance goal:', error);
        res.status(500).json({ error: 'Failed to delete performance goal' });
    }
});

export default router;
