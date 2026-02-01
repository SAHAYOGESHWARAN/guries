import express, { Request, Response } from 'express';
import { pool } from "../config/db";

const router = express.Router();

// ===== EFFORT ANALYTICS =====

// Get effort analytics summary
router.get('/effort/summary', async (req: Request, res: Response) => {
    try {
        const { department, timeRange } = req.query;

        let query = `
      SELECT 
        AVG(effort_completion_percentage) as avg_completion,
        AVG(effort_pass_percentage) as avg_pass,
        SUM(total_tasks_completed) as total_tasks,
        AVG(qc_compliance_percentage) as avg_qc_compliance,
        AVG(rework_percentage) as avg_rework
      FROM effort_analytics
      WHERE 1=1
    `;

        const params: any[] = [];
        let paramIndex = 1;

        if (department) {
            query += ` AND department = $${paramIndex++}`;
            params.push(department);
        }

        if (timeRange === 'month') {
            query += ` AND date_recorded >= NOW() - INTERVAL '30 days'`;
        } else if (timeRange === 'quarter') {
            query += ` AND date_recorded >= NOW() - INTERVAL '90 days'`;
        }

        const result = await pool.query(query, params);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching effort analytics summary:', error);
        res.status(500).json({ error: 'Failed to fetch effort analytics summary' });
    }
});

// Get effort analytics by department
router.get('/effort/by-department', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT 
        department,
        AVG(effort_completion_percentage) as completion_percentage,
        AVG(effort_pass_percentage) as pass_percentage,
        AVG(qc_compliance_percentage) as qc_compliance,
        AVG(rework_percentage) as rework_percentage,
        COUNT(*) as record_count
      FROM effort_analytics
      GROUP BY department
      ORDER BY completion_percentage DESC
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching effort analytics by department:', error);
        res.status(500).json({ error: 'Failed to fetch effort analytics by department' });
    }
});

