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
    console.log('[Redis] Not configured - KV_REST_API_URL:', !!process.env.KV_REST_API_URL, 'KV_REST_API_TOKEN:', !!process.env.KV_REST_API_TOKEN);
}

// In-memory fallback storage (only for single request, not persistent)
const memoryStorage: Record<string, any[]> = {};

// Default data for collections - used when no storage is configured
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
        { id: 4, workflow_name: 'Content Production', stage_order: 4, total_stages: 4, stage_label: 'Published', color_tag: 'green', active_flag: 'Active' },
        { id: 5, workflow_name: 'SEO Campaign', stage_order: 1, total_stages: 3, stage_label: 'Planning', color_tag: 'blue', active_flag: 'Active' },
        { id: 6, workflow_name: 'SEO Campaign', stage_order: 2, total_stages: 3, stage_label: 'Execution', color_tag: 'amber', active_flag: 'Active' },
        { id: 7, workflow_name: 'SEO Campaign', stage_order: 3, total_stages: 3, stage_label: 'Complete', color_tag: 'green', active_flag: 'Active' }
    ],
    industrySectors: [
        { id: 1, industry: 'Technology', sector: 'Software Development', application: 'Web Services', country: 'United States', status: 'Active' },
        { id: 2, industry: 'Healthcare', sector: 'Medical Services', application: 'Patient Care', country: 'United States', status: 'Active' },
        { id: 3, industry: 'Finance', sector: 'Banking', application: 'Digital Banking', country: 'United Kingdom', status: 'Active' },
        { id: 4, industry: 'E-commerce', sector: 'Retail', application: 'Online Shopping', country: 'Canada', status: 'Active' },
        { id: 5, industry: 'Education', sector: 'EdTech', application: 'Online Learning', country: 'Australia', status: 'Active' }
    ],
    platforms: [
        { id: 1, platform_name: 'Facebook', content_types_count: 5, asset_types_count: 4, recommended_size: '1200x630', scheduling: 'Both', status: 'Active' },
        { id: 2, platform_name: 'Instagram', content_types_count: 4, asset_types_count: 3, recommended_size: '1080x1080', scheduling: 'Auto', status: 'Active' },
        { id: 3, platform_name: 'LinkedIn', content_types_count: 3, asset_types_count: 2, recommended_size: '1200x627', scheduling: 'Manual', status: 'Active' },
        { id: 4, platform_name: 'Twitter/X', content_types_count: 3, asset_types_count: 2, recommended_size: '1200x675', scheduling: 'Both', status: 'Active' },
        { id: 5, platform_name: 'YouTube', content_types_count: 2, asset_types_count: 2, recommended_size: '1280x720', scheduling: 'Manual', status: 'Active' }
    ],
    countries: [
        { id: 1, country_name: 'United States', code: 'US', region: 'North America', has_backlinks: true, has_content: true, has_smm: true, status: 'Active' },
        { id: 2, country_name: 'United Kingdom', code: 'UK', region: 'Europe', has_backlinks: true, has_content: true, has_smm: true, status: 'Active' },
        { id: 3, country_name: 'Canada', code: 'CA', region: 'North America', has_backlinks: true, has_content: true, has_smm: false, status: 'Active' },
        { id: 4, country_name: 'Australia', code: 'AU', region: 'Oceania', has_backlinks: true, has_content: false, has_smm: true, status: 'Active' },
        { id: 5, country_name: 'Germany', code: 'DE', region: 'Europe', has_backlinks: false, has_content: true, has_smm: true, status: 'Active' },
        { id: 6, country_name: 'India', code: 'IN', region: 'Asia', has_backlinks: true, has_content: true, has_smm: true, status: 'Active' }
    ],
    seoErrors: [
        { id: 1, error_type: 'Missing Meta Title', category: 'On-page', severity: 'High', description: 'Page is missing meta title tag', status: 'Published' },
        { id: 2, error_type: 'Missing Meta Description', category: 'On-page', severity: 'High', description: 'Page is missing meta description', status: 'Published' },
        { id: 3, error_type: 'Broken Links', category: 'Technical SEO', severity: 'High', description: 'Page contains broken links', status: 'Published' },
        { id: 4, error_type: 'Slow Page Speed', category: 'Technical SEO', severity: 'Medium', description: 'Page load time exceeds 3 seconds', status: 'Published' },
        { id: 5, error_type: 'Missing Alt Text', category: 'On-page', severity: 'Medium', description: 'Images missing alt text', status: 'Published' },
        { id: 6, error_type: 'Duplicate Content', category: 'On-page', severity: 'Low', description: 'Duplicate content detected', status: 'Published' }
    ],
    contentTypes: [
        { id: 1, content_type: 'Blog Post', category: 'Long-form', description: 'Standard blog article', default_attributes: ['Title', 'Body', 'Meta Description'], use_in_campaigns: 1, status: 'Active' },
        { id: 2, content_type: 'Landing Page', category: 'Long-form', description: 'Marketing landing page', default_attributes: ['Headline', 'CTA', 'Form'], use_in_campaigns: 1, status: 'Active' },
        { id: 3, content_type: 'Case Study', category: 'Long-form', description: 'Customer success story', default_attributes: ['Challenge', 'Solution', 'Results'], use_in_campaigns: 0, status: 'Active' },
        { id: 4, content_type: 'Social Post', category: 'Short-form', description: 'Social media content', default_attributes: ['Caption', 'Hashtags', 'Media'], use_in_campaigns: 1, status: 'Active' },
        { id: 5, content_type: 'Infographic', category: 'Visual', description: 'Visual data representation', default_attributes: ['Title', 'Data Points', 'Design'], use_in_campaigns: 0, status: 'Active' }
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
        { id: 1, checklist_name: 'Content QC', checklist_type: 'content', category: 'Content', number_of_items: 10, scoring_mode: 'weighted', pass_threshold: 70, status: 'active' },
        { id: 2, checklist_name: 'SEO QC', checklist_type: 'seo', category: 'SEO', number_of_items: 8, scoring_mode: 'weighted', pass_threshold: 75, status: 'active' }
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
    // Try Redis first
    if (redis) {
        try {
            const data = await redis.get<any[]>(`mcc:${collection}`);
            if (data && Array.isArray(data)) {
                console.log(`[Redis] Fetched ${collection}: ${data.length} items`);
                return data;
            }
            console.log(`[Redis] No data for ${collection}, using defaults`);
        } catch (e: any) {
            console.log(`[Redis] Error fetching ${collection}:`, e.message);
        }
    }

    // Fallback to memory/defaults
    return memoryStorage[collection] || DEFAULT_DATA[collection] || [];
}

