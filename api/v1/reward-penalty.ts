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

        // GET /api/v1/reward-penalty/rules
        if (req.method === 'GET' && req.url?.includes('/rules')) {
            try {
                // Return default reward/penalty rules
                const rules = [
                    {
                        id: 1,
                        name: 'Task Completion Bonus',
                        type: 'reward',
                        condition: 'task_completed',
                        points: 10,
                        description: 'Award 10 points for each completed task'
                    },
                    {
                        id: 2,
                        name: 'On-Time Completion',
                        type: 'reward',
                        condition: 'task_completed_on_time',
                        points: 5,
                        description: 'Award 5 bonus points for completing task before deadline'
                    },
                    {
                        id: 3,
                        name: 'QC Approval',
                        type: 'reward',
                        condition: 'qc_approved',
                        points: 15,
                        description: 'Award 15 points when asset passes QC'
                    },
                    {
                        id: 4,
                        name: 'Missed Deadline',
                        type: 'penalty',
                        condition: 'task_overdue',
                        points: -5,
                        description: 'Deduct 5 points for each overdue task'
                    },
                    {
                        id: 5,
                        name: 'QC Rejection',
                        type: 'penalty',
                        condition: 'qc_rejected',
                        points: -10,
                        description: 'Deduct 10 points when asset is rejected in QC'
                    }
                ];

                return res.status(200).json({
                    success: true,
                    data: rules,
                    count: rules.length
                });
            } catch (error: any) {
                console.error('[RewardPenalty] Error fetching rules:', error.message);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to fetch reward/penalty rules',
                    message: error.message
                });
            }
        }

        // POST /api/v1/reward-penalty/apply
        if (req.method === 'POST' && req.url?.includes('/apply')) {
            const { userId, ruleId, points, reason } = req.body;

            if (!userId || !ruleId || points === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID, rule ID, and points are required',
                    validationErrors: [
                        !userId ? 'User ID is required' : '',
                        !ruleId ? 'Rule ID is required' : '',
                        points === undefined ? 'Points are required' : ''
                    ].filter(Boolean)
                });
            }

            try {
                // Log the reward/penalty (in production, store in database)
                console.log('[RewardPenalty] Applied:', { userId, ruleId, points, reason });

                return res.status(200).json({
                    success: true,
                    data: {
                        userId,
                        ruleId,
                        points,
                        reason,
                        appliedAt: new Date().toISOString()
                    },
                    message: 'Reward/penalty applied successfully'
                });
            } catch (error: any) {
                console.error('[RewardPenalty] Error applying reward/penalty:', error.message);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to apply reward/penalty',
                    message: error.message
                });
            }
        }

        return res.status(404).json({
            success: false,
            error: 'Endpoint not found'
        });

    } catch (error: any) {
        console.error('[RewardPenalty] Unexpected error:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}
