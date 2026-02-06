# AUTHENTICATION & USER FLOW TESTING
**Application:** Guires Marketing Control Center  
**URL:** https://guries.vercel.app  
**Date:** February 6, 2026  
**Focus:** Login, Logout, RBAC, Access Control

---

## SECTION A: LOGIN FUNCTIONALITY

### TEST A.1: Login Page Display

**Test:** Login page displays correctly  
**Expected:** Login form with email and password fields  
**Steps:**
1. Navigate to https://guries.vercel.app
2. Verify login page displays
3. Check for email input field
4. Check for password input field
5. Check for login button
6. Check for error message area

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST A.2: Valid Login - Admin User

**Test:** Login with valid admin credentials  
**Expected:** Login succeeds, redirects to dashboard  
**Steps:**
1. Enter email: admin@example.com
2. Enter password: [from .env.production]
3. Click Login button
4. Wait for redirect
5. Verify dashboard loads
6. Verify user info displays in header

**Result:** [ ] PASS [ ] FAIL  
**Login Time:** ________________  
**Issues:** _______________________________________________

---

### TEST A.3: Valid Login - QC User

**Test:** Login with valid QC user credentials  
**Expected:** Login succeeds, redirects to dashboard  
**Steps:**
1. Enter email: qc@example.com
2. Enter password: [from .env.production]
3. Click Login button
4. Wait for redirect
5. Verify dashboard loads
6. Verify QC panel accessible

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST A.4: Valid Login - Manager User

**Test:** Login with valid manager credentials  
**Expected:** Login succeeds, redirects to dashboard  
**Steps:**
1. Enter email: manager@example.com
2. Enter password: [from .env.production]
3. Click Login button
4. Wait for redirect
5. Verify dashboard loads
6. Verify manager features accessible

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST A.5: Valid Login - Regular User

**Test:** Login with valid regular user credentials  
**Expected:** Login succeeds, redirects to dashboard  
**Steps:**
1. Enter email: user@example.com
2. Enter password: [from .env.production]
3. Click Login button
4. Wait for redirect
5. Verify dashboard loads
6. Verify limited features accessible

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST A.6: Invalid Email

**Test:** Login with invalid email  
**Expected:** Error message displayed  
**Steps:**
1. Enter invalid email: invalid@test.com
2. Enter any password
3. Click Login button
4. Verify error message appears
5. Verify not redirected
6. Verify form still visible

**Result:** [ ] PASS [ ] FAIL  
**Error Message:** _______________________________________________

---

### TEST A.7: Invalid Password

**Test:** Login with invalid password  
**Expected:** Error message displayed  
**Steps:**
1. Enter valid email: admin@example.com
2. Enter invalid password: wrongpassword
3. Click Login button
4. Verify error message appears
5. Verify not redirected
6. Verify form still visible

**Result:** [ ] PASS [ ] FAIL  
**Error Message:** _______________________________________________

---

### TEST A.8: Empty Email

**Test:** Login with empty email  
**Expected:** Validation error  
**Steps:**
1. Leave email empty
2. Enter password
3. Click Login button
4. Verify validation error
5. Verify form not submitted

**Result:** [ ] PASS [ ] FAIL  
**Error Message:** _______________________________________________

---

### TEST A.9: Empty Password

**Test:** Login with empty password  
**Expected:** Validation error  
**Steps:**
1. Enter email
2. Leave password empty
3. Click Login button
4. Verify validation error
5. Verify form not submitted

**Result:** [ ] PASS [ ] FAIL  
**Error Message:** _______________________________________________

---

### TEST A.10: Both Fields Empty

**Test:** Login with both fields empty  
**Expected:** Validation error  
**Steps:**
1. Leave both fields empty
2. Click Login button
3. Verify validation error
4. Verify form not submitted

**Result:** [ ] PASS [ ] FAIL  
**Error Message:** _______________________________________________

---

## SECTION B: LOGOUT FUNCTIONALITY

### TEST B.1: Logout Button

