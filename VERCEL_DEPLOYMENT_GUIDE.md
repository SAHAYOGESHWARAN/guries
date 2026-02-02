# 🚀 VERCEL DASHBOARD DEPLOYMENT GUIDE

## 📋 VERCEL SETTINGS CONFIGURATION

Based on your Vercel dashboard, here are the **exact settings** you need to configure:

### **🔧 Build Settings**
```
Build Command: npm run build
Output Directory: frontend/dist
Install Command: npm install
```

### **⚙️ Runtime Settings**
```
Node.js Version: 18.x (CHANGE FROM 24.x to 18.x)
Function CPU: Standard (1 vCPU, 2 GB Memory)
Fluid Compute: Enabled
```

### **🏗️ Build Machine**
```
Build Machine: Standard performance (4 vCPUs, 8 GB Memory)
On-Demand Concurrent Builds: ENABLED
Prioritize Production Builds: ENABLED
```

## 🎯 STEP-BY-STEP DEPLOYMENT

### **Step 1: Update Vercel Settings**
1. Go to your project in Vercel dashboard
2. Click **"Settings"** tab
3. Under **"Build & Development Settings"**:
   - Build Command: `npm run build`
   - Output Directory: `frontend/dist`
   - Install Command: `npm install`

### **Step 2: Update Node.js Version**
1. Go to **"Runtime"** section
2. Change **Node.js Version** from `24.x` to `18.x`
3. Keep other settings as shown above

### **Step 3: Enable Concurrent Builds**
1. Go to **"Build Settings"**
2. **Enable** "On-Demand Concurrent Builds"
3. **Enable** "Prioritize Production Builds"

### **Step 4: Deploy**
1. Go to **"Deployments"** tab
2. Click **"Redeploy"** or push a new commit
3. Wait for build to complete

## 🌐 EXPECTED RESULTS

After deployment with these settings:
- ✅ **Frontend loads** at https://guries.vercel.app
- ✅ **No 404 errors**
- ✅ **No "Unexpected token 'export'" errors**
- ✅ **QC review functionality works**

## 🧪 TEST DEPLOYMENT

```bash
node test-deployment.js
```

## 🔍 TROUBLESHOOTING

If build fails:
1. Check **Build Logs** in Vercel dashboard
2. Verify Node.js version is set to **18.x**
3. Ensure Build Command is `npm run build`
4. Check Output Directory is `frontend/dist`

---

## 📞 QUICK REFERENCE

**Required Settings:**
- Build Command: `npm run build`
- Output Directory: `frontend/dist`
- Node.js Version: `18.x`
- Install Command: `npm install`

**Deploy URL:** https://guries.vercel.app

**Test Command:** `node test-deployment.js`
