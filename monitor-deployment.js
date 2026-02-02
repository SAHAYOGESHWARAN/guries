#!/usr/bin/env node

/**
 * Vercel Deployment Monitor
 * Monitors deployment status and provides debugging information
 */

const https = require('https');

const BASE_URL = 'https://guries.vercel.app';

function checkDeployment() {
    console.log('🔍 Checking Vercel Deployment Status...');
    console.log(`🌐 URL: ${BASE_URL}`);
    console.log('=' .repeat(60));

    const options = {
        method: 'GET',
        headers: {
            'User-Agent': 'Deployment-Monitor/1.0'
        }
    };

    const req = https.request(BASE_URL, options, (res) => {
        console.log(`📊 Status Code: ${res.statusCode}`);
        console.log(`📋 Headers:`, res.headers);
        
        let data = '';
        res.on('data', chunk => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log(`📄 Response Body (${data.length} chars):`);
            console.log(data.substring(0, 500) + (data.length > 500 ? '...' : ''));
            
            if (res.statusCode === 200) {
                console.log('\n✅ Frontend is accessible!');
                checkAPIEndpoints();
            } else if (res.statusCode === 404) {
                console.log('\n❌ Deployment not found (404)');
                console.log('🔧 Possible causes:');
                console.log('   - Deployment is still processing');
                console.log('   - Vercel configuration issue');
                console.log('   - Domain not configured correctly');
                console.log('\n📋 Next steps:');
                console.log('   1. Check Vercel dashboard');
                console.log('   2. Verify deployment logs');
                console.log('   3. Trigger manual redeploy if needed');
            } else {
                console.log(`\n⚠️  Unexpected status: ${res.statusCode}`);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Request failed:', error.message);
        console.log('🔧 Check network connection and domain');
    });

    req.end();
}

function checkAPIEndpoints() {
    console.log('\n🔍 Testing API Endpoints...');
    
    const endpoints = [
        '/api/health',
        '/api/v1/qc-reviews?id=2',
        '/api/v1/assetLibrary/2/qc-review'
    ];

    endpoints.forEach((endpoint, index) => {
        setTimeout(() => {
            console.log(`\n🧪 Testing ${endpoint}...`);
            
            const req = https.request(`${BASE_URL}${endpoint}`, (res) => {
                console.log(`   Status: ${res.statusCode}`);
                
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        console.log('   ✅ SUCCESS');
                        try {
                            const json = JSON.parse(data);
                            console.log('   📄 Valid JSON response');
                        } catch (e) {
                            console.log('   ⚠️  Invalid JSON response');
                        }
                    } else {
                        console.log(`   ❌ FAILED (${res.statusCode})`);
                        console.log(`   Response: ${data.substring(0, 100)}...`);
                    }
                });
            });

            req.on('error', (error) => {
                console.log(`   ❌ ERROR: ${error.message}`);
            });

            req.end();
        }, index * 1000);
    });
}

function provideDeploymentGuide() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 DEPLOYMENT VERIFICATION GUIDE');
    console.log('=' .repeat(60));
    
    console.log('\n1. 🚀 Vercel Dashboard Check:');
    console.log('   - Visit https://vercel.com/dashboard');
    console.log('   - Check deployment status');
    console.log('   - Review build logs for errors');
    
    console.log('\n2. 🔍 Manual Redeploy (if needed):');
    console.log('   - Go to project settings');
    console.log('   - Click "Redeploy" or push new commit');
    
    console.log('\n3. 🧪 Local Testing:');
    console.log('   - Run: npm run build:all');
    console.log('   - Test: node test-deployment.js');
    
    console.log('\n4. 📊 Monitoring:');
    console.log('   - Check Vercel Functions logs');
    console.log('   - Monitor API response times');
    console.log('   - Verify CORS headers');
    
    console.log('\n5. ✅ Success Criteria:');
    console.log('   - Frontend loads at https://guries.vercel.app');
    console.log('   - API endpoints return 200 status');
    console.log('   - QC review functionality works');
    console.log('   - No console errors in browser');
    
    console.log('\n🔗 Useful Links:');
    console.log('   - Vercel Dashboard: https://vercel.com/dashboard');
    console.log('   - Project: https://vercel.com/SAHAYOGESHWARAN/guries');
    console.log('   - Logs: Check Functions tab in project');
}

// Start monitoring
checkDeployment();

// Show deployment guide after a delay
setTimeout(provideDeploymentGuide, 5000);
