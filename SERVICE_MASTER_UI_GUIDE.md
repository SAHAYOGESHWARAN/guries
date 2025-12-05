# Service Master UI Implementation Guide

## 🎨 UI Layout & Alignment

### List View Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Service Master                                    [Export] │
│  Comprehensive service management with SEO, SMM...  [+ Create]│
├─────────────────────────────────────────────────────────────┤
│  [Search services...]              [All Status ▼]           │
├─────────────────────────────────────────────────────────────┤
│  Service Name  │ Code │ Slug │ Status │ Sub-Svc │ Assets │ Updated │
├─────────────────────────────────────────────────────────────┤
│  Technical SEO │ SRV- │ tech │ ✓ Pub  │   3     │   12   │ Dec 5  │
│  Audit         │ 001  │ -seo │        │         │        │        │
│  Comprehensive │      │      │        │         │        │        │
├─────────────────────────────────────────────────────────────┤
│  Content       │ SRV- │ cont │ Draft  │   0     │   5    │ Dec 4  │
│  Marketing     │ 002  │ -mkt │        │         │        │        │
│  Strategy      │      │      │        │         │        │        │
└─────────────────────────────────────────────────────────────┘
```

### Form View Layout (Full Screen Overlay)
```
┌─────────────────────────────────────────────────────────────┐
│  [X] Edit Service: Technical SEO Audit    [Discard] [Save]  │
├─────────────────────────────────────────────────────────────┤
│  💎Core │ 🧭Nav │ 🎯Strategic │ 📝Content │ 🔍SEO │ 📢SMM │ ⚙️Tech │ 🔗Link │ ⚖️Gov │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Tab Content Scrollable Area]                              │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  💎 Core Identification                            │    │
│  ├────────────────────────────────────────────────────┤    │
│  │                                                     │    │
│  │  [Service Name*]  [Service Code]  [Slug]          │    │
│  │                                                     │    │
│  │  Full URL: /services/technical-seo-audit [Copy]   │    │
│  │                                                     │    │
│  │  [Menu Heading]  [Short Tagline]                  │    │
│  │                                                     │    │
│  │  [Service Description - Textarea]                 │    │
│  │                                                     │    │
│  │  [Status ▼]  [Language ▼]  [✨ AI Suggest]       │    │
│  │                                                     │    │
│  │  🏭 Target Industries        🌍 Target Countries   │    │
│  │  ☐ Food                      ☐ India              │    │
│  │  ☐ Nutraceutical            ☐ United States      │    │
│  │  ☐ Cosmetics                ☐ United Kingdom     │    │
│  │                                                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Tab-by-Tab Field Layout

### 1. Core Tab (💎)
**Section: Core Identification**
```
Row 1: [Service Name*] [Service Code] [Slug]
Row 2: [Full URL Display with Copy Button]
Row 3: [Menu Heading] [Short Tagline]
Row 4: [Service Description - Large Textarea]
Row 5: [Status Dropdown] [Language Dropdown] [AI Suggest Button]
Row 6: Two-column layout:
       Left: Target Industries (Checkbox list)
       Right: Target Countries (Checkbox list)
```

### 2. Navigation Tab (🧭)
**Section: Menu Settings**
```
Row 1: ☐ Show in Main Menu    ☐ Show in Footer Menu
Row 2: [Menu Group] [Menu Position] [Breadcrumb Label]

Section: Sitemap Settings
Row 3: ☐ Include in XML Sitemap
Row 4: [Priority 0.0-1.0] [Change Frequency Dropdown]
```

### 3. Strategic Tab (🎯)
**Section: Strategic Mapping**
```
Row 1: [Content Type Dropdown] [Buyer Journey Stage Dropdown]
Row 2: [Primary Persona Dropdown] [Form Dropdown]
Row 3: [Primary CTA Label] [Primary CTA URL]
Row 4: [Target Segment Notes - Textarea]
```

### 4. Content Tab (📝)
**Section: Content Block**
```
Row 1: [H1 Heading Input]
Row 2: H2 Headings
       [Add H2 Input] [Add Button]
       - List of added H2s with Remove buttons
Row 3: H3 Headings
       [Add H3 Input] [Add Button]
       - List of added H3s with Remove buttons
Row 4: [Body Content - Large Textarea with monospace font]
```

