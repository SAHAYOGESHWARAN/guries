import express, { Request, Response } from 'express';
import { pool } from "../config/db";

const router = express.Router();

// ===== TASK ALLOCATION SUGGESTIONS =====

router.get('/task-suggestions', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT * FROM task_allocation_suggestions
      ORDER BY confidence_score DESC
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching task suggestions:', error);
        res.status(500).json({ error: 'Failed to fetch task suggestions' });
    }
});

router.post('/task-suggestions', async (req: Request, res: Response) => {
    try {
        const { task_id, task_name, task_type, priority, estimated_hours, suggested_assignee_id, suggested_assignee_name, allocation_reason, confidence_score } = req.body;

        if (!task_id || !task_name) {
            return res.status(400).json({ error: 'Task ID and name are required' });
        }

        const result = await pool.query(`
      INSERT INTO task_allocation_suggestions (
        task_id, task_name, task_type, priority, estimated_hours, suggested_assignee_id,
        suggested_assignee_name, allocation_reason, confidence_score, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `, [task_id, task_name, task_type || null, priority || 'Medium', estimated_hours || 0, suggested_assignee_id || null, suggested_assignee_name || null, allocation_reason || null, confidence_score || 0, 'Suggested']);

        res.status(201).json({ id: result.rows[0].id, message: 'Task suggestion created successfully' });
    } catch (error) {
        console.error('Error creating task suggestion:', error);
        res.status(500).json({ error: 'Failed to create task suggestion' });
    }
});

router.put('/task-suggestions/:suggestionId/accept', async (req: Request, res: Response) => {
    try {
        const { suggestionId } = req.params;

        await pool.query(`
      UPDATE task_allocation_suggestions
      SET status = 'Accepted', assigned_date = NOW(), updated_at = NOW()
      WHERE id = $1
    `, [suggestionId]);

        res.json({ message: 'Task suggestion accepted successfully' });
    } catch (error) {
        console.error('Error accepting task suggestion:', error);
        res.status(500).json({ error: 'Failed to accept task suggestion' });
    }
});

router.put('/task-suggestions/:suggestionId/reject', async (req: Request, res: Response) => {
    try {
        const { suggestionId } = req.params;

        await pool.query(`
      UPDATE task_allocation_suggestions
      SET status = 'Rejected', updated_at = NOW()
      WHERE id = $1
    `, [suggestionId]);

        res.json({ message: 'Task suggestion rejected successfully' });
    } catch (error) {
        console.error('Error rejecting task suggestion:', error);
        res.status(500).json({ error: 'Failed to reject task suggestion' });
    }
});

// ===== WORKLOAD FORECAST =====

router.get('/workload-forecast', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT * FROM workload_forecast
      ORDER BY utilization_percentage DESC
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching workload forecast:', error);
        res.status(500).json({ error: 'Failed to fetch workload forecast' });
    }
});

router.post('/workload-forecast', async (req: Request, res: Response) => {
    try {
        const { employee_id, employee_name, department, forecast_period, current_workload, forecasted_workload, capacity_hours, utilization_percentage, trend, risk_level } = req.body;

        if (!employee_id || !employee_name) {
            return res.status(400).json({ error: 'Employee ID and name are required' });
        }

        const result = await pool.query(`
      INSERT INTO workload_forecast (
        employee_id, employee_name, department, forecast_period, current_workload,
        forecasted_workload, capacity_hours, utilization_percentage, trend, risk_level
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `, [employee_id, employee_name, department || null, forecast_period || 'This Week', current_workload || 0, forecasted_workload || 0, capacity_hours || 0, utilization_percentage || 0, trend || 'Stable', risk_level || 'Low']);

        res.status(201).json({ id: result.rows[0].id, message: 'Workload forecast created successfully' });
    } catch (error) {
        console.error('Error creating workload forecast:', error);
        res.status(500).json({ error: 'Failed to create workload forecast' });
    }
});

router.put('/workload-forecast/:forecastId', async (req: Request, res: Response) => {
    try {
        const { forecastId } = req.params;
        const { current_workload, forecasted_workload, capacity_hours, utilization_percentage, trend, risk_level } = req.body;

        await pool.query(`
      UPDATE workload_forecast
      SET current_workload = $1, forecasted_workload = $2, capacity_hours = $3,
          utilization_percentage = $4, trend = $5, risk_level = $6, updated_at = NOW()
      WHERE id = $7
    `, [current_workload, forecasted_workload, capacity_hours, utilization_percentage, trend, risk_level, forecastId]);

        res.json({ message: 'Workload forecast updated successfully' });
    } catch (error) {
        console.error('Error updating workload forecast:', error);
        res.status(500).json({ error: 'Failed to update workload forecast' });
    }
});

