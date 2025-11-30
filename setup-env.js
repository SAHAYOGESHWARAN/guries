/**
 * Environment Setup Script
 * Creates .env files from .env.example templates
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up environment files...\n');

// Backend .env
const backendEnvPath = path.join(__dirname, 'backend', '.env');
const backendEnvExample = path.join(__dirname, 'backend', '.env.example');

if (!fs.existsSync(backendEnvPath)) {
    if (fs.existsSync(backendEnvExample)) {
        fs.copyFileSync(backendEnvExample, backendEnvPath);
        console.log('✅ Created backend/.env from .env.example');
    } else {
        // Create backend .env with default values
        const backendEnvContent = `# =====================================================
# Marketing Control Center - Backend Environment Variables
# =====================================================
# IMPORTANT: Replace placeholder values with your actual credentials

# =====================================================
# Database Configuration
# =====================================================
DB_USER=postgres
DB_HOST=localhost
DB_NAME=mcc_db
DB_PASSWORD=password
DB_PORT=5432

# =====================================================
# Server Configuration
# =====================================================
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# =====================================================
# Twilio Configuration (for OTP/SMS) - Optional
# =====================================================
# Get these from: https://console.twilio.com/
# Leave empty if not using Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
`;
        fs.writeFileSync(backendEnvPath, backendEnvContent);
        console.log('✅ Created backend/.env with default values');
    }
} else {
    console.log('⚠️  backend/.env already exists, skipping...');
}

// Frontend .env
const frontendEnvPath = path.join(__dirname, '.env');
const frontendEnvExample = path.join(__dirname, '.env.example');

if (!fs.existsSync(frontendEnvPath)) {
    if (fs.existsSync(frontendEnvExample)) {
        fs.copyFileSync(frontendEnvExample, frontendEnvPath);
        console.log('✅ Created .env from .env.example');
    } else {
        // Create frontend .env with default values
        const frontendEnvContent = `# =====================================================
# Marketing Control Center - Frontend Environment Variables
# =====================================================
# IMPORTANT: Replace placeholder value with your actual Google Gemini API key

# =====================================================
# Google Gemini AI API Key
# =====================================================
# Get your API key from: https://aistudio.google.com/app/apikey
# This key is used for AI-powered features like:
# - Content generation
# - AI chatbot
# - Content analysis
# - Image generation
API_KEY=your_google_gemini_api_key_here
`;
        fs.writeFileSync(frontendEnvPath, frontendEnvContent);
        console.log('✅ Created .env with default values');
    }
} else {
    console.log('⚠️  .env already exists, skipping...');
}

console.log('\n✨ Environment setup complete!');
console.log('\n📝 Next steps:');
console.log('   1. Edit backend/.env with your database credentials');
console.log('   2. Edit .env with your Google Gemini API key');
console.log('   3. Get API key from: https://aistudio.google.com/app/apikey');
console.log('\n📚 See ENV_SETUP_GUIDE.md for detailed instructions.\n');

