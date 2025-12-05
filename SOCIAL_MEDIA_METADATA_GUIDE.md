# Social Media Metadata Guide

## Overview
The Sub-Service Master now includes comprehensive social media metadata fields organized in a tabbed interface for easy management across all major platforms.

## Available Tabs

### 1. 🌐 Default Meta
**Purpose:** Fallback values when platform-specific metadata is not provided

**Fields:**
- `meta_title` - Default title for social shares (max 60 chars)
- `meta_description` - Default description for social shares (max 160 chars)

---

### 2. 🔗 Open Graph (OG)
**Purpose:** Universal protocol used by Facebook, LinkedIn, and many other platforms

**Fields:**
- `og_title` - Open Graph title
- `og_description` - Open Graph description
- `og_image_url` - Image URL (recommended: 1200x630px)
- `og_type` - Object type (website, article, product)

**Best Practices:**
- Always fill these fields as they serve as fallback for many platforms
- Use high-quality images at 1200x630px
- Keep title under 60 characters
- Description should be 150-160 characters

---

### 3. 🐦 Twitter
**Purpose:** Optimized metadata for Twitter/X shares

**Fields:**
- `twitter_title` - Twitter card title (max 70 chars)
- `twitter_description` - Twitter card description (max 200 chars)
- `twitter_image_url` - Image URL (recommended: 1200x675px, 16:9 ratio)

**Best Practices:**
- Concise and punchy titles
- Use 16:9 aspect ratio images
- Keep title under 70 characters for optimal display

---

### 4. 💼 LinkedIn
**Purpose:** Professional network optimization

**Fields:**
- `linkedin_title` - LinkedIn share title
- `linkedin_description` - LinkedIn share description
- `linkedin_image_url` - Image URL (recommended: 1200x627px)

**Best Practices:**
- Professional tone and language
- Title: 150-200 characters
- Focus on business value and insights
- Use professional imagery

---

### 5. 👥 Facebook
**Purpose:** Engaging content for Facebook shares

**Fields:**
- `facebook_title` - Facebook share title (max 90 chars)
- `facebook_description` - Facebook share description
- `facebook_image_url` - Image URL (recommended: 1200x630px)

**Best Practices:**
- Engaging questions work well
- Title: 40-90 characters
- Use emotional hooks
- Include clear call-to-action

---

### 6. 📸 Instagram
**Purpose:** Visual-first platform optimization

**Fields:**
- `instagram_title` - Instagram share title
- `instagram_description` - Instagram caption (max 2200 chars)
- `instagram_image_url` - Image URL (recommended: 1080x1080px, square)

**Best Practices:**
- Visual-first approach
- Use emojis and hashtags in caption
- Square images (1:1 ratio)
- Engaging, story-driven captions

---

## Database Schema

All fields are stored directly on the `SubServiceItem` interface:

```typescript
export interface SubServiceItem {
  // ... other fields ...
  
  // Default Meta
  meta_title?: string;
  meta_description?: string;
  
  // Open Graph
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  og_type?: 'article' | 'website' | 'product';
  
  // Twitter
  twitter_title?: string;
  twitter_description?: string;
  twitter_image_url?: string;
  
  // LinkedIn
  linkedin_title?: string;
  linkedin_description?: string;
  linkedin_image_url?: string;
  
  // Facebook
  facebook_title?: string;
  facebook_description?: string;
  facebook_image_url?: string;
  
  // Instagram
  instagram_title?: string;
  instagram_description?: string;
  instagram_image_url?: string;
}
```

## UI Features

### Tabbed Interface
- Clean, organized tabs for each platform
- Visual icons for quick identification
- Active tab highlighting
- Smooth transitions

### Field Validation
- Character count indicators
- Color-coded warnings (red when exceeding limits)
- Real-time feedback

### Tooltips
- Helpful descriptions for each field
- Best practice hints
- Platform-specific guidance

### Best Practices Panel
- Always visible at the bottom
- Platform-specific tips
- Image dimension recommendations
- Character limit guidelines

## Usage Workflow

1. **Start with Default Meta** - Fill in fallback values
2. **Configure Open Graph** - Universal protocol (most important)
3. **Customize per Platform** - Add platform-specific optimizations
4. **Review Best Practices** - Check recommendations panel
5. **Save** - All fields are saved together with the sub-service

## Image Recommendations

| Platform | Recommended Size | Aspect Ratio | Notes |
|----------|-----------------|--------------|-------|
| Open Graph | 1200x630px | 1.91:1 | Universal fallback |
| Twitter | 1200x675px | 16:9 | Summary card with large image |
| LinkedIn | 1200x627px | 1.91:1 | Similar to OG |
| Facebook | 1200x630px | 1.91:1 | Same as OG works well |
| Instagram | 1080x1080px | 1:1 | Square format preferred |

## Tips for Content Creators

1. **Prioritize Open Graph** - It's used by multiple platforms
2. **Platform-Specific Images** - Use different images optimized for each platform when possible
3. **Test Your Links** - Use platform preview tools before publishing
4. **Keep It Updated** - Review and update metadata regularly
5. **A/B Test** - Try different titles and descriptions to see what performs best

## Integration with Services

The same social media metadata structure is available in:
- ✅ Sub-Service Master
- ✅ Service Master
- 🔄 Content Repository (coming soon)

This ensures consistency across all content types in the Marketing Control Center.
