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

    // Resolve the compiled backend controller path robustly
    const controllerRel = '../../../../backend/dist/controllers/assetController.js';
    const controllerPath = path.resolve(__dirname, controllerRel);

    let reviewAsset: any = null;
    let getAssetQCReviews: any = null;

    if (fs.existsSync(controllerPath)) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const mod: any = require(controllerPath);
            // Support both named exports and default exports
            reviewAsset = mod.reviewAsset || (mod.default && mod.default.reviewAsset) || mod.default;
            getAssetQCReviews = mod.getAssetQCReviews || (mod.default && mod.default.getAssetQCReviews) || mod.default;
        } catch (err) {
            console.error('Error requiring backend controller at', controllerPath, err);
        }
    } else {
        console.warn('Backend controller not found at', controllerPath);
    }

    const expressReq: any = {
        params: { id: assetId },
        body: req.body || {},
        headers: req.headers || {}
    };

    const expressRes: any = {
        status: (code: number) => ({
            json: (payload: any) => {
                res.status(code).json(payload);
            },
            send: (payload: any) => {
                res.status(code).send(payload);
            }
        }),
        json: (payload: any) => res.status(200).json(payload),
        send: (payload: any) => res.status(200).send(payload)
    };

    try {
        if (req.method === 'GET') {
            if (!getAssetQCReviews) {
                return res.status(501).json({ error: 'Backend controller unavailable' });
            }
            await getAssetQCReviews(expressReq, expressRes);
            return;
        }

        if (req.method === 'POST') {
            if (!reviewAsset) {
                return res.status(501).json({ error: 'Backend controller unavailable' });
            }

            // Allow frontend-sent headers to seed reviewer info if not included in body
            if (!expressReq.body.user_role && req.headers['x-user-role']) {
                expressReq.body.user_role = Array.isArray(req.headers['x-user-role']) ? req.headers['x-user-role'][0] : req.headers['x-user-role'];
            }
            if (!expressReq.body.qc_reviewer_id && req.headers['x-user-id']) {
                expressReq.body.qc_reviewer_id = Array.isArray(req.headers['x-user-id']) ? req.headers['x-user-id'][0] : req.headers['x-user-id'];
            }

            await reviewAsset(expressReq, expressRes);
            return;
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (err: any) {
        console.error('QC review function error:', err);
        res.status(500).json({ error: err?.message || 'Internal server error' });
    }
}
