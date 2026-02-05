import { VercelRequest, VercelResponse } from '@vercel/node';
import * as path from 'path';
import * as fs from 'fs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-User-Id, X-User-Role');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Try to load compiled backend assetController when available (deploy-time preference)
    const possiblePaths = [
        path.resolve(__dirname, '../../../backend/dist/controllers/assetController.js'),
        path.resolve(__dirname, '../../../backend/dist/controllers/assetController.cjs'),
        path.resolve(process.cwd(), 'backend/dist/controllers/assetController.js')
    ];

    let controllerPath = '';
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) { controllerPath = p; break; }
    }

    let assetModule: any = null;
    try {
        if (controllerPath) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const mod: any = require(controllerPath);
            assetModule = mod.assetController || mod || (mod.default && mod.default);
            console.log('Loaded backend assetController from', controllerPath);
        } else {
            console.warn('Backend assetController not found at expected paths:', possiblePaths);
        }
    } catch (e) {
        console.error('Error loading backend assetController:', e);
    }

    const expressReq: any = { params: req.query || {}, query: req.query || {}, body: req.body || {}, headers: req.headers || {} };
    const expressRes: any = {
        status: (code: number) => ({ json: (payload: any) => res.status(code).json(payload), send: (payload: any) => res.status(code).send(payload) }),
        json: (payload: any) => res.status(200).json(payload),
        send: (payload: any) => res.status(200).send(payload)
    };

    try {
        // If backend controller is present, dispatch to its handlers (so deploy-side uses real logic and socket emissions)
        if (assetModule) {
            if (req.method === 'GET') {
                // If client asked with an id param, delegate to getAssetLibraryItem via separate serverless file.
                if (req.query && req.query.id) {
                    expressReq.params = { id: req.query.id };
                    if (typeof assetModule.getAssetLibraryItem === 'function') {
                        await assetModule.getAssetLibraryItem(expressReq, expressRes);
                        return;
                    }
                }

                if (typeof assetModule.getAssetLibrary === 'function') {
                    await assetModule.getAssetLibrary(expressReq, expressRes);
                    return;
                }
            }

            if (req.method === 'POST') {
                if (typeof assetModule.createAssetLibraryItem === 'function') {
                    await assetModule.createAssetLibraryItem(expressReq, expressRes);
                    return;
                }
                if (typeof assetModule.createAsset === 'function') {
                    await assetModule.createAsset(expressReq, expressRes);
                    return;
                }
            }
        }

        // Fallback: lightweight mock implementation for environments without backend
        if (req.method === 'GET') {
            const mockAssets = [
                { id: 1, asset_name: 'Marketing Banner 2024', asset_type: 'Image', category: 'Marketing Materials', status: 'Approved', qc_score: 95, created_by: 'Content Team', created_at: new Date().toISOString(), file_url: '/assets/banner-2024.jpg' },
                { id: 2, asset_name: 'Product Demo Video', asset_type: 'Video', category: 'Product Assets', status: 'Pending QC Review', qc_score: 0, created_by: 'Video Team', created_at: new Date().toISOString(), file_url: '/assets/product-demo.mp4' },
                { id: 3, asset_name: 'Brand Guidelines PDF', asset_type: 'Document', category: 'Brand Assets', status: 'QC Approved', qc_score: 88, created_by: 'Design Team', created_at: new Date().toISOString(), file_url: '/assets/brand-guidelines.pdf' }
            ];
            res.status(200).json({ success: true, data: mockAssets, total: mockAssets.length });
            return;
        }

        if (req.method === 'POST') {
            const { asset_name, asset_type, category, file_url } = req.body;
            if (!asset_name || !asset_type) return res.status(400).json({ error: 'Asset name and type are required' });

            // Remove default status: do not force a default 'Draft' value on mock create
            const newAsset: any = { id: Date.now(), asset_name, asset_type, category: category || 'General', status: null, qc_score: 0, created_by: 'User', created_at: new Date().toISOString(), file_url: file_url || '' };
            res.status(201).json({ success: true, message: 'Asset created successfully', data: newAsset });
            return;
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (err: any) {
        console.error('Asset library handler error:', err);
        res.status(500).json({ error: err?.message || 'Internal server error' });
    }
}
