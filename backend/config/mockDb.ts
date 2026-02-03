// Mock database for testing Service & Asset Linking features
// This simulates the database operations without requiring actual database setup

const mockServices = [
    {
        id: 1,
        service_name: "SEO Optimization",
        service_code: "SEO-001",
        slug: "seo-optimization",
        full_url: "/services/seo-optimization",
        menu_heading: "SEO Services",
        short_tagline: "Boost your online visibility",
        service_description: "Comprehensive SEO services to improve your search rankings",
        status: "Published",
        language: "en",
        show_in_main_menu: 1,
        show_in_footer_menu: 0,
        include_in_xml_sitemap: 1,
        h1: "Professional SEO Optimization Services",
        meta_title: "SEO Optimization Services | Expert Solutions",
        meta_description: "Improve your search rankings with our professional SEO services",
        content_type: "Pillar",
        buyer_journey_stage: "Awareness",
        industry_ids: "[]",
        country_ids: "[]",
        linked_assets_ids: "[]",
        linked_insights_ids: "[]",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 2,
        service_name: "Content Marketing",
        service_code: "CM-001",
        slug: "content-marketing",
        full_url: "/services/content-marketing",
        menu_heading: "Content Services",
        short_tagline: "Engage your audience with quality content",
        service_description: "Strategic content creation and distribution services",
        status: "Published",
        language: "en",
        show_in_main_menu: 1,
        show_in_footer_menu: 0,
        include_in_xml_sitemap: 1,
        h1: "Content Marketing Solutions",
        meta_title: "Content Marketing Services | Professional Writers",
        meta_description: "High-quality content creation for your brand",
        content_type: "Pillar",
        buyer_journey_stage: "Consideration",
        industry_ids: "[]",
        country_ids: "[]",
        linked_assets_ids: "[]",
        linked_insights_ids: "[]",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 3,
        service_name: "Social Media Management",
        service_code: "SMM-001",
        slug: "social-media-management",
        full_url: "/services/social-media-management",
        menu_heading: "Social Media",
        short_tagline: "Grow your social presence",
        service_description: "Complete social media management and strategy services",
        status: "Published",
        language: "en",
        show_in_main_menu: 1,
        show_in_footer_menu: 0,
        include_in_xml_sitemap: 1,
        h1: "Social Media Management Services",
        meta_title: "Social Media Management | Expert Strategy",
        meta_description: "Grow your brand on social media with expert management",
        content_type: "Pillar",
        buyer_journey_stage: "Awareness",
        industry_ids: "[]",
        country_ids: "[]",
        linked_assets_ids: "[]",
        linked_insights_ids: "[]",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 4,
        service_name: "PPC Advertising",
        service_code: "PPC-001",
        slug: "ppc-advertising",
        full_url: "/services/ppc-advertising",
        menu_heading: "Paid Advertising",
        short_tagline: "Maximize your ad ROI",
        service_description: "Strategic PPC campaigns for Google Ads and social platforms",
        status: "Published",
        language: "en",
        show_in_main_menu: 1,
        show_in_footer_menu: 0,
        include_in_xml_sitemap: 1,
        h1: "PPC Advertising Services",
        meta_title: "PPC Advertising Services | Google Ads Experts",
        meta_description: "Maximize your advertising ROI with expert PPC management",
        content_type: "Pillar",
        buyer_journey_stage: "Decision",
        industry_ids: "[]",
        country_ids: "[]",
        linked_assets_ids: "[]",
        linked_insights_ids: "[]",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 5,
        service_name: "Email Marketing",
        service_code: "EM-001",
        slug: "email-marketing",
        full_url: "/services/email-marketing",
        menu_heading: "Email Services",
        short_tagline: "Connect with your customers",
        service_description: "Effective email marketing campaigns and automation",
        status: "Published",
        language: "en",
        show_in_main_menu: 1,
        show_in_footer_menu: 0,
        include_in_xml_sitemap: 1,
        h1: "Email Marketing Services",
        meta_title: "Email Marketing Services | Campaign Experts",
        meta_description: "Effective email marketing campaigns for your business",
        content_type: "Cluster",
        buyer_journey_stage: "Retention",
        industry_ids: "[]",
        country_ids: "[]",
        linked_assets_ids: "[]",
        linked_insights_ids: "[]",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

const mockSubServices = [
    {
        id: 1,
        sub_service_name: "Frontend Development",
        sub_service_code: "FE-001",
        parent_service_id: 1,
        slug: "frontend-development",
        status: "Active"
    },
    {
        id: 2,
        sub_service_name: "SEO Optimization",
        sub_service_code: "SEO-001",
        parent_service_id: 2,
        slug: "seo-optimization",
        status: "Active"
    }
];

const mockAssets = [
    {
        id: 1,
        asset_name: "Website Banner Design",
        asset_type: "Blog Banner",
        asset_category: "Graphics",
        asset_format: "JPG",
        content_type: "Web",
        application_type: "web",
        status: "Draft",
        workflow_stage: "In Progress",
        qc_status: "",
        linked_service_id: 1,
        linked_service_ids: "[1]",
        linked_sub_service_id: 1,
        linked_sub_service_ids: "[1]",
        linked_task_id: 1,
        linked_task: 1,
        designed_by: 1,
        submitted_by: 1,
        created_by: 1,
        qc_reviewer_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        file_url: "https://example.com/assets/banner1.jpg",
        thumbnail_url: "https://example.com/assets/banner1_thumb.jpg",
        file_type: "jpg",
        version_number: 1,
        tags: "Content Repository",
        usage_status: "Available"
    },
    {
        id: 2,
        asset_name: "SEO Article",
        asset_type: "Article",
        asset_category: "Content",
        asset_format: "PDF",
        content_type: "Blog",
        application_type: "seo",
        status: "QC Approved",
        workflow_stage: "Published",
        qc_status: "Approved",
        linked_service_id: 2,
        linked_service_ids: "[2]",
        linked_sub_service_id: 2,
        linked_sub_service_ids: "[2]",
        linked_task_id: 2,
        linked_task: 2,
        designed_by: 2,
        submitted_by: 2,
        created_by: 2,
        qc_reviewer_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        file_url: "https://example.com/assets/article1.pdf",
        file_type: "pdf",
        version_number: 1,
        tags: "SEO",
        usage_status: "Available"
    },
    {
        id: 3,
        asset_name: "Social Media Post",
        asset_type: "Social Post",
        asset_category: "Social Media",
        asset_format: "PNG",
        content_type: "SMM",
        application_type: "smm",
        status: "Published",
        workflow_stage: "Published",
        qc_status: "Approved",
        linked_service_id: 3,
        linked_service_ids: "[3]",
        linked_sub_service_id: null,
        linked_sub_service_ids: "[]",
        linked_task_id: 3,
        linked_task: 3,
        designed_by: 1,
        submitted_by: 1,
        created_by: 1,
        qc_reviewer_id: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        file_url: "https://example.com/assets/social1.png",
        thumbnail_url: "https://example.com/assets/social1_thumb.png",
        file_type: "png",
        version_number: 1,
        tags: "SMM",
        usage_status: "Available"
    },
    {
        id: 4,
        asset_name: "Email Template",
        asset_type: "Email",
        asset_category: "Email",
        asset_format: "HTML",
        content_type: "Email",
        application_type: "email",
        status: "Draft",
        workflow_stage: "In Progress",
        qc_status: "",
        linked_service_id: 5,
        linked_service_ids: "[5]",
        linked_sub_service_id: null,
        linked_sub_service_ids: "[]",
        linked_task_id: 4,
        linked_task: 4,
        designed_by: 2,
        submitted_by: 2,
        created_by: 2,
        qc_reviewer_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        file_url: "https://example.com/assets/email1.html",
        file_type: "html",
        version_number: 1,
        tags: "Content Repository",
        usage_status: "Available"
    }
];

const mockServiceAssetLinks = [
    {
        id: 1,
        service_id: 1,
        asset_id: 1,
        is_static: 1,
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        service_id: 2,
        asset_id: 2,
        is_static: 1,
        created_at: new Date().toISOString()
    }
];

const mockUsers = [
    {
        id: 1,
        name: "John Designer",
        email: "john@example.com",
        role: "designer",
        status: "active"
    },
    {
        id: 2,
        name: "Sarah Writer",
        email: "sarah@example.com",
        role: "writer",
        status: "active"
    },
    {
        id: 3,
        name: "Mike QC",
        email: "mike@example.com",
        role: "qc_reviewer",
        status: "active"
    }
];

const mockTasks = [
    {
        id: 1,
        name: "Design Homepage Banner",
        task_name: "Design Homepage Banner",
        status: "In Progress",
        project_id: 1
    },
    {
        id: 2,
        name: "Write SEO Article",
        task_name: "Write SEO Article",
        status: "Completed",
        project_id: 1
    },
    {
        id: 3,
        name: "Create Social Posts",
        task_name: "Create Social Posts",
        status: "In Progress",
        project_id: 2
    },
    {
        id: 4,
        name: "Design Email Template",
        task_name: "Design Email Template",
        status: "In Progress",
        project_id: 2
    }
];

// Mock query function that simulates database responses
export const mockPool = {
    query: async (sql: string, params?: any[]) => {
        console.log(`Mock Query: ${sql}`, params);

        // Simulate tasks query (MUST come BEFORE users query to avoid matching 'users' in LEFT JOIN)
        if (sql.includes('FROM tasks')) {
            if (sql.includes('WHERE id =')) {
                const taskId = params?.[0];
                const task = mockTasks.find(t => t.id === taskId);
                return { rows: task ? [task] : [] };
            }
            return { rows: mockTasks };
        }

        // Simulate services query
        if (sql.includes('SELECT') && sql.includes('services')) {
            if (sql.includes('WHERE id =')) {
                const serviceId = params?.[0];
                const service = mockServices.find(s => s.id === serviceId);
                return { rows: service ? [service] : [] };
            }
            return { rows: mockServices };
        }

        // Simulate sub-services query
        if (sql.includes('SELECT') && sql.includes('sub_services')) {
            if (sql.includes('WHERE parent_service_id =')) {
                const parentId = params?.[0];
                const subServices = mockSubServices.filter(ss => ss.parent_service_id === parentId);
                return { rows: subServices };
            }
            return { rows: mockSubServices };
        }

        // Simulate users query
        if (sql.includes('SELECT') && sql.includes('users')) {
            if (sql.includes('WHERE id =')) {
                const userId = params?.[0];
                const user = mockUsers.find(u => u.id === userId);
                return { rows: user ? [user] : [] };
            }
            return { rows: mockUsers };
        }

        // Simulate assets query
        if (sql.includes('SELECT') && sql.includes('assets')) {
            if (sql.includes('WHERE id =')) {
                const assetId = params?.[0];
                const asset = mockAssets.find(a => a.id === assetId);
                return { rows: asset ? [asset] : [] };
            }
            return { rows: mockAssets };
        }

        // Simulate service asset links query
        if (sql.includes('SELECT') && sql.includes('service_asset_links')) {
            if (sql.includes('WHERE service_id =')) {
                const serviceId = params?.[0];
                const links = mockServiceAssetLinks.filter(link => link.service_id === serviceId);
                const linkedAssets = links.map(link => mockAssets.find(asset => asset.id === link.asset_id)).filter(Boolean);
                return { rows: linkedAssets };
            }
            return { rows: mockServiceAssetLinks };
        }

        // Simulate INSERT operations
        if (sql.includes('INSERT')) {
            return { rows: [], insertId: Math.floor(Math.random() * 1000) + 1 };
        }

        // Simulate UPDATE operations
        if (sql.includes('UPDATE')) {
            return { rows: [], changedRows: 1 };
        }

        // Default response
        return { rows: [] };
    },

    end: async () => {
        console.log('Mock database connection closed');
    }
};

export default mockPool;
