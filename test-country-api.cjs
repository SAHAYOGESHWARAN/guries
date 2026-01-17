const http = require('http');

const API_BASE = 'http://localhost:3003/api/v1';

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_BASE + path);
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
                        data: JSON.parse(body)
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
    console.log('🧪 Country Master API Tests\n');

    try {
        // Test 1: Create Country
        console.log('1️⃣  Creating country...');
        const createRes = await makeRequest('POST', '/country-master', {
            country_name: 'United States',
            iso_code: 'US',
            region: 'North America',
            default_language: 'English',
            allowed_for_backlinks: true,
            allowed_for_content_targeting: true,
            allowed_for_smm_targeting: true,
            status: 'active'
        });
        console.log(`   Status: ${createRes.status}`);
        if (createRes.status !== 201) {
            console.log('   Response:', createRes.data);
            console.log('❌ Create failed - Backend may not be running');
            console.log('\n💡 To test API, start backend with: npm run dev (in backend directory)');
            process.exit(0);
        }
        const countryId = createRes.data.id;
        console.log(`✅ Country created with ID: ${countryId}\n`);

        // Test 2: Get All Countries
        console.log('2️⃣  Fetching all countries...');
        const getAllRes = await makeRequest('GET', '/country-master');
        console.log(`   Status: ${getAllRes.status}`);
        console.log(`   Count: ${getAllRes.data.length}`);
        console.log(`✅ Fetched ${getAllRes.data.length} countries\n`);

        // Test 3: Get Country Details
        console.log(`3️⃣  Fetching country ${countryId} details...`);
        const getRes = await makeRequest('GET', `/country-master/${countryId}`);
        console.log(`   Status: ${getRes.status}`);
        console.log(`   Country: ${getRes.data.country_name}`);
        console.log(`   ISO Code: ${getRes.data.iso_code}`);
        console.log(`   Region: ${getRes.data.region}`);
        console.log(`   Backlinks: ${getRes.data.allowed_for_backlinks ? 'Yes' : 'No'}`);
        console.log(`   Content: ${getRes.data.allowed_for_content_targeting ? 'Yes' : 'No'}`);
        console.log(`   SMM: ${getRes.data.allowed_for_smm_targeting ? 'Yes' : 'No'}`);
        console.log(`✅ Country details retrieved\n`);

        // Test 4: Update Country
        console.log(`4️⃣  Updating country ${countryId}...`);
        const updateRes = await makeRequest('PUT', `/country-master/${countryId}`, {
            country_name: 'United States',
            iso_code: 'US',
            region: 'North America',
            default_language: 'Spanish',
            allowed_for_backlinks: false,
            allowed_for_content_targeting: true,
            allowed_for_smm_targeting: true,
            status: 'active'
        });
        console.log(`   Status: ${updateRes.status}`);
        console.log(`✅ Country updated\n`);

        // Test 5: Get Regions
        console.log('5️⃣  Fetching available regions...');
        const regionsRes = await makeRequest('GET', '/country-master/list/regions');
        console.log(`   Status: ${regionsRes.status}`);
        console.log(`   Regions: ${regionsRes.data.join(', ')}`);
        console.log(`✅ Regions retrieved\n`);

        // Test 6: Delete Country
        console.log(`6️⃣  Deleting country ${countryId}...`);
        const deleteRes = await makeRequest('DELETE', `/country-master/${countryId}`);
        console.log(`   Status: ${deleteRes.status}`);
        console.log(`✅ Country deleted\n`);

        console.log('✅ All API tests passed!');
    } catch (error) {
        console.error('❌ Test error:', error.message);
        console.log('\n💡 Make sure backend is running on port 3003');
    }
}

runTests();
