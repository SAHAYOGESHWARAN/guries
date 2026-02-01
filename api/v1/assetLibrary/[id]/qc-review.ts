import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const assetId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

    // Try to load the compiled backend controller at runtime to avoid TypeScript cross-package import issues
    let reviewAsset: any = null;
    let getAssetQCReviews: any = null;
    try {
        // Path from this file to compiled backend controller
        // (api/v1/assetLibrary/[id] -> ../../../../backend/dist/controllers/assetController.js)
        // Use require so TS doesn't try to type-check the import at compile time
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod: any = require('../../../../backend/dist/controllers/assetController.js');
        reviewAsset = mod.reviewAsset || (mod.default && mod.default.reviewAsset) || mod.default;
        getAssetQCReviews = mod.getAssetQCReviews || (mod.default && mod.default.getAssetQCReviews) || mod.default;
    } catch (err) {
        console.error('Failed to require backend controller:', err);
    }

    // Adapt Vercel request/response to Express-style objects expected by backend controllers
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
                return res.status(500).json({ error: 'Backend controller not available' });
            }
            await getAssetQCReviews(expressReq, expressRes);
            return;
        }

        if (req.method === 'POST') {
            if (!reviewAsset) {
                return res.status(500).json({ error: 'Backend controller not available' });
            }

            // Merge headers into body for role detection if provided by frontend
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
