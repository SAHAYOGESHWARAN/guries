import { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool, initializeDatabase } from '../db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await initializeDatabase();
        const pool = getPool();

        // PROBLEM 4 FIX: Implement campaign aggregation queries

        if (req.method === 'GET') {
            const campaignId = req.query.id;

            if (campaignId) {
                // Get specific campaign with aggregated stats
                try {
                    const result = await pool.query(
                        `SELECT 
                            c.id,
                            c.campaign_name,
                            c.campaign_type,
                            c.status,
                            c.description,
                            c.campaign_start_date,
                            c.campaign_end_date,
                            c.campaign_owner_id,
                            c.project_id,
                            c.brand_id,
                            c.target_url,
                            c.created_at,
                            c.updated_at,
                            COUNT(DISTINCT t.id) as tasks_total,
                            COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as tasks_completed,
                            COUNT(DISTINCT CASE WHEN t.status = 'pending' THEN t.id END) as tasks_pending,
                            COUNT(DISTINCT CASE WHEN t.status = 'in_progress' THEN t.id END) as tasks_in_progress,
                            ROUND(
                                CASE 
                                    WHEN COUNT(DISTINCT t.id) = 0 THEN 0
                                    ELSE (COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END)::float / COUNT(DISTINCT t.id) * 100)
                                END
                            ) as completion_percentage
                        FROM campaigns c
                        LEFT JOIN tasks t ON t.campaign_id = c.id
                        WHERE c.id = $1
                        GROUP BY c.id, c.campaign_name, c.campaign_type, c.status, c.description,
                                 c.campaign_start_date, c.campaign_end_date, c.campaign_owner_id,
                                 c.project_id, c.brand_id, c.target_url, c.created_at, c.updated_at`,
                        [campaignId]
                    );

                    if (result.rows.length === 0) {
                        return res.status(404).json({
                            success: false,
                            error: 'Campaign not found',
                            message: `Campaign with ID ${campaignId} not found`
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        data: result.rows[0]
                    });
                } catch (error: any) {
                    console.error('[CampaignStats] Error fetching campaign:', error.message);
                    return res.status(500).json({
                        success: false,
                        error: 'Failed to fetch campaign',
                        message: error.message
                    });
                }
            } else {
                // Get all campaigns with aggregated stats
                try {
                    const result = await pool.query(
                        `SELECT 
                            c.id,
                            c.campaign_name,
                            c.campaign_type,
                            c.status,
                            c.description,
                            c.campaign_start_date,
                            c.campaign_end_date,
                            c.campaign_owner_id,
                            c.project_id,
                            c.brand_id,
                            c.target_url,
                            c.created_at,
                            c.updated_at,
                            COUNT(DISTINCT t.id) as tasks_total,
                            COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as tasks_completed,
                            COUNT(DISTINCT CASE WHEN t.status = 'pending' THEN t.id END) as tasks_pending,
                            COUNT(DISTINCT CASE WHEN t.status = 'in_progress' THEN t.id END) as tasks_in_progress,
                            ROUND(
                                CASE 
                                    WHEN COUNT(DISTINCT t.id) = 0 THEN 0
                                    ELSE (COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END)::float / COUNT(DISTINCT t.id) * 100)
                                END
                            ) as completion_percentage
                        FROM campaigns c
                        LEFT JOIN tasks t ON t.campaign_id = c.id
                        GROUP BY c.id, c.campaign_name, c.campaign_type, c.status, c.description,
                                 c.campaign_start_date, c.campaign_end_date, c.campaign_owner_id,
                                 c.project_id, c.brand_id, c.target_url, c.created_at, c.updated_at
                        ORDER BY c.created_at DESC`
                    );

                    return res.status(200).json({
                        success: true,
                        data: result.rows,
                        count: result.rows.length
                    });
                } catch (error: any) {
                    console.error('[CampaignStats] Error fetching campaigns:', error.message);
                    return res.status(500).json({
                        success: false,
                        error: 'Failed to fetch campaigns',
                        message: error.message
                    });
                }
            }
        }

        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });

    } catch (error: any) {
        console.error('[CampaignStats] Unexpected error:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}
