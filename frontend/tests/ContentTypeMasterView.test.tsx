import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContentTypeMasterView from '../views/ContentTypeMasterView';
import * as useDataModule from '../hooks/useData';

vi.mock('../hooks/useData', () => ({
    useData: vi.fn()
}));

const mockData = [
    {
        id: 1,
        content_type: 'Blog',
        category: 'Editorial',
        description: 'Blog post for SEO',
        default_wordcount_min: 1500,
        default_wordcount_max: 2500,
        default_graphic_requirements: JSON.stringify({ required: true, types: ['Image'] }),
        default_qc_checklist: JSON.stringify([{ item: 'Grammar check', mandatory: true }]),
        seo_focus_keywords_required: 1,
        social_media_applicable: 1,
        estimated_creation_hours: 4.5,
        content_owner_role: 'Content Writer',
        use_in_campaigns: 1,
        status: 'active',
        created_at: '2025-01-17T00:00:00Z',
        updated_at: '2025-01-17T00:00:00Z'
    },
    {
        id: 2,
        content_type: 'Pillar',
        category: 'Core',
        description: 'Comprehensive pillar page',
        default_wordcount_min: 3000,
        default_wordcount_max: 5000,
        default_graphic_requirements: JSON.stringify({ required: true, types: ['Infographic'] }),
        default_qc_checklist: JSON.stringify([{ item: 'SEO check', mandatory: true }]),
        seo_focus_keywords_required: 1,
        social_media_applicable: 1,
        estimated_creation_hours: 8.0,
        content_owner_role: 'Senior Writer',
        use_in_campaigns: 1,
        status: 'active',
        created_at: '2025-01-17T00:00:00Z',
        updated_at: '2025-01-17T00:00:00Z'
    }
];