**Test:** Logout button visible and clickable  
**Expected:** Logout button in header  
**Steps:**
1. Login successfully
2. Look for user profile icon (top right)
3. Click on profile icon
4. Verify logout option appears
5. Verify logout button clickable

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST B.2: Logout Success

**Test:** Logout succeeds  
**Expected:** Redirects to login page  
**Steps:**
1. Login successfully
2. Click user profile icon
3. Click Logout
4. Wait for redirect
5. Verify redirected to login page
6. Verify session cleared

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST B.3: Session Cleared After Logout

**Test:** Session cleared after logout  
**Expected:** Cannot access protected pages  
**Steps:**
1. Login successfully
2. Logout
3. Try to access dashboard directly
4. Verify redirected to login
5. Verify no cached data visible

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST B.4: Token Removed After Logout

**Test:** JWT token removed from storage  
**Expected:** Token not in localStorage  
**Steps:**
1. Login successfully
2. Open DevTools Console
3. Check localStorage for token
4. Logout
5. Check localStorage again
6. Verify token removed

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## SECTION C: SESSION MANAGEMENT

### TEST C.1: Session Persistence on Refresh

**Test:** Session persists on page refresh  
**Expected:** User stays logged in  
**Steps:**
1. Login successfully
2. Navigate to Assets page
3. Press F5 to refresh
4. Verify still logged in
5. Verify Assets page still loads
6. Verify user info still visible

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST C.2: Session Persistence on Navigation

**Test:** Session persists during navigation  
**Expected:** User stays logged in  
**Steps:**
1. Login successfully
2. Navigate to Dashboard
3. Navigate to Assets
4. Navigate to QC Review
5. Navigate to Projects
6. Verify still logged in throughout

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST C.3: Token Expiration

**Test:** Token expiration handling  
**Expected:** Auto-logout after expiration  
**Steps:**
1. Login successfully
2. Wait for token to expire (or simulate)
3. Try to access protected page
4. Verify redirected to login
5. Verify session cleared

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST C.4: Multiple Tabs Session

**Test:** Session shared across tabs  
**Expected:** Logout in one tab affects all tabs  
**Steps:**
1. Login in Tab 1
2. Open Tab 2
3. Navigate to application in Tab 2
4. Verify logged in Tab 2
5. Logout in Tab 1
6. Refresh Tab 2
7. Verify logged out in Tab 2

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## SECTION D: ROLE-BASED ACCESS CONTROL

### TEST D.1: Admin Access to Admin Console

**Test:** Admin can access admin console  
**Expected:** Admin console loads  
**Steps:**
1. Login as admin
2. Navigate to Admin Console
3. Verify admin console loads
4. Check for admin options
5. Verify no errors

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST D.2: User Cannot Access Admin Console

**Test:** Regular user cannot access admin console  
**Expected:** Access denied  
**Steps:**
1. Login as regular user
2. Try to navigate to Admin Console
3. Verify access denied
4. Check for 403 error or redirect
5. Verify redirected to dashboard

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST D.3: QC User Can Approve Assets

**Test:** QC user can approve assets  
**Expected:** Approve button visible and functional  
**Steps:**
1. Login as QC user
2. Navigate to QC Review
3. Select pending asset
4. Verify approve button visible
5. Click approve
6. Verify asset approved

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST D.4: Regular User Cannot Approve Assets

**Test:** Regular user cannot approve assets  
**Expected:** Approve button disabled or hidden  
**Steps:**
1. Login as regular user
2. Navigate to QC Review
3. Select pending asset
4. Verify approve button disabled/hidden
5. Try to approve (if possible)
6. Verify access denied

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST D.5: Manager Can View Team Assets

**Test:** Manager can view team assets  
**Expected:** Team assets visible  
**Steps:**
1. Login as manager
2. Navigate to Assets
3. Verify team assets visible
4. Check for team filter
5. Verify can view team data

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST D.6: User Can Only View Own Assets

**Test:** Regular user can only view own assets  
**Expected:** Only own assets visible  
**Steps:**
1. Login as regular user
2. Navigate to Assets
3. Verify only own assets visible
4. Try to access other user's assets
5. Verify access denied

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## SECTION E: UNAUTHORIZED ACCESS PREVENTION

