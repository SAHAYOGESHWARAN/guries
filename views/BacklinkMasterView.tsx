
import React, { useState } from 'react';
import Table from '../components/Table';
import { getStatusBadge } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { BacklinkSource } from '../types';

const TYPES = ['All Types', 'Guest Post', 'Directory', 'Forum', 'Profile', 'Blog'];
const COUNTRIES = ['All Countries', 'United States', 'United Kingdom', 'Canada', 'Australia'];
const STATUSES = ['All Status', 'active', 'trusted', 'avoid', 'blacklisted', 'test'];

const BacklinkMasterView: React.FC = () => {
    const { data: backlinks, create, update, remove } = useData<BacklinkSource>('backlinks');
    
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All Types');
    const [countryFilter, setCountryFilter] = useState('All Countries');
    const [statusFilter, setStatusFilter] = useState('All Status');

    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [editingItem, setEditingItem] = useState<BacklinkSource | null>(null);
    const [formData, setFormData] = useState<Partial<BacklinkSource>>({
        domain: '', platform_type: 'Guest Post', da_score: 0, spam_score: 0, country: 'United States', pricing: 'Paid', status: 'active'
    });

    const filteredData = backlinks.filter(item => {
        const matchesSearch = item.domain.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'All Types' || item.platform_type === typeFilter;
        const matchesCountry = countryFilter === 'All Countries' || item.country === countryFilter;
        const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter;
        
        return matchesSearch && matchesType && matchesCountry && matchesStatus;
    });

    const getScoreBadge = (score: number, type: 'da' | 'spam') => {
        let color = 'bg-gray-100 text-gray-800';
        if (type === 'da') {
            if (score >= 80) color = 'bg-green-100 text-green-800';
            else if (score >= 50) color = 'bg-blue-100 text-blue-800';
            else color = 'bg-yellow-100 text-yellow-800';
        } else {
            if (score <= 2) color = 'bg-green-100 text-green-800';
            else if (score <= 5) color = 'bg-yellow-100 text-yellow-800';
            else color = 'bg-red-100 text-red-800';
        }
        return <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${color}`}>{score}</div>;
    };

    const handleEdit = (item: BacklinkSource) => {
        setEditingItem(item);
        setFormData(item);
        setViewMode('form');
    };

    const handleDelete = async (id: number) => {
        if(confirm('Delete this backlink source?')) await remove(id);
    };

    const handleSave = async () => {
        // Domain Validation Regex
        const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
        
        if (!formData.domain || !domainRegex.test(formData.domain)) {
            alert("Please enter a valid domain name (e.g., example.com)");
            return;
        }

        if (editingItem) {
            await update(editingItem.id, { ...formData, updated_at: new Date().toISOString() });
        } else {
            await create({ ...formData, updated_at: new Date().toISOString() } as any);
        }
        setViewMode('list');
        setEditingItem(null);
        setFormData({ domain: '', platform_type: 'Guest Post', da_score: 0, spam_score: 0, country: 'United States', pricing: 'Paid', status: 'active' });
    };

    const handleExport = () => {
        exportToCSV(filteredData, 'backlinks_master_export');
    };

    const columns = [
        { header: 'Domain', accessor: 'domain' as keyof BacklinkSource, className: 'font-bold text-slate-800' },
        { header: 'Type', accessor: 'platform_type' as keyof BacklinkSource },
        { header: 'DA', accessor: (item: BacklinkSource) => getScoreBadge(item.da_score, 'da'), className: "text-center" },
        { header: 'Spam', accessor: (item: BacklinkSource) => getScoreBadge(item.spam_score, 'spam'), className: "text-center" },
        { header: 'Country', accessor: 'country' as keyof BacklinkSource },
        { header: 'Pricing', accessor: 'pricing' as keyof BacklinkSource },
        { header: 'Status', accessor: (item: BacklinkSource) => getStatusBadge(item.status) },
        {
            header: 'Actions',
            accessor: (item: BacklinkSource) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            )
        }
    ];

    if (viewMode === 'form') {
        return (
            <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in w-full">
                <div className="border-b border-slate-200 px-8 py-5 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-2xl font-bold text-slate-800">{editingItem ? "Edit Backlink Source" : "Add Backlink Source"}</h2>
                    <div className="flex gap-3">
                        <button onClick={() => setViewMode('list')} className="px-5 py-2.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                        <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors">Save</button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                    <div className="w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Domain</label>
                            <input type="text" value={formData.domain} onChange={(e) => setFormData({...formData, domain: e.target.value})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl" placeholder="e.g. example.com" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
                                <select value={formData.platform_type} onChange={(e) => setFormData({...formData, platform_type: e.target.value})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl bg-white">
                                    {TYPES.filter(t => t !== 'All Types').map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Country</label>
                                <select value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl bg-white">
                                    {COUNTRIES.filter(c => c !== 'All Countries').map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">DA Score</label>
                                <input type="number" value={formData.da_score} onChange={(e) => setFormData({...formData, da_score: parseInt(e.target.value)})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Spam Score</label>
                                <input type="number" value={formData.spam_score} onChange={(e) => setFormData({...formData, spam_score: parseInt(e.target.value)})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Pricing</label>
                                <select value={formData.pricing} onChange={(e) => setFormData({...formData, pricing: e.target.value as any})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl bg-white">
                                    <option>Paid</option><option>Free</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl bg-white">
                                <option value="active">Active</option><option value="trusted">Trusted</option><option value="avoid">Avoid</option><option value="blacklisted">Blacklisted</option><option value="test">Test</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 h-full flex flex-col w-full p-6 animate-fade-in">
            <div className="flex justify-between items-start flex-shrink-0">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Backlink Master</h1>
                <div className="flex space-x-3">
                    <button 
                        onClick={handleExport}
                        className="bg-white text-slate-600 border border-slate-300 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-50 shadow-sm transition-colors"
                    >
                        Export
                    </button>
                    <button onClick={() => { setEditingItem(null); setViewMode('form'); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 shadow-sm">
                        Add Backlink Source
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4 flex-shrink-0">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <input type="search" className="block w-full p-2.5 border border-gray-300 rounded-lg" placeholder="Search domains..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <div className="flex gap-2">
                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5">{TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
                        <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5">{COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5">{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200">
                <Table columns={columns} data={filteredData} title="Backlink Inventory" />
            </div>
        </div>
    );
};

export default BacklinkMasterView;
