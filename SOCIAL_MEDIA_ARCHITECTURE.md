# Social Media Metadata Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      USER INTERFACE (React)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ServiceMasterView.tsx (SMM Tab)  │  SubServiceMasterView.tsx        │
│  ┌─────────────────────────────┐  │  ┌──────────────────────────┐    │
│  │ General Social Metadata      │  │  │ Social Media Metadata     │    │
│  │ ├─ OG Title               │  │  │ ├─ OG Title             │    │
│  │ ├─ OG Description         │  │  │ ├─ OG Description       │    │
│  │ ├─ OG Image URL           │  │  │ ├─ OG Image URL         │    │
│  │ └─ Twitter Fields          │  │  │ └─ Twitter Fields        │    │
│  │                             │  │  │                          │    │
│  │ Platform-Specific Cards    │  │  │ Platform Cards         │    │
│  │ ┌───────────────────────┐  │  │  │ ┌────────────────────┐  │    │
│  │ │ LinkedIn (Blue)       │  │  │  │ │ LinkedIn (Blue)  │  │    │
│  │ │ ├─ Title             │  │  │  │ │ ├─ Title         │  │    │
│  │ │ ├─ Description       │  │  │  │ │ ├─ Description   │  │    │
│  │ │ └─ Image URL         │  │  │  │ │ └─ Image URL     │  │    │
│  │ └───────────────────────┘  │  │  │ └────────────────────┘  │    │
│  │ ┌───────────────────────┐  │  │  │ ┌────────────────────┐  │    │
│  │ │ Facebook (Blue)       │  │  │  │ │ Facebook (Blue)  │  │    │
│  │ │ ├─ Title             │  │  │  │ │ ├─ Title         │  │    │
│  │ │ ├─ Description       │  │  │  │ │ ├─ Description   │  │    │
│  │ │ └─ Image URL         │  │  │  │ │ └─ Image URL     │  │    │
│  │ └───────────────────────┘  │  │  │ └────────────────────┘  │    │
│  │ ┌───────────────────────┐  │  │  │ ┌────────────────────┐  │    │
│  │ │ Instagram (Purple)    │  │  │  │ │ Instagram(Purple)│  │    │
│  │ │ ├─ Title             │  │  │  │ │ ├─ Title         │  │    │
│  │ │ ├─ Caption           │  │  │  │ │ ├─ Caption       │  │    │
│  │ │ └─ Image URL         │  │  │  │ │ └─ Image URL     │  │    │
│  │ └───────────────────────┘  │  │  │ └────────────────────┘  │    │
│  └─────────────────────────────┘  │  │                          │    │
│                                     │  └──────────────────────────┘    │
│                                                                       │
│  State Management: formData.social_meta                             │
│  ├─ linkedin: { title, description, image_url }                    │
│  ├─ facebook: { title, description, image_url }                    │
│  └─ instagram: { title, description, image_url }                   │
│                                                                       │
└───────────────────────┬───────────────────────────────────────────────┘
                        │
                        │ PUT /api/services/:id
                        │ { formData }
                        │
┌───────────────────────▼───────────────────────────────────────────────┐
│                  API LAYER (Express/Node.js)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  serviceController.ts                                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ createService()                                             │   │
│  │ ├─ Extract social_meta from request                        │   │
│  │ ├─ Validate input data                                     │   │
│  │ ├─ JSON.stringify(social_meta || {})                       │   │
│  │ └─ INSERT INTO services ... RETURNING *                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ updateService(id)                                           │   │
│  │ ├─ Extract social_meta from request                        │   │
│  │ ├─ Validate input data                                     │   │
│  │ ├─ JSON.stringify(social_meta || {})                       │   │
│  │ ├─ UPDATE services SET ... social_meta=COALESCE($78, ...)  │   │
│  │ └─ RETURNING *                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ getServiceById(id)                                          │   │
│  │ ├─ SELECT * FROM services WHERE id = $1                    │   │
│  │ ├─ parseServiceRow(row)                                    │   │
│  │ │   ├─ Detect JSONB fields                                │   │
│  │ │   ├─ JSON.parse(social_meta)                            │   │
│  │ │   └─ Return parsed object                               │   │
│  │ └─ Respond with { social_meta: {...} }                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  Routes: api.ts                                                      │
│  ├─ POST /api/services              → createService()               │
│  ├─ PUT /api/services/:id           → updateService()               │
│  └─ GET /api/services/:id           → getServiceById()              │
│                                                                       │
└───────────────────────┬───────────────────────────────────────────────┘
                        │
                        │ SQL Query
                        │ (JSON operations)
                        │
