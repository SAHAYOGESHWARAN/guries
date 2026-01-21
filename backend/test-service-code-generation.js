const http = require('http');

const BASE_URL = 'http://localhost:5000';

// Helper to make HTTP requests
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
    console.log('🧪 Testing Service Code Auto-Generation\n');

    try {
        // Test 1: Create service without providing service_code
        console.log('1️⃣  Creating service without service_code (should auto-generate)...');
        const createPayload = {
            service_name: 'Web Development',
            slug: 'web-development',
            menu_heading: 'Web Dev',
            short_tagline: 'Professional web development services',
            service_description: 'Full-stack web development',
            status: 'Draft',
            language: 'en'
        };

        const createRes = await makeRequest('POST', '/api/v1/services', createPayload);
        if (createRes.status !== 201) {
            console.error(`❌ Failed to create service: ${createRes.status}`);
            console.error(createRes.data);
            process.exit(1);
        }

        const createdService = createRes.data;
        console.log(`✅ Service created: ${createdService.service_name}`);
        console.log(`   Service Code: ${createdService.service_code}`);
        console.log(`   ID: ${createdService.id}\n`);

        // Verify service code format
        if (!createdService.service_code) {
            console.error('❌ Service code was not auto-generated');
            process.exit(1);
        }

        const codePattern = /^[A-Z]{2,3}-\d{4}$/;
        if (!codePattern.test(createdService.service_code)) {
            console.error(`❌ Service code format is invalid: ${createdService.service_code}`);
            console.error('   Expected format: XX-XXXX (e.g., WD-1234)');
            process.exit(1);
        }
        console.log('✅ Service code format is valid\n');

        // Test 2: Create another service to verify different codes
        console.log('2️⃣  Creating another service to verify unique codes...');
        const createPayload2 = {
            service_name: 'SEO Services',
            slug: 'seo-services',
            menu_heading: 'SEO',
            short_tagline: 'Search engine optimization',
            service_description: 'Professional SEO services',
            status: 'Draft',
            language: 'en'
        };

        const createRes2 = await makeRequest('POST', '/api/v1/services', createPayload2);
        if (createRes2.status !== 201) {
            console.error(`❌ Failed to create second service: ${createRes2.status}`);
            process.exit(1);
        }

        const createdService2 = createRes2.data;
        console.log(`✅ Service created: ${createdService2.service_name}`);
        console.log(`   Service Code: ${createdService2.service_code}\n`);

        // Verify codes are different
        if (createdService.service_code === createdService2.service_code) {
            console.error('❌ Service codes are identical (should be unique)');
            process.exit(1);
        }
        console.log('✅ Service codes are unique\n');

        // Test 3: Fetch services and verify codes appear in list
        console.log('3️⃣  Fetching services to verify codes in list...');
        const fetchRes = await makeRequest('GET', '/api/v1/services');
        if (fetchRes.status !== 200) {
            console.error(`❌ Failed to fetch services: ${fetchRes.status}`);
            process.exit(1);
        }

        const services = fetchRes.data;
        const foundService = services.find(s => s.id === createdService.id);
        if (!foundService) {
            console.error('❌ Created service not found in list');
            process.exit(1);
        }

        console.log(`✅ Service found in list`);
        console.log(`   Name: ${foundService.service_name}`);
        console.log(`   Code: ${foundService.service_code}\n`);

        // Test 4: Create service with explicit service_code (should use provided code)
        console.log('4️⃣  Creating service with explicit service_code...');
        const createPayload3 = {
            service_name: 'Content Marketing',
            service_code: 'CM-CUSTOM',
            slug: 'content-marketing',
            menu_heading: 'Content',
            short_tagline: 'Content marketing services',
            service_description: 'Professional content marketing',
            status: 'Draft',
            language: 'en'
        };

        const createRes3 = await makeRequest('POST', '/api/v1/services', createPayload3);
        if (createRes3.status !== 201) {
            console.error(`❌ Failed to create service with custom code: ${createRes3.status}`);
            process.exit(1);
        }

        const createdService3 = createRes3.data;
        console.log(`✅ Service created with custom code`);
        console.log(`   Name: ${createdService3.service_name}`);
        console.log(`   Code: ${createdService3.service_code}\n`);

        if (createdService3.service_code !== 'CM-CUSTOM') {
            console.error(`❌ Custom service code was not preserved. Got: ${createdService3.service_code}`);
            process.exit(1);
        }
        console.log('✅ Custom service code was preserved\n');

        // Test 5: Update service and verify code can be changed
        console.log('5️⃣  Updating service code...');
        const updatePayload = {
            service_code: 'WD-UPDATED'
        };

        const updateRes = await makeRequest('PUT', `/api/v1/services/${createdService.id}`, updatePayload);
        if (updateRes.status !== 200) {
            console.error(`❌ Failed to update service: ${updateRes.status}`);
            process.exit(1);
        }

        const updatedService = updateRes.data;
        console.log(`✅ Service code updated`);
        console.log(`   Old Code: ${createdService.service_code}`);
        console.log(`   New Code: ${updatedService.service_code}\n`);

        if (updatedService.service_code !== 'WD-UPDATED') {
            console.error(`❌ Service code update failed. Got: ${updatedService.service_code}`);
            process.exit(1);
        }

        console.log('✅ All tests passed!\n');
        console.log('Summary:');
        console.log('  ✓ Service codes are auto-generated when not provided');
        console.log('  ✓ Service codes follow format: XX-XXXX');
        console.log('  ✓ Service codes are unique');
        console.log('  ✓ Service codes appear in list view');
        console.log('  ✓ Custom service codes are preserved');
        console.log('  ✓ Service codes can be updated');
        console.log('\nThe service code auto-generation feature is working correctly!');

    } catch (error) {
        console.error('❌ Test error:', error.message);
        process.exit(1);
    }
}

runTests();
