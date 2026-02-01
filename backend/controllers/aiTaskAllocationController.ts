import { Request, Response } from 'express';
import { db } from '../config/db';

// Get all task allocation suggestions with filtering
export const getTaskSuggestions = async (req: Request, res: Response) => {
    try {
        const { status, priority, minConfidence, sortBy } = req.query;

        let query = 'SELECT * FROM task_allocation_suggestions WHERE 1=1';
        const params: any[] = [];

        if (status && status !== 'all') {
            query += ' AND status = ?';
            params.push(status);
        }

        if (priority && priority !== 'all') {
            query += ' AND priority = ?';
            params.push(priority);
        }

        if (minConfidence) {
            query += ' AND confidence_score >= ?';
            params.push(parseInt(minConfidence as string));
        }

        // Default sort by confidence score descending
        const sortField = sortBy === 'date' ? 'created_at' : 'confidence_score';
        query += ` ORDER BY ${sortField} DESC`;

        const suggestions = db.prepare(query).all(...params);
        res.json(suggestions);
    } catch (error) {
        console.error('Error fetching task suggestions:', error);
        res.status(500).json({ error: 'Failed to fetch task suggestions' });
    }
};

// Get single suggestion
export const getTaskSuggestion = async (req: Request, res: Response) => {
    try {
        const { suggestionId } = req.params;
        const suggestion = db.prepare('SELECT * FROM task_allocation_suggestions WHERE id = ?').get(suggestionId);

        if (!suggestion) {
            return res.status(404).json({ error: 'Suggestion not found' });
        }

        res.json(suggestion);
    } catch (error) {
        console.error('Error fetching task suggestion:', error);
        res.status(500).json({ error: 'Failed to fetch task suggestion' });
    }
};

