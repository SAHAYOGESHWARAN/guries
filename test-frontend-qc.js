/**
 * Test the exact endpoints the frontend uses for Asset QC
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
          console.log(`Response: ${JSON.stringify(jsonData, null, 2)}`);
        } catch (e) {
          console.log(`Raw Response: ${responseData}`);
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

async function testFrontendQC() {
  console.log('🔍 Testing Frontend Asset QC Endpoints');
  console.log('========================================');
  
  // Test the exact endpoints the frontend would call
  console.log('\n1. Testing Asset Library (main assets endpoint)...');
  await testEndpoint('/api/v1/assetLibrary');
  
  console.log('\n2. Testing QC Pending Assets (what the QC table uses)...');
  await testEndpoint('/api/v1/assetLibrary/qc/pending');
  
  console.log('\n3. Testing Admin QC Assets...');
  await testEndpoint('/api/v1/admin/qc/assets');
  
  console.log('\n4. Testing regular assets endpoint...');
  await testEndpoint('/api/v1/assets');
  
  console.log('\n5. Testing with query parameters (like frontend might use)...');
  await testEndpoint('/api/v1/assetLibrary?status=Pending');
  await testEndpoint('/api/v1/assetLibrary?qc_status=Pending');
  
  console.log('\n6. Creating a test asset to ensure data exists...');
  const testAsset = {
    asset_name: "Test QC Asset " + Date.now(),
    asset_type: "Image",
    asset_category: "Graphics",
    status: "Draft",
    workflow_stage: "Design",
    qc_status: "Pending"
  };
  await testEndpoint('/api/v1/assetLibrary', 'POST', testAsset);
  
  console.log('\n7. Testing QC pending again after creating asset...');
  await testEndpoint('/api/v1/assetLibrary/qc/pending');
}

testFrontendQC();
