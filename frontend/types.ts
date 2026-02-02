
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
    keyword_intent: string;
    keyword_type: string;
    language: string;
    search_volume: number;
    competition_score: string;
    mapped_service_id?: number;
    mapped_service?: string;
    mapped_sub_service_id?: number;
    mapped_sub_service?: string;
    status: 'active' | 'deprecated' | 'archived';
    created_by?: number;
    created_at?: string;
    updated_at?: string;
    usage_count?: number;
}

export interface BacklinkSource {
    id: number;
    domain: string;
    backlink_url: string;
    backlink_category: string;
    niche_industry?: string;
    da_score: number;
    spam_score: number;
    pricing: 'Free' | 'Paid';
    country?: string;
    username?: string;
    password?: string;
    credentials_notes?: string;
    status: 'active' | 'inactive' | 'blacklisted' | 'test' | 'trusted' | 'avoid';
    created_by?: number;
    created_at?: string;
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
    category?: string;
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
    meta_keywords?: string[];
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
    linked_insights_ids?: number[];
    linked_assets_ids?: number[];

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

    // A. Identity & Core Details
    sub_service_name: string;
    sub_service_code?: string;
    parent_service_id: number;
    slug: string;
    full_url: string;
    description: string;
    language?: string;
    status: 'Draft' | 'In Progress' | 'QC' | 'Approved' | 'Published' | 'Archived';

    // B. Ownership & Governance
    brand_id?: number;
    business_unit?: string;
    content_owner_id?: number;
    created_by?: number;
    updated_by?: number;
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
    content_type?: 'Pillar' | 'Cluster' | 'Landing' | 'Blog' | 'Case Study' | 'Sales Page' | string;
    category?: string;
    buyer_journey_stage?: 'Awareness' | 'Consideration' | 'Decision' | 'Retention' | string;
    primary_persona_id?: number;
    secondary_persona_ids?: number[];
    target_segment_notes?: string;
    strategic_notes?: string;
    industry_ids?: string[];
    country_ids?: string[];
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
    meta_keywords?: string[];
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
    linkedin_title?: string;
    linkedin_description?: string;
    linkedin_image_url?: string;
    facebook_title?: string;
    facebook_description?: string;
    facebook_image_url?: string;
    instagram_title?: string;
    instagram_description?: string;
    instagram_image_url?: string;
    social_meta?: {
        linkedin?: { title?: string; description?: string; image_url?: string };
        facebook?: { title?: string; description?: string; image_url?: string };
        instagram?: { title?: string; description?: string; image_url?: string };
    };

    // K. Linking
    has_subservices?: boolean;
    subservice_count?: number;
    featured_asset_id?: number;
    asset_count?: number;
    knowledge_topic_id?: number;
    linked_insights_ids?: number[];
    linked_assets_ids?: number[];

    // Timestamps
    created_at?: string;
    updated_at?: string;

    // Legacy/Compat
    assets_linked?: number;
    keywords?: string[];
    working_on_by?: string;
}

export interface ServicePageItem {
    id: number;
    page_title: string;
    url: string;
    url_slug?: string;
    page_type: 'Service Page' | 'Sub-Service Page' | string;
    service_id?: number;
    service_name?: string;
    sub_service_id?: number;
    sub_service_name?: string;
    industry?: string;
    target_keyword?: string;
    primary_keyword?: string;
    seo_score?: number;
    audit_score?: number;
    last_audit?: string;
    status: 'Draft' | 'In Progress' | 'Published' | 'Audit Pending' | 'Needs Fix' | 'QC Pending' | 'QC Passed' | 'Promoted' | string;
    meta_description?: string;
    writer_id?: number;
    writer_name?: string;
    seo_id?: number;
    seo_name?: string;
    developer_id?: number;
    developer_name?: string;
    created_at?: string;
    updated_at?: string;
}

