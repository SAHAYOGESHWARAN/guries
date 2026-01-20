import React, { useState, useMemo } from 'react';
import type { ContentTypeItem } from '../types';

interface LinkedInsightsSelectorProps {
    contentTypes: ContentTypeItem[];
    selectedIds: number[];
    onSelectionChange: (ids: number[]) => void;
}

const LinkedInsightsSelector: React.FC<LinkedInsightsSelectorProps> = ({
    contentTypes,
    selectedIds,
    onSelectionChange
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredContentTypes = useMemo(() => {
        if (!searchQuery.trim()) return contentTypes;
        const query = searchQuery.toLowerCase();
        return contentTypes.filter(ct =>
            (ct.content_type || '').toLowerCase().includes(query) ||
            (ct.category || '').toLowerCase().includes(query) ||
            (ct.description || '').toLowerCase().includes(query)
        );
    }, [contentTypes, searchQuery]);

    const toggleSelection = (id: number) => {
        const newIds = selectedIds.includes(id)
            ? selectedIds.filter(sid => sid !== id)
            : [...selectedIds, id];
        onSelectionChange(newIds);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">💡</span>
                <h3 className="text-lg font-bold text-slate-900">Linked Insights</h3>
                <span className="ml-auto text-sm text-slate-500 font-medium">
                    {selectedIds.length} selected
                </span>
            </div>

            <input
                type="text"
                placeholder="Search content types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="space-y-2 max-h-96 overflow-y-auto border border-slate-200 rounded-lg p-4 bg-slate-50">
                {filteredContentTypes.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <p className="text-sm">No content types found</p>
                    </div>
                ) : (
                    filteredContentTypes.map((ct) => (
                        <label
                            key={ct.id}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-white cursor-pointer transition-colors"
                        >
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(ct.id)}
                                onChange={() => toggleSelection(ct.id)}
                                className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                            />
                            <div className="flex-1">
                                <div className="font-medium text-slate-900">{ct.content_type}</div>
                                <div className="text-xs text-slate-500 mt-1">
                                    <span className="inline-block bg-slate-200 px-2 py-1 rounded mr-2">
                                        {ct.category}
                                    </span>
                                    {ct.description && (
                                        <span className="text-slate-600">{ct.description}</span>
                                    )}
                                </div>
                            </div>
                        </label>
                    ))
                )}
            </div>

            {selectedIds.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-indigo-900 mb-2">Selected Insights:</div>
                    <div className="flex flex-wrap gap-2">
                        {selectedIds.map(id => {
                            const ct = contentTypes.find(c => c.id === id);
                            return ct ? (
                                <span
                                    key={id}
                                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm"
                                >
                                    {ct.content_type}
                                    <button
                                        onClick={() => toggleSelection(id)}
                                        className="hover:opacity-70 transition-opacity"
                                    >
                                        ✕
                                    </button>
                                </span>
                            ) : null;
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LinkedInsightsSelector;
