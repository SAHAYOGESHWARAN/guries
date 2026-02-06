# E2E TESTING EXECUTION GUIDE

**Application:** Guires Marketing Control Center  
**URL:** https://guries.vercel.app  
**Date:** February 6, 2026  
**Tester:** QA Team

---

## QUICK START

### Step 1: Access the Application
```
1. Open browser (Chrome, Firefox, Safari, Edge)
2. Navigate to: https://guries.vercel.app
3. Wait for loading screen to complete
4. Verify dashboard or login page displays
```

### Step 2: Login
```
Email: admin@example.com
Password: [Check .env.production file]
Role: admin
```

### Step 3: Start Testing
- Follow test cases in order
- Document results
- Report issues immediately

---

## PHASE 1: SMOKE TESTING (1 hour)

### Objective
Verify the application loads and basic functionality works.

### Test Cases

#### 1.1 Application Load
```
Steps:
1. Open https://guries.vercel.app in browser
2. Wait for page to load (max 5 seconds)
3. Check browser console for errors

Expected:
✓ Page loads without errors
✓ Loading screen appears
✓ Dashboard or login page displays
✓ No console errors

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

#### 1.2 Login Functionality
```
Steps:
1. If not logged in, click "Login"
2. Enter email: admin@example.com
3. Enter password: [from .env]
4. Click "Login" button
5. Wait for redirect

Expected:
✓ Login form displays
✓ Form accepts input
✓ Login succeeds
✓ Redirects to dashboard
✓ User info displays in header

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

#### 1.3 Navigation
```
Steps:
1. Click on "Dashboard" in sidebar
2. Click on "Assets" in sidebar
3. Click on "QC Review" in sidebar
4. Click on "Projects" in sidebar
5. Click on "Settings" in sidebar

Expected:
✓ All pages load without errors
✓ Content displays correctly
✓ No broken links
✓ Navigation is responsive

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

#### 1.4 Logout
```
Steps:
1. Click user profile icon (top right)
2. Click "Logout"
3. Verify redirect to login page

Expected:
✓ Logout succeeds
✓ Redirects to login page
✓ Session cleared

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

---

## PHASE 2: FUNCTIONAL TESTING (4 hours)

### Objective
Test all core features and workflows.

### 2.1 Asset Management

#### 2.1.1 Create Asset
```
Steps:
1. Navigate to Assets page
2. Click "Create Asset" button
3. Fill in form:
   - Asset Name: "Test Asset 001"
   - Asset Type: "Web Asset"
   - Asset Category: "Content"
   - Asset Format: "PDF"
   - Description: "Test asset for QC workflow"
4. Click "Save" button

Expected:
✓ Form validates required fields
✓ Asset created successfully
✓ Asset appears in list
✓ Asset has unique ID
✓ Timestamp recorded

Result: [ ] PASS [ ] FAIL
Asset ID: ________________
Notes: _______________________________________________
```

#### 2.1.2 Edit Asset
```
Steps:
1. Click on created asset
2. Click "Edit" button
3. Change Asset Name to "Test Asset 001 - Updated"
4. Click "Save" button

Expected:
✓ Asset opens in edit mode
✓ Changes saved successfully
✓ Updated name displays in list
✓ Updated timestamp recorded

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

#### 2.1.3 View Asset Details
```
Steps:
1. Click on asset in list
2. View asset details page

Expected:
✓ All asset information displays
✓ Metadata shows correctly
✓ File URL displays
✓ Keywords display
✓ Status shows correctly

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

#### 2.1.4 Delete Asset
```
Steps:
1. Click on asset
2. Click "Delete" button
3. Confirm deletion

Expected:
✓ Confirmation dialog appears
✓ Asset deleted successfully
✓ Asset removed from list
✓ No orphaned records

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

### 2.2 QC Workflow

#### 2.2.1 Submit Asset for QC
```
Steps:
1. Create new asset (see 2.1.1)
2. Click "Submit for QC" button
3. Confirm submission

