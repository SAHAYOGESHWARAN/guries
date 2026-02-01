import express, { Request, Response } from 'express';
import { pool } from "../config/db";

const router = express.Router();

// Get team workload distribution
router.get('/workload-distribution/:teamId', (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;

        const distribution = db.prepare(`
      SELECT * FROM team_workload_distribution
      WHERE team_id = ?
      ORDER BY workload_percentage DESC
    `).all(teamId);

        res.json(distribution);
    } catch (error) {
        console.error('Error fetching workload distribution:', error);
        res.status(500).json({ error: 'Failed to fetch workload distribution' });
    }
});

// Get team capacity analysis
router.get('/capacity-analysis/:teamId', (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;

        const analysis = db.prepare(`
      SELECT * FROM team_capacity_analysis WHERE team_id = ?
    `).get(teamId);

        res.json(analysis || {});
    } catch (error) {
        console.error('Error fetching capacity analysis:', error);
        res.status(500).json({ error: 'Failed to fetch capacity analysis' });
    }
});

// Get campaign overview
router.get('/campaigns/:teamId', (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;

        const campaigns = db.prepare(`
      SELECT * FROM campaign_overview
      WHERE team_id = ?
      ORDER BY progress_percentage DESC
    `).all(teamId);

        res.json(campaigns);
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
});

// Get task status distribution
router.get('/task-status/:teamId', (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;

        const distribution = db.prepare(`
      SELECT * FROM task_status_distribution
      WHERE team_id = ?
      ORDER BY task_count DESC
    `).all(teamId);

        res.json(distribution);
    } catch (error) {
        console.error('Error fetching task status distribution:', error);
        res.status(500).json({ error: 'Failed to fetch task status distribution' });
    }
});

// Get team performance trend
router.get('/performance-trend/:teamId', (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;

        const trend = db.prepare(`
      SELECT * FROM team_performance_trend
      WHERE team_id = ?
      ORDER BY date_recorded DESC
      LIMIT 30
    `).all(teamId);

        res.json(trend);
    } catch (error) {
        console.error('Error fetching performance trend:', error);
        res.status(500).json({ error: 'Failed to fetch performance trend' });
    }
});

// Get team member performance
router.get('/member-performance/:teamId', (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;

        const performance = db.prepare(`
      SELECT * FROM team_member_performance
      WHERE team_id = ?
      ORDER BY completion_rate DESC
    `).all(teamId);

        res.json(performance);
    } catch (error) {
        console.error('Error fetching member performance:', error);
        res.status(500).json({ error: 'Failed to fetch member performance' });
    }
});

// Get task assignment history
router.get('/task-history/:teamId', (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;
        const { status, limit } = req.query;

        let query = 'SELECT * FROM task_assignment_history WHERE team_id = ?';
        const params: any[] = [teamId];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY assigned_date DESC LIMIT ?';
        params.push(parseInt(limit as string) || 50);

        const history = db.prepare(query).all(...params);

        res.json(history);
    } catch (error) {
        console.error('Error fetching task history:', error);
        res.status(500).json({ error: 'Failed to fetch task history' });
    }
});

// Get team capacity forecast
router.get('/capacity-forecast/:teamId', (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;

        const forecast = db.prepare(`
      SELECT * FROM team_capacity_forecast
      WHERE team_id = ?
      ORDER BY forecast_date DESC
      LIMIT 30
    `).all(teamId);

        res.json(forecast);
    } catch (error) {
        console.error('Error fetching capacity forecast:', error);
        res.status(500).json({ error: 'Failed to fetch capacity forecast' });
    }
});

