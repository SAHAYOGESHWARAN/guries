const http = require('http');

const BASE_URL = 'http://localhost:3003/api/v1';

function makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: data ? JSON.parse(data) : null
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: data
                    });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Content Type Master API Tests\n');
    let passed = 0;
    let failed = 0;

    try {
        // Test 1: Get all content types
        console.log('Test 1: GET /content-types');
        let res = await makeRequest('GET', '/content-types');
        if (res.status === 200 && Array.isArray(res.data)) {
            console.log(`✅ PASS - Retrieved ${res.data.length} content types\n`);
            passed++;
        } else {
            console.log('❌ FAIL - Expected 200 with array\n');
            failed++;
        }

        // Test 2: Create new content type
        console.log('Test 2: POST /content-types (Create)');
        const newItem = {
            content_type: 'Test Article',
            category: 'Test Category',
            description: 'Test description',
            default_wordcount_min: 800,
            default_wordcount_max: 1500,
            default_graphic_requirements: JSON.stringify({
                required: true,
                types: ['Image'],
                dimensions: '1200x630'
            }),
            default_qc_checklist: JSON.stringify([
                { item: 'Grammar check', mandatory: true },
                { item: 'SEO check', mandatory: true }
            ]),
            seo_focus_keywords_required: 1,
            social_media_applicable: 1,
            estimated_creation_hours: 3.5,
            content_owner_role: 'Test Writer',
            use_in_campaigns: 1,
            status: 'active'
        };
        res = await makeRequest('POST', '/content-types', newItem);
        if (res.status === 201 && res.data.id) {
            console.log(`✅ PASS - Created with ID ${res.data.id}\n`);
            passed++;
            const createdId = res.data.id;

            // Test 3: Get specific content type
            console.log('Test 3: Verify created record');
            res = await makeRequest('GET', '/content-types');
            const found = res.data.find(i => i.id === createdId);
            if (found && found.content_type === 'Test Article') {
                console.log('✅ PASS - Record found and verified\n');
                passed++;
            } else {
                console.log('❌ FAIL - Record not found\n');
                failed++;
            }

            // Test 4: Update content type
            console.log('Test 4: PUT /content-types/:id (Update)');
            const updateData = {
                ...newItem,
                description: 'Updated description'
            };
            res = await makeRequest('PUT', `/content-types/${createdId}`, updateData);
            if (res.status === 200 && res.data.description === 'Updated description') {
                console.log('✅ PASS - Updated successfully\n');
                passed++;
            } else {
                console.log('❌ FAIL - Update failed\n');
                failed++;
            }

            // Test 5: Verify all fields
            console.log('Test 5: Verify all fields are saved');
            res = await makeRequest('GET', '/content-types');
            const updated = res.data.find(i => i.id === createdId);
            if (updated &&
                updated.default_wordcount_min === 800 &&
                updated.default_wordcount_max === 1500 &&
                updated.estimated_creation_hours === 3.5 &&
                updated.content_owner_role === 'Test Writer') {
                console.log('✅ PASS - All fields verified\n');
                passed++;
            } else {
                console.log('❌ FAIL - Fields not saved correctly\n');
                failed++;
            }

            // Test 6: Delete content type
            console.log('Test 6: DELETE /content-types/:id (Delete)');
            res = await makeRequest('DELETE', `/content-types/${createdId}`);
            if (res.status === 200 || res.status === 204) {
                console.log('✅ PASS - Deleted successfully\n');
                passed++;
            } else {
                console.log('❌ FAIL - Delete failed\n');
                failed++;
            }

            // Test 7: Verify deletion
            console.log('Test 7: Verify deletion');
            res = await makeRequest('GET', '/content-types');
            const deleted = res.data.find(i => i.id === createdId);
            if (!deleted || deleted.status === 'deleted') {
                console.log('✅ PASS - Record properly deleted\n');
                passed++;
            } else {
                console.log('❌ FAIL - Record should be deleted\n');
                failed++;
            }
        } else {
            console.log('❌ FAIL - Expected 201 with ID\n');
            failed++;
        }

        // Test 8: Validation - Missing required fields
        console.log('Test 8: Validation - Missing required fields');
        res = await makeRequest('POST', '/content-types', {
            category: 'Test'
            // Missing content_type
        });
        if (res.status === 400 || res.status === 500) {
            console.log('✅ PASS - Validation error returned\n');
            passed++;
        } else {
            console.log('❌ FAIL - Expected error for missing fields\n');
            failed++;
        }

        // Test 9: Check sample data
        console.log('Test 9: Verify sample data loaded');
        res = await makeRequest('GET', '/content-types');
        const hasBlog = res.data.some(i => i.content_type === 'Blog');
        const hasPillar = res.data.some(i => i.content_type === 'Pillar');
        if (hasBlog && hasPillar) {
            console.log('✅ PASS - Sample data verified\n');
            passed++;
        } else {
            console.log('❌ FAIL - Sample data not found\n');
            failed++;
        }

        // Test 10: Check JSON fields
        console.log('Test 10: Verify JSON fields are properly stored');
        res = await makeRequest('GET', '/content-types');
        const blogItem = res.data.find(i => i.content_type === 'Blog');
        if (blogItem && blogItem.default_graphic_requirements && blogItem.default_qc_checklist) {
            try {
                const graphics = JSON.parse(blogItem.default_graphic_requirements);
                const checklist = JSON.parse(blogItem.default_qc_checklist);
                if (graphics.required !== undefined && Array.isArray(checklist)) {
                    console.log('✅ PASS - JSON fields properly stored\n');
                    passed++;
                } else {
                    console.log('❌ FAIL - JSON fields malformed\n');
                    failed++;
                }
            } catch (e) {
                console.log('❌ FAIL - JSON parsing error\n');
                failed++;
            }
        } else {
            console.log('❌ FAIL - JSON fields missing\n');
            failed++;
        }

    } catch (error) {
        console.error('❌ Test Error:', error.message);
        failed++;
    }

    console.log('\n' + '='.repeat(50));
    console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(50));
    process.exit(failed > 0 ? 1 : 0);
}

runTests();
