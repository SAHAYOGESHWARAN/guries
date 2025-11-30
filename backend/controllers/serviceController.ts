
import { Request, Response } from 'express';
import { pool } from '../config/db';
import { getSocket } from '../socket';

// --- Services ---
export const getServices = async (req: any, res: any) => {
    try {
        const result = await pool.query('SELECT * FROM services ORDER BY id ASC');
        res.status(200).json(result.rows);
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
        // Technical
        schema_type_id, robots_index, robots_follow, robots_custom, canonical_url,
        redirect_from_urls, hreflang_group_id, core_web_vitals_status, tech_seo_status,
        faq_section_enabled, faq_content,
        // Linking
        has_subservices, subservice_count, primary_subservice_id, featured_asset_id, asset_count, knowledge_topic_id,
        // Governance
        brand_id, business_unit, content_owner_id, created_by, created_at, version_number, change_log_link
    } = req.body;

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
                schema_type_id, robots_index, robots_follow, robots_custom, canonical_url, redirect_from_urls,
                hreflang_group_id, core_web_vitals_status, tech_seo_status, faq_section_enabled, faq_content,
                has_subservices, subservice_count, primary_subservice_id, featured_asset_id, asset_count, knowledge_topic_id,
                brand_id, business_unit, content_owner_id, created_by, created_at, version_number, change_log_link
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, 
                $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50,
                $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66, $67, $68, $69, $70, $71, $72, $73, $74, $75, $76, $77
            ) RETURNING *`,
            [
                service_name, service_code, slug, computedUrl, menu_heading, short_tagline, service_description,
                JSON.stringify(industry_ids || []), JSON.stringify(country_ids || []), language, status,
                show_in_main_menu || false, show_in_footer_menu || false, menu_group, menu_position || 0, breadcrumb_label, parent_menu_section,
                include_in_xml_sitemap || true, sitemap_priority || 0.8, sitemap_changefreq || 'monthly',
                content_type, buyer_journey_stage, primary_persona_id, JSON.stringify(secondary_persona_ids || []), target_segment_notes,
                primary_cta_label, primary_cta_url, form_id, JSON.stringify(linked_campaign_ids || []),
                h1, JSON.stringify(h2_list || []), JSON.stringify(h3_list || []), JSON.stringify(h4_list || []), JSON.stringify(h5_list || []), body_content,
                JSON.stringify(internal_links || []), JSON.stringify(external_links || []), JSON.stringify(image_alt_texts || []), word_count || 0, reading_time_minutes || 0,
                meta_title, meta_description, JSON.stringify(focus_keywords || []), JSON.stringify(secondary_keywords || []), seo_score || 0, ranking_summary,
                og_title, og_description, og_image_url, og_type, twitter_title, twitter_description, twitter_image_url,
                schema_type_id, robots_index, robots_follow, robots_custom, canonical_url, JSON.stringify(redirect_from_urls || []),
                hreflang_group_id, core_web_vitals_status, tech_seo_status, faq_section_enabled, JSON.stringify(faq_content || []),
                has_subservices || false, subservice_count || 0, primary_subservice_id || 0, featured_asset_id || 0, asset_count || 0, knowledge_topic_id || 0,
                brand_id, business_unit, content_owner_id, created_by, created_at || 'NOW()', version_number || 1, change_log_link
            ]
        );
        const newItem = result.rows[0];
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
        schema_type_id, robots_index, robots_follow, robots_custom, canonical_url,
        redirect_from_urls, hreflang_group_id, core_web_vitals_status, tech_seo_status,
        faq_section_enabled, faq_content,
        has_subservices, subservice_count, primary_subservice_id, featured_asset_id, asset_count, knowledge_topic_id,
        brand_id, business_unit, content_owner_id, updated_by, version_number, change_log_link
    } = req.body;
    
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
                schema_type_id=COALESCE($54, schema_type_id), robots_index=COALESCE($55, robots_index), robots_follow=COALESCE($56, robots_follow),
                robots_custom=COALESCE($57, robots_custom), canonical_url=COALESCE($58, canonical_url), redirect_from_urls=COALESCE($59, redirect_from_urls),
                hreflang_group_id=COALESCE($60, hreflang_group_id), core_web_vitals_status=COALESCE($61, core_web_vitals_status), tech_seo_status=COALESCE($62, tech_seo_status),
                faq_section_enabled=COALESCE($63, faq_section_enabled), faq_content=COALESCE($64, faq_content), has_subservices=COALESCE($65, has_subservices),
                subservice_count=COALESCE($66, subservice_count), primary_subservice_id=COALESCE($67, primary_subservice_id), featured_asset_id=COALESCE($68, featured_asset_id),
                asset_count=COALESCE($69, asset_count), knowledge_topic_id=COALESCE($70, knowledge_topic_id), brand_id=COALESCE($71, brand_id),
                business_unit=COALESCE($72, business_unit), content_owner_id=COALESCE($73, content_owner_id), updated_by=COALESCE($74, updated_by),
                version_number=COALESCE($75, version_number), change_log_link=COALESCE($76, change_log_link), updated_at=NOW()
             WHERE id=$77 RETURNING *`,
            [
                service_name, service_code, slug, computedUrl, menu_heading, short_tagline, service_description,
                JSON.stringify(industry_ids), JSON.stringify(country_ids), language, status,
                show_in_main_menu, show_in_footer_menu, menu_group, menu_position, breadcrumb_label, parent_menu_section,
                include_in_xml_sitemap, sitemap_priority, sitemap_changefreq,
                content_type, buyer_journey_stage, primary_persona_id, JSON.stringify(secondary_persona_ids), target_segment_notes,
                primary_cta_label, primary_cta_url, form_id, JSON.stringify(linked_campaign_ids),
                h1, JSON.stringify(h2_list), JSON.stringify(h3_list), JSON.stringify(h4_list), JSON.stringify(h5_list), body_content,
                JSON.stringify(internal_links), JSON.stringify(external_links), JSON.stringify(image_alt_texts), word_count, reading_time_minutes,
                meta_title, meta_description, JSON.stringify(focus_keywords), JSON.stringify(secondary_keywords), seo_score, ranking_summary,
                og_title, og_description, og_image_url, og_type, twitter_title, twitter_description, twitter_image_url,
                schema_type_id, robots_index, robots_follow, robots_custom, canonical_url, JSON.stringify(redirect_from_urls),
                hreflang_group_id, core_web_vitals_status, tech_seo_status, faq_section_enabled, JSON.stringify(faq_content),
                has_subservices, subservice_count, primary_subservice_id, featured_asset_id, asset_count, knowledge_topic_id,
                brand_id, business_unit, content_owner_id, updated_by, version_number, change_log_link, id
            ]
        );
        const updatedItem = result.rows[0];
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
        res.status(200).json(result.rows);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createSubService = async (req: any, res: any) => {
    const { 
        sub_service_name, parent_service_id, slug, full_url, description, status,
        h1, h2_list, h3_list, body_content,
        meta_title, meta_description, focus_keywords,
        og_title, og_description, og_image_url,
        assets_linked,
        // Extended Fields
        menu_position, breadcrumb_label, include_in_xml_sitemap,
        content_type, buyer_journey_stage, primary_cta_label, primary_cta_url,
        robots_index, robots_follow, canonical_url, schema_type_id,
        brand_id, content_owner_id
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO sub_services (
                sub_service_name, parent_service_id, slug, full_url, description, status,
                h1, h2_list, h3_list, body_content,
                meta_title, meta_description, focus_keywords,
                og_title, og_description, og_image_url,
                assets_linked,
                menu_position, breadcrumb_label, include_in_xml_sitemap,
                content_type, buyer_journey_stage, primary_cta_label, primary_cta_url,
                robots_index, robots_follow, canonical_url, schema_type_id,
                brand_id, content_owner_id,
                updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, 
                $7, $8, $9, $10,
                $11, $12, $13,
                $14, $15, $16,
                $17,
                $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
                NOW()
            ) RETURNING *`,
            [
                sub_service_name, parent_service_id, slug, full_url, description, status,
                h1, JSON.stringify(h2_list || []), JSON.stringify(h3_list || []), body_content,
                meta_title, meta_description, JSON.stringify(focus_keywords || []),
                og_title, og_description, og_image_url,
                assets_linked || 0,
                menu_position || 0, breadcrumb_label, include_in_xml_sitemap ?? true,
                content_type, buyer_journey_stage, primary_cta_label, primary_cta_url,
                robots_index || 'index', robots_follow || 'follow', canonical_url, schema_type_id || 'Service',
                brand_id || 0, content_owner_id || 0
            ]
        );
        
        const newItem = result.rows[0];
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
                getSocket().emit('service_updated', parentResult.rows[0]);
            }
        }

        res.status(201).json(newItem);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateSubService = async (req: any, res: any) => {
    const { id } = req.params;
    const { 
        sub_service_name, parent_service_id, slug, full_url, description, status,
        h1, h2_list, h3_list, body_content,
        meta_title, meta_description, focus_keywords,
        og_title, og_description, og_image_url,
        assets_linked,
        // Extended Fields
        menu_position, breadcrumb_label, include_in_xml_sitemap,
        content_type, buyer_journey_stage, primary_cta_label, primary_cta_url,
        robots_index, robots_follow, canonical_url, schema_type_id,
        brand_id, content_owner_id
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE sub_services SET 
                sub_service_name=COALESCE($1, sub_service_name), parent_service_id=COALESCE($2, parent_service_id), 
                slug=COALESCE($3, slug), full_url=COALESCE($4, full_url), description=COALESCE($5, description), status=COALESCE($6, status),
                h1=COALESCE($7, h1), h2_list=COALESCE($8, h2_list), h3_list=COALESCE($9, h3_list), body_content=COALESCE($10, body_content),
                meta_title=COALESCE($11, meta_title), meta_description=COALESCE($12, meta_description), focus_keywords=COALESCE($13, focus_keywords),
                og_title=COALESCE($14, og_title), og_description=COALESCE($15, og_description), og_image_url=COALESCE($16, og_image_url),
                assets_linked=COALESCE($17, assets_linked),
                menu_position=COALESCE($18, menu_position), breadcrumb_label=COALESCE($19, breadcrumb_label), include_in_xml_sitemap=COALESCE($20, include_in_xml_sitemap),
                content_type=COALESCE($21, content_type), buyer_journey_stage=COALESCE($22, buyer_journey_stage), primary_cta_label=COALESCE($23, primary_cta_label), primary_cta_url=COALESCE($24, primary_cta_url),
                robots_index=COALESCE($25, robots_index), robots_follow=COALESCE($26, robots_follow), canonical_url=COALESCE($27, canonical_url), schema_type_id=COALESCE($28, schema_type_id),
                brand_id=COALESCE($29, brand_id), content_owner_id=COALESCE($30, content_owner_id),
                updated_at=NOW() 
            WHERE id=$31 RETURNING *`,
            [
                sub_service_name, parent_service_id, slug, full_url, description, status,
                h1, JSON.stringify(h2_list), JSON.stringify(h3_list), body_content,
                meta_title, meta_description, JSON.stringify(focus_keywords),
                og_title, og_description, og_image_url,
                assets_linked,
                menu_position, breadcrumb_label, include_in_xml_sitemap,
                content_type, buyer_journey_stage, primary_cta_label, primary_cta_url,
                robots_index, robots_follow, canonical_url, schema_type_id,
                brand_id, content_owner_id,
                id
            ]
        );
        
        const updatedItem = result.rows[0];
        getSocket().emit('sub_service_updated', updatedItem);
        
        if (updatedItem.parent_service_id) {
             await pool.query(
                `UPDATE services 
                 SET subservice_count = (SELECT COUNT(*) FROM sub_services WHERE parent_service_id = $1)
                 WHERE id = $1`,
                [updatedItem.parent_service_id]
            );
        }

        res.status(200).json(updatedItem);
    } catch (error: any) {
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
