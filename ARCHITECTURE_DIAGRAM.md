# Architecture Diagram - Service Names Display Solution

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ServiceMasterView.tsx                                           │
│  ├─ useData<Service>('services')                                │
│  │  └─ Fetches from /api/v1/services                            │
│  │                                                               │
│  └─ Table Component                                             │
│     ├─ Column: SERVICE NAME                                     │
│     │  └─ Accessor: item.service_name                           │
│     │     ├─ "SEO Optimization"                                 │
│     │     ├─ "Content Marketing"                                │
│     │     ├─ "Social Media Management"                          │
│     │     ├─ "PPC Advertising"                                  │
│     │     └─ "Email Marketing"                                  │
│     │                                                            │
│     ├─ Column: SERVICE CODE                                     │
│     │  └─ Accessor: item.service_code                           │
│     │                                                            │
│     ├─ Column: STATUS                                           │
│     │  └─ Accessor: item.status                                 │
│     │                                                            │
│     └─ ... other columns                                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    HTTP GET Request
                   /api/v1/services
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  routes/api.ts                                                   │
│  └─ router.get('/services', serviceController.getServices)      │
│                                                                   │
│  controllers/serviceController.ts                               │
│  └─ export const getServices = async (req, res) => {            │
│     ├─ const result = await pool.query(                         │
│     │    'SELECT * FROM services ORDER BY id ASC'               │
│     │ )                                                          │
│     ├─ const parsedRows = result.rows.map(parseServiceRow)      │
│     └─ res.status(200).json(parsedRows)                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    pool.query() call
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  config/db.ts                                                    │
│  └─ Determines database type:                                   │
│     ├─ PostgreSQL (if DB_CLIENT='pg')                           │
│     └─ Mock Database (default)                                  │
│                                                                   │
│  config/mockDb.ts ← MODIFIED                                    │
│  └─ mockPool.query()                                            │
│     └─ Returns mockServices array                               │
│                                                                   │
│  mockServices = [                                               │
│    {                                                             │
│      id: 1,                                                      │
│      service_name: "SEO Optimization",                          │
│      service_code: "SEO-001",                                   │
│      slug: "seo-optimization",                                  │
│      full_url: "/services/seo-optimization",                    │
│      menu_heading: "SEO Services",                              │
│      short_tagline: "Boost your online visibility",             │
│      service_description: "Comprehensive SEO services...",      │
│      status: "Published",                                       │
│      language: "en",                                            │
│      show_in_main_menu: 1,                                      │
│      show_in_footer_menu: 0,                                    │
│      include_in_xml_sitemap: 1,                                 │
│      h1: "Professional SEO Optimization Services",              │
│      meta_title: "SEO Optimization Services | Expert...",       │
│      meta_description: "Improve your search rankings...",       │
│      content_type: "Pillar",                                    │
│      buyer_journey_stage: "Awareness",                          │
│      industry_ids: "[]",                                        │
│      country_ids: "[]",                                         │
│      linked_assets_ids: "[]",                                   │
│      linked_insights_ids: "[]",                                 │
│      created_at: "2026-02-03T...",                              │
│      updated_at: "2026-02-03T..."                               │
│    },                                                            │
│    { id: 2, service_name: "Content Marketing", ... },           │
│    { id: 3, service_name: "Social Media Management", ... },     │
│    { id: 4, service_name: "PPC Advertising", ... },             │
│    { id: 5, service_name: "Email Marketing", ... }              │
│  ]                                                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    JSON Response
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    RESPONSE PROCESSING                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  parseServiceRow(row)                                           │
│  ├─ Parse JSON fields:                                          │
│  │  ├─ industry_ids: "[]" → []                                  │
│  │  ├─ country_ids: "[]" → []                                   │
│  │  ├─ linked_assets_ids: "[]" → []                             │
│  │  └─ linked_insights_ids: "[]" → []                           │
│  │                                                               │
│  └─ Return complete Service object                              │
│                                                                   │
│  Frontend receives:                                             │
│  [                                                               │
│    {                                                             │
│      id: 1,                                                      │
│      service_name: "SEO Optimization",  ← DISPLAYED             │
│      service_code: "SEO-001",           ← DISPLAYED             │
│      status: "Published",               ← DISPLAYED             │
│      ... all other fields               ← AVAILABLE             │
│    },                                                            │
│    ... 4 more services                                          │
│  ]                                                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Table Renders
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    TABLE DISPLAY                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  SERVICE NAME              SERVICE CODE    STATUS                │
│  ─────────────────────────────────────────────────────           │
│  SEO Optimization          SEO-001         Published             │
│  Content Marketing         CM-001          Published             │
│  Social Media Management   SMM-001         Published             │
│  PPC Advertising           PPC-001         Published             │
│  Email Marketing           EM-001          Published             │
│                                                                   │
│  ✅ Service names display properly                              │
│  ✅ No dashes or empty values                                   │
│  ✅ All data visible                                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────────────┐
│  User Opens      │
│  Service Master  │
│  View            │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  ServiceMasterView.tsx               │
│  useData<Service>('services')        │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  useData Hook                        │
│  - Checks RESOURCE_MAP               │
│  - services → /api/v1/services       │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  HTTP GET Request                    │
│  /api/v1/services                    │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Backend Router                      │
│  routes/api.ts                       │
│  router.get('/services', ...)        │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Service Controller                  │
│  getServices(req, res)               │
│  - pool.query('SELECT * FROM...')    │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Database Layer                      │
│  config/db.ts                        │
│  - Uses mockPool (default)           │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Mock Database                       │
│  config/mockDb.ts                    │
│  - mockPool.query()                  │
│  - Returns mockServices array        │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Parse Service Rows                  │
│  parseServiceRow(row)                │
│  - Parse JSON fields                 │
│  - Return complete objects           │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  HTTP Response                       │
│  200 OK                              │
│  [Service[], Service[], ...]         │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Frontend Receives Data              │
│  setData(serviceArray)               │
│  - Updates state                     │
│  - Triggers re-render                │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  Table Component Renders             │
│  - Maps over services array          │
│  - Renders each row                  │
│  - Displays service_name             │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│  User Sees Table                     │
│  ✅ Service names visible            │
│  ✅ All data displayed               │
│  ✅ No dashes or empty values        │
└──────────────────────────────────────┘
```

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ServiceMasterView.tsx                                       │
│  ├─ Imports useData hook                                    │
│  ├─ Calls useData<Service>('services')                      │
│  ├─ Receives: { data, loading, error, create, update, ... }│
│  ├─ Renders Table component                                │
│  │  └─ Passes data={filteredData}                           │
│  │     └─ Maps over services                                │
│  │        └─ Renders SERVICE NAME column                    │
│  │           └─ Displays item.service_name                  │
│  │                                                           │
│  └─ Handles user interactions                               │
│     ├─ Edit service                                         │
│     ├─ Delete service                                       │
│     └─ Create new service                                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         ↓                                    ↑
         │ useData hook                       │ Returns data
         │ ('services')                       │
         ↓                                    ↑
┌─────────────────────────────────────────────────────────────┐
│                    Hooks Layer                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  useData.ts                                                  │
│  ├─ Checks RESOURCE_MAP['services']                         │
│  │  └─ endpoint: 'services'                                 │
│  │  └─ event: 'service'                                     │
│  │                                                           │
│  ├─ Calls fetchData()                                       │
│  │  └─ fetch(`${API_BASE_URL}/services`)                    │
│  │     └─ /api/v1/services                                  │
│  │                                                           │
│  ├─ Manages state                                           │
│  │  ├─ data: Service[]                                      │
│  │  ├─ loading: boolean                                     │
│  │  ├─ error: string | null                                 │
│  │  └─ isOffline: boolean                                   │
│  │                                                           │
│  └─ Provides methods                                        │
│     ├─ create(item)                                         │
│     ├─ update(id, updates)                                  │
│     ├─ remove(id)                                           │
│     └─ refresh()                                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         ↓                                    ↑
         │ HTTP Request                       │ HTTP Response
         │ GET /api/v1/services               │ 200 OK
         ↓                                    ↑
┌─────────────────────────────────────────────────────────────┐
│                    Backend Layer                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  routes/api.ts                                               │
│  └─ router.get('/services', serviceController.getServices)  │
│                                                               │
│  controllers/serviceController.ts                           │
│  └─ getServices(req, res)                                   │
│     ├─ pool.query('SELECT * FROM services')                │
│     ├─ parseServiceRow(row) for each row                    │
│     └─ res.json(parsedRows)                                 │
│                                                               │
│  config/db.ts                                                │
│  └─ Exports pool                                            │
│     └─ Uses mockPool by default                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         ↓                                    ↑
         │ pool.query()                       │ Returns rows
         │                                    │
         ↓                                    ↑
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  config/mockDb.ts                                            │
│  └─ mockPool                                                │
│     └─ query(sql, params)                                   │
│        ├─ Checks if query includes 'services'               │
│        ├─ Returns mockServices array                        │
│        └─ Each service has all fields populated             │
│                                                               │
│  mockServices = [                                           │
│    { id: 1, service_name: "SEO Optimization", ... },        │
│    { id: 2, service_name: "Content Marketing", ... },       │
│    { id: 3, service_name: "Social Media Management", ... }, │
│    { id: 4, service_name: "PPC Advertising", ... },         │
│    { id: 5, service_name: "Email Marketing", ... }          │
│  ]                                                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Before & After Comparison

### BEFORE (Problem)
```
┌─────────────────────────────────────────────────────────────┐
│  SERVICE NAME    SERVICE CODE    STATUS                      │
├─────────────────────────────────────────────────────────────┤
│  —               —               —                           │
│  —               —               —                           │
│  —               —               —                           │
│  —               —               —                           │
│  —               —               —                           │
└─────────────────────────────────────────────────────────────┘

Issue: mockServices had incomplete data
- Only 2 services
- Missing fields
- service_name not populated
```

### AFTER (Solution)
```
┌─────────────────────────────────────────────────────────────┐
│  SERVICE NAME                SERVICE CODE    STATUS          │
├─────────────────────────────────────────────────────────────┤
│  SEO Optimization            SEO-001         Published       │
│  Content Marketing           CM-001          Published       │
│  Social Media Management     SMM-001         Published       │
│  PPC Advertising             PPC-001         Published       │
│  Email Marketing             EM-001          Published       │
└─────────────────────────────────────────────────────────────┘

Solution: mockServices now has complete data
- 5 services
- All fields populated
- service_name displays properly
```

## Summary

The solution involves:
1. **Frontend** - Correctly accesses item.service_name
2. **Backend** - Returns complete service objects
3. **Database** - Provides populated service data
4. **Data Flow** - Complete chain from UI to database and back

All components work together to display service names properly in the table.
