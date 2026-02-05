#!/usr/bin/env node

/**
 * Admin Account Setup Script
 * Creates admin credentials and generates bcrypt hash
 */

const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';
const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production-' + Math.random().toString(36).substring(2, 15);

console.log('\n🔐 Admin Account Setup Script');
console.log('='.repeat(60));

// Generate bcrypt hash
console.log('\n📝 Generating bcrypt hash for password...');
const hashedPassword = bcrypt.hashSync(ADMIN_PASSWORD, 10);
console.log(`✅ Password hash generated: ${hashedPassword}`);

// Create .env content
const envContent = `# Admin Credentials
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${hashedPassword}

# JWT Configuration
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d

# Database
DATABASE_URL=sqlite:./mcc_db.sqlite

# API Configuration
API_PORT=3003
API_HOST=localhost

# Frontend
VITE_API_URL=http://localhost:3003/api/v1

# Optional: Twilio for OTP (leave empty if not using)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Optional: Google OAuth (leave empty if not using)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
`;

// Check if .env already exists
const backendEnvPath = path.join(__dirname, 'backend', '.env');
const backendEnvExamplePath = path.join(__dirname, 'backend', '.env.example');

console.log('\n📁 Setting up environment files...');

// Create .env.example if it doesn't exist
if (!fs.existsSync(backendEnvExamplePath)) {
    fs.writeFileSync(backendEnvExamplePath, envContent);
    console.log(`✅ Created: ${backendEnvExamplePath}`);
} else {
    console.log(`⏭️  Already exists: ${backendEnvExamplePath}`);
}

// Create .env if it doesn't exist
if (!fs.existsSync(backendEnvPath)) {
    fs.writeFileSync(backendEnvPath, envContent);
    console.log(`✅ Created: ${backendEnvPath}`);
} else {
    console.log(`⏭️  Already exists: ${backendEnvPath}`);
    console.log('   (Not overwriting existing .env file)');
}

// Create frontend .env if needed
const frontendEnvPath = path.join(__dirname, 'frontend', '.env.local');
if (!fs.existsSync(frontendEnvPath)) {
    const frontendEnv = `VITE_API_URL=http://localhost:3003/api/v1\n`;
    fs.writeFileSync(frontendEnvPath, frontendEnv);
    console.log(`✅ Created: ${frontendEnvPath}`);
}

console.log('\n' + '='.repeat(60));
console.log('📋 Admin Credentials Summary');
console.log('='.repeat(60));
console.log(`Email:    ${ADMIN_EMAIL}`);
console.log(`Password: ${ADMIN_PASSWORD}`);
console.log(`\n🔑 Bcrypt Hash (for ADMIN_PASSWORD env var):`);
console.log(`${hashedPassword}`);
console.log(`\n🔐 JWT Secret (for JWT_SECRET env var):`);
console.log(`${JWT_SECRET}`);

console.log('\n' + '='.repeat(60));
console.log('✅ Setup Complete!');
console.log('='.repeat(60));

console.log('\n📝 Next Steps:');
console.log('1. Verify .env file in backend/ directory');
console.log('2. Start backend: npm run dev --prefix backend');
console.log('3. Start frontend: npm run dev --prefix frontend');
console.log('4. Open http://localhost:5173 in your browser');
console.log('5. Login with:');
console.log(`   Email: ${ADMIN_EMAIL}`);
console.log(`   Password: ${ADMIN_PASSWORD}`);

console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
console.log('- Change JWT_SECRET in production');
console.log('- Never commit .env file to version control');
console.log('- Use strong passwords in production');
console.log('- Rotate credentials regularly');
console.log('- Enable HTTPS in production');

console.log('\n📚 For more information, see LOGIN_CREDENTIALS.md\n');
