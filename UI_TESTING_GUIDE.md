# UI Testing Guide
## Guires Marketing Control Center
**Date**: March 3, 2026  
**Application URL**: https://guries.vercel.app

---

## Test Environment Setup

### Browser Requirements
- Chrome/Chromium (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)

### Tools Required
- Browser DevTools (F12)
- Network tab for API monitoring
- Console for error checking

---

## Page Load Tests

### Test 1: Application Initialization
**Steps:**
1. Open https://guries.vercel.app in browser
2. Wait for page to fully load
3. Check browser console for errors

**Expected Results:**
- [ ] Page loads within 3 seconds
- [ ] No console errors
- [ ] Login page displays
- [ ] All UI elements are visible

**Actual Results:**
- Load Time: _____ seconds
- Console Errors: [ ] None [ ] Present
- UI Status: [ ] Complete [ ] Partial [ ] Broken

---

### Test 2: Login Page
**Steps:**
1. Observe login page layout
2. Check form fields
3. Verify buttons are clickable

**Expected Results:**
- [ ] Email input field visible
- [ ] Password input field visible
- [ ] Login button visible
- [ ] "Forgot Password" link visible (if applicable)
- [ ] Form is responsive

**Actual Results:**
- Email Field: [ ] Present [ ] Missing
- Password Field: [ ] Present [ ] Missing
- Login Button: [ ] Present [ ] Missing
- Responsive: [ ] Yes [ ] No

---

### Test 3: Dashboard Page
**Steps:**
1. Login with valid credentials
2. Wait for dashboard to load
3. Observe layout and components

**Expected Results:**
- [ ] Dashboard loads successfully
- [ ] Sidebar navigation visible
- [ ] Main content area displays
- [ ] No loading spinners stuck
- [ ] All widgets/cards visible

**Actual Results:**
- Dashboard Status: [ ] Loaded [ ] Loading [ ] Error
- Sidebar: [ ] Visible [ ] Hidden
- Content: [ ] Complete [ ] Partial [ ] Missing

---

## Navigation Tests

### Test 4: Sidebar Navigation
**Steps:**
1. Click on each menu item in sidebar
2. Verify page transitions
3. Check URL/hash changes

**Expected Results:**
- [ ] All menu items are clickable
- [ ] Pages load after clicking
- [ ] Active menu item is highlighted
- [ ] No navigation errors

**Menu Items to Test:**
- [ ] Dashboard
- [ ] Assets
- [ ] Asset Categories
- [ ] Services
- [ ] Keywords
- [ ] Campaigns
- [ ] Reports
- [ ] Settings
- [ ] Admin Console

**Actual Results:**
- Navigation Status: [ ] Working [ ] Partially Working [ ] Broken
- Issues Found: _____________________

---

### Test 5: Breadcrumb Navigation
**Steps:**
1. Navigate to a nested page
2. Check breadcrumb trail
3. Click on breadcrumb items

**Expected Results:**
- [ ] Breadcrumbs display correctly
- [ ] Breadcrumbs are clickable
- [ ] Clicking breadcrumb navigates correctly

**Actual Results:**
- Breadcrumbs: [ ] Present [ ] Missing
- Functionality: [ ] Working [ ] Broken

---

## Asset Category Master Page Tests

### Test 6: Page Load
**Steps:**
1. Navigate to Asset Category Master
2. Wait for page to load
3. Observe table

**Expected Results:**
- [ ] Page loads successfully
- [ ] Table displays with data
- [ ] Column headers visible
- [ ] Search bar visible
- [ ] Filter dropdown visible
- [ ] Add button visible
- [ ] Export button visible

**Actual Results:**
- Page Status: [ ] Loaded [ ] Loading [ ] Error
- Table: [ ] Visible [ ] Empty [ ] Missing
- Controls: [ ] All Present [ ] Some Missing [ ] All Missing

---

### Test 7: Search Functionality
**Steps:**
1. Enter search term in search box
2. Observe table updates
3. Clear search

**Expected Results:**
- [ ] Table filters as you type
- [ ] Results match search term
- [ ] Clearing search shows all items
- [ ] Search is case-insensitive

**Test Data:**
- Search Term: "Web"
- Expected Results: Categories containing "Web"
- Actual Results: _____________________

**Actual Results:**
- Search Status: [ ] Working [ ] Broken
- Case Sensitivity: [ ] Correct [ ] Incorrect

