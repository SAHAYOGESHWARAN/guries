# 🔧 VISUAL GUIDE: Change Node.js Version in Vercel

## 📸 Step-by-Step with Visual Cues

### **Step 1: Vercel Dashboard**
```
🌐 https://vercel.com/dashboard
👤 Your Account → Projects List
📋 Find "guries" project
🖱️ Click on project name
```

### **Step 2: Navigate to Settings**
```
📊 Project Dashboard
├── 📊 Overview
├── ⚙️  Settings  ← CLICK HERE
├── 📦 Deployments
└── 📈 Analytics
```

### **Step 3: Find Runtime Settings**
```
⚙️ Settings Page
├── 📝 General
├── 🔨 Build & Development Settings
├── ⚡ Runtime Settings  ← LOOK HERE
├── 🌍 Environment Variables
└── 🔐 Domains
```

### **Step 4: Change Node.js Version**
```
⚡ Runtime Settings Section
┌─────────────────────────────────────┐
│ Node.js Version: [24.x ▼]         │
│ Function CPU:     [Standard ▼]      │
│ Memory:          [2 GB ▼]          │
│ Fluid Compute:    [Enabled ✓]       │
└─────────────────────────────────────┘

🖱️ Click on [24.x ▼] dropdown
📋 Select "18.x" from the list
```

### **Step 5: Save and Deploy**
```
💾 Save Button (bottom of page)
🔄 Redeploy (Deployments tab)
⏳ Wait 2-5 minutes
✅ Test with: node test-deployment.js
```

## 🔗 Direct Links

### **Quick Access:**
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Your Project**: https://vercel.com/SAHAYOGESHWARAN/guries
- **Settings Page**: https://vercel.com/SAHAYOGESHWARAN/guries/settings

## ⚠️ Common Issues & Solutions

### **Issue: Can't Find Runtime Settings**
**Solution:**
- Make sure you're on the correct project
- Look under "General" settings
- Check if it's called "Environment" instead

### **Issue: 18.x Not in Dropdown**
**Solution:**
- Try typing "18" manually
- Use Vercel CLI method
- Contact Vercel support

### **Issue: Settings Not Saving**
**Solution:**
- Check internet connection
- Try refreshing the page
- Use incognito browser window

## 📱 Alternative: Vercel CLI Method

If dashboard doesn't work:

```bash
# Install CLI
npm i -g vercel

# Link project
vercel link --scope SAHAYOGESHWARAN

# Update Node.js version
vercel env add NODEJS_VERSION=18

# Deploy
vercel --prod
```

## 🎯 Success Indicators

After changing to Node.js 18.x:
- ✅ Build completes without errors
- ✅ Frontend loads at https://guries.vercel.app
- ✅ No more 404 NOT_FOUND errors
- ✅ QC review functionality works
