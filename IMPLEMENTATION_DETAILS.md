# Implementation Details - Data Persistence Fixes

## Architecture Overview

### Data Flow
```
User Action (Create/Update/Delete)
    ↓
Frontend Form Submission
    ↓
API Call (POST/PUT/DELETE)
    ↓
Backend Processing
    ↓
Database Insert/Update/Delete
    ↓
API Response with ID
    ↓
Frontend Updates State + Global Cache
    ↓
Socket Event Broadcast
    ↓
Other Clients Update Cache + State
```

## Key Components

### 1. Global Cache (dataCache)
**Location**: `frontend/hooks/useDataCache.ts`

```typescript
// Cache structure
interface CacheEntry<T> {
    data: T[];
    timestamp: number;
    ttl: number; // Time to live in milliseconds
}

// Collection-specific TTLs (all now 5 minutes)
COLLECTION_TTL = {
    'campaigns': 5 * 60 * 1000,
    'projects': 5 * 60 * 1000,
    'tasks': 5 * 60 * 1000,
    'content': 5 * 60 * 1000,
    'assetLibrary': 5 * 60 * 1000,
}
```

**Key Methods**:
- `get<T>(key)`: Returns cached data if not expired, null otherwise
- `set<T>(key, data, ttl)`: Stores data with TTL
- `invalidate(key)`: Removes specific cache entry
- `applyOptimisticCreate/Update/Delete`: Updates cache with new/modified/deleted items

### 2. useData Hook
**Location**: `frontend/hooks/useData.ts`

**Initialization Flow**:
```typescript
useEffect(() => {
    // 1. Check backend availability
    await checkBackendAvailability();
    
    // 2. Always fetch fresh data on mount (soft refresh)
    fetchData(false);
    
    // 3. Setup socket listeners
    socket.on('campaign_created', handleCreate);
    socket.on('campaign_updated', handleUpdate);
    socket.on('campaign_deleted', handleDelete);
}, [collection]);
```

**Socket Event Handlers** (Updated):
```typescript
const handleCreate = (newItem: T) => {
    setData(prev => {
        const updated = [newItem, ...prev];
        dataCache.set(collection, updated); // ← NEW: Update cache
        return updated;
    });
};

const handleUpdate = (updatedItem: T) => {
    setData(prev => {
        const updated = prev.map(item => 
            (item as any).id === updatedItem.id ? updatedItem : item
        );
        dataCache.set(collection, updated); // ← NEW: Update cache
        return updated;
    });
};

const handleDelete = ({ id }: { id: number | string }) => {
    setData(prev => {
        const updated = prev.filter(item => (item as any).id !== id);
        dataCache.set(collection, updated); // ← NEW: Update cache
        return updated;
    });
};
```

### 3. Backend API Responses

#### Campaign Creation (Before)
```typescript
// Problem: PostgreSQL doesn't return inserted rows
const result = await pool.query(query, values);
const campaignId = result.rows?.[0]?.id; // ← Returns undefined for PostgreSQL
```

#### Campaign Creation (After)
```typescript
// Solution: Use RETURNING clause for PostgreSQL
const isPostgres = process.env.NODE_ENV === 'production' || process.env.USE_PG === 'true';
const query = isPostgres ? `
    INSERT INTO campaigns (...) VALUES ($1, $2, ...) RETURNING *;
` : `
    INSERT INTO campaigns (...) VALUES (?, ?, ...);
`;

const result = await pool.query(query, values);
const campaign = result.rows?.[0]; // ← Works for both PostgreSQL and SQLite
```

### 4. Linked Assets Resolution

#### Backend Fallback Query
```typescript
// Primary query (requires explicit service_asset_links records)
let query = `
    SELECT DISTINCT a.* FROM assets a
    INNER JOIN service_asset_links sal ON a.id = sal.asset_id
    WHERE sal.service_id = ?
`;

let result = await pool.query(query, params);

// Fallback query (checks static_service_links JSON field)
if (result.rows.length === 0) {
    const fallbackQuery = `
        SELECT DISTINCT a.* FROM assets a
        WHERE a.static_service_links LIKE ?
    `;
    const searchPattern = `%"service_id":${service_id}%`;
    result = await pool.query(fallbackQuery, [searchPattern]);
}
```

#### Frontend Cache Integration
```typescript
// ServiceLinkedAssetsDisplay component
const cacheKey = `service_${serviceId}_linked_assets`;

// Try cache first
const cachedAssets = dataCache.get<LinkedAsset>(cacheKey);
if (cachedAssets && cachedAssets.length > 0) {
    setAssets(cachedAssets);
    setLoading(false);
    // Fetch fresh in background
    fetchFresh();
    return;
}

// Fetch fresh data
async function fetchFresh() {
    const response = await fetch(`${apiUrl}${endpoint}`);
    const data = await response.json();
    
    // Cache results
    if (data.length > 0) {
        dataCache.set(cacheKey, data, 5 * 60 * 1000);
    }
    
    setAssets(data);
}
```

## Data Flow Examples

### Example 1: Creating a Campaign

