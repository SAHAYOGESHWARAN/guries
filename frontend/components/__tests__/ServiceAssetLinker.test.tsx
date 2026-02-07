import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ServiceAssetLinker from '../ServiceAssetLinker';
import type { AssetLibraryItem } from '../../types';

// Mock fetch for repositories
global.fetch = vi.fn();

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

    const defaultProps = {
        linkedAssets: mockLinkedAssets,
        availableAssets: mockAvailableAssets,
        assetSearch: '',
        setAssetSearch: vi.fn(),
        onToggle: vi.fn(),
        totalAssets: 10,
        repositoryFilter: 'All',
        setRepositoryFilter: vi.fn(),
        allAssets: [...mockLinkedAssets, ...mockAvailableAssets],
        staticLinks: [1] // Asset ID 1 is statically linked
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
            ok: true,
            json: async () => [{ repository: 'Web' }, { repository: 'SEO' }, { repository: 'SMM' }]
        });
    });

    it('renders linked assets and available assets sections', () => {
        render(<ServiceAssetLinker {...defaultProps} />);

        expect(screen.getByText('Asset Library Management')).toBeInTheDocument();
        expect(screen.getByText('Linked Assets')).toBeInTheDocument();
        expect(screen.getByText('Asset Library')).toBeInTheDocument();
        expect(screen.getByText('Static Linked Asset')).toBeInTheDocument();
        expect(screen.getByText('Regular Linked Asset')).toBeInTheDocument();
        expect(screen.getByText('Available Asset 1')).toBeInTheDocument();
        expect(screen.getByText('Available Asset 2')).toBeInTheDocument();
    });

    it('shows static badge for statically linked assets', () => {
        render(<ServiceAssetLinker {...defaultProps} />);

        const staticBadge = screen.getByText('🔒 Static');
        expect(staticBadge).toBeInTheDocument();
        expect(staticBadge).toHaveClass('bg-amber-100', 'text-amber-700');
    });

    it('shows lock icon for statically linked assets instead of unlink button', () => {
        render(<ServiceAssetLinker {...defaultProps} />);

        // Static linked asset should have lock icon
        const lockIcon = document.querySelector('[title="Static link - cannot be removed (created during upload)"]');
        expect(lockIcon).toBeInTheDocument();

        // Regular linked asset should have unlink button
        const unlinkButtons = screen.getAllByTitle('Unlink this asset');
        expect(unlinkButtons).toHaveLength(1); // Only one regular asset
    });

    it('calls onToggle when clicking unlink on non-static asset', () => {
        render(<ServiceAssetLinker {...defaultProps} />);

        const unlinkButton = screen.getByTitle('Unlink this asset');
        fireEvent.click(unlinkButton);

        expect(defaultProps.onToggle).toHaveBeenCalledWith(
            expect.objectContaining({ id: 2, name: 'Regular Linked Asset' })
        );
    });

    it('does not call onToggle when clicking on static asset lock', () => {
        render(<ServiceAssetLinker {...defaultProps} />);

        const lockIcon = document.querySelector('[title="Static link - cannot be removed (created during upload)"]');
        if (lockIcon) {
            fireEvent.click(lockIcon);
        }

        expect(defaultProps.onToggle).not.toHaveBeenCalled();
    });

    it('calls onToggle when clicking on available asset to link', () => {
        render(<ServiceAssetLinker {...defaultProps} />);

        const availableAsset = screen.getByText('Available Asset 1');
        fireEvent.click(availableAsset.closest('[role="button"]') || availableAsset);

        expect(defaultProps.onToggle).toHaveBeenCalledWith(
            expect.objectContaining({ id: 3, name: 'Available Asset 1' })
        );
    });

    it('filters available assets by search query', () => {
        const propsWithSearch = {
            ...defaultProps,
            assetSearch: 'Available Asset 1'
        };

        render(<ServiceAssetLinker {...propsWithSearch} />);

        expect(screen.getByText('Available Asset 1')).toBeInTheDocument();
        expect(screen.queryByText('Available Asset 2')).not.toBeInTheDocument();
    });

    it('filters available assets by repository', () => {
        const propsWithFilter = {
            ...defaultProps,
            repositoryFilter: 'Web'
        };

        render(<ServiceAssetLinker {...propsWithFilter} />);

        expect(screen.getByText('Available Asset 2')).toBeInTheDocument(); // Web repository
        expect(screen.queryByText('Available Asset 1')).not.toBeInTheDocument(); // SMM repository
    });

    it('shows correct counts in header', () => {
        render(<ServiceAssetLinker {...defaultProps} />);

        expect(screen.getByText('2')).toBeInTheDocument(); // Linked assets count
        expect(screen.getByText('2')).toBeInTheDocument(); // Available assets count
    });

    it('shows empty state when no linked assets', () => {
        const propsWithNoLinked = {
            ...defaultProps,
            linkedAssets: []
        };

        render(<ServiceAssetLinker {...propsWithNoLinked} />);

        expect(screen.getByText('No Assets Linked')).toBeInTheDocument();
        expect(screen.getByText('Search and link media assets from the Asset Library to connect them with this service.')).toBeInTheDocument();
    });

    it('shows empty state when no available assets', () => {
        const propsWithNoAvailable = {
            ...defaultProps,
            availableAssets: []
        };

        render(<ServiceAssetLinker {...propsWithNoAvailable} />);

        expect(screen.getByText('All Assets Linked')).toBeInTheDocument();
        expect(screen.getByText('All available assets are already linked to this service.')).toBeInTheDocument();
    });

    it('shows search results empty state when searching', () => {
        const propsWithSearch = {
            ...defaultProps,
            assetSearch: 'NonExistentAsset'
        };

        render(<ServiceAssetLinker {...propsWithSearch} />);

        expect(screen.getByText('No Matching Assets')).toBeInTheDocument();
        expect(screen.getByText('No assets found matching "NonExistentAsset". Try a different search term.')).toBeInTheDocument();
    });

    it('displays asset type badges with correct colors', () => {
        render(<ServiceAssetLinker {...defaultProps} />);

        const imageBadge = screen.getByText('Image');
        expect(imageBadge).toHaveClass('bg-green-100', 'text-green-700');

        const videoBadge = screen.getByText('Video');
        expect(videoBadge).toHaveClass('bg-red-100', 'text-red-700');

        const documentBadge = screen.getByText('Document');
        expect(documentBadge).toHaveClass('bg-orange-100', 'text-orange-700');
    });

    it('shows asset thumbnails when available', () => {
        const assetsWithThumbnails = [
            {
                ...mockLinkedAssets[0],
                thumbnail_url: 'https://example.com/thumb.jpg'
            }
        ];

        const propsWithThumbnails = {
            ...defaultProps,
            linkedAssets: assetsWithThumbnails
        };

        render(<ServiceAssetLinker {...propsWithThumbnails} />);

        const thumbnail = screen.getByAltText('Static Linked Asset');
        expect(thumbnail).toBeInTheDocument();
        expect(thumbnail).toHaveAttribute('src', 'https://example.com/thumb.jpg');
    });

    it('shows asset type icons when no thumbnail', () => {
        render(<ServiceAssetLinker {...defaultProps} />);

        // Should show emoji icons for assets without thumbnails
        const imageIcon = screen.getByText('🖼️');
        const videoIcon = screen.getByText('🎥');
        const documentIcon = screen.getByText('📄');

        expect(imageIcon).toBeInTheDocument();
        expect(videoIcon).toBeInTheDocument();
        expect(documentIcon).toBeInTheDocument();
    });
});
