import { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeDatabase, query } from '../db';

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
        const url = req.url || '';

        console.log('[API] Request:', req.method, url);

        // Parse body safely
        let body = req.body || {};
        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch (e) {
                body = {};
            }
        }

        // ============ AUTH ENDPOINTS ============
        if ((url.includes('/auth/login') || url === '/auth/login') && req.method === 'POST') {
            const { email, password } = body;
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Email and password are required',
                    validationErrors: [!email ? 'Email is required' : '', !password ? 'Password is required' : ''].filter(Boolean)
                });
            }
            try {
                const result = await query(`SELECT id, name, email, role, status FROM users WHERE email = $1`, [email.toLowerCase()]);
                if (result.rows.length === 0) {
                    // If no user found, create a demo user for testing
                    console.log('[API] User not found, creating demo user');
                    try {
                        await query(
                            `INSERT INTO users (name, email, role, status, created_at, updated_at) VALUES ($1, $2, $3, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                            [email.split('@')[0], email.toLowerCase(), 'user']
                        );
                        const newUser = await query(`SELECT id, name, email, role, status FROM users WHERE email = $1`, [email.toLowerCase()]);
                        if (newUser.rows.length > 0) {
                            const user = newUser.rows[0];
                            await query(`UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`, [user.id]);
                            return res.status(200).json({
                                success: true,
                                data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token: `token_${user.id}_${Date.now()}`, message: 'Login successful' }
                            });
                        }
                    } catch (createErr: any) {
                        console.error('[API] Failed to create demo user:', createErr.message);
                    }
                    return res.status(401).json({ success: false, error: 'Invalid email or password', message: 'User not found' });
                }
                const user = result.rows[0];
                if (user.status !== 'active') {
                    return res.status(403).json({ success: false, error: 'User account is not active', message: 'Please contact administrator' });
                }
                await query(`UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`, [user.id]);
                return res.status(200).json({
                    success: true,
                    data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token: `token_${user.id}_${Date.now()}`, message: 'Login successful' }
                });
            } catch (error: any) {
                console.error('[API] Login error:', error.message, error.stack);
                return res.status(500).json({ success: false, error: 'Login failed', message: error.message });
            }
        }

        if (url.includes('/auth/register') && req.method === 'POST') {
            const { name, email, password, role = 'user' } = body;
            const validationErrors: string[] = [];
            if (!name || !name.trim()) validationErrors.push('Name is required');
            if (!email || !email.trim()) validationErrors.push('Email is required');
            if (!password || password.length < 6) validationErrors.push('Password must be at least 6 characters');
            if (validationErrors.length > 0) {
                return res.status(400).json({ success: false, error: 'Validation failed', validationErrors, message: validationErrors.join('; ') });
            }
            try {
                const existingUser = await query(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase()]);
                if (existingUser.rows.length > 0) {
                    return res.status(409).json({ success: false, error: 'User already exists', message: 'Email is already registered' });
                }
                const result = await query(
                    `INSERT INTO users (name, email, role, status, created_at, updated_at) VALUES ($1, $2, $3, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, name, email, role`,
                    [name.trim(), email.toLowerCase(), role]
                );
                const newUser = result.rows[0];
                return res.status(201).json({ success: true, data: { user: newUser, token: `token_${newUser.id}_${Date.now()}`, message: 'Registration successful' } });
            } catch (error: any) {
                return res.status(500).json({ success: false, error: 'Registration failed', message: error.message });
            }
        }

        if (url.includes('/auth/me') && req.method === 'GET') {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({ success: false, error: 'No authorization token provided', message: 'Please login first' });
            }
            try {
                const tokenMatch = authHeader.match(/token_(\d+)_/);
                if (!tokenMatch) {
                    return res.status(401).json({ success: false, error: 'Invalid token', message: 'Please login again' });
                }
                const userId = parseInt(tokenMatch[1]);
                const result = await query(`SELECT id, name, email, role, status FROM users WHERE id = $1`, [userId]);
                if (result.rows.length === 0) {
                    return res.status(404).json({ success: false, error: 'User not found', message: 'Please login again' });
                }
                return res.status(200).json({ success: true, data: { user: result.rows[0] } });
            } catch (error: any) {
                return res.status(500).json({ success: false, error: 'Failed to get user', message: error.message });
            }
        }

        if (url.includes('/auth/logout') && req.method === 'POST') {
            return res.status(200).json({ success: true, message: 'Logout successful' });
        }

        // ============ SERVICES ENDPOINTS ============
        if (url.includes('/services') && req.method === 'GET' && !url.includes('/sub-services')) {
            try {
                const result = await query(`SELECT * FROM services ORDER BY service_name ASC`);
                return res.status(200).json({ success: true, data: result.rows, count: result.rows.length });
            } catch (error: any) {
                return res.status(500).json({ success: false, error: 'Failed to fetch services', message: error.message });
            }
        }

        if (url.includes('/sub-services') && req.method === 'GET') {
            const serviceId = url.split('/')[3];
            if (!serviceId) {
                return res.status(400).json({ success: false, error: 'Service ID is required' });
            }
            try {
                const result = await query(`SELECT * FROM sub_services WHERE parent_service_id = $1 ORDER BY sub_service_name ASC`, [parseInt(serviceId)]);
                return res.status(200).json({ success: true, data: result.rows, count: result.rows.length });
            } catch (error: any) {
                return res.status(500).json({ success: false, error: 'Failed to fetch sub-services', message: error.message });
            }
        }

        if (url.includes('/services') && req.method === 'POST') {
            const { service_name, service_code, slug, status = 'draft', meta_title, meta_description } = body;
            if (!service_name || !service_name.trim()) {
                return res.status(400).json({ success: false, error: 'Service name is required', validationErrors: ['Service name is required'] });
            }
            try {
                const result = await query(
                    `INSERT INTO services (service_name, service_code, slug, status, meta_title, meta_description, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
                    [service_name.trim(), service_code || null, slug || null, status, meta_title || null, meta_description || null]
                );
                return res.status(201).json({ success: true, data: result.rows[0], message: 'Service created successfully' });
            } catch (error: any) {
                return res.status(500).json({ success: false, error: 'Failed to create service', message: error.message });
            }
        }

        // ============ ASSET ENDPOINTS ============
        if (url.includes('/assets/upload-with-service') && req.method === 'POST') {
            const { asset_name, asset_type, asset_category, asset_format, application_type, file_url, thumbnail_url, file_size, file_type, seo_score, grammar_score, keywords, created_by, linked_service_id, linked_sub_service_id } = body;
            const validationErrors: string[] = [];
            if (!asset_name || !asset_name.trim()) validationErrors.push('Asset name is required');
            if (!application_type) validationErrors.push('Application type is required');
            if (!asset_type) validationErrors.push('Asset type is required');
            if (validationErrors.length > 0) {
                return res.status(400).json({ success: false, error: 'Validation failed', validationErrors, message: validationErrors.join('; ') });
            }
            try {
                const result = await query(
                    `INSERT INTO assets (asset_name, asset_type, asset_category, asset_format, application_type, file_url, thumbnail_url, file_size, file_type, seo_score, grammar_score, keywords, created_by, linked_service_id, linked_sub_service_id, status, qc_status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'draft', 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
                    [asset_name.trim(), asset_type, asset_category || null, asset_format || null, application_type, file_url || null, thumbnail_url || null, file_size || null, file_type || null, seo_score || null, grammar_score || null, keywords ? JSON.stringify(keywords) : null, created_by || null, linked_service_id || null, linked_sub_service_id || null]
                );
                const newAsset = result.rows[0];
                if (!newAsset || !newAsset.id) {
                    return res.status(500).json({ success: false, error: 'Asset created but ID not returned', message: 'Failed to save asset' });
                }
                return res.status(201).json({ success: true, data: newAsset, asset: newAsset, message: 'Asset created successfully with service link' });
            } catch (error: any) {
                return res.status(500).json({ success: false, error: 'Failed to create asset', message: error.message });
            }
        }

        // ============ QC REVIEW ENDPOINTS ============
        if (url.includes('/qc-review/pending') && req.method === 'GET') {
            try {
                const result = await query(`SELECT * FROM assets WHERE qc_status = 'pending' OR qc_status = 'rework' ORDER BY created_at DESC`);
                return res.status(200).json({ success: true, data: result.rows, count: result.rows.length });
            } catch (error: any) {
                return res.status(500).json({ success: false, error: 'Failed to fetch pending assets', message: error.message });
            }
        }

        if (url.includes('/qc-review/statistics') && req.method === 'GET') {
            try {
                const pending = await query(`SELECT COUNT(*) as count FROM assets WHERE qc_status = 'pending'`);
                const approved = await query(`SELECT COUNT(*) as count FROM assets WHERE qc_status = 'approved'`);
                const rejected = await query(`SELECT COUNT(*) as count FROM assets WHERE qc_status = 'rejected'`);
                const rework = await query(`SELECT COUNT(*) as count FROM assets WHERE qc_status = 'rework'`);
                return res.status(200).json({
                    success: true,
                    data: {
                        pending: pending.rows[0]?.count || 0,
                        approved: approved.rows[0]?.count || 0,
                        rejected: rejected.rows[0]?.count || 0,
                        rework: rework.rows[0]?.count || 0,
                        total: (pending.rows[0]?.count || 0) + (approved.rows[0]?.count || 0) + (rejected.rows[0]?.count || 0) + (rework.rows[0]?.count || 0)
                    }
                });
            } catch (error: any) {
                return res.status(500).json({ success: false, error: 'Failed to fetch QC statistics', message: error.message });
            }
        }

        if (url.includes('/qc-review/approve') && req.method === 'POST') {
            const { asset_id, qc_remarks, qc_score } = body;
            if (!asset_id) {
                return res.status(400).json({ success: false, error: 'asset_id is required', validationErrors: ['asset_id is required'] });
            }
            try {
                const result = await query(
                    `UPDATE assets SET qc_status = 'approved', status = 'Published', qc_remarks = $1, qc_score = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
                    [qc_remarks || null, qc_score || null, asset_id]
                );
                if (result.rows.length === 0) {
                    return res.status(404).json({ success: false, error: 'Asset not found', message: `Asset with ID ${asset_id} not found` });
                }
                return res.status(200).json({ success: true, data: result.rows[0], message: 'Asset approved successfully' });
            } catch (error: any) {
                return res.status(500).json({ success: false, error: 'Failed to approve asset', message: error.message });
            }
        }

        if (url.includes('/qc-review/reject') && req.method === 'POST') {
            const { asset_id, qc_remarks, qc_score } = body;
            if (!asset_id) {
                return res.status(400).json({ success: false, error: 'asset_id is required', validationErrors: ['asset_id is required'] });
            }
            try {
                const result = await query(
                    `UPDATE assets SET qc_status = 'rejected', status = 'QC Rejected', qc_remarks = $1, qc_score = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
                    [qc_remarks || null, qc_score || null, asset_id]
                );
                if (result.rows.length === 0) {
                    return res.status(404).json({ success: false, error: 'Asset not found', message: `Asset with ID ${asset_id} not found` });
                }
                return res.status(200).json({ success: true, data: result.rows[0], message: 'Asset rejected successfully' });
            } catch (error: any) {
                return res.status(500).json({ success: false, error: 'Failed to reject asset', message: error.message });
            }
        }

        if (url.includes('/qc-review/rework') && req.method === 'POST') {
            const { asset_id, qc_remarks, qc_score } = body;
            if (!asset_id) {
                return res.status(400).json({ success: false, error: 'asset_id is required', validationErrors: ['asset_id is required'] });
            }
            try {
                const currentAsset = await query(`SELECT rework_count FROM assets WHERE id = $1`, [asset_id]);
                if (currentAsset.rows.length === 0) {
                    return res.status(404).json({ success: false, error: 'Asset not found', message: `Asset with ID ${asset_id} not found` });
                }
                const newReworkCount = (currentAsset.rows[0].rework_count || 0) + 1;
                const result = await query(
                    `UPDATE assets SET qc_status = 'rework', status = 'In Rework', qc_remarks = $1, qc_score = $2, rework_count = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *`,
                    [qc_remarks || null, qc_score || null, newReworkCount, asset_id]
                );
                return res.status(200).json({ success: true, data: result.rows[0], message: 'Rework requested successfully' });
            } catch (error: any) {
                return res.status(500).json({ success: false, error: 'Failed to request rework', message: error.message });
            }
        }

        // ============ CAMPAIGN STATS ENDPOINTS ============
        if (url.includes('/campaigns-stats') && req.method === 'GET') {
            const campaignId = req.query.id;
            try {
                if (campaignId) {
                    const result = await query(
                        `SELECT c.id, c.campaign_name, c.campaign_type, c.status, c.description, c.campaign_start_date, c.campaign_end_date, c.campaign_owner_id, c.project_id, c.brand_id, c.target_url, c.created_at, c.updated_at, COUNT(DISTINCT t.id) as tasks_total, COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as tasks_completed, COUNT(DISTINCT CASE WHEN t.status = 'pending' THEN t.id END) as tasks_pending, COUNT(DISTINCT CASE WHEN t.status = 'in_progress' THEN t.id END) as tasks_in_progress, ROUND(CASE WHEN COUNT(DISTINCT t.id) = 0 THEN 0 ELSE (COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END)::float / COUNT(DISTINCT t.id) * 100) END) as completion_percentage FROM campaigns c LEFT JOIN tasks t ON t.campaign_id = c.id WHERE c.id = $1 GROUP BY c.id, c.campaign_name, c.campaign_type, c.status, c.description, c.campaign_start_date, c.campaign_end_date, c.campaign_owner_id, c.project_id, c.brand_id, c.target_url, c.created_at, c.updated_at`,
                        [campaignId]
                    );
                    if (result.rows.length === 0) {
                        return res.status(404).json({ success: false, error: 'Campaign not found', message: `Campaign with ID ${campaignId} not found` });
                    }
                    return res.status(200).json({ success: true, data: result.rows[0] });
                } else {
                    const result = await query(
                        `SELECT c.id, c.campaign_name, c.campaign_type, c.status, c.description, c.campaign_start_date, c.campaign_end_date, c.campaign_owner_id, c.project_id, c.brand_id, c.target_url, c.created_at, c.updated_at, COUNT(DISTINCT t.id) as tasks_total, COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as tasks_completed, COUNT(DISTINCT CASE WHEN t.status = 'pending' THEN t.id END) as tasks_pending, COUNT(DISTINCT CASE WHEN t.status = 'in_progress' THEN t.id END) as tasks_in_progress, ROUND(CASE WHEN COUNT(DISTINCT t.id) = 0 THEN 0 ELSE (COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END)::float / COUNT(DISTINCT t.id) * 100) END) as completion_percentage FROM campaigns c LEFT JOIN tasks t ON t.campaign_id = c.id GROUP BY c.id, c.campaign_name, c.campaign_type, c.status, c.description, c.campaign_start_date, c.campaign_end_date, c.campaign_owner_id, c.project_id, c.brand_id, c.target_url, c.created_at, c.updated_at ORDER BY c.created_at DESC`
                    );
                    return res.status(200).json({ success: true, data: result.rows, count: result.rows.length });
                }
            } catch (error: any) {
                return res.status(500).json({ success: false, error: 'Failed to fetch campaigns', message: error.message });
            }
        }

        // ============ DASHBOARDS ENDPOINTS ============
        if (url.includes('/dashboards/employees') && req.method === 'GET') {
            try {
                const result = await query(`SELECT id, name, email, role, department, status FROM users WHERE role != 'admin' ORDER BY name ASC`);
                return res.status(200).json({ success: true, data: result.rows, count: result.rows.length });
            } catch (error: any) {
                return res.status(500).json({ success: false, error: 'Failed to fetch employees', message: error.message });
            }
        }

        if (url.includes('/dashboards/employee-comparison') && req.method === 'GET') {
            try {
                const result = await query(
                    `SELECT u.id, u.name, u.email, u.department, COUNT(DISTINCT t.id) as tasks_assigned, COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as tasks_completed, ROUND(CASE WHEN COUNT(DISTINCT t.id) = 0 THEN 0 ELSE (COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END)::float / COUNT(DISTINCT t.id) * 100) END) as completion_rate FROM users u LEFT JOIN tasks t ON t.assigned_to = u.id WHERE u.role != 'admin' GROUP BY u.id, u.name, u.email, u.department ORDER BY completion_rate DESC`
                );
                return res.status(200).json({ success: true, data: result.rows, count: result.rows.length });
            } catch (error: any) {
                return res.status(500).json({ success: false, error: 'Failed to fetch employee comparison', message: error.message });
            }
        }

        if (url.includes('/task-assignment') && req.method === 'POST') {
            const { taskId, fromEmployeeId, toEmployeeId } = body;
            if (!taskId || !toEmployeeId) {
                return res.status(400).json({ success: false, error: 'Task ID and target employee ID are required', validationErrors: [!taskId ? 'Task ID is required' : '', !toEmployeeId ? 'Target employee ID is required' : ''].filter(Boolean) });
            }
            try {
                const result = await query(`UPDATE tasks SET assigned_to = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`, [toEmployeeId, taskId]);
                if (result.rows.length === 0) {
                    return res.status(404).json({ success: false, error: 'Task not found' });
                }
                return res.status(200).json({ success: true, data: result.rows[0], message: 'Task reassigned successfully' });
            } catch (error: any) {
                return res.status(500).json({ success: false, error: 'Failed to reassign task', message: error.message });
            }
        }

        if (url.includes('/performance/export') && req.method === 'POST') {
            try {
                const result = await query(
                    `SELECT u.name, u.email, COUNT(DISTINCT t.id) as tasks_total, COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as tasks_completed, ROUND(CASE WHEN COUNT(DISTINCT t.id) = 0 THEN 0 ELSE (COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END)::float / COUNT(DISTINCT t.id) * 100) END) as completion_percentage FROM users u LEFT JOIN tasks t ON t.assigned_to = u.id WHERE u.role != 'admin' GROUP BY u.id, u.name, u.email ORDER BY completion_percentage DESC`
                );
                const csv = [['Name', 'Email', 'Total Tasks', 'Completed', 'Completion %'], ...result.rows.map(row => [row.name, row.email, row.tasks_total, row.tasks_completed, row.completion_percentage])].map(row => row.join(',')).join('\n');
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename="performance-report.csv"');
                return res.status(200).send(csv);
            } catch (error: any) {
                return res.status(500).json({ success: false, error: 'Failed to export performance data', message: error.message });
            }
        }

        if (url.includes('/implement-suggestion') && req.method === 'POST') {
            const { suggestionId } = body;
            if (!suggestionId) {
                return res.status(400).json({ success: false, error: 'Suggestion ID is required' });
            }
            return res.status(200).json({ success: true, message: 'Suggestion implemented successfully' });
        }

        // ============ REWARD/PENALTY ENDPOINTS ============
        if (url.includes('/reward-penalty/rules') && req.method === 'GET') {
            const rules = [
                { id: 1, name: 'Task Completion Bonus', type: 'reward', condition: 'task_completed', points: 10, description: 'Award 10 points for each completed task' },
                { id: 2, name: 'On-Time Completion', type: 'reward', condition: 'task_completed_on_time', points: 5, description: 'Award 5 bonus points for completing task before deadline' },
                { id: 3, name: 'QC Approval', type: 'reward', condition: 'qc_approved', points: 15, description: 'Award 15 points when asset passes QC' },
                { id: 4, name: 'Missed Deadline', type: 'penalty', condition: 'task_overdue', points: -5, description: 'Deduct 5 points for each overdue task' },
                { id: 5, name: 'QC Rejection', type: 'penalty', condition: 'qc_rejected', points: -10, description: 'Deduct 10 points when asset is rejected in QC' }
            ];
            return res.status(200).json({ success: true, data: rules, count: rules.length });
        }

        if (url.includes('/reward-penalty/apply') && req.method === 'POST') {
            const { userId, ruleId, points, reason } = body;
            if (!userId || !ruleId || points === undefined) {
                return res.status(400).json({ success: false, error: 'User ID, rule ID, and points are required', validationErrors: [!userId ? 'User ID is required' : '', !ruleId ? 'Rule ID is required' : '', points === undefined ? 'Points are required' : ''].filter(Boolean) });
            }
            return res.status(200).json({ success: true, data: { userId, ruleId, points, reason, appliedAt: new Date().toISOString() }, message: 'Reward/penalty applied successfully' });
        }

        return res.status(404).json({ success: false, error: 'Endpoint not found' });

    } catch (error: any) {
        console.error('[API] Unexpected error:', error.message, error.stack);
        return res.status(500).json({ success: false, error: 'Internal server error', message: error.message });
    }
}

