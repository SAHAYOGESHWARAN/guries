const DEFAULT_SERVICES = [
    { id: 1, service_name: 'Web Development', status: 'active' }
];

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).json({ ok: true });
    if (req.method === 'GET') return res.status(200).json(DEFAULT_SERVICES);
    return res.status(405).json({ error: 'Method not allowed' });
}
