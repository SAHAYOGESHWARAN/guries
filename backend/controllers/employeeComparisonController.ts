import { Request, Response } from 'express';
import { db } from '../config/db-sqlite';

// Employee Comparison Controller
export const getEmployeeComparison = async (req: Request, res: Response) => {
    try {
        const { department, timeRange, sortBy } = req.query;

        // Best Performer of the Month with enhanced data
        const bestPerformer = {
            id: 1,
            name: 'Sarah Johnson',
            role: 'Senior Content Writer',
            department: 'Content Team',
            compositeScore: 94.2,
            avatar: '/avatars/sarah.jpg',
            achievements: [
                'Highest QC Score (96.5%)',
                'Zero SLA Misses',
                'Exceeded Word Count Target by 15%',
                'Mentored 2 Junior Writers',
                'Implemented new content template system',
                'Achieved 98% client satisfaction rating'
            ],
            improvement: '+5.1% from last month',
            streak: 3, // months as top performer
            totalRewards: '$600',
            lastUpdated: new Date().toISOString(),
            performanceMetrics: {
                consistency: 96.8,
                innovation: 89.5,
                collaboration: 91.2,
                leadership: 88.7
            },
            monthlyTrend: [89.1, 91.5, 92.8, 94.2]
        };

        // Employee Rankings with enhanced metrics
        const employeeRankings = [
            {
                rank: 1,
                employeeId: 1,
                name: 'Sarah Johnson',
                role: 'Senior Content Writer',
                department: 'Content Team',
                compositeScore: 94.2,
                qcScore: 96.5,
                effortScore: 92.8,
                performanceScore: 93.4,
                punctualityScore: 98.0,
                trend: 'up',
                change: '+5.1%',
                lastUpdated: new Date().toISOString(),
                riskLevel: 'low',
                monthsInTop3: 6,
                totalTasks: 28,
                completedTasks: 28,
                averageRating: 4.8,
                clientFeedback: 'excellent'
            },
            {
                rank: 2,
                employeeId: 3,
                name: 'Lisa Rodriguez',
                role: 'Web Developer',
                department: 'Tech Team',
                compositeScore: 91.7,
                qcScore: 89.2,
                effortScore: 94.8,
                performanceScore: 91.1,
                trend: 'up',
                change: '+2.3%'
            },
            {
                rank: 3,
                employeeId: 2,
                name: 'Mike Chen',
                role: 'SEO Specialist',
                department: 'SEO Team',
                compositeScore: 89.4,
                qcScore: 91.1,
                effortScore: 87.2,
                performanceScore: 90.0,
                trend: 'stable',
                change: '+0.8%'
            },
            {
                rank: 4,
                employeeId: 4,
                name: 'David Kim',
                role: 'SMM Specialist',
                department: 'Marketing Team',
                compositeScore: 88.9,
                qcScore: 85.7,
                effortScore: 91.8,
                performanceScore: 89.2,
                trend: 'up',
                change: '+3.2%'
            },
            {
                rank: 5,
                employeeId: 5,
                name: 'Emma Wilson',
                role: 'Content Writer',
                department: 'Content Team',
                compositeScore: 85.6,
                qcScore: 83.4,
                effortScore: 88.1,
                performanceScore: 85.3,
                trend: 'down',
                change: '-1.5%'
            },
            {
                rank: 6,
                employeeId: 6,
                name: 'Alex Thompson',
                role: 'Junior SEO',
                department: 'SEO Team',
                compositeScore: 82.3,
                qcScore: 79.8,
                effortScore: 85.2,
                performanceScore: 81.9,
                trend: 'up',
                change: '+4.7%'
            },
            {
                rank: 7,
                employeeId: 7,
                name: 'Maria Garcia',
                role: 'Graphic Designer',
                department: 'Creative Team',
                compositeScore: 80.1,
                qcScore: 82.5,
                effortScore: 78.9,
                performanceScore: 79.0,
                trend: 'stable',
                change: '+0.2%'
            },
            {
                rank: 8,
                employeeId: 8,
                name: 'James Wilson',
                role: 'Junior Developer',
                department: 'Tech Team',
                compositeScore: 76.8,
                qcScore: 74.2,
                effortScore: 79.1,
                performanceScore: 77.1,
                trend: 'down',
                change: '-2.8%'
            }
        ];

        // Performance Comparison Matrix
        const comparisonMatrix = {
            employees: employeeRankings.map(emp => emp.name),
            metrics: [
                {
                    name: 'Composite Score',
                    values: employeeRankings.map(emp => emp.compositeScore)
                },
                {
                    name: 'QC Score',
                    values: employeeRankings.map(emp => emp.qcScore)
                },
                {
                    name: 'Effort Score',
                    values: employeeRankings.map(emp => emp.effortScore)
                },
                {
                    name: 'Performance Score',
                    values: employeeRankings.map(emp => emp.performanceScore)
                }
            ]
        };

        // Weekly Performance Heatmap
        const weeklyHeatmap = [
            {
                employee: 'Sarah Johnson',
                weeks: [
                    { week: 'Week 1', score: 92.5, status: 'excellent' },
                    { week: 'Week 2', score: 94.1, status: 'excellent' },
                    { week: 'Week 3', score: 93.8, status: 'excellent' },
                    { week: 'Week 4', score: 95.2, status: 'excellent' }
                ]
            },
            {
                employee: 'Lisa Rodriguez',
                weeks: [
                    { week: 'Week 1', score: 89.2, status: 'good' },
                    { week: 'Week 2', score: 91.7, status: 'excellent' },
                    { week: 'Week 3', score: 90.8, status: 'good' },
                    { week: 'Week 4', score: 92.1, status: 'excellent' }
                ]
            },
            {
                employee: 'Mike Chen',
                weeks: [
                    { week: 'Week 1', score: 87.5, status: 'good' },
                    { week: 'Week 2', score: 89.8, status: 'good' },
                    { week: 'Week 3', score: 88.9, status: 'good' },
                    { week: 'Week 4', score: 91.2, status: 'excellent' }
                ]
            },
            {
                employee: 'David Kim',
                weeks: [
                    { week: 'Week 1', score: 86.3, status: 'good' },
                    { week: 'Week 2', score: 88.7, status: 'good' },
                    { week: 'Week 3', score: 89.5, status: 'good' },
                    { week: 'Week 4', score: 90.1, status: 'good' }
                ]
            },
            {
                employee: 'Emma Wilson',
                weeks: [
                    { week: 'Week 1', score: 84.2, status: 'average' },
                    { week: 'Week 2', score: 85.8, status: 'good' },
                    { week: 'Week 3', score: 83.9, status: 'average' },
                    { week: 'Week 4', score: 87.1, status: 'good' }
                ]
            }
        ];

        // Radar Chart Data for Top 5 Performers
        const radarChartData = {
            labels: ['QC Score', 'Effort Score', 'Performance Score', 'Punctuality', 'Innovation', 'Collaboration'],
            datasets: [
                {
                    label: 'Sarah Johnson',
                    data: [96.5, 92.8, 93.4, 98.0, 89.5, 91.2]
                },
                {
                    label: 'Lisa Rodriguez',
                    data: [89.2, 94.8, 91.1, 95.5, 92.1, 88.7]
                },
                {
                    label: 'Mike Chen',
                    data: [91.1, 87.2, 90.0, 92.3, 85.8, 89.9]
                },
                {
                    label: 'David Kim',
                    data: [85.7, 91.8, 89.2, 90.1, 88.4, 92.5]
                },
                {
                    label: 'Emma Wilson',
                    data: [83.4, 88.1, 85.3, 87.9, 82.1, 86.3]
                }
            ]
        };

        // Underperforming Employees Alert
        const underperformingEmployees = employeeRankings
            .filter(emp => emp.compositeScore < 80 || emp.trend === 'down')
            .map(emp => ({
                ...emp,
                issues: [
                    emp.compositeScore < 80 ? 'Below performance threshold' : null,
                    emp.trend === 'down' ? 'Declining performance trend' : null,
                    emp.qcScore < 80 ? 'Low QC scores' : null,
                    emp.effortScore < 80 ? 'Effort concerns' : null
                ].filter(Boolean),
                recommendedActions: [
                    'Schedule performance review',
                    'Provide additional training',
                    'Assign mentor',
                    'Review workload distribution'
                ]
            }));

        // Department Performance Summary
        const departmentSummary = [
            {
                department: 'Content Team',
                averageScore: 89.9,
                employeeCount: 2,
                topPerformer: 'Sarah Johnson',
                trend: 'up'
            },
            {
                department: 'Tech Team',
                averageScore: 84.3,
                employeeCount: 2,
                topPerformer: 'Lisa Rodriguez',
                trend: 'stable'
            },
            {
                department: 'SEO Team',
                averageScore: 85.9,
                employeeCount: 2,
                topPerformer: 'Mike Chen',
                trend: 'up'
            },
            {
                department: 'Marketing Team',
                averageScore: 88.9,
                employeeCount: 1,
                topPerformer: 'David Kim',
                trend: 'up'
            }
        ];

        res.json({
            success: true,
            data: {
                bestPerformer,
                employeeRankings,
                comparisonMatrix,
                weeklyHeatmap,
                radarChartData,
                underperformingEmployees,
                departmentSummary,
                filters: {
                    department: department || 'all',
                    timeRange: timeRange || 'monthly',
                    sortBy: sortBy || 'compositeScore'
                }
            }
        });
    } catch (error) {
        console.error('Error fetching employee comparison:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const getTeamPerformanceStats = async (req: Request, res: Response) => {
    try {
        const stats = {
            totalEmployees: 8,
            averageScore: 86.2,
            topPerformers: 3, // Above 90%
            needsImprovement: 2, // Below 80%
            monthlyGrowth: '+2.8%'
        };

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error fetching team performance stats:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};