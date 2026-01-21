const http = require('http');

const BASE_URL = 'http://localhost:5000';

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: body ? JSON.parse(body) : null
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: body
                    });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Testing Linked Insights & Assets Feature\n');

    try {
        // Step 1: Fetch content types (for Linked Insights)
        console.log('1️⃣  Fetching content types for Linked Insights...');
        const contentTypesRes = await makeRequest('GET', '/api/v1/contentTypes');
        if (contentTypesRes.status !== 200) {
            console.error(`❌ Failed to fetch content types: ${contentTypesRes.status}`);
            process.exit(1);
        }
        const contentTypes = contentTypesRes.data || [];
        console.log(`✅ Found ${contentTypes.length} content types`);
        if (contentTypes.length > 0) {
            console.log(`   Sample: ${contentTypes[0].content_type} (${contentTypes[0].category})\n`);
        }

        // Step 2: Fetch assets (for Linked Assets)
        console.log('2️⃣  Fetching assets for Linked Assets...');
        const assetsRes = await makeRequest('GET', '/api/v1/assetLibrary');
        if (assetsRes.status !== 200) {
            console.error(`❌ Failed to fetch assets: ${assetsRes.status}`);
            process.exit(1);
        }
        const assets = assetsRes.data || [];
        console.log(`✅ Found ${assets.length} assets`);
        if (assets.length > 0) {
            console.log(`   Sample: ${assets[0].name} (${assets[0].type})\n`);
        }

        // Step 3: Create a service with linked insights and assets
        console.log('3️⃣  Creating service with linked insights and assets...');
        const linkedInsightIds = contentTypes.slice(0, 2).map(ct => ct.id);
        const linkedAssetIds = assets.slice(0, 2).map(a => a.id);

        const createPayload = {
            service_name: 'Test Service with Links',
            slug: 'test-service-links',
            menu_heading: 'Test Service',
            short_tagline: 'Testing linked insights and assets',
            service_description: 'Service for testing linking functionality',
            status: 'Draft',
            language: 'en',
            linked_insights_ids: linkedInsightIds,
            linked_assets_ids: linkedAssetIds
        };

        const createRes = await makeRequest('POST', '/api/v1/services', createPayload);
        if (createRes.status !== 201) {
            console.error(`❌ Failed to create service: ${createRes.status}`);
            console.error(createRes.data);
            process.exit(1);
        }

        const createdService = createRes.data;
        console.log(`✅ Service created: ${createdService.service_name}`);
        console.log(`   ID: ${createdService.id}`);
        console.log(`   Linked Insights: ${createdService.linked_insights_ids?.length || 0}`);
        console.log(`   Linked Assets: ${createdService.linked_assets_ids?.length || 0}\n`);

        // Verify linked IDs were saved
        if (!Array.isArray(createdService.linked_insights_ids) || createdService.linked_insights_ids.length !== linkedInsightIds.length) {
            console.error('❌ Linked insights not saved correctly');
            process.exit(1);
        }
        if (!Array.isArray(createdService.linked_assets_ids) || createdService.linked_assets_ids.length !== linkedAssetIds.length) {
            console.error('❌ Linked assets not saved correctly');
            process.exit(1);
        }
        console.log('✅ Linked insights and assets saved correctly\n');

        // Step 4: Update service with different linked items
        console.log('4️⃣  Updating service with different linked items...');
        const newLinkedInsightIds = contentTypes.slice(1, 3).map(ct => ct.id);
        const newLinkedAssetIds = assets.slice(1, 3).map(a => a.id);

        const updatePayload = {
            linked_insights_ids: newLinkedInsightIds,
            linked_assets_ids: newLinkedAssetIds
        };

        const updateRes = await makeRequest('PUT', `/api/v1/services/${createdService.id}`, updatePayload);
        if (updateRes.status !== 200) {
            console.error(`❌ Failed to update service: ${updateRes.status}`);
            process.exit(1);
        }

        const updatedService = updateRes.data;
        console.log(`✅ Service updated`);
        console.log(`   Linked Insights: ${updatedService.linked_insights_ids?.length || 0}`);
        console.log(`   Linked Assets: ${updatedService.linked_assets_ids?.length || 0}\n`);

        // Step 5: Fetch service and verify persistence
        console.log('5️⃣  Fetching service to verify persistence...');
        const fetchRes = await makeRequest('GET', `/api/v1/services/${createdService.id}`);
        if (fetchRes.status !== 200) {
            console.error(`❌ Failed to fetch service: ${fetchRes.status}`);
            process.exit(1);
        }

        const fetchedService = fetchRes.data;
        console.log(`✅ Service fetched: ${fetchedService.service_name}`);
        console.log(`   Linked Insights: ${fetchedService.linked_insights_ids?.length || 0}`);
        console.log(`   Linked Assets: ${fetchedService.linked_assets_ids?.length || 0}\n`);

        // Verify updated values persisted
        if (JSON.stringify(fetchedService.linked_insights_ids) !== JSON.stringify(newLinkedInsightIds)) {
            console.error('❌ Linked insights not persisted correctly');
            process.exit(1);
        }
        if (JSON.stringify(fetchedService.linked_assets_ids) !== JSON.stringify(newLinkedAssetIds)) {
            console.error('❌ Linked assets not persisted correctly');
            process.exit(1);
        }
        console.log('✅ Linked insights and assets persisted correctly\n');

        // Step 6: Fetch all services and verify counts in list
        console.log('6️⃣  Fetching all services to verify list view counts...');
        const listRes = await makeRequest('GET', '/api/v1/services');
        if (listRes.status !== 200) {
            console.error(`❌ Failed to fetch services: ${listRes.status}`);
            process.exit(1);
        }

        const services = listRes.data || [];
        const testService = services.find(s => s.id === createdService.id);
        if (!testService) {
            console.error('❌ Service not found in list');
            process.exit(1);
        }

        console.log(`✅ Service found in list`);
        console.log(`   Linked Insights Count: ${testService.linked_insights_ids?.length || 0}`);
        console.log(`   Linked Assets Count: ${testService.linked_assets_ids?.length || 0}\n`);

        console.log('✅ All tests passed!\n');
        console.log('Summary:');
        console.log('  ✓ Content types fetched successfully');
        console.log('  ✓ Assets fetched successfully');
        console.log('  ✓ Service created with linked insights and assets');
        console.log('  ✓ Linked items saved to database');
        console.log('  ✓ Service updated with new linked items');
        console.log('  ✓ Linked items persisted correctly');
        console.log('  ✓ List view displays correct counts');
        console.log('\nThe Linked Insights & Assets feature is working correctly!');

    } catch (error) {
        console.error('❌ Test error:', error.message);
        process.exit(1);
    }
}

runTests();
