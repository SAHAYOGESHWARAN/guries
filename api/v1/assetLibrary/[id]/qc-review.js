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
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id, X-User-Role');

    if (req.method === 'OPTIONS') {
        return res.status(200).json({ ok: true });
    }

    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const { id } = req.query;
        const assetId = parseInt(id);
        const { qc_decision, user_role, qc_score, qc_remarks, qc_reviewer_id } = req.body;

        // Validate admin role
        if (user_role?.toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin only' });
        }

        // Validate QC decision
        if (!['approved', 'rejected', 'rework'].includes(qc_decision)) {
            return res.status(400).json({ error: 'Invalid decision' });
        }

        const assets = getAssets();
        const idx = assets.findIndex((a) => a.id === assetId);

        if (idx === -1) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        // Update asset status
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
