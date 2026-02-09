import React, { useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { getStatusBadge } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { QcChecklistItem } from '../types';

const TYPES = ['All Types', 'Content', 'SEO', 'Web', 'SMM', 'Backlinks', 'Analytics', 'Competitor', 'Repository'];
const STATUSES = ['All Status', 'Active', 'Inactive'];

const AuditChecklistMasterView: React.FC = () => {
    // ... (logic kept same) ...
    const { data: checklists, create, update, remove } = useData<QcChecklistItem>('qcChecklists');

    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All Types');
    const [statusFilter, setStatusFilter] = useState('All Status');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<QcChecklistItem | null>(null);
    const [formData, setFormData] = useState<Partial<QcChecklistItem>>({
        checklist_name: '', checklist_type: 'Content', category: 'Editorial', number_of_items: 0, scoring_mode: 'Weighted', pass_threshold: '90%', rework_threshold: '75%', status: 'Active'
    });

    const filteredData = (checklists || []).filter(item => {
        if (!item) return false;
        const matchesSearch = (item.checklist_name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'All Types' || item.checklist_type === typeFilter;
        const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    const handleEdit = (item: QcChecklistItem) => {
        setEditingItem(item);
        setFormData(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this checklist?')) await remove(id);
    };

    const handleSave = async () => {
        if (editingItem) {
            await update(editingItem.id, { ...formData, updated_at: 'Just now' });
        } else {
            await create({ ...formData, updated_at: 'Just now' } as any);
        }
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ checklist_name: '', checklist_type: 'Content', category: 'Editorial', number_of_items: 0, scoring_mode: 'Weighted', pass_threshold: '90%', rework_threshold: '75%', status: 'Active' });
    };

    const handleExport = () => {
        exportToCSV(filteredData, 'audit_checklist_master_export');
    };

    const columns = [
        { header: 'Checklist Name', accessor: 'checklist_name' as keyof QcChecklistItem, className: 'font-bold text-slate-800' },
        { header: 'Type', accessor: 'checklist_type' as keyof QcChecklistItem },
        { header: 'Category', accessor: 'category' as keyof QcChecklistItem },
        { header: 'Items', accessor: 'number_of_items' as keyof QcChecklistItem, className: "text-center" },
        { header: 'Scoring', accessor: 'scoring_mode' as keyof QcChecklistItem },
        { header: 'Pass %', accessor: 'pass_threshold' as keyof QcChecklistItem, className: 'font-bold text-green-600' },
        { header: 'Status', accessor: (item: QcChecklistItem) => getStatusBadge(item.status || 'Active') },
        {
            header: 'Actions',
            accessor: (item: QcChecklistItem) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleEdit(item)} className="text-slate-400 hover:text-blue-600">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-600">Del</button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 h-full overflow-y-auto w-full pr-1">
            <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Audit Checklist Master</h1>
                <div className="flex space-x-3">
                    <button
                        onClick={handleExport}
                        className="bg-white text-slate-600 border border-slate-300 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-50 shadow-sm transition-colors"
                    >
                        Export
                    </button>
                    <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 shadow-sm">Create New Checklist</button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <input type="search" className="block w-full p-2.5 border border-gray-300 rounded-lg" placeholder="Search checklists..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5">{TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
                </div>
            </div>

            <Table columns={columns} data={filteredData} title="Master Checklists" />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Edit Checklist" : "Create Checklist"}>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700">Checklist Name</label><input type="text" value={formData.checklist_name} onChange={(e) => setFormData({ ...formData, checklist_name: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700">Type</label><select value={formData.checklist_type} onChange={(e) => setFormData({ ...formData, checklist_type: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2"><option>Content</option><option>SEO</option><option>Web</option></select></div>
                        <div><label className="block text-sm font-medium text-gray-700">Category</label><input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700">Pass %</label><input type="text" value={formData.pass_threshold} onChange={(e) => setFormData({ ...formData, pass_threshold: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="mt-1 block w-full border border-gray-300 rounded-md p-2"><option>Active</option><option>Inactive</option></select></div>
                    </div>
                    <div className="flex justify-end pt-4"><button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save</button></div>
                </div>
            </Modal>
        </div>
    );
};

export default AuditChecklistMasterView;