const DEFAULT_DATA = [
    { id: 1, asset_type_name: 'Image', status: 'active' },
    { id: 2, asset_type_name: 'Video', status: 'active' },
    { id: 3, asset_type_name: 'Document', status: 'active' }
];

module.exports = function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).json({ ok: true });
    if (req.method === 'GET') return res.status(200).json(DEFAULT_DATA);
    return res.status(405).json({ error: 'Method not allowed' });
};
