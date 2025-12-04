# Social Media Metadata Implementation Guide

## Overview

The application now supports comprehensive platform-specific social media metadata management for both **Services** and **Sub-Services**. This includes LinkedIn, Facebook, and Instagram platform-specific content fields.

---

## Data Structure

### Backend Type Definition (types.ts)

```typescript
social_meta?: {
    linkedin?: {
        title?: string;           // Professional headline
        description?: string;     // Professional summary
        image_url?: string;       // Featured image (1200x627px recommended)
    };
    facebook?: {
        title?: string;           // Engaging headline
        description?: string;     // Engaging summary
        image_url?: string;       // Share image (1200x628px recommended)
    };
    instagram?: {
        title?: string;           // Post hook/headline
        description?: string;     // Caption with hashtags
        image_url?: string;       // Post image (1080x1080px recommended)
    };
};
```

---

## Frontend Implementation

### ServiceMasterView.tsx

**Location:** `views/ServiceMasterView.tsx`  
**Tab:** SMM (Social Media Marketing)  
**Lines:** ~1505-1700

#### Features:

- **General Social Metadata Section:**

  - OG Title & Description
  - Twitter Title & Description
  - OG Image URL & Type
  - Twitter Image URL

- **Platform-Specific Cards:**

1. **LinkedIn Card** (Blue gradient, `in` badge)

   - Professional headline title field
   - Professional summary description field
   - Featured image URL field
   - Color-coded focus ring (blue: `focus:ring-blue-500`)
   - Tooltips with professional guidance

2. **Facebook Card** (Blue gradient, `f` badge)

   - Engaging headline title field
   - Engaging summary description field
   - Share image URL field
   - Color-coded focus ring (blue: `focus:ring-blue-500`)
   - Tooltips with engagement guidance

3. **Instagram Card** (Purple gradient, `📷` badge)
   - Post hook/headline title field
   - Caption with hashtags description field
   - Post image URL field
   - Color-coded focus ring (purple: `focus:ring-purple-500`)
   - Tooltips with caption guidance

#### State Management:

```typescript
// Update LinkedIn title
setFormData({
  ...formData,
  social_meta: {
    ...formData.social_meta,
    linkedin: {
      ...(formData.social_meta?.linkedin || {}),
      title: e.target.value,
    },
  },
});
```

### SubServiceMasterView.tsx

**Location:** `views/SubServiceMasterView.tsx`  
**Tab:** Social Media Metadata  
**Lines:** ~406-550

#### Full Feature Parity:

- Identical platform-specific cards (LinkedIn, Facebook, Instagram)
- Same styling and visual design
- Matching state management patterns
- Same tooltip guidance text
- Synchronized field structure

---

## Backend Implementation

### Database Schema

The `services` and `sub_services` tables include:

- **Column:** `social_meta` (JSONB type)
- **Storage:** Stores the complete nested object structure
- **Parsing:** Automatically parsed as JSON on retrieval

### API Endpoints

#### Create Service

**Endpoint:** `POST /api/services`

```bash
curl -X POST http://localhost:3001/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "service_name": "Digital Marketing",
    "social_meta": {
      "linkedin": {
        "title": "Enterprise Digital Marketing Solutions",
        "description": "Professional digital marketing strategies for enterprises",
        "image_url": "https://example.com/linkedin-image.jpg"
      },
      "facebook": {
        "title": "Transform Your Digital Presence",
        "description": "Engaging digital marketing solutions for your business",
        "image_url": "https://example.com/facebook-image.jpg"
      },
      "instagram": {
        "title": "Level Up Your Marketing Game",
        "description": "Digital strategies with #marketing #business #growth #socialmedia",
        "image_url": "https://example.com/instagram-image.jpg"
      }
    }
  }'
```

#### Update Service

**Endpoint:** `PUT /api/services/:id`

```bash
curl -X PUT http://localhost:3001/api/services/1 \
  -H "Content-Type: application/json" \
  -d '{
    "social_meta": {
      "linkedin": {
        "title": "Updated Professional Title",
        "description": "Updated professional summary",
        "image_url": "https://example.com/new-linkedin-image.jpg"
      }
    }
  }'
```

#### Retrieve Service

**Endpoint:** `GET /api/services/:id`

**Response:**

