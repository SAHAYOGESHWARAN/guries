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
                // If backend controller not present (e.g. on Vercel), proxy to external backend if configured
                const BACKEND_URL = process.env.BACKEND_URL || process.env.API_URL || process.env.VERCEL_BACKEND_URL;
                if (BACKEND_URL) {
                    // Forward a small, safe set of headers to the backend
                    const targetGetUrl = `${BACKEND_URL.replace(/\/+$/, '')}/api/v1/assetLibrary/${assetId}/qc-review`;
                    const allowedGetHeaders = ['accept', 'authorization', 'cookie', 'x-user-id', 'x-user-role'];
                    const forwardGetHeaders: any = {};
                    Object.entries(req.headers || {}).forEach(([k, v]) => {
                        const lk = k.toLowerCase();
                        if (allowedGetHeaders.includes(lk)) forwardGetHeaders[lk] = Array.isArray(v) ? v[0] : v;
                    });
                    const proxied = await fetch(targetGetUrl, { method: 'GET', headers: forwardGetHeaders as any });
                    const text = await proxied.text();
                    res.status(proxied.status).send(text);
                    return;
                }
                return res.status(501).json({ error: 'Backend controller unavailable' });
            }
            await getAssetQCReviews(expressReq, expressRes);
            return;
        }

        if (req.method === 'POST') {
            if (!reviewAsset) {
                // Proxy POST to external backend if available
                const BACKEND_URL = process.env.BACKEND_URL || process.env.API_URL || process.env.VERCEL_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
                if (!BACKEND_URL) {
                    console.error('POST /qc-review: Backend controller not found and no BACKEND_URL configured');
                    return res.status(503).json({
                        error: 'Backend service unavailable',
                        message: 'QC review service is not properly configured. Please contact support.'
                    });
                }

                try {
                    // Forward headers and body
                    // Build a safe header set for forwarding and ensure JSON body is stringified
                    const targetPostUrl = `${BACKEND_URL.replace(/\/+$/, '')}/api/v1/assetLibrary/${assetId}/qc-review`;
                    const allowedPostHeaders = ['content-type', 'authorization', 'cookie', 'x-user-id', 'x-user-role', 'accept'];
                    const forwardPostHeaders: any = {};
                    Object.entries(req.headers || {}).forEach(([k, v]) => {
                        const lk = k.toLowerCase();
                        if (allowedPostHeaders.includes(lk)) forwardPostHeaders[lk] = Array.isArray(v) ? v[0] : v;
                    });
                    if (!forwardPostHeaders['content-type']) forwardPostHeaders['content-type'] = 'application/json';

                    let bodyToSend: any = undefined;
                    try {
                        if (req.body && typeof req.body === 'object' && Object.keys(req.body).length) {
                            bodyToSend = JSON.stringify(req.body);
                        } else if (typeof req.body === 'string' && req.body.length) {
                            bodyToSend = req.body;
                        }
                    } catch (e) {
                        bodyToSend = undefined;
                    }

                    console.log(`Proxying POST to ${targetPostUrl}`);
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 30000);

                    try {
                        const proxied = await fetch(targetPostUrl, {
                            method: 'POST',
                            headers: forwardPostHeaders as any,
                            body: bodyToSend,
                            signal: controller.signal
                        });
                        const text = await proxied.text();
                        res.status(proxied.status).send(text);
                        return;
                    } finally {
                        clearTimeout(timeoutId);
                    }
                } catch (proxyErr: any) {
                    console.error('Proxy error for POST /qc-review:', proxyErr);
                    return res.status(502).json({
                        error: 'Backend service error',
                        message: proxyErr.message || 'Failed to reach backend service'
                    });
                }
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
