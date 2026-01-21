
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import { validateRequired, throwIfErrors } from '../utils/validation';
import { getSocket } from '../socket';

// Helper function to generate service code
const generateServiceCode = (serviceName: string, serviceId?: number): string => {
    // Format: SVC-XXXX (e.g., SVC-0001, SVC-0002)
    // Or use initials: WD-001 for Web Development
    const initials = serviceName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 3);

    const timestamp = Date.datetime('now').toString().slice(-4);
    return `${initials}-${timestamp}`;
};

// Helper function to generate sub-service code
const generateSubServiceCode = (subServiceName: string, parentServiceCode?: string): string => {
    // Format: PARENT-XXXX (e.g., WD-0001, WD-0002)
    const initials = subServiceName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

    const timestamp = Date.datetime('now').toString().slice(-3);
    return `${initials}-${timestamp}`;
};

// Helper function to parse JSON fields for services
const parseServiceRow = (row: any) => {
    const jsonArrayFields = [
        'industry_ids', 'country_ids', 'secondary_persona_ids', 'linked_campaign_ids',
        'h2_list', 'h3_list', 'h4_list', 'h5_list', 'internal_links', 'external_links',
        'image_alt_texts', 'focus_keywords', 'secondary_keywords', 'redirect_from_urls', 'faq_content',
        'linked_insights_ids', 'linked_assets_ids'
    ];
    const jsonObjectFields = ['social_meta'];

    const parsed = { ...row };
    jsonArrayFields.forEach(field => {
        if (parsed[field] && typeof parsed[field] === 'string') {
            try {
                parsed[field] = JSON.parse(parsed[field]);
            } catch (e) {
                parsed[field] = [];
            }
        } else if (!parsed[field]) {
            parsed[field] = [];
        }
    });
    jsonObjectFields.forEach(field => {
        if (parsed[field] && typeof parsed[field] === 'string') {
            try {
                parsed[field] = JSON.parse(parsed[field]);
            } catch (e) {
                parsed[field] = {};
            }
        } else if (!parsed[field]) {
            parsed[field] = {};
        }
    });
    return parsed;
};

// Helper function to parse JSON fields for sub-services
const parseSubServiceRow = (row: any) => {
    const jsonArrayFields = ['industry_ids', 'country_ids', 'h2_list', 'h3_list', 'h4_list', 'h5_list', 'focus_keywords', 'secondary_keywords', 'redirect_from_urls', 'faq_content'];
    const jsonObjectFields = ['social_meta'];

    const parsed = { ...row };
    jsonArrayFields.forEach(field => {
        if (parsed[field] && typeof parsed[field] === 'string') {
            try { parsed[field] = JSON.parse(parsed[field]); } catch (e) { parsed[field] = []; }
        } else if (!parsed[field]) { parsed[field] = []; }
    });
    jsonObjectFields.forEach(field => {
        if (parsed[field] && typeof parsed[field] === 'string') {
            try { parsed[field] = JSON.parse(parsed[field]); } catch (e) { parsed[field] = {}; }
        } else if (!parsed[field]) { parsed[field] = {}; }
    });
    return parsed;
};

