import React, { useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { AssetTypeItem } from '../types';

const COMMON_FORMATS = ['JPG', 'PNG', 'SVG', 'PDF', 'MP4', 'MOV', 'JSON', 'DOCX', 'WEBP', 'GIF', 'XLSX', 'PPTX', 'ZIP'];

const AssetTypeMasterView: React.FC = () => {
    // ... (logic kept same) ...
    const { data: assetTypes, create, update, remove, refresh } = useData<AssetTypeItem>('asset-type-master');
    const [searchQuery, setSearchQuery] = useState('');
    const [formatFilter, setFormatFilter] = useState('All Formats');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<AssetTypeItem | null>(null);
    const [formData, setFormData] = useState<Partial<AssetTypeItem>>({
        asset_type: '', dimension: '', file_formats: [], description: 'Optional', platforms_count: 0, graphic_status: 'linked'
    });
    const [currentTag, setCurrentTag] = useState('');

    const filteredData = assetTypes.filter(item => {
        const matchesSearch = item.asset_type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFormat = formatFilter === 'All Formats' || (item.file_formats && item.file_formats.includes(formatFilter));
        return matchesSearch && matchesFormat;
    });

    const getDescriptionBadge = (desc: string) => {
        let color = 'bg-gray-100 text-gray-800';
        if (desc === 'Required') color = 'bg-red-100 text-red-800';
        else if (desc === 'Optional') color = 'bg-blue-100 text-blue-800';
        return <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${color}`}>{desc}</span>;
    };

    const handleEdit = (item: AssetTypeItem) => {
        setEditingItem(item);
        setFormData(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this asset type?')) await remove(id);
    };

    const handleSave = async () => {
        const payload = {
            ...formData,
            status: formData.status || 'active',
            updated_at: new Date().toISOString()
        };
        if (editingItem) {
            await update(editingItem.id, payload);
        } else {
            await create(payload as any);
        }
        // Refresh data from backend to ensure persistence
        await refresh();
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ asset_type: '', dimension: '', file_formats: [], description: 'Optional', platforms_count: 0, graphic_status: 'linked' });
    };

    const addTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && currentTag.trim()) {
            e.preventDefault();
            const tag = currentTag.trim().toUpperCase().replace('.', '');
            if (!formData.file_formats?.includes(tag)) {
                setFormData({
                    ...formData,
                    file_formats: [...(formData.file_formats || []), tag]
                });
            }
            setCurrentTag('');
        }
    };

    const addTagFromClick = (format: string) => {
        if (!formData.file_formats?.includes(format)) {
            setFormData({
                ...formData,
                file_formats: [...(formData.file_formats || []), format]
            });
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData({
            ...formData,
            file_formats: (formData.file_formats || []).filter(tag => tag !== tagToRemove)
        });
    };

    const handleExport = () => {
        exportToCSV(filteredData, 'asset_type_master_export');
    };

    const columns = [
        { header: 'Asset Type', accessor: 'asset_type' as keyof AssetTypeItem, className: 'font-bold text-slate-800' },
        { header: 'Dimension', accessor: 'dimension' as keyof AssetTypeItem, className: 'font-mono text-xs text-slate-600' },
        {
            header: 'Accepted Formats',
            accessor: (item: AssetTypeItem) => (
                <div className="flex flex-wrap gap-1">
                    {item.file_formats && item.file_formats.length > 0 ? item.file_formats.map((fmt, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-[10px] font-medium text-blue-700 uppercase">{fmt}</span>
                    )) : <span className="text-gray-400 text-xs italic">Any</span>}
                </div>
            )
        },
        { header: 'Requirement', accessor: (item: AssetTypeItem) => getDescriptionBadge(item.description) },
        { header: 'Updated', accessor: (item: AssetTypeItem) => item.updated_at ? new Date(item.updated_at).toLocaleDateString() : '-', className: "text-xs text-slate-500" },
        {
            header: 'Actions',
            accessor: (item: AssetTypeItem) => (
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
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Asset Type Master</h1>
                    <p className="text-slate-500 mt-1">Configure asset definitions and connect allowed file formats.</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={handleExport}
                        className="bg-white text-slate-600 border border-slate-300 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-50 shadow-sm transition-colors"
                    >
                        Export
                    </button>
                    <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 shadow-sm">Add Asset Type</button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <input type="search" className="block w-full p-2.5 border border-gray-300 rounded-lg" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <select value={formatFilter} onChange={(e) => setFormatFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5">
                        <option>All Formats</option>
                        {COMMON_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
            </div>

            <Table columns={columns} data={filteredData} title="Asset Configuration Registry" />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Edit Asset Type" : "Add Asset Type"}>
                {/* ... (modal content kept same) ... */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Asset Type Name</label>
                        <input type="text" value={formData.asset_type} onChange={(e) => setFormData({ ...formData, asset_type: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="e.g. Blog Banner" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Recommended Dimension</label>
                        <input type="text" value={formData.dimension} onChange={(e) => setFormData({ ...formData, dimension: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="e.g. 1200x628" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Connect Accepted Formats</label>
                        <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md bg-white min-h-[42px] focus-within:ring-2 focus-within:ring-blue-500">
                            {formData.file_formats?.map((tag, idx) => (
                                <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-blue-600 hover:text-blue-800 font-bold">×</button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyDown={addTag}
                                className="flex-1 outline-none bg-transparent text-sm min-w-[60px]"
                                placeholder="Type format & enter..."
                            />
                        </div>
                        <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Quick Add:</p>
                            <div className="flex flex-wrap gap-1">
                                {COMMON_FORMATS.map(f => (
                                    <button
                                        key={f}
                                        type="button"
                                        onClick={() => addTagFromClick(f)}
                                        className={`text-xs px-2 py-0.5 rounded transition-colors ${formData.file_formats?.includes(f)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Requirement Level</label>
                        <select value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                            <option value="Required">Required</option>
                            <option value="Optional">Optional</option>
                            <option value="Not Required">Not Required</option>
                        </select>
                    </div>
                    <div className="flex justify-end pt-4"><button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save Configuration</button></div>
                </div>
            </Modal>
        </div>
    );
};

export default AssetTypeMasterView;