# PHASE 5: SECURITY TESTING
**Application:** Guires Marketing Control Center  
**URL:** https://guries.vercel.app  
**Date:** February 6, 2026  
**Duration:** 1 hour

---

## OBJECTIVE
Verify security measures are in place and vulnerabilities are prevented.

---

## SECTION A: AUTHENTICATION

### TEST 5.1: Invalid Credentials

**Test:** Login with invalid credentials  
**Expected:** Login fails with error message  
**Steps:**
1. Go to login page
2. Enter invalid email
3. Enter invalid password
4. Click Login
5. Verify error message
6. Verify not redirected

**Result:** [ ] PASS [ ] FAIL  
**Error Message:** _______________________________________________

---

### TEST 5.2: Empty Credentials

**Test:** Login with empty fields  
**Expected:** Validation error  
**Steps:**
1. Go to login page
2. Leave email empty
3. Leave password empty
4. Click Login
5. Verify validation error
6. Verify not submitted

**Result:** [ ] PASS [ ] FAIL  
**Error Message:** _______________________________________________

---

### TEST 5.3: Token Validation

**Test:** JWT token validation  
**Expected:** Token properly formatted  
**Steps:**
1. Login successfully
2. Open DevTools Console
3. Check localStorage for token
4. Verify JWT format
5. Verify token has expiration
6. Verify token sent in header

**Result:** [ ] PASS [ ] FAIL  
**Token Format:** ________________  
**Expiration:** ________________  
**Issues:** _______________________________________________

---

### TEST 5.4: Token Expiration

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

### TEST 5.5: Session Hijacking Prevention

**Test:** Session security  
**Expected:** Session cannot be hijacked  
**Steps:**
1. Login successfully
2. Copy session token
3. Try to use token in different browser
4. Verify access denied or limited
5. Check for additional security

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## SECTION B: AUTHORIZATION

### TEST 5.6: Role-Based Access Control

**Test:** Admin-only pages  
**Expected:** Regular user cannot access  
**Steps:**
1. Login as regular user
2. Try to access Admin Console
3. Verify access denied
4. Check for 403 error
5. Verify redirected to dashboard

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 5.7: QC Permission

**Test:** QC-only operations  
**Expected:** Regular user cannot approve assets  
**Steps:**
1. Login as regular user
2. Try to approve asset
3. Verify access denied
4. Check for 403 error
5. Verify button disabled

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 5.8: User Data Isolation

**Test:** Users cannot access other users' data  
**Expected:** Data properly isolated  
**Steps:**
1. Login as user A
2. Try to access user B's assets
3. Verify access denied
4. Check for 403 error
5. Verify data isolation

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## SECTION C: INPUT VALIDATION

### TEST 5.9: SQL Injection Prevention

**Test:** SQL injection prevention  
**Expected:** Input sanitized  
**Steps:**
1. Open Create Asset form
2. Enter SQL injection payload:
   ' OR '1'='1
3. Click Save
4. Verify input sanitized
5. Verify no SQL error
6. Verify asset created with literal string

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 5.10: XSS Prevention

**Test:** Cross-site scripting prevention  
**Expected:** Script not executed  
**Steps:**
1. Open Create Asset form
2. Enter XSS payload:
   <script>alert('XSS')</script>
3. Click Save
4. View asset
5. Verify script not executed
6. Verify payload displayed as text

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 5.11: Command Injection Prevention

**Test:** Command injection prevention  
**Expected:** Commands not executed  
**Steps:**
1. Open Create Asset form
2. Enter command injection payload:
   ; rm -rf /
3. Click Save
4. Verify command not executed
5. Verify payload sanitized

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 5.12: Path Traversal Prevention

**Test:** Path traversal prevention  
**Expected:** Cannot access parent directories  
**Steps:**
1. Try to access file with path traversal:
   ../../../etc/passwd
2. Verify access denied
3. Check for 403 error
4. Verify no sensitive files exposed

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## SECTION D: DATA PROTECTION

### TEST 5.13: Password Hashing

**Test:** Passwords are hashed  
**Expected:** Passwords not stored in plain text  
**Steps:**
1. Login successfully
2. Check database (if accessible)
3. Verify passwords are hashed
4. Verify bcrypt or similar used
5. Verify salt applied

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 5.14: HTTPS Encryption

**Test:** HTTPS enabled  
**Expected:** All traffic encrypted  
**Steps:**
1. Check URL starts with https://
2. Click lock icon
3. Verify SSL certificate valid
4. Check certificate details
5. Verify no mixed content

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 5.15: Sensitive Data Exposure

