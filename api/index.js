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
    } else if (url.includes('/notifications')) {
        return notifications(req, res);
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
