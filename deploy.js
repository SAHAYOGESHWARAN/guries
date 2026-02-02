#!/usr/bin/env node

/**
 * Quick Deploy Script for Guries Marketing Control Center
 * This script handles the deployment process step by step
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Deployment Process...');
console.log('================================');

function runCommand(command, description) {
    console.log(`\n📋 ${description}`);
    try {
        const result = execSync(command, { stdio: 'inherit', cwd: process.cwd() });
        console.log(`✅ ${description} - SUCCESS`);
        return true;
    } catch (error) {
        console.error(`❌ ${description} - FAILED`);
        console.error(`Error: ${error.message}`);
        return false;
    }
}

function checkFiles() {
    console.log('\n🔍 Checking required files...');
    
    const requiredFiles = [
        'package.json',
        'vercel.json',
        'frontend/package.json',
        'api/package.json'
    ];
    
    let allExists = true;
    requiredFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file}`);
        } else {
            console.log(`❌ ${file} - MISSING`);
            allExists = false;
        }
    });
    
    return allExists;
}

function main() {
    console.log('📊 Deployment Environment Check');
    
    // Check files
    if (!checkFiles()) {
        console.log('\n❌ Missing required files. Please check the project structure.');
        process.exit(1);
    }
    
    // Build the project
    console.log('\n🔨 Building project...');
    
    if (!runCommand('npm run build', 'Building API and Frontend')) {
        console.log('\n❌ Build failed. Please check the errors above.');
        process.exit(1);
    }
    
    // Check build outputs
    console.log('\n📁 Checking build outputs...');
    
    const buildOutputs = [
        'frontend/dist/index.html',
        'api/dist/health.js',
        'api/dist/v1/assetLibrary/[id]/qc-review.js'
    ];
    
    let buildSuccess = true;
    buildOutputs.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file}`);
        } else {
            console.log(`❌ ${file} - MISSING`);
            buildSuccess = false;
        }
    });
    
    if (!buildSuccess) {
        console.log('\n❌ Build outputs missing. Build process failed.');
        process.exit(1);
    }
    
    console.log('\n✅ Build successful! Ready for deployment.');
    console.log('\n🚀 Next Steps:');
    console.log('1. Install Vercel CLI: npm i -g vercel');
    console.log('2. Link project: vercel link');
    console.log('3. Deploy: vercel --prod');
    console.log('4. Or use Vercel Dashboard to deploy from GitHub');
    
    console.log('\n📋 Deployment Configuration:');
    console.log('- Build Command: npm run build');
    console.log('- Output Directory: frontend/dist');
    console.log('- Node Version: 18.x');
    
    console.log('\n🧪 After deployment, test with:');
    console.log('node test-deployment.js');
}

main();
