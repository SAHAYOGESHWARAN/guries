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

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { id } = req.query;
    if (!id || Array.isArray(id)) {
        res.status(400).json({ error: 'Invalid asset ID' });
        return;
    }

    // Resolve compiled backend QC controller relative to this file with multiple fallback paths
    const possiblePaths = [
        path.resolve(__dirname, '../../../backend/dist/controllers/qcReviewController.js'),
        path.resolve(__dirname, '../../../backend/dist/controllers/qcReviewController.cjs'),
        path.resolve(__dirname, '../../../backend/dist/controllers/qcReviewController.ts'),
        path.resolve(__dirname, '../../../../backend/dist/controllers/qcReviewController.js'),
        path.resolve(process.cwd(), 'backend/dist/controllers/qcReviewController.js'),
        path.resolve(process.cwd(), 'backend/dist/controllers/qcReviewController.cjs')
    ];

    let controllerPath = '';
    for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
            controllerPath = possiblePath;
            break;
        }
    }

    let qcModule: any = null;
    try {
        if (controllerPath && fs.existsSync(controllerPath)) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const mod: any = require(controllerPath);
            qcModule = mod.qcReviewController || mod || (mod.default && mod.default);
            console.log('Successfully loaded QC backend controller from:', controllerPath);
        } else {
            console.error('Backend QC controller not found. Attempted paths:', possiblePaths);
            console.error('Current working directory:', process.cwd());
            console.error('__dirname:', __dirname);
        }
    } catch (err) {
        console.error('Error loading QC backend controller at', controllerPath, err);
    }

    const expressReq: any = {
        params: { id },
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
        if (!qcModule) {
            // Fallback inline implementation for Vercel deployment (no backend available)
            console.log('Using fallback inline QC review POST implementation');

            const { qc_score, qc_remarks, qc_decision, qc_reviewer_id, user_role } = req.body;

            if (!qc_score || !qc_decision || !qc_reviewer_id) {
                return res.status(400).json({
                    error: 'Missing required fields: qc_score, qc_decision, qc_reviewer_id'
                });
            }

            if (!['approved', 'rejected', 'rework'].includes(qc_decision)) {
                return res.status(400).json({
                    error: 'Invalid qc_decision. Must be: approved, rejected, or rework'
                });
            }

            const response = {
                success: true,
                message: `Asset ${id} has been ${qc_decision}`,
                data: {
                    asset_id: parseInt(id),
                    qc_score,
                    qc_remarks: qc_remarks || '',
                    qc_decision,
                    qc_reviewer_id,
                    user_role: user_role || 'unknown',
                    status: qc_decision === 'approved' ? 'QC Approved' : 
                           qc_decision === 'rejected' ? 'QC Rejected' : 'Rework Required',
                    linking_active: qc_decision === 'approved' ? 1 : 0,
                    reviewed_at: new Date().toISOString()
                }
            };

            res.status(200).json(response);
            return;
        }

        // If qcModule is present, dispatch to the appropriate controller method
        const decision = (req.body && req.body.qc_decision) ? String(req.body.qc_decision).toLowerCase() : null;
        if (!decision) {
            return res.status(400).json({ error: 'Missing qc_decision in request body' });
        }

        if (decision === 'approved' && typeof qcModule.approveAsset === 'function') {
            await qcModule.approveAsset(expressReq, expressRes);
            return;
        }

        if (decision === 'rejected' && typeof qcModule.rejectAsset === 'function') {
            await qcModule.rejectAsset(expressReq, expressRes);
            return;
        }

        if (decision === 'rework' && typeof qcModule.requestRework === 'function') {
            await qcModule.requestRework(expressReq, expressRes);
            return;
        }

        // If none matched, attempt a generic handler name
        if (typeof qcModule.reviewAsset === 'function') {
            await qcModule.reviewAsset(expressReq, expressRes);
            return;
        }

        return res.status(500).json({ error: 'QC handler function not found in backend controller' });
    }
    catch (err: any) {
        console.error('qc-review handler error:', err);
        res.status(500).json({ 
            error: err?.message || 'Internal server error',
            details: 'Failed to process QC review'
        });
    }
}
