# Service Master System Architecture

## Overview

This document describes the complete Service Master system with proper separation of concerns between content storage (Service Master) and workflow/QC (Campaigns).

## Core Design Principles

### 1. Service Master = Clean Source of Truth
- **NO QC fields** - No quality control status, scores, or reports
- **NO workflow fields** - No assignments, progress stages, or task tracking
- **NO AI modifications** - AI can only suggest, never auto-save
- **Only approved content** - Final, live content that has passed all QC

### 2. Campaigns = Working Environment
- All QC, workflow, and AI editing happens here
- Working copies are created from Service Master
- Changes are approved before pushing back to Master

### 3. On-page SEO Audits = Issue Tracking
- Separate table for tracking SEO issues
- Linked to Services/Sub-services
- Resolved via Campaigns, not directly in Master

---

## Database Schema

### Services Table (Service Master)
**Purpose**: Store approved, live content only

**Key Fields**:
- Identity: `service_id`, `service_code`, `service_name`, `slug`, `full_url`
- Content: `h1`, `h2_list`, `h3_list`, `h4_list`, `h5_list`, `body_content`
- SEO: `meta_title`, `meta_description`, `focus_keywords`, `secondary_keywords`
- Technical SEO: `schema_type_id`, `robots_index`, `robots_follow`, `canonical_url`
- SMM: `og_title`, `og_description`, `og_image_url`, `twitter_title`, etc.
- Navigation: `show_in_main_menu`, `menu_group`, `menu_position`, etc.
- Governance: `brand_id`, `content_owner_id`, `version_number`, `change_log_link`

**What's NOT in Service Master**:
- ❌ QC status, QC scores, QC reports
- ❌ Workflow stages, assignments
- ❌ AI-generated drafts
- ❌ Task tracking

### Sub-services Table
**Purpose**: Child services under a parent Service

**Structure**: Same content/SEO fields as Service Master, but simpler
- Links to parent via `parent_service_id`
- Can have its own content, SEO, SMM metadata
- Also clean (no QC/workflow)

### Content Repository (Assets)
**Purpose**: Articles, videos, PDFs, graphics linked to Services/Sub-services

**Key Fields**:
- `linked_service_ids` (JSON array) - Many-to-many with Services
- `linked_sub_service_ids` (JSON array) - Many-to-many with Sub-services
- `linked_campaign_id` - Links to Campaign for workflow
- `ai_qc_report` - QC happens here (in Campaign context)
- `assigned_to_id` - Assignment happens here (in Campaign context)
- `status` - Workflow status (draft, qc_pending, qc_passed, published)

**Note**: Assets are the unit of work in Campaigns. QC and workflow fields belong here, not in Service Master.

### On-page SEO Audits Table
**Purpose**: Track SEO issues for Services/Sub-services

**Key Fields**:
- `service_id` - Links to Service
- `sub_service_id` - Links to Sub-service
- `error_type` - Type of SEO issue
- `error_category` - Content, Technical, Meta, Links, Images, Schema
- `severity` - High, Medium, Low
- `issue_description` - Description of the problem
- `current_value` - What is currently there
- `recommended_value` - What it should be
- `linked_campaign_id` - Campaign where this will be fixed
- `status` - open, in_progress, resolved, ignored

---

## Workflow: Service Master → Campaign → Service Master

### Step 1: Create/Edit Service Master
- User creates or edits Service Master directly
- AI can suggest (H1, H2 structure, keywords, FAQs, schema types)
- **AI never auto-saves** - User must confirm all changes
- This is just content storage - no QC/workflow

### Step 2: Create Project & Campaign
When marketing wants to work on a Service:
1. Create a **Project** (e.g., "Q1 SEO Refresh")
2. Create a **Campaign** under that Project (e.g., "On-page SEO Fix Campaign")
3. Link Campaign to Service via `linked_service_ids`

### Step 3: Pull Working Copy
- Use API: `POST /api/v1/campaigns/:campaignId/pull-service/:serviceId`
- Creates a working copy in `content_repository` (Asset)
- All content from Service Master is copied to the Asset
- Asset is linked to Campaign via `linked_campaign_id`
- Asset status is set to 'draft'

### Step 4: Work in Campaign
- All editing, QC, and AI modifications happen on the Asset (working copy)
- AI can generate, rewrite, optimize content in Campaign context
- QC runs are performed on the Asset
- Tasks are created and tracked in Campaign
- On-page errors can be linked to Campaign for fixing

### Step 5: Approve & Update Service Master
- After QC passes (status = 'qc_passed' or 'published')
- Use API: `POST /api/v1/campaigns/approve-and-update-master`
- Body: `{ campaignId, assetId, serviceId }`
- System:
  1. Validates QC status
  2. Updates Service Master with approved content
  3. Increments `version_number`
  4. Marks Asset as 'published'
  5. Emits real-time updates

---

## On-page SEO Audit Flow

### Creating an Audit Issue
1. User identifies SEO issue on a Service/Sub-service page
2. Creates audit record in `on_page_seo_audits` table
3. Links to Service or Sub-service
4. Optionally links to Campaign (where it will be fixed)