// Create new task suggestion
export const createTaskSuggestion = async (req: Request, res: Response) => {
    try {
        const {
            task_id,
            task_name,
            task_type,
            priority,
            estimated_hours,
            suggested_assignee_id,
            suggested_assignee_name,
            allocation_reason,
            confidence_score
        } = req.body;

        if (!task_id || !task_name) {
            return res.status(400).json({ error: 'Task ID and name are required' });
        }

        const result = db.prepare(`
      INSERT INTO task_allocation_suggestions (
        task_id, task_name, task_type, priority, estimated_hours,
        suggested_assignee_id, suggested_assignee_name, allocation_reason,
        confidence_score, status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
            task_id,
            task_name,
            task_type || null,
            priority || 'Medium',
            estimated_hours || 0,
            suggested_assignee_id || null,
            suggested_assignee_name || null,
            allocation_reason || null,
            confidence_score || 0,
            'Suggested'
        );

        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Task suggestion created successfully'
        });
    } catch (error) {
        console.error('Error creating task suggestion:', error);
        res.status(500).json({ error: 'Failed to create task suggestion' });
    }
};

// Accept task suggestion
export const acceptTaskSuggestion = async (req: Request, res: Response) => {
    try {
        const { suggestionId } = req.params;

        db.prepare(`
      UPDATE task_allocation_suggestions
      SET status = 'Accepted', assigned_date = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `).run(suggestionId);

        res.json({ message: 'Task suggestion accepted successfully' });
    } catch (error) {
        console.error('Error accepting task suggestion:', error);
        res.status(500).json({ error: 'Failed to accept task suggestion' });
    }
};

// Reject task suggestion
export const rejectTaskSuggestion = async (req: Request, res: Response) => {
    try {
        const { suggestionId } = req.params;

        db.prepare(`
      UPDATE task_allocation_suggestions
      SET status = 'Rejected', updated_at = datetime('now')
      WHERE id = ?
    `).run(suggestionId);

        res.json({ message: 'Task suggestion rejected successfully' });
    } catch (error) {
        console.error('Error rejecting task suggestion:', error);
        res.status(500).json({ error: 'Failed to reject task suggestion' });
    }
};

// Get workload forecast
export const getWorkloadForecast = async (req: Request, res: Response) => {
    try {
        const { department, employeeId } = req.query;

        let query = 'SELECT * FROM workload_forecast WHERE 1=1';
        const params: any[] = [];

        if (department) {
            query += ' AND department = ?';
            params.push(department);
        }

        if (employeeId) {
            query += ' AND employee_id = ?';
            params.push(employeeId);
        }

        query += ' ORDER BY utilization_percentage DESC';

        const forecast = db.prepare(query).all(...params);
        res.json(forecast);
    } catch (error) {
        console.error('Error fetching workload forecast:', error);
        res.status(500).json({ error: 'Failed to fetch workload forecast' });
    }
};

// Get team capacity utilization
export const getTeamCapacityUtilization = async (req: Request, res: Response) => {
    try {
        const { teamId } = req.query;

        let query = 'SELECT * FROM team_capacity_utilization WHERE 1=1';
        const params: any[] = [];

        if (teamId) {
            query += ' AND team_id = ?';
            params.push(teamId);
        }

        query += ' ORDER BY utilization_percentage DESC';

        const capacity = db.prepare(query).all(...params);
        res.json(capacity);
    } catch (error) {
        console.error('Error fetching team capacity utilization:', error);
        res.status(500).json({ error: 'Failed to fetch team capacity utilization' });
    }
};

// Get predicted overload cases
export const getPredictedOverloads = async (req: Request, res: Response) => {
    try {
        const { department, severity } = req.query;

        let query = 'SELECT * FROM predicted_overload_cases WHERE status = ?';
        const params: any[] = ['Predicted'];

        if (department) {
            query += ' AND department = ?';
            params.push(department);
        }

        if (severity) {
            query += ' AND severity = ?';
            params.push(severity);
        }

        query += ' ORDER BY severity DESC, overload_percentage DESC';

        const overloads = db.prepare(query).all(...params);
        res.json(overloads);
    } catch (error) {
        console.error('Error fetching predicted overloads:', error);
        res.status(500).json({ error: 'Failed to fetch predicted overloads' });
    }
};

// Get allocation statistics
export const getAllocationStats = async (req: Request, res: Response) => {
    try {
        const stats = {
            totalSuggestions: db.prepare('SELECT COUNT(*) as count FROM task_allocation_suggestions').get() as any,
            acceptedSuggestions: db.prepare('SELECT COUNT(*) as count FROM task_allocation_suggestions WHERE status = ?').get('Accepted') as any,
            rejectedSuggestions: db.prepare('SELECT COUNT(*) as count FROM task_allocation_suggestions WHERE status = ?').get('Rejected') as any,
            pendingSuggestions: db.prepare('SELECT COUNT(*) as count FROM task_allocation_suggestions WHERE status = ?').get('Suggested') as any,
            averageConfidence: db.prepare('SELECT AVG(confidence_score) as avg FROM task_allocation_suggestions').get() as any,
            highPrioritySuggestions: db.prepare('SELECT COUNT(*) as count FROM task_allocation_suggestions WHERE priority = ?').get('High') as any,
            overloadedEmployees: db.prepare('SELECT COUNT(*) as count FROM predicted_overload_cases WHERE status = ?').get('Predicted') as any
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching allocation statistics:', error);
        res.status(500).json({ error: 'Failed to fetch allocation statistics' });
    }
};

// Get workload trend forecast
export const getWorkloadTrendForecast = async (req: Request, res: Response) => {
    try {
        const { employeeId, period } = req.query;

        let query = 'SELECT * FROM workload_trend_analysis WHERE 1=1';
        const params: any[] = [];

        if (employeeId) {
            query += ' AND employee_id = ?';
            params.push(employeeId);
        }

        if (period) {
            query += ' AND period = ?';
            params.push(period);
        }

        query += ' ORDER BY period DESC';

        const trends = db.prepare(query).all(...params);
        res.json(trends);
    } catch (error) {
        console.error('Error fetching workload trend forecast:', error);
        res.status(500).json({ error: 'Failed to fetch workload trend forecast' });
    }
};

// Get skill-based allocation recommendations
export const getSkillBasedAllocations = async (req: Request, res: Response) => {
    try {
        const { taskId, employeeId } = req.query;

        let query = 'SELECT * FROM skill_based_allocation WHERE 1=1';
        const params: any[] = [];

        if (taskId) {
            query += ' AND task_id = ?';
            params.push(taskId);
        }

        if (employeeId) {
            query += ' AND employee_id = ?';
            params.push(employeeId);
        }

        query += ' ORDER BY skill_match_percentage DESC';

        const allocations = db.prepare(query).all(...params);
        res.json(allocations);
    } catch (error) {
        console.error('Error fetching skill-based allocations:', error);
        res.status(500).json({ error: 'Failed to fetch skill-based allocations' });
    }
};

// Get allocation performance metrics
export const getAllocationMetrics = async (req: Request, res: Response) => {
    try {
        const { period } = req.query;

        let query = 'SELECT * FROM allocation_performance_metrics WHERE 1=1';
        const params: any[] = [];

        if (period) {
            query += ' AND period = ?';
            params.push(period);
        }

        query += ' ORDER BY period DESC';

        const metrics = db.prepare(query).all(...params);
        res.json(metrics);
    } catch (error) {
        console.error('Error fetching allocation metrics:', error);
        res.status(500).json({ error: 'Failed to fetch allocation metrics' });
    }
};

// Bulk create task suggestions (for AI engine)
export const bulkCreateSuggestions = async (req: Request, res: Response) => {
    try {
        const { suggestions } = req.body;

        if (!Array.isArray(suggestions) || suggestions.length === 0) {
            return res.status(400).json({ error: 'Suggestions array is required' });
        }

        const insertStmt = db.prepare(`
      INSERT INTO task_allocation_suggestions (
        task_id, task_name, task_type, priority, estimated_hours,
        suggested_assignee_id, suggested_assignee_name, allocation_reason,
        confidence_score, status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

        const results = [];
        for (const suggestion of suggestions) {
            const result = insertStmt.run(
                suggestion.task_id,
                suggestion.task_name,
                suggestion.task_type || null,
                suggestion.priority || 'Medium',
                suggestion.estimated_hours || 0,
                suggestion.suggested_assignee_id || null,
                suggestion.suggested_assignee_name || null,
                suggestion.allocation_reason || null,
                suggestion.confidence_score || 0,
                'Suggested'
            );
            results.push(result.lastInsertRowid);
        }

        res.status(201).json({
            count: results.length,
            ids: results,
            message: `${results.length} task suggestions created successfully`
        });
    } catch (error) {
        console.error('Error bulk creating task suggestions:', error);
        res.status(500).json({ error: 'Failed to bulk create task suggestions' });
    }
};