export interface ContentRepositoryItem {
    id: number;
    content_title_clean: string;
    asset_type: 'article' | 'video' | 'graphic' | 'pdf' | 'guide' | 'blog' | 'service_page' | string;
    asset_category?: string;
    asset_format?: 'image' | 'video' | 'text';
    content_type?: 'Article' | 'Blog' | 'Service Page' | 'SMM Caption' | 'Whitepaper' | 'Case Study' | string;
    slug?: string;
    full_url?: string;
    status: 'idea' | 'outline' | 'draft' | 'final_draft' | 'qc_pending' | 'qc_passed' | 'ready_for_graphics' | 'ready_to_publish' | 'published' | 'updated' | string;

    // Linking
    linked_service_ids?: number[];
    linked_sub_service_ids?: number[];
    linked_service_id?: number;
    linked_sub_service_id?: number;
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
    qc_score?: number;

    brand_id?: number;
    created_at?: string;
    updated_at?: string;
    last_status_update_at: string;
    word_count?: number;
    assigned_to_id?: number;
    industry?: string;
    keywords?: string[];

    // Joined fields
    service_name?: string;
    sub_service_name?: string;
    assigned_to_name?: string;

    // Legacy/Compat
    service_id?: number;
    campaign_name?: string;
    promotion_channels?: string[];
    thumbnail_url?: string;
    context?: string;
}

// ... other types (Project, Campaign, Task, etc.) ...
export interface Project {
    id: number;
    project_name: string;
    name?: string;
    project_code?: string;
    project_type?: string;
    project_status?: string;
    status?: string;
    project_owner_id?: number;
    owner_id?: number;
    owner_name?: string;
    created_at?: string;
    updated_at?: string;
    brand_id?: number;
    brand_name?: string;
    project_start_date?: string;
    project_end_date?: string;
    start_date?: string;
    end_date?: string;
    objective?: string;
    description?: string;
    linked_services?: any[];
    linked_service_id?: number;
    priority?: string;
    sub_services?: string;
    outcome_kpis?: string;
    expected_outcome?: string;
    team_members?: string;
    weekly_report?: boolean | number;
    progress?: number;
    open_tasks?: number;
    closed_tasks?: number;
    budget?: number;
}

