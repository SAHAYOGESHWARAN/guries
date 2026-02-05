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

const mockUsers: any[] = [];

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

        // Assets endpoints - unified handling
        if (path.startsWith('/api/v1/assets') || path.startsWith('/api/v1/assetLibrary')) {
            if (method === 'GET') {
                return res.status(200).json({
                    success: true,
                    data: mockAssets,
                    total: mockAssets.length
                });
            }
            if (method === 'POST') {
                const newAsset = {
                    id: Date.now(),
                    ...req.body,
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
            if (method === 'PUT') {
                const { id } = req.query;
                const updatedAsset = {
                    ...req.body,
                    updated_at: new Date().toISOString()
                };
                return res.status(200).json({
                    success: true,
                    message: 'Asset updated successfully',
                    data: updatedAsset
                });
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

        // QC Reviews endpoints
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
                const newReview = {
                    id: Date.now(),
                    ...req.body,
                    review_date: new Date().toISOString()
                };
                return res.status(201).json({
                    success: true,
                    message: 'QC review submitted successfully',
                    data: newReview
                });
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

        // Additional mock data for missing endpoints
        const mockNotifications = [
            { id: 1, title: 'New asset uploaded', message: 'A new asset requires your review', type: 'info', read: false, created_at: new Date().toISOString() },
            { id: 2, title: 'QC review completed', message: 'Asset QC review has been completed', type: 'success', read: true, created_at: new Date().toISOString() }
        ];

        const mockKeywords = [
            { id: 1, keyword: 'digital marketing', search_volume: 1000, competition: 'high' },
            { id: 2, keyword: 'seo services', search_volume: 800, competition: 'medium' }
        ];

        const mockBrands = [
            { id: 1, name: 'TechCorp', industry: 'Technology', website: 'https://techcorp.com', status: 'active' },
            { id: 2, name: 'HealthPlus', industry: 'Healthcare', website: 'https://healthplus.com', status: 'active' }
        ];

        const mockBacklinks = [
            { id: 1, url: 'https://example.com', domain_authority: 45, status: 'active' },
            { id: 2, url: 'https://blog.example.com', domain_authority: 32, status: 'pending' }
        ];

        const mockContentTypes = [
            { id: 1, name: 'Blog Post', description: 'Blog content' },
            { id: 2, name: 'Article', description: 'Article content' }
        ];

        const mockAssetCategories = [
            { id: 1, name: 'Graphics', description: 'Graphic assets' },
            { id: 2, name: 'Content', description: 'Content assets' }
        ];

        const mockAssetTypes = [
            { id: 1, name: 'Image', description: 'Image files' },
            { id: 2, name: 'Document', description: 'Document files' }
        ];

        const mockSubServices = [
            { id: 1, name: 'SEO Audit', service_id: 1 },
            { id: 2, name: 'Content Writing', service_id: 2 }
        ];

        const mockContent = [
            { id: 1, title: 'Marketing Guide', type: 'blog', status: 'published' },
            { id: 2, title: 'SEO Tips', type: 'article', status: 'draft' }
        ];

        // Handle all missing endpoints with mock data
        if (path.startsWith('/api/v1/notifications')) {
            return res.status(200).json(mockNotifications);
        }
        if (path.startsWith('/api/v1/keywords')) {
            return res.status(200).json(mockKeywords);
        }
        if (path.startsWith('/api/v1/brands')) {
            return res.status(200).json(mockBrands);
        }
        if (path.startsWith('/api/v1/backlinks')) {
            return res.status(200).json(mockBacklinks);
        }
        if (path.startsWith('/api/v1/content-types')) {
            return res.status(200).json(mockContentTypes);
        }
        if (path.startsWith('/api/v1/asset-category-master')) {
            return res.status(200).json(mockAssetCategories);
        }
        if (path.startsWith('/api/v1/asset-type-master')) {
            return res.status(200).json(mockAssetTypes);
        }
        if (path.startsWith('/api/v1/sub-services')) {
            return res.status(200).json(mockSubServices);
        }
        if (path.startsWith('/api/v1/content')) {
            return res.status(200).json(mockContent);
        }

        // Additional missing endpoints from our test
        if (path.startsWith('/api/v1/service-pages')) {
            return res.status(200).json([
                { id: 1, title: 'SEO Services', content: 'Professional SEO optimization', status: 'published' },
                { id: 2, title: 'Content Marketing', content: 'Quality content creation', status: 'draft' }
            ]);
        }
        if (path.startsWith('/api/v1/smm')) {
            return res.status(200).json([
                { id: 1, platform: 'Facebook', post_type: 'Image', status: 'Scheduled', date: '2024-02-05' },
                { id: 2, platform: 'Twitter', post_type: 'Text', status: 'Published', date: '2024-02-04' }
            ]);
        }
        if (path.startsWith('/api/v1/graphics')) {
            return res.status(200).json([
                { id: 1, name: 'Facebook Banner', type: 'Social Media', status: 'Completed' },
                { id: 2, name: 'Website Header', type: 'Web', status: 'In Progress' }
            ]);
        }
        if (path.startsWith('/api/v1/competitors')) {
            return res.status(200).json([
                { id: 1, name: 'Competitor A', domain: 'competitor-a.com', industry: 'Marketing' },
                { id: 2, name: 'Competitor B', domain: 'competitor-b.com', industry: 'SEO' }
            ]);
        }
        if (path.startsWith('/api/v1/asset-categories')) {
            return res.status(200).json(mockAssetCategories);
        }
        if (path.startsWith('/api/v1/asset-types')) {
            return res.status(200).json(mockAssetTypes);
        }
        if (path.startsWith('/api/v1/platforms') || path.startsWith('/api/v1/platform-master')) {
            return res.status(200).json([
                { id: 1, name: 'Facebook', type: 'Social Media' },
                { id: 2, name: 'Google', type: 'Search Engine' }
            ]);
        }
        if (path.startsWith('/api/v1/country-master')) {
            return res.status(200).json([
                { id: 1, name: 'United States', code: 'US' },
                { id: 2, name: 'United Kingdom', code: 'UK' }
            ]);
        }
        if (path.startsWith('/api/v1/industry-sectors')) {
            return res.status(200).json([
                { id: 1, name: 'Technology', description: 'Tech companies' },
                { id: 2, name: 'Healthcare', description: 'Healthcare industry' }
            ]);
        }

        // Authentication endpoint (no demo backdoor)
        if (path.includes('/auth/login')) {
            const { email } = req.body;
            const user = mockUsers.find(u => u.email === email);
            if (user) {
                return res.status(200).json({ success: true, user: user, token: 'mock-jwt-token' });
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

