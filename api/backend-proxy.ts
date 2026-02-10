import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Serverless Function - Lightweight API Proxy
 * Routes API requests to external backend server
 * Optimized for Hobby plan (2048 MB memory limit)
 * 
 * When backend is unavailable, provides sensible fallbacks for demo purposes
 */

// Simple in-memory storage for demo/fallback mode with sample data
const demoData: { [key: string]: any[] } = {
    projects: [
        {
            id: 1,
            project_name: 'Website Redesign',
            name: 'Website Redesign',
            description: 'Complete redesign of company website with modern UI/UX',
            status: 'In Progress',
            priority: 'High',
            start_date: '2026-01-15',
            end_date: '2026-03-15',
            owner_id: 1,
            brand_id: 1,
            progress: 65,
            created_at: '2026-01-15T10:00:00Z',
            updated_at: '2026-02-10T15:30:00Z'
        },
        {
            id: 2,
            project_name: 'SEO Optimization',
            name: 'SEO Optimization',
            description: 'Improve organic search rankings and increase traffic',
            status: 'In Progress',
            priority: 'High',
            start_date: '2026-01-20',
            end_date: '2026-04-20',
            owner_id: 1,
            brand_id: 1,
            progress: 45,
            created_at: '2026-01-20T09:00:00Z',
            updated_at: '2026-02-10T14:20:00Z'
        },
        {
            id: 3,
            project_name: 'Content Marketing Campaign',
            name: 'Content Marketing Campaign',
            description: 'Create and publish high-quality content across all channels',
            status: 'Planning',
            priority: 'Medium',
            start_date: '2026-02-15',
            end_date: '2026-05-15',
            owner_id: 1,
            brand_id: 1,
            progress: 20,
            created_at: '2026-02-01T11:00:00Z',
            updated_at: '2026-02-10T13:45:00Z'
        },
        {
            id: 4,
            project_name: 'Social Media Strategy',
            name: 'Social Media Strategy',
            description: 'Develop and execute comprehensive social media strategy',
            status: 'Completed',
            priority: 'Medium',
            start_date: '2025-12-01',
            end_date: '2026-01-31',
            owner_id: 1,
            brand_id: 1,
            progress: 100,
            created_at: '2025-12-01T08:00:00Z',
            updated_at: '2026-02-01T16:00:00Z'
        }
    ],
    tasks: [
        {
            id: 101,
            task_name: 'Design Homepage Mockup',
            name: 'Design Homepage Mockup',
            title: 'Design Homepage Mockup',
            description: 'Create high-fidelity mockup for new homepage design',
            status: 'in_progress',
            priority: 'High',
            project_id: 1,
            assigned_to: 1,
            due_date: '2026-02-15',
            progress_stage: 'In Progress',
            qc_stage: 'In Review',
            created_at: '2026-01-20T10:00:00Z',
            updated_at: '2026-02-10T15:00:00Z'
        },
        {
            id: 102,
            task_name: 'Conduct Keyword Research',
            name: 'Conduct Keyword Research',
            title: 'Conduct Keyword Research',
            description: 'Research and identify high-value keywords for SEO',
            status: 'completed',
            priority: 'High',
            project_id: 2,
            assigned_to: 1,
            due_date: '2026-02-05',
            progress_stage: 'Completed',
            qc_stage: 'Approved',
            created_at: '2026-01-25T09:00:00Z',
            updated_at: '2026-02-05T14:30:00Z'
        },
        {
            id: 103,
            task_name: 'Write Blog Posts',
            name: 'Write Blog Posts',
            title: 'Write Blog Posts',
            description: 'Write 5 high-quality blog posts for content marketing',
            status: 'in_progress',
            priority: 'Medium',
            project_id: 3,
            assigned_to: 1,
            due_date: '2026-02-28',
            progress_stage: 'In Progress',
            qc_stage: 'Pending',
            created_at: '2026-02-05T10:00:00Z',
            updated_at: '2026-02-10T12:00:00Z'
        },
        {
            id: 104,
            task_name: 'Create Social Media Calendar',
            name: 'Create Social Media Calendar',
            title: 'Create Social Media Calendar',
            description: 'Plan and schedule social media posts for next quarter',
            status: 'pending',
            priority: 'Medium',
            project_id: 4,
            assigned_to: 1,
            due_date: '2026-02-20',
            progress_stage: 'Not Started',
            qc_stage: 'Pending',
            created_at: '2026-02-08T11:00:00Z',
            updated_at: '2026-02-10T11:00:00Z'
        },
        {
            id: 105,
            task_name: 'Optimize Page Speed',
            name: 'Optimize Page Speed',
            title: 'Optimize Page Speed',
            description: 'Improve website page load speed and performance',
            status: 'in_progress',
            priority: 'High',
            project_id: 2,
            assigned_to: 1,
            due_date: '2026-02-25',
            progress_stage: 'In Progress',
            qc_stage: 'In Review',
            created_at: '2026-02-01T09:00:00Z',
            updated_at: '2026-02-10T10:30:00Z'
        }
    ],
    users: [
        {
            id: 1,
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin',
            status: 'active'
        },
        {
            id: 2,
            email: 'john@example.com',
            name: 'John Designer',
            role: 'designer',
            status: 'active'
        },
        {
            id: 3,
            email: 'sarah@example.com',
            name: 'Sarah Writer',
            role: 'content_writer',
            status: 'active'
        }
    ],
    campaigns: [
        {
            id: 201,
            campaign_name: 'Q1 Marketing Push',
            description: 'First quarter marketing campaign',
            status: 'active',
            start_date: '2026-01-01',
            end_date: '2026-03-31',
            created_at: '2026-01-01T08:00:00Z',
            updated_at: '2026-02-10T15:00:00Z'
        },
        {
            id: 202,
            campaign_name: 'Valentine\'s Day Promotion',
            description: 'Special Valentine\'s day promotional campaign',
            status: 'active',
            start_date: '2026-02-01',
            end_date: '2026-02-28',
            created_at: '2026-01-20T10:00:00Z',
            updated_at: '2026-02-10T14:00:00Z'
        }
    ],
    notifications: [
        {
            id: 1,
            message: 'Project "Website Redesign" is 65% complete',
            type: 'info',
            read: false,
            created_at: '2026-02-10T15:30:00Z'
        },
        {
            id: 2,
            message: 'Task "Design Homepage Mockup" is due tomorrow',
            type: 'warning',
            read: false,
            created_at: '2026-02-10T14:00:00Z'
        }
    ]
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

    try {
        // Get backend URL from environment
        const backendUrl = process.env.BACKEND_URL;

        if (backendUrl) {
            // Try to use the real backend
            return await proxyToBackend(req, res, backendUrl);
        } else {
            // Fall back to demo mode
            console.log('[Proxy] No BACKEND_URL configured, using demo mode');
            return handleDemoEndpoint(req, res);
        }
    } catch (error: any) {
        console.error('[Proxy Error]', error.message);

        if (!res.headersSent) {
            // On any error, try demo mode as fallback
            try {
                return handleDemoEndpoint(req, res);
            } catch (demoError) {
                res.status(500).json({
                    success: false,
                    error: 'Proxy error',
                    message: error.message
                });
            }
        }
    }
}

