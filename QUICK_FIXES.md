# Quick Reference: Issues & Fixes

## Issue #1: Asset Not Found After Creation ⚠️ CRITICAL

**Symptom:** Asset ID 864 created successfully but GET /api/v1/assets/864 returns 404

**Location:**

- `backend/controllers/assetController.ts` - getAsset() method
- `backend/routes/api.ts` - GET /assets/:id route

**Current Status:** Test shows asset creation successful, but retrieval fails

**Action Items:**

1. [ ] Check if `getAsset()` method exists in assetController.ts
2. [ ] Verify asset retrieval query syntax (SQLite parameterized query)
3. [ ] Check asset existence with manual SQL: `SELECT * FROM assets WHERE id = 864`
4. [ ] Add better error logging to debug retrieval

**Sample Fix:**

```typescript
export const getAsset = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM assets WHERE id = ?', [id]);
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
```

---

## Issue #2: Asset Update References Non-Existent Column ⚠️ HIGH

**Symptom:** `SqliteError: no such column: tags`

**Location:**

- `backend/controllers/assetController.ts` - updateAsset() method (line ~86)
- `backend/database/init.ts` - Assets table definition

**Current Code:**

```typescript
'UPDATE assets SET \n' +
'            asset_name = COALESCE(?, asset_name), \n' +
'            tags = COALESCE(?, tags), \n' +  // ← Column doesn't exist!
```

**Action Items:**

1. [ ] Option A: Add `tags TEXT` column to assets table
2. [ ] Option B: Remove the `tags` parameter from UPDATE statement
3. [ ] Review all columns referenced in UPDATE vs actual schema

**Fix (Option B - Remove non-existent column):**

```typescript
const sql = `UPDATE assets SET 
    asset_name = COALESCE(?, asset_name),
    file_url = COALESCE(?, file_url),
    description = COALESCE(?, description),
    asset_type = COALESCE(?, asset_type),
    social_meta = COALESCE(?, social_meta),
    application_type = COALESCE(?, application_type),
    status = COALESCE(?, status),
    qc_status = COALESCE(?, qc_status),
    linking_active = COALESCE(?, linking_active),
    updated_at = datetime('now')
    WHERE id = ?`;
```

---

## Issue #3: Keywords Module Non-Functional ⚠️ CRITICAL

**Symptom:** `no such column named competition_score`

**Location:**

- `backend/database/init.ts` - Keywords table definition
- `backend/controllers/keywordController.ts` - createKeyword() method

**What Happened:**

- Test POST to /api/v1/keywords crashed server
- Server killed by unhandled exception
- Error: Keywords table missing `competition_score` column

**Action Items:**

1. [ ] Check keywords table schema in init.ts
2. [ ] Add missing `competition_score INTEGER` column
3. [ ] Check all columns used in keywordController
4. [ ] Add proper error handling (try-catch) to prevent crashes

**Database Migration:**

```sql
ALTER TABLE keywords ADD COLUMN competition_score INTEGER DEFAULT 0;
```

**Sample Table Definition:**

```typescript
`CREATE TABLE IF NOT EXISTS keywords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword TEXT NOT NULL UNIQUE,
    search_volume INTEGER,
    difficulty INTEGER,
    competition_score INTEGER DEFAULT 0,
    intent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`,
```

---

## Issue #4: Server Crashes on Invalid Queries ⚠️ MEDIUM

**Symptom:** Test suite gets "fetch failed" errors (server becomes unreachable)

**Root Cause:** Unhandled exceptions in controllers crash the server

**Location:**

- `backend/utils/dbHelper.ts`
- `backend/controllers/assetController.ts` - updateAsset()
- Error handling middleware

**Action Items:**

1. [ ] Add try-catch blocks to all controller methods
2. [ ] Return proper error responses instead of throwing
3. [ ] Add logging for debugging
4. [ ] Prevent unhandled promise rejections

**Example Fix:**

```typescript
export const someController = async (req: Request, res: Response) => {
  try {
    // ... logic here
  } catch (error: any) {
    console.error('[someController] Error:', error.message);
    res.status(500).json({
      error: 'Operation failed',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};
```

---

## Issue #5: Database Schema Inconsistencies ⚠️ MEDIUM

**Symptom:** Multiple "no such column" errors across different modules

