
import React, { useState } from 'react';
import Table from '../components/Table';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { CompetitorBenchmarkItem } from '../types';

const INDUSTRIES = ['All Industries', 'Technology', 'E-commerce', 'Media', 'Healthcare', 'Finance'];
const COUNTRIES = ['All Countries', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Global'];
const STATUSES = ['All Status', 'Active', 'Inactive', 'Watchlist'];

const CompetitorBenchmarkMasterView: React.FC = () => {
    const { data: competitors, create, update, remove } = useData<CompetitorBenchmarkItem>('competitors');
    const [searchQuery, setSearchQuery] = useState('');
    
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [editingItem, setEditingItem] = useState<CompetitorBenchmarkItem | null>(null);
    const [formData, setFormData] = useState<Partial<CompetitorBenchmarkItem>>({
        competitor_name: '', domain: '', industry: 'Technology', region: 'United States', da: 0, dr: 0, monthly_traffic: 0, backlinks: 0, ranking_coverage: 0, status: 'Active'
    });

    const filteredData = competitors.filter(item => 
        item.competitor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.domain.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEdit = (item: CompetitorBenchmarkItem) => {
        setEditingItem(item);
        setFormData(item);
        setViewMode('form');
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this competitor?')) {
            await remove(id);
        }
    };

    const handleSave = async () => {
        if (editingItem) {
            await update(editingItem.id, { ...formData, updated_on: 'Just now' });
        } else {
            await create({ ...formData, updated_on: 'Just now' } as any);
        }
        setViewMode('list');
        setEditingItem(null);
        setFormData({ competitor_name: '', domain: '', industry: 'Technology', region: 'United States', da: 0, dr: 0, monthly_traffic: 0, backlinks: 0, ranking_coverage: 0, status: 'Active' });
    };

    const handleExport = () => {
        exportToCSV(filteredData, 'competitor_benchmark_master_export');
    };

    const columns = [
        { 
            header: 'Competitor Name', 
            accessor: 'competitor_name' as keyof CompetitorBenchmarkItem, 
            className: 'font-bold text-slate-800' 
        },
        { 
            header: 'Domain', 
            accessor: (item: CompetitorBenchmarkItem) => (
                <a href={`https://${item.domain}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono text-xs">
                    {item.domain}
                </a>
            )
        },
        { header: 'Industry', accessor: 'industry' as keyof CompetitorBenchmarkItem },
        { header: 'Region', accessor: 'region' as keyof CompetitorBenchmarkItem },
        { 
            header: 'DA / DR', 
            accessor: (item: CompetitorBenchmarkItem) => (
                <div className="flex flex-col space-y-1">
                    <span className="text-xs font-medium bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-100 w-fit">DA: {item.da}</span>
                    <span className="text-xs font-medium bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 w-fit">DR: {item.dr}</span>
                </div>
            )
        },
        { 
            header: 'Traffic', 
            accessor: (item: CompetitorBenchmarkItem) => item.monthly_traffic.toLocaleString(),
            className: "text-right font-mono"
        },
        { header: 'Updated On', accessor: 'updated_on' as keyof CompetitorBenchmarkItem, className: "text-xs text-slate-500" },
        {
            header: 'Actions',
            accessor: (item: CompetitorBenchmarkItem) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleEdit(item)} className="text-slate-400 hover:text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            )
        }
    ];

    if (viewMode === 'form') {
        return (
            <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in w-full">
                <div className="border-b border-slate-200 px-8 py-5 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-2xl font-bold text-slate-800">{editingItem ? "Edit Competitor" : "Add Competitor"}</h2>
                    <div className="flex gap-3">
                        <button onClick={() => setViewMode('list')} className="px-5 py-2.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                        <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors">Save</button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                    <div className="w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Competitor Name</label>
                            <input type="text" value={formData.competitor_name} onChange={(e) => setFormData({...formData, competitor_name: e.target.value})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
                            <input type="text" value={formData.domain} onChange={(e) => setFormData({...formData, domain: e.target.value})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                                <select value={formData.industry} onChange={(e) => setFormData({...formData, industry: e.target.value})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl bg-white">
                                    {INDUSTRIES.filter(i => i !== 'All Industries').map(i => <option key={i} value={i}>{i}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                                <select value={formData.region} onChange={(e) => setFormData({...formData, region: e.target.value})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl bg-white">
                                    {COUNTRIES.filter(c => c !== 'All Countries').map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">DA</label>
                                <input type="number" value={formData.da} onChange={(e) => setFormData({...formData, da: parseInt(e.target.value)})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">DR</label>
                                <input type="number" value={formData.dr} onChange={(e) => setFormData({...formData, dr: parseInt(e.target.value)})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Traffic</label>
                                <input type="number" value={formData.monthly_traffic} onChange={(e) => setFormData({...formData, monthly_traffic: parseInt(e.target.value)})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 h-full flex flex-col w-full p-6 animate-fade-in">
            <div className="flex justify-between items-start flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Competitor Benchmark Master</h1>
                    <p className="text-slate-500 mt-1">Track and compare competitor metrics.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={handleExport}
                        className="bg-white text-slate-600 border border-slate-300 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-50 shadow-sm transition-colors"
                    >
                        Export
                    </button>
                    <button 
                        onClick={() => { setEditingItem(null); setFormData({competitor_name: '', domain: '', industry: 'Technology', region: 'United States', da: 0, dr: 0, monthly_traffic: 0, backlinks: 0, ranking_coverage: 0, status: 'Active'}); setViewMode('form'); }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 shadow-sm transition-colors"
                    >
                        Add Competitor
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex-shrink-0">
                <input 
                    type="search" 
                    className="block w-full p-2.5 border border-gray-300 rounded-lg" 
                    placeholder="Search competitor..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="flex-1 overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200">
                <Table columns={columns} data={filteredData} title="Competitor Landscape" />
            </div>
        </div>
    );
};

export default CompetitorBenchmarkMasterView;
