const tasks = require('./v1/tasks.js');
const users = require('./v1/users.js');
const assetTypeMaster = require('./v1/asset-type-master.js');
const assetCategoryMaster = require('./v1/asset-category-master.js');
const services = require('./v1/services.js');
const assetLibrary = require('./v1/assetLibrary.js');
const notifications = require('./v1/notifications.js');

module.exports = function handler(req, res) {
    const url = req.url;
    
    // Route to appropriate handler
    if (url.startsWith('/api/v1/tasks')) {
        return tasks(req, res);
    } else if (url.startsWith('/api/v1/users')) {
        return users(req, res);
    } else if (url.startsWith('/api/v1/asset-type-master')) {
        return assetTypeMaster(req, res);
    } else if (url.startsWith('/api/v1/asset-category-master')) {
        return assetCategoryMaster(req, res);
    } else if (url.startsWith('/api/v1/services')) {
        return services(req, res);
    } else if (url.startsWith('/api/v1/assetLibrary')) {
        return assetLibrary(req, res);
    } else if (url.startsWith('/api/v1/notifications')) {
        return notifications(req, res);
    } else {
        res.status(404).json({ error: 'Endpoint not found' });
    }
};
