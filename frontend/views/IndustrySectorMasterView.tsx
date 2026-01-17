import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import type { IndustrySectorItem } from '../types';
import { ChevronDown, Plus, Edit2, Trash2, Download, Search, X } from 'lucide-react';

const IndustrySectorMasterView: React.FC = () => {
    const { data: items, create, update, remove, loading } = useData<IndustrySectorItem>('industry-sectors');

    const [searchQuery, setSearchQuery] = useState('');
    const [industryFilter, setIndustryFilter] = useState('');
    const [countryFilter, setCountryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<IndustrySectorItem | null>(null);
    const [formData, setFormData] = useState<Partial<IndustrySectorItem>>({
        industry: '',
        sector: '',
        application: '',
        country: '',
        description: '',
        status: 'active'
    });
    const [selectedIndustry, setSelectedIndustry] = useState('');
    const [selectedSector, setSelectedSector] = useState('');

    // Get unique values for filters
    const industries = useMemo(() => [...new Set(items.map(i => i.industry))].sort(), [items]);
    const countries = useMemo(() => [...new Set(items.map(i => i.country))].sort(), [items]);
    const sectors = useMemo(() => {
        if (!selectedIndustry) return [];
        return [...new Set(items.filter(i => i.industry === selectedIndustry).map(i => i.sector))].sort();
    }, [items, selectedIndustry]);

    // Filter data
    const filteredData = useMemo(() => {
        return items.filter(item => {
            const matchesSearch =
                item.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.application.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesIndustry = !industryFilter || item.industry === industryFilter;
            const matchesCountry = !countryFilter || item.country === countryFilter;
            const matchesStatus = !statusFilter || item.status === statusFilter;

            return matchesSearch && matchesIndustry && matchesCountry && matchesStatus;
        });
    }, [items, searchQuery, industryFilter, countryFilter, statusFilter]);

    const handleOpenModal = (item?: IndustrySectorItem) => {
        if (item) {
            setEditingItem(item);
            setFormData(item);
            setSelectedIndustry(item.industry);
            setSelectedSector(item.sector);
        } else {
            setEditingItem(null);
            setFormData({
                industry: '',
                sector: '',
                application: '',
                country: '',
                description: '',
                status: 'active'
            });
            setSelectedIndustry('');
            setSelectedSector('');
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({
            industry: '',
            sector: '',
            application: '',
            country: '',
            description: '',
            status: 'active'
        });
    };

    const handleSave = async () => {
        if (!formData.industry || !formData.sector || !formData.application || !formData.country) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            if (editingItem) {
                await update(editingItem.id, formData);
            } else {
                await create(formData as IndustrySectorItem);
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error saving:', error);
            alert('Failed to save. Please try again.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this industry/sector?')) {
            try {
                await remove(id);
            } catch (error) {
                console.error('Error deleting:', error);
                alert('Failed to delete. Please try again.');
            }
        }
    };

    const handleExport = () => {
        const csv = [
            ['Industry', 'Sector', 'Application', 'Country', 'Description', 'Status'],
            ...filteredData.map(item => [
                item.industry,
                item.sector,
                item.application,
                item.country,
                item.description || '',
                item.status
            ])
        ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `industry-sector-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 h-full overflow-y-auto w-full pr-1">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Industry / Sector Master</h1>
                    <p className="text-slate-500 mt-1">Manage industry classifications, sectors, and business applications</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-50 shadow-sm transition-colors"
                    >
                        <Download size={16} />
                        Export
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 shadow-sm transition-colors"
                    >
                        <Plus size={16} />
                        Add Industry
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <div className="flex gap-3 items-center">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search industries, sectors, applications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X size={18} className="text-slate-400" />
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select
                        value={industryFilter}
                        onChange={(e) => {
                            setIndustryFilter(e.target.value);
                            setSelectedIndustry(e.target.value);
                        }}
                        className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                        <option value="">All Industries</option>
                        {industries.map(ind => (
                            <option key={ind} value={ind}>{ind}</option>
                        ))}
                    </select>

                    <select
                        value={countryFilter}
                        onChange={(e) => setCountryFilter(e.target.value)}
                        className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                        <option value="">All Countries</option>
                        {countries.map(country => (
                            <option key={country} value={country}>{country}</option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Industry</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Sector</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Application</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Country</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                        No records found
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.industry}</td>
                                        <td className="px-6 py-4 text-sm text-slate-700">{item.sector}</td>
                                        <td className="px-6 py-4 text-sm text-slate-700">{item.application}</td>
                                        <td className="px-6 py-4 text-sm text-slate-700">{item.country}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{item.description || '-'}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-slate-100 text-slate-800'
                                                }`}>
                                                {item.status === 'active' ? '✓ Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(item)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-sm text-slate-600">
                    Showing {filteredData.length} of {items.length} records
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">
                                {editingItem ? 'Edit Industry / Sector' : 'Add New Industry / Sector'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-1 hover:bg-slate-100 rounded transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Industry <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.industry || ''}
                                        onChange={(e) => {
                                            setFormData({ ...formData, industry: e.target.value });
                                            setSelectedIndustry(e.target.value);
                                        }}
                                        placeholder="e.g., Technology"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Sector <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.sector || ''}
                                        onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                                        placeholder="e.g., Software"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Application <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.application || ''}
                                        onChange={(e) => setFormData({ ...formData, application: e.target.value })}
                                        placeholder="e.g., SaaS Platforms"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Country <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.country || ''}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        placeholder="e.g., United States"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Provide a detailed description of this industry/sector classification and its typical use cases..."
                                    rows={4}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status || 'active'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                                <strong>Hierarchy Structure:</strong>
                                <ul className="mt-2 space-y-1 text-xs">
                                    <li>• <strong>Industry:</strong> Top-level classification (e.g., Technology, Healthcare)</li>
                                    <li>• <strong>Sector:</strong> Mid-level category within industry (e.g., Software, Cloud Services)</li>
                                    <li>• <strong>Application:</strong> Specific use case or business function (e.g., SaaS Platforms)</li>
                                </ul>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                {editingItem ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IndustrySectorMasterView;
