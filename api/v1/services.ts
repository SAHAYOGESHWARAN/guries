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
            // Mock services data
            const mockServices = [
                {
                    id: 1,
                    name: 'Digital Marketing',
                    description: 'Comprehensive digital marketing services',
                    status: 'active',
                    category: 'marketing',
                    created_at: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'Content Creation',
                    description: 'Professional content creation services',
                    status: 'active',
                    category: 'content',
                    created_at: new Date().toISOString()
                },
                {
                    id: 3,
                    name: 'SEO Optimization',
                    description: 'Search engine optimization services',
                    status: 'active',
                    category: 'seo',
                    created_at: new Date().toISOString()
                },
                {
                    id: 4,
                    name: 'Social Media Management',
                    description: 'Social media strategy and management',
                    status: 'active',
                    category: 'social',
                    created_at: new Date().toISOString()
                },
                {
                    id: 5,
                    name: 'Brand Development',
                    description: 'Brand strategy and development',
                    status: 'active',
                    category: 'branding',
                    created_at: new Date().toISOString()
                }
            ];

            res.status(200).json({
                success: true,
                data: mockServices,
                total: mockServices.length
            });
            return;
        }

        if (req.method === 'POST') {
            const { name, description, category } = req.body;
            
            if (!name) {
                return res.status(400).json({
                    error: 'Name is required'
                });
            }

            const newService = {
                id: Date.now(),
                name,
                description: description || '',
                status: 'active',
                category: category || 'general',
                created_at: new Date().toISOString()
            };

            res.status(201).json({
                success: true,
                message: 'Service created successfully',
                data: newService
            });
            return;
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (err: any) {
        console.error('Services handler error:', err);
        res.status(500).json({ 
            error: err?.message || 'Internal server error'
        });
    }
}
