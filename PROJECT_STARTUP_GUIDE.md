# Guires Marketing Control Center - Startup Guide

## ✅ Project Status
The development server is now running successfully!

## 🚀 Access the Application

### Frontend (React + Vite)
- **URL**: http://localhost:5173/
- **Status**: ✅ Running
- **Port**: 5173

### Backend API (Express + TypeScript)
- **URL**: http://localhost:3003
- **Status**: ✅ Running
- **Port**: 3003

## 🔐 Login Page Features

The new improved login page includes:

### Modern UI Design
- **Responsive Layout**: Desktop and mobile optimized
- **Dark Theme**: Professional gradient background with glassmorphism effects
- **Smooth Animations**: Loading states and transitions
- **Accessibility**: Password visibility toggle, proper labels

### Demo Accounts (Quick Login)
Use these credentials to test the application:

1. **Admin Account**
   - Email: `admin@example.com`
   - Password: `admin123`
   - Role: Admin

2. **User Account**
   - Email: `user@example.com`
   - Password: `user123`
   - Role: User

3. **Manager Account**
   - Email: `manager@example.com`
   - Password: `manager123`
   - Role: Manager

### Features
- ✅ Email and password input fields
- ✅ Password visibility toggle
- ✅ Error message display
- ✅ Loading state with spinner
- ✅ Demo account quick login buttons
- ✅ Forgot password link
- ✅ Responsive design for all screen sizes
- ✅ Professional branding and messaging

## 📋 How to Use

### Step 1: Open the Application
Navigate to: **http://localhost:5173/**

### Step 2: Login
Choose one of these options:

**Option A: Quick Login (Recommended for Testing)**
- Click on any demo account button
- The credentials will auto-fill
- Click "Sign In"

**Option B: Manual Login**
- Enter email address
- Enter password
- Click "Sign In"

### Step 3: Access Dashboard
After successful login, you'll be redirected to the main dashboard with:
- Sidebar navigation
- Header with user profile
- Main content area
- Chatbot assistant

## 🛠️ Development Commands

### Start Development Server
```bash
npm run dev
```

### Start Frontend Only
```bash
npm run dev:frontend
```

### Start Backend Only
```bash
npm run dev:backend
```

### Build for Production
```bash
npm run build
```

## 📁 Project Structure

```
├── frontend/
│   ├── views/
│   │   └── LoginView.tsx (✨ Updated with new UI)
│   ├── components/
│   ├── hooks/
│   └── App.tsx
├── backend/
│   ├── controllers/
│   ├── config/
│   ├── database/
│   └── server.ts
└── package.json
```

## 🔧 Configuration

### Frontend Environment
- **Vite**: Fast build tool
- **React**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling

### Backend Environment
- **Express**: Web framework
- **TypeScript**: Type safety
- **SQLite/PostgreSQL**: Database
- **JWT**: Authentication

## 📊 Application Features

### Main Dashboard
- Real-time analytics
- Performance metrics
- Project overview
- Team collaboration tools

### Navigation
- Sidebar with menu items
- Quick access to main features
- User profile management
- Settings and configuration

### Modules
- Projects & Campaigns
- Assets & Content
- Analytics & Reporting
- Team Management
- Admin Console

## ⚠️ Troubleshooting

### Frontend Not Loading
1. Check if port 5173 is available
2. Clear browser cache
3. Restart the dev server: `npm run dev:frontend`

### Backend Connection Error
1. Verify backend is running on port 3003
2. Check API_BASE_URL in environment
3. Restart backend: `npm run dev:backend`

### Login Not Working
1. Verify backend is running
2. Check browser console for errors
3. Ensure credentials are correct
4. Try demo account quick login

### Database Issues
1. Check database connection in backend logs
2. Verify database file exists
3. Check .env configuration

## 📝 Next Steps

1. ✅ **Explore Dashboard**: Navigate through different sections
2. ✅ **Test Features**: Try various functionalities
3. ✅ **Check Responsive Design**: Test on different screen sizes
4. ✅ **Review Code**: Check the updated LoginView.tsx
5. ✅ **Customize**: Modify branding and settings as needed

## 🎯 Key Improvements Made

### LoginView.tsx Updates
- ✨ Modern responsive design
- ✨ Two-column layout (desktop)
- ✨ Feature highlights on left side
- ✨ Demo account quick login buttons
- ✨ Password visibility toggle
- ✨ Better error handling
- ✨ Loading states
- ✨ Mobile-optimized

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Check backend logs for API issues
4. Verify environment configuration

---

**Last Updated**: 2025-02-07
**Status**: ✅ Ready for Development
