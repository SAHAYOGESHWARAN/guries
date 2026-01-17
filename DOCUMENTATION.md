# Marketing Control Center - Complete Documentation

**Version**: 2.5.0  
**Developed by**: sahayogeshwaran  
**Last Updated**: January 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Project Structure](#project-structure)
4. [Frontend Documentation](#frontend-documentation)
5. [Backend Documentation](#backend-documentation)
6. [Database Schema](#database-schema)
7. [API Reference](#api-reference)
8. [Development Guide](#development-guide)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Marketing Control Center is an enterprise-level marketing management platform designed to streamline marketing operations, content management, campaign tracking, and team collaboration.

### Key Features

- **Dashboard & Analytics** - Real-time statistics and KPIs
- **Project Management** - Complete project lifecycle management
- **Campaign Tracking** - Campaign planning and execution
- **Content Management** - Content repository with pipeline stages
- **SEO & Backlinks** - Keyword and backlink management
- **Social Media** - SMM post creation and scheduling
- **Quality Control** - QC runs and compliance auditing
- **HR Management** - Employee performance and workload tracking
- **Configuration** - Comprehensive master tables
- **Communication Hub** - Email, voice, and knowledge base
- **Integrations** - Third-party API integrations
- **Real-time Updates** - Socket.IO powered live synchronization

### Technology Stack

**Frontend:**
- React 18.2.0
- TypeScript 5.0.2
- Vite 4.4.5
- Tailwind CSS 3.3.3
- Socket.IO Client

**Backend:**
- Node.js 20.x
- Express 4.18.2
- TypeScript 5.1.6
- PostgreSQL 14+ / SQLite
- Socket.IO 4.7.2

---

## Getting Started

### Prerequisites

- Node.js 18+ (20.x recommended)
- PostgreSQL 14+ or SQLite
- npm or yarn
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd guires-marketing-control-center
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   npm run setup
   ```
   
   This creates `.env` files in both frontend and backend directories.

4. **Configure database**
   
   For PostgreSQL:
   ```bash
   createdb mcc_db
   psql -U postgres -d mcc_db -f backend/db/schema.sql
   ```
   
   For SQLite (automatic):
   The backend will create `mcc_db.sqlite` automatically.

5. **Start development servers**
   ```bash
   npm run dev
   ```
   
   This starts both frontend and backend concurrently:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

### Environment Variables

**Backend (.env)**
```
DATABASE_URL=postgresql://user:password@localhost:5432/mcc_db
NODE_ENV=development
PORT=3001
JWT_SECRET=your-secret-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:3001/api/v1
VITE_GOOGLE_GEMINI_KEY=your-google-gemini-key
```

---

## Project Structure

```
guires-marketing-control-center/
├── frontend/                    # React frontend application
│   ├── components/              # Reusable UI components
│   ├── views/                   # 60+ page components
│   ├── hooks/                   # Custom React hooks
│   ├── utils/                   # Utility functions
│   ├── styles/                  # CSS styles
│   ├── data/                    # Mock data
│   ├── App.tsx                  # Main app component
│   ├── index.tsx                # Entry point
│   ├── vite.config.ts           # Vite configuration
│   └── package.json
│
├── backend/                     # Express backend API
│   ├── controllers/             # 34+ controller files
│   ├── routes/                  # API route definitions
│   ├── middleware/              # Express middleware
│   ├── config/                  # Configuration files
│   ├── migrations/              # Database migrations
│   ├── server.ts                # Server entry point
│   ├── socket.ts                # Socket.IO configuration
│   └── package.json
│
├── api/                         # Vercel serverless functions
├── package.json                 # Root package.json (workspace)
├── vercel.json                  # Vercel deployment config
└── DOCUMENTATION.md             # This file
```

---

## Frontend Documentation

### Directory Structure

```
frontend/
├── components/          # Reusable UI components
├── views/              # Page components (60+)
├── hooks/              # Custom React hooks
├── utils/              # Helper functions
├── styles/             # CSS and Tailwind styles
├── data/               # Mock data and constants
├── App.tsx             # Main application component
├── index.tsx           # React entry point
└── types.ts            # TypeScript type definitions
```

### Key Pages (60+)

**Dashboard & Analytics**
- Dashboard
- Analytics Dashboard
- Team Leader Dashboard
- Performance Metrics

**Project Management**
- Projects List
- Project Details
- Project Creation
- Project Timeline

**Campaign Management**
- Campaigns List
- Campaign Details
- Campaign Creation
- Campaign Tracking

**Content Management**
- Content Repository
- Content Pipeline
- Content Creation
- Content Approval

**SEO & Backlinks**
- Keyword Management
- Backlinks Analysis
- On-Page Errors
- SEO Reports

**Social Media**
- SMM Posting
- Social Calendar
- Post Scheduling
- Performance Tracking

**HR Management**
- Employee Directory
- Employee Scorecard
- Workload Allocation
- Performance Reviews

**Master Tables**
- Asset Types
- Asset Categories
- Asset Formats
- Platforms
- Countries
- Industry Sectors
- Workflow Stages
- QC Weightage

**Configuration**
- User Management
- Role & Permissions
- System Settings
- Integration Settings

### Component Architecture

Components follow a modular structure:
- Presentational components for UI
- Container components for logic
- Custom hooks for state management
- Utility functions for common operations

### Styling

- Tailwind CSS for utility-first styling
- Custom CSS for specific components
- Responsive design for all screen sizes
- Dark mode support

---

## Backend Documentation

### Directory Structure

```
backend/
├── controllers/         # Business logic (34+ files)
├── routes/             # API route definitions
├── middleware/         # Express middleware
├── config/             # Configuration files
├── migrations/         # Database migrations
├── server.ts           # Express server setup
├── socket.ts           # Socket.IO configuration
└── package.json
```

### Controllers (34+)

**Core Controllers**
- Dashboard Controller
- Project Controller
- Campaign Controller
- Task Controller
- Content Controller
- User Controller

**Feature Controllers**
- SEO Controller
- Backlinks Controller
- SMM Controller
- Analytics Controller
- HR Controller
- QC Controller

**Master Data Controllers**
- Asset Type Master
- Asset Category Master
- Platform Master
- Country Master
- Industry Sector Master
- Workflow Stage Master

### API Routes

All routes are prefixed with `/api/v1`

**Dashboard Routes**
- `GET /dashboard/stats` - Dashboard statistics
- `GET /dashboard/kpis` - Key performance indicators

**Project Routes**
- `GET /projects` - List all projects
- `POST /projects` - Create new project
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

**Campaign Routes**
- `GET /campaigns` - List campaigns
- `POST /campaigns` - Create campaign
- `GET /campaigns/:id` - Get campaign details
- `PUT /campaigns/:id` - Update campaign
- `DELETE /campaigns/:id` - Delete campaign

**Content Routes**
- `GET /content` - List content
- `POST /content` - Create content
- `GET /content/:id` - Get content details
- `PUT /content/:id` - Update content
- `DELETE /content/:id` - Delete content

**User Routes**
- `GET /users` - List users
- `POST /users` - Create user
- `GET /users/:id` - Get user details
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

**Master Data Routes**
- `GET /masters/asset-types` - Asset types
- `GET /masters/asset-categories` - Asset categories
- `GET /masters/platforms` - Platforms
- `GET /masters/countries` - Countries
- `GET /masters/industry-sectors` - Industry sectors
- `GET /masters/workflow-stages` - Workflow stages

### Middleware

- Authentication middleware
- Authorization middleware
- Error handling middleware
- Request logging middleware
- CORS middleware
- Rate limiting middleware

### Database Migrations

Migrations are organized by feature:
- Asset management migrations
- Content management migrations
- User management migrations
- Analytics migrations
- QC workflow migrations
- HR management migrations

---

## Database Schema

### Core Tables

**users**
- id (UUID)
- email (VARCHAR)
- password (VARCHAR)
- first_name (VARCHAR)
- last_name (VARCHAR)
- role (VARCHAR)
- department (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**projects**
- id (UUID)
- name (VARCHAR)
- description (TEXT)
- status (VARCHAR)
- start_date (DATE)
- end_date (DATE)
- owner_id (UUID)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**campaigns**
- id (UUID)
- name (VARCHAR)
- description (TEXT)
- project_id (UUID)
- status (VARCHAR)
- start_date (DATE)
- end_date (DATE)
- budget (DECIMAL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**content**
- id (UUID)
- title (VARCHAR)
- description (TEXT)
- type (VARCHAR)
- status (VARCHAR)
- campaign_id (UUID)
- created_by (UUID)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**tasks**
- id (UUID)
- title (VARCHAR)
- description (TEXT)
- status (VARCHAR)
- priority (VARCHAR)
- assigned_to (UUID)
- project_id (UUID)
- due_date (DATE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Master Tables

**asset_types**
- id (UUID)
- name (VARCHAR)
- description (TEXT)
- created_at (TIMESTAMP)

**asset_categories**
- id (UUID)
- name (VARCHAR)
- description (TEXT)
- created_at (TIMESTAMP)

**platforms**
- id (UUID)
- name (VARCHAR)
- type (VARCHAR)
- created_at (TIMESTAMP)

**countries**
- id (UUID)
- name (VARCHAR)
- code (VARCHAR)
- created_at (TIMESTAMP)

**industry_sectors**
- id (UUID)
- name (VARCHAR)
- description (TEXT)
- created_at (TIMESTAMP)

**workflow_stages**
- id (UUID)
- name (VARCHAR)
- order (INTEGER)
- created_at (TIMESTAMP)

---

## API Reference

### Authentication

All API requests require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2026-01-17T10:30:00Z"
}
```

### Error Handling

Error responses include appropriate HTTP status codes:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2026-01-17T10:30:00Z"
}
```

### Common Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Development Guide

### Running Development Servers

**Both frontend and backend:**
```bash
npm run dev
```

**Frontend only:**
```bash
npm run dev:frontend
```

**Backend only:**
```bash
npm run dev:backend
```

### Building for Production

**Frontend:**
```bash
npm run build:frontend
```

**Backend:**
```bash
npm run build:backend
```

**Both:**
```bash
npm run build
```

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Consistent naming conventions
- Component-based architecture

### Adding New Features

1. Create feature branch: `git checkout -b feature/feature-name`
2. Implement feature with tests
3. Ensure code follows project standards
4. Create pull request with description
5. Merge after review

---

## Deployment

### Vercel Deployment

The project is configured for Vercel deployment:

```bash
npm run vercel-build
```

Configuration is in `vercel.json`:
- Frontend builds to `/frontend/dist`
- API functions in `/api` directory
- Environment variables configured in Vercel dashboard

### Environment Setup for Production

1. Set production environment variables in Vercel dashboard
2. Configure database connection for production
3. Set up SSL certificates
4. Configure CDN for static assets
5. Set up monitoring and logging

### Database Backup

Regular backups are recommended:

```bash
# PostgreSQL backup
pg_dump mcc_db > backup.sql

# Restore
psql mcc_db < backup.sql
```

---

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Database Connection Error**
- Verify DATABASE_URL in .env
- Check PostgreSQL is running
- Verify database exists

**Module Not Found**
```bash
# Reinstall dependencies
npm run install:all
```

**Build Errors**
```bash
# Clear build cache
rm -rf frontend/dist backend/dist
npm run build
```

### Getting Help

1. Check the documentation files
2. Review error logs in console
3. Check database migrations
4. Verify environment variables
5. Contact development team

---

## Support & Maintenance

For issues or questions:
1. Check this documentation
2. Review code comments
3. Check git history for context
4. Contact the development team

**Developed by**: sahayogeshwaran  
**License**: Private - All rights reserved
