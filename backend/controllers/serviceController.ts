
import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
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

    const timestamp = Date.now().toString().slice(-4);
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

    const timestamp = Date.now().toString().slice(-3);
    return `${initials}-${timestamp}`;
};

// Helper function to parse JSON fields for services
const parseServiceRow = (row: any) => {
    const jsonArrayFields = [
        'industry_ids', 'country_ids', 'secondary_persona_ids', 'linked_campaign_ids',
        'h2_list', 'h3_list', 'h4_list', 'h5_list', 'internal_links', 'external_links',
        'image_alt_texts', 'focus_keywords', 'secondary_keywords', 'redirect_from_urls', 'faq_content'
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
export const getServices = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM services ORDER BY id ASC');
        const parsedRows = result.rows.map(parseServiceRow);
        res.status(200).json(parsedRows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// Get sub-services by parent service ID
export const getSubServicesByParent = async (req: any, res: any) => {
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

export const createService = async (req: any, res: any) => {
    // Full destructuring of all 9 blocks
    const {
        service_name, service_code, slug, full_url, menu_heading,
        short_tagline, service_description, industry_ids, country_ids,
        language, status,
        // Navigation
        show_in_main_menu, show_in_footer_menu, menu_group, menu_position,
        breadcrumb_label, parent_menu_section, include_in_xml_sitemap,
        sitemap_priority, sitemap_changefreq,
        // Strategic
        content_type, buyer_journey_stage, primary_persona_id, secondary_persona_ids,
        target_segment_notes, primary_cta_label, primary_cta_url, form_id, linked_campaign_ids,
        // Content
        h1, h2_list, h3_list, h4_list, h5_list, body_content,
        internal_links, external_links, image_alt_texts, word_count, reading_time_minutes,
        // SEO
        meta_title, meta_description, focus_keywords, secondary_keywords, seo_score, ranking_summary,
        // SMM
        og_title, og_description, og_image_url, og_type, twitter_title, twitter_description, twitter_image_url,
        linkedin_title, linkedin_description, linkedin_image_url,
        facebook_title, facebook_description, facebook_image_url,
        instagram_title, instagram_description, instagram_image_url,
        social_meta,
        // Technical
        schema_type_id, robots_index, robots_follow, robots_custom, canonical_url,
        redirect_from_urls, hreflang_group_id, core_web_vitals_status, tech_seo_status,
        faq_section_enabled, faq_content,
        // Linking
        has_subservices, subservice_count, primary_subservice_id, featured_asset_id, asset_count, knowledge_topic_id,
        // Governance
        brand_id, business_unit, content_owner_id, created_by, version_number, change_log_link
    } = req.body;

    // AUTO-GENERATE: Timestamps and User Tracking
    const generatedCreatedAt = new Date().toISOString();
    const generatedCreatedBy = created_by || 1; // Fallback to admin user (ID 1) if not provided
    const generatedVersionNumber = version_number || 1;

    const normalizedParentMenuSection = typeof parent_menu_section === 'string'
        ? parent_menu_section.trim()
        : parent_menu_section;

    // --- URL Validation & Normalization ---
    let computedUrl = full_url;
    if (!computedUrl) {
        // Auto-generate if missing
        computedUrl = slug ? `/services/${slug}` : '';
    } else {
        // Enforce standard prefix
        if (!computedUrl.startsWith('/services/')) {
            // Handle leading slash presence
            computedUrl = computedUrl.startsWith('/') ? `/services${computedUrl}` : `/services/${computedUrl}`;
        }
    }

    try {
        // AUTO-GENERATE: Service Code if not provided
        const finalServiceCode = service_code || generateServiceCode(service_name);

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
                brand_id, business_unit, content_owner_id, created_by, created_at, updated_by, updated_at, version_number, change_log_link
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, 
                $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50,
                $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66, $67, $68, $69, $70, $71, $72, $73, $74, $75, $76, $77, $78, $79, $80, $81, $82, $83, $84, $85, $86, $87, $88, $89, $90, $91, $92, $93, $94, $95
            ) RETURNING *`,
            [
                service_name, finalServiceCode, slug, computedUrl, menu_heading, short_tagline, service_description,
                JSON.stringify(industry_ids || []), JSON.stringify(country_ids || []), language, status,
                show_in_main_menu || false, show_in_footer_menu || false, menu_group, menu_position || 0, breadcrumb_label, normalizedParentMenuSection,
                include_in_xml_sitemap || true, sitemap_priority || 0.8, sitemap_changefreq || 'monthly',
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
                hreflang_group_id, core_web_vitals_status, tech_seo_status, faq_section_enabled || false, JSON.stringify(faq_content || []),
                has_subservices || false, subservice_count || 0, primary_subservice_id || 0, featured_asset_id || 0, asset_count || 0, knowledge_topic_id || 0,
                brand_id, business_unit, content_owner_id, generatedCreatedBy, generatedCreatedAt, generatedCreatedBy, generatedCreatedAt, generatedVersionNumber, change_log_link,
                JSON.stringify(social_meta || {})
            ]
        );
        const newItem = parseServiceRow(result.rows[0]);
        getSocket().emit('service_created', newItem);
        res.status(201).json(newItem);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const updateService = async (req: any, res: any) => {
    const { id } = req.params;
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
        social_meta, schema_type_id, robots_index, robots_follow, robots_custom, canonical_url,
        redirect_from_urls, hreflang_group_id, core_web_vitals_status, tech_seo_status,
        faq_section_enabled, faq_content,
        has_subservices, subservice_count, primary_subservice_id, featured_asset_id, asset_count, knowledge_topic_id,
        brand_id, business_unit, content_owner_id, updated_by, version_number, change_log_link
    } = req.body;

    // AUTO-GENERATE: Updated timestamp and auto-increment version
    const generatedUpdatedAt = new Date().toISOString();
    const generatedUpdatedBy = updated_by || 1; // Fallback to admin user (ID 1)

    // Fetch current version to auto-increment
    let newVersionNumber = version_number || 1;
    try {
        const versionResult = await pool.query('SELECT version_number FROM services WHERE id = $1', [id]);
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
                service_name=COALESCE($1, service_name), service_code=COALESCE($2, service_code), slug=COALESCE($3, slug), full_url=COALESCE($4, full_url),
                menu_heading=COALESCE($5, menu_heading), short_tagline=COALESCE($6, short_tagline), service_description=COALESCE($7, service_description),
                industry_ids=COALESCE($8, industry_ids), country_ids=COALESCE($9, country_ids), language=COALESCE($10, language), status=COALESCE($11, status),
                show_in_main_menu=COALESCE($12, show_in_main_menu), show_in_footer_menu=COALESCE($13, show_in_footer_menu), menu_group=COALESCE($14, menu_group),
                menu_position=COALESCE($15, menu_position), breadcrumb_label=COALESCE($16, breadcrumb_label), parent_menu_section=COALESCE($17, parent_menu_section),
                include_in_xml_sitemap=COALESCE($18, include_in_xml_sitemap), sitemap_priority=COALESCE($19, sitemap_priority), sitemap_changefreq=COALESCE($20, sitemap_changefreq),
                content_type=COALESCE($21, content_type), buyer_journey_stage=COALESCE($22, buyer_journey_stage), primary_persona_id=COALESCE($23, primary_persona_id),
                secondary_persona_ids=COALESCE($24, secondary_persona_ids), target_segment_notes=COALESCE($25, target_segment_notes), primary_cta_label=COALESCE($26, primary_cta_label),
                primary_cta_url=COALESCE($27, primary_cta_url), form_id=COALESCE($28, form_id), linked_campaign_ids=COALESCE($29, linked_campaign_ids),
                h1=COALESCE($30, h1), h2_list=COALESCE($31, h2_list), h3_list=COALESCE($32, h3_list), h4_list=COALESCE($33, h4_list), h5_list=COALESCE($34, h5_list),
                body_content=COALESCE($35, body_content), internal_links=COALESCE($36, internal_links), external_links=COALESCE($37, external_links),
                image_alt_texts=COALESCE($38, image_alt_texts), word_count=COALESCE($39, word_count), reading_time_minutes=COALESCE($40, reading_time_minutes),
                meta_title=COALESCE($41, meta_title), meta_description=COALESCE($42, meta_description), focus_keywords=COALESCE($43, focus_keywords),
                secondary_keywords=COALESCE($44, secondary_keywords), seo_score=COALESCE($45, seo_score), ranking_summary=COALESCE($46, ranking_summary),
                og_title=COALESCE($47, og_title), og_description=COALESCE($48, og_description), og_image_url=COALESCE($49, og_image_url),
                og_type=COALESCE($50, og_type), twitter_title=COALESCE($51, twitter_title), twitter_description=COALESCE($52, twitter_description), twitter_image_url=COALESCE($53, twitter_image_url),
                linkedin_title=COALESCE($54, linkedin_title), linkedin_description=COALESCE($55, linkedin_description), linkedin_image_url=COALESCE($56, linkedin_image_url),
                facebook_title=COALESCE($57, facebook_title), facebook_description=COALESCE($58, facebook_description), facebook_image_url=COALESCE($59, facebook_image_url),
                instagram_title=COALESCE($60, instagram_title), instagram_description=COALESCE($61, instagram_description), instagram_image_url=COALESCE($62, instagram_image_url),
                schema_type_id=COALESCE($63, schema_type_id), robots_index=COALESCE($64, robots_index), robots_follow=COALESCE($65, robots_follow),
                robots_custom=COALESCE($66, robots_custom), canonical_url=COALESCE($67, canonical_url), redirect_from_urls=COALESCE($68, redirect_from_urls),
                hreflang_group_id=COALESCE($69, hreflang_group_id), core_web_vitals_status=COALESCE($70, core_web_vitals_status), tech_seo_status=COALESCE($71, tech_seo_status),
                faq_section_enabled=COALESCE($72, faq_section_enabled), faq_content=COALESCE($73, faq_content), has_subservices=COALESCE($74, has_subservices),
                subservice_count=COALESCE($75, subservice_count), primary_subservice_id=COALESCE($76, primary_subservice_id), featured_asset_id=COALESCE($77, featured_asset_id),
                asset_count=COALESCE($78, asset_count), knowledge_topic_id=COALESCE($79, knowledge_topic_id), brand_id=COALESCE($80, brand_id),
                business_unit=COALESCE($81, business_unit), content_owner_id=COALESCE($82, content_owner_id), updated_by=$83,
                     version_number=$84, change_log_link=COALESCE($85, change_log_link), updated_at=$86, social_meta=COALESCE($87, social_meta)
                 WHERE id=$88 RETURNING *`,
            [
                service_name, service_code, slug, computedUrl, menu_heading, short_tagline, service_description,
                JSON.stringify(industry_ids), JSON.stringify(country_ids), language, status,
                show_in_main_menu, show_in_footer_menu, menu_group, menu_position, breadcrumb_label, normalizedParentMenuSection,
                include_in_xml_sitemap, sitemap_priority, sitemap_changefreq,
                content_type, buyer_journey_stage, primary_persona_id, JSON.stringify(secondary_persona_ids), target_segment_notes,
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

export const deleteService = async (req: any, res: any) => {
    try {
        await pool.query('DELETE FROM services WHERE id = $1', [req.params.id]);
        getSocket().emit('service_deleted', { id: req.params.id });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// --- Sub-Services ---
export const getSubServices = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM sub_services ORDER BY id ASC');
        const parsedRows = result.rows.map(parseSubServiceRow);
        res.status(200).json(parsedRows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createSubService = async (req: any, res: any) => {
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
        // Navigation
        menu_position, breadcrumb_label, include_in_xml_sitemap, sitemap_priority, sitemap_changefreq,
        // Strategic
        content_type, buyer_journey_stage, primary_cta_label, primary_cta_url,
        // Technical
        robots_index, robots_follow, robots_custom, canonical_url, schema_type_id,
        redirect_from_urls, hreflang_group_id, core_web_vitals_status, tech_seo_status,
        faq_section_enabled, faq_content,
        // Governance
        brand_id, content_owner_id, created_by, created_at, updated_by, version_number, change_log_link,
        social_meta, assets_linked
    } = req.body;

    // URL normalization - ensure it follows parent service pattern
    let computedUrl = full_url;
    if (!computedUrl && parent_service_id && slug) {
        const parentResult = await pool.query('SELECT slug FROM services WHERE id = $1', [parent_service_id]);
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
                menu_position, breadcrumb_label, include_in_xml_sitemap, sitemap_priority, sitemap_changefreq,
                content_type, buyer_journey_stage, primary_cta_label, primary_cta_url,
                robots_index, robots_follow, robots_custom, canonical_url, schema_type_id,
                redirect_from_urls, hreflang_group_id, core_web_vitals_status, tech_seo_status,
                faq_section_enabled, faq_content,
                brand_id, content_owner_id, created_by, created_at, updated_by, version_number, change_log_link,
                assets_linked, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, NOW()
            ) RETURNING *`,
            [
                sub_service_name, sub_service_code, parent_service_id, slug, computedUrl, description, status,
                menu_heading, short_tagline, language || 'en', JSON.stringify(industry_ids || []), JSON.stringify(country_ids || []),
                h1, JSON.stringify(h2_list || []), JSON.stringify(h3_list || []), JSON.stringify(h4_list || []), JSON.stringify(h5_list || []), body_content,
                word_count || 0, reading_time_minutes || 0,
                meta_title, meta_description, JSON.stringify(focus_keywords || []), JSON.stringify(secondary_keywords || []), seo_score || 0, ranking_summary,
                og_title, og_description, og_image_url, og_type || 'website', twitter_title, twitter_description, twitter_image_url,
                menu_position || 0, breadcrumb_label, include_in_xml_sitemap ?? true, sitemap_priority || 0.8, sitemap_changefreq || 'monthly',
                content_type, buyer_journey_stage, primary_cta_label, primary_cta_url,
                robots_index || 'index', robots_follow || 'follow', robots_custom, canonical_url, schema_type_id || 'Service',
                JSON.stringify(redirect_from_urls || []), hreflang_group_id, core_web_vitals_status, tech_seo_status,
                faq_section_enabled || false, JSON.stringify(faq_content || []),
                brand_id || 0, content_owner_id || 0, created_by || null, created_at || null, updated_by || null, version_number || 1, change_log_link,
                JSON.stringify(social_meta || {}), assets_linked || 0, null
            ]
        );

        const newItem = parseSubServiceRow(result.rows[0]);
        getSocket().emit('sub_service_created', newItem);

        // --- Auto-Update Parent Service Count ---
        if (parent_service_id) {
            await pool.query(
                `UPDATE services 
                 SET subservice_count = (SELECT COUNT(*) FROM sub_services WHERE parent_service_id = $1),
                     has_subservices = true,
                     updated_at = NOW()
                 WHERE id = $1`,
                [parent_service_id]
            );
            const parentResult = await pool.query('SELECT * FROM services WHERE id = $1', [parent_service_id]);
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

export const updateSubService = async (req: any, res: any) => {
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
        // Governance
        brand_id, content_owner_id, updated_by, version_number, change_log_link,
        social_meta, assets_linked
    } = req.body;

    // URL normalization
    let computedUrl = full_url;
    if (computedUrl && parent_service_id) {
        const parentResult = await pool.query('SELECT slug FROM services WHERE id = $1', [parent_service_id]);
        const parentSlug = parentResult.rows[0]?.slug || 'service';
        if (!computedUrl.startsWith(`/services/${parentSlug}/`)) {
            computedUrl = `/services/${parentSlug}/${slug || ''}`;
        }
    }

    try {
        const result = await pool.query(
            `UPDATE sub_services SET 
                sub_service_name=COALESCE($1, sub_service_name), parent_service_id=COALESCE($2, parent_service_id), 
                slug=COALESCE($3, slug), full_url=COALESCE($4, full_url), description=COALESCE($5, description), status=COALESCE($6, status),
                menu_heading=COALESCE($7, menu_heading), short_tagline=COALESCE($8, short_tagline), language=COALESCE($9, language),
                industry_ids=COALESCE($10, industry_ids), country_ids=COALESCE($11, country_ids),
                h1=COALESCE($12, h1), h2_list=COALESCE($13, h2_list), h3_list=COALESCE($14, h3_list), h4_list=COALESCE($15, h4_list), h5_list=COALESCE($16, h5_list),
                body_content=COALESCE($17, body_content), word_count=COALESCE($18, word_count), reading_time_minutes=COALESCE($19, reading_time_minutes),
                meta_title=COALESCE($20, meta_title), meta_description=COALESCE($21, meta_description), focus_keywords=COALESCE($22, focus_keywords),
                secondary_keywords=COALESCE($23, secondary_keywords), seo_score=COALESCE($24, seo_score), ranking_summary=COALESCE($25, ranking_summary),
                og_title=COALESCE($26, og_title), og_description=COALESCE($27, og_description), og_image_url=COALESCE($28, og_image_url),
                og_type=COALESCE($29, og_type), twitter_title=COALESCE($30, twitter_title), twitter_description=COALESCE($31, twitter_description),
                twitter_image_url=COALESCE($32, twitter_image_url),
                menu_position=COALESCE($33, menu_position), breadcrumb_label=COALESCE($34, breadcrumb_label),
                include_in_xml_sitemap=COALESCE($35, include_in_xml_sitemap), sitemap_priority=COALESCE($36, sitemap_priority), sitemap_changefreq=COALESCE($37, sitemap_changefreq),
                content_type=COALESCE($38, content_type), buyer_journey_stage=COALESCE($39, buyer_journey_stage),
                primary_cta_label=COALESCE($40, primary_cta_label), primary_cta_url=COALESCE($41, primary_cta_url),
                robots_index=COALESCE($42, robots_index), robots_follow=COALESCE($43, robots_follow), robots_custom=COALESCE($44, robots_custom),
                canonical_url=COALESCE($45, canonical_url), schema_type_id=COALESCE($46, schema_type_id),
                redirect_from_urls=COALESCE($47, redirect_from_urls), hreflang_group_id=COALESCE($48, hreflang_group_id),
                core_web_vitals_status=COALESCE($49, core_web_vitals_status), tech_seo_status=COALESCE($50, tech_seo_status),
                faq_section_enabled=COALESCE($51, faq_section_enabled), faq_content=COALESCE($52, faq_content),
                brand_id=COALESCE($53, brand_id), content_owner_id=COALESCE($54, content_owner_id),
                updated_by=COALESCE($55, updated_by), version_number=COALESCE($56, version_number), change_log_link=COALESCE($57, change_log_link),
                social_meta=COALESCE($58, social_meta), assets_linked=COALESCE($59, assets_linked), updated_at=NOW() 
            WHERE id=$60 RETURNING *`,
            [
                sub_service_name, parent_service_id, slug, computedUrl, description, status,
                menu_heading, short_tagline, language, JSON.stringify(industry_ids), JSON.stringify(country_ids),
                h1, JSON.stringify(h2_list), JSON.stringify(h3_list), JSON.stringify(h4_list), JSON.stringify(h5_list), body_content,
                word_count, reading_time_minutes,
                meta_title, meta_description, JSON.stringify(focus_keywords), JSON.stringify(secondary_keywords), seo_score, ranking_summary,
                og_title, og_description, og_image_url, og_type, twitter_title, twitter_description, twitter_image_url,
                menu_position, breadcrumb_label, include_in_xml_sitemap, sitemap_priority, sitemap_changefreq,
                content_type, buyer_journey_stage, primary_cta_label, primary_cta_url,
                robots_index, robots_follow, robots_custom, canonical_url, schema_type_id,
                JSON.stringify(redirect_from_urls), hreflang_group_id, core_web_vitals_status, tech_seo_status,
                faq_section_enabled, JSON.stringify(faq_content),
                brand_id, content_owner_id, updated_by, version_number, change_log_link,
                JSON.stringify(social_meta || {}), assets_linked,
                id
            ]
        );

        const updatedItem = parseSubServiceRow(result.rows[0]);
        getSocket().emit('sub_service_updated', updatedItem);

        if (updatedItem.parent_service_id) {
            await pool.query(
                `UPDATE services 
                 SET subservice_count = (SELECT COUNT(*) FROM sub_services WHERE parent_service_id = $1),
            has_subservices = (SELECT COUNT(*) > 0 FROM sub_services WHERE parent_service_id = $1),
        updated_at = NOW()
                 WHERE id = $1`,
                [updatedItem.parent_service_id]
            );
            const parentResult = await pool.query('SELECT * FROM services WHERE id = $1', [updatedItem.parent_service_id]);
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

export const deleteSubService = async (req: any, res: any) => {
    try {
        // Get parent ID before deleting
        const check = await pool.query('SELECT parent_service_id FROM sub_services WHERE id = $1', [req.params.id]);
        const parentId = check.rows[0]?.parent_service_id;

        await pool.query('DELETE FROM sub_services WHERE id = $1', [req.params.id]);
        getSocket().emit('sub_service_deleted', { id: req.params.id });

        // Update Parent Count
        if (parentId) {
            await pool.query(
                `UPDATE services 
                 SET subservice_count = (SELECT COUNT(*) FROM sub_services WHERE parent_service_id = $1),
        has_subservices = (SELECT COUNT(*) > 0 FROM sub_services WHERE parent_service_id = $1),
        updated_at = NOW()
                 WHERE id = $1`,
                [parentId]
            );
            const parentResult = await pool.query('SELECT * FROM services WHERE id = $1', [parentId]);
            if (parentResult.rows.length > 0) {
                getSocket().emit('service_updated', parentResult.rows[0]);
            }
        }

        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
