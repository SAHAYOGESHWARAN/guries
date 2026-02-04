/**
 * Test QC Review functionality specifically
 */

const https = require('https');

function testQCEndpoint(assetId, qcData) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'guries.vercel.app',
      port: 443,
      path: `/api/v1/assetLibrary/${assetId}/qc-review`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        console.log(`\nPOST /api/v1/assetLibrary/${assetId}/qc-review`);
        console.log(`Status: ${res.statusCode}`);
        try {
          const jsonData = JSON.parse(responseData);
          console.log('Response:', JSON.stringify(jsonData, null, 2));
        } catch (e) {
          console.log('Raw Response:', responseData);
        }
        resolve({ status: res.statusCode, data: responseData });
      });
    });

    req.on('error', (error) => {
      console.log(`\nPOST /api/v1/assetLibrary/${assetId}/qc-review`);
      console.log(`Error: ${error.message}`);
      resolve({ status: 0, error: error.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`\nPOST /api/v1/assetLibrary/${assetId}/qc-review`);
      console.log(`Error: Timeout`);
      resolve({ status: 0, error: 'Timeout' });
    });

    req.write(JSON.stringify(qcData));
    req.end();
  });
}

async function testQCReview() {
  console.log('🧪 Testing QC Review Functionality');
  console.log('===================================');
  
  console.log('\n1. Testing QC Review for Asset 1...');
  const qcData1 = {
    qc_status: 'Pass',
    qc_score: 90,
    qc_remarks: 'Excellent work! All requirements met.'
  };
  await testQCEndpoint(1, qcData1);
  
  console.log('\n2. Testing QC Review for Asset 2...');
  const qcData2 = {
    qc_status: 'Pass',
    qc_score: 85,
    qc_remarks: 'Good quality content, minor improvements needed.'
  };
  await testQCEndpoint(2, qcData2);
  
  console.log('\n3. Testing QC Review for Asset 3...');
  const qcData3 = {
    qc_status: 'Rework',
    qc_score: 70,
    qc_remarks: 'Needs revisions before approval.'
  };
  await testQCEndpoint(3, qcData3);
  
  console.log('\n4. Testing with non-existent asset...');
  const qcData4 = {
    qc_status: 'Pass',
    qc_score: 95,
    qc_remarks: 'Test review.'
  };
  await testQCEndpoint(999, qcData4);
}

testQCReview();
