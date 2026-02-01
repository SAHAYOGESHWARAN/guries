import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../server';

describe.skip('Asset Linking API Endpoints', () => {
    let serviceId: number;
    let subServiceId: number;
    let assetId: number;

    beforeAll(async () => {
        // Create test data
        // Note: These would be created via API in a real scenario
        console.log('Setting up test data for API tests...');
    });

    afterAll(async () => {
        console.log('Cleaning up test data...');
    });

    describe('GET /services/:serviceId/linked-assets', () => {
        it('should return linked assets for a service', async () => {
            const response = await request(app)
                .get('/api/v1/services/1/linked-assets')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            if (response.body.length > 0) {
                const asset = response.body[0];
                expect(asset).toHaveProperty('id');
                expect(asset).toHaveProperty('name');
                expect(asset).toHaveProperty('type');
                expect(asset).toHaveProperty('file_url');
            }
        });

        it('should handle non-existent service gracefully', async () => {
            const response = await request(app)
                .get('/api/v1/services/99999/linked-assets')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });
    });

    describe('GET /sub-services/:subServiceId/linked-assets', () => {
        it('should return linked assets for a sub-service', async () => {
            const response = await request(app)
                .get('/api/v1/sub-services/1/linked-assets')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            if (response.body.length > 0) {
                const asset = response.body[0];
                expect(asset).toHaveProperty('id');
                expect(asset).toHaveProperty('name');
                expect(asset).toHaveProperty('type');
            }
        });

        it('should handle non-existent sub-service gracefully', async () => {
            const response = await request(app)
                .get('/api/v1/sub-services/99999/linked-assets')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });
    });

    describe('POST /assets/link-to-service', () => {
        it('should link an asset to a service', async () => {
            const response = await request(app)
                .post('/api/v1/assets/link-to-service')
                .send({
                    serviceId: 1,
                    assetId: 1
                })
                .expect(201);

            expect(response.body).toHaveProperty('success');
            expect(response.body.success).toBe(true);
        });

        it('should reject linking non-existent asset', async () => {
            const response = await request(app)
                .post('/api/v1/assets/link-to-service')
                .send({
                    serviceId: 1,
                    assetId: 99999
                });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });

        it('should reject linking to non-existent service', async () => {
            const response = await request(app)
                .post('/api/v1/assets/link-to-service')
                .send({
                    serviceId: 99999,
                    assetId: 1
                });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /assets/link-to-sub-service', () => {
        it('should link an asset to a sub-service', async () => {
            const response = await request(app)
                .post('/api/v1/assets/link-to-sub-service')
                .send({
                    subServiceId: 1,
                    assetId: 1
                })
                .expect(201);

            expect(response.body).toHaveProperty('success');
            expect(response.body.success).toBe(true);
        });

        it('should reject linking non-existent asset', async () => {
            const response = await request(app)
                .post('/api/v1/assets/link-to-sub-service')
                .send({
                    subServiceId: 1,
                    assetId: 99999
                });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });

        it('should reject linking to non-existent sub-service', async () => {
            const response = await request(app)
                .post('/api/v1/assets/link-to-sub-service')
                .send({
                    subServiceId: 99999,
                    assetId: 1
                });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /assets/unlink-from-service', () => {
        it('should unlink an asset from a service', async () => {
            const response = await request(app)
                .post('/api/v1/assets/unlink-from-service')
                .send({
                    serviceId: 1,
                    assetId: 1
                })
                .expect(200);

            expect(response.body).toHaveProperty('success');
            expect(response.body.success).toBe(true);
        });
    });

    describe('POST /assets/unlink-from-sub-service', () => {
        it('should unlink an asset from a sub-service', async () => {
            const response = await request(app)
                .post('/api/v1/assets/unlink-from-sub-service')
                .send({
                    subServiceId: 1,
                    assetId: 1
                })
                .expect(200);

            expect(response.body).toHaveProperty('success');
            expect(response.body.success).toBe(true);
        });
    });

    describe('Asset Linking Workflow', () => {
        it('should complete full linking workflow', async () => {
            // 1. Get available assets
            const assetsResponse = await request(app)
                .get('/api/v1/assetLibrary')
                .expect(200);

            expect(Array.isArray(assetsResponse.body)).toBe(true);

            if (assetsResponse.body.length > 0) {
                const asset = assetsResponse.body[0];

                // 2. Link asset to service
                const linkResponse = await request(app)
                    .post('/api/v1/assets/link-to-service')
                    .send({
                        serviceId: 1,
                        assetId: asset.id
                    });

                if (linkResponse.status === 201) {
                    // 3. Verify asset is linked
                    const linkedResponse = await request(app)
                        .get('/api/v1/services/1/linked-assets')
                        .expect(200);

                    expect(Array.isArray(linkedResponse.body)).toBe(true);

                    // 4. Unlink asset
                    const unlinkResponse = await request(app)
                        .post('/api/v1/assets/unlink-from-service')
                        .send({
                            serviceId: 1,
                            assetId: asset.id
                        })
                        .expect(200);

                    expect(unlinkResponse.body.success).toBe(true);
                }
            }
        });
    });
});

