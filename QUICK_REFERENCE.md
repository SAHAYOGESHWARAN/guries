# Quick Reference Card

## Production URL
**https://guries.vercel.app**

---

## API Base URL
**https://guries.vercel.app/api/v1**

---

## Quick Test Commands

### 1. Login (Creates Demo User)
```bash
curl -X POST https://guries.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. Get Services
```bash
curl -X GET https://guries.vercel.app/api/v1/services
```

### 3. Upload Asset
```bash
curl -X POST https://guries.vercel.app/api/v1/assets/upload-with-service \
  -H "Content-Type: application/json" \
  -d '{
    "asset_name":"Test Asset",
    "asset_type":"image",
    "asset_category":"banner",
    "asset_format":"jpg",
    "file_url":"https://example.com/image.jpg",
    "file_size":1024,
    "file_type":"image/jpeg"
  }'
```

### 4. Get QC Pending
```bash
curl -X GET https://guries.vercel.app/api/v1/qc-review/pending
```

---

## Database Configuration

### PostgreSQL (Optional)
1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Add: `DATABASE_URL=postgresql://...`
4. Redeploy

### Mock Database (Default)
- No setup needed
- Automatic fallback
- Perfect for testing

---

## Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /auth/login | User login |
| POST | /auth/register | User registration |
| GET | /auth/me | Get current user |
| GET | /services | List services |
| POST | /assets/upload-with-service | Upload asset |
| GET | /qc-review/pending | Get pending QC items |
| POST | /qc-review/approve | Approve QC item |
| POST | /qc-review/reject | Reject QC item |
| GET | /campaigns | List campaigns |

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (validation error) |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 500 | Server error |

---

## Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "validationErrors": ["field1 is required", "field2 is invalid"],
  "message": "Detailed error message"
}
```

---

## Success Response Format

```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "token_...",
    "message": "Success message"
  }
}
```

---

## Demo Users

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | any | admin |
| test@example.com | any | user |

*Note: Any email will create a demo user on first login*

---

## Vercel Dashboard
https://vercel.com/sahayogeshwarans-projects/guries

---

## Documentation Files

- **DEPLOYMENT_READY.md** - Complete deployment guide
- **API_TEST_GUIDE.md** - API testing instructions
- **FINAL_DEPLOYMENT_SUMMARY.md** - Deployment summary
- **QUICK_REFERENCE.md** - This file

---

## Key Features

✅ 25+ API endpoints  
✅ Automatic database fallback  
✅ Comprehensive error handling  
✅ CORS support  
✅ Mock database for testing  
✅ PostgreSQL for production  

---

## Support

1. Check Vercel logs
2. Review API response
3. Test with mock database
4. Add DATABASE_URL for PostgreSQL
5. Redeploy if needed

---

**Status: LIVE** 🚀  
**URL: https://guries.vercel.app**
