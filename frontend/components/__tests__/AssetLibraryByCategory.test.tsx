import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssetLibraryByCategory from '../AssetLibraryByCategory';

describe('AssetLibraryByCategory - Web Asset Display', () => {
    const mockRepositories = [
        { repository: 'Web' },
        { repository: 'SEO' },
        { repository: 'SMM' }
    ];

    const mockWebAssets = [
        {
            id: 1,
            name: 'Blog Banner 1',
            type: 'Blog Banner',
            asset_category: 'Graphics',
            status: 'Published',
            workflow_stage: 'Published',
            qc_status: 'Approved',
            thumbnail_url: 'https://example.com/thumb1.jpg',
            application_type: 'web',
            linking_active: true,
            seo_score: 85,
            grammar_score: 90
        },
        {
            id: 2,
            name: 'Infographic 1',
            type: 'Infographic',
            asset_category: 'Graphics',
            status: 'Draft',
            workflow_stage: 'In Progress',
            qc_status: '',
            thumbnail_url: 'https://example.com/thumb2.jpg',
            application_type: 'web',
            linking_active: false,
            seo_score: 75,
            grammar_score: 80
        }
    ];

    const mockSeoAssets = [
        {
            id: 10,
            name: 'SEO Article 1',
            type: 'Blog Post',
            asset_category: 'Content',
            status: 'Published',
            application_type: 'seo',
            linking_active: true
        }
    ];

    const mockSmmAssets = [
        {
            id: 20,
            name: 'Social Post 1',
            type: 'Social Post',
            asset_category: 'Social',
            status: 'Published',
            application_type: 'smm',
            linking_active: true
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render component without crashing', async () => {
        global.fetch = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockRepositories
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockWebAssets
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockSeoAssets
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockSmmAssets
            });

        render(
            <AssetLibraryByCategory
                linkedAssets={[]}
                onToggle={vi.fn()}
                totalAssets={13}
            />
        );

        await waitFor(() => {
            expect(screen.getByText(/Asset Library by Category/)).toBeInTheDocument();
        });
    });

    it('should fetch repositories on mount', async () => {
        global.fetch = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockRepositories
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockWebAssets
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockSeoAssets
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockSmmAssets
            });

        render(
            <AssetLibraryByCategory
                linkedAssets={[]}
                onToggle={vi.fn()}
                totalAssets={13}
            />
        );

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/asset-categories/repositories')
            );
        });
    });

    it('should display web assets', async () => {
        global.fetch = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockRepositories
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockWebAssets
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockSeoAssets
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockSmmAssets
            });

        render(
            <AssetLibraryByCategory
                linkedAssets={[]}
                onToggle={vi.fn()}
                totalAssets={13}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Blog Banner 1')).toBeInTheDocument();
            expect(screen.getByText('Infographic 1')).toBeInTheDocument();
        });
    });

    it('should display Web tab with correct count', async () => {
        global.fetch = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockRepositories
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockWebAssets
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockSeoAssets
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockSmmAssets
            });

        render(
            <AssetLibraryByCategory
                linkedAssets={[]}
                onToggle={vi.fn()}
                totalAssets={13}
            />
        );

        await waitFor(() => {
            expect(screen.getByText(/Web \(2\)/)).toBeInTheDocument();
        });
    });

    it('should handle empty asset responses', async () => {
        global.fetch = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockRepositories
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => []
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => []
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => []
            });

        render(
            <AssetLibraryByCategory
                linkedAssets={[]}
                onToggle={vi.fn()}
                totalAssets={0}
            />
        );

        await waitFor(() => {
            expect(screen.getByText(/No assets found/)).toBeInTheDocument();
        });
    });

    it('should handle fetch errors gracefully', async () => {
        global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

        render(
            <AssetLibraryByCategory
                linkedAssets={[]}
                onToggle={vi.fn()}
                totalAssets={0}
            />
        );

        await waitFor(() => {
            expect(screen.getByText(/Asset Library by Category/)).toBeInTheDocument();
        });
    });
});
