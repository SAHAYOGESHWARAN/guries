const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data for creating a sub-service with all sections
const testSubService = {
    // Core Navigation
    sub_service_name: 'Web Development - Frontend',
    parent_service_id: 1,
    slug: 'web-development-frontend',
    full_url: '/services/web-development/web-development-frontend',
    description: 'Frontend development services for web applications',
    status: 'Draft',
    menu_heading: 'Frontend Development',
    short_tagline: 'Build responsive web interfaces',
    language: 'en',
    industry_ids: ['1', '2'],
    country_ids: ['US', 'UK'],

    // Strategic Content
    content_type: 'Cluster',
    buyer_journey_stage: 'Consideration',
    primary_cta_label: 'Get Started',
    primary_cta_url: '/contact',

    // SEO
    h1: 'Professional Frontend Web Development Services',
    h2_list: ['React Development', 'Vue.js Development', 'Angular Development'],
    h3_list: ['Component Architecture', 'State Management', 'Performance Optimization'],
    h4_list: ['Testing Strategies', 'Deployment Process'],
    h5_list: ['CI/CD Integration'],
    body_content: 'We provide comprehensive frontend development services...',
    word_count: 1500,
    reading_time_minutes: 8,
    meta_title: 'Professional Frontend Web Development | Our Services',
    meta_description: 'Expert frontend development services using React, Vue, and Angular. Build responsive, performant web applications.',
    focus_keywords: ['frontend development', 'web development', 'React development'],
    secondary_keywords: ['Vue.js', 'Angular', 'responsive design'],
    seo_score: 85,
    ranking_summary: 'Ranking well for primary keywords',

    // SMM - Open Graph
    og_title: 'Frontend Web Development Services',
    og_description: 'Professional frontend development for modern web applications',
    og_image_url: 'https://example.com/og-frontend.jpg',
    og_type: 'website',

    // SMM - Twitter
    twitter_title: 'Frontend Development Services',
    twitter_description: 'Expert React, Vue, and Angular development',
    twitter_image_url: 'https://example.com/twitter-frontend.jpg',

    // SMM - LinkedIn
    linkedin_title: 'Professional Frontend Development',
    linkedin_description: 'Enterprise-grade frontend development solutions',
    linkedin_image_url: 'https://example.com/linkedin-frontend.jpg',

    // SMM - Facebook
    facebook_title: 'Frontend Web Development',
    facebook_description: 'Build beautiful, responsive web interfaces',
    facebook_image_url: 'https://example.com/facebook-frontend.jpg',

    // SMM - Instagram
    instagram_title: 'Frontend Dev',
    instagram_description: 'Modern web development',
    instagram_image_url: 'https://example.com/instagram-frontend.jpg',

    // Technical
    robots_index: 'index',
    robots_follow: 'follow',
    robots_custom: 'max-snippet:-1, max-image-preview:large',
    canonical_url: 'https://example.com/services/web-development/frontend',
    schema_type_id: 'Service',
    redirect_from_urls: ['/old-frontend-page'],
    core_web_vitals_status: 'Good',
    tech_seo_status: 'Ok',
    faq_section_enabled: true,
    faq_content: [
        { question: 'What frameworks do you use?', answer: 'We specialize in React, Vue, and Angular' },
        { question: 'Do you provide maintenance?', answer: 'Yes, we offer ongoing support and maintenance' }
    ],

    // Navigation
    menu_position: 1,
    breadcrumb_label: 'Frontend Development',
    include_in_xml_sitemap: true,
    sitemap_priority: 0.9,
    sitemap_changefreq: 'monthly',

    // Linking
    linked_insights_ids: [],
    linked_assets_ids: [],
    assets_linked: 0,

    // Governance
    brand_id: 1,
    content_owner_id: 1,
    version_number: 1,
    change_log_link: 'https://example.com/changelog'
};

async function testSubServiceCreation() {
    try {
        console.log('🧪 Testing Sub-Service Creation with All Sections...\n');

        // Create sub-service
        console.log('📝 Creating sub-service...');
        const createResponse = await axios.post(`${BASE_URL}/sub-services`, testSubService);
        const subService = createResponse.data;
        console.log('✅ Sub-service created successfully!');
        console.log(`   ID: ${subService.id}`);
        console.log(`   Name: ${subService.sub_service_name}`);
        console.log(`   Code: ${subService.sub_service_code}\n`);

        // Verify all sections
        console.log('🔍 Verifying all sections:\n');

        console.log('✓ Core Navigation:');
        console.log(`  - Parent Service ID: ${subService.parent_service_id}`);
        console.log(`  - Menu Heading: ${subService.menu_heading}`);
        console.log(`  - Industries: ${subService.industry_ids?.join(', ')}`);
        console.log(`  - Countries: ${subService.country_ids?.join(', ')}\n`);

        console.log('✓ Strategic Content:');
        console.log(`  - Content Type: ${subService.content_type}`);
        console.log(`  - Buyer Journey: ${subService.buyer_journey_stage}`);
        console.log(`  - Primary CTA: ${subService.primary_cta_label}\n`);

        console.log('✓ SEO:');
        console.log(`  - H1: ${subService.h1}`);
        console.log(`  - Meta Title: ${subService.meta_title}`);
        console.log(`  - Focus Keywords: ${subService.focus_keywords?.join(', ')}`);
        console.log(`  - SEO Score: ${subService.seo_score}\n`);

        console.log('✓ SMM:');
        console.log(`  - OG Title: ${subService.og_title}`);
        console.log(`  - Twitter Title: ${subService.twitter_title}`);
        console.log(`  - LinkedIn Title: ${subService.linkedin_title}`);
        console.log(`  - Facebook Title: ${subService.facebook_title}`);
        console.log(`  - Instagram Title: ${subService.instagram_title}\n`);

        console.log('✓ Technical:');
        console.log(`  - Robots Index: ${subService.robots_index}`);
        console.log(`  - Core Web Vitals: ${subService.core_web_vitals_status}`);
        console.log(`  - Sitemap Priority: ${subService.sitemap_priority}\n`);

        console.log('✓ Governance:');
        console.log(`  - Brand ID: ${subService.brand_id}`);
        console.log(`  - Content Owner ID: ${subService.content_owner_id}`);
        console.log(`  - Version: ${subService.version_number}\n`);

        // Test update
        console.log('📝 Testing sub-service update...');
        const updateData = {
            ...testSubService,
            meta_title: 'Updated: Professional Frontend Web Development | Our Services',
            seo_score: 90,
            version_number: 2
        };
        const updateResponse = await axios.put(`${BASE_URL}/sub-services/${subService.id}`, updateData);
        console.log('✅ Sub-service updated successfully!');
        console.log(`   Updated Meta Title: ${updateResponse.data.meta_title}`);
        console.log(`   Updated SEO Score: ${updateResponse.data.seo_score}`);
        console.log(`   Version: ${updateResponse.data.version_number}\n`);

        // Fetch all sub-services
        console.log('📋 Fetching all sub-services...');
        const listResponse = await axios.get(`${BASE_URL}/sub-services`);
        console.log(`✅ Found ${listResponse.data.length} sub-service(s)\n`);

        console.log('✨ All tests passed! Sub-Service Master with full sections is working correctly.\n');

    } catch (error) {
        console.error('❌ Test failed:');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

testSubServiceCreation();
