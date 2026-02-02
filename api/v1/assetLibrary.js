const DEFAULT_ASSETS = [
    {
        id: 1,
        asset_name: 'Marketing Banner 2024',
        asset_type: 'Image',
        category: 'Marketing Materials',
        status: 'Approved',
        qc_score: 95,
        created_by: 'Content Team',
        created_at: new Date().toISOString(),
        file_url: '/assets/banner-2024.jpg'
    },
    {
        id: 2,
        asset_name: 'Product Demo Video',
        asset_type: 'Video',
        category: 'Product Assets',
        status: 'Pending QC Review',
        qc_score: 0,
        created_by: 'Video Team',
        created_at: new Date().toISOString(),
        file_url: '/assets/product-demo.mp4'
    },
    {
        id: 3,
        asset_name: 'Brand Guidelines PDF',
        asset_type: 'Document',
        category: 'Brand Assets',
        status: 'QC Approved',
        qc_score: 88,
        created_by: 'Design Team',
        created_at: new Date().toISOString(),
        file_url: '/assets/brand-guidelines.pdf'
    }
];

module.exports = function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-User-Id, X-User-Role');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'GET') {
            res.status(200).json({
                success: true,
                data: DEFAULT_ASSETS,
                total: DEFAULT_ASSETS.length
            });
            return;
        }

        if (req.method === 'POST') {
            const { asset_name, asset_type, category, file_url } = req.body;
            
            if (!asset_name || !asset_type) {
                return res.status(400).json({
                    error: 'Asset name and type are required'
                });
            }

            const newAsset = {
                id: Date.now(),
                asset_name,
                asset_type,
                category: category || 'General',
                status: 'Draft',
                qc_score: 0,
                created_by: 'User',
                created_at: new Date().toISOString(),
                file_url: file_url || ''
            };

            res.status(201).json({
                success: true,
                message: 'Asset created successfully',
                data: newAsset
            });
            return;
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('Asset library handler error:', err);
        res.status(500).json({ 
            error: err?.message || 'Internal server error'
        });
    }
};