// Create workload distribution entry
router.post('/workload-distribution', (req: Request, res: Response) => {
    try {
        const {
            team_id,
            team_name,
            member_id,
            member_name,
            total_tasks,
            completed_tasks,
            pending_tasks,
            overdue_tasks,
            workload_percentage,
            status
        } = req.body;

        if (!team_id || !member_id) {
            return res.status(400).json({ error: 'Team ID and member ID are required' });
        }

        const result = db.prepare(`
      INSERT INTO team_workload_distribution (
        team_id, team_name, member_id, member_name, total_tasks,
        completed_tasks, pending_tasks, overdue_tasks, workload_percentage, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            team_id,
            team_name || null,
            member_id,
            member_name || null,
            total_tasks || 0,
            completed_tasks || 0,
            pending_tasks || 0,
            overdue_tasks || 0,
            workload_percentage || 0,
            status || 'Normal'
        );

        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Workload distribution entry created successfully'
        });
    } catch (error: any) {
        console.error('Error creating workload distribution:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Entry for this team member already exists' });
        }
        res.status(500).json({ error: 'Failed to create workload distribution entry' });
    }
});

// Update workload distribution
router.put('/workload-distribution/:teamId/:memberId', (req: Request, res: Response) => {
    try {
        const { teamId, memberId } = req.params;
        const {
            total_tasks,
            completed_tasks,
            pending_tasks,
            overdue_tasks,
            workload_percentage,
            status
        } = req.body;

        db.prepare(`
      UPDATE team_workload_distribution
      SET total_tasks = ?, completed_tasks = ?, pending_tasks = ?, overdue_tasks = ?,
          workload_percentage = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE team_id = ? AND member_id = ?
    `).run(
            total_tasks || 0,
            completed_tasks || 0,
            pending_tasks || 0,
            overdue_tasks || 0,
            workload_percentage || 0,
            status || 'Normal',
            teamId,
            memberId
        );

        res.json({ message: 'Workload distribution updated successfully' });
    } catch (error) {
        console.error('Error updating workload distribution:', error);
        res.status(500).json({ error: 'Failed to update workload distribution' });
    }
});

// Create capacity analysis
router.post('/capacity-analysis', (req: Request, res: Response) => {
    try {
        const {
            team_id,
            team_name,
            total_capacity,
            utilized_capacity,
            available_capacity,
            capacity_utilization_percentage,
            team_members_count,
            avg_workload
        } = req.body;

        if (!team_id) {
            return res.status(400).json({ error: 'Team ID is required' });
        }

        const result = db.prepare(`
      INSERT INTO team_capacity_analysis (
        team_id, team_name, total_capacity, utilized_capacity, available_capacity,
        capacity_utilization_percentage, team_members_count, avg_workload
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            team_id,
            team_name || null,
            total_capacity || 0,
            utilized_capacity || 0,
            available_capacity || 0,
            capacity_utilization_percentage || 0,
            team_members_count || 0,
            avg_workload || 0
        );

        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Capacity analysis created successfully'
        });
    } catch (error: any) {
        console.error('Error creating capacity analysis:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Analysis for this team already exists' });
        }
        res.status(500).json({ error: 'Failed to create capacity analysis' });
    }
});

// Update capacity analysis
router.put('/capacity-analysis/:teamId', (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;
        const {
            total_capacity,
            utilized_capacity,
            available_capacity,
            capacity_utilization_percentage,
            team_members_count,
            avg_workload
        } = req.body;

        db.prepare(`
      UPDATE team_capacity_analysis
      SET total_capacity = ?, utilized_capacity = ?, available_capacity = ?,
          capacity_utilization_percentage = ?, team_members_count = ?, avg_workload = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE team_id = ?
    `).run(
            total_capacity || 0,
            utilized_capacity || 0,
            available_capacity || 0,
            capacity_utilization_percentage || 0,
            team_members_count || 0,
            avg_workload || 0,
            teamId
        );

        res.json({ message: 'Capacity analysis updated successfully' });
    } catch (error) {
        console.error('Error updating capacity analysis:', error);
        res.status(500).json({ error: 'Failed to update capacity analysis' });
    }
});

