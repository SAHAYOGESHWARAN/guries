
import React, { useState } from 'react';
import Table from '../components/Table';
import { useData } from '../hooks/useData';
import type { CompetitorBenchmarkItem } from '../types';
import { exportToCSV } from '../utils/csvHelper';

const INDUSTRIES = ['All Industries', 'Technology', 'E-commerce', 'Media', 'Healthcare', 'Finance'];
const COUNTRIES = ['All Countries', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Global'];
const STATUSES = ['All Status', 'Active', 'Inactive', 'Watchlist'];

const CompetitorRepositoryView: React.FC = () => {
    const { data: competitors, create: createCompetitor, update: updateCompetitor, remove: deleteCompetitor, refresh } = useData<CompetitorBenchmarkItem>('competitors');
    
    const [searchQuery, setSearchQuery] = useState('');
    const [industryFilter, setIndustryFilter] = useState('All Industries');
    const [countryFilter, setCountryFilter] = useState('All Countries');
    const [statusFilter, setStatusFilter] = useState('All Status');
    
    // Full Frame State
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [editingItem, setEditingItem] = useState<CompetitorBenchmarkItem | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const [formData, setFormData] = useState<Partial<CompetitorBenchmarkItem>>({
        competitor_name: '', domain: '', industry: 'Technology', sector: 'SaaS', 
        region: 'United States', da: 0, dr: 0, monthly_traffic: '0', 
        total_keywords: 0, backlinks: 0, status: 'Active'
    });

    const filteredData = competitors.filter(item => {
        const matchesSearch = item.competitor_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.domain.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesIndustry = industryFilter === 'All Industries' || item.industry === industryFilter;
        const matchesCountry = countryFilter === 'All Countries' || item.region === countryFilter;
        const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter;
        
        return matchesSearch && matchesIndustry && matchesCountry && matchesStatus;
    });

    const handleRefresh = async () => {
        setIsRefreshing(true);
        // Simulate API refresh
        await new Promise(resolve => setTimeout(resolve, 1000));
        refresh();
        setIsRefreshing(false);
    };

    const handleExport = () => {
        exportToCSV(filteredData, 'competitor_repository_export');
    };

    const handleDelete = async (id: number) => {
        if(confirm('Remove this competitor from repository?')) {
            await deleteCompetitor(id);
        }
    };

    const handleEdit = (item: CompetitorBenchmarkItem) => {
        setEditingItem(item);
        setFormData(item);
        setViewMode('form');
    };

    const handleSave = async () => {
        const payload = {
            ...formData,
            updated_on: 'Just now'
        };

        if (editingItem) {
            await updateCompetitor(editingItem.id, payload);
        } else {
            await createCompetitor(payload as any);
        }
        setViewMode('list');
        setEditingItem(null);
        setFormData({
            competitor_name: '', domain: '', industry: 'Technology', sector: 'SaaS', 
            region: 'United States', da: 0, dr: 0, monthly_traffic: '0', 
            total_keywords: 0, backlinks: 0, status: 'Active'
        });
    };

    const getDaBadge = (score: number) => {
        let color = 'bg-gray-100 text-gray-800 border-gray-200';
        if (score >= 70) color = 'bg-green-50 text-green-700 border-green-200';
        else if (score >= 40) color = 'bg-yellow-50 text-yellow-700 border-yellow-200';
        else if (score > 0) color = 'bg-red-50 text-red-700 border-red-200';

        return (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${color}`}>
                {score}
            </div>
        );
    };

    const getStatusBadge = (status?: string) => {
        const s = status || 'Inactive';
        return (
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${s === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                {s}
            </span>
        );
    };

    const columns = [
        {
            header: 'Competitor Name',
            accessor: (item: CompetitorBenchmarkItem) => (
                <div className="font-bold text-slate-800">{item.competitor_name}</div>
            )
        },
        {
            header: 'Website URL',
            accessor: (item: CompetitorBenchmarkItem) => (
                <a href={`https://${item.domain}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs font-mono">
                    {item.domain}
                </a>
            )
        },
        {
            header: 'Industry / Sector',
            accessor: (item: CompetitorBenchmarkItem) => (
                <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-700">{item.industry}</span>
                    <span className="text-[10px] text-slate-500">{item.sector}</span>
                </div>
            )
        },
        {
            header: 'Primary Country',
            accessor: 'region' as keyof CompetitorBenchmarkItem,
            className: "text-sm text-slate-600"
        },
        {
            header: 'Domain Authority (DA)',
            accessor: (item: CompetitorBenchmarkItem) => getDaBadge(item.da),
            className: "text-center"
        },
        {
            header: 'Estimated Traffic',
            accessor: 'monthly_traffic' as keyof CompetitorBenchmarkItem,
            className: "text-right font-mono text-xs"
        },
        {
            header: 'Total Keywords Ranked',
            accessor: (item: CompetitorBenchmarkItem) => (item.total_keywords || 0).toLocaleString(),
            className: "text-right font-mono text-xs"
        },
        {
            header: 'Backlink Count',
            accessor: (item: CompetitorBenchmarkItem) => (item.backlinks || 0).toLocaleString(),
            className: "text-right font-mono text-xs"
        },
        {
            header: 'Status',
            accessor: (item: CompetitorBenchmarkItem) => getStatusBadge(item.status),
            className: "text-center"
        },
        {
            header: 'Last Updated',
            accessor: 'updated_on' as keyof CompetitorBenchmarkItem,
            className: "text-xs text-slate-400 italic"
        },
        {
            header: '',
            accessor: (item: CompetitorBenchmarkItem) => (
                <div className="flex space-x-2 justify-end">
                    <button onClick={() => handleEdit(item)} className="text-slate-400 hover:text-blue-600 p-1" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-600 p-1" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            )
        }
    ];

    if (viewMode === 'form') {
        return (
            <div className="h-full flex flex-col w-full p-6 animate-fade-in">
                <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full">
                    <div className="border-b border-slate-200 px-8 py-5 flex justify-between items-center bg-slate-50/50 w-full">
                        <h2 className="text-2xl font-bold text-slate-800">{editingItem ? "Edit Competitor" : "Add Competitor"}</h2>
                        <div className="flex gap-3">
                            <button onClick={() => setViewMode('list')} className="px-5 py-2.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                            <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors">Save</button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 w-full">
                        <div className="w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Competitor Name</label>
                                        <input type="text" value={formData.competitor_name} onChange={(e) => setFormData({...formData, competitor_name: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Acme Corp" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                                        <input type="text" value={formData.domain} onChange={(e) => setFormData({...formData, domain: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="acmecorp.com" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                                        <select value={formData.industry} onChange={(e) => setFormData({...formData, industry: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                                            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                                        <input type="text" value={formData.sector} onChange={(e) => setFormData({...formData, sector: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. SaaS" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                                        <select value={formData.region} onChange={(e) => setFormData({...formData, region: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                                            {STATUSES.filter(s => s !== 'All Status').map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm w-full">
                                <h4 className="font-bold text-slate-800 text-sm uppercase mb-4">Metrics</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Domain Authority (DA)</label>
                                        <input type="number" value={formData.da} onChange={(e) => setFormData({...formData, da: parseInt(e.target.value)})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Domain Rating (DR)</label>
                                        <input type="number" value={formData.dr} onChange={(e) => setFormData({...formData, dr: parseInt(e.target.value)})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Traffic</label>
                                        <input type="text" value={formData.monthly_traffic} onChange={(e) => setFormData({...formData, monthly_traffic: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 w-full">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Keywords</label>
                                        <input type="number" value={formData.total_keywords} onChange={(e) => setFormData({...formData, total_keywords: parseInt(e.target.value)})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Backlinks</label>
                                        <input type="number" value={formData.backlinks} onChange={(e) => setFormData({...formData, backlinks: parseInt(e.target.value)})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ranking Coverage %</label>
                                        <input type="number" value={formData.ranking_coverage} onChange={(e) => setFormData({...formData, ranking_coverage: parseInt(e.target.value)})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col w-full p-6 animate-fade-in">
            <div className="flex justify-between items-start flex-shrink-0 w-full mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Competitor Repository</h1>
                    <p className="text-slate-500 mt-1">Track and benchmark competitor performance metrics.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={handleRefresh} className="text-slate-600 hover:text-indigo-600 bg-white border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center">
                        <svg className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Refresh Data
                    </button>
                    <button onClick={handleExport} className="text-slate-600 hover:text-indigo-600 bg-white border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors">Export</button>
                    <button onClick={() => { setEditingItem(null); setFormData({competitor_name: '', domain: '', industry: 'Technology', sector: 'SaaS', region: 'United States', da: 0, dr: 0, monthly_traffic: '0', total_keywords: 0, backlinks: 0, status: 'Active'}); setViewMode('form'); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors">+ Add Competitor</button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex-shrink-0 w-full mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center w-full">
                    <input type="search" className="block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500" placeholder="Search competitors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                        <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5 min-w-[140px]">{INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}</select>
                        <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5 min-w-[140px]">{COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5 min-w-[120px]">{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200 w-full">
                <div className="flex-1 overflow-hidden w-full">
                    <Table columns={columns} data={filteredData} title="Competitor Landscape" />
                </div>
            </div>
        </div>
    );
};

export default CompetitorRepositoryView;