Expected:
✓ Status changes to "QC Pending"
✓ Asset appears in QC pending list
✓ Notification sent to QC user
✓ Timestamp recorded

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

#### 2.2.2 View QC Pending Assets
```
Steps:
1. Navigate to QC Review page
2. View pending assets list

Expected:
✓ All pending assets display
✓ Asset details show correctly
✓ Pagination works (if > 50 assets)
✓ Filter by status works

Result: [ ] PASS [ ] FAIL
Count: ________________
Notes: _______________________________________________
```

#### 2.2.3 Approve Asset
```
Steps:
1. Open QC Review page
2. Select pending asset
3. Review checklist items
4. Click "Approve" button
5. Add remarks (optional)
6. Confirm approval

Expected:
✓ Asset status changes to "Approved"
✓ QC score recorded
✓ Remarks saved
✓ Notification sent to creator
✓ Audit log entry created

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

#### 2.2.4 Reject Asset
```
Steps:
1. Open QC Review page
2. Select pending asset
3. Click "Reject" button
4. Add rejection reason
5. Confirm rejection

Expected:
✓ Asset status changes to "Rejected"
✓ Reason recorded
✓ Notification sent to creator
✓ Audit log entry created
✓ Asset can be edited and resubmitted

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

#### 2.2.5 Request Rework
```
Steps:
1. Open QC Review page
2. Select pending asset
3. Click "Request Rework" button
4. Add rework instructions
5. Confirm request

Expected:
✓ Asset status changes to "Rework"
✓ Instructions recorded
✓ Notification sent to creator
✓ Rework count incremented
✓ Asset can be edited and resubmitted

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

#### 2.2.6 View QC History
```
Steps:
1. Open asset details
2. Click "QC History" tab
3. View all QC reviews

Expected:
✓ All QC reviews display
✓ Reviewer name shows
✓ Decision shows (approve/reject/rework)
✓ Remarks display
✓ Timestamps show

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

### 2.3 Asset Linking

#### 2.3.1 Link Asset to Service
```
Steps:
1. Open asset details
2. Click "Link to Service" button
3. Select service from dropdown
4. Click "Link" button

Expected:
✓ Asset linked to service
✓ Link appears in asset details
✓ Link appears in service details
✓ Linking status updates

Result: [ ] PASS [ ] FAIL
Service: ________________
Notes: _______________________________________________
```

#### 2.3.2 Link Asset to Sub-Service
```
Steps:
1. Open asset details
2. Click "Link to Sub-Service" button
3. Select sub-service from dropdown
4. Click "Link" button

Expected:
✓ Asset linked to sub-service
✓ Link appears in asset details
✓ Link appears in sub-service details
✓ Linking status updates

Result: [ ] PASS [ ] FAIL
Sub-Service: ________________
Notes: _______________________________________________
```

#### 2.3.3 Unlink Asset
```
Steps:
1. Open asset details
2. Click "Unlink" button next to service/sub-service
3. Confirm unlink

Expected:
✓ Link removed
✓ Link removed from both sides
✓ Linking status updates
✓ No orphaned records

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

### 2.4 Form Validation

#### 2.4.1 Required Fields
```
Steps:
1. Open Create Asset form
2. Leave required fields empty
3. Click "Save" button

Expected:
✓ Validation error appears
✓ Error message is clear
✓ Form not submitted
✓ User can correct and resubmit

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

#### 2.4.2 Field Format Validation
```
Steps:
1. Open Create Asset form
2. Enter invalid email in email field
3. Enter invalid URL in URL field
4. Click "Save" button

Expected:
✓ Format validation errors appear
✓ Error messages are clear
✓ Form not submitted
✓ User can correct and resubmit

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

---

## PHASE 3: INTEGRATION TESTING (2 hours)

### Objective
Test API endpoints and database operations.

### 3.1 API Endpoints

#### 3.1.1 Health Check
```
Steps:
1. Open browser developer tools (F12)
2. Go to Network tab
3. Navigate to application
4. Look for GET /api/health request

