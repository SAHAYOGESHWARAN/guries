# Backend Development Guide

**Marketing Control Center - Backend Documentation**

---

## Table of Contents

1. [Project Setup](#project-setup)
2. [Directory Structure](#directory-structure)
3. [Server Architecture](#server-architecture)
4. [Controllers](#controllers)
5. [Routes](#routes)
6. [Middleware](#middleware)
7. [Database](#database)
8. [API Endpoints](#api-endpoints)
9. [Error Handling](#error-handling)
10. [Best Practices](#best-practices)

---

## Project Setup

### Installation

```bash
cd backend
npm install
```

### Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3001`

### Build for Production

```bash
npm run build
```

Output: `backend/dist/`

### Start Production Server

```bash
npm start
```

---

## Directory Structure

```
backend/
├── controllers/             # Business logic (34+ files)
│   ├── dashboardController.ts
│   ├── projectController.ts
│   ├── campaignController.ts
│   ├── contentController.ts
│   ├── userController.ts
│   ├── seoController.ts
│   ├── smmController.ts
│   ├── hrController.ts
│   ├── qcController.ts
│   └── masterControllers/
│
├── routes/                  # API route definitions
│   ├── dashboard.ts
│   ├── projects.ts
│   ├── campaigns.ts
│   ├── content.ts
│   ├── users.ts
│   ├── seo.ts
│   ├── smm.ts
│   ├── hr.ts
│   ├── qc.ts
│   └── masters.ts
│
├── middleware/              # Express middleware
│   ├── auth.ts              # Authentication
│   ├── authorization.ts     # Authorization
│   ├── errorHandler.ts      # Error handling
│   ├── validation.ts        # Request validation
│   └── logging.ts           # Request logging
│
├── config/                  # Configuration files
│   ├── database.ts          # Database config
│   ├── constants.ts         # Constants
│   └── env.ts               # Environment variables
│
├── migrations/              # Database migrations
│   ├── 001_create_users.ts
│   ├── 002_create_projects.ts
│   └── ...
│
├── server.ts                # Express server setup
├── socket.ts                # Socket.IO configuration
├── package.json
└── tsconfig.json
```

---

## Server Architecture

### Express Server Setup

```typescript
// server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: '*' }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, io };
```

### Socket.IO Configuration

```typescript
// socket.ts
import { Server as SocketIOServer } from 'socket.io';

export const setupSocket = (io: SocketIOServer) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Real-time updates
    socket.on('project:update', (data) => {
      io.emit('project:updated', data);
    });

    socket.on('content:update', (data) => {
      io.emit('content:updated', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
```

---

## Controllers

### Controller Pattern

```typescript
// controllers/projectController.ts
import { Request, Response } from 'express';
import { db } from '../config/database';

export const projectController = {
  // Get all projects
  async getAll(req: Request, res: Response) {
    try {
      const projects = await db.query('SELECT * FROM projects');
      res.json({
        success: true,
        data: projects,
        message: 'Projects retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve projects'
      });
    }
  },

  // Get project by ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const project = await db.query(
        'SELECT * FROM projects WHERE id = $1',
        [id]
      );
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      res.json({
        success: true,
        data: project,
        message: 'Project retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve project'
      });
    }
  },

  // Create project
  async create(req: Request, res: Response) {
    try {
      const { name, description, status } = req.body;
      
      const project = await db.query(
        'INSERT INTO projects (name, description, status) VALUES ($1, $2, $3) RETURNING *',
        [name, description, status]
      );

      res.status(201).json({
        success: true,
        data: project,
        message: 'Project created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create project'
      });
    }
  },

  // Update project
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, status } = req.body;

      const project = await db.query(
        'UPDATE projects SET name = $1, description = $2, status = $3 WHERE id = $4 RETURNING *',
        [name, description, status, id]
      );

      res.json({
        success: true,
        data: project,
        message: 'Project updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update project'
      });
    }
  },

  // Delete project
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await db.query('DELETE FROM projects WHERE id = $1', [id]);

      res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete project'
      });
    }
  }
};
```

---

## Routes

### Route Definition

```typescript
// routes/projects.ts
import { Router } from 'express';
import { projectController } from '../controllers/projectController';
import { authenticate, authorize } from '../middleware/auth';
import { validateProject } from '../middleware/validation';

const router = Router();

// Middleware
router.use(authenticate);

// Routes
router.get('/', projectController.getAll);
router.get('/:id', projectController.getById);
router.post('/', validateProject, projectController.create);
router.put('/:id', validateProject, projectController.update);
router.delete('/:id', authorize('admin'), projectController.delete);

export default router;
```

### Route Registration

```typescript
// server.ts
import projectRoutes from './routes/projects';
import campaignRoutes from './routes/campaigns';
import contentRoutes from './routes/content';
import userRoutes from './routes/users';

app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/users', userRoutes);
```

---

## Middleware

### Authentication Middleware

```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};
```

### Authorization Middleware

```typescript
// middleware/authorization.ts
import { Request, Response, NextFunction } from 'express';

export const authorize = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user || user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};
```

### Validation Middleware

```typescript
// middleware/validation.ts
import { Request, Response, NextFunction } from 'express';

export const validateProject = (req: Request, res: Response, next: NextFunction) => {
  const { name, description } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid project name'
    });
  }

  if (description && typeof description !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid project description'
    });
  }

  next();
};
```

### Error Handler Middleware

```typescript
// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error',
    timestamp: new Date()
  });
};
```

---

## Database

### Database Configuration

```typescript
// config/database.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export const db = {
  async query(text: string, params?: any[]) {
    const result = await pool.query(text, params);
    return result.rows;
  },

  async queryOne(text: string, params?: any[]) {
    const result = await pool.query(text, params);
    return result.rows[0];
  },

  async transaction(callback: (client: any) => Promise<any>) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};
```

### Database Migrations

```typescript
// migrations/001_create_users.ts
export const up = async (db: any) => {
  await db.query(`
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

export const down = async (db: any) => {
  await db.query('DROP TABLE IF EXISTS users');
};
```

---

## API Endpoints

### Dashboard Endpoints

```
GET /api/v1/dashboard/stats
GET /api/v1/dashboard/kpis
GET /api/v1/dashboard/recent-activity
```

### Project Endpoints

```
GET /api/v1/projects
POST /api/v1/projects
GET /api/v1/projects/:id
PUT /api/v1/projects/:id
DELETE /api/v1/projects/:id
```

### Campaign Endpoints

```
GET /api/v1/campaigns
POST /api/v1/campaigns
GET /api/v1/campaigns/:id
PUT /api/v1/campaigns/:id
DELETE /api/v1/campaigns/:id
```

### Content Endpoints

```
GET /api/v1/content
POST /api/v1/content
GET /api/v1/content/:id
PUT /api/v1/content/:id
DELETE /api/v1/content/:id
```

### User Endpoints

```
GET /api/v1/users
POST /api/v1/users
GET /api/v1/users/:id
PUT /api/v1/users/:id
DELETE /api/v1/users/:id
```

### Master Data Endpoints

```
GET /api/v1/masters/asset-types
GET /api/v1/masters/asset-categories
GET /api/v1/masters/platforms
GET /api/v1/masters/countries
GET /api/v1/masters/industry-sectors
GET /api/v1/masters/workflow-stages
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2026-01-17T10:30:00Z"
}
```

### HTTP Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Error Handling Pattern

```typescript
try {
  // Business logic
  const result = await db.query('SELECT * FROM projects');
  res.json({
    success: true,
    data: result,
    message: 'Success'
  });
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error',
    timestamp: new Date()
  });
}
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

interface CreateProjectRequest {
  name: string;
  description: string;
  status?: string;
}
```

### Async/Await

Use async/await for cleaner code:

```typescript
async function getProject(id: string): Promise<Project> {
  try {
    const project = await db.queryOne(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );
    return project;
  } catch (error) {
    throw new Error('Failed to get project');
  }
}
```

### Input Validation

Always validate input:

```typescript
if (!name || typeof name !== 'string' || name.trim().length === 0) {
  throw new Error('Invalid project name');
}

if (name.length > 255) {
  throw new Error('Project name too long');
}
```

### Logging

Use structured logging:

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

logger.info('Project created', { projectId: project.id });
logger.error('Failed to create project', { error: error.message });
```

### Security

- Use environment variables for secrets
- Validate and sanitize input
- Use HTTPS in production
- Implement rate limiting
- Use CORS properly
- Hash passwords
- Use JWT for authentication

```typescript
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, hashedPassword);
```

### Performance

- Use database indexes
- Implement caching
- Use connection pooling
- Optimize queries
- Use pagination for large datasets

```typescript
const limit = 20;
const offset = (page - 1) * limit;

const projects = await db.query(
  'SELECT * FROM projects LIMIT $1 OFFSET $2',
  [limit, offset]
);
```

---

## Testing

### Unit Tests

```typescript
import { projectController } from '../controllers/projectController';

describe('projectController', () => {
  it('should get all projects', async () => {
    const req = {} as any;
    const res = {
      json: jest.fn()
    } as any;

    await projectController.getAll(req, res);

    expect(res.json).toHaveBeenCalled();
  });
});
```

### Integration Tests

```typescript
import request from 'supertest';
import { app } from '../server';

describe('Projects API', () => {
  it('should get all projects', async () => {
    const response = await request(app)
      .get('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

---

## Deployment

### Environment Variables

```
DATABASE_URL=postgresql://user:password@host:5432/mcc_db
NODE_ENV=production
PORT=3001
JWT_SECRET=your-secret-key
```

### Build and Deploy

```bash
npm run build
npm start
```

### Docker Deployment

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

---

## Resources

- [Express Documentation](https://expressjs.com)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Socket.IO Documentation](https://socket.io/docs)
