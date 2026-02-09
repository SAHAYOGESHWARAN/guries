import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import SeoErrorTypeModal from './SeoErrorTypeModal';
import { API_BASE_URL } from '../constants';

interface SeoErrorType {
    id: number;
    error_type: string;
    category: string;
    severity_level: string;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export default function SeoErrorTypeMaster() {
    const [errorTypes, setErrorTypes] = useState<SeoErrorType[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingErrorType, setEditingErrorType] = useState<SeoErrorType | null>(null);
    const [categoryFilter, setCategoryFilter] = useState('All Categories');
    const [severityFilter, setSeverityFilter] = useState('All Severity');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchErrorTypes();
        fetchCategories();
    }, []);

    const fetchErrorTypes = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/seo-error-type-master`);
            const data = await response.json();
            setErrorTypes(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error('Error fetching error types:', error);
            setErrorTypes([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/seo-error-type-master/list/categories`);
            const data = await response.json();
            setCategories(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    const filteredErrorTypes = (errorTypes || []).filter(errorType => {
        if (!errorType) return false;
        const matchesSearch = (errorType.error_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (errorType.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'All Categories' || errorType.category === categoryFilter;
        const matchesSeverity = severityFilter === 'All Severity' || errorType.severity_level === severityFilter;
        const matchesStatus = statusFilter === 'All Status' || errorType.status === statusFilter;
        return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
    });

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'High':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Low':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'High':
                return '🔴';
            case 'Medium':
                return '🟡';
            case 'Low':
                return '🔵';
            default:
                return '⚪';
        }
    };

    const handleAddErrorType = () => {
        setEditingErrorType(null);
        setShowModal(true);
    };

    const handleEditErrorType = (errorType: SeoErrorType) => {
        setEditingErrorType(errorType);
        setShowModal(true);
    };

    const handleDeleteErrorType = async (id: number) => {
        if (confirm('Are you sure you want to delete this SEO error type?')) {
            try {
                await fetch(`${API_BASE_URL}/seo-error-type-master/${id}`, {
                    method: 'DELETE'
                });
                fetchErrorTypes();
            } catch (error) {
                console.error('Error deleting SEO error type:', error);
            }
        }
    };

    const handleSaveErrorType = async (errorTypeData: any) => {
        try {
            const method = editingErrorType ? 'PUT' : 'POST';
            const url = editingErrorType
                ? `${API_BASE_URL}/seo-error-type-master/${editingErrorType.id}`
                : `${API_BASE_URL}/seo-error-type-master`;

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(errorTypeData)
            });

            setShowModal(false);
            fetchErrorTypes();
        } catch (error) {
            console.error('Error saving SEO error type:', error);
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
                        <h1 className="text-3xl font-bold text-gray-900">SEO Error Type Master</h1>
                        <p className="text-gray-600 mt-1">Manage SEO error types, severity levels, and detection rules</p>
                    </div>
                    <button
                        onClick={handleAddErrorType}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={20} />
                        Add Error Type
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <input
                                type="text"
                                placeholder="Search error types..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option>All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                            <select
                                value={severityFilter}
                                onChange={(e) => setSeverityFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option>All Severity</option>
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                            </select>
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

                {/* Error Types Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Error Type</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Severity</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredErrorTypes.map((errorType) => (
                                <tr key={errorType.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{errorType.error_type}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                                            {errorType.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(errorType.severity_level)}`}>
                                            {getSeverityIcon(errorType.severity_level)} {errorType.severity_level}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{errorType.description}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${errorType.status === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {errorType.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditErrorType(errorType)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteErrorType(errorType.id)}
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

                {filteredErrorTypes.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
                        <p className="text-gray-500">No SEO error types found. Create one to get started.</p>
                    </div>
                )}

                {/* Summary */}
                <div className="mt-6 grid grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-gray-600 text-sm">Total Error Types</p>
                        <p className="text-2xl font-bold text-gray-900">{errorTypes.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-gray-600 text-sm">High Severity</p>
                        <p className="text-2xl font-bold text-red-600">{errorTypes.filter(e => e.severity_level === 'High').length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-gray-600 text-sm">Medium Severity</p>
                        <p className="text-2xl font-bold text-yellow-600">{errorTypes.filter(e => e.severity_level === 'Medium').length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-gray-600 text-sm">Low Severity</p>
                        <p className="text-2xl font-bold text-blue-600">{errorTypes.filter(e => e.severity_level === 'Low').length}</p>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <SeoErrorTypeModal
                    errorType={editingErrorType}
                    categories={categories}
                    onSave={handleSaveErrorType}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}