// Helper to save collection to Redis
async function saveCollection(collection: string, items: any[]): Promise<boolean> {
    // Save to Redis
    if (redis) {
        try {
            await redis.set(`mcc:${collection}`, items);
            console.log(`[Redis] Saved ${collection}: ${items.length} items`);
            return true;
        } catch (e: any) {
            console.error(`[Redis] Error saving ${collection}:`, e.message);
        }
    }

    // Fallback to memory (won't persist between requests)
    memoryStorage[collection] = items;
    console.log(`[Memory] Saved ${collection}: ${items.length} items (WARNING: not persistent!)`);
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle preflight and HEAD requests
    if (req.method === 'OPTIONS') return res.status(200).json({ ok: true });

    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));

    // Handle HEAD requests - just return 200 OK for health checks
    if (req.method === 'HEAD') {
        return res.status(200).end();
    }

    const { path } = req.query;
    const pathArray = Array.isArray(path) ? path : [path];
    const fullPath = pathArray.join('/');
    const method = req.method || 'GET';

    // Debug endpoint to check configuration
    if (fullPath === 'debug/config') {
        const testAssets = await getCollection('assets');
        return res.status(200).json({
            redisConfigured: isRedisConfigured,
            redisUrl: redisUrl ? redisUrl.substring(0, 40) + '...' : 'NOT SET',
            hasToken: !!redisToken,
            assetsCount: testAssets.length,
            timestamp: new Date().toISOString()
        });
    }

    // Debug endpoint to check stored data
    if (fullPath === 'debug/data') {
        const assets = await getCollection('assets');
        const services = await getCollection('services');
        const users = await getCollection('users');
        return res.status(200).json({
            assets: assets.length,
            services: services.length,
            users: users.length,
            sampleAsset: assets[0] || null,
            timestamp: new Date().toISOString()
        });
    }

    // Initialize default data endpoint
    if (fullPath === 'debug/init' && method === 'POST') {
        // Initialize default services if empty
        const services = await getCollection('services');
        if (services.length === 0) {
            await saveCollection('services', [
                { id: 1, service_name: 'Web Development', status: 'active', created_at: new Date().toISOString() },
                { id: 2, service_name: 'SEO Services', status: 'active', created_at: new Date().toISOString() },
                { id: 3, service_name: 'Content Marketing', status: 'active', created_at: new Date().toISOString() }
            ]);
        }

        // Initialize default asset types if empty
        const assetTypes = await getCollection('assetTypeMaster');
        if (assetTypes.length === 0) {
            await saveCollection('assetTypeMaster', [
                { id: 1, asset_type_name: 'Image', status: 'active', created_at: new Date().toISOString() },
                { id: 2, asset_type_name: 'Video', status: 'active', created_at: new Date().toISOString() },
                { id: 3, asset_type_name: 'Document', status: 'active', created_at: new Date().toISOString() },
                { id: 4, asset_type_name: 'Blog Banner', status: 'active', created_at: new Date().toISOString() }
            ]);
        }

        // Initialize default asset categories if empty
        const assetCategories = await getCollection('assetCategoryMaster');
        if (assetCategories.length === 0) {
            await saveCollection('assetCategoryMaster', [
                { id: 1, category_name: 'Marketing', status: 'active', created_at: new Date().toISOString() },
                { id: 2, category_name: 'Sales', status: 'active', created_at: new Date().toISOString() },
                { id: 3, category_name: 'Support', status: 'active', created_at: new Date().toISOString() }
            ]);
        }

        // Initialize sample assets if empty
        const assets = await getCollection('assets');
        if (assets.length === 0) {
            await saveCollection('assets', [
                {
                    id: 1,
                    name: 'Sample Web Article',
                    type: 'Blog Banner',
                    asset_category: 'Marketing',
                    application_type: 'web',
                    status: 'Draft',
                    created_by: 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'SEO Content Piece',
                    type: 'Document',
                    asset_category: 'Marketing',
                    application_type: 'seo',
                    status: 'Pending QC Review',
                    seo_score: 85,
                    grammar_score: 90,
                    submitted_by: 1,
                    created_by: 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    id: 3,
                    name: 'Social Media Post',
                    type: 'Image',
                    asset_category: 'Sales',
                    application_type: 'smm',
                    status: 'QC Approved',
                    qc_score: 92,
                    created_by: 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ]);
        }

        // Initialize default users if empty
        const users = await getCollection('users');
        if (users.length === 0) {
            await saveCollection('users', [
                { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active', department: 'Administration', password_hash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', created_at: new Date().toISOString() },
                { id: 2, name: 'John Smith', email: 'john@example.com', role: 'SEO', status: 'active', department: 'Marketing', country: 'United States', target: '50', projects_count: 5, created_at: new Date().toISOString() },
                { id: 3, name: 'Sarah Chen', email: 'sarah@example.com', role: 'Content', status: 'active', department: 'Content', country: 'United Kingdom', target: '40', projects_count: 8, created_at: new Date().toISOString() }
            ]);
        }

        // Initialize roles if empty
        const roles = await getCollection('roles');
        if (roles.length === 0) {
            await saveCollection('roles', [
                { id: 1, role_name: 'Admin', permissions: { read: true, write: true, delete: true }, status: 'Active' },
                { id: 2, role_name: 'SEO', permissions: { read: true, write: true, delete: false }, status: 'Active' },
                { id: 3, role_name: 'Content', permissions: { read: true, write: true, delete: false }, status: 'Active' },
                { id: 4, role_name: 'Developer', permissions: { read: true, write: true, delete: true }, status: 'Active' }
            ]);
        }

        // Initialize teams if empty
        const teams = await getCollection('teams');
        if (teams.length === 0) {
            await saveCollection('teams', [
                { id: 1, name: 'Content Team', lead_user_id: 3, description: 'Content creation and management' },
                { id: 2, name: 'SEO Team', lead_user_id: 2, description: 'Search engine optimization' }
            ]);
        }

        // Initialize workflow stages if empty
        const workflowStages = await getCollection('workflowStages');
        if (workflowStages.length === 0) {
            await saveCollection('workflowStages', [
                { id: 1, workflow_name: 'Content Production', stage_order: 1, total_stages: 4, stage_label: 'Draft', color_tag: 'blue', active_flag: 'Active' },
                { id: 2, workflow_name: 'Content Production', stage_order: 2, total_stages: 4, stage_label: 'Review', color_tag: 'amber', active_flag: 'Active' },
                { id: 3, workflow_name: 'Content Production', stage_order: 3, total_stages: 4, stage_label: 'QC', color_tag: 'purple', active_flag: 'Active' },
                { id: 4, workflow_name: 'Content Production', stage_order: 4, total_stages: 4, stage_label: 'Published', color_tag: 'green', active_flag: 'Active' }
            ]);
        }

        // Initialize industry sectors if empty
        const industrySectors = await getCollection('industrySectors');
        if (industrySectors.length === 0) {
            await saveCollection('industrySectors', [
                { id: 1, industry: 'Technology', sector: 'Software Development', application: 'Web Services', country: 'United States', status: 'Active' },
                { id: 2, industry: 'Healthcare', sector: 'Medical Services', application: 'Patient Care', country: 'United States', status: 'Active' },
                { id: 3, industry: 'Finance', sector: 'Banking', application: 'Digital Banking', country: 'United Kingdom', status: 'Active' }
            ]);
        }

        // Initialize platforms if empty
        const platforms = await getCollection('platforms');
        if (platforms.length === 0) {
            await saveCollection('platforms', [
                { id: 1, platform_name: 'Facebook', content_types_count: 5, asset_types_count: 4, recommended_size: '1200x630', scheduling: 'Both', status: 'Active' },
                { id: 2, platform_name: 'Instagram', content_types_count: 4, asset_types_count: 3, recommended_size: '1080x1080', scheduling: 'Auto', status: 'Active' },
                { id: 3, platform_name: 'LinkedIn', content_types_count: 3, asset_types_count: 2, recommended_size: '1200x627', scheduling: 'Manual', status: 'Active' }
            ]);
        }

        return res.status(200).json({
            message: 'Default data initialized',
            services: (await getCollection('services')).length,
            assetTypes: (await getCollection('assetTypeMaster')).length,
            assetCategories: (await getCollection('assetCategoryMaster')).length,
            assets: (await getCollection('assets')).length,
            users: (await getCollection('users')).length,
            roles: (await getCollection('roles')).length,
            teams: (await getCollection('teams')).length,
            workflowStages: (await getCollection('workflowStages')).length,
            industrySectors: (await getCollection('industrySectors')).length,
            platforms: (await getCollection('platforms')).length
        });
    }

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
        if (fullPath === 'team-members' || fullPath.startsWith('team-members')) return handleCRUD(req, res, 'teamMembers', fullPath, method);
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
        // Admin Auth - Login validation
        if (fullPath === 'admin/auth/login' && method === 'POST') {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }
            const users = await getCollection('users');
            const user = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Check if user is deactivated
            if (user.status === 'inactive' || user.status === 'Inactive') {
                return res.status(403).json({ error: 'User deactivated' });
            }

            // Verify password using SHA256; require a stored password_hash
            const hashedInput = crypto.createHash('sha256').update(String(password)).digest('hex');
            const isValidPassword = !!user.password_hash && user.password_hash === hashedInput;

            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Update last login
            const userIndex = users.findIndex((u: any) => u.id === user.id);
            if (userIndex !== -1) {
                users[userIndex] = { ...users[userIndex], last_login: new Date().toISOString() };
                await saveCollection('users', users);
            }

            return res.status(200).json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role || 'user',
                    status: user.status || 'active',
                    department: user.department,
                    last_login: new Date().toISOString()
                }
            });
        }
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

    console.log(`[CRUD] ${method} ${collection} - Items: ${items.length}, ID: ${id || 'none'}`);

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
            console.log(`[CRUD] Created ${collection} item ${newId}`);
            return res.status(201).json(newItem);
        case 'PUT':
            if (!id) return res.status(400).json({ error: 'ID required' });
            const updateIndex = items.findIndex((i: any) => i.id === id);
            if (updateIndex === -1) return res.status(404).json({ error: 'Not found' });
            items[updateIndex] = {
                ...items[updateIndex],
                ...req.body,
                id: id, // Preserve ID
                updated_at: new Date().toISOString()
            };
            await saveCollection(collection, items);
            console.log(`[CRUD] Updated ${collection} item ${id}`);
            return res.status(200).json(items[updateIndex]);
        case 'DELETE':
            if (!id) return res.status(400).json({ error: 'ID required' });
            const deleteIndex = items.findIndex((i: any) => i.id === id);
            if (deleteIndex === -1) return res.status(404).json({ error: 'Not found' });
            items = items.filter((i: any) => i.id !== id);
            await saveCollection(collection, items);
            console.log(`[CRUD] Deleted ${collection} item ${id}`);
            return res.status(204).send('');
        default:
            return res.status(405).json({ error: 'Method not allowed' });
    }
}

