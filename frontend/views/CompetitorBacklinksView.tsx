import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import type { CompetitorBenchmarkItem } from '../types';

const GAP_STATUSES = ['All Gap Status', 'Ahead', 'Behind', 'Equal'];
const SORT_OPTIONS = ['Sort by Gap', 'Sort by DA', 'Sort by Backlinks', 'Sort by Name'];

// Gap Status Badge
const GapStatusBadge: React.FC<{ status: string; gap: number }> = ({ status, gap }) => {
    if (status === 'Ahead') {
        return (
            <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                <span className="text-emerald-600 font-medium text-sm">Ahead</span>
            </div>
        );
    }
    if (status === 'Behind') {
        return (
            <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                </svg>
                <span className="text-red-600 font-medium text-sm">Behind</span>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-slate-400"></span>
            <span className="text-slate-600 font-medium text-sm">Equal</span>
        </div>
    );
};

// Format number with K/M suffix
const formatNumber = (num: number | string | undefined): string => {
    if (!num) return '0';
    const n = typeof num === 'string' ? parseInt(num) : num;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toLocaleString();
};

const CompetitorBacklinksView: React.FC = () => {
    const { data: competitors, refresh } = useData<CompetitorBenchmarkItem>('competitors');

    const [searchQuery, setSearchQuery] = useState('');
    const [filterIndustry, setFilterIndustry] = useState('All Industries');
    const [filterGapStatus, setFilterGapStatus] = useState('All Gap Status');
    const [sortBy, setSortBy] = useState('Sort by Gap');

    // Our total backlinks (sum or a fixed value for demo)
    const ourTotalBacklinks = 892;

    // Calculate gap data for each competitor
    const competitorData = competitors.map(comp => {
        const compBacklinks = comp.total_backlinks || comp.backlinks || 0;
        const gap = ourTotalBacklinks - compBacklinks;
        let gapStatus: 'Ahead' | 'Behind' | 'Equal' = 'Equal';
        if (gap > 0) gapStatus = 'Ahead';
        else if (gap < 0) gapStatus = 'Behind';
        return {
            ...comp,
            compBacklinks,
            gap,
            gapStatus
        };
    });

    // Get unique industries
    const industries = ['All Industries', ...new Set(competitors.map(c => c.industry).filter(Boolean))];

    // Filter and sort
    const filteredData = competitorData
        .filter(item => {
            const matchesSearch = item.competitor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.website_url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.domain?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesIndustry = filterIndustry === 'All Industries' || item.industry === filterIndustry;
            const matchesGapStatus = filterGapStatus === 'All Gap Status' || item.gapStatus === filterGapStatus;
            return matchesSearch && matchesIndustry && matchesGapStatus;
        })
        .sort((a, b) => {
            if (sortBy === 'Sort by Gap') return Math.abs(b.gap) - Math.abs(a.gap);
            if (sortBy === 'Sort by DA') return (b.da || 0) - (a.da || 0);
            if (sortBy === 'Sort by Backlinks') return b.compBacklinks - a.compBacklinks;
            return a.competitor_name.localeCompare(b.competitor_name);
        });

    // Summary stats
    const aheadCount = competitorData.filter(c => c.gapStatus === 'Ahead').length;
    const behindCount = competitorData.filter(c => c.gapStatus === 'Behind').length;

    return (
        <div className="h-full flex flex-col w-full p-6 overflow-hidden bg-slate-50">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Competitor Backlinks</h1>
                    <p className="text-sm text-slate-500">Track and analyze competitor backlink profiles and identify gaps</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        <span className="text-sm font-medium">Export</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                        <span className="text-sm font-medium">Filter</span>
                    </button>
                    <button onClick={refresh} className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        <span className="text-sm font-medium">Refresh Data</span>
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Our Total Backlinks</p>
                    <p className="text-3xl font-bold text-blue-600">{formatNumber(ourTotalBacklinks)}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Competitors Tracked</p>
                    <p className="text-3xl font-bold text-slate-900">{competitors.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Ahead Of</p>
                    <p className="text-3xl font-bold text-emerald-600">{aheadCount}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Behind</p>
                    <p className="text-3xl font-bold text-red-600">{behindCount}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1 max-w-xs">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" placeholder="Search competitors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm" />
                </div>
                <select value={filterIndustry} onChange={(e) => setFilterIndustry(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                    {industries.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
                <select value={filterGapStatus} onChange={(e) => setFilterGapStatus(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                    {GAP_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm">
                    {SORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Competitor List */}
            <div className="flex-1 overflow-auto bg-white rounded-xl border border-slate-200 shadow-sm">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                        <tr>
                            <th className="w-8 px-4 py-3"><input type="checkbox" className="w-4 h-4 rounded border-slate-300" /></th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Competitor</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Backlinks</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Ours vs Comp</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Gap Status</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredData.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-4"><input type="checkbox" className="w-4 h-4 rounded border-slate-300" /></td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">{item.competitor_name}</p>
                                            <p className="text-xs text-blue-600">{item.website_url || item.domain}</p>
                                            <p className="text-xs text-slate-500">DA: {item.da || 0}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                        <span className="font-semibold text-slate-900">{formatNumber(item.compBacklinks)}</span>
                                        <span className="text-xs text-slate-500">backlinks</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500 w-12">Ours:</span>
                                            <span className="font-medium text-slate-900">{formatNumber(ourTotalBacklinks)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500 w-12">Comp:</span>
                                            <span className="font-medium text-blue-600">{formatNumber(item.compBacklinks)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500 w-12">Gap:</span>
                                            <span className={`font-bold ${item.gap >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {item.gap >= 0 ? '+' : ''}{formatNumber(item.gap)}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <GapStatusBadge status={item.gapStatus} gap={item.gap} />
                                </td>
                                <td className="px-4 py-4">
                                    <button className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                        View Mapping
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredData.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                                    No competitors found. Add competitors in the Competitor Repository first.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {filteredData.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
                        <span className="text-sm text-slate-600">Showing 1 to {filteredData.length} of {filteredData.length} competitors</span>
                        <div className="flex items-center gap-1">
                            <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button className="w-8 h-8 rounded bg-blue-600 text-white text-sm font-medium">1</button>
                            <button className="w-8 h-8 rounded text-slate-600 hover:bg-slate-100 text-sm">2</button>
                            <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompetitorBacklinksView;
