import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-User-Id, X-User-Role');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'GET') {
            const assetId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
            
            // Mock QC reviews data
            const mockQCReviews = [
                {
                    id: 1,
                    asset_id: 1,
                    asset_name: 'Website Banner Design',
                    reviewer_id: 1,
                    reviewer_name: 'Admin User',
                    qc_score: 95,
                    qc_status: 'Pass',
                    qc_remarks: 'Excellent quality work, meets all standards',
                    review_date: new Date().toISOString(),
                    checklist_items: [
                        { item: 'Visual Quality', passed: true },
                        { item: 'Brand Guidelines', passed: true },
                        { item: 'File Format', passed: true },
                        { item: 'Resolution', passed: true }
                    ]
                },
                {
                    id: 2,
                    asset_id: 2,
                    asset_name: 'SEO Article Content',
                    reviewer_id: 1,
                    reviewer_name: 'Admin User',
                    qc_score: 0,
                    qc_status: 'Pending',
                    qc_remarks: null,
                    review_date: null,
                    checklist_items: [
                        { item: 'Content Quality', passed: false },
                        { item: 'SEO Optimization', passed: false },
                        { item: 'Grammar', passed: false },
                        { item: 'Readability', passed: false }
                    ]
                }
            ];

            // Filter by asset ID if provided
            const filteredReviews = assetId 
                ? mockQCReviews.filter(review => review.asset_id === parseInt(assetId))
                : mockQCReviews;

            res.status(200).json({
                success: true,
                data: filteredReviews,
                total: filteredReviews.length
            });
            return;
        }

        if (req.method === 'POST') {
            const { asset_id, qc_score, qc_status, qc_remarks } = req.body;
            
            const newReview = {
                id: Date.now(),
                asset_id,
                reviewer_id: 1,
                reviewer_name: 'Admin User',
                qc_score: qc_score || 0,
                qc_status,
                qc_remarks: qc_remarks || null,
                review_date: new Date().toISOString()
            };

            res.status(201).json({
                success: true,
                message: 'QC review submitted successfully',
                data: newReview
            });
            return;
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (err: any) {
        console.error('QC reviews handler error:', err);
        res.status(500).json({ 
            error: err?.message || 'Internal server error'
        });
    }
}