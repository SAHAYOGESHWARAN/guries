const http = require('http');

const BASE_URL = 'http://localhost:3003/api/v1';

function makeRequest(method, path, body = null) {
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
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: data ? JSON.parse(data) : null
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: data
                    });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Starting Industry/Sector API Tests\n');
    let passed = 0;
    let failed = 0;

    try {
        // Test 1: Get all industry/sectors
        console.log('Test 1: GET /industry-sectors');
        let res = await makeRequest('GET', '/industry-sectors');
        if (res.status === 200 && Array.isArray(res.data)) {
            console.log('✅ PASS - Retrieved all records\n');
            passed++;
        } else {
            console.log('❌ FAIL - Expected 200 with array\n');
            failed++;
        }

        // Test 2: Get unique industries
        console.log('Test 2: GET /industry-sectors/master/industries');
        res = await makeRequest('GET', '/industry-sectors/master/industries');
        if (res.status === 200 && Array.isArray(res.data)) {
            console.log(`✅ PASS - Retrieved ${res.data.length} unique industries\n`);
            passed++;
        } else {
            console.log('❌ FAIL - Expected 200 with array\n');
            failed++;
        }

        // Test 3: Get unique countries
        console.log('Test 3: GET /industry-sectors/master/countries');
        res = await makeRequest('GET', '/industry-sectors/master/countries');
        if (res.status === 200 && Array.isArray(res.data)) {
            console.log(`✅ PASS - Retrieved ${res.data.length} unique countries\n`);
            passed++;
        } else {
            console.log('❌ FAIL - Expected 200 with array\n');
            failed++;
        }

        // Test 4: Create new industry/sector
        console.log('Test 4: POST /industry-sectors (Create)');
        const newItem = {
            industry: 'Test Industry',
            sector: 'Test Sector',
            application: 'Test Application',
            country: 'Test Country',
            description: 'Test Description',
            status: 'active'
        };
        res = await makeRequest('POST', '/industry-sectors', newItem);
        if (res.status === 201 && res.data.id) {
            console.log(`✅ PASS - Created record with ID ${res.data.id}\n`);
            passed++;
            const createdId = res.data.id;

            // Test 5: Get by industry
            console.log('Test 5: GET /industry-sectors/industry/:industry');
            res = await makeRequest('GET', `/industry-sectors/industry/${encodeURIComponent('Test Industry')}`);
            if (res.status === 200 && Array.isArray(res.data)) {
                console.log(`✅ PASS - Retrieved ${res.data.length} records for industry\n`);
                passed++;
            } else {
                console.log('❌ FAIL - Expected 200 with array\n');
                failed++;
            }

            // Test 6: Get sectors by industry
            console.log('Test 6: GET /industry-sectors/master/sectors/:industry');
            res = await makeRequest('GET', `/industry-sectors/master/sectors/${encodeURIComponent('Test Industry')}`);
            if (res.status === 200 && Array.isArray(res.data)) {
                console.log(`✅ PASS - Retrieved ${res.data.length} sectors\n`);
                passed++;
            } else {
                console.log('❌ FAIL - Expected 200 with array\n');
                failed++;
            }

            // Test 7: Update industry/sector
            console.log('Test 7: PUT /industry-sectors/:id (Update)');
            const updateData = {
                ...newItem,
                description: 'Updated Description'
            };
            res = await makeRequest('PUT', `/industry-sectors/${createdId}`, updateData);
            if (res.status === 200 && res.data.description === 'Updated Description') {
                console.log('✅ PASS - Updated record successfully\n');
                passed++;
            } else {
                console.log('❌ FAIL - Expected 200 with updated data\n');
                failed++;
            }

            // Test 8: Delete industry/sector
            console.log('Test 8: DELETE /industry-sectors/:id (Delete)');
            res = await makeRequest('DELETE', `/industry-sectors/${createdId}`);
            if (res.status === 200) {
                console.log('✅ PASS - Deleted record successfully\n');
                passed++;
            } else {
                console.log('❌ FAIL - Expected 200\n');
                failed++;
            }

            // Test 9: Verify deletion (soft delete)
            console.log('Test 9: Verify soft delete');
            res = await makeRequest('GET', '/industry-sectors');
            const deletedItem = res.data.find(i => i.id === createdId);
            if (!deletedItem || deletedItem.status === 'deleted') {
                console.log('✅ PASS - Record properly soft deleted\n');
                passed++;
            } else {
                console.log('❌ FAIL - Record should be deleted\n');
                failed++;
            }
        } else {
            console.log('❌ FAIL - Expected 201 with ID\n');
            failed++;
        }

        // Test 10: Validation - Missing required fields
        console.log('Test 10: POST /industry-sectors (Validation)');
        res = await makeRequest('POST', '/industry-sectors', {
            industry: 'Test',
            // Missing sector, application, country
        });
        if (res.status === 400) {
            console.log('✅ PASS - Validation error returned\n');
            passed++;
        } else {
            console.log('❌ FAIL - Expected 400 for validation error\n');
            failed++;
        }

        // Test 11: Get by country
        console.log('Test 11: GET /industry-sectors/country/:country');
        res = await makeRequest('GET', `/industry-sectors/country/${encodeURIComponent('United States')}`);
        if (res.status === 200 && Array.isArray(res.data)) {
            console.log(`✅ PASS - Retrieved ${res.data.length} records for country\n`);
            passed++;
        } else {
            console.log('❌ FAIL - Expected 200 with array\n');
            failed++;
        }

    } catch (error) {
        console.error('❌ Test Error:', error.message);
        failed++;
    }

    console.log('\n' + '='.repeat(50));
    console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(50));
    process.exit(failed > 0 ? 1 : 0);
}

runTests();