describe('ContentTypeMasterView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the view with title and description', () => {
        vi.mocked(useDataModule.useData).mockReturnValue({
            data: mockData,
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
            loading: false,
            error: null
        } as any);

        render(<ContentTypeMasterView />);

        expect(screen.getByText('Content Type Master')).toBeInTheDocument();
        expect(screen.getByText(/Manage content types, categories/)).toBeInTheDocument();
    });

    it('displays all records in table', () => {
        vi.mocked(useDataModule.useData).mockReturnValue({
            data: mockData,
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
            loading: false,
            error: null
        } as any);

        render(<ContentTypeMasterView />);

        expect(screen.getByText('Blog')).toBeInTheDocument();
        expect(screen.getByText('Pillar')).toBeInTheDocument();
        expect(screen.getByText('Editorial')).toBeInTheDocument();
        expect(screen.getByText('Core')).toBeInTheDocument();
    });

    it('displays word count range', () => {
        vi.mocked(useDataModule.useData).mockReturnValue({
            data: mockData,
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
            loading: false,
            error: null
        } as any);

        render(<ContentTypeMasterView />);

        expect(screen.getByText('1500-2500')).toBeInTheDocument();
        expect(screen.getByText('3000-5000')).toBeInTheDocument();
    });

    it('displays creation hours', () => {
        vi.mocked(useDataModule.useData).mockReturnValue({
            data: mockData,
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
            loading: false,
            error: null
        } as any);

        render(<ContentTypeMasterView />);

        expect(screen.getByText('4.5h')).toBeInTheDocument();
        expect(screen.getByText('8h')).toBeInTheDocument();
    });

    it('filters data by search query', async () => {
        vi.mocked(useDataModule.useData).mockReturnValue({
            data: mockData,
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
            loading: false,
            error: null
        } as any);

        render(<ContentTypeMasterView />);

        const searchInput = screen.getByPlaceholderText(/Search content types/);
        await userEvent.type(searchInput, 'Pillar');

        expect(screen.getByText('Pillar')).toBeInTheDocument();
        expect(screen.queryByText('Blog')).not.toBeInTheDocument();
    });

    it('filters data by category', async () => {
        vi.mocked(useDataModule.useData).mockReturnValue({
            data: mockData,
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
            loading: false,
            error: null
        } as any);

        render(<ContentTypeMasterView />);

        const categorySelect = screen.getAllByDisplayValue('All Categories')[0];
        await userEvent.selectOptions(categorySelect, 'Core');

        expect(screen.getByText('Pillar')).toBeInTheDocument();
        expect(screen.queryByText('Blog')).not.toBeInTheDocument();
    });

    it('opens modal when Add Content Type button is clicked', async () => {
        vi.mocked(useDataModule.useData).mockReturnValue({
            data: mockData,
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
            loading: false,
            error: null
        } as any);

        render(<ContentTypeMasterView />);

        const addButton = screen.getByText('Add Content Type');
        await userEvent.click(addButton);

        expect(screen.getByText('Add New Content Type')).toBeInTheDocument();
    });

    it('opens modal with data when Edit button is clicked', async () => {
        vi.mocked(useDataModule.useData).mockReturnValue({
            data: mockData,
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
            loading: false,
            error: null
        } as any);

        render(<ContentTypeMasterView />);

        const editButtons = screen.getAllByTitle('Edit');
        await userEvent.click(editButtons[0]);

        expect(screen.getByText('Edit Content Type')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Blog')).toBeInTheDocument();
    });

    it('creates new record when form is submitted', async () => {
        const createMock = vi.fn();
        vi.mocked(useDataModule.useData).mockReturnValue({
            data: mockData,
            create: createMock,
            update: vi.fn(),
            remove: vi.fn(),
            loading: false,
            error: null
        } as any);

        render(<ContentTypeMasterView />);

        const addButton = screen.getByText('Add Content Type');
        await userEvent.click(addButton);

        const contentTypeInput = screen.getByPlaceholderText('e.g., Blog, Pillar, Landing Page');
        const categoryInput = screen.getByPlaceholderText('e.g., Editorial, Core, Supporting');

        await userEvent.type(contentTypeInput, 'Test Type');
        await userEvent.type(categoryInput, 'Test Category');

        const createButton = screen.getByText('Create');
        await userEvent.click(createButton);

        await waitFor(() => {
            expect(createMock).toHaveBeenCalled();
        });
    });

    it('updates record when form is submitted in edit mode', async () => {
        const updateMock = vi.fn();
        vi.mocked(useDataModule.useData).mockReturnValue({
            data: mockData,
            create: vi.fn(),
            update: updateMock,
            remove: vi.fn(),
            loading: false,
            error: null
        } as any);

        render(<ContentTypeMasterView />);

        const editButtons = screen.getAllByTitle('Edit');
        await userEvent.click(editButtons[0]);

        const descriptionInput = screen.getByPlaceholderText('Describe this content type');
        await userEvent.clear(descriptionInput);
        await userEvent.type(descriptionInput, 'Updated description');

        const updateButton = screen.getByText('Update');
        await userEvent.click(updateButton);

        await waitFor(() => {
            expect(updateMock).toHaveBeenCalled();
        });
    });

    it('deletes record when delete button is clicked', async () => {
        const removeMock = vi.fn();
        vi.mocked(useDataModule.useData).mockReturnValue({
            data: mockData,
            create: vi.fn(),
            update: vi.fn(),
            remove: removeMock,
            loading: false,
            error: null
        } as any);

        render(<ContentTypeMasterView />);

        const deleteButtons = screen.getAllByTitle('Delete');

        vi.spyOn(window, 'confirm').mockReturnValue(true);

        await userEvent.click(deleteButtons[0]);

        await waitFor(() => {
            expect(removeMock).toHaveBeenCalledWith(1);
        });
    });

    it('exports data to CSV', async () => {
        vi.mocked(useDataModule.useData).mockReturnValue({
            data: mockData,
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
            loading: false,
            error: null
        } as any);

        render(<ContentTypeMasterView />);

        const exportButton = screen.getByText('Export');

        global.URL.createObjectURL = vi.fn(() => 'blob:mock');
        global.URL.revokeObjectURL = vi.fn();

        await userEvent.click(exportButton);

        expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('displays loading state', () => {
        vi.mocked(useDataModule.useData).mockReturnValue({
            data: [],
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
            loading: true,
            error: null
        } as any);

        render(<ContentTypeMasterView />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('displays empty state when no records', () => {
        vi.mocked(useDataModule.useData).mockReturnValue({
            data: [],
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
            loading: false,
            error: null
        } as any);

        render(<ContentTypeMasterView />);

        expect(screen.getByText('No records found')).toBeInTheDocument();
    });

    it('expands row to show details', async () => {
        vi.mocked(useDataModule.useData).mockReturnValue({
            data: mockData,
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
            loading: false,
            error: null
        } as any);

        render(<ContentTypeMasterView />);

        const expandButtons = screen.getAllByRole('button').filter(btn => btn.querySelector('svg'));
        await userEvent.click(expandButtons[0]);

        expect(screen.getByText('Description')).toBeInTheDocument();
        expect(screen.getByText('Flags')).toBeInTheDocument();
    });

    it('displays status badge correctly', () => {
        vi.mocked(useDataModule.useData).mockReturnValue({
            data: mockData,
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
            loading: false,
            error: null
        } as any);

        render(<ContentTypeMasterView />);

        expect(screen.getAllByText('✓ Active')).toHaveLength(2);
    });

    it('closes modal when Cancel button is clicked', async () => {
        vi.mocked(useDataModule.useData).mockReturnValue({
            data: mockData,
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
            loading: false,
            error: null
        } as any);

        render(<ContentTypeMasterView />);

        const addButton = screen.getByText('Add Content Type');
        await userEvent.click(addButton);

        expect(screen.getByText('Add New Content Type')).toBeInTheDocument();

        const cancelButton = screen.getByText('Cancel');
        await userEvent.click(cancelButton);

        await waitFor(() => {
            expect(screen.queryByText('Add New Content Type')).not.toBeInTheDocument();
        });
    });

    it('handles checkbox flags correctly', async () => {
        const createMock = vi.fn();
        vi.mocked(useDataModule.useData).mockReturnValue({
            data: mockData,
            create: createMock,
            update: vi.fn(),
            remove: vi.fn(),
            loading: false,
            error: null
        } as any);

        render(<ContentTypeMasterView />);

        const addButton = screen.getByText('Add Content Type');
        await userEvent.click(addButton);

        const contentTypeInput = screen.getByPlaceholderText('e.g., Blog, Pillar, Landing Page');
        const categoryInput = screen.getByPlaceholderText('e.g., Editorial, Core, Supporting');

        await userEvent.type(contentTypeInput, 'Test');
        await userEvent.type(categoryInput, 'Test');

        const seoCheckbox = screen.getByLabelText('SEO Focus Keywords Required');
        await userEvent.click(seoCheckbox);

        const createButton = screen.getByText('Create');
        await userEvent.click(createButton);

        await waitFor(() => {
            expect(createMock).toHaveBeenCalled();
        });
    });
});
