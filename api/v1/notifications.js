const DEFAULT_NOTIFICATIONS = [
    {
        id: 1,
        title: 'Asset QC Review Required',
        message: 'Product Demo Video is ready for QC review',
        type: 'info',
        read: false,
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        title: 'Asset Approved',
        message: 'Marketing Banner 2024 has been approved',
        type: 'success',
        read: false,
        created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: 3,
        title: 'New Asset Added',
        message: 'Brand Guidelines PDF has been added to the library',
        type: 'info',
        read: true,
        created_at: new Date(Date.now() - 7200000).toISOString()
    }
];

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
                data: DEFAULT_NOTIFICATIONS,
                total: DEFAULT_NOTIFICATIONS.length
            });
            return;
        }

        if (req.method === 'POST') {
            const { title, message, type } = req.body;
            
            if (!title || !message) {
                return res.status(400).json({
                    error: 'Title and message are required'
                });
            }

            const newNotification = {
                id: Date.now(),
                title,
                message,
                type: type || 'info',
                read: false,
                created_at: new Date().toISOString()
            };

            res.status(201).json({
                success: true,
                message: 'Notification created successfully',
                data: newNotification
            });
            return;
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        console.error('Notifications handler error:', err);
        res.status(500).json({ 
            error: err?.message || 'Internal server error'
        });
    }
};