export interface Campaign {
    id: number;
    campaign_name: string;
    campaign_status: string;
    status?: string;
    linked_service_ids?: number[];
    project_id?: number;
    brand_id?: number;
    campaign_type?: string;
    target_url?: string;
    backlinks_planned?: number;
    backlinks_completed?: number;
    campaign_start_date?: string;
    campaign_end_date?: string;
    start_date?: string;
    end_date?: string;
    campaign_owner_id?: number;
    owner_name?: string;
    tasks_total?: number;
    tasks_completed?: number;
    kpi_score?: number;
    sub_campaigns?: string | string[];
    description?: string;
    progress?: number;
    project_name?: string;
    brand_name?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Task {
    id: number;
    name: string;
    task_name?: string;
    status: string;
    description?: string;
    campaign_id?: number;
    primary_owner_id?: number;
    assigned_to?: number;
    project_id?: number;
    due_date?: string;
    completed_at?: string;
    priority?: 'High' | 'Medium' | 'Low' | 'high' | 'medium' | 'low';
    task_type?: string;
    campaign_type?: string;
    sub_campaign?: string;
    progress_stage?: string;
    qc_stage?: string;
    rework_count?: number;
    repo_link_count?: number;
    repo_links?: string;
    estimated_hours?: number;
    tags?: string;
    created_by?: number;
    created_at?: string;
    updated_at?: string;
    // Joined fields
    project_name?: string;
    campaign_name?: string;
    assignee_name?: string;
}

export interface Notification {
    id: number;
    text: string;
    title?: string;
    message?: string;
    type: 'success' | 'warning' | 'info' | 'error';
    read: boolean;
    is_read?: boolean;
    time: string;
    created_at?: string;
    user_id?: number;
    link?: string;
}

export interface OnPageSeoAudit {
    id: number;
    url: string;
    service_id?: number;
    sub_service_id?: number;
    error_type: string;
    error_category: 'Content' | 'Technical' | 'Meta' | 'Links' | 'Images' | 'Schema';
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    issue_description: string;
    current_value?: string;
    recommended_value?: string;
    detected_at?: string;
    linked_campaign_id?: number;
    status: 'Open' | 'In Progress' | 'Resolved' | 'Ignored';
    resolved_at?: string;
    resolution_notes?: string;
    assigned_to_id?: number;
    created_by?: number;
    created_at?: string;
    updated_at?: string;
    // Joined fields
    service_name?: string;
    sub_service_name?: string;
    assigned_to_name?: string;
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
    domain: string;
    opportunity_type: 'Guest Post' | 'Directory' | 'Forum' | 'Comment' | 'Profile' | 'Social Bookmark' | 'Press Release' | 'Infographic' | 'Resource Page' | 'Broken Link' | string;
    category?: string;
    target_url: string;
    anchor_text: string;
    content_used?: string;
    da_score?: number;
    spam_score?: number;
    country?: string;
    service_id?: number;
    service_name?: string;
    sub_service_id?: number;
    sub_service_name?: string;
    seo_owner_id?: number;
    seo_owner_name?: string;
    is_paid?: boolean;
    submission_status: 'Pending' | 'Submitted' | 'Verified' | 'Rejected' | 'Expired';
    created_at?: string;
    updated_at?: string;
    // Legacy fields for backward compatibility
    backlink_source_id?: number;
    anchor_text_used?: string;
    owner_id?: number;
    submitted_at?: string;
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

export interface PromotionItem {
    id: number;
    title: string;
    subtitle?: string;
    content_type: 'Blog' | 'Infographic' | 'Service Page' | 'Video' | 'Case Study' | 'Whitepaper' | 'Guide' | string;
    promotion_types: string[]; // ['SEO', 'SMM', 'Email', 'Paid Ads', 'Partnerships', 'Press Release']
    campaign_id?: number;
    campaign_name?: string;
    service_id?: number;
    service_name?: string;
    keywords?: string[];
    thumbnail_url?: string;
    full_url?: string;
    qc_status: 'QC Passed' | 'QC Pending' | 'QC Failed' | 'Rework Completed' | 'Updated' | string;
    published_date?: string;
    created_by?: number;
    created_by_name?: string;
    created_at?: string;
    updated_at?: string;
}

export interface SmmPost {
    id: number;
    title: string;
    smm_type: string;
    content_type?: string;
    primary_platform: string;
    smm_status: string;
    schedule_date?: string;
    schedule_time?: string;
    caption: string;
    hashtags?: string;
    asset_url?: string;
    asset_count?: number;
    brand_id?: number;
    service_id?: number;
    sub_service_id?: number;
    campaign_id?: number;
    keywords?: string;
    assigned_to_id?: number;
    // Joined fields
    service_name?: string;
    sub_service_name?: string;
    campaign_name?: string;
    assigned_to_name?: string;
    created_at?: string;
    updated_at?: string;
}

export interface AssetCategory {
    id: number;
    category_name: string;
    description?: string;
    status: string;
    created_at?: string;
    updated_at?: string;
}

export interface AssetFormat {
    id: number;
    format_name: string;
    format_type: 'image' | 'video' | 'document' | 'audio';
    file_extensions: string[];
    max_file_size_mb: number;
    description?: string;
    application_types: ('web' | 'seo' | 'smm')[];
    asset_type_ids?: string[]; // Array of asset type names that this format supports
    status: string;
    created_at?: string;
    updated_at?: string;
}

// QC Checklist Item Result for Asset QC Review
export interface QcChecklistItemResult {
    id: number;
    item_name: string; // QC parameter name (e.g., "Image Resolution & Quality")
    reviewer_comment?: string; // Reviewer feedback for the checklist item
    score: number; // Score assigned (e.g., 18)
    max_score: number; // Maximum possible score (e.g., 20)
    result: 'Pass' | 'Fail'; // Pass/Fail per checklist item
}

export interface AssetLibraryItem {
    id: number;
    name: string;
    type: string; // Asset Type: Blog Banner, Infographic, Social Post, Reel/Video, Thumbnail, Diagram, Web Graphic, PDF
    asset_category?: string; // e.g., "what science can do", "how to"
    asset_format?: string; // e.g., "image", "video", "pdf"
    content_type?: 'Blog' | 'Service Page' | 'Sub-Service Page' | 'SMM Post' | 'Backlink Asset' | 'Web UI Asset'; // Content classification type
    repository: string;
    // Removed usage_status as per requirement 3
    status?: 'Draft' | 'Pending QC Review' | 'QC Approved' | 'QC Rejected' | 'Rework Required' | 'Published' | 'Archived';