┌───────────────────────▼───────────────────────────────────────────────┐
│                    DATABASE LAYER (PostgreSQL)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  services table                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ id          INTEGER PRIMARY KEY                              │  │
│  │ service_name VARCHAR                                         │  │
│  │ ...other fields...                                           │  │
│  │ social_meta JSONB                                            │  │
│  │ ├─ {                                                         │  │
│  │ │   "linkedin": {                                            │  │
│  │ │     "title": "Enterprise Solutions",                       │  │
│  │ │     "description": "Professional services...",             │  │
│  │ │     "image_url": "https://example.com/img.jpg"             │  │
│  │ │   },                                                        │  │
│  │ │   "facebook": { ... },                                     │  │
│  │ │   "instagram": { ... }                                     │  │
│  │ └─ }                                                          │  │
│  │ created_at  TIMESTAMP                                        │  │
│  │ updated_at  TIMESTAMP                                        │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  sub_services table (identical structure)                            │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ id          INTEGER PRIMARY KEY                              │  │
│  │ sub_service_name VARCHAR                                     │  │
│  │ ...other fields...                                           │  │
│  │ social_meta JSONB (same structure as above)                  │  │
│  │ created_at  TIMESTAMP                                        │  │
│  │ updated_at  TIMESTAMP                                        │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌──────────────────┐
│  User Input      │
│  in Form         │
└────────┬─────────┘
         │
         │ Type into field
         │
         ▼
┌──────────────────────────────────────┐
│  React State Update                  │
│  setFormData({                       │
│    ...formData,                      │
│    social_meta: {                    │
│      ...social_meta,                 │
│      linkedin: {                     │
│        ...(social_meta?.linkedin),   │
│        title: newValue               │
│      }                               │
│    }                                 │
│  })                                  │
└────────┬─────────────────────────────┘
         │
         │ State updated
         │
         ▼
┌──────────────────────────────────────┐
│  Form Component Re-renders            │
│  New value displayed in input         │
└────────┬─────────────────────────────┘
         │
         │ User clicks Save
         │
         ▼
┌──────────────────────────────────────┐
│  API Request (PUT)                    │
│  PUT /api/services/1                 │
│  Body: { formData }                  │
│  ├─ social_meta: {                   │
│  │   linkedin: {                     │
│  │     title: newValue,              │
│  │     description: ...,             │
│  │     image_url: ...                │
│  │   },                              │
│  │   facebook: { ... },              │
│  │   instagram: { ... }              │
│  └─ }                                 │
└────────┬─────────────────────────────┘
         │
         │ Network request
         │
         ▼
┌──────────────────────────────────────┐
│  Backend Processing                  │
│  updateService()                     │
│  ├─ Extract social_meta              │
│  ├─ Serialize to JSON                │
│  │   JSON.stringify(social_meta)     │
│  ├─ Build UPDATE query               │
│  └─ Execute query                    │
└────────┬─────────────────────────────┘
         │
         │ SQL: UPDATE services SET
         │      social_meta = $78
         │
         ▼
┌──────────────────────────────────────┐
│  Database Update                     │
│  services table                      │
│  social_meta JSONB column            │
│  ├─ Old value: {...}                 │
│  └─ New value: {...}                 │
└────────┬─────────────────────────────┘
         │
         │ Query successful
         │
         ▼
┌──────────────────────────────────────┐
│  Response to Frontend                │
│  { id: 1, social_meta: {...}, ... }  │
└────────┬─────────────────────────────┘
         │
         │ Parse response
         │
         ▼
