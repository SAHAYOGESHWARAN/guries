# Environment Variables Setup Guide

This guide will help you set up all required environment variables and API keys for the Marketing Control Center.

## Quick Setup

1. **Backend Setup**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your actual values
   ```

2. **Frontend Setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

---

## Required API Keys & Services

### 1. Google Gemini AI API Key (Frontend)

**Purpose**: Powers AI features like content generation, chatbot, and analysis.

**How to Get**:
1. Visit https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

**Where to Add**:
- File: `.env` (root directory)
- Variable: `API_KEY=your_key_here`

**Features Using This**:
- AI Chatbot
- Content generation
- Content analysis
- Image generation (Imagen 3)
- AI-powered evaluations

---

### 2. Twilio API (Backend - Optional)

**Purpose**: SMS OTP authentication for user login.

**How to Get**:
1. Visit https://www.twilio.com/
2. Sign up for a free account
3. Go to Console Dashboard
4. Copy Account SID and Auth Token
5. Get a phone number from Twilio

**Where to Add**:
- File: `backend/.env`
- Variables:
  ```env
  TWILIO_ACCOUNT_SID=your_account_sid
  TWILIO_AUTH_TOKEN=your_auth_token
  TWILIO_PHONE_NUMBER=+1234567890
  ```

**Note**: This is optional. If not configured, OTP features will be disabled.

---

## Environment Variables Reference

### Backend Environment Variables (`backend/.env`)

#### Database Configuration
```env
DB_USER=postgres              # PostgreSQL username
DB_HOST=localhost            # Database host
DB_NAME=mcc_db              # Database name
DB_PASSWORD=your_password   # Database password
DB_PORT=5432                # Database port
```

#### Server Configuration
```env
PORT=3001                                    # Backend server port
NODE_ENV=development                         # Environment (development/production)
FRONTEND_URL=http://localhost:5173           # Frontend URL for CORS
```

#### Twilio Configuration (Optional)
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Frontend Environment Variables (`.env`)

#### Google Gemini AI
```env
API_KEY=your_google_gemini_api_key_here
```

---

## Setup Instructions

### Step 1: Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Copy the example file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` with your values:
   ```bash
   # Use your preferred editor
   nano .env
   # or
   code .env
   ```

4. Fill in the required values:
   - Database credentials
   - Server port (default: 3001)
   - Twilio credentials (optional)

### Step 2: Frontend Setup

1. In the root directory, copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Google Gemini API key:
   ```env
   API_KEY=your_actual_api_key_here
   ```

### Step 3: Verify Setup

1. **Check Backend**:
   ```bash
   cd backend
   # Verify .env exists
   ls -la .env
   ```

2. **Check Frontend**:
   ```bash
   # In root directory
   ls -la .env
   ```

3. **Test the Application**:
   ```bash
   # Start backend
   cd backend
   npm run dev
   
   # In another terminal, start frontend
   npm run dev:client
   ```

---

## Security Best Practices

### ✅ Do:
- Keep `.env` files in `.gitignore` (already configured)
- Use different API keys for development and production
- Rotate API keys regularly
- Use environment variables from hosting provider in production
- Never share API keys in code or documentation

### ❌ Don't:
- Commit `.env` files to version control
- Share API keys in chat or email
- Use production keys in development
- Hardcode API keys in source files

---

## Troubleshooting

### Issue: "API_KEY is not defined"
**Solution**: 
- Ensure `.env` file exists in root directory
- Check that `API_KEY=your_key` is set correctly
- Restart the development server after adding the key

### Issue: "Twilio credentials missing"
**Solution**:
- This is expected if Twilio is not configured
- OTP features will be disabled
- To enable, add Twilio credentials to `backend/.env`

### Issue: "Database connection failed"
**Solution**:
- Verify PostgreSQL is running
- Check database credentials in `backend/.env`
- Ensure database `mcc_db` exists
- Run: `psql -U postgres -l` to list databases

### Issue: "CORS errors"
**Solution**:
- Check `FRONTEND_URL` in `backend/.env`
- Ensure it matches your frontend URL (default: http://localhost:5173)
- Restart backend server after changes

---

## Production Deployment

For production, use environment variables from your hosting provider:

### Vercel/Netlify (Frontend)
- Add `API_KEY` in project settings → Environment Variables

### Heroku/Railway (Backend)
- Add all variables in project settings → Config Vars

### Docker
- Use `docker-compose.yml` with environment variables
- Or pass via `-e` flags

### Example Production .env
```env
# Backend
NODE_ENV=production
DB_HOST=your_production_db_host
DB_PASSWORD=your_secure_password
FRONTEND_URL=https://yourdomain.com

# Frontend
API_KEY=your_production_api_key
```

---

## API Key Limits & Costs

### Google Gemini AI
- **Free Tier**: Limited requests per minute
- **Paid Tier**: Pay-as-you-go pricing
- Check: https://ai.google.dev/pricing

### Twilio
- **Free Trial**: Limited credits
- **Paid**: Per SMS pricing
- Check: https://www.twilio.com/pricing

---

## Support

If you encounter issues:
1. Check this guide
2. Verify all environment variables are set
3. Check console logs for specific errors
4. Review the main README.md

---

**Last Updated**: December 2024  
**Version**: 2.5.0

