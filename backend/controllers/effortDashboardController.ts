import { Request, Response } from 'express';
import { db } from '../config/db-sqlite';

// Effort Dashboard Controller
export const getEffortDashboard = async (req: Request, res: Response) => {
    try {
        const { department, timeRange, team } = req.query;

        // Enhanced Summary Cards Data with real-time tracking
        const summaryCards = {
            effortCompletion: {
                value: 89.2,
                target: 85.0,
                trend: 'up',
                change: '+2.8%',
                lastUpdated: new Date().toISOString(),
                status: 'excellent',
                weeklyData: [85.2, 86.8, 87.5, 88.1, 88.9, 89.2]
            },
            totalTasksCompleted: {
                value: 247,
                target: 240,
                trend: 'up',
                change: '+12 tasks',
                lastUpdated: new Date().toISOString(),
                status: 'on-track',
                breakdown: {
                    content: 89,
                    seo: 67,
                    web: 45,
                    smm: 46
                }
            },
            reworkPercentage: {
                value: 8.5,
                target: 10.0,
                trend: 'down',
                change: '-1.2%',
                lastUpdated: new Date().toISOString(),
                status: 'good',
                byDepartment: {
                    content: 6.2,
                    seo: 9.1,
                    web: 11.3,
                    smm: 7.8
                }
            },
            qcPassPercentage: {
                value: 91.5,
                target: 90.0,
                trend: 'up',
                change: '+1.8%',
                lastUpdated: new Date().toISOString(),
                status: 'excellent',
                stageBreakdown: {
                    stage1: 87.5,
                    stage2: 91.2,
                    stage3: 94.8
                }
            },
            tatCompliance: {
                value: 94.3,
                target: 95.0,
                trend: 'stable',
                change: '+0.1%',
                lastUpdated: new Date().toISOString(),
                status: 'on-track',
                averageDelay: '0.8 days',
                onTimeDeliveries: 233
            },
            workloadPrediction: {
                value: 'Balanced',
                utilizationPercentage: 78.5,
                trend: 'stable',
                nextWeekForecast: 'Optimal',
                lastUpdated: new Date().toISOString(),
                status: 'good',
                capacityDetails: {
                    total: 320,
                    utilized: 251,
                    available: 69
                }
            }
        };

        // Target vs Actual Data by Role
        const targetVsActual = [
            {
                role: 'Content Writer',
                targetWordCount: 50000,
                deliveredWordCount: 47500,
                targetBacklinks: 0,
                completedBacklinks: 0,
                targetPosts: 25,
                publishedPosts: 24,
                targetFixes: 15,
                completedFixes: 15,
                performance: 95.0
            },
            {
                role: 'SEO Specialist',
                targetWordCount: 0,
                deliveredWordCount: 0,
                targetBacklinks: 40,
                completedBacklinks: 38,
                targetPosts: 0,
                publishedPosts: 0,
                targetFixes: 30,
                completedFixes: 28,
                performance: 93.3
            },
            {
                role: 'Web Developer',
                targetWordCount: 0,
                deliveredWordCount: 0,
                targetBacklinks: 0,
                completedBacklinks: 0,
                targetPosts: 0,
                publishedPosts: 0,
                targetFixes: 45,
                completedFixes: 42,
                performance: 93.3
            },
            {
                role: 'SMM Specialist',
                targetWordCount: 5000,
                deliveredWordCount: 5200,
                targetBacklinks: 0,
                completedBacklinks: 0,
                targetPosts: 60,
                publishedPosts: 58,
                targetFixes: 10,
                completedFixes: 10,
                performance: 96.7
            }
        ];

        // Team Performance Heatmap Data
        const teamHeatmap = [
            {
                employee: 'Writer A',
                role: 'Content Writer',
                weeks: [
                    { week: 'Week 1', status: 'on-track', score: 95 },
                    { week: 'Week 2', status: 'on-track', score: 92 },
                    { week: 'Week 3', status: 'overworked', score: 110 },
                    { week: 'Week 4', status: 'on-track', score: 88 },
                    { week: 'Week 5', status: 'on-track', score: 94 },
                    { week: 'Week 6', status: 'on-track', score: 96 }
                ]
            },
            {
                employee: 'SEO B',
                role: 'SEO Specialist',
                weeks: [
                    { week: 'Week 1', status: 'on-track', score: 89 },
                    { week: 'Week 2', status: 'under-performance', score: 65 },
                    { week: 'Week 3', status: 'on-track', score: 91 },
                    { week: 'Week 4', status: 'on-track', score: 93 },
                    { week: 'Week 5', status: 'overworked', score: 105 },
                    { week: 'Week 6', status: 'on-track', score: 87 }
                ]
            },
            {
                employee: 'Dev C',
                role: 'Web Developer',
                weeks: [
                    { week: 'Week 1', status: 'on-track', score: 92 },
                    { week: 'Week 2', status: 'on-track', score: 88 },
                    { week: 'Week 3', status: 'on-track', score: 94 },
                    { week: 'Week 4', status: 'under-performance', score: 72 },
                    { week: 'Week 5', status: 'on-track', score: 89 },
                    { week: 'Week 6', status: 'on-track', score: 91 }
                ]
            }
        ];

        // QC Performance by Stage
        const qcPerformance = {
            stage1: {
                name: 'Initial Review',
                averageScore: 87.5,
                passRate: 82.3,
                trend: 'up'
            },
            stage2: {
                name: 'Technical Review',
                averageScore: 91.2,
                passRate: 88.7,
                trend: 'up'
            },
            stage3: {
                name: 'Final Approval',
                averageScore: 94.8,
                passRate: 95.2,
                trend: 'stable'
            }
        };

        // SLA Misses Log
        const slaMisses = [
            {
                role: 'Content Writer',
                delays: 3,
                reasons: ['Client feedback delay', 'Research complexity', 'Revision requests']
            },
            {
                role: 'SEO Specialist',
                delays: 1,
                reasons: ['Tool downtime']
            },
            {
                role: 'Web Developer',
                delays: 4,
                reasons: ['Server issues', 'Complex bug fixes', 'Third-party API delays', 'Testing environment issues']
            },
            {
                role: 'SMM Specialist',
                delays: 0,
                reasons: []
            }
        ];

        // Workload Trends
        const workloadTrends = {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
            datasets: [
                {
                    label: 'Planned Capacity',
                    data: [100, 100, 100, 100, 100, 100]
                },
                {
                    label: 'Actual Utilization',
                    data: [95, 88, 102, 91, 97, 89]
                },
                {
                    label: 'Efficiency Score',
                    data: [92, 89, 85, 94, 91, 93]
                }
            ]
        };

        res.json({
            success: true,
            data: {
                summaryCards,
                targetVsActual,
                teamHeatmap,
                qcPerformance,
                slaMisses,
                workloadTrends,
                filters: {
                    department: department || 'all',
                    timeRange: timeRange || 'monthly',
                    team: team || 'all'
                }
            }
        });
    } catch (error) {
        console.error('Error fetching effort dashboard:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const getWorkloadPrediction = async (req: Request, res: Response) => {
    try {
        const prediction = {
            nextWeekCapacity: 87.5,
            predictedOverload: ['Web Developer', 'SEO Specialist'],
            recommendedActions: [
                'Redistribute 2 tasks from Dev C to Dev D',
                'Delay non-critical SEO audits by 3 days',
                'Consider hiring temporary content writer'
            ]
        };

        res.json({ success: true, data: prediction });
    } catch (error) {
        console.error('Error fetching workload prediction:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

