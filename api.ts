/**
 * Vercel Serverless Function - Production API Handler
 * Consolidated API for Guries Marketing Control Center
 * Handles all routes in a single function to stay within Vercel Hobby Plan limits
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

// Mock data
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

// Helper: Set CORS headers
function setCorsHeaders(res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id, X-User-Role');
    res.setHeader('Content-Type', 'application/json');
}

// Helper: Parse request body
async function parseBody(req: VercelRequest): Promise<any> {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => {
            try {
                resolve(data ? JSON.parse(data) : {});
            } catch (e) {
                reject(new Error('Invalid JSON'));
            }
        });
    });
}

// Main handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCorsHeaders(res);

    // Handle OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const url = req.url || '';
        const path = url.split('?')[0];
        const method = req.method || 'GET';

        console.log(`[${new Date().toISOString()}] ${method} ${path}`);

        // Health check
        if (path === '/health' || path === '/api/health' || path === '/api/v1/health') {
            return res.status(200).json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                message: 'Marketing Control Center API is running',
                version: '2.5.0'
            });
        }

        // Assets endpoints
        if (path.startsWith('/api/v1/assets') || path.startsWith('/api/v1/assetLibrary')) {
            if (method === 'GET') {
                return res.status(200).json({
                    success: true,
                    data: mockAssets,
                    total: mockAssets.length
                });
            }
            if (method === 'POST') {
                const body = await parseBody(req);
                const newAsset = {
                    id: Date.now(),
                    ...body,
                    created_at: new Date().toISOString(),
                    status: 'Draft',
                    qc_score: 0
                };
                return res.status(201).json({
                    success: true,
                    message: 'Asset created successfully',
                    data: newAsset
                });
            }
        }

        // QC Reviews
        if (path.startsWith('/api/v1/qc-reviews')) {
            if (method === 'GET') {
                const mockQCReviews = [
                    {
                        id: 1,
                        asset_id: 1,
                        reviewer_id: 1,
                        qc_score: 95,
                        qc_status: 'Pass',
                        qc_remarks: 'Excellent quality work',
                        review_date: new Date().toISOString()
                    },
                    {
                        id: 2,
                        asset_id: 2,
                        reviewer_id: 1,
                        qc_score: 0,
                        qc_status: 'Pending',
                        qc_remarks: null,
                        review_date: null
                    }
                ];
                return res.status(200).json({
                    success: true,
                    data: mockQCReviews,
                    total: mockQCReviews.length
                });
            }
            if (method === 'POST') {
                const body = await parseBody(req);
                const newReview = {
                    id: Date.now(),
                    ...body,
                    review_date: new Date().toISOString()
                };
                return res.status(201).json({
                    success: true,
                    message: 'QC review submitted successfully',
                    data: newReview
                });
            }
        }

        // Services
        if (path.startsWith('/api/v1/services')) {
            return res.status(200).json({
                success: true,
                data: mockServices,
                total: mockServices.length
            });
        }

        // Tasks
        if (path.startsWith('/api/v1/tasks')) {
            return res.status(200).json({
                success: true,
                data: mockTasks,
                total: mockTasks.length
            });
        }

        // Campaigns
        if (path.startsWith('/api/v1/campaigns')) {
            return res.status(200).json({
                success: true,
                data: mockCampaigns,
                total: mockCampaigns.length
            });
        }

        // Projects
        if (path.startsWith('/api/v1/projects')) {
            return res.status(200).json({
                success: true,
                data: mockProjects,
                total: mockProjects.length
            });
        }

        // Users
        if (path.startsWith('/api/v1/users')) {
            return res.status(200).json({
                success: true,
                data: [],
                total: 0
            });
        }

        // Dashboard stats
        if (path.includes('/dashboard/stats')) {
            return res.status(200).json({
                success: true,
                stats: {
                    activeCampaigns: mockCampaigns.filter(c => c.status === 'Active').length,
                    activeCampaignsChange: 12,
                    contentPublished: mockAssets.filter(a => a.status === 'QC Approved').length,
                    contentPublishedChange: 8,
                    tasksCompleted: mockTasks.filter(t => t.status === 'Completed').length,
                    tasksCompletedChange: -3,
                    teamMembers: 5,
                    teamMembersChange: 2,
                    pendingTasks: mockTasks.filter(t => t.status === 'In Progress').length
                }
            });
        }

        // Login endpoint
        if (path.includes('/auth/login')) {
            const body = await parseBody(req);
            const { email, password } = body;

            if (email === 'admin@example.com' && password === 'admin123') {
                return res.status(200).json({
                    success: true,
                    user: {
                        id: 1,
                        name: 'Admin User',
                        email: 'admin@example.com',
                        role: 'admin',
                        status: 'active',
                        department: 'Administration',
                        created_at: new Date().toISOString(),
                        last_login: new Date().toISOString()
                    },
                    token: 'mock-jwt-token-' + Date.now(),
                    message: 'Login successful'
                });
            }

            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Catch-all for missing endpoints
        return res.status(404).json({
            success: false,
            error: 'Route not found',
            path: path,
            method: method,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}


