import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function - Lightweight API Proxy
 * Routes API requests to external backend server
 * Optimized for Hobby plan (2048 MB memory limit)
 */

// In-memory storage for mock data
const mockData: { [key: string]: any[] } = {
    projects: [],
    tasks: [],
    users: [],
    campaigns: [],
    notifications: []
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Handle auth endpoints locally (mock authentication)
    if (req.url?.includes('/auth/login') && req.method === 'POST') {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password required' });
        }

        // Mock admin user
        if (email === 'admin@example.com' && password === 'admin123') {
            return res.status(200).json({
                success: true,
                user: {
                    id: 1,
                    email: 'admin@example.com',
                    name: 'Admin User',
                    role: 'admin',
                    status: 'active'
                },
                token: 'mock-jwt-token-' + Date.now(),
                message: 'Login successful'
            });
        }

        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    try {
        // Get backend URL from environment
        const backendUrl = process.env.BACKEND_URL;

        if (!backendUrl) {
            return res.status(503).json({
                success: false,
                error: 'Backend not configured',
                message: 'BACKEND_URL environment variable is not set. Please configure backend URL in Vercel environment variables.'
            });
        }

        // Extract the API path
        const path = req.url?.replace(/^\/api/, '') || '/';
        const targetUrl = `${backendUrl}${path}`;

        console.log(`[Proxy] ${req.method} ${targetUrl}`);

        // Prepare request options
        const options: RequestInit = {
            method: req.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        // Copy relevant headers from request
        if (req.headers['authorization']) {
            options.headers = {
                ...options.headers,
                'authorization': req.headers['authorization']
            };
        }

        // Add body for non-GET requests
        if (req.method && req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
            options.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        }

        // Make request to backend with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(targetUrl, {
            ...options,
            signal: controller.signal
        });

        clearTimeout(timeout);

        // If backend returns 404 or 5xx, fall back to mock data
        if (response.status === 404 || response.status >= 500) {
            console.log(`[Proxy] Backend returned ${response.status}, falling back to mock data`);
            return handleMockEndpoint(req, res);
        }

        // Get response data
        const data = await response.text();

        // Set response status
        res.status(response.status);

        // Copy relevant headers from backend response
        const contentType = response.headers.get('content-type');
        if (contentType) {
            res.setHeader('Content-Type', contentType);
        }

        // Send response
        res.send(data);
    } catch (error: any) {
        console.error('[Proxy Error]', error.message);

        if (!res.headersSent) {
            // Check if it's a timeout
            if (error.name === 'AbortError') {
                // Return mock data for common endpoints on timeout
                return handleMockEndpoint(req, res);
            }

            // Check if backend is unreachable
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                // Return mock data when backend is unavailable
                return handleMockEndpoint(req, res);
            }

            res.status(500).json({
                success: false,
                error: 'Proxy error',
                message: error.message
            });
        }
    }
}

