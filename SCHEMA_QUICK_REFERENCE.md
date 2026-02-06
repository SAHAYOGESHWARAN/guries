# Database Schema Quick Reference

## Core Tables (Always Used)

### users
- id, name, email, role, status, password_hash, department, country, last_login, created_at, updated_at

### roles
- id, role_name, permissions (JSON), status, created_at, updated_at

### brands
- id, name, code, industry, website, status, created_at, updated_at

### services
- id, service_name, service_code, slug, status, h1, h2_list, h3_list, h4_list, h5_list, body_content, internal_links, external_links, image_alt_texts, meta_title, meta_description, focus_keywords, secondary_keywords, meta_keywords, og_title, og_description, og_image_url, twitter_title, twitter_description, twitter_image_url, schema_type_id, robots_index, robots_follow, canonical_url, word_count, reading_time_minutes, version_number, created_at, updated_at

### sub_services
- id, service_id, sub_service_name, sub_service_code, slug, description, status, parent_service_id, [all SEO fields from services], created_at, updated_at

### assets
- id, asset_name, asset_type, asset_category, asset_format, status, qc_status, file_url, thumbnail_url, qc_score, qc_checklist_items, submitted_by, submitted_at, qc_reviewer_id, qc_reviewed_at, qc_remarks, qc_checklist_completion, linking_active, rework_count, workflow_log, workflow_stage, version_number, version_history, created_by, updated_by, created_at, updated_at, [web fields], [seo fields], [smm fields], [linking fields], [usage tracking fields]

### keywords
- id, keyword, keyword_name, keyword_code, keyword_id, keyword_intent, keyword_type, language, search_volume, difficulty_score, mapped_service_id, mapped_service, mapped_sub_service_id, mapped_sub_service, keyword_category, status, created_at, updated_at

---

## Linking Tables

### service_asset_links
- id, service_id (FK), asset_id (FK), link_type, created_at, updated_at

### subservice_asset_links
- id, sub_service_id (FK), asset_id (FK), link_type, created_at, updated_at

### keyword_asset_links
- id, keyword_id (FK), asset_id (FK), link_type, created_at, updated_at

---

## QC & Audit Tables

### asset_qc_reviews
- id, asset_id (FK), qc_reviewer_id (FK), qc_score, checklist_completion, qc_remarks, qc_decision, checklist_items, created_at

### qc_audit_log
- id, asset_id (FK), user_id (FK), action, details, ip_address, user_agent, created_at

### qc_runs
- id, target_type, target_id, qc_status, qc_owner_id (FK), qc_checklist_version_id (FK), final_score_percentage, analysis_report, created_at, updated_at

### qc_checklists
- id, checklist_name, checklist_type, category, number_of_items, scoring_mode, pass_threshold, status, created_at, updated_at

### qc_checklist_versions
- id, checklist_id (FK), version_number, items (JSON), created_at

### qc_weightage_configs
- id, name, type, weight, mandatory, stage, asset_type, created_at, updated_at

---

## SEO & Content Tables

### on_page_seo_audits
- id, url, service_id (FK), sub_service_id (FK), error_type, error_category, severity, issue_description, current_value, recommended_value, linked_campaign_id (FK), status, assigned_to_id (FK), created_by (FK), detected_at, resolved_at, resolution_notes, created_at, updated_at

### seo_asset_domains
- id, seo_asset_id (FK), domain_name, domain_type, url_posted, seo_self_qc_status, qa_status, approval_status, display_status, backlink_source_id (FK), created_at, updated_at

### service_pages
- id, page_title, url, url_slug, page_type, service_id (FK), sub_service_id (FK), industry, target_keyword, primary_keyword, seo_score, audit_score, created_at, updated_at

---

## Backlink Tables

### backlink_sources
- id, domain, backlink_url, backlink_category, niche_industry, da_score, spam_score, pricing, country, username, password, credentials_notes, status, created_by (FK), created_at, updated_at

### backlink_submissions
- id, domain, opportunity_type, category, target_url, anchor_text, content_used, da_score, spam_score, country, service_id (FK), sub_service_id (FK), seo_owner_id (FK), is_paid, submission_status, created_at, updated_at

### toxic_backlinks
- id, domain, toxic_url, backlink_url, landing_page, anchor_text, spam_score, dr, dr_type, severity, status, assigned_to_id (FK), service_id (FK), notes, created_at, updated_at

### competitor_backlinks
- id, competitor_domain, backlink_url, source_domain, anchor_text, domain_authority, created_at

---

## Issue Tracking Tables

### ux_issues
- id, title, issue_title, description, url, issue_type, device, severity, source, screenshot_url, assigned_to_id (FK), service_id (FK), status, resolution_notes, priority_score, created_at, updated_at

### url_errors
- id, url, error_type, severity, description, service_id (FK), sub_service_id (FK), linked_campaign_id (FK), assigned_to_id (FK), status, created_at, updated_at

---

## Social Media Tables

### smm_posts
- id, title, smm_type, content_type, primary_platform, smm_status, schedule_date, schedule_time, caption, hashtags, asset_url, asset_count, service_id (FK), sub_service_id (FK), assigned_to_id (FK), created_at, updated_at