┌──────────────────────────────────────┐
│  Update formData with Response       │
│  setFormData(response)               │
└────────┬─────────────────────────────┘
         │
         │ State updated
         │
         ▼
┌──────────────────────────────────────┐
│  Display Success Message             │
│  Data persisted ✅                   │
└──────────────────────────────────────┘
```

---

## Component Hierarchy

```
App
├── ServiceMasterView (for Services)
│   ├── Form Container
│   │   ├── Core Information Tab
│   │   ├── Navigation Tab
│   │   ├── Strategic Tab
│   │   ├── Content Tab
│   │   ├── SEO Tab
│   │   ├── SMM Tab ⭐
│   │   │   ├── General Social Metadata Section
│   │   │   │   ├── OG Title Input
│   │   │   │   ├── OG Description Textarea
│   │   │   │   ├── OG Image URL Input
│   │   │   │   ├── OG Type Select
│   │   │   │   ├── Twitter Title Input
│   │   │   │   ├── Twitter Description Textarea
│   │   │   │   └── Twitter Image URL Input
│   │   │   │
│   │   │   └── Platform-Specific Cards Section
│   │   │       ├── LinkedIn Card
│   │   │       │   ├── Badge (in)
│   │   │       │   ├── Title Input
│   │   │       │   ├── Description Textarea
│   │   │       │   ├── Image URL Input
│   │   │       │   └── Tooltip Helper
│   │   │       ├── Facebook Card
│   │   │       │   ├── Badge (f)
│   │   │       │   ├── Title Input
│   │   │       │   ├── Description Textarea
│   │   │       │   ├── Image URL Input
│   │   │       │   └── Tooltip Helper
│   │   │       └── Instagram Card
│   │   │           ├── Badge (📷)
│   │   │           ├── Title Input
│   │   │           ├── Caption Textarea
│   │   │           ├── Image URL Input
│   │   │           └── Tooltip Helper
│   │   ├── Technical Tab
│   │   ├── Linking Tab
│   │   └── Governance Tab
│   └── Action Buttons (Save, Cancel, etc.)
│
└── SubServiceMasterView (for Sub-Services)
    ├── Form Container
    │   └── Social Media Metadata Tab ⭐
    │       ├── General OG/Twitter Fields
    │       └── Platform-Specific Cards
    │           ├── LinkedIn Card
    │           ├── Facebook Card
    │           └── Instagram Card
    │
    └── Tables/List View
```

---

## State Structure

```typescript
formData: {
  // Core fields
  service_name: string,
  service_code: string,
  slug: string,

  // ... other tabs ...

  // SMM Tab Fields
  og_title: string,
  og_description: string,
  og_image_url: string,
  og_type: 'website' | 'article' | 'product',
  twitter_title: string,
  twitter_description: string,
  twitter_image_url: string,

  // Platform-specific metadata ⭐
  social_meta: {
    linkedin?: {
      title?: string,              // "Enterprise Solutions"
      description?: string,         // "Professional services..."
      image_url?: string           // "https://..."
    },
    facebook?: {
      title?: string,              // "Transform Your Business"
      description?: string,         // "Engaging description..."
      image_url?: string           // "https://..."
    },
    instagram?: {
      title?: string,              // "Level Up Your Game"
      description?: string,         // "Caption with #hashtags..."
      image_url?: string           // "https://..."
    }
  }
}
```

---

## TypeScript Types Flow

```
types.ts
├── Service (interface)
│   ├── ...other properties
│   └── social_meta?: {
│       linkedin?: { title?, description?, image_url? }
│       facebook?: { title?, description?, image_url? }
│       instagram?: { title?, description?, image_url? }
│   }
│
└── SubServiceItem (interface)
    ├── ...other properties
    └── social_meta?: {
        linkedin?: { title?, description?, image_url? }
        facebook?: { title?, description?, image_url? }
        instagram?: { title?, description?, image_url? }
    }