```json
{
  "id": 1,
  "service_name": "Digital Marketing",
  "social_meta": {
    "linkedin": {
      "title": "Enterprise Digital Marketing Solutions",
      "description": "Professional digital marketing strategies for enterprises",
      "image_url": "https://example.com/linkedin-image.jpg"
    },
    "facebook": {
      "title": "Transform Your Digital Presence",
      "description": "Engaging digital marketing solutions for your business",
      "image_url": "https://example.com/facebook-image.jpg"
    },
    "instagram": {
      "title": "Level Up Your Marketing Game",
      "description": "Digital strategies with #marketing #business #growth #socialmedia",
      "image_url": "https://example.com/instagram-image.jpg"
    }
  }
}
```

### Controller (serviceController.ts)

**Serialization (Create):**

```typescript
JSON.stringify(social_meta || {});
```

**Deserialization (Parse):**

```typescript
const parseServiceRow = (row: any) => {
  const jsonObjectFields = ['social_meta'];
  jsonObjectFields.forEach((field) => {
    if (row[field] && typeof row[field] === 'string') {
      try {
        row[field] = JSON.parse(row[field]);
      } catch (e) {
        console.error(`Failed to parse ${field}:`, e);
      }
    }
  });
  return row;
};
```

**Update Query Parameter:**

- Parameter `$78` for `social_meta`
- Uses `COALESCE($78, social_meta)` for partial updates
- Automatically serialized with `JSON.stringify(social_meta || {})`

---

## TypeScript Support

### Interface Definition (types.ts, Line ~186)

```typescript
export interface Service {
  // ... other fields ...

  // H. SMM / Social Meta
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  og_type?: 'article' | 'website' | 'product';
  twitter_title?: string;
  twitter_description?: string;
  twitter_image_url?: string;

  // Per-channel social meta
  social_meta?: {
    linkedin?: { title?: string; description?: string; image_url?: string };
    facebook?: { title?: string; description?: string; image_url?: string };
    instagram?: { title?: string; description?: string; image_url?: string };
  };

  // ... rest of fields ...
}

export interface SubServiceItem {
  // ... other fields ...

  // SMM Block
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image_url?: string;

  // Per-channel social meta
  social_meta?: {
    linkedin?: { title?: string; description?: string; image_url?: string };
    facebook?: { title?: string; description?: string; image_url?: string };
    instagram?: { title?: string; description?: string; image_url?: string };
  };

  // ... rest of fields ...
}
```

---

## UI Components

### Card Styling

#### LinkedIn Card

```typescript
<div className="bg-gradient-to-br from-blue-50 to-blue-100/20 rounded-xl border-2 border-blue-200 p-6">
  <span className="bg-blue-100 text-blue-600 px-2.5 py-1 rounded-lg text-xs font-bold">
    in
  </span>
  // LinkedIn-specific fields
  <input className="focus:ring-2 focus:ring-blue-500" />
</div>
```

#### Facebook Card

```typescript
<div className="bg-gradient-to-br from-blue-50 to-blue-100/20 rounded-xl border-2 border-blue-200 p-6">
  <span className="bg-blue-100 text-blue-600 px-2.5 py-1 rounded-lg text-xs font-bold">
    f
  </span>
  // Facebook-specific fields
  <input className="focus:ring-2 focus:ring-blue-500" />
</div>
```

#### Instagram Card

```typescript
<div className="bg-gradient-to-br from-purple-50 to-pink-50/20 rounded-xl border-2 border-purple-200 p-6">
  <span className="bg-purple-100 text-purple-600 px-2.5 py-1 rounded-lg text-xs font-bold">
    📷
  </span>
  // Instagram-specific fields
  <textarea className="focus:ring-2 focus:ring-purple-500" />
</div>
```

### State Binding Pattern

```typescript
// For any platform (linkedin, facebook, instagram)
onChange={(e) => setFormData({
    ...formData,
    social_meta: {
        ...formData.social_meta,
        [platform]: {
            ...((formData.social_meta as any)?.[platform] || {}),
            [field]: e.target.value
        }
    }
})}
```

---

## Validation & Best Practices

### Image URL Best Practices

| Platform  | Recommended Size | Aspect Ratio | Min/Max Size               |
| --------- | ---------------- | ------------ | -------------------------- |
| LinkedIn  | 1200x627px       | 1.91:1       | Min 300x157, Max 4000x4000 |
| Facebook  | 1200x628px       | 1.91:1       | Min 200x200, Max 8000x8000 |
| Instagram | 1080x1080px      | 1:1          | Min 150x150, Max 1080x1080 |

### Content Guidelines

**LinkedIn:**

