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
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id, X-User-Role');

    if (req.method === 'OPTIONS') {
        return res.status(200).json({ ok: true });
    }

    try {
        if (req.method === 'GET') {
            return res.status(200).json(getAssets());
        }

        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // Extract assetId from body (primary source)
        let assetId = req.body?.assetId;

        // Fallback to query string
        if (!assetId) {
            assetId = req.query?.assetId;
        }

        // Fallback to URL path
        if (!assetId) {
            const pathParts = (req.url || '').split('/');
            for (let i = 0; i < pathParts.length; i++) {
                if (pathParts[i] === 'assetLibrary' && pathParts[i + 1]) {
                    assetId = pathParts[i + 1];
                    break;
                }
            }
        }

        assetId = parseInt(assetId);

        if (!assetId || isNaN(assetId)) {
            return res.status(400).json({ error: 'Asset ID is required' });
        }

        const { qc_decision, user_role, qc_score, qc_remarks, qc_reviewer_id } = req.body;

        if (!user_role || user_role.toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin role required' });
        }

        if (!qc_decision || !['approved', 'rejected', 'rework'].includes(qc_decision)) {
            return res.status(400).json({ error: 'Invalid or missing qc_decision' });
        }

        const assets = getAssets();
        const idx = assets.findIndex((a) => a.id === assetId);

        if (idx === -1) {
            return res.status(404).json({ error: `Asset with ID ${assetId} not found` });
        }

        assets[idx] = {
            ...assets[idx],
            status: qc_decision === 'approved' ? 'QC Approved' : qc_decision === 'rejected' ? 'QC Rejected' : 'Rework Required',
            qc_score: qc_score || 0,
            qc_remarks: qc_remarks || '',
            qc_reviewer_id: qc_reviewer_id,
            qc_reviewed_at: new Date().toISOString(),
            linking_active: qc_decision === 'approved' ? 1 : 0
        };

        saveAssets(assets);
        return res.status(200).json(assets[idx]);
    } catch (error) {
        console.error('QC Review Error:', error);
        return res.status(500).json({ error: error.message || 'Server error' });
    }
};
