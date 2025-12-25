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
    <div className="bg-white rounded-xl shadow-card border border-slate-200 flex flex-col h-full ui-surface">
      {/* Table Header */}
      {title && (
        <div className="px-6 py-3 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-20">
          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h2>
          {actionButton}
        </div>
      )}

      {/* Scrollable Table Container - Both horizontal and vertical scroll */}
      <div
        className="flex-1 overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
        style={{
          maxHeight: 'calc(100vh - 450px)',
          minHeight: '300px'
        }}
      >
        <table className="border-collapse table-auto" style={{ minWidth: '1800px' }}>
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap border-b border-slate-200 bg-slate-50 ${col.className || ''}`}
                >
                  <div className="flex items-center space-x-1">
                    <span>{col.header}</span>
                    {col.tooltip && (
                      <Tooltip content={col.tooltip} position="top">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-400 cursor-help hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </Tooltip>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {data && data.length > 0 ? (
              data.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  className={`hover:bg-slate-50 transition-colors duration-150 ${rowClassName ? rowClassName(item) : ''} ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {columns.map((col, index) => (
                    <td key={index} className={`px-4 py-3 text-sm text-slate-600 font-medium ${col.className || ''}`}>
                      {renderCell(item, col)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center bg-white">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-xs font-medium">{emptyMessage || 'No records found'}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {data && data.length > 0 && (
        <div className="px-6 py-2.5 border-t border-slate-200 bg-slate-50 text-[10px] text-slate-500 flex justify-between items-center">
          <span className="font-medium">Showing <span className="text-slate-900 font-bold">{data.length}</span> results</span>
          <div className="flex space-x-2">
            <button className="px-2.5 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-50 font-semibold text-slate-700 transition-colors shadow-sm">Previous</button>
            <button className="px-2.5 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-50 font-semibold text-slate-700 transition-colors shadow-sm">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;
