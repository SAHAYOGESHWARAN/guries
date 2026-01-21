import React, { useState, useMemo } from 'react';
import TableEnhanced from './TableEnhanced';
import BulkActionsToolbar, { BulkAction } from './BulkActionsToolbar';
import FilterPanel, { FilterOption } from './FilterPanel';
import { useBulkActions } from '../hooks/useBulkActions';
import { useFavorites } from '../hooks/useFavorites';
import { exportToCSV, exportToJSON, exportToHTML, generateFilename } from '../utils/exportHelper';

interface EnhancedPageTemplateProps<T extends { id: number }> {
    title: string;
    data: T[];
    columns: any[];
    onEdit: (item: T) => void;
    onDelete: (id: number) => void;
    onDuplicate?: (item: T) => void;
    onBulkDelete?: (ids: number[]) => void;
    onBulkStatusChange?: (ids: number[], status: string) => void;
    onBulkAssign?: (ids: number[], userId: number) => void;
    filters?: FilterOption[];
    onFilterChange?: (filters: any) => void;
    entityName: string;
    namespace?: string;
}

const EnhancedPageTemplate = <T extends { id: number }>({
    title,
    data,
    columns,
    onEdit,
    onDelete,
    onDuplicate,
    onBulkDelete,
    onBulkStatusChange,
    onBulkAssign,
    filters = [],
    onFilterChange,
    entityName,
    namespace = 'default'
}: EnhancedPageTemplateProps<T>) => {
    const [bulkState, bulkMethods] = useBulkActions<T>();
    const { favorites, isFavorite, toggleFavorite } = useFavorites(namespace);
    const [filterPanelOpen, setFilterPanelOpen] = useState(false);
    const [sortBy, setSortBy] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Filter data by favorites if needed
    const filteredData = useMemo(() => {
        return data.filter(item => !filterPanelOpen || favorites.size === 0 || isFavorite(item.id));
    }, [data, favorites, filterPanelOpen, isFavorite]);

    // Bulk actions
    const bulkActions: BulkAction[] = [
        {
            id: 'export-csv',
            label: 'Export CSV',
            icon: '📥',
            color: 'blue',
            onClick: () => {
                const selected = bulkMethods.getSelectedItems(filteredData);
                exportToCSV(selected, generateFilename(entityName, 'csv'));
            }
        },
        {
            id: 'export-json',
            label: 'Export JSON',
            icon: '📥',
            color: 'blue',
            onClick: () => {
                const selected = bulkMethods.getSelectedItems(filteredData);
                exportToJSON(selected, generateFilename(entityName, 'json'));
            }
        },
        {
            id: 'export-html',
            label: 'Export HTML',
            icon: '📥',
            color: 'blue',
            onClick: () => {
                const selected = bulkMethods.getSelectedItems(filteredData);
                exportToHTML(selected, generateFilename(entityName, 'html'));
            }
        },
        ...(onBulkStatusChange ? [{
            id: 'change-status',
            label: 'Change Status',
            icon: '🔄',
            color: 'yellow' as const,
            onClick: () => {
                const status = prompt('Enter new status:');
                if (status && onBulkStatusChange) {
                    onBulkStatusChange(Array.from(bulkState.selectedIds), status);
                    bulkMethods.clearSelection();
                }
            }
        }] : []),
        ...(onBulkAssign ? [{
            id: 'assign-user',
            label: 'Assign To',
            icon: '👤',
            color: 'green' as const,
            onClick: () => {
                const userId = prompt('Enter user ID:');
                if (userId && onBulkAssign) {
                    onBulkAssign(Array.from(bulkState.selectedIds), parseInt(userId));
                    bulkMethods.clearSelection();
                }
            }
        }] : []),
        ...(onBulkDelete ? [{
            id: 'delete-all',
            label: 'Delete All',
            icon: '🗑️',
            color: 'red' as const,
            onClick: () => {
                if (confirm(`Delete ${bulkState.selectedIds.size} items?`) && onBulkDelete) {
                    onBulkDelete(Array.from(bulkState.selectedIds));
                    bulkMethods.clearSelection();
                }
            }
        }] : [])
    ];

    const handleSort = (column: string, order: 'asc' | 'desc') => {
        setSortBy(column);
        setSortOrder(order);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setFilterPanelOpen(!filterPanelOpen)}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filters
                        {filters.filter(f => f.value && f.value !== 'All').length > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full font-bold">
                                {filters.filter(f => f.value && f.value !== 'All').length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => toggleFavorite(0)}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                        <span>⭐</span>
                        Favorites ({favorites.size})
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            {filterPanelOpen && (
                <FilterPanel
                    filters={filters}
                    onClearAll={() => {
                        filters.forEach(f => f.onChange('All'));
                        if (onFilterChange) onFilterChange({});
                    }}
                    isOpen={true}
                    onToggle={() => setFilterPanelOpen(false)}
                />
            )}

            {/* Table */}
            <TableEnhanced
                columns={columns}
                data={filteredData}
                showCheckbox={true}
                selectedIds={bulkState.selectedIds}
                onSelectionChange={(ids) => {
                    // Update selection
                    const newSet = new Set(ids);
                    bulkState.selectedIds.forEach(id => {
                        if (!newSet.has(id)) {
                            bulkMethods.toggleSelect(id);
                        }
                    });
                    newSet.forEach(id => {
                        if (!bulkState.selectedIds.has(id)) {
                            bulkMethods.toggleSelect(id);
                        }
                    });
                }}
                onSelectAll={(selected) => bulkMethods.toggleSelectAll(filteredData)}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
            />

            {/* Bulk Actions Toolbar */}
            <BulkActionsToolbar
                selectedCount={bulkState.selectedIds.size}
                totalCount={filteredData.length}
                actions={bulkActions}
                onClearSelection={() => bulkMethods.clearSelection()}
                isVisible={bulkState.isSelecting}
            />
        </div>
    );
};

export default EnhancedPageTemplate;