### graphic_assets
- id, asset_name, asset_type, file_url, dimensions, file_format, file_size_kb, tags, status, created_at, updated_at

---

## Project Management Tables

### projects
- id, project_name, project_code, description, status, start_date, end_date, budget, owner_id (FK), brand_id (FK), linked_service_id (FK), priority, sub_services, outcome_kpis, expected_outcome, team_members, weekly_report, created_at, updated_at

### campaigns
- id, campaign_name, campaign_type, status, description, campaign_start_date, campaign_end_date, campaign_owner_id (FK), project_id (FK), brand_id (FK), linked_service_ids, target_url, backlinks_planned, backlinks_completed, tasks_completed, tasks_total, kpi_score, sub_campaigns, created_at, updated_at

### tasks
- id, task_name, description, status, priority, assigned_to (FK), project_id (FK), campaign_id (FK), due_date, campaign_type, sub_campaign, progress_stage, qc_stage, estimated_hours, tags, repo_links, rework_count, repo_link_count, created_at, updated_at

---

## Performance & Analytics Tables

### okrs
- id, objective, type, cycle, owner, alignment, progress, status, created_at, updated_at

### competitor_benchmarks
- id, competitor_name, competitor_domain, monthly_traffic, total_keywords, backlinks, ranking_coverage, status, updated_on, created_at

### gold_standards
- id, metric_name, category, value, range, unit, evidence, status, created_at, updated_at

### effort_targets
- id, role, category, metric, monthly, weekly, daily, weightage, rules (JSON), status, created_at, updated_at

---

## Team & Employee Tables

### teams
- id, name, lead_user_id (FK), description, created_at, updated_at

### team_members
- id, team_id (FK), user_id (FK), role_in_team, created_at

### employee_evaluations
- id, employee_id (FK), evaluation_period, overall_score, performance_metrics (JSON), ai_analysis, created_at

### employee_skills
- id, employee_id (FK), skill_name, skill_category, score, created_at, updated_at

### employee_achievements
- id, employee_id (FK), achievement_title, achievement_description, date_awarded, created_at

### reward_recommendations
- id, employee_id (FK), recommendation_type, reason, status, created_at, updated_at

---

## Communication Tables

### voice_profiles
- id, name, voice_id, language, gender, provider, created_at, updated_at

### call_logs
- id, agent_id (FK), customer_phone, duration, sentiment, recording_url, summary, start_time

---

## Knowledge & Compliance Tables

### knowledge_articles
- id, title, content, category, tags, language, author_id (FK), status, created_at, updated_at

### compliance_rules
- id, rule_name, description, category, severity, created_at, updated_at

### compliance_audits
- id, target_type, target_id, score, violations (JSON), audited_at

---

## Configuration Tables

### personas
- id, persona_name, description, demographics (JSON), goals (JSON), pain_points (JSON), status, created_at, updated_at

### forms
- id, form_name, form_type, fields (JSON), status, created_at, updated_at

### integrations
- id, name, type, status, api_key, api_secret, config (JSON), last_sync_at, created_at, updated_at

### integration_logs
- id, integration_id (FK), event, status, details (JSON), timestamp

### system_settings
- id, setting_key (UNIQUE), setting_value, is_enabled, updated_at

---

## Master Tables

### asset_category_master
- id, category_name, category_code, description, status, created_at, updated_at

### asset_type_master
- id, type_name, type_code, description, status, created_at, updated_at

### asset_formats
- id, format_name, format_code, description, status, created_at, updated_at

### workflow_stages
- id, stage_name, stage_code, sequence, description, status, created_at, updated_at

### platforms
- id, platform_name, platform_code, description, status, created_at, updated_at

### countries
- id, country_name, country_code, status, created_at, updated_at

### seo_error_types
- id, error_type, error_code, description, severity, status, created_at, updated_at

---

## Notification Tables

### notifications
- id, user_id (FK), title, message, type, is_read, link, created_at

---

## Quick Query Examples

### Get all assets for a service
```sql
SELECT a.* FROM assets a
JOIN service_asset_links sal ON a.id = sal.asset_id
WHERE sal.service_id = ?
```

### Get all SEO audits for a service
```sql
SELECT * FROM on_page_seo_audits
WHERE service_id = ? AND severity = 'High'
ORDER BY detected_at DESC
```

### Get team members
```sql
SELECT u.*, t.name as team_name FROM users u
JOIN team_members tm ON u.id = tm.user_id
JOIN teams t ON tm.team_id = t.id
WHERE t.id = ?
```

### Get QC results for asset
```sql
SELECT * FROM asset_qc_reviews
WHERE asset_id = ?
ORDER BY created_at DESC
```

### Get backlink submissions by status
```sql
SELECT bs.*, s.service_name, ss.sub_service_name
FROM backlink_submissions bs
LEFT JOIN services s ON bs.service_id = s.id
LEFT JOIN sub_services ss ON bs.sub_service_id = ss.id
WHERE bs.submission_status = ?
```

---

**Last Updated**: February 6, 2026
**Total Tables**: 50+
**Total Columns**: 200+
**Status**: Complete
