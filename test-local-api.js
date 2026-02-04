/**
 * Test the local API serverless function
 */

const http = require('http');

function startTestServer() {
  console.log('🚀 Starting test API server on port 3002...');
  
  // Import and run the API server
  const handler = require('./api/dist/index.js').default;
  
  const server = http.createServer(async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id, X-User-Role');

    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    try {
      // Create mock Vercel request/response objects
      const mockReq = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: ''
      };

      const mockRes = {
        statusCode: 200,
        headers: {},
        setHeader: function(name, value) {
          this.headers[name] = value;
        },
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          res.writeHead(this.statusCode, { 'Content-Type': 'application/json', ...this.headers });
          res.end(JSON.stringify(data));
        },
        send: function(data) {
          res.writeHead(this.statusCode, this.headers);
          res.end(data);
        },
        end: function(data) {
          res.writeHead(this.statusCode, this.headers);
          res.end(data || '');
        }
      };

      // Collect request body
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        mockReq.body = body;
        try {
          mockReq.body = JSON.parse(body);
        } catch (e) {
          // Keep as string if not JSON
        }

        // Call the handler
        await handler(mockReq, mockRes);
      });

    } catch (error) {
      console.error('Server error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });

  server.listen(3002, () => {
    console.log('✅ Test server running on http://localhost:3002');
    
    // Test the endpoints
    setTimeout(() => {
      testEndpoints();
    }, 1000);
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
  });
}

function testEndpoints() {
  console.log('\n🧪 Testing API endpoints...');
  
  const endpoints = [
    '/health',
    '/api/v1/health',
    '/api/v1/dashboard/stats',
    '/api/v1/projects',
    '/api/v1/campaigns',
    '/api/v1/tasks',
    '/api/v1/assets',
    '/api/v1/services',
    '/api/v1/users',
    '/api/v1/content',
    '/api/v1/keywords',
    '/api/v1/asset-categories'
  ];

  let completed = 0;
  let successful = 0;

  endpoints.forEach(endpoint => {
    const req = http.get(`http://localhost:3002${endpoint}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        completed++;
        if (res.statusCode >= 200 && res.statusCode < 300) {
          successful++;
          console.log(`  ✅ ${endpoint} - ${res.statusCode}`);
        } else {
          console.log(`  ❌ ${endpoint} - ${res.statusCode}`);
        }
        
        if (completed === endpoints.length) {
          console.log(`\n📊 Results: ${successful}/${completed} endpoints working`);
          console.log(`Success Rate: ${((successful/completed)*100).toFixed(1)}%`);
          
          if (successful === completed) {
            console.log('\n🎉 All endpoints working! Ready for deployment.');
          } else {
            console.log('\n⚠️  Some endpoints failed. Check the logs above.');
          }
          
          process.exit(0);
        }
      });
    });

    req.on('error', (err) => {
      completed++;
      console.log(`  ❌ ${endpoint} - ${err.message}`);
      
      if (completed === endpoints.length) {
        console.log(`\n📊 Results: ${successful}/${completed} endpoints working`);
        process.exit(1);
      }
    });

    req.setTimeout(5000, () => {
      req.destroy();
      completed++;
      console.log(`  ❌ ${endpoint} - Timeout`);
      
      if (completed === endpoints.length) {
        console.log(`\n📊 Results: ${successful}/${completed} endpoints working`);
        process.exit(1);
      }
    });
  });
}

startTestServer();
