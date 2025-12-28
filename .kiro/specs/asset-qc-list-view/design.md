# Design Document: Asset QC List View

## Overview

The Asset QC List View is a React component that provides a comprehensive table interface for managing assets in the Quality Control workflow. It displays all required metadata fields (thumbnail, name, type, category, content type, linked service, linked task, QC status, version, designer, upload date, usage count) along with role-based action buttons. The component integrates with existing data hooks, supports filtering by QC status, and provides seamless navigation to asset detail views.

This design builds upon the existing `AssetQCView.tsx` implementation, ensuring consistency with the current codebase patterns while addressing all specified field requirements.

## Architecture

```mermaid
graph TB
    subgraph "Asset QC List View"
        AQV[AssetQCView Component]
        FT[Filter Tabs]
        TBL[Asset Table]
        SP[Side Panel]
    end
    
    subgraph "Data Layer"
        UDA[useData Hook - Assets]
        UDU[useData Hook - Users]
        UDS[useData Hook - Services]
        UDT[useData Hook - Tasks]
        UDAC[useData Hook - Asset Categories]
        UDAT[useData Hook - Asset Types]
    end
    
    subgraph "Auth Layer"
        UA[useAuth Hook]
        RP[Role Permissions]
    end
    
    subgraph "Backend API"
        API[/api/v1/assetLibrary/qc/pending]
        QCAPI[/api/v1/assetLibrary/:id/qc-review]
        SUBAPI[/api/v1/assetLibrary/:id/submit-qc]
    end
    
    AQV --> FT
    AQV --> TBL
    AQV --> SP
    
    AQV --> UDA
    AQV --> UDU
    AQV --> UDS
    AQV --> UDT
    AQV --> UDAC
    AQV --> UDAT
    AQV --> UA
    
    UA --> RP
    
    UDA --> API
    TBL --> QCAPI
    TBL --> SUBAPI
```

## Components and Interfaces

### AssetQCView Component

The main component responsible for rendering the asset list view with all required columns and functionality.

```typescript
interface AssetQCViewProps {
  // No props required - component manages its own state
}

interface AssetQCViewState {
  assetsForQC: AssetLibraryItem[];
  selectedAsset: AssetLibraryItem | null;
  loading: boolean;
  viewMode: ViewMode;
  sidePanelAsset: AssetLibraryItem | null;
  showSidePanel: boolean;
}

type ViewMode = 'all' | 'pending' | 'rework' | 'approved' | 'rejected';
```

### Table Column Configuration

```typescript
interface TableColumn {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render: (asset: AssetLibraryItem) => React.ReactNode;
}

const columns: TableColumn[] = [
  { key: 'thumbnail', header: 'Thumbnail', width: '80px', align: 'center' },
  { key: 'name', header: 'Asset Name', width: '200px' },
  { key: 'type', header: 'Asset Type', width: '120px' },
  { key: 'category', header: 'Asset Category', width: '140px' },
  { key: 'contentType', header: 'Content Type', width: '130px' },
  { key: 'linkedService', header: 'Linked Service', width: '140px' },
  { key: 'linkedTask', header: 'Linked Task', width: '130px' },
  { key: 'qcStatus', header: 'QC Status', width: '100px' },
  { key: 'version', header: 'Version', width: '80px' },
  { key: 'designer', header: 'Designer', width: '120px' },
  { key: 'uploadedAt', header: 'Uploaded At', width: '110px' },
  { key: 'usageCount', header: 'Usage Count', width: '100px', align: 'center' },
  { key: 'actions', header: 'Review Action', width: '180px' }
];
```

### Helper Functions Interface

```typescript
interface HelperFunctions {
  getLinkedServiceName: (asset: AssetLibraryItem) => string;
  getLinkedTaskName: (asset: AssetLibraryItem) => string;
  getDesignerName: (asset: AssetLibraryItem) => string;
  getAssetTypeName: (asset: AssetLibraryItem) => string;
  getAssetCategoryName: (asset: AssetLibraryItem) => string;
  getQCStatusBadge: (asset: AssetLibraryItem) => React.ReactNode;
  formatUploadDate: (asset: AssetLibraryItem) => string;
}
```

### Filter Tab Configuration

```typescript
interface FilterTab {
  key: ViewMode;
  label: string;
  count: number;
  highlight?: boolean;
}

const filterTabs: FilterTab[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending QC' },
  { key: 'rework', label: 'Rework Required', highlight: true },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' }
];
```

## Data Models

### AssetLibraryItem (Existing Type)

The component uses the existing `AssetLibraryItem` interface from `types.ts`. Key fields for the list view:

```typescript
interface AssetLibraryItem {
  id: number;
  name: string;
  type: string;                    // Asset Type
  asset_category?: string;         // Asset Category
  content_type?: string;           // Content Type
  thumbnail_url?: string;          // Thumbnail URL
  
  // Linked entities
  linked_service_id?: number;
  linked_service_ids?: number[];
  linked_task_id?: number;
  linked_task?: number;
  
  // QC workflow fields
  status?: string;                 // Overall status
  qc_status?: 'Pass' | 'Fail' | 'Rework';
  version_number?: string;
  
  // User references
  designed_by?: number;
  submitted_by?: number;
  created_by?: number;
  
  // Timestamps
  submitted_at?: string;
  created_at?: string;
  
  // Usage tracking
  usage_count?: number;
}
```

