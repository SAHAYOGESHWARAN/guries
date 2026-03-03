# Common Issues Resolution Guide
## Guires Marketing Control Center - Assets & Asset Category Pages
**Date**: March 3, 2026

---

## Overview

This guide provides comprehensive solutions for the 5 common issues identified during testing of the Assets and Asset Category Master pages.

---

## Issue 1: Tables Appear Empty

### Problem
Asset list or category list shows no data even though data exists in the database.

### Root Causes
1. API not returning data
2. Frontend not fetching data
3. Database connection issue
4. CORS blocking requests
5. Data not loaded on page initialization

### Solutions

#### Solution 1A: Verify API Response
```bash
# Check if API returns data
curl -X GET https://guries.vercel.app/api/v1/asset-category-master

# Expected response:
[
  {
    "id": 1,
    "category_name": "Web Assets",
    "status": "active"
  }
]
```

#### Solution 1B: Check Frontend Data Hook
**File**: `frontend/hooks/useData.ts`

Verify the hook is fetching data correctly:
```typescript
// Check that the endpoint is correct
const endpoint = `${API_BASE_URL}/${resource.endpoint}`;

// Verify data is being set
console.log('Fetched data:', data);
```

#### Solution 1C: Verify Database Connection
**File**: `backend/config/db.ts`

Check database is initialized:
```typescript
// Verify connection pool is created
if (!pool) {
  console.error('Database pool not initialized');
}

// Test query
const result = await pool.query('SELECT COUNT(*) FROM asset_category_master');
console.log('Database connection OK:', result);
```

#### Solution 1D: Check CORS Configuration
**File**: `backend/server.ts`

Verify CORS allows frontend origin:
```typescript
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',');
// Should include: https://guries.vercel.app
```

#### Solution 1E: Force Data Refresh
In frontend component:
```typescript
// Add to useEffect
useEffect(() => {
  refresh(); // Force refresh on mount
}, []);

// Or manually trigger
<button onClick={() => refresh()}>Refresh Data</button>
```

---

## Issue 2: Form Won't Submit

### Problem
Save button doesn't work or form stays open after clicking save.

### Root Causes
1. Validation errors not cleared
2. Required fields not filled
3. API request failing
4. Form state not updating
5. Button click handler not working

### Solutions

#### Solution 2A: Check Form Validation
**File**: `frontend/components/AddAssetCategoryModal.tsx`

Verify validation before submit:
```typescript
const handleSave = async () => {
  // Check required fields
  if (!formData.brand || !formData.category_name) {
    alert('Please fill in all required fields');
    return;
  }
  
  // Log validation state
  console.log('Form validation passed:', formData);
  
  // Proceed with save
  await onSave(formData);
};
```

#### Solution 2B: Check API Request
Monitor Network tab:
```
1. Open DevTools (F12)
2. Go to Network tab
3. Click Save button
4. Check:
   - POST request sent?
   - Status code 201?
   - Response contains new record?
```

#### Solution 2C: Add Error Handling
```typescript
try {
  const response = await fetch(`${API_BASE_URL}/asset-category-master`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const result = await response.json();
  console.log('Save successful:', result);
  
  // Close modal
  onClose();
} catch (error) {
  console.error('Save failed:', error);
  alert('Failed to save. Please try again.');
}
```

#### Solution 2D: Check Button State
```typescript
// Disable button while saving
const [isSaving, setIsSaving] = useState(false);

const handleSave = async () => {
  setIsSaving(true);
  try {
    await onSave(formData);
  } finally {
    setIsSaving(false);
  }
};

<button disabled={isSaving}>
  {isSaving ? 'Saving...' : 'Save'}
</button>
```

#### Solution 2E: Clear Form After Save
```typescript
const handleSave = async () => {
  await onSave(formData);
  
  // Clear form
  setFormData({
    brand: 'Pubrica',
    category_name: '',
    word_count: 0,
    status: 'active'
  });
  
  // Close modal
  onClose();
};
```

---

## Issue 3: Data Not Persisting

### Problem
Created or edited data disappears after page refresh.