---

### Test 8: Brand Filter
**Steps:**
1. Click brand filter dropdown
2. Select different brands
3. Observe table updates

**Expected Results:**
- [ ] Dropdown opens
- [ ] All brands listed
- [ ] Table filters by brand
- [ ] "All Brands" option works

**Actual Results:**
- Filter Status: [ ] Working [ ] Broken
- Brands Listed: [ ] All [ ] Some [ ] None

---

### Test 9: Add Asset Category - Form Display
**Steps:**
1. Click "Add Asset Category" button
2. Observe modal/form

**Expected Results:**
- [ ] Modal opens
- [ ] Form fields visible:
  - [ ] Brand dropdown
  - [ ] Category Name input
  - [ ] Word Count input
  - [ ] Status dropdown
- [ ] Save button visible
- [ ] Cancel button visible

**Actual Results:**
- Modal Status: [ ] Opened [ ] Failed to Open
- Fields: [ ] All Present [ ] Some Missing [ ] All Missing

---

### Test 10: Add Asset Category - Form Validation
**Steps:**
1. Click "Add Asset Category"
2. Try to submit empty form
3. Fill in required fields
4. Submit

**Expected Results:**
- [ ] Empty form shows validation errors
- [ ] Required fields are marked
- [ ] Error messages are clear
- [ ] Form prevents submission with empty fields
- [ ] Form submits successfully with valid data

**Actual Results:**
- Validation: [ ] Working [ ] Broken
- Error Messages: [ ] Clear [ ] Unclear [ ] Missing
- Submission: [ ] Success [ ] Failed

---

### Test 11: Add Asset Category - Create Operation
**Steps:**
1. Fill form with:
   - Brand: "Pubrica"
   - Category Name: "Test Category E2E"
   - Word Count: 500
   - Status: "active"
2. Click Save
3. Observe table

**Expected Results:**
- [ ] Success message displays
- [ ] Modal closes
- [ ] New category appears in table
- [ ] New category has correct data

**Actual Results:**
- Success Message: [ ] Displayed [ ] Missing
- Modal: [ ] Closed [ ] Still Open
- Table: [ ] Updated [ ] Not Updated
- New Record ID: _____

---

### Test 12: Edit Asset Category
**Steps:**
1. Click Edit on any category
2. Modify data
3. Click Save

**Expected Results:**
- [ ] Modal opens with existing data
- [ ] Fields are pre-populated
- [ ] Changes are saved
- [ ] Table updates with new data
- [ ] Success message displays

**Test Data:**
- Original Name: _____
- New Name: "Updated Test Category"
- Expected Result: Table shows new name

**Actual Results:**
- Modal: [ ] Opened [ ] Failed
- Pre-population: [ ] Correct [ ] Incorrect
- Save: [ ] Success [ ] Failed
- Table Update: [ ] Yes [ ] No

---

### Test 13: Delete Asset Category
**Steps:**
1. Click Delete on a category
2. Confirm deletion
3. Observe table

**Expected Results:**
- [ ] Confirmation dialog appears
- [ ] Category is removed from table
- [ ] Success message displays
- [ ] No errors in console

**Actual Results:**
- Confirmation: [ ] Appeared [ ] Missing
- Deletion: [ ] Success [ ] Failed
- Table: [ ] Updated [ ] Not Updated

---

### Test 14: Export Functionality
**Steps:**
1. Click Export button
2. Check downloads folder

**Expected Results:**
- [ ] CSV file downloads
- [ ] File contains all visible data
- [ ] File is properly formatted
- [ ] File can be opened in Excel

**Actual Results:**
- Download: [ ] Success [ ] Failed
- File Format: [ ] CSV [ ] Other [ ] Invalid
- Data: [ ] Complete [ ] Partial [ ] Missing

---

## Assets Page Tests

### Test 15: Assets Page Load
**Steps:**
1. Navigate to Assets page
2. Wait for page to load

**Expected Results:**
- [ ] Page loads successfully
- [ ] Asset list displays
- [ ] Table shows asset data
- [ ] No empty tables (if data exists)

**Actual Results:**
- Page Status: [ ] Loaded [ ] Loading [ ] Error
- Table: [ ] Has Data [ ] Empty [ ] Missing

---