    // Workflow Stage (separate from status)
    workflow_stage?: 'Add' | 'In Progress' | 'Sent to QC' | 'Published' | 'In Rework' | 'Moved to CW' | 'Moved to GD' | 'Moved to WD';

    // QC Status (separate field, independent of Workflow Stage)
    qc_status?: 'QC Pending' | 'Rework' | 'Approved' | 'Reject' | 'Pass' | 'Fail';

    // Workflow fields
    submitted_by?: number;
    submitted_at?: string;
    qc_reviewer_id?: number;
    qc_reviewed_at?: string;
    qc_score?: number; // Quality control score (0-100)
    qc_remarks?: string;
    qc_checklist_items?: QcChecklistItemResult[]; // QC checklist with scoring
    rework_count?: number; // Number of times sent for rework
    linking_active?: boolean; // Only active after QC approval

    // AI Scores (mandatory before submission)
    seo_score?: number; // 0-100, AI generated
    grammar_score?: number; // 0-100, AI generated
    ai_plagiarism_score?: number; // 0-100, AI generated (higher = more original)

    date: string;
    linked_task?: number;
    owner_id?: number;

    // Map Assets to Source Work fields
    linked_task_id?: number;
    linked_campaign_id?: number;
    linked_project_id?: number;
    linked_service_id?: number;
    linked_sub_service_id?: number;
    linked_repository_item_id?: number;

    // Designer & Workflow Details
    created_by?: number; // User who created the asset (auto-populated)
    updated_by?: number; // User who last updated the asset
    designed_by?: number; // User who designed the asset
    published_by?: number; // User who published the asset
    verified_by?: number; // SEO verifier user
    published_at?: string; // Timestamp when asset was published

    // Versioning
    version_number?: string; // Version number like "v1.0"
    version_history?: Array<{ version: string; date: string; action: string; user?: string; user_id?: number }>;

    file_url?: string;
    thumbnail_url?: string;
    file_size?: number;
    file_type?: string;
    dimensions?: string; // Asset dimensions from Asset Type Master
    linked_service_ids?: number[];
    linked_sub_service_ids?: number[];
    linked_page_ids?: number[]; // For mapping to specific pages
    mapped_to?: string; // Display string: "Service / Sub-service / Page"

    // Asset Applications (in order: WEB, SEO, SMM)
    application_type?: 'web' | 'seo' | 'smm';

    // Keywords (should link with keyword master table)
    keywords?: string[];
    content_keywords?: string[]; // User-entered content keywords
    seo_keywords?: string[]; // SEO keywords from Keyword Master (select only)

    // Resource Upload (multi-file)
    resource_files?: string[]; // JSON array of uploaded resource file URLs

    // Usage tracking
    usage_count?: number; // Number of times this asset has been used