Expected:
✓ Request returns 200 status
✓ Response time < 100ms
✓ Response body contains status: "ok"

Result: [ ] PASS [ ] FAIL
Response Time: ________________
Notes: _______________________________________________
```

#### 3.1.2 Get Assets
```
Steps:
1. Open Network tab in DevTools
2. Navigate to Assets page
3. Look for GET /api/v1/assets request

Expected:
✓ Request returns 200 status
✓ Response time < 100ms
✓ Response contains asset array
✓ Pagination info included

Result: [ ] PASS [ ] FAIL
Response Time: ________________
Notes: _______________________________________________
```

#### 3.1.3 Create Asset
```
Steps:
1. Open Network tab in DevTools
2. Create new asset (see 2.1.1)
3. Look for POST /api/v1/assets request

Expected:
✓ Request returns 201 status
✓ Response time < 100ms
✓ Response contains created asset
✓ Asset ID assigned

Result: [ ] PASS [ ] FAIL
Response Time: ________________
Notes: _______________________________________________
```

#### 3.1.4 Update Asset
```
Steps:
1. Open Network tab in DevTools
2. Edit asset (see 2.1.2)
3. Look for PUT /api/v1/assets/:id request

Expected:
✓ Request returns 200 status
✓ Response time < 100ms
✓ Response contains updated asset
✓ Changes reflected in database

Result: [ ] PASS [ ] FAIL
Response Time: ________________
Notes: _______________________________________________
```

#### 3.1.5 Delete Asset
```
Steps:
1. Open Network tab in DevTools
2. Delete asset (see 2.1.4)
3. Look for DELETE /api/v1/assets/:id request

Expected:
✓ Request returns 200 status
✓ Response time < 100ms
✓ Asset removed from database
✓ No orphaned records

Result: [ ] PASS [ ] FAIL
Response Time: ________________
Notes: _______________________________________________
```

### 3.2 Database Operations

#### 3.2.1 Data Persistence
```
Steps:
1. Create asset with specific data
2. Refresh page
3. Navigate to asset

Expected:
✓ Asset data persists after refresh
✓ All fields display correctly
✓ No data loss
✓ Timestamps preserved

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

#### 3.2.2 Foreign Key Constraints
```
Steps:
1. Create asset linked to service
2. Try to delete service
3. Check if asset is protected

Expected:
✓ Service deletion prevented (if linked)
✓ Or asset link removed (if cascade delete)
✓ No orphaned records
✓ Data integrity maintained

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

#### 3.2.3 Cascading Deletes
```
Steps:
1. Create asset with QC reviews
2. Delete asset
3. Check if QC reviews deleted

Expected:
✓ Asset deleted
✓ Related QC reviews deleted
✓ No orphaned records
✓ Audit log preserved

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

---

## PHASE 4: PERFORMANCE TESTING (1 hour)

### Objective
Verify application performance meets targets.

### 4.1 Load Time Testing

#### 4.1.1 Initial Page Load
```
Steps:
1. Open DevTools (F12)
2. Go to Performance tab
3. Reload page
4. Wait for page to fully load
5. Check load time

Expected:
✓ Page loads within 3 seconds
✓ First Contentful Paint < 1.5s
✓ Largest Contentful Paint < 2.5s
✓ Cumulative Layout Shift < 0.1

Result: [ ] PASS [ ] FAIL
Load Time: ________________
FCP: ________________
LCP: ________________
CLS: ________________
Notes: _______________________________________________
```

#### 4.1.2 Dashboard Load
```
Steps:
1. Navigate to Dashboard
2. Measure load time

Expected:
✓ Dashboard loads within 2 seconds
✓ Charts render smoothly
✓ Data displays correctly
✓ No lag or delays

Result: [ ] PASS [ ] FAIL
Load Time: ________________
Notes: _______________________________________________
```

