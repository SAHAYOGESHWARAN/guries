import express, { Request, Response } from 'express';
import { db } from '../config/db';

const router = express.Router();

// ===== EFFORT ANALYTICS =====

// Get effort analytics summary
router.get('/effort/summary', (req: Request, res: Response) => {
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

        if (department) {
            query += ` AND department = ?`;
            params.push(department);
        }

        if (timeRange === 'month') {
            query += ` AND date_recorded >= datetime('now', '-30 days')`;
        } else if (timeRange === 'quarter') {
            query += ` AND date_recorded >= datetime('now', '-90 days')`;
        }

        const summary = db.prepare(query).get(...params);
        res.json(summary);
    } catch (error) {
        console.error('Error fetching effort analytics summary:', error);
        res.status(500).json({ error: 'Failed to fetch effort analytics summary' });
    }
});

// Get effort analytics by department
router.get('/effort/by-department', (req: Request, res: Response) => {
    try {
        const analytics = db.prepare(`
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
    `).all();

        res.json(analytics);
    } catch (error) {
        console.error('Error fetching effort analytics by department:', error);
        res.status(500).json({ error: 'Failed to fetch effort analytics by department' });
    }
});

// Get effort trends (last 12 weeks)
router.get('/effort/trends', (req: Request, res: Response) => {
    try {
        const trends = db.prepare(`
      SELECT week_number, effort_percentage
      FROM effort_trends
      ORDER BY week_number DESC
      LIMIT 12
    `).all();

        res.json(trends.reverse());
    } catch (error) {
        console.error('Error fetching effort trends:', error);
        res.status(500).json({ error: 'Failed to fetch effort trends' });
    }
});

// ===== PERFORMANCE ANALYTICS =====

// Get performance analytics summary
router.get('/performance/summary', (req: Request, res: Response) => {
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

        if (department) {
            query += ` AND department = ?`;
            params.push(department);
        }

        if (timeRange === 'month') {
            query += ` AND date_recorded >= datetime('now', '-30 days')`;
        } else if (timeRange === 'quarter') {
            query += ` AND date_recorded >= datetime('now', '-90 days')`;
        }

        const summary = db.prepare(query).get(...params);
        res.json(summary);
    } catch (error) {
        console.error('Error fetching performance analytics summary:', error);
        res.status(500).json({ error: 'Failed to fetch performance analytics summary' });
    }
});

// Get performance analytics by department
router.get('/performance/by-department', (req: Request, res: Response) => {
    try {
        const analytics = db.prepare(`
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
    `).all();

        res.json(analytics);
    } catch (error) {
        console.error('Error fetching performance analytics by department:', error);
        res.status(500).json({ error: 'Failed to fetch performance analytics by department' });
    }
});

// ===== KPI METRICS =====

// Get all KPI metrics
router.get('/kpi/metrics', (req: Request, res: Response) => {
    try {
        const metrics = db.prepare(`
      SELECT * FROM kpi_metrics
      ORDER BY metric_name
    `).all();

        res.json(metrics);
    } catch (error) {
        console.error('Error fetching KPI metrics:', error);
        res.status(500).json({ error: 'Failed to fetch KPI metrics' });
    }
});

