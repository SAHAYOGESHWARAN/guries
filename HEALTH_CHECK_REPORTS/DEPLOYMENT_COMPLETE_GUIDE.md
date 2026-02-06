# Complete Deployment Guide - Guries Marketing Control Center

## Overview
This guide covers the complete setup for deploying the Guries Marketing Control Center with persistent PostgreSQL database storage on Vercel.

## Architecture

```
Frontend (React + Vite)
    ↓
Vercel Serverless Functions (API Routes)
    ↓
PostgreSQL (Supabase)
```

## Database Setup

### Supabase Configuration
- **Host**: db.nouyqizbqgoyscryexeg.supabase.co
- **Database**: postgres
- **User**: postgres
- **Password**: HeiWPgZkRkBWhWtr
- **Port**: 5432

### Tables Created
- `assets` - Main asset storage table
- Auto-created on first API call

## Environment Variables (Vercel)

Required variables to set in Vercel:
```
DATABASE_URL=postgresql://postgres:HeiWPgZkRkBWhWtr@db.nouyqizbqgoyscryexeg.supabase.co:5432/postgres
NODE_ENV=production
VITE_API_URL=/api/v1
```

## API Endpoints

### Asset Management
- `GET /api/v1/assetLibrary` - Get all assets
- `POST /api/v1/assetLibrary` - Create asset
- `PUT /api/v1/assetLibrary/:id` - Update asset
- `DELETE /api/v1/assetLibrary/:id` - Delete asset

### Request/Response Format

**Create Asset (POST)**
```json
{
  "asset_name": "My Asset",
  "asset_type": "article",
  "asset_category": "content",
  "asset_format": "text",
  "status": "draft",
  "repository": "Content Repository",
  "application_type": "web"
}
```

**Response**
```json
{
  "success": true,
  "asset": {
    "id": 1,
    "asset_name": "My Asset",
    "asset_type": "article",
    "status": "draft",
    "created_at": "2026-02-07T00:00:00.000Z",
    "updated_at": "2026-02-07T00:00:00.000Z"
  },
  "data": { ... },
  "message": "Asset created successfully"
}
```

## Frontend Integration

### API Client Hook (useData)
Located in `frontend/hooks/useData.ts`

Features:
- Automatic data fetching
- Optimistic UI updates
- Offline support with localStorage
- Real-time updates via Socket.io (when available)

### Usage Example
```typescript
import { useData } from '../hooks/useData';

function AssetList() {
  const { data: assets, create, update, remove, loading } = useData('assetLibrary');

  const handleCreate = async () => {
    await create({
      asset_name: 'New Asset',
      asset_type: 'article',
      status: 'draft'
    });
  };

  return (
    <div>
      {loading ? <p>Loading...</p> : (
        <ul>
          {assets.map(asset => (
            <li key={asset.id}>{asset.asset_name}</li>
          ))}
        </ul>
      )}
      <button onClick={handleCreate}>Create Asset</button>
    </div>
  );
}
```

## Deployment Steps

### 1. Verify Environment Variables
Go to Vercel Project Settings → Environment Variables and ensure:
- `DATABASE_URL` is set correctly
- `NODE_ENV=production`
- `VITE_API_URL=/api/v1`

### 2. Deploy
```bash
git push origin master
```

Vercel will automatically:
1. Build the frontend (React + Vite)
2. Deploy API routes (serverless functions)
3. Initialize database schema on first API call

### 3. Test Deployment
1. Go to https://guries.vercel.app
2. Create a test asset
3. Refresh page - asset should persist
4. Redeploy - asset should still exist

## Data Persistence

Data is stored in PostgreSQL (Supabase) and persists across:
- Page refreshes
- Redeployments
- Server restarts

## Troubleshooting

### Database Connection Error
**Error**: "Database connection not available"
**Solution**: Verify DATABASE_URL environment variable is set in Vercel

### Asset Not Saving
**Error**: "Failed to save asset"
**Solution**: 
1. Check browser console for error details
2. Verify API endpoint is responding: `https://guries.vercel.app/api/v1/assetLibrary`
3. Check Vercel function logs

### Data Lost After Redeploy
**Cause**: Using in-memory storage instead of database
**Solution**: Ensure DATABASE_URL is set and API is using PostgreSQL

## Performance Optimization

- API responses cached in browser
- Optimistic UI updates for better UX
- Lazy loading of assets
- Connection pooling for database

## Security

- CORS headers configured
- SSL/TLS for database connection
- Environment variables for sensitive data
- Input validation on API endpoints

## Monitoring

Check Vercel dashboard for:
- Function execution logs
- Error rates
- Response times
- Database connection status

## Next Steps

1. Add authentication (JWT tokens)
2. Implement role-based access control
3. Add more API endpoints for other resources
4. Set up automated backups
5. Configure CDN for static assets
