import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

// Initialize Upstash Redis client
const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

// Check if Redis is configured
const isRedisConfigured = !!(redisUrl && redisToken);
let redis: Redis | null = null;
if (isRedisConfigured) {
    try {
        redis = new Redis({ url: redisUrl, token: redisToken });
        console.log('[Redis] Initialized successfully');
    } catch (e) {
        console.error('[Redis] Failed to initialize:', e);
    }
} else {
    console.log('[Redis] Not configured');
}

// In-memory fallback storage
const memoryStorage: Record<string, any[]> = {};

// Default data for collections
const DEFAULT_DATA: Record<string, any[]> = {
    users: [
        { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active', department: 'Administration', password_hash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9' },
        { id: 2, name: 'John Smith', email: 'john@example.com', role: 'SEO', status: 'active', department: 'Marketing', country: 'United States', target: '50', projects_count: 5, last_login: new Date().toISOString() },
        { id: 3, name: 'Sarah Chen', email: 'sarah@example.com', role: 'Content', status: 'active', department: 'Content', country: 'United Kingdom', target: '40', projects_count: 8, last_login: new Date().toISOString() },
        { id: 4, name: 'Mike Johnson', email: 'mike@example.com', role: 'Developer', status: 'active', department: 'Technology', country: 'Canada', target: '30', projects_count: 3, last_login: new Date().toISOString() }
    ],
    roles: [
        { id: 1, role_name: 'Admin', permissions: { read: true, write: true, delete: true }, status: 'Active' },
        { id: 2, role_name: 'SEO', permissions: { read: true, write: true, delete: false }, status: 'Active' },
        { id: 3, role_name: 'Content', permissions: { read: true, write: true, delete: false }, status: 'Active' },
        { id: 4, role_name: 'Developer', permissions: { read: true, write: true, delete: true }, status: 'Active' },
        { id: 5, role_name: 'Manager', permissions: { read: true, write: true, delete: true }, status: 'Active' }
    ],
    teams: [
        { id: 1, name: 'Content Team', lead_user_id: 3, description: 'Content creation and management' },
        { id: 2, name: 'SEO Team', lead_user_id: 2, description: 'Search engine optimization' },
        { id: 3, name: 'Development Team', lead_user_id: 4, description: 'Technical development' }
    ],
    teamMembers: [],
    assets: [
        { id: 1, name: 'Sample Asset', type: 'Image', asset_category: 'Marketing', application_type: 'web', status: 'Draft', created_at: new Date().toISOString() }
    ],
    assetLibrary: [
        { id: 1, name: 'Sample Web Asset', type: 'Image', application_type: 'web', status: 'Pending QC Review', submitted_by: 2, created_at: new Date().toISOString() }
    ],
    assetTypeMaster: [
        { id: 1, asset_type_name: 'Image', status: 'active' },
        { id: 2, asset_type_name: 'Video', status: 'active' },
        { id: 3, asset_type_name: 'Document', status: 'active' }
    ],
    assetCategoryMaster: [
        { id: 1, category_name: 'Marketing', status: 'active' },
        { id: 2, category_name: 'Sales', status: 'active' },
        { id: 3, category_name: 'Support', status: 'active' }
    ],
    workflowStages: [
        { id: 1, workflow_name: 'Content Production', stage_order: 1, total_stages: 4, stage_label: 'Draft', color_tag: 'blue', active_flag: 'Active' },
        { id: 2, workflow_name: 'Content Production', stage_order: 2, total_stages: 4, stage_label: 'Review', color_tag: 'amber', active_flag: 'Active' },
        { id: 3, workflow_name: 'Content Production', stage_order: 3, total_stages: 4, stage_label: 'QC', color_tag: 'purple', active_flag: 'Active' },
        { id: 4, workflow_name: 'Content Production', stage_order: 4, total_stages: 4, stage_label: 'Published', color_tag: 'green', active_flag: 'Active' }
    ],
    industrySectors: [
        { id: 1, industry: 'Technology', sector: 'Software Development', application: 'Web Services', country: 'United States', status: 'Active' }
    ],
    platforms: [
        { id: 1, platform_name: 'Facebook', content_types_count: 5, asset_types_count: 4, recommended_size: '1200x630', scheduling: 'Both', status: 'Active' }
    ],
    countries: [
        { id: 1, country_name: 'United States', code: 'US', region: 'North America', has_backlinks: true, has_content: true, has_smm: true, status: 'Active' }
    ],
    seoErrors: [
        { id: 1, error_type: 'Missing Meta Title', category: 'On-page', severity: 'High', description: 'Page is missing meta title tag', status: 'Published' }
    ],
    contentTypes: [
        { id: 1, content_type: 'Blog Post', category: 'Long-form', description: 'Standard blog article', default_attributes: ['Title', 'Body', 'Meta Description'], use_in_campaigns: 1, status: 'Active' }
    ],
    services: [
        { id: 1, service_name: 'Web Development', status: 'active', description: 'Custom web development services' },
        { id: 2, service_name: 'SEO Services', status: 'active', description: 'Search engine optimization' },
        { id: 3, service_name: 'Content Marketing', status: 'active', description: 'Content strategy and creation' },
        { id: 4, service_name: 'Social Media Marketing', status: 'active', description: 'Social media management' }
    ],
    subServices: [],
    tasks: [
        { id: 1, task_name: 'Write Blog Post', description: 'Create new blog content', status: 'In Progress', priority: 'High', assigned_to: 3 },
        { id: 2, task_name: 'SEO Audit', description: 'Perform website SEO audit', status: 'Pending', priority: 'Medium', assigned_to: 2 }
    ],
    campaigns: [
        { id: 1, campaign_name: 'Q1 Marketing Campaign', campaign_type: 'Digital Marketing', status: 'active', description: 'First quarter marketing initiative' }
    ],
    projects: [
        { id: 1, project_name: 'Website Redesign', project_code: 'WR-001', status: 'Active', description: 'Complete website overhaul' }
    ],
    notifications: [],
    qcChecklists: [
        { id: 1, checklist_name: 'Content QC', checklist_type: 'content', category: 'Content', number_of_items: 10, scoring_mode: 'weighted', pass_threshold: 70, status: 'active' }
    ],
    qcWeightageConfigs: [],
    assetFormats: [
        { id: 1, format_name: 'JPEG', extension: '.jpg', mime_type: 'image/jpeg', status: 'active' },
        { id: 2, format_name: 'PNG', extension: '.png', mime_type: 'image/png', status: 'active' },
        { id: 3, format_name: 'PDF', extension: '.pdf', mime_type: 'application/pdf', status: 'active' }
    ]
};

