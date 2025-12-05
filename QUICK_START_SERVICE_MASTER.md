# Service Master - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Start the Application
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
npm run dev
```

### Step 2: Navigate to Service Master
1. Open browser: `http://localhost:5173`
2. Click on **"Service Master"** in the navigation menu
3. You'll see the Service Master list view

### Step 3: Create Your First Service
1. Click **"+ Create Service"** button (top right)
2. Fill in the **Core tab**:
   - **Service Name:** "Technical SEO Audit" *(required)*
   - **Service Code:** "SRV-SEO-01"
   - **Short Tagline:** "Comprehensive technical SEO analysis"
   - **Description:** "Full technical audit of your website..."
   - **Status:** Select "Draft"
3. Select **Industries:** Check "Food" and "Nutraceutical"
4. Select **Countries:** Check "India" and "United States"
5. Click **"✨ AI Suggest"** button to auto-generate content
6. Click **"Save Changes"**

✅ **Done!** Your first service is created.

### Step 4: Add Content & SEO
1. Click on your newly created service to edit
2. Navigate to **Content tab** (📝):
   - Add H2 headings: "What is Technical SEO?", "Why It Matters"
   - Add H3 headings: "Core Web Vitals", "Site Speed"
3. Navigate to **SEO tab** (🔍):
   - **Meta Title:** "Technical SEO Audit Services | Your Brand"
   - **Meta Description:** "Get a comprehensive technical SEO audit..."
   - Add **Focus Keywords:** "technical seo", "seo audit"
4. Click **"Save Changes"**

### Step 5: Configure Social Media
1. Navigate to **SMM tab** (📢)
2. Fill **Open Graph** section:
   - **OG Title:** "Technical SEO Audit | Your Brand"
   - **OG Description:** "Comprehensive technical SEO analysis..."
   - **OG Image URL:** "https://yourdomain.com/images/seo-audit.jpg"
3. Fill **LinkedIn** section (same pattern)
4. Fill **Twitter** section (same pattern)
5. Click **"Save Changes"**

### Step 6: Create a Sub-Service
1. Navigate to **"Sub-Service Master"** view
2. Click **"+ Create Sub-Service"**
3. **Select Parent Service:** "Technical SEO Audit"
4. Fill details:
   - **Sub-Service Name:** "Core Web Vitals Optimization"
   - **Description:** "Optimize LCP, FID, CLS metrics..."
5. Notice the **Full URL** auto-generates: `/services/technical-seo-audit/core-web-vitals-optimization`
6. Click **"Save Changes"**

✅ **Done!** Your sub-service is linked to the parent.

### Step 7: Link Assets
1. Open your service in edit mode
2. Navigate to **Linking tab** (🔗)
3. In the **"Add Assets"** section:
   - Type "seo" in the search box
   - Click **"Link"** on relevant articles/assets
4. Assets appear in the **"Linked Assets"** list
5. Click **"Save Changes"**

✅ **Done!** Assets are now linked to your service.

## 📊 Understanding the 9 Tabs

### 💎 Core
- Basic service information
- Industries & countries
- AI suggestions

### 🧭 Navigation
- Menu settings
- Sitemap configuration
- Breadcrumb labels

### 🎯 Strategic
- Content type & buyer journey
- Personas & CTAs
- Target segments

### 📝 Content
- H1-H5 headings
- Body content
- Content structure

### 🔍 SEO
- Meta title & description
- Focus & secondary keywords
- Keyword metrics

### 📢 SMM
- Open Graph meta
- Twitter, LinkedIn, Facebook, Instagram
- Platform-specific content

### ⚙️ Technical
- Robots directives
- Schema markup
- FAQ section
- Canonical URLs

### 🔗 Linking
- Sub-services list
- Linked assets
- Asset search & linking

### ⚖️ Governance
- Brand & ownership
- Business unit
- Version tracking

## 🤖 Using AI Suggestions

### When to Use AI
- Creating new services (initial content structure)
- Need H1/H2/H3 suggestions
- Want meta title/description ideas
- Need FAQ pairs
- Looking for keyword suggestions

### How to Use AI
1. Fill **Service Name** first (required)
2. Click **"✨ AI Suggest"** button
3. Wait 3-5 seconds for AI to generate
4. Review suggestions in:
   - H1 field
   - H2/H3 lists
   - Meta title/description
   - Focus keywords
   - FAQ section (if enabled)
5. Edit suggestions as needed
6. Click **"Save Changes"**

### AI Limitations
- ⚠️ AI only **suggests**, never auto-saves
- ⚠️ Always review AI output before saving
- ⚠️ AI works best with clear service names
- ⚠️ Requires internet connection

## 🔗 Linking Architecture

### Service → Sub-Services
```
Technical SEO Audit (Parent)
  ├── Core Web Vitals Optimization
  ├── Site Speed Analysis
  └── Mobile SEO Audit
```

