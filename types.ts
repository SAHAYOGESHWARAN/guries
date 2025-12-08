
// --- Identity & Organization ---
export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    created_at: string;
    avatar_url?: string;
    department?: string;
    country?: string;
    target?: string;
    projects_count?: number;
    last_login?: string;
}

export interface Team {
    id: number;
    name: string;
    lead_user_id: number;
    description?: string;
}

export interface TeamMember {
    id: number;
    team_id: number;
    user_id: number;
    role_in_team: string;
    user?: User;
}

export interface Brand {
    id: number;
    name: string;
    code?: string;
    industry: string;
    website: string;
    status: 'active' | 'inactive';
}

// --- Core Masters ---
export interface Keyword {
    id: number;
    keyword: string;
    keyword_type: string;
    intent?: string;
    search_volume: number;
    competition?: string;
    mapped_service?: string;
    status?: 'active' | 'deprecated';
    updated_at?: string;
    usage_count?: number;
}

export interface BacklinkSource {
    id: number;
    domain: string;
    platform_type: string;
    da_score: number;
    spam_score: number;
    country?: string;
    pricing?: 'Free' | 'Paid';
    status: 'active' | 'blacklisted' | 'test' | 'trusted' | 'avoid';
    updated_at?: string;
}

export interface BacklinkCredential {
    id: number;
    backlink_source_id: number;
    username?: string;
    password?: string;
    notes?: string;
}

// --- Service & Content ---
export interface ServiceLink {
    url: string;
    anchor_text: string;
    target_type?: string;
    rel?: string;
}

export interface ServiceImage {
    url: string;
    alt_text: string;
    context: string;
}

export interface FAQItem {
    question: string;
    answer: string;
}

export interface Service {
    id: number;

    // A. Identity & Core Details
    service_code: string;
    service_name: string;
    slug: string;
    full_url: string;
    menu_heading: string;
    short_tagline: string;
    service_description: string;
    industry_ids: string[];
    country_ids: string[];
    language: string;
    status: 'Draft' | 'Published' | 'Archived' | 'In Progress' | 'QC' | 'Approved';

    // B. Ownership & Governance
    brand_id?: number;
    business_unit?: string;
    content_owner_id?: number;
    created_by?: number;
    created_at?: string;
    updated_by?: number;
    updated_at?: string;
    version_number?: number;
    change_log_link?: string;

    // C. Navigation
    show_in_main_menu?: boolean;
    show_in_footer_menu?: boolean;
    menu_group?: string;
    menu_position?: number;
    breadcrumb_label?: string;
    parent_menu_section?: string;
    include_in_xml_sitemap?: boolean;
    sitemap_priority?: number;
    sitemap_changefreq?: 'daily' | 'weekly' | 'monthly' | 'yearly';

    // D. Strategic Mapping
    content_type?: 'Pillar' | 'Cluster' | 'Landing' | 'Blog' | 'Case Study' | 'Sales Page';
    buyer_journey_stage?: 'Awareness' | 'Consideration' | 'Decision' | 'Retention';
    primary_persona_id?: number;
    secondary_persona_ids?: number[];
    target_segment_notes?: string;
    primary_cta_label?: string;
    primary_cta_url?: string;
    form_id?: number;
    linked_campaign_ids?: number[];

    // E. Technical SEO
    schema_type_id?: string;
    robots_index?: 'index' | 'noindex';
    robots_follow?: 'follow' | 'nofollow';
    robots_custom?: string;
    canonical_url?: string;
    redirect_from_urls?: string[];
    hreflang_group_id?: number;
    core_web_vitals_status?: 'Good' | 'Needs Improvement' | 'Poor';
    tech_seo_status?: 'Ok' | 'Warning' | 'Critical';
    faq_section_enabled?: boolean;
    faq_content?: FAQItem[];

    // F. Content Block
    h1?: string;
    h2_list?: string[];
    h3_list?: string[];
    h4_list?: string[];
    h5_list?: string[];
    body_content?: string;
    internal_links?: ServiceLink[];
    external_links?: ServiceLink[];
    image_alt_texts?: ServiceImage[];
    word_count?: number;
    reading_time_minutes?: number;

    // G. SEO Metadata
    meta_title?: string;
    meta_description?: string;
    focus_keywords?: string[];
    secondary_keywords?: string[];
    seo_score?: number;
    ranking_summary?: string;

