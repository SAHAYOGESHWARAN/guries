import axios from 'axios';

const API_URL = 'http://localhost:3004/api/v1';

async function checkAssetFields() {
    try {
        // Login
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@example.com',
            password: 'admin123'
        });
        const authToken = loginRes.data.token;

        // Get assets
        const assetsRes = await axios.get(`${API_URL}/assetLibrary`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (assetsRes.data && assetsRes.data.length > 0) {
            const asset = assetsRes.data[0];
            console.log('Asset Fields:');
            console.log(JSON.stringify(asset, null, 2));
        } else {
            console.log('No assets found');
        }
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

checkAssetFields();
