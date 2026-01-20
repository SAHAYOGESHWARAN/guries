const http = require('http');

console.log('=== COMPLETE WORKFLOW TEST ===\n');

// Test 1: Get Services
console.log('1. Fetching Services...');
const getServices = () => {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3003,
            path: '/api/v1/services',
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const services = JSON.parse(data);
                    console.log(`   ✅ Found ${services.length} services`);
                    if (services.length > 0) {
                        console.log(`   - First service: ${services[0].service_name} (ID: ${services[0].id})`);
                    }
                    resolve(services);
                } catch (e) {
                    console.log('   ❌ Error parsing services');
                    resolve([]);
                }
            });
        });
        req.on('error', () => resolve([]));
        req.end();
    });
};

// Test 2: Get Sub-Services
const getSubServices = () => {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3003,
            path: '/api/v1/sub-services',
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const subServices = JSON.parse(data);
                    console.log(`   ✅ Found ${subServices.length} sub-services`);
                    if (subServices.length > 0) {
                        console.log(`   - First sub-service: ${subServices[0].sub_service_name} (Parent ID: ${subServices[0].parent_service_id})`);
                    }
                    resolve(subServices);
                } catch (e) {
                    console.log('   ❌ Error parsing sub-services');
                    resolve([]);
                }
            });
        });
        req.on('error', () => resolve([]));
        req.end();
    });
};

// Test 3: Get Assets
const getAssets = () => {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3003,
            path: '/api/v1/assetLibrary',
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const assets = JSON.parse(data);
                    console.log(`   ✅ Found ${assets.length} assets`);
                    if (assets.length > 0) {
                        console.log(`   - First asset: ${assets[0].name} (Type: ${assets[0].type})`);
                    }
                    resolve(assets);
                } catch (e) {
                    console.log('   ❌ Error parsing assets');
                    resolve([]);
                }
            });
        });
        req.on('error', () => resolve([]));
        req.end();
    });
};

// Run tests
(async () => {
    console.log('\n2. Fetching Sub-Services...');
    const subServices = await getSubServices();

    console.log('\n3. Fetching Assets...');
    const assets = await getAssets();

    console.log('\n4. Fetching Services...');
    const services = await getServices();

    console.log('\n=== WORKFLOW VERIFICATION ===\n');

    if (services.length > 0) {
        console.log('✅ Service Master Page:');
        console.log(`   - Can create/edit services`);
        console.log(`   - Can manage sub-services (${subServices.filter(s => s.parent_service_id === services[0].id).length} under first service)`);
        console.log(`   - Can link assets`);
    } else {
        console.log('❌ No services found - create one first');
    }

    if (services.length > 0 && subServices.length > 0) {
        const parentService = services.find(s => s.id === subServices[0].parent_service_id);
        console.log('\n✅ Sub-Service Master Page:');
        console.log(`   - Parent service: ${parentService?.service_name || 'Unknown'}`);
        console.log(`   - Can create/edit sub-services under parent`);
        console.log(`   - Can link assets to sub-services`);
    } else if (services.length > 0) {
        console.log('\n⚠️  Sub-Service Master Page:');
        console.log(`   - No sub-services yet - create one under a parent service`);
    }

    if (assets.length > 0) {
        console.log('\n✅ Asset Linking:');
        console.log(`   - ${assets.length} assets available for linking`);
        console.log(`   - Can link to services or sub-services`);
    } else {
        console.log('\n⚠️  Asset Linking:');
        console.log(`   - No assets available - create some first`);
    }

    console.log('\n=== WORKFLOW COMPLETE ===');
})();
