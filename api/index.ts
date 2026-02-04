/**
 * Vercel Serverless Function Entry Point
 * Provides robust API functionality with mock data for immediate deployment
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

// Mock data for immediate functionality
const mockAssets = [
    {
        id: 1,
        asset_name: "Website Banner Design",
        asset_type: "Blog Banner",
        asset_category: "Graphics",
        asset_format: "JPG",
        content_type: "Web",
        application_type: "web",
        status: "Draft",
        workflow_stage: "Design",
        qc_status: "Pending",
        version_number: "v1.0",
        created_by: 1,
        submitted_by: 1,
        designed_by: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        thumbnail_url: null,
        file_url: null,
        linked_service_id: null,
        linked_task_id: null,
        rework_count: 0,
        qc_score: 0,
        qc_remarks: null
    },
    {
        id: 2,
        asset_name: "SEO Article Content",
        asset_type: "Article",
        asset_category: "Content",
        asset_format: "DOCX",
        content_type: "Blog",
        application_type: "seo",
        status: "QC Approved",
        workflow_stage: "Review",
        qc_status: "Pass",
        version_number: "v2.1",
        created_by: 2,
        submitted_by: 2,
        designed_by: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        thumbnail_url: null,
        file_url: null,
        linked_service_id: 1,
        linked_task_id: 1,
        rework_count: 1,
        qc_score: 85,
        qc_remarks: "Good quality content"
    }
];

const mockUsers = [
    { id: 1, name: "John Designer", email: "john@example.com", role: "designer", status: "active" },
    { id: 2, name: "Sarah Writer", email: "sarah@example.com", role: "writer", status: "active" },
    { id: 3, name: "Admin User", email: "admin@example.com", role: "admin", status: "active" }
];

const mockServices = [
    {
        id: 1,
        service_name: "SEO Optimization",
        service_code: "SEO-001",
        slug: "seo-optimization",
        full_url: "/services/seo-optimization",
        menu_heading: "SEO Services",
        short_tagline: "Boost your online visibility",
        status: "Published"
    },
    {
        id: 2,
        service_name: "Content Marketing",
        service_code: "CM-001",
        slug: "content-marketing",
        full_url: "/services/content-marketing",
        menu_heading: "Content Services",
        short_tagline: "Engage your audience",
        status: "Published"
    }
];

const mockTasks = [
    { id: 1, name: "Design Homepage Banner", task_name: "Design Homepage Banner", status: "In Progress", project_id: 1 },
    { id: 2, name: "Write SEO Article", task_name: "Write SEO Article", status: "Completed", project_id: 1 }
];

const mockCampaigns = [
    { id: 1, name: "Q1 Marketing Campaign", status: "Active", budget: 50000, start_date: "2024-01-01" },
    { id: 2, name: "Product Launch Campaign", status: "Planning", budget: 75000, start_date: "2024-02-01" }
];

const mockProjects = [
    { id: 1, name: "Website Redesign", status: "In Progress", client: "ABC Corp", deadline: "2024-03-01" },
    { id: 2, name: "Marketing Automation", status: "Planning", client: "XYZ Inc", deadline: "2024-04-01" }
];

// Helper function to set CORS headers
function setCorsHeaders(res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id, X-User-Role');
}

// Main handler function
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers for all requests
    setCorsHeaders(res);

    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { url, method } = req;
        const path = url?.split('?')[0] || '';

        console.log(`🚀 API Request: ${method} ${path}`);

        // Health check endpoints
        if (path === '/health' || path === '/api/health' || path === '/api/v1/health') {
            return res.status(200).json({ 
                status: 'ok', 
                timestamp: new Date().toISOString(),
                message: 'Marketing Control Center API is running'
            });
        }

        // Assets endpoints
        if (path.startsWith('/api/v1/assets') || path.startsWith('/api/v1/assetLibrary')) {
            if (method === 'GET') {
                return res.status(200).json(mockAssets);
            }
            if (method === 'POST') {
                const newAsset = { ...req.body, id: mockAssets.length + 1 };
                mockAssets.push(newAsset);
                return res.status(201).json(newAsset);
            }
        }

        // Users endpoints
        if (path.startsWith('/api/v1/users')) {
            if (method === 'GET') {
                return res.status(200).json(mockUsers);
            }
        }

        // Services endpoints
        if (path.startsWith('/api/v1/services')) {
            if (method === 'GET') {
                return res.status(200).json(mockServices);
            }
        }

        // Tasks endpoints
        if (path.startsWith('/api/v1/tasks')) {
            if (method === 'GET') {
                return res.status(200).json(mockTasks);
            }
        }

        // Campaigns endpoints
        if (path.startsWith('/api/v1/campaigns')) {
            if (method === 'GET') {
                return res.status(200).json(mockCampaigns);
            }
        }

        // Projects endpoints
        if (path.startsWith('/api/v1/projects')) {
            if (method === 'GET') {
                return res.status(200).json(mockProjects);
            }
        }

        // Dashboard stats endpoint
        if (path.includes('/dashboard/stats')) {
            return res.status(200).json({
                stats: {
                    activeCampaigns: mockCampaigns.filter(c => c.status === 'Active').length,
                    activeCampaignsChange: 12,
                    contentPublished: mockAssets.filter(a => a.status === 'QC Approved').length,
                    contentPublishedChange: 8,
                    tasksCompleted: mockTasks.filter(t => t.status === 'Completed').length,
                    tasksCompletedChange: -3,
                    teamMembers: mockUsers.length,
                    teamMembersChange: 2,
                    pendingTasks: mockTasks.filter(t => t.status === 'In Progress').length
                }
            });
        }

        // Authentication endpoint
        if (path.includes('/auth/login')) {
            const { email, password } = req.body;
            if (email === 'admin@example.com' && password === 'admin123') {
                const user = mockUsers.find(u => u.email === email);
                return res.status(200).json({
                    success: true,
                    user: user,
                    token: 'mock-jwt-token'
                });
            }
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Default response for unhandled routes
        return res.status(404).json({ 
            success: false, 
            error: 'Route not found',
            path: path,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('❌ API Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