// Handle mock endpoints when backend is unavailable
function handleMockEndpoint(req: VercelRequest, res: VercelResponse) {
    const path = req.url?.replace(/^\/api/, '') || '/';
    const method = req.method || 'GET';

    // Health check
    if (path === '/v1/health' || path === '/health') {
        return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // Projects - GET
    if (path === '/v1/projects' && method === 'GET') {
        // Normalize project data to match frontend expectations
        const normalizedProjects = mockData.projects.map((p: any) => ({
            ...p,
            project_name: p.project_name || p.name || '',
            name: p.project_name || p.name || '',
            status: p.status || 'active'
        }));
        return res.status(200).json({ success: true, data: normalizedProjects, message: 'Projects retrieved' });
    }

    // Projects - POST (create)
    if (path === '/v1/projects' && method === 'POST') {
        const project = {
            id: Date.now(),
            ...req.body,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        mockData.projects.push(project);
        return res.status(201).json({ success: true, data: project, message: 'Project created' });
    }

    // Projects - PUT (update)
    if (path.match(/^\/v1\/projects\/\d+$/) && method === 'PUT') {
        const id = parseInt(path.split('/').pop() || '0');
        const index = mockData.projects.findIndex(p => p.id === id);
        if (index !== -1) {
            mockData.projects[index] = { ...mockData.projects[index], ...req.body, updated_at: new Date().toISOString() };
            return res.status(200).json({ success: true, data: mockData.projects[index], message: 'Project updated' });
        }
        return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Projects - DELETE
    if (path.match(/^\/v1\/projects\/\d+$/) && method === 'DELETE') {
        const id = parseInt(path.split('/').pop() || '0');
        const index = mockData.projects.findIndex(p => p.id === id);
        if (index !== -1) {
            mockData.projects.splice(index, 1);
            return res.status(200).json({ success: true, message: 'Project deleted' });
        }
        return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Tasks - GET
    if (path === '/v1/tasks' && method === 'GET') {
        // Normalize task data to match frontend expectations
        const normalizedTasks = mockData.tasks.map((t: any) => ({
            ...t,
            title: t.title || t.task_name || '',
            task_name: t.title || t.task_name || '',
            status: t.status || 'pending'
        }));
        return res.status(200).json({ success: true, data: normalizedTasks, message: 'Tasks retrieved' });
    }

    // Tasks - POST (create)
    if (path === '/v1/tasks' && method === 'POST') {
        const task = {
            id: Date.now(),
            ...req.body,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        mockData.tasks.push(task);
        return res.status(201).json({ success: true, data: task, message: 'Task created' });
    }

    // Tasks - PUT (update)
    if (path.match(/^\/v1\/tasks\/\d+$/) && method === 'PUT') {
        const id = parseInt(path.split('/').pop() || '0');
        const index = mockData.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            mockData.tasks[index] = { ...mockData.tasks[index], ...req.body, updated_at: new Date().toISOString() };
            return res.status(200).json({ success: true, data: mockData.tasks[index], message: 'Task updated' });
        }
        return res.status(404).json({ success: false, error: 'Task not found' });
    }

    // Tasks - DELETE
    if (path.match(/^\/v1\/tasks\/\d+$/) && method === 'DELETE') {
        const id = parseInt(path.split('/').pop() || '0');
        const index = mockData.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            mockData.tasks.splice(index, 1);
            return res.status(200).json({ success: true, message: 'Task deleted' });
        }
        return res.status(404).json({ success: false, error: 'Task not found' });
    }

    // Dashboard stats
    if (path === '/v1/dashboard/stats') {
        return res.status(200).json({
            success: true,
            data: {
                totalProjects: mockData.projects.length,
                totalTasks: mockData.tasks.length,
                completedTasks: mockData.tasks.filter((t: any) => t.status === 'completed').length,
                activeCampaigns: mockData.campaigns.length
            }
        });
    }

    // Notifications - GET
    if (path === '/v1/notifications' && method === 'GET') {
        return res.status(200).json({ success: true, data: mockData.notifications, message: 'Notifications retrieved' });
    }

    // Users - GET
    if (path === '/v1/users' && method === 'GET') {
        return res.status(200).json({ success: true, data: mockData.users, message: 'Users retrieved' });
    }

    // Campaigns - GET
    if (path === '/v1/campaigns' && method === 'GET') {
        return res.status(200).json({ success: true, data: mockData.campaigns, message: 'Campaigns retrieved' });
    }

    // Campaigns - POST (create)
    if (path === '/v1/campaigns' && method === 'POST') {
        const campaign = {
            id: Date.now(),
            ...req.body,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        mockData.campaigns.push(campaign);
        return res.status(201).json({ success: true, data: campaign, message: 'Campaign created' });
    }

    // Services - GET
    if (path === '/v1/services' && method === 'GET') {
        return res.status(200).json({ success: true, data: [], message: 'Services retrieved' });
    }

    // Sub-services - GET
    if (path === '/v1/sub-services' && method === 'GET') {
        return res.status(200).json({ success: true, data: [], message: 'Sub-services retrieved' });
    }

    // Brands - GET
    if (path === '/v1/brands' && method === 'GET') {
        return res.status(200).json({ success: true, data: [], message: 'Brands retrieved' });
    }

    // Default: return 404 for unknown endpoints
    return res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: `Endpoint ${path} not found`
    });
