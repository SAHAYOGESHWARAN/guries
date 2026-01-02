import React, { useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { getStatusBadge } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { SeoErrorTypeItem } from '../types';

const CATEGORIES = ['All Categories', 'On-page', 'Technical SEO'];
const SEVERITIES = ['All Severity', 'High', 'Medium', 'Low'];

const SeoErrorTypeMasterView: React.FC = () => {
    // ... (logic kept same) ...
    const { data: seoErrors, create, update, remove } = useData<SeoErrorTypeItem>('seoErrors');
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All Categories');
    const [severityFilter, setSeverityFilter] = useState('All Severity');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<SeoErrorTypeItem | null>(null);
    const [formData, setFormData] = useState<Partial<SeoErrorTypeItem>>({
        error_type: '', category: 'On-page', severity: 'Medium', description: '', status: 'Published'
    });

    const filteredData = seoErrors.filter(item => {
        const matchesSearch = item.error_type.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'All Categories' || item.category === categoryFilter;
        const matchesSeverity = severityFilter === 'All Severity' || item.severity === severityFilter;
        return matchesSearch && matchesCategory && matchesSeverity;
    });

    const getSeverityBadge = (severity: string) => {
        let color = 'bg-gray-100 text-gray-800';
        if (severity === 'High') color = 'bg-red-100 text-red-800';
        else if (severity === 'Medium') color = 'bg-yellow-100 text-yellow-800';
        else if (severity === 'Low') color = 'bg-green-100 text-green-800';
        return <span className={`px-2 py-1 rounded text-xs font-bold ${color}`}>{severity}</span>;
    };

    const handleEdit = (item: SeoErrorTypeItem) => {
        setEditingItem(item);
        setFormData(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if(confirm('Delete this error type?')) await remove(id);
    };

    const handleSave = async () => {
        if (editingItem) {
            await update(editingItem.id, formData);
        } else {
            await create(formData as any);
        }
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ error_type: '', category: 'On-page', severity: 'Medium', description: '', status: 'Published' });
    };

    const handleExport = () => {
        exportToCSV(filteredData, 'seo_error_type_master_export');
    };

    const columns = [
        { header: 'Error Type', accessor: 'error_type' as keyof SeoErrorTypeItem, className: 'font-bold text-slate-800' },
        { header: 'Category', accessor: 'category' as keyof SeoErrorTypeItem, className: 'text-slate-600' },
        { header: 'Severity', accessor: (item: SeoErrorTypeItem) => getSeverityBadge(item.severity) },
        { header: 'Description', accessor: 'description' as keyof SeoErrorTypeItem, className: 'text-sm text-slate-600' },
        { header: 'Status', accessor: (item: SeoErrorTypeItem) => getStatusBadge(item.status) },
        {
            header: 'Actions',
            accessor: (item: SeoErrorTypeItem) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">Del</button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 h-full overflow-y-auto w-full pr-1">
            <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">SEO Error Type Master</h1>
                <div className="flex space-x-3">
                    <button 
                        onClick={handleExport}
                        className="bg-white text-slate-600 border border-slate-300 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-50 shadow-sm transition-colors"
                    >
                        Export
                    </button>
                    <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 shadow-sm">Add Error Type</button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <input type="search" className="block w-full p-2.5 border border-gray-300 rounded-lg" placeholder="Search errors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <div className="flex gap-2">
                        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5">{SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    </div>
                </div>
            </div>

            <Table columns={columns} data={filteredData} title="SEO Error Registry" />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Edit Error Type" : "Add Error Type"}>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700">Error Type</label><input type="text" value={formData.error_type} onChange={(e) => setFormData({...formData, error_type: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700">Category</label><select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2"><option>On-page</option><option>Technical SEO</option></select></div>
                        <div><label className="block text-sm font-medium text-gray-700">Severity</label><select value={formData.severity} onChange={(e) => setFormData({...formData, severity: e.target.value as any})} className="mt-1 block w-full border border-gray-300 rounded-md p-2"><option>High</option><option>Medium</option><option>Low</option></select></div>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700">Description</label><input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Status</label><select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="mt-1 block w-full border border-gray-300 rounded-md p-2"><option>Published</option><option>Draft</option><option>Archived</option></select></div>
                    <div className="flex justify-end pt-4"><button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save</button></div>
                </div>
            </Modal>
        </div>
    );
};

export default SeoErrorTypeMasterView;