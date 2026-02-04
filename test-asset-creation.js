/**
 * Test asset creation specifically
 */

const https = require('https');

function testAssetCreation() {
  return new Promise((resolve) => {
    const testData = {
      asset_name: "Test Asset " + Date.now(),
      asset_type: "Article",
      asset_category: "Content",
      application_type: "web",
      name: "new testing",
      type: "article",
      repository: "Content Repository",
      status: "Pending QC Review"
    };

    const options = {
      hostname: 'guries.vercel.app',
      port: 443,
      path: '/api/v1/assetLibrary',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };

    console.log('🧪 Testing Asset Creation');
    console.log('=============================');
    console.log('Creating asset:', testData);

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        console.log(`\nStatus: ${res.statusCode}`);
        try {
          const jsonData = JSON.parse(responseData);
          console.log('Response:', JSON.stringify(jsonData, null, 2));
          
          // Test if the response structure is correct
          if (jsonData.success && jsonData.data && jsonData.data.asset_name) {
            console.log('\n✅ Asset creation successful!');
            console.log('✅ Response structure is correct');
            console.log('✅ New asset should appear in the table');
          } else {
            console.log('\n❌ Response structure issue');
          }
        } catch (e) {
          console.log('Raw Response:', responseData);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log('Error:', error.message);
      resolve();
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log('Error: Timeout');
      resolve();
    });

    req.write(JSON.stringify(testData));
    req.end();
  });
}

testAssetCreation();