### TEST E.1: Direct URL Access Without Login

**Test:** Cannot access protected pages without login  
**Expected:** Redirected to login  
**Steps:**
1. Logout (if logged in)
2. Try to access #dashboard directly
3. Verify redirected to login
4. Try to access #assets directly
5. Verify redirected to login

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST E.2: Invalid Token Access

**Test:** Invalid token rejected  
**Expected:** 401 error  
**Steps:**
1. Open DevTools Console
2. Modify token in localStorage
3. Try to access protected page
4. Verify 401 error
5. Verify redirected to login

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST E.3: Expired Token Access

**Test:** Expired token rejected  
**Expected:** 401 error  
**Steps:**
1. Login successfully
2. Wait for token to expire
3. Try to access protected page
4. Verify 401 error
5. Verify redirected to login

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST E.4: Missing Authorization Header

**Test:** Missing auth header rejected  
**Expected:** 401 error  
**Steps:**
1. Open DevTools Network tab
2. Make API request without token
3. Verify 401 status
4. Check error message
5. Verify helpful error details

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST E.5: Insufficient Permissions

**Test:** Insufficient permissions rejected  
**Expected:** 403 error  
**Steps:**
1. Login as regular user
2. Try to access admin endpoint
3. Verify 403 status
4. Check error message
5. Verify access denied

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## AUTHENTICATION TEST SUMMARY

| Test Case | Result | Notes |
|-----------|--------|-------|
| A.1 Login Page Display | [ ] PASS [ ] FAIL | ________________ |
| A.2 Valid Login - Admin | [ ] PASS [ ] FAIL | ________________ |
| A.3 Valid Login - QC | [ ] PASS [ ] FAIL | ________________ |
| A.4 Valid Login - Manager | [ ] PASS [ ] FAIL | ________________ |
| A.5 Valid Login - User | [ ] PASS [ ] FAIL | ________________ |
| A.6 Invalid Email | [ ] PASS [ ] FAIL | ________________ |
| A.7 Invalid Password | [ ] PASS [ ] FAIL | ________________ |
| A.8 Empty Email | [ ] PASS [ ] FAIL | ________________ |
| A.9 Empty Password | [ ] PASS [ ] FAIL | ________________ |
| A.10 Both Empty | [ ] PASS [ ] FAIL | ________________ |
| B.1 Logout Button | [ ] PASS [ ] FAIL | ________________ |
| B.2 Logout Success | [ ] PASS [ ] FAIL | ________________ |
| B.3 Session Cleared | [ ] PASS [ ] FAIL | ________________ |
| B.4 Token Removed | [ ] PASS [ ] FAIL | ________________ |
| C.1 Session Refresh | [ ] PASS [ ] FAIL | ________________ |
| C.2 Session Navigation | [ ] PASS [ ] FAIL | ________________ |
| C.3 Token Expiration | [ ] PASS [ ] FAIL | ________________ |
| C.4 Multiple Tabs | [ ] PASS [ ] FAIL | ________________ |
| D.1 Admin Access | [ ] PASS [ ] FAIL | ________________ |
| D.2 User Denied Admin | [ ] PASS [ ] FAIL | ________________ |
| D.3 QC Can Approve | [ ] PASS [ ] FAIL | ________________ |
| D.4 User Cannot Approve | [ ] PASS [ ] FAIL | ________________ |
| D.5 Manager View Team | [ ] PASS [ ] FAIL | ________________ |
| D.6 User Own Assets | [ ] PASS [ ] FAIL | ________________ |
| E.1 Direct URL Access | [ ] PASS [ ] FAIL | ________________ |
| E.2 Invalid Token | [ ] PASS [ ] FAIL | ________________ |
| E.3 Expired Token | [ ] PASS [ ] FAIL | ________________ |
| E.4 Missing Header | [ ] PASS [ ] FAIL | ________________ |
| E.5 Insufficient Perms | [ ] PASS [ ] FAIL | ________________ |

**Total Passed:** _____ / 29  
**Total Failed:** _____ / 29  
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

**END OF AUTHENTICATION & USER FLOW TESTING**
