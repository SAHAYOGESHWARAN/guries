const tasks = require('./v1/tasks.js');
const users = require('./v1/users.js');
const assetTypeMaster = require('./v1/asset-type-master.js');
const assetCategoryMaster = require('./v1/asset-category-master.js');
const services = require('./v1/services.js');
const assetLibrary = require('./v1/assetLibrary.js');
const notifications = require('./v1/notifications.js');

module.exports = function handler(req, res) {
    const url = req.url;
    
    // Set CORS headers for all responses
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-User-Id, X-User-Role');

    // Handle OPTIONS requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Route to appropriate handler based on URL path
    if (url.includes('/tasks')) {
        return tasks(req, res);
    } else if (url.includes('/users')) {
        return users(req, res);
    } else if (url.includes('/asset-type-master')) {
        return assetTypeMaster(req, res);
    } else if (url.includes('/asset-category-master')) {
        return assetCategoryMaster(req, res);
    } else if (url.includes('/services')) {
        return services(req, res);
    } else if (url.includes('/assetLibrary')) {
        return assetLibrary(req, res);
    } else if (url.includes('/notifications')) {
        return notifications(req, res);
    } else {
        res.status(404).json({ error: 'Endpoint not found', url: url });
    }
};
