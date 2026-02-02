/**
 * Test URL Slug Generation
 * Simple test to verify the URL generation functionality
 */

// Test the slug generation logic
function generateSlug(text) {
    if (!text) return '';
    
    return text
        .toLowerCase()
        .replace(/[&]/g, 'and')
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100);
}

function generateFullUrl(slug, type, parentSlug) {
    if (!slug) return '';
    
    switch (type) {
        case 'service':
            return `/services/${slug}`;
        case 'subservice':
            if (parentSlug) {
                return `/services/${parentSlug}/${slug}`;
            }
            return `/services/${slug}`;
        default:
            return `/${slug}`;
    }
}

// Test cases
console.log('🧪 Testing URL Slug Generation\n');

const testCases = [
    {
        title: 'Digital Marketing Services',
        type: 'service',
        expected: 'digital-marketing-services'
    },
    {
        title: 'Web Development & Design',
        type: 'service',
        expected: 'web-development-and-design'
    },
    {
        title: 'SEO Optimization',
        type: 'subservice',
        parentSlug: 'digital-marketing',
        expected: 'seo-optimization'
    },
    {
        title: 'About Us',
        type: 'page',
        expected: 'about-us'
    },
    {
        title: 'Company Logo',
        type: 'asset',
        expected: 'company-logo'
    }
];

testCases.forEach((testCase, index) => {
    const slug = generateSlug(testCase.title);
    const fullUrl = generateFullUrl(slug, testCase.type, testCase.parentSlug);
    
    console.log(`Test ${index + 1}: ${testCase.title}`);
    console.log(`  Type: ${testCase.type}`);
    console.log(`  Generated Slug: ${slug}`);
    console.log(`  Expected Slug: ${testCase.expected}`);
    console.log(`  Match: ${slug === testCase.expected ? '✅' : '❌'}`);
    console.log(`  Full URL: ${fullUrl}`);
    console.log('');
});

// Test edge cases
console.log('🔧 Testing Edge Cases\n');

const edgeCases = [
    '',
    '   ',
    'SPECIAL @#$% CHARACTERS',
    'Multiple   Spaces   Here',
    '123 Numbers 456',
    'Very Long Title That Should Be Truncated To One Hundred Characters Maximum Because That Is The Limit We Set For SEO Purposes And Readability'
];

edgeCases.forEach((testCase, index) => {
    const slug = generateSlug(testCase);
    console.log(`Edge Case ${index + 1}: "${testCase}"`);
    console.log(`  Generated: "${slug}"`);
    console.log(`  Length: ${slug.length}`);
    console.log('');
});

console.log('✅ URL Slug Generation Test Complete!');
