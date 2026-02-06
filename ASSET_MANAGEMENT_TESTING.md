# ASSET MANAGEMENT TESTING
**Application:** Guires Marketing Control Center  
**URL:** https://guries.vercel.app  
**Date:** February 6, 2026  
**Focus:** Asset Creation, Viewing, Editing, Data Accuracy

---

## SECTION A: ASSET CREATION

### TEST A.1: Create Web Asset

**Test:** Create web asset  
**Expected:** Web asset created successfully  
**Steps:**
1. Navigate to Assets page
2. Click "Create Asset" button
3. Select Asset Type: "Web Asset"
4. Fill form:
   - Asset Name: "Web Asset 001"
   - Asset Category: "Content"
   - Asset Format: "HTML"
   - Web Title: "Test Page Title"
   - Web Description: "Test page description"
   - Web URL: "https://example.com/page"
5. Click Save
6. Verify asset created
7. Verify asset type shows "Web Asset"

**Result:** [ ] PASS [ ] FAIL  
**Asset ID:** ________________  
**Issues:** _______________________________________________

---

### TEST A.2: Create SEO Asset

**Test:** Create SEO asset  
**Expected:** SEO asset created successfully  
**Steps:**
1. Navigate to Assets page
2. Click "Create Asset" button
3. Select Asset Type: "SEO Asset"
4. Fill form:
   - Asset Name: "SEO Asset 001"
   - Asset Category: "SEO"
   - SEO Title: "SEO Title"
   - SEO Description: "SEO Description"
   - Keywords: "keyword1, keyword2"
5. Click Save
6. Verify asset created
7. Verify asset type shows "SEO Asset"

**Result:** [ ] PASS [ ] FAIL  
**Asset ID:** ________________  
**Issues:** _______________________________________________

---

### TEST A.3: Create SMM Asset

**Test:** Create SMM asset  
**Expected:** SMM asset created successfully  
**Steps:**
1. Navigate to Assets page
2. Click "Create Asset" button
3. Select Asset Type: "SMM Asset"
4. Fill form:
   - Asset Name: "SMM Asset 001"
   - Asset Category: "Social Media"
   - SMM Platform: "Facebook"
   - SMM Title: "Social Post Title"
   - SMM Description: "Social post description"
5. Click Save
6. Verify asset created
7. Verify asset type shows "SMM Asset"

**Result:** [ ] PASS [ ] FAIL  
**Asset ID:** ________________  
**Issues:** _______________________________________________

---

### TEST A.4: Create Graphic Asset

**Test:** Create graphic asset  
**Expected:** Graphic asset created successfully  
**Steps:**
1. Navigate to Assets page
2. Click "Create Asset" button
3. Select Asset Type: "Graphic Asset"
4. Fill form:
   - Asset Name: "Graphic Asset 001"
   - Asset Category: "Image"
   - Asset Format: "PNG"
   - Description: "Test graphic"
5. Click Save
6. Verify asset created
7. Verify asset type shows "Graphic Asset"

**Result:** [ ] PASS [ ] FAIL  
**Asset ID:** ________________  
**Issues:** _______________________________________________

---

### TEST A.5: Create Asset with Keywords

**Test:** Create asset with keywords  
**Expected:** Keywords saved correctly  
**Steps:**
1. Navigate to Assets page
2. Click "Create Asset" button
3. Fill form with keywords:
   - Keywords: "keyword1, keyword2, keyword3"
4. Click Save
5. Verify asset created
6. View asset details
7. Verify keywords display correctly

**Result:** [ ] PASS [ ] FAIL  
**Keywords:** ________________  
**Issues:** _______________________________________________

---

## SECTION B: ASSET VIEWING

### TEST B.1: View Asset List

**Test:** View asset list  
**Expected:** All assets display in table  
**Steps:**
1. Navigate to Assets page
2. Verify asset list loads
3. Check for table with columns:
   - Asset Name
   - Asset Type
   - Asset Category
   - Status
   - Created Date
