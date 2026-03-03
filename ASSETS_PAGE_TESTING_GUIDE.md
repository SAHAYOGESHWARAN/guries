# Assets & Asset Category Pages - Detailed Testing Guide
## Guires Marketing Control Center
**Date**: March 3, 2026  
**Application**: https://guries.vercel.app

---

## Quick Navigation

- [Asset Category Master Page Tests](#asset-category-master-page-tests)
- [Assets Page Tests](#assets-page-tests)
- [Common Issues & Solutions](#common-issues--solutions)
- [Test Data](#test-data)

---

## Asset Category Master Page Tests

### Step-by-Step Testing Procedure

#### Step 1: Navigate to Asset Category Master Page
```
1. Go to https://guries.vercel.app
2. Login with credentials (if required)
3. Click "Asset Category Master" in sidebar
4. Wait for page to load (should be < 2 seconds)
```

**Verification Checklist**:
- [ ] Page loads without errors
- [ ] Title "Asset Category Master" displays
- [ ] No console errors (F12 → Console)
- [ ] All UI elements visible

---

#### Step 2: Verify Page Layout
```
Expected Layout:
┌─────────────────────────────────────────────────────────┐
│ Asset Category Master                                   │
│ Configure asset categories by brand...                  │
│                                    [Export] [Add Category]│
├─────────────────────────────────────────────────────────┤
│ [Search Box]              [Brand Filter Dropdown]       │
├─────────────────────────────────────────────────────────┤
│ Asset Category Registry                                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Brand │ Category │ Word Count │ Status │ Updated │ A │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Data rows...                                        │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Verification Checklist**:
- [ ] Header section visible
- [ ] Search bar present
- [ ] Brand filter dropdown present
- [ ] Export button visible
- [ ] Add Asset Category button visible
- [ ] Table with headers visible
- [ ] Data rows display

---

#### Step 3: Test Search Functionality
```
Test Case: Search for "Web"

1. Click on search input field
2. Type "Web"
3. Observe table updates
4. Verify only matching categories show
5. Clear search (select all and delete)
6. Verify all categories return
```

**Expected Behavior**:
- Table filters as you type
- Only categories containing "Web" display
- Clearing search shows all categories
- Search is case-insensitive

**Verification Checklist**:
- [ ] Search input accepts text
- [ ] Table filters correctly
- [ ] Results are accurate
- [ ] Clearing search works
- [ ] Case-insensitive search works

---

#### Step 4: Test Brand Filter
```
Test Case: Filter by Brand

1. Click brand filter dropdown
2. Observe available brands:
   - All Brands
   - Pubrica
   - Stats work
   - Food Research lab
   - PhD assistance
   - tutors India
3. Select "Pubrica"
4. Observe table updates to show only Pubrica categories
5. Select "All Brands"
6. Verify all categories return
```

**Expected Behavior**:
- Dropdown opens with all brands
- Table filters by selected brand
- "All Brands" shows all categories
- Filter updates immediately

**Verification Checklist**:
- [ ] Dropdown opens
- [ ] All brands listed
- [ ] Filtering works correctly
- [ ] "All Brands" option works
- [ ] Filter updates immediately

---

#### Step 5: Test Add Asset Category
```
Test Case: Create New Category

1. Click "Add Asset Category" button
2. Modal should open with form
3. Fill in the form:
   - Brand: Select "Pubrica"
   - Category Name: Enter "Test Category Live"
   - Word Count: Enter "500"
   - Status: Select "active"
4. Click "Save" button
5. Observe results
```

**Expected Behavior**:
- Modal opens with empty form
- All fields are editable
- Form accepts input
- Save button works
- Success message displays
- Modal closes
- New category appears in table

**Verification Checklist**:
- [ ] Modal opens
- [ ] Form fields present and editable
- [ ] Input accepted
- [ ] Save button works
- [ ] Success message displays
- [ ] Modal closes
- [ ] New category in table
- [ ] Data is correct

**Verify in Table**:
| Brand | Category Name | Word Count | Status |
|-------|---------------|-----------|--------|
| Pubrica | Test Category Live | 500 | active |

---

#### Step 6: Test Edit Asset Category
```
Test Case: Edit Existing Category

1. Find the "Test Category Live" in table
2. Click "Edit" button (pencil icon)
3. Modal opens with current data
4. Change Category Name to "Updated Test Category"
5. Click "Save"
6. Observe table updates
```

**Expected Behavior**:
- Edit modal opens
- Current data pre-populates
- Fields are editable
- Changes are saved
- Table updates with new data
- Success message displays

**Verification Checklist**:
- [ ] Edit modal opens
- [ ] Data pre-populates correctly
- [ ] Fields are editable
- [ ] Save works
- [ ] Table updates
- [ ] Changes persist

**Verify in Table**:
| Brand | Category Name | Word Count | Status |
|-------|---------------|-----------|--------|
| Pubrica | Updated Test Category | 500 | active |

---

#### Step 7: Test Delete Asset Category
```
Test Case: Delete Category

1. Find "Updated Test Category" in table
2. Click "Delete" button (trash icon)
3. Confirmation dialog appears
4. Click "Confirm" or "Yes"
5. Observe table updates
```

**Expected Behavior**:
- Confirmation dialog appears
- Category is removed from table
- Success message displays
- No errors in console

**Verification Checklist**:
- [ ] Confirmation dialog appears
- [ ] Delete works
- [ ] Table updates
- [ ] Category removed
- [ ] No console errors

---

#### Step 8: Test Export Functionality
```
Test Case: Export to CSV

1. Click "Export" button
2. CSV file should download
3. Open file in Excel or text editor
4. Verify data is correct
```

**Expected Behavior**:
- CSV file downloads
- File contains all visible categories
- File is properly formatted
- Can be opened in Excel

**Verification Checklist**:
- [ ] File downloads
- [ ] File is CSV format
- [ ] Data is complete
- [ ] File can be opened

---

## Assets Page Tests

### Step-by-Step Testing Procedure

#### Step 1: Navigate to Assets Page
```
1. Go to https://guries.vercel.app
2. Login with credentials (if required)
3. Click "Assets" in sidebar
4. Wait for page to load (should be < 2 seconds)
```

**Verification Checklist**:
- [ ] Page loads without errors
- [ ] Title "Assets" displays
- [ ] Asset list/table displays
- [ ] No console errors

---

#### Step 2: Verify Page Layout
```
Expected Layout:
┌─────────────────────────────────────────────────────────┐
│ Assets                                                  │
│ Manage your asset library...                            │
│                                    [Create Asset]       │
├─────────────────────────────────────────────────────────┤
│ [Search Box]                                            │
│ [Type Filter] [Category Filter] [Service Filter] ...   │
├─────────────────────────────────────────────────────────┤
│ Asset Library                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ☐ │ Name │ Type │ Category │ Service │ Status │ A  │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Data rows...                                        │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Verification Checklist**:
- [ ] Header section visible
- [ ] Search bar present
- [ ] Filter dropdowns present
- [ ] Create Asset button visible
- [ ] Table with headers visible
- [ ] Data rows display

---

#### Step 3: Test Asset Search
```
Test Case: Search for Asset

1. Click search input
2. Type "banner" (or any asset name)
3. Observe table filters
4. Clear search
5. Verify all assets return
```

**Expected Behavior**:
- Table filters as you type
- Only matching assets display
- Clearing search shows all assets

**Verification Checklist**:
- [ ] Search input accepts text
- [ ] Table filters correctly
- [ ] Results are accurate
- [ ] Clearing search works

---

#### Step 4: Test Asset Filters
```
Test Case: Filter Assets

Available Filters:
1. Asset Type (image, video, document, etc.)
2. Asset Category (Web Assets, SEO Assets, etc.)
3. Content Type (Blog, Service Page, etc.)
4. Campaign Type
5. Linked Service
6. Workflow Stage
7. QC Status
8. Created By

Test Steps:
1. Click Asset Type filter
2. Select "image"
3. Observe table updates
4. Try multiple filters together
5. Clear filters
```

**Expected Behavior**:
- Filters work individually
- Multiple filters work together
- Table updates correctly
- Clearing filters shows all assets

**Verification Checklist**:
- [ ] Asset Type filter works
- [ ] Asset Category filter works
- [ ] Other filters work
- [ ] Multiple filters work together
- [ ] Clearing filters works

---

#### Step 5: Test Create Asset
```
Test Case: Create New Asset

1. Click "Create Asset" button
2. Form should open
3. Fill in the form:
   - Asset Name: "Test Asset Live"
   - Asset Type: "image"
   - Asset Category: "Web Assets"
   - Asset Format: "PNG"
   - Status: "active"
4. Click "Save" button
5. Observe results
```

**Expected Behavior**:
- Form opens
- All fields are editable
- Form accepts input
- Save button works
- Success message displays
- Modal closes
- New asset appears in table

**Verification Checklist**:
- [ ] Form opens
- [ ] Form fields present
- [ ] Input accepted
- [ ] Save button works
- [ ] Success message displays
- [ ] Modal closes
- [ ] New asset in table
- [ ] Data is correct

**Verify in Table**:
| Name | Type | Category | Status |
|------|------|----------|--------|
| Test Asset Live | image | Web Assets | active |

---

#### Step 6: Test Edit Asset
```
Test Case: Edit Existing Asset

1. Find "Test Asset Live" in table
2. Click "Edit" button
3. Modal opens with current data
4. Change Asset Name to "Updated Test Asset"
5. Click "Save"
6. Observe table updates
```

**Expected Behavior**:
- Edit modal opens
- Current data pre-populates
- Fields are editable
- Changes are saved
- Table updates

**Verification Checklist**:
- [ ] Edit modal opens
- [ ] Data pre-populates
- [ ] Fields are editable
- [ ] Save works
- [ ] Table updates

---

#### Step 7: Test Delete Asset
```
Test Case: Delete Asset

1. Find "Updated Test Asset" in table
2. Click "Delete" button
3. Confirmation dialog appears
4. Click "Confirm"
5. Observe table updates
```

**Expected Behavior**:
- Confirmation dialog appears
- Asset is removed from table
- Success message displays

**Verification Checklist**:
- [ ] Confirmation dialog appears
- [ ] Delete works
- [ ] Table updates
- [ ] Asset removed

---

#### Step 8: Test Asset Detail View
```
Test Case: View Asset Details

1. Click on any asset name or detail button
2. Detail panel/page should open
3. Verify all information displays:
   - Asset Name
   - Asset Type
   - Asset Category
   - Asset Format
   - Status
   - Created Date
   - Thumbnail/Preview
4. Click close or back button
```

**Expected Behavior**:
- Detail view opens
- All information displays
- Close button works

**Verification Checklist**:
- [ ] Detail view opens
- [ ] Information displays
- [ ] Close button works

---

## Common Issues & Solutions

### Issue 1: Tables Appear Empty
**Symptoms**: Asset list or category list shows no data

**Solutions**:
1. Check Network tab (F12 → Network)
   - Look for API requests
   - Check status codes (should be 200)
   - Check response data
2. Check Console (F12 → Console)
   - Look for error messages
   - Check for CORS errors
3. Verify backend is running
4. Verify database has data
5. Try refreshing page (F5)

---

### Issue 2: Form Won't Submit
**Symptoms**: Save button doesn't work or form stays open

**Solutions**:
1. Check Console for errors
2. Verify all required fields are filled
3. Check for validation errors
4. Try refreshing page
5. Check Network tab for failed requests

---

### Issue 3: Data Not Persisting
**Symptoms**: Created/edited data disappears after refresh

**Solutions**:
1. Check Network tab for successful POST/PUT requests
2. Verify database connection
3. Check for error messages
4. Try creating again
5. Check backend logs

---

### Issue 4: Search Not Working
**Symptoms**: Search doesn't filter results

**Solutions**:
1. Check if search input accepts text
2. Try different search terms
3. Check Console for errors
4. Try refreshing page
5. Check if data exists

---

### Issue 5: Filters Not Working
**Symptoms**: Filter dropdowns don't update table

**Solutions**:
1. Check if dropdown opens
2. Try selecting different values
3. Check Console for errors
4. Try refreshing page
5. Check if data exists for selected filter

---

## Test Data

### Asset Category Test Data
```json
{
  "brand": "Pubrica",
  "category_name": "Test Category Live",
  "word_count": 500,
  "status": "active"
}
```

### Asset Test Data
```json
{
  "asset_name": "Test Asset Live",
  "asset_type": "image",
  "asset_category": "Web Assets",
  "asset_format": "PNG",
  "content_type": "image/png",
  "status": "active"
}
```

---

## Performance Benchmarks

| Operation | Target | Acceptable |
|-----------|--------|-----------|
| Page Load | < 2s | < 3s |
| Search | < 500ms | < 1s |
| Filter | < 500ms | < 1s |
| Create | < 1s | < 2s |
| Edit | < 1s | < 2s |
| Delete | < 500ms | < 1s |

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

---

## Success Criteria

### Asset Category Master Page
- [ ] Page loads without errors
- [ ] Table displays categories
- [ ] Search works
- [ ] Filter works
- [ ] Create works
- [ ] Edit works
- [ ] Delete works
- [ ] Export works
- [ ] Data persists
- [ ] No console errors

### Assets Page
- [ ] Page loads without errors
- [ ] Table displays assets
- [ ] Search works
- [ ] Filters work
- [ ] Create works
- [ ] Edit works
- [ ] Delete works
- [ ] Detail view works
- [ ] Data persists
- [ ] No console errors

---

## Sign-Off Template

```
Test Date: March 3, 2026
Tester: Kiro E2E Testing Agent
Duration: _____ minutes

Asset Category Master Page:
- Overall Status: [ ] PASS [ ] FAIL [ ] PARTIAL
- Issues Found: _____________________

Assets Page:
- Overall Status: [ ] PASS [ ] FAIL [ ] PARTIAL
- Issues Found: _____________________

Overall Assessment:
- Total Tests: _____
- Passed: _____
- Failed: _____
- Pass Rate: _____%

Signature: _____________________
Date: _____________________
```

---

**Last Updated**: March 3, 2026  
**Version**: 1.0

