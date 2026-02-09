import React, { useState } from 'react';
import Tooltip from './Tooltip';

export interface FilterOption {
    id: string;
    label: string;
    type: 'select' | 'multiselect' | 'date' | 'daterange' | 'search' | 'checkbox';
    value: any;
    options?: Array<{ label: string; value: any }>;
    onChange: (value: any) => void;
    placeholder?: string;
    tooltip?: string;
}

interface FilterPanelProps {
    filters: FilterOption[];
    onClearAll: () => void;
    isOpen?: boolean;
    onToggle?: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
    filters,
    onClearAll,
    isOpen = true,
    onToggle
}) => {
    const [expandedFilters, setExpandedFilters] = useState<Set<string>>(new Set());

    const toggleFilter = (id: string) => {
        const newSet = new Set(expandedFilters);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedFilters(newSet);
    };

    const activeFilterCount = (filters || []).filter(f => f.value && f.value !== 'All').length;

    if (!isOpen) {
        return (
            <button
                onClick={onToggle}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full font-bold">
                        {activeFilterCount}
                    </span>
                )}
            </button>
        );
    }

    return (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                            {activeFilterCount} active
                        </span>
                    )}
                </h3>
                {activeFilterCount > 0 && (
                    <button
                        onClick={onClearAll}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                    >
                        Clear all
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {filters.map((filter) => (
                    <div key={filter.id} className="border border-slate-200 rounded-lg overflow-hidden">
                        <button
                            onClick={() => toggleFilter(filter.id)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-900">{filter.label}</span>
                                {filter.value && filter.value !== 'All' && (
                                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                                        {Array.isArray(filter.value) ? filter.value.length : 1}
                                    </span>
                                )}
                            </div>
                            <svg
                                className={`w-4 h-4 text-slate-400 transition-transform ${expandedFilters.has(filter.id) ? 'rotate-180' : ''
                                    }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </button>

                        {expandedFilters.has(filter.id) && (
                            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 space-y-2">
                                {filter.type === 'select' && (
                                    <select
                                        value={filter.value || ''}
                                        onChange={(e) => filter.onChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        {filter.options?.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {filter.type === 'multiselect' && (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {filter.options?.map((opt) => (
                                            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={Array.isArray(filter.value) && filter.value.includes(opt.value)}
                                                    onChange={(e) => {
                                                        const current = Array.isArray(filter.value) ? filter.value : [];
                                                        const updated = e.target.checked
                                                            ? [...current, opt.value]
                                                            : current.filter(v => v !== opt.value);
                                                        filter.onChange(updated);
                                                    }}
                                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                                />
                                                <span className="text-sm text-slate-700">{opt.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {filter.type === 'search' && (
                                    <input
                                        type="text"
                                        value={filter.value || ''}
                                        onChange={(e) => filter.onChange(e.target.value)}
                                        placeholder={filter.placeholder || 'Search...'}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                )}

                                {filter.type === 'date' && (
                                    <input
                                        type="date"
                                        value={filter.value || ''}
                                        onChange={(e) => filter.onChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                )}

                                {filter.type === 'checkbox' && (
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={filter.value === true}
                                            onChange={(e) => filter.onChange(e.target.checked)}
                                            className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-slate-700">{filter.label}</span>
                                    </label>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FilterPanel;
