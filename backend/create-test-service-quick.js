const axios = require('axios');
const API = 'http://localhost:3003/api/v1';

async function createTestService() {
    try {
        const response = await axios.post(API + '/services', {
            service_name: 'Test Service',
            service_code: 'TEST-001',
            slug: 'test-service',
            description: 'A test service for sub-services',
            status: 'Published',
            meta_title: 'Test Service',
            meta_description: 'Test service description',
            h1: 'Test Service',
            body_content: 'This is a test service'
        });
        console.log('✅ Service created:', response.data);
    } catch (err) {
        console.error('❌ Error:', err.response?.data || err.message);
    }
}

createTestService();
