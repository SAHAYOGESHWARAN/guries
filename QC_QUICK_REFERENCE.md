# QC Workflow - Quick Reference Guide

## 🚀 Quick Start (2 minutes)

### For QC Reviewers
1. Open QC Review page
2. See pending assets in list
3. Click "Review" on any asset
4. Enter QC Score (0-100)
5. Add remarks (optional for approval)
6. Click "✅ Approve" / "🔄 Rework" / "❌ Reject"
7. Asset disappears from pending list
8. Asset Library updates automatically

### For Asset Managers
1. Open Asset Library
2. Look for "QC Status" column
3. See status: "Approved", "Pending", "Rejected", "Rework"
4. Workflow Stage shows: "Published", "Add", "QC", etc.
5. Status badge shows color-coded status
6. Auto-refresh every 10 seconds

---

## 📊 Status Meanings

| Status | Color | Meaning |
|--------|-------|---------|
| Approved | 🟢 Green | Asset passed QC, ready to use |
| Pending | 🟡 Yellow | Waiting for QC review |
| Rejected | 🔴 Red | Asset failed QC, cannot use |
| Rework | 🟠 Orange | Needs changes, resubmit for QC |

---

## 🔄 Workflow Stages

| Stage | Emoji | Meaning |
|-------|-------|---------|
| Add | 📝 | Asset created, not submitted |
| Submit | 📤 | Asset submitted for QC |
| Sent to QC | 📨 | Asset in QC queue |
| QC | 🔍 | Asset being reviewed |
| Approve | ✔️ | Asset approved by QC |
| Publish | 🚀 | Asset published |
| Published | 🚀 | Asset is live |
| In Progress | ⏳ | Asset being worked on |
| In Rework | 🔄 | Asset needs rework |
| Moved to CW | ✍️ | Assigned to Content Writer |
| Moved to GD | 🎨 | Assigned to Graphic Designer |
| Moved to WD | 💻 | Assigned to Web Developer |

---

## 🎯 Key Features

### Auto-Refresh
- Asset Library updates every 10 seconds
- No manual refresh needed
- Real-time status visibility

### Manual Refresh
- Click refresh button after QC action
- Immediate update
- Combines with auto-refresh

### QC Statistics
- Pending count
- Approved count
- Rejected count
- Rework count
- Approval rate %
- Average QC score

---

## 📱 API Endpoints

### Get Pending Assets
```
GET /api/v1/qc-review/pending?status=Pending&limit=50
```

### Approve Asset
```
POST /api/v1/qc-review/approve
{
  "asset_id": 1,
  "qc_remarks": "Approved",
  "qc_score": 85
}
```

### Reject Asset
```
POST /api/v1/qc-review/reject
{
  "asset_id": 1,
  "qc_remarks": "Needs improvement",
  "qc_score": 60
}
```

### Request Rework
```
POST /api/v1/qc-review/rework
{
  "asset_id": 1,
  "qc_remarks": "Please revise",
  "qc_score": 70
}
```

### Get Statistics
```
GET /api/v1/qc-review/statistics
```

---

## 🐛 Troubleshooting

### Asset not updating?
- Check browser console (F12)
- Verify API is running
- Try manual refresh
- Wait 10 seconds for auto-refresh

### Too many API calls?
- Refresh interval is 10 seconds (normal)
- Check network tab (F12)
- Close extra browser tabs
- Restart browser if needed

### QC status not showing?
- Check column visibility toggle
- Verify asset has qc_status value
- Refresh page
- Check browser console for errors

---

## 📋 Checklist

### Before Approving Asset
- [ ] Asset name is clear
- [ ] Type and category are correct
- [ ] SEO score is acceptable
- [ ] Grammar score is acceptable
- [ ] Content is complete
- [ ] No broken links
- [ ] Metadata is complete

### After Approving Asset
- [ ] Success message appears
- [ ] Asset disappears from pending list
- [ ] Asset Library updates
- [ ] Status shows "Approved"
- [ ] Workflow stage shows "Published"

---

## ⚡ Performance Tips

1. **Keep browser updated** - Better performance
2. **Close extra tabs** - Reduces API calls
3. **Use Chrome/Firefox** - Better compatibility
4. **Clear cache** - If issues occur
5. **Restart browser** - If slow

---

## 📞 Support

### Documentation
- `QC_WORKFLOW_VERIFICATION.md` - Technical details
- `QC_WORKFLOW_TEST_SCRIPT.md` - Testing guide
- `QC_WORKFLOW_COMPLETE_SUMMARY.md` - Complete info
- `IMPLEMENTATION_COMPLETE.md` - Deployment info

### Quick Help
1. Check browser console (F12)
2. Check network tab (F12)
3. Verify API is running
4. Try manual refresh
5. Restart browser

---

## 🎓 Learning Resources

### For QC Reviewers
- Learn status meanings (see Status Meanings section)
- Understand workflow stages (see Workflow Stages section)
- Practice with test assets
- Review QC guidelines

### For Developers
- Read `QC_WORKFLOW_VERIFICATION.md`
- Check API endpoints (see API Endpoints section)
- Review database schema
- Test with cURL or Postman

---

## 📊 Metrics to Monitor

### QC Performance
- Pending count (should decrease)
- Approval rate (should be high)
- Average QC score (should be consistent)
- Rework count (should be low)

### System Performance
- API response time (should be <300ms)
- Auto-refresh interval (should be 10s)
- No console errors
- No excessive API calls

---

## 🔐 Security Notes

- Only QC reviewers can approve assets
- All actions are logged
- Audit trail available
- No data loss on rejection
- Rework preserves asset history

---

## 💡 Pro Tips

1. **Batch Review** - Review multiple assets at once
2. **Use Remarks** - Always add remarks for rejection/rework
3. **Check Stats** - Monitor approval rate
4. **Set Score** - Use consistent scoring
5. **Track Rework** - Monitor rework count

---

## 🚀 Next Steps

1. **Try It Out** - Approve a test asset
2. **Monitor** - Watch auto-refresh work
3. **Explore** - Check all features
4. **Provide Feedback** - Report issues
5. **Optimize** - Adjust settings as needed

---

**Last Updated:** February 3, 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
