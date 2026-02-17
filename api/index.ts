import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as dataStore from './data-store';

// Map API endpoints to data store collections
const ENDPOINT_MAP: Record<string, string> = {
    'assets': 'assets',
    'keywords': 'keywords',
    'projects': 'projects',
    'tasks': 'tasks',
    'campaigns': 'campaigns',
    'services': 'services',
    'users': 'users',
    'asset-category-master': 'asset-category-master',
    'asset-type-master': 'asset-type-master',
    'sub-services': 'sub-services',
    'brands': 'brands',
    'content': 'content',
    'notifications': 'notifications'
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Mock auth endpoint
        if (req.url?.includes('/auth/login') && req.method === 'POST') {
            const { email, password } = req.body;

            // Mock credentials
            if (email === 'admin@example.com' && password === 'admin123') {
                return res.status(200).json({
                    success: true,
                    user: {
                        id: 1,
                        email: 'admin@example.com',
                        name: 'Admin User',
                        role: 'admin'
                    },
                    token: 'mock-jwt-token-' + Date.now()
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Health check endpoint
        if (req.url?.includes('/health') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                status: 'healthy',
                database: 'mock',
                timestamp: new Date().toISOString(),
                assets: {
                    count: dataStore.getAll('assets').length,
                    table_exists: true
                }
            });
        }

        // Parse URL to get collection and ID
        const urlParts = req.url?.split('?')[0].split('/').filter(Boolean) || [];
        const collection = urlParts[urlParts.length - 1];
        const id = urlParts[urlParts.length - 2];
        const isIdRoute = !isNaN(Number(id));

        // Generic CRUD handler for all collections
        if (ENDPOINT_MAP[collection]) {
            const collectionName = ENDPOINT_MAP[collection];

            // GET all items
            if (req.method === 'GET' && !isIdRoute) {
                const items = dataStore.getAll(collectionName);
                return res.status(200).json({
                    success: true,
                    data: items
                });
            }

            // GET single item by ID
            if (req.method === 'GET' && isIdRoute) {
                const item = dataStore.getById(collectionName, Number(id));
                if (!item) {
                    return res.status(404).json({
                        success: false,
                        error: 'Item not found'
                    });
                }
                return res.status(200).json({
                    success: true,
                    data: item
                });
            }

            // POST - Create new item
            if (req.method === 'POST') {
                const newItem = dataStore.create(collectionName, req.body);
                return res.status(201).json({
                    success: true,
                    data: newItem
                });
            }

            // PUT - Update item
            if (req.method === 'PUT' && isIdRoute) {
                try {
                    const updated = dataStore.update(collectionName, Number(id), req.body);
                    return res.status(200).json({
                        success: true,
                        data: updated,
                        message: 'Item updated successfully'
                    });
                } catch (error: any) {
                    return res.status(404).json({
                        success: false,
                        error: error.message
                    });
                }
            }

            // PATCH - Partial update item
            if (req.method === 'PATCH' && isIdRoute) {
                try {
                    const updated = dataStore.update(collectionName, Number(id), req.body);
                    return res.status(200).json({
                        success: true,
                        data: updated,
                        message: 'Item updated successfully'
                    });
                } catch (error: any) {
                    return res.status(404).json({
                        success: false,
                        error: error.message
                    });
                }
            }

            // DELETE - Remove item
            if (req.method === 'DELETE' && isIdRoute) {
                const deleted = dataStore.remove(collectionName, Number(id));
                if (!deleted) {
                    return res.status(404).json({
                        success: false,
                        error: 'Item not found'
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: 'Item deleted'
                });
            }
        }

        // Fallback for specific endpoints
        if (req.url?.includes('/services') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: dataStore.getAll('services')
            });
        }

        if (req.url?.includes('/keywords') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: dataStore.getAll('keywords')
            });
        }

        if (req.url?.includes('/keywords') && req.method === 'POST') {
            const newKeyword = dataStore.create('keywords', req.body);
            return res.status(201).json(newKeyword);
        }

        if (req.url?.includes('/users') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: dataStore.getAll('users')
            });
        }

        if (req.url?.includes('/projects') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: dataStore.getAll('projects')
            });
        }

        if (req.url?.includes('/projects') && req.method === 'POST') {
            const newProject = dataStore.create('projects', req.body);
            return res.status(201).json(newProject);
        }

        if (req.url?.includes('/tasks') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: dataStore.getAll('tasks')
            });
        }

        if (req.url?.includes('/tasks') && req.method === 'POST') {
            const newTask = dataStore.create('tasks', req.body);
            return res.status(201).json(newTask);
        }

        if (req.url?.includes('/campaigns') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: dataStore.getAll('campaigns')
            });
        }

        if (req.url?.includes('/campaigns') && req.method === 'POST') {
            const newCampaign = dataStore.create('campaigns', req.body);
            return res.status(201).json(newCampaign);
        }

        if (req.url?.includes('/content') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: dataStore.getAll('content')
            });
        }

        if (req.url?.includes('/content') && req.method === 'POST') {
            const newContent = dataStore.create('content', req.body);
            return res.status(201).json(newContent);
        }

        if (req.url?.includes('/assets') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: dataStore.getAll('assets')
            });
        }

        if (req.url?.includes('/assets') && req.method === 'POST') {
            const newAsset = dataStore.create('assets', req.body);
            return res.status(201).json(newAsset);
        }

        if (req.url?.includes('/brands') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: dataStore.getAll('brands')
            });
        }

        if (req.url?.includes('/brands') && req.method === 'POST') {
            const newBrand = dataStore.create('brands', req.body);
            return res.status(201).json(newBrand);
        }

        if (req.url?.includes('/sub-services') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: dataStore.getAll('sub-services')
            });
        }

        if (req.url?.includes('/sub-services') && req.method === 'POST') {
            const newSubService = dataStore.create('sub-services', req.body);
            return res.status(201).json(newSubService);
        }

        if (req.url?.includes('/asset-category-master') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: dataStore.getAll('asset-category-master')
            });
        }

        if (req.url?.includes('/asset-category-master') && req.method === 'POST') {
            const newCategory = dataStore.create('asset-category-master', req.body);
            return res.status(201).json(newCategory);
        }

        if (req.url?.includes('/asset-type-master') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: dataStore.getAll('asset-type-master')
            });
        }

        if (req.url?.includes('/asset-type-master') && req.method === 'POST') {
            const newType = dataStore.create('asset-type-master', req.body);
            return res.status(201).json(newType);
        }

        if (req.url?.includes('/notifications') && req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: dataStore.getAll('notifications')
            });
        }

        if (req.url?.includes('/notifications') && req.method === 'POST') {
            const newNotification = dataStore.create('notifications', req.body);
            return res.status(201).json(newNotification);
        }

        // Default response
        res.status(200).json({
            message: 'API is running',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('[API] Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}
