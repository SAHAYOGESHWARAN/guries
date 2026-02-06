# Database Schema Documentation Index

## 📚 Complete Documentation Set

### 1. **COMPLETE_SCHEMA_UPDATE_SUMMARY.md**
**Purpose**: Comprehensive overview of all schema changes
**Audience**: Developers, DBAs, Technical Leads
**Contains**:
- All 35 new tables with descriptions
- All 100+ new columns added
- All 30+ new indexes
- All 20+ foreign key relationships
- Statistics and metrics
- Deployment checklist
- Usage examples

**When to Use**: For complete understanding of schema changes

---

### 2. **SCHEMA_QUICK_REFERENCE.md**
**Purpose**: Quick lookup guide for all tables and fields
**Audience**: Developers, API Consumers
**Contains**:
- All 50+ tables organized by category
- Field listings for each table
- Quick query examples
- Foreign key relationships
- Index information

**When to Use**: For quick field lookups and query examples

---

### 3. **backend/database/schema.sql**
**Purpose**: The actual database schema definition
**Audience**: Database, Backend Developers
**Contains**:
- Complete SQL table definitions
- All columns with data types
- All constraints and relationships
- All indexes
- Foreign key definitions

**When to Use**: For actual database creation and deployment

---

### 4. **backend/migrations/ensure-complete-schema.js**
**Purpose**: Migration script to verify/create schema
**Audience**: DevOps, Backend Developers
**Contains**:
- Schema verification logic
- Table creation statements
- Migration execution

**When to Use**: For running migrations on existing databases

---

## 📊 Schema Organization

### By Category

#### Core Tables (6)
- users
- roles
- brands
- services
- sub_services
- assets

#### Linking Tables (3)
- service_asset_links
- subservice_asset_links
- keyword_asset_links

#### QC & Audit (6)
- asset_qc_reviews
- qc_audit_log
- qc_runs
- qc_checklists
- qc_checklist_versions
- qc_weightage_configs

#### SEO & Content (3)
- on_page_seo_audits
- seo_asset_domains
- service_pages

#### Backlinks (4)
- backlink_sources
- backlink_submissions
- toxic_backlinks
- competitor_backlinks

#### Issue Tracking (2)
- ux_issues
- url_errors

#### Social Media (2)
- smm_posts
- graphic_assets

#### Project Management (3)
- projects
- campaigns
- tasks

#### Analytics (4)
- okrs
- competitor_benchmarks
- gold_standards
- effort_targets

#### Team & Employee (6)
- teams
- team_members
- employee_evaluations
- employee_skills
- employee_achievements
- reward_recommendations

#### Communication (2)
- voice_profiles
- call_logs

#### Knowledge & Compliance (3)
- knowledge_articles
- compliance_rules
- compliance_audits

#### Configuration (5)
- personas
- forms
- integrations
- integration_logs
- system_settings

#### Master Tables (7)
- asset_category_master
- asset_type_master
- asset_formats
- workflow_stages
- platforms
- countries
- seo_error_types

#### Other (2)
- keywords
- notifications

---

## 🔍 Finding Information

### I need to...

#### Understand the complete schema
→ Read: **COMPLETE_SCHEMA_UPDATE_SUMMARY.md**

#### Find a specific table's fields
→ Read: **SCHEMA_QUICK_REFERENCE.md**

#### Write a query
→ Read: **SCHEMA_QUICK_REFERENCE.md** (Query Examples section)

#### Deploy the schema
→ Use: **backend/database/schema.sql**

#### Run migrations
→ Use: **backend/migrations/ensure-complete-schema.js**

#### Understand relationships
→ Read: **COMPLETE_SCHEMA_UPDATE_SUMMARY.md** (Foreign Keys section)

#### Find indexes
→ Read: **SCHEMA_QUICK_REFERENCE.md** or **COMPLETE_SCHEMA_UPDATE_SUMMARY.md**

#### Understand a specific table
→ Read: **SCHEMA_QUICK_REFERENCE.md** (organized by category)

---

## 📋 Quick Stats

| Metric | Count |
|--------|-------|
| Total Tables | 50+ |
| New Tables | 35 |
| Enhanced Tables | 6 |
| Total Columns | 200+ |
| New Columns | 100+ |
| Total Indexes | 50+ |
| New Indexes | 30+ |
| Foreign Keys | 20+ |

---

## 🚀 Deployment Guide

### Step 1: Review
- Read COMPLETE_SCHEMA_UPDATE_SUMMARY.md
- Review SCHEMA_QUICK_REFERENCE.md
- Check backend/database/schema.sql

### Step 2: Test Locally
- Delete backend/mcc_db.sqlite
- Restart backend
- Verify all tables created
- Test API endpoints

### Step 3: Deploy
- Push changes to GitHub
- Vercel automatically deploys
- Schema created on first request