    // Web Application Fields
    web_title?: string;
    web_description?: string;
    web_meta_description?: string; // SEO meta description
    web_keywords?: string;
    web_url?: string;
    web_h1?: string;
    web_h2_1?: string;
    web_h2_2?: string;
    web_h3_tags?: string[]; // Array of H3 tags
    web_thumbnail?: string;
    web_body_content?: string;
    web_body_attachment?: string; // base64 or URL for attached file
    web_body_attachment_name?: string; // original filename for the attachment

    // SMM Application Fields
    smm_platform?: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'pinterest' | 'snapchat' | 'whatsapp' | 'telegram' | 'discord' | 'reddit' | 'tumblr' | 'other';
    smm_title?: string;
    smm_tag?: string;
    smm_url?: string;
    smm_description?: string;
    smm_hashtags?: string;
    smm_media_url?: string;
    smm_media_type?: 'image' | 'video' | 'carousel' | 'gif';
    smm_additional_pages?: string[]; // Additional pages/images for carousel posts
    smm_post_type?: string; // Type of post (image, video, carousel, story, reel)
    smm_campaign_type?: string; // Campaign type (awareness, engagement, traffic, conversions, lead-generation)
    smm_cta?: string; // Call to action text
    smm_target_audience?: string; // Target audience description

    // SEO Application Fields
    seo_title?: string;
    seo_target_url?: string;
    // seo_keywords is defined above in the Keywords section
    seo_focus_keyword?: string; // Primary focus keyword
    seo_content_type?: string; // Content type (blog-post, landing-page, product-page, etc.)
    seo_meta_description?: string;
    seo_content_description?: string;
    seo_h1?: string;
    seo_h2_1?: string;
    seo_h2_2?: string;
    seo_content_body?: string;

    // Metadata timestamps
    updated_at?: string;
    created_at?: string;

    // Static service links - assets linked during upload that cannot be unlinked
    static_service_links?: Array<{ service_id?: number; sub_service_id?: number; type: 'service' | 'subservice' }>;
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
    toxic_url: string;
    landing_page?: string;
    anchor_text: string;
    spam_score: number;
    dr?: number;
    dr_type?: 'Hacked Site' | 'Adult/Gambling/Pharma' | 'PBN (Private Blog Network)' | 'Foreign Language Unrelated' | 'Comment Spam' | 'Link Farm' | string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    status: 'Pending' | 'Verified Removal' | 'Disavowed' | 'Submitted' | 'Rejected' | 'In Review' | string;
    assigned_to_id?: number;
    assigned_to_name?: string;
    service_id?: number;
    service_name?: string;
    notes?: string;
    disavow_date?: string;
    created_at?: string;
    updated_at?: string;
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
    department: string;
    role: string;
    kpi_category: string;
    effort_metric: string;
    effective_date: string;
    status: 'Draft' | 'Active' | 'Inactive' | 'Archived';
    monthly_target: number;
    weekly_target: number;
    daily_target: number;
    max_capacity: number;
    min_completion_percent: number;
    weightage_percent: number;
    enable_ai_assignment: boolean;
    enable_load_balancing: boolean;
    enable_complexity_scoring: boolean;
    prevent_overload: boolean;
    reassign_if_target_not_met: boolean;
    max_tasks_per_day: number;
    max_tasks_per_campaign: number;
    allowed_rework_percent: number;
    delay_tolerance_percent: number;
    auto_assign_rules_summary: string;
    validation_rules?: string[];
    owner_id?: number;
    owner_name?: string;
    reviewer_id?: number;
    reviewer_name?: string;
    created_by?: number;
    created_at?: string;
    updated_at?: string;
}

export interface PerformanceTarget {
    id: number;
    target_level: string;
    brand_id?: number;
    brand_name?: string;
    tutorials_india?: string;
    department_function: string;
    applies_to?: string;
    kpi_name: string;
    metric_type: string;
    unit: string;
    direction: string;
    examples?: string;
    baseline_value: string;
    current_performance?: string;
    target_value: string;
    desired_performance?: string;
    cycle_type?: string;
    period_from?: string;
    period_to?: string;
    tolerance_min?: string;
    tolerance_max?: string;
    gold_standard_metric_id?: number;
    gold_standard_value?: string;
    competitor_benchmark?: string;
    your_target?: string;
    your_current?: string;
    competitor_current?: string;
    review_frequency?: string;
    auto_evaluate?: boolean;
    data_source?: string;
    validation_rules?: string[];
    auto_calculate_score?: boolean;
    trigger_alert_70_percent?: boolean;
    trigger_alert_110_percent?: boolean;
    trigger_alert_downward_trend?: boolean;
    use_in_okr_evaluation?: boolean;
    use_in_employee_scorecards?: boolean;
    use_in_project_health_score?: boolean;
    use_in_dashboard_highlights?: boolean;
    performance_scoring_logic?: string;
    achievement_calculation?: string;
    score_capping_logic?: string;
    status_achieved_green?: string;
    status_on_track_yellow?: string;
    status_off_track_red?: string;
    owner_id?: number;
    owner_name?: string;
    reviewer_id?: number;
    reviewer_name?: string;
    responsible_roles?: string;
    created_by?: number;
    created_at?: string;
    updated_at?: string;
}

export interface GoldStandardMetric {
    id: number;
    metric_name: string;
    category: string;
    description?: string;
    why_matters?: string;
    gold_standard_value: string;
    acceptable_range_min?: string;
    acceptable_range_max?: string;
    unit?: string;
    source?: string;
    evidence_link?: string;
    file_upload?: string;
    additional_notes?: string;
    owner_id?: number;
    owner_name?: string;
    reviewer_id?: number;
    reviewer_name?: string;
    review_frequency?: string;
    status?: string;
    next_review_date?: string;
    governance_notes?: string;
    created_at?: string;
    updated_at?: string;
}

export interface GoldStandardItem {
    id: number;
    // Tab 1: Metric Details
    metric_name: string;
    category: string;
    description?: string;
    why_matters?: string;

