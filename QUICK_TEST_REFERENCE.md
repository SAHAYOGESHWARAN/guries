# Quick Test Reference Guide
## Guires Marketing Control Center
**Date**: March 3, 2026

---

## Quick Links

- **Application:** https://guries.vercel.app
- **API Base URL:** https://guries.vercel.app/api/v1
- **Test Documents:**
  - E2E_TEST_REPORT.md
  - API_TEST_SCRIPT.md
  - UI_TESTING_GUIDE.md
  - TESTING_CHECKLIST.md
  - TESTING_EXECUTION_SUMMARY.md

---

## 5-Minute Quick Test

### 1. Login (1 min)
```
1. Go to https://guries.vercel.app
2. Enter email: test@example.com
3. Enter password: TestPassword123!
4. Click Login
5. Verify dashboard loads
```

### 2. Asset Category Master (2 min)
```
1. Click "Asset Category Master" in sidebar
2. Click "Add Asset Category"
3. Fill form:
   - Brand: Pubrica
   - Category Name: Quick Test
   - Word Count: 100
4. Click Save
5. Verify new category appears in table
```

### 3. Search & Filter (1 min)
```
1. Type "Quick" in search box
2. Verify table filters
3. Select brand filter
4. Verify table updates
```

### 4. Edit & Delete (1 min)
```
1. Click Edit on "Quick Test" category
2. Change name to "Quick Test Updated"
3. Click Save
4. Click Delete
5. Confirm deletion
6. Verify category removed
```

---

## API Quick Test (Using Postman or curl)

### Get All Asset Categories
```bash
curl -X GET https://guries.vercel.app/api/v1/asset-category-master
```

### Create Asset Category
```bash
curl -X POST https://guries.vercel.app/api/v1/asset-category-master \
  -H "Content-Type: application/json" \
  -d '{
    "category_name": "Test Category",
    "description": "Test Description"
  }'
```

### Update Asset Category
```bash
curl -X PUT https://guries.vercel.app/api/v1/asset-category-master/1 \
  -H "Content-Type: application/json" \
  -d '{
    "category_name": "Updated Category",
    "status": "active"
  }'
```

### Delete Asset Category
```bash
curl -X DELETE https://guries.vercel.app/api/v1/asset-category-master/1
```

---

## Browser DevTools Quick Check

### Network Tab
```
1. Open DevTools (F12)
2. Go to Network tab
3. Perform any action
4. Check:
   - Status codes (200, 201, 204, 400, 404, 500)
   - Response time (< 1000ms)
   - No CORS errors
```

### Console Tab
```
1. Open DevTools (F12)
2. Go to Console tab
3. Perform any action
4. Check:
   - No red errors
   - No warnings
   - No undefined references
```

### Performance Tab
```
1. Open DevTools (F12)
2. Go to Performance tab
3. Click record
4. Reload page
5. Stop recording
6. Check:
   - Load time < 3 seconds
   - FCP < 1.5 seconds
   - LCP < 2.5 seconds
```

---

## Common Test Scenarios

### Scenario 1: Complete CRUD Cycle (5 min)
```
1. CREATE: Add new asset category
2. READ: View in table
3. UPDATE: Edit category
4. DELETE: Remove category
5. VERIFY: Refresh page, confirm deletion
```

### Scenario 2: Form Validation (3 min)
```
1. Open create form
2. Try submit empty form → Verify error
3. Fill required fields
4. Try invalid email → Verify error
5. Fill valid data
6. Submit → Verify success
```

### Scenario 3: Data Persistence (3 min)
```
1. Create record
2. Refresh page (F5)
3. Verify record exists
4. Edit record
5. Refresh page
6. Verify changes persist
```

### Scenario 4: API Integration (3 min)
```
1. Open Network tab
2. Create record
3. Check POST request → Status 201
4. Check response contains new record
5. Verify record appears in UI
```

---

## Test Data

### Login Credentials
```
Email: test@example.com
Password: TestPassword123!
```

### Asset Category Test Data
```
Brand: Pubrica
Category Name: Test Category
Word Count: 500
Status: active
```

### Asset Test Data
```
Asset Name: Test Asset
Asset Type: image
Asset Category: Web Assets
Asset Format: PNG
Status: active
```

### Service Test Data
```
Service Name: Test Service
Description: Test Description
Status: active
```

### Keyword Test Data
```
Keyword: test keyword
Status: active
```

---

## Expected Status Codes

| Operation | Status Code | Meaning |
|-----------|-------------|---------|
| GET | 200 | Success |
| POST | 201 | Created |
| PUT | 200 | Updated |
| DELETE | 200 or 204 | Deleted |
| Bad Request | 400 | Invalid input |
| Unauthorized | 401 | Not authenticated |
| Forbidden | 403 | Not authorized |
| Not Found | 404 | Resource not found |
| Server Error | 500 | Server error |

