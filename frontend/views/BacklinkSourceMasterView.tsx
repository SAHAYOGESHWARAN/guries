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

    const getPricingBadge = (pricing: string) => {
        return pricing === 'Free' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
    };

    const getStatusBadge = (status: string) => {
        const statusColors: { [key: string]: string } = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            blacklisted: 'bg-red-100 text-red-800',
            test: 'bg-yellow-100 text-yellow-800',
            trusted: 'bg-blue-100 text-blue-800',
            avoid: 'bg-orange-100 text-orange-800'
        };
        return <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status] || 'bg-gray-100'}`}>{status}</span>;
    };

    const handleEdit = (source: BacklinkSource) => {
        handleOpenModal(source);
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
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-sm rounded-lg p-2"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <select
                        value={filterPricing}
                        onChange={(e) => setFilterPricing(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-sm rounded-lg p-2"
                    >
                        <option value="">All Pricing</option>
                        {pricingOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-sm rounded-lg p-2"
                    >
                        <option value="">All Status</option>
                        {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <input
                        type="search"
                        className="block flex-1 md:w-64 p-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50"
                        placeholder="Search by domain..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 shadow-sm transition-colors flex items-center whitespace-nowrap"
                    >
                        + Add Source
                    </button>
                </div>
            </div>

            {/* Data Table */}
            {loading && <div className="text-center py-8">Loading...</div>}
            {error && <Alert severity="error">{error}</Alert>}

            {!loading && !error && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                                <TableCell>Domain</TableCell>
                                <TableCell>Backlink URL</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>DA Score</TableCell>
                                <TableCell>Spam Score</TableCell>
                                <TableCell>Pricing</TableCell>
                                <TableCell>Country</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedSources.map((source) => (
                                <TableRow key={source.id} hover>
                                    <TableCell className="font-bold">{source.domain}</TableCell>
                                    <TableCell className="text-sm truncate max-w-xs">{source.backlink_url}</TableCell>
                                    <TableCell>{source.backlink_category}</TableCell>
                                    <TableCell>{source.da_score}</TableCell>
                                    <TableCell>{source.spam_score}</TableCell>
                                    <TableCell>{getPricingBadge(source.pricing || 'Free')}</TableCell>
                                    <TableCell>{source.country}</TableCell>
                                    <TableCell>{getStatusBadge(source.status || 'active')}</TableCell>
                                    <TableCell>
                                        <IconButton size="small" onClick={() => handleEdit(source)} title="Edit">
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleDelete(source.id)} title="Delete">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredSources.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                    />
                </TableContainer>
            )}

            {/* Modal Dialog */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle>{editingId ? 'Edit Backlink Source' : 'Add New Backlink Source'}</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                        <TextField
                            label="Domain"
                            value={formData.domain || ''}
                            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Backlink URL"
                            value={formData.backlink_url || ''}
                            onChange={(e) => setFormData({ ...formData, backlink_url: e.target.value })}
                            fullWidth
                            required
                        />
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={formData.backlink_category || ''}
                                onChange={(e) => setFormData({ ...formData, backlink_category: e.target.value })}
                                label="Category"
                            >
                                {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Niche Industry"
                            value={formData.niche_industry || ''}
                            onChange={(e) => setFormData({ ...formData, niche_industry: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="DA Score"
                            type="number"
                            inputProps={{ min: 0, max: 100 }}
                            value={formData.da_score || 0}
                            onChange={(e) => setFormData({ ...formData, da_score: parseInt(e.target.value) || 0 })}
                            fullWidth
                        />
                        <TextField
                            label="Spam Score"
                            type="number"
                            inputProps={{ min: 0, max: 100 }}
                            value={formData.spam_score || 0}
                            onChange={(e) => setFormData({ ...formData, spam_score: parseInt(e.target.value) || 0 })}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Pricing</InputLabel>
                            <Select
                                value={formData.pricing || 'Free'}
                                onChange={(e) => setFormData({ ...formData, pricing: e.target.value as any })}
                                label="Pricing"
                            >
                                {pricingOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Country"
                            value={formData.country || ''}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Username"
                            value={formData.username || ''}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Password"
                            type="password"
                            value={formData.password || ''}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Credentials Notes"
                            value={formData.credentials_notes || ''}
                            onChange={(e) => setFormData({ ...formData, credentials_notes: e.target.value })}
                            fullWidth
                            multiline
                            rows={2}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={formData.status || 'active'}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                label="Status"
                            >
                                {statusOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default BacklinkSourceMasterView;