async function proxyToBackend(req: VercelRequest, res: VercelResponse, backendUrl: string) {
    // Extract the API path
    const path = req.url?.replace(/^\/api/, '') || '/';
    const targetUrl = `${backendUrl}${path}`;

    console.log(`[Proxy] Forwarding to backend: ${req.method} ${targetUrl}`);

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

    try {
        const response = await fetch(targetUrl, {
            ...options,
            signal: controller.signal
        });

        clearTimeout(timeout);

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
        clearTimeout(timeout);
        console.error('[Backend Error]', error.message);

        // If backend fails, fall back to demo mode
        console.log('[Proxy] Backend unavailable, falling back to demo mode');
        return handleDemoEndpoint(req, res);
    }
}

function handleDemoEndpoint(req: VercelRequest, res: VercelResponse) {
    const path = req.url?.replace(/^\/api/, '') || '/';
    const method = req.method || 'GET';

    // Health check
    if (path === '/v1/health' || path === '/health') {
        return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // Auth endpoints
    if (path === '/v1/auth/login' && method === 'POST') {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password required' });
        }

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
                token: 'demo-token-' + Date.now(),
                message: 'Login successful'
            });
        }

        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Projects - GET
    if (path === '/v1/projects' && method === 'GET') {
        const normalizedProjects = demoData.projects.map((p: any) => ({
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
        demoData.projects.push(project);
        return res.status(201).json({ success: true, data: project, message: 'Project created' });
    }

    // Projects - PUT (update)
    if (path.match(/^\/v1\/projects\/\d+$/) && method === 'PUT') {
        const id = parseInt(path.split('/').pop() || '0');
        const index = demoData.projects.findIndex(p => p.id === id);
        if (index !== -1) {
            demoData.projects[index] = { ...demoData.projects[index], ...req.body, updated_at: new Date().toISOString() };
            return res.status(200).json({ success: true, data: demoData.projects[index], message: 'Project updated' });
        }
        return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Projects - DELETE
    if (path.match(/^\/v1\/projects\/\d+$/) && method === 'DELETE') {
        const id = parseInt(path.split('/').pop() || '0');
        const index = demoData.projects.findIndex(p => p.id === id);
        if (index !== -1) {
            demoData.projects.splice(index, 1);
            return res.status(200).json({ success: true, message: 'Project deleted' });
        }
        return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Tasks - GET
    if (path === '/v1/tasks' && method === 'GET') {
        const normalizedTasks = demoData.tasks.map((t: any) => ({
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
        demoData.tasks.push(task);
        return res.status(201).json({ success: true, data: task, message: 'Task created' });
    }

    // Tasks - PUT (update)
    if (path.match(/^\/v1\/tasks\/\d+$/) && method === 'PUT') {
        const id = parseInt(path.split('/').pop() || '0');
        const index = demoData.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            demoData.tasks[index] = { ...demoData.tasks[index], ...req.body, updated_at: new Date().toISOString() };
            return res.status(200).json({ success: true, data: demoData.tasks[index], message: 'Task updated' });
        }
        return res.status(404).json({ success: false, error: 'Task not found' });
    }

    // Tasks - DELETE
    if (path.match(/^\/v1\/tasks\/\d+$/) && method === 'DELETE') {
        const id = parseInt(path.split('/').pop() || '0');
        const index = demoData.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            demoData.tasks.splice(index, 1);
            return res.status(200).json({ success: true, message: 'Task deleted' });
        }
        return res.status(404).json({ success: false, error: 'Task not found' });
    }

    // Dashboard stats
    if (path === '/v1/dashboard/stats') {
        return res.status(200).json({
            success: true,
            data: {
                totalProjects: demoData.projects.length,
                totalTasks: demoData.tasks.length,
                completedTasks: demoData.tasks.filter((t: any) => t.status === 'completed').length,
                activeCampaigns: demoData.campaigns.length
            }
        });
    }

    // Notifications - GET
    if (path === '/v1/notifications' && method === 'GET') {
        return res.status(200).json({ success: true, data: demoData.notifications, message: 'Notifications retrieved' });
    }

    // Users - GET
    if (path === '/v1/users' && method === 'GET') {
        return res.status(200).json({ success: true, data: demoData.users, message: 'Users retrieved' });
    }

    // Campaigns - GET
    if (path === '/v1/campaigns' && method === 'GET') {
        return res.status(200).json({ success: true, data: demoData.campaigns, message: 'Campaigns retrieved' });
    }

    // Campaigns - POST (create)
    if (path === '/v1/campaigns' && method === 'POST') {
        const campaign = {
            id: Date.now(),
            ...req.body,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        demoData.campaigns.push(campaign);
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

    // Default: return empty array for any unknown GET endpoint
    if (method === 'GET') {
        return res.status(200).json({ success: true, data: [], message: 'Data retrieved' });
    }

    // Default: return 404 for unknown endpoints
    return res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: `Endpoint ${path} not found`
    });
}