    // Tab 2: Standard Values
    gold_standard_value: string;
    acceptable_range_min?: string;
    acceptable_range_max?: string;
    unit?: string;
    benchmark_tips?: string;

    // Tab 3: Benchmark Evidence
    source?: string;
    evidence_link?: string;
    file_upload?: string;
    additional_notes?: string;

    // Tab 4: Ownership & Governance
    owner_id?: number;
    owner_name?: string;
    reviewer_id?: number;
    reviewer_name?: string;
    review_frequency?: string;
    status: 'Active' | 'Inactive' | 'Draft' | 'Archived';
    next_review_date?: string;
    governance_notes?: string;

    // Metadata
    created_at?: string;
    updated_at?: string;
}

export interface IndustrySectorItem {
    id: number;
    industry: string;
    sector: string;
    application: string;
    country: string;
    description?: string;
    status: string;
    created_at?: string;
    updated_at?: string;
}

export interface ContentTypeItem {
    id: number;
    content_type: string;
    category: string;
    description: string;
    default_wordcount_min?: number;
    default_wordcount_max?: number;
    default_graphic_requirements?: string; // JSON string
    default_qc_checklist?: string; // JSON string
    default_attributes?: string[];
    seo_focus_keywords_required?: number;
    social_media_applicable?: number;
    estimated_creation_hours?: number;
    content_owner_role?: string;
    use_in_campaigns?: number;
    status: string;
    created_at?: string;
    updated_at?: string;
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

export interface AssetCategoryMasterItem {
    id: number;
    brand: string;
    category_name: string;
    word_count: number;
    status: string;
    created_at?: string;
    updated_at?: string;
}

export interface AssetTypeMasterItem {
    id: number;
    brand: string;
    asset_type_name: string;
    word_count: number;
    dimensions?: string; // e.g., "1920x1080"
    file_size?: string; // e.g., "2.4 MB"
    file_formats?: string; // e.g., "JPEG, PNG, MP4"
    status: string;
    created_at?: string;
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
    // General Info
    competitor_name: string;
    website_url: string;
    domain?: string; // legacy
    primary_country?: string;
    industry?: string;
    sector?: string;
    services_offered?: string[]; // ['SEO Services', 'Content Marketing', 'Social Media Marketing', etc.]
    notes?: string;
    status: 'Active' | 'Inactive' | 'Archived' | string;
    // SEO & Benchmark Metrics
    da: number; // Domain Authority 0-100
    spam_score?: number; // 0-100
    estimated_monthly_traffic?: number | string;
    total_keywords_ranked?: number;
    total_backlinks?: number;
    primary_traffic_sources?: string[]; // ['Organic', 'Paid', 'Social', 'Referral']
    attachments?: string[]; // URLs to uploaded files
    // Legacy fields for backward compatibility
    region?: string;
    dr?: number;
    monthly_traffic?: number | string;
    total_keywords?: number;
    backlinks?: number;
    ranking_coverage?: number;
    created_at?: string;
    updated_at?: string;
    updated_on?: string;
}

export interface OKRItem {
    id: number;
    // Objective Details
    objective_title: string;
    objective_type?: 'Company' | 'Department' | 'Individual' | string;
    department?: string;
    owner_id?: number;
    owner_name?: string;
    cycle?: string;
    objective_description?: string;
    why_this_matters?: string;
    expected_outcome?: string;
    target_date?: string;
    alignment?: string;
    parent_okr_id?: number;
    parent_okr_title?: string;

