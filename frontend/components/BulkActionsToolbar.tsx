import React from 'react';
import Tooltip from './Tooltip';

export interface BulkAction {
    id: string;
    label: string;
    icon: string;
    color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple';
    onClick: () => void;
    disabled?: boolean;
    tooltip?: string;
}

interface BulkActionsToolbarProps {
    selectedCount: number;
    totalCount: number;
    actions: BulkAction[];
    onClearSelection: () => void;
    isVisible?: boolean;
}

const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
    selectedCount,
    totalCount,
    actions,
    onClearSelection,
    isVisible = true
}) => {
    if (!isVisible || selectedCount === 0) return null;

    const colorClasses: Record<string, string> = {
        red: 'hover:bg-red-50 text-red-600 hover:text-red-700',
        blue: 'hover:bg-blue-50 text-blue-600 hover:text-blue-700',
        green: 'hover:bg-green-50 text-green-600 hover:text-green-700',
        yellow: 'hover:bg-yellow-50 text-yellow-600 hover:text-yellow-700',
        purple: 'hover:bg-purple-50 text-purple-600 hover:text-purple-700'
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-indigo-600 shadow-2xl z-50 animate-slide-up">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Selection Info */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                            {selectedCount} selected
                        </span>
                        <span className="text-xs text-slate-500">
                            of {totalCount} total
                        </span>
                    </div>
                    <div className="w-px h-6 bg-slate-200" />
                    <button
                        onClick={onClearSelection}
                        className="text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors"
                    >
                        Clear selection
                    </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {actions.map((action) => (
                        <Tooltip key={action.id} content={action.tooltip || action.label}>
                            <button
                                onClick={action.onClick}
                                disabled={action.disabled}
                                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  flex items-center gap-2
                  ${colorClasses[action.color || 'blue']}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                            >
                                <span>{action.icon}</span>
                                {action.label}
                            </button>
                        </Tooltip>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BulkActionsToolbar;