// ===== TEAM CAPACITY UTILIZATION =====

router.get('/team-capacity', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT * FROM team_capacity_utilization
      ORDER BY utilization_percentage DESC
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching team capacity:', error);
        res.status(500).json({ error: 'Failed to fetch team capacity' });
    }
});

router.post('/team-capacity', async (req: Request, res: Response) => {
    try {
        const { team_id, team_name, total_capacity, allocated_capacity, available_capacity, utilization_percentage, team_members, status } = req.body;

        if (!team_id || !team_name) {
            return res.status(400).json({ error: 'Team ID and name are required' });
        }

        const result = await pool.query(`
      INSERT INTO team_capacity_utilization (
        team_id, team_name, total_capacity, allocated_capacity, available_capacity,
        utilization_percentage, team_members, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [team_id, team_name, total_capacity || 0, allocated_capacity || 0, available_capacity || 0, utilization_percentage || 0, team_members || 0, status || 'Active']);

        res.status(201).json({ id: result.rows[0].id, message: 'Team capacity created successfully' });
    } catch (error) {
        console.error('Error creating team capacity:', error);
        res.status(500).json({ error: 'Failed to create team capacity' });
    }
});

// ===== PREDICTED OVERLOAD CASES =====

router.get('/predicted-overloads', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT * FROM predicted_overload_cases
      WHERE status = 'Predicted'
      ORDER BY severity DESC
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching predicted overloads:', error);
        res.status(500).json({ error: 'Failed to fetch predicted overloads' });
    }
});

router.post('/predicted-overloads', async (req: Request, res: Response) => {
    try {
        const { employee_id, employee_name, department, current_load, predicted_load, capacity, overload_percentage, overload_date, reason, suggested_action, severity } = req.body;

        if (!employee_id || !employee_name) {
            return res.status(400).json({ error: 'Employee ID and name are required' });
        }

        const result = await pool.query(`
      INSERT INTO predicted_overload_cases (
        employee_id, employee_name, department, current_load, predicted_load, capacity,
        overload_percentage, overload_date, reason, suggested_action, severity, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `, [employee_id, employee_name, department || null, current_load || 0, predicted_load || 0, capacity || 0, overload_percentage || 0, overload_date || new Date().toISOString(), reason || null, suggested_action || null, severity || 'Medium', 'Predicted']);

        res.status(201).json({ id: result.rows[0].id, message: 'Predicted overload created successfully' });
    } catch (error) {
        console.error('Error creating predicted overload:', error);
        res.status(500).json({ error: 'Failed to create predicted overload' });
    }
});

router.put('/predicted-overloads/:overloadId/resolve', async (req: Request, res: Response) => {
    try {
        const { overloadId } = req.params;

        await pool.query(`
      UPDATE predicted_overload_cases
      SET status = 'Resolved', updated_at = NOW()
      WHERE id = $1
    `, [overloadId]);

        res.json({ message: 'Predicted overload resolved successfully' });
    } catch (error) {
        console.error('Error resolving predicted overload:', error);
        res.status(500).json({ error: 'Failed to resolve predicted overload' });
    }
});

// ===== RESOURCE CAPACITY ANALYSIS =====

router.get('/resource-capacity', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT * FROM resource_capacity_analysis
      ORDER BY utilization_rate DESC
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching resource capacity:', error);
        res.status(500).json({ error: 'Failed to fetch resource capacity' });
    }
});

router.post('/resource-capacity', async (req: Request, res: Response) => {
    try {
        const { resource_type, resource_name, total_available, currently_used, available_for_allocation, utilization_rate, bottleneck_status, recommendations } = req.body;

        const result = await pool.query(`
      INSERT INTO resource_capacity_analysis (
        resource_type, resource_name, total_available, currently_used, available_for_allocation,
        utilization_rate, bottleneck_status, recommendations
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [resource_type || null, resource_name || null, total_available || 0, currently_used || 0, available_for_allocation || 0, utilization_rate || 0, bottleneck_status || 'Normal', recommendations || null]);

        res.status(201).json({ id: result.rows[0].id, message: 'Resource capacity analysis created successfully' });
    } catch (error) {
        console.error('Error creating resource capacity analysis:', error);
        res.status(500).json({ error: 'Failed to create resource capacity analysis' });
    }
});

// ===== ALLOCATION HISTORY =====

router.get('/allocation-history', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT * FROM allocation_history
      ORDER BY allocation_date DESC
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching allocation history:', error);
        res.status(500).json({ error: 'Failed to fetch allocation history' });
    }
});