// Get effort trends (last 12 weeks)
router.get('/effort/trends', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT week_number, effort_percentage
      FROM effort_trends
      ORDER BY week_number DESC
      LIMIT 12
    `);

        res.json(result.rows.reverse());
    } catch (error) {
        console.error('Error fetching effort trends:', error);
        res.status(500).json({ error: 'Failed to fetch effort trends' });
    }
});

// ===== PERFORMANCE ANALYTICS =====

// Get performance analytics summary
router.get('/performance/summary', async (req: Request, res: Response) => {
    try {
        const { department, timeRange } = req.query;

        let query = `
      SELECT 
        AVG(kpi_achievement_percentage) as avg_kpi_achievement,
        AVG(ranking_improvement) as avg_ranking_improvement,
        AVG(performance_score_percentage) as avg_performance_score,
        AVG(engagement_score) as avg_engagement_score,
        AVG(traffic_growth_percentage) as avg_traffic_growth,
        AVG(conversion_score) as avg_conversion_score
      FROM performance_analytics
      WHERE 1=1
    `;

        const params: any[] = [];
        let paramIndex = 1;

        if (department) {
            query += ` AND department = $${paramIndex++}`;
            params.push(department);
        }

        if (timeRange === 'month') {
            query += ` AND date_recorded >= NOW() - INTERVAL '30 days'`;
        } else if (timeRange === 'quarter') {
            query += ` AND date_recorded >= NOW() - INTERVAL '90 days'`;
        }

        const result = await pool.query(query, params);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching performance analytics summary:', error);
        res.status(500).json({ error: 'Failed to fetch performance analytics summary' });
    }
});

// Get performance analytics by department
router.get('/performance/by-department', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT 
        department,
        AVG(kpi_achievement_percentage) as kpi_achievement,
        AVG(performance_score_percentage) as performance_score,
        AVG(engagement_score) as engagement_score,
        AVG(traffic_growth_percentage) as traffic_growth,
        AVG(conversion_score) as conversion_score,
        COUNT(*) as record_count
      FROM performance_analytics
      GROUP BY department
      ORDER BY kpi_achievement DESC
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching performance analytics by department:', error);
        res.status(500).json({ error: 'Failed to fetch performance analytics by department' });
    }
});

// ===== KPI METRICS =====

// Get all KPI metrics
router.get('/kpi/metrics', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT * FROM kpi_metrics
      ORDER BY metric_name
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching KPI metrics:', error);
        res.status(500).json({ error: 'Failed to fetch KPI metrics' });
    }
});

// Create KPI metric
router.post('/kpi/metrics', async (req: Request, res: Response) => {
    try {
        const {
            metric_name,
            metric_type,
            benchmark,
            current_value,
            target_value,
            gold_standard,
            competitor_avg
        } = req.body;

        if (!metric_name) {
            return res.status(400).json({ error: 'Metric name is required' });
        }

        const delta = (current_value || 0) - (benchmark || 0);
        const percentage_changed = benchmark ? ((delta / benchmark) * 100) : 0;
        const trend = delta > 0 ? 'up' : delta < 0 ? 'down' : 'stable';
        const status = current_value >= target_value ? 'on-track' : 'at-risk';

        const result = await pool.query(`
      INSERT INTO kpi_metrics (
        metric_name, metric_type, benchmark, current_value, target_value,
        delta, percentage_changed, gold_standard, competitor_avg, trend, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `, [
            metric_name,
            metric_type || null,
            benchmark || null,
            current_value || null,
            target_value || null,
            delta,
            percentage_changed,
            gold_standard || null,
            competitor_avg || null,
            trend,
            status
        ]);

        res.status(201).json({
            id: result.rows[0].id,
            message: 'KPI metric created successfully'
        });
    } catch (error) {
        console.error('Error creating KPI metric:', error);
        res.status(500).json({ error: 'Failed to create KPI metric' });
    }
});

// ===== TARGET VS ACTUAL =====

// Get target vs actual performance
router.get('/target-vs-actual', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT * FROM target_vs_actual
      ORDER BY week_number, category
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching target vs actual:', error);
        res.status(500).json({ error: 'Failed to fetch target vs actual' });
    }
});

// ===== TEAM PERFORMANCE HEATMAP =====

// Get team performance heatmap
router.get('/team-heatmap', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT team_name, week_number, performance_percentage, status
      FROM team_performance_heatmap
      ORDER BY team_name, week_number
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching team heatmap:', error);
        res.status(500).json({ error: 'Failed to fetch team heatmap' });
    }
});

// ===== QC PERFORMANCE BY STAGE =====

// Get QC performance by stage
router.get('/qc-by-stage', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT stage_name, score_percentage, status
      FROM qc_performance_by_stage
      ORDER BY score_percentage DESC
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching QC performance by stage:', error);
        res.status(500).json({ error: 'Failed to fetch QC performance by stage' });
    }
});

// ===== SLA MISSES/DELAYS =====

// Get SLA misses and delays
router.get('/sla-misses', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT team_name, missed_count, delay_days
      FROM sla_misses_delays
      ORDER BY missed_count DESC
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching SLA misses:', error);
        res.status(500).json({ error: 'Failed to fetch SLA misses' });
    }
});

// ===== KEYWORD ANALYTICS =====

// Get top keywords
router.get('/keywords/top', async (req: Request, res: Response) => {
    try {
        const { limit = 10 } = req.query;

        const result = await pool.query(`
      SELECT keyword, rank_position, search_volume, traffic_count, conversion_count
      FROM keyword_analytics
      ORDER BY traffic_count DESC
      LIMIT $1
    `, [parseInt(limit as string)]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching top keywords:', error);
        res.status(500).json({ error: 'Failed to fetch top keywords' });
    }
});

// Get all keywords
router.get('/keywords', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT * FROM keyword_analytics
      ORDER BY traffic_count DESC
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching keywords:', error);
        res.status(500).json({ error: 'Failed to fetch keywords' });
    }
});

// Create keyword
router.post('/keywords', async (req: Request, res: Response) => {
    try {
        const { keyword, rank_position, search_volume, traffic_count, conversion_count } = req.body;

        if (!keyword) {
            return res.status(400).json({ error: 'Keyword is required' });
        }

        const result = await pool.query(`
      INSERT INTO keyword_analytics (keyword, rank_position, search_volume, traffic_count, conversion_count)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [keyword, rank_position || null, search_volume || 0, traffic_count || 0, conversion_count || 0]);

        res.status(201).json({
            id: result.rows[0].id,
            message: 'Keyword created successfully'
        });
    } catch (error) {
        console.error('Error creating keyword:', error);
        res.status(500).json({ error: 'Failed to create keyword' });
    }
});