### 5. SEO Tab (🔍)
**Section: SEO Metadata**
```
Row 1: [Meta Title Input] (Character count: X/60)
Row 2: [Meta Description Textarea] (Character count: X/160)
Row 3: Focus Keywords
       [Add Keyword Input] [Add Button]
       - List with keyword metrics (Vol, Comp) and Remove buttons
Row 4: Secondary Keywords
       [Add Keyword Input] [Add Button]
       - List with Remove buttons
```

### 6. SMM Tab (📢)
**Section: Open Graph (Default)**
```
[OG Title]
[OG Description - Textarea]
[OG Image URL]

Section: Twitter
[Twitter Title]
[Twitter Description - Textarea]
[Twitter Image URL]

Section: LinkedIn
[LinkedIn Title]
[LinkedIn Description - Textarea]
[LinkedIn Image URL]

Section: Facebook
[Facebook Title]
[Facebook Description - Textarea]
[Facebook Image URL]

Section: Instagram
[Instagram Title]
[Instagram Description - Textarea]
[Instagram Image URL]
```

### 7. Technical Tab (⚙️)
**Section: Technical SEO**
```
Row 1: [Robots Index Dropdown] [Robots Follow Dropdown] [Schema Type Dropdown]
Row 2: [Canonical URL Input]

Section: FAQ Section
☐ Enable FAQ
[Question Input]
[Answer Textarea]
[Add FAQ Button]
- List of FAQs with Question/Answer display and Remove buttons
```

### 8. Linking Tab (🔗)
**Section: Sub-Services (Count)**
```
- List of linked sub-services with status badges
- Read-only display

Section: Linked Assets (Count)
- List of linked assets with type and status
- [Unlink] buttons for each
- Search input to find and link new assets
- Available assets list with [Link] buttons
```

### 9. Governance Tab (⚖️)
**Section: Ownership & Governance**
```
Row 1: [Brand Dropdown] [Content Owner Dropdown]
Row 2: [Business Unit Input]
Row 3: [Change Log Link Input]

Section: Metadata (Read-only for existing records)
Created: [Date/Time]
Updated: [Date/Time]
Version: [Number]
```

## 🎨 Design System

