/**
 * Test the API server locally
 */

const { spawn } = require('child_process');
const http = require('http');

function testLocalServer() {
  console.log('🧪 Testing Local API Server...');
  
  // Test the built server
  return new Promise((resolve) => {
    const serverProcess = spawn('node', ['api/dist/server.js'], {
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    let output = '';
    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log('Server output:', data.toString().trim());
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.log('Server error:', data.toString().trim());
    });
    
    // Wait a bit for server to start, then test
    setTimeout(() => {
      // Test health endpoint
      const req = http.get('http://localhost:3001/health', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log('Health check response:', data);
          serverProcess.kill();
          resolve({
            success: res.statusCode === 200,
            status: res.statusCode,
            data: JSON.parse(data)
          });
        });
      });
      
      req.on('error', (err) => {
        console.log('Health check error:', err.message);
        serverProcess.kill();
        resolve({
          success: false,
          error: err.message
        });
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        serverProcess.kill();
        resolve({
          success: false,
          error: 'Timeout'
        });
      });
    }, 3000);
  });
}

testLocalServer().then(result => {
  console.log('\n📊 Test Result:', result);
  if (result.success) {
    console.log('✅ API server is working correctly!');
  } else {
    console.log('❌ API server test failed:', result.error);
  }
}).catch(console.error);
