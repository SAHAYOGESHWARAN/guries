# Service Master Testing Guide

## 🧪 Test Scenarios

### Test 1: Create New Service (Happy Path)
**Steps:**
1. Navigate to Service Master view
2. Click "+ Create Service" button
3. Fill Core tab:
   - Service Name: "Technical SEO Audit"
   - Service Code: "SRV-SEO-01"
   - Short Tagline: "Comprehensive technical SEO analysis"
   - Description: "Full technical audit of your website..."
   - Status: "Draft"
   - Select Industries: Food, Nutraceutical
   - Select Countries: India, US
4. Click "AI Suggest" button
5. Navigate to SEO tab
6. Add focus keywords: "technical seo", "seo audit"
7. Navigate to Navigation tab
8. Check "Show in Main Menu"
9. Click "Save Changes"

**Expected Result:**
- ✅ Service created successfully
- ✅ Slug auto-generated: "technical-seo-audit"
- ✅ Full URL: "/services/technical-seo-audit"
- ✅ AI suggestions populated H1, H2s, meta fields
- ✅ Service appears in list view
- ✅ Status badge shows "Draft"

### Test 2: Edit Existing Service
**Steps:**
1. Click on existing service in list
2. Update Service Name to "Advanced Technical SEO Audit"
3. Navigate to Content tab
4. Add H2: "What is Technical SEO?"
5. Add H2: "Why Technical SEO Matters"
6. Navigate to SMM tab
7. Fill OG Title: "Advanced Technical SEO Audit | Your Brand"
8. Click "Save Changes"

**Expected Result:**
- ✅ Service updated successfully
- ✅ Slug remains unchanged (or updates if desired)
- ✅ Version number incremented
- ✅ Updated timestamp reflects current time
- ✅ Changes visible in list view

### Test 3: Create Sub-Service
**Steps:**
1. Navigate to Sub-Service Master view
2. Click "+ Create Sub-Service"
3. Select Parent Service: "Technical SEO Audit"
4. Fill Sub-Service Name: "Core Web Vitals Optimization"
5. Description: "Optimize LCP, FID, CLS metrics..."
6. Click "Save Changes"

**Expected Result:**
- ✅ Sub-service created successfully
- ✅ Full URL: "/services/technical-seo-audit/core-web-vitals-optimization"
- ✅ Parent service's subservice_count incremented to 1
- ✅ Parent service shows has_subservices = true

### Test 4: Link Assets to Service
**Steps:**
1. Open service in edit mode
2. Navigate to Linking tab
3. Type "seo" in asset search
4. Click "Link" on 2-3 relevant assets
5. Verify assets appear in linked list
6. Click "Unlink" on one asset
7. Click "Save Changes"

**Expected Result:**
- ✅ Assets linked successfully
- ✅ Asset's linked_service_ids array updated
- ✅ Service's asset_count updated
- ✅ Unlinked asset removed from list
- ✅ Asset count decremented

### Test 5: AI Suggestions
**Steps:**
1. Create new service
2. Enter Service Name: "Content Marketing Strategy"
3. Click "AI Suggest" button
4. Wait for AI response
5. Review suggested content

**Expected Result:**
- ✅ Button shows loading state
- ✅ AI generates H1, H2s, H3s
- ✅ Meta title and description generated
- ✅ Focus keywords suggested
- ✅ FAQ pairs generated (if enabled)
- ✅ User can edit suggestions before saving

### Test 6: URL Copy Functionality
**Steps:**
1. Open service in edit mode
2. Locate Full URL field
3. Click "Copy" button
4. Paste in notepad/browser

**Expected Result:**
- ✅ Button changes to "✓ Copied"
- ✅ URL copied to clipboard
- ✅ Button reverts after 1.5s
- ✅ Pasted URL matches displayed URL

### Test 7: Industry/Country Selection
**Steps:**
1. Open service in edit mode
2. Navigate to Core tab
3. Check 3 industries
4. Check 2 countries
5. Save service
6. Reopen service

**Expected Result:**
- ✅ Selected industries remain checked
- ✅ Selected countries remain checked
- ✅ Data stored as JSON array
- ✅ Checkboxes reflect saved state

### Test 8: FAQ Section
**Steps:**
1. Open service in edit mode
2. Navigate to Technical tab
3. Check "Enable FAQ"
4. Add Question: "What is technical SEO?"
5. Add Answer: "Technical SEO involves..."
6. Click "Add FAQ"
7. Add 2 more FAQs
8. Remove middle FAQ
9. Save service

