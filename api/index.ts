import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as dataStore from './data-store';

// All collections the frontend uses
const ALL_COLLECTIONS = new Set([
    'assets', 'keywords', 'projects', 'tasks', 'campaigns', 'services', 'users',
    'asset-category-master', 'asset-type-master', 'sub-services', 'brands', 'content', 'notifications',
    'smm', 'graphics', 'roles', 'teams', 'team-members', 'service-pages', 'backlink-sources', 'backlinks',
    'submissions', 'okrs', 'competitors', 'competitor-backlinks', 'url-errors', 'on-page-seo-audits',
    'toxic-backlinks', 'ux-issues', 'qc-runs', 'promotion-items', 'effort-targets', 'performance-targets',
    'gold-standards', 'industry-sectors', 'content-types', 'personas', 'forms', 'asset-types', 'asset-categories',
    'asset-formats', 'platforms', 'countries', 'seo-errors', 'workflow-stages', 'qc-checklists', 'qc-versions',
    'qc-weightage-configs', 'integrations', 'logs'
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Mock auth endpoint
        if (req.url?.includes('/auth/login') && req.method === 'POST') {
            const { email, password } = req.body;
            if (email === 'admin@example.com' && password === 'admin123') {
                return res.status(200).json({
                    success: true,
                    user: {
                        id: 1,
                        email: 'admin@example.com',
                        name: 'Admin User',
                        role: 'admin'
                    },
                    token: 'mock-jwt-token-' + Date.now()
                });
            }
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Health check endpoint
        if (req.url?.includes('/health') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                status: 'healthy',
                database: 'in-memory',
                timestamp: new Date().toISOString()
            });
        }

        // Parse URL - /api/v1/{collection} or /api/v1/{collection}/{id}
        const urlParts = req.url?.split('?')[0].split('/').filter(Boolean) || [];
        const isV1Path = urlParts[0] === 'api' && urlParts[1] === 'v1';
        const collection = isV1Path && urlParts.length >= 3 ? urlParts[2] : urlParts[urlParts.length - 1];
        const id = isV1Path && urlParts.length >= 4 ? urlParts[3] : urlParts[urlParts.length - 2];
        const isIdRoute = id && !isNaN(Number(id));

        // Generic CRUD for all known collections
        if (ALL_COLLECTIONS.has(collection)) {
            // GET all items
            if (req.method === 'GET' && !isIdRoute) {
                const items = dataStore.getAll(collection);
                console.log(`[API] GET ${collection}: returning ${items.length} items`);
                return res.status(200).json({
                    success: true,
                    data: items,
                    count: items.length
                });
            }

            // GET single item by ID
            if (req.method === 'GET' && isIdRoute) {
                const item = dataStore.getById(collection, Number(id));
                if (!item) {
                    console.log(`[API] GET ${collection}/${id}: not found`);
                    return res.status(404).json({ success: false, error: 'Item not found' });
                }
                console.log(`[API] GET ${collection}/${id}: found`);
                return res.status(200).json({ success: true, data: item });
            }

            // POST - Create
            if (req.method === 'POST' && !isIdRoute) {
                const newItem = dataStore.create(collection, req.body || {});
                console.log(`[API] POST ${collection}: created item ${newItem.id}`);
                return res.status(201).json({
                    success: true,
                    data: newItem,
                    message: 'Item created successfully'
                });
            }

            // PUT / PATCH - Update
            if ((req.method === 'PUT' || req.method === 'PATCH') && isIdRoute) {
                try {
                    const updated = dataStore.update(collection, Number(id), req.body || {});
                    console.log(`[API] PUT ${collection}/${id}: updated`);
                    return res.status(200).json({
                        success: true,
                        data: updated,
                        message: 'Item updated successfully'
                    });
                } catch (error: any) {
                    console.log(`[API] PUT ${collection}/${id}: error - ${error.message}`);
                    return res.status(404).json({ success: false, error: error.message });
                }
            }

            // DELETE
            if (req.method === 'DELETE' && isIdRoute) {
                const deleted = dataStore.remove(collection, Number(id));
                if (!deleted) {
                    console.log(`[API] DELETE ${collection}/${id}: not found`);
                    return res.status(404).json({ success: false, error: 'Item not found' });
                }
                console.log(`[API] DELETE ${collection}/${id}: deleted`);
                return res.status(200).json({ success: true, message: 'Item deleted successfully' });
            }
        }

        // Unknown route
        console.log(`[API] Unknown route: ${req.method} ${req.url}`);
        return res.status(404).json({
            success: false,
            error: 'Endpoint not found',
            path: req.url
        });
    } catch (error: any) {
        console.error('[API] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}
