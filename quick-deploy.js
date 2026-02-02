#!/usr/bin/env node

/**
 * IMMEDIATE DEPLOYMENT FIX
 * This script will deploy the project correctly
 */

const { execSync } = require('child_process');

console.log('🚀 IMMEDIATE DEPLOYMENT FIX');
console.log('==========================');

console.log('\n📋 Step 1: Building project...');
try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build successful');
} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}

console.log('\n📋 Step 2: Installing Vercel CLI...');
try {
    execSync('npm i -g vercel', { stdio: 'inherit' });
    console.log('✅ Vercel CLI installed');
} catch (error) {
    console.log('⚠️  Vercel CLI might already be installed');
}

console.log('\n📋 Step 3: Deploying to Vercel...');
console.log('🔗 Please follow these steps:');
console.log('');
console.log('1. Run: vercel link');
console.log('2. When asked for scope, enter: SAHAYOGESHWARAN');
console.log('3. When asked for project, select: guries');
console.log('4. Run: vercel --prod');
console.log('');
console.log('🌐 Your site will be available at: https://guries.vercel.app');
console.log('');
console.log('🧪 After deployment, test with: node test-deployment.js');

console.log('\n⚡ QUICK DEPLOY COMMANDS:');
console.log('vercel link --scope SAHAYOGESHWARAN && vercel --prod');
