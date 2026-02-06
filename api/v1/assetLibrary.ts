import { VercelRequest, VercelResponse } from '@vercel/node';

// Simple in-memory storage for testing
const assetStore: any[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    // Handle OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            // Get all assets
            return res.status(200).json({
                success: true,
                data: assetStore,
                count: assetStore.length,
                message: 'Assets retrieved successfully'
            });
        }

        if (req.method === 'POST') {
            // Create new asset
            const { asset_name, asset_type, asset_category, asset_format, status } = req.body;

            if (!asset_name) {
                return res.status(400).json({
                    success: false,
                    error: 'asset_name is required'
                });
            }

            const newAsset = {
                id: assetStore.length + 1,
                asset_name,
                asset_type: asset_type || null,
                asset_category: asset_category || null,
                asset_format: asset_format || null,
                status: status || 'draft',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            assetStore.push(newAsset);

            return res.status(201).json({
                success: true,
                data: newAsset,
                message: 'Asset created successfully'
            });
        }

        if (req.method === 'PUT') {
            // Update asset
            const { id } = req.query;
            const { asset_name, status } = req.body;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'id is required'
                });
            }

            const assetIndex = assetStore.findIndex(a => a.id === parseInt(id as string));
            if (assetIndex === -1) {
                return res.status(404).json({
                    success: false,
                    error: 'Asset not found'
                });
            }

            assetStore[assetIndex] = {
                ...assetStore[assetIndex],
                asset_name: asset_name || assetStore[assetIndex].asset_name,
                status: status || assetStore[assetIndex].status,
                updated_at: new Date().toISOString()
            };

            return res.status(200).json({
                success: true,
                data: assetStore[assetIndex],
                message: 'Asset updated successfully'
            });
        }

        if (req.method === 'DELETE') {
            // Delete asset
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'id is required'
                });
            }

            const assetIndex = assetStore.findIndex(a => a.id === parseInt(id as string));
            if (assetIndex === -1) {
                return res.status(404).json({
                    success: false,
                    error: 'Asset not found'
                });
            }

            assetStore.splice(assetIndex, 1);

            return res.status(200).json({
                success: true,
                message: 'Asset deleted successfully'
            });
        }

        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });

    } catch (error: any) {
        console.error('[API] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}
