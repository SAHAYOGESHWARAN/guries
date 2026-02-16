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

        // GET /api/v1/services
        if (req.method === 'GET' && !req.url?.includes('/sub-services')) {
            try {
                const result = await pool.query(
                    `SELECT * FROM services ORDER BY service_name ASC`
                );

                return res.status(200).json({
                    success: true,
                    data: result.rows,
                    count: result.rows.length
                });
            } catch (error: any) {
                console.error('[Services] Error fetching services:', error.message);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to fetch services',
                    message: error.message
                });
            }
        }

        // GET /api/v1/services/:id/sub-services
        if (req.method === 'GET' && req.url?.includes('/sub-services')) {
            const serviceId = req.url.split('/')[3];

            if (!serviceId) {
                return res.status(400).json({
                    success: false,
                    error: 'Service ID is required'
                });
            }

            try {
                const result = await pool.query(
                    `SELECT * FROM sub_services WHERE parent_service_id = $1 ORDER BY sub_service_name ASC`,
                    [parseInt(serviceId)]
                );

                return res.status(200).json({
                    success: true,
                    data: result.rows,
                    count: result.rows.length
                });
            } catch (error: any) {
                console.error('[Services] Error fetching sub-services:', error.message);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to fetch sub-services',
                    message: error.message
                });
            }
        }

        // POST /api/v1/services
        if (req.method === 'POST') {
            const { service_name, service_code, slug, status = 'draft', meta_title, meta_description } = req.body;

            if (!service_name || !service_name.trim()) {
                return res.status(400).json({
                    success: false,
                    error: 'Service name is required',
                    validationErrors: ['Service name is required']
                });
            }

            try {
                const result = await pool.query(
                    `INSERT INTO services (service_name, service_code, slug, status, meta_title, meta_description, created_at, updated_at)
                     VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                     RETURNING *`,
                    [service_name.trim(), service_code || null, slug || null, status, meta_title || null, meta_description || null]
                );

                return res.status(201).json({
                    success: true,
                    data: result.rows[0],
                    message: 'Service created successfully'
                });
            } catch (error: any) {
                console.error('[Services] Error creating service:', error.message);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to create service',
                    message: error.message
                });
            }
        }

        return res.status(404).json({
            success: false,
            error: 'Endpoint not found'
        });

    } catch (error: any) {
        console.error('[Services] Unexpected error:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}
