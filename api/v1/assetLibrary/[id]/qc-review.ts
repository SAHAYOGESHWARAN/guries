import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        import { VercelRequest, VercelResponse } from '@vercel/node';
        import { reviewAsset, getAssetQCReviews } from '../../../../backend/controllers/assetController';

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
                    // Delegate to backend controller to fetch QC reviews and asset QC info
                    await getAssetQCReviews(expressReq, expressRes);
                    return;
                }

                if (req.method === 'POST') {
                    // Merge some headers into body for role detection (X-User-Role)
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