// Helper to get collection from Redis or defaults
async function getCollection(collection: string): Promise<any[]> {
    if (redis) {
        try {
            const data = await redis.get<any[]>(`mcc:${collection}`);
            if (data && Array.isArray(data)) {
                return data;
            }
        } catch (e: any) {
            console.log(`[Redis] Error fetching ${collection}:`, e.message);
        }
    }
    return memoryStorage[collection] || DEFAULT_DATA[collection] || [];
}

// Helper to save collection to Redis
async function saveCollection(collection: string, items: any[]): Promise<boolean> {
    if (redis) {
        try {
            await redis.set(`mcc:${collection}`, items);
            return true;
        } catch (e: any) {
            console.error(`[Redis] Error saving ${collection}:`, e.message);
        }
    }
    memoryStorage[collection] = items;
    return false;
}

// Helper to get next ID
async function getNextId(collection: string): Promise<number> {
    const items = await getCollection(collection);
    return items.length > 0 ? Math.max(...items.map((i: any) => i.id || 0)) + 1 : 1;
}

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Generic CRUD handler
async function handleCRUD(req: VercelRequest, res: VercelResponse, collection: string, fullPath: string, method: string) {
    const pathParts = fullPath.split('/');
    const id = pathParts.length > 1 && !isNaN(parseInt(pathParts[1])) ? parseInt(pathParts[1]) : null;
    let items = await getCollection(collection);

    switch (method) {
        case 'GET':
            if (id) {
                const item = items.find((i: any) => i.id === id);
                return item ? res.status(200).json(item) : res.status(404).json({ error: 'Not found' });
            }
            return res.status(200).json(items);
        case 'POST':
            const newId = await getNextId(collection);
            const newItem = {
                ...req.body,
                id: newId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            items.push(newItem);
            await saveCollection(collection, items);
            return res.status(201).json(newItem);
        case 'PUT':
            if (!id) return res.status(400).json({ error: 'ID required' });
            const updateIndex = items.findIndex((i: any) => i.id === id);
            if (updateIndex === -1) return res.status(404).json({ error: 'Not found' });
            items[updateIndex] = {
                ...items[updateIndex],
                ...req.body,
                id: id,
                updated_at: new Date().toISOString()
            };
            await saveCollection(collection, items);
            return res.status(200).json(items[updateIndex]);
        case 'DELETE':
            if (!id) return res.status(400).json({ error: 'ID required' });
            const deleteIndex = items.findIndex((i: any) => i.id === id);
            if (deleteIndex === -1) return res.status(404).json({ error: 'Not found' });
            items = items.filter((i: any) => i.id !== id);
            await saveCollection(collection, items);
            return res.status(204).send('');
        default:
            return res.status(405).json({ error: 'Method not allowed' });
    }
}

// QC Review handler
async function handleQCReview(req: VercelRequest, res: VercelResponse, assetId: number, assets: any[]) {
    const { qc_score, qc_remarks, qc_decision, qc_reviewer_id, user_role } = req.body;

    if (!user_role || user_role.toLowerCase() !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Only administrators can perform QC reviews.' });
    }

    if (!['approved', 'rejected', 'rework'].includes(qc_decision)) {
        return res.status(400).json({ error: 'QC decision must be "approved", "rejected", or "rework"' });
    }

    const assetIndex = assets.findIndex((a: any) => a.id === assetId);
    if (assetIndex === -1) return res.status(404).json({ error: 'Asset not found' });

    const asset = assets[assetIndex];
    const newStatus = qc_decision === 'approved' ? 'QC Approved' : qc_decision === 'rejected' ? 'QC Rejected' : 'Rework Required';
    let newReworkCount = asset.rework_count || 0;
    if (qc_decision === 'rework') newReworkCount++;

    assets[assetIndex] = {
        ...asset,
        status: newStatus,
        qc_score: qc_score || 0,
        qc_remarks: qc_remarks || '',
        qc_reviewer_id,
        qc_reviewed_at: new Date().toISOString(),
        rework_count: newReworkCount,
        linking_active: qc_decision === 'approved' ? 1 : 0,
        updated_at: new Date().toISOString()
    };
    await saveCollection('assetLibrary', assets);

    // Create notification
    const notifications = await getCollection('notifications');
    const notifId = await getNextId('notifications');
    const notificationText = qc_decision === 'approved' ? `Asset "${asset.name}" approved!` : qc_decision === 'rework' ? `Asset "${asset.name}" requires rework.` : `Asset "${asset.name}" rejected.`;
    notifications.unshift({
        id: notifId,
        user_id: asset.submitted_by,
        title: 'QC Review Update',
        message: notificationText,
        text: notificationText,
        type: qc_decision === 'approved' ? 'success' : qc_decision === 'rework' ? 'warning' : 'error',
        read: false,
        is_read: 0,
        created_at: new Date().toISOString(),
        time: new Date().toISOString()
    });
    await saveCollection('notifications', notifications);

    return res.status(200).json(assets[assetIndex]);
}

// Asset Library handler
async function handleAssetLibrary(req: VercelRequest, res: VercelResponse, fullPath: string, method: string) {
    const pathParts = fullPath.split('/');
    const id = pathParts[1] ? parseInt(pathParts[1]) : null;
    const action = pathParts[2];

    let assets = await getCollection('assetLibrary');
    if (!Array.isArray(assets)) assets = [];

    // Handle QC Review endpoint: /assetLibrary/:id/qc-review
    if (id && action === 'qc-review' && method === 'POST') {
        return handleQCReview(req, res, id, assets);
    }

    // Default CRUD handling for assetLibrary
    return handleCRUD(req, res, 'assetLibrary', fullPath, method);
}

// Main handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle preflight and HEAD requests
    if (req.method === 'OPTIONS') return res.status(200).json({ ok: true });

    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));

    // Handle HEAD requests
    if (req.method === 'HEAD') {
        return res.status(200).end();
    }

    const { path } = req.query;
    const pathArray = Array.isArray(path) ? path : [path];
    const fullPath = pathArray.join('/');
    const method = req.method || 'GET';

    try {
        // Route handling
        if (fullPath === 'assetLibrary' || fullPath.startsWith('assetLibrary')) return handleAssetLibrary(req, res, fullPath, method);
        if (fullPath === 'users' || fullPath.startsWith('users')) return handleCRUD(req, res, 'users', fullPath, method);
        if (fullPath === 'services' || fullPath.startsWith('services')) return handleCRUD(req, res, 'services', fullPath, method);
        if (fullPath === 'tasks' || fullPath.startsWith('tasks')) return handleCRUD(req, res, 'tasks', fullPath, method);
        if (fullPath === 'campaigns' || fullPath.startsWith('campaigns')) return handleCRUD(req, res, 'campaigns', fullPath, method);
        if (fullPath === 'projects' || fullPath.startsWith('projects')) return handleCRUD(req, res, 'projects', fullPath, method);
        if (fullPath === 'asset-type-master' || fullPath.startsWith('asset-type-master')) return handleCRUD(req, res, 'assetTypeMaster', fullPath, method);
        if (fullPath === 'asset-category-master' || fullPath.startsWith('asset-category-master')) return handleCRUD(req, res, 'assetCategoryMaster', fullPath, method);
        if (fullPath === 'asset-formats' || fullPath.startsWith('asset-formats')) return handleCRUD(req, res, 'assetFormats', fullPath, method);
        if (fullPath === 'teams' || fullPath.startsWith('teams')) return handleCRUD(req, res, 'teams', fullPath, method);
        if (fullPath === 'roles' || fullPath.startsWith('roles')) return handleCRUD(req, res, 'roles', fullPath, method);
        if (fullPath === 'industry-sectors' || fullPath.startsWith('industry-sectors')) return handleCRUD(req, res, 'industrySectors', fullPath, method);
        if (fullPath === 'content-types' || fullPath.startsWith('content-types')) return handleCRUD(req, res, 'contentTypes', fullPath, method);
        if (fullPath === 'platforms' || fullPath.startsWith('platforms')) return handleCRUD(req, res, 'platforms', fullPath, method);
        if (fullPath === 'countries' || fullPath.startsWith('countries')) return handleCRUD(req, res, 'countries', fullPath, method);
        if (fullPath === 'seo-errors' || fullPath.startsWith('seo-errors')) return handleCRUD(req, res, 'seoErrors', fullPath, method);
        if (fullPath === 'workflow-stages' || fullPath.startsWith('workflow-stages')) return handleCRUD(req, res, 'workflowStages', fullPath, method);

        return res.status(404).json({ error: `Route not found: ${fullPath}` });
    } catch (error: any) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