**Affected Tables:**

- `assets` - Missing: `tags`, possibly others
- `keywords` - Missing: `competition_score`
- Need complete audit

**Action Items:**

1. [ ] Run schema audit: Compare database schema vs controller expectations
2. [ ] Create migration script for missing columns
3. [ ] Update schema initialization in init.ts

**Audit Script:**

```javascript
const tables = [
  'assets',
  'keywords',
  'campaigns',
  'projects',
  'users',
  'tasks',
  'backlinks',
  'services',
  'brands',
];

for (const table of tables) {
  const result = await pool.query(`PRAGMA table_info(${table})`);
  console.log(
    `\n${table} columns:`,
    result.rows.map((r) => r.name),
  );
}
```

---

## Issue #6: Asset by ID returns 404 but creation succeeds ⚠️ HIGH

**Symptom:** Asset created (ID 864) but cannot retrieve it

**Debug Steps:**

1. [ ] Verify asset exists in SQLite: `SELECT * FROM assets WHERE id = 864;`
2. [ ] Check if `getAsset()` method is missing from controller
3. [ ] Check if route is properly registered in api.ts

**Test Query:**

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3003/api/v1/assets/1
```

**Expected Response:**

```json
{
  "id": 1,
  "asset_name": "Test Asset",
  "asset_type": "Blog Banner",
  "status": "Draft"
  // ... other fields
}
```

---

## Priority Fixes (In Order)

### 🔴 CRITICAL (Fix immediately):

1. **Asset retrieval 404** - Impact: Asset module broken
   - Estimated Time: 15 minutes
   - Difficulty: Easy

2. **Keywords table missing columns** - Impact: Keywords module broken
   - Estimated Time: 20 minutes
   - Difficulty: Easy

### 🟠 HIGH (Fix next):

3. **Asset UPDATE schema mismatch** - Impact: Cannot modify assets
   - Estimated Time: 15 minutes
   - Difficulty: Easy

4. **Server error handling** - Impact: Server crashes on errors
   - Estimated Time: 30 minutes
   - Difficulty: Medium

### 🟡 MEDIUM (Fix when stable):

5. **Complete schema audit** - Impact: Future bugs
   - Estimated Time: 45 minutes
   - Difficulty: Medium

---

## Quick Implementation Checklist

### Step 1: Fix Keywords Table (5 min)

```typescript
// In backend/database/init.ts, add to keywords CREATE TABLE:
COLUMN`competition_score INTEGER DEFAULT 0`;
COLUMN`cpc DECIMAL(5,2)`;
COLUMN`search_trends TEXT`;
```

### Step 2: Add Missing Column to Assets (5 min)

```typescript
// In backend/database/init.ts or as migration:
ALTER TABLE assets ADD COLUMN tags TEXT;
```

### Step 3: Fix Asset Retrieval (10 min)

```typescript
// Ensure this exists in assetController.ts:
export const getAsset = async (req: Request, res: Response) => { ... };

// Ensure this exists in routes/api.ts:
router.get('/assets/:id', assetController.getAsset);
```

### Step 4: Fix Asset UPDATE (10 min)

- Remove `tags` reference if column doesn't exist
- Or add the column to schema first

### Step 5: Test (10 min)

```bash
node comprehensive-e2e-test.js
```

**Total Estimated Time: 40 minutes for all critical fixes**

---

## Test Execution After Fixes

```bash
cd /path/to/project
npm run dev:backend &  # Start backend
npm run dev:frontend & # Start frontend
node comprehensive-e2e-test.js  # Run tests
```

**Expected Results After Fixes:**

- ✅ Asset retrieval: PASS
- ✅ Keywords creation: PASS
- ✅ Asset updates: PASS
- ✅ Server stability: PASS
- **Target Success Rate: 95%+**

---

## Notes

- **Database:** Using SQLite for development, PostgreSQL for production
- **Foreign Keys:** Currently disabled in SQLite to avoid constraint errors
- **Timestamps:** Using `datetime('now')` for SQLite, `NOW()` for PostgreSQL
- **Null Handling:** Using `COALESCE()` for partial updates

---

**Last Updated:** 2026-03-02  
**Status:** Issues Identified & Solutions Proposed  
**Next Action:** Implement fixes and re-test