4. Verify all assets visible
5. Verify no errors

**Result:** [ ] PASS [ ] FAIL  
**Asset Count:** ________________  
**Issues:** _______________________________________________

---

### TEST B.2: View Asset Detail Page

**Test:** View asset detail page  
**Expected:** All asset information displays  
**Steps:**
1. Navigate to Assets page
2. Click on asset
3. Verify detail page loads
4. Check all fields display:
   - Asset Name
   - Asset Type
   - Asset Category
   - Asset Format
   - Description
   - Status
   - Created Date
   - Created By
5. Verify no errors

**Result:** [ ] PASS [ ] FAIL  
**Load Time:** ________________  
**Issues:** _______________________________________________

---

### TEST B.3: View Asset Metadata

**Test:** View asset metadata  
**Expected:** All metadata displays  
**Steps:**
1. Navigate to asset detail page
2. Check for metadata section
3. Verify keywords display
4. Verify SEO scores display (if applicable)
5. Verify grammar scores display (if applicable)
6. Verify all metadata visible

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST B.4: View Asset Linked Services

**Test:** View linked services  
**Expected:** Linked services display  
**Steps:**
1. Navigate to asset detail page
2. Check for linked services section
3. Verify linked services display
4. Verify service names correct
5. Verify can unlink if needed

**Result:** [ ] PASS [ ] FAIL  
**Linked Services:** ________________  
**Issues:** _______________________________________________

---

### TEST B.5: View Asset QC Status

**Test:** View QC status  
**Expected:** QC status displays  
**Steps:**
1. Navigate to asset detail page
2. Check for QC status section
3. Verify QC status displays:
   - Status (Pending/Approved/Rejected/Rework)
   - QC Score
   - QC Remarks
   - QC Reviewer
4. Verify all QC info visible

**Result:** [ ] PASS [ ] FAIL  
**QC Status:** ________________  
**Issues:** _______________________________________________

---

## SECTION C: ASSET EDITING

### TEST C.1: Edit Asset Name

**Test:** Edit asset name  
**Expected:** Name updated successfully  
**Steps:**
1. Navigate to asset detail page
2. Click Edit button
3. Change asset name
4. Click Save
5. Verify name updated
6. Verify updated timestamp

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST C.2: Edit Asset Description

**Test:** Edit asset description  
**Expected:** Description updated successfully  
**Steps:**
1. Navigate to asset detail page
2. Click Edit button
3. Change description
4. Click Save
5. Verify description updated
6. Verify updated timestamp

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST C.3: Edit Asset Keywords

**Test:** Edit asset keywords  
**Expected:** Keywords updated successfully  
**Steps:**
1. Navigate to asset detail page
2. Click Edit button
3. Change keywords
4. Click Save
5. Verify keywords updated
6. Verify updated timestamp

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST C.4: Edit Asset Category

**Test:** Edit asset category  
**Expected:** Category updated successfully  
**Steps:**
1. Navigate to asset detail page
2. Click Edit button
3. Change asset category
4. Click Save
5. Verify category updated
6. Verify updated timestamp

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST C.5: Edit Asset Status

**Test:** Edit asset status  
**Expected:** Status updated successfully  
**Steps:**
1. Navigate to asset detail page
2. Click Edit button
3. Change status
4. Click Save
5. Verify status updated
6. Verify updated timestamp

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## SECTION D: ASSET DATA ACCURACY

### TEST D.1: Asset Information Accuracy

**Test:** Asset information accurate  
**Expected:** All data correct  
**Steps:**
1. Create asset with specific data
2. View asset details
3. Verify all data matches input:
   - Asset Name
   - Asset Type
   - Asset Category
   - Description
   - Keywords
4. Verify no data loss
5. Verify no data corruption

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST D.2: Asset Timestamps Accuracy

**Test:** Timestamps accurate  
**Expected:** Timestamps correct  
**Steps:**
1. Create asset
2. Note creation time
3. View asset details
4. Verify created timestamp matches
5. Edit asset
6. Verify updated timestamp updated

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST D.3: Asset Creator Information

