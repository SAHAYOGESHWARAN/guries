/**
 * Debug Asset QC URL parsing
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

    console.log(`Testing: ${method} ${path}`);
    console.log(`Path parts: ${path.split('/')}`);

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        console.log(`${method} ${path}: ${res.statusCode}`);
        if (res.statusCode !== 200) {
          console.log(`Error response: ${responseData}`);
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

async function debugQC() {
  console.log('🔍 Debugging Asset QC URL parsing');
  console.log('====================================');
  
  // Test different URL formats
  const testPaths = [
    '/api/v1/assetLibrary/1/submit-qc',
    '/api/v1/assetLibrary/2/submit-qc',
    '/api/v1/assetLibrary/1/qc-reviews'
  ];

  for (const path of testPaths) {
    await testEndpoint(path, 'POST', { test: 'data' });
  }
}

debugQC();
