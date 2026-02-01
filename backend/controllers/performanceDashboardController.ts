import { Request, Response } from 'express';
import { pool } from "../config/db";

// Performance Dashboard Controller
export const getPerformanceDashboard = async (req: Request, res: Response) => {
    try {
        const { brand, department, timeRange, kpiCategory, campaign, contributor } = req.query;

        // Real-time Performance Summary Widgets with timestamps
        const summaryWidgets = {
            okrAchievement: {
                value: 87.5,
                target: 90.0,
                trend: 'up',
                change: '+2.3%',
                lastUpdated: new Date().toISOString(),
                status: 'on-track'
            },
            performanceScore: {
                value: 82.3,
                target: 85.0,
                trend: 'up',
                change: '+1.8%',
                lastUpdated: new Date().toISOString(),
                status: 'warning'
            },
            trafficGrowth: {
                value: 15.2,
                target: 12.0,
                trend: 'up',
                change: '+3.2%',
                lastUpdated: new Date().toISOString(),
                status: 'excellent'
            },
            rankingImprovement: {
                value: 23,
                target: 20,
                trend: 'up',
                change: '+15%',
                lastUpdated: new Date().toISOString(),
                status: 'excellent'
            },
            engagementScore: {
                value: 78.9,
                target: 80.0,
                trend: 'down',
                change: '-1.1%',
                lastUpdated: new Date().toISOString(),
                status: 'warning'
            },
            conversionScore: {
                value: 91.2,
                target: 88.0,
                trend: 'up',
                change: '+3.6%',
                lastUpdated: new Date().toISOString(),
                status: 'excellent'
            }
        };

        // Enhanced KPI Analytics Data with real-time fields
        const kpiAnalytics = [
            {
                id: 1,
                kpiName: 'Organic Sessions',
                metricType: 'Traffic',
                brand: 'Tutors India',
                department: 'SEO Team',
                baseline: 45000,
                current: 52300,
                target: 55000,
                delta: 7300,
                percentAchieved: 95.1,
                goldStandard: 60000,
                competitorAvg: 48000,
                trend: 'up',
                trendPercentage: '+16.2%',
                status: 'on-track',
                lastUpdated: new Date().toISOString(),
                dataSource: 'Google Analytics 4',
                owner: 'Mike Chen',
                priority: 'high',
                sparklineData: [45000, 46200, 47800, 49100, 50500, 52300],
                alerts: [],
                unit: 'sessions',
                frequency: 'daily'
            },
            {
                id: 2,
                kpiName: 'Keywords Top 10',
                metricType: 'Ranking',
                brand: 'Tutors India',
                department: 'SEO Team',
                baseline: 125,
                current: 148,
                target: 160,
                delta: 23,
                percentAchieved: 92.5,
                goldStandard: 180,
                competitorAvg: 135,
                trend: 'up',
                trendPercentage: '+18.4%',
                status: 'on-track',
                lastUpdated: new Date().toISOString(),
                dataSource: 'SEMrush',
                owner: 'Mike Chen',
                priority: 'high',
                sparklineData: [125, 128, 135, 140, 145, 148],
                alerts: [],
                unit: 'keywords',
                frequency: 'weekly'
            },
            {
                id: 3,
                kpiName: 'Bounce Rate',
                metricType: 'Engagement',
                brand: 'FRL',
                department: 'Content Team',
                baseline: 65.2,
                current: 58.7,
                target: 55.0,
                delta: -6.5,
                percentAchieved: 89.8,
                goldStandard: 45.0,
                competitorAvg: 62.3,
                trend: 'down',
                trendPercentage: '-10.0%',
                status: 'warning',
                lastUpdated: new Date().toISOString(),
                dataSource: 'Google Analytics 4',
                owner: 'Sarah Johnson',
                priority: 'medium',
                sparklineData: [65.2, 63.8, 61.5, 60.2, 59.1, 58.7],
                alerts: ['Approaching target but needs improvement'],
                unit: 'percentage',
                frequency: 'daily'
            },
            {
                id: 4,
                kpiName: 'Conversion Rate',
                metricType: 'Conversion',
                brand: 'Pubrica',
                department: 'Marketing Team',
                baseline: 2.1,
                current: 2.8,
                target: 3.2,
                delta: 0.7,
                percentAchieved: 87.5,
                goldStandard: 4.5,
                competitorAvg: 2.4,
                trend: 'up',
                trendPercentage: '+33.3%',
                status: 'on-track',
                lastUpdated: new Date().toISOString(),
                dataSource: 'Google Analytics 4',
                owner: 'David Kim',
                priority: 'high',
                sparklineData: [2.1, 2.3, 2.5, 2.6, 2.7, 2.8],
                alerts: [],
                unit: 'percentage',
                frequency: 'daily'
            },
            {
                id: 5,
                kpiName: 'Page Load Time',
                metricType: 'Technical',
                brand: 'Statswork',
                department: 'Web Team',
                baseline: 3.2,
                current: 2.1,
                target: 1.8,
                delta: -1.1,
                percentAchieved: 91.7,
                goldStandard: 1.5,
                competitorAvg: 2.8,
                trend: 'down',
                trendPercentage: '-34.4%',
                status: 'on-track',
                lastUpdated: new Date().toISOString(),
                dataSource: 'Google PageSpeed Insights',
                owner: 'Lisa Rodriguez',
                priority: 'high',
                sparklineData: [3.2, 2.9, 2.6, 2.4, 2.2, 2.1],
                alerts: [],
                unit: 'seconds',
                frequency: 'daily'
            },
            {
                id: 6,
                kpiName: 'Backlinks Earned',
                metricType: 'Link Building',
                brand: 'All Brands',
                department: 'SEO Team',
                baseline: 45,
                current: 67,
                target: 75,
                delta: 22,
                percentAchieved: 89.3,
                goldStandard: 100,
                competitorAvg: 52,
                trend: 'up',
                trendPercentage: '+48.9%',
                status: 'on-track',
                lastUpdated: new Date().toISOString(),
                dataSource: 'Ahrefs',
                owner: 'Mike Chen',
                priority: 'high',
                sparklineData: [45, 48, 52, 58, 62, 67],
                alerts: [],
                unit: 'links',
                frequency: 'weekly'
            },
            {
                id: 7,
                kpiName: 'Social Engagement Rate',
                metricType: 'Social Media',
                brand: 'PepCreations',
                department: 'SMM Team',
                baseline: 3.2,
                current: 4.8,
                target: 5.5,
                delta: 1.6,
                percentAchieved: 87.3,
                goldStandard: 7.0,
                competitorAvg: 4.1,
                trend: 'up',
                trendPercentage: '+50.0%',
                status: 'on-track',
                lastUpdated: new Date().toISOString(),
                dataSource: 'Social Media Analytics',
                owner: 'David Kim',
                priority: 'medium',
                sparklineData: [3.2, 3.6, 4.0, 4.3, 4.5, 4.8],
                alerts: [],
                unit: 'percentage',
                frequency: 'daily'
            },
            {
                id: 8,
                kpiName: 'Email Open Rate',
                metricType: 'Email Marketing',
                brand: 'Tutors India',
                department: 'Marketing Team',
                baseline: 18.5,
                current: 24.2,
                target: 28.0,
                delta: 5.7,
                percentAchieved: 86.4,
                goldStandard: 35.0,
                competitorAvg: 21.3,
                trend: 'up',
                trendPercentage: '+30.8%',
                status: 'on-track',
                lastUpdated: new Date().toISOString(),
                dataSource: 'Email Platform',
                owner: 'Sarah Johnson',
                priority: 'medium',
                sparklineData: [18.5, 19.8, 21.2, 22.5, 23.1, 24.2],
                alerts: [],
                unit: 'percentage',
                frequency: 'weekly'
            }
        ];

        // Enhanced Project Impact Data
        const projectImpact = [
            {
                id: 1,
                project: 'SEO Cleanup Jan 2025',
                description: 'Comprehensive technical SEO audit and cleanup',
                kpiMoved: 'Bounce Rate',
                direction: 'Improved',
                beforeValue: 65.2,
                afterValue: 58.7,
                liftPercent: 15.2,
                responsibleTeam: 'SEO Team',
                teamLead: 'Mike Chen',
                status: 'completed',
                startDate: '2025-01-01',
                endDate: '2025-01-15',
                budget: '?,000',
                roi: '340%',
                impactScore: 8.5,
                brands: ['FRL', 'Tutors India'],
                tags: ['technical-seo', 'performance', 'user-experience']
            },
            {
                id: 2,
                project: 'Content Optimization Q4',
                description: 'Content refresh and optimization for better engagement',
                kpiMoved: 'Organic Sessions',
                direction: 'Improved',
                beforeValue: 45000,
                afterValue: 52300,
                liftPercent: 22.8,
                responsibleTeam: 'Content Team',
                teamLead: 'Sarah Johnson',
                status: 'completed',
                startDate: '2024-10-01',
                endDate: '2024-12-31',
                budget: '?,000',
                roi: '285%',
                impactScore: 9.2,
                brands: ['Tutors India', 'Pubrica'],
                tags: ['content-optimization', 'seo', 'traffic-growth']
            },
            {
                id: 3,
                project: 'Technical SEO Audit',
                description: 'Site-wide technical performance improvements',
                kpiMoved: 'Page Load Time',
                direction: 'Improved',
                beforeValue: 3.2,
                afterValue: 2.1,
                liftPercent: 34.4,
                responsibleTeam: 'Web Dev Team',
                teamLead: 'Lisa Rodriguez',
                status: 'in-progress',
                startDate: '2024-12-01',
                endDate: '2025-01-31',
                budget: '?,000',
                roi: 'TBD',
                impactScore: 7.8,
                brands: ['Statswork', 'PepCreations'],
                tags: ['technical-seo', 'performance', 'core-web-vitals']
            },
            {
                id: 4,
                project: 'Social Media Campaign Dec',
                description: 'Holiday season social media engagement campaign',
                kpiMoved: 'Social Engagement Rate',
                direction: 'Improved',
                beforeValue: 3.2,
                afterValue: 4.8,
                liftPercent: 50.0,
                responsibleTeam: 'SMM Team',
                teamLead: 'David Kim',
                status: 'completed',
                startDate: '2024-12-01',
                endDate: '2024-12-31',
                budget: '?,500',
                roi: '420%',
                impactScore: 8.9,
                brands: ['PepCreations'],
                tags: ['social-media', 'engagement', 'holiday-campaign']
            },
            {
                id: 5,
                project: 'Email Marketing Optimization',
                description: 'A/B testing and optimization of email campaigns',
                kpiMoved: 'Email Open Rate',
                direction: 'Improved',
                beforeValue: 18.5,
                afterValue: 24.2,
                liftPercent: 30.8,
                responsibleTeam: 'Marketing Team',
                teamLead: 'Sarah Johnson',
                status: 'completed',
                startDate: '2024-11-01',
                endDate: '2024-12-15',
                budget: '?,000',
                roi: '380%',
                impactScore: 7.5,
                brands: ['Tutors India'],
                tags: ['email-marketing', 'conversion-optimization', 'a-b-testing']
            }
        ];

        // Enhanced Real-time Alerts & Insights
        const alerts = [
            {
                id: 1,
                type: 'warning',
                category: 'Performance',
                title: 'Bounce Rate Alert',
                message: 'FRL bounce rate is 6.7% above target (58.7% vs 55.0%). Needs immediate attention.',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                severity: 'medium',
                brand: 'FRL',
                kpi: 'Bounce Rate',
                currentValue: 58.7,
                targetValue: 55.0,
                owner: 'Sarah Johnson',
                actionRequired: true,
                suggestedActions: [
                    'Review page content quality',
                    'Optimize page load speed',
                    'Improve user experience'
                ],
                status: 'open'
            },
            {
                id: 2,
                type: 'info',
                category: 'Benchmark',
                title: 'Gold Standard Gap',
                message: 'Tutors India organic sessions are 12.8% below gold standard (52,300 vs 60,000).',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
                severity: 'low',
                brand: 'Tutors India',
                kpi: 'Organic Sessions',
                currentValue: 52300,
                goldStandardValue: 60000,
                owner: 'Mike Chen',
                actionRequired: false,
                suggestedActions: [
                    'Increase content production',
                    'Improve keyword targeting',
                    'Enhance link building efforts'
                ],
                status: 'acknowledged'
            },
            {
                id: 3,
                type: 'error',
                category: 'Competitive',
                title: 'Competitor Threat',
                message: 'Competitor Pubrica gained 30 new high-quality backlinks in the last 7 days—immediate risk to rankings!',
                timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
                severity: 'high',
                brand: 'All Brands',
                kpi: 'Backlinks',
                competitorGain: 30,
                owner: 'Mike Chen',
                actionRequired: true,
                suggestedActions: [
                    'Accelerate link building campaign',
                    'Analyze competitor backlink sources',
                    'Develop counter-strategy',
                    'Monitor ranking changes closely'
                ],
                status: 'open'
            },
            {
                id: 4,
                type: 'success',
                category: 'Achievement',
                title: 'Target Exceeded',
                message: 'PepCreations social engagement rate exceeded target by 14.5% (4.8% vs 4.2%)!',
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
                severity: 'low',
                brand: 'PepCreations',
                kpi: 'Social Engagement Rate',
                currentValue: 4.8,
                targetValue: 4.2,
                owner: 'David Kim',
                actionRequired: false,
                suggestedActions: [
                    'Document successful strategies',
                    'Apply learnings to other brands',
                    'Consider increasing targets'
                ],
                status: 'closed'
            },
            {
                id: 5,
                type: 'warning',
                category: 'Technical',
                title: 'Performance Degradation',
                message: 'Statswork page load time increased by 0.3s in the last 24 hours (2.1s to 2.4s).',
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
                severity: 'medium',
                brand: 'Statswork',
                kpi: 'Page Load Time',
                currentValue: 2.4,
                previousValue: 2.1,
                owner: 'Lisa Rodriguez',
                actionRequired: true,
                suggestedActions: [
                    'Check server performance',
                    'Optimize images and assets',
                    'Review recent code changes'
                ],
                status: 'in-progress'
            }
        ];

        // Enhanced Real-time Chart Data
        const chartData = {
            trafficTrend: {
                labels: ['Dec 5', 'Dec 6', 'Dec 7', 'Dec 8', 'Dec 9', 'Dec 10', 'Dec 11'],
                datasets: [
                    {
                        label: 'Actual Traffic',
                        data: [45000, 47200, 49800, 51200, 52100, 52300, 52800],
                        color: '#10B981',
                        trend: 'up'
                    },
                    {
                        label: 'Target',
                        data: [46000, 48000, 50000, 52000, 54000, 55000, 56000],
                        color: '#3B82F6',
                        trend: 'up'
                    },
                    {
                        label: 'Gold Standard',
                        data: [60000, 60000, 60000, 60000, 60000, 60000, 60000],
                        color: '#F59E0B',
                        trend: 'stable'
                    },
                    {
                        label: 'Competitor Average',
                        data: [48000, 48200, 48500, 48800, 49000, 49200, 49500],
                        color: '#EF4444',
                        trend: 'up'
                    }
                ],
                lastUpdated: new Date().toISOString()
            },
            keywordRanking: {
                labels: ['Dec 5', 'Dec 6', 'Dec 7', 'Dec 8', 'Dec 9', 'Dec 10', 'Dec 11'],
                datasets: [
                    {
                        label: 'Top 10 Keywords',
                        data: [125, 132, 138, 142, 145, 148, 151],
                        color: '#8B5CF6'
                    },
                    {
                        label: 'Top 3 Keywords',
                        data: [15, 16, 18, 19, 21, 23, 24],
                        color: '#10B981'
                    }
                ],
                lastUpdated: new Date().toISOString()
            },
            engagementTrend: {
                labels: ['Dec 5', 'Dec 6', 'Dec 7', 'Dec 8', 'Dec 9', 'Dec 10', 'Dec 11'],
                datasets: [
                    {
                        label: 'CTR (%)',
                        data: [2.1, 2.3, 2.5, 2.7, 2.8, 2.9, 3.0],
                        color: '#10B981'
                    },
                    {
                        label: 'Bounce Rate (%)',
                        data: [65.2, 63.8, 61.5, 60.2, 59.1, 58.7, 58.2],
                        color: '#EF4444'
                    },
                    {
                        label: 'Time on Page (sec)',
                        data: [145, 152, 158, 162, 168, 172, 175],
                        color: '#3B82F6'
                    }
                ],
                lastUpdated: new Date().toISOString()
            },
            conversionFunnel: {
                stages: [
                    { name: 'Visitors', value: 52300, percentage: 100 },
                    { name: 'Page Views', value: 89200, percentage: 170.6 },
                    { name: 'Engaged Users', value: 21600, percentage: 41.3 },
                    { name: 'Leads', value: 3140, percentage: 6.0 },
                    { name: 'Conversions', value: 1464, percentage: 2.8 }
                ],
                conversionRate: 2.8,
                lastUpdated: new Date().toISOString()
            },
            backlinkGrowth: {
                labels: ['Dec 5', 'Dec 6', 'Dec 7', 'Dec 8', 'Dec 9', 'Dec 10', 'Dec 11'],
                datasets: [
                    {
                        label: 'New Backlinks',
                        data: [2, 3, 1, 4, 2, 3, 2],
                        color: '#10B981'
                    },
                    {
                        label: 'Lost Backlinks',
                        data: [1, 0, 2, 1, 0, 1, 0],
                        color: '#EF4444'
                    },
                    {
                        label: 'Net Growth',
                        data: [1, 3, -1, 3, 2, 2, 2],
                        color: '#3B82F6'
                    }
                ],
                totalBacklinks: 1247,
                lastUpdated: new Date().toISOString()
            },
            technicalScores: {
                labels: ['Dec 5', 'Dec 6', 'Dec 7', 'Dec 8', 'Dec 9', 'Dec 10', 'Dec 11'],
                datasets: [
                    {
                        label: 'LCP (sec)',
                        data: [2.1, 2.0, 1.9, 1.8, 1.9, 2.0, 1.8],
                        color: '#10B981',
                        target: 2.5
                    },
                    {
                        label: 'CLS',
                        data: [0.08, 0.07, 0.06, 0.05, 0.06, 0.05, 0.04],
                        color: '#3B82F6',
                        target: 0.1
                    },
                    {
                        label: 'TBT (ms)',
                        data: [150, 140, 130, 120, 125, 115, 110],
                        color: '#F59E0B',
                        target: 200
                    }
                ],
                overallScore: 92,
                lastUpdated: new Date().toISOString()
            }
        };

        res.json({
            success: true,
            data: {
                summaryWidgets,
                kpiAnalytics,
                projectImpact,
                alerts,
                chartData,
                filters: {
                    brand: brand || 'all',
                    department: department || 'all',
                    timeRange: timeRange || 'monthly',
                    kpiCategory: kpiCategory || 'all',
                    campaign: campaign || 'all',
                    contributor: contributor || 'all'
                }
            }
        });
    } catch (error) {
        console.error('Error fetching performance dashboard:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const exportPerformanceData = async (req: Request, res: Response) => {
    try {
        // Export logic here
        res.json({ success: true, message: 'Performance data exported successfully' });
    } catch (error) {
        console.error('Error exporting performance data:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};