### Colors
- **Primary:** Indigo-600 (#4F46E5)
- **Success:** Green-600 (#059669)
- **Warning:** Yellow-600 (#D97706)
- **Error:** Red-600 (#DC2626)
- **Neutral:** Slate-600 (#475569)

### Tab Icons & Colors
```
💎 Core        - Indigo
🧭 Navigation  - Blue
🎯 Strategic   - Red
📝 Content     - Green
🔍 SEO         - Yellow
📢 SMM         - Pink
⚙️ Technical   - Purple
🔗 Linking     - Teal
⚖️ Governance  - Gray
```

### Component Styling

**Input Fields:**
```css
- Border: 2px solid slate-200
- Rounded: 12px (xl)
- Padding: 12px 16px
- Focus: ring-2 ring-indigo-500
- Font: 14px (sm)
```

**Buttons:**
```css
Primary:
- Background: indigo-600
- Text: white
- Padding: 8px 24px
- Rounded: 8px (lg)
- Font: 14px bold
- Hover: indigo-700

Secondary:
- Border: 1px solid slate-300
- Text: slate-600
- Padding: 8px 16px
- Rounded: 8px (lg)
- Hover: bg-slate-50
```

**Cards/Sections:**
```css
- Background: white
- Border: 1px solid slate-200
- Rounded: 12px (xl)
- Shadow: sm
- Padding: 32px
```

**Section Headers:**
```css
- Background: gradient from color-50 to slate-50
- Border-bottom: 1px solid slate-200
- Padding: 20px 32px
- Font: 12px bold uppercase
- Tracking: wider
- Icon: color-100 background, color-600 text
```

## 📱 Responsive Behavior

### Desktop (1024px+)
- Full 9-tab layout
- Multi-column grids (2-3 columns)
- Side-by-side Industry/Country selectors
- Full-width form overlay

### Tablet (768px - 1023px)
- Scrollable tab navigation
- 2-column grids
- Stacked Industry/Country selectors

### Mobile (< 768px)
- Horizontal scrolling tabs
- Single column layout
- Stacked all form fields
- Full-screen form overlay

## ✨ Interactive Elements

### AI Suggest Button
```
State: Default
- Gradient: purple-600 to indigo-600
- Icon: Sparkle (✨)
- Text: "AI Suggest"

State: Loading
- Spinning icon
- Text: "Generating..."
- Disabled: true

State: Success
- Brief highlight animation
- Fields populate with suggestions
```

### Copy URL Button
```
State: Default
- Text: "Copy"
- Icon: Clipboard

State: Copied
- Text: "✓ Copied"
- Color: Green
- Duration: 1.5s
```

### Add/Remove List Items
```
Add Button:
- Indigo-600 background
- "Add" text
- Appears next to input

Remove Button:
- Red-600 text
- "Remove" text
- Appears on hover
```

### Checkbox Lists (Industries/Countries)
```
Container:
- Border: slate-200
- Rounded: 8px
- Max-height: 256px
- Overflow: scroll
- Background: slate-50

Item:
- Padding: 10px
- Hover: white background
- Rounded: 8px
- Transition: all

Checkbox:
- Indigo-600 when checked
- 16px size
```

## 🔄 State Management

### Form States
1. **Empty (New)** - All fields blank, defaults applied
2. **Editing** - Populated from existing record
3. **Saving** - Disabled inputs, loading indicator
4. **Saved** - Brief success message, return to list
5. **Error** - Error message, fields remain editable

### Validation States
- **Required fields** - Red asterisk, error on submit
- **Character limits** - Live counter, warning at 90%
- **URL format** - Auto-format, validation on blur
- **Slug format** - Auto-generate, lowercase, hyphens only

## 🎯 User Experience Flow

### Creating New Service
```
1. Click "+ Create Service" button
2. Full-screen form overlay opens
3. Core tab active by default
4. Fill required fields (Service Name*)
5. Slug and URL auto-generate
6. Click "AI Suggest" for content ideas (optional)
7. Navigate through tabs to fill details
8. Click "Save Changes"
9. Success message, return to list
10. New service appears in table
```

### Editing Existing Service
```
1. Click row or Edit icon in table
2. Full-screen form overlay opens
3. All fields populated from database
4. Core tab active by default
5. Navigate tabs to make changes
6. Version number auto-increments on save
7. Click "Save Changes"
8. Success message, return to list
9. Updated service reflects changes
```

### Linking Assets
```
1. Open service in edit mode
2. Navigate to Linking tab
3. See currently linked assets
4. Type in search box to find assets
5. Click "Link" on desired assets
6. Asset appears in linked list
7. Asset count increments
8. Click "Unlink" to remove
```

### Using AI Suggestions
```
1. Fill Service Name first (required)
2. Click "AI Suggest" button
3. Button shows loading state
4. AI generates:
   - H1 heading
   - H2/H3 structure
   - Meta title/description
   - Focus keywords
   - FAQ pairs
5. Fields populate with suggestions
6. User reviews and edits as needed
7. User saves when satisfied
```

## 🚨 Error Handling

### Validation Errors
```
- Display inline below field
- Red text, small font
- Icon: ⚠️
- Example: "Service Name is required"
```

### API Errors
```
- Toast notification at top
- Red background
- Error message from server
- Auto-dismiss after 5s
- Example: "Failed to save service. Please try again."
```

### Network Errors
```
- Modal overlay
- Retry button
- Cancel button
- Example: "Connection lost. Retry?"
```

## ♿ Accessibility

- **Keyboard Navigation:** Tab through all fields
- **Screen Readers:** Proper ARIA labels
- **Focus Indicators:** Visible focus rings
- **Color Contrast:** WCAG AA compliant
- **Error Announcements:** Screen reader alerts
- **Tooltips:** Hover and focus states

## 📊 Performance Optimizations

- **Lazy Loading:** Tabs load content on demand
- **Debounced Search:** 300ms delay on asset search
- **Memoized Lists:** Industry/Country lists cached
- **Virtual Scrolling:** For large asset lists
- **Optimistic Updates:** UI updates before API response

---

**Implementation Status:** ✅ Complete
**Design System:** Tailwind CSS
**Component Library:** Custom React Components
**State Management:** React Hooks (useState, useMemo)
