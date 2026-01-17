import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, Search, Eye } from 'lucide-react';
import AuditChecklistModal from './AuditChecklistModal';

interface Checklist {
    id: number;
    checklist_name: string;
    checklist_type: string;
    checklist_category: string;
    status: string;
    scoring_mode: string;
    pass_threshold: number;
    rework_threshold: number;
    qc_output_type: string;
    item_count: number;
    module_count: number;
    created_at: string;
    updated_at: string;
}

export default function AuditChecklist() {
    const [checklists, setChecklists] = useState<Checklist[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        fetchChecklists();
    }, []);

    const fetchChecklists = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/audit-checklist');
            const data = await response.json();
            setChecklists(data);
        } catch (error) {
            console.error('Error fetching checklists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddChecklist = () => {
        setSelectedChecklist(null);
        setShowModal(true);
    };

    const handleEditChecklist = (checklist: Checklist) => {
        setSelectedChecklist(checklist);
        setShowModal(true);
    };

    const handleDeleteChecklist = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this checklist?')) {
            try {
                await fetch(`/api/audit-checklist/${id}`, { method: 'DELETE' });
                fetchChecklists();
            } catch (error) {
                console.error('Error deleting checklist:', error);
            }
        }
    };

    const handleSaveChecklist = () => {
        fetchChecklists();
        setShowModal(false);
    };

    const filteredChecklists = checklists.filter(checklist => {
        const matchesSearch = checklist.checklist_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || checklist.status === filterStatus;
        const matchesType = filterType === 'all' || checklist.checklist_type === filterType;
        return matchesSearch && matchesStatus && matchesType;
    });

    const checklistTypes = [...new Set(checklists.map(c => c.checklist_type))];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Audit Checklists</h1>
                        <p className="text-gray-600 mt-1">Manage QC checklists and scoring rules</p>
                    </div>
                    <button
                        onClick={handleAddChecklist}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={20} />
                        Add Checklist
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Types</option>
                            {checklistTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Checklists Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading checklists...</div>
                    ) : filteredChecklists.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No checklists found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Checklist Name</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Items</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Scoring Mode</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Pass Threshold</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rework Threshold</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredChecklists.map((checklist) => (
                                        <tr key={checklist.id} className="border-b hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">{checklist.checklist_name}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                    {checklist.checklist_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{checklist.checklist_category}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{checklist.item_count} items</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{checklist.scoring_mode}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                                    {checklist.pass_threshold}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                                                    {checklist.rework_threshold}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${checklist.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {checklist.status === 'active' ? '✓ Active' : '✗ Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditChecklist(checklist)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                        title="Edit checklist"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteChecklist(checklist.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                                        title="Delete checklist"
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
                    )}
                </div>

                {/* Modal */}
                {showModal && (
                    <AuditChecklistModal
                        checklist={selectedChecklist}
                        onClose={() => setShowModal(false)}
                        onSave={handleSaveChecklist}
                    />
                )}
            </div>
        </div>
    );
}
