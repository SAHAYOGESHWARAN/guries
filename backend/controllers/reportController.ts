
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';

export const getTodayReport = async (req: any, res: any) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get today's date in YYYY-MM-DD format for date comparisons
        const todayStr = today.toISOString().split('T')[0];
        
        // Run all queries in parallel for performance
        const [
            todayCampaigns,
            todayTasks,
            todayContent,
            todayProjects,
            todaySmmPosts,
            todayBacklinks,
            todaySubmissions,
            todayNotifications,
            todayTraffic,
            completedTasksToday,
            createdTasksToday,
            activeCampaigns,
            pendingTasks,
            toxicLinks,
            qcRunsToday
        ] = await Promise.all([
            // Campaigns created today
            pool.query(`
                SELECT COUNT(*) as count, 
                       json_agg(json_build_object('id', id, 'name', campaign_name, 'type', campaign_type, 'status', status)) as items
                FROM campaigns 
                WHERE DATE(created_at) = $1
            `, [todayStr]),
            
            // Tasks created today
            pool.query(`
                SELECT COUNT(*) as count,
                       json_agg(json_build_object('id', id, 'title', title, 'status', status, 'priority', priority)) as items
                FROM tasks 
                WHERE DATE(created_at) = $1
            `, [todayStr]),
            
            // Content created today
            pool.query(`
                SELECT COUNT(*) as count,
                       json_agg(json_build_object('id', id, 'title', title, 'type', content_type, 'stage', pipeline_stage)) as items
                FROM content_repository 
                WHERE DATE(created_at) = $1
            `, [todayStr]),
            
            // Projects created today
            pool.query(`
                SELECT COUNT(*) as count,
                       json_agg(json_build_object('id', id, 'name', project_name, 'status', project_status)) as items
                FROM projects 
                WHERE DATE(created_at) = $1
            `, [todayStr]),
            
            // SMM Posts created today
            pool.query(`
                SELECT COUNT(*) as count,
                       json_agg(json_build_object('id', id, 'platform', platform, 'status', status)) as items
                FROM smm_posts 
                WHERE DATE(created_at) = $1
            `, [todayStr]),
            
            // Backlinks created today
            pool.query(`
                SELECT COUNT(*) as count
                FROM backlink_sources 
                WHERE DATE(created_at) = $1
            `, [todayStr]),
            
            // Submissions created today
            pool.query(`
                SELECT COUNT(*) as count,
                       json_agg(json_build_object('id', id, 'status', submission_status)) as items
                FROM backlink_submissions 
                WHERE DATE(created_at) = $1
            `, [todayStr]),
            
            // Notifications today
            pool.query(`
                SELECT COUNT(*) as count,
                       json_agg(json_build_object('id', id, 'message', message, 'type', type, 'read', read)) as items
                FROM notifications 
                WHERE DATE(created_at) = $1
                ORDER BY created_at DESC
            `, [todayStr]),
            
            // Today's traffic
            pool.query(`
                SELECT value 
                FROM analytics_daily_traffic 
                WHERE date = $1
            `, [todayStr]),
            
            // Tasks completed today
            pool.query(`
                SELECT COUNT(*) as count
                FROM tasks 
                WHERE status = 'completed' AND DATE(updated_at) = $1
            `, [todayStr]),
            
            // Tasks created today (separate count)
            pool.query(`
                SELECT COUNT(*) as count
                FROM tasks 
                WHERE DATE(created_at) = $1
            `, [todayStr]),
            
            // Active campaigns (overall)
            pool.query(`
                SELECT COUNT(*) as count
                FROM campaigns 
                WHERE status = 'active'
            `),
            
            // Pending tasks (overall)
            pool.query(`
                SELECT COUNT(*) as count
                FROM tasks 
                WHERE status != 'completed'
            `),
            
            // Toxic backlinks pending
            pool.query(`
                SELECT COUNT(*) as count
                FROM toxic_backlinks 
                WHERE status = 'Pending'
            `),
            
            // QC runs today
            pool.query(`
                SELECT COUNT(*) as count,
                       json_agg(json_build_object('id', id, 'target_type', target_type, 'status', qc_status)) as items
                FROM qc_runs 
                WHERE DATE(created_at) = $1
            `, [todayStr])
        ]);

        // Format the report data
        const report = {
            date: todayStr,
            generatedAt: new Date().toISOString(),
            summary: {
                totalActivities: 
                    parseInt(todayCampaigns.rows[0].count || '0') +
                    parseInt(todayTasks.rows[0].count || '0') +
                    parseInt(todayContent.rows[0].count || '0') +
                    parseInt(todayProjects.rows[0].count || '0') +
                    parseInt(todaySmmPosts.rows[0].count || '0') +
                    parseInt(todayBacklinks.rows[0].count || '0') +
                    parseInt(todaySubmissions.rows[0].count || '0'),
                tasksCompleted: parseInt(completedTasksToday.rows[0].count || '0'),
                tasksCreated: parseInt(createdTasksToday.rows[0].count || '0'),
                todayTraffic: todayTraffic.rows.length > 0 ? parseInt(todayTraffic.rows[0].value || '0') : 0
            },
            activities: {
                campaigns: {
                    count: parseInt(todayCampaigns.rows[0].count || '0'),
                    items: todayCampaigns.rows[0].items || []
                },
                tasks: {
                    count: parseInt(todayTasks.rows[0].count || '0'),
                    items: todayTasks.rows[0].items || []
                },
                content: {
                    count: parseInt(todayContent.rows[0].count || '0'),
                    items: todayContent.rows[0].items || []
                },
                projects: {
                    count: parseInt(todayProjects.rows[0].count || '0'),
                    items: todayProjects.rows[0].items || []
                },
                smmPosts: {
                    count: parseInt(todaySmmPosts.rows[0].count || '0'),
                    items: todaySmmPosts.rows[0].items || []
                },
                backlinks: {
                    count: parseInt(todayBacklinks.rows[0].count || '0')
                },
                submissions: {
                    count: parseInt(todaySubmissions.rows[0].count || '0'),
                    items: todaySubmissions.rows[0].items || []
                },
                qcRuns: {
                    count: parseInt(qcRunsToday.rows[0].count || '0'),
                    items: qcRunsToday.rows[0].items || []
                }
            },
            notifications: {
                count: parseInt(todayNotifications.rows[0].count || '0'),
                items: todayNotifications.rows[0].items || []
            },
            currentStatus: {
                activeCampaigns: parseInt(activeCampaigns.rows[0].count || '0'),
                pendingTasks: parseInt(pendingTasks.rows[0].count || '0'),
                toxicLinkAlerts: parseInt(toxicLinks.rows[0].count || '0')
            },
            metrics: {
                taskCompletionRate: createdTasksToday.rows[0].count > 0 
                    ? Math.round((parseInt(completedTasksToday.rows[0].count || '0') / parseInt(createdTasksToday.rows[0].count || '1')) * 100)
                    : 0,
                productivityScore: Math.min(100, 
                    (parseInt(completedTasksToday.rows[0].count || '0') * 10) +
                    (parseInt(todayContent.rows[0].count || '0') * 5) +
                    (parseInt(todayCampaigns.rows[0].count || '0') * 15)
                )
            }
        };

        res.status(200).json(report);
    } catch (error: any) {
        console.error('Today Report Error:', error);
        res.status(500).json({ 
            error: 'Failed to generate today\'s report', 
            details: error.message 
        });
    }
};

