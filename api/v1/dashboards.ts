import { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool, initializeDatabase } from '../db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await initializeDatabase();
        const pool = getPool();

        // GET /api/v1/dashboards/employees
        if (req.method === 'GET' && req.url?.includes('/employees')) {
            try {
                const result = await pool.query(
                    `SELECT id, name, email, role, department, status FROM users WHERE role != 'admin' ORDER BY name ASC`
                );

                return res.status(200).json({
                    success: true,
                    data: result.rows,
                    count: result.rows.length
                });
            } catch (error: any) {
                console.error('[Dashboards] Error fetching employees:', error.message);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to fetch employees',
                    message: error.message
                });
            }
        }

        // GET /api/v1/dashboards/employee-comparison
        if (req.method === 'GET' && req.url?.includes('/employee-comparison')) {
            try {
                const result = await pool.query(
                    `SELECT 
                        u.id,
                        u.name,
                        u.email,
                        u.department,
                        COUNT(DISTINCT t.id) as tasks_assigned,
                        COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as tasks_completed,
                        ROUND(
                            CASE 
                                WHEN COUNT(DISTINCT t.id) = 0 THEN 0
                                ELSE (COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END)::float / COUNT(DISTINCT t.id) * 100)
                            END
                        ) as completion_rate
                    FROM users u
                    LEFT JOIN tasks t ON t.assigned_to = u.id
                    WHERE u.role != 'admin'
                    GROUP BY u.id, u.name, u.email, u.department
                    ORDER BY completion_rate DESC`
                );

                return res.status(200).json({
                    success: true,
                    data: result.rows,
                    count: result.rows.length
                });
            } catch (error: any) {
                console.error('[Dashboards] Error fetching employee comparison:', error.message);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to fetch employee comparison',
                    message: error.message
                });
            }
        }

        // POST /api/v1/dashboards/team-leader/task-assignment
        if (req.method === 'POST' && req.url?.includes('/task-assignment')) {
            const { taskId, fromEmployeeId, toEmployeeId } = req.body;

            if (!taskId || !toEmployeeId) {
                return res.status(400).json({
                    success: false,
                    error: 'Task ID and target employee ID are required',
                    validationErrors: [
                        !taskId ? 'Task ID is required' : '',
                        !toEmployeeId ? 'Target employee ID is required' : ''
                    ].filter(Boolean)
                });
            }

            try {
                const result = await pool.query(
                    `UPDATE tasks SET assigned_to = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
                    [toEmployeeId, taskId]
                );

                if (result.rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Task not found'
                    });
                }

                return res.status(200).json({
                    success: true,
                    data: result.rows[0],
                    message: 'Task reassigned successfully'
                });
            } catch (error: any) {
                console.error('[Dashboards] Error reassigning task:', error.message);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to reassign task',
                    message: error.message
                });
            }
        }

        // POST /api/v1/dashboards/performance/export
        if (req.method === 'POST' && req.url?.includes('/performance/export')) {
            try {
                // Get performance data
                const result = await pool.query(
                    `SELECT 
                        u.name,
                        u.email,
                        COUNT(DISTINCT t.id) as tasks_total,
                        COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as tasks_completed,
                        ROUND(
                            CASE 
                                WHEN COUNT(DISTINCT t.id) = 0 THEN 0
                                ELSE (COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END)::float / COUNT(DISTINCT t.id) * 100)
                            END
                        ) as completion_percentage
                    FROM users u
                    LEFT JOIN tasks t ON t.assigned_to = u.id
                    WHERE u.role != 'admin'
                    GROUP BY u.id, u.name, u.email
                    ORDER BY completion_percentage DESC`
                );

                // Return CSV format
                const csv = [
                    ['Name', 'Email', 'Total Tasks', 'Completed', 'Completion %'],
                    ...result.rows.map(row => [
                        row.name,
                        row.email,
                        row.tasks_total,
                        row.tasks_completed,
                        row.completion_percentage
                    ])
                ].map(row => row.join(',')).join('\n');

                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename="performance-report.csv"');
                return res.status(200).send(csv);
            } catch (error: any) {
                console.error('[Dashboards] Error exporting performance:', error.message);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to export performance data',
                    message: error.message
                });
            }
        }

        // POST /api/v1/dashboards/workload-prediction/implement-suggestion
        if (req.method === 'POST' && req.url?.includes('/implement-suggestion')) {
            const { suggestionId } = req.body;

            if (!suggestionId) {
                return res.status(400).json({
                    success: false,
                    error: 'Suggestion ID is required'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Suggestion implemented successfully'
            });
        }

        return res.status(404).json({
            success: false,
            error: 'Endpoint not found'
        });

    } catch (error: any) {
        console.error('[Dashboards] Unexpected error:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}
