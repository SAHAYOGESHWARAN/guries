# Requirements Document: Asset Management System

## Introduction

The Asset Management System is a comprehensive solution for managing digital assets with service-based organization, automated linking, and quality control workflow management. The system enables content managers to create hierarchical service structures, automatically link assets to services, generate URL slugs, track workflow status, and manage QC approvals with proper status updates.

## Glossary

- **Asset**: A digital file or resource that can be uploaded and managed within the system
- **Service**: A top-level organizational unit for grouping related assets
- **Sub-Service**: A child service nested under a parent Service for hierarchical organization
- **Web Repository**: The collection of assets linked to a specific service
- **Linked Service**: The service or sub-service that an asset is associated with
- **Workflow Stage**: The current processing state of an asset (e.g., CW, GD, QC, Approved)
- **QC Status**: The quality control approval state of an asset (QC Pending, Approved, Rejected)
- **Working Team**: The team currently responsible for processing an asset (e.g., CW, GD)
- **URL Slug**: A URL-friendly identifier automatically generated from a service name or URL
- **Asset Link**: The permanent association between an asset and a service (non-removable by users)

## Requirements

### Requirement 1: Service and Sub-Service Creation

**User Story:** As a content manager, I want to create services and sub-services from a "Create New Service" interface, so that I can organize assets hierarchically and maintain a system-wide service catalog.

#### Acceptance Criteria

1. WHEN a user accesses the "Create New Service" interface, THE System SHALL display a form with fields for service name, description, and optional parent service selection
2. WHEN a user submits a valid service creation form, THE System SHALL store the service in the database and make it available system-wide
3. WHEN a user selects a parent service during creation, THE System SHALL create a sub-service nested under that parent service
4. WHEN a service is created, THE System SHALL return the created service object with all required fields populated
5. WHEN a user attempts to create a service with a duplicate name under the same parent, THE System SHALL reject the creation and return a validation error

### Requirement 2: URL Slug Auto-Generation

**User Story:** As a content manager, I want URL slugs to auto-generate from service names or URLs, so that I don't have to manually create them and can ensure consistency.

#### Acceptance Criteria

1. WHEN a user enters a full URL in the service creation form, THE System SHALL extract and auto-generate a URL slug from that URL
2. WHEN a user enters only a service name without a URL, THE System SHALL generate a URL slug from the service name
3. WHEN a URL slug is auto-generated, THE System SHALL ensure it is URL-safe (lowercase, hyphens for spaces, no special characters)
4. WHEN a URL slug is auto-generated, THE System SHALL verify uniqueness and append a numeric suffix if a duplicate exists
5. THE System SHALL NOT require manual slug entry from users

### Requirement 3: Asset Upload with Service Linking

**User Story:** As an asset uploader, I want to link assets to services during upload, so that assets are automatically organized and appear in the correct service repository.

#### Acceptance Criteria

1. WHEN an asset upload form is displayed, THE System SHALL include a "Linked Service" dropdown field
2. WHEN the "Linked Service" dropdown is opened, THE System SHALL display all services and sub-services created in the system
3. WHEN a user selects a service or sub-service from the dropdown, THE System SHALL associate that service with the asset being uploaded
4. WHEN an asset is uploaded with a "Linked Service" selected, THE System SHALL automatically link the asset to that service without requiring additional manual linking steps
5. WHEN an asset is linked to a service, THE System SHALL immediately display the asset in the Web Repository section of that service's page

### Requirement 4: Static Asset-Service Links

**User Story:** As a content manager, I want asset-service links to be permanent and non-removable, so that the organizational structure remains stable and prevents accidental unlinking.

#### Acceptance Criteria

1. WHEN an asset is linked to a service, THE System SHALL store this link as a permanent association in the database
2. WHEN viewing an asset or service page, THE System SHALL NOT display an "Unlink" or "Remove Link" option for users
3. WHEN a user attempts to remove an asset-service link through any interface, THE System SHALL prevent the action and maintain the link
4. WHEN an asset is linked to a service, THE System SHALL display the linked service information as read-only on the asset details page

### Requirement 5: Workflow Status Visibility on Assets

**User Story:** As a team member, I want to see which team is currently working on an asset, so that I can coordinate efforts and understand the current processing status.

#### Acceptance Criteria

