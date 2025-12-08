# Design Document

## Overview

The Asset Workflow Enhancement feature improves the asset management system within the Marketing Control Center by streamlining the upload process, implementing automatic linking mechanisms, and ensuring consistency across service and sub-service interfaces. The system enables users to upload media assets, categorize them by repository, and automatically or manually link them to services and sub-services. Real-time metadata updates provide immediate feedback on linking operations, while a unified interface ensures feature parity between Service Master and Sub-Service Master forms.

The enhancement addresses several key pain points:
1. Manual asset linking is time-consuming and error-prone
2. Asset Library Management section is not prominently positioned in service forms
3. Body content editor has input focus issues
4. Sub-Service Master lacks full asset management capabilities
5. Linking metadata is not updated in real-time

## Architecture

The system follows a client-server architecture with real-time communication:

### Frontend Architecture
- **React Components**: AssetsView, ServiceMasterView, SubServiceMasterView
- **Shared Components**: ServiceAssetLinker, AssetLinker
- **State Management**: React hooks (useState, useEffect, useMemo, useCallback)
- **Data Layer**: useData custom hook for API communication
- **Real-time Updates**: Socket.io client for live data synchronization

### Backend Architecture
- **API Layer**: Express.js REST endpoints
- **Controllers**: assetController, serviceController
- **Database**: PostgreSQL with JSON array fields for relationships
- **Real-time Layer**: Socket.io server for broadcasting updates
- **Data Model**: Relational tables with JSON arrays for many-to-many relationships

### Communication Flow
```
User Action → React Component → useData Hook → API Request → Controller → Database
                                                                    ↓
                                                              Socket Event
                                                                    ↓
                                                          All Connected Clients
```

## Components and Interfaces

### 1. Asset Upload Interface (AssetsView)

**Purpose**: Provide a comprehensive interface for uploading and managing assets

**Key Features**:
- Drag-and-drop file upload
- Repository selection (SMM, Content, SEO, Design)
- Asset type selection (Image, Video, Audio, Document)
- "Mapped To" field for specifying service/sub-service/page associations
- Status management (Available, In Use, Archived, Deprecated)
- Preview generation for images
- Real-time validation

**Interface**:
```typescript
interface AssetUploadForm {
  name: string;
  type: 'Image' | 'Video' | 'Audio' | 'Document';
  repository: 'Content Repository' | 'SMM Repository' | 'SEO Repository' | 'Design Repository';
  usage_status: 'Available' | 'In Use' | 'Archived' | 'Deprecated';
  status?: 'Draft' | 'Published' | 'Archived' | 'In Progress' | 'QC' | 'Approved';
  asset_category?: string;
  asset_format?: string;
  mapped_to?: string; // "Service Name / Sub-service Name / Page Title"
  file_url?: string;
  thumbnail_url?: string;
  file_size?: number;
  file_type?: string;
}
```

### 2. Automatic Linking Service

**Purpose**: Parse "Mapped To" field and create automatic links to services/sub-services

**Algorithm**:
```typescript
function parseAndLinkAsset(asset: AssetUploadForm, services: Service[], subServices: SubServiceItem[]): {
  linked_service_ids: number[];
  linked_sub_service_ids: number[];
  linked_page_ids: number[];
} {
  const result = {
    linked_service_ids: [],
    linked_sub_service_ids: [],
    linked_page_ids: []
  };
  
  if (!asset.mapped_to) return result;
  
  // Parse mapped_to string (format: "Service / Sub-service / Page")
  const parts = asset.mapped_to.split('/').map(p => p.trim().toLowerCase());
  
  // Try to match service
  const matchedService = services.find(s => 
    s.service_name.toLowerCase() === parts[0] ||
    s.slug.toLowerCase() === parts[0]
  );
  
  if (matchedService) {
    result.linked_service_ids.push(matchedService.id);
  }
  
  // Try to match sub-service
  if (parts.length > 1) {
    const matchedSubService = subServices.find(ss => 
      ss.sub_service_name.toLowerCase() === parts[1] ||
      ss.slug.toLowerCase() === parts[1]
    );
    
    if (matchedSubService) {
      result.linked_sub_service_ids.push(matchedSubService.id);
    }
  }
  
  return result;
}
```