// ===== DASHBOARD DATA =====

// Get complete effort analytics dashboard
router.get('/effort-dashboard', async (req: Request, res: Response) => {
    try {
        const summaryResult = await pool.query(`
      SELECT 
        AVG(effort_completion_percentage) as completion,
        AVG(effort_pass_percentage) as pass_rate,
        SUM(total_tasks_completed) as total_tasks,
        AVG(qc_compliance_percentage) as qc_compliance,
        AVG(rework_percentage) as rework
      FROM effort_analytics
      WHERE date_recorded >= NOW() - INTERVAL '30 days'
    `);

        const byDeptResult = await pool.query(`
      SELECT department, AVG(effort_completion_percentage) as completion
      FROM effort_analytics
      WHERE date_recorded >= NOW() - INTERVAL '30 days'
      GROUP BY department
    `);

        const trendsResult = await pool.query(`
      SELECT week_number, effort_percentage
      FROM effort_trends
      ORDER BY week_number DESC
      LIMIT 12
    `);

        const heatmapResult = await pool.query(`
      SELECT team_name, week_number, performance_percentage
      FROM team_performance_heatmap
      ORDER BY team_name, week_number
    `);

        const qcStagesResult = await pool.query(`
      SELECT stage_name, score_percentage
      FROM qc_performance_by_stage
      ORDER BY score_percentage DESC
    `);

        const slaResult = await pool.query(`
      SELECT team_name, missed_count, delay_days
      FROM sla_misses_delays
      ORDER BY missed_count DESC
    `);

        res.json({
            summary: summaryResult.rows[0],
            byDepartment: byDeptResult.rows,
            trends: trendsResult.rows.reverse(),
            heatmap: heatmapResult.rows,
            qcStages: qcStagesResult.rows,
            sla: slaResult.rows
        });
    } catch (error) {
        console.error('Error fetching effort dashboard:', error);
        res.status(500).json({ error: 'Failed to fetch effort dashboard' });
    }
});

// Get complete performance analytics dashboard
router.get('/performance-dashboard', async (req: Request, res: Response) => {
    try {
        const summaryResult = await pool.query(`
      SELECT 
        AVG(kpi_achievement_percentage) as kpi_achievement,
        AVG(ranking_improvement) as ranking_improvement,
        AVG(performance_score_percentage) as performance_score,
        AVG(engagement_score) as engagement_score,
        AVG(traffic_growth_percentage) as traffic_growth,
        AVG(conversion_score) as conversion_score
      FROM performance_analytics
      WHERE date_recorded >= NOW() - INTERVAL '30 days'
    `);

        const kpiMetricsResult = await pool.query(`
      SELECT * FROM kpi_metrics
      ORDER BY metric_name
    `);

        const keywordsResult = await pool.query(`
      SELECT keyword, rank_position, search_volume, traffic_count, conversion_count
      FROM keyword_analytics
      ORDER BY traffic_count DESC
      LIMIT 10
    `);

        res.json({
            summary: summaryResult.rows[0],
            kpiMetrics: kpiMetricsResult.rows,
            topKeywords: keywordsResult.rows
        });
    } catch (error) {
        console.error('Error fetching performance dashboard:', error);
        res.status(500).json({ error: 'Failed to fetch performance dashboard' });
    }
});

// ===== DASHBOARD ACTIVITY TRACKING =====

