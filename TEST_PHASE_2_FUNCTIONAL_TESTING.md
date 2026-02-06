# PHASE 2: FUNCTIONAL TESTING
**Application:** Guires Marketing Control Center  
**URL:** https://guries.vercel.app  
**Date:** February 6, 2026  
**Duration:** 4 hours

---

## OBJECTIVE
Test all core features and workflows to ensure they function correctly.

---

## SECTION A: ASSET MANAGEMENT

### TEST 2.1: Create Asset

**Test:** Create new asset  
**Expected:** Asset created successfully with ID  
**Steps:**
1. Navigate to Assets page
2. Click "Create Asset" button
3. Fill form:
   - Asset Name: "Test Asset 001"
   - Asset Type: "Web Asset"
   - Asset Category: "Content"
   - Asset Format: "PDF"
4. Click Save
5. Verify asset appears in list

**Result:** [ ] PASS [ ] FAIL  
**Asset ID:** ________________  
**Issues:** _______________________________________________

---

### TEST 2.2: View Asset Details

**Test:** View asset details  
**Expected:** All asset information displays  
**Steps:**
1. Click on created asset
2. Verify detail page loads
3. Check all fields display
4. Verify metadata shows
5. Check file URL displays

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 2.3: Edit Asset

**Test:** Edit asset  
**Expected:** Changes saved successfully  
**Steps:**
1. Click on asset
2. Click Edit button
3. Change asset name
4. Click Save
5. Verify changes saved

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 2.4: Delete Asset

**Test:** Delete asset  
**Expected:** Asset removed from list  
**Steps:**
1. Click on asset
2. Click Delete button
3. Confirm deletion
4. Verify asset removed
5. Verify no orphaned records

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 2.5: Search Assets

**Test:** Search functionality  
**Expected:** Filter results by keyword  
**Steps:**
1. Go to Assets page
2. Enter search term
3. Verify results filtered
4. Clear search
5. Verify all assets show

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 2.6: Sort Assets

**Test:** Sort functionality  
**Expected:** Sort by name, date, status  
**Steps:**
1. Go to Assets page
2. Click sort by name
3. Verify sorted ascending
4. Click again
5. Verify sorted descending

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## SECTION B: QC WORKFLOW

### TEST 2.7: Submit Asset for QC

**Test:** Submit asset for QC  
**Expected:** Status changes to "QC Pending"  
**Steps:**
1. Create new asset
2. Click "Submit for QC"
3. Confirm submission
4. Verify status changes
5. Verify asset in pending list

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 2.8: View Pending QC Assets

**Test:** View pending QC assets  
**Expected:** List shows all pending assets  
**Steps:**
1. Go to QC Review page
2. Verify pending assets list
3. Check asset details show
4. Verify pagination works
5. Check filter by status

**Result:** [ ] PASS [ ] FAIL  
**Count:** ________________  
**Issues:** _______________________________________________

---

### TEST 2.9: Approve Asset

**Test:** Approve asset in QC  
**Expected:** Status changes to "Approved"  
**Steps:**
1. Open QC Review page
2. Select pending asset
3. Review checklist
4. Click Approve
5. Add remarks (optional)
6. Confirm approval

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 2.10: Reject Asset

**Test:** Reject asset in QC  
**Expected:** Status changes to "Rejected"  
**Steps:**
1. Open QC Review page
2. Select pending asset
3. Click Reject
4. Add rejection reason
5. Confirm rejection

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 2.11: Request Rework

**Test:** Request rework on asset  
**Expected:** Status changes to "Rework"  
**Steps:**
1. Open QC Review page
2. Select pending asset
3. Click "Request Rework"
4. Add rework instructions
5. Confirm request

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 2.12: View QC History

**Test:** View QC review history  
**Expected:** All QC reviews display  
**Steps:**
1. Open asset details
2. Click "QC History" tab
3. Verify all reviews show
4. Check reviewer name
5. Check decision and remarks

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## SECTION C: ASSET LINKING

### TEST 2.13: Link Asset to Service

**Test:** Link asset to service  
**Expected:** Link created successfully  
**Steps:**
1. Open asset details
2. Click "Link to Service"
3. Select service
4. Click Link
5. Verify link appears

**Result:** [ ] PASS [ ] FAIL  
**Service:** ________________  
**Issues:** _______________________________________________

---

### TEST 2.14: Link Asset to Sub-Service

**Test:** Link asset to sub-service  
**Expected:** Link created successfully  
**Steps:**
1. Open asset details
2. Click "Link to Sub-Service"
3. Select sub-service
4. Click Link
5. Verify link appears

