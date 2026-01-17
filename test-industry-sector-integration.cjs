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
                        data: data ? JSON.parse(data) : null,
                        headers: res.headers
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: data,
                        headers: res.headers
                    });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runIntegrationTests() {
    console.log('🧪 Industry/Sector Integration Tests\n');
    console.log('='.repeat(60));

    let passed = 0;
    let failed = 0;
    let testResults = [];

    try {
        // Test Suite 1: CRUD Operations
        console.log('\n📋 Test Suite 1: CRUD Operations\n');

        // Create
        console.log('1.1 Creating new industry/sector...');
        const createPayload = {
            industry: 'Integration Test Industry',
            sector: 'Integration Test Sector',
            application: 'Integration Test App',
            country: 'Test Country',
            description: 'Integration test description',
            status: 'active'
        };

        let res = await makeRequest('POST', '/industry-sectors', createPayload);
        let createdId = null;

        if (res.status === 201 && res.data.id) {
            console.log(`✅ Created with ID: ${res.data.id}`);
            createdId = res.data.id;
            passed++;
            testResults.push({ test: 'Create', status: 'PASS' });
        } else {
            console.log(`❌ Failed: ${res.status}`);
            failed++;
            testResults.push({ test: 'Create', status: 'FAIL' });
        }

        if (createdId) {
            // Read
            console.log('\n1.2 Reading created record...');
            res = await makeRequest('GET', '/industry-sectors');
            const found = res.data.find(i => i.id === createdId);

            if (found && found.industry === 'Integration Test Industry') {
                console.log('✅ Record found and verified');
                passed++;
                testResults.push({ test: 'Read', status: 'PASS' });
            } else {
                console.log('❌ Record not found');
                failed++;
                testResults.push({ test: 'Read', status: 'FAIL' });
            }

            // Update
            console.log('\n1.3 Updating record...');
            const updatePayload = {
                ...createPayload,
                description: 'Updated integration test description'
            };

            res = await makeRequest('PUT', `/industry-sectors/${createdId}`, updatePayload);

            if (res.status === 200 && res.data.description === 'Updated integration test description') {
                console.log('✅ Record updated successfully');
                passed++;
                testResults.push({ test: 'Update', status: 'PASS' });
            } else {
                console.log('❌ Update failed');
                failed++;
                testResults.push({ test: 'Update', status: 'FAIL' });
            }

            // Delete
            console.log('\n1.4 Deleting record...');
            res = await makeRequest('DELETE', `/industry-sectors/${createdId}`);

            if (res.status === 200) {
                console.log('✅ Record deleted successfully');
                passed++;
                testResults.push({ test: 'Delete', status: 'PASS' });
            } else {
                console.log('❌ Delete failed');
                failed++;
                testResults.push({ test: 'Delete', status: 'FAIL' });
            }
        }

        // Test Suite 2: Filtering & Querying
        console.log('\n\n📋 Test Suite 2: Filtering & Querying\n');

        // Get all
        console.log('2.1 Getting all records...');
        res = await makeRequest('GET', '/industry-sectors');

        if (res.status === 200 && Array.isArray(res.data)) {
            console.log(`✅ Retrieved ${res.data.length} records`);
            passed++;
            testResults.push({ test: 'Get All', status: 'PASS' });
        } else {
            console.log('❌ Failed to get all records');
            failed++;
            testResults.push({ test: 'Get All', status: 'FAIL' });
        }

        // Get unique industries
        console.log('\n2.2 Getting unique industries...');
        res = await makeRequest('GET', '/industry-sectors/master/industries');

        if (res.status === 200 && Array.isArray(res.data) && res.data.length > 0) {
            console.log(`✅ Retrieved ${res.data.length} unique industries`);
            passed++;
            testResults.push({ test: 'Get Industries', status: 'PASS' });
        } else {
            console.log('❌ Failed to get industries');
            failed++;
            testResults.push({ test: 'Get Industries', status: 'FAIL' });
        }

        // Get unique countries
        console.log('\n2.3 Getting unique countries...');
        res = await makeRequest('GET', '/industry-sectors/master/countries');

        if (res.status === 200 && Array.isArray(res.data) && res.data.length > 0) {
            console.log(`✅ Retrieved ${res.data.length} unique countries`);
            passed++;
            testResults.push({ test: 'Get Countries', status: 'PASS' });
        } else {
            console.log('❌ Failed to get countries');
            failed++;
            testResults.push({ test: 'Get Countries', status: 'FAIL' });
        }

        // Get by industry
        console.log('\n2.4 Getting records by industry...');
        res = await makeRequest('GET', '/industry-sectors/industry/Technology');

        if (res.status === 200 && Array.isArray(res.data)) {
            console.log(`✅ Retrieved ${res.data.length} Technology records`);
            passed++;
            testResults.push({ test: 'Get by Industry', status: 'PASS' });
        } else {
            console.log('❌ Failed to get by industry');
            failed++;
            testResults.push({ test: 'Get by Industry', status: 'FAIL' });
        }

        // Get by country
        console.log('\n2.5 Getting records by country...');
        res = await makeRequest('GET', '/industry-sectors/country/United%20States');

        if (res.status === 200 && Array.isArray(res.data)) {
            console.log(`✅ Retrieved ${res.data.length} US records`);
            passed++;
            testResults.push({ test: 'Get by Country', status: 'PASS' });
        } else {
            console.log('❌ Failed to get by country');
            failed++;
            testResults.push({ test: 'Get by Country', status: 'FAIL' });
        }

        // Get sectors by industry
        console.log('\n2.6 Getting sectors by industry...');
        res = await makeRequest('GET', '/industry-sectors/master/sectors/Technology');

        if (res.status === 200 && Array.isArray(res.data)) {
            console.log(`✅ Retrieved ${res.data.length} Technology sectors`);
            passed++;
            testResults.push({ test: 'Get Sectors', status: 'PASS' });
        } else {
            console.log('❌ Failed to get sectors');
            failed++;
            testResults.push({ test: 'Get Sectors', status: 'FAIL' });
        }

        // Test Suite 3: Validation
        console.log('\n\n📋 Test Suite 3: Validation\n');

        // Missing required fields
        console.log('3.1 Testing validation (missing fields)...');
        res = await makeRequest('POST', '/industry-sectors', {
            industry: 'Test'
            // Missing sector, application, country
        });

        if (res.status === 400) {
            console.log('✅ Validation error returned correctly');
            passed++;
            testResults.push({ test: 'Validation', status: 'PASS' });
        } else {
            console.log('❌ Validation not working');
            failed++;
            testResults.push({ test: 'Validation', status: 'FAIL' });
        }

        // Test Suite 4: Data Integrity
        console.log('\n\n📋 Test Suite 4: Data Integrity\n');

        console.log('4.1 Checking data consistency...');
        res = await makeRequest('GET', '/industry-sectors');
        const allRecords = res.data;

        let integrityOk = true;
        for (const record of allRecords) {
            if (!record.id || !record.industry || !record.sector || !record.application || !record.country) {
                integrityOk = false;
                break;
            }
        }

        if (integrityOk) {
            console.log('✅ All records have required fields');
            passed++;
            testResults.push({ test: 'Data Integrity', status: 'PASS' });
        } else {
            console.log('❌ Some records missing required fields');
            failed++;
            testResults.push({ test: 'Data Integrity', status: 'FAIL' });
        }

    } catch (error) {
        console.error('\n❌ Test Error:', error.message);
        failed++;
    }

    // Print summary
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY\n');

    testResults.forEach(result => {
        const icon = result.status === 'PASS' ? '✅' : '❌';
        console.log(`${icon} ${result.test.padEnd(25)} ${result.status}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log(`Total: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(60) + '\n');

    process.exit(failed > 0 ? 1 : 0);
}

runIntegrationTests();
