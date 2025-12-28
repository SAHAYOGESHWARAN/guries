import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory storage for serverless (will reset on cold starts)
// For production, use a proper database like Vercel Postgres, PlanetScale, or Supabase
let storage: Record<string, any[]> = {
    assets: [],
    services: [],
    subServices: [],
    users: [
        { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'Admin', status: 'Active' },
        { id: 2, name: 'Test User', email: 'user@example.com', role: 'User', status: 'Active' }
    ],
    tasks: [],
    campaigns: [],
    projects: [],
    notifications: [],
    content: [],
    keywords: [],
    backlinks: [],
    submissions: [],
    assetTypeMaster: [],
    assetCategoryMaster: [],
    assetFormats: [],
    qcChecklists: [],
    qcRuns: [],
    qcWeightageConfigs: [],
    teams: [],
    roles: [
        { id: 1, name: 'Admin', permissions: ['all'] },
        { id: 2, name: 'User', permissions: ['read', 'write'] }
    ],
    industrySectors: [],
    contentTypes: [],
    platforms: [],
    countries: [],
    seoErrors: [],
    workflowStages: [],
    competitors: [],
    competitorBacklinks: [],
    toxicBacklinks: [],
    uxIssues: [],
    okrs: [],
    goldStandards: [],
    effortTargets: [],
    brands: [],
    personas: [],
    forms: [],
    graphics: [],
    smm: [],
    servicePages: [],
    integrations: [],
    logs: [],
    articles: [],
    urlErrors: [],
    onPageSeoAudits: [],
    emails: []
};

