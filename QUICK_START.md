# Quick Start Guide - Admin Login

## 🚀 Get Started in 5 Minutes

### 1. Setup Admin Account
```bash
node setup-admin-account.js
```

### 2. Start Backend
```bash
npm install --prefix backend
npm run dev --prefix backend
```
✅ Backend running on `http://localhost:3003`

### 3. Start Frontend
```bash
npm install --prefix frontend
npm run dev --prefix frontend
```
✅ Frontend running on `http://localhost:5173`

### 4. Open Browser
```
http://localhost:5173
```

### 5. Login with Demo Credentials
```
Email:    admin@example.com
Password: admin123
```

---

## 📋 Admin Credentials

| Field | Value |
|-------|-------|
| **Email** | admin@example.com |
| **Password** | admin123 |
| **Role** | Admin |
| **Status** | Active |

---

## ✨ What You Can Do

### Dashboard
- 📊 View system statistics
- 👥 Manage users
- 🔍 View audit logs
- ⚙️ System configuration

### QC Review
- 📋 View pending assets
- ✅ Approve assets
- ❌ Reject assets
- 🔄 Request rework
- 📈 View QC metrics

### Assets
- 📁 View all assets
- ✏️ Edit assets
- 🗑️ Delete assets
- 🔗 Link assets
- 📊 Track usage

### Master Data
- 🏭 Industry/Sector
- 📦 Asset Types
- 🌍 Countries
- 📱 Platforms
- 📝 Content Types

---

## 🔧 Environment Setup

### Backend `.env`
```bash
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=$2a$10$... (bcrypt hash)
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### Frontend `.env.local`
```bash
VITE_API_URL=http://localhost:3003/api/v1
```

---

## 🧪 Test Login

### Using Browser
1. Go to `http://localhost:5173`
2. Enter email: `admin@example.com`
3. Enter password: `admin123`
4. Click "Sign In"

### Using cURL
```bash
curl -X POST http://localhost:3003/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

---

## ⚠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check port 3003 is free, verify `.env` file |
| Frontend won't start | Check port 5173 is free, clear node_modules |
| Login fails | Verify credentials, check backend logs |
| Can't connect to server | Verify backend is running, check VITE_API_URL |
| Blank login page | Clear browser cache, restart frontend |

---

## 📚 Documentation

- **Full Setup:** See `ADMIN_LOGIN_SETUP.md`
- **Credentials:** See `LOGIN_CREDENTIALS.md`
- **QC Review:** See `QC_REVIEW_DEPLOYMENT_GUIDE.md`
- **Industry Master:** See backend/migrations/

---

## 🔐 Security Notes

### Development ✅
- Demo credentials are fine
- Use `.env` file (not in git)
- Change JWT_SECRET

### Production ⚠️
- **Never use demo credentials**
- Use strong passwords (12+ characters)
- Use bcrypt hashing (10+ rounds)
- Use strong JWT secret (32+ characters)
- Enable HTTPS only
- Implement rate limiting
- Monitor login attempts
- Rotate credentials regularly

---

## 📞 Support

### Check Logs
```bash
# Backend logs
npm run dev --prefix backend

# Frontend logs
Open browser console (F12)
```

### Common Commands
```bash
# Reset admin password
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('newpassword', 10));"

# Check backend health
curl http://localhost:3003/api/v1/health

# View database
sqlite3 backend/mcc_db.sqlite
```

---

## ✅ Checklist

- [ ] Run `node setup-admin-account.js`
- [ ] Verify `.env` file in backend/
- [ ] Start backend: `npm run dev --prefix backend`
- [ ] Start frontend: `npm run dev --prefix frontend`
- [ ] Open `http://localhost:5173`
- [ ] Login with admin@example.com / admin123
- [ ] Explore admin dashboard
- [ ] Test QC review workflow
- [ ] Create additional users (optional)

---

## 🎉 You're Ready!

Your admin account is set up and ready to use. Start exploring the Guires Marketing Operating System!

For detailed information, see the documentation files in the root directory.