#### 4.1.3 Asset List Load
```
Steps:
1. Navigate to Assets page
2. Measure load time
3. Scroll through list

Expected:
✓ List loads within 2 seconds
✓ Pagination works smoothly
✓ No lag when scrolling
✓ Search/filter responsive

Result: [ ] PASS [ ] FAIL
Load Time: ________________
Notes: _______________________________________________
```

### 4.2 Bundle Size

#### 4.2.1 Check Bundle Size
```
Steps:
1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Check bundle sizes

Expected:
✓ Main bundle < 150KB (gzipped)
✓ Total assets < 250KB (gzipped)
✓ No unused code
✓ Code splitting working

Result: [ ] PASS [ ] FAIL
Main Bundle: ________________
Total Assets: ________________
Notes: _______________________________________________
```

### 4.3 Lighthouse Score

#### 4.3.1 Run Lighthouse Audit
```
Steps:
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Click "Analyze page load"
4. Wait for audit to complete

Expected:
✓ Performance score > 85
✓ Accessibility score > 90
✓ Best Practices score > 90
✓ SEO score > 90

Result: [ ] PASS [ ] FAIL
Performance: ________________
Accessibility: ________________
Best Practices: ________________
SEO: ________________
Notes: _______________________________________________
```

---

## PHASE 5: SECURITY TESTING (1 hour)

### Objective
Verify security measures are in place.

### 5.1 Authentication

#### 5.1.1 Invalid Credentials
```
Steps:
1. Go to login page
2. Enter invalid email
3. Enter invalid password
4. Click Login

Expected:
✓ Login fails
✓ Error message: "Invalid credentials"
✓ No sensitive info leaked
✓ Rate limiting applied

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

#### 5.1.2 Token Validation
```
Steps:
1. Login successfully
2. Open DevTools Console
3. Check localStorage for token
4. Verify token format

Expected:
✓ Token stored in localStorage
✓ Token is JWT format
✓ Token has expiration
✓ Token sent in Authorization header

Result: [ ] PASS [ ] FAIL
Token Format: ________________
Notes: _______________________________________________
```

#### 5.1.3 Unauthorized Access
```
Steps:
1. Logout
2. Try to access protected page directly
3. Check if redirected to login

Expected:
✓ Redirected to login page
✓ Session cleared
✓ No data exposed
✓ 401 error in API

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

### 5.2 Authorization

#### 5.2.1 Role-Based Access
```
Steps:
1. Login as regular user
2. Try to access Admin Console
3. Check if access denied

Expected:
✓ Access denied
✓ 403 error shown
✓ Redirected to dashboard
✓ No admin features visible

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

#### 5.2.2 QC Permission
```
Steps:
1. Login as regular user
2. Try to approve asset
3. Check if access denied

Expected:
✓ Access denied
✓ 403 error shown
✓ Approve button disabled
✓ No QC actions allowed

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

### 5.3 Input Validation

#### 5.3.1 SQL Injection Prevention
```
Steps:
1. Open Create Asset form
2. Enter SQL injection payload in name field:
   ' OR '1'='1
3. Click Save

Expected:
✓ Input sanitized
✓ No SQL error
✓ Asset created with literal string
✓ No database compromise

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

#### 5.3.2 XSS Prevention
```
Steps:
1. Open Create Asset form
2. Enter XSS payload in name field:
   <script>alert('XSS')</script>
3. Click Save
4. View asset

Expected:
✓ Script not executed
✓ Payload displayed as text
✓ No alert shown
✓ HTML escaped properly

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

### 5.4 CORS Configuration

