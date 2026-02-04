/**
 * Debug 404 Asset Not Found Error
 */

const https = require('https');

function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'guries.vercel.app',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        console.log(`\n${method} ${path}`);
        console.log(`Status: ${res.statusCode}`);
        try {
          const jsonData = JSON.parse(responseData);
          console.log('Response:', JSON.stringify(jsonData, null, 2));
        } catch (e) {
          console.log('Raw Response:', responseData);
        }
        resolve({ path, status: res.statusCode, data: responseData });
      });
    });

    req.on('error', (error) => {
      console.log(`\n${method} ${path}`);
      console.log(`Error: ${error.message}`);
      resolve({ path, status: 0, error: error.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`\n${method} ${path}`);
      console.log(`Error: Timeout`);
      resolve({ path, status: 0, error: 'Timeout' });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function debug404Error() {
  console.log('🔍 Debugging 404 Asset Not Found Error');
  console.log('=======================================');
  
  // Check current assets
  console.log('\n1. Checking current assets...');
  await testEndpoint('/api/v1/assets');
  
  console.log('\n2. Checking asset library...');
  await testEndpoint('/api/v1/assetLibrary');
  
  console.log('\n3. Checking specific asset IDs...');
  await testEndpoint('/api/v1/assets/1');
  await testEndpoint('/api/v1/assetLibrary/1');
  await testEndpoint('/api/v1/assetLibrary/2');
  await testEndpoint('/api/v1/assetLibrary/3');
  
  console.log('\n4. Testing asset operations...');
  await testEndpoint('/api/v1/assetLibrary/1/qc-reviews');
  await testEndpoint('/api/v1/assetLibrary/1/submit-qc', 'POST');
  
  console.log('\n5. Creating a new asset to test...');
  const newAsset = {
    asset_name: "Debug Test Asset " + Date.now(),
    asset_type: "Image",
    asset_category: "Graphics",
    status: "Pending QC Review",
    application_type: "web"
  };
  await testEndpoint('/api/v1/assetLibrary', 'POST', newAsset);
  
  console.log('\n6. Checking assets after creation...');
  await testEndpoint('/api/v1/assetLibrary');
  
  console.log('\n7. Testing with the new asset ID...');
  await testEndpoint('/api/v1/assetLibrary/4');
}

debug404Error();
