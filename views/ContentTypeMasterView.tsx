import React, { useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { ContentTypeItem } from '../types';

const CATEGORIES = ['All Categories', 'Long-form', 'Short-form', 'Visual'];
const STATUSES = ['All Status', 'Active', 'Inactive'];

const ContentTypeMasterView: React.FC = () => {
    // ... (logic kept same) ...
    const { data: contentTypes, create, update, remove } = useData<ContentTypeItem>('contentTypes');
    
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All Categories');
    const [statusFilter, setStatusFilter] = useState('All Status');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ContentTypeItem | null>(null);
    const [formData, setFormData] = useState<Partial<ContentTypeItem>>({
        content_type: '', category: 'Long-form', description: '', default_attributes: [], use_in_campaigns: 0, status: 'Active'
    });
    const [attrInput, setAttrInput] = useState('');

    const filteredData = contentTypes.filter(item => {
        const matchesSearch = item.content_type.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'All Categories' || item.category === categoryFilter;
        const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const getCategoryBadge = (category: string) => {
        let color = 'bg-gray-100 text-gray-800';
        if (category === 'Long-form') color = 'bg-blue-100 text-blue-800';
        else if (category === 'Visual') color = 'bg-purple-100 text-purple-800';
        else if (category === 'Short-form') color = 'bg-orange-100 text-orange-800';
        return <span className={`px-2 py-1 rounded text-xs font-bold ${color}`}>{category}</span>;
    };

    const getStatusBadge = (status: string) => {
        const color = status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        return <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${color}`}>{status}</span>;
    };

    const handleEdit = (item: ContentTypeItem) => {
        setEditingItem(item);
        setFormData(item);
        setAttrInput(item.default_attributes?.join(', ') || '');
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if(confirm('Delete this content type?')) await remove(id);
    };

    const handleSave = async () => {
        const payload = {
            ...formData,
            default_attributes: attrInput.split(',').map(s => s.trim()).filter(s => s)
        };
        if (editingItem) {
            await update(editingItem.id, payload);
        } else {
            await create(payload as any);
        }
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ content_type: '', category: 'Long-form', description: '', default_attributes: [], use_in_campaigns: 0, status: 'Active' });
        setAttrInput('');
    };

    const handleExport = () => {
        exportToCSV(filteredData, 'content_type_master_export');
    };

    const columns = [
        { header: 'Content Type', accessor: 'content_type' as keyof ContentTypeItem, className: 'font-bold text-slate-800' },
        { header: 'Category', accessor: (item: ContentTypeItem) => getCategoryBadge(item.category) },
        { header: 'Description', accessor: 'description' as keyof ContentTypeItem, className: 'text-sm text-slate-600 max-w-xs truncate' },
        { 
            header: 'Default Attributes', 
            accessor: (item: ContentTypeItem) => (
                <div className="flex flex-col space-y-1">
                    {item.default_attributes?.map((attr, idx) => (
                        <span key={idx} className="text-[10px] text-slate-500 block">• {attr}</span>
                    ))}
                </div>
            )
        },
        { 
            header: 'Status', 
            accessor: (item: ContentTypeItem) => getStatusBadge(item.status)
        },
        {
            header: 'Actions',
            accessor: (item: ContentTypeItem) => (
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
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Content Type Master</h1>
                <div className="flex space-x-3">
                    <button 
                        onClick={handleExport}
                        className="bg-white text-slate-600 border border-slate-300 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-50 shadow-sm transition-colors"
                    >
                        Export
                    </button>
                    <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 shadow-sm">Add Content Type</button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <input type="search" className="block w-full p-2.5 border border-gray-300 rounded-lg" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5">{CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select>
                </div>
            </div>

            <Table columns={columns} data={filteredData} title="Content Type Registry" />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Edit Content Type" : "Add Content Type"}>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700">Name</label><input type="text" value={formData.content_type} onChange={(e) => setFormData({...formData, content_type: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Category</label><select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2">{CATEGORIES.filter(c => c !== 'All Categories').map(c => <option key={c}>{c}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-gray-700">Description</label><input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Attributes (comma separated)</label><input type="text" value={attrInput} onChange={(e) => setAttrInput(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                    <div className="flex justify-end pt-4"><button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save</button></div>
                </div>
            </Modal>
        </div>
    );
};

export default ContentTypeMasterView;