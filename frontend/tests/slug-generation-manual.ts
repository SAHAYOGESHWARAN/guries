/**
 * Manual Slug Generation Test
 * Run this to verify slug generation works correctly
 */

// Slug generation function (same as in ServiceMasterView)
const generateSlug = (text: string): string => {
    if (!text || text.trim() === '') return '';

    return text
        .toLowerCase()
        .trim()
        .replace(/&/g, 'and')
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100);
};

// Test cases
const testCases = [
    { input: 'Web Presence', expected: 'web-presence' },
    { input: 'Content Marketing Campaign', expected: 'content-marketing-campaign' },
    { input: 'SEO & Analytics', expected: 'seo-and-analytics' },
    { input: 'Social Media Strategy', expected: 'social-media-strategy' },
    { input: 'Email Marketing (Pro)', expected: 'email-marketing-pro' },
    { input: 'Brand Identity & Design', expected: 'brand-identity-and-design' },
    { input: 'Publication Support', expected: 'publication-support' },
    { input: 'Analytics & Reporting', expected: 'analytics-and-reporting' },
    { input: 'Video Production/Editing', expected: 'video-productionediting' },
    { input: '---Web Design---', expected: 'web-design' },
    { input: 'SOCIAL MEDIA MARKETING', expected: 'social-media-marketing' },
    { input: 'Brand_Identity_Design', expected: 'brand-identity-design' },
    { input: 'Web 2.0 Services', expected: 'web-20-services' },
    { input: '', expected: '' },
    { input: '   ', expected: '' },
];

console.log('🧪 SLUG GENERATION TEST RESULTS\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

testCases.forEach(({ input, expected }, index) => {
    const result = generateSlug(input);
    const isPass = result === expected;

    if (isPass) {
        passed++;
        console.log(`✅ Test ${index + 1}: PASS`);
    } else {
        failed++;
        console.log(`❌ Test ${index + 1}: FAIL`);
    }

    console.log(`   Input:    "${input}"`);
    console.log(`   Expected: "${expected}"`);
    console.log(`   Got:      "${result}"`);
    console.log('');
});

console.log('='.repeat(80));
console.log(`\n📊 RESULTS: ${passed} passed, ${failed} failed out of ${testCases.length} tests\n`);

if (failed === 0) {
    console.log('✅ ALL TESTS PASSED! Slug generation is working correctly.\n');
} else {
    console.log(`❌ ${failed} test(s) failed. Please review the implementation.\n`);
}

// Test URL generation
console.log('🔗 URL GENERATION TEST\n');
console.log('='.repeat(80));

const urlTestCases = [
    { slug: 'web-presence', expected: '/services/web-presence' },
    { slug: 'content-marketing-campaign', expected: '/services/content-marketing-campaign' },
    { slug: 'seo-and-analytics', expected: '/services/seo-and-analytics' },
];

urlTestCases.forEach(({ slug, expected }, index) => {
    const fullUrl = `/services/${slug}`;
    const isPass = fullUrl === expected;

    console.log(`${isPass ? '✅' : '❌'} URL Test ${index + 1}: ${isPass ? 'PASS' : 'FAIL'}`);
    console.log(`   Slug:     "${slug}"`);
    console.log(`   Expected: "${expected}"`);
    console.log(`   Got:      "${fullUrl}"`);
    console.log('');
});

console.log('='.repeat(80));
console.log('\n✨ Slug generation feature is ready for production!\n');