// Create KPI metric
router.post('/kpi/metrics', (req: Request, res: Response) => {
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

        const result = db.prepare(`
      INSERT INTO kpi_metrics (
        metric_name, metric_type, benchmark, current_value, target_value,
        delta, percentage_changed, gold_standard, competitor_avg, trend, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
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
        );

        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'KPI metric created successfully'
        });
    } catch (error) {
        console.error('Error creating KPI metric:', error);
        res.status(500).json({ error: 'Failed to create KPI metric' });
    }
});

// ===== TARGET VS ACTUAL =====

// Get target vs actual performance
router.get('/target-vs-actual', (req: Request, res: Response) => {
    try {
        const performance = db.prepare(`
      SELECT * FROM target_vs_actual
      ORDER BY week_number, category
    `).all();

        res.json(performance);
    } catch (error) {
        console.error('Error fetching target vs actual:', error);
        res.status(500).json({ error: 'Failed to fetch target vs actual' });
    }
});

// ===== TEAM PERFORMANCE HEATMAP =====

// Get team performance heatmap
router.get('/team-heatmap', (req: Request, res: Response) => {
    try {
        const heatmap = db.prepare(`
      SELECT team_name, week_number, performance_percentage, status
      FROM team_performance_heatmap
      ORDER BY team_name, week_number
    `).all();

        res.json(heatmap);
    } catch (error) {
        console.error('Error fetching team heatmap:', error);
        res.status(500).json({ error: 'Failed to fetch team heatmap' });
    }
});

// ===== QC PERFORMANCE BY STAGE =====

// Get QC performance by stage
router.get('/qc-by-stage', (req: Request, res: Response) => {
    try {
        const performance = db.prepare(`
      SELECT stage_name, score_percentage, status
      FROM qc_performance_by_stage
      ORDER BY score_percentage DESC
    `).all();

        res.json(performance);
    } catch (error) {
        console.error('Error fetching QC performance by stage:', error);
        res.status(500).json({ error: 'Failed to fetch QC performance by stage' });
    }
});

// ===== SLA MISSES/DELAYS =====

// Get SLA misses and delays
router.get('/sla-misses', (req: Request, res: Response) => {
    try {
        const sla = db.prepare(`
      SELECT team_name, missed_count, delay_days
      FROM sla_misses_delays
      ORDER BY missed_count DESC
    `).all();

        res.json(sla);
    } catch (error) {
        console.error('Error fetching SLA misses:', error);
        res.status(500).json({ error: 'Failed to fetch SLA misses' });
    }
});

// ===== KEYWORD ANALYTICS =====

// Get top keywords
router.get('/keywords/top', (req: Request, res: Response) => {
    try {
        const { limit = 10 } = req.query;

        const keywords = db.prepare(`
      SELECT keyword, rank_position, search_volume, traffic_count, conversion_count
      FROM keyword_analytics
      ORDER BY traffic_count DESC
      LIMIT ?
    `).all(parseInt(limit as string));

        res.json(keywords);
    } catch (error) {
        console.error('Error fetching top keywords:', error);
        res.status(500).json({ error: 'Failed to fetch top keywords' });
    }
});

// Get all keywords
router.get('/keywords', (req: Request, res: Response) => {
    try {
        const keywords = db.prepare(`
      SELECT * FROM keyword_analytics
      ORDER BY traffic_count DESC
    `).all();

        res.json(keywords);
    } catch (error) {
        console.error('Error fetching keywords:', error);
        res.status(500).json({ error: 'Failed to fetch keywords' });
    }
});

// Create keyword
router.post('/keywords', (req: Request, res: Response) => {
    try {
        const { keyword, rank_position, search_volume, traffic_count, conversion_count } = req.body;

        if (!keyword) {
            return res.status(400).json({ error: 'Keyword is required' });
        }

        const result = db.prepare(`
      INSERT INTO keyword_analytics (keyword, rank_position, search_volume, traffic_count, conversion_count)
      VALUES (?, ?, ?, ?, ?)
    `).run(keyword, rank_position || null, search_volume || 0, traffic_count || 0, conversion_count || 0);

        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Keyword created successfully'
        });
    } catch (error) {
        console.error('Error creating keyword:', error);
        res.status(500).json({ error: 'Failed to create keyword' });
    }
});

// ===== DASHBOARD DATA =====

// Get complete effort analytics dashboard
router.get('/effort-dashboard', (req: Request, res: Response) => {
    try {
        const summary = db.prepare(`
      SELECT 
        AVG(effort_completion_percentage) as completion,
        AVG(effort_pass_percentage) as pass_rate,
        SUM(total_tasks_completed) as total_tasks,
        AVG(qc_compliance_percentage) as qc_compliance,
        AVG(rework_percentage) as rework
      FROM effort_analytics
      WHERE date_recorded >= datetime('now', '-30 days')
    `).get();

        const byDept = db.prepare(`
      SELECT department, AVG(effort_completion_percentage) as completion
      FROM effort_analytics
      WHERE date_recorded >= datetime('now', '-30 days')
      GROUP BY department
    `).all();

        const trends = db.prepare(`
      SELECT week_number, effort_percentage
      FROM effort_trends
      ORDER BY week_number DESC
      LIMIT 12
    `).all();

        const heatmap = db.prepare(`
      SELECT team_name, week_number, performance_percentage
      FROM team_performance_heatmap
      ORDER BY team_name, week_number
    `).all();

        const qcStages = db.prepare(`
      SELECT stage_name, score_percentage
      FROM qc_performance_by_stage
      ORDER BY score_percentage DESC
    `).all();

        const sla = db.prepare(`
      SELECT team_name, missed_count, delay_days
      FROM sla_misses_delays
      ORDER BY missed_count DESC
    `).all();

        res.json({
            summary,
            byDepartment: byDept,
            trends: trends.reverse(),
            heatmap,
            qcStages,
            sla
        });
    } catch (error) {
        console.error('Error fetching effort dashboard:', error);
        res.status(500).json({ error: 'Failed to fetch effort dashboard' });
    }
});

// Get complete performance analytics dashboard
router.get('/performance-dashboard', (req: Request, res: Response) => {
    try {
        const summary = db.prepare(`
      SELECT 
        AVG(kpi_achievement_percentage) as kpi_achievement,
        AVG(ranking_improvement) as ranking_improvement,
        AVG(performance_score_percentage) as performance_score,
        AVG(engagement_score) as engagement_score,
        AVG(traffic_growth_percentage) as traffic_growth,
        AVG(conversion_score) as conversion_score
      FROM performance_analytics
      WHERE date_recorded >= datetime('now', '-30 days')
    `).get();

        const kpiMetrics = db.prepare(`
      SELECT * FROM kpi_metrics
      ORDER BY metric_name
    `).all();

        const keywords = db.prepare(`
      SELECT keyword, rank_position, search_volume, traffic_count, conversion_count
      FROM keyword_analytics
      ORDER BY traffic_count DESC
      LIMIT 10
    `).all();

        res.json({
            summary,
            kpiMetrics,
            topKeywords: keywords
        });
    } catch (error) {
        console.error('Error fetching performance dashboard:', error);
        res.status(500).json({ error: 'Failed to fetch performance dashboard' });
    }
});

// ===== DASHBOARD ACTIVITY TRACKING =====

// Get dashboard stats (dynamic based on actual data)
router.get('/dashboard/stats', (req: Request, res: Response) => {
    try {
        // Active campaigns
        const activeCampaigns = db.prepare(`
      SELECT COUNT(*) as count FROM campaigns 
      WHERE status IN ('active', 'In Progress', 'Active')
    `).get() as any;

        // Content published
        const contentPublished = db.prepare(`
      SELECT COUNT(*) as count FROM content 
      WHERE status = 'Published'
    `).get() as any;

        // Tasks completed
        const tasksCompleted = db.prepare(`
      SELECT COUNT(*) as count FROM tasks 
      WHERE status = 'completed'
    `).get() as any;

        // Team members
        const teamMembers = db.prepare(`
      SELECT COUNT(*) as count FROM users
    `).get() as any;

        // Calculate trends (comparing last 30 days with previous 30 days)
        const campaignsTrend = db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM campaigns WHERE status IN ('active', 'In Progress', 'Active') AND created_at >= datetime('now', '-30 days')) as current,
        (SELECT COUNT(*) FROM campaigns WHERE status IN ('active', 'In Progress', 'Active') AND created_at >= datetime('now', '-60 days') AND created_at < datetime('now', '-30 days')) as previous
    `).get() as any;

        const contentTrend = db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM content WHERE status = 'Published' AND created_at >= datetime('now', '-30 days')) as current,
        (SELECT COUNT(*) FROM content WHERE status = 'Published' AND created_at >= datetime('now', '-60 days') AND created_at < datetime('now', '-30 days')) as previous
    `).get() as any;

        const tasksTrend = db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM tasks WHERE status = 'completed' AND updated_at >= datetime('now', '-30 days')) as current,
        (SELECT COUNT(*) FROM tasks WHERE status = 'completed' AND updated_at >= datetime('now', '-60 days') AND updated_at < datetime('now', '-30 days')) as previous
    `).get() as any;

        const calculateTrendPercentage = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

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
router.get('/dashboard/projects', (req: Request, res: Response) => {
    try {
        const projects = db.prepare(`
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
    `).all();

        res.json(projects);
    } catch (error) {
        console.error('Error fetching dashboard projects:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard projects' });
    }
});

// Get upcoming tasks
router.get('/dashboard/tasks', (req: Request, res: Response) => {
    try {
        const tasks = db.prepare(`
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
    `).all();

        res.json(tasks);
    } catch (error) {
        console.error('Error fetching dashboard tasks:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard tasks' });
    }
});

// Get recent activity
router.get('/dashboard/activity', (req: Request, res: Response) => {
    try {
        // Get recent task completions
        const taskActivity = db.prepare(`
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
    `).all();

        // Get recent content published
        const contentActivity = db.prepare(`
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
    `).all();

        // Get recent campaign updates
        const campaignActivity = db.prepare(`
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
    `).all();

        // Combine and sort by timestamp
        const allActivity = [...(taskActivity || []), ...(contentActivity || []), ...(campaignActivity || [])]
            .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10);

        res.json(allActivity);
    } catch (error) {
        console.error('Error fetching dashboard activity:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard activity' });
    }
});

export default router;
