/**
 * Test script for Asset Applications API
 * This script tests the new asset application fields
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/v1';

async function testAssetApplications() {
    console.log('🧪 Testing Asset Applications API...\n');

    try {
        // Test 1: Create asset with Web application
        console.log('1️⃣ Creating asset with Web application...');
        const webAsset = {
            name: 'Test Web Asset',
            type: 'article',
            repository: 'Content Repository',
            usage_status: 'Available',
            application_type: 'web',
            web_title: 'How to Use Marketing Automation',
            web_description: 'A comprehensive guide to marketing automation tools and strategies',
            web_keywords: 'marketing, automation, tools, strategy',
            web_url: 'https://example.com/marketing-automation',
            web_h1: 'Marketing Automation Guide',
            web_h2_1: 'Getting Started',
            web_h2_2: 'Best Practices',
            web_thumbnail: 'https://example.com/images/automation.jpg',
            web_body_content: 'Marketing automation helps businesses streamline their marketing efforts...'
        };

        const webResponse = await axios.post(`${API_BASE}/assetLibrary`, webAsset);
        console.log('✅ Web asset created:', webResponse.data.id);
        const webAssetId = webResponse.data.id;

        // Test 2: Create asset with SMM application
        console.log('\n2️⃣ Creating asset with SMM application...');
        const smmAsset = {
            name: 'Test SMM Asset',
            type: 'graphic',
            repository: 'SMM Repository',
            usage_status: 'Available',
            application_type: 'smm',
            smm_platform: 'linkedin',
            smm_title: 'Boost Your Marketing ROI',
            smm_tag: 'marketing',
            smm_url: 'https://example.com/roi-guide',
            smm_description: 'Learn how to maximize your marketing return on investment with these proven strategies.',
            smm_hashtags: '#marketing #ROI #business #strategy',
            smm_media_type: 'image',
            smm_media_url: 'https://example.com/images/roi-boost.jpg'
        };

        const smmResponse = await axios.post(`${API_BASE}/assetLibrary`, smmAsset);
        console.log('✅ SMM asset created:', smmResponse.data.id);
        const smmAssetId = smmResponse.data.id;

        // Test 3: Retrieve all assets
        console.log('\n3️⃣ Retrieving all assets...');
        const allAssets = await axios.get(`${API_BASE}/assetLibrary`);
        console.log(`✅ Retrieved ${allAssets.data.length} assets`);

        // Verify our test assets are in the list
        const webAssetFound = allAssets.data.find(a => a.id === webAssetId);
        const smmAssetFound = allAssets.data.find(a => a.id === smmAssetId);

        if (webAssetFound && webAssetFound.application_type === 'web') {
            console.log('✅ Web asset verified with application_type:', webAssetFound.application_type);
        } else {
            console.log('❌ Web asset not found or missing application_type');
        }

        if (smmAssetFound && smmAssetFound.application_type === 'smm') {
            console.log('✅ SMM asset verified with application_type:', smmAssetFound.application_type);
            console.log('   Platform:', smmAssetFound.smm_platform);
        } else {
            console.log('❌ SMM asset not found or missing application_type');
        }

        // Test 4: Update web asset
        console.log('\n4️⃣ Updating web asset...');
        const updateData = {
            web_title: 'Updated: How to Use Marketing Automation',
            web_h2_1: 'Updated Getting Started Section'
        };

        await axios.put(`${API_BASE}/assetLibrary/${webAssetId}`, updateData);
        console.log('✅ Web asset updated');

        // Test 5: Update SMM asset platform
        console.log('\n5️⃣ Updating SMM asset platform...');
        const updateSmmData = {
            smm_platform: 'twitter',
            smm_hashtags: '#marketing #ROI #business #strategy #twitter'
        };

        await axios.put(`${API_BASE}/assetLibrary/${smmAssetId}`, updateSmmData);
        console.log('✅ SMM asset platform updated to Twitter');

        // Test 6: Verify updates
        console.log('\n6️⃣ Verifying updates...');
        const updatedAssets = await axios.get(`${API_BASE}/assetLibrary`);
        const updatedWeb = updatedAssets.data.find(a => a.id === webAssetId);
        const updatedSmm = updatedAssets.data.find(a => a.id === smmAssetId);

        if (updatedWeb && updatedWeb.web_title.includes('Updated')) {
            console.log('✅ Web asset update verified');
        } else {
            console.log('❌ Web asset update failed');
        }

        if (updatedSmm && updatedSmm.smm_platform === 'twitter') {
            console.log('✅ SMM asset platform update verified');
        } else {
            console.log('❌ SMM asset platform update failed');
        }

        // Test 7: Clean up - delete test assets
        console.log('\n7️⃣ Cleaning up test assets...');
        await axios.delete(`${API_BASE}/assetLibrary/${webAssetId}`);
        await axios.delete(`${API_BASE}/assetLibrary/${smmAssetId}`);
        console.log('✅ Test assets deleted');

        console.log('\n✨ All tests completed successfully!');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        process.exit(1);
    }
}

// Run tests
testAssetApplications();
