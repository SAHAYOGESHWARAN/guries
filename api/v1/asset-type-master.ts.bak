import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
            // Mock asset type master data
            const mockAssetTypes = [
                {
                    id: 1,
                    name: 'Image',
                    description: 'Static image assets',
                    status: 'active',
                    created_at: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'Video',
                    description: 'Video content assets',
                    status: 'active',
                    created_at: new Date().toISOString()
                },
                {
                    id: 3,
                    name: 'Document',
                    description: 'PDF and document assets',
                    status: 'active',
                    created_at: new Date().toISOString()
                },
                {
                    id: 4,
                    name: 'Audio',
                    description: 'Audio files and podcasts',
                    status: 'active',
                    created_at: new Date().toISOString()
                },
                {
                    id: 5,
                    name: 'Interactive',
                    description: 'Interactive content and tools',
                    status: 'active',
                    created_at: new Date().toISOString()
                }
            ];

            res.status(200).json({
                success: true,
                data: mockAssetTypes,
                total: mockAssetTypes.length
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

            const newAssetType = {
                id: Date.now(),
                name,
                description: description || '',
                status: 'active',
                created_at: new Date().toISOString()
            };

            res.status(201).json({
                success: true,
                message: 'Asset type created successfully',
                data: newAssetType
            });
            return;
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (err: any) {
        console.error('Asset type master handler error:', err);
        res.status(500).json({ 
            error: err?.message || 'Internal server error'
        });
    }
}
