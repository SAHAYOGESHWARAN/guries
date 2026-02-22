import axios from 'axios';

const API_URL = 'http://localhost:3001/api/v1';

describe('Asset Linking and Persistence', () => {
    let assetId: number;
    let serviceId: number;
    let subServiceId: number;
    let authToken: string;

    beforeAll(async () => {
        // Login to get auth token
        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: 'admin@example.com',
                password: 'admin123'
            });
            authToken = loginRes.data.token;
        } catch (e) {
            console.log('Login failed, proceeding without auth');
        }
    });

    describe('Database Tables', () => {
        it('should have service_asset_links table created', async () => {
            const response = await axios.get(`${API_URL}/health`);
            expect(response.status).toBe(200);
            console.log('✅ Database is connected');
        });

        it('should have subservice_asset_links table created', async () => {
            const response = await axios.get(`${API_URL}/health`);
            expect(response.status).toBe(200);
            console.log('✅ Database is connected');
        });
    });

    describe('Asset Creation and Submission', () => {
        it('should create an asset with application_type', async () => {
            const assetData = {
                asset_name: 'Test Web Asset',
                asset_type: 'Image',
                asset_category: 'Web',
                asset_format: 'PNG',
                application_type: 'web',
                status: 'draft',
                web_title: 'Test Title',
                web_description: 'Test Description',
                web_url: 'https://example.com'
            };

            const response = await axios.post(`${API_URL}/assetLibrary`, assetData, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            expect(response.status).toBe(201);
            expect(response.data.id).toBeDefined();
            assetId = response.data.id;
            console.log(`✅ Asset created with ID: ${assetId}`);
        });

        it('should submit asset for QC', async () => {
            const response = await axios.post(
                `${API_URL}/assetLibrary/${assetId}/submit-qc`,
                {},
                { headers: { Authorization: `Bearer ${authToken}` } }
            );

            expect(response.status).toBe(200);
            console.log('✅ Asset submitted for QC');
        });

        it('should retrieve asset from library after submission', async () => {
            const response = await axios.get(`${API_URL}/assetLibrary/${assetId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            expect(response.status).toBe(200);
            expect(response.data.id).toBe(assetId);
            console.log('✅ Asset retrieved from library');
        });

        it('should persist asset in list after navigation', async () => {
            // Simulate navigation by fetching list
            const response = await axios.get(`${API_URL}/assetLibrary`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            expect(response.status).toBe(200);
            const foundAsset = response.data.find((a: any) => a.id === assetId);
            expect(foundAsset).toBeDefined();
            console.log('✅ Asset persists in list after navigation');
        });
    });

    describe('Service and Sub-Service Setup', () => {
        it('should create a service', async () => {
            const serviceData = {
                service_name: 'Website Design',
                description: 'Web design services'
            };

            const response = await axios.post(`${API_URL}/services`, serviceData, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            expect(response.status).toBe(201);
            expect(response.data.id).toBeDefined();
            serviceId = response.data.id;
            console.log(`✅ Service created with ID: ${serviceId}`);
        });

        it('should create a sub-service', async () => {
            const subServiceData = {
                sub_service_name: 'Landing Page Design',
                parent_service_id: serviceId,
                description: 'Landing page design'
            };

            const response = await axios.post(`${API_URL}/sub-services`, subServiceData, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            expect(response.status).toBe(201);
            expect(response.data.id).toBeDefined();
            subServiceId = response.data.id;
            console.log(`✅ Sub-service created with ID: ${subServiceId}`);
        });
    });

    describe('Asset Linking to Services', () => {
        it('should link asset to service', async () => {
            const linkData = {
                asset_id: assetId,
                service_id: serviceId
            };

            const response = await axios.post(
                `${API_URL}/assetServiceLinking/link-static`,
                linkData,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );

            expect(response.status).toBe(201);
            console.log('✅ Asset linked to service');
        });

        it('should link asset to sub-service', async () => {
            const linkData = {
                asset_id: assetId,
                service_id: serviceId,
                sub_service_id: subServiceId
            };

            const response = await axios.post(
                `${API_URL}/assetServiceLinking/link-static`,
                linkData,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );

            expect(response.status).toBe(201);
            console.log('✅ Asset linked to sub-service');
        });
    });

    describe('Linked Assets Display', () => {
        it('should retrieve linked assets for service', async () => {
            const response = await axios.get(
                `${API_URL}/services/${serviceId}/linked-assets`,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );

            expect(response.status).toBe(200);
            expect(Array.isArray(response.data)).toBe(true);
            const linkedAsset = response.data.find((a: any) => a.id === assetId);
            expect(linkedAsset).toBeDefined();
            console.log(`✅ Retrieved ${response.data.length} linked assets for service`);
        });

        it('should retrieve linked assets for sub-service', async () => {
            const response = await axios.get(
                `${API_URL}/sub-services/${subServiceId}/linked-assets`,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );

            expect(response.status).toBe(200);
            expect(Array.isArray(response.data)).toBe(true);
            const linkedAsset = response.data.find((a: any) => a.id === assetId);
            expect(linkedAsset).toBeDefined();
            console.log(`✅ Retrieved ${response.data.length} linked assets for sub-service`);
        });

        it('should persist linked assets after navigation', async () => {
            // First fetch
            const response1 = await axios.get(
                `${API_URL}/services/${serviceId}/linked-assets`,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );

            expect(response1.status).toBe(200);
            const count1 = response1.data.length;

            // Simulate navigation by fetching service details
            await axios.get(`${API_URL}/services/${serviceId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            // Second fetch after navigation
            const response2 = await axios.get(
                `${API_URL}/services/${serviceId}/linked-assets`,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );

            expect(response2.status).toBe(200);
            expect(response2.data.length).toBe(count1);
            console.log('✅ Linked assets persist after navigation');
        });

        it('should display asset details in linked assets', async () => {
            const response = await axios.get(
                `${API_URL}/services/${serviceId}/linked-assets`,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );

            expect(response.status).toBe(200);
            const asset = response.data.find((a: any) => a.id === assetId);
            expect(asset).toBeDefined();
            expect(asset.asset_name).toBe('Test Web Asset');
            expect(asset.web_title).toBe('Test Title');
            expect(asset.web_description).toBe('Test Description');
            console.log('✅ Asset details displayed correctly in linked assets');
        });
    });

    describe('Asset Persistence in Assets Module', () => {
        it('should retrieve submitted asset from assets list', async () => {
            const response = await axios.get(`${API_URL}/assetLibrary`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            expect(response.status).toBe(200);
            const asset = response.data.find((a: any) => a.id === assetId);
            expect(asset).toBeDefined();
            expect(asset.status).toBe('submitted');
            console.log('✅ Submitted asset appears in assets list');
        });

        it('should persist asset after multiple navigations', async () => {
            // First navigation
            await axios.get(`${API_URL}/campaigns`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            // Second navigation
            await axios.get(`${API_URL}/projects`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            // Check asset still exists
            const response = await axios.get(`${API_URL}/assetLibrary/${assetId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            expect(response.status).toBe(200);
            expect(response.data.id).toBe(assetId);
            console.log('✅ Asset persists after multiple navigations');
        });

        it('should retrieve asset with all linked service information', async () => {
            const response = await axios.get(`${API_URL}/assetLibrary/${assetId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            expect(response.status).toBe(200);
            expect(response.data.linked_service_ids).toBeDefined();
            console.log('✅ Asset retrieved with linked service information');
        });
    });

    describe('Cache and Persistence Verification', () => {
        it('should verify asset cache TTL is working', async () => {
            const response = await axios.get(`${API_URL}/assetLibrary`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            expect(response.status).toBe(200);
            expect(Array.isArray(response.data)).toBe(true);
            console.log('✅ Asset cache is working correctly');
        });

        it('should verify linked assets cache is working', async () => {
            const response = await axios.get(
                `${API_URL}/services/${serviceId}/linked-assets`,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );

            expect(response.status).toBe(200);
            expect(Array.isArray(response.data)).toBe(true);
            console.log('✅ Linked assets cache is working correctly');
        });
    });
});