**Result:** [ ] PASS [ ] FAIL  
**Sub-Service:** ________________  
**Issues:** _______________________________________________

---

### TEST 2.15: Unlink Asset

**Test:** Unlink asset from service  
**Expected:** Link removed successfully  
**Steps:**
1. Open asset details
2. Click Unlink button
3. Confirm unlink
4. Verify link removed
5. Verify no orphaned records

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## SECTION D: FORM VALIDATION

### TEST 2.16: Required Fields Validation

**Test:** Validate required fields  
**Expected:** Error on missing required fields  
**Steps:**
1. Open Create Asset form
2. Leave required fields empty
3. Click Save
4. Verify validation error
5. Verify form not submitted

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 2.17: Field Format Validation

**Test:** Validate field formats  
**Expected:** Error on invalid format  
**Steps:**
1. Open Create Asset form
2. Enter invalid email
3. Enter invalid URL
4. Click Save
5. Verify format errors

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 2.18: Form Submission

**Test:** Form submission  
**Expected:** Data persists in database  
**Steps:**
1. Fill form with valid data
2. Click Save
3. Verify success message
4. Refresh page
5. Verify data persists

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## SECTION E: NAVIGATION & ROUTING

### TEST 2.19: Dashboard Navigation

**Test:** Navigate to dashboard  
**Expected:** Dashboard loads  
**Steps:**
1. Click Dashboard in sidebar
2. Verify dashboard loads
3. Check for stats
4. Check for charts
5. Verify no errors

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 2.20: Projects Navigation

**Test:** Navigate to projects  
**Expected:** Projects list loads  
**Steps:**
1. Click Projects in sidebar
2. Verify projects list loads
3. Check for project items
4. Verify pagination
5. Verify no errors

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 2.21: Campaigns Navigation

**Test:** Navigate to campaigns  
**Expected:** Campaigns list loads  
**Steps:**
1. Click Campaigns in sidebar
2. Verify campaigns list loads
3. Check for campaign items
4. Verify pagination
5. Verify no errors

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST 2.22: Admin Console Navigation

**Test:** Navigate to admin console  
**Expected:** Admin console loads (admin only)  
**Steps:**
1. Click Admin Console in sidebar
2. Verify admin console loads
3. Check for admin options
4. Verify no errors
5. Verify access control

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## FUNCTIONAL TEST SUMMARY

| Test Case | Result | Notes |
|-----------|--------|-------|
| 2.1 Create Asset | [ ] PASS [ ] FAIL | ________________ |
| 2.2 View Asset Details | [ ] PASS [ ] FAIL | ________________ |
| 2.3 Edit Asset | [ ] PASS [ ] FAIL | ________________ |
| 2.4 Delete Asset | [ ] PASS [ ] FAIL | ________________ |
| 2.5 Search Assets | [ ] PASS [ ] FAIL | ________________ |
| 2.6 Sort Assets | [ ] PASS [ ] FAIL | ________________ |
| 2.7 Submit for QC | [ ] PASS [ ] FAIL | ________________ |
| 2.8 View Pending QC | [ ] PASS [ ] FAIL | ________________ |
| 2.9 Approve Asset | [ ] PASS [ ] FAIL | ________________ |
| 2.10 Reject Asset | [ ] PASS [ ] FAIL | ________________ |
| 2.11 Request Rework | [ ] PASS [ ] FAIL | ________________ |
| 2.12 View QC History | [ ] PASS [ ] FAIL | ________________ |
| 2.13 Link to Service | [ ] PASS [ ] FAIL | ________________ |
| 2.14 Link to Sub-Service | [ ] PASS [ ] FAIL | ________________ |
| 2.15 Unlink Asset | [ ] PASS [ ] FAIL | ________________ |
| 2.16 Required Fields | [ ] PASS [ ] FAIL | ________________ |
| 2.17 Field Format | [ ] PASS [ ] FAIL | ________________ |
| 2.18 Form Submission | [ ] PASS [ ] FAIL | ________________ |
| 2.19 Dashboard Nav | [ ] PASS [ ] FAIL | ________________ |
| 2.20 Projects Nav | [ ] PASS [ ] FAIL | ________________ |
| 2.21 Campaigns Nav | [ ] PASS [ ] FAIL | ________________ |
| 2.22 Admin Console Nav | [ ] PASS [ ] FAIL | ________________ |

**Total Passed:** _____ / 22  
**Total Failed:** _____ / 22  
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

**END OF PHASE 2**