```
1. User fills form and clicks "Create Campaign"
   ↓
2. Frontend calls: POST /api/v1/campaigns
   {
     campaign_name: "Q1 2024 Campaign",
     campaign_type: "Content",
     status: "planning"
   }
   ↓
3. Backend (campaignController.ts):
   - Validates input
   - Executes INSERT with RETURNING *
   - Returns: { id: 123, campaign_name: "Q1 2024 Campaign", ... }
   ↓
4. Frontend (useData.ts):
   - Receives response with ID
   - Updates component state: setData([newCampaign, ...prev])
   - Updates global cache: dataCache.set('campaigns', [newCampaign, ...prev])
   - Saves to localStorage
   ↓
5. Backend emits socket event:
   - getSocket().emit('campaign_created', newCampaign)
   ↓
6. Other clients receive socket event:
   - handleCreate(newCampaign)
   - Updates their state and cache
   ↓
7. User navigates to another module
   - Campaign data persists in global cache (5 min TTL)
   - Campaign data persists in localStorage
   ↓
8. User returns to campaigns module
   - Component mounts
   - Calls fetchData(false) - soft refresh
   - Loads from cache while fetching fresh data
   - Campaign appears immediately
```

### Example 2: Viewing Linked Assets

```
1. User opens service detail page
   ↓
2. ServiceLinkedAssetsDisplay component mounts
   ↓
3. Check cache: dataCache.get('service_123_linked_assets')
   ↓
4a. If cached (and not expired):
    - Display cached assets immediately
    - Fetch fresh data in background
    ↓
4b. If not cached:
    - Fetch from API: GET /api/v1/asset-service-linking/services/123/linked-assets
    ↓
5. Backend (assetServiceLinkingController.ts):
   - Try primary query (INNER JOIN service_asset_links)
   - If no results, try fallback (check static_service_links JSON)
   - Return assets array
   ↓
6. Frontend:
    - Cache results: dataCache.set('service_123_linked_assets', assets)
    - Display assets
    ↓
7. User navigates away
   - Cache persists (5 min TTL)
   ↓
8. User returns to service
   - Component mounts
   - Loads from cache immediately
   - Fetches fresh data in background
```

## Configuration

### Environment Variables
```bash
# Backend
NODE_ENV=production          # Enables PostgreSQL
USE_PG=true                 # Force PostgreSQL
DB_CLIENT=pg                # Use PostgreSQL client

# Frontend
VITE_API_URL=/api/v1        # API base URL
VITE_SOCKET_URL=            # Socket.io URL (defaults to window.location.origin)
```

### Cache TTL Configuration
Edit `frontend/hooks/useDataCache.ts`:
```typescript
private readonly COLLECTION_TTL: Record<string, number> = {
    'campaigns': 5 * 60 * 1000,      // 5 minutes
    'projects': 5 * 60 * 1000,       // 5 minutes
    'tasks': 5 * 60 * 1000,          // 5 minutes
    'content': 5 * 60 * 1000,        // 5 minutes
    'assetLibrary': 5 * 60 * 1000,   // 5 minutes
};
```

## Debugging

### Enable Detailed Logging
```typescript
// In useData.ts, set NODE_ENV to development
if (process.env.NODE_ENV === 'development') {
    console.log(`[useData] Fetching ${collection}...`);
    console.log(`[useData] Cache hit for ${collection}`);
    console.log(`[useData] Socket event received: ${event}`);
}
```

### Check Cache Status
```typescript
// In browser console
import { dataCache } from './hooks/useDataCache';
dataCache.getStats(); // Returns { keys: [...], size: N }
dataCache.get('campaigns'); // Returns cached campaigns or null
```

### Monitor Socket Events
```typescript
// In browser console
socket.on('campaign_created', (data) => {
    console.log('Campaign created:', data);
});
socket.on('campaign_updated', (data) => {
    console.log('Campaign updated:', data);
});
socket.on('campaign_deleted', (data) => {
    console.log('Campaign deleted:', data);
});
```

## Performance Considerations

### Cache Hit Rate
- Initial load: 0% (no cache)
- After first load: 100% (until TTL expires)
- After 5 minutes: 0% (TTL expired, refresh on mount)

### API Call Reduction
- Without cache: 1 call per component mount
- With cache: 0 calls (if not expired)
- With soft refresh: 1 call (but keeps existing data)

### Network Optimization
- Soft refresh keeps existing data while loading
- Prevents UI flickering
- Reduces perceived latency

## Testing Strategy

### Unit Tests
```typescript
// Test cache expiration
const cache = new DataCache();
cache.set('test', [{ id: 1 }], 100); // 100ms TTL
expect(cache.get('test')).toEqual([{ id: 1 }]);
await sleep(150);
expect(cache.get('test')).toBeNull();

// Test socket event handling
const handleCreate = (item) => {
    dataCache.set('campaigns', [item, ...prev]);
};
handleCreate({ id: 1, name: 'Test' });
expect(dataCache.get('campaigns')).toContainEqual({ id: 1, name: 'Test' });
```

### Integration Tests
```typescript
// Test full flow: create → cache → navigate → return
1. Create campaign via API
2. Verify campaign in cache
3. Simulate navigation (unmount component)
4. Simulate return (mount component)
5. Verify campaign still in cache
6. Verify campaign displays
```

### E2E Tests
```typescript
// Test user workflow
1. Create new campaign
2. Verify it appears in list
3. Navigate to projects
4. Navigate back to campaigns
5. Verify campaign still appears
6. Refresh page
7. Verify campaign still appears
```
