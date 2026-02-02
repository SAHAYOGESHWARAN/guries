#!/usr/bin/env node

/**
 * Quick Vercel Deployment Setup
 * Guides through the deployment process step by step
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Vercel Deployment Setup Guide');
console.log('================================');

function checkPrerequisites() {
    console.log('\n📋 Checking prerequisites...');
    
    // Check if git is initialized
    if (!fs.existsSync('.git')) {
        console.log('❌ Git repository not found');
        return false;
    }
    console.log('✅ Git repository found');
    
    // Check if vercel.json exists
    if (!fs.existsSync('vercel.json')) {
        console.log('❌ vercel.json not found');
        return false;
    }
    console.log('✅ vercel.json found');
    
    // Check if package.json exists
    if (!fs.existsSync('package.json')) {
        console.log('❌ package.json not found');
        return false;
    }
    console.log('✅ package.json found');
    
    return true;
}

function validateConfiguration() {
    console.log('\n🔍 Validating configuration...');
    
    try {
        const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
        console.log('✅ vercel.json is valid JSON');
        
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        console.log('✅ package.json is valid JSON');
        
        if (packageJson.scripts && packageJson.scripts['build:all']) {
            console.log('✅ build:all script found');
        } else {
            console.log('❌ build:all script not found');
            return false;
        }
        
        return true;
    } catch (error) {
        console.log('❌ Configuration error:', error.message);
        return false;
    }
}

function showDeploymentOptions() {
    console.log('\n🎯 Deployment Options:');
    console.log('');
    console.log('Option 1: Vercel CLI (Recommended)');
    console.log('  npm i -g vercel');
    console.log('  vercel link');
    console.log('  vercel --prod');
    console.log('');
    console.log('Option 2: Vercel Dashboard');
    console.log('  1. Go to https://vercel.com/dashboard');
    console.log('  2. Click "Add New Project"');
    console.log('  3. Import from GitHub: SAHAYOGESHWARAN/guries');
    console.log('  4. Configure settings:');
    console.log('     - Framework Preset: Other');
    console.log('     - Build Command: npm run build:all');
    console.log('     - Output Directory: frontend/dist');
    console.log('  5. Click Deploy');
    console.log('');
    console.log('Option 3: GitHub Integration');
    console.log('  1. Connect GitHub to Vercel');
    console.log('  2. Auto-deploy on push');
    console.log('');
}

function showTroubleshooting() {
    console.log('\n🔧 Troubleshooting:');
    console.log('');
    console.log('If deployment fails:');
    console.log('1. Check Vercel dashboard for build logs');
    console.log('2. Verify all files are committed to Git');
    console.log('3. Ensure build:all script works locally');
    console.log('4. Check for missing dependencies');
    console.log('');
    console.log('Common issues:');
    console.log('- Missing .gitignore entries');
    console.log('- Build command failures');
    console.log('- Incorrect output directory');
    console.log('- Missing environment variables');
    console.log('');
}

function showVerificationSteps() {
    console.log('\n✅ Post-Deployment Verification:');
    console.log('');
    console.log('After deployment, test with:');
    console.log('1. Browser test: https://guries.vercel.app');
    console.log('2. API test: node test-deployment.js');
    console.log('3. Monitor: node monitor-deployment.js');
    console.log('');
    console.log('Expected results:');
    console.log('- Frontend loads without errors');
    console.log('- QC review functionality works');
    console.log('- API endpoints return 200');
    console.log('- No console errors');
    console.log('');
}

// Run the setup guide
console.log('🔍 Starting deployment setup check...');

if (checkPrerequisites() && validateConfiguration()) {
    console.log('\n✅ All prerequisites met!');
    showDeploymentOptions();
    showTroubleshooting();
    showVerificationSteps();
    
    console.log('🎉 Ready for deployment!');
    console.log('');
    console.log('📝 Quick Start Commands:');
    console.log('npm i -g vercel && vercel link && vercel --prod');
} else {
    console.log('\n❌ Please fix the issues above before deploying.');
}
