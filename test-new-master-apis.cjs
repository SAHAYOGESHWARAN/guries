// Using built-in fetch (Node.js 18+)

const BASE_URL = 'http://localhost:3003/api/v1';

async function testAssetCategoryMaster() {
    console.log('Testing Asset Category Master API...');

    try {
        // Test GET all categories
        const response = await fetch(`${BASE_URL}/asset-category-master`);
        const categories = await response.json();
        console.log('✅ GET /asset-category-master:', categories.length, 'categories found');

        // Test GET categories by brand
        const pubricaResponse = await fetch(`${BASE_URL}/asset-category-master/brand/Pubrica`);
        const pubricaCategories = await pubricaResponse.json();
        console.log('✅ GET /asset-category-master/brand/Pubrica:', pubricaCategories.length, 'categories found');

        // Test POST new category
        const newCategory = {
            brand: 'Pubrica',
            category_name: 'Test Category',
            word_count: 500
        };

        const createResponse = await fetch(`${BASE_URL}/asset-category-master`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCategory)
        });

        if (createResponse.ok) {
            const created = await createResponse.json();
            console.log('✅ POST /asset-category-master: Category created with ID', created.id);

            // Test PUT update
            const updateResponse = await fetch(`${BASE_URL}/asset-category-master/${created.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newCategory,
                    word_count: 600
                })
            });

            if (updateResponse.ok) {
                console.log('✅ PUT /asset-category-master: Category updated successfully');
            }

            // Test DELETE
            const deleteResponse = await fetch(`${BASE_URL}/asset-category-master/${created.id}`, {
                method: 'DELETE'
            });

            if (deleteResponse.ok) {
                console.log('✅ DELETE /asset-category-master: Category deleted successfully');
            }
        }

    } catch (error) {
        console.error('❌ Asset Category Master API test failed:', error.message);
    }
}

async function testAssetTypeMaster() {
    console.log('\nTesting Asset Type Master API...');

    try {
        // Test GET all types
        const response = await fetch(`${BASE_URL}/asset-type-master`);
        const types = await response.json();
        console.log('✅ GET /asset-type-master:', types.length, 'types found');

        // Test GET types by brand
        const pubricaResponse = await fetch(`${BASE_URL}/asset-type-master/brand/Pubrica`);
        const pubricaTypes = await pubricaResponse.json();
        console.log('✅ GET /asset-type-master/brand/Pubrica:', pubricaTypes.length, 'types found');

        // Test POST new type
        const newType = {
            brand: 'Pubrica',
            asset_type_name: 'Test Type',
            word_count: 400
        };

        const createResponse = await fetch(`${BASE_URL}/asset-type-master`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newType)
        });

        if (createResponse.ok) {
            const created = await createResponse.json();
            console.log('✅ POST /asset-type-master: Type created with ID', created.id);

            // Test PUT update
            const updateResponse = await fetch(`${BASE_URL}/asset-type-master/${created.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newType,
                    word_count: 500
                })
            });

            if (updateResponse.ok) {
                console.log('✅ PUT /asset-type-master: Type updated successfully');
            }

            // Test DELETE
            const deleteResponse = await fetch(`${BASE_URL}/asset-type-master/${created.id}`, {
                method: 'DELETE'
            });

            if (deleteResponse.ok) {
                console.log('✅ DELETE /asset-type-master: Type deleted successfully');
            }
        }

    } catch (error) {
        console.error('❌ Asset Type Master API test failed:', error.message);
    }
}

async function runTests() {
    console.log('🧪 Testing New Master Table APIs\n');

    await testAssetCategoryMaster();
    await testAssetTypeMaster();

    console.log('\n✨ All tests completed!');
}

runTests();