// --- Services ---
export const getServices = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM services ORDER BY id ASC');
        const parsedRows = result.rows.map(parseServiceRow);
        res.status(200).json(parsedRows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Get sub-services by parent service ID
export const getSubServicesByParent = async (req: Request, res: Response) => {
    try {
        const { parentServiceId } = req.params;
        const result = await pool.query(
            'SELECT * FROM sub_services WHERE parent_service_id = ? ORDER BY id ASC',
            [parentServiceId]
        );
        const parsedRows = result.rows.map(parseSubServiceRow);
        res.status(200).json(parsedRows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createService = async (req: Request, res: Response) => {
    const {
        service_name, service_code, slug, full_url, menu_heading,
        short_tagline, service_description, industry_ids, country_ids,
        language, status,
        show_in_main_menu, show_in_footer_menu, menu_group, menu_position,
        breadcrumb_label, parent_menu_section, include_in_xml_sitemap,
        sitemap_priority, sitemap_changefreq,
        content_type, buyer_journey_stage, primary_persona_id, secondary_persona_ids,
        target_segment_notes, primary_cta_label, primary_cta_url, form_id, linked_campaign_ids,
        h1, h2_list, h3_list, h4_list, h5_list, body_content,
        internal_links, external_links, image_alt_texts, word_count, reading_time_minutes,
        meta_title, meta_description, focus_keywords, secondary_keywords, seo_score, ranking_summary,
        og_title, og_description, og_image_url, og_type, twitter_title, twitter_description, twitter_image_url,
        linkedin_title, linkedin_description, linkedin_image_url,
        facebook_title, facebook_description, facebook_image_url,
        instagram_title, instagram_description, instagram_image_url,
        social_meta,
        schema_type_id, robots_index, robots_follow, robots_custom, canonical_url,
        redirect_from_urls, hreflang_group_id, core_web_vitals_status, tech_seo_status,
        faq_section_enabled, faq_content,
        has_subservices, subservice_count, primary_subservice_id, featured_asset_id, asset_count, knowledge_topic_id,
        linked_insights_ids, linked_assets_ids,
        brand_id, business_unit, content_owner_id, created_by, version_number, change_log_link
    } = req.body;

    // Validate required fields
    const errors = validateRequired(req.body, ['service_name']);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        const finalServiceCode = service_code || generateServiceCode(service_name);
        const computedUrl = full_url || (slug ? `/services/${slug}` : '');
        const generatedCreatedAt = new Date().toISOString();
        const generatedCreatedBy = created_by || 1;

        const result = await pool.query(
            `INSERT INTO services (
                service_name, service_code, slug, full_url, menu_heading, short_tagline, service_description, 
                industry_ids, country_ids, language, status,
                show_in_main_menu, show_in_footer_menu, menu_group, menu_position, breadcrumb_label, parent_menu_section, 
                include_in_xml_sitemap, sitemap_priority, sitemap_changefreq,
                content_type, buyer_journey_stage, primary_persona_id, secondary_persona_ids, target_segment_notes,
                primary_cta_label, primary_cta_url, form_id, linked_campaign_ids,
                h1, h2_list, h3_list, h4_list, h5_list, body_content, internal_links, external_links, image_alt_texts, 
                word_count, reading_time_minutes,
                meta_title, meta_description, focus_keywords, secondary_keywords, seo_score, ranking_summary,
                og_title, og_description, og_image_url, og_type, twitter_title, twitter_description, twitter_image_url,
                linkedin_title, linkedin_description, linkedin_image_url,
                facebook_title, facebook_description, facebook_image_url,
                instagram_title, instagram_description, instagram_image_url,
                social_meta, schema_type_id, robots_index, robots_follow, robots_custom, canonical_url, redirect_from_urls,
                hreflang_group_id, core_web_vitals_status, tech_seo_status, faq_section_enabled, faq_content,
                has_subservices, subservice_count, primary_subservice_id, featured_asset_id, asset_count, knowledge_topic_id,
                linked_insights_ids, linked_assets_ids,
                brand_id, business_unit, content_owner_id, created_by, created_at, updated_by, updated_at, version_number, change_log_link
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )`,
            [
                service_name, finalServiceCode, slug, computedUrl, menu_heading, short_tagline, service_description,
                JSON.stringify(industry_ids || []), JSON.stringify(country_ids || []), language, status,
                show_in_main_menu || 0, show_in_footer_menu || 0, menu_group, menu_position || 0, breadcrumb_label, parent_menu_section,
                include_in_xml_sitemap || 1, sitemap_priority || 0.8, sitemap_changefreq || 'monthly',
                content_type, buyer_journey_stage, primary_persona_id, JSON.stringify(secondary_persona_ids || []), target_segment_notes,
                primary_cta_label, primary_cta_url, form_id, JSON.stringify(linked_campaign_ids || []),
                h1, JSON.stringify(h2_list || []), JSON.stringify(h3_list || []), JSON.stringify(h4_list || []), JSON.stringify(h5_list || []), body_content,
                JSON.stringify(internal_links || []), JSON.stringify(external_links || []), JSON.stringify(image_alt_texts || []), word_count || 0, reading_time_minutes || 0,
                meta_title, meta_description, JSON.stringify(focus_keywords || []), JSON.stringify(secondary_keywords || []), seo_score || 0, ranking_summary,
                og_title, og_description, og_image_url, og_type, twitter_title, twitter_description, twitter_image_url,
                linkedin_title, linkedin_description, linkedin_image_url,
                facebook_title, facebook_description, facebook_image_url,
                instagram_title, instagram_description, instagram_image_url,
                JSON.stringify(social_meta || {}), schema_type_id, robots_index, robots_follow, robots_custom, canonical_url, JSON.stringify(redirect_from_urls || []),
                hreflang_group_id, core_web_vitals_status, tech_seo_status, faq_section_enabled || 0, JSON.stringify(faq_content || []),
                has_subservices || 0, subservice_count || 0, primary_subservice_id || 0, featured_asset_id || 0, asset_count || 0, knowledge_topic_id || 0,
                JSON.stringify(linked_insights_ids || []), JSON.stringify(linked_assets_ids || []),
                brand_id, business_unit, content_owner_id, generatedCreatedBy, generatedCreatedAt, generatedCreatedBy, generatedCreatedAt, version_number || 1, change_log_link
            ]
        );

        const newItem = parseServiceRow(result.rows[0]);
        getSocket().emit('service_created', newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        console.error('Create service error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateService = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        service_name, service_code, slug, full_url, menu_heading,
        short_tagline, service_description, industry_ids, country_ids,
        language, status,
        show_in_main_menu, show_in_footer_menu, menu_group, menu_position,
        breadcrumb_label, parent_menu_section, include_in_xml_sitemap,
        sitemap_priority, sitemap_changefreq,
        content_type, category, buyer_journey_stage, primary_persona_id, secondary_persona_ids,
        target_segment_notes, primary_cta_label, primary_cta_url, form_id, linked_campaign_ids,
        h1, h2_list, h3_list, h4_list, h5_list, body_content,
        internal_links, external_links, image_alt_texts, word_count, reading_time_minutes,
        meta_title, meta_description, focus_keywords, secondary_keywords, seo_score, ranking_summary,
        og_title, og_description, og_image_url, og_type, twitter_title, twitter_description, twitter_image_url,
        linkedin_title, linkedin_description, linkedin_image_url,
        facebook_title, facebook_description, facebook_image_url,
        instagram_title, instagram_description, instagram_image_url,
        social_meta, schema_type_id, robots_index, robots_follow, robots_custom, canonical_url,
        redirect_from_urls, hreflang_group_id, core_web_vitals_status, tech_seo_status,
        faq_section_enabled, faq_content,
        has_subservices, subservice_count, primary_subservice_id, featured_asset_id, asset_count, knowledge_topic_id,
        linked_insights_ids, linked_assets_ids,
        brand_id, business_unit, content_owner_id, updated_by, version_number, change_log_link
    } = req.body;

    // AUTO-GENERATE: Updated timestamp and auto-increment version
    const generatedUpdatedAt = new Date().toISOString();
    const generatedUpdatedBy = updated_by || 1; // Fallback to admin user (ID 1)

    // Fetch current version to auto-increment
    let newVersionNumber = version_number || 1;
    try {
        const versionResult = await pool.query('SELECT version_number FROM services WHERE id = ?', [id]);
        if (versionResult.rows.length > 0 && versionResult.rows[0].version_number) {
            newVersionNumber = (versionResult.rows[0].version_number || 1) + 1;
        }
    } catch (e) {
        console.warn('Could not fetch current version, using provided or default');
    }

    const normalizedParentMenuSection = typeof parent_menu_section === 'string'
        ? parent_menu_section.trim()
        : parent_menu_section;

    // --- URL Validation & Normalization for Update ---
    let computedUrl = full_url;
    if (computedUrl && !computedUrl.startsWith('/services/')) {
        computedUrl = computedUrl.startsWith('/') ? `/services${computedUrl}` : `/services/${computedUrl}`;
    }

    try {
        const result = await pool.query(
            `UPDATE services SET 
                service_name=COALESCE(?, service_name), service_code=COALESCE(?, service_code), slug=COALESCE(?, slug), full_url=COALESCE(?, full_url),
                menu_heading=COALESCE(?, menu_heading), short_tagline=COALESCE(?, short_tagline), service_description=COALESCE(?, service_description),
                industry_ids=COALESCE(?, industry_ids), country_ids=COALESCE(?, country_ids), language=COALESCE(?, language), status=COALESCE(?, status),
                show_in_main_menu=COALESCE(?, show_in_main_menu), show_in_footer_menu=COALESCE(?, show_in_footer_menu), menu_group=COALESCE(?, menu_group),
                menu_position=COALESCE(?, menu_position), breadcrumb_label=COALESCE(?, breadcrumb_label), parent_menu_section=COALESCE(?, parent_menu_section),
                include_in_xml_sitemap=COALESCE(?, include_in_xml_sitemap), sitemap_priority=COALESCE(?, sitemap_priority), sitemap_changefreq=COALESCE(?, sitemap_changefreq),
                content_type=COALESCE(?, content_type), category=COALESCE(?, category), buyer_journey_stage=COALESCE(?, buyer_journey_stage), primary_persona_id=COALESCE(?, primary_persona_id),
                secondary_persona_ids=COALESCE(?, secondary_persona_ids), target_segment_notes=COALESCE(?, target_segment_notes), primary_cta_label=COALESCE(?, primary_cta_label),
                primary_cta_url=COALESCE(?, primary_cta_url), form_id=COALESCE(?, form_id), linked_campaign_ids=COALESCE(?, linked_campaign_ids),
                h1=COALESCE(?, h1), h2_list=COALESCE(?, h2_list), h3_list=COALESCE(?, h3_list), h4_list=COALESCE(?, h4_list), h5_list=COALESCE(?, h5_list),
                body_content=COALESCE(?, body_content), internal_links=COALESCE(?, internal_links), external_links=COALESCE(?, external_links),
                image_alt_texts=COALESCE(?, image_alt_texts), word_count=COALESCE(?, word_count), reading_time_minutes=COALESCE(?, reading_time_minutes),
                meta_title=COALESCE(?, meta_title), meta_description=COALESCE(?, meta_description), focus_keywords=COALESCE(?, focus_keywords),
                secondary_keywords=COALESCE(?, secondary_keywords), seo_score=COALESCE(?, seo_score), ranking_summary=COALESCE(?, ranking_summary),
                og_title=COALESCE(?, og_title), og_description=COALESCE(?, og_description), og_image_url=COALESCE(?, og_image_url),
                og_type=COALESCE(?, og_type), twitter_title=COALESCE(?, twitter_title), twitter_description=COALESCE(?, twitter_description), twitter_image_url=COALESCE(?, twitter_image_url),
                linkedin_title=COALESCE(?, linkedin_title), linkedin_description=COALESCE(?, linkedin_description), linkedin_image_url=COALESCE(?, linkedin_image_url),
                facebook_title=COALESCE(?, facebook_title), facebook_description=COALESCE(?, facebook_description), facebook_image_url=COALESCE(?, facebook_image_url),
                instagram_title=COALESCE(?, instagram_title), instagram_description=COALESCE(?, instagram_description), instagram_image_url=COALESCE(?, instagram_image_url),
                schema_type_id=COALESCE(?, schema_type_id), robots_index=COALESCE(?, robots_index), robots_follow=COALESCE(?, robots_follow),
                robots_custom=COALESCE(?, robots_custom), canonical_url=COALESCE(?, canonical_url), redirect_from_urls=COALESCE(?, redirect_from_urls),
                hreflang_group_id=COALESCE(?, hreflang_group_id), core_web_vitals_status=COALESCE(?, core_web_vitals_status), tech_seo_status=COALESCE(?, tech_seo_status),
                faq_section_enabled=COALESCE(?, faq_section_enabled), faq_content=COALESCE(?, faq_content), has_subservices=COALESCE(?, has_subservices),
                subservice_count=COALESCE(?, subservice_count), primary_subservice_id=COALESCE(?, primary_subservice_id), featured_asset_id=COALESCE(?, featured_asset_id),
                asset_count=COALESCE(?, asset_count), knowledge_topic_id=COALESCE(?, knowledge_topic_id), linked_insights_ids=COALESCE(?, linked_insights_ids),
                linked_assets_ids=COALESCE(?, linked_assets_ids), brand_id=COALESCE(?, brand_id),
                business_unit=COALESCE(?, business_unit), content_owner_id=COALESCE(?, content_owner_id), updated_by=?,
                     version_number=?, change_log_link=COALESCE(?, change_log_link), updated_at=?, social_meta=COALESCE(?, social_meta)
                 WHERE id=?`,
            [
                service_name, service_code, slug, computedUrl, menu_heading, short_tagline, service_description,
                JSON.stringify(industry_ids), JSON.stringify(country_ids), language, status,
                show_in_main_menu, show_in_footer_menu, menu_group, menu_position, breadcrumb_label, normalizedParentMenuSection,
                include_in_xml_sitemap, sitemap_priority, sitemap_changefreq,
                content_type, category, buyer_journey_stage, primary_persona_id, JSON.stringify(secondary_persona_ids), target_segment_notes,
                primary_cta_label, primary_cta_url, form_id, JSON.stringify(linked_campaign_ids),
                h1, JSON.stringify(h2_list), JSON.stringify(h3_list), JSON.stringify(h4_list), JSON.stringify(h5_list), body_content,
                JSON.stringify(internal_links), JSON.stringify(external_links), JSON.stringify(image_alt_texts), word_count, reading_time_minutes,
                meta_title, meta_description, JSON.stringify(focus_keywords), JSON.stringify(secondary_keywords), seo_score, ranking_summary,
                og_title, og_description, og_image_url, og_type, twitter_title, twitter_description, twitter_image_url,
                linkedin_title, linkedin_description, linkedin_image_url,
                facebook_title, facebook_description, facebook_image_url,
                instagram_title, instagram_description, instagram_image_url,
                schema_type_id, robots_index, robots_follow, robots_custom, canonical_url, JSON.stringify(redirect_from_urls),
                hreflang_group_id, core_web_vitals_status, tech_seo_status, faq_section_enabled, JSON.stringify(faq_content),
                has_subservices, subservice_count, primary_subservice_id, featured_asset_id, asset_count, knowledge_topic_id,
                JSON.stringify(linked_insights_ids || []), JSON.stringify(linked_assets_ids || []),
                brand_id, business_unit, content_owner_id, generatedUpdatedBy, newVersionNumber, change_log_link, generatedUpdatedAt, JSON.stringify(social_meta || {}), id
            ]
        );
        const updatedItem = parseServiceRow(result.rows[0]);
        getSocket().emit('service_updated', updatedItem);
        res.status(200).json(updatedItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteService = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM services WHERE id = ?', [req.params.id]);
        getSocket().emit('service_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- Sub-Services ---
export const getSubServices = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM sub_services ORDER BY id ASC');
        const parsedRows = result.rows.map(parseSubServiceRow);
        res.status(200).json(parsedRows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createSubService = async (req: Request, res: Response) => {
    const {
        // Core fields
        sub_service_name, parent_service_id, slug, full_url, description, status,
        menu_heading, short_tagline, language, industry_ids, country_ids,
        // Content
        h1, h2_list, h3_list, h4_list, h5_list, body_content,
        word_count, reading_time_minutes,
        // SEO
        meta_title, meta_description, focus_keywords, secondary_keywords, seo_score, ranking_summary,
        // SMM
        og_title, og_description, og_image_url, og_type, twitter_title, twitter_description, twitter_image_url,
        linkedin_title, linkedin_description, linkedin_image_url,
        facebook_title, facebook_description, facebook_image_url,
        instagram_title, instagram_description, instagram_image_url,
        // Navigation
        menu_position, breadcrumb_label, include_in_xml_sitemap, sitemap_priority, sitemap_changefreq,
        // Strategic
        content_type, buyer_journey_stage, primary_cta_label, primary_cta_url,
        // Technical
        robots_index, robots_follow, robots_custom, canonical_url, schema_type_id,
        redirect_from_urls, hreflang_group_id, core_web_vitals_status, tech_seo_status,
        faq_section_enabled, faq_content,
        // Linking
        linked_insights_ids, linked_assets_ids,
        // Governance
        brand_id, content_owner_id, created_by, created_at, updated_by, version_number, change_log_link,
        social_meta, assets_linked, working_on_by
    } = req.body;

    // URL normalization - ensure it follows parent service pattern
    let computedUrl = full_url;
    if (!computedUrl && parent_service_id && slug) {
        const parentResult = await pool.query('SELECT slug FROM services WHERE id = ?', [parent_service_id]);
        const parentSlug = parentResult.rows[0]?.slug || 'service';
        computedUrl = `/services/${parentSlug}/${slug}`;
    }

    try {
        // AUTO-GENERATE: Sub-Service Code if not provided
        const sub_service_code = req.body.sub_service_code || generateSubServiceCode(sub_service_name);

        const result = await pool.query(
            `INSERT INTO sub_services (
                sub_service_name, sub_service_code, parent_service_id, slug, full_url, description, status,
                menu_heading, short_tagline, language, industry_ids, country_ids,
                h1, h2_list, h3_list, h4_list, h5_list, body_content,
                word_count, reading_time_minutes,
                meta_title, meta_description, focus_keywords, secondary_keywords, seo_score, ranking_summary,
                og_title, og_description, og_image_url, og_type, twitter_title, twitter_description, twitter_image_url,
                linkedin_title, linkedin_description, linkedin_image_url,
                facebook_title, facebook_description, facebook_image_url,
                instagram_title, instagram_description, instagram_image_url,
                menu_position, breadcrumb_label, include_in_xml_sitemap, sitemap_priority, sitemap_changefreq,
                content_type, buyer_journey_stage, primary_cta_label, primary_cta_url,
                robots_index, robots_follow, robots_custom, canonical_url, schema_type_id,
                redirect_from_urls, hreflang_group_id, core_web_vitals_status, tech_seo_status,
                faq_section_enabled, faq_content,
                linked_insights_ids, linked_assets_ids,
                brand_id, content_owner_id, created_by, created_at, updated_by, version_number, change_log_link,
                social_meta, assets_linked, working_on_by, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now')
            )`,
            [
                sub_service_name, sub_service_code, parent_service_id, slug, computedUrl, description, status,
                menu_heading, short_tagline, language || 'en', JSON.stringify(industry_ids || []), JSON.stringify(country_ids || []),
                h1, JSON.stringify(h2_list || []), JSON.stringify(h3_list || []), JSON.stringify(h4_list || []), JSON.stringify(h5_list || []), body_content,
                word_count || 0, reading_time_minutes || 0,
                meta_title, meta_description, JSON.stringify(focus_keywords || []), JSON.stringify(secondary_keywords || []), seo_score || 0, ranking_summary,
                og_title, og_description, og_image_url, og_type || 'website', twitter_title, twitter_description, twitter_image_url,
                linkedin_title, linkedin_description, linkedin_image_url,
                facebook_title, facebook_description, facebook_image_url,
                instagram_title, instagram_description, instagram_image_url,
                menu_position || 0, breadcrumb_label, include_in_xml_sitemap ?? true, sitemap_priority || 0.8, sitemap_changefreq || 'monthly',
                content_type, buyer_journey_stage, primary_cta_label, primary_cta_url,
                robots_index || 'index', robots_follow || 'follow', robots_custom, canonical_url, schema_type_id || 'Service',
                JSON.stringify(redirect_from_urls || []), hreflang_group_id, core_web_vitals_status, tech_seo_status,
                faq_section_enabled || false, JSON.stringify(faq_content || []),
                JSON.stringify(linked_insights_ids || []), JSON.stringify(linked_assets_ids || []),
                brand_id || 0, content_owner_id || 0, created_by || null, created_at || null, updated_by || null, version_number || 1, change_log_link,
                JSON.stringify(social_meta || {}), assets_linked || 0, working_on_by || null
            ]
        );

        const newItem = parseSubServiceRow(result.rows[0]);
        getSocket().emit('sub_service_created', newItem);

        // --- Auto-Update Parent Service Count ---
        if (parent_service_id) {
            await pool.query(
                `UPDATE services 
                 SET subservice_count = (SELECT COUNT(*) FROM sub_services WHERE parent_service_id = ?),
                     has_subservices = true,
                     updated_at = datetime('now')
                 WHERE id = ?`,
                [parent_service_id]
            );
            const parentResult = await pool.query('SELECT * FROM services WHERE id = ?', [parent_service_id]);
            if (parentResult.rows.length > 0) {
                getSocket().emit('service_updated', parseServiceRow(parentResult.rows[0]));
            }
        }

        res.status(201).json(newItem);
    } catch (error: any) {
        console.error('Error creating sub-service:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateSubService = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        // Core fields
        sub_service_name, parent_service_id, slug, full_url, description, status,
        menu_heading, short_tagline, language, industry_ids, country_ids,
        // Content
        h1, h2_list, h3_list, h4_list, h5_list, body_content,
        word_count, reading_time_minutes,
        // SEO
        meta_title, meta_description, focus_keywords, secondary_keywords, seo_score, ranking_summary,
        // SMM
        og_title, og_description, og_image_url, og_type, twitter_title, twitter_description, twitter_image_url,
        linkedin_title, linkedin_description, linkedin_image_url,
        facebook_title, facebook_description, facebook_image_url,
        instagram_title, instagram_description, instagram_image_url,
        // Navigation
        menu_position, breadcrumb_label, include_in_xml_sitemap, sitemap_priority, sitemap_changefreq,
        // Strategic
        content_type, buyer_journey_stage, primary_cta_label, primary_cta_url,
        // Technical
        robots_index, robots_follow, robots_custom, canonical_url, schema_type_id,
        redirect_from_urls, hreflang_group_id, core_web_vitals_status, tech_seo_status,
        faq_section_enabled, faq_content,
        // Linking
        linked_insights_ids, linked_assets_ids,
        // Governance
        brand_id, content_owner_id, updated_by, version_number, change_log_link,
        social_meta, assets_linked, working_on_by
    } = req.body;

    // URL normalization
    let computedUrl = full_url;
    if (computedUrl && parent_service_id) {
        const parentResult = await pool.query('SELECT slug FROM services WHERE id = ?', [parent_service_id]);
        const parentSlug = parentResult.rows[0]?.slug || 'service';
        if (!computedUrl.startsWith(`/services/${parentSlug}/`)) {
            computedUrl = `/services/${parentSlug}/${slug || ''}`;
        }
    }

    // AUTO-GENERATE: Updated timestamp and auto-increment version
    const generatedUpdatedAt = new Date().toISOString();
    const generatedUpdatedBy = updated_by || 1;
    let newVersionNumber = version_number || 1;
    try {
        const versionResult = await pool.query('SELECT version_number FROM sub_services WHERE id = ?', [id]);
        if (versionResult.rows.length > 0 && versionResult.rows[0].version_number) {
            newVersionNumber = (versionResult.rows[0].version_number || 1) + 1;
        }
    } catch (e) {
        console.warn('Could not fetch current version, using provided or default');
    }

    try {
        const result = await pool.query(
            `UPDATE sub_services SET 
                sub_service_name=COALESCE(?, sub_service_name), parent_service_id=COALESCE(?, parent_service_id), 
                slug=COALESCE(?, slug), full_url=COALESCE(?, full_url), description=COALESCE(?, description), status=COALESCE(?, status),
                menu_heading=COALESCE(?, menu_heading), short_tagline=COALESCE(?, short_tagline), language=COALESCE(?, language),
                industry_ids=COALESCE(?, industry_ids), country_ids=COALESCE(?, country_ids),
                h1=COALESCE(?, h1), h2_list=COALESCE(?, h2_list), h3_list=COALESCE(?, h3_list), h4_list=COALESCE(?, h4_list), h5_list=COALESCE(?, h5_list),
                body_content=COALESCE(?, body_content), word_count=COALESCE(?, word_count), reading_time_minutes=COALESCE(?, reading_time_minutes),
                meta_title=COALESCE(?, meta_title), meta_description=COALESCE(?, meta_description), focus_keywords=COALESCE(?, focus_keywords),
                secondary_keywords=COALESCE(?, secondary_keywords), seo_score=COALESCE(?, seo_score), ranking_summary=COALESCE(?, ranking_summary),
                og_title=COALESCE(?, og_title), og_description=COALESCE(?, og_description), og_image_url=COALESCE(?, og_image_url),
                og_type=COALESCE(?, og_type), twitter_title=COALESCE(?, twitter_title), twitter_description=COALESCE(?, twitter_description),
                twitter_image_url=COALESCE(?, twitter_image_url), linkedin_title=COALESCE(?, linkedin_title), linkedin_description=COALESCE(?, linkedin_description),
                linkedin_image_url=COALESCE(?, linkedin_image_url), facebook_title=COALESCE(?, facebook_title), facebook_description=COALESCE(?, facebook_description),
                facebook_image_url=COALESCE(?, facebook_image_url), instagram_title=COALESCE(?, instagram_title), instagram_description=COALESCE(?, instagram_description),
                instagram_image_url=COALESCE(?, instagram_image_url),
                menu_position=COALESCE(?, menu_position), breadcrumb_label=COALESCE(?, breadcrumb_label),
                include_in_xml_sitemap=COALESCE(?, include_in_xml_sitemap), sitemap_priority=COALESCE(?, sitemap_priority), sitemap_changefreq=COALESCE(?, sitemap_changefreq),
                content_type=COALESCE(?, content_type), buyer_journey_stage=COALESCE(?, buyer_journey_stage),
                primary_cta_label=COALESCE(?, primary_cta_label), primary_cta_url=COALESCE(?, primary_cta_url),
                robots_index=COALESCE(?, robots_index), robots_follow=COALESCE(?, robots_follow), robots_custom=COALESCE(?, robots_custom),
                canonical_url=COALESCE(?, canonical_url), schema_type_id=COALESCE(?, schema_type_id),
                redirect_from_urls=COALESCE(?, redirect_from_urls), hreflang_group_id=COALESCE(?, hreflang_group_id),
                core_web_vitals_status=COALESCE(?, core_web_vitals_status), tech_seo_status=COALESCE(?, tech_seo_status),
                faq_section_enabled=COALESCE(?, faq_section_enabled), faq_content=COALESCE(?, faq_content),
                linked_insights_ids=COALESCE(?, linked_insights_ids), linked_assets_ids=COALESCE(?, linked_assets_ids),
                brand_id=COALESCE(?, brand_id), content_owner_id=COALESCE(?, content_owner_id),
                updated_by=?, version_number=?, change_log_link=COALESCE(?, change_log_link),
                social_meta=COALESCE(?, social_meta), assets_linked=COALESCE(?, assets_linked), working_on_by=COALESCE(?, working_on_by), updated_at=?
            WHERE id=?`,
            [
                sub_service_name, parent_service_id, slug, computedUrl, description, status,
                menu_heading, short_tagline, language, JSON.stringify(industry_ids), JSON.stringify(country_ids),
                h1, JSON.stringify(h2_list), JSON.stringify(h3_list), JSON.stringify(h4_list), JSON.stringify(h5_list), body_content,
                word_count, reading_time_minutes,
                meta_title, meta_description, JSON.stringify(focus_keywords), JSON.stringify(secondary_keywords), seo_score, ranking_summary,
                og_title, og_description, og_image_url, og_type, twitter_title, twitter_description, twitter_image_url,
                linkedin_title, linkedin_description, linkedin_image_url, facebook_title, facebook_description, facebook_image_url,
                instagram_title, instagram_description, instagram_image_url,
                menu_position, breadcrumb_label, include_in_xml_sitemap, sitemap_priority, sitemap_changefreq,
                content_type, buyer_journey_stage, primary_cta_label, primary_cta_url,
                robots_index, robots_follow, robots_custom, canonical_url, schema_type_id,
                JSON.stringify(redirect_from_urls), hreflang_group_id, core_web_vitals_status, tech_seo_status,
                faq_section_enabled, JSON.stringify(faq_content),
                JSON.stringify(linked_insights_ids || []), JSON.stringify(linked_assets_ids || []),
                brand_id, content_owner_id, generatedUpdatedBy, newVersionNumber, change_log_link,
                JSON.stringify(social_meta || {}), assets_linked, working_on_by || null, generatedUpdatedAt,
                id
            ]
        );

        const updatedItem = parseSubServiceRow(result.rows[0]);
        getSocket().emit('sub_service_updated', updatedItem);

        if (updatedItem.parent_service_id) {
            await pool.query(
                `UPDATE services 
                 SET subservice_count = (SELECT COUNT(*) FROM sub_services WHERE parent_service_id = ?),
            has_subservices = (SELECT COUNT(*) > 0 FROM sub_services WHERE parent_service_id = ?),
        updated_at = datetime('now')
                 WHERE id = ?`,
                [updatedItem.parent_service_id]
            );
            const parentResult = await pool.query('SELECT * FROM services WHERE id = ?', [updatedItem.parent_service_id]);
            if (parentResult.rows.length > 0) {
                getSocket().emit('service_updated', parseServiceRow(parentResult.rows[0]));
            }
        }

        res.status(200).json(updatedItem);
    } catch (error: any) {
        console.error('Error updating sub-service:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteSubService = async (req: Request, res: Response) => {
    try {
        // Get parent ID before deleting
        const check = await pool.query('SELECT parent_service_id FROM sub_services WHERE id = ?', [req.params.id]);
        const parentId = check.rows[0]?.parent_service_id;

        await pool.query('DELETE FROM sub_services WHERE id = ?', [req.params.id]);
        getSocket().emit('sub_service_deleted', { id: req.params.id });

        // Update Parent Count
        if (parentId) {
            await pool.query(
                `UPDATE services 
                 SET subservice_count = (SELECT COUNT(*) FROM sub_services WHERE parent_service_id = ?),
        has_subservices = (SELECT COUNT(*) > 0 FROM sub_services WHERE parent_service_id = ?),
        updated_at = datetime('now')
                 WHERE id = ?`,
                [parentId]
            );
            const parentResult = await pool.query('SELECT * FROM services WHERE id = ?', [parentId]);
            if (parentResult.rows.length > 0) {
                getSocket().emit('service_updated', parentResult.rows[0]);
            }
        }

        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
