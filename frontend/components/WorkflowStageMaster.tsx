import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import WorkflowStageModal from './WorkflowStageModal';
import { API_BASE_URL } from '../constants';

interface Workflow {
    id: number;
    workflow_name: string;
    description: string;
    status: string;
    stage_count: number;
    created_at: string;
    updated_at: string;
}

const COLOR_MAP: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800',
    orange: 'bg-orange-100 text-orange-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    pink: 'bg-pink-100 text-pink-800',
    red: 'bg-red-100 text-red-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    gray: 'bg-gray-100 text-gray-800'
};

export default function WorkflowStageMaster() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingWorkflow, setEditingWorkflow] = useState<any>(null);
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/workflow-stage-master`);
            const data = await response.json();
            setWorkflows(data);
        } catch (error) {
            console.error('Error fetching workflows:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredWorkflows = workflows.filter(workflow => {
        const matchesSearch = workflow.workflow_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All Status' || workflow.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleAddWorkflow = () => {
        setEditingWorkflow(null);
        setShowModal(true);
    };

    const handleEditWorkflow = async (workflow: Workflow) => {
        try {
            const response = await fetch(`${API_BASE_URL}/workflow-stage-master/${workflow.id}`);
            const data = await response.json();
            setEditingWorkflow(data);
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching workflow details:', error);
        }
    };

    const handleDeleteWorkflow = async (id: number) => {
        if (confirm('Are you sure you want to delete this workflow?')) {
            try {
                await fetch(`${API_BASE_URL}/workflow-stage-master/${id}`, {
                    method: 'DELETE'
                });
                fetchWorkflows();
            } catch (error) {
                console.error('Error deleting workflow:', error);
            }
        }
    };

    const handleSaveWorkflow = async (workflowData: any) => {
        try {
            const method = editingWorkflow ? 'PUT' : 'POST';
            const url = editingWorkflow
                ? `${API_BASE_URL}/workflow-stage-master/${editingWorkflow.id}`
                : `${API_BASE_URL}/workflow-stage-master`;

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(workflowData)
            });

            setShowModal(false);
            fetchWorkflows();
        } catch (error) {
            console.error('Error saving workflow:', error);
        }
    };

    if (loading) {
        return <div className="p-6 text-center">Loading...</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Workflow Stage Master</h1>
                        <p className="text-gray-600 mt-1">Manage workflow stages, ordering, and color coding for campaigns</p>
                    </div>
                    <button
                        onClick={handleAddWorkflow}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={20} />
                        Add Workflow
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <input
                                type="text"
                                placeholder="Search workflows..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option>All Status</option>
                                <option>active</option>
                                <option>inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Workflows Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Workflow Name</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Stages</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWorkflows.map((workflow) => (
                                <tr key={workflow.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{workflow.workflow_name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{workflow.description || '-'}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-bold">
                                            {workflow.stage_count}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${workflow.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {workflow.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditWorkflow(workflow)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteWorkflow(workflow.id)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredWorkflows.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <p className="text-gray-500">No workflows found. Create one to get started.</p>
                    </div>
                )}

                {/* Summary */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-gray-600 text-sm">Total Workflows</p>
                        <p className="text-2xl font-bold text-gray-900">{workflows.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-gray-600 text-sm">Active Workflows</p>
                        <p className="text-2xl font-bold text-green-600">{workflows.filter(w => w.status === 'active').length}</p>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <WorkflowStageModal
                    workflow={editingWorkflow}
                    onSave={handleSaveWorkflow}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}
