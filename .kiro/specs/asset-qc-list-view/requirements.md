# Requirements Document

## Introduction

This document defines the requirements for the Asset List View in the QC Review module. The feature provides a comprehensive table view displaying assets pending quality control review, with all necessary metadata fields and action capabilities for QC reviewers and asset owners. The list view serves as the primary interface for managing the QC workflow, enabling users to view, filter, and take action on assets based on their QC status.

## Glossary

- **Asset_List_View**: The main table component displaying assets in the QC Review module with all required columns and filtering capabilities.
- **QC_Reviewer**: An administrator or designated user with permissions to review, approve, reject, or request rework on assets.
- **Asset_Owner**: The user who created or submitted the asset for QC review.
- **QC_Status**: The current quality control state of an asset (Pending, Pass, Fail, Rework).
- **Thumbnail**: A small preview image of the asset displayed in the list view.
- **Asset_Side_Panel**: A slide-out panel that displays detailed asset information when an asset name is clicked.
- **Review_Action**: Interactive buttons that allow users to perform QC-related actions based on their role and the asset's current status.
- **Usage_Count**: A numeric value indicating how many times an asset has been referenced or used across services, pages, or campaigns.

## Requirements

### Requirement 1: Display Asset Thumbnail

**User Story:** As a QC reviewer, I want to see a thumbnail preview of each asset in the list, so that I can quickly identify assets visually without opening the detail view.

#### Acceptance Criteria

1. THE Asset_List_View SHALL display a thumbnail column as the first column in the table.
2. WHEN an asset has a stored thumbnail URL, THE Asset_List_View SHALL load and display the thumbnail image.
3. WHEN an asset does not have a thumbnail URL, THE Asset_List_View SHALL display a placeholder icon indicating no media is attached.
4. THE Asset_List_View SHALL render thumbnails at a consistent size (48x48 pixels) with rounded corners and a border.

### Requirement 2: Display Asset Name with Side Panel Navigation

**User Story:** As a QC reviewer, I want to click on an asset name to view its full details, so that I can access comprehensive information without leaving the list view.

#### Acceptance Criteria

1. THE Asset_List_View SHALL display the asset name as a clickable element in the second column.
2. WHEN a user clicks on an asset name, THE Asset_List_View SHALL open the Asset_Side_Panel displaying full asset details.
3. THE Asset_List_View SHALL display the asset ID below the name for reference.
4. WHEN hovering over an asset name, THE Asset_List_View SHALL provide visual feedback indicating it is clickable.

### Requirement 3: Display Asset Type

**User Story:** As a QC reviewer, I want to see the asset type for each item, so that I can understand what kind of asset I am reviewing.

#### Acceptance Criteria

1. THE Asset_List_View SHALL display the asset type (e.g., Banner, Video, Document) in a dedicated column.
2. WHEN an asset has a type mapped in the Asset Type Master, THE Asset_List_View SHALL display the mapped type name.
3. IF an asset does not have a type assigned, THEN THE Asset_List_View SHALL display a dash (-) as a placeholder.

### Requirement 4: Display Asset Category

**User Story:** As a QC reviewer, I want to see the asset category, so that I can understand the content classification of the asset.

#### Acceptance Criteria

1. THE Asset_List_View SHALL display the asset category in a dedicated column.
2. WHEN an asset has a category mapped in the Asset Category Master, THE Asset_List_View SHALL display the mapped category name.
3. IF an asset does not have a category assigned, THEN THE Asset_List_View SHALL display a dash (-) as a placeholder.

### Requirement 5: Display Content Type

**User Story:** As a QC reviewer, I want to see the content type, so that I can understand the intended use of the asset.

#### Acceptance Criteria

1. THE Asset_List_View SHALL display the content type (e.g., Blog, Service Page, SMM Post) in a dedicated column.
2. THE Asset_List_View SHALL display the content type selected during asset upload.
3. IF an asset does not have a content type assigned, THEN THE Asset_List_View SHALL display a dash (-) as a placeholder.

### Requirement 6: Display Linked Service

**User Story:** As a QC reviewer, I want to see which service an asset is linked to, so that I can understand the asset's context within the service hierarchy.

#### Acceptance Criteria

1. THE Asset_List_View SHALL display the linked service name in a dedicated column.
2. WHEN an asset has a linked service ID, THE Asset_List_View SHALL resolve and display the service name from the services data.
3. IF an asset does not have a linked service, THEN THE Asset_List_View SHALL display a dash (-) as a placeholder.

### Requirement 7: Display Linked Task

**User Story:** As a QC reviewer, I want to see which task an asset is linked to, so that I can trace the asset back to its originating work item.

#### Acceptance Criteria

1. THE Asset_List_View SHALL display the linked task name in a dedicated column.
2. WHEN an asset has a linked task ID, THE Asset_List_View SHALL resolve and display the task name from the tasks data.
3. IF an asset does not have a linked task, THEN THE Asset_List_View SHALL display a dash (-) as a placeholder.

### Requirement 8: Display QC Status with Dynamic Updates

