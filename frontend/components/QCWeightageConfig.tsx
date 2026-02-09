import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, Search, AlertCircle, CheckCircle } from 'lucide-react';
import QCWeightageModal from './QCWeightageModal';
import { API_BASE_URL } from '../constants';

interface Config {
    id: number;
    config_name: string;
    description: string;
    total_weight: number;
    is_valid: boolean;
    status: string;
    item_count: number;
    created_at: string;
    updated_at: string;
}

export default function QCWeightageConfig() {
    const [configs, setConfigs] = useState<Config[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState<Config | null>(null);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/qc-weightage`);
            const data = await response.json();
            setConfigs(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error('Error fetching configs:', error);
            setConfigs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddConfig = () => {
        setSelectedConfig(null);
        setShowModal(true);
    };

    const handleEditConfig = (config: Config) => {
        setSelectedConfig(config);
        setShowModal(true);
    };

    const handleDeleteConfig = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this configuration?')) {
            try {
                await fetch(`${API_BASE_URL}/qc-weightage/${id}`, { method: 'DELETE' });
                fetchConfigs();
            } catch (error) {
                console.error('Error deleting config:', error);
            }
        }
    };

    const handleSaveConfig = () => {
        fetchConfigs();
        setShowModal(false);
    };

    const filteredConfigs = (configs || []).filter(config => {
        if (!config) return false;
        const matchesSearch = (config.config_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || config.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">QC Weightage Configuration</h1>
                        <p className="text-gray-600 mt-1">Configure QC score weightage for checklists</p>
                    </div>
                    <button
                        onClick={handleAddConfig}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={20} />
                        Add Configuration
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
                    </div>
                </div>

                {/* Configurations Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading configurations...</div>
                    ) : filteredConfigs.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No configurations found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Config Name</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Items</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total Weight</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Valid</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredConfigs.map((config) => (
                                        <tr key={config.id} className="border-b hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">{config.config_name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{config.description || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{config.item_count} items</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                                    {config.total_weight}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {config.is_valid ? (
                                                    <div className="flex items-center gap-1 text-green-600">
                                                        <CheckCircle size={18} />
                                                        <span>Valid</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-red-600">
                                                        <AlertCircle size={18} />
                                                        <span>Invalid</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {config.status === 'active' ? '✓ Active' : '✗ Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditConfig(config)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                        title="Edit config"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteConfig(config.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                                        title="Delete config"
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
                    <QCWeightageModal
                        config={selectedConfig}
                        onClose={() => setShowModal(false)}
                        onSave={handleSaveConfig}
                    />
                )}
            </div>
        </div>
    );
}
