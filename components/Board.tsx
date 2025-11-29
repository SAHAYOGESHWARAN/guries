
import React from 'react';
import { getStatusBadge } from '../constants';

interface BoardColumn {
  id: string;
  title: string;
}

interface BoardProps<T> {
  columns: BoardColumn[];
  data: T[];
  statusAccessor: (item: T) => string;
  renderCard: (item: T) => React.ReactNode;
  onStatusChange?: (item: T, newStatus: string) => void;
  title?: string;
}

function Board<T extends { id: number }>({ columns, data, statusAccessor, renderCard, onStatusChange, title }: BoardProps<T>) {
  return (
    <div className="h-full flex flex-col">
      {title && <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>}
      <div className="flex-1 flex overflow-x-auto space-x-4 pb-4">
        {columns.map((column) => {
          const items = data.filter((item) => statusAccessor(item) === column.id);
          return (
            <div key={column.id} className="flex-shrink-0 w-80 bg-gray-100 rounded-lg flex flex-col max-h-full">
              <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-200 rounded-t-lg">
                <h3 className="font-semibold text-gray-700 uppercase text-xs tracking-wider">
                  {column.title}
                </h3>
                <span className="bg-gray-300 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              </div>
              <div className="p-2 flex-1 overflow-y-auto space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="bg-white p-3 rounded shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    {renderCard(item)}
                    {onStatusChange && (
                        <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between">
                            {/* Logic to move back/forward could go here, simplified for now */}
                            <div className="text-xs text-gray-400">ID: {item.id}</div>
                        </div>
                    )}
                  </div>
                ))}
                {items.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm italic">
                        No items
                    </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Board;
