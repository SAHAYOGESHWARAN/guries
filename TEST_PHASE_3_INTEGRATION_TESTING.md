# PHASE 3: INTEGRATION TESTING
**Application:** Guires Marketing Control Center  
**URL:** https://guries.vercel.app  
**Date:** February 6, 2026  
**Duration:** 2 hours

---

## OBJECTIVE
Test API endpoints and database operations to ensure integration works correctly.

---

## SECTION A: API ENDPOINTS

### TEST 3.1: Health Check Endpoint

**Test:** GET /api/health  
**Expected:** 200 OK response  
**Steps:**
1. Open DevTools (F12)
2. Go to Network tab
3. Navigate to application
4. Look for GET /api/health request
5. Verify 200 status
6. Check response time < 100ms

**Result:** [ ] PASS [ ] FAIL  
**Status Code:** ________________  
**Response Time:** ________________  
**Issues:** _______________________________________________

---

### TEST 3.2: Get Assets Endpoint

**Test:** GET /api/v1/assets  
**Expected:** 200 OK with asset array  
**Steps:**
1. Open DevTools Network tab
2. Navigate to Assets page
3. Look for GET /api/v1/assets request
4. Verify 200 status
5. Check response contains assets
6. Verify pagination info

**Result:** [ ] PASS [ ] FAIL  
**Status Code:** ________________  
**Response Time:** ________________  
**Asset Count:** ________________  
**Issues:** _______________________________________________

---

### TEST 3.3: Create Asset Endpoint

**Test:** POST /api/v1/assets  
**Expected:** 201 Created with asset data  
**Steps:**
1. Open DevTools Network tab
2. Create new asset
3. Look for POST /api/v1/assets request
4. Verify 201 status
5. Check response contains asset ID
6. Verify asset created in database

**Result:** [ ] PASS [ ] FAIL  
**Status Code:** ________________  
**Response Time:** ________________  
**Asset ID:** ________________  
**Issues:** _______________________________________________

---

### TEST 3.4: Update Asset Endpoint

**Test:** PUT /api/v1/assets/:id  
**Expected:** 200 OK with updated asset  
**Steps:**
1. Open DevTools Network tab
2. Edit asset
3. Look for PUT /api/v1/assets/:id request
4. Verify 200 status
5. Check response contains updated data
6. Verify changes in database

**Result:** [ ] PASS [ ] FAIL  
**Status Code:** ________________  
**Response Time:** ________________  
**Issues:** _______________________________________________

---

### TEST 3.5: Delete Asset Endpoint

**Test:** DELETE /api/v1/assets/:id  
**Expected:** 200 OK  
**Steps:**
1. Open DevTools Network tab
2. Delete asset
3. Look for DELETE /api/v1/assets/:id request
4. Verify 200 status
5. Check asset removed from database
6. Verify no orphaned records

**Result:** [ ] PASS [ ] FAIL  
**Status Code:** ________________  
**Response Time:** ________________  
**Issues:** _______________________________________________

---

### TEST 3.6: QC Review Endpoints

**Test:** GET /api/v1/qc-review/pending  
**Expected:** 200 OK with pending assets  
**Steps:**
1. Open DevTools Network tab
2. Navigate to QC Review page
3. Look for GET /api/v1/qc-review/pending request
4. Verify 200 status
5. Check response contains pending assets
6. Verify asset details complete

**Result:** [ ] PASS [ ] FAIL  
**Status Code:** ________________  
**Response Time:** ________________  
**Pending Count:** ________________  
**Issues:** _______________________________________________

---

### TEST 3.7: Approve Asset Endpoint

**Test:** POST /api/v1/qc-review/approve  
**Expected:** 200 OK  
**Steps:**
1. Open DevTools Network tab
2. Approve asset in QC
3. Look for POST /api/v1/qc-review/approve request
4. Verify 200 status
5. Check asset status updated
6. Verify audit log entry created

**Result:** [ ] PASS [ ] FAIL  
**Status Code:** ________________  
**Response Time:** ________________  
**Issues:** _______________________________________________

---

### TEST 3.8: Reject Asset Endpoint

**Test:** POST /api/v1/qc-review/reject  
**Expected:** 200 OK  
**Steps:**
1. Open DevTools Network tab
2. Reject asset in QC
3. Look for POST /api/v1/qc-review/reject request
4. Verify 200 status
5. Check asset status updated
6. Verify audit log entry created

**Result:** [ ] PASS [ ] FAIL  
**Status Code:** ________________  
**Response Time:** ________________  
**Issues:** _______________________________________________

---

### TEST 3.9: Login Endpoint

**Test:** POST /api/v1/auth/login  
**Expected:** 200 OK with JWT token  
**Steps:**
1. Open DevTools Network tab
2. Login with credentials
3. Look for POST /api/v1/auth/login request
4. Verify 200 status
5. Check response contains JWT token
6. Verify token stored in localStorage

**Result:** [ ] PASS [ ] FAIL  
**Status Code:** ________________  
**Response Time:** ________________  
**Token Received:** [ ] YES [ ] NO  
**Issues:** _______________________________________________

---

## SECTION B: DATABASE OPERATIONS

### TEST 3.10: Data Persistence

**Test:** Data persists after page refresh  
**Expected:** Data saved in database  
**Steps:**
1. Create asset with specific data
2. Refresh page (F5)
3. Navigate to asset
4. Verify all data displays
5. Verify no data loss
6. Check timestamps preserved

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 3.11: Foreign Key Constraints

**Test:** Foreign key relationships enforced  
**Expected:** Referential integrity maintained  
**Steps:**
1. Create asset linked to service
2. Try to delete service
3. Check if deletion prevented
4. Or verify asset link removed
5. Verify no orphaned records

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 3.12: Cascading Deletes