### QC Status Badge Mapping

```typescript
const QC_STATUS_CONFIG = {
  'Pass': { bg: 'bg-green-100', text: 'text-green-800', label: 'Pass' },
  'QC Approved': { bg: 'bg-green-100', text: 'text-green-800', label: 'Pass' },
  'Fail': { bg: 'bg-red-100', text: 'text-red-800', label: 'Fail' },
  'QC Rejected': { bg: 'bg-red-100', text: 'text-red-800', label: 'Fail' },
  'Rework': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Rework', icon: true },
  'Rework Required': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Rework', icon: true },
  'Pending': { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pending' },
  'Pending QC Review': { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pending' }
};
```

### Role-Based Action Configuration

```typescript
interface ActionConfig {
  label: string;
  onClick: (asset: AssetLibraryItem) => void;
  className: string;
  condition: (asset: AssetLibraryItem, isAdmin: boolean) => boolean;
}

const actionConfigs: ActionConfig[] = [
  {
    label: 'View',
    condition: () => true,  // Always visible
    className: 'text-slate-600 border-slate-200'
  },
  {
    label: 'Review QC',
    condition: (asset, isAdmin) => isAdmin && 
      ['Pending QC Review', 'Rework Required'].includes(asset.status || ''),
    className: 'text-purple-600 border-purple-200'
  },
  {
    label: 'Edit',
    condition: (asset, isAdmin) => !isAdmin && 
      ['Rework Required', 'Rework'].includes(asset.status || asset.qc_status || ''),
    className: 'text-blue-600 border-blue-200'
  },
  {
    label: 'Resubmit',
    condition: (asset, isAdmin) => !isAdmin && 
      ['Rework Required', 'Rework'].includes(asset.status || asset.qc_status || ''),
    className: 'text-green-600 border-green-200'
  },
  {
    label: 'Delete',
    condition: (asset, isAdmin) => !isAdmin && 
      ['Rework Required', 'Rework'].includes(asset.status || asset.qc_status || ''),
    className: 'text-red-600 border-red-200'
  }
];
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the acceptance criteria analysis, the following correctness properties have been identified:

### Property 1: Thumbnail Rendering Consistency

*For any* asset in the list view, if the asset has a non-empty `thumbnail_url`, the rendered row SHALL contain an `<img>` element with that URL as the source; otherwise, the rendered row SHALL contain a placeholder SVG icon.

**Validates: Requirements 1.2, 1.3**

### Property 2: Entity Name Resolution

*For any* asset with a reference ID (linked_service_id, linked_task_id, designed_by, type, asset_category) that exists in the corresponding master data (services, tasks, users, assetTypes, assetCategories), the displayed name SHALL match the name from the master data; if the reference ID does not exist in master data or is null/undefined, the display SHALL show a dash (-).

**Validates: Requirements 3.2, 4.2, 6.2, 7.2, 10.2, 3.3, 4.3, 6.3, 7.3, 10.3**

### Property 3: QC Status Badge Mapping

*For any* asset with a QC status, the rendered badge SHALL have the correct color class and label text according to the status mapping:
- "Pass" or "QC Approved" → green badge with "Pass" label
- "Fail" or "QC Rejected" → red badge with "Fail" label  
- "Rework" or "Rework Required" → orange badge with "Rework" label
- "Pending" or "Pending QC Review" → amber badge with "Pending" label

**Validates: Requirements 8.2, 8.3, 8.4, 8.5**

### Property 4: Date Formatting and Fallback

*For any* asset, the displayed upload date SHALL:
1. Use `submitted_at` if available, formatted as MM/DD/YYYY
2. Fall back to `created_at` if `submitted_at` is not available, formatted as MM/DD/YYYY
3. Display a dash (-) if neither timestamp is available

**Validates: Requirements 11.2, 11.3, 11.4, 11.5**

### Property 5: Role-Based Action Visibility

*For any* asset and user combination:
- The "View" button SHALL always be visible
- *For any* admin user AND asset with status "Pending QC Review" or "Rework Required", the "Review QC" button SHALL be visible
- *For any* non-admin user AND asset with status "Rework Required" where the user is the owner, the "Edit", "Resubmit", and "Delete" buttons SHALL be visible

**Validates: Requirements 13.1, 13.2, 13.3**

### Property 6: Asset Filtering by Status and Role

*For any* filter selection and user:
- When filter is "pending", only assets with status "Pending QC Review" SHALL be displayed
- When filter is "rework", only assets with status "Rework Required" or qc_status "Rework" SHALL be displayed
- When filter is "approved", only assets with status "QC Approved" or qc_status "Pass" SHALL be displayed
- When filter is "rejected", only assets with status "QC Rejected" or qc_status "Fail" SHALL be displayed
- *For any* non-admin user, only assets where user.id matches submitted_by, created_by, or designed_by SHALL be displayed

**Validates: Requirements 14.2, 15.2**

### Property 7: Filter Count Accuracy

*For any* set of assets and filter configuration, the count displayed on each filter tab SHALL equal the actual number of assets that match that filter's criteria.

**Validates: Requirements 14.3**

## Error Handling

### Data Loading Errors

| Error Scenario | Handling Strategy |
|----------------|-------------------|
| API fetch fails | Display error message, show retry button, log error to console |
| Empty response | Display "No Assets Found" message with appropriate context |
| Timeout | Show loading spinner with timeout message after 10 seconds |

### Data Resolution Errors

| Error Scenario | Handling Strategy |
|----------------|-------------------|
| Invalid service ID | Display dash (-) as placeholder |
| Invalid task ID | Display dash (-) as placeholder |
| Invalid user ID | Display dash (-) as placeholder |
| Missing thumbnail URL | Display placeholder icon |
| Invalid date format | Display dash (-) as placeholder |

### Action Errors

| Error Scenario | Handling Strategy |
|----------------|-------------------|
| QC submission fails | Show error alert with message from API, keep form state |
| Resubmit fails | Show error alert, allow retry |
| Delete fails | Show error alert with reason |
| Permission denied | Show access denied message |

### State Management

```typescript
interface ErrorState {
  hasError: boolean;
  errorMessage: string;
  errorType: 'fetch' | 'submit' | 'permission' | 'unknown';
}

