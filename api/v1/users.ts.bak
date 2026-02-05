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
            // Mock users data
            const mockUsers = [
                {
                    id: 1,
                    name: 'Admin User',
                    email: 'admin@guries.com',
                    role: 'admin',
                    status: 'active',
                    created_at: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'QC Reviewer',
                    email: 'qc@guries.com',
                    role: 'qc_reviewer',
                    status: 'active',
                    created_at: new Date().toISOString()
                },
                {
                    id: 3,
                    name: 'Content Creator',
                    email: 'content@guries.com',
                    role: 'content_creator',
                    status: 'active',
                    created_at: new Date().toISOString()
                }
            ];

            res.status(200).json({
                success: true,
                data: mockUsers,
                total: mockUsers.length
            });
            return;
        }

        if (req.method === 'POST') {
            const { name, email, role } = req.body;
            
            if (!name || !email) {
                return res.status(400).json({
                    error: 'Name and email are required'
                });
            }

            const newUser = {
                id: Date.now(),
                name,
                email,
                role: role || 'user',
                status: 'active',
                created_at: new Date().toISOString()
            };

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: newUser
            });
            return;
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (err: any) {
        console.error('Users handler error:', err);
        res.status(500).json({ 
            error: err?.message || 'Internal server error'
        });
    }
}
