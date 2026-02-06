# CORE FUNCTIONALITY TESTING
**Application:** Guires Marketing Control Center  
**URL:** https://guries.vercel.app  
**Date:** February 6, 2026  
**Focus:** CRUD Operations, Forms, Data Validation

---

## SECTION A: CREATE OPERATIONS

### TEST A.1: Create Asset

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
   - Description: "Test asset"
4. Click Save
5. Verify asset appears in list
6. Verify asset has unique ID

**Result:** [ ] PASS [ ] FAIL  
**Asset ID:** ________________  
**Creation Time:** ________________  
**Issues:** _______________________________________________

---

### TEST A.2: Create Project

**Test:** Create new project  
**Expected:** Project created successfully  
**Steps:**
1. Navigate to Projects page
2. Click "Create Project" button
3. Fill form:
   - Project Name: "Test Project 001"
   - Project Code: "TP001"
   - Description: "Test project"
   - Start Date: [today]
   - End Date: [30 days from today]
4. Click Save
5. Verify project appears in list
6. Verify project has unique ID

**Result:** [ ] PASS [ ] FAIL  
**Project ID:** ________________  
**Issues:** _______________________________________________

---

### TEST A.3: Create Campaign

**Test:** Create new campaign  
**Expected:** Campaign created successfully  
**Steps:**
1. Navigate to Campaigns page
2. Click "Create Campaign" button
3. Fill form:
   - Campaign Name: "Test Campaign 001"
   - Campaign Type: "SEO"
   - Description: "Test campaign"
   - Start Date: [today]
   - End Date: [30 days from today]
4. Click Save
5. Verify campaign appears in list
6. Verify campaign has unique ID

**Result:** [ ] PASS [ ] FAIL  
**Campaign ID:** ________________  
**Issues:** _______________________________________________

---

### TEST A.4: Create Task

**Test:** Create new task  
**Expected:** Task created successfully  
**Steps:**
1. Navigate to Tasks page
2. Click "Create Task" button
3. Fill form:
   - Task Name: "Test Task 001"
   - Description: "Test task"
   - Priority: "High"
   - Due Date: [7 days from today]
4. Click Save
5. Verify task appears in list
6. Verify task has unique ID

**Result:** [ ] PASS [ ] FAIL  
**Task ID:** ________________  
**Issues:** _______________________________________________

---

## SECTION B: READ OPERATIONS

### TEST B.1: View Asset Details

**Test:** View asset details  
**Expected:** All asset information displays  
**Steps:**
1. Navigate to Assets page
2. Click on created asset
3. Verify detail page loads
4. Check all fields display:
   - Asset Name
   - Asset Type
   - Asset Category
   - Description
   - Created Date
   - Status
5. Verify no errors

**Result:** [ ] PASS [ ] FAIL  
**Load Time:** ________________  
**Issues:** _______________________________________________

---

### TEST B.2: View Project Details

**Test:** View project details  
**Expected:** All project information displays  
**Steps:**
1. Navigate to Projects page
2. Click on created project
3. Verify detail page loads
4. Check all fields display
5. Verify related campaigns visible
6. Verify related tasks visible

**Result:** [ ] PASS [ ] FAIL  
**Load Time:** ________________  
**Issues:** _______________________________________________

---

### TEST B.3: View Campaign Details

**Test:** View campaign details  
**Expected:** All campaign information displays  
**Steps:**
1. Navigate to Campaigns page
2. Click on created campaign
3. Verify detail page loads
4. Check all fields display
5. Verify related tasks visible
6. Verify related project visible

**Result:** [ ] PASS [ ] FAIL  
**Load Time:** ________________  
**Issues:** _______________________________________________

---

### TEST B.4: List View with Pagination

**Test:** List view with pagination  
**Expected:** Pagination works correctly  
**Steps:**
1. Navigate to Assets page
2. Verify list displays
3. Check pagination controls
4. Click next page
5. Verify new items display
6. Click previous page
7. Verify original items display

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## SECTION C: UPDATE OPERATIONS

### TEST C.1: Edit Asset

**Test:** Edit asset  
**Expected:** Changes saved successfully  
**Steps:**
1. Navigate to Assets page
2. Click on asset
3. Click Edit button
4. Change Asset Name to "Test Asset 001 - Updated"
5. Change Description
6. Click Save
7. Verify changes saved
8. Verify updated timestamp

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST C.2: Edit Project

**Test:** Edit project  
**Expected:** Changes saved successfully  
**Steps:**
1. Navigate to Projects page
2. Click on project
3. Click Edit button
4. Change Project Name
5. Change Description
6. Click Save
7. Verify changes saved
8. Verify updated timestamp

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST C.3: Edit Campaign

