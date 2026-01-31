import type { VercelRequest, VercelResponse } from '@vercel/node';

const memoryStorage: Record<string, any[]> = {};

const DEFAULT_USERS = [
    { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active' },
    { id: 2, name: 'John Smith', email: 'john@example.com', role: 'SEO', status: 'active' },
    { id: 3, name: 'Sarah Chen', email: 'sarah@example.com', role: 'Content', status: 'active' }
];

function getUsers(): any[] {
    if (!memoryStorage['users']) {
        memoryStorage['users'] = JSON.parse(JSON.stringify(DEFAULT_USERS));
    }
    return memoryStorage['users'];
}

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).json({ ok: true });
    }

    try {
        if (req.method === 'GET') {
            return res.status(200).json(getUsers());
        }
        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message || 'Server error' });
    }
}
