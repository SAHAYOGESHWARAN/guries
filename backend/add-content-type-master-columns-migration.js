const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');
const db = new Database(dbPath);

try {
    console.log('Adding Content Type Master columns...');

    // Check existing columns
    const tableInfo = db.prepare(`PRAGMA table_info(content_types)`).all();
    const existingColumns = tableInfo.map(col => col.name);

    // Add missing columns
    const columnsToAdd = [
        { name: 'default_wordcount_min', sql: 'ALTER TABLE content_types ADD COLUMN default_wordcount_min INTEGER DEFAULT 500' },
        { name: 'default_wordcount_max', sql: 'ALTER TABLE content_types ADD COLUMN default_wordcount_max INTEGER DEFAULT 2000' },
        { name: 'default_graphic_requirements', sql: 'ALTER TABLE content_types ADD COLUMN default_graphic_requirements TEXT' },
        { name: 'default_qc_checklist', sql: 'ALTER TABLE content_types ADD COLUMN default_qc_checklist TEXT' },
        { name: 'seo_focus_keywords_required', sql: 'ALTER TABLE content_types ADD COLUMN seo_focus_keywords_required INTEGER DEFAULT 1' },
        { name: 'social_media_applicable', sql: 'ALTER TABLE content_types ADD COLUMN social_media_applicable INTEGER DEFAULT 1' },
        { name: 'estimated_creation_hours', sql: 'ALTER TABLE content_types ADD COLUMN estimated_creation_hours DECIMAL(5,2) DEFAULT 4.0' },
        { name: 'content_owner_role', sql: 'ALTER TABLE content_types ADD COLUMN content_owner_role VARCHAR(100)' },
        { name: 'use_in_campaigns', sql: 'ALTER TABLE content_types ADD COLUMN use_in_campaigns INTEGER DEFAULT 1' }
    ];

    columnsToAdd.forEach(col => {
        if (!existingColumns.includes(col.name)) {
            console.log(`Adding column: ${col.name}`);
            db.exec(col.sql);
        } else {
            console.log(`Column already exists: ${col.name}`);
        }
    });

    // Insert sample data if table is empty
    const count = db.prepare(`SELECT COUNT(*) as cnt FROM content_types`).get();

    if (count.cnt === 0) {
        console.log('Inserting sample content types...');

        const sampleData = [
            {
                content_type: 'Blog',
                category: 'Editorial',
                description: 'Blog post for SEO and thought leadership',
                default_wordcount_min: 1500,
                default_wordcount_max: 2500,
                default_graphic_requirements: JSON.stringify({
                    required: true,
                    types: ['Featured Image', 'Inline Images'],
                    dimensions: '1200x630',
                    file_formats: ['JPEG', 'PNG'],
                    count: '3-5'
                }),
                default_qc_checklist: JSON.stringify([
                    { item: 'Grammar & spelling check', mandatory: true },
                    { item: 'SEO title/meta optimized', mandatory: true },
                    { item: 'Internal links (min 3)', mandatory: true },
                    { item: 'Images optimized', mandatory: true },
                    { item: 'Readability check', mandatory: false }
                ]),
                seo_focus_keywords_required: 1,
                social_media_applicable: 1,
                estimated_creation_hours: 4.5,
                content_owner_role: 'Content Writer',
                use_in_campaigns: 1
            },
            {
                content_type: 'Pillar',
                category: 'Core',
                description: 'Comprehensive pillar page for topic authority',
                default_wordcount_min: 3000,
                default_wordcount_max: 5000,
                default_graphic_requirements: JSON.stringify({
                    required: true,
                    types: ['Featured Image', 'Infographic', 'Inline Images'],
                    dimensions: '1920x1080',
                    file_formats: ['JPEG', 'PNG', 'SVG'],
                    count: '5-10'
                }),
                default_qc_checklist: JSON.stringify([
                    { item: 'Grammar & spelling check', mandatory: true },
                    { item: 'SEO optimization', mandatory: true },
                    { item: 'Internal linking strategy', mandatory: true },
                    { item: 'Images optimized', mandatory: true },
                    { item: 'Schema markup', mandatory: true },
                    { item: 'Readability & structure', mandatory: true }
                ]),
                seo_focus_keywords_required: 1,
                social_media_applicable: 1,
                estimated_creation_hours: 8.0,
                content_owner_role: 'Senior Content Writer',
                use_in_campaigns: 1
            },
            {
                content_type: 'Cluster',
                category: 'Supporting',
                description: 'Supporting topic page linked to pillar',
                default_wordcount_min: 1200,
                default_wordcount_max: 2000,
                default_graphic_requirements: JSON.stringify({
                    required: true,
                    types: ['Featured Image', 'Inline Images'],
                    dimensions: '1200x630',
                    file_formats: ['JPEG', 'PNG'],
                    count: '2-4'
                }),
                default_qc_checklist: JSON.stringify([
                    { item: 'Grammar & spelling check', mandatory: true },
                    { item: 'SEO optimization', mandatory: true },
                    { item: 'Link to pillar page', mandatory: true },
                    { item: 'Images optimized', mandatory: true }
                ]),
                seo_focus_keywords_required: 1,
                social_media_applicable: 1,
                estimated_creation_hours: 3.5,
                content_owner_role: 'Content Writer',
                use_in_campaigns: 1
            },
            {
                content_type: 'Landing Page',
                category: 'Conversion',
                description: 'Campaign landing page for lead generation',
                default_wordcount_min: 800,
                default_wordcount_max: 1500,
                default_graphic_requirements: JSON.stringify({
                    required: true,
                    types: ['Hero Image', 'CTA Buttons', 'Product Images'],
                    dimensions: '1920x1080',
                    file_formats: ['JPEG', 'PNG'],
                    count: '3-6'
                }),
                default_qc_checklist: JSON.stringify([
                    { item: 'CTA clarity', mandatory: true },
                    { item: 'Form validation', mandatory: true },
                    { item: 'Mobile responsiveness', mandatory: true },
                    { item: 'Load time optimization', mandatory: true },
                    { item: 'Conversion tracking', mandatory: true }
                ]),
                seo_focus_keywords_required: 0,
                social_media_applicable: 0,
                estimated_creation_hours: 5.0,
                content_owner_role: 'Conversion Specialist',
                use_in_campaigns: 1
            },
            {
                content_type: 'Case Study',
                category: 'Long-form',
                description: 'In-depth case study showcasing results',
                default_wordcount_min: 2000,
                default_wordcount_max: 3500,
                default_graphic_requirements: JSON.stringify({
                    required: true,
                    types: ['Featured Image', 'Charts', 'Infographics', 'Client Logo'],
                    dimensions: '1200x630',
                    file_formats: ['JPEG', 'PNG', 'SVG'],
                    count: '5-8'
                }),
                default_qc_checklist: JSON.stringify([
                    { item: 'Data accuracy', mandatory: true },
                    { item: 'Client approval', mandatory: true },
                    { item: 'Results quantified', mandatory: true },
                    { item: 'Professional formatting', mandatory: true }
                ]),
                seo_focus_keywords_required: 1,
                social_media_applicable: 1,
                estimated_creation_hours: 6.0,
                content_owner_role: 'Senior Content Writer',
                use_in_campaigns: 1
            },
            {
                content_type: 'Whitepaper',
                category: 'Long-form',
                description: 'In-depth whitepaper and research guide',
                default_wordcount_min: 3000,
                default_wordcount_max: 6000,
                default_graphic_requirements: JSON.stringify({
                    required: true,
                    types: ['Cover Design', 'Charts', 'Infographics', 'Data Visualizations'],
                    dimensions: '1920x1080',
                    file_formats: ['PDF', 'JPEG', 'PNG'],
                    count: '8-15'
                }),
                default_qc_checklist: JSON.stringify([
                    { item: 'Research accuracy', mandatory: true },
                    { item: 'Professional design', mandatory: true },
                    { item: 'Data visualization', mandatory: true },
                    { item: 'Executive summary', mandatory: true },
                    { item: 'Call-to-action', mandatory: true }
                ]),
                seo_focus_keywords_required: 0,
                social_media_applicable: 0,
                estimated_creation_hours: 12.0,
                content_owner_role: 'Research Specialist',
                use_in_campaigns: 1
            },
            {
                content_type: 'Infographic',
                category: 'Visual',
                description: 'Visual representation of data or concepts',
                default_wordcount_min: 100,
                default_wordcount_max: 500,
                default_graphic_requirements: JSON.stringify({
                    required: true,
                    types: ['Infographic Design'],
                    dimensions: '1200x1500',
                    file_formats: ['PNG', 'SVG', 'PDF'],
                    count: '1'
                }),
                default_qc_checklist: JSON.stringify([
                    { item: 'Data accuracy', mandatory: true },
                    { item: 'Visual clarity', mandatory: true },
                    { item: 'Brand consistency', mandatory: true },
                    { item: 'Accessibility', mandatory: true }
                ]),
                seo_focus_keywords_required: 0,
                social_media_applicable: 1,
                estimated_creation_hours: 4.0,
                content_owner_role: 'Designer',
                use_in_campaigns: 1
            },
            {
                content_type: 'Video Script',
                category: 'Multimedia',
                description: 'Script for video content production',
                default_wordcount_min: 300,
                default_wordcount_max: 1000,
                default_graphic_requirements: JSON.stringify({
                    required: true,
                    types: ['Storyboard', 'B-roll', 'Graphics'],
                    dimensions: '1920x1080',
                    file_formats: ['MP4', 'MOV'],
                    count: '1'
                }),
                default_qc_checklist: JSON.stringify([
                    { item: 'Script clarity', mandatory: true },
                    { item: 'Timing accuracy', mandatory: true },
                    { item: 'Brand voice', mandatory: true },
                    { item: 'Call-to-action', mandatory: true }
                ]),
                seo_focus_keywords_required: 0,
                social_media_applicable: 1,
                estimated_creation_hours: 3.0,
                content_owner_role: 'Video Producer',
                use_in_campaigns: 1
            }
        ];

        const insertStmt = db.prepare(`
            INSERT INTO content_types 
            (content_type, category, description, default_wordcount_min, default_wordcount_max, 
             default_graphic_requirements, default_qc_checklist, seo_focus_keywords_required, 
             social_media_applicable, estimated_creation_hours, content_owner_role, use_in_campaigns, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
        `);

        sampleData.forEach(data => {
            insertStmt.run(
                data.content_type,
                data.category,
                data.description,
                data.default_wordcount_min,
                data.default_wordcount_max,
                data.default_graphic_requirements,
                data.default_qc_checklist,
                data.seo_focus_keywords_required,
                data.social_media_applicable,
                data.estimated_creation_hours,
                data.content_owner_role,
                data.use_in_campaigns
            );
        });

        console.log(`✅ Inserted ${sampleData.length} sample content types`);
    }

    db.close();
    console.log('✅ Migration completed successfully');
} catch (error) {
    console.error('❌ Migration failed:', error.message);
    db.close();
    process.exit(1);
}
