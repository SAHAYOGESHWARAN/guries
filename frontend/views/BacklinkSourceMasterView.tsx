import React, { useState, useEffect } from 'react';
import {
    Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl,
    InputLabel, Chip, IconButton, Tooltip, CircularProgress, Alert, Grid, Card, CardContent,
    InputAdornment, Checkbox, TablePagination
} from '@mui/material';
import {
    Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Close as CloseIcon,
    Search as SearchIcon, Download as DownloadIcon, Upload as UploadIcon,
    Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useData } from '../hooks/useData';
import { BacklinkSource } from '../types';

const BacklinkSourceMasterView: React.FC = () => {
    const { backlinkSources, loading, error, createBacklinkSource, updateBacklinkSource, deleteBacklinkSource } = useData();
    
    const [openModal, setOpenModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterPricing, setFilterPricing] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showPasswords, setShowPasswords] = useState<{ [key: number]: boolean }>({});
    const [formData, setFormData] = useState<Partial<BacklinkSource>>({
        domain: '',
        backlink_url: '',
        backlink_category: '',
        niche_industry: '',
        da_score: 0,
        spam_score: 0,
        pricing: 'Free',
        country: '',
        username: '',
        password: '',
        credentials_notes: '',
        status: 'active'
    });

    const categories = ['Guest Post', 'Directory', 'Forum', 'Blog Comment', 'Press Release', 'Social Bookmark', 'Web 2.0', 'Other'];
    const pricingOptions = ['Free', 'Paid'];
    const statusOptions = ['active', 'inactive', 'blacklisted', 'test', 'trusted', 'avoid'];

    const filteredSources = backlinkSources.filter(source => {
        const matchesSearch = source.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            source.backlink_url.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !filterCategory || source.backlink_category === filterCategory;
        const matchesPricing = !filterPricing || source.pricing === filterPricing;
        const matchesStatus = !filterStatus || source.status === filterStatus;
        return matchesSearch && matchesCategory && matchesPricing && matchesStatus;
    });

    const paginatedSources = filteredSources.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

    const handleOpenModal = (source?: BacklinkSource) => {
        if (source) {
            setEditingId(source.id);
            setFormData(source);
        } else {
            setEditingId(null);
            setFormData({
                domain: '',
                backlink_url: '',
                backlink_category: '',
                niche_industry: '',
                da_score: 0,
                spam_score: 0,
                pricing: 'Free',
                country: '',
                username: '',
                password: '',
                credentials_notes: '',
                status: 'active'
            });
        }
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingId(null);
    };

    const handleSave = async () => {
        try {
            if (editingId) {
                await updateBacklinkSource(editingId, formData);
            } else {
                await createBacklinkSource(formData as BacklinkSource);
            }
            handleCloseModal();
        } catch (err) {
            console.error('Error saving backlink source:', err);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this backlink source?')) {
            try {
                await deleteBacklinkSource(id);
            } catch (err) {
                console.error('Error deleting backlink source:', err);
            }
        }
    };

    const getDAScoredColor = (score: number) => {
        if (score >= 70) return '#4caf50'; // Green
        if (score >= 40) return '#ff9800'; // Orange
        return '#f44336'; // Red
    };

    const getSpamScoreColor = (score: number) => {
        if (score <= 10) return '#4caf50'; // Green
        if (score <= 30) return '#ff9
            ? 'bg-green-100 text-green-800'
            : 'bg-orange-100 text-orange-800';
    };

    const getScoreColor = (score: number, isSpam: boolean = false) => {
        if (isSpam) {
            // Red for spam score (higher is worse)
            if (score < 20) return 'bg-green-100';
            if (score < 40) return 'bg-yellow-100';
            if (score < 60) return 'bg-orange-100';
            return 'bg-red-100';
        } else {
            // Green for DA score (higher is better)
            if (score >= 60) return 'bg-green-100';
            if (score >= 40) return 'bg-yellow-100';
            if (score >= 20) return 'bg-orange-100';
            return 'bg-red-100';
        }
    };

    const columns = [
        { header: 'Domain', accessor: 'domain' as keyof BacklinkSource, className: 'font-bold text-slate-700' },
        { header: 'Backlink URL', accessor: 'backlink_url' as keyof BacklinkSource, className: 'text-sm text-slate-600 truncate' },
        { header: 'Category', accessor: 'backlink_category' as keyof BacklinkSource, className: 'text-sm' },
        {
            header: 'DA Score',
            accessor: (item: BacklinkSource) => {
                const score = item.da_score || 0;
                const bgColor = getScoreColor(score, false);
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div className={`h-2 rounded-full ${bgColor}`} style={{ width: `${Math.min(score, 100)}%` }}></div>
                        </div>
                        <span className="text-xs font-medium">{score}</span>
                    </div>
                );
            }
        },
        {
            header: 'Spam Score',
            accessor: (item: BacklinkSource) => {
                const score = item.spam_score || 0;
                const bgColor = getScoreColor(score, true);
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div className={`h-2 rounded-full ${bgColor}`} style={{ width: `${Math.min(score, 100)}%` }}></div>
                        </div>
                        <span className="text-xs font-medium">{score}</span>
                    </div>
                );
            }
        },
        {
            header: 'Pricing',
            accessor: (item: BacklinkSource) => {
                const color = getPricingBadge(item.pricing || 'Free');
                return <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>{item.pricing}</span>;
            }
        },
        { header: 'Country', accessor: 'country' as keyof BacklinkSource, className: 'text-sm' },
        { header: 'Status', accessor: (item: BacklinkSource) => getStatusBadge(item.status || 'active') },
        { header: 'Updated', accessor: 'updated_at' as keyof BacklinkSource, className: 'text-xs text-slate-400' },
        {
            header: 'Actions',
            accessor: (item: BacklinkSource) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 h-full overflow-y-auto w-full pr-1 animate-fade-in">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Backlink Source Master</h1>
                    <p className="text-slate-500 mt-1">Manage backlink sources, DA/Spam scores, and credentials for link building campaigns</p>
                </div>
            </div>

            {/* Controls Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <select
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        className="bg-slate-50 border border-slate-200 text-sm rounded-lg p-2"
                    >
                        <option>All Categories</option>
                        <option>Directory</option>
                        <option>Guest Post</option>
                        <option>Forum</option>
                        <option>Blog Comment</option>
                        <option>Press Release</option>
                        <option>Social Bookmark</option>
                        <option>Resource Page</option>
                        <option>Broken Link</option>
                    </select>
                    <select
                        value={filters.pricing}
                        onChange={(e) => setFilters({ ...filters, pricing: e.target.value })}
                        className="bg-slate-50 border border-slate-200 text-sm rounded-lg p-2"
                    >
                        <option>All Pricing</option>
                        <option>Free</option>
                        <option>Paid</option>
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="bg-slate-50 border border-slate-200 text-sm rounded-lg p-2"
                    >
                        <option>All Status</option>
                        <option>active</option>
                        <option>inactive</option>
                        <option>blacklisted</option>
                        <option>test</option>
                        <option>trusted</option>
                        <option>avoid</option>
                    </select>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <input
                        type="search"
                        className="block flex-1 md:w-64 p-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50"
                        placeholder="Search by domain..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".csv"
                        style={{ display: 'none' }}
                    />
                    <button onClick={handleImportClick} className="text-slate-600 hover:text-indigo-600 border border-slate-300 px-3 py-2 rounded-lg text-sm font-medium">Import</button>
                    <button onClick={handleExport} className="text-slate-600 hover:text-indigo-600 border border-slate-300 px-3 py-2 rounded-lg text-sm font-medium">Export</button>
                    <button
                        onClick={() => {
                            setEditingItem(null);
                            setFormData({
                                domain: '',
                                backlink_url: '',
                                backlink_category: 'Directory',
                                niche_industry: '',
                                da_score: 0,
                                spam_score: 0,
                                pricing: 'Free',
                                country: '',
                                username: '',
                                password: '',
                                credentials_notes: '',
                                status: 'active'
                            });
                            setIsModalOpen(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 shadow-sm transition-colors flex items-center whitespace-nowrap"
                    >
                        + Add Source
                    </button>
                </div>
            </div>

            <Table columns={columns} data={filteredData} title={`Backlink Sources (${filteredData.length})`} />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Edit Backlink Source" : "Add New Backlink Source"}>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                    {/* Basic Information */}
                    <div className="border-b pb-4">
                        <h3 className="font-semibold text-slate-700 mb-3">Basic Information</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Domain *</label>
                            <input
                                type="text"
                                value={formData.domain}
                                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                placeholder="e.g., example.com"
                            />
                        </div>

                        <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700">Backlink URL *</label>
                            <input
                                type="text"
                                value={formData.backlink_url}
                                onChange={(e) => setFormData({ ...formData, backlink_url: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                placeholder="e.g., https://example.com/directory"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category *</label>
                                <select value={formData.backlink_category} onChange={(e) => setFormData({ ...formData, backlink_category: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                    <option>Directory</option>
                                    <option>Guest Post</option>
                                    <option>Forum</option>
                                    <option>Blog Comment</option>
                                    <option>Press Release</option>
                                    <option>Social Bookmark</option>
                                    <option>Resource Page</option>
                                    <option>Broken Link</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Niche Industry</label>
                                <input
                                    type="text"
                                    value={formData.niche_industry}
                                    onChange={(e) => setFormData({ ...formData, niche_industry: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    placeholder="e.g., Technology, Finance"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Scores & Metrics */}
                    <div className="border-b pb-4">
                        <h3 className="font-semibold text-slate-700 mb-3">Scores & Metrics</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">DA Score (0-100)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.da_score}
                                    onChange={(e) => setFormData({ ...formData, da_score: parseInt(e.target.value) || 0 })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    placeholder="e.g., 45"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Spam Score (0-100)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.spam_score}
                                    onChange={(e) => setFormData({ ...formData, spam_score: parseInt(e.target.value) || 0 })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    placeholder="e.g., 15"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Location */}
                    <div className="border-b pb-4">
                        <h3 className="font-semibold text-slate-700 mb-3">Pricing & Location</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Pricing</label>
                                <select value={formData.pricing} onChange={(e) => setFormData({ ...formData, pricing: e.target.value as any })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                    <option>Free</option>
                                    <option>Paid</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Country</label>
                                <input
                                    type="text"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    placeholder="e.g., USA, India"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Credentials */}
                    <div className="border-b pb-4">
                        <h3 className="font-semibold text-slate-700 mb-3">Credentials</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    placeholder="Username"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    placeholder="Password"
                                />
                            </div>
                        </div>

                        <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700">Credentials Notes</label>
                            <textarea
                                value={formData.credentials_notes}
                                onChange={(e) => setFormData({ ...formData, credentials_notes: e.target.value })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                placeholder="Additional notes about credentials or access"
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="blacklisted">Blacklisted</option>
                            <option value="test">Test</option>
                            <option value="trusted">Trusted</option>
                            <option value="avoid">Avoid</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button onClick={() => setIsModalOpen(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50">Cancel</button>
                        <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save Source</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default BacklinkSourceMasterView;