1. WHEN an asset's workflow stage changes to a team-specific stage (e.g., CW, GD), THE System SHALL display a status tag near the asset name
2. WHEN a status tag is displayed, THE System SHALL show text indicating which team is working on the asset (e.g., "CW is working on this asset")
3. WHEN an asset's workflow stage changes, THE System SHALL update the status tag in real-time across all views where the asset is displayed
4. WHEN an asset is in QC review stage, THE System SHALL display "QC is working on this asset" as the status tag
5. WHEN an asset's workflow stage changes to a completed state (e.g., Approved), THE System SHALL update or remove the status tag accordingly

### Requirement 6: QC Approval Status Updates

**User Story:** As a QC reviewer, I want to approve assets and have their status update correctly throughout the system, so that the workflow progresses properly and status remains consistent.

#### Acceptance Criteria

1. WHEN a QC reviewer approves an asset in the QC Review module, THE System SHALL update the asset's QC status to "Approved"
2. WHEN a QC reviewer approves an asset, THE System SHALL update the asset's workflow stage to reflect the approved state
3. WHEN an asset is approved, THE System SHALL remove the asset from the QC review queue and review options
4. WHEN an asset is approved, THE System SHALL update the asset's status tag to reflect the new workflow stage
5. WHEN a QC reviewer rejects an asset, THE System SHALL update the QC status to "Rejected" and return the asset to the previous workflow stage
6. WHEN an asset's QC status changes, THE System SHALL persist the change to the database and reflect it across all views

### Requirement 7: QC Review Module Functionality

**User Story:** As a QC reviewer, I want the QC review module to correctly display assets and process approvals, so that I can efficiently manage the quality control workflow.

#### Acceptance Criteria

1. WHEN the QC Review module is opened, THE System SHALL display all assets currently in QC review status
2. WHEN an asset is displayed in the QC Review module, THE System SHALL show all relevant asset information including name, linked service, and current workflow stage
3. WHEN a QC reviewer clicks the approval action on an asset, THE System SHALL process the approval and update all related asset fields
4. WHEN an asset is approved through the QC Review module, THE System SHALL trigger real-time updates via Socket.io to notify other users
5. WHEN the QC Review module processes an approval, THE System SHALL validate that the asset is in a valid state for approval before updating

### Requirement 8: Service Page Web Repository Display

**User Story:** As a content manager, I want to see all assets linked to a service in the Web Repository section, so that I can manage and review service-specific assets.

#### Acceptance Criteria

1. WHEN a service page is displayed, THE System SHALL show a Web Repository section containing all assets linked to that service
2. WHEN an asset is linked to a service, THE System SHALL immediately add it to the Web Repository display without requiring a page refresh
3. WHEN multiple assets are linked to a service, THE System SHALL display them in a list or grid format with relevant information
4. WHEN viewing the Web Repository, THE System SHALL display each asset's current workflow status and QC status
5. WHEN an asset's status changes, THE System SHALL update its display in the Web Repository in real-time

### Requirement 9: Data Persistence and Consistency

**User Story:** As a system administrator, I want all asset, service, and workflow data to be correctly persisted and consistent, so that the system maintains data integrity.

#### Acceptance Criteria

1. WHEN a service is created, THE System SHALL persist it to the SQLite database with all required fields
2. WHEN an asset is linked to a service, THE System SHALL create a persistent database record of the association
3. WHEN an asset's workflow stage or QC status changes, THE System SHALL update the database record immediately
4. WHEN the system is restarted, THE System SHALL restore all services, assets, and links from the database without data loss
5. WHEN multiple users perform concurrent operations, THE System SHALL maintain data consistency and prevent conflicts

### Requirement 10: Real-Time Updates via Socket.io

**User Story:** As a user, I want to see real-time updates when assets or services are modified, so that I always have current information.

#### Acceptance Criteria

1. WHEN an asset's status changes, THE System SHALL broadcast the update via Socket.io to all connected clients
2. WHEN a new service is created, THE System SHALL broadcast the update to all connected clients so the service appears in dropdowns
3. WHEN an asset is linked to a service, THE System SHALL broadcast the update to all clients viewing that service's page
4. WHEN a QC approval is processed, THE System SHALL broadcast the update to all clients viewing the asset or QC review module
5. WHEN Socket.io broadcasts an update, THE System SHALL update the UI without requiring a manual page refresh
