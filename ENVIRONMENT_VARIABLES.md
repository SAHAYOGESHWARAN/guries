# Environment Variables Quick Reference

## Quick Setup

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your values
```

### Frontend
```bash
cp .env.example .env
# Edit .env with your Google Gemini API key
```

---

## Required Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DB_USER` | PostgreSQL username | `postgres` | ✅ Yes |
| `DB_HOST` | Database host | `localhost` | ✅ Yes |
| `DB_NAME` | Database name | `mcc_db` | ✅ Yes |
| `DB_PASSWORD` | Database password | `your_password` | ✅ Yes |
| `DB_PORT` | Database port | `5432` | ✅ Yes |
| `PORT` | Backend server port | `3001` | ✅ Yes |
| `NODE_ENV` | Environment mode | `development` | ✅ Yes |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` | ✅ Yes |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | `ACxxxxx` | ⚠️ Optional |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | `xxxxx` | ⚠️ Optional |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | `+1234567890` | ⚠️ Optional |

### Frontend (`.env`)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `API_KEY` | Google Gemini AI API Key | `AIzaSy...` | ✅ Yes |

---

## API Keys Setup

### 1. Google Gemini AI API Key

**Where to get**: https://aistudio.google.com/app/apikey

**Steps**:
1. Visit the link above
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key
5. Add to `.env` file: `API_KEY=your_key_here`

**Used for**:
- AI Chatbot
- Content generation
- Content analysis
- Image generation

### 2. Twilio API (Optional)

**Where to get**: https://console.twilio.com/

**Steps**:
1. Sign up for Twilio account
2. Get Account SID and Auth Token from dashboard
3. Purchase a phone number
4. Add to `backend/.env`

**Used for**:
- SMS OTP authentication

---

## Example Files

### `backend/.env.example`
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=mcc_db
DB_PASSWORD=your_database_password_here
DB_PORT=5432
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### `.env.example` (root)
```env
API_KEY=your_google_gemini_api_key_here
```

---

## Security Notes

- ✅ `.env` files are in `.gitignore` (not committed)
- ✅ Never share API keys
- ✅ Use different keys for dev/production
- ✅ Rotate keys regularly

---

For detailed setup instructions, see **[ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)**