**Test:** Edit campaign  
**Expected:** Changes saved successfully  
**Steps:**
1. Navigate to Campaigns page
2. Click on campaign
3. Click Edit button
4. Change Campaign Name
5. Change Description
6. Click Save
7. Verify changes saved
8. Verify updated timestamp

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST C.4: Edit Task

**Test:** Edit task  
**Expected:** Changes saved successfully  
**Steps:**
1. Navigate to Tasks page
2. Click on task
3. Click Edit button
4. Change Task Name
5. Change Priority
6. Click Save
7. Verify changes saved
8. Verify updated timestamp

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## SECTION D: DELETE OPERATIONS

### TEST D.1: Delete Asset

**Test:** Delete asset  
**Expected:** Asset removed from list  
**Steps:**
1. Navigate to Assets page
2. Click on asset
3. Click Delete button
4. Confirm deletion
5. Verify asset removed from list
6. Verify no orphaned records

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST D.2: Delete Project

**Test:** Delete project  
**Expected:** Project removed from list  
**Steps:**
1. Navigate to Projects page
2. Click on project
3. Click Delete button
4. Confirm deletion
5. Verify project removed from list
6. Verify related campaigns handled

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST D.3: Delete Campaign

**Test:** Delete campaign  
**Expected:** Campaign removed from list  
**Steps:**
1. Navigate to Campaigns page
2. Click on campaign
3. Click Delete button
4. Confirm deletion
5. Verify campaign removed from list
6. Verify related tasks handled

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST D.4: Delete Task

**Test:** Delete task  
**Expected:** Task removed from list  
**Steps:**
1. Navigate to Tasks page
2. Click on task
3. Click Delete button
4. Confirm deletion
5. Verify task removed from list
6. Verify no orphaned records

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## SECTION E: FORM VALIDATION

### TEST E.1: Required Fields Validation

**Test:** Validate required fields  
**Expected:** Error on missing required fields  
**Steps:**
1. Open Create Asset form
2. Leave required fields empty
3. Click Save
4. Verify validation error appears
5. Verify error message is clear
6. Verify form not submitted

**Result:** [ ] PASS [ ] FAIL  
**Error Message:** _______________________________________________

---

### TEST E.2: Email Field Validation

**Test:** Validate email format  
**Expected:** Error on invalid email  
**Steps:**
1. Open form with email field
2. Enter invalid email: "notanemail"
3. Click Save
4. Verify validation error
5. Verify error message clear
6. Verify form not submitted

**Result:** [ ] PASS [ ] FAIL  
**Error Message:** _______________________________________________

---

### TEST E.3: URL Field Validation

**Test:** Validate URL format  
**Expected:** Error on invalid URL  
**Steps:**
1. Open form with URL field
2. Enter invalid URL: "not a url"
3. Click Save
4. Verify validation error
5. Verify error message clear
6. Verify form not submitted

**Result:** [ ] PASS [ ] FAIL  
**Error Message:** _______________________________________________

---

### TEST E.4: Date Field Validation

**Test:** Validate date format  
**Expected:** Error on invalid date  
**Steps:**
1. Open form with date field
2. Enter invalid date: "invalid"
3. Click Save
4. Verify validation error
5. Verify error message clear
6. Verify form not submitted

**Result:** [ ] PASS [ ] FAIL  
**Error Message:** _______________________________________________

---

### TEST E.5: Number Field Validation

**Test:** Validate number format  
**Expected:** Error on invalid number  
**Steps:**
1. Open form with number field
2. Enter invalid number: "abc"
3. Click Save
4. Verify validation error
5. Verify error message clear
6. Verify form not submitted

**Result:** [ ] PASS [ ] FAIL  
**Error Message:** _______________________________________________

---

## SECTION F: ERROR MESSAGES

### TEST F.1: Clear Error Messages

**Test:** Error messages are clear  
**Expected:** Error messages helpful  
**Steps:**
1. Trigger various validation errors
2. Check error message clarity
3. Verify messages indicate problem
4. Verify messages suggest solution
5. Verify messages are visible

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST F.2: Error Message Positioning

**Test:** Error messages positioned correctly  
**Expected:** Errors near relevant fields  
**Steps:**
1. Trigger validation errors
2. Check error message position
3. Verify errors near relevant fields
4. Verify errors not overlapping
5. Verify errors visible

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST F.3: Multiple Error Messages

**Test:** Multiple errors displayed  
**Expected:** All errors shown  
**Steps:**
1. Leave multiple required fields empty
2. Click Save
3. Verify all errors displayed
4. Verify errors not overlapping
5. Verify all errors visible

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## SECTION G: DATA PERSISTENCE

