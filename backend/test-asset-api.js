const http = require('http');

console.log('Testing Asset Library API...\n');

const options = {
    hostname: 'localhost',
    port: 3003,
    path: '/api/v1/assetLibrary',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const assets = JSON.parse(data);
            console.log(`✅ API Response Status: ${res.statusCode}`);
            console.log(`✅ Total Assets: ${assets.length}`);

            if (assets.length > 0) {
                console.log('\nFirst Asset:');
                const asset = assets[0];
                console.log(`  - ID: ${asset.id}`);
                console.log(`  - Name: ${asset.name}`);
                console.log(`  - Type: ${asset.type}`);
                console.log(`  - Repository: ${asset.repository}`);
                console.log(`  - Status: ${asset.status}`);
                console.log(`  - Linked Service IDs: ${JSON.stringify(asset.linked_service_ids)}`);
                console.log(`  - File URL: ${asset.file_url}`);
            }
        } catch (e) {
            console.error('❌ Error parsing response:', e.message);
            console.log('Raw response:', data);
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ Request error: ${e.message}`);
});

req.end();
