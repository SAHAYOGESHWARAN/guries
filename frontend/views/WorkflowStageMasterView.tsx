import React, { useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { getStatusBadge } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { WorkflowStageItem } from '../types';

const WORKFLOWS = ['All Workflows', 'Content Production', 'SEO Campaign', 'Social Media'];

const WorkflowStageMasterView: React.FC = () => {
    // ... (logic kept same) ...
    const { data: stages, create, update, remove } = useData<WorkflowStageItem>('workflowStages');
    const [searchQuery, setSearchQuery] = useState('');
    const [workflowFilter, setWorkflowFilter] = useState('All Workflows');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<WorkflowStageItem | null>(null);
    const [formData, setFormData] = useState<Partial<WorkflowStageItem>>({
        workflow_name: '', stage_order: 1, total_stages: 1, stage_label: '', color_tag: 'blue', active_flag: 'Active'
    });

    const filteredData = (stages || []).filter(item => {
        if (!item) return false;
        const matchesSearch = (item.workflow_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.stage_label || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesWorkflow = workflowFilter === 'All Workflows' || item.workflow_name === workflowFilter;
        return matchesSearch && matchesWorkflow;
    });

    const getColorBadge = (color: string) => {
        const colorMap: Record<string, string> = {
            blue: 'bg-blue-500', amber: 'bg-amber-500', green: 'bg-green-500', purple: 'bg-purple-500', slate: 'bg-slate-500', red: 'bg-red-500',
        };
        return (
            <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full ${colorMap[color.toLowerCase()] || 'bg-gray-500'} mr-2 shadow-sm`}></span>
                <span className="text-sm capitalize text-slate-600">{color}</span>
            </div>
        );
    };

    const handleEdit = (item: WorkflowStageItem) => {
        setEditingItem(item);
        setFormData(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this stage?')) await remove(id);
    };

    const handleSave = async () => {
        if (editingItem) {
            await update(editingItem.id, formData);
        } else {
            await create(formData as any);
        }
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ workflow_name: '', stage_order: 1, total_stages: 1, stage_label: '', color_tag: 'blue', active_flag: 'Active' });
    };

    const handleExport = () => {
        exportToCSV(filteredData, 'workflow_stage_master_export');
    };

    const columns = [
        { header: 'Workflow Name', accessor: 'workflow_name' as keyof WorkflowStageItem, className: 'font-bold text-slate-800' },
        {
            header: 'Stage Order',
            accessor: (item: WorkflowStageItem) => (
                <div className="flex items-center">
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs mr-1">{item.stage_order}</span>
                    <span className="text-xs text-slate-400">of {item.total_stages}</span>
                </div>
            )
        },
        { header: 'Stage Label', accessor: 'stage_label' as keyof WorkflowStageItem, className: 'font-medium' },
        { header: 'Color Tag', accessor: (item: WorkflowStageItem) => getColorBadge(item.color_tag) },
        { header: 'Active Flag', accessor: (item: WorkflowStageItem) => getStatusBadge(item.active_flag) },
        {
            header: 'Actions',
            accessor: (item: WorkflowStageItem) => (
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
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Workflow Stage Master</h1>
                <div className="flex space-x-3">
                    <button
                        onClick={handleExport}
                        className="bg-white text-slate-600 border border-slate-300 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-50 shadow-sm transition-colors"
                    >
                        Export
                    </button>
                    <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 shadow-sm">Add Workflow Stage</button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <input type="search" className="block w-full p-2.5 border border-gray-300 rounded-lg" placeholder="Search workflows..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <select value={workflowFilter} onChange={(e) => setWorkflowFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5">{WORKFLOWS.map(w => <option key={w} value={w}>{w}</option>)}</select>
                </div>
            </div>

            <Table columns={columns} data={filteredData} title="Workflow Stage Registry" />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Edit Stage" : "Add Stage"}>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700">Workflow Name</label><input type="text" value={formData.workflow_name} onChange={(e) => setFormData({ ...formData, workflow_name: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700">Stage Order</label><input type="number" value={formData.stage_order} onChange={(e) => setFormData({ ...formData, stage_order: parseInt(e.target.value) })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Total Stages</label><input type="number" value={formData.total_stages} onChange={(e) => setFormData({ ...formData, total_stages: parseInt(e.target.value) })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700">Label</label><input type="text" value={formData.stage_label} onChange={(e) => setFormData({ ...formData, stage_label: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700">Color</label><select value={formData.color_tag} onChange={(e) => setFormData({ ...formData, color_tag: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2"><option value="blue">Blue</option><option value="amber">Amber</option><option value="green">Green</option><option value="purple">Purple</option><option value="slate">Slate</option></select></div>
                        <div><label className="block text-sm font-medium text-gray-700">Status</label><select value={formData.active_flag} onChange={(e) => setFormData({ ...formData, active_flag: e.target.value as any })} className="mt-1 block w-full border border-gray-300 rounded-md p-2"><option>Active</option><option>Inactive</option></select></div>
                    </div>
                    <div className="flex justify-end pt-4"><button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save</button></div>
                </div>
            </Modal>
        </div>
    );
};

export default WorkflowStageMasterView;