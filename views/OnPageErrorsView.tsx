
import React, { useState } from 'react';
import Table from '../components/Table';
import { useData } from '../hooks/useData';
import { getStatusBadge } from '../constants';
import type { UrlError } from '../types';

const SEVERITY_LEVELS = ['All', 'High', 'Medium', 'Low'];
const STATUSES = ['All', 'Open', 'In Progress', 'Resolved', 'Ignored'];

const OnPageErrorsView: React.FC = () => {
    const { data: errors, create: createError, update: updateError } = useData<UrlError>('urlErrors');
    const [searchQuery, setSearchQuery] = useState('');
    const [severityFilter, setSeverityFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    
    // Full Frame State
    const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
    
    const [newError, setNewError] = useState<Partial<UrlError>>({
        url: '', error_type: 'Missing H1', severity: 'Medium', description: '', status: 'Open', assigned_to_id: 0
    });

    const filteredErrors = errors.filter(item => {
        const matchesSearch = item.url.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.error_type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSeverity = severityFilter === 'All' || item.severity === severityFilter;
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        return matchesSearch && matchesSeverity && matchesStatus;
    });

    const handleCreate = async () => {
        await createError(newError as any);
        setViewMode('list');
        setNewError({ url: '', error_type: 'Missing H1', severity: 'Medium', description: '', status: 'Open', assigned_to_id: 0 });
    };

    const handleResolve = async (id: number) => {
        await updateError(id, { status: 'Resolved' });
    };

    const columns = [
        { header: 'URL', accessor: 'url' as keyof UrlError, className: 'text-xs text-blue-600 font-mono' },
        { header: 'Error Type', accessor: 'error_type' as keyof UrlError, className: 'font-bold text-slate-700' },
        { 
            header: 'Severity', 
            accessor: (item: UrlError) => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                    item.severity === 'High' ? 'bg-red-100 text-red-800' : 
                    item.severity === 'Medium' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                }`}>
                    {item.severity}
                </span>
            ) 
        },
        { header: 'Status', accessor: (item: UrlError) => getStatusBadge(item.status) },
        { header: 'Last Checked', accessor: (item: UrlError) => new Date(item.updated_at).toLocaleDateString() },
        { 
            header: 'Actions', 
            accessor: (item: UrlError) => (
                <button 
                    onClick={() => handleResolve(item.id)} 
                    disabled={item.status === 'Resolved'}
                    className="text-xs bg-white border border-slate-300 px-2 py-1 rounded hover:bg-slate-50 disabled:opacity-50"
                >
                    Mark Resolved
                </button>
            ) 
        }
    ];

    if (viewMode === 'create') {
        return (
            <div className="h-full flex flex-col w-full p-6 animate-fade-in">
                <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full">
                    <div className="border-b border-slate-200 px-8 py-5 flex justify-between items-center bg-slate-50/50 w-full">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Log SEO Error</h2>
                            <p className="text-slate-500 text-sm mt-1">Manual entry for technical audits</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setViewMode('list')} className="px-5 py-2.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                            <button onClick={handleCreate} className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-red-700 transition-colors">Log Issue</button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 w-full">
                        <div className="w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 w-full">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Page URL</label>
                                <input 
                                    type="text" 
                                    className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500" 
                                    placeholder="https://..." 
                                    value={newError.url} 
                                    onChange={e => setNewError({...newError, url: e.target.value})} 
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Error Type</label>
                                    <select 
                                        className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500 bg-white" 
                                        value={newError.error_type} 
                                        onChange={e => setNewError({...newError, error_type: e.target.value})}
                                    >
                                        <option>Missing H1</option>
                                        <option>Broken Link</option>
                                        <option>Slow Load</option>
                                        <option>Duplicate Meta</option>
                                        <option>Canonical Issue</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Severity</label>
                                    <select 
                                        className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500 bg-white" 
                                        value={newError.severity} 
                                        onChange={e => setNewError({...newError, severity: e.target.value as any})}
                                    >
                                        <option>High</option>
                                        <option>Medium</option>
                                        <option>Low</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                <textarea 
                                    className="block w-full px-4 py-3 border border-slate-300 rounded-xl h-32 focus:ring-red-500 focus:border-red-500 resize-none" 
                                    placeholder="Describe the issue..." 
                                    value={newError.description} 
                                    onChange={e => setNewError({...newError, description: e.target.value})} 
                                />
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
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">On-Page SEO Errors</h1>
                    <p className="text-slate-500 mt-1">Audit and resolve technical SEO issues across your sites.</p>
                </div>
                <button onClick={() => setViewMode('create')} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 shadow-sm transition-colors">
                    + Log New Error
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 flex-shrink-0 w-full mb-6">
                <input 
                    type="search" 
                    className="block w-full md:w-1/3 p-2.5 border border-gray-300 rounded-lg" 
                    placeholder="Search errors..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} 
                />
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5 min-w-[120px]">
                        {SEVERITY_LEVELS.map(s => <option key={s} value={s}>{s} Severity</option>)}
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5 min-w-[120px]">
                        {STATUSES.map(s => <option key={s} value={s}>{s} Status</option>)}
                    </select>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200 w-full">
                <div className="flex-1 overflow-hidden w-full">
                    <Table columns={columns} data={filteredErrors} title="Error Log" />
                </div>
            </div>
        </div>
    );
};

export default OnPageErrorsView;