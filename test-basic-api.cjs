// Test basic API endpoints

async function testBasicAPI() {
    try {
        console.log('Testing basic API endpoints...');

        // Test existing endpoint
        const response = await fetch('http://localhost:3003/api/users');
        if (response.ok) {
            const users = await response.json();
            console.log('✅ GET /api/users works:', users.length, 'users found');
        } else {
            console.log('❌ GET /api/users failed:', response.status);
        }

        // Test our new endpoints
        const categoryResponse = await fetch('http://localhost:3003/api/asset-category-master');
        console.log('Asset Category Master response status:', categoryResponse.status);
        const categoryText = await categoryResponse.text();
        console.log('Asset Category Master response:', categoryText.substring(0, 200));

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testBasicAPI();