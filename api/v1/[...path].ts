import type { VercelRequest, VercelResponse } from '@vercel/node';

// Global in-memory storage for this serverless function instance
const memoryStorage: Record<string, any[]> = {};

const DEFAULT_DATA: Record<string, any[]> = {
    users: [
        { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active', department: 'Administration', password_hash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9' },
        { id: 2, name: 'John Smith', email: 'john@example.com', role: 'SEO', status: 'active', department: 'Marketing' },
        { id: 3, name: 'Sarah Chen', email: 'sarah@example.com', role: 'Content', status: 'active', department: 'Content' }
    ],
    roles: [
        { id: 1, role_name: 'Admin', permissions: { read: true, write: true, delete: true }, status: 'Active' },
        { id: 2, role_name: 'SEO', permissions: { read: true, write: true, delete: false }, status: 'Active' }
    ],
    teams: [
        { id: 1, name: 'Content Team', lead_user_id: 3, description: 'Content creation and management' }
    ],
    teamMembers: [],
    assets: [],
    assetLibrary: [
        { id: 1, name: 'Sample Web Asset', type: 'Image', application_type: 'web', status: 'Pending QC Review', submitted_by: 2, created_at: new Date().toISOString() },
        { id: 2, name: 'Sample SEO Asset', type: 'Document', application_type: 'seo', status: 'Pending QC Review', submitted_by: 3, created_at: new Date().toISOString() }
    ],
    assetTypeMaster: [
        { id: 1, asset_type_name: 'Image', status: 'active' },
        { id: 2, asset_type_name: 'Video', status: 'active' },
        { id: 3, asset_type_name: 'Document', status: 'active' }
    ],
    assetCategoryMaster: [
        { id: 1, category_name: 'Marketing', status: 'active' },
        { id: 2, category_name: 'Sales', status: 'active' }
    ],
    workflowStages: [],
    industrySectors: [],
    platforms: [],
    countries: [],
    seoErrors: [],
    contentTypes: [],
    services: [
        { id: 1, service_name: 'Web Development', status: 'active', description: 'Custom web development services' }
    ],
    subServices: [],
    tasks: [
        { id: 1, task_name: 'Write Blog Post', description: 'Create new blog content', status: 'In Progress', priority: 'High', assigned_to: 3 }
    ],
    campaigns: [],
    projects: [],
    notifications: [],
    qcChecklists: [],
    qcWeightageConfigs: [],
    assetFormats: []
};

async function getCollection(collection: string): Promise<any[]> {
    try {
        if (memoryStorage[collection] && Array.isArray(memoryStorage[collection])) {
            return memoryStorage[collection];
        }

        if (DEFAULT_DATA[collection]) {
            memoryStorage[collection] = JSON.parse(JSON.stringify(DEFAULT_DATA[collection]));
            return memoryStorage[collection];
        }

        memoryStorage[collection] = [];
        return memoryStorage[collection];
    } catch (error) {
        console.error(`[getCollection] Error for ${collection}:`, error);
        return [];
    }
}

async function saveCollection(collection: string, items: any[]): Promise<boolean> {
    try {
        memoryStorage[collection] = items;
        return true;
    } catch (error) {
        console.error(`[saveCollection] Error for ${collection}:`, error);
        return false;
    }
}

async function getNextId(collection: string): Promise<number> {
    try {
        const items = await getCollection(collection);
        return items.length > 0 ? Math.max(...items.map((i: any) => i.id || 0)) + 1 : 1;
    } catch (error) {
        console.error(`[getNextId] Error for ${collection}:`, error);
        return 1;
    }
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id, X-User-Role',
};

async function handleCRUD(req: VercelRequest, res: VercelResponse, collection: string, fullPath: string, method: string) {
    try {
        const pathParts = fullPath.split('/').filter(p => p);
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
    } catch (error: any) {
        console.error(`[CRUD Error] ${collection}:`, error);
        return res.status(500).json({ error: error.message || 'Internal server error', collection });
    }
}

async function handleQCReview(req: VercelRequest, res: VercelResponse, assetId: number, assets: any[]) {
    try {
        const { qc_score, qc_remarks, qc_decision, qc_reviewer_id, user_role } = req.body;

        if (!user_role || user_role.toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Only administrators can perform QC reviews.' });
        }

        if (!['approved', 'rejected', 'rework'].includes(qc_decision)) {
            return res.status(400).json({ error: 'QC decision must be "approved", "rejected", or "rework"' });
        }

        const assetIndex = assets.findIndex((a: any) => a.id === assetId);
        if (assetIndex === -1) {
            return res.status(404).json({ error: 'Asset not found', assetId, availableAssets: assets.map((a: any) => a.id) });
        }

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
    } catch (error: any) {
        console.error('[QC Review Error]', error);
        return res.status(500).json({ error: error.message || 'Failed to process QC review' });
    }
}

async function handleAssetLibrary(req: VercelRequest, res: VercelResponse, fullPath: string, method: string) {
    try {
        const pathParts = fullPath.split('/').filter(p => p);
        const id = pathParts[1] ? parseInt(pathParts[1]) : null;
        const action = pathParts[2];

        let assets = await getCollection('assetLibrary');
        if (!Array.isArray(assets)) assets = [];

        if (id && action === 'qc-review' && method === 'POST') {
            return handleQCReview(req, res, id, assets);
        }

        return handleCRUD(req, res, 'assetLibrary', fullPath, method);
    } catch (error: any) {
        console.error('[handleAssetLibrary Error]', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (req.method === 'OPTIONS') return res.status(200).json({ ok: true });

        Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));

        if (req.method === 'HEAD') {
            return res.status(200).end();
        }

        const { path } = req.query;
        let fullPath = '';

        try {
            if (Array.isArray(path)) {
                fullPath = path.join('/');
            } else if (typeof path === 'string') {
                fullPath = path;
            } else {
                fullPath = '';
            }
        } catch (e) {
            console.error('[Path parsing error]', e);
            fullPath = '';
        }

        const method = req.method || 'GET';

        if (!req.body && method !== 'GET' && method !== 'HEAD' && method !== 'DELETE') {
            req.body = {};
        }

        if (fullPath === 'assetLibrary' || fullPath.startsWith('assetLibrary')) return handleAssetLibrary(req, res, fullPath, method);
        if (fullPath === 'users' || fullPath.startsWith('users')) return handleCRUD(req, res, 'users', fullPath, method);
        if (fullPath === 'services' || fullPath.startsWith('services')) return handleCRUD(req, res, 'services', fullPath, method);
        if (fullPath === 'tasks' || fullPath.startsWith('tasks')) return handleCRUD(req, res, 'tasks', fullPath, method);
        if (fullPath === 'asset-type-master' || fullPath.startsWith('asset-type-master')) return handleCRUD(req, res, 'assetTypeMaster', fullPath, method);
        if (fullPath === 'asset-category-master' || fullPath.startsWith('asset-category-master')) return handleCRUD(req, res, 'assetCategoryMaster', fullPath, method);
        if (fullPath === 'teams' || fullPath.startsWith('teams')) return handleCRUD(req, res, 'teams', fullPath, method);
        if (fullPath === 'roles' || fullPath.startsWith('roles')) return handleCRUD(req, res, 'roles', fullPath, method);

        return res.status(404).json({ error: `Route not found: ${fullPath}` });
    } catch (error: any) {
        console.error('[API Handler Error]', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
