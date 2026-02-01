# Quick Deployment Setup (5 Minutes)

## What's Fixed

✅ Backend now deploys to Vercel  
✅ API routes properly configured  
✅ Environment variables complete  
✅ CORS headers set up  
✅ Serverless functions ready  

## What You Need to Do

### 1. Database Setup (2 min)
Choose ONE:

**Supabase (Recommended)**
```
1. Go to https://supabase.com
2. Click "New Project"
3. Create project
4. Go to Settings → Database
5. Copy connection string
6. Save for next step
```

**Neon**
```
1. Go to https://neon.tech
2. Create account
3. Create project
4. Copy connection string
5. Save for next step
```

### 2. Vercel Setup (2 min)
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
vercel link
```

### 3. Environment Variables (1 min)
In Vercel dashboard, go to Settings → Environment Variables and add:

```
DATABASE_URL = [your connection string from step 1]
JWT_SECRET = [generate random string: openssl rand -base64 32]
VITE_GEMINI_API_KEY = [your Gemini API key]
CORS_ORIGIN = https://your-domain.com
NODE_ENV = production
```

### 4. Deploy
```bash
# Deploy to production
vercel --prod
```

## Verify It Works

1. Wait for deployment to complete
2. Go to your Vercel project URL
3. Check health: `https://your-domain.com/api/v1/health`
4. Should see: `{"status":"ok",...}`

## If Something Breaks

**API returns 404**
- Check `vercel.json` exists
- Check `api/v1/[[...route]].ts` exists
- Redeploy: `vercel --prod`

**Database connection fails**
- Verify `DATABASE_URL` is correct
- Test connection string locally
- Check database is accessible from Vercel

**Frontend can't reach API**
- Check `VITE_API_URL=/api/v1` is set
- Check browser console for errors
- Rebuild frontend: `npm run build:frontend`

## Next: Migrate Your Data

Once deployed, migrate data from SQLite to PostgreSQL:

```bash
# Export from SQLite
npm run export:sqlite

# Import to PostgreSQL
npm run import:postgres
```

## Done!

Your app is now properly deployed to Vercel with:
- ✅ Frontend served from Vercel
- ✅ Backend API running as serverless functions
- ✅ Database persisted in PostgreSQL
- ✅ CORS properly configured
- ✅ Environment variables secure

For detailed info, see `DEPLOYMENT_GUIDE.md`
