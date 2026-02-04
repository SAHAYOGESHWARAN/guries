/**
 * Simple API handler for Vercel deployment
 */

module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle OPTIONS requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const url = req.url;
    console.log('API Request:', req.method, url);

    // Mock data
    const mockAssets = [
        {
            id: 1,
            asset_name: "Marketing Banner 2024",
            asset_type: "Image",
            asset_category: "Marketing Materials",
            status: "Approved",
            qc_score: 95,
            created_by: "Content Team",
            created_at: new Date().toISOString(),
            file_url: '/assets/banner-2024.jpg'
        },
        {
            id: 2,
            asset_name: "Product Demo Video",
            asset_type: "Video",
            asset_category: "Product Assets",
            status: "Pending QC Review",
            qc_score: 0,
            created_by: "Video Team",
            created_at: new Date().toISOString(),
            file_url: '/assets/product-demo.mp4'
        }
    ];

    const mockUsers = [
        { id: 1, name: "Admin User", email: "admin@example.com", role: "admin", status: "active" },
        { id: 2, name: "John Designer", email: "john@example.com", role: "designer", status: "active" },
        { id: 3, name: "Sarah Writer", email: "sarah@example.com", role: "writer", status: "active" }
    ];

    const mockServices = [
        { id: 1, service_name: "Digital Marketing", description: "Comprehensive digital marketing services", status: "active" },
        { id: 2, service_name: "Content Creation", description: "Professional content creation services", status: "active" },
        { id: 3, service_name: "SEO Optimization", description: "Search engine optimization services", status: "active" }
    ];

    const mockProjects = [
        { id: 1, name: "Website Redesign", status: "In Progress", client: "ABC Corp" },
        { id: 2, name: "Marketing Automation", status: "Planning", client: "XYZ Inc" }
    ];

    const mockCampaigns = [
        { id: 1, name: "Q1 Marketing Campaign", status: "Active", budget: 50000 },
        { id: 2, name: "Product Launch Campaign", status: "Planning", budget: 75000 }
    ];

    // Route handling
    if (url === '/health' || url === '/api/health' || url === '/api/v1/health') {
        return res.status(200).json({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            message: 'Marketing Control Center API is running'
        });
    }

    if (url.includes('/assets') || url.includes('/assetLibrary')) {
        return res.status(200).json(mockAssets);
    }

    if (url.includes('/users')) {
        return res.status(200).json(mockUsers);
    }

    if (url.includes('/services')) {
        return res.status(200).json(mockServices);
    }

    if (url.includes('/projects')) {
        return res.status(200).json(mockProjects);
    }

    if (url.includes('/campaigns')) {
        return res.status(200).json(mockCampaigns);
    }

    if (url.includes('/dashboard/stats')) {
        return res.status(200).json({
            stats: {
                activeCampaigns: 1,
                contentPublished: 1,
                tasksCompleted: 1,
                teamMembers: 3
            }
        });
    }

    if (url.includes('/auth/login')) {
        const { email, password } = req.body;
        if (email === 'admin@example.com' && password === 'admin123') {
            return res.status(200).json({
                success: true,
                user: mockUsers[0],
                token: 'mock-jwt-token'
            });
        }
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (url.includes('/platforms')) {
        return res.status(200).json([
            { id: 1, name: "Facebook", status: "active", icon: "facebook" },
            { id: 2, name: "Instagram", status: "active", icon: "instagram" },
            { id: 3, name: "Twitter", status: "active", icon: "twitter" },
            { id: 4, name: "LinkedIn", status: "active", icon: "linkedin" },
            { id: 5, name: "YouTube", status: "active", icon: "youtube" }
        ]);
    }

    if (url.includes('/master-data')) {
        return res.status(200).json({
            asset_types: [
                { id: 1, name: "Image", status: "active" },
                { id: 2, name: "Video", status: "active" },
                { id: 3, name: "Document", status: "active" },
                { id: 4, name: "Infographic", status: "active" }
            ],
            categories: [
                { id: 1, name: "Marketing Materials", status: "active" },
                { id: 2, name: "Product Assets", status: "active" },
                { id: 3, name: "Brand Assets", status: "active" }
            ],
            priorities: [
                { id: 1, name: "Low", value: "low" },
                { id: 2, name: "Medium", value: "medium" },
                { id: 3, name: "High", value: "high" }
            ]
        });
    }

    if (url.includes('/countries')) {
        return res.status(200).json([
            { id: 1, name: "United States", code: "US", status: "active" },
            { id: 2, name: "United Kingdom", code: "UK", status: "active" },
            { id: 3, name: "Canada", code: "CA", status: "active" },
            { id: 4, name: "Australia", code: "AU", status: "active" },
            { id: 5, name: "India", code: "IN", status: "active" }
        ]);
    }

    if (url.includes('/country-master')) {
        if (url.includes('/list/regions')) {
            return res.status(200).json([
                "North America",
                "Europe", 
                "Asia Pacific",
                "Latin America",
                "Middle East",
                "Africa"
            ]);
        } else {
            return res.status(200).json([
                {
                    id: 1,
                    country_name: "United States",
                    iso_code: "US",
                    region: "North America",
                    default_language: "English",
                    allowed_for_backlinks: 1,
                    allowed_for_content_targeting: 1,
                    allowed_for_smm_targeting: 1,
                    status: "active",
                    created_at: "2024-01-01T00:00:00Z",
                    updated_at: "2024-01-01T00:00:00Z"
                },
                {
                    id: 2,
                    country_name: "United Kingdom",
                    iso_code: "UK",
                    region: "Europe",
                    default_language: "English",
                    allowed_for_backlinks: 1,
                    allowed_for_content_targeting: 1,
                    allowed_for_smm_targeting: 1,
                    status: "active",
                    created_at: "2024-01-01T00:00:00Z",
                    updated_at: "2024-01-01T00:00:00Z"
                },
                {
                    id: 3,
                    country_name: "Canada",
                    iso_code: "CA",
                    region: "North America",
                    default_language: "English",
                    allowed_for_backlinks: 1,
                    allowed_for_content_targeting: 1,
                    allowed_for_smm_targeting: 1,
                    status: "active",
                    created_at: "2024-01-01T00:00:00Z",
                    updated_at: "2024-01-01T00:00:00Z"
                }
            ]);
        }
    }

    if (url.includes('/regions')) {
        return res.status(200).json([
            { id: 1, name: "North America", code: "NA", country_id: 1, status: "active" },
            { id: 2, name: "Europe", code: "EU", country_id: 2, status: "active" },
            { id: 3, name: "Asia Pacific", code: "APAC", country_id: 5, status: "active" },
            { id: 4, name: "North America East", code: "NAE", country_id: 3, status: "active" },
            { id: 5, name: "Oceania", code: "OC", country_id: 4, status: "active" }
        ]);
    }

    if (url.includes('/qc-weightage')) {
        if (url.includes('/list/checklists')) {
            return res.status(200).json([
                {
                    id: 1,
                    checklist_name: "Content Quality Check",
                    checklist_type: "Content",
                    checklist_category: "Quality",
                    status: "active"
                },
                {
                    id: 2,
                    checklist_name: "SEO Compliance",
                    checklist_type: "SEO",
                    checklist_category: "Technical",
                    status: "active"
                },
                {
                    id: 3,
                    checklist_name: "Design Review",
                    checklist_type: "Design",
                    checklist_category: "Visual",
                    status: "active"
                },
                {
                    id: 4,
                    checklist_name: "Performance Metrics",
                    checklist_type: "Performance",
                    checklist_category: "Analytics",
                    status: "active"
                }
            ]);
        } else if (url.match(/\/qc-weightage\/\d+/)) {
            // Return specific config details with items
            return res.status(200).json({
                id: 1,
                config_name: "Standard QC Weightage",
                description: "Default quality control weightage configuration",
                total_weight: 100,
                is_valid: true,
                status: "active",
                item_count: 3,
                created_at: "2024-01-01T00:00:00Z",
                updated_at: "2024-01-01T00:00:00Z",
                items: [
                    {
                        id: 1,
                        checklist_id: 1,
                        checklist_name: "Content Quality Check",
                        checklist_type: "Content",
                        weight_percentage: 40,
                        is_mandatory: true,
                        applies_to_stage: "Review"
                    },
                    {
                        id: 2,
                        checklist_id: 2,
                        checklist_name: "SEO Compliance",
                        checklist_type: "SEO",
                        weight_percentage: 35,
                        is_mandatory: true,
                        applies_to_stage: "Approved"
                    },
                    {
                        id: 3,
                        checklist_id: 3,
                        checklist_name: "Design Review",
                        checklist_type: "Design",
                        weight_percentage: 25,
                        is_mandatory: false,
                        applies_to_stage: "Draft"
                    }
                ]
            });
        } else if (req.method === 'GET') {
            return res.status(200).json([
                {
                    id: 1,
                    config_name: "Standard QC Weightage",
                    description: "Default quality control weightage configuration",
                    total_weight: 100,
                    is_valid: true,
                    status: "active",
                    item_count: 3,
                    created_at: "2024-01-01T00:00:00Z",
                    updated_at: "2024-01-01T00:00:00Z"
                },
                {
                    id: 2,
                    config_name: "Strict QC Weightage",
                    description: "Strict quality control weightage for critical assets",
                    total_weight: 100,
                    is_valid: true,
                    status: "active",
                    item_count: 4,
                    created_at: "2024-01-02T00:00:00Z",
                    updated_at: "2024-01-02T00:00:00Z"
                }
            ]);
        } else if (req.method === 'POST') {
            return res.status(201).json({
                success: true,
                message: "QC weightage configuration created successfully"
            });
        } else if (req.method === 'PUT') {
            return res.status(200).json({
                success: true,
                message: "QC weightage configuration updated successfully"
            });
        } else if (req.method === 'DELETE') {
            return res.status(200).json({
                success: true,
                message: "QC weightage configuration deleted successfully"
            });
        }
    }

    if (url.includes('/dashboards/performance')) {
        return res.status(200).json({
            success: true,
            data: {
                kpis: [
                    { name: "Task Completion Rate", value: 85, target: 90, unit: "%" },
                    { name: "Quality Score", value: 92, target: 95, unit: "%" },
                    { name: "Productivity Index", value: 78, target: 80, unit: "%" },
                    { name: "On-Time Delivery", value: 88, target: 85, unit: "%" }
                ],
                trends: [
                    { month: "Jan", actual: 82, target: 85 },
                    { month: "Feb", actual: 85, target: 85 },
                    { month: "Mar", actual: 88, target: 90 },
                    { month: "Apr", actual: 85, target: 90 }
                ],
                topPerformers: [
                    { name: "John Doe", score: 95, tasks: 45 },
                    { name: "Jane Smith", score: 92, tasks: 42 },
                    { name: "Mike Johnson", score: 88, tasks: 38 }
                ]
            }
        });
    }

    if (url.includes('/dashboards/effort')) {
        return res.status(200).json({
            success: true,
            data: {
                totalEffort: 1250,
                plannedEffort: 1400,
                efficiency: 89,
                breakdown: [
                    { category: "Development", hours: 450, percentage: 36 },
                    { category: "Design", hours: 320, percentage: 26 },
                    { category: "Testing", hours: 280, percentage: 22 },
                    { category: "Documentation", hours: 200, percentage: 16 }
                ],
                trends: [
                    { week: "W1", planned: 350, actual: 320 },
                    { week: "W2", planned: 350, actual: 340 },
                    { week: "W3", planned: 350, actual: 310 },
                    { week: "W4", planned: 350, actual: 380 }
                ]
            }
        });
    }

    // Default response
    res.status(404).json({ 
        error: 'Endpoint not found', 
        url: url,
        availableEndpoints: ['/health', '/assets', '/users', '/services', '/projects', '/campaigns', '/dashboard/stats', '/auth/login', '/platforms', '/master-data', '/countries', '/regions', '/qc-weightage', '/dashboards/performance', '/dashboards/effort', '/country-master']
    });
};
