/**
 * Vercel Serverless Function - JavaScript Version
 * Complete API implementation for deployment
 */

// Mock data for all modules
const mockData = {
  dashboardStats: {
    activeCampaigns: 5,
    activeCampaignsChange: 12,
    contentPublished: 23,
    contentPublishedChange: 8,
    tasksCompleted: 18,
    tasksCompletedChange: -3,
    teamMembers: 12,
    teamMembersChange: 2,
    pendingTasks: 7
  },
  
  projects: [
    { id: 1, name: "Website Redesign", status: "In Progress", client: "ABC Corp", deadline: "2024-03-01" },
    { id: 2, name: "Marketing Automation", status: "Planning", client: "XYZ Inc", deadline: "2024-04-01" }
  ],
  
  campaigns: [
    { id: 1, name: "Q1 Marketing Campaign", status: "Active", budget: 50000, start_date: "2024-01-01" },
    { id: 2, name: "Product Launch Campaign", status: "Planning", budget: 75000, start_date: "2024-02-01" }
  ],
  
  tasks: [
    { id: 1, name: "Design Homepage Banner", task_name: "Design Homepage Banner", status: "In Progress", project_id: 1 },
    { id: 2, name: "Write SEO Article", task_name: "Write SEO Article", status: "Completed", project_id: 1 }
  ],
  
  assets: [
    {
      id: 1,
      asset_name: "Website Banner Design",
      asset_type: "Blog Banner",
      asset_category: "Graphics",
      status: "Draft",
      workflow_stage: "Design",
      qc_status: "Pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      asset_name: "SEO Article Content",
      asset_type: "Article",
      asset_category: "Content",
      status: "QC Approved",
      workflow_stage: "Review",
      qc_status: "Pass",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  
  services: [
    {
      id: 1,
      service_name: "SEO Optimization",
      service_code: "SEO-001",
      slug: "seo-optimization",
      status: "Published"
    },
    {
      id: 2,
      service_name: "Content Marketing",
      service_code: "CM-001",
      slug: "content-marketing",
      status: "Published"
    }
  ],
  
  users: [
    { id: 1, name: "John Designer", email: "john@example.com", role: "designer", status: "active" },
    { id: 2, name: "Sarah Writer", email: "sarah@example.com", role: "writer", status: "active" }
  ],
  
  notifications: [
    { id: 1, title: "New asset uploaded", message: "A new asset requires your review", type: "info", read: false },
    { id: 2, title: "QC review completed", message: "Asset QC review has been completed", type: "success", read: true }
  ],
  
  // QC Reviews data
  qcReviews: [
    {
      id: 1,
      asset_id: 1,
      reviewer_id: 1,
      reviewer_name: "John Designer",
      qc_score: 85,
      qc_status: "Pass",
      qc_remarks: "Good quality design, meets standards",
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      asset_id: 2,
      reviewer_id: 2,
      reviewer_name: "Sarah Writer",
      qc_score: 92,
      qc_status: "Pass",
      qc_remarks: "Excellent content, well-written",
      created_at: new Date().toISOString()
    }
  ]
};

// CORS headers helper
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id, X-User-Role');
}

// Main handler function
module.exports = async function handler(req, res) {
  // Set CORS headers
  setCorsHeaders(res);

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { url, method } = req;
    const path = url?.split('?')[0] || '';

    console.log(`🚀 API Request: ${method} ${path}`);

    // Health endpoints
    if (path === '/health' || path === '/api/health' || path === '/api/v1/health') {
      return res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        message: 'Marketing Control Center API is running'
      });
    }

    // Dashboard
    if (path === '/api/v1/dashboard/stats') {
      return res.status(200).json(mockData.dashboardStats);
    }

    // Core modules
    if (path === '/api/v1/projects') {
      return res.status(200).json(mockData.projects);
    }
    if (path === '/api/v1/campaigns') {
      return res.status(200).json(mockData.campaigns);
    }
    if (path === '/api/v1/tasks') {
      return res.status(200).json(mockData.tasks);
    }
    if (path === '/api/v1/assets') {
      return res.status(200).json(mockData.assets);
    }
    if (path === '/api/v1/assetLibrary') {
      return res.status(200).json({
        success: true,
        data: mockData.assets,
        total: mockData.assets.length
      });
    }

    // Services
    if (path === '/api/v1/services') {
      return res.status(200).json(mockData.services);
    }

    // Users and notifications
    if (path === '/api/v1/users') {
      return res.status(200).json(mockData.users);
    }
    if (path === '/api/v1/notifications') {
      return res.status(200).json(mockData.notifications);
    }

    // Asset QC specific endpoints
    if (path === '/api/v1/assetLibrary/qc/pending') {
      const pendingAssets = mockData.assets.filter(asset => 
        asset.qc_status === 'Pending' || asset.workflow_stage === 'QC Review'
      );
      return res.status(200).json({
        success: true,
        data: pendingAssets,
        total: pendingAssets.length
      });
    }

    if (path.startsWith('/api/v1/assetLibrary/') && path.includes('/submit-qc')) {
      const parts = path.split('/').filter(part => part); // Filter out empty strings
      const assetId = parseInt(parts[3], 10); // Convert to integer with base 10
      console.log(`Submit QC - Asset ID: ${assetId}, Type: ${typeof assetId}, Parts: ${JSON.stringify(parts)}`);
      const asset = mockData.assets.find(a => a.id === assetId);
      if (asset) {
        asset.qc_status = 'Submitted';
        asset.workflow_stage = 'QC Review';
        asset.updated_at = new Date().toISOString();
        return res.status(200).json({
          success: true,
          message: 'Asset submitted for QC successfully',
          data: asset
        });
      }
      return res.status(404).json({
        success: false,
        error: 'Asset not found',
        assetId: assetId,
        availableIds: mockData.assets.map(a => a.id)
      });
    }

    if (path.startsWith('/api/v1/assetLibrary/') && path.includes('/qc-reviews')) {
      const parts = path.split('/').filter(part => part); // Filter out empty strings
      const assetId = parseInt(parts[3], 10); // Convert to integer with base 10
      console.log(`QC Reviews - Asset ID: ${assetId}, Type: ${typeof assetId}, Parts: ${JSON.stringify(parts)}`);
      const reviews = mockData.qcReviews.filter(review => review.asset_id === assetId);
      return res.status(200).json({
        success: true,
        data: reviews,
        total: reviews.length
      });
    }

    if (path === '/api/v1/admin/qc/assets') {
      const qcAssets = mockData.assets.filter(asset => 
        asset.qc_status === 'Pending' || asset.qc_status === 'Submitted' || asset.workflow_stage === 'QC Review'
      );
      return res.status(200).json({
        success: true,
        data: qcAssets,
        total: qcAssets.length
      });
    }

    if (path.startsWith('/api/v1/assetLibrary/') && path.includes('/qc-review')) {
      const parts = path.split('/');
      const assetId = parseInt(parts[3]); // Convert to integer
      console.log(`QC Review - Asset ID: ${assetId}, Type: ${typeof assetId}`);
      const { qc_status, qc_score, qc_remarks } = req.body || {};
      const asset = mockData.assets.find(a => a.id === assetId);
      
      if (asset) {
        asset.qc_status = qc_status || 'Reviewed';
        asset.qc_score = qc_score || 0;
        asset.qc_remarks = qc_remarks || '';
        asset.workflow_stage = qc_status === 'Pass' ? 'Completed' : 'Rework';
        asset.updated_at = new Date().toISOString();
        
        // Add to QC reviews
        const review = {
          id: mockData.qcReviews.length + 1,
          asset_id: assetId,
          reviewer_id: 1,
          reviewer_name: "Admin",
          qc_score: qc_score || 0,
          qc_status: qc_status || 'Reviewed',
          qc_remarks: qc_remarks || '',
          created_at: new Date().toISOString()
        };
        mockData.qcReviews.push(review);
        
        return res.status(200).json({
          success: true,
          message: 'QC review completed successfully',
          data: asset
        });
      }
      return res.status(404).json({
        success: false,
        error: 'Asset not found',
        assetId: assetId,
        availableIds: mockData.assets.map(a => a.id)
      });
    }

    // Additional endpoints
    if (path.startsWith('/api/v1/')) {
      // Return mock data for any other endpoint
      return res.status(200).json({
        success: true,
        message: 'Data retrieved successfully',
        data: [],
        total: 0,
        path: path
      });
    }

    // Default response for unhandled routes
    return res.status(404).json({ 
      success: false, 
      error: 'Route not found',
      path: path,
      method: method,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