**Test:** Sensitive data not exposed  
**Expected:** No sensitive data in logs/console  
**Steps:**
1. Open DevTools Console
2. Check for exposed passwords
3. Check for exposed tokens
4. Check for exposed API keys
5. Verify no sensitive data logged

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## SECTION E: API SECURITY

### TEST 5.16: Rate Limiting

**Test:** Rate limiting on login  
**Expected:** Too many attempts blocked  
**Steps:**
1. Try to login 5+ times with wrong password
2. Verify rate limiting kicks in
3. Check for error message
4. Verify temporary lockout
5. Verify can retry after timeout

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 5.17: CORS Configuration

**Test:** CORS properly configured  
**Expected:** Only allowed origins accepted  
**Steps:**
1. Open DevTools Network tab
2. Make API request
3. Check Access-Control-Allow-Origin header
4. Verify correct origin allowed
5. Verify credentials allowed

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 5.18: Security Headers

**Test:** Security headers present  
**Expected:** All security headers present  
**Steps:**
1. Open DevTools Network tab
2. Check response headers
3. Verify X-Content-Type-Options: nosniff
4. Verify X-Frame-Options: DENY/SAMEORIGIN
5. Verify X-XSS-Protection: 1; mode=block

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 5.19: Content Security Policy

**Test:** CSP header present  
**Expected:** CSP configured  
**Steps:**
1. Open DevTools Network tab
2. Check response headers
3. Verify Content-Security-Policy header
4. Check policy directives
5. Verify restrictive policy

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## SECTION F: DEPENDENCY SECURITY

### TEST 5.20: Dependency Vulnerabilities

**Test:** No known vulnerabilities  
**Expected:** Dependencies up to date  
**Steps:**
1. Check package.json versions
2. Run npm audit (if available)
3. Check for known vulnerabilities
4. Verify critical issues fixed
5. Document any issues

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## SECTION G: COMPLIANCE

### TEST 5.21: Data Privacy

**Test:** Data privacy compliance  
**Expected:** User data protected  
**Steps:**
1. Check privacy policy
2. Verify data collection disclosed
3. Verify user consent obtained
4. Check data retention policy
5. Verify GDPR compliance

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## SECURITY TEST SUMMARY

| Test Case | Result | Notes |
|-----------|--------|-------|
| 5.1 Invalid Credentials | [ ] PASS [ ] FAIL | ________________ |
| 5.2 Empty Credentials | [ ] PASS [ ] FAIL | ________________ |
| 5.3 Token Validation | [ ] PASS [ ] FAIL | ________________ |
| 5.4 Token Expiration | [ ] PASS [ ] FAIL | ________________ |
| 5.5 Session Hijacking | [ ] PASS [ ] FAIL | ________________ |
| 5.6 RBAC | [ ] PASS [ ] FAIL | ________________ |
| 5.7 QC Permission | [ ] PASS [ ] FAIL | ________________ |
| 5.8 Data Isolation | [ ] PASS [ ] FAIL | ________________ |
| 5.9 SQL Injection | [ ] PASS [ ] FAIL | ________________ |
| 5.10 XSS Prevention | [ ] PASS [ ] FAIL | ________________ |
| 5.11 Command Injection | [ ] PASS [ ] FAIL | ________________ |
| 5.12 Path Traversal | [ ] PASS [ ] FAIL | ________________ |
| 5.13 Password Hashing | [ ] PASS [ ] FAIL | ________________ |
| 5.14 HTTPS | [ ] PASS [ ] FAIL | ________________ |
| 5.15 Sensitive Data | [ ] PASS [ ] FAIL | ________________ |
| 5.16 Rate Limiting | [ ] PASS [ ] FAIL | ________________ |
| 5.17 CORS | [ ] PASS [ ] FAIL | ________________ |
| 5.18 Security Headers | [ ] PASS [ ] FAIL | ________________ |
| 5.19 CSP | [ ] PASS [ ] FAIL | ________________ |
| 5.20 Dependencies | [ ] PASS [ ] FAIL | ________________ |
| 5.21 Compliance | [ ] PASS [ ] FAIL | ________________ |

**Total Passed:** _____ / 21  
**Total Failed:** _____ / 21  
**Pass Rate:** _____%

---

## CRITICAL SECURITY ISSUES

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

**END OF PHASE 5**