// Create campaign overview
router.post('/campaigns', (req: Request, res: Response) => {
    try {
        const {
            team_id,
            campaign_id,
            campaign_name,
            campaign_type,
            status,
            progress_percentage,
            start_date,
            end_date,
            assigned_members
        } = req.body;

        if (!team_id || !campaign_id) {
            return res.status(400).json({ error: 'Team ID and campaign ID are required' });
        }

        const result = db.prepare(`
      INSERT INTO campaign_overview (
        team_id, campaign_id, campaign_name, campaign_type, status,
        progress_percentage, start_date, end_date, assigned_members
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            team_id,
            campaign_id,
            campaign_name || null,
            campaign_type || null,
            status || 'In Progress',
            progress_percentage || 0,
            start_date || null,
            end_date || null,
            assigned_members || 0
        );

        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Campaign overview created successfully'
        });
    } catch (error: any) {
        console.error('Error creating campaign overview:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Campaign already exists for this team' });
        }
        res.status(500).json({ error: 'Failed to create campaign overview' });
    }
});

// Update campaign overview
router.put('/campaigns/:teamId/:campaignId', (req: Request, res: Response) => {
    try {
        const { teamId, campaignId } = req.params;
        const {
            campaign_name,
            campaign_type,
            status,
            progress_percentage,
            start_date,
            end_date,
            assigned_members
        } = req.body;

        db.prepare(`
      UPDATE campaign_overview
      SET campaign_name = ?, campaign_type = ?, status = ?, progress_percentage = ?,
          start_date = ?, end_date = ?, assigned_members = ?, updated_at = CURRENT_TIMESTAMP
      WHERE team_id = ? AND campaign_id = ?
    `).run(
            campaign_name || null,
            campaign_type || null,
            status || 'In Progress',
            progress_percentage || 0,
            start_date || null,
            end_date || null,
            assigned_members || 0,
            teamId,
            campaignId
        );

        res.json({ message: 'Campaign overview updated successfully' });
    } catch (error) {
        console.error('Error updating campaign overview:', error);
        res.status(500).json({ error: 'Failed to update campaign overview' });
    }
});

// Create task status distribution
router.post('/task-status', (req: Request, res: Response) => {
    try {
        const { team_id, status, task_count, percentage } = req.body;

        if (!team_id || !status) {
            return res.status(400).json({ error: 'Team ID and status are required' });
        }

        const result = db.prepare(`
      INSERT INTO task_status_distribution (team_id, status, task_count, percentage)
      VALUES (?, ?, ?, ?)
    `).run(team_id, status, task_count || 0, percentage || 0);

        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Task status distribution created successfully'
        });
    } catch (error: any) {
        console.error('Error creating task status distribution:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Status entry already exists for this team' });
        }
        res.status(500).json({ error: 'Failed to create task status distribution' });
    }
});

// Update task status distribution
router.put('/task-status/:teamId/:status', (req: Request, res: Response) => {
    try {
        const { teamId, status } = req.params;
        const { task_count, percentage } = req.body;

        db.prepare(`
      UPDATE task_status_distribution
      SET task_count = ?, percentage = ?, updated_at = CURRENT_TIMESTAMP
      WHERE team_id = ? AND status = ?
    `).run(task_count || 0, percentage || 0, teamId, status);

        res.json({ message: 'Task status distribution updated successfully' });
    } catch (error) {
        console.error('Error updating task status distribution:', error);
        res.status(500).json({ error: 'Failed to update task status distribution' });
    }
});

// Create performance trend
router.post('/performance-trend', (req: Request, res: Response) => {
    try {
        const {
            team_id,
            team_name,
            date_recorded,
            completion_rate,
            quality_score,
            efficiency_score
        } = req.body;

        if (!team_id || !date_recorded) {
            return res.status(400).json({ error: 'Team ID and date are required' });
        }

        const result = db.prepare(`
      INSERT INTO team_performance_trend (
        team_id, team_name, date_recorded, completion_rate, quality_score, efficiency_score
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
            team_id,
            team_name || null,
            date_recorded,
            completion_rate || 0,
            quality_score || 0,
            efficiency_score || 0
        );

        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Performance trend created successfully'
        });
    } catch (error: any) {
        console.error('Error creating performance trend:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Trend entry already exists for this date' });
        }
        res.status(500).json({ error: 'Failed to create performance trend' });
    }
});