### Test 16: Asset Create
**Steps:**
1. Click "Create Asset" button
2. Fill form with:
   - Asset Name: "Test Asset E2E"
   - Asset Type: "image"
   - Asset Category: "Web Assets"
   - Asset Format: "PNG"
3. Click Submit

**Expected Results:**
- [ ] Form displays
- [ ] All fields are present
- [ ] Form validates input
- [ ] Asset is created
- [ ] New asset appears in list

**Actual Results:**
- Form: [ ] Displayed [ ] Missing
- Validation: [ ] Working [ ] Broken
- Creation: [ ] Success [ ] Failed
- List Update: [ ] Yes [ ] No

---

### Test 17: Asset Edit
**Steps:**
1. Click Edit on any asset
2. Modify asset details
3. Click Save

**Expected Results:**
- [ ] Edit form opens
- [ ] Current data is displayed
- [ ] Changes are saved
- [ ] List updates with new data

**Actual Results:**
- Form: [ ] Opened [ ] Failed
- Save: [ ] Success [ ] Failed
- List: [ ] Updated [ ] Not Updated

---

### Test 18: Asset Delete
**Steps:**
1. Click Delete on any asset
2. Confirm deletion

**Expected Results:**
- [ ] Confirmation appears
- [ ] Asset is deleted
- [ ] List updates
- [ ] Success message shows

**Actual Results:**
- Confirmation: [ ] Appeared [ ] Missing
- Deletion: [ ] Success [ ] Failed
- List: [ ] Updated [ ] Not Updated

---

## Form Validation Tests

### Test 19: Required Field Validation
**Steps:**
1. Open any create form
2. Try to submit without filling required fields
3. Observe error messages

**Expected Results:**
- [ ] Error messages appear for empty required fields
- [ ] Error messages are clear and helpful
- [ ] Form does not submit
- [ ] Errors disappear when field is filled

**Actual Results:**
- Error Messages: [ ] Present [ ] Missing
- Clarity: [ ] Clear [ ] Unclear
- Form Submission: [ ] Prevented [ ] Allowed

---

### Test 20: Email Validation
**Steps:**
1. Find email field in any form
2. Enter invalid email (e.g., "notanemail")
3. Try to submit

**Expected Results:**
- [ ] Validation error appears
- [ ] Error message indicates invalid email
- [ ] Form does not submit

**Actual Results:**
- Validation: [ ] Working [ ] Broken
- Error Message: [ ] Present [ ] Missing

---

### Test 21: Number Field Validation
**Steps:**
1. Find number field (e.g., Word Count)
2. Enter non-numeric value
3. Try to submit

**Expected Results:**
- [ ] Validation error appears
- [ ] Only numbers are accepted
- [ ] Form does not submit

**Actual Results:**
- Validation: [ ] Working [ ] Broken
- Acceptance: [ ] Numbers Only [ ] Allows Text

---

## Data Persistence Tests

### Test 22: Create and Refresh
**Steps:**
1. Create a new record
2. Refresh page (F5)
3. Check if record still exists

**Expected Results:**
- [ ] Record persists after refresh
- [ ] No data loss
- [ ] Record appears in list

**Test Record:** _____________________

**Actual Results:**
- Persistence: [ ] Yes [ ] No
- Data Loss: [ ] None [ ] Some [ ] All

---

### Test 23: Update and Refresh
**Steps:**
1. Update an existing record
2. Refresh page
3. Check if changes persist

**Expected Results:**
- [ ] Changes persist after refresh
- [ ] Updated data displays correctly

**Actual Results:**
- Persistence: [ ] Yes [ ] No

---

### Test 24: Delete and Refresh
**Steps:**
1. Delete a record
2. Refresh page
3. Check if record is gone

**Expected Results:**
- [ ] Record remains deleted
- [ ] No duplicate records appear

**Actual Results:**
- Deletion Persists: [ ] Yes [ ] No

---

## API Integration Tests

### Test 25: Network Monitoring
**Steps:**
1. Open DevTools (F12)
2. Go to Network tab
3. Perform CRUD operations
4. Observe API calls

**Expected Results:**
- [ ] GET requests return 200
- [ ] POST requests return 201
- [ ] PUT requests return 200
- [ ] DELETE requests return 200/204
- [ ] No 500 errors
- [ ] No CORS errors