// Helper to get next ID
const getNextId = (collection: string): number => {
    const items = storage[collection] || [];
    return items.length > 0 ? Math.max(...items.map((i: any) => i.id)) + 1 : 1;
};

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).json({ ok: true });
    }

    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });

    const { path } = req.query;
    const pathArray = Array.isArray(path) ? path : [path];
    const fullPath = pathArray.join('/');
    const method = req.method || 'GET';

    try {
        // Route handling
        // Asset Library routes
        if (fullPath === 'assetLibrary' || fullPath.startsWith('assetLibrary')) {
            return handleAssetLibrary(req, res, fullPath, method);
        }

        // Users routes
        if (fullPath === 'users' || fullPath.startsWith('users')) {
            return handleCRUD(req, res, 'users', fullPath, method);
        }

        // Services routes
        if (fullPath === 'services' || fullPath.startsWith('services')) {
            return handleCRUD(req, res, 'services', fullPath, method);
        }

        // Sub-services routes
        if (fullPath === 'sub-services' || fullPath.startsWith('sub-services')) {
            return handleCRUD(req, res, 'subServices', fullPath, method);
        }

        // Tasks routes
        if (fullPath === 'tasks' || fullPath.startsWith('tasks')) {
            return handleCRUD(req, res, 'tasks', fullPath, method);
        }

        // Campaigns routes
        if (fullPath === 'campaigns' || fullPath.startsWith('campaigns')) {
            return handleCRUD(req, res, 'campaigns', fullPath, method);
        }

        // Projects routes
        if (fullPath === 'projects' || fullPath.startsWith('projects')) {
            return handleCRUD(req, res, 'projects', fullPath, method);
        }

        // Notifications routes
        if (fullPath === 'notifications' || fullPath.startsWith('notifications')) {
            return handleNotifications(req, res, fullPath, method);
        }

        // Content routes
        if (fullPath === 'content' || fullPath.startsWith('content')) {
            return handleCRUD(req, res, 'content', fullPath, method);
        }

        // Keywords routes
        if (fullPath === 'keywords' || fullPath.startsWith('keywords')) {
            return handleCRUD(req, res, 'keywords', fullPath, method);
        }

        // Asset Type Master routes
        if (fullPath === 'asset-type-master' || fullPath.startsWith('asset-type-master')) {
            return handleCRUD(req, res, 'assetTypeMaster', fullPath, method);
        }

        // Asset Category Master routes
        if (fullPath === 'asset-category-master' || fullPath.startsWith('asset-category-master')) {
            return handleCRUD(req, res, 'assetCategoryMaster', fullPath, method);
        }

        // Asset Formats routes
        if (fullPath === 'asset-formats' || fullPath.startsWith('asset-formats')) {
            return handleCRUD(req, res, 'assetFormats', fullPath, method);
        }

        // QC Checklists routes
        if (fullPath === 'qc-checklists' || fullPath.startsWith('qc-checklists')) {
            return handleCRUD(req, res, 'qcChecklists', fullPath, method);
        }

        // Teams routes
        if (fullPath === 'teams' || fullPath.startsWith('teams')) {
            return handleCRUD(req, res, 'teams', fullPath, method);
        }

        // Roles routes
        if (fullPath === 'roles' || fullPath.startsWith('roles')) {
            return handleCRUD(req, res, 'roles', fullPath, method);
        }

        // Backlinks routes
        if (fullPath === 'backlinks' || fullPath.startsWith('backlinks')) {
            return handleCRUD(req, res, 'backlinks', fullPath, method);
        }

        // Submissions routes
        if (fullPath === 'submissions' || fullPath.startsWith('submissions')) {
            return handleCRUD(req, res, 'submissions', fullPath, method);
        }

        // QC Runs routes
        if (fullPath === 'qc-runs' || fullPath.startsWith('qc-runs')) {
            return handleCRUD(req, res, 'qcRuns', fullPath, method);
        }

        // QC Weightage Configs routes
        if (fullPath === 'qc-weightage-configs' || fullPath.startsWith('qc-weightage-configs')) {
            return handleCRUD(req, res, 'qcWeightageConfigs', fullPath, method);
        }

        // QC Versions routes
        if (fullPath === 'qc-versions') {
            return res.status(200).json([]);
        }

        // Industry Sectors routes
        if (fullPath === 'industry-sectors' || fullPath.startsWith('industry-sectors')) {
            return handleCRUD(req, res, 'industrySectors', fullPath, method);
        }

        // Content Types routes
        if (fullPath === 'content-types' || fullPath.startsWith('content-types')) {
            return handleCRUD(req, res, 'contentTypes', fullPath, method);
        }

        // Platforms routes
        if (fullPath === 'platforms' || fullPath.startsWith('platforms')) {
            return handleCRUD(req, res, 'platforms', fullPath, method);
        }

        // Countries routes
        if (fullPath === 'countries' || fullPath.startsWith('countries')) {
            return handleCRUD(req, res, 'countries', fullPath, method);
        }

        // SEO Errors routes
        if (fullPath === 'seo-errors' || fullPath.startsWith('seo-errors')) {
            return handleCRUD(req, res, 'seoErrors', fullPath, method);
        }

        // Workflow Stages routes
        if (fullPath === 'workflow-stages' || fullPath.startsWith('workflow-stages')) {
            return handleCRUD(req, res, 'workflowStages', fullPath, method);
        }

        // Competitors routes
        if (fullPath === 'competitors' || fullPath.startsWith('competitors')) {
            return handleCRUD(req, res, 'competitors', fullPath, method);
        }

        // Competitor Backlinks routes
        if (fullPath === 'competitor-backlinks' || fullPath.startsWith('competitor-backlinks')) {
            return handleCRUD(req, res, 'competitorBacklinks', fullPath, method);
        }

        // Toxic Backlinks routes
        if (fullPath === 'toxic-backlinks' || fullPath.startsWith('toxic-backlinks')) {
            return handleCRUD(req, res, 'toxicBacklinks', fullPath, method);
        }

        // UX Issues routes
        if (fullPath === 'ux-issues' || fullPath.startsWith('ux-issues')) {
            return handleCRUD(req, res, 'uxIssues', fullPath, method);
        }

        // OKRs routes
        if (fullPath === 'okrs' || fullPath.startsWith('okrs')) {
            return handleCRUD(req, res, 'okrs', fullPath, method);
        }

        // Gold Standards routes
        if (fullPath === 'gold-standards' || fullPath.startsWith('gold-standards')) {
            return handleCRUD(req, res, 'goldStandards', fullPath, method);
        }

        // Effort Targets routes
        if (fullPath === 'effort-targets' || fullPath.startsWith('effort-targets')) {
            return handleCRUD(req, res, 'effortTargets', fullPath, method);
        }

        // Brands routes
        if (fullPath === 'brands' || fullPath.startsWith('brands')) {
            return handleCRUD(req, res, 'brands', fullPath, method);
        }

        // Personas routes
        if (fullPath === 'personas' || fullPath.startsWith('personas')) {
            return handleCRUD(req, res, 'personas', fullPath, method);
        }

        // Forms routes
        if (fullPath === 'forms' || fullPath.startsWith('forms')) {
            return handleCRUD(req, res, 'forms', fullPath, method);
        }

        // Graphics routes
        if (fullPath === 'graphics' || fullPath.startsWith('graphics')) {
            return handleCRUD(req, res, 'graphics', fullPath, method);
        }

        // SMM routes
        if (fullPath === 'smm' || fullPath.startsWith('smm')) {
            return handleCRUD(req, res, 'smm', fullPath, method);
        }

        // Service Pages routes
        if (fullPath === 'service-pages' || fullPath.startsWith('service-pages')) {
            return handleCRUD(req, res, 'servicePages', fullPath, method);
        }

        // URL Errors routes
        if (fullPath === 'url-errors' || fullPath.startsWith('url-errors')) {
            return handleCRUD(req, res, 'urlErrors', fullPath, method);
        }

        // On-page SEO Audits routes
        if (fullPath === 'on-page-seo-audits' || fullPath.startsWith('on-page-seo-audits')) {
            return handleCRUD(req, res, 'onPageSeoAudits', fullPath, method);
        }

        // Integrations routes
        if (fullPath === 'integrations' || fullPath.startsWith('integrations')) {
            return handleCRUD(req, res, 'integrations', fullPath, method);
        }

        // Logs routes
        if (fullPath === 'logs' || fullPath.startsWith('logs')) {
            return handleCRUD(req, res, 'logs', fullPath, method);
        }

        // Knowledge Articles routes
        if (fullPath === 'knowledge/articles' || fullPath.startsWith('knowledge/articles')) {
            return handleCRUD(req, res, 'articles', fullPath.replace('knowledge/', ''), method);
        }

        // Settings routes
        if (fullPath === 'settings' || fullPath.startsWith('settings')) {
            if (method === 'GET') {
                return res.status(200).json({ theme: 'light', language: 'en' });
            }
            return res.status(200).json({ success: true });
        }

        // Analytics routes
        if (fullPath.startsWith('analytics/')) {
            return handleAnalytics(req, res, fullPath, method);
        }

        // HR routes
        if (fullPath.startsWith('hr/')) {
            return handleHR(req, res, fullPath, method);
        }

        // AI routes
        if (fullPath.startsWith('ai/')) {
            return handleAI(req, res, fullPath, method);
        }

        // Dashboard routes
        if (fullPath.startsWith('dashboards/')) {
            return handleDashboards(req, res, fullPath, method);
        }

        // Communication routes
        if (fullPath.startsWith('communication/')) {
            return handleCommunication(req, res, fullPath, method);
        }

        // Compliance routes
        if (fullPath.startsWith('compliance/')) {
            return handleCompliance(req, res, fullPath, method);
        }

        // Reports routes
        if (fullPath === 'reports/today') {
            return res.status(200).json({
                date: new Date().toISOString().split('T')[0],
                tasks_completed: 0,
                assets_created: 0,
                qc_reviews: 0
            });
        }

        // Uploads route
        if (fullPath === 'uploads' && method === 'POST') {
            return res.status(200).json({ url: req.body.data || '', filename: req.body.filename || 'upload' });
        }

        // Auth routes
        if (fullPath === 'auth/send-otp') {
            return res.status(200).json({ success: true, message: 'OTP sent' });
        }
        if (fullPath === 'auth/verify-otp') {
            return res.status(200).json({ success: true, token: 'mock-token' });
        }

        // Promotion Items (filtered content)
        if (fullPath === 'promotion-items') {
            const promotionItems = storage.content.filter((c: any) =>
                ['qc_passed', 'updated', 'ready_to_publish', 'published'].includes(c.status)
            );
            return res.status(200).json(promotionItems);
        }

        // Asset Categories (config)
        if (fullPath === 'asset-categories' || fullPath.startsWith('asset-categories')) {
            return handleCRUD(req, res, 'assetCategoryMaster', fullPath, method);
        }

        // Asset Types (config)
        if (fullPath === 'asset-types' || fullPath.startsWith('asset-types')) {
            return handleCRUD(req, res, 'assetTypeMaster', fullPath, method);
        }

        // Dashboard stats
        if (fullPath === 'dashboard/stats') {
            return res.status(200).json({
                totalAssets: storage.assets.length,
                totalTasks: storage.tasks.length,
                totalProjects: storage.projects.length,
                totalCampaigns: storage.campaigns.length
            });
        }

        // System stats
        if (fullPath === 'system/stats') {
            return res.status(200).json({
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: '2.5.0'
            });
        }

        // Default: return 404
        return res.status(404).json({ error: `Route not found: ${fullPath}` });

    } catch (error: any) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}