### Step 4: Verify
- Check all tables exist
- Test API endpoints
- Monitor performance
- Check for errors

---

## 📖 Table Categories Explained

### Core Tables
Foundation tables used by all features:
- **users**: User accounts and authentication
- **roles**: User roles and permissions
- **brands**: Brand definitions
- **services**: Main service offerings
- **sub_services**: Service subdivisions
- **assets**: Asset library

### Linking Tables
Connect assets to other entities:
- **service_asset_links**: Asset to service relationships
- **subservice_asset_links**: Asset to sub-service relationships
- **keyword_asset_links**: Asset to keyword relationships

### QC Tables
Quality control and audit:
- **asset_qc_reviews**: QC review records
- **qc_audit_log**: Audit trail
- **qc_runs**: QC execution runs
- **qc_checklists**: QC templates
- **qc_checklist_versions**: Version control
- **qc_weightage_configs**: Scoring configuration

### SEO Tables
Search engine optimization:
- **on_page_seo_audits**: SEO audit results
- **seo_asset_domains**: SEO asset domains
- **service_pages**: Service page metadata

### Backlink Tables
Backlink management:
- **backlink_sources**: Backlink sources
- **backlink_submissions**: Submission tracking
- **toxic_backlinks**: Toxic backlink monitoring
- **competitor_backlinks**: Competitor analysis

### Issue Tracking
Problem tracking:
- **ux_issues**: UX/UI issues
- **url_errors**: URL errors

### Social Media
SMM management:
- **smm_posts**: Social media posts
- **graphic_assets**: Graphic assets

### Project Management
Project tracking:
- **projects**: Projects
- **campaigns**: Campaigns
- **tasks**: Tasks

### Analytics
Performance metrics:
- **okrs**: OKRs
- **competitor_benchmarks**: Benchmarks
- **gold_standards**: Standards
- **effort_targets**: Effort targets

### Team & Employee
Team management:
- **teams**: Teams
- **team_members**: Team membership
- **employee_evaluations**: Evaluations
- **employee_skills**: Skills
- **employee_achievements**: Achievements
- **reward_recommendations**: Rewards

### Communication
Communication tools:
- **voice_profiles**: Voice profiles
- **call_logs**: Call logs

### Knowledge & Compliance
Knowledge and compliance:
- **knowledge_articles**: Articles
- **compliance_rules**: Rules
- **compliance_audits**: Audits

### Configuration
System configuration:
- **personas**: Buyer personas
- **forms**: Form definitions
- **integrations**: Third-party integrations
- **integration_logs**: Integration logs
- **system_settings**: System settings

### Master Tables
Reference data:
- **asset_category_master**: Asset categories
- **asset_type_master**: Asset types
- **asset_formats**: Asset formats
- **workflow_stages**: Workflow stages
- **platforms**: Platforms
- **countries**: Countries
- **seo_error_types**: SEO error types

---

## 🔗 Related Documentation

### Data Persistence Fixes
- DEPLOYMENT_DATA_PERSISTENCE_FIX.md
- QUICK_DEPLOYMENT_CHECKLIST.md
- API_ENDPOINTS_REFERENCE.md

### Project Documentation
- README.md
- DEPLOYMENT_GUIDE.md
- QUICK_START.md

---

## ✅ Verification Checklist

Before deployment, verify:
- [ ] All 50+ tables defined
- [ ] All 200+ columns present
- [ ] All 50+ indexes created
- [ ] All 20+ foreign keys defined
- [ ] No syntax errors in schema.sql
- [ ] Migration script ready
- [ ] Documentation complete
- [ ] Backward compatibility confirmed

---

## 📞 Support

### For Schema Questions
1. Check SCHEMA_QUICK_REFERENCE.md
2. Review COMPLETE_SCHEMA_UPDATE_SUMMARY.md
3. Check backend/database/schema.sql
4. Review table definitions

### For Deployment Issues
1. Check DEPLOYMENT_DATA_PERSISTENCE_FIX.md
2. Review migration script
3. Check backend logs
4. Verify database file exists

### For API Issues
1. Check API_ENDPOINTS_REFERENCE.md
2. Verify table exists
3. Check foreign keys
4. Review API controller

---

## 📅 Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | Feb 6, 2026 | Complete schema with 50+ tables |
| 1.0 | Feb 6, 2026 | Initial schema with core tables |

---

## 🎯 Next Steps

1. **Review**: Read COMPLETE_SCHEMA_UPDATE_SUMMARY.md
2. **Understand**: Review SCHEMA_QUICK_REFERENCE.md
3. **Test**: Deploy locally and test
4. **Deploy**: Push to production
5. **Verify**: Confirm all tables created
6. **Monitor**: Track performance

---

**Last Updated**: February 6, 2026
**Schema Version**: 2.0 (Complete)
**Status**: Ready for Production
**Total Tables**: 50+
**Total Columns**: 200+
**Total Indexes**: 50+