const handleError = (error: Error, type: ErrorState['errorType']) => {
  console.error(`${type} error:`, error);
  setErrorState({
    hasError: true,
    errorMessage: error.message || 'An unexpected error occurred',
    errorType: type
  });
};
```

## Testing Strategy

### Testing Framework

- **Unit Testing**: Vitest with React Testing Library
- **Property-Based Testing**: fast-check library for TypeScript
- **Component Testing**: React Testing Library for DOM assertions

### Unit Tests

Unit tests will cover specific examples and edge cases:

1. **Thumbnail rendering** - Test with and without thumbnail URL
2. **Name resolution** - Test with valid IDs, invalid IDs, and null values
3. **QC status badge** - Test each status value
4. **Date formatting** - Test with various date formats and missing dates
5. **Action button visibility** - Test admin vs non-admin scenarios
6. **Filter functionality** - Test each filter option

### Property-Based Tests

Property tests will validate universal properties across generated inputs:

1. **Property 1**: Generate random assets with/without thumbnail URLs, verify correct rendering
2. **Property 2**: Generate random assets with various reference IDs, verify name resolution
3. **Property 3**: Generate random QC statuses, verify badge mapping
4. **Property 4**: Generate random timestamps, verify date formatting and fallback
5. **Property 5**: Generate random user/asset combinations, verify action visibility
6. **Property 6**: Generate random asset lists and filters, verify filtering logic
7. **Property 7**: Generate random asset lists, verify count accuracy

### Test Configuration

```typescript
// Property test configuration
const propertyTestConfig = {
  numRuns: 100,  // Minimum 100 iterations per property
  seed: Date.now(),
  verbose: true
};

// Test tag format
// **Feature: asset-qc-list-view, Property {N}: {property_text}**
```

### Test File Structure

```
views/
  __tests__/
    AssetQCView.test.tsx           # Unit tests
    AssetQCView.property.test.tsx  # Property-based tests
```

### Generator Definitions

```typescript
// Asset generator for property tests
const assetGenerator = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  type: fc.option(fc.constantFrom('Banner', 'Video', 'Document', 'Image')),
  asset_category: fc.option(fc.string()),
  content_type: fc.option(fc.constantFrom('Blog', 'Service Page', 'SMM Post')),
  thumbnail_url: fc.option(fc.webUrl()),
  linked_service_id: fc.option(fc.integer({ min: 1, max: 100 })),
  linked_task_id: fc.option(fc.integer({ min: 1, max: 100 })),
  status: fc.constantFrom('Pending QC Review', 'QC Approved', 'QC Rejected', 'Rework Required'),
  qc_status: fc.option(fc.constantFrom('Pass', 'Fail', 'Rework')),
  version_number: fc.option(fc.stringMatching(/^v\d+\.\d+$/)),
  designed_by: fc.option(fc.integer({ min: 1, max: 50 })),
  submitted_by: fc.option(fc.integer({ min: 1, max: 50 })),
  created_by: fc.option(fc.integer({ min: 1, max: 50 })),
  submitted_at: fc.option(fc.date().map(d => d.toISOString())),
  created_at: fc.option(fc.date().map(d => d.toISOString())),
  usage_count: fc.option(fc.integer({ min: 0, max: 1000 }))
});

// User generator
const userGenerator = fc.record({
  id: fc.integer({ min: 1, max: 50 }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  role: fc.constantFrom('admin', 'user', 'designer')
});
```