// Asset Library handler
async function handleAssetLibrary(req: VercelRequest, res: VercelResponse, fullPath: string, method: string) {
    const pathParts = fullPath.split('/');
    let assets = await getCollection('assets');

    console.log(`[AssetLibrary] ${method} ${fullPath} - Current assets: ${assets.length}`);

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
            console.log(`[AssetLibrary] Returning ${assets.length} assets`);
            return res.status(200).json(assets);
        case 'POST':
            const newId = await getNextId('assets');
            // Preserve all fields from the request body
            const newAsset = {
                ...req.body,
                id: newId,
                status: req.body.status || 'Draft',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            assets.push(newAsset);
            const saveResult = await saveCollection('assets', assets);
            console.log(`[AssetLibrary] Created asset ${newId}, save result: ${saveResult}`);
            return res.status(201).json(newAsset);
        case 'PUT':
            if (!id) return res.status(400).json({ error: 'Asset ID required' });
            const assetIndex = assets.findIndex((a: any) => a.id === id);
            if (assetIndex === -1) return res.status(404).json({ error: 'Asset not found' });
            // Merge all fields from request body with existing asset
            assets[assetIndex] = {
                ...assets[assetIndex],
                ...req.body,
                id: id, // Ensure ID is preserved
                updated_at: new Date().toISOString()
            };
            await saveCollection('assets', assets);
            console.log(`[AssetLibrary] Updated asset ${id}`);
            return res.status(200).json(assets[assetIndex]);
        case 'DELETE':
            if (!id) return res.status(400).json({ error: 'Asset ID required' });
            const deleteIndex = assets.findIndex((a: any) => a.id === id);
            if (deleteIndex === -1) return res.status(404).json({ error: 'Asset not found' });
            assets = assets.filter((a: any) => a.id !== id);
            await saveCollection('assets', assets);
            console.log(`[AssetLibrary] Deleted asset ${id}, remaining: ${assets.length}`);
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