**Test:** Cascading deletes work correctly  
**Expected:** Related records deleted  
**Steps:**
1. Create asset with QC reviews
2. Delete asset
3. Check if QC reviews deleted
4. Verify no orphaned records
5. Check audit log preserved

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 3.13: Transaction Handling

**Test:** Transactions handled correctly  
**Expected:** All-or-nothing operations  
**Steps:**
1. Create asset with multiple fields
2. Simulate error during save
3. Verify partial data not saved
4. Check database consistency
5. Verify no corrupted records

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 3.14: Concurrent Operations

**Test:** Multiple concurrent requests  
**Expected:** All requests handled correctly  
**Steps:**
1. Open multiple asset pages
2. Edit multiple assets simultaneously
3. Submit multiple forms
4. Verify all operations succeed
5. Check data integrity

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## SECTION C: ERROR HANDLING

### TEST 3.15: Invalid Request

**Test:** Invalid API request  
**Expected:** 400 Bad Request  
**Steps:**
1. Open DevTools Network tab
2. Send invalid request
3. Verify 400 status
4. Check error message
5. Verify helpful error details

**Result:** [ ] PASS [ ] FAIL  
**Status Code:** ________________  
**Issues:** _______________________________________________

---

### TEST 3.16: Unauthorized Access

**Test:** Unauthorized API request  
**Expected:** 401 Unauthorized  
**Steps:**
1. Remove auth token
2. Try to access protected endpoint
3. Verify 401 status
4. Check error message
5. Verify redirect to login

**Result:** [ ] PASS [ ] FAIL  
**Status Code:** ________________  
**Issues:** _______________________________________________

---

### TEST 3.17: Forbidden Access

**Test:** Forbidden API request  
**Expected:** 403 Forbidden  
**Steps:**
1. Login as regular user
2. Try to access admin endpoint
3. Verify 403 status
4. Check error message
5. Verify access denied

**Result:** [ ] PASS [ ] FAIL  
**Status Code:** ________________  
**Issues:** _______________________________________________

---

### TEST 3.18: Not Found Error

**Test:** Resource not found  
**Expected:** 404 Not Found  
**Steps:**
1. Try to access non-existent asset
2. Verify 404 status
3. Check error message
4. Verify helpful error details
5. Verify graceful error handling

**Result:** [ ] PASS [ ] FAIL  
**Status Code:** ________________  
**Issues:** _______________________________________________

---

### TEST 3.19: Server Error

**Test:** Server error handling  
**Expected:** 500 error with message  
**Steps:**
1. Trigger server error
2. Verify 500 status
3. Check error message
4. Verify error logged
5. Verify user-friendly message

**Result:** [ ] PASS [ ] FAIL  
**Status Code:** ________________  
**Issues:** _______________________________________________

---

## SECTION D: CORS & SECURITY

### TEST 3.20: CORS Headers

**Test:** CORS headers present  
**Expected:** Correct CORS headers  
**Steps:**
1. Open DevTools Network tab
2. Make API request
3. Check response headers
4. Verify Access-Control-Allow-Origin
5. Verify credentials allowed

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 3.21: Authentication Header

**Test:** Authorization header required  
**Expected:** 401 without token  
**Steps:**
1. Remove auth token
2. Try to access protected endpoint
3. Verify 401 status
4. Add token to header
5. Verify request succeeds

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## INTEGRATION TEST SUMMARY

| Test Case | Result | Notes |
|-----------|--------|-------|
| 3.1 Health Check | [ ] PASS [ ] FAIL | ________________ |
| 3.2 Get Assets | [ ] PASS [ ] FAIL | ________________ |
| 3.3 Create Asset | [ ] PASS [ ] FAIL | ________________ |
| 3.4 Update Asset | [ ] PASS [ ] FAIL | ________________ |
| 3.5 Delete Asset | [ ] PASS [ ] FAIL | ________________ |
| 3.6 QC Pending | [ ] PASS [ ] FAIL | ________________ |
| 3.7 Approve Asset | [ ] PASS [ ] FAIL | ________________ |
| 3.8 Reject Asset | [ ] PASS [ ] FAIL | ________________ |
| 3.9 Login | [ ] PASS [ ] FAIL | ________________ |
| 3.10 Data Persistence | [ ] PASS [ ] FAIL | ________________ |
| 3.11 Foreign Keys | [ ] PASS [ ] FAIL | ________________ |
| 3.12 Cascading Deletes | [ ] PASS [ ] FAIL | ________________ |
| 3.13 Transactions | [ ] PASS [ ] FAIL | ________________ |
| 3.14 Concurrent Ops | [ ] PASS [ ] FAIL | ________________ |
| 3.15 Invalid Request | [ ] PASS [ ] FAIL | ________________ |
| 3.16 Unauthorized | [ ] PASS [ ] FAIL | ________________ |
| 3.17 Forbidden | [ ] PASS [ ] FAIL | ________________ |
| 3.18 Not Found | [ ] PASS [ ] FAIL | ________________ |
| 3.19 Server Error | [ ] PASS [ ] FAIL | ________________ |
| 3.20 CORS Headers | [ ] PASS [ ] FAIL | ________________ |
| 3.21 Auth Header | [ ] PASS [ ] FAIL | ________________ |

**Total Passed:** _____ / 21  
**Total Failed:** _____ / 21  
**Pass Rate:** _____%

---

## CRITICAL ISSUES

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

## SIGN-OFF

**Tester:** _______________________________________________  
**Date:** _______________________________________________  
**Status:** [ ] PASS [ ] FAIL [ ] PASS WITH NOTES

---

**END OF PHASE 3**
