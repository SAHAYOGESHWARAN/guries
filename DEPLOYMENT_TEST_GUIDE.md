# URL Slug Auto-Generation - Deployment Test Guide

## Live Testing on https://guries.vercel.app

### Prerequisites
- Browser with internet access
- Deployed site is live at https://guries.vercel.app

---

## Step-by-Step Test Instructions

### Test 1: Basic Slug Generation

**Steps:**
1. Go to https://guries.vercel.app
2. Navigate to **Services** page (from main menu)
3. Click **"Create Service"** button
4. In the **"Service Name"** field, type: `Web Presence`
5. **Observe**: The **"URL Slug"** field should auto-populate with: `web-presence`
6. **Observe**: The **"Full URL"** field should show: `/services/web-presence`

**Expected Result:** ✅ Slug auto-generates as you type

---

### Test 2: Special Characters Handling

**Steps:**
1. Clear the Service Name field
2. Type: `SEO & Analytics`
3. **Observe**: URL Slug should show: `seo-and-analytics`
4. **Observe**: Full URL should show: `/services/seo-and-analytics`

**Expected Result:** ✅ Ampersand converted to "and"

---

### Test 3: Multiple Words

**Steps:**
1. Clear the Service Name field
2. Type: `Content Marketing Campaign`
3. **Observe**: URL Slug should show: `content-marketing-campaign`
4. **Observe**: Full URL should show: `/services/content-marketing-campaign`

**Expected Result:** ✅ Spaces converted to hyphens

---

### Test 4: Special Characters Removal

**Steps:**
1. Clear the Service Name field
2. Type: `Email Marketing (Pro)`
3. **Observe**: URL Slug should show: `email-marketing-pro`
4. **Observe**: Full URL should show: `/services/email-marketing-pro`

**Expected Result:** ✅ Parentheses removed

---

### Test 5: Uppercase Conversion

**Steps:**
1. Clear the Service Name field
2. Type: `SOCIAL MEDIA MARKETING`
3. **Observe**: URL Slug should show: `social-media-marketing`
4. **Observe**: Full URL should show: `/services/social-media-marketing`

**Expected Result:** ✅ Converted to lowercase

---

### Test 6: Manual Override

**Steps:**
1. Type Service Name: `Web Design`
2. Slug auto-generates: `web-design`
3. Click on the **URL Slug** field
4. Manually change it to: `web-design-services`
5. **Observe**: Full URL updates to: `/services/web-design-services`

**Expected Result:** ✅ User can override auto-generated slug

---

### Test 7: Real-Time Updates

**Steps:**
1. Type Service Name: `Brand`
2. **Observe**: Slug shows `brand`
3. Continue typing: `Brand Identity`
4. **Observe**: Slug updates to `brand-identity`
5. Continue typing: `Brand Identity & Design`
6. **Observe**: Slug updates to `brand-identity-and-design`

**Expected Result:** ✅ Slug updates in real-time as you type

---

### Test 8: Empty Field Handling

**Steps:**
1. Clear the Service Name field completely
2. **Observe**: URL Slug field should be empty
3. **Observe**: Full URL should be empty or show `/services/`

**Expected Result:** ✅ Handles empty input gracefully

---

### Test 9: Numbers Preservation

**Steps:**
1. Type Service Name: `Web 2.0 Services`
2. **Observe**: URL Slug should show: `web-20-services`
3. **Observe**: Full URL should show: `/services/web-20-services`

**Expected Result:** ✅ Numbers are preserved

---

### Test 10: Underscore Conversion

**Steps:**
1. Type Service Name: `Brand_Identity_Design`
2. **Observe**: URL Slug should show: `brand-identity-design`
3. **Observe**: Full URL should show: `/services/brand-identity-design`

**Expected Result:** ✅ Underscores converted to hyphens

---

## Expected Behavior Summary

| Feature | Expected | Status |
|---------|----------|--------|
| Auto-generate slug from name | ✅ Yes | Test |
| Real-time updates | ✅ Yes | Test |
| Lowercase conversion | ✅ Yes | Test |
| Space to hyphen | ✅ Yes | Test |
| Special char removal | ✅ Yes | Test |
| Ampersand to "and" | ✅ Yes | Test |
| Manual override | ✅ Yes | Test |
| Empty field handling | ✅ Yes | Test |
| Number preservation | ✅ Yes | Test |
| Underscore to hyphen | ✅ Yes | Test |

---

## Browser Console Debugging

If you want to see detailed logs:

1. Open **Developer Tools** (F12 or Right-click → Inspect)
2. Go to **Console** tab
3. Look for logs starting with `[useData]`
4. You should see:
   - `[useData] Fetching services from /api/v1/services`
   - `[useData] Received services: X items`
   - Form data updates as you type

---

## Troubleshooting

### Issue: Slug not auto-generating
**Solution:**
1. Refresh the page (Ctrl+F5)
2. Clear browser cache
3. Try a different browser
4. Check browser console for errors

### Issue: Full URL not updating
**Solution:**
1. Verify slug field has a value
2. Check that the slug is valid (no special characters)
3. Refresh and try again

### Issue: Can't access Services page
**Solution:**
1. Verify you're logged in (if required)
2. Check that https://guries.vercel.app is accessible
3. Try accessing from a different browser

---

## Test Completion Checklist

- [ ] Test 1: Basic slug generation - PASS
- [ ] Test 2: Special characters - PASS
- [ ] Test 3: Multiple words - PASS
- [ ] Test 4: Parentheses removal - PASS
- [ ] Test 5: Uppercase conversion - PASS
- [ ] Test 6: Manual override - PASS
- [ ] Test 7: Real-time updates - PASS
- [ ] Test 8: Empty field handling - PASS
- [ ] Test 9: Numbers preservation - PASS
- [ ] Test 10: Underscore conversion - PASS

---

## Test Results

**Date Tested**: _______________  
**Tester Name**: _______________  
**Browser**: _______________  
**OS**: _______________  

**Overall Result**: 
- [ ] ✅ ALL TESTS PASSED
- [ ] ⚠️ SOME TESTS FAILED
- [ ] ❌ CRITICAL ISSUES FOUND

**Notes**: 
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

## Screenshots to Capture

1. Service creation form with auto-generated slug
2. Real-time slug update as you type
3. Manual slug override
4. Full URL display
5. Browser console logs (if applicable)

---

## Sign-Off

**Feature Status**: Ready for Production  
**Deployment URL**: https://guries.vercel.app  
**Test Date**: February 11, 2026  
**Verified By**: [Your Name]

---

## Next Steps

After completing all tests:
1. Document any issues found
2. Report results to development team
3. Mark feature as "Tested and Verified" if all pass
4. Deploy to production if not already live

---

**Test Guide Created**: February 11, 2026  
**Framework**: Manual End-to-End Testing  
**Scope**: URL Slug Auto-Generation Feature