    // H. SMM / Social Meta
    og_title?: string;
    og_description?: string;
    og_image_url?: string;
    og_type?: 'article' | 'website' | 'product';
    twitter_title?: string;
    twitter_description?: string;
    twitter_image_url?: string;
    // LinkedIn Platform
    linkedin_title?: string;
    linkedin_description?: string;
    linkedin_image_url?: string;
    // Facebook Platform
    facebook_title?: string;
    facebook_description?: string;
    facebook_image_url?: string;
    // Instagram Platform
    instagram_title?: string;
    instagram_description?: string;
    instagram_image_url?: string;
    // Per-channel social meta (read-only suggestions / defaults)
    social_meta?: {
        linkedin?: { title?: string; description?: string; image_url?: string };
        facebook?: { title?: string; description?: string; image_url?: string };
        instagram?: { title?: string; description?: string; image_url?: string };
    };

    // K. Linking
    has_subservices?: boolean;
    subservice_count?: number;
    primary_subservice_id?: number;
    featured_asset_id?: number;
    asset_count?: number;
    knowledge_topic_id?: number;

    // Legacy/Compat fields
    health_score?: number;
    industry?: string;
}

export interface ServiceUrl {
    id: number;
    service_id: number;
    url: string;
    status: string;
}

export interface SubServiceItem {
    id: number;
    sub_service_name: string;
    sub_service_code?: string;
    parent_service_id: number;
    slug: string;
    full_url: string;
    description: string;
    status: 'Draft' | 'In Progress' | 'QC' | 'Approved' | 'Published' | 'Archived';
    language?: string;

    // Navigation
    menu_position?: number;
    breadcrumb_label?: string;
    include_in_xml_sitemap?: boolean;
    sitemap_priority?: number;
    sitemap_changefreq?: 'daily' | 'weekly' | 'monthly' | 'yearly';

    // Strategic
    content_type?: 'Pillar' | 'Cluster' | 'Landing' | 'Blog' | 'Case Study' | 'Sales Page' | string;
    buyer_journey_stage?: 'Awareness' | 'Consideration' | 'Decision' | 'Retention' | string;
    primary_cta_label?: string;
    primary_cta_url?: string;

    // Content Block
    h1?: string;
    h2_list?: string[];
    h3_list?: string[];
    body_content?: string;

    // SEO Block
    meta_title?: string;
    meta_description?: string;
    focus_keywords?: string[];
    secondary_keywords?: string[];
    schema_type_id?: string;
    canonical_url?: string;
    robots_index?: 'index' | 'noindex';
    robots_follow?: 'follow' | 'nofollow';

    // SMM Block
    og_title?: string;
    og_description?: string;
    og_image_url?: string;
    og_type?: 'article' | 'website' | 'product';
    twitter_title?: string;
    twitter_description?: string;
    twitter_image_url?: string;
    // LinkedIn Platform
    linkedin_title?: string;
    linkedin_description?: string;
    linkedin_image_url?: string;
    // Facebook Platform
    facebook_title?: string;
    facebook_description?: string;
    facebook_image_url?: string;
    // Instagram Platform
    instagram_title?: string;
    instagram_description?: string;
    instagram_image_url?: string;
    // Per-channel social meta
    social_meta?: {
        linkedin?: { title?: string; description?: string; image_url?: string };
        facebook?: { title?: string; description?: string; image_url?: string };
        instagram?: { title?: string; description?: string; image_url?: string };
    };

    // Governance
    brand_id?: number;
    content_owner_id?: number;
    created_at?: string;
    updated_at?: string;
    created_by?: number;
    updated_by?: number;

    assets_linked?: number;
    keywords?: string[]; // compat
}

export interface ServicePageItem {
    id: number;
    page_title: string;
    url: string;
    page_type: 'Service Page' | 'Sub-Service Page';
    service_name: string;
    sub_service_name?: string;
    seo_score: number;
    audit_score: number;
    primary_keyword: string;
    last_audit: string;
    status: 'Draft' | 'In Progress' | 'Published' | 'Audit Pending' | 'Needs Fix' | 'QC Pending' | 'QC Passed' | 'Promoted';
    meta_description?: string;
}

export interface ContentRepositoryItem {
    id: number;
    content_title_clean: string;
    asset_type: 'article' | 'video' | 'graphic' | 'pdf' | 'guide' | 'blog' | 'service_page';
    asset_category?: string;
    asset_format?: 'image' | 'video' | 'text';
    slug?: string;
    full_url?: string;
    status: 'idea' | 'outline' | 'draft' | 'qc_pending' | 'qc_passed' | 'published' | 'updated' | 'ready_to_publish';

    // Linking
    linked_service_ids?: number[];
    linked_sub_service_ids?: number[];
    linked_campaign_id?: number;

