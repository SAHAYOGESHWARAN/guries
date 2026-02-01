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

    const assetId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

    // Resolve compiled backend controller relative to this file
    const controllerRel = '../../backend/dist/controllers/assetController.js';
    const controllerPath = path.resolve(__dirname, controllerRel);

    let getAssetQCReviews: any = null;
    try {
        if (fs.existsSync(controllerPath)) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const mod: any = require(controllerPath);
            getAssetQCReviews = mod.getAssetQCReviews || (mod.default && mod.default.getAssetQCReviews) || mod.default;
        }
        else {
            console.warn('Backend controller not found at', controllerPath);
        }
    }
    catch (err) {
        console.error('Error loading backend controller at', controllerPath, err);
    }

    const expressReq: any = {
        params: { id: assetId },
        query: req.query || {},
        body: req.body || {},
        headers: req.headers || {}
    };

    const expressRes: any = {
        status: (code: number) => ({
            json: (payload: any) => res.status(code).json(payload),
            send: (payload: any) => res.status(code).send(payload)
        }),
        json: (payload: any) => res.status(200).json(payload),
        send: (payload: any) => res.status(200).send(payload)
    };

    try {
        if (req.method === 'GET') {
            if (!assetId) {
                return res.status(400).json({ error: 'Missing asset id' });
            }
            if (!getAssetQCReviews) {
                return res.status(501).json({ error: 'Backend controller unavailable' });
            }
            await getAssetQCReviews(expressReq, expressRes);
            return;
        }

        // Keep POST as echo for now, but return 501 if backend isn't present
        if (req.method === 'POST') {
            if (!getAssetQCReviews) {
                return res.status(501).json({ error: 'Backend controller unavailable' });
            }
            // POST to this endpoint is not implemented in backend; forward client to use assetLibrary/:id/qc-review
            return res.status(405).json({ error: 'Use /assetLibrary/:id/qc-review to submit QC reviews' });
        }

        res.status(405).json({ error: 'Method not allowed' });
    }
    catch (err: any) {
        console.error('qc-reviews handler error:', err);
        res.status(500).json({ error: err?.message || 'Internal server error' });
    }
}