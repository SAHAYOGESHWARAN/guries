#!/usr/bin/env node

/**
 * HOW TO CHANGE NODE.JS VERSION IN VERCEL
 * Complete step-by-step guide with visual instructions
 */

console.log('🔧 HOW TO CHANGE NODE.JS VERSION IN VERCEL');
console.log('==========================================');

console.log('\n📋 STEP 1: Go to Vercel Dashboard');
console.log('URL: https://vercel.com/dashboard');
console.log('- Log in to your Vercel account');
console.log('- Find your project "guries" in the list');
console.log('- Click on the project name');

console.log('\n📋 STEP 2: Go to Settings');
console.log('1. In your project dashboard, look for the "Settings" tab');
console.log('2. It\'s usually in the top navigation bar');
console.log('3. Click on "Settings"');

console.log('\n📋 STEP 3: Find Runtime Settings');
console.log('1. Scroll down the Settings page');
console.log('2. Look for a section called "Runtime Settings"');
console.log('3. It should be below "Build Settings"');

console.log('\n📋 STEP 4: Change Node.js Version');
console.log('1. Find the "Node.js Version" field');
console.log('2. It currently shows "24.x"');
console.log('3. Click on the dropdown menu');
console.log('4. Select "18.x" from the list');
console.log('5. The dropdown should show options like:');
console.log('   - 16.x');
console.log('   - 18.x  ← SELECT THIS ONE');
console.log('   - 20.x');
console.log('   - 22.x');
console.log('   - 24.x');

console.log('\n📋 STEP 5: Save Changes');
console.log('1. Scroll to the bottom of the Settings page');
console.log('2. Click the "Save" button');
console.log('3. Wait for the save confirmation');

console.log('\n📋 STEP 6: Redeploy');
console.log('1. Go to the "Deployments" tab');
console.log('2. Click the "Redeploy" button');
console.log('3. Wait for the deployment to complete');
console.log('4. This may take 2-5 minutes');

console.log('\n📋 STEP 7: Test the Deployment');
console.log('Run this command to test:');
console.log('node test-deployment.js');

console.log('\n🌐 Expected Results:');
console.log('✅ Status should change from 404 to 200');
console.log('✅ Frontend loads at https://guries.vercel.app');
console.log('✅ QC review functionality works');

console.log('\n⚠️  TROUBLESHOOTING:');
console.log('If you don\'t see "Runtime Settings":');
console.log('- Make sure you\'re on the correct project');
console.log('- Look for "Environment Variables" section');
console.log('- Runtime settings might be under "General" settings');

console.log('\nIf Node.js 18.x is not in the dropdown:');
console.log('- Try typing "18" manually');
console.log('- Contact Vercel support if needed');
console.log('- Use the API to update settings');

console.log('\n🔗 DIRECT LINKS:');
console.log('- Vercel Dashboard: https://vercel.com/dashboard');
console.log('- Your Project: https://vercel.com/SAHAYOGESHWARAN/guries');
console.log('- Settings: https://vercel.com/SAHAYOGESHWARAN/guries/settings');

console.log('\n📱 ALTERNATIVE: Vercel CLI Method');
console.log('If dashboard doesn\'t work:');
console.log('1. Install Vercel CLI: npm i -g vercel');
console.log('2. Link project: vercel link');
console.log('3. Update settings: vercel env add NODEJS_VERSION=18');
console.log('4. Deploy: vercel --prod');