### 3. Asset Library Management Component (ServiceAssetLinker)

**Purpose**: Provide a dual-panel interface for linking assets to services/sub-services

**Features**:
- Left panel: Currently linked assets
- Right panel: Available assets from Asset Library
- Search functionality with filters
- Repository filtering
- One-click linking/unlinking
- Real-time count updates
- Preview thumbnails

**Props Interface**:
```typescript
interface ServiceAssetLinkerProps {
  linkedAssets: AssetLibraryItem[];
  availableAssets: AssetLibraryItem[];
  assetSearch: string;
  setAssetSearch: (value: string) => void;
  onToggle: (asset: AssetLibraryItem) => void;
  totalAssets: number;
  repositoryFilter?: string;
  setRepositoryFilter?: (value: string) => void;
  allAssets?: AssetLibraryItem[];
}
```

### 4. Real-time Metadata Service

**Purpose**: Calculate and display linking metadata in real-time

**Computed Values**:
```typescript
interface LinkingMetadata {
  assetCount: number;        // Count of linked assets
  subServiceCount: number;   // Count of linked sub-services
  keywordCount: number;      // Count of linked keywords
}

function computeLinkingMetadata(
  serviceId: number,
  assets: AssetLibraryItem[],
  subServices: SubServiceItem[]
): LinkingMetadata {
  return {
    assetCount: assets.filter(a => 
      a.linked_service_ids?.includes(serviceId)
    ).length,
    subServiceCount: subServices.filter(ss => 
      ss.parent_service_id === serviceId
    ).length,
    keywordCount: 0 // Computed from keywords table
  };
}
```

### 5. Body Content Editor Fix

**Purpose**: Ensure input events are properly isolated to the editor component

**Implementation**:
- Add explicit event handlers with stopPropagation()
- Ensure proper focus management
- Isolate editor state from parent component state
- Use controlled component pattern with proper onChange handlers

**Fix Strategy**:
```typescript
// Ensure editor has proper event isolation
<div className="editor-container" onClick={(e) => e.stopPropagation()}>
  <textarea
    value={bodyContent}
    onChange={(e) => {
      e.stopPropagation();
      setBodyContent(e.target.value);
    }}
    onFocus={(e) => e.stopPropagation()}
    onKeyDown={(e) => e.stopPropagation()}
  />
</div>
```

## Data Models

### Asset Library Item (Enhanced)
```typescript
interface AssetLibraryItem {
  id: number;
  name: string;
  type: string;                    // Asset Type: article/video/graphic/guide/Image/Video/Audio/Document
  asset_category?: string;         // e.g., "what science can do"
  asset_format?: string;           // e.g., "image", "video", "pdf"
  repository: string;              // SMM/Content/SEO/Design Repository
  usage_status: string;            // Available/In Use/Archived/Deprecated
  status?: string;                 // Draft/Published/Archived/In Progress/QC/Approved
  qc_score?: number;
  date: string;
  file_url?: string;
  thumbnail_url?: string;
  file_size?: number;
  file_type?: string;
  linked_service_ids?: number[];   // JSON array of service IDs
  linked_sub_service_ids?: number[]; // JSON array of sub-service IDs
  linked_page_ids?: number[];      // JSON array of page IDs
  mapped_to?: string;              // Display string: "Service / Sub-service / Page"
}
```

