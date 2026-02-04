/**
 * Quick test of deployed API
 */

const https = require('https');

function testEndpoint(path) {
  return new Promise((resolve) => {
    const req = https.get(`https://guries.vercel.app${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`${path}: ${res.statusCode}`);
        if (res.statusCode === 200) {
          console.log(`Response: ${data.substring(0, 100)}...`);
        }
        resolve({ path, status: res.statusCode, data });
      });
    });

    req.on('error', (error) => {
      console.log(`${path}: Error - ${error.message}`);
      resolve({ path, status: 0, error: error.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`${path}: Timeout`);
      resolve({ path, status: 0, error: 'Timeout' });
    });
  });
}

async function quickTest() {
  console.log('🧪 Quick Test of Deployed API');
  console.log('================================');
  
  const endpoints = [
    '/health',
    '/api/health',
    '/api/v1/health',
    '/api/v1/dashboard/stats',
    '/api/v1/projects'
  ];

  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
}

quickTest();