    // Content Block (Working Copy)
    h1?: string;
    h2_list?: string[];
    h3_list?: string[];
    body_content?: string;

    // SEO Block (Working Copy)
    meta_title?: string;
    meta_description?: string;
    focus_keywords?: string[];

    // SMM Block (Working Copy)
    og_title?: string;
    og_description?: string;
    og_image_url?: string;
    // Per-channel social meta (working copy)
    social_meta?: {
        linkedin?: { title?: string; description?: string; image_url?: string };
        facebook?: { title?: string; description?: string; image_url?: string };
        instagram?: { title?: string; description?: string; image_url?: string };
    };

    // QC / AI
    ai_qc_report?: {
        score: number;
        issues: string[];
        suggestions: string[];
    };

    brand_id?: number;
    created_at?: string;
    last_status_update_at: string;
    word_count?: number;
    assigned_to_id?: number;

    // Legacy/Compat
    service_id?: number;
    service_name?: string;
    campaign_name?: string;
    keywords?: string[];
    promotion_channels?: string[];
    thumbnail_url?: string;
    context?: string;
}

// ... other types (Project, Campaign, Task, etc.) ...
export interface Project {
    id: number;
    project_name: string;
    project_type: string;
    project_status: string;
    project_owner_id: number;
    created_at?: string;
    brand_id?: number;
    project_start_date?: string;
    project_end_date?: string;
    objective?: string;
    linked_services?: any[];
}

export interface Campaign {
    id: number;
    campaign_name: string;
    campaign_status: string;
    linked_service_ids?: number[];
    project_id?: number;
    brand_id?: number;
    campaign_type?: string;
    target_url?: string;
    backlinks_planned: number;
    backlinks_completed: number;
    campaign_start_date?: string;
    campaign_end_date?: string;
    campaign_owner_id?: number;
    tasks_total?: number;
    tasks_completed?: number;
    kpi_score?: number;
}

export interface Task {
    id: number;
    name: string;
    status: string;
    campaign_id: number;
    primary_owner_id: number;
    due_date: string;
    priority?: 'High' | 'Medium' | 'Low';
    task_type?: string;
    sub_campaign?: string;
    progress_stage?: string;
    qc_stage?: string;
    rework_count?: number;
    repo_link_count?: number;
    created_at?: string;
}

export interface Notification {
    id: number;
    text: string;
    type: 'success' | 'warning' | 'info' | 'error';
    read: boolean;
    time: string;
    created_at?: string;
}

export interface OnPageSeoAudit {
    id: number;
    service_id?: number;
    sub_service_id?: number;
    error_type: string;
    error_category: 'Content' | 'Technical' | 'Meta' | 'Links' | 'Images' | 'Schema';
    severity: 'High' | 'Medium' | 'Low';
    issue_description: string;
    current_value?: string;
    recommended_value?: string;
    detected_at?: string;
    linked_campaign_id?: number;
    status: 'open' | 'in_progress' | 'resolved' | 'ignored';
    resolved_at?: string;
    resolution_notes?: string;
    created_by?: number;
    created_at?: string;
    updated_at?: string;
}

export interface UrlError {
    id: number;
    url: string;
    error_type: string;
    severity: 'High' | 'Medium' | 'Low';
    description: string;
    status: 'Open' | 'In Progress' | 'Resolved' | 'Ignored';
    assigned_to_id?: number;
    updated_at: string;
    created_at?: string;
    resolution_notes?: string;
    service_id?: number;
    sub_service_id?: number;
    linked_campaign_id?: number;
    service_name?: string;
    sub_service_name?: string;
}

export interface BacklinkSubmission {
    id: number;
    backlink_source_id: number;
    target_url: string;
    anchor_text_used: string;
    content_used: string;
    owner_id: number;
    submission_status: 'Pending' | 'Submitted' | 'Verified' | 'Rejected' | 'Expired';
    submitted_at: string;
}

export interface GraphicAssetPlan {
    id: number;
    graphic_type: 'smm_post' | 'infographic' | 'banner' | 'carousel';
    platform: 'instagram' | 'linkedin' | 'youtube' | 'pinterest';
    status: 'requested' | 'in_design' | 'under_qc' | 'approved';
    due_at: string;
    designer_owner_id?: number;
    brand_id?: number;
    created_at?: string;
}

export interface SmmPost {
    id: number;
    title: string;
    smm_type: string;
    primary_platform: string;
    smm_status: string;
    schedule_date: string;
    caption: string;
    brand_id?: number;
    assets_summary?: string;
    service_name?: string;
    sub_service_name?: string;
    assigned_to_id?: number;
    assigned_to_name?: string;
    created_at?: string;
}

