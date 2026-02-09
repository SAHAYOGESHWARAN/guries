import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool, initializeDatabase } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Mock auth endpoint
        if (req.url?.includes('/auth/login') && req.method === 'POST') {
            const { email, password } = req.body;

            // Mock credentials
            if (email === 'admin@example.com' && password === 'admin123') {
                return res.status(200).json({
                    success: true,
                    user: {
                        id: 1,
                        email: 'admin@example.com',
                        name: 'Admin User',
                        role: 'admin'
                    },
                    token: 'mock-jwt-token-' + Date.now()
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Health check endpoint
        if (req.url?.includes('/health') && req.method === 'GET') {
            try {
                await initializeDatabase();
                const pool = getPool();
                const result = await pool.query('SELECT NOW()');
                const assetsCheck = await pool.query('SELECT COUNT(*) as count FROM assets');
                const assetCount = assetsCheck.rows[0]?.count || 0;

                return res.status(200).json({
                    success: true,
                    status: 'healthy',
                    database: 'connected (mock)',
                    timestamp: result.rows[0]?.now,
                    assets: {
                        count: assetCount,
                        table_exists: true
                    }
                });
            } catch (error: any) {
                return res.status(500).json({
                    success: false,
                    status: 'unhealthy',
                    error: error.message
                });
            }
        }

        // Mock endpoints for services, keywords, users, etc.
        if (req.url?.includes('/services') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: [
                    { id: 1, service_name: 'SEO Services', status: 'active' },
                    { id: 2, service_name: 'Content Creation', status: 'active' }
                ]
            });
        }

        if (req.url?.includes('/keywords') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: [
                    { id: 1, keyword_name: 'digital marketing', keyword_intent: 'commercial' },
                    { id: 2, keyword_name: 'seo strategy', keyword_intent: 'informational' }
                ]
            });
        }

        if (req.url?.includes('/keywords') && req.method === 'POST') {
            const id = Math.floor(Math.random() * 100000) + 1;
            return res.status(201).json({
                id,
                ...req.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        if (req.url?.includes('/users') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: [
                    { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin' }
                ]
            });
        }

        if (req.url?.includes('/projects') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/projects') && req.method === 'POST') {
            const id = Math.floor(Math.random() * 100000) + 1;
            return res.status(201).json({
                id,
                ...req.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        if (req.url?.includes('/tasks') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/tasks') && req.method === 'POST') {
            const id = Math.floor(Math.random() * 100000) + 1;
            return res.status(201).json({
                id,
                ...req.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        if (req.url?.includes('/campaigns') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/campaigns') && req.method === 'POST') {
            const {
                campaign_name, campaign_type, status, campaign_status, description,
                campaign_start_date, campaign_end_date, campaign_owner_id,
                sub_campaigns, linked_service_ids, target_url,
                project_id, brand_id, backlinks_planned, backlinks_completed,
                tasks_completed, tasks_total, kpi_score
            } = req.body;

            // Generate a mock ID
            const id = Math.floor(Math.random() * 100000) + 1;

            const campaign = {
                id,
                campaign_name: campaign_name || 'Untitled Campaign',
                campaign_type: campaign_type || 'Content',
                status: status || campaign_status || 'planning',
                description: description || null,
                campaign_start_date: campaign_start_date || null,
                campaign_end_date: campaign_end_date || null,
                campaign_owner_id: campaign_owner_id || null,
                sub_campaigns: sub_campaigns || null,
                linked_service_ids: linked_service_ids ? JSON.stringify(linked_service_ids) : null,
                target_url: target_url || null,
                project_id: project_id || null,
                brand_id: brand_id || null,
                backlinks_planned: backlinks_planned || 0,
                backlinks_completed: backlinks_completed || 0,
                tasks_completed: tasks_completed || 0,
                tasks_total: tasks_total || 0,
                kpi_score: kpi_score || 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            return res.status(201).json(campaign);
        }

        if (req.url?.includes('/content') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/content') && req.method === 'POST') {
            const id = Math.floor(Math.random() * 100000) + 1;
            return res.status(201).json({
                id,
                ...req.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        if (req.url?.includes('/asset-category-master') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/asset-category-master') && req.method === 'POST') {
            const id = Math.floor(Math.random() * 100000) + 1;
            return res.status(201).json({
                id,
                ...req.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        if (req.url?.includes('/asset-type-master') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/asset-type-master') && req.method === 'POST') {
            const id = Math.floor(Math.random() * 100000) + 1;
            return res.status(201).json({
                id,
                ...req.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        if (req.url?.includes('/sub-services') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/notifications') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/dashboard/stats') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: {
                    total_assets: 0,
                    total_services: 2,
                    total_keywords: 2,
                    total_users: 1
                }
            });
        }

        if (req.url?.includes('/brands') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/brands') && req.method === 'POST') {
            const id = Math.floor(Math.random() * 100000) + 1;
            return res.status(201).json({
                id,
                ...req.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        if (req.url?.includes('/backlinks') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/backlinks') && req.method === 'POST') {
            const id = Math.floor(Math.random() * 100000) + 1;
            return res.status(201).json({
                id,
                ...req.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        if (req.url?.includes('/backlink-sources') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/backlink-sources') && req.method === 'POST') {
            const id = Math.floor(Math.random() * 100000) + 1;
            return res.status(201).json({
                id,
                ...req.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        if (req.url?.includes('/backlinkSources') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/backlinkSources') && req.method === 'POST') {
            const id = Math.floor(Math.random() * 100000) + 1;
            return res.status(201).json({
                id,
                ...req.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        if (req.url?.includes('/submissions') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/submissions') && req.method === 'POST') {
            const id = Math.floor(Math.random() * 100000) + 1;
            return res.status(201).json({
                id,
                ...req.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        if (req.url?.includes('/competitors') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/competitors') && req.method === 'POST') {
            const id = Math.floor(Math.random() * 100000) + 1;
            return res.status(201).json({
                id,
                ...req.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        if (req.url?.includes('/competitorBacklinks') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/competitorBacklinks') && req.method === 'POST') {
            const id = Math.floor(Math.random() * 100000) + 1;
            return res.status(201).json({
                id,
                ...req.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        if (req.url?.includes('/okrs') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/okrs') && req.method === 'POST') {
            const id = Math.floor(Math.random() * 100000) + 1;
            return res.status(201).json({
                id,
                ...req.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        if (req.url?.includes('/smm') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/smm') && req.method === 'POST') {
            const id = Math.floor(Math.random() * 100000) + 1;
            return res.status(201).json({
                id,
                ...req.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        if (req.url?.includes('/graphics') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/graphics') && req.method === 'POST') {
            const id = Math.floor(Math.random() * 100000) + 1;
            return res.status(201).json({
                id,
                ...req.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        if (req.url?.includes('/roles') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/teams') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        if (req.url?.includes('/team-members') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        // QC review endpoint (mock)
        if (req.url?.includes('/qc-review') && req.method === 'POST') {
            return res.status(200).json({
                success: true,
                message: 'QC review submitted successfully'
            });
        }

        // Generic endpoint handler for other routes
        // This handles /api/v1/* routes that don't have specific handlers
        if (req.url?.startsWith('/api/v1/')) {
            const endpoint = req.url.replace('/api/v1/', '').split('?')[0].split('/')[0];

            // Return empty array for GET requests to any endpoint (mock data)
            if (req.method === 'GET') {
                return res.status(200).json({
                    success: true,
                    data: []
                });
            }

            // Return proper object for POST requests with ID
            if (req.method === 'POST') {
                const id = Math.floor(Math.random() * 100000) + 1;
                return res.status(201).json({
                    id,
                    ...req.body,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            }

            // Return success for PUT/DELETE requests
            if (req.method === 'PUT' || req.method === 'DELETE') {
                return res.status(200).json({
                    success: true,
                    message: `${req.method} request to ${endpoint} processed successfully`
                });
            }

            return res.status(404).json({
                success: false,
                error: `Endpoint /${endpoint} not found`,
                message: 'This endpoint is not yet implemented'
            });
        }

        // Default response
        res.status(200).json({
            message: 'API is running',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('[API] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}
