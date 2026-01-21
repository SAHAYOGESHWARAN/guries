import React, { useState, useMemo } from 'react';
import Tooltip from './Tooltip';

export interface Column<T = any> {
    header: string;
    accessor: keyof T | ((item: T, index?: number) => React.ReactNode);
    className?: string;
    tooltip?: string;
    minWidth?: string;
    sortable?: boolean;
    filterable?: boolean;
}

interface TableEnhancedProps {
    columns: Column<any>[];
    data: any[];
    title?: string;
    actionButton?: React.ReactNode;
    emptyMessage?: string;
    rowClassName?: (item: any) => string;
    onRowClick?: (item: any) => void;
    pageSize?: number;
    showPagination?: boolean;
    showCheckbox?: boolean;
    selectedIds?: Set<number>;
    onSelectionChange?: (ids: Set<number>) => void;
    onSelectAll?: (selected: boolean) => void;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSort?: (column: string, order: 'asc' | 'desc') => void;
}

function TableEnhanced({
    columns,
    data = [],
    title,
    actionButton,
    emptyMessage,
    rowClassName,
    onRowClick,
    pageSize = 15,
    showPagination = true,
    showCheckbox = false,
    selectedIds = new Set(),
    onSelectionChange,
    onSelectAll,
    sortBy,
    sortOrder = 'asc',
    onSort
}: TableEnhancedProps) {
    const [currentPage, setCurrentPage] = useState(1);

    // Calculate pagination
    const totalPages = Math.ceil((data?.length || 0) / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = useMemo(() => {
        return showPagination ? (data || []).slice(startIndex, endIndex) : data;
    }, [data, startIndex, endIndex, showPagination]);

    // Reset to page 1 when data changes significantly
    React.useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [data?.length, totalPages, currentPage]);

    const renderCell = (item: any, column: Column<any>, rowIndex: number) => {
        if (!item) return '';
        if (typeof column.accessor === 'function') {
            return column.accessor(item, rowIndex);
        }
        const value = item[column.accessor];
        return typeof value === 'string' || typeof value === 'number' ? value : '';
    };

    const handleSelectAll = () => {
        if (onSelectAll) {
            onSelectAll(selectedIds.size === paginatedData.length);
        }
    };

    const handleSelectRow = (id: number) => {
        if (onSelectionChange) {
            const newSet = new Set(selectedIds);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            onSelectionChange(newSet);
        }
    };

    const handleSort = (column: Column<any>) => {
        if (!column.sortable || !onSort) return;
        const columnName = typeof column.accessor === 'string' ? column.accessor : column.header;
        const newOrder = sortBy === columnName && sortOrder === 'asc' ? 'desc' : 'asc';
        onSort(columnName, newOrder);
    };

    const allSelected = paginatedData.length > 0 && paginatedData.every(item => selectedIds.has(item.id));

    return (
        <div className="w-full">
            {title && <h2 className="text-lg font-bold mb-4 text-slate-900">{title}</h2>}

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                        <tr>
                            {showCheckbox && (
                                <th className="w-12 px-4 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                    />
                                </th>
                            )}
                            {columns.map((column, idx) => (
                                <th
                                    key={idx}
                                    className={`px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider ${column.className || ''
                                        } ${column.sortable ? 'cursor-pointer hover:bg-slate-100' : ''}`}
                                    onClick={() => handleSort(column)}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{column.header}</span>
                                        {column.sortable && (
                                            <span className="text-slate-400">
                                                {sortBy === column.header ? (
                                                    sortOrder === 'asc' ? '↑' : '↓'
                                                ) : (
                                                    '↕'
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (showCheckbox ? 1 : 0)}
                                    className="px-6 py-12 text-center text-slate-500"
                                >
                                    {emptyMessage || 'No data available'}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((item, rowIdx) => (
                                <tr
                                    key={item.id || rowIdx}
                                    className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${rowClassName ? rowClassName(item) : ''
                                        } ${selectedIds.has(item.id) ? 'bg-indigo-50' : ''}`}
                                    onClick={() => onRowClick && onRowClick(item)}
                                >
                                    {showCheckbox && (
                                        <td className="w-12 px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(item.id)}
                                                onChange={() => handleSelectRow(item.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                            />
                                        </td>
                                    )}
                                    {columns.map((column, colIdx) => (
                                        <td
                                            key={colIdx}
                                            className={`px-6 py-4 text-sm text-slate-700 ${column.className || ''}`}
                                        >
                                            {renderCell(item, column, rowIdx)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showPagination && totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-sm text-slate-600">
                        Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TableEnhanced;