router.post('/allocation-history', async (req: Request, res: Response) => {
    try {
        const { task_id, employee_id, employee_name, allocation_date, hours_allocated, completion_status, actual_hours_spent, efficiency_percentage, notes } = req.body;

        const result = await pool.query(`
      INSERT INTO allocation_history (
        task_id, employee_id, employee_name, allocation_date, hours_allocated,
        completion_status, actual_hours_spent, efficiency_percentage, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [task_id || null, employee_id || null, employee_name || null, allocation_date || new Date().toISOString(), hours_allocated || 0, completion_status || 'In Progress', actual_hours_spent || 0, efficiency_percentage || 0, notes || null]);

        res.status(201).json({ id: result.rows[0].id, message: 'Allocation history entry created successfully' });
    } catch (error) {
        console.error('Error creating allocation history entry:', error);
        res.status(500).json({ error: 'Failed to create allocation history entry' });
    }
});

// ===== WORKLOAD TREND ANALYSIS =====

router.get('/workload-trends', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT * FROM workload_trend_analysis
      ORDER BY period DESC
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching workload trends:', error);
        res.status(500).json({ error: 'Failed to fetch workload trends' });
    }
});

router.post('/workload-trends', async (req: Request, res: Response) => {
    try {
        const { employee_id, employee_name, period, average_workload, peak_workload, low_workload, trend_direction, volatility_score, predictability_score } = req.body;

        const result = await pool.query(`
      INSERT INTO workload_trend_analysis (
        employee_id, employee_name, period, average_workload, peak_workload, low_workload,
        trend_direction, volatility_score, predictability_score
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [employee_id || null, employee_name || null, period || null, average_workload || 0, peak_workload || 0, low_workload || 0, trend_direction || 'Stable', volatility_score || 0, predictability_score || 0]);

        res.status(201).json({ id: result.rows[0].id, message: 'Workload trend analysis created successfully' });
    } catch (error) {
        console.error('Error creating workload trend analysis:', error);
        res.status(500).json({ error: 'Failed to create workload trend analysis' });
    }
});

// ===== SKILL-BASED ALLOCATION =====

router.get('/skill-allocation', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT * FROM skill_based_allocation
      ORDER BY skill_match_percentage DESC
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching skill allocation:', error);
        res.status(500).json({ error: 'Failed to fetch skill allocation' });
    }
});

router.post('/skill-allocation', async (req: Request, res: Response) => {
    try {
        const { task_id, required_skill, skill_level, employee_id, employee_name, skill_match_percentage, experience_years } = req.body;

        const result = await pool.query(`
      INSERT INTO skill_based_allocation (
        task_id, required_skill, skill_level, employee_id, employee_name,
        skill_match_percentage, experience_years
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [task_id || null, required_skill || null, skill_level || null, employee_id || null, employee_name || null, skill_match_percentage || 0, experience_years || 0]);

        res.status(201).json({ id: result.rows[0].id, message: 'Skill allocation created successfully' });
    } catch (error) {
        console.error('Error creating skill allocation:', error);
        res.status(500).json({ error: 'Failed to create skill allocation' });
    }
});

// ===== ALLOCATION PERFORMANCE METRICS =====

router.get('/allocation-metrics', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT * FROM allocation_performance_metrics
      ORDER BY period DESC
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching allocation metrics:', error);
        res.status(500).json({ error: 'Failed to fetch allocation metrics' });
    }
});

router.post('/allocation-metrics', async (req: Request, res: Response) => {
    try {
        const { period, total_tasks_allocated, successful_allocations, failed_allocations, success_rate, average_allocation_time, average_task_completion_time, resource_utilization_efficiency } = req.body;

        const result = await pool.query(`
      INSERT INTO allocation_performance_metrics (
        period, total_tasks_allocated, successful_allocations, failed_allocations, success_rate,
        average_allocation_time, average_task_completion_time, resource_utilization_efficiency
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [period || null, total_tasks_allocated || 0, successful_allocations || 0, failed_allocations || 0, success_rate || 0, average_allocation_time || 0, average_task_completion_time || 0, resource_utilization_efficiency || 0]);

        res.status(201).json({ id: result.rows[0].id, message: 'Allocation metrics created successfully' });
    } catch (error) {
        console.error('Error creating allocation metrics:', error);
        res.status(500).json({ error: 'Failed to create allocation metrics' });
    }
});

export default router;

