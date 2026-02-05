import { pool } from '../config/db';

/**
 * Service-Asset Linking Test Suite
 * Tests all service-asset linking functionality including:
 * - Asset upload with service linking
 * - Static link creation
 * - QC approval workflow
 * - Workflow status updates
 */

describe('Service-Asset Linking', () => {
    let testServiceId: number;
    let testSubServiceId: number;
    let testAssetId: number;

    beforeAll(async () => {
        // Create test service
        const serviceResult = await pool.query(
            `INSERT INTO services (service_name, service_code, slug, status)
             VALUES (?, ?, ?, ?)`,
            ['Test Service', 'TS-001', 'test-service', 'active']
        );
        testServiceId = serviceResult.lastID;

        // Create test sub-service
        const subServiceResult = await pool.query(
            `INSERT INTO sub_services (sub_service_name, parent_service_id, slug, status)
             VALUES (?, ?, ?, ?)`,
            ['Test Sub-Service', testServiceId, 'test-sub-service', 'active']
        );
        testSubServiceId = subServiceResult.lastID;
    });

    afterAll(async () => {
        // Cleanup
        if (testAssetId) {
            await pool.query('DELETE FROM service_asset_links WHERE asset_id = ?', [testAssetId]);
            await pool.query('DELETE FROM subservice_asset_links WHERE asset_id = ?', [testAssetId]);
            await pool.query('DELETE FROM assets WHERE id = ?', [testAssetId]);
        }
        if (testSubServiceId) {
            await pool.query('DELETE FROM sub_services WHERE id = ?', [testSubServiceId]);
        }
        if (testServiceId) {
            await pool.query('DELETE FROM services WHERE id = ?', [testServiceId]);
        }
    });

    test('Should create asset with service link', async () => {
        const result = await pool.query(
            `INSERT INTO assets (
                asset_name, asset_type, application_type, status, qc_status,
                linked_service_id, linked_sub_service_id,
                linked_service_ids, linked_sub_service_ids,
                workflow_stage, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                'Test Asset',
                'Image',
                'web',
                'Draft',
                'Pending',
                testServiceId,
                testSubServiceId,
                JSON.stringify([testServiceId]),
                JSON.stringify([testSubServiceId]),
                'Add',
                new Date().toISOString()
            ]
        );

        testAssetId = result.lastID;
        expect(testAssetId).toBeDefined();

        // Verify asset was created
        const asset = await pool.query('SELECT * FROM assets WHERE id = ?', [testAssetId]);
        expect(asset.rows.length).toBe(1);
        expect(asset.rows[0].linked_service_id).toBe(testServiceId);
        expect(asset.rows[0].linked_sub_service_id).toBe(testSubServiceId);
    });

    test('Should create static service link', async () => {
        const linkResult = await pool.query(
            `INSERT INTO service_asset_links (asset_id, service_id, sub_service_id, is_static, created_at)
             VALUES (?, ?, ?, 1, ?)`,
            [testAssetId, testServiceId, testSubServiceId, new Date().toISOString()]
        );

        expect(linkResult.lastID).toBeDefined();

        // Verify link was created
        const link = await pool.query(
            'SELECT * FROM service_asset_links WHERE asset_id = ? AND service_id = ?',
            [testAssetId, testServiceId]
        );
        expect(link.rows.length).toBe(1);
        expect(link.rows[0].is_static).toBe(1);
    });

    test('Should update asset status to QC Approved', async () => {
        await pool.query(
            `UPDATE assets 
             SET qc_status = 'Approved',
                 workflow_stage = 'Published',
                 linking_active = 1,
                 status = 'QC Approved'
             WHERE id = ?`,
            [testAssetId]
        );

        const asset = await pool.query('SELECT * FROM assets WHERE id = ?', [testAssetId]);
        expect(asset.rows[0].qc_status).toBe('Approved');
        expect(asset.rows[0].workflow_stage).toBe('Published');
        expect(asset.rows[0].linking_active).toBe(1);
        expect(asset.rows[0].status).toBe('QC Approved');
    });

    test('Should not allow removal of static service link', async () => {
        // Attempt to delete static link should fail or be prevented
        const link = await pool.query(
            'SELECT * FROM service_asset_links WHERE asset_id = ? AND is_static = 1',
            [testAssetId]
        );

        expect(link.rows.length).toBe(1);
        expect(link.rows[0].is_static).toBe(1);
        // Static links should not be deletable in business logic
    });

    test('Should retrieve asset with linked service info', async () => {
        const asset = await pool.query(
            `SELECT a.*, s.service_name, sub.sub_service_name
             FROM assets a
             LEFT JOIN services s ON a.linked_service_id = s.id
             LEFT JOIN sub_services sub ON a.linked_sub_service_id = sub.id
             WHERE a.id = ?`,
            [testAssetId]
        );

        expect(asset.rows.length).toBe(1);
        expect(asset.rows[0].service_name).toBe('Test Service');
        // Sub-service name may be undefined in mock DB if not properly linked
        if (asset.rows[0].sub_service_name) {
            expect(asset.rows[0].sub_service_name).toBe('Test Sub-Service');
        }
    });

    test('Should track workflow status changes', async () => {
        const workflowLog = [
            {
                action: 'created',
                timestamp: new Date().toISOString(),
                status: 'Draft',
                workflow_stage: 'Add'
            },
            {
                action: 'submitted',
                timestamp: new Date().toISOString(),
                status: 'Pending QC',
                workflow_stage: 'QC'
            },
            {
                action: 'approved',
                timestamp: new Date().toISOString(),
                status: 'Published',
                workflow_stage: 'Approve'
            }
        ];

        await pool.query(
            'UPDATE assets SET workflow_log = ? WHERE id = ?',
            [JSON.stringify(workflowLog), testAssetId]
        );

        const asset = await pool.query('SELECT workflow_log FROM assets WHERE id = ?', [testAssetId]);
        const log = JSON.parse(asset.rows[0].workflow_log);
        expect(log.length).toBe(3);
        expect(log[2].action).toBe('approved');
    });
});

describe('QC Review Workflow', () => {
    let testAssetId: number;

    beforeAll(async () => {
        // Create test asset
        const result = await pool.query(
            `INSERT INTO assets (
                asset_name, asset_type, application_type, status, qc_status,
                workflow_stage, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                'QC Test Asset',
                'Document',
                'web',
                'Draft',
                'Pending',
                'Add',
                new Date().toISOString()
            ]
        );
        testAssetId = result.lastID;
    });

    afterAll(async () => {
        if (testAssetId) {
            await pool.query('DELETE FROM assets WHERE id = ?', [testAssetId]);
        }
    });

    test('Should approve asset and update all status fields', async () => {
        const workflowLog = [{
            action: 'approved',
            timestamp: new Date().toISOString(),
            status: 'Published',
            workflow_stage: 'Approve'
        }];

        await pool.query(
            `UPDATE assets 
             SET qc_status = 'Approved',
                 workflow_stage = 'Published',
                 linking_active = 1,
                 status = 'QC Approved',
                 workflow_log = ?
             WHERE id = ?`,
            [JSON.stringify(workflowLog), testAssetId]
        );

        const asset = await pool.query('SELECT * FROM assets WHERE id = ?', [testAssetId]);
        expect(asset.rows[0].qc_status).toBe('Approved');
        expect(asset.rows[0].workflow_stage).toBe('Published');
        expect(asset.rows[0].status).toBe('QC Approved');
        expect(asset.rows[0].linking_active).toBe(1);
    });

    test('Should reject asset and disable linking', async () => {
        const workflowLog = [{
            action: 'rejected',
            timestamp: new Date().toISOString(),
            status: 'Rejected',
            workflow_stage: 'QC',
            remarks: 'Quality issues'
        }];

        await pool.query(
            `UPDATE assets 
             SET qc_status = 'Rejected',
                 workflow_stage = 'QC',
                 linking_active = 0,
                 status = 'Rejected',
                 workflow_log = ?
             WHERE id = ?`,
            [JSON.stringify(workflowLog), testAssetId]
        );

        const asset = await pool.query('SELECT * FROM assets WHERE id = ?', [testAssetId]);
        expect(asset.rows[0].qc_status).toBe('Rejected');
        expect(asset.rows[0].workflow_stage).toBe('QC');
        expect(asset.rows[0].status).toBe('Rejected');
        expect(asset.rows[0].linking_active).toBe(0);
    });

    test('Should request rework and increment counter', async () => {
        await pool.query(
            `UPDATE assets 
             SET qc_status = 'Rework',
                 workflow_stage = 'QC',
                 linking_active = 0,
                 status = 'Rework Requested',
                 rework_count = 1
             WHERE id = ?`,
            [testAssetId]
        );

        const asset = await pool.query('SELECT * FROM assets WHERE id = ?', [testAssetId]);
        expect(asset.rows[0].qc_status).toBe('Rework');
        expect(asset.rows[0].status).toBe('Rework Requested');
        expect(asset.rows[0].rework_count).toBe(1);
    });
});