---

## Performance Targets

| Metric | Target | Acceptable |
|--------|--------|-----------|
| Page Load | < 2s | < 3s |
| API GET | < 500ms | < 1s |
| API POST | < 1s | < 2s |
| Table Render | < 1s | < 2s |
| Search | < 500ms | < 1s |

---

## Checklist: Before Declaring "PASS"

- [ ] All pages load without errors
- [ ] All CRUD operations work
- [ ] All forms validate correctly
- [ ] All API calls succeed
- [ ] Data persists after refresh
- [ ] No console errors
- [ ] No network errors
- [ ] Responsive on mobile
- [ ] Accessible with keyboard
- [ ] Performance acceptable

---

## Checklist: Before Declaring "FAIL"

- [ ] Critical functionality broken
- [ ] Data loss occurring
- [ ] Security issue found
- [ ] Multiple pages not loading
- [ ] API endpoints not responding
- [ ] Database connection failed
- [ ] CORS blocking requests
- [ ] Authentication broken

---

## Quick Troubleshooting

### Issue: Tables appear empty
**Check:**
1. Network tab - API returning data?
2. Console - Any errors?
3. Backend - Is it running?
4. Database - Has data?

### Issue: Form won't submit
**Check:**
1. Console - Validation errors?
2. Network - POST request sent?
3. Form - All required fields filled?
4. Validation - Any error messages?

### Issue: Page won't load
**Check:**
1. URL - Correct?
2. Network - 404 or 500 error?
3. Console - JavaScript errors?
4. Backend - Running?

### Issue: Data not saving
**Check:**
1. Network - POST/PUT status 200/201?
2. Database - Connection working?
3. Console - Any errors?
4. Validation - Data valid?

### Issue: CORS error
**Check:**
1. Backend - CORS configured?
2. Origin - In allowed list?
3. Headers - Content-Type correct?
4. Credentials - Sent correctly?

---

## Quick Performance Check

### Page Load Time
```
1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Check "Finish" time
5. Should be < 3 seconds
```

### API Response Time
```
1. Open DevTools (F12)
2. Go to Network tab
3. Perform action
4. Click API request
5. Check "Time" column
6. Should be < 1 second
```

### Lighthouse Score
```
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Click "Analyze page load"
4. Check scores:
   - Performance > 80
   - Accessibility > 80
   - Best Practices > 80
```

---

## Test Execution Checklist

### Pre-Test
- [ ] Browser updated
- [ ] DevTools available
- [ ] Test data prepared
- [ ] Backend running
- [ ] Database connected

### During Test
- [ ] Monitor Network tab
- [ ] Check Console for errors
- [ ] Verify API responses
- [ ] Check data in database
- [ ] Document issues

### Post-Test
- [ ] Summarize results
- [ ] Log issues
- [ ] Verify fixes
- [ ] Sign off
- [ ] Archive results

---

## Key Metrics to Track

### Functionality
- [ ] CRUD operations: ___/4 working
- [ ] Forms: ___/10 validating
- [ ] Pages: ___/20 loading
- [ ] API endpoints: ___/30 responding

### Quality
- [ ] Console errors: _____
- [ ] Network errors: _____
- [ ] Failed tests: _____
- [ ] Pass rate: _____%

### Performance
- [ ] Avg page load: _____ ms
- [ ] Avg API response: _____ ms
- [ ] Slowest page: _____
- [ ] Slowest API: _____

---

## Sign-Off Template

```
Test Date: March 3, 2026
Tester: Kiro E2E Testing Agent
Duration: _____ hours

Results:
- Total Tests: _____
- Passed: _____
- Failed: _____
- Pass Rate: _____%

Status: [ ] PASS [ ] FAIL [ ] PARTIAL

Issues Found:
1. _____________________
2. _____________________
3. _____________________

Recommendations:
1. _____________________
2. _____________________

Signature: _____________________
Date: _____________________
```

---

## Resources

### Documentation
- API Docs: https://guries.vercel.app/api/docs
- User Guide: https://guries.vercel.app/docs
- Admin Guide: https://guries.vercel.app/admin/docs

### Tools
- Postman: https://www.postman.com
- DevTools: Built into browser (F12)
- Lighthouse: Built into Chrome DevTools
- WAVE: https://wave.webaim.org

### Support
- QA Team: qa@guries.com
- Slack: #qa-testing
- Issues: https://github.com/guries/issues

---

**Last Updated:** March 3, 2026  
**Version:** 1.0

