import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { pool } from '../config/db';

/**
 * Complete QC Workflow Tests
 * Tests the entire QC approval/rejection workflow with status updates
 */

describe('QC Workflow - Complete Flow', () => {
    let testAssetId: number;
    let testServiceId: number;
    let testUserId: number;

    beforeAll(async () => {
        // Create test user
        const userResult = await pool.query(
            `INSERT INTO users (name, email, role) VALUES (?, ?, ?)`,
            ['Test QC Reviewer', 'qc@test.com', 'qc_reviewer']
        );
        testUserId = userResult.lastID;

        // Create test service
        const serviceResult = await pool.query(
            `INSERT INTO services (service_name, service_code, slug, status) 
             VALUES (?, ?, ?, ?)`,
            ['Test Service', 'TS-001', 'test-service', 'active']
        );
        testServiceId = serviceResult.lastID;

        // Create test asset
        const assetResult = await pool.query(
            `INSERT INTO assets (
                asset_name, asset_type, application_type, status, qc_status,
                workflow_stage, seo_score, grammar_score, created_by, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                'Test Asset',
                'Image',
                'WEB',
                'Draft',
                'Pending',
                'Add',
                85,
                90,
                testUserId,
                new Date().toISOString()
            ]
        );
        testAssetId = assetResult.lastID;
    });

    afterAll(async () => {
        // Cleanup
        await pool.query('DELETE FROM assets WHERE id = ?', [testAssetId]);
        await pool.query('DELETE FROM services WHERE id = ?', [testServiceId]);
        await pool.query('DELETE FROM users WHERE id = ?', [testUserId]);
    });

    describe('Asset Creation', () => {
        it('should create asset with pending QC status', async () => {
            const result = await pool.query(
                'SELECT * FROM assets WHERE id = ?',
                [testAssetId]
            );

            expect(result.rows.length).toBe(1);
            const asset = result.rows[0];
            expect(asset.qc_status).toBe('Pending');
            expect(asset.workflow_stage).toBe('Add');
            expect(asset.linking_active).toBe(0);
        });

        it('should have workflow log entry for creation', async () => {
            const result = await pool.query(
                'SELECT workflow_log FROM assets WHERE id = ?',
                [testAssetId]
            );

            const asset = result.rows[0];
            const workflowLog = JSON.parse(asset.workflow_log || '[]');
            expect(workflowLog.length).toBeGreaterThan(0);
        });
    });

    describe('QC Approval Flow', () => {
        it('should approve asset and update all fields', async () => {
            const remarks = 'Asset meets all QC standards';
            const score = 95;

            // Simulate approval
            const workflowLog = [{
                action: 'approved',
                timestamp: new Date().toISOString(),
                user_id: testUserId,
                status: 'Published',
                workflow_stage: 'Approve',
                remarks
            }];

            await pool.query(
                `UPDATE assets 
                 SET qc_status = 'Approved',
                     workflow_stage = 'Approve',
                     linking_active = 1,
                     qc_reviewer_id = ?,
                     qc_reviewed_at = CURRENT_TIMESTAMP,
                     qc_remarks = ?,
                     qc_score = ?,
                     status = 'Published',
                     workflow_log = ?
                 WHERE id = ?`,
                [testUserId, remarks, score, JSON.stringify(workflowLog), testAssetId]
            );

            // Verify updates
            const result = await pool.query(
                'SELECT * FROM assets WHERE id = ?',
                [testAssetId]
            );

            const asset = result.rows[0];
            expect(asset.qc_status).toBe('Approved');
            expect(asset.workflow_stage).toBe('Approve');
            expect(asset.linking_active).toBe(1);
            expect(asset.status).toBe('Published');
            expect(asset.qc_score).toBe(score);
            expect(asset.qc_remarks).toBe(remarks);
        });

        it('should not appear in pending QC list after approval', async () => {
            const result = await pool.query(
                `SELECT * FROM assets WHERE qc_status IN ('Pending', 'Rework')`
            );

            const pendingAssets = result.rows.filter((a: any) => a.id === testAssetId);
            expect(pendingAssets.length).toBe(0);
        });

        it('should activate linking after approval', async () => {
            const result = await pool.query(
                'SELECT linking_active FROM assets WHERE id = ?',
                [testAssetId]
            );

            expect(result.rows[0].linking_active).toBe(1);
        });
    });

    describe('QC Rejection Flow', () => {
        let rejectAssetId: number;

        beforeAll(async () => {
            // Create another test asset for rejection
            const result = await pool.query(
                `INSERT INTO assets (
                    asset_name, asset_type, application_type, status, qc_status,
                    workflow_stage, seo_score, grammar_score, created_by, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    'Test Asset for Rejection',
                    'Image',
                    'WEB',
                    'Draft',
                    'Pending',
                    'Add',
                    45,
                    50,
                    testUserId,
                    new Date().toISOString()
                ]
            );
            rejectAssetId = result.lastID;
        });

        afterAll(async () => {
            await pool.query('DELETE FROM assets WHERE id = ?', [rejectAssetId]);
        });

        it('should reject asset and update status', async () => {
            const remarks = 'Asset does not meet quality standards';
            const score = 40;

            const workflowLog = [{
                action: 'rejected',
                timestamp: new Date().toISOString(),
                user_id: testUserId,
                status: 'Rejected',
                workflow_stage: 'QC',
                remarks
            }];

            await pool.query(
                `UPDATE assets 
                 SET qc_status = 'Rejected',
                     workflow_stage = 'QC',
                     linking_active = 0,
                     qc_reviewer_id = ?,
                     qc_reviewed_at = CURRENT_TIMESTAMP,
                     qc_remarks = ?,
                     qc_score = ?,
                     status = 'Rejected',
                     workflow_log = ?
                 WHERE id = ?`,
                [testUserId, remarks, score, JSON.stringify(workflowLog), rejectAssetId]
            );

            const result = await pool.query(
                'SELECT * FROM assets WHERE id = ?',
                [rejectAssetId]
            );

            const asset = result.rows[0];
            expect(asset.qc_status).toBe('Rejected');
            expect(asset.workflow_stage).toBe('QC');
            expect(asset.linking_active).toBe(0);
            expect(asset.status).toBe('Rejected');
        });

        it('should keep asset in pending list if not approved', async () => {
            // Create another pending asset
            const result = await pool.query(
                `INSERT INTO assets (
                    asset_name, asset_type, application_type, status, qc_status,
                    workflow_stage, created_by, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    'Another Pending Asset',
                    'Image',
                    'WEB',
                    'Draft',
                    'Pending',
                    'Add',
                    testUserId,
                    new Date().toISOString()
                ]
            );

            const pendingResult = await pool.query(
                `SELECT * FROM assets WHERE qc_status IN ('Pending', 'Rework')`
            );

            const hasPending = pendingResult.rows.some((a: any) => a.id === result.lastID);
            expect(hasPending).toBe(true);

            // Cleanup
            await pool.query('DELETE FROM assets WHERE id = ?', [result.lastID]);
        });
    });

    describe('QC Rework Flow', () => {
        let reworkAssetId: number;

        beforeAll(async () => {
            const result = await pool.query(
                `INSERT INTO assets (
                    asset_name, asset_type, application_type, status, qc_status,
                    workflow_stage, created_by, created_at, rework_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    'Test Asset for Rework',
                    'Image',
                    'WEB',
                    'Draft',
                    'Pending',
                    'Add',
                    testUserId,
                    new Date().toISOString(),
                    0
                ]
            );
            reworkAssetId = result.lastID;
        });

        afterAll(async () => {
            await pool.query('DELETE FROM assets WHERE id = ?', [reworkAssetId]);
        });

        it('should request rework and increment counter', async () => {
            const remarks = 'Please improve image quality and add alt text';

            const workflowLog = [{
                action: 'rework_requested',
                timestamp: new Date().toISOString(),
                user_id: testUserId,
                status: 'Rework Requested',
                workflow_stage: 'QC',
                remarks
            }];

            await pool.query(
                `UPDATE assets 
                 SET qc_status = 'Rework',
                     workflow_stage = 'QC',
                     linking_active = 0,
                     qc_reviewer_id = ?,
                     qc_reviewed_at = CURRENT_TIMESTAMP,
                     qc_remarks = ?,
                     rework_count = rework_count + 1,
                     status = 'Rework Requested',
                     workflow_log = ?
                 WHERE id = ?`,
                [testUserId, remarks, JSON.stringify(workflowLog), reworkAssetId]
            );

            const result = await pool.query(
                'SELECT * FROM assets WHERE id = ?',
                [reworkAssetId]
            );

            const asset = result.rows[0];
            expect(asset.qc_status).toBe('Rework');
            expect(asset.rework_count).toBe(1);
            expect(asset.status).toBe('Rework Requested');
        });

        it('should appear in pending list with Rework status', async () => {
            const result = await pool.query(
                `SELECT * FROM assets WHERE qc_status IN ('Pending', 'Rework') AND id = ?`,
                [reworkAssetId]
            );

            expect(result.rows.length).toBe(1);
            expect(result.rows[0].qc_status).toBe('Rework');
        });
    });

    describe('Service Asset Linking', () => {
        it('should create static service link', async () => {
            // Create link
            await pool.query(
                `INSERT INTO service_asset_links (asset_id, service_id, is_static, created_by, created_at)
                 VALUES (?, ?, 1, ?, CURRENT_TIMESTAMP)`,
                [testAssetId, testServiceId, testUserId]
            );

            // Verify link exists
            const result = await pool.query(
                `SELECT * FROM service_asset_links WHERE asset_id = ? AND service_id = ?`,
                [testAssetId, testServiceId]
            );

            expect(result.rows.length).toBe(1);
            expect(result.rows[0].is_static).toBe(1);
        });

        it('should only show linked assets when linking_active = 1', async () => {
            // Get linked assets for service
            const result = await pool.query(
                `SELECT a.* FROM assets a
                 JOIN service_asset_links sal ON a.id = sal.asset_id
                 WHERE sal.service_id = ? AND a.linking_active = 1`,
                [testServiceId]
            );

            // Should include our approved asset
            const hasAsset = result.rows.some((a: any) => a.id === testAssetId);
            expect(hasAsset).toBe(true);
        });
    });

    describe('Workflow Log Tracking', () => {
        it('should maintain complete workflow history', async () => {
            const result = await pool.query(
                'SELECT workflow_log FROM assets WHERE id = ?',
                [testAssetId]
            );

            const workflowLog = JSON.parse(result.rows[0].workflow_log || '[]');
            expect(workflowLog.length).toBeGreaterThan(0);

            // Verify log entries have required fields
            workflowLog.forEach((entry: any) => {
                expect(entry).toHaveProperty('action');
                expect(entry).toHaveProperty('timestamp');
                expect(entry).toHaveProperty('user_id');
                expect(entry).toHaveProperty('status');
                expect(entry).toHaveProperty('workflow_stage');
            });
        });
    });
});
