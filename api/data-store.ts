/**
 * In-Memory Data Store for Vercel Serverless Functions
 * Stores data during the session for demo/testing purposes
 * Note: Data will be lost when the function instance is recycled
 */

interface StoredData {
    [key: string]: any[];
}

const now = new Date().toISOString();

// Global data store with realistic test data (persists during function instance lifetime)
const dataStore: StoredData = {
    users: [
        { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active', department: 'Administration', created_at: now, updated_at: now },
        { id: 2, name: 'Sarah Chen', email: 'sarah@example.com', role: 'designer', status: 'active', department: 'Creative', created_at: now, updated_at: now },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'qc_reviewer', status: 'active', department: 'Quality', created_at: now, updated_at: now },
        { id: 4, name: 'Emma Davis', email: 'emma@example.com', role: 'content_writer', status: 'active', department: 'Content', created_at: now, updated_at: now }
    ],
    services: [
        { id: 1, service_name: 'SEO Services', service_code: 'SEO-001', slug: 'seo-services', status: 'active', meta_title: 'SEO Services', created_at: now, updated_at: now },
        { id: 2, service_name: 'Content Creation', service_code: 'CNT-001', slug: 'content-creation', status: 'active', meta_title: 'Content Creation', created_at: now, updated_at: now },
        { id: 3, service_name: 'Web Design', service_code: 'WEB-001', slug: 'web-design', status: 'active', meta_title: 'Web Design', created_at: now, updated_at: now },
        { id: 4, service_name: 'Social Media Marketing', service_code: 'SMM-001', slug: 'social-media-marketing', status: 'active', meta_title: 'SMM', created_at: now, updated_at: now }
    ],
    'sub-services': [
        { id: 1, sub_service_name: 'On-Page SEO', parent_service_id: 1, status: 'active', created_at: now, updated_at: now },
        { id: 2, sub_service_name: 'Technical SEO', parent_service_id: 1, status: 'active', created_at: now, updated_at: now },
        { id: 3, sub_service_name: 'Blog Writing', parent_service_id: 2, status: 'active', created_at: now, updated_at: now },
        { id: 4, sub_service_name: 'Landing Page Design', parent_service_id: 3, status: 'active', created_at: now, updated_at: now }
    ],
    projects: [
        { id: 1, project_name: 'Website Redesign Q1 2025', status: 'In Progress', description: 'Complete redesign of corporate website', start_date: '2025-01-15', end_date: '2025-03-30', created_at: now, updated_at: now },
        { id: 2, project_name: 'SEO Campaign - Product Pages', status: 'Active', description: 'Optimize product landing pages for search', start_date: '2025-02-01', end_date: '2025-04-30', created_at: now, updated_at: now },
        { id: 3, project_name: 'Content Hub Expansion', status: 'Planning', description: 'Build 50+ pillar content pieces', start_date: '2025-03-01', end_date: '2025-06-30', created_at: now, updated_at: now }
    ],
    campaigns: [
        { id: 1, campaign_name: 'Spring Product Launch', campaign_type: 'Product Launch', status: 'Active', project_id: 1, created_at: now, updated_at: now },
        { id: 2, campaign_name: 'Backlink Building - Tier 1', campaign_type: 'Link Building', status: 'Active', project_id: 2, created_at: now, updated_at: now },
        { id: 3, campaign_name: 'Social Proof Collection', campaign_type: 'Brand Awareness', status: 'Draft', project_id: 1, created_at: now, updated_at: now }
    ],
    tasks: [
        { id: 1, name: 'Design homepage hero banner', status: 'completed', campaign_id: 1, assigned_to: 2, due_date: '2025-02-15', created_at: now, updated_at: now },
        { id: 2, name: 'Write meta descriptions for top 20 pages', status: 'in_progress', campaign_id: 2, assigned_to: 4, due_date: '2025-02-28', created_at: now, updated_at: now },
        { id: 3, name: 'Create LinkedIn carousel for launch', status: 'pending', campaign_id: 1, assigned_to: 2, due_date: '2025-03-05', created_at: now, updated_at: now },
        { id: 4, name: 'QC Review - Product page assets', status: 'in_progress', campaign_id: 1, assigned_to: 3, due_date: '2025-02-20', created_at: now, updated_at: now }
    ],
    assets: [
        { id: 1, asset_name: 'Homepage Hero Banner 1920x600', status: 'QC Approved', qc_status: 'Pass', asset_type: 'image', asset_category: 'Banner', application_type: 'web', linked_service_id: 3, created_by: 2, qc_score: 95, created_at: now, updated_at: now },
        { id: 2, asset_name: 'Product Page Mockup - Mobile', status: 'Pending QC', qc_status: 'pending', asset_type: 'image', asset_category: 'Mockup', application_type: 'web', linked_service_id: 3, created_by: 2, created_at: now, updated_at: now },
        { id: 3, asset_name: 'SEO Blog - Keyword Research Guide', status: 'Draft', qc_status: 'pending', asset_type: 'document', asset_category: 'Article', application_type: 'seo', linked_service_id: 1, created_by: 4, created_at: now, updated_at: now },
        { id: 4, asset_name: 'Instagram Post - Product Teaser', status: 'Rework Required', qc_status: 'Rework', asset_type: 'image', asset_category: 'Social', application_type: 'smm', linked_service_id: 4, created_by: 2, qc_remarks: 'Brand colors need adjustment', rework_count: 1, created_at: now, updated_at: now },
        { id: 5, asset_name: 'Landing Page - Service Offer', status: 'Draft', qc_status: 'pending', asset_type: 'page', asset_category: 'Landing', application_type: 'web', linked_service_id: 3, created_by: 4, created_at: now, updated_at: now }
    ],
    keywords: [
        { id: 1, keyword: 'digital marketing agency', volume: 12000, difficulty: 65, mapped_service: '1', status: 'active', created_at: now, updated_at: now },
        { id: 2, keyword: 'SEO services', volume: 8000, difficulty: 72, mapped_service: '1', status: 'active', created_at: now, updated_at: now },
        { id: 3, keyword: 'content marketing', volume: 15000, difficulty: 58, mapped_service: '2', status: 'active', created_at: now, updated_at: now }
    ],
    brands: [
        { id: 1, brand_name: 'Guires', description: 'Enterprise marketing platform', status: 'active', created_at: now, updated_at: now },
        { id: 2, brand_name: 'Acme Corp', description: 'Client brand', status: 'active', created_at: now, updated_at: now }
    ],
    'industry-sectors': [
        { id: 1, sector_name: 'Technology', description: 'Tech and software companies', status: 'active', created_at: now, updated_at: now },
        { id: 2, sector_name: 'Healthcare', description: 'Healthcare and pharma', status: 'active', created_at: now, updated_at: now },
        { id: 3, sector_name: 'Finance', description: 'Banking and financial services', status: 'active', created_at: now, updated_at: now }
    ],
    countries: [
        { id: 1, country_name: 'United States', country_code: 'US', status: 'active', created_at: now, updated_at: now },
        { id: 2, country_name: 'United Kingdom', country_code: 'GB', status: 'active', created_at: now, updated_at: now },
        { id: 3, country_name: 'India', country_code: 'IN', status: 'active', created_at: now, updated_at: now }
    ],
    'content-types': [
        { id: 1, type_name: 'Pillar', description: 'Long-form primary content', status: 'active', created_at: now, updated_at: now },
        { id: 2, type_name: 'Blog', description: 'Blog article', status: 'active', created_at: now, updated_at: now },
        { id: 3, type_name: 'Landing Page', description: 'Conversion-focused page', status: 'active', created_at: now, updated_at: now }
    ],
    'asset-category-master': [
        { id: 1, category_name: 'Banner', description: 'Web banners and hero images', status: 'active', created_at: now, updated_at: now },
        { id: 2, category_name: 'Social', description: 'Social media graphics', status: 'active', created_at: now, updated_at: now },
        { id: 3, category_name: 'Document', description: 'PDFs and documents', status: 'active', created_at: now, updated_at: now }
    ],
    'asset-type-master': [
        { id: 1, asset_type_name: 'Image', description: 'Images and graphics', status: 'active', created_at: now, updated_at: now },
        { id: 2, asset_type_name: 'Video', description: 'Video content', status: 'active', created_at: now, updated_at: now },
        { id: 3, asset_type_name: 'Document', description: 'Documents and PDFs', status: 'active', created_at: now, updated_at: now }
    ],
    platforms: [
        { id: 1, platform_name: 'LinkedIn', platform_type: 'social', status: 'active', created_at: now, updated_at: now },
        { id: 2, platform_name: 'Instagram', platform_type: 'social', status: 'active', created_at: now, updated_at: now },
        { id: 3, platform_name: 'Google Ads', platform_type: 'paid', status: 'active', created_at: now, updated_at: now }
    ],
    'workflow-stages': [
        { id: 1, stage_name: 'Draft', order_index: 1, status: 'active', created_at: now, updated_at: now },
        { id: 2, stage_name: 'In Review', order_index: 2, status: 'active', created_at: now, updated_at: now },
        { id: 3, stage_name: 'QC Pending', order_index: 3, status: 'active', created_at: now, updated_at: now },
        { id: 4, stage_name: 'Approved', order_index: 4, status: 'active', created_at: now, updated_at: now }
    ],
    personas: [
        { id: 1, persona_name: 'Marketing Manager', description: 'B2B decision maker', status: 'active', created_at: now, updated_at: now },
        { id: 2, persona_name: 'Small Business Owner', description: 'SMB owner looking for solutions', status: 'active', created_at: now, updated_at: now }
    ],
    roles: [
        { id: 1, role_name: 'admin', permissions: ['all'], status: 'active', created_at: now, updated_at: now },
        { id: 2, role_name: 'designer', permissions: ['create_assets', 'edit_assets'], status: 'active', created_at: now, updated_at: now },
        { id: 3, role_name: 'qc_reviewer', permissions: ['qc_review', 'view_assets'], status: 'active', created_at: now, updated_at: now }
    ],
    content: [
        { id: 1, content_title: 'SEO Best Practices 2025', content_type: 'Blog', status: 'Published', created_at: now, updated_at: now },
        { id: 2, content_title: 'Content Marketing Guide', content_type: 'Pillar', status: 'Draft', created_at: now, updated_at: now }
    ],
    smm: [
        { id: 1, post_title: 'Product Launch Announcement', platform: 'LinkedIn', status: 'scheduled', scheduled_at: '2025-03-01T10:00:00Z', created_at: now, updated_at: now },
        { id: 2, post_title: 'Industry Insight - Q1 Trends', platform: 'LinkedIn', status: 'published', published_at: '2025-02-10T14:00:00Z', created_at: now, updated_at: now }
    ],
    notifications: [
        { id: 1, text: 'Asset "Homepage Hero Banner" approved by QC', type: 'success', read: false, created_at: now, time: now },
        { id: 2, text: 'New task assigned: Design homepage hero banner', type: 'info', read: false, created_at: now, time: now },
        { id: 3, text: 'Asset "Instagram Post" sent back for rework', type: 'warning', read: true, created_at: now, time: now }
    ],
    'backlink-sources': [
        { id: 1, source_name: 'Industry Directories', domain_authority: 45, status: 'active', created_at: now, updated_at: now },
        { id: 2, source_name: 'Guest Post Opportunities', domain_authority: 55, status: 'active', created_at: now, updated_at: now }
    ],
    backlinks: [],
    submissions: [],
    okrs: [
        { id: 1, objective: 'Increase organic traffic by 25%', key_result: 'Achieve 100K monthly visits', progress: 60, status: 'on_track', created_at: now, updated_at: now }
    ],
    competitors: [],
    'competitor-backlinks': [],
    'url-errors': [],
    'on-page-seo-audits': [],
    'toxic-backlinks': [],
    'ux-issues': [],
    'promotion-items': [],
    graphics: [],
    'service-pages': [],
    teams: [
        { id: 1, team_name: 'Creative Team', department: 'Marketing', status: 'active', created_at: now, updated_at: now }
    ],
    'team-members': [],
    forms: [],
    'asset-formats': [
        { id: 1, format_name: 'PNG', mime_type: 'image/png', status: 'active', created_at: now, updated_at: now },
        { id: 2, format_name: 'JPG', mime_type: 'image/jpeg', status: 'active', created_at: now, updated_at: now }
    ],
    'asset-types': [],
    'asset-categories': [],
    'seo-errors': [],
    'qc-checklists': [],
    'qc-versions': [],
    'qc-weightage-configs': [],
    integrations: [],
    logs: []
};