// Analytics handler
function handleAnalytics(req: VercelRequest, res: VercelResponse, fullPath: string, method: string) {
    if (fullPath === 'analytics/traffic') {
        return res.status(200).json([]);
    }
    if (fullPath === 'analytics/kpi') {
        return res.status(200).json({ total_visits: 0, conversions: 0, bounce_rate: 0 });
    }
    if (fullPath === 'analytics/dashboard-metrics') {
        return res.status(200).json({
            total_tasks: storage.tasks.length,
            completed_tasks: storage.tasks.filter((t: any) => t.status === 'Completed').length,
            total_assets: storage.assets.length,
            approved_assets: storage.assets.filter((a: any) => a.status === 'QC Approved').length
        });
    }
    return res.status(200).json({});
}

// HR handler
function handleHR(req: VercelRequest, res: VercelResponse, fullPath: string, method: string) {
    if (fullPath === 'hr/workload') {
        return res.status(200).json([]);
    }
    if (fullPath === 'hr/rewards') {
        return res.status(200).json([]);
    }
    if (fullPath === 'hr/rankings') {
        return res.status(200).json([]);
    }
    if (fullPath === 'hr/skills') {
        return res.status(200).json([]);
    }
    if (fullPath === 'hr/achievements') {
        return res.status(200).json([]);
    }
    return res.status(200).json({});
}

