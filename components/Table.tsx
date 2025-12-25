import React from 'react';
import Tooltip from './Tooltip';

export interface Column<T = any> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  tooltip?: string;
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
          backgroundColor: 'white'
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
          maxHeight: 'calc(100vh - 500px)',
          minHeight: '250px'
        }}
      >
        <table
          style={{
            borderCollapse: 'collapse',
            width: 'max-content',
            minWidth: '100%'
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f8fafc' }}>
              {columns.map((col, index) => (
                <th
                  key={index}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                    borderBottom: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>{col.header}</span>
                    {col.tooltip && (
                      <Tooltip content={col.tooltip} position="top">
                        <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '12px', width: '12px', color: '#94a3b8', cursor: 'help' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        padding: '12px 16px',
                        fontSize: '14px',
                        color: '#475569',
                        fontWeight: 500,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {renderCell(item, col)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ padding: '48px 24px', textAlign: 'center', backgroundColor: 'white' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    <svg style={{ width: '32px', height: '32px', marginBottom: '8px', opacity: 0.5 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p style={{ fontSize: '12px', fontWeight: 500 }}>{emptyMessage || 'No records found'}</p>
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
