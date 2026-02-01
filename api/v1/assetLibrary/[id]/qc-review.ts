import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const assetId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

    if (req.method === 'GET') {
        res.status(200).json({ message: 'QC review endpoint for asset', assetId });
        return;
    }

    if (req.method === 'POST') {
        // Minimal implementation: echo received data and return created status.
        // Higher-level logic (DB insert, linking) can be implemented later.
        const payload = req.body;
        res.status(201).json({ message: 'Create QC Review', assetId, data: payload });
        return;
    }

    res.status(405).json({ error: 'Method not allowed' });
}
