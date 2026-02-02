# Quick Start - Service-Asset Linking & QC Workflow

## 5-Minute Setup

### 1. Run Database Migration
```bash
cd backend
node migrations/add-service-asset-linking.js
```

### 2. Build Backend
```bash
npm run build:backend
```

### 3. Build Frontend
```bash
npm run build:frontend
```

### 4. Start Services
```bash
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev:frontend
```

### 5. Test
```bash
# Terminal 3
npm run test:deployment
```

---

## What Was Implemented

✅ **Service-Asset Linking** - Static links between assets and services  
✅ **Asset Upload Form** - Upload assets with service selection  
✅ **QC Workflow Fixes** - Correct status updates on approval  
✅ **Workflow Status Display** - Badges showing asset status  
✅ **URL Slug Auto-Generation** - No manual slug entry needed  
✅ **Auto-Linking** - Assets automatically linked during upload  

---

## Key Files

### Backend
- `backend/controllers/assetUploadController.ts` - Asset upload logic
- `backend/controllers/qcReviewController.ts` - QC approval/rejection
- `backend/routes/assetUpload.ts` - Upload routes
- `backend/migrations/add-service-asset-linking.js` - Database setup

### Frontend
- `frontend/components/AssetUploadWithServiceLink.tsx` - Upload form
- `frontend/components/AssetWorkflowStatusBadge.tsx` - Status display
- `frontend/components/AssetWorkflowStatusInline.tsx` - Inline status

---

## API Endpoints

### Upload Asset with Service Link
```
POST /api/v1/assets/upload-with-service
```

### Approve Asset
```
POST /api/v1/qc-review/assets/:id/approve
```

### Reject Asset
```
POST /api/v1/qc-review/assets/:id/reject
```

### Get Pending QC Assets
```
GET /api/v1/qc-review/pending
```

---

## Testing

```bash
# Run all tests
npm run test:backend
npm run test:frontend
npm run test:deployment
```

---

## Troubleshooting

### Migration fails
- Check database path
- Verify database file exists
- Check file permissions

### Routes not found
- Verify routes registered in api.ts
- Check import statements
- Restart backend server

### Asset upload fails
- Check required fields
- Verify service exists
- Check database connection

---

## Documentation

- `DEPLOY_GUIDE.md` - Full deployment guide
- `IMPLEMENTATION_STATUS.md` - Implementation details
- Code comments in all files

---

## Support

For issues:
1. Check DEPLOY_GUIDE.md
2. Review code comments
3. Check test files
4. Review error logs

---

**Status**: ✅ Ready for Production
