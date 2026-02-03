const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../mcc_db.sqlite');

const migration = () => {
    const db = new Database(dbPath);

    try {
        console.log('Completing services table schema...');

        // Get current table info
        const tableInfo = db.prepare("PRAGMA table_info(services)").all();
        const existingColumns = tableInfo.map(col => col.name);

        // Define all required columns
        const requiredColumns = {
            'full_url': "TEXT",
            'menu_heading': "TEXT",
            'short_tagline': "TEXT",
            'service_description': "TEXT",
            'industry_ids': "TEXT DEFAULT '[]'",
            'country_ids': "TEXT DEFAULT '[]'",
            'language': "TEXT DEFAULT 'en'",
            'show_in_main_menu': "INTEGER DEFAULT 0",
            'show_in_footer_menu': "INTEGER DEFAULT 0",
            'menu_group': "TEXT",
            'menu_position': "INTEGER DEFAULT 0",
            'breadcrumb_label': "TEXT",
            'parent_menu_section': "TEXT",
            'include_in_xml_sitemap': "INTEGER DEFAULT 1",
            'sitemap_priority': "REAL DEFAULT 0.8",
            'sitemap_changefreq': "TEXT DEFAULT 'monthly'",
            'content_type': "TEXT",
            'category': "TEXT",
            'buyer_journey_stage': "TEXT",
            'primary_persona_id': "INTEGER",
            'secondary_persona_ids': "TEXT DEFAULT '[]'",
            'target_segment_notes': "TEXT",
            'primary_cta_label': "TEXT",
            'primary_cta_url': "TEXT",
            'form_id': "INTEGER",
            'linked_campaign_ids': "TEXT DEFAULT '[]'",
            'h1': "TEXT",
            'h2_list': "TEXT DEFAULT '[]'",
            'h3_list': "TEXT DEFAULT '[]'",
            'h4_list': "TEXT DEFAULT '[]'",
            'h5_list': "TEXT DEFAULT '[]'",
            'body_content': "TEXT",
            'internal_links': "TEXT DEFAULT '[]'",
            'external_links': "TEXT DEFAULT '[]'",
            'image_alt_texts': "TEXT DEFAULT '[]'",
            'word_count': "INTEGER DEFAULT 0",
            'reading_time_minutes': "INTEGER DEFAULT 0",
            'meta_title': "TEXT",
            'meta_description': "TEXT",
            'meta_keywords': "TEXT DEFAULT '[]'",
            'focus_keywords': "TEXT DEFAULT '[]'",
            'secondary_keywords': "TEXT DEFAULT '[]'",
            'seo_score': "INTEGER DEFAULT 0",
            'ranking_summary': "TEXT",
            'og_title': "TEXT",
            'og_description': "TEXT",
            'og_image_url': "TEXT",
            'og_type': "TEXT DEFAULT 'website'",
            'twitter_title': "TEXT",
            'twitter_description': "TEXT",
            'twitter_image_url': "TEXT",
            'linkedin_title': "TEXT",
            'linkedin_description': "TEXT",
            'linkedin_image_url': "TEXT",
            'facebook_title': "TEXT",
            'facebook_description': "TEXT",
            'facebook_image_url': "TEXT",
            'instagram_title': "TEXT",
            'instagram_description': "TEXT",
            'instagram_image_url': "TEXT",
            'social_meta': "TEXT DEFAULT '{}'",
            'schema_type_id': "TEXT",
            'robots_index': "TEXT DEFAULT 'index'",
            'robots_follow': "TEXT DEFAULT 'follow'",
            'robots_custom': "TEXT",
            'canonical_url': "TEXT",
            'redirect_from_urls': "TEXT DEFAULT '[]'",
            'hreflang_group_id': "INTEGER",
            'core_web_vitals_status': "TEXT DEFAULT 'Good'",
            'tech_seo_status': "TEXT DEFAULT 'Ok'",
            'faq_section_enabled': "INTEGER DEFAULT 0",
            'faq_content': "TEXT DEFAULT '[]'",
            'has_subservices': "INTEGER DEFAULT 0",
            'subservice_count': "INTEGER DEFAULT 0",
            'primary_subservice_id': "INTEGER",
            'featured_asset_id': "INTEGER",
            'asset_count': "INTEGER DEFAULT 0",
            'knowledge_topic_id': "INTEGER",
            'linked_insights_ids': "TEXT DEFAULT '[]'",
            'linked_assets_ids': "TEXT DEFAULT '[]'",
            'brand_id': "INTEGER",
            'business_unit': "TEXT",
            'content_owner_id': "INTEGER",
            'created_by': "INTEGER",
            'updated_by': "INTEGER",
            'version_number': "INTEGER DEFAULT 1",
            'change_log_link': "TEXT"
        };

        // Add missing columns
        let addedCount = 0;
        for (const [colName, colDef] of Object.entries(requiredColumns)) {
            if (!existingColumns.includes(colName)) {
                try {
                    db.prepare(`ALTER TABLE services ADD COLUMN ${colName} ${colDef}`).run();
                    console.log(`✓ Added column: ${colName}`);
                    addedCount++;
                } catch (e) {
                    console.warn(`⚠ Could not add column ${colName}:`, e.message);
                }
            }
        }

        console.log(`✓ Added ${addedCount} new columns to services table`);

        // Check if there's any data
        const count = db.prepare('SELECT COUNT(*) as cnt FROM services').get();

        if (count.cnt === 0) {
            console.log('Inserting sample service data...');

            const sampleServices = [
                {
                    service_name: 'SEO Optimization',
                    service_code: 'SEO-001',
                    slug: 'seo-optimization',
                    full_url: '/services/seo-optimization',
                    menu_heading: 'SEO Services',
                    short_tagline: 'Boost your online visibility',
                    service_description: 'Comprehensive SEO services to improve your search rankings',
                    status: 'Published',
                    h1: 'Professional SEO Optimization Services',
                    meta_title: 'SEO Optimization Services | Expert Solutions',
                    meta_description: 'Improve your search rankings with our professional SEO services',
                    content_type: 'Pillar',
                    buyer_journey_stage: 'Awareness'
                },
                {
                    service_name: 'Content Marketing',
                    service_code: 'CM-001',
                    slug: 'content-marketing',
                    full_url: '/services/content-marketing',
                    menu_heading: 'Content Services',
                    short_tagline: 'Engage your audience with quality content',
                    service_description: 'Strategic content creation and distribution services',
                    status: 'Published',
                    h1: 'Content Marketing Solutions',
                    meta_title: 'Content Marketing Services | Professional Writers',
                    meta_description: 'High-quality content creation for your brand',
                    content_type: 'Pillar',
                    buyer_journey_stage: 'Consideration'
                },
                {
                    service_name: 'Social Media Management',
                    service_code: 'SMM-001',
                    slug: 'social-media-management',
                    full_url: '/services/social-media-management',
                    menu_heading: 'Social Media',
                    short_tagline: 'Grow your social presence',
                    service_description: 'Complete social media management and strategy services',
                    status: 'Published',
                    h1: 'Social Media Management Services',
                    meta_title: 'Social Media Management | Expert Strategy',
                    meta_description: 'Grow your brand on social media with expert management',
                    content_type: 'Pillar',
                    buyer_journey_stage: 'Awareness'
                },
                {
                    service_name: 'PPC Advertising',
                    service_code: 'PPC-001',
                    slug: 'ppc-advertising',
                    full_url: '/services/ppc-advertising',
                    menu_heading: 'Paid Advertising',
                    short_tagline: 'Maximize your ad ROI',
                    service_description: 'Strategic PPC campaigns for Google Ads and social platforms',
                    status: 'Published',
                    h1: 'PPC Advertising Services',
                    meta_title: 'PPC Advertising Services | Google Ads Experts',
                    meta_description: 'Maximize your advertising ROI with expert PPC management',
                    content_type: 'Pillar',
                    buyer_journey_stage: 'Decision'
                },
                {
                    service_name: 'Email Marketing',
                    service_code: 'EM-001',
                    slug: 'email-marketing',
                    full_url: '/services/email-marketing',
                    menu_heading: 'Email Services',
                    short_tagline: 'Connect with your customers',
                    service_description: 'Effective email marketing campaigns and automation',
                    status: 'Published',
                    h1: 'Email Marketing Services',
                    meta_title: 'Email Marketing Services | Campaign Experts',
                    meta_description: 'Effective email marketing campaigns for your business',
                    content_type: 'Cluster',
                    buyer_journey_stage: 'Retention'
                }
            ];

            const insertStmt = db.prepare(`
                INSERT INTO services (
                    service_name, service_code, slug, full_url, menu_heading, short_tagline,
                    service_description, status, h1, meta_title, meta_description,
                    content_type, buyer_journey_stage, language, show_in_main_menu,
                    include_in_xml_sitemap, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            const now = new Date().toISOString();

            for (const service of sampleServices) {
                insertStmt.run(
                    service.service_name,
                    service.service_code,
                    service.slug,
                    service.full_url,
                    service.menu_heading,
                    service.short_tagline,
                    service.service_description,
                    service.status,
                    service.h1,
                    service.meta_title,
                    service.meta_description,
                    service.content_type,
                    service.buyer_journey_stage,
                    'en',
                    1,
                    1,
                    now,
                    now
                );
            }

            console.log(`✓ Inserted ${sampleServices.length} sample services`);
        } else {
            console.log(`✓ Services table already has ${count.cnt} records`);
        }

        console.log('✓ Services schema migration completed successfully');

    } catch (error) {
        console.error('Error in services schema migration:', error);
        throw error;
    } finally {
        db.close();
    }
};

migration();
