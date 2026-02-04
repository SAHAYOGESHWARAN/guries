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

    // Default response
    res.status(404).json({ 
        error: 'Endpoint not found', 
        url: url,
        availableEndpoints: ['/health', '/assets', '/users', '/services', '/projects', '/campaigns', '/dashboard/stats', '/auth/login']
    });
};
