const memoryStorage = {};

const DEFAULT_USERS = [
    { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active' },
];

function getUsers() {
    if (!memoryStorage['users']) {
        memoryStorage['users'] = JSON.parse(JSON.stringify(DEFAULT_USERS));
    }
    return memoryStorage['users'];
}

module.exports = function handler(req, res) {
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
            res.status(200).json({
                success: true,
                data: DEFAULT_USERS,
                total: DEFAULT_USERS.length
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
    } catch (err) {
        console.error('Users handler error:', err);
        res.status(500).json({ 
            error: err?.message || 'Internal server error'
        });
    }
};