### Database Schema Updates
```sql
-- Assets table already has these fields, ensure they are properly used:
ALTER TABLE assets 
  ADD COLUMN IF NOT EXISTS linked_service_ids JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS linked_sub_service_ids JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS linked_page_ids JSONB DEFAULT '[]';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assets_linked_service_ids ON assets USING GIN (linked_service_ids);
CREATE INDEX IF NOT EXISTS idx_assets_linked_sub_service_ids ON assets USING GIN (linked_sub_service_ids);
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Valid asset type acceptance
*For any* asset type from the set {Image, Video, Audio, Document}, the system should accept it as valid during asset creation
**Validates: Requirements 1.2**

### Property 2: Mapped-to field persistence
*For any* string entered in the mapped_to field, the system should store it exactly as entered in the asset record
**Validates: Requirements 1.3**

### Property 3: Valid status acceptance
*For any* status from the set {Available, In Use, Archived, Deprecated}, the system should accept it as valid
**Validates: Requirements 1.4**

### Property 4: Asset creation with required fields
*For any* valid asset data with all required fields (name, type, repository, usage_status), the system should successfully create an asset record
**Validates: Requirements 1.5**

### Property 5: Automatic service linking
*For any* asset with a mapped_to value that matches an existing service name or slug, the system should add the service ID to linked_service_ids
**Validates: Requirements 2.1**

### Property 6: Automatic sub-service linking
*For any* asset with a mapped_to value that matches an existing sub-service name or slug, the system should add the sub-service ID to linked_sub_service_ids
**Validates: Requirements 2.2**

### Property 7: Fallback mapping storage
*For any* mapped_to value that doesn't match existing services or sub-services, the system should store the value in mapped_to field without creating links
**Validates: Requirements 2.4**

### Property 8: Search result filtering
*For any* search query, all returned assets should contain the query string in their name, type, or repository fields (case-insensitive)
**Validates: Requirements 3.2**

### Property 9: Repository filter correctness
*For any* repository filter selection, all displayed assets should have exactly that repository value
**Validates: Requirements 3.3**

### Property 10: Link operation correctness
*For any* asset and service combination, linking should add the service ID to the asset's linked_service_ids array
**Validates: Requirements 3.4**

### Property 11: Unlink operation correctness
*For any* linked asset, unlinking should remove the service ID from the asset's linked_service_ids array
**Validates: Requirements 3.5**

### Property 12: Real-time asset count accuracy
*For any* service, the displayed asset count should equal the number of assets with that service ID in their linked_service_ids array
**Validates: Requirements 4.3, 7.1, 7.2**

### Property 13: Real-time sub-service count accuracy
*For any* service, the displayed sub-service count should equal the number of sub-services with that service as parent_service_id
**Validates: Requirements 4.5, 7.3, 7.4**

### Property 14: Editor input isolation
*For any* text input in the body content editor, the text should appear only in the editor field and not in other UI elements
**Validates: Requirements 5.2, 5.4**

### Property 15: Editor content preservation
*For any* content entered in the body content editor, navigating away and back should preserve the exact content
**Validates: Requirements 5.5**

### Property 16: Sub-service asset display correctness
*For any* sub-service, all displayed linked assets should have the sub-service ID in their linked_sub_service_ids array
**Validates: Requirements 6.2**

### Property 17: Asset detail completeness
*For any* linked asset displayed in the UI, the display should include preview/icon, name, type, and repository
**Validates: Requirements 6.3**

### Property 18: Sub-service linking correctness
*For any* asset linked to a sub-service, the asset's linked_sub_service_ids array should contain the sub-service ID
**Validates: Requirements 6.5**

### Property 19: Database persistence of service links
*For any* asset-service link operation, querying the database should show the service ID in the asset's linked_service_ids JSON array
**Validates: Requirements 8.1**

### Property 20: Database persistence of sub-service links
*For any* asset-subservice link operation, querying the database should show the sub-service ID in the asset's linked_sub_service_ids JSON array
**Validates: Requirements 8.2**

### Property 21: Database removal of service links
*For any* asset-service unlink operation, querying the database should show the service ID removed from the asset's linked_service_ids array
**Validates: Requirements 8.3**

### Property 22: Database removal of sub-service links
*For any* asset-subservice unlink operation, querying the database should show the sub-service ID removed from the asset's linked_sub_service_ids array
**Validates: Requirements 8.4**

### Property 23: Socket event emission
*For any* asset linking update operation, the system should emit a socket event containing the updated asset data
**Validates: Requirements 8.5**

## Error Handling

### 1. Upload Errors
- **Missing Required Fields**: Display validation error before submission
- **File Size Exceeded**: Show error message with size limit
- **Unsupported File Type**: Display list of supported formats
- **Network Failure**: Retry mechanism with exponential backoff
- **Server Error**: Display user-friendly error message and log details

### 2. Linking Errors
- **Asset Not Found**: Refresh asset list and show error
- **Service Not Found**: Display error and suggest creating service first
- **Duplicate Link**: Silently ignore (idempotent operation)
- **Database Constraint Violation**: Roll back and show error
- **Concurrent Modification**: Refresh data and retry

### 3. Real-time Update Errors
- **Socket Disconnection**: Attempt reconnection with exponential backoff
- **Event Processing Failure**: Log error and continue with next event
- **State Synchronization Error**: Force refresh from server

### 4. Search and Filter Errors
- **Invalid Search Query**: Sanitize input and continue
- **No Results**: Display helpful message with suggestions
- **Filter Combination Error**: Reset filters to default

## Testing Strategy

### Unit Testing
- Test individual functions for parsing mapped_to strings
- Test asset validation logic
- Test linking/unlinking operations
- Test metadata calculation functions
- Test search and filter logic
- Test event handler isolation in editor component

### Property-Based Testing
- Use **fast-check** library for JavaScript/TypeScript property-based testing
- Configure each property test to run minimum 100 iterations
- Each property test must be tagged with: `**Feature: asset-workflow-enhancement, Property {number}: {property_text}**`
- Each correctness property listed above must be implemented as a single property-based test
- Generate random valid assets, services, and sub-services for testing
- Test edge cases: empty arrays, null values, special characters in names
- Test concurrent operations: multiple links/unlinks in rapid succession

### Integration Testing
- Test complete upload workflow from UI to database
- Test automatic linking with real service/sub-service data
- Test manual linking through ServiceAssetLinker component
- Test real-time updates across multiple clients
- Test database transactions and rollbacks

### End-to-End Testing
- Test user journey: upload asset → automatic link → view in service form
- Test user journey: create service → link existing assets → verify metadata
- Test user journey: edit asset → update links → verify changes propagate
- Test cross-browser compatibility for editor component
- Test mobile responsiveness of asset linking interface

### Performance Testing
- Test asset list rendering with 1000+ assets
- Test search performance with large datasets
- Test real-time update latency
- Test concurrent user operations
- Measure and optimize database query performance

## Implementation Notes

### Phase 1: Backend Enhancements
1. Update asset controller to handle linked_service_ids and linked_sub_service_ids
2. Implement automatic linking logic in createAssetLibraryItem
3. Add socket event emission for asset updates
4. Create database indexes for JSON array queries

### Phase 2: Frontend Core Features
1. Update AssetsView with enhanced upload form
2. Implement mapped_to field with validation
3. Update ServiceAssetLinker component for both Service and Sub-Service Master
4. Implement real-time metadata calculations

### Phase 3: UI/UX Improvements
1. Reorder service form tabs to show Asset Library Management first
2. Fix body content editor event isolation
3. Add loading states and error handling
4. Implement optimistic UI updates

### Phase 4: Testing and Refinement
1. Write property-based tests for all correctness properties
2. Write unit tests for core functions
3. Perform integration testing
4. Conduct user acceptance testing
5. Performance optimization based on profiling

### Technical Considerations
- Use React.memo for expensive components
- Implement debouncing for search input
- Use virtual scrolling for large asset lists
- Optimize socket event handling to prevent memory leaks
- Implement proper cleanup in useEffect hooks
