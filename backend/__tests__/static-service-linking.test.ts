import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../app';
import { pool } from '../config/db';

describe('Static Service Linking', () => {
    let testServiceId: number;
    let testSubServiceId: number;
    let testAssetId: number;
    let testUserId: number;

    beforeEach(async () => {
        // Create test user
        const userResult = await pool.query(
            'INSERT INTO users (name, email, role) VALUES (?, ?, ?) RETURNING id',
            ['Test User', 'test@example.com', 'admin']
        );
        testUserId = userResult.rows[0].id;

        // Create test service
        const serviceResult = await pool.query(
            'INSERT INTO services (service_name, service_code, status, created_by) VALUES (?, ?, ?, ?) RETURNING id',
            ['Test Service', 'TS-001', 'Draft', testUserId]
        );
        testServiceId = serviceResult.rows[0].id;

        // Create test sub-service
        const subServiceResult = await pool.query(
            'INSERT INTO sub_services (sub_service_name, parent_service_id, status, created_by) VALUES (?, ?, ?, ?) RETURNING id',
            ['Test Sub-Service', testServiceId, 'Draft', testUserId]
        );
        testSubServiceId = subServiceResult.rows[0].id;
    });

    afterEach(async () => {
        // Clean up test data
        await pool.query('DELETE FROM service_asset_links WHERE asset_id = ?', [testAssetId]);
        await pool.query('DELETE FROM subservice_asset_links WHERE asset_id = ?', [testAssetId]);
        await pool.query('DELETE FROM assets WHERE id = ?', [testAssetId]);
        await pool.query('DELETE FROM sub_services WHERE id = ?', [testSubServiceId]);
        await pool.query('DELETE FROM services WHERE id = ?', [testServiceId]);
        await pool.query('DELETE FROM users WHERE id = ?', [testUserId]);
    });

    describe('Asset Creation with Static Links', () => {
        it('should create static service links when asset is uploaded with service selection', async () => {
            const assetData = {
                name: 'Test Asset',
                type: 'Image',
                application_type: 'web',
                linked_service_id: testServiceId,
                linked_sub_service_ids: [testSubServiceId],
                created_by: testUserId,
                status: 'Draft'
            };

            const response = await request(app)
                .post('/api/v1/assetLibrary')
                .send(assetData)
                .expect(201);

            testAssetId = response.body.id;

            // Verify asset was created
            expect(response.body.name).toBe('Test Asset');
            expect(response.body.static_service_links).toBeDefined();
            expect(Array.isArray(response.body.static_service_links)).toBe(true);

            // Verify static links were created
            const staticLinks = response.body.static_service_links;
            expect(staticLinks).toHaveLength(2);
            expect(staticLinks.some((link: any) => link.service_id === testServiceId && link.type === 'service')).toBe(true);
            expect(staticLinks.some((link: any) => link.sub_service_id === testSubServiceId && link.type === 'subservice')).toBe(true);

            // Verify database records
            const serviceLinks = await pool.query(
                'SELECT * FROM service_asset_links WHERE asset_id = ? AND service_id = ?',
                [testAssetId, testServiceId]
            );
            expect(serviceLinks.rows).toHaveLength(1);
            expect(serviceLinks.rows[0].is_static).toBe(1);

            const subServiceLinks = await pool.query(
                'SELECT * FROM subservice_asset_links WHERE asset_id = ? AND sub_service_id = ?',
                [testAssetId, testSubServiceId]
            );
            expect(subServiceLinks.rows).toHaveLength(1);
            expect(subServiceLinks.rows[0].is_static).toBe(1);
        });

        it('should not create static links when no service is selected during upload', async () => {
            const assetData = {
                name: 'Test Asset No Service',
                type: 'Image',
                application_type: 'web',
                created_by: testUserId,
                status: 'Draft'
            };

            const response = await request(app)
                .post('/api/v1/assetLibrary')
                .send(assetData)
                .expect(201);

            testAssetId = response.body.id;

            expect(response.body.static_service_links).toEqual([]);

            // Verify no static links in database
            const serviceLinks = await pool.query(
                'SELECT * FROM service_asset_links WHERE asset_id = ?',
                [testAssetId]
            );
            expect(serviceLinks.rows).toHaveLength(0);
        });
    });

    describe('Static Link Prevention', () => {
        beforeEach(async () => {
            // Create asset with static links
            const assetData = {
                name: 'Static Linked Asset',
                type: 'Image',
                application_type: 'web',
                linked_service_id: testServiceId,
                created_by: testUserId,
                status: 'Draft'
            };

            const response = await request(app)
                .post('/api/v1/assetLibrary')
                .send(assetData);
            testAssetId = response.body.id;
        });

        it('should prevent unlinking static service links', async () => {
            const response = await request(app)
                .post('/api/v1/assets/unlink-from-service')
                .send({
                    assetId: testAssetId,
                    serviceId: testServiceId
                })
                .expect(403);

            expect(response.body.error).toBe('Cannot remove static service link created during upload');

            // Verify link still exists
            const serviceLinks = await pool.query(
                'SELECT * FROM service_asset_links WHERE asset_id = ? AND service_id = ?',
                [testAssetId, testServiceId]
            );
            expect(serviceLinks.rows).toHaveLength(1);
        });

        it('should allow unlinking non-static service links', async () => {
            // Create a non-static link
            await pool.query(
                'INSERT INTO service_asset_links (asset_id, service_id, is_static, created_by) VALUES (?, ?, 0, ?)',
                [testAssetId, testServiceId + 1000, testUserId] // Use different service ID
            );

            const response = await request(app)
                .post('/api/v1/assets/unlink-from-service')
                .send({
                    assetId: testAssetId,
                    serviceId: testServiceId + 1000
                })
                .expect(200);

            expect(response.body.message).toBe('Asset unlinked successfully');
        });
    });

    describe('Service Assets Retrieval', () => {
        beforeEach(async () => {
            // Create asset with static links
            const assetData = {
                name: 'Service Asset',
                type: 'Image',
                application_type: 'web',
                linked_service_id: testServiceId,
                created_by: testUserId,
                status: 'Draft'
            };

            const response = await request(app)
                .post('/api/v1/assetLibrary')
                .send(assetData);
            testAssetId = response.body.id;
        });

        it('should retrieve assets linked to a service with static link information', async () => {
            const response = await request(app)
                .get(`/api/v1/services/${testServiceId}/assets`)
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0].id).toBe(testAssetId);
            expect(response.body[0].link_is_static).toBe(1);
            expect(response.body[0].linked_at).toBeDefined();
        });

        it('should retrieve assets linked to a sub-service with static link information', async () => {
            // Create asset with sub-service link
            const assetData = {
                name: 'Sub-Service Asset',
                type: 'Video',
                application_type: 'web',
                linked_sub_service_ids: [testSubServiceId],
                created_by: testUserId,
                status: 'Draft'
            };

            const createResponse = await request(app)
                .post('/api/v1/assetLibrary')
                .send(assetData);
            const newAssetId = createResponse.body.id;

            const response = await request(app)
                .get(`/api/v1/sub-services/${testSubServiceId}/assets`)
                .expect(200);

            expect(response.body.length).toBeGreaterThan(0);
            const subServiceAsset = response.body.find((asset: any) => asset.id === newAssetId);
            expect(subServiceAsset).toBeDefined();
            expect(subServiceAsset.link_is_static).toBe(1);

            // Clean up
            await pool.query('DELETE FROM assets WHERE id = ?', [newAssetId]);
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid asset ID gracefully', async () => {
            const response = await request(app)
                .post('/api/v1/assets/unlink-from-service')
                .send({
                    assetId: 99999,
                    serviceId: testServiceId
                })
                .expect(404);

            expect(response.body.error).toBe('Asset not found');
        });

        it('should handle invalid service ID gracefully', async () => {
            const response = await request(app)
                .get('/api/v1/services/99999/assets')
                .expect(200);

            expect(response.body).toEqual([]);
        });
    });
});
