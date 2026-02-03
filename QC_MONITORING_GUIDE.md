# QC Workflow - Monitoring & Debugging Guide

**Quick Reference for Monitoring QC Workflow in Production**

---

## Real-Time Monitoring

### Browser Console Filters

**Monitor Auto-Refresh:**
```javascript
// Filter for auto-refresh logs
// Look for: [useData] Refreshing assetLibrary
// Should appear every 3 seconds
```

**Monitor QC Actions:**
```javascript
// Filter for QC action logs
// Look for: [QCReviewPage] Immediate refresh after
// Look for: [QCReviewPage] Delayed refresh after
```

**Monitor API Calls:**
```javascript
// Open Network tab
// Filter for: assetLibrary
// Should see GET requests every 3 seconds
// Should see POST requests when QC actions happen
```

---

## Key Metrics to Monitor

### 1. Auto-Refresh Frequency
**Expected:** One refresh every 3 seconds  
**Check:** Console logs show `[useData] Refreshing assetLibrary`

### 2. QC Action Response Time
**Expected:** Status updates within 1 second  
**Check:** Time between QC action and status change in UI

### 3. API Call Success Rate
**Expected:** 100% success (200 status)  
**Check:** Network tab shows no 4xx or 5xx errors

### 4. Data Consistency
**Expected:** Asset library matches QC review data  
**Check:** Same asset status in both views

---

## Common Issues & Solutions

### Issue 1: Auto-Refresh Not Happening
**Symptoms:**
- Console doesn't show refresh logs
- Data doesn't update
- Network tab shows no API calls

**Diagnosis:**
1. Check if backend is running
2. Check if API endpoint is accessible
3. Check browser console for errors
4. Check network tab for failed requests

**Solution:**
1. Restart backend server
2. Check API URL in environment variables
3. Clear browser cache and reload
4. Check backend logs for errors

---

### Issue 2: QC Status Not Updating
**Symptoms:**
- Approve button clicked but status doesn't change
- Asset still appears in pending list
- No success message

**Diagnosis:**
1. Check if QC action API call succeeded
2. Check if refresh is happening after action
3. Check if asset data is being updated

**Solution:**
1. Check network tab for POST request status
2. Check console for refresh logs
3. Verify backend updated the asset
4. Try manual refresh (F5)

---

### Issue 3: Slow Status Updates
**Symptoms:**
- Status takes more than 1 second to update
- Noticeable delay after QC action
- User has to wait for changes

**Diagnosis:**
1. Check network latency
2. Check if refresh is happening
3. Check if API is slow

**Solution:**
1. Check network tab for request duration
2. Verify backend performance
3. Check if database queries are slow
4. Consider reducing refresh interval

---

### Issue 4: High API Call Frequency
**Symptoms:**
- Too many API calls in network tab
- High bandwidth usage
- Backend getting overloaded

**Diagnosis:**
1. Check if refresh interval is too short
2. Check if multiple refreshes are happening
3. Check if refresh is being called multiple times

**Solution:**
1. Increase refresh interval (currently 3s)
2. Check for duplicate refresh calls
3. Verify no infinite loops
4. Monitor backend load

---

## Performance Optimization

### Current Settings
- **Auto-refresh interval:** 3 seconds
- **QC action immediate refresh:** 0ms delay
- **QC action delayed refresh:** 300ms delay
- **API timeout:** 8 seconds

### Tuning Options

**If API is slow:**
- Increase refresh interval to 5 seconds
- Increase API timeout to 10 seconds
- Check backend database performance

**If bandwidth is high:**
- Increase refresh interval to 5-10 seconds
- Implement smart refresh (only if data changed)
- Use compression for API responses

**If users want faster updates:**
- Decrease refresh interval to 2 seconds
- Implement WebSocket for real-time updates
- Use server-sent events (SSE)

---

## Debugging Commands

### Check Auto-Refresh in Console
```javascript
// Run in browser console to see refresh logs
console.log('Monitoring auto-refresh...');
setInterval(() => {
  console.log('Auto-refresh cycle at', new Date().toLocaleTimeString());
}, 3000);
```

### Monitor QC Actions
```javascript
// Listen for QC events
window.addEventListener('assetQCApproved', (e) => {
  console.log('Asset approved:', e.detail);
});

window.addEventListener('assetQCRejected', (e) => {
  console.log('Asset rejected:', e.detail);
});

window.addEventListener('assetQCRework', (e) => {
  console.log('Asset rework requested:', e.detail);
});
```

### Check API Response Format
```javascript
// Fetch asset library and check response format
fetch('/api/v1/assetLibrary')
  .then(r => r.json())
  .then(data => {
    console.log('Response type:', Array.isArray(data) ? 'Array' : 'Object');
    console.log('Response data:', data);
  });
```

---

## Production Checklist

- [ ] Auto-refresh logs appear every 3 seconds
- [ ] QC action logs appear immediately after action
- [ ] Status updates within 1 second
- [ ] No console errors
- [ ] No network errors (4xx, 5xx)
- [ ] API response format is correct
- [ ] Asset library matches QC review data
- [ ] No memory leaks (check DevTools Memory tab)
- [ ] No CPU spikes (check DevTools Performance tab)
- [ ] Backend logs show successful updates

---

## Quick Troubleshooting Flow

```
Issue: Status not updating after QC action

1. Check console for errors
   ↓
2. Check network tab for failed requests
   ↓
3. Check if refresh logs appear
   ↓
4. Check if backend updated the asset
   ↓
5. Try manual refresh (F5)
   ↓
6. Check backend logs
   ↓
7. Restart backend if needed
```

---

## Support Resources

- **QC Workflow Documentation:** `QC_WORKFLOW_VERIFICATION_FINAL.md`
- **Implementation Details:** `QC_WORKFLOW_FINAL_FIX_SUMMARY.md`
- **Quick Reference:** `QC_QUICK_REFERENCE.md`
- **Backend Logs:** Check `backend/logs/` directory
- **Frontend Console:** Open DevTools (F12) → Console tab

---

## Contact & Escalation

**For Issues:**
1. Check this guide first
2. Review console logs
3. Check network tab
4. Review backend logs
5. Contact development team if issue persists

---

**Last Updated:** February 3, 2026  
**Version:** 1.0.0  
**Status:** Production Ready

