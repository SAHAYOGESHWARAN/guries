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
    }
];

const mockTasks = [
    { id: 1, name: "Design Homepage Banner", task_name: "Design Homepage Banner", status: "In Progress", project_id: 1 }
];

const mockCampaigns = [
    { id: 1, name: "Q1 Marketing Campaign", status: "Active", budget: 50000, start_date: "2024-01-01" }
];

const mockProjects = [
    { id: 1, name: "Website Redesign", status: "In Progress", client: "ABC Corp", deadline: "2024-03-01" }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    // Handle OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const path = req.url || '';
        const method = req.method || 'GET';

        console.log(`[${new Date().toISOString()}] ${method} ${path}`);

        // Health check
        if (path.includes('/health')) {
            return res.status(200).json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                message: 'Marketing Control Center API is running',
                version: '2.5.0'
            });
        }

        // Assets endpoints
        if (path.includes('/assets') || path.includes('/assetLibrary')) {
            if (method === 'GET') {
                return res.status(200).json({
                    success: true,
                    data: mockAssets,
                    total: mockAssets.length
                });
            }
            if (method === 'POST') {
                const body = req.body || {};
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
        if (path.includes('/qc-reviews')) {
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
                    }
                ];
                return res.status(200).json({
                    success: true,
                    data: mockQCReviews,
                    total: mockQCReviews.length
                });
            }
            if (method === 'POST') {
                const body = req.body || {};
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
        if (path.includes('/services')) {
            return res.status(200).json({
                success: true,
                data: mockServices,
                total: mockServices.length
            });
        }

        // Tasks
        if (path.includes('/tasks')) {
            return res.status(200).json({
                success: true,
                data: mockTasks,
                total: mockTasks.length
            });
        }

        // Campaigns
        if (path.includes('/campaigns')) {
            return res.status(200).json({
                success: true,
                data: mockCampaigns,
                total: mockCampaigns.length
            });
        }

        // Projects
        if (path.includes('/projects')) {
            return res.status(200).json({
                success: true,
                data: mockProjects,
                total: mockProjects.length
            });
        }

        // Users
        if (path.includes('/users')) {
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