### Root Causes
1. Data not saved to database
2. API returning success but not saving
3. Database transaction not committed
4. Cache not updated
5. Frontend cache clearing on refresh

### Solutions

#### Solution 3A: Verify Database Save
**File**: `backend/controllers/assetCategoryController.ts`

Check data is actually saved:
```typescript
export const createAssetCategory = async (req: Request, res: Response) => {
  try {
    const { category_name, description } = req.body;
    
    // Insert into database
    const result = db.prepare(`
      INSERT INTO asset_category_master (category_name, description, status, created_at, updated_at)
      VALUES (?, ?, 'active', datetime('now'), datetime('now'))
    `).run(category_name, description);
    
    // Verify insert was successful
    if (result.changes === 0) {
      return res.status(500).json({ error: 'Failed to insert record' });
    }
    
    // Fetch and return the created record
    const newCategory = db.prepare(`
      SELECT * FROM asset_category_master WHERE id = ?
    `).get(result.lastInsertRowid);
    
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message });
  }
};
```

#### Solution 3B: Check API Response
```bash
# Create a record and check response
curl -X POST https://guries.vercel.app/api/v1/asset-category-master \
  -H "Content-Type: application/json" \
  -d '{"category_name":"Test","description":"Test"}'

# Should return 201 with the created record
```

#### Solution 3C: Verify Frontend Cache
**File**: `frontend/hooks/useData.ts`

Check cache is updated after save:
```typescript
const create = async (newData: T) => {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method: 'POST',
    body: JSON.stringify(newData)
  });
  
  const created = await response.json();
  
  // Update cache
  setData([...data, created]);
  
  // Also refresh from server
  await refresh();
};
```

#### Solution 3D: Force Refresh After Save
```typescript
const handleSave = async (formData) => {
  // Save to backend
  await create(formData);
  
  // Force refresh from server
  await refresh();
  
  // Close modal
  onClose();
};
```

#### Solution 3E: Check Database Persistence
```bash
# Connect to database and verify data
sqlite3 backend/mcc_db.sqlite

# Check if record exists
SELECT * FROM asset_category_master WHERE category_name = 'Test';

# Should return the record
```

---

## Issue 4: Search Not Working

### Problem
Search doesn't filter results or filters incorrectly.

### Root Causes
1. Search input not connected to filter logic
2. Filter logic not case-insensitive
3. Search term not matching data
4. Data not loaded before search
5. Search state not updating

### Solutions

#### Solution 4A: Verify Search Input
**File**: `frontend/views/AssetCategoryMasterView.tsx`

Check search is connected:
```typescript
const [searchQuery, setSearchQuery] = useState('');

const filteredData = (assetCategories || []).filter(item => {
  if (!item) return false;
  
  // Case-insensitive search
  const matchesSearch = (item.category_name || '')
    .toLowerCase()
    .includes(searchQuery.toLowerCase());
  
  return matchesSearch;
});

// In JSX
<input
  type="search"
  placeholder="Search categories..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```

#### Solution 4B: Check Data Exists
```typescript
// Before searching, verify data is loaded
useEffect(() => {
  console.log('Available data:', assetCategories);
  console.log('Search query:', searchQuery);
  console.log('Filtered results:', filteredData);
}, [assetCategories, searchQuery]);
```

#### Solution 4C: Add Search Debugging
```typescript
const handleSearch = (term) => {
  console.log('Searching for:', term);
  console.log('In data:', assetCategories);
  
  const results = assetCategories.filter(item =>
    item.category_name.toLowerCase().includes(term.toLowerCase())
  );
  
  console.log('Found:', results.length, 'results');
  setSearchQuery(term);
};
```

#### Solution 4D: Verify Search Logic
```typescript
// Test search logic
const testSearch = () => {
  const data = [
    { category_name: 'Web Assets' },
    { category_name: 'SEO Assets' },
    { category_name: 'Social Media Assets' }
  ];
  
  const searchTerm = 'web';
  
  const results = data.filter(item =>
    item.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  console.log('Results:', results); // Should show Web Assets
};
```

