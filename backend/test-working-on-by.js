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
    console.log('🧪 Testing Working On By Feature\n');

    try {
        // Step 1: Get a parent service
        console.log('1️⃣  Fetching parent services...');
        const servicesRes = await makeRequest('GET', '/api/v1/services');
        if (!servicesRes.data || servicesRes.data.length === 0) {
            console.error('❌ No services found. Please create a service first.');
            process.exit(1);
        }
        const parentService = servicesRes.data[0];
        console.log(`✅ Found parent service: ${parentService.service_name} (ID: ${parentService.id})\n`);

        // Step 2: Create a sub-service with working_on_by
        console.log('2️⃣  Creating sub-service with working_on_by...');
        const createPayload = {
            sub_service_name: 'Test Sub-Service with Working On By',
            parent_service_id: parentService.id,
            slug: 'test-working-on-by',
            description: 'Testing the working_on_by feature',
            status: 'Draft',
            working_on_by: 'CW',
            language: 'en',
            menu_heading: 'Test Sub-Service',
            short_tagline: 'Testing working_on_by',
            h1: 'Test Heading',
            meta_title: 'Test Meta Title',
            meta_description: 'Test meta description'
        };

        const createRes = await makeRequest('POST', '/api/v1/subServices', createPayload);
        if (createRes.status !== 201) {
            console.error(`❌ Failed to create sub-service: ${createRes.status}`);
            console.error(createRes.data);
            process.exit(1);
        }

        const createdSubService = createRes.data;
        console.log(`✅ Created sub-service: ${createdSubService.sub_service_name}`);
        console.log(`   ID: ${createdSubService.id}`);
        console.log(`   Working On By: ${createdSubService.working_on_by}\n`);

        // Step 3: Verify the working_on_by field was saved
        if (createdSubService.working_on_by !== 'CW') {
            console.error(`❌ working_on_by not saved correctly. Expected 'CW', got '${createdSubService.working_on_by}'`);
            process.exit(1);
        }
        console.log('✅ working_on_by field saved correctly\n');

        // Step 4: Update the sub-service with a different working_on_by value
        console.log('3️⃣  Updating sub-service with different working_on_by...');
        const updatePayload = {
            working_on_by: 'John Doe'
        };

        const updateRes = await makeRequest('PUT', `/api/v1/subServices/${createdSubService.id}`, updatePayload);
        if (updateRes.status !== 200) {
            console.error(`❌ Failed to update sub-service: ${updateRes.status}`);
            console.error(updateRes.data);
            process.exit(1);
        }

        const updatedSubService = updateRes.data;
        console.log(`✅ Updated sub-service`);
        console.log(`   Working On By: ${updatedSubService.working_on_by}\n`);

        // Step 5: Verify the update
        if (updatedSubService.working_on_by !== 'John Doe') {
            console.error(`❌ working_on_by not updated correctly. Expected 'John Doe', got '${updatedSubService.working_on_by}'`);
            process.exit(1);
        }
        console.log('✅ working_on_by field updated correctly\n');

        // Step 6: Fetch the sub-service to verify persistence
        console.log('4️⃣  Fetching sub-service to verify persistence...');
        const fetchRes = await makeRequest('GET', `/api/v1/subServices/${createdSubService.id}`);
        if (fetchRes.status !== 200) {
            console.error(`❌ Failed to fetch sub-service: ${fetchRes.status}`);
            process.exit(1);
        }

        const fetchedSubService = fetchRes.data;
        console.log(`✅ Fetched sub-service: ${fetchedSubService.sub_service_name}`);
        console.log(`   Working On By: ${fetchedSubService.working_on_by}\n`);

        if (fetchedSubService.working_on_by !== 'John Doe') {
            console.error(`❌ working_on_by not persisted correctly. Expected 'John Doe', got '${fetchedSubService.working_on_by}'`);
            process.exit(1);
        }
        console.log('✅ working_on_by field persisted correctly\n');

        console.log('✅ All tests passed! The working_on_by feature is working correctly.\n');
        console.log('Summary:');
        console.log('  ✓ Created sub-service with working_on_by: CW');
        console.log('  ✓ Updated working_on_by to: John Doe');
        console.log('  ✓ Verified persistence in database');
        console.log('\nThe feature is ready for use in the frontend!');

    } catch (error) {
        console.error('❌ Test error:', error.message);
        process.exit(1);
    }
}

runTests();
