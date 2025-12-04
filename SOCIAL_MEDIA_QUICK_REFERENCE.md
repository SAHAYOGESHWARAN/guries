# Social Media Metadata Fields - Quick Reference

## Platform Field Specifications

### LinkedIn Card

```
┌─────────────────────────────────────────────┐
│ in    LinkedIn                              │
├─────────────────────────────────────────────┤
│ Title (Professional Headline)               │
│ └─ Example: "Enterprise Solutions Expert"   │
│                                             │
│ Description (Professional Summary)          │
│ └─ Example: "Digital transformation..."     │
│                                             │
│ Image URL                                   │
│ └─ Recommended: 1200x627px                  │
│ └─ Format: JPEG/PNG                         │
└─────────────────────────────────────────────┘
```

**Best Practices:**

- Professional, benefit-focused language
- Industry-specific terminology
- 60-70 character title limit
- 150-300 character description
- Formal tone

---

### Facebook Card

```
┌─────────────────────────────────────────────┐
│ f     Facebook                              │
├─────────────────────────────────────────────┤
│ Title (Engaging Headline)                   │
│ └─ Example: "Transform Your Business"       │
│                                             │
│ Description (Engaging Summary)              │
│ └─ Example: "Join thousands who trust..."   │
│                                             │
│ Image URL                                   │
│ └─ Recommended: 1200x628px                  │
│ └─ Format: JPEG/PNG                         │
└─────────────────────────────────────────────┘
```

**Best Practices:**

- Friendly, conversational tone
- Action-oriented language
- Benefit-driven messaging
- 50-70 character title limit
- 150-300 character description
- Emoji use encouraged

---

### Instagram Card

```
┌─────────────────────────────────────────────┐
│ 📷    Instagram                             │
├─────────────────────────────────────────────┤
│ Title (Post Hook/Headline)                  │
│ └─ Example: "Drop a ❤️ if you agree..."     │
│                                             │
│ Caption (With Hashtags)                     │
│ └─ Max 2200 characters                      │
│ └─ Example: "Check out our latest tips..."  │
│                                             │
│ Image URL                                   │
│ └─ Recommended: 1080x1080px (Square)        │
│ └─ Format: JPEG/PNG                         │
│ └─ Can also use: Portrait (1080x1350)       │
└─────────────────────────────────────────────┘
```

**Best Practices:**

