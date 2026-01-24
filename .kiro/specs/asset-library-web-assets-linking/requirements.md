# Requirements Document: Asset Library Web Assets Linking

## Introduction

The Asset Library by Category component is designed to display and manage assets across multiple repositories (Web, SEO, SMM). Currently, the component shows "No assets found in this category" for web assets despite 7 total assets existing in the system. This requirement document establishes the specifications for fixing the web asset linking and display functionality.

## Glossary

- **Asset**: A digital resource (image, video, document) used in marketing campaigns
- **Asset_Library**: The component that displays and manages assets by category/repository
- **Repository**: A classification system for assets (Web, SEO, SMM)
- **Web_Asset**: An asset tagged with or categorized as "Web" repository
- **Asset_Category**: The classification of an asset (e.g., "what science can do", "how to")
- **Linking**: The association between an asset and a service/sub-service
- **QC_Status**: Quality control approval status of an asset
- **Workflow_Stage**: The current stage of an asset in the creation workflow

## Requirements

### Requirement 1: Web Assets Discovery and Retrieval

**User Story:** As a content manager, I want to discover and retrieve web assets from the system, so that I can view all available web assets in the Asset Library.

#### Acceptance Criteria

1. WHEN the Asset Library component loads, THE System SHALL fetch all available repositories (Web, SEO, SMM) from the backend
2. WHEN a user selects the "Web" repository, THE System SHALL retrieve all assets tagged with or categorized as "Web"
3. WHEN assets are retrieved, THE System SHALL include all asset metadata (name, type, category, format, thumbnail, status)
4. IF no assets are found for a repository, THE System SHALL display "No assets found in this category" with a count of 0
5. IF assets are found, THE System SHALL display the count of available assets for that repository

### Requirement 2: Asset Filtering by Repository

**User Story:** As a content manager, I want to filter assets by repository type, so that I can focus on specific asset categories.

#### Acceptance Criteria

1. WHEN the Asset Library displays repository tabs, THE System SHALL show tabs for Web, SEO, and SMM repositories
2. WHEN a user clicks on a repository tab, THE System SHALL filter and display only assets from that repository
3. WHEN a user clicks "All Categories", THE System SHALL display assets from all repositories combined
4. WHEN filtering by repository, THE System SHALL update the "Available" count to reflect filtered results
5. WHEN no assets match the selected repository, THE System SHALL display an empty state message

### Requirement 3: Web Asset Linking Mechanism

**User Story:** As a content manager, I want to link web assets to services and sub-services, so that assets are properly associated with their intended use.

#### Acceptance Criteria

1. WHEN a web asset is displayed in the Asset Library, THE System SHALL show a "Link Asset" button
2. WHEN a user clicks "Link Asset", THE System SHALL toggle the asset's linked status
3. WHEN an asset is linked, THE System SHALL update the linked_service_id or linked_sub_service_id in the database
4. WHEN an asset is linked, THE System SHALL persist the link immediately to the database
5. WHEN an asset is already linked, THE System SHALL display a "✓ Linked" button with visual indication

### Requirement 4: Asset Count Accuracy

**User Story:** As a system administrator, I want accurate asset counts, so that I can verify data integrity and asset availability.

#### Acceptance Criteria

1. WHEN the Asset Library displays summary statistics, THE System SHALL show the total number of assets in the system
2. WHEN the Asset Library displays summary statistics, THE System SHALL show the number of linked assets
3. WHEN the Asset Library displays summary statistics, THE System SHALL show the number of available (unlinked) assets
4. WHEN assets are added or removed, THE System SHALL update all counts accurately
5. WHEN filtering by repository, THE System SHALL update the "Available" count to match filtered results

### Requirement 5: Backend Asset Query Optimization

**User Story:** As a backend developer, I want optimized asset queries, so that the Asset Library loads quickly and efficiently.

#### Acceptance Criteria

1. WHEN the Asset Library requests assets by repository, THE Backend SHALL query the assets table using the tags or asset_category field
2. WHEN querying assets, THE Backend SHALL return only active assets (status != 'inactive')
3. WHEN querying assets, THE Backend SHALL include all necessary metadata fields for display
4. WHEN querying assets, THE Backend SHALL order results by creation date (newest first)
5. WHEN the query completes, THE Backend SHALL return results within 500ms

### Requirement 6: Web Asset Data Integrity

**User Story:** As a data steward, I want to ensure web assets have proper data integrity, so that the system maintains consistency.

#### Acceptance Criteria

1. WHEN a web asset is created, THE System SHALL assign it a repository tag (Web, SEO, or SMM)
2. WHEN a web asset is stored, THE System SHALL ensure the tags field contains the repository value
3. WHEN a web asset is retrieved, THE System SHALL include the repository information in the response
4. IF a web asset has no repository tag, THE System SHALL treat it as unclassified and not display it in repository filters
5. WHEN web assets are queried, THE System SHALL return consistent results regardless of query method

### Requirement 7: Asset Library Component State Management

**User Story:** As a frontend developer, I want proper state management in the Asset Library, so that the component displays accurate information.

#### Acceptance Criteria

1. WHEN the Asset Library component mounts, THE Component SHALL initialize with empty state
2. WHEN repositories are fetched, THE Component SHALL store them in state and update the UI
3. WHEN assets are fetched for each repository, THE Component SHALL store them in a keyed object (assetsByRepository)
4. WHEN the user searches or filters, THE Component SHALL update the filtered results without re-fetching
5. WHEN the component receives new linkedAssets props, THE Component SHALL update the linked status display

### Requirement 8: Search and Discovery

**User Story:** As a content manager, I want to search for specific web assets, so that I can quickly find assets by name or type.

#### Acceptance Criteria

1. WHEN a user enters a search query, THE System SHALL filter assets by name, type, or category
2. WHEN search results are displayed, THE System SHALL show only assets matching the query
3. WHEN the search query is cleared, THE System SHALL display all assets for the selected repository
4. WHEN searching across repositories, THE System SHALL search within the currently selected repository
5. WHEN no search results are found, THE System SHALL display "No assets found" message

## Notes

- The issue appears to be that web assets are not being properly tagged with the "Web" repository value
- The backend query may be filtering incorrectly or the frontend may not be receiving the data
- All asset types (Web, SEO, SMM) should be treated equally in the system
- The Asset Library component expects assets to have a `repository` field or be categorized by `asset_category`