    // Key Results
    key_results?: KeyResult[];

    // Governance & Review
    reviewer_id?: number;
    reviewer_name?: string;
    review_notes?: string;
    evidence_links?: string[];

    // Status & Progress
    status?: 'Draft' | 'Active' | 'Completed' | 'On Hold' | 'Archived' | string;
    progress?: number;

    // Metadata
    created_at?: string;
    updated_at?: string;
    updated_on?: string;

    // Legacy fields for backward compatibility
    objective?: string;
    type?: 'Company' | 'Department' | 'Individual' | string;
}

export interface KeyResult {
    id?: number;
    kr_title: string;
    kpi_category?: string;
    metric_name?: string;
    baseline_value?: number | string;
    target_value?: number | string;
    unit?: string;
    frequency?: 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly' | string;
    kr_owner_id?: number;
    kr_owner_name?: string;
    status?: 'Draft' | 'Active' | 'Completed' | 'On Hold' | string;
}

export interface UxIssue {
    id: number;
    title: string;
    url: string;
    issue_type: 'Button not clickable' | 'Rage clicks' | 'Form abandonment' | 'Scroll depth issue' | 'Dead clicks' | 'Element overlapping' | 'Layout shift' | 'Slow interaction' | string;
    device: 'Desktop' | 'Mobile' | 'Tablet' | string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    source: 'Microsoft Clarity' | 'Hotjar' | 'GA4 Engagement' | 'BrowserStack Test' | 'Manual Report' | string;
    status: 'Pending' | 'Assigned' | 'Dev Fix Applied' | 'In Progress' | 'Resolved' | 'Reopened' | string;
    description?: string;
    screenshot_url?: string;
    assigned_to_id?: number;
    assigned_to_name?: string;
    service_id?: number;
    service_name?: string;
    resolution_notes?: string;
    priority_score?: number;
    created_at?: string;
    updated_at?: string;
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

// --- Asset Usage Tracking Types ---
export interface AssetWebsiteUsage {
    id: number;
    asset_id: number;
    website_url: string;
    page_title?: string;
    status: 'active' | 'inactive';
    added_by?: number;
    created_at?: string;
    updated_at?: string;
}

export interface AssetSocialMediaUsage {
    id: number;
    asset_id: number;
    platform_name: string;
    post_url?: string;
    post_id?: string;
    status: 'Published' | 'Scheduled' | 'Draft' | 'Archived';
    engagement_impressions: number;
    engagement_clicks: number;
    engagement_shares: number;
    engagement_likes: number;
    engagement_comments: number;
    posted_at?: string;
    added_by?: number;
    created_at?: string;
    updated_at?: string;
}

export interface AssetBacklinkUsage {
    id: number;
    asset_id: number;
    domain_name: string;
    backlink_url?: string;
    anchor_text?: string;
    approval_status: 'Pending' | 'Approved' | 'Rejected';
    da_score?: number;
    submitted_at?: string;
    approved_at?: string;
    added_by?: number;
    created_at?: string;
    updated_at?: string;
}

export interface AssetEngagementMetrics {
    id?: number;
    asset_id: number;
    total_impressions: number;
    total_clicks: number;
    total_shares: number;
    total_likes: number;
    total_comments: number;
    ctr_percentage: number;
    performance_summary?: string;
    last_calculated_at?: string;
    created_at?: string;
    updated_at?: string;
}

export interface AssetUsageData {
    website_urls: AssetWebsiteUsage[];
    social_media_posts: AssetSocialMediaUsage[];
    backlink_submissions: AssetBacklinkUsage[];
    engagement_metrics: AssetEngagementMetrics;
}


// --- SEO Asset Module Types (12-Step Workflow) ---
export interface SeoAssetDomain {
    id?: number;
    seo_asset_id?: number;
    domain_name: string;
    domain_type?: string;
    url_posted?: string;
    seo_self_qc_status: 'Pass' | 'Fail' | 'Waiting';
    qa_status: 'Pending' | 'Approved' | 'Rejected';
    display_status: 'Approved' | 'Rejected' | 'Pending';
    backlink_source_id?: number;
    domain_authority?: number;
    spam_score?: number;
    created_at?: string;
    updated_at?: string;
}

export interface SeoAsset {
    id: number;
    name: string;
    application_type: 'seo';