**Test:** Creator information accurate  
**Expected:** Creator info correct  
**Steps:**
1. Create asset as specific user
2. View asset details
3. Verify created by shows correct user
4. Verify user email correct
5. Verify user role correct

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST D.4: Asset Metadata Accuracy

**Test:** Metadata accurate  
**Expected:** All metadata correct  
**Steps:**
1. Create asset with keywords
2. View asset details
3. Verify keywords display correctly
4. Verify keyword count correct
5. Verify keyword format correct

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## SECTION E: DUPLICATE & MISSING RECORDS

### TEST E.1: No Duplicate Assets

**Test:** No duplicate assets created  
**Expected:** Each asset unique  
**Steps:**
1. Create asset
2. Navigate to asset list
3. Search for asset
4. Verify only one instance
5. Verify no duplicates
6. Verify asset ID unique

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST E.2: No Missing Assets

**Test:** No missing assets  
**Expected:** All created assets visible  
**Steps:**
1. Create multiple assets (5+)
2. Navigate to asset list
3. Verify all assets visible
4. Count assets in list
5. Verify count matches created
6. Verify no missing assets

**Result:** [ ] PASS [ ] FAIL  
**Created:** ________________  
**Visible:** ________________  
**Issues:** _______________________________________________

---

### TEST E.3: Asset Deletion Removes Record

**Test:** Deleted asset removed  
**Expected:** Asset not in list  
**Steps:**
1. Create asset
2. Delete asset
3. Navigate to asset list
4. Search for asset
5. Verify asset not found
6. Verify no orphaned records

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST E.4: No Orphaned Records

**Test:** No orphaned records  
**Expected:** All related records handled  
**Steps:**
1. Create asset with links
2. Delete asset
3. Check database (if accessible)
4. Verify no orphaned links
5. Verify no orphaned metadata
6. Verify referential integrity

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## SECTION F: ASSET PAGES FUNCTIONALITY

### TEST F.1: Asset List Page Opens

**Test:** Asset list page opens  
**Expected:** Page loads without errors  
**Steps:**
1. Navigate to Assets page
2. Verify page loads
3. Check for table
4. Check for create button
5. Check for search/filter
6. Verify no errors

**Result:** [ ] PASS [ ] FAIL  
**Load Time:** ________________  
**Issues:** _______________________________________________

---

### TEST F.2: Asset Detail Page Opens

**Test:** Asset detail page opens  
**Expected:** Page loads without errors  
**Steps:**
1. Navigate to Assets page
2. Click on asset
3. Verify detail page loads
4. Check for all sections
5. Check for edit button
6. Verify no errors

**Result:** [ ] PASS [ ] FAIL  
**Load Time:** ________________  
**Issues:** _______________________________________________

---

### TEST F.3: Asset Edit Page Opens

**Test:** Asset edit page opens  
**Expected:** Page loads without errors  
**Steps:**
1. Navigate to asset detail page
2. Click Edit button
3. Verify edit page loads
4. Check for all form fields
5. Check for save button
6. Verify no errors

**Result:** [ ] PASS [ ] FAIL  
**Load Time:** ________________  
**Issues:** _______________________________________________

---

### TEST F.4: Asset Create Page Opens

**Test:** Asset create page opens  
**Expected:** Page loads without errors  
**Steps:**
1. Navigate to Assets page
2. Click Create Asset button
3. Verify create page loads
4. Check for all form fields
5. Check for save button
6. Verify no errors

**Result:** [ ] PASS [ ] FAIL  
**Load Time:** ________________  
**Issues:** _______________________________________________

---

## SECTION G: ASSET DISPLAY ACCURACY

### TEST G.1: Asset Name Displays Correctly

**Test:** Asset name displays correctly  
**Expected:** Name shows in list and detail  
**Steps:**
1. Create asset with specific name
2. View asset list
3. Verify name displays in list
4. Click asset
5. Verify name displays in detail
6. Verify name matches input

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST G.2: Asset Type Displays Correctly