// AI handler
function handleAI(req: VercelRequest, res: VercelResponse, fullPath: string, method: string) {
    if (fullPath === 'ai/evaluations' && method === 'POST') {
        return res.status(200).json({
            score: Math.floor(Math.random() * 30) + 70,
            feedback: 'Good performance overall'
        });
    }
    return res.status(200).json({});
}

// Dashboards handler
function handleDashboards(req: VercelRequest, res: VercelResponse, fullPath: string, method: string) {
    const dashboardType = fullPath.replace('dashboards/', '');

    if (dashboardType === 'performance') {
        return res.status(200).json({ okrs: [], kpis: [], competitors: [], goldStandards: [] });
    }
    if (dashboardType === 'effort') {
        return res.status(200).json({ workCompletion: [], productivity: [] });
    }
    if (dashboardType === 'employee-scorecard') {
        return res.status(200).json({ employees: [], scores: [] });
    }
    if (dashboardType === 'employees') {
        return res.status(200).json(storage.users);
    }
    if (dashboardType === 'employee-comparison') {
        return res.status(200).json({ comparisons: [] });
    }
    if (dashboardType === 'team-performance-stats') {
        return res.status(200).json({ stats: [] });
    }
    if (dashboardType === 'team-leader') {
        return res.status(200).json({ team: [], tasks: [] });
    }
    if (dashboardType === 'ai-evaluation') {
        return res.status(200).json({ evaluations: [] });
    }
    if (dashboardType === 'rewards-penalties') {
        return res.status(200).json({ rewards: [], penalties: [] });
    }
    if (dashboardType === 'workload-prediction') {
        return res.status(200).json({ predictions: [], allocations: [] });
    }

    return res.status(200).json({});
}

// Communication handler
function handleCommunication(req: VercelRequest, res: VercelResponse, fullPath: string, method: string) {
    if (fullPath === 'communication/emails') {
        return handleCRUD(req, res, 'emails', fullPath, method);
    }
    if (fullPath === 'communication/voice-profiles') {
        return res.status(200).json([]);
    }
    if (fullPath === 'communication/calls') {
        return res.status(200).json([]);
    }
    return res.status(200).json([]);
}