### TEST G.1: Data Persists After Save

**Test:** Data persists in database  
**Expected:** Data saved correctly  
**Steps:**
1. Create asset with specific data
2. Refresh page
3. Navigate to asset
4. Verify all data displays
5. Verify no data loss
6. Verify timestamps correct

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST G.2: Data Persists After Edit

**Test:** Edited data persists  
**Expected:** Changes saved correctly  
**Steps:**
1. Edit asset
2. Refresh page
3. Navigate to asset
4. Verify changes persisted
5. Verify no data loss
6. Verify updated timestamp

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST G.3: Data Persists After Delete

**Test:** Deleted data removed  
**Expected:** Data removed from database  
**Steps:**
1. Delete asset
2. Refresh page
3. Navigate to asset list
4. Verify asset not in list
5. Verify no orphaned records
6. Verify related data handled

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## SECTION H: SEARCH & FILTER

### TEST H.1: Search Functionality

**Test:** Search works correctly  
**Expected:** Results filtered by keyword  
**Steps:**
1. Navigate to Assets page
2. Enter search term
3. Verify results filtered
4. Verify only matching items show
5. Clear search
6. Verify all items show again

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST H.2: Filter Functionality

**Test:** Filter works correctly  
**Expected:** Results filtered by criteria  
**Steps:**
1. Navigate to Assets page
2. Apply filter (e.g., by type)
3. Verify results filtered
4. Verify only matching items show
5. Clear filter
6. Verify all items show again

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST H.3: Sort Functionality

**Test:** Sort works correctly  
**Expected:** Results sorted correctly  
**Steps:**
1. Navigate to Assets page
2. Click sort by name
3. Verify sorted ascending
4. Click again
5. Verify sorted descending
6. Verify sort stable

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## CORE FUNCTIONALITY TEST SUMMARY

| Test Case | Result | Notes |
|-----------|--------|-------|
| A.1 Create Asset | [ ] PASS [ ] FAIL | ________________ |
| A.2 Create Project | [ ] PASS [ ] FAIL | ________________ |
| A.3 Create Campaign | [ ] PASS [ ] FAIL | ________________ |
| A.4 Create Task | [ ] PASS [ ] FAIL | ________________ |
| B.1 View Asset | [ ] PASS [ ] FAIL | ________________ |
| B.2 View Project | [ ] PASS [ ] FAIL | ________________ |
| B.3 View Campaign | [ ] PASS [ ] FAIL | ________________ |
| B.4 Pagination | [ ] PASS [ ] FAIL | ________________ |
| C.1 Edit Asset | [ ] PASS [ ] FAIL | ________________ |
| C.2 Edit Project | [ ] PASS [ ] FAIL | ________________ |
| C.3 Edit Campaign | [ ] PASS [ ] FAIL | ________________ |
| C.4 Edit Task | [ ] PASS [ ] FAIL | ________________ |
| D.1 Delete Asset | [ ] PASS [ ] FAIL | ________________ |
| D.2 Delete Project | [ ] PASS [ ] FAIL | ________________ |
| D.3 Delete Campaign | [ ] PASS [ ] FAIL | ________________ |
| D.4 Delete Task | [ ] PASS [ ] FAIL | ________________ |
| E.1 Required Fields | [ ] PASS [ ] FAIL | ________________ |
| E.2 Email Validation | [ ] PASS [ ] FAIL | ________________ |
| E.3 URL Validation | [ ] PASS [ ] FAIL | ________________ |
| E.4 Date Validation | [ ] PASS [ ] FAIL | ________________ |
| E.5 Number Validation | [ ] PASS [ ] FAIL | ________________ |
| F.1 Clear Errors | [ ] PASS [ ] FAIL | ________________ |
| F.2 Error Position | [ ] PASS [ ] FAIL | ________________ |
| F.3 Multiple Errors | [ ] PASS [ ] FAIL | ________________ |
| G.1 Data Persists Save | [ ] PASS [ ] FAIL | ________________ |
| G.2 Data Persists Edit | [ ] PASS [ ] FAIL | ________________ |
| G.3 Data Persists Delete | [ ] PASS [ ] FAIL | ________________ |
| H.1 Search | [ ] PASS [ ] FAIL | ________________ |
| H.2 Filter | [ ] PASS [ ] FAIL | ________________ |
| H.3 Sort | [ ] PASS [ ] FAIL | ________________ |

**Total Passed:** _____ / 30  
**Total Failed:** _____ / 30  
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

**END OF CORE FUNCTIONALITY TESTING**
