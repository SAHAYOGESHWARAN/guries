# PHASE 1: SMOKE TESTING
**Application:** Guires Marketing Control Center  
**URL:** https://guries.vercel.app  
**Date:** February 6, 2026  
**Duration:** 1 hour

---

## OBJECTIVE
Verify the application loads and basic functionality works without critical errors.

---

## TEST CASE 1.1: Application Load

**Test:** Initial page load  
**Expected:** Loading screen → Dashboard or Login page  
**Steps:**
1. Open https://guries.vercel.app in browser
2. Wait for page to load (max 5 seconds)
3. Verify loading screen displays
4. Verify page fully loads

**Result:** [ ] PASS [ ] FAIL  
**Load Time:** ________________  
**Issues:** _______________________________________________

---

## TEST CASE 1.2: Login Page

**Test:** Login page displays  
**Expected:** Login form with email and password fields  
**Steps:**
1. Verify login page displays
2. Check for email input field
3. Check for password input field
4. Check for login button
5. Check for error messages area

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## TEST CASE 1.3: Valid Login

**Test:** Login with valid credentials  
**Expected:** Login succeeds, redirects to dashboard  
**Steps:**
1. Enter email: admin@example.com
2. Enter password: [from .env]
3. Click Login button
4. Wait for redirect
5. Verify dashboard loads

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## TEST CASE 1.4: Invalid Login

**Test:** Login with invalid credentials  
**Expected:** Error message displayed  
**Steps:**
1. Enter invalid email
2. Enter invalid password
3. Click Login button
4. Verify error message appears
5. Verify not redirected

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## TEST CASE 1.5: Dashboard Load

**Test:** Dashboard page loads  
**Expected:** Dashboard with stats and charts  
**Steps:**
1. After successful login, verify dashboard loads
2. Check for header
3. Check for sidebar
4. Check for main content
5. Check for charts/stats

**Result:** [ ] PASS [ ] FAIL  
**Load Time:** ________________  
**Issues:** _______________________________________________

---

## TEST CASE 1.6: Sidebar Navigation

**Test:** Sidebar displays and is clickable  
**Expected:** Sidebar visible with menu items  
**Steps:**
1. Verify sidebar visible on left
2. Check for menu items
3. Click on "Assets" menu item
4. Verify page changes
5. Click on "QC Review" menu item
6. Verify page changes

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## TEST CASE 1.7: Page Refresh

**Test:** Page refresh works  
**Expected:** Page reloads without errors  
**Steps:**
1. On dashboard, press F5
2. Wait for page to reload
3. Verify page loads successfully
4. Verify data persists
5. Check console for errors

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## TEST CASE 1.8: Browser Console

**Test:** No critical errors in console  
**Expected:** Console clean or only warnings  
**Steps:**
1. Press F12 to open DevTools
2. Go to Console tab
3. Look for red error messages
4. Document any errors
5. Verify no critical errors

**Result:** [ ] PASS [ ] FAIL  
**Errors Found:** _______________________________________________

---

## TEST CASE 1.9: Logout

**Test:** Logout functionality  
**Expected:** Logout succeeds, redirects to login  
**Steps:**
1. Click user profile icon (top right)
2. Click Logout
3. Verify redirected to login page
4. Verify session cleared

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## TEST CASE 1.10: Session Persistence

**Test:** Session persists on page refresh  
**Expected:** User stays logged in after refresh  
**Steps:**
1. Login successfully
2. Navigate to Assets page
3. Press F5 to refresh
4. Verify still logged in
5. Verify Assets page still loads

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## SMOKE TEST SUMMARY

| Test Case | Result | Notes |
|-----------|--------|-------|
| 1.1 Application Load | [ ] PASS [ ] FAIL | ________________ |
| 1.2 Login Page | [ ] PASS [ ] FAIL | ________________ |
| 1.3 Valid Login | [ ] PASS [ ] FAIL | ________________ |
| 1.4 Invalid Login | [ ] PASS [ ] FAIL | ________________ |
| 1.5 Dashboard Load | [ ] PASS [ ] FAIL | ________________ |
| 1.6 Sidebar Navigation | [ ] PASS [ ] FAIL | ________________ |
| 1.7 Page Refresh | [ ] PASS [ ] FAIL | ________________ |
| 1.8 Browser Console | [ ] PASS [ ] FAIL | ________________ |
| 1.9 Logout | [ ] PASS [ ] FAIL | ________________ |
| 1.10 Session Persistence | [ ] PASS [ ] FAIL | ________________ |

**Total Passed:** _____ / 10  
**Total Failed:** _____ / 10  
**Pass Rate:** _____%

---

## CRITICAL ISSUES FOUND

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

## RECOMMENDATIONS

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

## SIGN-OFF

**Tester:** _______________________________________________  
**Date:** _______________________________________________  
**Status:** [ ] PASS [ ] FAIL [ ] PASS WITH NOTES

---

**END OF PHASE 1**
