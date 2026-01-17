# Frontend Development Guide

**Marketing Control Center - Frontend Documentation**

---

## Table of Contents

1. [Project Setup](#project-setup)
2. [Directory Structure](#directory-structure)
3. [Component Architecture](#component-architecture)
4. [Styling Guide](#styling-guide)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Routing](#routing)
8. [Best Practices](#best-practices)
9. [Common Tasks](#common-tasks)

---

## Project Setup

### Installation

```bash
cd frontend
npm install
```

### Development Server

```bash
npm run dev
```

Server runs on `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output: `frontend/dist/`

### Preview Production Build

```bash
npm run preview
```

---

## Directory Structure

```
frontend/
├── components/              # Reusable UI components
│   ├── common/             # Common components (Header, Footer, etc.)
│   ├── forms/              # Form components
│   ├── tables/             # Table components
│   ├── modals/             # Modal components
│   └── layout/             # Layout components
│
├── views/                  # Page components (60+)
│   ├── dashboard/          # Dashboard pages
│   ├── projects/           # Project pages
│   ├── campaigns/          # Campaign pages
│   ├── content/            # Content pages
│   ├── seo/                # SEO pages
│   ├── smm/                # Social media pages
│   ├── hr/                 # HR pages
│   ├── masters/            # Master data pages
│   └── settings/           # Settings pages
│
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts          # Authentication hook
│   ├── useApi.ts           # API calls hook
│   ├── useForm.ts          # Form handling hook
│   └── useSocket.ts        # WebSocket hook
│
├── utils/                  # Utility functions
│   ├── api.ts              # API client
│   ├── formatters.ts       # Data formatters
│   ├── validators.ts       # Form validators
│   └── helpers.ts          # Helper functions
│
├── styles/                 # CSS files
│   ├── globals.css         # Global styles
│   ├── components.css      # Component styles
│   └── utilities.css       # Utility styles
│
├── data/                   # Mock data and constants
│   ├── mockData.ts         # Mock data
│   └── constants.ts        # Constants
│
├── App.tsx                 # Main app component
├── index.tsx               # React entry point
├── types.ts                # TypeScript types
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
└── tsconfig.json           # TypeScript configuration
```

---

## Component Architecture

### Component Types

**Presentational Components**
- Pure UI components
- No business logic
- Receive data via props
- Example: Button, Card, Badge

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  disabled = false
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
};
```

**Container Components**
- Handle business logic
- Manage state
- Fetch data
- Pass data to presentational components

```typescript
export const ProjectsContainer: React.FC = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await api.get('/projects');
      setProjects(data);
    } finally {
      setLoading(false);
    }
  };

  return <ProjectsList projects={projects} loading={loading} />;
};
```

### Component Naming

- Use PascalCase for component files
- Use descriptive names
- Suffix with component type if needed

```
Button.tsx
ProjectCard.tsx
UserForm.tsx
DashboardLayout.tsx
```

---

## Styling Guide

### Tailwind CSS

Primary styling approach using utility classes:

```typescript
export const Card: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
      <div className="text-gray-600">{children}</div>
    </div>
  );
};
```

### Custom CSS

For complex styles, use custom CSS files:

```css
/* components.css */
.project-card {
  @apply bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow;
}

.project-card:hover {
  transform: translateY(-2px);
}
```

### Responsive Design

Use Tailwind breakpoints:

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

### Dark Mode

Tailwind dark mode support:

```typescript
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  {/* Content */}
</div>
```

---

## State Management

### Local State

Use `useState` for component-level state:

```typescript
const [count, setCount] = useState(0);
const [isOpen, setIsOpen] = useState(false);
```

### Effect Hooks

Use `useEffect` for side effects:

```typescript
useEffect(() => {
  fetchData();
}, [dependency]);
```

### Custom Hooks

Create reusable logic:

```typescript
// hooks/useApi.ts
export const useApi = (url: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(url);
        setData(await response.json());
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};
```

---

## API Integration

### API Client

```typescript
// utils/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL;

export const api = {
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    return response.json();
  },

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async put(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async delete(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    return response.json();
  }
};
```

### Using API in Components

```typescript
const [projects, setProjects] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await api.get('/projects');
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchProjects();
}, []);
```

---

## Routing

### Route Structure

```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/content" element={<Content />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
};
```

### Navigation

```typescript
import { useNavigate } from 'react-router-dom';

export const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  return (
    <div onClick={() => navigate(`/projects/${project.id}`)}>
      {project.name}
    </div>
  );
};
```

---

## Best Practices

### TypeScript

Always use TypeScript for type safety:

```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: Date;
}

interface ProjectsProps {
  projects: Project[];
  onSelect: (project: Project) => void;
}

export const ProjectsList: React.FC<ProjectsProps> = ({
  projects,
  onSelect
}) => {
  return (
    <div>
      {projects.map(project => (
        <div key={project.id} onClick={() => onSelect(project)}>
          {project.name}
        </div>
      ))}
    </div>
  );
};
```

### Error Handling

```typescript
try {
  const data = await api.get('/projects');
  setProjects(data);
} catch (error) {
  if (error instanceof Error) {
    setError(error.message);
  } else {
    setError('An unexpected error occurred');
  }
}
```

### Performance

- Use `React.memo` for expensive components
- Use `useCallback` for event handlers
- Use `useMemo` for expensive computations
- Lazy load routes with `React.lazy`

```typescript
const ProjectDetail = React.lazy(() => import('./views/ProjectDetail'));

<Suspense fallback={<Loading />}>
  <ProjectDetail />
</Suspense>
```

### Accessibility

- Use semantic HTML
- Add ARIA labels
- Ensure keyboard navigation
- Test with screen readers

```typescript
<button
  aria-label="Close modal"
  onClick={onClose}
>
  ✕
</button>
```

---

## Common Tasks

### Adding a New Page

1. Create component in `views/` directory
2. Add route in `App.tsx`
3. Add navigation link
4. Implement page logic

```typescript
// views/NewPage.tsx
export const NewPage: React.FC = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const result = await api.get('/endpoint');
    setData(result);
  };

  return (
    <div>
      {/* Page content */}
    </div>
  );
};
```

### Adding a New Component

1. Create component file in `components/` directory
2. Define TypeScript interface for props
3. Implement component
4. Export component

```typescript
// components/NewComponent.tsx
interface NewComponentProps {
  title: string;
  onAction: () => void;
}

export const NewComponent: React.FC<NewComponentProps> = ({
  title,
  onAction
}) => {
  return (
    <div>
      <h3>{title}</h3>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

### Handling Forms

```typescript
const [formData, setFormData] = useState({
  name: '',
  email: '',
  message: ''
});

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await api.post('/submit', formData);
    // Success handling
  } catch (error) {
    // Error handling
  }
};

return (
  <form onSubmit={handleSubmit}>
    <input
      name="name"
      value={formData.name}
      onChange={handleChange}
    />
    <button type="submit">Submit</button>
  </form>
);
```

---

## Debugging

### Browser DevTools

- React DevTools extension
- Network tab for API calls
- Console for errors
- Performance tab for optimization

### Logging

```typescript
console.log('Debug info:', data);
console.error('Error:', error);
console.warn('Warning:', warning);
```

### Environment Variables

Access via `import.meta.env`:

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
const isDev = import.meta.env.DEV;
```

---

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)
