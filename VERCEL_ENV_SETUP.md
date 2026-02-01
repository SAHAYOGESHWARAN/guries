# Vercel Environment Variables Setup

## Required Environment Variables for Production Deployment

Copy and paste these into Vercel Project Settings → Environment Variables:

### Database Configuration (PostgreSQL)
```
DB_HOST=your-db-host.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_database_password_here
DB_NAME=postgres
```

### Server Configuration
```
NODE_ENV=production
PORT=3001
API_PORT=3001
```

### Frontend Configuration
```
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
```

### Authentication & Security
```
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long_change_this
JWT_EXPIRY=7d
```

### Logging
```
LOG_LEVEL=info
```

### Features
```
ENABLE_NOTIFICATIONS=true
ENABLE_EMAIL_ALERTS=true
```

---

## How to Set Up in Vercel

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Select your project
3. Click "Settings"

### Step 2: Add Environment Variables
1. Click "Environment Variables" in the left sidebar
2. For each variable above, click "Add New"
3. Enter the variable name and value
4. Select "Production" for the environment
5. Click "Save"

### Step 3: Redeploy
1. Go to "Deployments"
2. Click the three dots on the latest deployment
3. Click "Redeploy"

---

## Getting Your Database Credentials

### If using Supabase (Recommended):
1. Go to https://supabase.com
2. Create a new project or select existing
3. Go to Settings → Database
4. Copy the connection string details:
   - Host: `db.xxxxx.supabase.co`
   - Port: `5432`
   - User: `postgres`
   - Password: (shown during project creation)
   - Database: `postgres`

### If using AWS RDS:
1. Go to AWS RDS Dashboard
2. Select your database instance
3. Copy the endpoint (DB_HOST)
4. Use your configured credentials

### If using DigitalOcean:
1. Go to DigitalOcean Managed Databases
2. Select your PostgreSQL cluster
3. Copy the connection details from "Connection Details"

---

## Generating a Secure JWT Secret

Run this command in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as your JWT_SECRET value.

---

## Verifying Deployment

After deployment, verify everything works:

1. **Check Frontend**: Visit `https://your-domain.com`
2. **Check API Health**: Visit `https://your-domain.com/api/health`
3. **Check Logs**: Go to Vercel Dashboard → Deployments → Logs

---

## Troubleshooting

### Database Connection Error
- Verify DB_HOST, DB_PORT, DB_USER, DB_PASSWORD are correct
- Ensure database allows connections from Vercel IPs
- Check firewall/security group settings

### CORS Error
- Update CORS_ORIGIN to match your domain exactly
- Include https:// in the URL

### JWT Error
- Ensure JWT_SECRET is at least 32 characters
- Regenerate using the command above

### Build Fails
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure package.json scripts are correct

---

## Next Steps

1. ✅ Prepare environment variables
2. → Add to Vercel dashboard
3. → Redeploy application
4. → Verify deployment works
5. → Monitor logs for errors

