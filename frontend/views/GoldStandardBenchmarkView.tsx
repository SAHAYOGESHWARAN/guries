
import React, { useState, useRef } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { getStatusBadge } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV, parseCSV } from '../utils/csvHelper';
import type { GoldStandardMetric } from '../types';

const CATEGORIES = ['All', 'SEO', 'Content', 'Technical', 'UX', 'SMM', 'Backlink', 'Page Experience'];

const GoldStandardBenchmarkView: React.FC = () => {
    const { data: benchmarks, create, update, remove } = useData<GoldStandardMetric>('goldStandards');
    
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<GoldStandardMetric | null>(null);
    const [formData, setFormData] = useState<Partial<GoldStandardMetric>>({
        metric_name: '', category: 'SEO', gold_standard_value: '', acceptable_range_min: '', acceptable_range_max: '', unit: '', evidence_link: '', status: 'active'
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredData = benchmarks.filter(item => {
        const matchesSearch = item.metric_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const handleEdit = (item: GoldStandardMetric) => {
        setEditingItem(item);
        setFormData(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this benchmark?')) {
            await remove(id);
        }
    };

    const handleSave = async () => {
        if (editingItem) {
            await update(editingItem.id, { ...formData, updated_on: new Date().toISOString().split('T')[0] });
        } else {
            await create({ ...formData, updated_on: new Date().toISOString().split('T')[0] } as any);
        }
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ metric_name: '', category: 'SEO', gold_standard_value: '', acceptable_range_min: '', acceptable_range_max: '', unit: '', evidence_link: '', status: 'active' });
    };

    const handleExport = () => {
        exportToCSV(filteredData, 'gold_standard_benchmarks');
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
                    if (item.metric_name && item.category) {
                        await create({
                            ...item,
                            updated_on: new Date().toISOString().split('T')[0]
                        } as any);
                        count++;
                    }
                }
                alert(`Successfully imported ${count} benchmarks.`);
            } catch (error) {
                alert('Error parsing CSV file.');
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const columns = [
        { header: 'Metric Name', accessor: 'metric_name' as keyof GoldStandardMetric, className: 'font-medium text-slate-800' },
        { 
            header: 'Category', 
            accessor: (item: GoldStandardMetric) => (
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    item.category === 'SEO' ? 'bg-blue-100 text-blue-800' :
                    item.category === 'Technical' ? 'bg-purple-100 text-purple-800' :
                    item.category === 'UX' ? 'bg-pink-100 text-pink-800' :
                    item.category === 'Content' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-600'
                }`}>
                    {item.category}
                </span>
            ) 
        },
        { header: 'Gold Standard Value', accessor: 'gold_standard_value' as keyof GoldStandardMetric, className: 'font-bold text-emerald-600' },
        { header: 'Range', accessor: 'acceptable_range_min' as keyof GoldStandardMetric, className: 'text-xs font-mono' },
        { header: 'Unit', accessor: 'unit' as keyof GoldStandardMetric, className: 'text-xs text-slate-500' },
        { header: 'Evidence', accessor: 'evidence_link' as keyof GoldStandardMetric, className: 'text-xs italic text-slate-500' },
        { header: 'Updated On', accessor: 'updated_on' as keyof GoldStandardMetric, className: 'text-xs text-slate-400' },
        { header: 'Status', accessor: (item: GoldStandardMetric) => getStatusBadge(item.status || '') },
        {
            header: 'Actions',
            accessor: (item: GoldStandardMetric) => (
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
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Gold Standard Benchmark Master</h1>
                    <p className="text-slate-500 mt-1">Store ideal expected benchmarks for all KPIs across SEO, content, technical, and UX metrics.</p>
                </div>
                <div className="flex space-x-3">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept=".csv" 
                        style={{ display: 'none' }} 
                    />
                    <button onClick={handleImportClick} className="bg-white text-slate-600 border border-slate-300 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-slate-50 shadow-sm transition-colors">
                        Import
                    </button>
                    <button onClick={handleExport} className="bg-white text-slate-600 border border-slate-300 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-slate-50 shadow-sm transition-colors">
                        Export
                    </button>
                    <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 shadow-sm transition-colors flex items-center">
                        <span className="mr-2">+</span> Add Gold Standard
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative flex-1 w-full md:w-auto md:max-w-md">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                            </svg>
                        </div>
                        <input 
                            type="search" 
                            className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-slate-50 focus:ring-indigo-500 focus:border-indigo-500" 
                            placeholder="Search gold standard metrics..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                activeCategory === cat 
                                    ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500/20' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <Table columns={columns} data={filteredData} title="Benchmarks Directory" />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Edit Benchmark" : "Add Benchmark"}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Metric Name</label>
                        <input type="text" value={formData.metric_name} onChange={(e) => setFormData({...formData, metric_name: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Gold Standard Value</label>
                            <input type="text" value={formData.gold_standard_value} onChange={(e) => setFormData({...formData, gold_standard_value: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Min Range</label>
                            <input type="text" value={formData.acceptable_range_min} onChange={(e) => setFormData({...formData, acceptable_range_min: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Unit</label>
                            <input type="text" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Evidence / Source</label>
                        <input type="text" value={formData.evidence_link} onChange={(e) => setFormData({...formData, evidence_link: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default GoldStandardBenchmarkView;
