const memoryStorage = {};

const DEFAULT_ASSETS = [
    { id: 1, name: 'Sample Web Asset', type: 'Image', application_type: 'web', status: 'Pending QC Review', submitted_by: 2 },
    { id: 2, name: 'Sample SEO Asset', type: 'Document', application_type: 'seo', status: 'Pending QC Review', submitted_by: 3 }
];

function getAssets() {
    if (!memoryStorage['assetLibrary']) {
        memoryStorage['assetLibrary'] = JSON.parse(JSON.stringify(DEFAULT_ASSETS));
    }
    return memoryStorage['assetLibrary'];
}

function saveAssets(assets) {
    memoryStorage['assetLibrary'] = assets;
}

module.exports = function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id, X-User-Role');

    if (req.method === 'OPTIONS') {
        return res.status(200).json({ ok: true });
    }

    try {
        const method = req.method || 'GET';
        const assets = getAssets();

        if (method === 'GET') {
            return res.status(200).json(assets);
        }

        if (method === 'POST') {
            const newId = assets.length > 0 ? Math.max(...assets.map(a => a.id)) + 1 : 1;
            const newAsset = { ...req.body, id: newId, created_at: new Date().toISOString() };
            assets.push(newAsset);
            saveAssets(assets);
            return res.status(201).json(newAsset);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message || 'Server error' });
    }
};
