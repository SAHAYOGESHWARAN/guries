/**
 * Test Asset QC functionality specifically
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
        console.log(`${method} ${path}: ${res.statusCode}`);
        if (res.statusCode === 200) {
          try {
            const jsonData = JSON.parse(responseData);
            console.log(`Response: ${JSON.stringify(jsonData, null, 2).substring(0, 500)}...`);
          } catch (e) {
            console.log(`Response: ${responseData.substring(0, 200)}...`);
          }
        } else {
          console.log(`Error: ${responseData}`);
        }
        resolve({ path, status: res.statusCode, data: responseData });
      });
    });

    req.on('error', (error) => {
      console.log(`${method} ${path}: Error - ${error.message}`);
      resolve({ path, status: 0, error: error.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`${method} ${path}: Timeout`);
      resolve({ path, status: 0, error: 'Timeout' });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAssetQC() {
  console.log('🧪 Testing Asset QC Functionality');
  console.log('===================================');
  
  // Test 1: Get all assets
  console.log('\n1. Getting all assets...');
  await testEndpoint('/api/v1/assets');
  
  // Test 2: Get asset library
  console.log('\n2. Getting asset library...');
  await testEndpoint('/api/v1/assetLibrary');
  
  // Test 3: Get QC pending assets
  console.log('\n3. Getting QC pending assets...');
  await testEndpoint('/api/v1/assetLibrary/qc/pending');
  
  // Test 4: Create a new asset
  console.log('\n4. Creating a new asset...');
  const newAsset = {
    asset_name: "Test Asset for QC",
    asset_type: "Image",
    asset_category: "Graphics",
    status: "Draft",
    workflow_stage: "Design",
    qc_status: "Pending"
  };
  await testEndpoint('/api/v1/assetLibrary', 'POST', newAsset);
  
  // Test 5: Submit asset for QC
  console.log('\n5. Submitting asset for QC...');
  await testEndpoint('/api/v1/assetLibrary/1/submit-qc', 'POST', {
    qc_status: "Submitted",
    workflow_stage: "QC Review"
  });
  
  // Test 6: Get QC reviews
  console.log('\n6. Getting QC reviews...');
  await testEndpoint('/api/v1/assetLibrary/1/qc-reviews');
  
  // Test 7: Admin QC assets
  console.log('\n7. Getting admin QC assets...');
  await testEndpoint('/api/v1/admin/qc/assets');
  
  console.log('\n✅ Asset QC testing complete!');
}

testAssetQC();
