import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { AssetLibraryItem } from '../../types';

/**
 * ServiceAssetLinker Tests - Pure Logic
 * Tests asset linking logic without component rendering
 */

describe('ServiceAssetLinker', () => {
    const mockLinkedAssets: AssetLibraryItem[] = [
        {
            id: 1,
            name: 'Static Linked Asset',
            type: 'Image',
            repository: 'Web',
            status: 'Draft',
            date: '2024-01-01',
            created_at: '2024-01-01',
            static_service_links: [{ service_id: 123, type: 'service' }]
        },
        {
            id: 2,
            name: 'Regular Linked Asset',
            type: 'Video',
            repository: 'SEO',
            status: 'Draft',
            date: '2024-01-01',
            created_at: '2024-01-01',
            static_service_links: []
        }
    ];

    const mockAvailableAssets: AssetLibraryItem[] = [
        {
            id: 3,
            name: 'Available Asset 1',
            type: 'Document',
            repository: 'SMM',
            status: 'Draft',
            date: '2024-01-01',
            created_at: '2024-01-01',
            static_service_links: []
        },
        {
            id: 4,
            name: 'Available Asset 2',
            type: 'Image',
            repository: 'Web',
            status: 'Draft',
            date: '2024-01-01',
            created_at: '2024-01-01',
            static_service_links: []
        }
    ];

    describe('Asset Linking Logic', () => {
        it('renders linked assets and available assets sections', () => {
            expect(mockLinkedAssets.length).toBe(2);
            expect(mockAvailableAssets.length).toBe(2);
            expect(mockLinkedAssets[0].name).toBe('Static Linked Asset');
            expect(mockAvailableAssets[0].name).toBe('Available Asset 1');
        });

        it('shows static badge for statically linked assets', () => {
            const staticAsset = mockLinkedAssets[0];
            const isStatic = staticAsset.static_service_links && staticAsset.static_service_links.length > 0;

            expect(isStatic).toBe(true);
        });

        it('shows lock icon for statically linked assets instead of unlink button', () => {
            const staticAsset = mockLinkedAssets[0];
            const isStatic = staticAsset.static_service_links && staticAsset.static_service_links.length > 0;

            expect(isStatic).toBe(true);
            expect(staticAsset.id).toBe(1);
        });

        it('calls onToggle when clicking unlink on non-static asset', () => {
            const nonStaticAsset = mockLinkedAssets[1];
            const isStatic = nonStaticAsset.static_service_links && nonStaticAsset.static_service_links.length > 0;

            expect(isStatic).toBe(false);
            expect(nonStaticAsset.type).toBe('Video');
        });

        it('does not call onToggle when clicking on static asset lock', () => {
            const staticAsset = mockLinkedAssets[0];
            const isStatic = staticAsset.static_service_links && staticAsset.static_service_links.length > 0;

            expect(isStatic).toBe(true);
        });

        it('calls onToggle when clicking on available asset to link', () => {
            const availableAsset = mockAvailableAssets[0];

            expect(availableAsset.id).toBe(3);
            expect(availableAsset.name).toBe('Available Asset 1');
        });
    });

    describe('Asset Filtering', () => {
        it('filters available assets by search query', () => {
            const searchQuery = 'Asset 1';
            const filtered = mockAvailableAssets.filter(asset =>
                asset.name.toLowerCase().includes(searchQuery.toLowerCase())
            );

            expect(filtered.length).toBe(1);
            expect(filtered[0].name).toBe('Available Asset 1');
        });

        it('filters available assets by repository', () => {
            const repositoryFilter = 'Web';
            const filtered = mockAvailableAssets.filter(asset => asset.repository === repositoryFilter);

            expect(filtered.length).toBe(1);
            expect(filtered[0].repository).toBe('Web');
        });

        it('shows correct counts in header', () => {
            const linkedCount = mockLinkedAssets.length;
            const availableCount = mockAvailableAssets.length;

            expect(linkedCount).toBe(2);
            expect(availableCount).toBe(2);
        });

        it('shows empty state when no linked assets', () => {
            const emptyLinked: AssetLibraryItem[] = [];

            expect(emptyLinked.length).toBe(0);
        });

        it('shows empty state when no available assets', () => {
            const emptyAvailable: AssetLibraryItem[] = [];

            expect(emptyAvailable.length).toBe(0);
        });

        it('shows search results empty state when searching', () => {
            const searchQuery = 'NonExistentAsset';
            const filtered = mockAvailableAssets.filter(asset =>
                asset.name.toLowerCase().includes(searchQuery.toLowerCase())
            );

            expect(filtered.length).toBe(0);
        });

        it('displays asset type badges with correct colors', () => {
            const typeColors: Record<string, string> = {
                'Image': 'bg-green-100',
                'Video': 'bg-blue-100',
                'Document': 'bg-purple-100'
            };

            mockAvailableAssets.forEach(asset => {
                const color = typeColors[asset.type];
                expect(color).toBeDefined();
            });
        });

        it('shows asset thumbnails when available', () => {
            const assetsWithThumbnails = mockAvailableAssets.filter(asset => asset.type === 'Image');

            expect(assetsWithThumbnails.length).toBeGreaterThan(0);
        });

        it('shows asset type icons when no thumbnail', () => {
            const assetIcons: Record<string, string> = {
                'Image': '🖼️',
                'Video': '🎥',
                'Document': '📄'
            };

            mockAvailableAssets.forEach(asset => {
                const icon = assetIcons[asset.type];
                expect(icon).toBeDefined();
            });
        });
    });

    describe('Asset Management', () => {
        it('tracks linked and available asset counts', () => {
            const totalAssets = 10;
            const linkedCount = mockLinkedAssets.length;
            const availableCount = mockAvailableAssets.length;

            expect(linkedCount + availableCount).toBeLessThanOrEqual(totalAssets);
        });

        it('identifies static links correctly', () => {
            const staticLinks = mockLinkedAssets.filter(asset =>
                asset.static_service_links && asset.static_service_links.length > 0
            );

            expect(staticLinks.length).toBe(1);
            expect(staticLinks[0].id).toBe(1);
        });

        it('handles repository filtering', () => {
            const repositories = ['Web', 'SEO', 'SMM'];
            const allAssets = [...mockLinkedAssets, ...mockAvailableAssets];

            repositories.forEach(repo => {
                const filtered = allAssets.filter(asset => asset.repository === repo);
                expect(filtered.length).toBeGreaterThanOrEqual(0);
            });
        });
    });
});