// Compliance handler
function handleCompliance(req: VercelRequest, res: VercelResponse, fullPath: string, method: string) {
    if (fullPath === 'compliance/rules') {
        return res.status(200).json([]);
    }
    if (fullPath === 'compliance/audits') {
        return res.status(200).json([]);
    }
    return res.status(200).json([]);
}

// Generic CRUD handler
function handleCRUD(req: VercelRequest, res: VercelResponse, collection: string, fullPath: string, method: string) {
    const pathParts = fullPath.split('/');
    const id = pathParts.length > 1 ? parseInt(pathParts[1]) : null;

    switch (method) {
        case 'GET':
            if (id) {
                const item = storage[collection]?.find((i: any) => i.id === id);
                return item ? res.status(200).json(item) : res.status(404).json({ error: 'Not found' });
            }
            return res.status(200).json(storage[collection] || []);

        case 'POST':
            const newItem = { ...req.body, id: getNextId(collection), created_at: new Date().toISOString() };
            storage[collection] = storage[collection] || [];
            storage[collection].push(newItem);
            return res.status(201).json(newItem);

        case 'PUT':
            if (!id) return res.status(400).json({ error: 'ID required' });
            const updateIndex = storage[collection]?.findIndex((i: any) => i.id === id);
            if (updateIndex === -1) return res.status(404).json({ error: 'Not found' });
            storage[collection][updateIndex] = { ...storage[collection][updateIndex], ...req.body, updated_at: new Date().toISOString() };
            return res.status(200).json(storage[collection][updateIndex]);

        case 'DELETE':
            if (!id) return res.status(400).json({ error: 'ID required' });
            storage[collection] = storage[collection]?.filter((i: any) => i.id !== id) || [];
            return res.status(204).send('');

        default:
            return res.status(405).json({ error: 'Method not allowed' });
    }
}

