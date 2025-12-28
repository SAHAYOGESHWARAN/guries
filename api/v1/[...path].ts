import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Storage table name in Supabase
const STORAGE_TABLE = 'app_storage';

// Default data for collections
const DEFAULT_DATA: Record<string, any[]> = {
    users: [
        { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'Admin', status: 'Active' },
        { id: 2, name: 'Test User', email: 'user@example.com', role: 'User', status: 'Active' }
    ],
    roles: [
        { id: 1, name: 'Admin', permissions: ['all'] },
        { id: 2, name: 'User', permissions: ['read', 'write'] }
    ]
};

// Helper to get collection from Supabase
async function getCollection(collection: string): Promise<any[]> {
    try {
        const { data, error } = await supabase
            .from(STORAGE_TABLE)
            .select('data')
            .eq('key', collection)
            .single();

        if (error || !data) {
            return DEFAULT_DATA[collection] || [];
        }
        return data.data || [];
    } catch (e) {
        return DEFAULT_DATA[collection] || [];
    }
}

// Helper to save collection to Supabase
async function saveCollection(collection: string, items: any[]): Promise<void> {
    try {
        await supabase
            .from(STORAGE_TABLE)
            .upsert({ key: collection, data: items, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    } catch (e) {
        console.error(`Save error for ${collection}:`, e);
    }
}

// Helper to get next ID
async function getNextId(collection: string): Promise<number> {
    const items = await getCollection(collection);
    return items.length > 0 ? Math.max(...items.map((i: any) => i.id || 0)) + 1 : 1;
}

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'OPTIONS') return res.status(200).json({ ok: true });
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));

    const { path } = req.query;
    const pathArray = Array.isArray(path) ? path : [path];
    const fullPath = pathArray.join('/');
    const method = req.method || 'GET';

    try {
        // Route handling
        if (fullPath === 'assetLibrary' || fullPath.startsWith('assetLibrary')) return handleAssetLibrary(req, res, fullPath, method);
        if (fullPath === 'users' || fullPath.startsWith('users')) return handleCRUD(req, res, 'users', fullPath, method);
        if (fullPath === 'services' || fullPath.startsWith('services')) return handleCRUD(req, res, 'services', fullPath, method);
        if (fullPath === 'sub-services' || fullPath.startsWith('sub-services')) return handleCRUD(req, res, 'subServices', fullPath, method);
        if (fullPath === 'tasks' || fullPath.startsWith('tasks')) return handleCRUD(req, res, 'tasks', fullPath, method);
        if (fullPath === 'campaigns' || fullPath.startsWith('campaigns')) return handleCRUD(req, res, 'campaigns', fullPath, method);
        if (fullPath === 'projects' || fullPath.startsWith('projects')) return handleCRUD(req, res, 'projects', fullPath, method);
        if (fullPath === 'notifications' || fullPath.startsWith('notifications')) return handleNotifications(req, res, fullPath, method);
        if (fullPath === 'content' || fullPath.startsWith('content')) return handleCRUD(req, res, 'content', fullPath, method);
        if (fullPath === 'keywords' || fullPath.startsWith('keywords')) return handleCRUD(req, res, 'keywords', fullPath, method);
        if (fullPath === 'asset-type-master' || fullPath.startsWith('asset-type-master')) return handleCRUD(req, res, 'assetTypeMaster', fullPath, method);
        if (fullPath === 'asset-category-master' || fullPath.startsWith('asset-category-master')) return handleCRUD(req, res, 'assetCategoryMaster', fullPath, method);
        if (fullPath === 'asset-formats' || fullPath.startsWith('asset-formats')) return handleCRUD(req, res, 'assetFormats', fullPath, method);
        if (fullPath === 'qc-checklists' || fullPath.startsWith('qc-checklists')) return handleCRUD(req, res, 'qcChecklists', fullPath, method);
        if (fullPath === 'teams' || fullPath.startsWith('teams')) return handleCRUD(req, res, 'teams', fullPath, method);
        if (fullPath === 'roles' || fullPath.startsWith('roles')) return handleCRUD(req, res, 'roles', fullPath, method);
        if (fullPath === 'backlinks' || fullPath.startsWith('backlinks')) return handleCRUD(req, res, 'backlinks', fullPath, method);
        if (fullPath === 'submissions' || fullPath.startsWith('submissions')) return handleCRUD(req, res, 'submissions', fullPath, method);
        if (fullPath === 'qc-runs' || fullPath.startsWith('qc-runs')) return handleCRUD(req, res, 'qcRuns', fullPath, method);
        if (fullPath === 'qc-weightage-configs' || fullPath.startsWith('qc-weightage-configs')) return handleCRUD(req, res, 'qcWeightageConfigs', fullPath, method);
        if (fullPath === 'qc-versions') return res.status(200).json([]);
        if (fullPath === 'industry-sectors' || fullPath.startsWith('industry-sectors')) return handleCRUD(req, res, 'industrySectors', fullPath, method);
        if (fullPath === 'content-types' || fullPath.startsWith('content-types')) return handleCRUD(req, res, 'contentTypes', fullPath, method);
        if (fullPath === 'platforms' || fullPath.startsWith('platforms')) return handleCRUD(req, res, 'platforms', fullPath, method);
        if (fullPath === 'countries' || fullPath.startsWith('countries')) return handleCRUD(req, res, 'countries', fullPath, method);
        if (fullPath === 'seo-errors' || fullPath.startsWith('seo-errors')) return handleCRUD(req, res, 'seoErrors', fullPath, method);
        if (fullPath === 'workflow-stages' || fullPath.startsWith('workflow-stages')) return handleCRUD(req, res, 'workflowStages', fullPath, method);
        if (fullPath === 'competitors' || fullPath.startsWith('competitors')) return handleCRUD(req, res, 'competitors', fullPath, method);
        if (fullPath === 'competitor-backlinks' || fullPath.startsWith('competitor-backlinks')) return handleCRUD(req, res, 'competitorBacklinks', fullPath, method);
        if (fullPath === 'toxic-backlinks' || fullPath.startsWith('toxic-backlinks')) return handleCRUD(req, res, 'toxicBacklinks', fullPath, method);
        if (fullPath === 'ux-issues' || fullPath.startsWith('ux-issues')) return handleCRUD(req, res, 'uxIssues', fullPath, method);
        if (fullPath === 'okrs' || fullPath.startsWith('okrs')) return handleCRUD(req, res, 'okrs', fullPath, method);
        if (fullPath === 'gold-standards' || fullPath.startsWith('gold-standards')) return handleCRUD(req, res, 'goldStandards', fullPath, method);
        if (fullPath === 'effort-targets' || fullPath.startsWith('effort-targets')) return handleCRUD(req, res, 'effortTargets', fullPath, method);
        if (fullPath === 'brands' || fullPath.startsWith('brands')) return handleCRUD(req, res, 'brands', fullPath, method);
        if (fullPath === 'personas' || fullPath.startsWith('personas')) return handleCRUD(req, res, 'personas', fullPath, method);
        if (fullPath === 'forms' || fullPath.startsWith('forms')) return handleCRUD(req, res, 'forms', fullPath, method);
        if (fullPath === 'graphics' || fullPath.startsWith('graphics')) return handleCRUD(req, res, 'graphics', fullPath, method);
        if (fullPath === 'smm' || fullPath.startsWith('smm')) return handleCRUD(req, res, 'smm', fullPath, method);
        if (fullPath === 'service-pages' || fullPath.startsWith('service-pages')) return handleCRUD(req, res, 'servicePages', fullPath, method);
        if (fullPath === 'url-errors' || fullPath.startsWith('url-errors')) return handleCRUD(req, res, 'urlErrors', fullPath, method);
        if (fullPath === 'on-page-seo-audits' || fullPath.startsWith('on-page-seo-audits')) return handleCRUD(req, res, 'onPageSeoAudits', fullPath, method);
        if (fullPath === 'integrations' || fullPath.startsWith('integrations')) return handleCRUD(req, res, 'integrations', fullPath, method);
        if (fullPath === 'logs' || fullPath.startsWith('logs')) return handleCRUD(req, res, 'logs', fullPath, method);
        if (fullPath === 'knowledge/articles' || fullPath.startsWith('knowledge/articles')) return handleCRUD(req, res, 'articles', fullPath.replace('knowledge/', ''), method);
        if (fullPath === 'asset-categories' || fullPath.startsWith('asset-categories')) return handleCRUD(req, res, 'assetCategoryMaster', fullPath, method);
        if (fullPath === 'asset-types' || fullPath.startsWith('asset-types')) return handleCRUD(req, res, 'assetTypeMaster', fullPath, method);

        // Settings
        if (fullPath === 'settings' || fullPath.startsWith('settings')) {
            if (method === 'GET') return res.status(200).json({ theme: 'light', language: 'en' });
            return res.status(200).json({ success: true });
        }
        // Analytics
        if (fullPath.startsWith('analytics/')) {
            if (fullPath === 'analytics/traffic') return res.status(200).json([]);
            if (fullPath === 'analytics/kpi') return res.status(200).json({ total_visits: 0, conversions: 0, bounce_rate: 0 });
            if (fullPath === 'analytics/dashboard-metrics') {
                const tasks = await getCollection('tasks');
                const assets = await getCollection('assets');
                return res.status(200).json({
                    total_tasks: tasks.length,
                    completed_tasks: tasks.filter((t: any) => t.status === 'Completed').length,
                    total_assets: assets.length,
                    approved_assets: assets.filter((a: any) => a.status === 'QC Approved').length
                });
            }
            return res.status(200).json({});
        }
        // HR
        if (fullPath.startsWith('hr/')) return res.status(200).json([]);
        // AI
        if (fullPath.startsWith('ai/')) {
            if (fullPath === 'ai/evaluations' && method === 'POST') {
                return res.status(200).json({ score: Math.floor(Math.random() * 30) + 70, feedback: 'Good performance overall' });
            }
            return res.status(200).json({});
        }
        // Dashboards
        if (fullPath.startsWith('dashboards/')) {
            if (fullPath === 'dashboards/employees') {
                const users = await getCollection('users');
                return res.status(200).json(users);
            }
            return res.status(200).json({});
        }
        // Communication
        if (fullPath.startsWith('communication/')) {
            if (fullPath === 'communication/emails') return handleCRUD(req, res, 'emails', fullPath, method);
            return res.status(200).json([]);
        }
        // Compliance
        if (fullPath.startsWith('compliance/')) return res.status(200).json([]);
        // Reports
        if (fullPath === 'reports/today') {
            const assets = await getCollection('assets');
            const tasks = await getCollection('tasks');
            return res.status(200).json({
                date: new Date().toISOString().split('T')[0],
                tasks_completed: tasks.filter((t: any) => t.status === 'Completed').length,
                assets_created: assets.length,
                qc_reviews: assets.filter((a: any) => a.qc_status).length
            });
        }
        // Uploads
        if (fullPath === 'uploads' && method === 'POST') return res.status(200).json({ url: req.body.data || '', filename: req.body.filename || 'upload' });
        // Auth
        if (fullPath === 'auth/send-otp') return res.status(200).json({ success: true, message: 'OTP sent' });
        if (fullPath === 'auth/verify-otp') return res.status(200).json({ success: true, token: 'mock-token' });
        // Promotion Items
        if (fullPath === 'promotion-items') {
            const content = await getCollection('content');
            return res.status(200).json(content.filter((c: any) => ['qc_passed', 'updated', 'ready_to_publish', 'published'].includes(c.status)));
        }
        // Dashboard stats
        if (fullPath === 'dashboard/stats') {
            const assets = await getCollection('assets');
            const tasks = await getCollection('tasks');
            const projects = await getCollection('projects');
            const campaigns = await getCollection('campaigns');
            return res.status(200).json({ totalAssets: assets.length, totalTasks: tasks.length, totalProjects: projects.length, totalCampaigns: campaigns.length });
        }
        // System stats
        if (fullPath === 'system/stats') return res.status(200).json({ uptime: process.uptime(), memory: process.memoryUsage(), version: '2.5.0' });

        return res.status(404).json({ error: `Route not found: ${fullPath}` });
    } catch (error: any) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}

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
            const newItem = { ...req.body, id: newId, created_at: new Date().toISOString() };
            items.push(newItem);
            await saveCollection(collection, items);
            return res.status(201).json(newItem);
        case 'PUT':
            if (!id) return res.status(400).json({ error: 'ID required' });
            const updateIndex = items.findIndex((i: any) => i.id === id);
            if (updateIndex === -1) return res.status(404).json({ error: 'Not found' });
            items[updateIndex] = { ...items[updateIndex], ...req.body, updated_at: new Date().toISOString() };
            await saveCollection(collection, items);
            return res.status(200).json(items[updateIndex]);
        case 'DELETE':
            if (!id) return res.status(400).json({ error: 'ID required' });
            items = items.filter((i: any) => i.id !== id);
            await saveCollection(collection, items);
            return res.status(204).send('');
        default:
            return res.status(405).json({ error: 'Method not allowed' });
    }
}

