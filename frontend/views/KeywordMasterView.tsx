import React, { useState, useRef } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { getStatusBadge } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV, parseCSV } from '../utils/csvHelper';
import type { Keyword } from '../types';

const KeywordMasterView: React.FC = () => {
    const { data: keywords, create, update, remove } = useData<Keyword>('keywords');

    const [filters, setFilters] = useState({ intent: 'All', type: 'All', competition: 'All' });
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Keyword | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<Partial<Keyword>>({
        keyword: '',
        keyword_intent: 'Informational',
        keyword_type: 'Primary',
        language: 'English',
        search_volume: 0,
        competition_score: 'Medium',
        status: 'active'
    });

    const filteredData = (keywords || []).filter(item => {
        if (!item) return false;
        const matchesSearch = (item.keyword || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesIntent = filters.intent === 'All' || item.keyword_intent === filters.intent;
        const matchesType = filters.type === 'All' || item.keyword_type === filters.type;
        const matchesCompetition = filters.competition === 'All' || item.competition_score === filters.competition;
        return matchesSearch && matchesIntent && matchesType && matchesCompetition;
    });

    const handleEdit = (item: Keyword) => {
        setEditingItem(item);
        setFormData(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this keyword?')) {
            await remove(id);
        }
    };

    const handleSave = async () => {
        if (editingItem) {
            await update(editingItem.id, formData);
        } else {
            await create(formData as any);
        }
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({
            keyword: '',
            keyword_intent: 'Informational',
            keyword_type: 'Primary',
            language: 'English',
            search_volume: 0,
            competition_score: 'Medium',
            status: 'active'
        });
    };

    const handleExport = () => {
        exportToCSV(filteredData, 'keywords_export');
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const parsedData = await parseCSV(e.target.files[0]);
                let count = 0;
                for (const item of parsedData) {
                    if (item.keyword) {
                        await create({
                            keyword: item.keyword,
                            keyword_intent: item.keyword_intent || 'Informational',
                            keyword_type: item.keyword_type || 'Primary',
                            language: item.language || 'English',
                            search_volume: parseInt(item.search_volume) || 0,
                            competition_score: item.competition_score || 'Medium',
                            mapped_service: item.mapped_service,
                            status: item.status || 'active'
                        } as any);
                        count++;
                    }
                }
                alert(`Successfully imported ${count} keywords.`);
            } catch (error) {
                alert('Error parsing CSV file.');
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const getCompetitionColor = (competition: string) => {
        switch (competition) {
            case 'Low': return 'bg-green-100 text-green-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'High': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const columns = [
        { header: 'Keyword', accessor: 'keyword' as keyof Keyword, className: 'font-bold text-slate-700' },
        { header: 'Intent', accessor: 'keyword_intent' as keyof Keyword, className: 'text-sm' },
        { header: 'Keyword Type', accessor: 'keyword_type' as keyof Keyword, className: 'text-sm' },
        {
            header: 'Search Volume',
            accessor: (item: Keyword) => {
                const vol = item.search_volume;
                return <span className="font-mono text-right">{vol.toLocaleString()}</span>;
            }
        },
        {
            header: 'Competition',
            accessor: (item: Keyword) => {
                const color = getCompetitionColor(item.competition_score || 'Medium');
                return <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>{item.competition_score}</span>;
            }
        },
        { header: 'Mapped Service', accessor: 'mapped_service' as keyof Keyword, className: 'text-sm text-slate-600' },
        { header: 'Language', accessor: 'language' as keyof Keyword, className: 'text-xs' },
        { header: 'Status', accessor: (item: Keyword) => getStatusBadge(item.status || 'active') },
        { header: 'Updated', accessor: 'updated_at' as keyof Keyword, className: 'text-xs text-slate-400' },
        {
            header: 'Actions',
            accessor: (item: Keyword) => (
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
        <div className="h-full w-full flex flex-col overflow-hidden bg-slate-50 animate-fade-in">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Keyword Master</h1>
                    <p className="text-slate-500 mt-1">Manage keywords for SEO tracking and content strategy across all services</p>
                </div>
            </div>

            {/* Controls Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <select
                        value={filters.intent}
                        onChange={(e) => setFilters({ ...filters, intent: e.target.value })}
                        className="bg-slate-50 border border-slate-200 text-sm rounded-lg p-2"
                    >
                        <option>All Intent</option>
                        <option>Informational</option>
                        <option>Transactional</option>
                        <option>Commercial</option>
                        <option>Navigational</option>
                    </select>
                    <select
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        className="bg-slate-50 border border-slate-200 text-sm rounded-lg p-2"
                    >
                        <option>All Types</option>
                        <option>Primary</option>
                        <option>Secondary</option>
                        <option>Long-tail</option>
                    </select>
                    <select
                        value={filters.competition}
                        onChange={(e) => setFilters({ ...filters, competition: e.target.value })}
                        className="bg-slate-50 border border-slate-200 text-sm rounded-lg p-2"
                    >
                        <option>All Competition</option>
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                    </select>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <input
                        type="search"
                        className="block flex-1 md:w-64 p-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50"
                        placeholder="Search keywords..."
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
                                keyword: '',
                                keyword_intent: 'Informational',
                                keyword_type: 'Primary',
                                language: 'English',
                                search_volume: 0,
                                competition_score: 'Medium',
                                status: 'active'
                            });
                            setIsModalOpen(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 shadow-sm transition-colors flex items-center whitespace-nowrap"
                    >
                        + Add Keyword
                    </button>
                </div>
            </div>

            <Table columns={columns} data={filteredData} title={`Keywords (${filteredData.length})`} />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Edit Keyword" : "Add New Keyword"}>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Keyword *</label>
                        <input
                            type="text"
                            value={formData.keyword}
                            onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            placeholder="e.g., digital marketing agency"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Keyword Intent *</label>
                            <select value={formData.keyword_intent} onChange={(e) => setFormData({ ...formData, keyword_intent: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                <option>Informational</option>
                                <option>Transactional</option>
                                <option>Commercial</option>
                                <option>Navigational</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Keyword Type *</label>
                            <select value={formData.keyword_type} onChange={(e) => setFormData({ ...formData, keyword_type: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                <option>Primary</option>
                                <option>Secondary</option>
                                <option>Long-tail</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Language</label>
                            <select value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                <option>English</option>
                                <option>Hindi</option>
                                <option>Spanish</option>
                                <option>French</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Search Volume</label>
                            <input
                                type="number"
                                value={formData.search_volume}
                                onChange={(e) => setFormData({ ...formData, search_volume: parseInt(e.target.value) || 0 })}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                placeholder="e.g., 12000"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Competition Score</label>
                            <select value={formData.competition_score} onChange={(e) => setFormData({ ...formData, competition_score: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                <option value="active">Active</option>
                                <option value="deprecated">Deprecated</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Map to Service</label>
                        <select value={formData.mapped_service} onChange={(e) => setFormData({ ...formData, mapped_service: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                            <option value="">Select service</option>
                            <option>SEO Services</option>
                            <option>Content Marketing</option>
                            <option>Social Media Marketing</option>
                            <option>Web Development</option>
                            <option>Branding</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Map to Sub-Service</label>
                        <select value={formData.mapped_sub_service} onChange={(e) => setFormData({ ...formData, mapped_sub_service: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                            <option value="">Select sub-service</option>
                            <option>On-page SEO</option>
                            <option>Technical SEO</option>
                            <option>Link Building</option>
                            <option>Blog Writing</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button onClick={() => setIsModalOpen(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50">Cancel</button>
                        <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save Keyword</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default KeywordMasterView;
