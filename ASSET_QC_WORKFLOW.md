# Asset Submission & QC Approval Workflow

This document outlines the comprehensive asset submission and quality control workflow implemented in the Marketing Control Center.

## Overview

The Asset QC Workflow ensures that all assets go through a structured review process before being linked to services or sub-services. This maintains quality standards and provides proper oversight.

## Workflow Stages

### 1. Asset Creation (User Entry Fields - In Order)

Users must complete the following fields in the exact sequence:

1. **Asset Application** - WEB, SEO, SMM
2. **Service** - Link to service master
3. **Sub-Service Linking** - Link to sub-service master
4. **Keywords** - Link with keyword master table
5. **Title** - Asset title
6. **Description** - Asset description
7. **URL** - Asset URL
8. **H1** - Main heading
9. **H2** - Secondary headings
10. **Asset Type** - article/video/graphic/guide
11. **Asset Category** - e.g., "what science can do"
12. **Asset Format** - image/video/pdf
13. **Repository** - Content/SMM/SEO/Design Repository
14. **Image Upload Option** - Preview option based on SMM
15. **Body Content** - Main content
16. **SEO Score** - AI-generated SEO score (0-100) - **MANDATORY**
17. **Grammar Score** - AI-generated grammar score (0-100) - **MANDATORY**
18. **Usage Status** - Available/In Use/Archived
19. **Status** - Draft/Pending QC Review/etc.

### 2. Submission Process

- User fills all required fields
- **SEO and Grammar scores are mandatory** before submission
- Click "Submit for QC Review" button
- Asset status changes to "Pending QC Review"
- Asset **cannot link to services/sub-services** until QC approval

### 3. QC Review Module

#### 3.1 View Access
- QC personnel see assets in **List View only**
- Fields are **NOT editable** in QC view
- QC reviewers see structured data without body editing access

#### 3.2 QC Input Fields
QC team can input:
- **QC Score** (0-100)
- **Checklist Completion** (checkbox)
- **Remarks/Comments** (text)
- **QC Decision** (Approve/Reject)

#### 3.3 Post-QC Actions
- **If Approved**: Asset becomes active and automatically links to selected Service/Sub-Service
- **If Rejected**: Returns to creator with remarks, status changes to "Rework Required"

## User Roles & Permissions

### Asset Creator Mode
- Full edit access to all required fields
- Ability to submit for approval
- Cannot mark QC score
- Cannot approve or activate linking

### QC Mode
- List view only (read-only asset data)
- Input allowed only on QC scoring fields
- No modification to original content
- Ability to approve or reject

## System Behavior

### Automatic Status Transitions
```
Draft → Pending QC Review → QC Approved → Linked
                        ↘ QC Rejected → Rework Required
```

### Linking Activation
- Service/Sub-service linking becomes active **only after QC approval**
- `linking_active` field controls this behavior

### Workflow Logging
System captures:
- Submission time and user
- QC reviewer and timestamp
- Approval/rejection timestamps
- All status changes with user attribution

## API Endpoints

### Asset Management
- `GET /api/v1/assetLibrary` - Get all assets
- `POST /api/v1/assetLibrary` - Create new asset
- `PUT /api/v1/assetLibrary/:id` - Update asset

### QC Workflow
- `POST /api/v1/assetLibrary/:id/submit-qc` - Submit asset for QC
- `GET /api/v1/assetLibrary/qc/pending` - Get assets pending QC
- `POST /api/v1/assetLibrary/:id/qc-review` - Submit QC review
- `POST /api/v1/assetLibrary/ai-scores` - Generate AI scores

## Database Schema

### Assets Table (New Fields)
```sql
-- Workflow fields
submitted_by INTEGER REFERENCES users(id)
submitted_at TIMESTAMP
qc_reviewer_id INTEGER REFERENCES users(id)
qc_reviewed_at TIMESTAMP
qc_score INTEGER -- 0-100
qc_checklist_completion BOOLEAN
qc_remarks TEXT

-- AI Scores (mandatory)
seo_score INTEGER -- 0-100
grammar_score INTEGER -- 0-100

-- Keywords linking
keywords TEXT -- JSON array

-- Linking control
linking_active BOOLEAN DEFAULT false

-- Audit trail
workflow_log TEXT -- JSON array of events
```

### Asset QC Reviews Table
```sql
CREATE TABLE asset_qc_reviews (
    id INTEGER PRIMARY KEY,
    asset_id INTEGER REFERENCES assets(id),
    qc_reviewer_id INTEGER REFERENCES users(id),
    qc_score INTEGER,
    checklist_completion BOOLEAN,
    qc_remarks TEXT,
    qc_decision VARCHAR(50), -- 'approved' or 'rejected'
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP
);
```

## UI Components

### Asset Creation Form
- **Location**: `views/AssetsView.tsx`
- **Features**: 
  - Sequential field entry
  - AI score generation
  - Dual submit buttons (Draft/QC Review)
  - Real-time validation

### QC Review Interface
- **Location**: `views/AssetQCView.tsx`
- **Features**:
  - List view of pending assets
  - Read-only asset information
  - QC scoring interface
  - Approve/Reject workflow

## Navigation

- **Assets**: Main asset management (`/assets`)
- **Asset QC Review**: QC interface (`/asset-qc`)

## Implementation Notes

### AI Score Integration
- Mock implementation provided
- Integrate with actual AI services for production
- Scores are mandatory for QC submission

### Keyword Linking
- Keywords stored as JSON array
- Future enhancement: Link with keyword master table

### Status Management
- Comprehensive status tracking
- Automatic transitions based on workflow actions
- Audit trail maintained in `workflow_log`

## Future Enhancements

1. **Email Notifications**: Notify QC team of pending reviews
2. **Bulk QC Operations**: Review multiple assets simultaneously
3. **Advanced Analytics**: QC performance metrics
4. **Integration**: Connect with external QC tools
5. **Automated QC**: AI-powered initial screening

## Migration

Run the database migration to add new fields:
```bash
node backend/migrations/add-asset-qc-workflow.js
```

This workflow ensures quality control while maintaining efficient asset management and proper audit trails.