let nextId: { [key: string]: number } = {
    users: 5, services: 5, 'sub-services': 5, projects: 4, campaigns: 4, tasks: 5, assets: 6,
    keywords: 4, brands: 3, 'industry-sectors': 4, countries: 4, 'content-types': 4,
    'asset-category-master': 4, 'asset-type-master': 4, platforms: 4, 'workflow-stages': 5,
    personas: 3, roles: 4, content: 3, smm: 3, notifications: 4, 'backlink-sources': 3,
    okrs: 2, forms: 1, 'asset-formats': 3, teams: 2
};

export function getAll(collection: string): any[] {
    return dataStore[collection] || [];
}

export function create(collection: string, data: any): any {
    if (!dataStore[collection]) {
        dataStore[collection] = [];
    }

    const id = nextId[collection] || 1;
    nextId[collection] = id + 1;

    const newItem = {
        ...data,
        id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    dataStore[collection].push(newItem);
    console.log(`[DataStore] Created ${collection} item:`, newItem);
    return newItem;
}

export function update(collection: string, id: number, data: any): any {
    if (!dataStore[collection]) {
        dataStore[collection] = [];
    }

    const index = dataStore[collection].findIndex(item => item.id === id);
    if (index === -1) {
        throw new Error(`Item with id ${id} not found in ${collection}`);
    }

    const updated = {
        ...dataStore[collection][index],
        ...data,
        id,
        updated_at: new Date().toISOString()
    };

    dataStore[collection][index] = updated;
    console.log(`[DataStore] Updated ${collection} item:`, updated);
    return updated;
}

export function remove(collection: string, id: number): boolean {
    if (!dataStore[collection]) {
        return false;
    }

    const index = dataStore[collection].findIndex(item => item.id === id);
    if (index === -1) {
        return false;
    }

    dataStore[collection].splice(index, 1);
    console.log(`[DataStore] Deleted ${collection} item with id ${id}`);
    return true;
}

export function getById(collection: string, id: number): any {
    if (!dataStore[collection]) {
        return null;
    }

    return dataStore[collection].find(item => item.id === id) || null;
}
