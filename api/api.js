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
