# Requirements Document

## Introduction

This document specifies the requirements for enhancing the Asset Workflow Management system within the Marketing Control Center application. The system enables users to upload, categorize, link, and manage media assets (images, videos, documents) across different repositories (SMM, Content, SEO) and automatically associate them with services and sub-services. The enhancement focuses on improving the asset upload workflow, automatic linking mechanisms, real-time metadata updates, and ensuring consistency between service and sub-service asset management interfaces.

## Glossary

- **Asset**: A media file (image, video, audio, document) stored in the Asset Library
- **Asset Library**: The central repository module where all assets are uploaded and managed
- **Repository**: A categorical grouping for assets (e.g., SMM Repository, Content Repository, SEO Repository, Design Repository)
- **Service**: A top-level service entity in the Service Master that can have linked assets and sub-services
- **Sub-service**: A child entity under a Service that can have its own linked assets
- **Service Master**: The interface for creating and managing services
- **Sub-Service Master**: The interface for creating and managing sub-services
- **Asset Linking**: The process of associating an asset with a service or sub-service
- **Mapped To**: A field in the asset upload form that specifies which service, sub-service, or page the asset should be linked to
- **Linking Metadata**: Real-time counts and information about linked assets and sub-services displayed in the service/sub-service forms
- **Asset Management Section**: The section in service/sub-service forms that displays and manages linked assets
- **Body Content Editor**: A rich text editor component used for entering content in service forms

## Requirements

### Requirement 1

**User Story:** As a content manager, I want to upload assets and specify their repository and mapping during upload, so that assets are automatically linked to the correct services or sub-services.

#### Acceptance Criteria

1. WHEN a user uploads an asset THEN the system SHALL display repository selection options including SMM Repository, Content Repository, SEO Repository, and Design Repository
2. WHEN a user selects an asset type THEN the system SHALL accept Image, Video, Audio, and Document as valid asset types
3. WHEN a user enters a mapped service or sub-service name in the "Mapped To" field THEN the system SHALL store this mapping information with the asset
4. WHEN a user sets the asset status THEN the system SHALL accept Available, In Use, Archived, and Deprecated as valid status values
5. WHEN a user completes the upload form with all required fields THEN the system SHALL create the asset record in the Asset Library

### Requirement 2

**User Story:** As a content manager, I want assets to automatically link to services when mapped during upload, so that I don't have to manually link them later.

#### Acceptance Criteria

1. WHEN an asset is uploaded with a service name in the "Mapped To" field THEN the system SHALL automatically create a link between the asset and the matching service in the Service Master
2. WHEN an asset is uploaded with a sub-service name in the "Mapped To" field THEN the system SHALL automatically create a link between the asset and the matching sub-service in the Sub-Service Master
3. WHEN an asset is uploaded with a page name in the "Mapped To" field THEN the system SHALL store the page mapping information in the asset record
4. WHEN the system cannot find a matching service or sub-service for the "Mapped To" value THEN the system SHALL store the mapping as text without creating an automatic link
5. WHEN an asset is successfully linked to a service or sub-service THEN the system SHALL update the linked_service_ids or linked_sub_service_ids array in the asset record

### Requirement 3

**User Story:** As a content manager, I want to search and manually link assets from the Asset Library to services, so that I can connect existing assets to services after upload.

#### Acceptance Criteria

1. WHEN a user views the Asset Library Management section in a service form THEN the system SHALL display all available assets from the Asset Library
2. WHEN a user enters a search query in the asset search field THEN the system SHALL filter assets by name, type, and repository matching the query
3. WHEN a user selects a repository filter THEN the system SHALL display only assets from the selected repository
4. WHEN a user clicks on an available asset THEN the system SHALL link the asset to the current service and move it to the linked assets list
5. WHEN a user clicks the unlink button on a linked asset THEN the system SHALL remove the link and move the asset back to the available assets list

### Requirement 4

**User Story:** As a service manager, I want the Asset Library Management section to appear first in the service form, so that I can manage assets before other service details.

#### Acceptance Criteria

1. WHEN a user opens the Create New Service form THEN the system SHALL display the Asset Library Management section as the first section before all other tabs
2. WHEN a user navigates through service form tabs THEN the system SHALL maintain the Asset Library Management section at the top of the tab order
3. WHEN a user views the service form THEN the system SHALL display linking metadata based on the Asset Management section content
4. WHEN a user views linking metadata THEN the system SHALL show asset count and sub-service count in real-time
5. WHEN a service is linked with a sub-service THEN the system SHALL automatically update the sub-service count to reflect the new total

### Requirement 5

**User Story:** As a content editor, I want the body content editor to function correctly, so that I can type content without it appearing under the S.NO column.

#### Acceptance Criteria

1. WHEN a user types in the body content editor THEN the system SHALL insert text at the cursor position within the editor field
2. WHEN a user types in the body content editor THEN the system SHALL prevent text from appearing in unrelated UI elements such as the S.NO column
3. WHEN the body content editor receives focus THEN the system SHALL isolate input events to only affect the editor content
4. WHEN a user types a letter in the body content editor THEN the system SHALL display the letter in the correct position within the editor
5. WHEN a user navigates away from the body content editor THEN the system SHALL preserve the entered content without corruption

### Requirement 6

**User Story:** As a sub-service manager, I want all asset management features available in the Service Master to also be available in the Sub-Service Master, so that I have consistent functionality across both interfaces.

#### Acceptance Criteria

1. WHEN a user opens the Create New Sub-service form THEN the system SHALL display an Asset Library Management section with the same features as the Service Master
2. WHEN a user views the Linking section in the Sub-Service Master THEN the system SHALL list all asset management items linked to the sub-service
3. WHEN a user views the Linking section in the Sub-Service Master THEN the system SHALL display all assets linked to the sub-service with their preview, name, type, and repository
4. WHEN a user compares Service Master and Sub-Service Master forms THEN the system SHALL provide identical asset linking fields and functionality in both interfaces
5. WHEN a user links an asset to a sub-service THEN the system SHALL update the asset's linked_sub_service_ids array to include the sub-service ID

### Requirement 7

**User Story:** As a content manager, I want real-time updates of asset and sub-service counts in the linking metadata, so that I can see accurate information as I make changes.

#### Acceptance Criteria

1. WHEN a user links an asset to a service THEN the system SHALL immediately increment the asset count in the linking metadata display
2. WHEN a user unlinks an asset from a service THEN the system SHALL immediately decrement the asset count in the linking metadata display
3. WHEN a sub-service is linked to a service THEN the system SHALL immediately increment the sub-service count in the linking metadata display
4. WHEN a sub-service is unlinked from a service THEN the system SHALL immediately decrement the sub-service count in the linking metadata display
5. WHEN the linking metadata is displayed THEN the system SHALL fetch counts from the current state without requiring a page refresh

### Requirement 8

**User Story:** As a system administrator, I want the asset linking system to maintain data integrity, so that assets are correctly associated with services and sub-services in the database.

#### Acceptance Criteria

1. WHEN an asset is linked to a service THEN the system SHALL store the service ID in the asset's linked_service_ids JSON array
2. WHEN an asset is linked to a sub-service THEN the system SHALL store the sub-service ID in the asset's linked_sub_service_ids JSON array
3. WHEN an asset is unlinked from a service THEN the system SHALL remove the service ID from the asset's linked_service_ids array
4. WHEN an asset is unlinked from a sub-service THEN the system SHALL remove the sub-service ID from the asset's linked_sub_service_ids array
5. WHEN the system updates asset linking data THEN the system SHALL emit real-time socket events to notify all connected clients of the changes
