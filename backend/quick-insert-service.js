const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new sqlite3.Database(dbPath);

const now = new Date().toISOString();

const serviceData = [
    'Test Service',           // service_name
    'TEST-001',              // service_code
    'test-service',          // slug
    'http://localhost/test-service', // full_url
    'Test',                  // menu_heading
    'Test Service',          // short_tagline
    'A test service',        // service_description
    '[]',                    // industry_ids
    '[]',                    // country_ids
    'en',                    // language
    'Published',             // status
    1,                       // show_in_main_menu
    0,                       // show_in_footer_menu
    'Services',              // menu_group
    1,                       // menu_position
    'Test Service',          // breadcrumb_label
    null,                    // parent_menu_section
    1,                       // include_in_xml_sitemap
    0.8,                     // sitemap_priority
    'monthly',               // sitemap_changefreq
    'Service',               // content_type
    'Awareness',             // buyer_journey_stage
    null,                    // primary_persona_id
    '[]',                    // secondary_persona_ids
    null,                    // target_segment_notes
    'Learn More',            // primary_cta_label
    '/test-service',         // primary_cta_url
    null,                    // form_id
    '[]',                    // linked_campaign_ids
    'Test Service',          // h1
    '[]',                    // h2_list
    '[]',                    // h3_list
    '[]',                    // h4_list
    '[]',                    // h5_list
    'This is a test service', // body_content
    '[]',                    // internal_links
    '[]',                    // external_links
    '[]',                    // image_alt_texts
    100,                     // word_count
    1,                       // reading_time_minutes
    'Test Service',          // meta_title
    'Test service description', // meta_description
    '["test"]',              // focus_keywords
    '[]',                    // secondary_keywords
    50,                      // seo_score
    null,                    // ranking_summary
    'Test Service',          // og_title
    'Test service',          // og_description
    null,                    // og_image_url
    'website',               // og_type
    'Test Service',          // twitter_title
    'Test service',          // twitter_description
    null,                    // twitter_image_url
    'Test Service',          // linkedin_title
    'Test service',          // linkedin_description
    null,                    // linkedin_image_url
    'Test Service',          // facebook_title
    'Test service',          // facebook_description
    null,                    // facebook_image_url
    'Test Service',          // instagram_title
    'Test service',          // instagram_description
    null,                    // instagram_image_url
    '{}',                    // social_meta
    'Service',               // schema_type_id
    'index',                 // robots_index
    'follow',                // robots_follow
    null,                    // robots_custom
    null,                    // canonical_url
    '[]',                    // redirect_from_urls
    null,                    // hreflang_group_id
    'Good',                  // core_web_vitals_status
    'Ok',                    // tech_seo_status
    0,                       // faq_section_enabled
    '[]',                    // faq_content
    0,                       // has_subservices
    0,                       // subservice_count
    null,                    // primary_subservice_id
    null,                    // featured_asset_id
    0,                       // asset_count
    null,                    // knowledge_topic_id
    '[]',                    // linked_insights_ids
    '[]',                    // linked_assets_ids
    null,                    // brand_id
    null,                    // business_unit
    null,                    // content_owner_id
    1,                       // created_by
    now,                     // created_at
    1,                       // updated_by
    now,                     // updated_at
    1,                       // version_number
    null                     // change_log_link
];

const sql = `INSERT INTO services (
  service_name, service_code, slug, full_url, menu_heading, short_tagline, service_description,
  industry_ids, country_ids, language, status, show_in_main_menu, show_in_footer_menu, menu_group,
  menu_position, breadcrumb_label, parent_menu_section, include_in_xml_sitemap, sitemap_priority,
  sitemap_changefreq, content_type, buyer_journey_stage, primary_persona_id, secondary_persona_ids,
  target_segment_notes, primary_cta_label, primary_cta_url, form_id, linked_campaign_ids, h1, h2_list,
  h3_list, h4_list, h5_list, body_content, internal_links, external_links, image_alt_texts, word_count,
  reading_time_minutes, meta_title, meta_description, focus_keywords, secondary_keywords, seo_score,
  ranking_summary, og_title, og_description, og_image_url, og_type, twitter_title, twitter_description,
  twitter_image_url, linkedin_title, linkedin_description, linkedin_image_url, facebook_title,
  facebook_description, facebook_image_url, instagram_title, instagram_description, instagram_image_url,
  social_meta, schema_type_id, robots_index, robots_follow, robots_custom, canonical_url,
  redirect_from_urls, hreflang_group_id, core_web_vitals_status, tech_seo_status, faq_section_enabled,
  faq_content, has_subservices, subservice_count, primary_subservice_id, featured_asset_id, asset_count,
  knowledge_topic_id, linked_insights_ids, linked_assets_ids, brand_id, business_unit, content_owner_id,
  created_by, created_at, updated_by, updated_at, version_number, change_log_link
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

db.run(sql, serviceData, function (err) {
    if (err) {
        console.error('❌ Error inserting service:', err.message);
    } else {
        console.log('✅ Service created with ID:', this.lastID);
    }
    db.close();
});