#### 5.4.1 CORS Headers
```
Steps:
1. Open DevTools Network tab
2. Make API request
3. Check response headers

Expected:
✓ Access-Control-Allow-Origin header present
✓ Correct origin allowed
✓ Credentials allowed
✓ Methods allowed: GET, POST, PUT, DELETE

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

---

## PHASE 6: USER ACCEPTANCE TESTING (2 hours)

### Objective
Verify application meets business requirements.

### 6.1 Business Logic

#### 6.1.1 Asset Workflow
```
Steps:
1. Create asset
2. Submit for QC
3. Approve asset
4. Link to service
5. Verify asset published

Expected:
✓ Complete workflow succeeds
✓ Status changes correctly
✓ Notifications sent
✓ Asset available for use

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

#### 6.1.2 QC Workflow
```
Steps:
1. Submit asset for QC
2. Review asset
3. Approve/Reject/Rework
4. Verify status updated
5. Verify notification sent

Expected:
✓ QC workflow complete
✓ Status updated correctly
✓ Notification received
✓ Audit log recorded

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

#### 6.1.3 Asset Linking
```
Steps:
1. Create asset
2. Approve asset
3. Link to service
4. Link to sub-service
5. Verify linking active

Expected:
✓ Asset linked successfully
✓ Linking status active
✓ Asset available in service
✓ Asset available in sub-service

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

### 6.2 User Experience

#### 6.2.1 Ease of Use
```
Steps:
1. Complete asset creation workflow
2. Complete QC workflow
3. Complete linking workflow

Expected:
✓ Workflows intuitive
✓ Clear instructions
✓ Helpful error messages
✓ Minimal clicks required

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

#### 6.2.2 Data Accuracy
```
Steps:
1. Create asset with specific data
2. Submit for QC
3. Approve asset
4. Verify all data correct

Expected:
✓ All data preserved
✓ No data loss
✓ Timestamps accurate
✓ User info correct

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

#### 6.2.3 Notification System
```
Steps:
1. Submit asset for QC
2. Check notifications
3. Approve asset
4. Check notifications

Expected:
✓ Notifications sent
✓ Notifications clear
✓ Notifications timely
✓ Notifications actionable

Result: [ ] PASS [ ] FAIL
Notes: _______________________________________________
```

---

## ISSUE REPORTING

### Issue Template

```
Issue ID: _______________
Severity: [ ] Critical [ ] High [ ] Medium [ ] Low
Status: [ ] Open [ ] In Progress [ ] Resolved [ ] Closed

Title: _______________________________________________

Description:
_______________________________________________
_______________________________________________

Steps to Reproduce:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

Expected Result:
_______________________________________________

Actual Result:
_______________________________________________

Screenshots/Logs:
_______________________________________________

Environment:
- Browser: _______________________________________________
- OS: _______________________________________________
- URL: _______________________________________________

Assigned To: _______________________________________________
Date Reported: _______________________________________________
```

---

## TEST SUMMARY

### Test Execution Summary

| Phase | Test Cases | Passed | Failed | Pass Rate |
|-------|-----------|--------|--------|-----------|
| Smoke Testing | 4 | [ ] | [ ] | [ ]% |
| Functional Testing | 20 | [ ] | [ ] | [ ]% |
| Integration Testing | 8 | [ ] | [ ] | [ ]% |
| Performance Testing | 5 | [ ] | [ ] | [ ]% |
| Security Testing | 8 | [ ] | [ ] | [ ]% |
| UAT | 6 | [ ] | [ ] | [ ]% |
| **TOTAL** | **51** | **[ ]** | **[ ]** | **[ ]%** |

### Overall Result

- [ ] **PASS** - All tests passed, ready for production
- [ ] **PASS WITH NOTES** - Tests passed, minor issues noted
- [ ] **FAIL** - Critical issues found, needs fixes

### Sign-Off

**Tester Name:** _______________________________________________

**Tester Signature:** _______________________________________________

**Date:** _______________________________________________

**QA Lead Approval:** _______________________________________________

---

**END OF EXECUTION GUIDE**
