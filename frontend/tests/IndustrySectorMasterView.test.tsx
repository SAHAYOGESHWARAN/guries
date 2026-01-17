import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IndustrySectorMasterView from '../views/IndustrySectorMasterView';
import * as useDataModule from '../hooks/useData';

// Mock the useData hook
vi.mock('../hooks/useData', () => ({
    useData: vi.fn()
}));

const mockData = [
    {
        id: 1,
        industry: 'Technology',
        sector: 'Software',
        application: 'SaaS Platforms',
        country: 'United States',
        description: 'Cloud-based software solutions',
        status: 'active',
        created_at: '2025-01-17T00:00:00Z',
        updated_at: '2025-01-17T00:00:00Z'
    },
    {
        id: 2,
        industry: 'Healthcare',
        sector: 'Pharmaceuticals',
        application: 'Drug Manufacturing',
        country: 'United Kingdom',
        description: 'Pharmaceutical manufacturing',
        status: 'active',
        created_at: '2025-01-17T00:00:00Z',
        updated_at: '2025-01-17T00:00:00Z'
    }
];

describe('IndustrySectorMasterView', () => {
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

        render(<IndustrySectorMasterView />);

        expect(screen.getByText('Industry / Sector Master')).toBeInTheDocument();
        expect(screen.getByText(/Manage industry classifications/)).toBeInTheDocument();
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

        render(<IndustrySectorMasterView />);

        expect(screen.getByText('Technology')).toBeInTheDocument();
        expect(screen.getByText('Healthcare')).toBeInTheDocument();
        expect(screen.getByText('SaaS Platforms')).toBeInTheDocument();
        expect(screen.getByText('Drug Manufacturing')).toBeInTheDocument();
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

        render(<IndustrySectorMasterView />);

        const searchInput = screen.getByPlaceholderText(/Search industries/);
        await userEvent.type(searchInput, 'Healthcare');

        expect(screen.getByText('Healthcare')).toBeInTheDocument();
        expect(screen.queryByText('Technology')).not.toBeInTheDocument();
    });

    it('filters data by industry', async () => {
        vi.mocked(useDataModule.useData).mockReturnValue({
            data: mockData,
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
            loading: false,
            error: null
        } as any);

        render(<IndustrySectorMasterView />);

        const industrySelect = screen.getAllByDisplayValue('All Industries')[0];
        await userEvent.selectOptions(industrySelect, 'Technology');

        expect(screen.getByText('Technology')).toBeInTheDocument();
        expect(screen.queryByText('Healthcare')).not.toBeInTheDocument();
    });

    it('filters data by country', async () => {
        vi.mocked(useDataModule.useData).mockReturnValue({
            data: mockData,
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
            loading: false,
            error: null
        } as any);

        render(<IndustrySectorMasterView />);

        const countrySelect = screen.getAllByDisplayValue('All Countries')[0];
        await userEvent.selectOptions(countrySelect, 'United Kingdom');

        expect(screen.getByText('Healthcare')).toBeInTheDocument();
        expect(screen.queryByText('Technology')).not.toBeInTheDocument();
    });

    it('opens modal when Add Industry button is clicked', async () => {
        vi.mocked(useDataModule.useData).mockReturnValue({
            data: mockData,
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
            loading: false,
            error: null
        } as any);

        render(<IndustrySectorMasterView />);

        const addButton = screen.getByText('Add Industry');
        await userEvent.click(addButton);

        expect(screen.getByText('Add New Industry / Sector')).toBeInTheDocument();
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

        render(<IndustrySectorMasterView />);

        const editButtons = screen.getAllByTitle('Edit');
        await userEvent.click(editButtons[0]);

        expect(screen.getByText('Edit Industry / Sector')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Technology')).toBeInTheDocument();
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

        render(<IndustrySectorMasterView />);

        const addButton = screen.getByText('Add Industry');
        await userEvent.click(addButton);

        const industryInput = screen.getByPlaceholderText('e.g., Technology');
        const sectorInput = screen.getByPlaceholderText('e.g., Software');
        const applicationInput = screen.getByPlaceholderText('e.g., SaaS Platforms');
        const countryInput = screen.getByPlaceholderText('e.g., United States');

        await userEvent.type(industryInput, 'Finance');
        await userEvent.type(sectorInput, 'Banking');
        await userEvent.type(applicationInput, 'Digital Banking');
        await userEvent.type(countryInput, 'Canada');

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

        render(<IndustrySectorMasterView />);

        const editButtons = screen.getAllByTitle('Edit');
        await userEvent.click(editButtons[0]);

        const descriptionInput = screen.getByPlaceholderText(/Provide a detailed description/);
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

        render(<IndustrySectorMasterView />);

        const deleteButtons = screen.getAllByTitle('Delete');

        // Mock window.confirm
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

        render(<IndustrySectorMasterView />);

        const exportButton = screen.getByText('Export');

        // Mock URL.createObjectURL and URL.revokeObjectURL
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

        render(<IndustrySectorMasterView />);

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

        render(<IndustrySectorMasterView />);

        expect(screen.getByText('No records found')).toBeInTheDocument();
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

        render(<IndustrySectorMasterView />);

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

        render(<IndustrySectorMasterView />);

        const addButton = screen.getByText('Add Industry');
        await userEvent.click(addButton);

        expect(screen.getByText('Add New Industry / Sector')).toBeInTheDocument();

        const cancelButton = screen.getByText('Cancel');
        await userEvent.click(cancelButton);

        await waitFor(() => {
            expect(screen.queryByText('Add New Industry / Sector')).not.toBeInTheDocument();
        });
    });
});