// Create member performance
router.post('/member-performance', (req: Request, res: Response) => {
    try {
        const {
            team_id,
            member_id,
            member_name,
            role,
            tasks_assigned,
            tasks_completed,
            completion_rate,
            quality_score,
            efficiency_score
        } = req.body;

        if (!team_id || !member_id) {
            return res.status(400).json({ error: 'Team ID and member ID are required' });
        }

        const result = db.prepare(`
      INSERT INTO team_member_performance (
        team_id, member_id, member_name, role, tasks_assigned, tasks_completed,
        completion_rate, quality_score, efficiency_score
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            team_id,
            member_id,
            member_name || null,
            role || null,
            tasks_assigned || 0,
            tasks_completed || 0,
            completion_rate || 0,
            quality_score || 0,
            efficiency_score || 0
        );

        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Member performance created successfully'
        });
    } catch (error: any) {
        console.error('Error creating member performance:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Performance record already exists for this member' });
        }
        res.status(500).json({ error: 'Failed to create member performance' });
    }
});

// Update member performance
router.put('/member-performance/:teamId/:memberId', (req: Request, res: Response) => {
    try {
        const { teamId, memberId } = req.params;
        const {
            tasks_assigned,
            tasks_completed,
            completion_rate,
            quality_score,
            efficiency_score
        } = req.body;

        db.prepare(`
      UPDATE team_member_performance
      SET tasks_assigned = ?, tasks_completed = ?, completion_rate = ?,
          quality_score = ?, efficiency_score = ?, updated_at = CURRENT_TIMESTAMP
      WHERE team_id = ? AND member_id = ?
    `).run(
            tasks_assigned || 0,
            tasks_completed || 0,
            completion_rate || 0,
            quality_score || 0,
            efficiency_score || 0,
            teamId,
            memberId
        );

        res.json({ message: 'Member performance updated successfully' });
    } catch (error) {
        console.error('Error updating member performance:', error);
        res.status(500).json({ error: 'Failed to update member performance' });
    }
});

// Create task assignment
router.post('/task-assignment', (req: Request, res: Response) => {
    try {
        const {
            team_id,
            task_id,
            task_name,
            assigned_to,
            assigned_by,
            assigned_date,
            due_date,
            status,
            priority,
            estimated_hours,
            actual_hours
        } = req.body;

        if (!team_id || !task_id) {
            return res.status(400).json({ error: 'Team ID and task ID are required' });
        }

        const result = db.prepare(`
      INSERT INTO task_assignment_history (
        team_id, task_id, task_name, assigned_to, assigned_by, assigned_date,
        due_date, status, priority, estimated_hours, actual_hours
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            team_id,
            task_id,
            task_name || null,
            assigned_to || null,
            assigned_by || null,
            assigned_date || new Date().toISOString(),
            due_date || null,
            status || 'Pending',
            priority || 'Medium',
            estimated_hours || 0,
            actual_hours || 0
        );

        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Task assignment created successfully'
        });
    } catch (error) {
        console.error('Error creating task assignment:', error);
        res.status(500).json({ error: 'Failed to create task assignment' });
    }
});

// Update task assignment
router.put('/task-assignment/:taskId', (req: Request, res: Response) => {
    try {
        const { taskId } = req.params;
        const {
            assigned_to,
            status,
            priority,
            due_date,
            estimated_hours,
            actual_hours
        } = req.body;

        db.prepare(`
      UPDATE task_assignment_history
      SET assigned_to = ?, status = ?, priority = ?, due_date = ?,
          estimated_hours = ?, actual_hours = ?, updated_at = CURRENT_TIMESTAMP
      WHERE task_id = ?
    `).run(
            assigned_to || null,
            status || 'Pending',
            priority || 'Medium',
            due_date || null,
            estimated_hours || 0,
            actual_hours || 0,
            taskId
        );

        res.json({ message: 'Task assignment updated successfully' });
    } catch (error) {
        console.error('Error updating task assignment:', error);
        res.status(500).json({ error: 'Failed to update task assignment' });
    }
});

// Create capacity forecast
router.post('/capacity-forecast', (req: Request, res: Response) => {
    try {
        const {
            team_id,
            team_name,
            forecast_date,
            forecasted_capacity,
            forecasted_utilization,
            confidence_level,
            notes
        } = req.body;

        if (!team_id || !forecast_date) {
            return res.status(400).json({ error: 'Team ID and forecast date are required' });
        }

        const result = db.prepare(`
      INSERT INTO team_capacity_forecast (
        team_id, team_name, forecast_date, forecasted_capacity,
        forecasted_utilization, confidence_level, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
            team_id,
            team_name || null,
            forecast_date,
            forecasted_capacity || 0,
            forecasted_utilization || 0,
            confidence_level || 'Medium',
            notes || null
        );

        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Capacity forecast created successfully'
        });
    } catch (error: any) {
        console.error('Error creating capacity forecast:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Forecast already exists for this date' });
        }
        res.status(500).json({ error: 'Failed to create capacity forecast' });
    }
});

// Update capacity forecast
router.put('/capacity-forecast/:teamId/:forecastDate', (req: Request, res: Response) => {
    try {
        const { teamId, forecastDate } = req.params;
        const {
            forecasted_capacity,
            forecasted_utilization,
            confidence_level,
            notes
        } = req.body;

        db.prepare(`
      UPDATE team_capacity_forecast
      SET forecasted_capacity = ?, forecasted_utilization = ?,
          confidence_level = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE team_id = ? AND forecast_date = ?
    `).run(
            forecasted_capacity || 0,
            forecasted_utilization || 0,
            confidence_level || 'Medium',
            notes || null,
            teamId,
            forecastDate
        );

        res.json({ message: 'Capacity forecast updated successfully' });
    } catch (error) {
        console.error('Error updating capacity forecast:', error);
        res.status(500).json({ error: 'Failed to update capacity forecast' });
    }
});

export default router;