// Asset Library handler with QC workflow
function handleAssetLibrary(req: VercelRequest, res: VercelResponse, fullPath: string, method: string) {
    const pathParts = fullPath.split('/');

    // Handle QC workflow routes
    if (pathParts.length >= 3) {
        const assetId = parseInt(pathParts[1]);
        const action = pathParts[2];

        if (action === 'qc-review' && method === 'POST') {
            return handleQCReview(req, res, assetId);
        }

        if (action === 'submit-qc' && method === 'POST') {
            return handleSubmitForQC(req, res, assetId);
        }

        if (action === 'usage') {
            return handleAssetUsage(req, res, assetId, pathParts.slice(3), method);
        }
    }

    // Handle pending QC assets
    if (fullPath === 'assetLibrary/qc/pending') {
        const pendingAssets = storage.assets.filter((a: any) =>
            a.status === 'Pending QC Review' || a.status === 'Rework Required'
        );
        return res.status(200).json(pendingAssets);
    }

    // Handle AI scores generation
    if (fullPath === 'assetLibrary/ai-scores' && method === 'POST') {
        return res.status(200).json({
            seo_score: Math.floor(Math.random() * 30) + 70,
            grammar_score: Math.floor(Math.random() * 20) + 80,
            analysis: {
                seo_feedback: 'Good SEO optimization',
                grammar_feedback: 'Excellent grammar and readability'
            }
        });
    }

    // Standard CRUD for assets
    const id = pathParts.length > 1 && !isNaN(parseInt(pathParts[1])) ? parseInt(pathParts[1]) : null;

    switch (method) {
        case 'GET':
            if (id) {
                const asset = storage.assets.find((a: any) => a.id === id);
                return asset ? res.status(200).json(asset) : res.status(404).json({ error: 'Asset not found' });
            }
            return res.status(200).json(storage.assets);

        case 'POST':
            const newAsset = {
                ...req.body,
                id: getNextId('assets'),
                status: req.body.status || 'Draft',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            storage.assets.push(newAsset);
            return res.status(201).json(newAsset);

        case 'PUT':
            if (!id) return res.status(400).json({ error: 'Asset ID required' });
            const assetIndex = storage.assets.findIndex((a: any) => a.id === id);
            if (assetIndex === -1) return res.status(404).json({ error: 'Asset not found' });
            storage.assets[assetIndex] = {
                ...storage.assets[assetIndex],
                ...req.body,
                updated_at: new Date().toISOString()
            };
            return res.status(200).json(storage.assets[assetIndex]);

        case 'DELETE':
            if (!id) return res.status(400).json({ error: 'Asset ID required' });
            storage.assets = storage.assets.filter((a: any) => a.id !== id);
            return res.status(204).send('');

        default:
            return res.status(405).json({ error: 'Method not allowed' });
    }
}

// QC Review handler
function handleQCReview(req: VercelRequest, res: VercelResponse, assetId: number) {
    const { qc_score, qc_remarks, qc_decision, qc_reviewer_id, user_role, checklist_items } = req.body;

    // Validate admin role
    if (!user_role || user_role.toLowerCase() !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Only administrators can perform QC reviews.' });
    }

    // Validate decision
    if (!['approved', 'rejected', 'rework'].includes(qc_decision)) {
        return res.status(400).json({ error: 'QC decision must be "approved", "rejected", or "rework"' });
    }

    const assetIndex = storage.assets.findIndex((a: any) => a.id === assetId);
    if (assetIndex === -1) {
        return res.status(404).json({ error: 'Asset not found' });
    }

    const asset = storage.assets[assetIndex];
    let newStatus: string;
    let newReworkCount = asset.rework_count || 0;

    switch (qc_decision) {
        case 'approved':
            newStatus = 'QC Approved';
            break;
        case 'rejected':
            newStatus = 'QC Rejected';
            break;
        case 'rework':
            newStatus = 'Rework Required';
            newReworkCount++;
            break;
        default:
            newStatus = 'Draft';
    }

    // Update asset
    storage.assets[assetIndex] = {
        ...asset,
        status: newStatus,
        qc_score: qc_score || 0,
        qc_remarks: qc_remarks || '',
        qc_reviewer_id,
        qc_reviewed_at: new Date().toISOString(),
        rework_count: newReworkCount,
        linking_active: qc_decision === 'approved',
        updated_at: new Date().toISOString()
    };

    // Create notification
    const notificationText = qc_decision === 'approved'
        ? `Asset "${asset.name || asset.asset_name}" has been approved!`
        : qc_decision === 'rework'
            ? `Asset "${asset.name || asset.asset_name}" requires rework.`
            : `Asset "${asset.name || asset.asset_name}" has been rejected.`;

    storage.notifications.push({
        id: getNextId('notifications'),
        user_id: asset.submitted_by,
        title: 'QC Review Update',
        message: notificationText,
        text: notificationText,
        type: qc_decision === 'approved' ? 'success' : qc_decision === 'rework' ? 'warning' : 'error',
        read: false,
        is_read: 0,
        created_at: new Date().toISOString()
    });

    return res.status(200).json(storage.assets[assetIndex]);
}

// Submit for QC handler
function handleSubmitForQC(req: VercelRequest, res: VercelResponse, assetId: number) {
    const { submitted_by, seo_score, grammar_score, rework_count } = req.body;

    const assetIndex = storage.assets.findIndex((a: any) => a.id === assetId);
    if (assetIndex === -1) {
        return res.status(404).json({ error: 'Asset not found' });
    }

    storage.assets[assetIndex] = {
        ...storage.assets[assetIndex],
        status: 'Pending QC Review',
        submitted_by,
        submitted_at: new Date().toISOString(),
        seo_score: seo_score || storage.assets[assetIndex].seo_score,
        grammar_score: grammar_score || storage.assets[assetIndex].grammar_score,
        rework_count: rework_count || storage.assets[assetIndex].rework_count || 0,
        updated_at: new Date().toISOString()
    };

    // Create notification for admins
    storage.notifications.push({
        id: getNextId('notifications'),
        user_id: null,
        title: 'New QC Submission',
        message: `Asset "${storage.assets[assetIndex].name || storage.assets[assetIndex].asset_name}" has been submitted for QC review.`,
        text: `Asset "${storage.assets[assetIndex].name || storage.assets[assetIndex].asset_name}" has been submitted for QC review.`,
        type: 'info',
        read: false,
        is_read: 0,
        created_at: new Date().toISOString()
    });

    return res.status(200).json(storage.assets[assetIndex]);
}

// Asset Usage handler
function handleAssetUsage(req: VercelRequest, res: VercelResponse, assetId: number, subPath: string[], method: string) {
    const usageType = subPath[0]; // website, social, backlinks, metrics

    // Initialize usage storage if not exists
    if (!storage[`asset_usage_${usageType}`]) {
        storage[`asset_usage_${usageType}`] = [];
    }

    const usageCollection = `asset_usage_${usageType}`;

    switch (method) {
        case 'GET':
            const usageData = storage[usageCollection]?.filter((u: any) => u.asset_id === assetId) || [];
            return res.status(200).json(usageData);

        case 'POST':
            const newUsage = {
                ...req.body,
                id: getNextId(usageCollection),
                asset_id: assetId,
                created_at: new Date().toISOString()
            };
            storage[usageCollection].push(newUsage);
            return res.status(201).json(newUsage);

        case 'PUT':
            const usageId = subPath[1] ? parseInt(subPath[1]) : null;
            if (!usageId) return res.status(400).json({ error: 'Usage ID required' });
            const usageIndex = storage[usageCollection]?.findIndex((u: any) => u.id === usageId);
            if (usageIndex === -1) return res.status(404).json({ error: 'Usage not found' });
            storage[usageCollection][usageIndex] = { ...storage[usageCollection][usageIndex], ...req.body };
            return res.status(200).json(storage[usageCollection][usageIndex]);

        case 'DELETE':
            const deleteUsageId = subPath[1] ? parseInt(subPath[1]) : null;
            if (!deleteUsageId) return res.status(400).json({ error: 'Usage ID required' });
            storage[usageCollection] = storage[usageCollection]?.filter((u: any) => u.id !== deleteUsageId) || [];
            return res.status(204).send('');

        default:
            return res.status(405).json({ error: 'Method not allowed' });
    }
}

// Notifications handler
function handleNotifications(req: VercelRequest, res: VercelResponse, fullPath: string, method: string) {
    const pathParts = fullPath.split('/');
    const id = pathParts.length > 1 && !isNaN(parseInt(pathParts[1])) ? parseInt(pathParts[1]) : null;
    const action = pathParts.length > 2 ? pathParts[2] : null;

    // Mark as read
    if (id && action === 'read' && method === 'PUT') {
        const notifIndex = storage.notifications.findIndex((n: any) => n.id === id);
        if (notifIndex === -1) return res.status(404).json({ error: 'Notification not found' });
        storage.notifications[notifIndex] = { ...storage.notifications[notifIndex], read: true, is_read: 1 };
        return res.status(200).json(storage.notifications[notifIndex]);
    }

    // Mark all as read
    if (fullPath === 'notifications/read-all' && method === 'PUT') {
        storage.notifications = storage.notifications.map((n: any) => ({ ...n, read: true, is_read: 1 }));
        return res.status(200).json({ message: 'All marked as read' });
    }

    // Standard CRUD
    switch (method) {
        case 'GET':
            if (id) {
                const notif = storage.notifications.find((n: any) => n.id === id);
                return notif ? res.status(200).json(notif) : res.status(404).json({ error: 'Not found' });
            }
            // Return notifications with consistent format
            const notifications = storage.notifications.map((n: any) => ({
                ...n,
                text: n.text || n.message || n.title,
                read: n.read === true || n.is_read === 1,
                time: n.time || n.created_at
            }));
            return res.status(200).json(notifications.slice(0, 50));

        case 'POST':
            const newNotif = {
                ...req.body,
                id: getNextId('notifications'),
                read: false,
                is_read: 0,
                created_at: new Date().toISOString(),
                time: new Date().toISOString()
            };
            storage.notifications.unshift(newNotif);
            return res.status(201).json(newNotif);

        case 'DELETE':
            if (!id) return res.status(400).json({ error: 'ID required' });
            storage.notifications = storage.notifications.filter((n: any) => n.id !== id);
            return res.status(204).send('');

        default:
            return res.status(405).json({ error: 'Method not allowed' });
    }
}