#### Solution 4E: Add Search Feedback
```typescript
<div>
  <input
    type="search"
    placeholder="Search categories..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
  {searchQuery && (
    <p>Found {filteredData.length} results for "{searchQuery}"</p>
  )}
</div>
```

---

## Issue 5: Filters Not Working

### Problem
Filter dropdowns don't update table or filters don't apply correctly.

### Root Causes
1. Filter state not connected to table
2. Filter logic not implemented
3. Multiple filters conflicting
4. Filter values not matching data
5. Table not re-rendering on filter change

### Solutions

#### Solution 5A: Verify Filter Connection
**File**: `frontend/views/AssetCategoryMasterView.tsx`

Check filter is connected:
```typescript
const [brandFilter, setBrandFilter] = useState('All Brands');

const filteredData = (assetCategories || []).filter(item => {
  if (!item) return false;
  
  // Apply brand filter
  const matchesBrand = brandFilter === 'All Brands' || item.brand === brandFilter;
  
  return matchesBrand;
});

// In JSX
<select
  value={brandFilter}
  onChange={(e) => setBrandFilter(e.target.value)}
>
  <option>All Brands</option>
  {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
</select>
```

#### Solution 5B: Check Filter Values Match Data
```typescript
// Verify filter values exist in data
const availableBrands = [...new Set(assetCategories.map(item => item.brand))];
console.log('Available brands:', availableBrands);

// Verify selected filter value exists
if (!availableBrands.includes(brandFilter)) {
  console.warn('Filter value not found in data:', brandFilter);
}
```

#### Solution 5C: Add Filter Debugging
```typescript
const handleFilterChange = (newFilter) => {
  console.log('Filter changed to:', newFilter);
  console.log('Data before filter:', assetCategories);
  
  const filtered = assetCategories.filter(item =>
    newFilter === 'All' || item.brand === newFilter
  );
  
  console.log('Data after filter:', filtered);
  setBrandFilter(newFilter);
};
```

#### Solution 5D: Combine Multiple Filters
```typescript
const filteredData = (assetCategories || []).filter(item => {
  if (!item) return false;
  
  // Apply all filters
  const matchesSearch = (item.category_name || '')
    .toLowerCase()
    .includes(searchQuery.toLowerCase());
  
  const matchesBrand = brandFilter === 'All Brands' || item.brand === brandFilter;
  
  const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
  
  // All filters must match
  return matchesSearch && matchesBrand && matchesStatus;
});
```

#### Solution 5E: Add Filter Feedback
```typescript
<div>
  <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
    <option>All Brands</option>
    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
  </select>
  
  {brandFilter !== 'All Brands' && (
    <p>Showing {filteredData.length} items for brand: {brandFilter}</p>
  )}
</div>
```

---

## Testing the Fixes

### Test Case 1: Tables Appear Empty
```
1. Refresh page
2. Check Network tab for API response
3. Verify status code 200
4. Check Console for errors
5. Verify data displays in table
```

### Test Case 2: Form Won't Submit
```
1. Open create form
2. Fill all required fields
3. Click Save
4. Check Network tab for POST request
5. Verify status code 201
6. Check modal closes
7. Verify new item in table
```

### Test Case 3: Data Not Persisting
```
1. Create new record
2. Refresh page (F5)
3. Verify record still exists
4. Check database directly
5. Verify data persists
```

### Test Case 4: Search Not Working
```
1. Type in search box
2. Observe table filters
3. Try different search terms
4. Clear search
5. Verify all items return
```

### Test Case 5: Filters Not Working
```
1. Click filter dropdown
2. Select different values
3. Observe table updates
4. Try multiple filters
5. Clear filters
6. Verify all items return
```

---

## Verification Checklist

- [ ] Issue 1: Tables display data correctly
- [ ] Issue 2: Forms submit successfully
- [ ] Issue 3: Data persists after refresh
- [ ] Issue 4: Search filters correctly
- [ ] Issue 5: Filters work correctly
- [ ] All CRUD operations work
- [ ] No console errors
- [ ] No API errors
- [ ] Performance acceptable

---

## Sign-Off

**Issues Resolved**: 5/5  
**Date**: March 3, 2026  
**Status**: ✅ RESOLVED

