import { Request, Response } from 'express';
import { db } from '../config/db';

// Employee Scorecard Controller
export const getEmployeeScorecard = async (req: Request, res: Response) => {
    try {
        const { employeeId, month, quarter } = req.query;

        // Employee Info
        const employeeInfo = {
            id: employeeId || 1,
            name: 'Sarah Johnson',
            role: 'Senior Content Writer',
            department: 'Content Team',
            avatar: '/avatars/sarah.jpg',
            joinDate: '2023-03-15',
            currentPeriod: month || 'December 2024'
        };

        // Summary Scores with enhanced real-time data
        const summaryScores = {
            effortScore: {
                value: 94.2,
                target: 85.0,
                trend: 'up',
                change: '+3.8%',
                lastUpdated: new Date().toISOString(),
                status: 'excellent',
                weeklyData: [89.5, 91.2, 92.8, 93.5, 94.2]
            },
            performanceScore: {
                value: 87.8,
                target: 80.0,
                trend: 'up',
                change: '+2.1%',
                lastUpdated: new Date().toISOString(),
                status: 'good',
                weeklyData: [84.2, 85.8, 86.9, 87.1, 87.8]
            },
            qcScore: {
                value: 91.5,
                target: 90.0,
                trend: 'up',
                change: '+1.8%',
                lastUpdated: new Date().toISOString(),
                status: 'excellent',
                weeklyData: [88.9, 89.8, 90.5, 91.0, 91.5]
            },
            punctualityScore: {
                value: 96.0,
                target: 95.0,
                trend: 'stable',
                change: '+0.2%',
                lastUpdated: new Date().toISOString(),
                status: 'excellent',
                weeklyData: [95.8, 95.9, 96.1, 95.8, 96.0]
            },
            compositeScore: {
                value: 92.4,
                target: 85.0,
                trend: 'up',
                change: '+3.3%',
                lastUpdated: new Date().toISOString(),
                status: 'excellent',
                previousScore: 89.1,
                monthlyGrowth: '+5.1%',
                ranking: 1,
                totalEmployees: 8
            }
        };

        // KPI Contributions with enhanced tracking
        const kpiContributions = {
            keywordsImproved: {
                value: 45,
                target: 40,
                trend: 'up',
                change: '+12.5%',
                lastUpdated: new Date().toISOString(),
                monthlyProgress: [38, 42, 45]
            },
            contentPublished: {
                value: 28,
                target: 25,
                trend: 'up',
                change: '+12.0%',
                lastUpdated: new Date().toISOString(),
                monthlyProgress: [22, 25, 28],
                wordCount: 28500
            },
            backlinksBuilt: {
                value: 0,
                target: 0,
                trend: 'stable',
                change: '0%',
                lastUpdated: new Date().toISOString(),
                note: 'Not applicable for content writer role'
            },
            errorsFixed: {
                value: 12,
                target: 15,
                trend: 'down',
                change: '-20.0%',
                lastUpdated: new Date().toISOString(),
                monthlyProgress: [18, 15, 12],
                note: 'Fewer errors due to improved quality'
            },
            engagementMetricsImproved: {
                value: 8,
                target: 10,
                trend: 'down',
                change: '-20.0%',
                lastUpdated: new Date().toISOString(),
                monthlyProgress: [6, 10, 8]
            },
            smmPostsCreated: {
                value: 15,
                target: 12,
                trend: 'up',
                change: '+25.0%',
                lastUpdated: new Date().toISOString(),
                monthlyProgress: [11, 12, 15],
                engagementRate: 4.2
            },
            totalContribution: {
                value: 108,
                target: 102,
                trend: 'up',
                change: '+5.9%',
                lastUpdated: new Date().toISOString(),
                efficiency: 105.9
            }
        };

        // Contribution Chart Data
        const contributionChart = {
            labels: ['Keywords', 'Content', 'Backlinks', 'Fixes', 'Engagement', 'SMM'],
            datasets: [
                {
                    label: 'This Month',
                    data: [45, 28, 0, 12, 8, 15]
                },
                {
                    label: 'Target',
                    data: [40, 25, 0, 15, 10, 12]
                },
                {
                    label: 'Previous Month',
                    data: [38, 22, 0, 18, 6, 11]
                }
            ]
        };

        // QC History
        const qcHistory = [
            {
                id: 1,
                taskName: 'Blog Post: AI in Healthcare',
                submissionDate: '2024-12-10',
                stage1Score: 92,
                stage2Score: 88,
                stage3Score: 95,
                finalScore: 91.7,
                status: 'passed',
                feedback: 'Excellent research and structure'
            },
            {
                id: 2,
                taskName: 'Service Page: Nutraceutical Consulting',
                submissionDate: '2024-12-08',
                stage1Score: 85,
                stage2Score: 90,
                stage3Score: 92,
                finalScore: 89.0,
                status: 'passed',
                feedback: 'Good content, minor SEO improvements needed'
            },
            {
                id: 3,
                taskName: 'Case Study: Pharma Client Success',
                submissionDate: '2024-12-05',
                stage1Score: 95,
                stage2Score: 93,
                stage3Score: 97,
                finalScore: 95.0,
                status: 'passed',
                feedback: 'Outstanding work, exceeds expectations'
            },
            {
                id: 4,
                taskName: 'Landing Page: Medical Writing Services',
                submissionDate: '2024-12-03',
                stage1Score: 78,
                stage2Score: 82,
                stage3Score: 85,
                finalScore: 81.7,
                status: 'rework',
                feedback: 'Needs better keyword integration'
            },
            {
                id: 5,
                taskName: 'Email Campaign: Newsletter Dec',
                submissionDate: '2024-12-01',
                stage1Score: 90,
                stage2Score: 88,
                stage3Score: 91,
                finalScore: 89.7,
                status: 'passed',
                feedback: 'Good engagement potential'
            }
        ];

        // Attendance & Discipline Metrics
        const attendanceMetrics = {
            taskDelays: 2,
            reworkCount: 1,
            slaCompliance: 96.4,
            onTimeDelivery: 26, // out of 28 tasks
            averageDeliveryTime: '2.3 days',
            punctualityRating: 'Excellent',
            disciplinaryActions: 0
        };

        // AI Feedback
        const aiFeedback = {
            summary: "Sarah handled 28,000 words with 96% QC pass rate this month. Her content quality has improved significantly, with particularly strong performance in technical writing and research depth.",
            strengths: [
                "Consistently high-quality content output",
                "Excellent research and fact-checking",
                "Strong SEO optimization skills",
                "Reliable delivery timelines"
            ],
            improvements: [
                "Focus on keyword density optimization",
                "Enhance meta descriptions creativity",
                "Consider advanced content formatting techniques"
            ],
            recommendations: [
                "Recommend upgrading target word count for next cycle",
                "Consider mentoring junior writers",
                "Eligible for advanced SEO writing certification"
            ],
            nextCycleTarget: "Increase monthly target to 32,000 words based on consistent performance"
        };

        // Performance Trends (last 6 months)
        const performanceTrends = {
            labels: ['July', 'August', 'September', 'October', 'November', 'December'],
            datasets: [
                {
                    label: 'Composite Score',
                    data: [85.2, 87.1, 88.9, 89.1, 90.8, 92.4]
                },
                {
                    label: 'QC Score',
                    data: [88.5, 89.2, 90.1, 89.8, 91.0, 91.5]
                },
                {
                    label: 'Effort Score',
                    data: [82.1, 85.5, 87.8, 88.9, 92.1, 94.2]
                }
            ]
        };

        res.json({
            success: true,
            data: {
                employeeInfo,
                summaryScores,
                kpiContributions,
                contributionChart,
                qcHistory,
                attendanceMetrics,
                aiFeedback,
                performanceTrends
            }
        });
    } catch (error) {
        console.error('Error fetching employee scorecard:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const getEmployeeList = async (req: Request, res: Response) => {
    try {
        const employees = [
            { id: 1, name: 'Sarah Johnson', role: 'Senior Content Writer', department: 'Content Team', compositeScore: 92.4 },
            { id: 2, name: 'Mike Chen', role: 'SEO Specialist', department: 'SEO Team', compositeScore: 89.7 },
            { id: 3, name: 'Lisa Rodriguez', role: 'Web Developer', department: 'Tech Team', compositeScore: 91.2 },
            { id: 4, name: 'David Kim', role: 'SMM Specialist', department: 'Marketing Team', compositeScore: 88.9 },
            { id: 5, name: 'Emma Wilson', role: 'Content Writer', department: 'Content Team', compositeScore: 85.6 }
        ];

        res.json({ success: true, data: employees });
    } catch (error) {
        console.error('Error fetching employee list:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

