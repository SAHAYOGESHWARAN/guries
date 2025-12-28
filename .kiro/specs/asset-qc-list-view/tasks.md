# Implementation Plan: Asset QC List View

## Overview

This implementation plan covers the enhancement of the existing AssetQCView component to ensure all required fields are properly displayed in the list view table. The existing implementation already has most of the structure in place, so the tasks focus on verification, refinement, and adding property-based tests to ensure correctness.

## Tasks

- [ ] 1. Verify and enhance table column structure
  - [ ] 1.1 Verify all 13 columns are present in the table header
    - Confirm columns: Thumbnail, Asset Name, Asset Type, Asset Category, Content Type, Linked Service, Linked Task, QC Status, Version, Designer, Uploaded At, Usage Count, Review Action
    - Ensure column headers use consistent styling and uppercase tracking
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1, 12.1, 13.1_

  - [ ] 1.2 Verify thumbnail column rendering
    - Ensure thumbnail displays from thumbnail_url when available
    - Ensure placeholder icon displays when thumbnail_url is missing
    - Verify 48x48 pixel size with rounded corners
    - _Requirements: 1.2, 1.3, 1.4_

  - [ ]* 1.3 Write property test for thumbnail rendering
    - **Property 1: Thumbnail Rendering Consistency**
    - **Validates: Requirements 1.2, 1.3**

- [ ] 2. Implement and verify helper functions for name resolution
  - [ ] 2.1 Verify getAssetTypeName function
    - Ensure it resolves type name from Asset Type Master
    - Ensure it returns dash (-) for missing types
    - _Requirements: 3.2, 3.3_

  - [ ] 2.2 Verify getAssetCategoryName function
    - Ensure it resolves category name from Asset Category Master
    - Ensure it returns dash (-) for missing categories
    - _Requirements: 4.2, 4.3_

  - [ ] 2.3 Verify getLinkedServiceName function
    - Ensure it resolves service name from services data
    - Ensure it handles both linked_service_id and linked_service_ids array
    - Ensure it returns dash (-) for missing services
    - _Requirements: 6.2, 6.3_

  - [ ] 2.4 Verify getLinkedTaskName function
    - Ensure it resolves task name from tasks data
    - Ensure it handles both linked_task_id and linked_task fields
    - Ensure it returns dash (-) for missing tasks
    - _Requirements: 7.2, 7.3_

  - [ ] 2.5 Verify getDesignerName function
    - Ensure it resolves user name from users data
    - Ensure it returns dash (-) for missing designers
    - _Requirements: 10.2, 10.3_

  - [ ]* 2.6 Write property test for entity name resolution
    - **Property 2: Entity Name Resolution**
    - **Validates: Requirements 3.2, 4.2, 6.2, 7.2, 10.2, 3.3, 4.3, 6.3, 7.3, 10.3**

- [ ] 3. Verify QC status badge rendering
  - [ ] 3.1 Verify getQCStatusBadge function
    - Ensure correct color mapping for Pass/QC Approved (green)
    - Ensure correct color mapping for Fail/QC Rejected (red)
    - Ensure correct color mapping for Rework/Rework Required (orange with icon)
    - Ensure correct color mapping for Pending/Pending QC Review (amber)
    - _Requirements: 8.2, 8.3, 8.4, 8.5_

  - [ ]* 3.2 Write property test for QC status badge mapping
    - **Property 3: QC Status Badge Mapping**
    - **Validates: Requirements 8.2, 8.3, 8.4, 8.5**

- [ ] 4. Verify date formatting and version display
  - [ ] 4.1 Implement formatUploadDate helper function
    - Use submitted_at as primary timestamp
    - Fall back to created_at if submitted_at is unavailable
    - Return dash (-) if neither timestamp is available
    - Format as MM/DD/YYYY
    - _Requirements: 11.2, 11.3, 11.4, 11.5_

  - [ ] 4.2 Verify version number display
    - Display version_number if available
    - Display "v1.0" as default if version_number is missing
    - _Requirements: 9.2, 9.3_

  - [ ]* 4.3 Write property test for date formatting and fallback
    - **Property 4: Date Formatting and Fallback**
    - **Validates: Requirements 11.2, 11.3, 11.4, 11.5**

- [ ] 5. Checkpoint - Verify table rendering
  - Ensure all tests pass, ask the user if questions arise.
  - Manually verify table displays all columns correctly

- [ ] 6. Implement role-based action buttons
  - [ ] 6.1 Verify View button is always visible
    - Ensure View button appears for all users on all assets
    - Ensure clicking View opens the Asset_Side_Panel
    - _Requirements: 13.1, 13.4_

  - [ ] 6.2 Verify admin Review QC button visibility
    - Ensure Review QC button appears for admins on Pending/Rework assets
    - Ensure clicking Review QC navigates to QC assessment view
    - _Requirements: 13.2, 13.5_

  - [ ] 6.3 Verify non-admin action buttons for rework assets
    - Ensure Edit, Resubmit, Delete buttons appear for non-admins on their rework assets
    - Ensure Resubmit action updates asset status
    - _Requirements: 13.3, 13.6_

  - [ ]* 6.4 Write property test for role-based action visibility
    - **Property 5: Role-Based Action Visibility**
    - **Validates: Requirements 13.1, 13.2, 13.3**

- [ ] 7. Verify filtering functionality
  - [ ] 7.1 Verify filter tabs display and functionality
    - Ensure All, Pending QC, Rework Required, Approved, Rejected tabs are present
    - Ensure selecting a tab filters assets correctly
    - _Requirements: 14.1, 14.2_

  - [ ] 7.2 Verify filter count badges
    - Ensure each tab displays accurate count of matching assets
    - Ensure counts update when assets change status
    - _Requirements: 14.3_

  - [ ] 7.3 Verify role-based asset visibility
    - Ensure admins see all assets
    - Ensure non-admins see only their own assets (submitted_by, created_by, or designed_by)
    - _Requirements: 15.1, 15.2_

  - [ ] 7.4 Verify Rework tab highlighting for non-admins
    - Ensure Rework Required tab is highlighted when non-admin has rework assets
    - _Requirements: 14.4_

  - [ ]* 7.5 Write property test for asset filtering
    - **Property 6: Asset Filtering by Status and Role**
    - **Validates: Requirements 14.2, 15.2**

  - [ ]* 7.6 Write property test for filter count accuracy
    - **Property 7: Filter Count Accuracy**
    - **Validates: Requirements 14.3**

- [ ] 8. Verify dynamic status updates
  - [ ] 8.1 Verify status updates after QC actions
    - Ensure status badge updates after approve/reject/rework actions
    - Ensure filter counts update after status changes
    - Ensure no page refresh is required
    - _Requirements: 8.6_

- [ ] 9. Verify usage count display
  - [ ] 9.1 Verify usage count column rendering
    - Ensure usage_count is displayed in circular badge
    - Ensure 0 is displayed when usage_count is missing
    - Ensure center alignment
    - _Requirements: 12.1, 12.2, 12.3_

- [ ] 10. Verify role badge display
  - [ ] 10.1 Verify role badge in header
    - Ensure "Admin" badge displays for admin users
    - Ensure "User" badge displays for non-admin users
    - _Requirements: 15.3_

- [ ] 11. Final checkpoint - Complete verification
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all 15 requirements are satisfied
  - Verify all 7 correctness properties are tested

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP
- The existing AssetQCView.tsx already implements most functionality; tasks focus on verification and testing
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties using fast-check library
- Unit tests validate specific examples and edge cases using Vitest
