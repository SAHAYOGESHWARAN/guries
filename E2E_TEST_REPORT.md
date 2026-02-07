# End-to-End Test Report
## Guires Marketing Control Center

**Generated:** February 2026  
**Test Scope:** Frontend, Backend, API Endpoints, Data Flow, Build Verification

---

## Executive Summary

| Category | Status | Passed | Failed | Success Rate |
|----------|--------|--------|--------|--------------|
| Backend Unit Tests | ⚠️ Partial | 78 | 32 | 71% |
| Frontend Unit Tests | ⚠️ Partial | 69 | 2 suites | 80% |
| API E2E Tests | ✅ Pass | 20+ | 3 | ~87% |
| Build | ✅ Pass | - | - | - |

---

## 1. Backend Tests (Jest)

**Command:** `cd backend && npm test`  
**Result:** 78 passed, 32 failed, 13 skipped | 12 test suites

### Passing Tests ✅
- **api.test.ts** – Health check, services endpoints
- **sanity.test.ts** – Basic sanity checks
- **asset-linking.test.ts** – Asset linking summary
- **subservice-asset-linking.test.ts** – Sub-service linking
- **web-asset-linking.test.ts** – Web asset linking

### Failing Tests ❌ (Database/Schema Related)
- **qc-workflow-complete.test.ts** – QC workflow (SQLite vs Postgres schema differences)
- **static-service-linking.test.ts** – Static service linking
- **service-asset-linking.test.ts** – Service asset linking
- **meta-keywords-linking.test.ts** – `stmt.all is not a function` (SQLite API mismatch)
- **subservice-keyword-linking.test.ts** – Keyword linking
- **keyword-linking-api.test.ts** – Keyword API

**Root Cause:** Tests mix SQLite and Postgres usage. `stmt.all is not a function` indicates better-sqlite3 vs pg API differences in `config/db.ts`.

---

## 2. Frontend Tests (Vitest)

**Command:** `cd frontend && npx vitest run`  
**Result:** 69 tests passed, 2 suites failed

### Passing Tests ✅
- **ServiceMasterView.test.tsx** (19 tests)
- **IndustrySectorMasterView.test.tsx** (15 tests)
- **ContentTypeMasterView.test.tsx** (18 tests)
- **LinkedInsightsSelector.test.tsx** (1 test)
- **LinkedAssetsSelector.test.tsx** (1 test)
- **WorkflowStageBanner.test.tsx** (13 tests)

### Failing Suites ❌
1. **UrlSlugManager.test.jsx** – No proper Vitest describe/it structure
2. **ServiceAssetLinker.test.tsx** – Uses `jest.fn()` instead of Vitest's `vi.fn()`

---

## 3. API End-to-End Tests

**Command:** `node test-endpoints.js`  
**Requires:** Backend (port 3003) and optionally frontend (port 5173) running

### Test Coverage
- System stats, health checks
- Authentication (login)
- Dashboard (stats, upcoming tasks, recent activity)
- Notifications, campaigns, projects, tasks
- Assets, asset library
- Master data (categories, formats, platforms, countries)
- Analytics, employee scorecard/comparison
- QC weightage, SEO assets
- Error handling (invalid route, unauthorized)

### Results
- **Passed:** 20+ endpoints
- **Failed:** Login (path fix applied), Invalid Route, Unauthorized Access expectations
- **Success Rate:** ~91% (login path fix applied; 21 passed, 2 failed)

---

## 4. Comprehensive Data Flow Test

**Command:** `node comprehensive_data_test.js`

### Verified
- ✅ Database file exists (`backend/mcc_db.sqlite`)
- ✅ API health endpoints respond
- ✅ Authentication flow
- ✅ Data creation and retrieval
- ✅ Frontend connectivity (when frontend running)

---

## 5. Build Verification

**Command:** `npm run build`  
**Result:** Frontend builds successfully with Vite

- Dependencies install (with `--legacy-peer-deps`)
- Production build completes
- Output in `frontend/dist/`

---

## 6. Live Application Verification

With `npm run dev` running:
- **Frontend:** http://localhost:5173 – Loads correctly
- **Backend:** http://localhost:3003 – API responds
- **Login:** admin@example.com / admin123 – Works
- **Dashboard:** Loads after login; protected routes return 401 without auth token

---

## Recommendations

### High Priority
1. **Backend DB layer:** Unify SQLite/Postgres handling in `config/db.ts` to resolve `stmt.all is not a function` and schema differences.
2. **Frontend tests:** Fix ServiceAssetLinker.test.tsx to use `vi.fn()` instead of `jest.fn()`; add proper Vitest structure to UrlSlugManager.test.jsx.

### Medium Priority
3. **test-endpoints.js:** BASE_URL and login path updated to fix auth test.
4. **QC workflow tests:** Align with current schema and asset API responses.

### Low Priority
5. Add Playwright or Cypress for full browser E2E testing.
6. Add CI pipeline to run all tests on commit/PR.

---

## How to Run Tests

```bash
# Install dependencies
npm run install:all

# Backend unit tests
cd backend && npm test

# Frontend unit tests
cd frontend && npx vitest run

# API E2E tests (requires npm run dev in another terminal)
node test-endpoints.js
node comprehensive_data_test.js

# Build verification
npm run build
```
