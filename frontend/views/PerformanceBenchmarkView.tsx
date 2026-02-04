
import React, { useState, useRef } from 'react';
import Table from '../components/Table';
import { getStatusBadge } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV, parseCSV } from '../utils/csvHelper';
import type { OKRItem } from '../types';

const PerformanceBenchmarkView: React.FC = () => {
    const { data: okrs, create, update, remove } = useData<OKRItem>('okrs');
    const [activeTab, setActiveTab] = useState<'okr' | 'kpi' | 'log'>('okr');

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCycle, setSelectedCycle] = useState('All Cycles');

    // Full Frame State
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [editingItem, setEditingItem] = useState<OKRItem | null>(null);
    const [formData, setFormData] = useState<Partial<OKRItem>>({
        objective: '', type: 'Department', cycle: 'Q1', owner: '', alignment: '', progress: 0, status: 'Active'
    });

    // Import Ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filtering Logic
    const filteredOkrs = okrs.filter(item => {
        const matchesSearch = (item.objective || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.owner || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.type || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCycle = selectedCycle === 'All Cycles' || item.cycle === selectedCycle;

        return matchesSearch && matchesCycle;
    });

    // Unique Cycles for Dropdown
    const uniqueCycles = Array.from(new Set(okrs.map(o => o.cycle))).sort();

    // --- Actions ---

    const handleEdit = (item: OKRItem) => {
        setEditingItem(item);
        setFormData(item);
        setViewMode('form');
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this OKR?')) {
            await remove(id);
        }
    };

    const handleSave = async () => {
        const payload = {
            ...formData,
            updated_on: 'Just now'
        };

        if (editingItem) {
            await update(editingItem.id, payload);
        } else {
            await create(payload as any);
        }
        setViewMode('list');
        setEditingItem(null);
        setFormData({ objective: '', type: 'Department', cycle: 'Q1', owner: '', alignment: '', progress: 0, status: 'Active' });
    };

    const handleExport = () => {
        exportToCSV(filteredOkrs, 'OKR_Master_Export');
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const parsedData = await parseCSV(e.target.files[0]);
                let count = 0;
                for (const item of parsedData) {
                    // Basic validation
                    if (item.objective && item.owner) {
                        await create({
                            ...item,
                            progress: parseInt(String(item.progress)) || 0,
                            updated_on: 'Imported'
                        } as any);
                        count++;
                    }
                }
                alert(`Successfully imported ${count} OKRs.`);
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error('Error parsing CSV file. Please check the format.');
                    console.error(error);
                }
                alert('Error parsing CSV file. Please check the format.');
            }
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const okrColumns = [
        {
            header: 'Objective',
            accessor: (item: OKRItem) => (
                <div>
                    <div className="font-medium text-slate-900">{item.objective}</div>
                    {item.alignment && <div className="text-xs text-slate-500 mt-0.5">🔗 {item.alignment}</div>}
                </div>
            ),
            className: "min-w-[300px]"
        },
        {
            header: 'Type',
            accessor: (item: OKRItem) => (
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${item.type === 'Company' ? 'bg-purple-100 text-purple-800' :
                        item.type === 'Department' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-700'
                    }`}>
                    {item.type}
                </span>
            )
        },
        { header: 'Cycle', accessor: 'cycle' as keyof OKRItem, className: 'font-mono text-xs text-slate-600' },
        {
            header: 'Owner',
            accessor: (item: OKRItem) => (
                <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold mr-2">
                        {item.owner ? item.owner.charAt(0) : '?'}
                    </div>
                    <span className="text-sm text-slate-700">{item.owner}</span>
                </div>
            )
        },
        {
            header: 'Progress %',
            accessor: (item: OKRItem) => (
                <div className="w-32">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-slate-700">{item.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full ${(item.progress || 0) === 100 ? 'bg-green-500' :
                                    (item.progress || 0) > 60 ? 'bg-blue-500' :
                                        (item.progress || 0) > 30 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                            style={{ width: `${Math.min(item.progress || 0, 100)}%` }}
                        ></div>
                    </div>
                </div>
            )
        },
        { header: 'Status', accessor: (item: OKRItem) => getStatusBadge(item.status || '') },
        { header: 'Updated On', accessor: 'updated_on' as keyof OKRItem, className: 'text-xs text-slate-500' },
        {
            header: 'Actions',
            accessor: (item: OKRItem) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleEdit(item)} className="text-slate-400 hover:text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            )
        }
    ];

    if (viewMode === 'form') {
        return (
            <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in w-full">
                {/* Header */}
                <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <button onClick={() => { setViewMode('list'); setEditingItem(null); }} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <h2 className="text-xl font-bold text-slate-800">{editingItem ? 'Edit OKR' : 'Define New OKR'}</h2>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => { setViewMode('list'); setEditingItem(null); }} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                        <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700">Save OKR</button>
                    </div>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                    <div className="w-full space-y-6">
                        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-slate-800 text-sm uppercase mb-4">Objective Details</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Objective</label>
                                    <textarea
                                        value={formData.objective}
                                        onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                                        className="block w-full border border-gray-300 rounded-lg p-3 h-24 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="e.g. Increase market share by 15% through organic growth"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Level / Type</label>
                                        <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })} className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500">
                                            <option>Company</option>
                                            <option>Department</option>
                                            <option>Individual</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Time Cycle</label>
                                        <input type="text" value={formData.cycle} onChange={(e) => setFormData({ ...formData, cycle: e.target.value })} className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Q1 2025" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-slate-800 text-sm uppercase mb-4">Tracking & Ownership</h4>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                                    <input type="text" value={formData.owner} onChange={(e) => setFormData({ ...formData, owner: e.target.value })} className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500" placeholder="Person Responsible" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                                    <input type="number" min="0" max="100" value={formData.progress} onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })} className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alignment (Parent Goal)</label>
                                <input type="text" value={formData.alignment} onChange={(e) => setFormData({ ...formData, alignment: e.target.value })} className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500" placeholder="Optional: Link to higher level OKR" />
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500">
                                    <option>Active</option>
                                    <option>Delayed</option>
                                    <option>Completed</option>
                                    <option>Draft</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 h-full flex flex-col animate-fade-in w-full">
            <div className="flex justify-between items-start flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Performance & Benchmark</h1>
                    <p className="text-slate-500 mt-1">Manage OKRs, KPIs, and performance logs across the organization.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 flex-shrink-0">
                <nav className="-mb-px flex space-x-8">
                    <button onClick={() => setActiveTab('okr')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'okr' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>OKR Master</button>
                    <button onClick={() => setActiveTab('kpi')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'kpi' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>KPI Master</button>
                    <button onClick={() => setActiveTab('log')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'log' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>KPI Log</button>
                </nav>
            </div>

            {/* Controls & Content */}
            <div className="flex-1 flex flex-col space-y-4 min-h-0">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between flex-shrink-0">
                    <div className="relative flex-1 w-full">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" /></svg>
                        </div>
                        <input
                            type="search"
                            className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-slate-50 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Search Objective / Owner / Department..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <select
                            value={selectedCycle}
                            onChange={(e) => setSelectedCycle(e.target.value)}
                            className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 min-w-[120px]"
                        >
                            <option>All Cycles</option>
                            <option>Q1</option>
                            <option>Q2</option>
                            <option>Q3</option>
                            <option>Q4</option>
                            <option>Yearly</option>
                            {uniqueCycles.filter(c => !['Q1', 'Q2', 'Q3', 'Q4', 'Yearly'].includes(c as string)).map(c => (
                                <option key={c as string} value={c as string}>{c as string}</option>
                            ))}
                        </select>

                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" style={{ display: 'none' }} />
                        <button onClick={handleImportClick} className="text-slate-600 hover:text-indigo-600 border border-slate-300 hover:border-indigo-300 bg-white px-3 py-2 rounded-lg transition-colors text-sm flex items-center">Import OKRs</button>
                        <button onClick={handleExport} className="text-slate-600 hover:text-indigo-600 border border-slate-300 hover:border-indigo-300 bg-white px-3 py-2 rounded-lg transition-colors text-sm flex items-center">Export</button>

                        <button
                            onClick={() => {
                                setEditingItem(null);
                                setFormData({ objective: '', type: 'Department', cycle: 'Q1', owner: '', alignment: '', progress: 0, status: 'Active' });
                                setViewMode('form');
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 shadow-sm transition-colors flex items-center"
                        >
                            + Create New OKR
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                    {activeTab === 'okr' && (
                        <Table columns={okrColumns} data={filteredOkrs} title="" />
                    )}

                    {activeTab === 'kpi' && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                            <h3 className="text-lg font-semibold text-slate-700">KPI Master Configuration</h3>
                            <p className="text-sm">Coming soon...</p>
                        </div>
                    )}

                    {activeTab === 'log' && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                            <h3 className="text-lg font-semibold text-slate-700">KPI Performance Log</h3>
                            <p className="text-sm">Coming soon...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PerformanceBenchmarkView;
