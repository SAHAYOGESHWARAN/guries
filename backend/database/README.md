# Database Setup Guide

## Overview

This directory contains the PostgreSQL database schema and initialization scripts for the Marketing Control Center application.

## Prerequisites

- PostgreSQL 12+ installed and running
- Node.js 16+ installed
- Environment variables configured in `backend/.env`

## Database Configuration

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE mcc_db;

# Create user (optional, for security)
CREATE USER mcc_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE mcc_db TO mcc_user;

# Exit psql
\q
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=mcc_db
NODE_ENV=development
```

## Database Initialization

### Option 1: Automatic Setup (Recommended)

```bash
# Install dependencies
cd backend
npm install

# Initialize schema
npm run db:init

# Seed initial data
npm run db:seed
```

### Option 2: Manual Setup

```bash
# Initialize schema only
npm run db:init

# Seed data separately
npm run db:seed

# Or reset everything (caution!)
npm run db:reset
```

## Database Schema

### Core Tables

- **users** - User accounts and authentication
- **brands** - Brand information
- **teams** - Team management
- **team_members** - Team membership

### Projects & Campaigns

- **projects** - Project management
- **campaigns** - Campaign tracking
- **tasks** - Task management

### Services

- **services** - Service definitions
- **sub_services** - Sub-service details
- **service_pages** - Service page content

### Assets

- **assets** - Asset library
- **asset_category_master** - Asset categories
- **asset_type_master** - Asset types
- **asset_format_master** - File formats
- **asset_usage** - Asset usage tracking
- **asset_linking** - Asset relationships
- **seo_assets** - SEO-specific assets
- **graphic_assets** - Graphic assets

### Quality Control

- **qc_checklists** - QC checklist templates
- **qc_checklist_versions** - QC versions
- **qc_runs** - QC execution records
- **qc_audit_log** - QC audit trail
- **qc_weightage_configs** - QC scoring weights

### SEO & Backlinks

- **backlink_sources** - Backlink sources
- **backlink_submissions** - Backlink submissions
- **toxic_backlinks** - Toxic backlink tracking
- **competitor_backlinks** - Competitor backlinks
- **seo_error_types** - SEO error types
- **on_page_seo_audits** - On-page SEO audits

### Keywords & Content

- **keywords** - Keyword database
- **keyword_linking** - Keyword relationships
- **content** - Content management
- **smm_posts** - Social media posts
- **emails** - Email management
- **knowledge_articles** - Knowledge base

### Analytics & Performance

- **performance_targets** - Performance metrics
- **effort_targets** - Effort tracking
- **employee_scorecards** - Employee performance
- **employee_skills** - Employee skills
- **employee_achievements** - Employee achievements

### System

- **system_settings** - Application settings
- **integrations** - Third-party integrations
- **integration_logs** - Integration logs
- **notifications** - User notifications
- **compliance_rules** - Compliance rules
- **compliance_audits** - Compliance audits

## Seeded Data

The database is automatically seeded with:

- 5 Workflow stages (Draft, In Review, Approved, Published, Archived)
- 7 Asset formats (PDF, DOCX, JPEG, PNG, MP4, CSV, XLSX)
- 8 SEO error types
- 15 Asset categories (across 5 brands)
- 16 Asset types (across 5 brands)
- Default system settings

## Backup & Restore

### Backup Database

```bash
# Full backup
pg_dump -U postgres -d mcc_db > backup.sql

# Compressed backup
pg_dump -U postgres -d mcc_db | gzip > backup.sql.gz
```

### Restore Database

```bash
# From SQL file
psql -U postgres -d mcc_db < backup.sql

# From compressed file
gunzip -c backup.sql.gz | psql -U postgres -d mcc_db
```

## Troubleshooting

### Connection Issues

```bash
# Test connection
psql -U postgres -h localhost -d mcc_db

# Check PostgreSQL status
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql
```

### Permission Errors

```bash
# Grant privileges
psql -U postgres -d mcc_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mcc_user;"
psql -U postgres -d mcc_db -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mcc_user;"
```

### Reset Database

```bash
# Drop and recreate
npm run db:reset

# Or manually
psql -U postgres -d mcc_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run db:init
npm run db:seed
```

## Performance Optimization

### Indexes

All critical columns are indexed for performance:
- User email and role
- Asset status and owner
- Task project and status
- Campaign status
- QC run status
- Backlink status
- Keyword text
- Notifications

### Connection Pooling

Connection pool is configured with:
- Min connections: 2
- Max connections: 20
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds

### Maintenance

```bash
# Analyze query performance
ANALYZE;

# Vacuum database
VACUUM ANALYZE;

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
WHERE schemaname != 'pg_catalog' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Production Deployment

### Pre-Deployment Checklist

- [ ] Database credentials secured in environment variables
- [ ] Connection pooling configured
- [ ] Backups automated
- [ ] Monitoring enabled
- [ ] SSL/TLS configured
- [ ] Firewall rules set
- [ ] Database user permissions restricted
- [ ] Indexes created
- [ ] Query performance tested

### Production Environment Variables

```env
NODE_ENV=production
DB_HOST=your-production-host
DB_PORT=5432
DB_USER=mcc_user
DB_PASSWORD=strong_secure_password
DB_NAME=mcc_db
DB_POOL_MAX=30
DB_IDLE_TIMEOUT_MS=60000
```

### Automated Backups

```bash
# Add to crontab for daily backups
0 2 * * * pg_dump -U mcc_user -d mcc_db | gzip > /backups/mcc_db_$(date +\%Y\%m\%d).sql.gz
```

## Support

For issues or questions:
1. Check PostgreSQL logs: `/var/log/postgresql/`
2. Review schema file: `backend/database/schema.sql`
3. Check initialization logs: `npm run db:init`
4. Verify environment variables: `backend/.env`

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js pg Library](https://node-postgres.com/)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/ddl.html)
