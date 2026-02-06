# Guires Marketing Control Center - E2E Testing Checklist

## Deployment Status
- **Frontend**: Deployed to Vercel (https://guries.vercel.app)
- **API**: Serverless functions in `/api` directory
- **Database**: SQLite (mock data for production)
- **Build**: Vite + React 18
- **Node Version**: 20.x

## Pre-Deployment Verification

### ✅ Code Quality
- [x] No TypeScript errors in frontend
- [x] No TypeScript errors in API handlers
- [x] CORS headers configured
- [x] Environment variables set in vercel.json
- [x] API routes properly structured

### ✅ Configuration Files
- [x] vercel.json - Routes and build config
- [x] frontend/.env.production - API URL set to /api/v1
- [x] package.json - Build scripts configured
- [x] API handlers - auth.ts, v1/[[...route]].ts, health.ts

## Phase 1: Authentication Testing

### Login Page Load
- [ ] Page loads without errors
- [ ] Loading spinner displays
- [ ] Background gradient renders
- [ ] Login form visible
- [ ] Email input field functional
- [ ] Password input field functional
- [ ] Login button clickable

### Login Functionality
- [ ] Valid credentials (admin@example.com / admin123) accepted
- [ ] Invalid email rejected with error message
- [ ] Invalid password rejected with error message
- [ ] Empty email shows validation error
- [ ] Empty password shows validation error
- [ ] JWT token stored in localStorage
- [ ] User redirected to dashboard after login
- [ ] Loading state shows during login

### Error Handling
- [ ] Network error displays user-friendly message
- [ ] API timeout handled gracefully
- [ ] Invalid JSON response handled
- [ ] 401 errors show "Invalid email or password"
- [ ] 500 errors show "Unable to connect to server"

## Phase 2: Dashboard Testing

### Dashboard Load
- [ ] Dashboard loads after successful login
- [ ] Header displays with user info
- [ ] Sidebar displays with navigation menu
- [ ] Main content area renders
- [ ] No console errors

### Dashboard Components
- [ ] Active campaigns count displays
- [ ] Content published count displays
- [ ] Tasks completed count displays
- [ ] Team members count displays
- [ ] Pending tasks count displays
- [ ] All stats have correct values

### Navigation
- [ ] Sidebar menu items clickable
- [ ] Navigation updates URL hash
- [ ] Page content changes on navigation
- [ ] Back navigation works
- [ ] Breadcrumbs display correctly

## Phase 3: Core Pages Testing

### Projects Page
- [ ] Projects list loads
- [ ] Project cards display
- [ ] Project details visible (name, status, client, deadline)
- [ ] Click project opens detail view
- [ ] Back button returns to list

### Campaigns Page
- [ ] Campaigns list loads
- [ ] Campaign cards display
- [ ] Campaign details visible (name, status, budget)
- [ ] Click campaign opens detail view
- [ ] Back button returns to list

### Assets Page
- [ ] Assets list loads
- [ ] Asset cards display
- [ ] Asset details visible (name, type, category, status)
- [ ] Click asset opens detail view
- [ ] Asset edit functionality works
- [ ] Asset delete functionality works

### Tasks Page
- [ ] Tasks list loads
- [ ] Task items display
- [ ] Task status visible
- [ ] Task filtering works
- [ ] Task sorting works

### Services Page
- [ ] Services list loads
- [ ] Service details display
- [ ] Service creation works
- [ ] Service editing works
- [ ] Service deletion works

## Phase 4: API Testing

### Authentication Endpoint
- [ ] POST /api/auth/login accepts credentials
- [ ] Returns JWT token on success
- [ ] Returns 401 on invalid credentials
- [ ] Returns 400 on missing fields
- [ ] CORS headers present

### Assets Endpoint
- [ ] GET /api/v1/assets returns asset list
- [ ] POST /api/v1/assets creates new asset
- [ ] Returns mock data with correct structure
- [ ] Pagination works if implemented

### Services Endpoint
- [ ] GET /api/v1/services returns service list
- [ ] Returns mock data with correct structure

### Tasks Endpoint
- [ ] GET /api/v1/tasks returns task list
- [ ] Returns mock data with correct structure

### Campaigns Endpoint
- [ ] GET /api/v1/campaigns returns campaign list
- [ ] Returns mock data with correct structure

### Projects Endpoint
- [ ] GET /api/v1/projects returns project list
- [ ] Returns mock data with correct structure

### Health Endpoint
- [ ] GET /api/health returns 200 status
- [ ] Returns JSON with status: "ok"

## Phase 5: UI/UX Testing

### Responsive Design
- [ ] Desktop layout (1920px) displays correctly
- [ ] Tablet layout (768px) displays correctly
- [ ] Mobile layout (375px) displays correctly
- [ ] Sidebar collapses on mobile
- [ ] Navigation menu accessible on mobile

### Visual Elements
- [ ] Colors match design system
- [ ] Typography renders correctly
- [ ] Spacing/padding consistent
- [ ] Buttons have hover states
- [ ] Links are underlined/highlighted
- [ ] Icons display correctly

### Forms
- [ ] Form inputs have proper labels
- [ ] Form validation messages display
- [ ] Submit buttons are disabled during submission
- [ ] Success messages display after submission
- [ ] Error messages display on failure

### Tables/Lists
- [ ] Data displays in proper columns
- [ ] Headers are clear and readable
- [ ] Rows alternate colors for readability
- [ ] Pagination controls work
- [ ] Sorting works on columns
- [ ] Filtering works

## Phase 6: Performance Testing

### Load Time
- [ ] Initial page load < 3 seconds
- [ ] Dashboard load < 2 seconds
- [ ] API responses < 1 second
- [ ] No layout shift during load

### Bundle Size
- [ ] Main bundle < 500KB
- [ ] CSS bundle < 100KB
- [ ] No unused dependencies

### Memory
- [ ] No memory leaks on navigation
- [ ] No memory leaks on repeated actions
- [ ] Console shows no warnings

## Phase 7: Security Testing

### Authentication
- [ ] JWT token required for protected routes
- [ ] Token stored securely in localStorage
- [ ] Token expires after 7 days
- [ ] Logout clears token

### API Security
- [ ] CORS headers properly configured
- [ ] No sensitive data in URLs
- [ ] No sensitive data in localStorage
- [ ] Password hashing implemented

### Input Validation
- [ ] Email validation works
- [ ] Password validation works
- [ ] XSS prevention implemented
- [ ] SQL injection prevention (if applicable)

## Phase 8: Browser Compatibility

### Chrome
- [ ] Latest version works
- [ ] No console errors
- [ ] All features functional

### Firefox
- [ ] Latest version works
- [ ] No console errors
- [ ] All features functional

### Safari
- [ ] Latest version works
- [ ] No console errors
- [ ] All features functional

### Edge
- [ ] Latest version works
- [ ] No console errors
- [ ] All features functional

## Phase 9: Accessibility Testing

### Keyboard Navigation
- [ ] Tab key navigates through form fields
- [ ] Enter key submits forms
- [ ] Escape key closes modals
- [ ] All buttons accessible via keyboard

### Screen Reader
- [ ] Page title announced
- [ ] Form labels announced
- [ ] Button purposes clear
- [ ] Images have alt text
- [ ] Links have descriptive text

### Color Contrast
- [ ] Text contrast ratio >= 4.5:1
- [ ] Button contrast ratio >= 4.5:1
- [ ] No color-only information

## Phase 10: Error Scenarios

### Network Errors
- [ ] Offline mode handled gracefully
- [ ] Timeout errors show message
- [ ] Retry functionality works
- [ ] Error messages are helpful

### Invalid Data
- [ ] Malformed JSON handled
- [ ] Missing required fields handled
- [ ] Invalid data types handled
- [ ] Empty responses handled

### Edge Cases
- [ ] Very long text handled
- [ ] Special characters handled
- [ ] Large numbers handled
- [ ] Null/undefined values handled

## Test Results Summary

### Overall Status
- [ ] All tests passed
- [ ] No critical issues
- [ ] No blocking issues
- [ ] Ready for production

### Issues Found
- Issue 1: [Description]
- Issue 2: [Description]
- Issue 3: [Description]

### Recommendations
- Recommendation 1: [Description]
- Recommendation 2: [Description]
- Recommendation 3: [Description]

## Sign-Off

- **Tested By**: [Name]
- **Date**: [Date]
- **Environment**: Production (https://guries.vercel.app)
- **Status**: ✅ PASSED / ❌ FAILED

---

## Quick Test Commands

```bash
# Build frontend
npm run build:frontend

# Test API locally
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Check health
curl https://guries.vercel.app/api/health

# Test login
curl -X POST https://guries.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## Deployment Checklist

- [ ] All code committed to git
- [ ] All tests passing
- [ ] Environment variables set in Vercel
- [ ] API routes deployed
- [ ] Frontend built and deployed
- [ ] SSL certificate valid
- [ ] Domain configured
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Documentation updated
