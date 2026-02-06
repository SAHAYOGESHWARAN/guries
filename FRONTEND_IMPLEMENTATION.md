# Frontend Implementation Guide

## Overview
The frontend is built with React + Vite and uses the `useData` hook for API integration.

## Project Structure

```
frontend/
├── components/
│   ├── AssetForm.tsx          # Asset creation form
│   ├── AssetList.tsx          # Asset list display
│   └── AssetDetail.tsx        # Asset detail view
├── hooks/
│   └── useData.ts             # API data management hook
├── utils/
│   └── storage.ts             # Local storage utilities
├── App.tsx                    # Main app component
└── main.tsx                   # Entry point
```

## Core Hook: useData

### Location
`frontend/hooks/useData.ts`

### Features
- Automatic data fetching from API
- Optimistic UI updates
- Offline support with localStorage
- Real-time updates via Socket.io
- Error handling and retry logic

### Usage

```typescript
import { useData } from '../hooks/useData';

function MyComponent() {
  const { 
    data,           // Array of items
    loading,        // Loading state
    error,          // Error message
    isOffline,      // Offline status
    create,         // Create function
    update,         // Update function
    remove,         // Delete function
    refresh         // Refresh data
  } = useData('assetLibrary');

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {isOffline && <p>Offline mode</p>}
      
      {data.map(item => (
        <div key={item.id}>
          <h3>{item.asset_name}</h3>
          <button onClick={() => update(item.id, { status: 'published' })}>
            Publish
          </button>
          <button onClick={() => remove(item.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

## Example Components

### 1. Asset Form Component

```typescript
// frontend/components/AssetForm.tsx
import { useState } from 'react';
import { useData } from '../hooks/useData';

export function AssetForm() {
  const { create, loading } = useData('assetLibrary');
  const [formData, setFormData] = useState({
    asset_name: '',
    asset_type: 'article',
    asset_category: 'content',
    status: 'draft'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create(formData);
      setFormData({
        asset_name: '',
        asset_type: 'article',
        asset_category: 'content',
        status: 'draft'
      });
      alert('Asset created successfully!');
    } catch (error) {
      alert('Failed to create asset');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Asset Name *</label>
        <input
          type="text"
          value={formData.asset_name}
          onChange={(e) => setFormData({
            ...formData,
            asset_name: e.target.value
          })}
          required
        />
      </div>

      <div>
        <label>Asset Type</label>
        <select
          value={formData.asset_type}
          onChange={(e) => setFormData({
            ...formData,
            asset_type: e.target.value
          })}
        >
          <option value="article">Article</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="document">Document</option>
        </select>
      </div>

      <div>
        <label>Category</label>
        <input
          type="text"
          value={formData.asset_category}
          onChange={(e) => setFormData({
            ...formData,
            asset_category: e.target.value
          })}
        />
      </div>

      <div>
        <label>Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({
            ...formData,
            status: e.target.value
          })}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Asset'}
      </button>
    </form>
  );
}
```

### 2. Asset List Component

```typescript
// frontend/components/AssetList.tsx
import { useData } from '../hooks/useData';

export function AssetList() {
  const { data, loading, error, remove, refresh } = useData('assetLibrary');

  if (loading) return <p>Loading assets...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <button onClick={refresh}>Refresh</button>
      
      {data.length === 0 ? (
        <p>No assets found</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(asset => (
              <tr key={asset.id}>
                <td>{asset.id}</td>
                <td>{asset.asset_name}</td>
                <td>{asset.asset_type}</td>
                <td>{asset.status}</td>
                <td>{new Date(asset.created_at).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => remove(asset.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

### 3. Combined App Component

```typescript
// frontend/App.tsx
import { AssetForm } from './components/AssetForm';
import { AssetList } from './components/AssetList';
import './App.css';

function App() {
  return (
    <div className="app">
      <header>
        <h1>Guries Marketing Control Center</h1>
      </header>

      <main>
        <section className="form-section">
          <h2>Create New Asset</h2>
          <AssetForm />
        </section>

        <section className="list-section">
          <h2>Assets</h2>
          <AssetList />
        </section>
      </main>
    </div>
  );
}

export default App;
```

## Styling

### Basic CSS

```css
/* frontend/App.css */
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

header {
  border-bottom: 2px solid #333;
  padding-bottom: 20px;
  margin-bottom: 30px;
}

h1 {
  margin: 0;
  color: #333;
}

section {
  margin-bottom: 40px;
}

h2 {
  color: #555;
  border-left: 4px solid #007bff;
  padding-left: 10px;
}

form {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
}

form div {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

input,
select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

button {
  background: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

button:hover {
  background: #0056b3;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

th,
td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background: #f5f5f5;
  font-weight: 600;
  color: #333;
}

tr:hover {
  background: #f9f9f9;
}
```

## Environment Variables

### Development
Create `frontend/.env.development`:
```
VITE_API_URL=http://localhost:3001/api/v1
VITE_SOCKET_URL=http://localhost:3001
```

### Production
Create `frontend/.env.production`:
```
VITE_API_URL=/api/v1
VITE_SOCKET_URL=https://guries.vercel.app
```

## Build & Deploy

### Development
```bash
cd frontend
npm run dev
```

### Production Build
```bash
cd frontend
npm run build
```

### Preview Production Build
```bash
cd frontend
npm run preview
```

## Performance Tips

1. **Lazy Load Components**
   ```typescript
   import { lazy, Suspense } from 'react';
   
   const AssetList = lazy(() => import('./components/AssetList'));
   
   <Suspense fallback={<p>Loading...</p>}>
     <AssetList />
   </Suspense>
   ```

2. **Memoize Components**
   ```typescript
   import { memo } from 'react';
   
   export const AssetItem = memo(({ asset, onDelete }) => (
     <div>{asset.asset_name}</div>
   ));
   ```

3. **Use useCallback for Event Handlers**
   ```typescript
   const handleDelete = useCallback((id) => {
     remove(id);
   }, [remove]);
   ```

## Testing

### Unit Tests
```typescript
import { render, screen } from '@testing-library/react';
import { AssetForm } from './AssetForm';

test('renders asset form', () => {
  render(<AssetForm />);
  expect(screen.getByText('Create Asset')).toBeInTheDocument();
});
```

## Troubleshooting

### API Not Responding
- Check browser console for errors
- Verify `VITE_API_URL` environment variable
- Check Vercel function logs

### Data Not Persisting
- Verify database connection
- Check browser localStorage
- Review API response format

### Offline Mode
- App automatically switches to offline mode
- Data stored in localStorage
- Syncs when connection restored