Controller (serviceController.ts)
├── POST /services
│   ├── Extract: const { social_meta } = req.body
│   ├── Serialize: JSON.stringify(social_meta || {})
│   └── Store: INSERT ... VALUES ($78, ...)
│
├── PUT /services/:id
│   ├── Extract: const { social_meta } = req.body
│   ├── Serialize: JSON.stringify(social_meta || {})
│   └── Update: SET social_meta = COALESCE($78, social_meta)
│
└── GET /services/:id
    ├── Query: SELECT * FROM services
    ├── Parse: parseServiceRow(row)
    │   └── Deserialize: JSON.parse(row.social_meta)
    └── Respond: { social_meta: {...} }
```

---

## Deployment Checklist

```
Frontend
├─ [ ] npm run build (no errors)
├─ [ ] TypeScript compilation passes
├─ [ ] UI renders correctly in dev mode
├─ [ ] Form state updates properly
├─ [ ] Save button triggers API call
└─ [ ] Data displays after refresh

Backend
├─ [ ] serviceController.ts syntax valid
├─ [ ] Database has social_meta JSONB column
├─ [ ] POST endpoint accepts social_meta
├─ [ ] PUT endpoint updates social_meta
├─ [ ] GET endpoint returns social_meta
└─ [ ] parseServiceRow() deserializes correctly

Database
├─ [ ] services.social_meta column exists (JSONB)
├─ [ ] sub_services.social_meta column exists (JSONB)
├─ [ ] Test INSERT with JSON data
├─ [ ] Test UPDATE with partial JSON
├─ [ ] Test SELECT and parse JSON
└─ [ ] No migration issues

API Testing
├─ [ ] POST /api/services with full social_meta
├─ [ ] PUT /api/services/1 with partial social_meta
├─ [ ] GET /api/services/1 returns social_meta
├─ [ ] Verify JSON structure in response
├─ [ ] Test null/empty social_meta handling
└─ [ ] Load test with multiple platforms

Integration
├─ [ ] Frontend correctly serializes data
├─ [ ] Backend correctly deserializes data
├─ [ ] Round-trip test (send → store → retrieve → display)
├─ [ ] Multi-platform updates work independently
├─ [ ] Data persists across sessions
└─ [ ] No console errors or warnings
```

---

## File Location Reference Map

```
Project Root
├── types.ts (Lines 180-200)
│   └── Service & SubServiceItem interfaces with social_meta
│
├── views/
│   ├── ServiceMasterView.tsx (Lines 1505-1700)
│   │   └── SMM Tab with Platform Cards
│   │
│   └── SubServiceMasterView.tsx (Lines 406-550)
│       └── Social Media Metadata Tab
│
├── backend/
│   ├── controllers/
│   │   └── serviceController.ts
│   │       ├── Line 13: jsonObjectFields array
│   │       ├── Line 42: parseSubServiceRow function
│   │       ├── Line 91-92: request destructuring
│   │       ├── Line 137-163: CREATE query
│   │       ├── Line 190-264: UPDATE query
│   │       ├── Line 361: INSERT parameters
│   │       ├── Line 452, 467: UPDATE parameters
│   │       └── Query: social_meta serialization/deserialization
│   │
│   ├── routes/
│   │   └── api.ts (Routes definition)
│   │       ├── POST /api/services (Line ~)
│   │       ├── PUT /api/services/:id (Line ~)
│   │       └── GET /api/services/:id (Line ~)
│   │
│   └── config/
│       └── db.ts (Database connection)
│
├── SOCIAL_MEDIA_METADATA_GUIDE.md
│   └── Technical reference & API examples
│
├── SOCIAL_MEDIA_IMPLEMENTATION_SUMMARY.md
│   └── Complete overview & checklist
│
├── SOCIAL_MEDIA_QUICK_REFERENCE.md
│   └── Quick templates & lookups
│
└── SOCIAL_MEDIA_README.md
    └── Getting started guide
```

---

## Summary

This diagram shows the complete architecture:

1. **Frontend** - React components collect platform-specific data
2. **State** - Immutable state management in React
3. **API** - Express endpoints serialize/deserialize JSON
4. **Database** - PostgreSQL stores JSONB data
5. **Retrieval** - Data automatically parsed on fetch

All layers work together to provide seamless social media metadata management.