**Test:** Asset type displays correctly  
**Expected:** Type shows in list and detail  
**Steps:**
1. Create asset with specific type
2. View asset list
3. Verify type displays in list
4. Click asset
5. Verify type displays in detail
6. Verify type matches input

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST G.3: Asset Category Displays Correctly

**Test:** Asset category displays correctly  
**Expected:** Category shows in list and detail  
**Steps:**
1. Create asset with specific category
2. View asset list
3. Verify category displays in list
4. Click asset
5. Verify category displays in detail
6. Verify category matches input

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

### TEST G.4: Asset Status Displays Correctly

**Test:** Asset status displays correctly  
**Expected:** Status shows in list and detail  
**Steps:**
1. Create asset with specific status
2. View asset list
3. Verify status displays in list
4. Click asset
5. Verify status displays in detail
6. Verify status matches input

**Result:** [ ] PASS [ ] FAIL  
**Issues:** _______________________________________________

---

## ASSET MANAGEMENT TEST SUMMARY

| Test Case | Result | Notes |
|-----------|--------|-------|
| A.1 Create Web Asset | [ ] PASS [ ] FAIL | ________________ |
| A.2 Create SEO Asset | [ ] PASS [ ] FAIL | ________________ |
| A.3 Create SMM Asset | [ ] PASS [ ] FAIL | ________________ |
| A.4 Create Graphic Asset | [ ] PASS [ ] FAIL | ________________ |
| A.5 Create with Keywords | [ ] PASS [ ] FAIL | ________________ |
| B.1 View Asset List | [ ] PASS [ ] FAIL | ________________ |
| B.2 View Asset Detail | [ ] PASS [ ] FAIL | ________________ |
| B.3 View Metadata | [ ] PASS [ ] FAIL | ________________ |
| B.4 View Linked Services | [ ] PASS [ ] FAIL | ________________ |
| B.5 View QC Status | [ ] PASS [ ] FAIL | ________________ |
| C.1 Edit Asset Name | [ ] PASS [ ] FAIL | ________________ |
| C.2 Edit Description | [ ] PASS [ ] FAIL | ________________ |
| C.3 Edit Keywords | [ ] PASS [ ] FAIL | ________________ |
| C.4 Edit Category | [ ] PASS [ ] FAIL | ________________ |
| C.5 Edit Status | [ ] PASS [ ] FAIL | ________________ |
| D.1 Data Accuracy | [ ] PASS [ ] FAIL | ________________ |
| D.2 Timestamps Accuracy | [ ] PASS [ ] FAIL | ________________ |
| D.3 Creator Info | [ ] PASS [ ] FAIL | ________________ |
| D.4 Metadata Accuracy | [ ] PASS [ ] FAIL | ________________ |
| E.1 No Duplicates | [ ] PASS [ ] FAIL | ________________ |
| E.2 No Missing | [ ] PASS [ ] FAIL | ________________ |
| E.3 Deletion Works | [ ] PASS [ ] FAIL | ________________ |
| E.4 No Orphaned | [ ] PASS [ ] FAIL | ________________ |
| F.1 List Page Opens | [ ] PASS [ ] FAIL | ________________ |
| F.2 Detail Page Opens | [ ] PASS [ ] FAIL | ________________ |
| F.3 Edit Page Opens | [ ] PASS [ ] FAIL | ________________ |
| F.4 Create Page Opens | [ ] PASS [ ] FAIL | ________________ |
| G.1 Name Displays | [ ] PASS [ ] FAIL | ________________ |
| G.2 Type Displays | [ ] PASS [ ] FAIL | ________________ |
| G.3 Category Displays | [ ] PASS [ ] FAIL | ________________ |
| G.4 Status Displays | [ ] PASS [ ] FAIL | ________________ |

**Total Passed:** _____ / 31  
**Total Failed:** _____ / 31  
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

**END OF ASSET MANAGEMENT TESTING**
