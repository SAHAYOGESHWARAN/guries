import React, { useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { getStatusBadge } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { PlatformMasterItem } from '../types';

const SCHEDULING_OPTIONS = ['All Scheduling', 'Both', 'Auto', 'Manual'];
const STATUSES = ['All Status', 'Active', 'Inactive'];

const PlatformMasterView: React.FC = () => {
    // ... (logic kept same) ...
    const { data: platforms, create, update, remove } = useData<PlatformMasterItem>('platforms');
    const [searchQuery, setSearchQuery] = useState('');
    const [schedulingFilter, setSchedulingFilter] = useState('All Scheduling');
    const [statusFilter, setStatusFilter] = useState('All Status');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PlatformMasterItem | null>(null);
    const [formData, setFormData] = useState<Partial<PlatformMasterItem>>({
        platform_name: '', content_types_count: 0, asset_types_count: 0, recommended_size: '', scheduling: 'Manual', status: 'Active'
    });

    const filteredData = platforms.filter(item => {
        const matchesSearch = item.platform_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesScheduling = schedulingFilter === 'All Scheduling' || item.scheduling === schedulingFilter;
        const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter;
        return matchesSearch && matchesScheduling && matchesStatus;
    });

    const handleEdit = (item: PlatformMasterItem) => {
        setEditingItem(item);
        setFormData(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if(confirm('Delete this platform?')) await remove(id);
    };

    const handleSave = async () => {
        if (editingItem) {
            await update(editingItem.id, formData);
        } else {
            await create(formData as any);
        }
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ platform_name: '', content_types_count: 0, asset_types_count: 0, recommended_size: '', scheduling: 'Manual', status: 'Active' });
    };

    const handleExport = () => {
        exportToCSV(filteredData, 'platform_master_export');
    };

    const columns = [
        { header: 'Platform Name', accessor: 'platform_name' as keyof PlatformMasterItem, className: 'font-bold text-slate-800' },
        { header: 'Content Types', accessor: 'content_types_count' as keyof PlatformMasterItem, className: "text-center" },
        { header: 'Asset Types', accessor: 'asset_types_count' as keyof PlatformMasterItem, className: "text-center" },
        { header: 'Size', accessor: 'recommended_size' as keyof PlatformMasterItem, className: 'font-mono text-xs text-slate-600' },
        { header: 'Scheduling', accessor: 'scheduling' as keyof PlatformMasterItem },
        { header: 'Status', accessor: (item: PlatformMasterItem) => getStatusBadge(item.status) },
        {
            header: 'Actions',
            accessor: (item: PlatformMasterItem) => (
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
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Platform Master</h1>
                <div className="flex space-x-3">
                    <button 
                        onClick={handleExport}
                        className="bg-white text-slate-600 border border-slate-300 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-50 shadow-sm transition-colors"
                    >
                        Export
                    </button>
                    <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 shadow-sm">Add Platform</button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <input type="search" className="block w-full p-2.5 border border-gray-300 rounded-lg" placeholder="Search platforms..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <select value={schedulingFilter} onChange={(e) => setSchedulingFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5">{SCHEDULING_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}</select>
                </div>
            </div>

            <Table columns={columns} data={filteredData} title="Platform Registry" />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Edit Platform" : "Add Platform"}>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700">Name</label><input type="text" value={formData.platform_name} onChange={(e) => setFormData({...formData, platform_name: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700">Size Info</label><input type="text" value={formData.recommended_size} onChange={(e) => setFormData({...formData, recommended_size: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Scheduling</label><select value={formData.scheduling} onChange={(e) => setFormData({...formData, scheduling: e.target.value as any})} className="mt-1 block w-full border border-gray-300 rounded-md p-2"><option>Manual</option><option>Auto</option><option>Both</option></select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700">Content Types</label><input type="number" value={formData.content_types_count} onChange={(e) => setFormData({...formData, content_types_count: parseInt(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Asset Types</label><input type="number" value={formData.asset_types_count} onChange={(e) => setFormData({...formData, asset_types_count: parseInt(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                    </div>
                    <div className="flex justify-end pt-4"><button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save</button></div>
                </div>
            </Modal>
        </div>
    );
};

export default PlatformMasterView;