**Actual Results:**
- GET Status: [ ] 200 [ ] Other: _____
- POST Status: [ ] 201 [ ] Other: _____
- PUT Status: [ ] 200 [ ] Other: _____
- DELETE Status: [ ] 200 [ ] Other: _____
- Errors: [ ] None [ ] Present: _____

---

### Test 26: Error Handling
**Steps:**
1. Simulate network error (DevTools > Network > Offline)
2. Try to perform operation
3. Observe error message

**Expected Results:**
- [ ] Error message displays
- [ ] Message is user-friendly
- [ ] No console errors
- [ ] App remains functional

**Actual Results:**
- Error Message: [ ] Displayed [ ] Missing
- User-Friendly: [ ] Yes [ ] No
- Console Errors: [ ] None [ ] Present

---

## Performance Tests

### Test 27: Page Load Time
**Steps:**
1. Open DevTools
2. Go to Performance tab
3. Reload page
4. Check load time

**Expected Results:**
- [ ] Page loads in < 3 seconds
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s

**Actual Results:**
- Total Load Time: _____ seconds
- FCP: _____ seconds
- LCP: _____ seconds

---

### Test 28: Table Rendering Performance
**Steps:**
1. Navigate to page with large table
2. Observe rendering time
3. Check for lag

**Expected Results:**
- [ ] Table renders smoothly
- [ ] No lag when scrolling
- [ ] No performance issues

**Actual Results:**
- Rendering: [ ] Smooth [ ] Laggy [ ] Broken
- Scrolling: [ ] Smooth [ ] Laggy

---

## Responsive Design Tests

### Test 29: Desktop View
**Steps:**
1. Open app on desktop (1920x1080)
2. Check layout
3. Verify all elements visible

**Expected Results:**
- [ ] All elements visible
- [ ] No horizontal scrolling
- [ ] Layout is clean

**Actual Results:**
- Layout: [ ] Correct [ ] Broken
- Scrolling: [ ] None [ ] Horizontal [ ] Vertical

---

### Test 30: Tablet View
**Steps:**
1. Open app on tablet (768x1024)
2. Check layout
3. Verify responsiveness

**Expected Results:**
- [ ] Layout adapts to tablet size
- [ ] All elements visible
- [ ] Touch-friendly buttons

**Actual Results:**
- Responsiveness: [ ] Good [ ] Poor
- Visibility: [ ] All [ ] Some [ ] None

---

### Test 31: Mobile View
**Steps:**
1. Open app on mobile (375x667)
2. Check layout
3. Verify mobile usability

**Expected Results:**
- [ ] Layout adapts to mobile
- [ ] All elements visible
- [ ] Touch-friendly interface
- [ ] No horizontal scrolling

**Actual Results:**
- Responsiveness: [ ] Good [ ] Poor
- Usability: [ ] Good [ ] Poor

---

## Accessibility Tests

### Test 32: Keyboard Navigation
**Steps:**
1. Use Tab key to navigate
2. Check if all elements are reachable
3. Verify focus indicators

**Expected Results:**
- [ ] All interactive elements reachable via Tab
- [ ] Focus indicators visible
- [ ] Logical tab order

**Actual Results:**
- Navigation: [ ] Working [ ] Broken
- Focus Indicators: [ ] Visible [ ] Missing
- Tab Order: [ ] Logical [ ] Illogical

---

### Test 33: Color Contrast
**Steps:**
1. Check text color contrast
2. Verify readability
3. Check status badges

**Expected Results:**
- [ ] Text is readable
- [ ] Sufficient contrast ratio (4.5:1 for normal text)
- [ ] Status badges are distinguishable

**Actual Results:**
- Readability: [ ] Good [ ] Poor
- Contrast: [ ] Sufficient [ ] Insufficient

---

## Summary

### Test Results Overview
- **Total Tests:** 33
- **Passed:** _____
- **Failed:** _____
- **Skipped:** _____
- **Pass Rate:** _____%

### Critical Issues Found
1. _____________________
2. _____________________
3. _____________________

### High Priority Issues
1. _____________________
2. _____________________

### Medium Priority Issues
1. _____________________
2. _____________________

### Low Priority Issues
1. _____________________
2. _____________________

### Recommendations
1. _____________________
2. _____________________
3. _____________________

---

## Sign-Off

**Tested By:** Kiro E2E Testing Agent  
**Date:** March 3, 2026  
**Status:** [ ] PASS [ ] FAIL [ ] PARTIAL

