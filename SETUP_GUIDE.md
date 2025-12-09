# Setup Guide - Marketing Control Center

## Current Status

✅ **Frontend**: Running on http://localhost:5174/
✅ **SMM Preview**: Fixed and working (Title, Tag, URL fields removed)
❌ **Backend**: Requires PostgreSQL database

## What Was Fixed

1. **Removed SMM Fields**: Title, Tag, and URL fields have been removed from the Social Media Platform section
2. **Preview Modal**: Updated to work without the removed fields
3. **Demo Data**: Cleaned up to match the new structure

## To Fix Backend Connection Errors

The errors you're seeing (`ERR_CONNECTION_REFUSED:3001`) are because PostgreSQL is not installed or running.

### Option 1: Install PostgreSQL (Recommended for Full Functionality)

1. **Download PostgreSQL**:
   - Visit: https://www.postgresql.org/download/windows/
   - Download the installer for Windows
   - Run the installer

2. **During Installation**:
   - Set password for postgres user (remember this!)
   - Default port: 5432
   - Install pgAdmin (optional but helpful)

3. **Update Backend Configuration**:
   - Edit `backend/.env` file
   - Update `DB_PASSWORD` with your postgres password

4. **Setup Database**:
   ```bash
   cd backend
   node setup-database.js
   ```

5. **Start Backend**:
   ```bash
   cd backend
   npm start
   ```

### Option 2: Use Frontend Only (Limited Functionality)

The frontend will work for UI testing and preview functionality, but you won't be able to:
- Save assets to database
- Load existing assets
- Use real-time features

**Current Frontend URL**: http://localhost:5174/

## Testing the SMM Preview

1. Open http://localhost:5174/ in your browser
2. Navigate to the Assets view
3. Click "Upload Asset"
4. Select "Social Media Marketing" as Application Type
5. Choose a platform (Facebook/Instagram, Twitter, or LinkedIn)
6. Fill in Description, Hashtags, and upload media
7. Click "Preview Post" to see the preview modal

The preview will now work correctly without Title, Tag, and URL fields!

## Next Steps

1. **Install PostgreSQL** if you need full backend functionality
2. **Test the preview** - it should work perfectly now
3. **The connection errors** will disappear once PostgreSQL is running

## Quick Commands

```bash
# Frontend only
npm run dev:client

# Full stack (requires PostgreSQL)
npm run dev

# Backend only
cd backend && npm start
```

## Need Help?

- PostgreSQL not installing? Try Docker: `docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres`
- Preview not working? Check browser console for specific errors
- Port conflicts? The frontend will automatically use the next available port
