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
            // Mock tasks data
            const mockTasks = [
                {
                    id: 1,
                    title: 'Review Asset QC',
                    description: 'QC review for marketing assets',
                    status: 'pending',
                    priority: 'high',
                    assigned_to: 'qc_team',
                    due_date: new Date().toISOString(),
                    created_at: new Date().toISOString()
                },
                {
                    id: 2,
                    title: 'Update Asset Library',
                    description: 'Add new assets to library',
                    status: 'in_progress',
                    priority: 'medium',
                    assigned_to: 'content_team',
                    due_date: new Date(Date.now() + 86400000).toISOString(),
                    created_at: new Date().toISOString()
                }
            ];

            res.status(200).json({
                success: true,
                data: mockTasks,
                total: mockTasks.length
            });
            return;
        }

        if (req.method === 'POST') {
            const { title, description, priority, assigned_to } = req.body;
            
            if (!title) {
                return res.status(400).json({
                    error: 'Title is required'
                });
            }

            const newTask = {
                id: Date.now(),
                title,
                description: description || '',
                status: 'pending',
                priority: priority || 'medium',
                assigned_to: assigned_to || 'unassigned',
                due_date: new Date().toISOString(),
                created_at: new Date().toISOString()
            };

            res.status(201).json({
                success: true,
                message: 'Task created successfully',
                data: newTask
            });
            return;
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (err: any) {
        console.error('Tasks handler error:', err);
        res.status(500).json({ 
            error: err?.message || 'Internal server error'
        });
    }
}
