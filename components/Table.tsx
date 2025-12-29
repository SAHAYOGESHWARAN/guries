import React from 'react';
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
}

function Table({ columns, data = [], title, actionButton, emptyMessage, rowClassName, onRowClick }: TableProps) {
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
          maxHeight: 'calc(100vh - 300px)',
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
            {data && data.length > 0 ? (
              data.map((item, idx) => (
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

      {/* Pagination Footer */}
      {data && data.length > 0 && (
        <div style={{
          padding: '10px 24px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          fontSize: '10px',
          color: '#64748b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: 500 }}>
            Showing <span style={{ color: '#0f172a', fontWeight: 700 }}>{data.length}</span> results
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{
              padding: '4px 10px',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              backgroundColor: 'white',
              fontWeight: 600,
              color: '#475569',
              fontSize: '10px',
              cursor: 'pointer'
            }}>Previous</button>
            <button style={{
              padding: '4px 10px',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              backgroundColor: 'white',
              fontWeight: 600,
              color: '#475569',
              fontSize: '10px',
              cursor: 'pointer'
            }}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;
