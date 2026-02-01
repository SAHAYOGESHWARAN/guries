import express, { Request, Response } from 'express';
import { pool } from "../config/db";

const router = express.Router();

// Get team workload distribution
router.get('/workload-distribution/:teamId', async (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;

        const result = await pool.query(`
      SELECT * FROM team_workload_distribution
      WHERE team_id = $1
      ORDER BY workload_percentage DESC
    `, [teamId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching workload distribution:', error);
        res.status(500).json({ error: 'Failed to fetch workload distribution' });
    }
});

// Get team capacity analysis
router.get('/capacity-analysis/:teamId', async (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;

        const result = await pool.query(`
      SELECT * FROM team_capacity_analysis WHERE team_id = $1
    `, [teamId]);

        res.json(result.rows[0] || {});
    } catch (error) {
        console.error('Error fetching capacity analysis:', error);
        res.status(500).json({ error: 'Failed to fetch capacity analysis' });
    }
});

// Get campaign overview
router.get('/campaigns/:teamId', async (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;

        const result = await pool.query(`
      SELECT * FROM campaign_overview
      WHERE team_id = $1
      ORDER BY progress_percentage DESC
    `, [teamId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
});

// Get task status distribution
router.get('/task-status/:teamId', async (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;

        const result = await pool.query(`
      SELECT * FROM task_status_distribution
      WHERE team_id = $1
      ORDER BY task_count DESC
    `, [teamId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching task status distribution:', error);
        res.status(500).json({ error: 'Failed to fetch task status distribution' });
    }
});

// Get team performance trend
router.get('/performance-trend/:teamId', async (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;

        const result = await pool.query(`
      SELECT * FROM team_performance_trend
      WHERE team_id = $1
      ORDER BY date_recorded DESC
      LIMIT 30
    `, [teamId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching performance trend:', error);
        res.status(500).json({ error: 'Failed to fetch performance trend' });
    }
});

// Get team member performance
router.get('/member-performance/:teamId', async (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;

        const result = await pool.query(`
      SELECT * FROM team_member_performance
      WHERE team_id = $1
      ORDER BY completion_rate DESC
    `, [teamId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching member performance:', error);
        res.status(500).json({ error: 'Failed to fetch member performance' });
    }
});

// Get task assignment history
router.get('/task-history/:teamId', async (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;
        const { status, limit } = req.query;

        let query = 'SELECT * FROM task_assignment_history WHERE team_id = $1';
        const params: any[] = [teamId];
        let paramIndex = 2;

        if (status) {
            query += ` AND status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        query += ` ORDER BY assigned_date DESC LIMIT $${paramIndex}`;
        params.push(parseInt(limit as string) || 50);

        const result = await pool.query(query, params);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching task history:', error);
        res.status(500).json({ error: 'Failed to fetch task history' });
    }
});

// Get team capacity forecast
router.get('/capacity-forecast/:teamId', async (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;

        const result = await pool.query(`
      SELECT * FROM team_capacity_forecast
      WHERE team_id = $1
      ORDER BY forecast_date DESC
      LIMIT 30
    `, [teamId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching capacity forecast:', error);
        res.status(500).json({ error: 'Failed to fetch capacity forecast' });
    }
});

// Create workload distribution entry
router.post('/workload-distribution', async (req: Request, res: Response) => {
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

        const result = await pool.query(`
      INSERT INTO team_workload_distribution (
        team_id, team_name, member_id, member_name, total_tasks,
        completed_tasks, pending_tasks, overdue_tasks, workload_percentage, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `, [
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
        ]);

        res.status(201).json({
            id: result.rows[0].id,
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
router.put('/workload-distribution/:teamId/:memberId', async (req: Request, res: Response) => {
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

        await pool.query(`
      UPDATE team_workload_distribution
      SET total_tasks = $1, completed_tasks = $2, pending_tasks = $3, overdue_tasks = $4,
          workload_percentage = $5, status = $6, updated_at = NOW()
      WHERE team_id = $7 AND member_id = $8
    `, [
            total_tasks || 0,
            completed_tasks || 0,
            pending_tasks || 0,
            overdue_tasks || 0,
            workload_percentage || 0,
            status || 'Normal',
            teamId,
            memberId
        ]);

        res.json({ message: 'Workload distribution updated successfully' });
    } catch (error) {
        console.error('Error updating workload distribution:', error);
        res.status(500).json({ error: 'Failed to update workload distribution' });
    }
});

// Create capacity analysis
router.post('/capacity-analysis', async (req: Request, res: Response) => {
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

        const result = await pool.query(`
      INSERT INTO team_capacity_analysis (
        team_id, team_name, total_capacity, utilized_capacity, available_capacity,
        capacity_utilization_percentage, team_members_count, avg_workload
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
            team_id,
            team_name || null,
            total_capacity || 0,
            utilized_capacity || 0,
            available_capacity || 0,
            capacity_utilization_percentage || 0,
            team_members_count || 0,
            avg_workload || 0
        ]);

        res.status(201).json({
            id: result.rows[0].id,
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
router.put('/capacity-analysis/:teamId', async (req: Request, res: Response) => {
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

        await pool.query(`
      UPDATE team_capacity_analysis
      SET total_capacity = $1, utilized_capacity = $2, available_capacity = $3,
          capacity_utilization_percentage = $4, team_members_count = $5, avg_workload = $6,
          updated_at = NOW()
      WHERE team_id = $7
    `, [
            total_capacity || 0,
            utilized_capacity || 0,
            available_capacity || 0,
            capacity_utilization_percentage || 0,
            team_members_count || 0,
            avg_workload || 0,
            teamId
        ]);

        res.json({ message: 'Capacity analysis updated successfully' });
    } catch (error) {
        console.error('Error updating capacity analysis:', error);
        res.status(500).json({ error: 'Failed to update capacity analysis' });
    }
});

// Create campaign overview
router.post('/campaigns', async (req: Request, res: Response) => {
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

        const result = await pool.query(`
      INSERT INTO campaign_overview (
        team_id, campaign_id, campaign_name, campaign_type, status,
        progress_percentage, start_date, end_date, assigned_members
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [
            team_id,
            campaign_id,
            campaign_name || null,
            campaign_type || null,
            status || 'In Progress',
            progress_percentage || 0,
            start_date || null,
            end_date || null,
            assigned_members || 0
        ]);

        res.status(201).json({
            id: result.rows[0].id,
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
router.put('/campaigns/:teamId/:campaignId', async (req: Request, res: Response) => {
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

        await pool.query(`
      UPDATE campaign_overview
      SET campaign_name = $1, campaign_type = $2, status = $3, progress_percentage = $4,
          start_date = $5, end_date = $6, assigned_members = $7, updated_at = NOW()
      WHERE team_id = $8 AND campaign_id = $9
    `, [
            campaign_name || null,
            campaign_type || null,
            status || 'In Progress',
            progress_percentage || 0,
            start_date || null,
            end_date || null,
            assigned_members || 0,
            teamId,
            campaignId
        ]);

        res.json({ message: 'Campaign overview updated successfully' });
    } catch (error) {
        console.error('Error updating campaign overview:', error);
        res.status(500).json({ error: 'Failed to update campaign overview' });
    }
});

// Create task status distribution
router.post('/task-status', async (req: Request, res: Response) => {
    try {
        const { team_id, status, task_count, percentage } = req.body;

        if (!team_id || !status) {
            return res.status(400).json({ error: 'Team ID and status are required' });
        }

        const result = await pool.query(`
      INSERT INTO task_status_distribution (team_id, status, task_count, percentage)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [team_id, status, task_count || 0, percentage || 0]);

        res.status(201).json({
            id: result.rows[0].id,
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
router.put('/task-status/:teamId/:status', async (req: Request, res: Response) => {
    try {
        const { teamId, status } = req.params;
        const { task_count, percentage } = req.body;

        await pool.query(`
      UPDATE task_status_distribution
      SET task_count = $1, percentage = $2, updated_at = NOW()
      WHERE team_id = $3 AND status = $4
    `, [task_count || 0, percentage || 0, teamId, status]);

        res.json({ message: 'Task status distribution updated successfully' });
    } catch (error) {
        console.error('Error updating task status distribution:', error);
        res.status(500).json({ error: 'Failed to update task status distribution' });
    }
});

// Create performance trend
router.post('/performance-trend', async (req: Request, res: Response) => {
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

        const result = await pool.query(`
      INSERT INTO team_performance_trend (
        team_id, team_name, date_recorded, completion_rate, quality_score, efficiency_score
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [
            team_id,
            team_name || null,
            date_recorded,
            completion_rate || 0,
            quality_score || 0,
            efficiency_score || 0
        ]);

        res.status(201).json({
            id: result.rows[0].id,
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
router.post('/member-performance', async (req: Request, res: Response) => {
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

        const result = await pool.query(`
      INSERT INTO team_member_performance (
        team_id, member_id, member_name, role, tasks_assigned, tasks_completed,
        completion_rate, quality_score, efficiency_score
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [
            team_id,
            member_id,
            member_name || null,
            role || null,
            tasks_assigned || 0,
            tasks_completed || 0,
            completion_rate || 0,
            quality_score || 0,
            efficiency_score || 0
        ]);

        res.status(201).json({
            id: result.rows[0].id,
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
router.put('/member-performance/:teamId/:memberId', async (req: Request, res: Response) => {
    try {
        const { teamId, memberId } = req.params;
        const {
            tasks_assigned,
            tasks_completed,
            completion_rate,
            quality_score,
            efficiency_score
        } = req.body;

        await pool.query(`
      UPDATE team_member_performance
      SET tasks_assigned = $1, tasks_completed = $2, completion_rate = $3,
          quality_score = $4, efficiency_score = $5, updated_at = NOW()
      WHERE team_id = $6 AND member_id = $7
    `, [
            tasks_assigned || 0,
            tasks_completed || 0,
            completion_rate || 0,
            quality_score || 0,
            efficiency_score || 0,
            teamId,
            memberId
        ]);

        res.json({ message: 'Member performance updated successfully' });
    } catch (error) {
        console.error('Error updating member performance:', error);
        res.status(500).json({ error: 'Failed to update member performance' });
    }
});

// Create task assignment
router.post('/task-assignment', async (req: Request, res: Response) => {
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

        const result = await pool.query(`
      INSERT INTO task_assignment_history (
        team_id, task_id, task_name, assigned_to, assigned_by, assigned_date,
        due_date, status, priority, estimated_hours, actual_hours
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `, [
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
        ]);

        res.status(201).json({
            id: result.rows[0].id,
            message: 'Task assignment created successfully'
        });
    } catch (error) {
        console.error('Error creating task assignment:', error);
        res.status(500).json({ error: 'Failed to create task assignment' });
    }
});

// Update task assignment
router.put('/task-assignment/:taskId', async (req: Request, res: Response) => {
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

        await pool.query(`
      UPDATE task_assignment_history
      SET assigned_to = $1, status = $2, priority = $3, due_date = $4,
          estimated_hours = $5, actual_hours = $6, updated_at = NOW()
      WHERE task_id = $7
    `, [
            assigned_to || null,
            status || 'Pending',
            priority || 'Medium',
            due_date || null,
            estimated_hours || 0,
            actual_hours || 0,
            taskId
        ]);

        res.json({ message: 'Task assignment updated successfully' });
    } catch (error) {
        console.error('Error updating task assignment:', error);
        res.status(500).json({ error: 'Failed to update task assignment' });
    }
});

// Create capacity forecast
router.post('/capacity-forecast', async (req: Request, res: Response) => {
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

        const result = await pool.query(`
      INSERT INTO team_capacity_forecast (
        team_id, team_name, forecast_date, forecasted_capacity,
        forecasted_utilization, confidence_level, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [
            team_id,
            team_name || null,
            forecast_date,
            forecasted_capacity || 0,
            forecasted_utilization || 0,
            confidence_level || 'Medium',
            notes || null
        ]);

        res.status(201).json({
            id: result.rows[0].id,
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
router.put('/capacity-forecast/:teamId/:forecastDate', async (req: Request, res: Response) => {
    try {
        const { teamId, forecastDate } = req.params;
        const {
            forecasted_capacity,
            forecasted_utilization,
            confidence_level,
            notes
        } = req.body;

        await pool.query(`
      UPDATE team_capacity_forecast
      SET forecasted_capacity = $1, forecasted_utilization = $2,
          confidence_level = $3, notes = $4, updated_at = NOW()
      WHERE team_id = $5 AND forecast_date = $6
    `, [
            forecasted_capacity || 0,
            forecasted_utilization || 0,
            confidence_level || 'Medium',
            notes || null,
            teamId,
            forecastDate
        ]);

        res.json({ message: 'Capacity forecast updated successfully' });
    } catch (error) {
        console.error('Error updating capacity forecast:', error);
        res.status(500).json({ error: 'Failed to update capacity forecast' });
    }
});

export default router;