### Service → Assets
```
Technical SEO Audit
  ├── Article: "What is Technical SEO?"
  ├── Video: "SEO Audit Walkthrough"
  ├── PDF: "Technical SEO Checklist"
  └── Case Study: "Client Success Story"
```

### Sub-Service → Assets
```
Core Web Vitals Optimization
  ├── Article: "Understanding Core Web Vitals"
  └── Video: "Optimizing LCP, FID, CLS"
```

## 📋 Common Tasks

### Task 1: Update Service Status
1. Open service in edit mode
2. Navigate to **Core tab**
3. Change **Status** dropdown: Draft → Published
4. Click **"Save Changes"**

### Task 2: Add FAQ Section
1. Open service in edit mode
2. Navigate to **Technical tab**
3. Check **"Enable FAQ"**
4. Fill **Question** and **Answer**
5. Click **"Add FAQ"**
6. Repeat for more FAQs
7. Click **"Save Changes"**

### Task 3: Configure Navigation
1. Open service in edit mode
2. Navigate to **Navigation tab**
3. Check **"Show in Main Menu"**
4. Set **Menu Position:** 5
5. Set **Sitemap Priority:** 0.9
6. Click **"Save Changes"**

### Task 4: Copy Service URL
1. Open service in edit mode
2. Navigate to **Core tab**
3. Find **Full URL** field
4. Click **"Copy"** button
5. URL copied to clipboard
6. Paste anywhere you need it

### Task 5: Export Services to CSV
1. In Service Master list view
2. Click **"Export CSV"** button (top right)
3. CSV file downloads automatically
4. Open in Excel/Google Sheets

## 🔍 Search & Filter

### Search Services
- Type in search box: "seo", "audit", "marketing"
- Searches: Service Name, Slug
- Real-time filtering

### Filter by Status
- Click **Status dropdown**
- Select: Draft, Published, Archived, etc.
- List updates instantly

### Combine Search + Filter
- Type "seo" in search
- Select "Published" in status filter
- See only published SEO services

## ⚠️ Important Rules

### ✅ DO:
- Fill Service Name (required)
- Use AI suggestions as starting point
- Review all tabs before publishing
- Link relevant assets
- Keep URLs clean (auto-generated)
- Update status as you progress

### ❌ DON'T:
- Leave Service Name empty
- Trust AI blindly (always review)
- Manually edit slugs (unless needed)
- Delete services with sub-services (without checking)
- Forget to save changes
- Edit URLs directly (use slug instead)

## 🐛 Troubleshooting

### Issue: AI Suggest Not Working
**Solution:**
- Check internet connection
- Ensure Service Name is filled
- Wait 5-10 seconds
- Check browser console for errors

### Issue: Can't Save Service
**Solution:**
- Check Service Name is filled (required)
- Check for validation errors (red text)
- Check network connection
- Try again in a few seconds

### Issue: Sub-Service URL Wrong
**Solution:**
- Ensure parent service is selected
- Check parent service slug is correct
- URL auto-generates as: `/services/{parent-slug}/{sub-slug}`

### Issue: Assets Not Linking
**Solution:**
- Ensure you're in edit mode
- Navigate to Linking tab
- Search for asset by name
- Click "Link" button
- Click "Save Changes"

### Issue: Keyword Metrics Not Showing
**Solution:**
- Ensure keyword exists in Keyword Master
- Check spelling matches exactly
- Metrics show: Search Volume & Competition

## 📞 Need Help?

### Documentation
- **Architecture:** See `SERVICE_MASTER_ARCHITECTURE.md`
- **UI Guide:** See `SERVICE_MASTER_UI_GUIDE.md`
- **Testing:** See `SERVICE_MASTER_TEST_GUIDE.md`
- **Summary:** See `SERVICE_MASTER_SUMMARY.md`

### Common Questions

**Q: Can I have sub-sub-services?**
A: No, only one level: Service → Sub-Service

**Q: How many assets can I link?**
A: Unlimited, but keep it relevant

**Q: Can I delete a service with sub-services?**
A: Yes, but you'll get a warning first

**Q: Does AI auto-save?**
A: No, AI only suggests. You must save manually.

**Q: Can I edit the URL directly?**
A: Better to edit the slug, URL auto-generates

**Q: How do I track changes?**
A: Version number auto-increments on each save

## 🎯 Next Steps

### After Creating Services:
1. **Create Campaigns** to work on service content
2. **Run SEO Audits** to find issues
3. **Link to Projects** for organization
4. **Track Performance** via analytics
5. **Update Regularly** based on data

### Phase 2 Coming Soon:
- Campaign Working Copies
- QC Workflow in Campaigns
- AI Content Generation in Campaigns
- Approve & Push to Master
- On-Page Error Resolution

---

**Quick Start Complete!** 🎉

You now know how to:
- ✅ Create services
- ✅ Add sub-services
- ✅ Link assets
- ✅ Use AI suggestions
- ✅ Configure all 9 blocks
- ✅ Search & filter
- ✅ Export data

**Ready to build your service catalog!**
