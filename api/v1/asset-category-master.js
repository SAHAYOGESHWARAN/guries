const DEFAULT_ASSET_CATEGORIES = [
    {
        id: 1,
        name: 'Marketing Materials',
        description: 'Marketing and promotional assets',
        status: 'active',
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        name: 'Product Assets',
        description: 'Product-related images and content',
        status: 'active',
        created_at: new Date().toISOString()
    },
    {
        id: 3,
        name: 'Brand Assets',
        description: 'Brand guidelines and logos',
        status: 'active',
        created_at: new Date().toISOString()
    },
    {
        id: 4,
        name: 'Training Materials',
        description: 'Educational and training content',
        status: 'active',
        created_at: new Date().toISOString()
    },
    {
        id: 5,
        name: 'Social Media',
        description: 'Social media graphics and posts',
        status: 'active',
        created_at: new Date().toISOString()
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
                data: DEFAULT_ASSET_CATEGORIES,
                total: DEFAULT_ASSET_CATEGORIES.length
            });
            return;
        }

        if (req.method === 'POST') {
            const { name, description } = req.body;
            
            if (!name) {
                return res.status(400).json({
                    error: 'Name is required'
                });
            }

            const newAssetCategory = {
                id: Date.now(),
                name,
                description: description || '',
                status: 'active',
                created_at: new Date().toISOString()
            };

            res.status(201).json({
                success: true,
                message: 'Asset category created successfully',
                data: newAssetCategory
            });
            return;
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('Asset category master handler error:', err);
        res.status(500).json({ 
            error: err?.message || 'Internal server error'
        });
    }
};
