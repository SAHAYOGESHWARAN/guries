import type { VercelRequest, VercelResponse } from '@vercel/node';

const memoryStorage: Record<string, any[]> = {};

const DEFAULT_DATA: Record<string, any[]> = {
    users: [
        { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active' },
        { id: 2, name: 'John Smith', email: 'john@example.com', role: 'SEO', status: 'active' },
        { id: 3, name: 'Sarah Chen', email: 'sarah@example.com', role: 'Content', status: 'active' }
    ],
    assetLibrary: [
        { id: 1, name: 'Sample Web Asset', type: 'Image', application_type: 'web', status: 'Pending QC Review', submitted_by: 2 },
        { id: 2, name: 'Sample SEO Asset', type: 'Document', application_type: 'seo', status: 'Pending QC Review', submitted_by: 3 }
    ],
    services: [
        { id: 1, service_name: 'Web Development', status: 'active' }
    ],
    tasks: [
        { id: 1, task_name: 'Write Blog Post', status: 'In Progress' }
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
    notifications: [],
    roles: [],
    teams: [],
    workflowStages: [],
    industrySectors: [],
    platforms: [],
    countries: [],
    seoErrors: [],
    contentTypes: [],
    subServices: [],
    campaigns: [],
    projects: [],
    qcChecklists: [],
    qcWeightageConfigs: [],
    assetFormats: []
};

function getCollection(collection: string): any[] {
    if (memoryStorage[collection]) return memoryStorage[collection];
    if (DEFAULT_DATA[collection]) {
        memoryStorage[collection] = JSON.parse(JSON.stringify(DEFAULT_DATA[collection]));
        return memoryStorage[collection];
    }
    memoryStorage[collection] = [];
    return memoryStorage[collection];
}

function saveCollection(collection: string, items: any[]): void {
    memoryStorage[collection] = items;
}

function getNextId(collection: string): number {
    const items = getCollection(collection);
    return items.length > 0 ? Math.max(...items.map((i: any) => i.id || 0)) + 1 : 1;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id, X-User-Role');

    if (req.method === 'OPTIONS') {
        return res.status(200).json({ ok: true });
    }

    try {
        // Get path from query parameter - Vercel passes it as an array
        let fullPath = '';
        if (req.query.path) {
            if (Array.isArray(req.query.path)) {
                fullPath = req.query.path.join('/');
            } else {
                fullPath = req.query.path as string;
            }
        }

        const method = req.method || 'GET';
        const body = req.body || {};

        // Parse path into parts
        const parts = fullPath.split('/').filter(p => p);
        const collection = parts[0];
        const id = parts[1] ? parseInt(parts[1]) : null;
        const action = parts[2];

        // Handle QC Review endpoint
        if (collection === 'assetLibrary' && id && action === 'qc-review' && method === 'POST') {
            const { qc_decision, user_role } = body;

            if (user_role?.toLowerCase() !== 'admin') {
                return res.status(403).json({ error: 'Admin only' });
            }

            if (!['approved', 'rejected', 'rework'].includes(qc_decision)) {
                return res.status(400).json({ error: 'Invalid decision' });
            }

            const assets = getCollection('assetLibrary');
            const idx = assets.findIndex((a: any) => a.id === id);

            if (idx === -1) {
                return res.status(404).json({ error: 'Asset not found' });
            }

            assets[idx] = {
                ...assets[idx],
                status: qc_decision === 'approved' ? 'QC Approved' : qc_decision === 'rejected' ? 'QC Rejected' : 'Rework Required',
                qc_score: body.qc_score || 0,
                qc_remarks: body.qc_remarks || '',
                qc_reviewer_id: body.qc_reviewer_id,
                qc_reviewed_at: new Date().toISOString(),
                linking_active: qc_decision === 'approved' ? 1 : 0
            };

            saveCollection('assetLibrary', assets);
            return res.status(200).json(assets[idx]);
        }

        // Handle standard CRUD operations
        let items = getCollection(collection);

        if (method === 'GET') {
            if (id) {
                const item = items.find((i: any) => i.id === id);
                return res.status(item ? 200 : 404).json(item || { error: 'Not found' });
            }
            return res.status(200).json(items);
        }

        if (method === 'POST') {
            const newId = getNextId(collection);
            const newItem = { ...body, id: newId, created_at: new Date().toISOString() };
            items.push(newItem);
            saveCollection(collection, items);
            return res.status(201).json(newItem);
        }

        if (method === 'PUT') {
            if (!id) return res.status(400).json({ error: 'ID required' });
            const idx = items.findIndex((i: any) => i.id === id);
            if (idx === -1) return res.status(404).json({ error: 'Not found' });
            items[idx] = { ...items[idx], ...body, id };
            saveCollection(collection, items);
            return res.status(200).json(items[idx]);
        }

        if (method === 'DELETE') {
            if (!id) return res.status(400).json({ error: 'ID required' });
            const idx = items.findIndex((i: any) => i.id === id);
            if (idx === -1) return res.status(404).json({ error: 'Not found' });
            items.splice(idx, 1);
            saveCollection(collection, items);
            return res.status(204).send('');
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message || 'Server error' });
    }
}