// Get dashboard stats (dynamic based on actual data)
router.get('/dashboard/stats', async (req: Request, res: Response) => {
    try {
        // Active campaigns
        const activeCampaignsResult = await pool.query(`
      SELECT COUNT(*) as count FROM campaigns 
      WHERE status IN ('active', 'In Progress', 'Active')
    `);

        // Content published
        const contentPublishedResult = await pool.query(`
      SELECT COUNT(*) as count FROM content 
      WHERE status = 'Published'
    `);

        // Tasks completed
        const tasksCompletedResult = await pool.query(`
      SELECT COUNT(*) as count FROM tasks 
      WHERE status = 'completed'
    `);

        // Team members
        const teamMembersResult = await pool.query(`
      SELECT COUNT(*) as count FROM users
    `);

        // Calculate trends (comparing last 30 days with previous 30 days)
        const campaignsTrendResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM campaigns WHERE status IN ('active', 'In Progress', 'Active') AND created_at >= NOW() - INTERVAL '30 days') as current,
        (SELECT COUNT(*) FROM campaigns WHERE status IN ('active', 'In Progress', 'Active') AND created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days') as previous
    `);

        const contentTrendResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM content WHERE status = 'Published' AND created_at >= NOW() - INTERVAL '30 days') as current,
        (SELECT COUNT(*) FROM content WHERE status = 'Published' AND created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days') as previous
    `);

        const tasksTrendResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM tasks WHERE status = 'completed' AND updated_at >= NOW() - INTERVAL '30 days') as current,
        (SELECT COUNT(*) FROM tasks WHERE status = 'completed' AND updated_at >= NOW() - INTERVAL '60 days' AND updated_at < NOW() - INTERVAL '30 days') as previous
    `);

        const calculateTrendPercentage = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        const activeCampaigns = activeCampaignsResult.rows[0];
        const contentPublished = contentPublishedResult.rows[0];
        const tasksCompleted = tasksCompletedResult.rows[0];
        const teamMembers = teamMembersResult.rows[0];
        const campaignsTrend = campaignsTrendResult.rows[0];
        const contentTrend = contentTrendResult.rows[0];
        const tasksTrend = tasksTrendResult.rows[0];

        res.json({
            activeCampaigns: activeCampaigns?.count || 0,
            campaignsTrendPercent: calculateTrendPercentage(campaignsTrend?.current || 0, campaignsTrend?.previous || 0),
            contentPublished: contentPublished?.count || 0,
            contentTrendPercent: calculateTrendPercentage(contentTrend?.current || 0, contentTrend?.previous || 0),
            tasksCompleted: tasksCompleted?.count || 0,
            tasksTrendPercent: calculateTrendPercentage(tasksTrend?.current || 0, tasksTrend?.previous || 0),
            teamMembers: teamMembers?.count || 0
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// Get recent projects with progress
router.get('/dashboard/projects', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT 
        id,
        name,
        project_name,
        status,
        progress,
        created_at,
        updated_at
      FROM projects
      ORDER BY updated_at DESC
      LIMIT 10
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching dashboard projects:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard projects' });
    }
});

// Get upcoming tasks
router.get('/dashboard/tasks', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT 
        id,
        name,
        task_name,
        status,
        priority,
        due_date,
        created_at,
        updated_at
      FROM tasks
      WHERE status != 'completed'
      ORDER BY priority DESC, due_date ASC
      LIMIT 10
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching dashboard tasks:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard tasks' });
    }
});

// Get recent activity
router.get('/dashboard/activity', async (req: Request, res: Response) => {
    try {
        // Get recent task completions
        const taskActivityResult = await pool.query(`
      SELECT 
        t.id,
        u.name as user_name,
        'completed task' as action,
        t.task_name as target,
        t.updated_at as timestamp
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.status = 'completed'
      ORDER BY t.updated_at DESC
      LIMIT 5
    `);

        // Get recent content published
        const contentActivityResult = await pool.query(`
      SELECT 
        c.id,
        u.name as user_name,
        'published content' as action,
        c.content_title_clean as target,
        c.created_at as timestamp
      FROM content c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.status = 'Published'
      ORDER BY c.created_at DESC
      LIMIT 5
    `);

        // Get recent campaign updates
        const campaignActivityResult = await pool.query(`
      SELECT 
        c.id,
        u.name as user_name,
        'updated campaign' as action,
        c.campaign_name as target,
        c.updated_at as timestamp
      FROM campaigns c
      LEFT JOIN users u ON c.created_by = u.id
      ORDER BY c.updated_at DESC
      LIMIT 5
    `);

        // Combine and sort by timestamp
        const allActivity = [...(taskActivityResult.rows || []), ...(contentActivityResult.rows || []), ...(campaignActivityResult.rows || [])]
            .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10);

        res.json(allActivity);
    } catch (error) {
        console.error('Error fetching dashboard activity:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard activity' });
    }
});

export default router;