**Expected Result:**
- ✅ FAQ section appears when enabled
- ✅ FAQs added to list
- ✅ FAQ removed successfully
- ✅ Data stored as JSONB
- ✅ FAQs display correctly on reopen

### Test 9: Navigation Settings
**Steps:**
1. Open service in edit mode
2. Navigate to Navigation tab
3. Check "Show in Main Menu"
4. Check "Show in Footer Menu"
5. Set Menu Position: 5
6. Set Sitemap Priority: 0.9
7. Set Change Frequency: "weekly"
8. Save service

**Expected Result:**
- ✅ All settings saved correctly
- ✅ Boolean fields stored properly
- ✅ Numeric fields validated
- ✅ Dropdown selections persisted

### Test 10: Delete Service
**Steps:**
1. Select service with sub-services
2. Click delete icon
3. Confirm deletion warning
4. Verify service removed

**Expected Result:**
- ✅ Warning shows linked sub-services count
- ✅ Confirmation required
- ✅ Service deleted from database
- ✅ Sub-services orphaned or cascade deleted (based on config)
- ✅ List view updates

## 🔍 Edge Cases to Test

### Edge Case 1: Empty Required Fields
**Test:** Try to save service without Service Name
**Expected:** Validation error, save blocked

### Edge Case 2: Duplicate Slug
**Test:** Create two services with same name
**Expected:** Slug auto-appends number or shows error

### Edge Case 3: Very Long Content
**Test:** Enter 10,000+ characters in body_content
**Expected:** Saves successfully, no truncation

### Edge Case 4: Special Characters in Name
**Test:** Service Name: "SEO & Marketing (2024)"
**Expected:** Slug: "seo-marketing-2024" (sanitized)

### Edge Case 5: No Parent Service Selected
**Test:** Try to create sub-service without parent
**Expected:** Validation error, save blocked

### Edge Case 6: Delete Service with Assets
**Test:** Delete service with 10+ linked assets
**Expected:** Warning shows asset count, assets unlinked

### Edge Case 7: Network Failure During Save
**Test:** Disconnect network, try to save
**Expected:** Error message, data not lost, retry option

### Edge Case 8: Concurrent Edits
**Test:** Two users edit same service simultaneously
**Expected:** Last save wins, or conflict detection

### Edge Case 9: Invalid URL Format
**Test:** Enter malformed canonical URL
**Expected:** Validation error or auto-correction

### Edge Case 10: Large JSON Arrays
**Test:** Add 100+ keywords, 50+ H2s
**Expected:** Saves successfully, UI remains responsive

## 📊 Performance Tests

### Performance Test 1: List View Load Time
**Test:** Load list with 100+ services
**Expected:** < 2 seconds initial load

### Performance Test 2: Form Open Time
**Test:** Open service with all fields populated
**Expected:** < 1 second to render

### Performance Test 3: AI Suggestion Response
**Test:** Click AI Suggest button
**Expected:** < 5 seconds for response

### Performance Test 4: Asset Search
**Test:** Search 1000+ assets
**Expected:** Results appear within 500ms (debounced)

### Performance Test 5: Save Operation
**Test:** Save service with all fields filled
**Expected:** < 2 seconds to save and return to list

## 🔐 Security Tests

### Security Test 1: SQL Injection
**Test:** Enter SQL in text fields: `'; DROP TABLE services; --`
**Expected:** Treated as text, no SQL execution

### Security Test 2: XSS Attack
**Test:** Enter script in fields: `<script>alert('XSS')</script>`
**Expected:** Sanitized or escaped, no script execution

### Security Test 3: Unauthorized Access
**Test:** Access API endpoint without auth token
**Expected:** 401 Unauthorized response

### Security Test 4: CSRF Protection
**Test:** Submit form from external site
**Expected:** Request blocked or token validation fails

## 🌐 Browser Compatibility Tests

Test in:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

## ♿ Accessibility Tests

### A11y Test 1: Keyboard Navigation
**Test:** Navigate entire form using only Tab/Shift+Tab
**Expected:** All fields accessible, logical order

### A11y Test 2: Screen Reader
**Test:** Use NVDA/JAWS to navigate form
**Expected:** All labels read correctly, errors announced

### A11y Test 3: Focus Indicators
**Test:** Tab through form, observe focus rings
**Expected:** Clear visible focus on all interactive elements

### A11y Test 4: Color Contrast
**Test:** Check all text/background combinations
**Expected:** WCAG AA compliance (4.5:1 ratio)

