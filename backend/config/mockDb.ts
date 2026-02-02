// Mock database for testing Service & Asset Linking features
// This simulates the database operations without requiring actual database setup

const mockServices = [
    {
        id: 1,
        service_name: "Web Development Services",
        service_code: "WD-001",
        slug: "web-development-services",
        full_url: "https://example.com/services/web-development-services",
        status: "Active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 2,
        service_name: "Digital Marketing",
        service_code: "DM-001", 
        slug: "digital-marketing",
        full_url: "https://example.com/services/digital-marketing",
        status: "Active",
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
        name: "Website Banner Design",
        type: "Blog Banner",
        application_type: "web",
        status: "Draft",
        workflow_stage: "In Progress",
        qc_status: "",
        linked_service_id: 1,
        linked_sub_service_ids: [1],
        created_at: new Date().toISOString(),
        file_url: "https://example.com/assets/banner1.jpg",
        thumbnail_url: "https://example.com/assets/banner1_thumb.jpg"
    },
    {
        id: 2,
        name: "SEO Article",
        type: "Article",
        application_type: "seo", 
        status: "QC Approved",
        workflow_stage: "Published",
        qc_status: "Approved",
        linked_service_id: 2,
        linked_sub_service_ids: [2],
        created_at: new Date().toISOString(),
        file_url: "https://example.com/assets/article1.pdf"
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

// Mock query function that simulates database responses
export const mockPool = {
    query: async (sql: string, params?: any[]) => {
        console.log(`Mock Query: ${sql}`, params);
        
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
