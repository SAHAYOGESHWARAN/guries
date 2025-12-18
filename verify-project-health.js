#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Project Health...\n');

// Check if all required files exist
const requiredFiles = [
    'package.json',
    'index.html',
    'index.tsx',
    'App.tsx',
    'vite.config.ts',
    'tsconfig.json',
    'tailwind.config.js',
    'src/index.css',
    'backend/package.json',
    'backend/server.ts'
];

console.log('📁 Checking required files...');
let missingFiles = [];
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        missingFiles.push(file);
    }
});

// Check if all required directories exist
const requiredDirs = [
    'components',
    'views',
    'hooks',
    'utils',
    'backend',
    'backend/routes',
    'backend/config'
];

console.log('\n📂 Checking required directories...');
let missingDirs = [];
requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        console.log(`✅ ${dir}/`);
    } else {
        console.log(`❌ ${dir}/ - MISSING`);
        missingDirs.push(dir);
    }
});

// Check package.json dependencies
console.log('\n📦 Checking package.json...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = ['react', 'react-dom', '@vitejs/plugin-react', 'vite', 'typescript'];

    requiredDeps.forEach(dep => {
        if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
            console.log(`✅ ${dep}`);
        } else {
            console.log(`❌ ${dep} - MISSING`);
        }
    });
} catch (error) {
    console.log(`❌ Error reading package.json: ${error.message}`);
}

// Check backend package.json
console.log('\n🔧 Checking backend package.json...');
try {
    const backendPackageJson = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
    const requiredBackendDeps = ['express', 'cors', 'dotenv', 'better-sqlite3'];

    requiredBackendDeps.forEach(dep => {
        if (backendPackageJson.dependencies?.[dep] || backendPackageJson.devDependencies?.[dep]) {
            console.log(`✅ ${dep}`);
        } else {
            console.log(`❌ ${dep} - MISSING`);
        }
    });
} catch (error) {
    console.log(`❌ Error reading backend/package.json: ${error.message}`);
}

// Check for common React component issues
console.log('\n⚛️  Checking React components...');
const componentsDir = 'components';
if (fs.existsSync(componentsDir)) {
    const components = fs.readdirSync(componentsDir).filter(file => file.endsWith('.tsx'));
    console.log(`Found ${components.length} components:`);
    components.forEach(component => {
        console.log(`  - ${component}`);
    });
} else {
    console.log('❌ Components directory not found');
}

// Check for views
console.log('\n📄 Checking Views...');
const viewsDir = 'views';
if (fs.existsSync(viewsDir)) {
    const views = fs.readdirSync(viewsDir).filter(file => file.endsWith('.tsx'));
    console.log(`Found ${views.length} views:`);
    views.forEach(view => {
        console.log(`  - ${view}`);
    });
} else {
    console.log('❌ Views directory not found');
}

// Check environment files
console.log('\n🌍 Checking environment configuration...');
const envFiles = ['.env.local', 'backend/.env'];
envFiles.forEach(envFile => {
    if (fs.existsSync(envFile)) {
        console.log(`✅ ${envFile}`);
    } else {
        console.log(`⚠️  ${envFile} - Not found (may be optional)`);
    }
});

// Summary
console.log('\n📊 SUMMARY:');
if (missingFiles.length === 0 && missingDirs.length === 0) {
    console.log('✅ All required files and directories are present');
} else {
    console.log('❌ Issues found:');
    if (missingFiles.length > 0) {
        console.log(`   Missing files: ${missingFiles.join(', ')}`);
    }
    if (missingDirs.length > 0) {
        console.log(`   Missing directories: ${missingDirs.join(', ')}`);
    }
}

console.log('\n🚀 Next steps:');
console.log('1. Run: npm install');
console.log('2. Run: cd backend && npm install');
console.log('3. Run: npm run dev');
console.log('4. Open: http://localhost:5173');
console.log('5. Open: test-all-pages.html to test all pages');

console.log('\n✨ Project health check complete!');