export interface AssetLibraryItem {
    id: number;
    name: string;
    type: string; // Asset Type: article/video/graphic/guide
    asset_category?: string; // e.g., "what science can do", "how to"
    asset_format?: string; // e.g., "image", "video", "pdf"
    repository: string;
    usage_status: 'Available' | 'In Use' | 'Archived';
    status?: 'Draft' | 'Published' | 'Archived' | 'In Progress' | 'QC' | 'Approved';
    qc_score?: number; // Quality control score
    date: string;
    linked_task?: number;
    owner_id?: number;
    file_url?: string;
    thumbnail_url?: string;
    file_size?: number;
    file_type?: string;
    linked_service_ids?: number[];
    linked_sub_service_ids?: number[];
    linked_page_ids?: number[]; // For mapping to specific pages
    mapped_to?: string; // Display string: "Service / Sub-service / Page"
}

export interface Integration {
    id: string;
    name: string;
    icon: string;
    description: string;
    connected: boolean;
    healthScore: number;
    syncStatus: 'success' | 'syncing' | 'error' | 'idle';
    config?: any;
    lastSyncTime?: string;
}

export interface QcRun {
    id: number;
    target_type: 'task' | 'content_asset' | 'graphic_asset' | 'smm_post';
    target_id: number;
    qc_status: 'under_qc' | 'approved' | 'rejected' | 'rework';
    qc_owner_id: number;
    qc_checklist_version_id: number;
    final_score_percentage?: number;
    analysis_report?: string;
    created_at?: string;
}

export interface QcChecklistItem {
    id: number;
    checklist_name: string;
    checklist_type: string;
    category: string;
    number_of_items: number;
    scoring_mode: string;
    pass_threshold: string;
    rework_threshold?: string;
    status: string;
    updated_at?: string;
}

export interface CampaignPerformanceKpi {
    id: number;
    campaign_id: number;
    metric_name: string;
    metric_value: number;
    date: string;
    created_at?: string;
}

export interface ActivityLog {
    id: number;
    user_id: number;
    action: string;
    entity_type: string;
    entity_id: number;
    timestamp: string;
}

export interface IntegrationLog {
    id: number;
    integrationId: string;
    event: string;
    status: 'success' | 'error';
    timestamp: string;
}

export interface ToxicBacklink {
    id: number;
    domain: string;
    spam_score: number;
    anchor_text: string;
    status: string;
    toxic_url?: string;
    landing_page?: string;
    dr?: number;
    type?: string;
    severity?: string;
    assigned_to_id?: number;
    created_at?: string;
}

export interface QcChecklistVersion {
    id: number;
    checklist_id: number;
    version: number;
    items: any[];
    created_at: string;
}

export interface QcRunItem {
    id: number;
    qc_run_id: number;
    checklist_item_id: number;
    status: 'pass' | 'fail' | 'na';
    notes?: string;
}

export interface TeamPerformance {
    team_id: number;
    metric: string;
    value: number;
    period: string;
}

export interface EffortTarget {
    id: number;
    role: string;
    category: string;
    metric: string;
    monthly: number;
    weekly: number;
    daily: number;
    weightage: string;
    rules: string;
    status: string;
    updated?: string;
}

export interface GoldStandardMetric {
    id: number;
    metric_name: string;
    category: string;
    value: string;
    range: string;
    unit: string;
    evidence: string;
    status: string;
    updated_on?: string;
}

export interface IndustrySectorItem {
    id: number;
    industry: string;
    sector: string;
    application: string;
    country: string;
    status: string;
}

export interface ContentTypeItem {
    id: number;
    content_type: string;
    category: string;
    description: string;
    default_attributes: string[];
    use_in_campaigns?: number;
    status: string;
}

export interface PersonaMasterItem {
    id: number;
    persona_name: string;
    segment?: string;
    role?: string;
    funnel_stage?: string;
    description?: string;
    status: string;
    updated_at?: string;
}

export interface FormMasterItem {
    id: number;
    form_name: string;
    form_type?: string;
    data_source?: string;
    target_url?: string;
    status: string;
    owner_id?: number;
    updated_at?: string;
}

export interface AssetTypeItem {
    id: number;
    asset_type: string;
    dimension: string;
    file_formats: string[];
    description: string;
    platforms_count?: number;
    graphic_status?: string;
    updated_at?: string;
}

