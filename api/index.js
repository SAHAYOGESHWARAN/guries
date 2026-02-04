const tasks = require('./v1/tasks.js');
const users = require('./v1/users.js');
const assetTypeMaster = require('./v1/asset-type-master.js');
const assetCategoryMaster = require('./v1/asset-category-master.js');
const services = require('./v1/services.js');
const assetLibrary = require('./v1/assetLibrary.js');
const notifications = require('./v1/notifications.js');

module.exports = function handler(req, res) {
    const url = req.url;
    
    // Set CORS headers for all responses
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-User-Id, X-User-Role');

    // Handle OPTIONS requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Health check endpoints
    if (url === '/health' || url === '/api/health' || url === '/api/v1/health') {
        return res.status(200).json({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            message: 'Marketing Control Center API is running'
        });
    }
    
    // Route to appropriate handler based on URL path
    if (url.includes('/tasks')) {
        return tasks(req, res);
    } else if (url.includes('/users')) {
        return users(req, res);
    } else if (url.includes('/asset-type-master')) {
        return assetTypeMaster(req, res);
    } else if (url.includes('/asset-category-master')) {
        return assetCategoryMaster(req, res);
    } else if (url.includes('/services')) {
        return services(req, res);
    } else if (url.includes('/qc-review')) {
        // Handle QC review endpoint separately (must come before assetLibrary)
        return handleQCReview(req, res);
    } else if (url.includes('/assetLibrary')) {
        return assetLibrary(req, res);
    } else if (url.includes('/assets')) {
        return assetLibrary(req, res); // Route /assets to the same handler as /assetLibrary
    } else if (url.includes('/notifications')) {
        return notifications(req, res);
    } else if (url.includes('/campaigns')) {
        if (req.method === 'GET') {
            return res.status(200).json([
                { id: 1, name: "Q1 Marketing Campaign", status: "Active", budget: 50000, start_date: "2024-01-01" },
                { id: 2, name: "Product Launch Campaign", status: "Planning", budget: 75000, start_date: "2024-02-01" }
            ]);
        }
    } else if (url.includes('/projects')) {
        if (req.method === 'GET') {
            return res.status(200).json([
                { id: 1, name: "Website Redesign", status: "In Progress", client: "ABC Corp", deadline: "2024-03-01" },
                { id: 2, name: "Marketing Automation", status: "Planning", client: "XYZ Inc", deadline: "2024-04-01" }
            ]);
        }
    } else if (url.includes('/keywords')) {
        if (req.method === 'GET') {
            return res.status(200).json([
                { id: 1, keyword: "digital marketing", search_volume: 10000, competition: "high" },
                { id: 2, keyword: "content marketing", search_volume: 8000, competition: "medium" }
            ]);
        }
    } else if (url.includes('/asset-type-master')) {
        if (req.method === 'GET') {
            return res.status(200).json([
                { id: 1, asset_type_name: "Image", status: "active" },
                { id: 2, asset_type_name: "Video", status: "active" },
                { id: 3, asset_type_name: "Document", status: "active" }
            ]);
        }
    } else if (url.includes('/asset-category-master')) {
        if (req.method === 'GET') {
            return res.status(200).json([
                { id: 1, category_name: "Marketing Materials", status: "active" },
                { id: 2, category_name: "Product Assets", status: "active" },
                { id: 3, category_name: "Brand Assets", status: "active" }
            ]);
        }
    } else if (url.includes('/dashboard/stats')) {
        if (req.method === 'GET') {
            return res.status(200).json({
                stats: {
                    activeCampaigns: 1,
                    activeCampaignsChange: 12,
                    contentPublished: 1,
                    contentPublishedChange: 8,
                    tasksCompleted: 1,
                    tasksCompletedChange: -3,
                    teamMembers: 3,
                    teamMembersChange: 2,
                    pendingTasks: 1
                }
            });
        }
    } else if (url.includes('/auth/login')) {
        if (req.method === 'POST') {
            const { email, password } = req.body;
            if (email === 'admin@example.com' && password === 'admin123') {
                return res.status(200).json({
                    success: true,
                    user: { id: 3, name: "Admin User", email: "admin@example.com", role: "admin", status: "active" },
                    token: 'mock-jwt-token'
                });
            }
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
    } else {
        res.status(404).json({ error: 'Endpoint not found', url: url });
    }
};

// QC Review handler
function handleQCReview(req, res) {
    try {
        if (req.method === 'POST') {
            const { qc_score, qc_remarks, qc_decision, qc_reviewer_id, user_role } = req.body;
            
            if (!qc_score || !qc_decision || !qc_reviewer_id) {
                return res.status(400).json({
                    error: 'Missing required fields: qc_score, qc_decision, qc_reviewer_id'
                });
            }

            if (!['approved', 'rejected', 'rework'].includes(qc_decision)) {
                return res.status(400).json({
                    error: 'Invalid qc_decision. Must be: approved, rejected, or rework'
                });
            }

            // Mock successful response
            const response = {
                success: true,
                message: `Asset has been ${qc_decision}`,
                data: {
                    asset_id: 2, // Extract from URL or use default
                    qc_score,
                    qc_remarks: qc_remarks || '',
                    qc_decision,
                    qc_reviewer_id,
                    user_role: user_role || 'unknown',
                    status: qc_decision === 'approved' ? 'QC Approved' : 
                           qc_decision === 'rejected' ? 'QC Rejected' : 'Rework Required',
                    linking_active: qc_decision === 'approved' ? 1 : 0,
                    reviewed_at: new Date().toISOString()
                }
            };

            res.status(200).json(response);
            return;
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('QC review handler error:', err);
        res.status(500).json({ 
            error: err?.message || 'Internal server error',
            details: 'Failed to process QC review'
        });
    }
}