**User Story:** As a QC reviewer, I want to see the current QC status of each asset with visual indicators, so that I can quickly identify which assets need attention.

#### Acceptance Criteria

1. THE Asset_List_View SHALL display the QC status in a dedicated column using color-coded badges.
2. WHEN an asset has QC status "Pass" or "QC Approved", THE Asset_List_View SHALL display a green badge with "Pass" text.
3. WHEN an asset has QC status "Fail" or "QC Rejected", THE Asset_List_View SHALL display a red badge with "Fail" text.
4. WHEN an asset has QC status "Rework" or "Rework Required", THE Asset_List_View SHALL display an orange badge with "Rework" text and a refresh icon.
5. WHEN an asset has QC status "Pending" or "Pending QC Review", THE Asset_List_View SHALL display an amber badge with "Pending" text.
6. WHEN a QC action is performed on an asset, THE Asset_List_View SHALL update the status badge dynamically without requiring a page refresh.

### Requirement 9: Display Asset Version

**User Story:** As a QC reviewer, I want to see the version number of each asset, so that I can track revisions and ensure I am reviewing the correct version.

#### Acceptance Criteria

1. THE Asset_List_View SHALL display the version number in a dedicated column.
2. THE Asset_List_View SHALL display version numbers in the format "vX.Y" (e.g., v1.0, v1.2).
3. IF an asset does not have a version number, THEN THE Asset_List_View SHALL display "v1.0" as the default.

### Requirement 10: Display Designer Information

**User Story:** As a QC reviewer, I want to see who designed or created each asset, so that I can identify the responsible team member.

#### Acceptance Criteria

1. THE Asset_List_View SHALL display the designer/creator name in a dedicated column.
2. WHEN an asset has a designed_by user ID, THE Asset_List_View SHALL resolve and display the user's name from the users data.
3. IF an asset does not have a designer assigned, THEN THE Asset_List_View SHALL display a dash (-) as a placeholder.

### Requirement 11: Display Upload Date and Time

**User Story:** As a QC reviewer, I want to see when each asset was uploaded, so that I can prioritize reviews based on submission time.

#### Acceptance Criteria

1. THE Asset_List_View SHALL display the upload date and time in a dedicated column.
2. THE Asset_List_View SHALL format the date according to the system date-time format (MM/DD/YYYY).
3. WHEN an asset has a submitted_at timestamp, THE Asset_List_View SHALL display that timestamp.
4. IF submitted_at is not available, THEN THE Asset_List_View SHALL fall back to the created_at timestamp.
5. IF neither timestamp is available, THEN THE Asset_List_View SHALL display a dash (-) as a placeholder.

### Requirement 12: Display Usage Count

**User Story:** As a QC reviewer, I want to see how many times an asset has been used, so that I can understand the asset's importance and reach.

#### Acceptance Criteria

1. THE Asset_List_View SHALL display the usage count in a dedicated column with center alignment.
2. THE Asset_List_View SHALL display the usage count as a numeric value inside a circular badge.
3. IF an asset has no usage count recorded, THEN THE Asset_List_View SHALL display 0.

### Requirement 13: Provide Role-Based Review Actions

**User Story:** As a user, I want to see appropriate action buttons based on my role and the asset's status, so that I can perform only the actions I am authorized to do.

#### Acceptance Criteria

1. THE Asset_List_View SHALL display a "View" button for all users on all assets.
2. WHEN the user is an admin AND the asset status is "Pending QC Review" or "Rework Required", THE Asset_List_View SHALL display a "Review QC" button.
3. WHEN the user is not an admin AND the asset status is "Rework Required", THE Asset_List_View SHALL display "Edit", "Resubmit", and "Delete" buttons.
4. WHEN a user clicks the "View" button, THE Asset_List_View SHALL open the Asset_Side_Panel.
5. WHEN an admin clicks the "Review QC" button, THE Asset_List_View SHALL navigate to the QC assessment detail view.
6. WHEN a user clicks the "Resubmit" button, THE Asset_List_View SHALL submit the asset for QC review and update the status.

### Requirement 14: Filter Assets by QC Status

**User Story:** As a QC reviewer, I want to filter assets by their QC status, so that I can focus on specific categories of assets.

#### Acceptance Criteria

1. THE Asset_List_View SHALL provide filter tabs for: All, Pending QC, Rework Required, Approved, and Rejected.
2. WHEN a user selects a filter tab, THE Asset_List_View SHALL display only assets matching that status.
3. THE Asset_List_View SHALL display a count badge on each filter tab showing the number of assets in that category.
4. THE Asset_List_View SHALL highlight the "Rework Required" tab for non-admin users when they have assets requiring rework.

### Requirement 15: Role-Based Asset Visibility

**User Story:** As a user, I want to see only the assets relevant to my role, so that I can focus on my responsibilities.

#### Acceptance Criteria

1. WHEN the user is an admin, THE Asset_List_View SHALL display all assets in the QC queue.
2. WHEN the user is not an admin, THE Asset_List_View SHALL display only assets where the user is the submitter, creator, or designer.
3. THE Asset_List_View SHALL display a role badge indicating whether the user is viewing as "Admin" or "User".
