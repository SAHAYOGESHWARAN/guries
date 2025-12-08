# Implementation Plan

- [ ] 1. Backend: Enhance asset controller with automatic linking logic
  - Update createAssetLibraryItem endpoint to parse mapped_to field
  - Implement service/sub-service name matching algorithm
  - Update linked_service_ids and linked_sub_service_ids arrays
  - Add socket event emission for asset creation/updates
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 8.5_

- [ ]* 1.1 Write property test for automatic service linking
  - **Property 5: Automatic service linking**
  - **Validates: Requirements 2.1**

- [ ]* 1.2 Write property test for automatic sub-service linking
  - **Property 6: Automatic sub-service linking**
  - **Validates: Requirements 2.2**

- [ ]* 1.3 Write property test for fallback mapping storage
  - **Property 7: Fallback mapping storage**
  - **Validates: Requirements 2.4**

- [ ] 2. Backend: Add database indexes and update asset endpoints
  - Create GIN indexes on linked_service_ids and linked_sub_service_ids columns
  - Update updateAssetLibraryItem to handle linking array updates
  - Ensure proper JSON array manipulation in SQL queries
  - Add validation for asset type and status fields
  - _Requirements: 1.2, 1.4, 8.1, 8.2, 8.3, 8.4_

- [ ]* 2.1 Write property test for database persistence of service links
  - **Property 19: Database persistence of service links**
  - **Validates: Requirements 8.1**

- [ ]* 2.2 Write property test for database persistence of sub-service links
  - **Property 20: Database persistence of sub-service links**
  - **Validates: Requirements 8.2**

- [ ]* 2.3 Write property test for database removal of service links
  - **Property 21: Database removal of service links**
  - **Validates: Requirements 8.3**

- [ ]* 2.4 Write property test for database removal of sub-service links
  - **Property 22: Database removal of sub-service links**
  - **Validates: Requirements 8.4**

- [ ] 3. Frontend: Enhance AssetsView upload form with mapped_to field
  - Add "Mapped To" input field to asset upload form
  - Add helper text explaining format: "Service / Sub-service / Page"
  - Update form validation to accept mapped_to field
  - Update handleUpload to include mapped_to in API request
  - Ensure all repository options are available in dropdown
  - _Requirements: 1.1, 1.3, 1.5_

- [ ]* 3.1 Write property test for mapped-to field persistence
  - **Property 2: Mapped-to field persistence**
  - **Validates: Requirements 1.3**

- [ ]* 3.2 Write property test for asset creation with required fields
  - **Property 4: Asset creation with required fields**
  - **Validates: Requirements 1.5**

- [ ] 4. Frontend: Update ServiceAssetLinker for enhanced linking functionality
  - Add repository filter dropdown to available assets panel
  - Implement onToggle handler to update linked_service_ids/linked_sub_service_ids
  - Add real-time count updates after link/unlink operations
  - Ensure proper state management for linked vs available assets
  - Add loading states during link/unlink operations
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 4.1 Write property test for search result filtering
  - **Property 8: Search result filtering**
  - **Validates: Requirements 3.2**

- [ ]* 4.2 Write property test for repository filter correctness
  - **Property 9: Repository filter correctness**
  - **Validates: Requirements 3.3**

- [ ]* 4.3 Write property test for link operation correctness
  - **Property 10: Link operation correctness**
  - **Validates: Requirements 3.4**

- [ ]* 4.4 Write property test for unlink operation correctness
  - **Property 11: Unlink operation correctness**
  - **Validates: Requirements 3.5**

- [ ] 5. Frontend: Implement real-time metadata calculations in ServiceMasterView
  - Create computeLinkingMetadata function to calculate asset and sub-service counts
  - Update linking metadata display to use computed values
  - Add useEffect hooks to recalculate on asset/sub-service changes
  - Ensure counts update immediately after link/unlink operations
  - Display counts in prominent badges/cards
  - _Requirements: 4.3, 4.4, 4.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 5.1 Write property test for real-time asset count accuracy
  - **Property 12: Real-time asset count accuracy**
  - **Validates: Requirements 4.3, 7.1, 7.2**

