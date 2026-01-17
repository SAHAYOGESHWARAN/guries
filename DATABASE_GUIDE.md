# Database Documentation

**Marketing Control Center - Database Guide**

---

## Table of Contents

1. [Database Setup](#database-setup)
2. [Schema Overview](#schema-overview)
3. [Core Tables](#core-tables)
4. [Master Tables](#master-tables)
5. [Relationships](#relationships)
6. [Migrations](#migrations)
7. [Queries](#queries)
8. [Performance](#performance)
9. [Backup & Recovery](#backup--recovery)

---

## Database Setup

### PostgreSQL Setup

1. **Install PostgreSQL**
   ```bash
   # macOS
   brew install postgresql

   # Ubuntu
   sudo apt-get install postgresql

   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database**
   ```bash
   createdb mcc_db
   ```

3. **Create User**
   ```bash
   createuser mcc_user
   psql -U postgres -d mcc_db -c "ALTER USER mcc_user WITH PASSWORD 'password';"
   ```

4. **Grant Privileges**
   ```bash
   psql -U postgres -d mcc_db -c "GRANT ALL PRIVILEGES ON DATABASE mcc_db TO mcc_user;"
   ```

5. **Run Migrations**
   ```bash
   psql -U mcc_user -d mcc_db -f schema.sql
   ```

### SQLite Setup

SQLite is automatically created when the backend starts:

```bash
# Database file: backend/mcc_db.sqlite
```

### Connection String

**PostgreSQL:**
```
postgresql://user:password@localhost:5432/mcc_db
```

**SQLite:**
```
sqlite:///./mcc_db.sqlite
```

---

## Schema Overview

### Database Diagram

```
Users
├── Projects
│   ├── Campaigns
│   │   ├── Content
│   │   └── Tasks
│   └── Tasks
├── Employees
│   ├── Employee Scorecard
│   └── Workload Allocation
└── Roles & Permissions

Master Tables
├── Asset Types
├── Asset Categories
├── Asset Formats
├── Platforms
├── Countries
├── Industry Sectors
├── Workflow Stages
└── QC Weightage
```

---

## Core Tables

### users

Stores user account information.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  department VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### projects

Stores project information.

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  owner_id UUID NOT NULL REFERENCES users(id),
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
```

### campaigns

Stores campaign information.

```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  project_id UUID NOT NULL REFERENCES projects(id),
  status VARCHAR(50) DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12, 2),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaigns_project_id ON campaigns(project_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
```

### content

Stores content information.

```sql
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'draft',
  campaign_id UUID REFERENCES campaigns(id),
  created_by UUID NOT NULL REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_campaign_id ON content(campaign_id);
CREATE INDEX idx_content_status ON content(status);
```

### tasks

Stores task information.

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'medium',
  assigned_to UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  due_date DATE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
```

### employees

Stores employee information.

```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  employee_id VARCHAR(50) UNIQUE,
  designation VARCHAR(100),
  department VARCHAR(100),
  manager_id UUID REFERENCES employees(id),
  hire_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_department ON employees(department);
```

---

## Master Tables

### asset_types

```sql
CREATE TABLE asset_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### asset_categories

```sql
CREATE TABLE asset_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### asset_formats

```sql
CREATE TABLE asset_formats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### platforms

```sql
CREATE TABLE platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### countries

```sql
CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(2) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### industry_sectors

```sql
CREATE TABLE industry_sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### workflow_stages

```sql
CREATE TABLE workflow_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  order_index INTEGER,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### qc_weightage

```sql
CREATE TABLE qc_weightage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criteria VARCHAR(100) NOT NULL,
  weight DECIMAL(5, 2),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Relationships

### One-to-Many

**Users → Projects**
```sql
ALTER TABLE projects ADD CONSTRAINT fk_projects_owner
FOREIGN KEY (owner_id) REFERENCES users(id);
```

**Projects → Campaigns**
```sql
ALTER TABLE campaigns ADD CONSTRAINT fk_campaigns_project
FOREIGN KEY (project_id) REFERENCES projects(id);
```

**Campaigns → Content**
```sql
ALTER TABLE content ADD CONSTRAINT fk_content_campaign
FOREIGN KEY (campaign_id) REFERENCES campaigns(id);
```

### Many-to-Many

**Users ↔ Roles**
```sql
CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES users(id),
  role_id UUID NOT NULL REFERENCES roles(id),
  PRIMARY KEY (user_id, role_id)
);
```

**Projects ↔ Users (Team Members)**
```sql
CREATE TABLE project_members (
  project_id UUID NOT NULL REFERENCES projects(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(50),
  PRIMARY KEY (project_id, user_id)
);
```

---

## Migrations

### Running Migrations

```bash
# Run all pending migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback

# Rollback all migrations
npm run migrate:rollback:all
```

### Creating a Migration

```typescript
// migrations/001_create_users.ts
export const up = async (db: any) => {
  await db.query(`
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

export const down = async (db: any) => {
  await db.query('DROP TABLE IF EXISTS users');
};
```

### Migration Naming Convention

```
001_create_users.ts
002_create_projects.ts
003_add_status_to_projects.ts
004_create_campaigns.ts
```

---

## Queries

### Common Queries

**Get all projects with owner details**
```sql
SELECT 
  p.id,
  p.name,
  p.description,
  p.status,
  u.first_name,
  u.last_name,
  u.email
FROM projects p
JOIN users u ON p.owner_id = u.id
ORDER BY p.created_at DESC;
```

**Get campaigns by project**
```sql
SELECT 
  c.id,
  c.name,
  c.status,
  COUNT(co.id) as content_count
FROM campaigns c
LEFT JOIN content co ON c.id = co.campaign_id
WHERE c.project_id = $1
GROUP BY c.id
ORDER BY c.created_at DESC;
```

**Get user workload**
```sql
SELECT 
  u.id,
  u.first_name,
  u.last_name,
  COUNT(t.id) as task_count,
  COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending_tasks
FROM users u
LEFT JOIN tasks t ON u.id = t.assigned_to
GROUP BY u.id
ORDER BY task_count DESC;
```

**Get content by status**
```sql
SELECT 
  c.id,
  c.title,
  c.status,
  ca.name as campaign_name,
  u.first_name,
  u.last_name
FROM content c
JOIN campaigns ca ON c.campaign_id = ca.id
JOIN users u ON c.created_by = u.id
WHERE c.status = $1
ORDER BY c.created_at DESC;
```

**Get project statistics**
```sql
SELECT 
  p.id,
  p.name,
  COUNT(DISTINCT ca.id) as campaign_count,
  COUNT(DISTINCT t.id) as task_count,
  COUNT(DISTINCT co.id) as content_count
FROM projects p
LEFT JOIN campaigns ca ON p.id = ca.project_id
LEFT JOIN tasks t ON p.id = t.project_id
LEFT JOIN content co ON ca.id = co.campaign_id
WHERE p.id = $1
GROUP BY p.id;
```

---

## Performance

### Indexing Strategy

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Project lookups
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);

-- Campaign lookups
CREATE INDEX idx_campaigns_project_id ON campaigns(project_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- Content lookups
CREATE INDEX idx_content_campaign_id ON content(campaign_id);
CREATE INDEX idx_content_status ON content(status);

-- Task lookups
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);

-- Composite indexes for common queries
CREATE INDEX idx_campaigns_project_status ON campaigns(project_id, status);
CREATE INDEX idx_content_campaign_status ON content(campaign_id, status);
```

### Query Optimization

**Use EXPLAIN to analyze queries:**
```sql
EXPLAIN ANALYZE
SELECT * FROM projects WHERE status = 'active';
```

**Pagination for large datasets:**
```sql
SELECT * FROM projects
LIMIT 20 OFFSET 0;
```

**Use aggregation efficiently:**
```sql
SELECT status, COUNT(*) as count
FROM projects
GROUP BY status;
```

---

## Backup & Recovery

### PostgreSQL Backup

**Full backup:**
```bash
pg_dump mcc_db > backup.sql
```

**Compressed backup:**
```bash
pg_dump -Fc mcc_db > backup.dump
```

**Backup specific table:**
```bash
pg_dump -t projects mcc_db > projects_backup.sql
```

### PostgreSQL Restore

**Restore from SQL file:**
```bash
psql mcc_db < backup.sql
```

**Restore from compressed backup:**
```bash
pg_restore -d mcc_db backup.dump
```

### Automated Backups

**Daily backup script:**
```bash
#!/bin/bash
BACKUP_DIR="/backups/mcc"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump mcc_db | gzip > $BACKUP_DIR/mcc_db_$DATE.sql.gz
```

**Add to crontab:**
```bash
0 2 * * * /path/to/backup.sh
```

### Backup Retention

Keep backups for:
- Daily: 7 days
- Weekly: 4 weeks
- Monthly: 12 months

---

## Maintenance

### Vacuum and Analyze

```sql
-- Clean up dead rows
VACUUM ANALYZE;

-- Specific table
VACUUM ANALYZE projects;
```

### Monitor Database Size

```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check Connection Count

```sql
SELECT count(*) FROM pg_stat_activity;
```

---

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Database Design Best Practices](https://en.wikipedia.org/wiki/Database_design)
