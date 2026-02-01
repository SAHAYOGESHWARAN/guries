import { Request, Response } from 'express';
import { db } from '../config/db';

// Reward & Penalty Controller
export const getRewardsPenalties = async (req: Request, res: Response) => {
    try {
        const { tab, timeRange, department } = req.query;

        // Bonus Criteria by Tier
        const bonusCriteria = [
            {
                tier: 'Tier 1 - Excellence Bonus',
                criteria: 'Composite Score ≥ 95% for 2 consecutive months',
                bonusAmount: '?',
                eligibleEmployees: 1,
                color: 'emerald'
            },
            {
                tier: 'Tier 2 - Performance Bonus',
                criteria: 'Composite Score ≥ 90% + Zero SLA misses',
                bonusAmount: '?',
                eligibleEmployees: 3,
                color: 'blue'
            },
            {
                tier: 'Tier 3 - Quality Bonus',
                criteria: 'QC Score ≥ 95% for current month',
                bonusAmount: '?',
                eligibleEmployees: 2,
                color: 'purple'
            },
            {
                tier: 'Tier 4 - Innovation Bonus',
                criteria: 'Process improvement suggestion implemented',
                bonusAmount: '?',
                eligibleEmployees: 1,
                color: 'orange'
            },
            {
                tier: 'Tier 5 - Mentorship Bonus',
                criteria: 'Successfully mentored junior team member',
                bonusAmount: '?',
                eligibleEmployees: 2,
                color: 'teal'
            }
        ];

        // Reward Recommendations for Top 20% Performers
        const rewardRecommendations = [
            {
                id: 1,
                employeeId: 1,
                name: 'Sarah Johnson',
                role: 'Senior Content Writer',
                compositeScore: 94.2,
                achievements: [
                    'Exceeded word count target by 20%',
                    'Zero QC rejections this month',
                    'Mentored 2 junior writers',
                    'Implemented new content template system'
                ],
                recommendedRewards: [
                    { type: 'Tier 2 - Performance Bonus', amount: '?', reason: 'Composite Score 94.2% + Zero SLA misses' },
                    { type: 'Tier 3 - Quality Bonus', amount: '?', reason: 'QC Score 96.5%' },
                    { type: 'Tier 5 - Mentorship Bonus', amount: '?', reason: 'Mentored 2 junior writers' }
                ],
                totalRecommendedAmount: '?',
                status: 'pending-approval',
                priority: 'high'
            },
            {
                id: 2,
                employeeId: 3,
                name: 'Lisa Rodriguez',
                role: 'Web Developer',
                compositeScore: 91.7,
                achievements: [
                    'Completed website redesign ahead of schedule',
                    'Improved page load times by 40%',
                    'Zero critical bugs in production',
                    'Implemented automated testing framework'
                ],
                recommendedRewards: [
                    { type: 'Tier 2 - Performance Bonus', amount: '?', reason: 'Composite Score 91.7% + Zero SLA misses' },
                    { type: 'Tier 4 - Innovation Bonus', amount: '?', reason: 'Automated testing implementation' }
                ],
                totalRecommendedAmount: '?',
                status: 'pending-approval',
                priority: 'high'
            },
            {
                id: 3,
                employeeId: 2,
                name: 'Mike Chen',
                role: 'SEO Specialist',
                compositeScore: 89.4,
                achievements: [
                    'Improved keyword rankings by 25%',
                    'Completed comprehensive site audit',
                    'Trained team on new SEO tools',
                    'Maintained high-quality backlink profile'
                ],
                recommendedRewards: [
                    { type: 'Tier 5 - Mentorship Bonus', amount: '?', reason: 'Trained team on SEO tools' }
                ],
                totalRecommendedAmount: '?',
                status: 'pending-review',
                priority: 'medium'
            }
        ];

        // Penalty Triggers for Underperformers
        const penaltyTriggers = [
            {
                id: 1,
                employeeId: 8,
                name: 'James Wilson',
                role: 'Junior Developer',
                violations: [
                    {
                        type: 'Performance',
                        description: 'Composite Score below 80% for 2 consecutive months',
                        severity: 'medium',
                        occurrences: 2,
                        lastOccurrence: '2024-12-01'
                    },
                    {
                        type: 'Quality',
                        description: 'QC rejection rate above 20%',
                        severity: 'high',
                        occurrences: 3,
                        lastOccurrence: '2024-12-08'
                    },
                    {
                        type: 'SLA',
                        description: 'Missed delivery deadlines',
                        severity: 'medium',
                        occurrences: 4,
                        lastOccurrence: '2024-12-10'
                    }
                ],
                recommendedActions: [
                    { action: 'Mandatory coaching sessions', timeline: 'Immediate' },
                    { action: 'Performance improvement plan', timeline: '1 week' },
                    { action: 'Skill assessment and training', timeline: '2 weeks' },
                    { action: 'Probationary period review', timeline: '1 month' }
                ],
                status: 'action-required',
                priority: 'high'
            },
            {
                id: 2,
                employeeId: 5,
                name: 'Emma Wilson',
                role: 'Content Writer',
                violations: [
                    {
                        type: 'Performance',
                        description: 'Declining performance trend (-1.5% this month)',
                        severity: 'low',
                        occurrences: 1,
                        lastOccurrence: '2024-12-11'
                    },
                    {
                        type: 'Effort',
                        description: 'Below effort target for current month',
                        severity: 'medium',
                        occurrences: 1,
                        lastOccurrence: '2024-12-05'
                    }
                ],
                recommendedActions: [
                    { action: 'One-on-one performance review', timeline: '1 week' },
                    { action: 'Workload assessment', timeline: '1 week' },
                    { action: 'Additional training resources', timeline: '2 weeks' }
                ],
                status: 'monitoring',
                priority: 'medium'
            }
        ];

        // Automated Rule Builder
        const automationRules = [
            {
                id: 1,
                name: 'Performance Alert Rule',
                condition: 'If Effort Score < 70% for 2 consecutive months',
                action: 'Send alert to Team Leader + Schedule performance review',
                status: 'active',
                triggeredCount: 3,
                lastTriggered: '2024-11-28'
            },
            {
                id: 2,
                name: 'Quality Coaching Rule',
                condition: 'If QC Score < 90% for current month',
                action: 'Mandatory coaching session + Skill assessment',
                status: 'active',
                triggeredCount: 7,
                lastTriggered: '2024-12-05'
            },
            {
                id: 3,
                name: 'Excellence Recognition Rule',
                condition: 'If Composite Score > 95% for 2 consecutive months',
                action: 'Auto-recommend for Tier 1 Excellence Bonus',
                status: 'active',
                triggeredCount: 1,
                lastTriggered: '2024-12-01'
            },
            {
                id: 4,
                name: 'SLA Compliance Rule',
                condition: 'If SLA misses > 3 in current month',
                action: 'Workload review + Process improvement training',
                status: 'active',
                triggeredCount: 2,
                lastTriggered: '2024-12-10'
            },
            {
                id: 5,
                name: 'Innovation Reward Rule',
                condition: 'If process improvement suggestion is implemented',
                action: 'Auto-recommend for Innovation Bonus',
                status: 'active',
                triggeredCount: 4,
                lastTriggered: '2024-12-08'
            }
        ];

        // Approval Workflow
        const approvalWorkflow = [
            {
                id: 1,
                type: 'reward',
                employeeName: 'Sarah Johnson',
                amount: '?',
                reason: 'Multiple bonus criteria met',
                submittedBy: 'Team Leader',
                submittedDate: '2024-12-11',
                status: 'pending-hr-approval',
                approver: 'HR Manager',
                priority: 'high'
            },
            {
                id: 2,
                type: 'reward',
                employeeName: 'Lisa Rodriguez',
                amount: '?',
                reason: 'Performance and innovation bonuses',
                submittedBy: 'Team Leader',
                submittedDate: '2024-12-11',
                status: 'pending-manager-approval',
                approver: 'Department Manager',
                priority: 'high'
            },
            {
                id: 3,
                type: 'penalty',
                employeeName: 'James Wilson',
                action: 'Performance improvement plan',
                reason: 'Multiple performance violations',
                submittedBy: 'Team Leader',
                submittedDate: '2024-12-10',
                status: 'approved',
                approver: 'HR Manager',
                priority: 'high'
            }
        ];

        // Summary Statistics
        const summaryStats = {
            totalRewardsThisMonth: 8,
            totalRewardAmount: '?,150',
            totalPenaltiesThisMonth: 3,
            averagePerformanceScore: 86.2,
            topPerformersCount: 3,
            underperformersCount: 2,
            automationRulesActive: 5,
            pendingApprovals: 2
        };

        res.json({
            success: true,
            data: {
                bonusCriteria,
                rewardRecommendations,
                penaltyTriggers,
                automationRules,
                approvalWorkflow,
                summaryStats,
                filters: {
                    tab: tab || 'rewards',
                    timeRange: timeRange || 'monthly',
                    department: department || 'all'
                }
            }
        });
    } catch (error) {
        console.error('Error fetching rewards & penalties:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const createAutomationRule = async (req: Request, res: Response) => {
    try {
        const { name, condition, action, status } = req.body;

        const newRule = {
            id: Date.now(),
            name,
            condition,
            action,
            status: status || 'active',
            triggeredCount: 0,
            createdDate: new Date().toISOString()
        };

        res.json({
            success: true,
            message: 'Automation rule created successfully',
            data: newRule
        });
    } catch (error) {
        console.error('Error creating automation rule:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const updateApprovalStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, approverComments } = req.body;

        res.json({
            success: true,
            message: 'Approval status updated successfully',
            data: {
                id,
                status,
                approverComments,
                updatedDate: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error updating approval status:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};



