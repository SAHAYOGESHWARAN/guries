const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'mcc_db.sqlite');

function createAssetFormatMasterTable() {
    const db = new Database(dbPath);

    try {
        console.log('Creating asset_format_master table...');

        // Create asset_format_master table
        db.exec(`
            CREATE TABLE IF NOT EXISTS asset_format_master (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                format_name TEXT NOT NULL UNIQUE,
                format_type TEXT NOT NULL, -- 'image', 'video', 'document', 'audio'
                file_extensions TEXT, -- JSON array of supported extensions
                max_file_size_mb INTEGER DEFAULT 50,
                description TEXT,
                application_types TEXT, -- JSON array: ['web', 'seo', 'smm']
                status TEXT DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Insert default asset formats
        const insertFormat = db.prepare(`
            INSERT OR IGNORE INTO asset_format_master (format_name, format_type, file_extensions, max_file_size_mb, description, application_types)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        const defaultFormats = [
            // Image formats
            ['JPEG', 'image', '["jpg", "jpeg"]', 10, 'Standard image format for photos and graphics', '["web", "seo", "smm"]'],
            ['PNG', 'image', '["png"]', 10, 'Lossless image format with transparency support', '["web", "seo", "smm"]'],
            ['WebP', 'image', '["webp"]', 10, 'Modern image format with better compression', '["web", "seo"]'],
            ['SVG', 'image', '["svg"]', 5, 'Scalable vector graphics for logos and icons', '["web", "seo"]'],
            ['GIF', 'image', '["gif"]', 10, 'Animated image format', '["web", "smm"]'],

            // Video formats
            ['MP4', 'video', '["mp4"]', 100, 'Standard video format for web and social media', '["web", "smm"]'],
            ['MOV', 'video', '["mov"]', 100, 'Apple QuickTime video format', '["smm"]'],
            ['WebM', 'video', '["webm"]', 100, 'Open video format optimized for web', '["web"]'],
            ['AVI', 'video', '["avi"]', 150, 'Audio Video Interleave format', '["web"]'],

            // Document formats
            ['PDF', 'document', '["pdf"]', 25, 'Portable Document Format for guides and documents', '["web", "seo"]'],
            ['DOCX', 'document', '["docx"]', 15, 'Microsoft Word document format', '["web"]'],
            ['PPTX', 'document', '["pptx"]', 50, 'Microsoft PowerPoint presentation format', '["web"]'],

            // Audio formats
            ['MP3', 'audio', '["mp3"]', 25, 'Standard audio format for podcasts and music', '["web", "smm"]'],
            ['WAV', 'audio', '["wav"]', 50, 'Uncompressed audio format', '["web"]']
        ];

        defaultFormats.forEach(([name, type, extensions, maxSize, description, appTypes]) => {
            insertFormat.run(name, type, extensions, maxSize, description, appTypes);
        });

        console.log('✅ Asset format master table created successfully');
        console.log(`✅ Inserted ${defaultFormats.length} default formats`);

    } catch (error) {
        console.error('❌ Error creating asset format master table:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run the migration
if (require.main === module) {
    createAssetFormatMasterTable();
}

module.exports = { createAssetFormatMasterTable };