- [ ]* 5.2 Write property test for real-time sub-service count accuracy
  - **Property 13: Real-time sub-service count accuracy**
  - **Validates: Requirements 4.5, 7.3, 7.4**

- [ ] 6. Frontend: Reorder service form tabs to prioritize Asset Library Management
  - Move Asset Library Management section to first position in tab order
  - Update tab navigation logic to maintain order
  - Ensure linking metadata appears after Asset Management section
  - Update UI to clearly indicate Asset Library Management is the primary section
  - _Requirements: 4.1, 4.2_

- [ ] 7. Frontend: Fix body content editor event isolation
  - Add stopPropagation() to editor event handlers (onChange, onFocus, onKeyDown)
  - Wrap editor in container div with click event isolation
  - Test that typing in editor doesn't affect other UI elements (S.NO column)
  - Ensure proper focus management when navigating to/from editor
  - Verify content preservation when focus changes
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 7.1 Write property test for editor input isolation
  - **Property 14: Editor input isolation**
  - **Validates: Requirements 5.2, 5.4**

- [ ]* 7.2 Write property test for editor content preservation
  - **Property 15: Editor content preservation**
  - **Validates: Requirements 5.5**

- [ ] 8. Frontend: Add Asset Library Management to SubServiceMasterView
  - Copy ServiceAssetLinker component integration from ServiceMasterView
  - Update to use linked_sub_service_ids instead of linked_service_ids
  - Ensure all asset management features work identically to Service Master
  - Add linking section to display linked assets with full details
  - Implement same search, filter, and linking functionality
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 8.1 Write property test for sub-service asset display correctness
  - **Property 16: Sub-service asset display correctness**
  - **Validates: Requirements 6.2**

- [ ]* 8.2 Write property test for asset detail completeness
  - **Property 17: Asset detail completeness**
  - **Validates: Requirements 6.3**

- [ ]* 8.3 Write property test for sub-service linking correctness
  - **Property 18: Sub-service linking correctness**
  - **Validates: Requirements 6.5**

- [ ] 9. Frontend: Implement socket event listeners for real-time updates
  - Add socket listeners for assetLibrary_created, assetLibrary_updated, assetLibrary_deleted events
  - Update local state when socket events are received
  - Ensure UI updates immediately without page refresh
  - Handle concurrent updates from multiple users
  - Add error handling for socket disconnections
  - _Requirements: 8.5_

- [ ]* 9.1 Write property test for socket event emission
  - **Property 23: Socket event emission**
  - **Validates: Requirements 8.5**

- [ ] 10. Testing: Add validation tests for asset types and statuses
  - Test that all valid asset types (Image, Video, Audio, Document) are accepted
  - Test that invalid asset types are rejected
  - Test that all valid statuses (Available, In Use, Archived, Deprecated) are accepted
  - Test that invalid statuses are rejected
  - _Requirements: 1.2, 1.4_

- [ ]* 10.1 Write property test for valid asset type acceptance
  - **Property 1: Valid asset type acceptance**
  - **Validates: Requirements 1.2**

- [ ]* 10.2 Write property test for valid status acceptance
  - **Property 3: Valid status acceptance**
  - **Validates: Requirements 1.4**

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. UI/UX: Add loading states and error handling
  - Add loading spinners during asset upload
  - Add loading indicators during link/unlink operations
  - Display user-friendly error messages for upload failures
  - Add retry mechanism for network failures
  - Show success notifications after successful operations
  - _Requirements: All_

- [ ] 13. UI/UX: Optimize performance for large asset lists
  - Implement debouncing for search input (300ms delay)
  - Add pagination or virtual scrolling for asset lists with 100+ items
  - Optimize re-renders using React.memo for asset cards
  - Use useMemo for expensive filtering operations
  - Profile and optimize database queries
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 14. Documentation: Update user guide and API documentation
  - Document new "Mapped To" field usage and format
  - Document automatic linking behavior
  - Document Asset Library Management section in service forms
  - Update API documentation for enhanced asset endpoints
  - Create troubleshooting guide for common issues
  - _Requirements: All_

- [ ] 15. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