// Asset Library handler
async function handleAssetLibrary(req: VercelRequest, res: VercelResponse, fullPath: string, method: string) {
    const pathParts = fullPath.split('/');
    let assets = await getCollection('assets');

    if (pathParts.length >= 3) {
        const assetId = parseInt(pathParts[1]);
        const action = pathParts[2];
        if (action === 'qc-review' && method === 'POST') return handleQCReview(req, res, assetId, assets);
        if (action === 'submit-qc' && method === 'POST') return handleSubmitForQC(req, res, assetId, assets);
        if (action === 'usage') return handleAssetUsage(req, res, assetId, pathParts.slice(3), method);
    }

    if (fullPath === 'assetLibrary/qc/pending') {
        return res.status(200).json(assets.filter((a: any) => a.status === 'Pending QC Review' || a.status === 'Rework Required'));
    }
    if (fullPath === 'assetLibrary/ai-scores' && method === 'POST') {
        return res.status(200).json({
            seo_score: Math.floor(Math.random() * 30) + 70,
            grammar_score: Math.floor(Math.random() * 20) + 80,
            analysis: { seo_feedback: 'Good SEO optimization', grammar_feedback: 'Excellent grammar' }
        });
    }

    const id = pathParts.length > 1 && !isNaN(parseInt(pathParts[1])) ? parseInt(pathParts[1]) : null;

    switch (method) {
        case 'GET':
            if (id) {
                const asset = assets.find((a: any) => a.id === id);
                return asset ? res.status(200).json(asset) : res.status(404).json({ error: 'Asset not found' });
            }
            return res.status(200).json(assets);
        case 'POST':
            const newId = await getNextId('assets');
            const newAsset = { ...req.body, id: newId, status: req.body.status || 'Draft', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
            assets.push(newAsset);
            await saveCollection('assets', assets);
            return res.status(201).json(newAsset);
        case 'PUT':
            if (!id) return res.status(400).json({ error: 'Asset ID required' });
            const assetIndex = assets.findIndex((a: any) => a.id === id);
            if (assetIndex === -1) return res.status(404).json({ error: 'Asset not found' });
            assets[assetIndex] = { ...assets[assetIndex], ...req.body, updated_at: new Date().toISOString() };
            await saveCollection('assets', assets);
            return res.status(200).json(assets[assetIndex]);
        case 'DELETE':
            if (!id) return res.status(400).json({ error: 'Asset ID required' });
            assets = assets.filter((a: any) => a.id !== id);
            await saveCollection('assets', assets);
            return res.status(204).send('');
        default:
            return res.status(405).json({ error: 'Method not allowed' });
    }
}

// QC Review handler
async function handleQCReview(req: VercelRequest, res: VercelResponse, assetId: number, assets: any[]) {
    const { qc_score, qc_remarks, qc_decision, qc_reviewer_id, user_role } = req.body;
    if (!user_role || user_role.toLowerCase() !== 'admin') return res.status(403).json({ error: 'Access denied. Only administrators can perform QC reviews.' });
    if (!['approved', 'rejected', 'rework'].includes(qc_decision)) return res.status(400).json({ error: 'QC decision must be "approved", "rejected", or "rework"' });

    const assetIndex = assets.findIndex((a: any) => a.id === assetId);
    if (assetIndex === -1) return res.status(404).json({ error: 'Asset not found' });

    const asset = assets[assetIndex];
    const newStatus = qc_decision === 'approved' ? 'QC Approved' : qc_decision === 'rejected' ? 'QC Rejected' : 'Rework Required';
    let newReworkCount = asset.rework_count || 0;
    if (qc_decision === 'rework') newReworkCount++;

    assets[assetIndex] = { ...asset, status: newStatus, qc_score: qc_score || 0, qc_remarks: qc_remarks || '', qc_reviewer_id, qc_reviewed_at: new Date().toISOString(), rework_count: newReworkCount, linking_active: qc_decision === 'approved', updated_at: new Date().toISOString() };
    await saveCollection('assets', assets);

    // Create notification
    const notifications = await getCollection('notifications');
    const notifId = await getNextId('notifications');
    const notificationText = qc_decision === 'approved' ? `Asset "${asset.name}" approved!` : qc_decision === 'rework' ? `Asset "${asset.name}" requires rework.` : `Asset "${asset.name}" rejected.`;
    notifications.unshift({ id: notifId, user_id: asset.submitted_by, title: 'QC Review Update', message: notificationText, text: notificationText, type: qc_decision === 'approved' ? 'success' : qc_decision === 'rework' ? 'warning' : 'error', read: false, is_read: 0, created_at: new Date().toISOString(), time: new Date().toISOString() });
    await saveCollection('notifications', notifications);

    return res.status(200).json(assets[assetIndex]);
}

// Submit for QC handler
async function handleSubmitForQC(req: VercelRequest, res: VercelResponse, assetId: number, assets: any[]) {
    const { submitted_by, seo_score, grammar_score, rework_count } = req.body;
    const assetIndex = assets.findIndex((a: any) => a.id === assetId);
    if (assetIndex === -1) return res.status(404).json({ error: 'Asset not found' });

    assets[assetIndex] = { ...assets[assetIndex], status: 'Pending QC Review', submitted_by, submitted_at: new Date().toISOString(), seo_score: seo_score || assets[assetIndex].seo_score, grammar_score: grammar_score || assets[assetIndex].grammar_score, rework_count: rework_count || assets[assetIndex].rework_count || 0, updated_at: new Date().toISOString() };
    await saveCollection('assets', assets);

    const notifications = await getCollection('notifications');
    const notifId = await getNextId('notifications');
    notifications.unshift({ id: notifId, user_id: null, title: 'New QC Submission', message: `Asset "${assets[assetIndex].name}" submitted for QC.`, text: `Asset "${assets[assetIndex].name}" submitted for QC.`, type: 'info', read: false, is_read: 0, created_at: new Date().toISOString(), time: new Date().toISOString() });
    await saveCollection('notifications', notifications);

    return res.status(200).json(assets[assetIndex]);
}

// Asset Usage handler
async function handleAssetUsage(req: VercelRequest, res: VercelResponse, assetId: number, subPath: string[], method: string) {
    const usageType = subPath[0];
    const usageCollection = `asset_usage_${usageType}`;
    let usageData = await getCollection(usageCollection);

    switch (method) {
        case 'GET': return res.status(200).json(usageData.filter((u: any) => u.asset_id === assetId));
        case 'POST':
            const newId = await getNextId(usageCollection);
            const newUsage = { ...req.body, id: newId, asset_id: assetId, created_at: new Date().toISOString() };
            usageData.push(newUsage);
            await saveCollection(usageCollection, usageData);
            return res.status(201).json(newUsage);
        case 'DELETE':
            const deleteId = subPath[1] ? parseInt(subPath[1]) : null;
            if (!deleteId) return res.status(400).json({ error: 'Usage ID required' });
            usageData = usageData.filter((u: any) => u.id !== deleteId);
            await saveCollection(usageCollection, usageData);
            return res.status(204).send('');
        default: return res.status(405).json({ error: 'Method not allowed' });
    }
}

// Notifications handler
async function handleNotifications(req: VercelRequest, res: VercelResponse, fullPath: string, method: string) {
    const pathParts = fullPath.split('/');
    const id = pathParts.length > 1 && !isNaN(parseInt(pathParts[1])) ? parseInt(pathParts[1]) : null;
    const action = pathParts.length > 2 ? pathParts[2] : null;
    let notifications = await getCollection('notifications');

    if (id && action === 'read' && method === 'PUT') {
        const notifIndex = notifications.findIndex((n: any) => n.id === id);
        if (notifIndex === -1) return res.status(404).json({ error: 'Notification not found' });
        notifications[notifIndex] = { ...notifications[notifIndex], read: true, is_read: 1 };
        await saveCollection('notifications', notifications);
        return res.status(200).json(notifications[notifIndex]);
    }

    if (fullPath === 'notifications/read-all' && method === 'PUT') {
        notifications = notifications.map((n: any) => ({ ...n, read: true, is_read: 1 }));
        await saveCollection('notifications', notifications);
        return res.status(200).json({ message: 'All marked as read' });
    }

    switch (method) {
        case 'GET':
            if (id) {
                const notif = notifications.find((n: any) => n.id === id);
                return notif ? res.status(200).json(notif) : res.status(404).json({ error: 'Not found' });
            }
            return res.status(200).json(notifications.map((n: any) => ({ ...n, text: n.text || n.message || n.title, read: n.read === true || n.is_read === 1, time: n.time || n.created_at })).slice(0, 50));
        case 'POST':
            const newId = await getNextId('notifications');
            const newNotif = { ...req.body, id: newId, read: false, is_read: 0, created_at: new Date().toISOString(), time: new Date().toISOString() };
            notifications.unshift(newNotif);
            await saveCollection('notifications', notifications);
            return res.status(201).json(newNotif);
        case 'DELETE':
            if (!id) return res.status(400).json({ error: 'ID required' });
            notifications = notifications.filter((n: any) => n.id !== id);
            await saveCollection('notifications', notifications);
            return res.status(204).send('');
        default: return res.status(405).json({ error: 'Method not allowed' });
    }
}
