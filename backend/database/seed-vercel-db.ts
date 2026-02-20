/**
 * Vercel PostgreSQL Database Seeding Script
 * Seeds all master data tables with initial values
 */

import { pool } from '../config/db';

export const seedVercelDatabase = async () => {
    try {
        console.log('🌱 Seeding Vercel PostgreSQL database...');

        // Seed industry_sectors
        try {
            const sectorCheck = await pool.query('SELECT COUNT(*) as count FROM industry_sectors');
            const count = sectorCheck.rows?.[0]?.count || 0;

            if (count === 0) {
                console.log('🌱 Seeding industry_sectors...');
                const sampleData = [
                    // Healthcare Sector
                    { sector: 'Healthcare', industry: 'Pharmaceuticals', application: 'Medical Research', country: 'Global' },
                    { sector: 'Healthcare', industry: 'Medical Devices', application: 'Clinical Trials', country: 'Global' },
                    { sector: 'Healthcare', industry: 'Biotechnology', application: 'Drug Development', country: 'Global' },
                    { sector: 'Healthcare', industry: 'Hospitals', application: 'Patient Care', country: 'Global' },
                    { sector: 'Healthcare', industry: 'Telemedicine', application: 'Remote Healthcare', country: 'Global' },

                    // Finance Sector
                    { sector: 'Finance', industry: 'Banking', application: 'Financial Services', country: 'Global' },
                    { sector: 'Finance', industry: 'Insurance', application: 'Risk Management', country: 'Global' },
                    { sector: 'Finance', industry: 'Investment', application: 'Asset Management', country: 'Global' },
                    { sector: 'Finance', industry: 'Fintech', application: 'Digital Payments', country: 'Global' },

                    // Technology Sector
                    { sector: 'Technology', industry: 'Software', application: 'Enterprise Solutions', country: 'Global' },
                    { sector: 'Technology', industry: 'Hardware', application: 'Computing Devices', country: 'Global' },
                    { sector: 'Technology', industry: 'Cloud Services', application: 'Infrastructure', country: 'Global' },
                    { sector: 'Technology', industry: 'Cybersecurity', application: 'Data Protection', country: 'Global' },
                    { sector: 'Technology', industry: 'AI/ML', application: 'Automation', country: 'Global' },

                    // Education Sector
                    { sector: 'Education', industry: 'Higher Education', application: 'Academic Research', country: 'Global' },
                    { sector: 'Education', industry: 'E-Learning', application: 'Online Courses', country: 'Global' },
                    { sector: 'Education', industry: 'EdTech', application: 'Learning Platforms', country: 'Global' },

                    // Manufacturing Sector
                    { sector: 'Manufacturing', industry: 'Automotive', application: 'Vehicle Production', country: 'Global' },
                    { sector: 'Manufacturing', industry: 'Electronics', application: 'Consumer Electronics', country: 'Global' },
                    { sector: 'Manufacturing', industry: 'Aerospace', application: 'Aviation', country: 'Global' },

                    // Retail Sector
                    { sector: 'Retail', industry: 'E-commerce', application: 'Online Shopping', country: 'Global' },
                    { sector: 'Retail', industry: 'Fashion', application: 'Apparel', country: 'Global' },
                    { sector: 'Retail', industry: 'Consumer Goods', application: 'FMCG', country: 'Global' },

                    // Energy Sector
                    { sector: 'Energy', industry: 'Oil & Gas', application: 'Exploration', country: 'Global' },
                    { sector: 'Energy', industry: 'Renewable Energy', application: 'Solar/Wind', country: 'Global' },
                    { sector: 'Energy', industry: 'Utilities', application: 'Power Distribution', country: 'Global' }
                ];

                for (const data of sampleData) {
                    try {
                        await pool.query(
                            'INSERT INTO industry_sectors (sector, industry, application, country, status) VALUES ($1, $2, $3, $4, $5)',
                            [data.sector, data.industry, data.application, data.country, 'active']
                        );
                    } catch (e: any) {
                        if (!e.message.includes('duplicate')) {
                            console.warn('⚠️  Error seeding sector:', e.message.substring(0, 80));
                        }
                    }
                }
                console.log('✅ Industry sectors seeded');
            } else {
                console.log('✅ Industry sectors already exist');
            }
        } catch (e: any) {
            console.warn('⚠️  Could not seed industry_sectors:', (e as any).message);
        }

        // Seed content_types
        try {
            const typeCheck = await pool.query('SELECT COUNT(*) as count FROM content_types');
            const count = typeCheck.rows?.[0]?.count || 0;

            if (count === 0) {
                console.log('🌱 Seeding content_types...');
                const types = ['Blog Post', 'Video', 'Infographic', 'Whitepaper', 'Case Study', 'Webinar', 'Podcast', 'eBook'];
                for (const type of types) {
                    try {
                        await pool.query(
                            'INSERT INTO content_types (name, status) VALUES ($1, $2)',
                            [type, 'active']
                        );
                    } catch (e: any) {
                        if (!e.message.includes('duplicate')) {
                            console.warn('⚠️  Error seeding content type:', e.message.substring(0, 80));
                        }
                    }
                }
                console.log('✅ Content types seeded');
            }
        } catch (e: any) {
            console.warn('⚠️  Could not seed content_types:', (e as any).message);
        }

        // Seed asset_types
        try {
            const typeCheck = await pool.query('SELECT COUNT(*) as count FROM asset_types');
            const count = typeCheck.rows?.[0]?.count || 0;

            if (count === 0) {
                console.log('🌱 Seeding asset_types...');
                const types = ['Image', 'Video', 'Document', 'Audio', 'Archive', 'Code', 'Design'];
                for (const type of types) {
                    try {
                        await pool.query(
                            'INSERT INTO asset_types (name, status) VALUES ($1, $2)',
                            [type, 'active']
                        );
                    } catch (e: any) {
                        if (!e.message.includes('duplicate')) {
                            console.warn('⚠️  Error seeding asset type:', e.message.substring(0, 80));
                        }
                    }
                }
                console.log('✅ Asset types seeded');
            }
        } catch (e: any) {
            console.warn('⚠️  Could not seed asset_types:', (e as any).message);
        }

        // Seed asset_categories
        try {
            const catCheck = await pool.query('SELECT COUNT(*) as count FROM asset_categories');
            const count = catCheck.rows?.[0]?.count || 0;

            if (count === 0) {
                console.log('🌱 Seeding asset_categories...');
                const categories = ['Marketing', 'Sales', 'Support', 'Product', 'Brand', 'Social Media', 'Email'];
                for (const cat of categories) {
                    try {
                        await pool.query(
                            'INSERT INTO asset_categories (name, status) VALUES ($1, $2)',
                            [cat, 'active']
                        );
                    } catch (e: any) {
                        if (!e.message.includes('duplicate')) {
                            console.warn('⚠️  Error seeding asset category:', e.message.substring(0, 80));
                        }
                    }
                }
                console.log('✅ Asset categories seeded');
            }
        } catch (e: any) {
            console.warn('⚠️  Could not seed asset_categories:', (e as any).message);
        }

        // Seed asset_formats
        try {
            const formatCheck = await pool.query('SELECT COUNT(*) as count FROM asset_formats');
            const count = formatCheck.rows?.[0]?.count || 0;

            if (count === 0) {
                console.log('🌱 Seeding asset_formats...');
                const formats = ['JPG', 'PNG', 'GIF', 'PDF', 'MP4', 'MP3', 'DOCX', 'XLSX', 'SVG', 'WebP'];
                for (const fmt of formats) {
                    try {
                        await pool.query(
                            'INSERT INTO asset_formats (name, status) VALUES ($1, $2)',
                            [fmt, 'active']
                        );
                    } catch (e: any) {
                        if (!e.message.includes('duplicate')) {
                            console.warn('⚠️  Error seeding asset format:', e.message.substring(0, 80));
                        }
                    }
                }
                console.log('✅ Asset formats seeded');
            }
        } catch (e: any) {
            console.warn('⚠️  Could not seed asset_formats:', (e as any).message);
        }

        // Seed platforms
        try {
            const platformCheck = await pool.query('SELECT COUNT(*) as count FROM platforms');
            const count = platformCheck.rows?.[0]?.count || 0;

            if (count === 0) {
                console.log('🌱 Seeding platforms...');
                const platforms = ['Facebook', 'Twitter', 'LinkedIn', 'Instagram', 'TikTok', 'YouTube', 'Pinterest', 'Snapchat'];
                for (const plat of platforms) {
                    try {
                        await pool.query(
                            'INSERT INTO platforms (name, status) VALUES ($1, $2)',
                            [plat, 'active']
                        );
                    } catch (e: any) {
                        if (!e.message.includes('duplicate')) {
                            console.warn('⚠️  Error seeding platform:', e.message.substring(0, 80));
                        }
                    }
                }
                console.log('✅ Platforms seeded');
            }
        } catch (e: any) {
            console.warn('⚠️  Could not seed platforms:', (e as any).message);
        }

        // Seed countries
        try {
            const countryCheck = await pool.query('SELECT COUNT(*) as count FROM countries');
            const count = countryCheck.rows?.[0]?.count || 0;

            if (count === 0) {
                console.log('🌱 Seeding countries...');
                const countries = [
                    { name: 'United States', code: 'US' },
                    { name: 'United Kingdom', code: 'UK' },
                    { name: 'Canada', code: 'CA' },
                    { name: 'Australia', code: 'AU' },
                    { name: 'India', code: 'IN' },
                    { name: 'Germany', code: 'DE' },
                    { name: 'France', code: 'FR' },
                    { name: 'Japan', code: 'JP' },
                    { name: 'China', code: 'CN' },
                    { name: 'Brazil', code: 'BR' }
                ];
                for (const country of countries) {
                    try {
                        await pool.query(
                            'INSERT INTO countries (name, code, status) VALUES ($1, $2, $3)',
                            [country.name, country.code, 'active']
                        );
                    } catch (e: any) {
                        if (!e.message.includes('duplicate')) {
                            console.warn('⚠️  Error seeding country:', e.message.substring(0, 80));
                        }
                    }
                }
                console.log('✅ Countries seeded');
            }
        } catch (e: any) {
            console.warn('⚠️  Could not seed countries:', (e as any).message);
        }

        console.log('✅ Database seeding completed successfully');
        return true;
    } catch (error: any) {
        console.error('❌ Database seeding failed:', error.message);
        throw error;
    }
};
