/**
 * Slug Generation Tests
 * Tests the auto-generation of URL slugs from service names
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

describe('Slug Generation', () => {
    test('should convert simple service name to slug', () => {
        const input = 'Web Presence';
        const expected = 'web-presence';
        expect(generateSlug(input)).toBe(expected);
    });

    test('should handle multiple spaces', () => {
        const input = 'Content   Marketing   Strategy';
        const expected = 'content-marketing-strategy';
        expect(generateSlug(input)).toBe(expected);
    });

    test('should remove special characters', () => {
        const input = 'SEO & Analytics!';
        const expected = 'seo-and-analytics';
        expect(generateSlug(input)).toBe(expected);
    });

    test('should handle ampersand', () => {
        const input = 'Design & Development';
        const expected = 'design-and-development';
        expect(generateSlug(input)).toBe(expected);
    });

    test('should remove leading/trailing hyphens', () => {
        const input = '---Web Design---';
        const expected = 'web-design';
        expect(generateSlug(input)).toBe(expected);
    });

    test('should convert to lowercase', () => {
        const input = 'SOCIAL MEDIA MARKETING';
        const expected = 'social-media-marketing';
        expect(generateSlug(input)).toBe(expected);
    });

    test('should handle mixed case with special chars', () => {
        const input = 'Email Marketing (Pro)';
        const expected = 'email-marketing-pro';
        expect(generateSlug(input)).toBe(expected);
    });

    test('should handle underscores', () => {
        const input = 'Brand_Identity_Design';
        const expected = 'brand-identity-design';
        expect(generateSlug(input)).toBe(expected);
    });

    test('should handle numbers', () => {
        const input = 'Web 2.0 Services';
        const expected = 'web-20-services';
        expect(generateSlug(input)).toBe(expected);
    });

    test('should return empty string for empty input', () => {
        expect(generateSlug('')).toBe('');
        expect(generateSlug('   ')).toBe('');
    });

    test('should truncate to 100 characters', () => {
        const input = 'a'.repeat(150);
        expect(generateSlug(input).length).toBeLessThanOrEqual(100);
    });

    test('should handle real-world examples', () => {
        const testCases = [
            { input: 'Publication Support', expected: 'publication-support' },
            { input: 'SEO Optimization', expected: 'seo-optimization' },
            { input: 'Content Marketing Campaign', expected: 'content-marketing-campaign' },
            { input: 'Social Media Strategy', expected: 'social-media-strategy' },
            { input: 'Brand Identity & Design', expected: 'brand-identity-and-design' },
            { input: 'Email Marketing (Automation)', expected: 'email-marketing-automation' },
            { input: 'Analytics & Reporting', expected: 'analytics-and-reporting' },
            { input: 'Video Production/Editing', expected: 'video-productionediting' },
        ];

        testCases.forEach(({ input, expected }) => {
            expect(generateSlug(input)).toBe(expected);
        });
    });
});

describe('Full URL Generation', () => {
    test('should generate correct full URL from slug', () => {
        const slug = 'web-presence';
        const fullUrl = `/services/${slug}`;
        expect(fullUrl).toBe('/services/web-presence');
    });

    test('should handle complex slugs in URL', () => {
        const slug = generateSlug('Content Marketing & Analytics');
        const fullUrl = `/services/${slug}`;
        expect(fullUrl).toBe('/services/content-marketing-and-analytics');
    });
});