- Title: Professional, benefit-focused (60-70 chars)
- Description: Detailed, industry-specific (150-300 chars)
- Tone: Professional, authoritative

**Facebook:**

- Title: Engaging, compelling (50-70 chars)
- Description: Conversational, benefit-driven (150-300 chars)
- Tone: Friendly, approachable

**Instagram:**

- Title: Hook, question, or intrigue (30-50 chars)
- Description: Caption with call-to-action and hashtags (max 2200 chars)
- Tone: Casual, engaging, personality-driven

---

## Data Persistence

### Storage Flow

1. **Frontend** → User enters platform-specific data in form
2. **State** → `formData.social_meta.platform.field` updated
3. **API Call** → `PUT /api/services/:id` with complete formData
4. **Backend** → Social_meta serialized to JSON: `JSON.stringify(social_meta || {})`
5. **Database** → Stored in `services.social_meta` (JSONB column)
6. **Retrieval** → Parsed back to object via `parseServiceRow()`
7. **Frontend** → Form hydrated with existing social_meta data

### Example Data Flow

```json
// Frontend State
{
  "social_meta": {
    "linkedin": {
      "title": "Enterprise Solutions",
      "description": "Professional approach to digital transformation",
      "image_url": "https://example.com/image.jpg"
    }
  }
}

// Database Storage (JSONB)
'{"linkedin": {"title": "Enterprise Solutions", "description": "Professional approach to digital transformation", "image_url": "https://example.com/image.jpg"}}'

// API Response (Parsed)
{
  "social_meta": {
    "linkedin": {
      "title": "Enterprise Solutions",
      "description": "Professional approach to digital transformation",
      "image_url": "https://example.com/image.jpg"
    }
  }
}
```

---

## Testing Checklist

- [ ] Create new service with all platform-specific metadata
- [ ] Edit service and update only LinkedIn fields
- [ ] Verify partial updates don't overwrite other platforms
- [ ] Retrieve service and confirm all platforms hydrate correctly
- [ ] Test with empty/null social_meta field
- [ ] Verify image URLs are clickable and load properly
- [ ] Test with special characters in descriptions
- [ ] Verify data persists across page reload
- [ ] Test image dimension recommendations display correctly

---

## File Locations Summary

| File                                       | Type               | Purpose                                            |
| ------------------------------------------ | ------------------ | -------------------------------------------------- |
| `types.ts`                                 | TypeScript Types   | Interface definitions for Service & SubServiceItem |
| `views/ServiceMasterView.tsx`              | React Component    | Frontend UI for service social metadata (SMM tab)  |
| `views/SubServiceMasterView.tsx`           | React Component    | Frontend UI for sub-service social metadata        |
| `backend/controllers/serviceController.ts` | Backend Controller | API logic for create/update/retrieve social_meta   |
| `backend/routes/api.ts`                    | API Routes         | REST endpoints for service CRUD operations         |

---

## Troubleshooting

### Issue: social_meta fields not persisting

**Solution:** Ensure data is properly serialized in API call:

```typescript
// ✅ Correct
social_meta: {
  linkedin: {
    title: '...';
  }
}

// ❌ Incorrect
social_meta: JSON.stringify({ linkedin: { title: '...' } });
```

### Issue: Form shows null/undefined values

**Solution:** Initialize formData with default structure:

```typescript
setFormData((prev) => ({
  ...prev,
  social_meta: prev.social_meta || {
    linkedin: { title: '', description: '', image_url: '' },
    facebook: { title: '', description: '', image_url: '' },
    instagram: { title: '', description: '', image_url: '' },
  },
}));
```

### Issue: Focus ring colors not showing

**Solution:** Verify Tailwind CSS color configuration includes:

- `focus:ring-blue-500` for LinkedIn/Facebook
- `focus:ring-purple-500` for Instagram

---

## Future Enhancements

- [ ] Add more platforms (TikTok, YouTube, LinkedIn Articles, Pinterest)
- [ ] Implement character counters for platform-specific limits
- [ ] Add social media preview mockups
- [ ] Implement AI suggestions for platform-specific content
- [ ] Add bulk platform content generation
- [ ] Implement social media scheduling integration
- [ ] Add analytics tracking for shared links

---

## Version Info

- **Implementation Date:** December 4, 2025
- **Backend Status:** ✅ Full Support
- **Frontend Status:** ✅ Complete
- **TypeScript Support:** ✅ Full Type Safety
- **Compilation Status:** ✅ Zero New Errors

---
