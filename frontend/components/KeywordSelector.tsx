import React, { useState, useMemo } from 'react';
import type { Keyword } from '../types';

interface KeywordSelectorProps {
    keywords: Keyword[];
    selectedKeywords: string[];
    onSelect: (keyword: string) => void;
    onRemove: (keyword: string) => void;
    label: string;
    description: string;
    placeholder?: string;
    maxKeywords?: number;
}

const KeywordSelector: React.FC<KeywordSelectorProps> = ({
    keywords,
    selectedKeywords,
    onSelect,
    onRemove,
    label,
    description,
    placeholder = 'Search keywords...',
    maxKeywords
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filteredKeywords = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return keywords.slice(0, 20);

        return keywords
            .filter(kw => {
                const isSelected = selectedKeywords.includes(kw.keyword);
                if (isSelected) return false;

                const matchesSearch =
                    kw.keyword.toLowerCase().includes(query) ||
                    kw.keyword_intent?.toLowerCase().includes(query) ||
                    kw.keyword_type?.toLowerCase().includes(query);

                return matchesSearch;
            })
            .slice(0, 20);
    }, [searchQuery, keywords, selectedKeywords]);

    const canAddMore = !maxKeywords || selectedKeywords.length < maxKeywords;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">{label}</p>
                    <p className="text-xs text-slate-500">{description}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                    {selectedKeywords.length}{maxKeywords ? `/${maxKeywords}` : ''}
                </span>
            </div>

            {/* Search Input */}
            <div className="relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    disabled={!canAddMore}
                    className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-slate-50 disabled:text-slate-400"
                />

                {/* Dropdown */}
                {isOpen && canAddMore && filteredKeywords.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                        {filteredKeywords.map((kw) => (
                            <button
                                key={kw.id}
                                onClick={() => {
                                    onSelect(kw.keyword);
                                    setSearchQuery('');
                                    if (maxKeywords && selectedKeywords.length + 1 >= maxKeywords) {
                                        setIsOpen(false);
                                    }
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-green-50 border-b border-slate-100 last:border-b-0 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{kw.keyword}</p>
                                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                                            <span className="px-1.5 py-0.5 bg-slate-100 rounded">Vol: {kw.search_volume?.toLocaleString() || 'N/A'}</span>
                                            <span className="px-1.5 py-0.5 bg-slate-100 rounded">Comp: {kw.competition_score || '-'}</span>
                                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">{kw.keyword_intent || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelect(kw.keyword);
                                            setSearchQuery('');
                                        }}
                                        className="flex-shrink-0 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold hover:bg-green-700 transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Close dropdown when clicking outside */}
                {isOpen && (
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </div>

            {/* Selected Keywords */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 min-h-[120px] grid gap-2 lg:grid-cols-2">
                {selectedKeywords.length > 0 ? (
                    selectedKeywords.map((keyword, idx) => {
                        const kwData = keywords.find(k => k.keyword === keyword);
                        return (
                            <div
                                key={`${keyword}-${idx}`}
                                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-green-200 transition-colors bg-slate-50"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{keyword}</p>
                                    {kwData && (
                                        <p className="text-[11px] text-slate-500 font-mono">
                                            Vol: {kwData.search_volume?.toLocaleString() || 'N/A'} | Comp: {kwData.competition_score || '-'}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => onRemove(keyword)}
                                    className="text-slate-300 hover:text-red-500 transition-colors font-bold ml-2 flex-shrink-0"
                                >
                                    ✕
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div className="lg:col-span-2 h-full flex flex-col items-center justify-center text-slate-400 text-sm italic min-h-[80px]">
                        <span className="opacity-50 text-3xl mb-2">🏷️</span>
                        No keywords selected. Search and add from master list.
                    </div>
                )}
            </div>

            {!canAddMore && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded">
                    Maximum {maxKeywords} keywords reached
                </p>
            )}
        </div>
    );
};

export default KeywordSelector;
