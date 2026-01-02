
import React, { useState, useRef } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { getStatusBadge } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV, parseCSV } from '../utils/csvHelper';
import type { EffortTarget } from '../types';

const EffortTargetConfigView: React.FC = () => {
    const { data: effortTargets, create, update, remove } = useData<EffortTarget>('effortTargets');
    
    const [filters, setFilters] = useState({ cycle: 'Monthly', department: 'All', role: 'All' });
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<EffortTarget | null>(null);
    const [formData, setFormData] = useState<Partial<EffortTarget>>({
        role: '', category: '', metric: '', monthly: 0, weekly: 0, daily: 0, weightage: '0%', rules: '', status: 'active'
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredData = effortTargets.filter(item => {
        const matchesSearch = item.role.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.metric.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filters.role === 'All' || item.role === filters.role;
        const matchesDept = filters.department === 'All' || item.category === filters.department;
        return matchesSearch && matchesRole && matchesDept;
    });

    const handleEdit = (item: EffortTarget) => {
        setEditingItem(item);
        setFormData(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this target configuration?')) {
            await remove(id);
        }
    };

    const handleSave = async () => {
        if (editingItem) {
            await update(editingItem.id, { ...formData, updated: new Date().toISOString().split('T')[0] });
        } else {
            await create({ ...formData, updated: new Date().toISOString().split('T')[0] } as any);
        }
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ role: '', category: '', metric: '', monthly: 0, weekly: 0, daily: 0, weightage: '0%', rules: '', status: 'active' });
    };

    const handleExport = () => {
        exportToCSV(filteredData, 'effort_targets_export');
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
                    if (item.role && item.metric) {
                        await create({
                            ...item,
                            updated: new Date().toISOString().split('T')[0]
                        } as any);
                        count++;
                    }
                }
                alert(`Successfully imported ${count} targets.`);
            } catch (error) {
                alert('Error parsing CSV file.');
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const columns = [
        { header: 'Role', accessor: 'role' as keyof EffortTarget, className: 'font-bold text-slate-700' },
        { header: 'KPI Category', accessor: 'category' as keyof EffortTarget },
        { header: 'Effort Metric', accessor: 'metric' as keyof EffortTarget },
        { header: 'Monthly Target', accessor: 'monthly' as keyof EffortTarget, className: 'text-right font-mono' },
        { header: 'Weekly Target', accessor: 'weekly' as keyof EffortTarget, className: 'text-right font-mono text-slate-500' },
        { header: 'Daily Target', accessor: 'daily' as keyof EffortTarget, className: 'text-right font-mono text-slate-500' },
        { 
            header: 'Weightage %', 
            accessor: (item: EffortTarget) => {
                const val = parseInt(item.weightage);
                let color = 'bg-blue-100 text-blue-800';
                if(val >= 40) color = 'bg-purple-100 text-purple-800 font-bold';
                else if(val < 25) color = 'bg-gray-100 text-gray-600';
                
                return <span className={`px-2 py-1 rounded text-xs ${color}`}>{item.weightage}</span>;
            }
        },
        { header: 'Auto-Assign Rules', accessor: 'rules' as keyof EffortTarget, className: 'text-xs text-slate-500 italic' },
        { header: 'Status', accessor: (item: EffortTarget) => getStatusBadge(item.status) },
        { header: 'Updated On', accessor: 'updated' as keyof EffortTarget, className: 'text-xs text-slate-400' },
        {
            header: 'Actions',
            accessor: (item: EffortTarget) => (
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

    return (
        <div className="space-y-6 h-full overflow-y-auto w-full pr-1 animate-fade-in">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Effort Target Configuration</h1>
                    <p className="text-slate-500 mt-1">Define role-based effort targets that drive workload prediction, task assignment, and performance analytics</p>
                </div>
                <div className="flex space-x-3">
                    <button className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        View Alignment Engine
                    </button>
                </div>
            </div>

            {/* Controls Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cycle Type</label>
                        <select 
                            value={filters.cycle}
                            onChange={(e) => setFilters({...filters, cycle: e.target.value})}
                            className="bg-slate-50 border border-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-32 p-2"
                        >
                            <option>Monthly</option>
                            <option>Quarterly</option>
                            <option>Annually</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input 
                            type="search" 
                            className="block w-full p-2.5 pl-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50" 
                            placeholder="Search role or metric..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept=".csv" 
                        style={{ display: 'none' }} 
                    />
                    <button onClick={handleImportClick} className="text-slate-600 hover:text-indigo-600 border border-slate-300 px-3 py-2 rounded-lg text-sm font-medium">Import</button>
                    <button onClick={handleExport} className="text-slate-600 hover:text-indigo-600 border border-slate-300 px-3 py-2 rounded-lg text-sm font-medium">Export</button>
                    <button 
                        onClick={() => {
                            setEditingItem(null);
                            setFormData({ role: '', category: '', metric: '', monthly: 0, weekly: 0, daily: 0, weightage: '0%', rules: '', status: 'active' });
                            setIsModalOpen(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 shadow-sm transition-colors flex items-center whitespace-nowrap"
                    >
                        + Add New Target
                    </button>
                </div>
            </div>

            <Table columns={columns} data={filteredData} title="Active Targets" />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Edit Target" : "Add New Target"}>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <input type="text" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                <option value="">Select...</option>
                                <option value="Content">Content</option>
                                <option value="SEO">SEO</option>
                                <option value="SMM">SMM</option>
                                <option value="Web">Web</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Metric</label>
                        <input type="text" value={formData.metric} onChange={(e) => setFormData({...formData, metric: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Monthly</label>
                            <input type="number" value={formData.monthly} onChange={(e) => setFormData({...formData, monthly: parseInt(e.target.value) || 0})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Weekly</label>
                            <input type="number" value={formData.weekly} onChange={(e) => setFormData({...formData, weekly: parseInt(e.target.value) || 0})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Daily</label>
                            <input type="number" value={formData.daily} onChange={(e) => setFormData({...formData, daily: parseInt(e.target.value) || 0})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Weightage</label>
                            <input type="text" value={formData.weightage} onChange={(e) => setFormData({...formData, weightage: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g. 40%" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Rules</label>
                        <input type="text" value={formData.rules} onChange={(e) => setFormData({...formData, rules: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default EffortTargetConfigView;
