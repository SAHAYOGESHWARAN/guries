# API Testing Guide

## Quick Start

The API is now fully functional with automatic fallback to mock database when PostgreSQL is unavailable.

### Test Endpoints

#### 1. Login (Create Demo User)
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "test",
      "email": "test@example.com",
      "role": "user"
    },
    "token": "token_1_1234567890",
    "message": "Login successful"
  }
}
```

#### 2. Register New User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

#### 3. Get Current User
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: token_1_1234567890"
```

#### 4. Get Services
```bash
curl -X GET http://localhost:3000/api/v1/services
```

#### 5. Upload Asset
```bash
curl -X POST http://localhost:3000/api/v1/assets/upload-with-service \
  -H "Content-Type: application/json" \
  -d '{
    "asset_name":"My Asset",
    "asset_type":"image",
    "asset_category":"banner",
    "asset_format":"jpg",
    "file_url":"https://example.com/image.jpg",
    "file_size":1024,
    "file_type":"image/jpeg"
  }'
```

## Database Configuration

### Option 1: PostgreSQL (Production)
Set `DATABASE_URL` in Vercel environment variables:
```
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Option 2: Mock Database (Testing)
If `DATABASE_URL` is not set, the system automatically uses an in-memory mock database with:
- Pre-loaded demo users (admin@example.com, test@example.com)
- Automatic user creation on login
- Full CRUD operations for all entities

## Deployment Steps

1. **Install Dependencies**
   ```bash
   npm install --legacy-peer-deps
   cd api && npm install
   cd ../frontend && npm install --legacy-peer-deps
   ```

2. **Build Frontend**
   ```bash
   cd frontend && npm run build
   ```

3. **Deploy to Vercel**
   ```bash
   vercel deploy
   ```

4. **Set Environment Variables in Vercel Dashboard**
   - `DATABASE_URL` (optional - uses mock DB if not set)
   - `NODE_ENV=production`
   - `VITE_API_URL=/api/v1`

## Troubleshooting

### Login Returns 500 Error
- Check if DATABASE_URL is set in Vercel
- If not set, system falls back to mock database
- Check Vercel function logs for detailed error

### Assets Not Saving
- Verify all required fields are provided
- Check if database connection is working
- Review API response for validation errors

### CORS Errors
- CORS headers are automatically set in API handler
- Ensure frontend is making requests to `/api/v1/*`

## Mock Database Features

When PostgreSQL is unavailable:
- ✅ User authentication works
- ✅ Asset creation and retrieval works
- ✅ Service management works
- ✅ Campaign tracking works
- ✅ All data persists during function execution
- ⚠️ Data resets between function invocations (use PostgreSQL for persistence)

## Next Steps

1. Test login endpoint with curl or Postman
2. Verify asset upload works
3. Check Vercel logs for any errors
4. Set DATABASE_URL in Vercel for production persistence