### Resolving an Audit Issue
1. Issue is linked to a Campaign
2. Fix is implemented in Campaign (working copy)
3. After QC passes and changes are approved:
   - Service Master is updated
   - Audit status is set to 'resolved'
   - `resolved_at` timestamp is set

---

## AI Integration Points

### AI in Service Master (Read-Only Assist)
**Location**: `views/ServiceMasterView.tsx`

**Functions**:
- `generateFAQs()` - Suggests FAQ questions/answers
- `suggestSchemaType()` - Suggests Schema.org type and fields
- `suggestInternalLinks()` - Suggests internal linking opportunities
- H1/H2/H3 suggestions - Suggests heading structure
- Keyword suggestions - Suggests focus and secondary keywords

**Behavior**:
- ✅ AI can read from Service Master
- ✅ AI can suggest changes
- ❌ AI **cannot** auto-save to Service Master
- ✅ User must manually confirm and save all AI suggestions

### AI in Campaigns & Assets (Full AI Playground)
**Location**: Campaign views, Asset views, QC views

**Functions**:
- Generate first draft content
- Rewrite sections (tone, length, region adaptation)
- Generate SEO elements (meta titles, descriptions, keywords)
- Generate SMM copy (LinkedIn, Twitter, Instagram posts)
- Run AI QC checks
- Propose QC scores and issues

**Behavior**:
- ✅ AI can modify working copies (Assets in Campaigns)
- ✅ AI can auto-save to Assets (working copies)
- ✅ AI can run QC checks
- ✅ Changes require human approval before pushing to Service Master

---

## API Endpoints

### Service Master
- `GET /api/v1/services` - Get all services
- `POST /api/v1/services` - Create service
- `PUT /api/v1/services/:id` - Update service
- `DELETE /api/v1/services/:id` - Delete service

### Campaign Working Copies
- `POST /api/v1/campaigns/:campaignId/pull-service/:serviceId` - Pull working copy from Service Master
- `POST /api/v1/campaigns/approve-and-update-master` - Approve and push changes back to Service Master

### On-page SEO Audits
- `GET /api/v1/on-page-seo-audits` - Get all audits
- `POST /api/v1/on-page-seo-audits` - Create audit
- `PUT /api/v1/on-page-seo-audits/:id` - Update audit
- `DELETE /api/v1/on-page-seo-audits/:id` - Delete audit
- `GET /api/v1/on-page-seo-audits/service/:serviceId` - Get audits for a service
- `GET /api/v1/on-page-seo-audits/sub-service/:subServiceId` - Get audits for a sub-service

---

## Frontend Components

### ServiceMasterView
- Full form with all 9 field blocks (A-K)
- AI suggestions (read-only, user confirms)
- Sub-services display
- Assets linking
- **No QC fields, no workflow fields**

### OnPageErrorsView
- List of SEO audit issues
- Filter by Service, Category, Severity, Status
- Link issues to Campaigns
- Resolve issues (updates status when Service Master is updated)

### Campaign Views
- Pull working copies from Service Master
- Edit working copies (Assets)
- Run QC on Assets
- Approve and push back to Service Master

---

## Data Flow Diagram

```
Service Master (Clean Source of Truth)
    ↓ [Pull Working Copy]
Campaign → Asset (Working Copy)
    ↓ [AI Editing, QC, Workflow]
Asset (QC Passed)
    ↓ [Approve & Update]
Service Master (Updated with Approved Content)
    ↓
On-page SEO Audits (Marked as Resolved)
```

---

## Key Rules for Developers

1. **Service Master = Clean Storage**
   - Only approved content
   - No QC/workflow fields
   - No assignments
   - Version tracking only

2. **Sub-services = Children of Services**
   - Same structure as Service Master
   - Also clean (no QC/workflow)
   - Linked via `parent_service_id`

3. **Assets = Unit of Work**
   - Many-to-many with Services/Sub-services
   - QC and workflow fields belong here
   - Working copies live here during Campaigns

4. **Campaigns = Working Environment**
   - Pull working copies from Service Master
   - All editing, QC, AI happens here
   - Approve before pushing back

5. **On-page Audits = Issue Tracking**
   - Separate from Service Master
   - Linked to Services/Sub-services
   - Resolved via Campaigns

6. **AI Behavior**
   - Service Master: Read-only suggestions
   - Campaigns/Assets: Full AI editing allowed

7. **Approval Flow**
   - QC must pass before updating Service Master
   - Version number increments on update
   - Real-time updates via Socket.IO

---

## Implementation Status

✅ **Completed**:
- Service Master table (clean, no QC/workflow)
- Sub-services table
- Assets many-to-many linking
- On-page SEO Audits table
- Campaign working copy pull function
- Approval and update function
- OnPageErrorsView (updated for Services/Sub-services)
- AI suggestions in Service Master (read-only)
- All field blocks implemented (A-K)

✅ **Verified**:
- Service Master has no QC/workflow fields
- Assets have QC/workflow fields (correct location)
- Many-to-many linking works
- AI in Service Master is read-only

---

## Next Steps (If Needed)

1. Add UI buttons in Campaign views to pull working copies
2. Add approval UI in Campaign views
3. Add visual indicators for working copies vs. master content
4. Add diff view to compare working copy vs. master
5. Add bulk approval for multiple assets

