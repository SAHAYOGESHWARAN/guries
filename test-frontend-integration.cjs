// Test script to verify frontend-backend integration for all 7 requirements
const puppeteer = require('puppeteer');

async function testFrontendIntegration() {
    console.log('🧪 Testing Frontend-Backend Integration...\n');

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false, // Set to true for headless testing
            defaultViewport: { width: 1920, height: 1080 }
        });

        const page = await browser.newPage();

        // Navigate to the application
        console.log('1️⃣ Navigating to application...');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

        // Navigate to Assets view
        console.log('2️⃣ Navigating to Assets view...');
        await page.click('a[href*="assets"], button[data-view="assets"]');
        await page.waitForTimeout(2000);

        // Click on Upload/Create Asset button
        console.log('3️⃣ Opening asset creation form...');
        await page.click('button:contains("Upload"), button:contains("Create"), button:contains("Add Asset")');
        await page.waitForTimeout(2000);

        // Test Requirement 1: SMM should have only one image upload
        console.log('4️⃣ Testing SMM single image upload...');
        await page.select('select[name="application_type"], select:has(option[value="smm"])', 'smm');
        await page.waitForTimeout(1000);

        // Check if SMM section shows single image upload
        const smmImageUploads = await page.$$('input[type="file"][accept*="image"]');
        console.log(`   SMM image upload fields found: ${smmImageUploads.length}`);

        // Test Requirement 2: Asset format should link with Asset Master
        console.log('5️⃣ Testing Asset Category master table integration...');
        const categoryOptions = await page.$$eval('select option', options =>
            options.filter(opt => opt.textContent.includes('best practices') || opt.textContent.includes('case studies')).length
        );
        console.log(`   Asset category options from master table: ${categoryOptions}`);

        // Test Requirement 3: Usage status should be removed
        console.log('6️⃣ Testing Usage Status removal...');
        const usageStatusFields = await page.$$('input[name*="usage"], select[name*="usage"], label:contains("Usage Status")');
        console.log(`   Usage status fields found (should be 0): ${usageStatusFields.length}`);

        // Test Requirement 4: "Map Asset to Services" label
        console.log('7️⃣ Testing "Map Asset to Services" label...');
        const mapAssetLabel = await page.$('label:contains("Map Asset to Services")');
        console.log(`   "Map Asset to Services" label found: ${mapAssetLabel ? 'Yes' : 'No'}`);

        // Test Requirement 5: Content type static after choosing WEB
        console.log('8️⃣ Testing WEB content type static behavior...');
        await page.select('select[name="application_type"]', 'web');
        await page.waitForTimeout(1000);

        const staticWebMessage = await page.$('div:contains("WEB (Content type is now static)")');
        console.log(`   Static WEB message found: ${staticWebMessage ? 'Yes' : 'No'}`);

        // Test Requirement 6: Asset Category dropdown from master table
        console.log('9️⃣ Testing Asset Category dropdown...');
        const categoryDropdown = await page.$('select[name*="category"], select:has(option:contains("best practices"))');
        console.log(`   Asset Category dropdown found: ${categoryDropdown ? 'Yes' : 'No'}`);

        // Test Requirement 7: Keywords master database integration
        console.log('🔟 Testing Keywords master database integration...');
        const keywordCheckboxes = await page.$$('input[type="checkbox"][name*="keyword"], input[type="checkbox"] + label:contains("lead generation")');
        console.log(`   Keyword checkboxes from master database: ${keywordCheckboxes.length}`);

        console.log('\n✅ Frontend integration test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Check if puppeteer is available
try {
    require('puppeteer');
    testFrontendIntegration();
} catch (error) {
    console.log('⚠️  Puppeteer not available. Please install with: npm install puppeteer');
    console.log('📋 Manual testing checklist:');
    console.log('1. Navigate to http://localhost:5173');
    console.log('2. Go to Assets view');
    console.log('3. Click Create/Upload Asset');
    console.log('4. Verify SMM has only one image upload');
    console.log('5. Verify Asset Category dropdown has master table options');
    console.log('6. Verify no Usage Status fields');
    console.log('7. Verify "Map Asset to Services" label');
    console.log('8. Verify WEB content type becomes static');
    console.log('9. Verify Keywords checkboxes from master database');
}