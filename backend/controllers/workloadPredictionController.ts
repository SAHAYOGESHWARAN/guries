import { Request, Response } from 'express';
import { db } from '../config/db';

// Workload Prediction & Allocation Controller
export const getWorkloadPrediction = async (req: Request, res: Response) => {
    try {
        const { timeRange, department, team } = req.query;

        // Forecasted Tasks per Person
        const forecastedTasks = [
            {
                employeeId: 1,
                name: 'Sarah Johnson',
                role: 'Senior Content Writer',
                currentCapacity: 10,
                currentUtilization: 8,
                utilizationPercentage: 80,
                forecastedTasks: {
                    nextWeek: 9,
                    twoWeeksOut: 11,
                    nextMonth: 42
                },
                predictedUtilization: {
                    nextWeek: 90,
                    twoWeeksOut: 110,
                    nextMonth: 105
                },
                status: 'balanced',
                riskLevel: 'low'
            },
            {
                employeeId: 2,
                name: 'Mike Chen',
                role: 'SEO Specialist',
                currentCapacity: 10,
                currentUtilization: 12,
                utilizationPercentage: 120,
                forecastedTasks: {
                    nextWeek: 13,
                    twoWeeksOut: 11,
                    nextMonth: 45
                },
                predictedUtilization: {
                    nextWeek: 130,
                    twoWeeksOut: 110,
                    nextMonth: 112
                },
                status: 'overload',
                riskLevel: 'high'
            },
            {
                employeeId: 3,
                name: 'Lisa Rodriguez',
                role: 'Web Developer',
                currentCapacity: 8,
                currentUtilization: 6,
                utilizationPercentage: 75,
                forecastedTasks: {
                    nextWeek: 7,
                    twoWeeksOut: 8,
                    nextMonth: 30
                },
                predictedUtilization: {
                    nextWeek: 87.5,
                    twoWeeksOut: 100,
                    nextMonth: 93.8
                },
                status: 'balanced',
                riskLevel: 'low'
            },
            {
                employeeId: 4,
                name: 'David Kim',
                role: 'SMM Specialist',
                currentCapacity: 8,
                currentUtilization: 4,
                utilizationPercentage: 50,
                forecastedTasks: {
                    nextWeek: 6,
                    twoWeeksOut: 7,
                    nextMonth: 28
                },
                predictedUtilization: {
                    nextWeek: 75,
                    twoWeeksOut: 87.5,
                    nextMonth: 87.5
                },
                status: 'underutilized',
                riskLevel: 'low'
            },
            {
                employeeId: 5,
                name: 'Emma Wilson',
                role: 'Content Writer',
                currentCapacity: 8,
                currentUtilization: 7,
                utilizationPercentage: 87.5,
                forecastedTasks: {
                    nextWeek: 8,
                    twoWeeksOut: 9,
                    nextMonth: 34
                },
                predictedUtilization: {
                    nextWeek: 100,
                    twoWeeksOut: 112.5,
                    nextMonth: 106.3
                },
                status: 'balanced',
                riskLevel: 'medium'
            },
            {
                employeeId: 6,
                name: 'Alex Thompson',
                role: 'Junior SEO',
                currentCapacity: 6,
                currentUtilization: 5,
                utilizationPercentage: 83.3,
                forecastedTasks: {
                    nextWeek: 6,
                    twoWeeksOut: 7,
                    nextMonth: 26
                },
                predictedUtilization: {
                    nextWeek: 100,
                    twoWeeksOut: 116.7,
                    nextMonth: 108.3
                },
                status: 'balanced',
                riskLevel: 'medium'
            }
        ];

        // Predicted Overload Cases
        const predictedOverloads = [
            {
                employeeId: 2,
                name: 'Mike Chen',
                role: 'SEO Specialist',
                currentOverload: 20, // 120% - 100%
                predictedOverload: {
                    nextWeek: 30,
                    twoWeeksOut: 10,
                    nextMonth: 12
                },
                riskLevel: 'high',
                timeline: 'Immediate action required',
                impact: 'Quality degradation, burnout risk, missed deadlines',
                recommendations: [
                    'Redistribute 3 tasks to Alex Thompson',
                    'Delay non-critical SEO audits by 1 week',
                    'Consider hiring additional SEO specialist',
                    'Implement task automation for routine work'
                ]
            },
            {
                employeeId: 5,
                name: 'Emma Wilson',
                role: 'Content Writer',
                currentOverload: 0,
                predictedOverload: {
                    nextWeek: 0,
                    twoWeeksOut: 12.5,
                    nextMonth: 6.3
                },
                riskLevel: 'medium',
                timeline: 'Monitor closely, action in 2 weeks',
                impact: 'Potential quality issues, stress increase',
                recommendations: [
                    'Monitor workload closely',
                    'Prepare backup resources',
                    'Consider task redistribution if needed',
                    'Provide additional support tools'
                ]
            },
            {
                employeeId: 6,
                name: 'Alex Thompson',
                role: 'Junior SEO',
                currentOverload: 0,
                predictedOverload: {
                    nextWeek: 0,
                    twoWeeksOut: 16.7,
                    nextMonth: 8.3
                },
                riskLevel: 'medium',
                timeline: 'Plan for capacity increase in 2 weeks',
                impact: 'Learning curve may slow progress',
                recommendations: [
                    'Provide additional mentoring',
                    'Assign simpler tasks initially',
                    'Monitor progress closely',
                    'Have backup plan ready'
                ]
            }
        ];

        // Resource Gap Alerts
        const resourceGapAlerts = [
            {
                id: 1,
                department: 'SEO Team',
                gapType: 'Skill Shortage',
                severity: 'high',
                description: 'Technical SEO expertise gap identified',
                impact: 'May delay complex technical audits',
                timeline: 'Next 2-4 weeks',
                recommendations: [
                    'Hire senior technical SEO specialist',
                    'Provide advanced training to existing team',
                    'Consider outsourcing complex technical tasks',
                    'Implement knowledge sharing sessions'
                ],
                estimatedCost: '?,000 - ?,000/month'
            },
            {
                id: 2,
                department: 'Content Team',
                gapType: 'Capacity Shortage',
                severity: 'medium',
                description: 'Content production capacity will be insufficient in Q1 2025',
                impact: 'May not meet content delivery targets',
                timeline: 'January 2025',
                recommendations: [
                    'Hire 1-2 additional content writers',
                    'Implement content automation tools',
                    'Optimize content creation processes',
                    'Consider freelance writers for peak periods'
                ],
                estimatedCost: '?,000 - ?,000/month'
            },
            {
                id: 3,
                department: 'Web Development',
                gapType: 'Technology Gap',
                severity: 'low',
                description: 'Need expertise in new web technologies',
                impact: 'May limit ability to implement advanced features',
                timeline: 'Q2 2025',
                recommendations: [
                    'Provide training on new technologies',
                    'Hire developer with modern tech stack experience',
                    'Partner with external development agency',
                    'Implement gradual technology migration'
                ],
                estimatedCost: '?,000 - ?,000 for training'
            }
        ];

        // AI Task Allocation Suggestions
        const allocationSuggestions = [
            {
                id: 1,
                priority: 'high',
                suggestion: 'Redistribute 3 SEO audit tasks from Mike Chen to Alex Thompson',
                reasoning: 'Mike is at 120% capacity while Alex has room for growth. Tasks are suitable for junior level with mentoring.',
                impact: {
                    mikeUtilization: '120% → 90%',
                    alexUtilization: '83% → 100%',
                    teamEfficiency: '+15%',
                    riskReduction: 'High → Low'
                },
                effort: 'Low',
                timeline: 'Immediate',
                confidence: 92.5
            },
            {
                id: 2,
                priority: 'high',
                suggestion: 'Assign upcoming social media campaigns to David Kim',
                reasoning: 'David is significantly underutilized at 50% capacity and has expertise in social media management.',
                impact: {
                    davidUtilization: '50% → 85%',
                    teamUtilization: '+8%',
                    campaignQuality: 'Improved focus',
                    costEfficiency: '+12%'
                },
                effort: 'Low',
                timeline: 'This week',
                confidence: 89.3
            },
            {
                id: 3,
                priority: 'medium',
                suggestion: 'Cross-train Emma Wilson on basic SEO tasks',
                reasoning: 'Provides backup for SEO team and increases Emma\'s skill set. Helps with future capacity planning.',
                impact: {
                    teamFlexibility: '+25%',
                    emmaSkills: 'Enhanced',
                    futureCapacity: 'Improved',
                    knowledgeSharing: 'Increased'
                },
                effort: 'Medium',
                timeline: '2-3 weeks',
                confidence: 78.7
            },
            {
                id: 4,
                priority: 'medium',
                suggestion: 'Implement automated reporting for routine SEO metrics',
                reasoning: 'Frees up 4-6 hours per week from manual reporting tasks, allowing focus on strategic work.',
                impact: {
                    timesSaved: '4-6 hours/week',
                    taskAutomation: '30% of routine work',
                    strategicFocus: 'Increased',
                    errorReduction: '85%'
                },
                effort: 'Medium',
                timeline: '3-4 weeks',
                confidence: 85.1
            }
        ];

        // Workload Trend Forecast
        const workloadTrendForecast = {
            labels: ['Current Week', 'Week +1', 'Week +2', 'Week +3', 'Week +4'],
            datasets: [
                {
                    label: 'Team Capacity',
                    data: [50, 50, 50, 50, 50]
                },
                {
                    label: 'Predicted Workload',
                    data: [42, 49, 52, 48, 51]
                },
                {
                    label: 'Optimal Utilization (80%)',
                    data: [40, 40, 40, 40, 40]
                }
            ]
        };

        // Team Capacity Utilization
        const teamCapacityUtilization = [
            {
                team: 'Content Team',
                currentCapacity: 18,
                currentUtilization: 15,
                utilizationPercentage: 83.3,
                forecastedUtilization: {
                    nextWeek: 88.9,
                    nextMonth: 91.7
                },
                status: 'balanced',
                trend: 'increasing'
            },
            {
                team: 'SEO Team',
                currentCapacity: 16,
                currentUtilization: 17,
                utilizationPercentage: 106.3,
                forecastedUtilization: {
                    nextWeek: 112.5,
                    nextMonth: 108.3
                },
                status: 'overload',
                trend: 'critical'
            },
            {
                team: 'Tech Team',
                currentCapacity: 8,
                currentUtilization: 6,
                utilizationPercentage: 75.0,
                forecastedUtilization: {
                    nextWeek: 87.5,
                    nextMonth: 93.8
                },
                status: 'balanced',
                trend: 'stable'
            },
            {
                team: 'Marketing Team',
                currentCapacity: 8,
                currentUtilization: 4,
                utilizationPercentage: 50.0,
                forecastedUtilization: {
                    nextWeek: 75.0,
                    nextMonth: 87.5
                },
                status: 'underutilized',
                trend: 'improving'
            }
        ];

        res.json({
            success: true,
            data: {
                forecastedTasks,
                predictedOverloads,
                resourceGapAlerts,
                allocationSuggestions,
                workloadTrendForecast,
                teamCapacityUtilization,
                filters: {
                    timeRange: timeRange || 'monthly',
                    department: department || 'all',
                    team: team || 'all'
                }
            }
        });
    } catch (error) {
        console.error('Error fetching workload prediction:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const implementAllocationSuggestion = async (req: Request, res: Response) => {
    try {
        const { suggestionId, approvedBy, notes } = req.body;

        res.json({
            success: true,
            message: 'Allocation suggestion implemented successfully',
            data: {
                suggestionId,
                approvedBy,
                notes,
                implementedDate: new Date().toISOString(),
                status: 'implemented'
            }
        });
    } catch (error) {
        console.error('Error implementing allocation suggestion:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const getCapacityForecast = async (req: Request, res: Response) => {
    try {
        const { timeframe } = req.query;

        const forecast = {
            currentWeek: {
                totalCapacity: 50,
                utilization: 42,
                percentage: 84.0,
                status: 'optimal'
            },
            nextWeek: {
                totalCapacity: 50,
                utilization: 49,
                percentage: 98.0,
                status: 'near-capacity'
            },
            twoWeeksOut: {
                totalCapacity: 50,
                utilization: 52,
                percentage: 104.0,
                status: 'overload'
            },
            nextMonth: {
                totalCapacity: 50,
                utilization: 48,
                percentage: 96.0,
                status: 'high-utilization'
            }
        };

        res.json({ success: true, data: forecast });
    } catch (error) {
        console.error('Error fetching capacity forecast:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