- Casual, personality-driven tone
- Hashtag strategy (#3-10 per post)
- Call-to-action (engagement questions)
- Emoji for visual interest
- 30-50 character title limit
- Authentic, relatable voice

---

## Data Structure Reference

```typescript
{
  linkedin: {
    title: "Enterprise Digital Solutions",      // max 150 chars
    description: "Professional digital...",     // max 500 chars
    image_url: "https://..."                    // 1200x627px
  },
  facebook: {
    title: "Transform Your Business",           // max 150 chars
    description: "Join thousands of...",        // max 500 chars
    image_url: "https://..."                    // 1200x628px
  },
  instagram: {
    title: "Drop a ❤️ if you agree",            // max 80 chars
    description: "Check out our latest...",     // max 2200 chars
    image_url: "https://..."                    // 1080x1080px
  }
}
```

---

## Image Dimensions Cheat Sheet

| Platform      | Primary   | Landscape | Portrait  | Story     |
| ------------- | --------- | --------- | --------- | --------- |
| **LinkedIn**  | 1200x627  | 1200x627  | 1500x1500 | N/A       |
| **Facebook**  | 1200x628  | 1200x628  | 1500x1500 | 1080x1920 |
| **Instagram** | 1080x1080 | 1080x566  | 1080x1350 | 1080x1920 |

### Aspect Ratio Guide

- **LinkedIn:** 1.91:1 (Wide)
- **Facebook:** 1.91:1 (Wide)
- **Instagram:** 1:1 (Square)

---

## Character Limits Per Field

| Platform      | Field       | Recommended | Max  |
| ------------- | ----------- | ----------- | ---- |
| **LinkedIn**  | Title       | 60-70       | 150  |
| **LinkedIn**  | Description | 150-300     | 500  |
| **Facebook**  | Title       | 50-70       | 150  |
| **Facebook**  | Description | 150-300     | 500  |
| **Instagram** | Title       | 30-50       | 80   |
| **Instagram** | Caption     | 150-300     | 2200 |

---

## Common Content Variations

### Technology Service Example

**LinkedIn:**

```
Title: AI-Powered Solutions for Enterprise Efficiency
Description: Transform your business processes with cutting-edge
AI technology. Our solutions help enterprises reduce costs,
improve efficiency, and scale operations.
```

**Facebook:**

```
Title: Ready to Embrace AI? We'll Guide You!
Description: Join the AI revolution. Our expert team helps
businesses like yours leverage AI technology safely and
effectively. Let's transform your business today.
```

**Instagram:**

```
Title: 🚀 The Future is AI! Are You Ready?
Caption:
Ready to take your business to the next level? 🤖✨

Our AI solutions are helping thousands of companies:
✓ Work smarter, not harder
✓ Make data-driven decisions
✓ Scale faster than ever

Tap the link in bio to learn how we can help your business! 💡

#AI #Technology #BusinessGrowth #Innovation #SoftwareAs aService #EnterpriseTech #FutureOfWork
```

---

## Platform Tone Comparison

### Professional Statement

**LinkedIn:**

> "Our enterprise software solutions provide comprehensive digital transformation capabilities designed to optimize operational efficiency and drive sustainable business growth."

**Facebook:**

> "Ready to take your business to the next level? Our software helps you work smarter, save time, and grow faster!"

**Instagram:**

> "Your business deserves tools that work as hard as you do 💪 Check out how we're helping companies like yours level up! 🚀 #BusinessGrowth"

---

## Hashtag Strategy by Platform

### LinkedIn Hashtags

- Use sparingly (2-3 hashtags)
- Professional/industry-specific
- Examples: `#DigitalTransformation` `#Enterprise` `#Innovation`
- Place at end of description

### Facebook Hashtags

- Use moderately (3-5 hashtags)
- Mix popular and niche
- Examples: `#SmallBusiness` `#Growth` `#Success`
- Blend into caption naturally

### Instagram Hashtags

- Use extensively (8-15 hashtags)
- Mix popular (1M+ posts) and niche (10K-100K)
- Examples: `#SmallBiz` `#Entrepreneur` `#GrowYourBusiness`
- Can use in caption or first comment

---

## Quick Copy-Paste Templates

### LinkedIn Template

```
[Platform-Neutral Title Here]

[1-2 sentence opening hook]

[2-3 sentences about value proposition]

[1-2 sentences about differentiator]

[CTA: "Learn more" / "Discover how" / "Get started"]
```

### Facebook Template

```
[Catchy, benefit-focused title]

👋 [Opening address]

[Problem statement]

✨ [Your solution features]

📍 [Social proof or result]

[CTA with emoji: "Click link" / "Message us" / "Shop now"]

#[3-5 relevant hashtags]
```

### Instagram Template

```
[Engaging hook - question or statement]

[Pain point or relatable situation]

✅ [Your solution - 3-5 bullet points]

[Call to action - engagement or link]

[Hashtag strategy - 8-15 hashtags]
```

---

## File Location Reference

### Frontend Components

```
views/
├── ServiceMasterView.tsx (Lines 1505-1700)
│   └── SMM Tab > Platform-Specific Content
└── SubServiceMasterView.tsx (Lines 406-550)
    └── Social Media Metadata > Platform Cards
```

### Backend

```
backend/
├── controllers/
│   └── serviceController.ts
│       ├── Line 13: jsonObjectFields
│       ├── Line 42: parseSubServiceRow
│       ├── Line 163: Create serialization
│       ├── Line 248: Update query
│       └── Line 264: Update parameters
└── routes/
    └── api.ts (POST/PUT/GET /api/services)
```

### Type Definitions

```
types.ts
├── Service interface (Line ~186)
└── SubServiceItem interface (Line ~239)
```

---

## Form State Pattern

### Update Single Platform Field

```typescript
setFormData({
  ...formData,
  social_meta: {
    ...formData.social_meta,
    linkedin: {
      ...(formData.social_meta?.linkedin || {}),
      title: newValue,
    },
  },
});
```

### Update Entire Platform

```typescript
setFormData({
  ...formData,
  social_meta: {
    ...formData.social_meta,
    linkedin: {
      title: 'New Title',
      description: 'New Description',
      image_url: 'New URL',
    },
  },
});
```

### Initialize All Platforms

```typescript
setFormData({
  ...formData,
  social_meta: {
    linkedin: { title: '', description: '', image_url: '' },
    facebook: { title: '', description: '', image_url: '' },
    instagram: { title: '', description: '', image_url: '' },
  },
});
```

---

## Color Reference

| Platform  | Primary      | Light       | Border       | Focus Ring   |
| --------- | ------------ | ----------- | ------------ | ------------ |
| LinkedIn  | `blue-600`   | `blue-50`   | `blue-200`   | `blue-500`   |
| Facebook  | `blue-500`   | `blue-50`   | `blue-200`   | `blue-500`   |
| Instagram | `purple-600` | `purple-50` | `purple-200` | `purple-500` |

---

## API Request/Response Examples

### Create Request

```json
{
  "service_name": "Digital Marketing",
  "social_meta": {
    "linkedin": {
      "title": "Enterprise Digital Marketing",
      "description": "Professional marketing solutions",
      "image_url": "https://example.com/image.jpg"
    }
  }
}
```

### Update Request

```json
{
  "social_meta": {
    "instagram": {
      "title": "Latest Marketing Trends 🚀",
      "description": "Follow for daily tips and strategies...",
      "image_url": "https://example.com/insta.jpg"
    }
  }
}
```

### Get Response

```json
{
  "id": 1,
  "service_name": "Digital Marketing",
  "social_meta": {
    "linkedin": {
      "title": "Enterprise Digital Marketing",
      "description": "Professional marketing solutions",
      "image_url": "https://example.com/image.jpg"
    },
    "facebook": { ... },
    "instagram": { ... }
  }
}
```

---

## Validation Checklist

- [ ] All URLs use HTTPS protocol
- [ ] Image URLs are accessible and load correctly
- [ ] Titles don't exceed recommended character limits
- [ ] Descriptions are formatted for readability
- [ ] Hashtags follow platform conventions
- [ ] No special characters that break JSON
- [ ] No incomplete or truncated content
- [ ] Call-to-action is clear and specific
- [ ] Tone matches platform culture
- [ ] Image dimensions are optimal

---

**Version:** 1.0  
**Last Updated:** December 4, 2025  
**Status:** Production Ready ✅
