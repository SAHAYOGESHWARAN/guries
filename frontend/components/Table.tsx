import React, { useState, useMemo } from 'react';
import Tooltip from './Tooltip';

export interface Column<T = any> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  tooltip?: string;
  minWidth?: string;
}

interface TableProps {
  columns: Column<any>[];
  data: any[];
  title?: string;
  actionButton?: React.ReactNode;
  emptyMessage?: string;
  rowClassName?: (item: any) => string;
  onRowClick?: (item: any) => void;
  pageSize?: number;
  showPagination?: boolean;
}

function Table({ columns, data = [], title, actionButton, emptyMessage, rowClassName, onRowClick, pageSize = 15, showPagination = true }: TableProps) {
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

  const renderCell = (item: any, column: Column<any>) => {
    if (!item) return '';
    if (typeof column.accessor === 'function') {
      return column.accessor(item);
    }
    const value = item[column.accessor];
    return typeof value === 'string' || typeof value === 'number' ? value : '';
  };

  // Calculate minimum width based on header text length
  const getMinWidth = (header: string, minWidth?: string): string => {
    if (minWidth) return minWidth;
    const headerLength = header.length;
    // Base minimum width calculation: at least 80px, plus 8px per character
    const calculatedWidth = Math.max(100, headerLength * 9 + 32);
    return `${calculatedWidth}px`;
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Table Header */}
      {title && (
        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'white',
          flexShrink: 0
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{title}</h2>
          {actionButton}
        </div>
      )}

      {/* Scrollable Table Container */}
      <div
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 350px)',
          minHeight: '300px',
          position: 'relative'
        }}
      >
        <table
          style={{
            borderCollapse: 'collapse',
            width: '100%',
            tableLayout: 'auto',
            minWidth: 'max-content'
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              {columns.map((col, index) => (
                <th
                  key={index}
                  style={{
                    padding: '14px 16px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                    borderBottom: '2px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    minWidth: getMinWidth(col.header, col.minWidth)
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ overflow: 'visible' }}>{col.header}</span>
                    {col.tooltip && (
                      <Tooltip content={col.tooltip} position="top">
                        <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '14px', width: '14px', color: '#94a3b8', cursor: 'help', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </Tooltip>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData && paginatedData.length > 0 ? (
              paginatedData.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  style={{
                    backgroundColor: 'white',
                    borderBottom: '1px solid #f1f5f9',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {columns.map((col, index) => (
                    <td
                      key={index}
                      style={{
                        padding: '14px 16px',
                        fontSize: '13px',
                        color: '#475569',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        minWidth: getMinWidth(col.header, col.minWidth)
                      }}
                    >
                      {renderCell(item, col)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ padding: '64px 24px', textAlign: 'center', backgroundColor: 'white' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    <svg style={{ width: '48px', height: '48px', marginBottom: '12px', opacity: 0.5 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p style={{ fontSize: '14px', fontWeight: 500 }}>{emptyMessage || 'No assets yet. Click "Upload Asset" to add your first file.'}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Enhanced Pagination Footer */}
      {showPagination && data && data.length > 0 && (
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
            Showing <span style={{ color: '#0f172a', fontWeight: 700 }}>{startIndex + 1}</span> to{' '}
            <span style={{ color: '#0f172a', fontWeight: 700 }}>{Math.min(endIndex, data.length)}</span> of{' '}
            <span style={{ color: '#0f172a', fontWeight: 700 }}>{data.length}</span> results
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                backgroundColor: currentPage === 1 ? '#f1f5f9' : 'white',
                fontWeight: 600,
                color: currentPage === 1 ? '#94a3b8' : '#475569',
                fontSize: '12px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            {/* Page Numbers */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {getPageNumbers().map((page, idx) => (
                typeof page === 'number' ? (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      padding: '6px 12px',
                      border: currentPage === page ? '1px solid #6366f1' : '1px solid #cbd5e1',
                      borderRadius: '6px',
                      backgroundColor: currentPage === page ? '#6366f1' : 'white',
                      fontWeight: 600,
                      color: currentPage === page ? 'white' : '#475569',
                      fontSize: '12px',
                      cursor: 'pointer',
                      minWidth: '36px'
                    }}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={idx} style={{ padding: '6px 8px', color: '#94a3b8', fontSize: '12px' }}>
                    {page}
                  </span>
                )
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              style={{
                padding: '6px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                backgroundColor: currentPage === totalPages || totalPages === 0 ? '#f1f5f9' : 'white',
                fontWeight: 600,
                color: currentPage === totalPages || totalPages === 0 ? '#94a3b8' : '#475569',
                fontSize: '12px',
                cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Next
              <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;
