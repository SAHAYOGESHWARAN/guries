import request from 'supertest';
import { pool } from '../config/db';

const API_BASE = 'http://localhost:3001/api/v1';

describe('QC Review Functionality', () => {
    let testAssetId: number;
    let adminUserId = 1;
    let testUserId = 2;

    beforeAll(async () => {
        // Create test asset
        const assetResult = await pool.query(
            `INSERT INTO assets (
                asset_name, asset_type, status, created_by, submitted_by, 
                seo_score, grammar_score, application_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            ['Test Asset for QC', 'web', 'Pending QC Review', testUserId, testUserId, 85, 90, 'web']
        );
        testAssetId = assetResult.lastID;
    });

    afterAll(async () => {
        // Cleanup
        if (testAssetId) {
            await pool.query('DELETE FROM assets WHERE id = ?', [testAssetId]);
            await pool.query('DELETE FROM asset_qc_reviews WHERE asset_id = ?', [testAssetId]);
        }
    });

    describe('POST /assetLibrary/:id/qc-review', () => {
        test('should reject QC review without admin role', async () => {
            const response = await request(API_BASE)
                .post(`/assetLibrary/${testAssetId}/qc-review`)
                .set('X-User-Id', String(testUserId))
                .set('X-User-Role', 'user')
                .send({
                    qc_score: 85,
                    qc_remarks: 'Good quality',
                    qc_decision: 'approved',
                    qc_reviewer_id: testUserId,
                    user_role: 'user'
                });

            expect(response.status).toBe(403);
            expect(response.body.error).toContain('Only administrators');
        });

        test('should approve asset with valid admin request', async () => {
            const response = await request(API_BASE)
                .post(`/assetLibrary/${testAssetId}/qc-review`)
                .set('X-User-Id', String(adminUserId))
                .set('X-User-Role', 'admin')
                .send({
                    qc_score: 90,
                    qc_remarks: 'Excellent quality',
                    qc_decision: 'approved',
                    qc_reviewer_id: adminUserId,
                    user_role: 'admin',
                    checklist_completion: true,
                    checklist_items: {
                        'Brand Compliance': true,
                        'Technical Specs Met': true,
                        'Content Quality': true,
                        'SEO Optimization': true,
                        'Legal / Regulatory Check': true,
                        'Tone of Voice': true
                    }
                });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('QC Approved');
            expect(response.body.qc_score).toBe(90);
            expect(response.body.linking_active).toBe(1);
        });

        test('should reject asset with valid admin request', async () => {
            // Create another test asset
            const assetResult = await pool.query(
                `INSERT INTO assets (
                    asset_name, asset_type, status, created_by, submitted_by, 
                    seo_score, grammar_score, application_type
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                ['Test Asset for Rejection', 'web', 'Pending QC Review', testUserId, testUserId, 45, 50, 'web']
            );
            const rejectAssetId = assetResult.lastID;

            const response = await request(API_BASE)
                .post(`/assetLibrary/${rejectAssetId}/qc-review`)
                .set('X-User-Id', String(adminUserId))
                .set('X-User-Role', 'admin')
                .send({
                    qc_score: 40,
                    qc_remarks: 'Quality below standards',
                    qc_decision: 'rejected',
                    qc_reviewer_id: adminUserId,
                    user_role: 'admin',
                    checklist_completion: false,
                    checklist_items: {
                        'Brand Compliance': false,
                        'Technical Specs Met': true,
                        'Content Quality': false,
                        'SEO Optimization': false,
                        'Legal / Regulatory Check': true,
                        'Tone of Voice': false
                    }
                });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('QC Rejected');
            expect(response.body.qc_score).toBe(40);
            expect(response.body.linking_active).toBe(0);

            // Cleanup
            await pool.query('DELETE FROM assets WHERE id = ?', [rejectAssetId]);
        });

        test('should send asset for rework with valid admin request', async () => {
            // Create another test asset
            const assetResult = await pool.query(
                `INSERT INTO assets (
                    asset_name, asset_type, status, created_by, submitted_by, 
                    seo_score, grammar_score, application_type
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                ['Test Asset for Rework', 'web', 'Pending QC Review', testUserId, testUserId, 65, 70, 'web']
            );
            const reworkAssetId = assetResult.lastID;

            const response = await request(API_BASE)
                .post(`/assetLibrary/${reworkAssetId}/qc-review`)
                .set('X-User-Id', String(adminUserId))
                .set('X-User-Role', 'admin')
                .send({
                    qc_score: 65,
                    qc_remarks: 'Needs minor revisions',
                    qc_decision: 'rework',
                    qc_reviewer_id: adminUserId,
                    user_role: 'admin',
                    checklist_completion: false,
                    checklist_items: {
                        'Brand Compliance': true,
                        'Technical Specs Met': true,
                        'Content Quality': false,
                        'SEO Optimization': true,
                        'Legal / Regulatory Check': true,
                        'Tone of Voice': true
                    }
                });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('Rework Required');
            expect(response.body.rework_count).toBe(1);
            expect(response.body.linking_active).toBe(0);

            // Cleanup
            await pool.query('DELETE FROM assets WHERE id = ?', [reworkAssetId]);
        });

        test('should reject invalid QC decision', async () => {
            const response = await request(API_BASE)
                .post(`/assetLibrary/${testAssetId}/qc-review`)
                .set('X-User-Id', String(adminUserId))
                .set('X-User-Role', 'admin')
                .send({
                    qc_score: 85,
                    qc_remarks: 'Test',
                    qc_decision: 'invalid_decision',
                    qc_reviewer_id: adminUserId,
                    user_role: 'admin'
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('approved', 'rejected', 'rework');
        });

        test('should return 404 for non-existent asset', async () => {
            const response = await request(API_BASE)
                .post(`/assetLibrary/99999/qc-review`)
                .set('X-User-Id', String(adminUserId))
                .set('X-User-Role', 'admin')
                .send({
                    qc_score: 85,
                    qc_remarks: 'Test',
                    qc_decision: 'approved',
                    qc_reviewer_id: adminUserId,
                    user_role: 'admin'
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toContain('not found');
        });
    });

    describe('GET /assetLibrary/:id/qc-reviews', () => {
        test('should retrieve QC reviews for an asset', async () => {
            const response = await request(API_BASE)
                .get(`/assetLibrary/${testAssetId}/qc-reviews`)
                .set('X-User-Id', String(testUserId))
                .set('X-User-Role', 'user');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });
});