## 📱 Responsive Tests

### Mobile Test 1: Form Layout
**Test:** Open form on 375px width screen
**Expected:** Single column, no horizontal scroll

### Mobile Test 2: Tab Navigation
**Test:** Swipe through tabs on mobile
**Expected:** Smooth horizontal scrolling

### Mobile Test 3: Checkbox Lists
**Test:** Select industries on mobile
**Expected:** Touch-friendly, scrollable list

### Tablet Test 1: Two-Column Layout
**Test:** Open form on 768px width screen
**Expected:** 2-column grid where appropriate

## 🔄 Integration Tests

### Integration Test 1: Real-time Updates
**Test:** Open service in two browser tabs, edit in one
**Expected:** Other tab receives socket update

### Integration Test 2: Keyword Master Integration
**Test:** Add keyword that exists in Keyword Master
**Expected:** Shows search volume and competition

### Integration Test 3: Industry Master Integration
**Test:** Add new industry in Industry Master
**Expected:** Appears in Service Master checkboxes

### Integration Test 4: Asset Linking
**Test:** Link asset, verify in Asset Master
**Expected:** Asset's linked_service_ids updated

### Integration Test 5: Sub-Service Count
**Test:** Create/delete sub-services
**Expected:** Parent service count updates automatically

## 🐛 Bug Tracking Template

```markdown
**Bug ID:** BUG-001
**Title:** [Brief description]
**Severity:** Critical / High / Medium / Low
**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happens]

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Screen: 1920x1080

**Screenshots:**
[Attach if applicable]

**Console Errors:**
[Copy any errors]

**Status:** Open / In Progress / Fixed / Closed
```

## ✅ Test Checklist

### Database Layer
- [ ] Services table created with all fields
- [ ] Sub-services table created with all fields
- [ ] Foreign keys working correctly
- [ ] JSON fields parse/stringify correctly
- [ ] Indexes on frequently queried fields
- [ ] Cascade deletes configured (if desired)

### Backend API
- [ ] GET /api/v1/services returns all services
- [ ] POST /api/v1/services creates service
- [ ] PUT /api/v1/services/:id updates service
- [ ] DELETE /api/v1/services/:id deletes service
- [ ] GET /api/v1/sub-services returns all sub-services
- [ ] POST /api/v1/sub-services creates sub-service
- [ ] PUT /api/v1/sub-services/:id updates sub-service
- [ ] DELETE /api/v1/sub-services/:id deletes sub-service
- [ ] Socket.io events emit correctly
- [ ] Error handling returns proper status codes

### Frontend UI
- [ ] List view displays all services
- [ ] Search filters services correctly
- [ ] Status filter works
- [ ] Create button opens form
- [ ] Edit button opens form with data
- [ ] Delete button shows confirmation
- [ ] All 9 tabs render correctly
- [ ] Form validation works
- [ ] AI Suggest button functional
- [ ] Copy URL button works
- [ ] Industry/Country checkboxes work
- [ ] Keyword metrics display
- [ ] Asset linking interface works
- [ ] FAQ add/remove works
- [ ] Save button submits correctly
- [ ] Cancel button discards changes
- [ ] Real-time updates via socket

### Integration
- [ ] Service ↔ Sub-Service linking
- [ ] Service ↔ Asset linking
- [ ] Industry Master integration
- [ ] Country Master integration
- [ ] Keyword Master integration
- [ ] Persona Master integration
- [ ] Form Master integration
- [ ] Brand Master integration
- [ ] User Master integration

### Performance
- [ ] List loads in < 2s
- [ ] Form opens in < 1s
- [ ] Save completes in < 2s
- [ ] Search responds in < 500ms
- [ ] No memory leaks
- [ ] No console errors

### Security
- [ ] SQL injection prevented
- [ ] XSS attacks prevented
- [ ] CSRF protection enabled
- [ ] Auth tokens validated
- [ ] Input sanitization working

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Focus indicators visible
- [ ] Color contrast compliant
- [ ] ARIA labels present

### Browser Compatibility
- [ ] Chrome works
- [ ] Firefox works
- [ ] Safari works
- [ ] Edge works
- [ ] Mobile browsers work

### Responsive Design
- [ ] Desktop layout correct
- [ ] Tablet layout correct
- [ ] Mobile layout correct
- [ ] No horizontal scroll
- [ ] Touch-friendly on mobile

---

**Test Coverage Goal:** 95%+
**Critical Path Tests:** All passing
**Regression Tests:** Run before each release