    // Step 1: Asset ID Selection
    linked_asset_id?: number;

    // Step 2: Map Assets to Source Work
    linked_task_id?: number;
    linked_campaign_id?: number;
    linked_project_id?: number;
    linked_service_id?: number;
    linked_sub_service_id?: number;
    linked_repository_item_id?: number;

    // Step 3: Asset Classification
    asset_type?: string;
    sector_id?: string;
    industry_id?: string;

    // Step 4: SEO Metadata & Anchor Text
    seo_title?: string;
    seo_meta_title?: string;
    seo_description?: string;
    service_url?: string;
    blog_url?: string;
    anchor_text?: string;

    // Step 5: Keywords
    primary_keyword_id?: number;
    lsi_keywords?: number[];

    // Step 6: Domain Type & Domains
    domain_type?: string;
    seo_domains?: SeoAssetDomain[];

    // Step 8: Blog Content (conditional)
    blog_content?: string;

    // Step 9: Resource Files
    resource_files?: string[];

    // Step 10: Designer & Workflow
    assigned_team_members?: number[];
    created_by?: number;
    verified_by?: number;

    // Step 11: Versioning
    version_number?: string;
    version_history?: Array<{
        version: string;
        date: string;
        action: string;
        user_id?: number;
        qc_remarks?: string;
    }>;

    // Workflow & Status
    status?: 'Draft' | 'Pending QC Review' | 'QC Approved' | 'QC Rejected' | 'Published';
    workflow_stage?: 'Add' | 'In Progress' | 'Sent to QC' | 'Published' | 'In Rework';
    qc_status?: 'QC Pending' | 'Pass' | 'Fail' | 'Rework';
    qc_score?: number;
    qc_remarks?: string;
    qc_reviewer_id?: number;
    qc_reviewed_at?: string;
    rework_count?: number;
    linking_active?: boolean;

    // Timestamps
    submitted_by?: number;
    submitted_at?: string;
    created_at?: string;
    updated_at?: string;
}