export interface PlatformMasterItem {
    id: number;
    platform_name: string;
    content_types_count: number;
    asset_types_count: number;
    recommended_size: string;
    scheduling: string;
    status: string;
}

export interface CountryMasterItem {
    id: number;
    country_name: string;
    code: string;
    region: string;
    has_backlinks: boolean;
    has_content: boolean;
    has_smm: boolean;
    status: string;
}

export interface SeoErrorTypeItem {
    id: number;
    error_type: string;
    category: string;
    severity: string;
    description: string;
    status: string;
}

export interface WorkflowStageItem {
    id: number;
    workflow_name: string;
    stage_order: number;
    stage_label: string;
    color_tag: string;
    active_flag: string;
    total_stages?: number;
}

export interface CompetitorBenchmarkItem {
    id: number;
    competitor_name: string;
    domain: string;
    industry: string;
    sector?: string;
    region: string;
    da: number;
    dr: number;
    monthly_traffic: number | string;
    total_keywords: number;
    backlinks: number;
    ranking_coverage?: number;
    status: string;
    updated_on?: string;
}

export interface OKRItem {
    id: number;
    objective: string;
    type: 'Company' | 'Department' | 'Individual';
    cycle: string;
    owner: string;
    alignment: string;
    progress: number;
    status: string;
    updated_on?: string;
}

export interface UxIssue {
    id: number;
    title: string;
    url: string;
    severity: 'High' | 'Medium' | 'Low';
    device: string;
    status: string;
    description?: string;
    issue_type?: string;
    source?: string;
    screenshot_url?: string;
    assigned_to_id?: number;
    updated_at?: string;
    created_at?: string;
}

export interface PerformanceMetric {
    id: number;
    kpi_name: string;
    metric_type: string;
    baseline: string;
    current: string;
    target: string;
    delta: string;
    percent_achieved: number;
    gold_standard: string;
    competitor_avg: string;
    trend: string;
    status: string;
}

export interface ProjectImpact {
    projectId: number;
    impactScore: number;
}

export interface AutoInsight {
    id: number;
    type: string;
    message: string;
}

export interface EmployeeMetric {
    userId: number;
    metric: string;
    value: number;
}

export interface TaskHistory {
    taskId: number;
    status: string;
    timestamp: string;
}

export interface EmployeeRanking {
    rank: number;
    id: number;
    name: string;
    role: string;
    department: string;
    composite_score: number;
    qc_score: number;
    performance_score: number; // efficiency
    trend: 'Up' | 'Down' | 'Flat';
}

export interface WeeklyPerformance {
    week: string;
    score: number;
}

export interface ChatMessage {
    id: number;
    text: string;
    sender: 'user' | 'bot';
}

export interface CampaignEffortKpi {
    id: number;
    campaign_id: number;
    effort_hours: number;
    cost: number;
}

export interface Skill {
    name: string;
    score: number;
    category: string;
}

export interface Achievement {
    id: number;
    title: string;
    date: string;
    icon: string;
    description: string;
}

export interface RewardRecommendation {
    id: number;
    userId: number;
    name: string;
    role: string;
    tier: string;
    rank: number;
    score: number;
    recommendedBonus: number;
    status: string;
    achievements: string[];
}

export interface WorkloadForecast {
    userId: number;
    initials: string;
    name: string;
    role: string;
    currentLoad: number;
    predictedLoad: number;
    capacity: number;
    utilization: number;
    riskLevel: string;
}

export interface Email {
    id: number;
    subject: string;
    recipient: string;
    status: 'draft' | 'scheduled' | 'sent' | 'failed';
    scheduled_at?: string;
    template_id?: number;
    created_at: string;
}

export interface VoiceProfile {
    id: number;
    name: string;
    voice_id: string;
    language: string;
    gender: string;
    provider: string;
}

export interface CallLog {
    id: number;
    agent_id: number;
    customer_phone: string;
    duration: number;
    sentiment: string;
    recording_url?: string;
    summary?: string;
    start_time: string;
}

export interface KnowledgeArticle {
    id: number;
    title: string;
    content: string;
    category: string;
    tags: string[];
    language: string;
    author_id: number;
    status: 'draft' | 'published' | 'archived';
    created_at?: string;
    updated_at?: string;
}

export interface ComplianceRule {
    id: number;
    rule_name: string;
    description: string;
    category: string;
    severity: 'High' | 'Medium' | 'Low';
}

export interface ComplianceAudit {
    id: number;
    target_type: string;
    target_id: number;
    score: number;
    violations: string[];
    audited_at: string;
}
