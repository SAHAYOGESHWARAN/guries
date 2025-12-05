import React, { useState, useRef } from 'react';
import Table from '../components/Table';
import { useData } from '../hooks/useData';
import { getStatusBadge } from '../constants';
import type { AssetLibraryItem } from '../types';

const AssetsView: React.FC = () => {
    const { data: assets = [], create: createAsset, remove: deleteAsset } = useData<AssetLibraryItem>('assetLibrary');

    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'upload'>('list');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [newAsset, setNewAsset] = useState<Partial<AssetLibraryItem>>({
        name: '',
        type: 'Image',
        repository: 'Content Repository',
        usage_status: 'Available'
    });

    const filteredAssets = assets.filter(a =>
        (a.name || '').toLowerCase().includes((searchQuery || '').toLowerCase())
    );

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
        setNewAsset(prev => ({
            ...prev,
            name: file.name.replace(/\.[^/.]+$/, ""),
            file_size: file.size,
            file_type: file.type
        }));

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreviewUrl(result);
                setNewAsset(prev => ({
                    ...prev,
                    file_url: result,
                    thumbnail_url: result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleUpload = async () => {
        if (!newAsset.name) {
            alert('Please enter an asset name');
            return;
        }

        await createAsset({
            ...newAsset,
            date: new Date().toISOString()
        } as any);

        // Reset form
        setViewMode('list');
        setSelectedFile(null);
        setPreviewUrl('');
        setNewAsset({
            name: '',
            type: 'Image',
            repository: 'Content Repository',
            usage_status: 'Available'
        });
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this asset?')) {
            await deleteAsset(id);
        }
    };

    const getAssetIcon = (type: string) => {
        const icons: Record<string, string> = {
            'Image': '🖼️',
            'Video': '🎥',
            'Document': '📄',
            'Archive': '📦'
        };
        return icons[type] || '📁';
    };

    const columns = [
        {
            header: 'Preview',
            accessor: (item: AssetLibraryItem) => (
                <div className="flex items-center justify-center">
                    {item.thumbnail_url ? (
                        <img
                            src={item.thumbnail_url}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg border-2 border-slate-200 shadow-sm"
                        />
                    ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-2xl shadow-sm">
                            {getAssetIcon(item.type)}
                        </div>
                    )}
                </div>
            ),
            className: 'w-24'
        },
        {
            header: 'Name',
            accessor: (item: AssetLibraryItem) => (
                <div>
                    <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">ID: {item.id}</div>
                </div>
            )
        },
        {
            header: 'Type',
            accessor: (item: AssetLibraryItem) => (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600">
                    <span>{getAssetIcon(item.type)}</span>
                    {item.type}
                </span>
            )
        },
        {
            header: 'Repository',
            accessor: (item: AssetLibraryItem) => (
                <span className="text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                    {item.repository}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: (item: AssetLibraryItem) => getStatusBadge(item.usage_status)
        },
        {
            header: 'Date',
            accessor: (item: AssetLibraryItem) => (
                <span className="text-xs text-slate-600">
                    {item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: (item: AssetLibraryItem) => (
                <div className="flex gap-2">
                    {item.file_url && (
                        <a
                            href={item.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="View"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </a>
                    )}
                    <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            )
        }
    ];

    if (viewMode === 'upload') {
        return (
            <div className="h-full flex flex-col w-full p-6 animate-fade-in overflow-hidden">
                <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full h-full">
                    {/* Header */}
                    <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50 w-full flex-shrink-0">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Upload New Asset</h2>
                            <p className="text-slate-600 text-xs mt-0.5">Add media to the central library</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('list')}
                                className="px-4 py-2 text-sm font-medium text-slate-600 border-2 border-slate-300 rounded-lg hover:bg-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-indigo-700 transition-colors text-sm"
                            >
                                Confirm Upload
                            </button>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 w-full">
                        <div className="max-w-3xl mx-auto space-y-6">
                            {/* File Upload Zone */}
                            <div
                                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${dragActive
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/50'
                                    }`}
                                onDrop={handleDrop}
                                onDragOver={handleDrag}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                                    className="hidden"
                                    accept="image/*,video/*,.pdf,.doc,.docx,.zip"
                                />

                                {previewUrl ? (
                                    <div className="space-y-4">
                                        <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-lg" />
                                        <p className="text-sm font-medium text-slate-700">{selectedFile?.name}</p>
                                        <p className="text-xs text-slate-500">
                                            {selectedFile && `${(selectedFile.size / 1024).toFixed(2)} KB`}
                                        </p>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedFile(null);
                                                setPreviewUrl('');
                                            }}
                                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                                        >
                                            Remove File
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                                            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-base font-semibold text-slate-700 mb-1">Click to upload or drag and drop</p>
                                            <p className="text-sm text-slate-500">PNG, JPG, PDF, MP4 up to 50MB</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Form Fields */}
                            <div className="bg-white rounded-xl border-2 border-slate-200 p-6 space-y-6 shadow-sm">
                                {/* Asset Name */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Asset Name</label>
                                    <input
                                        type="text"
                                        value={newAsset.name}
                                        onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                        placeholder="Enter asset name..."
                                    />
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
                                    <select
                                        value={newAsset.type}
                                        onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white cursor-pointer"
                                    >
                                        <option value="Image">Image</option>
                                        <option value="Video">Video</option>
                                        <option value="Document">Document</option>
                                        <option value="Archive">Archive</option>
                                    </select>
                                </div>

                                {/* Repository */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Repository</label>
                                    <select
                                        value={newAsset.repository}
                                        onChange={(e) => setNewAsset({ ...newAsset, repository: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white cursor-pointer"
                                    >
                                        <option value="Content Repository">Content Repository</option>
                                        <option value="SMM Repository">SMM Repository</option>
                                        <option value="SEO Repository">SEO Repository</option>
                                        <option value="Design Repository">Design Repository</option>
                                    </select>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                                    <select
                                        value={newAsset.usage_status}
                                        onChange={(e) => setNewAsset({ ...newAsset, usage_status: e.target.value as any })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white cursor-pointer"
                                    >
                                        <option value="Available">Available</option>
                                        <option value="In Use">In Use</option>
                                        <option value="Archived">Archived</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="h-full flex flex-col w-full p-6 animate-fade-in overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start flex-shrink-0 w-full mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assets</h1>
                    <p className="text-slate-600 text-sm mt-1">Manage and organize all your marketing assets</p>
                </div>
                <button
                    onClick={() => setViewMode('upload')}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Upload Asset
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search assets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden w-full">
                <div className="px-6 py-3 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <p className="text-sm text-slate-700 font-medium">
                        Showing <span className="font-bold text-indigo-600">{filteredAssets.length}</span> assets
                    </p>
                </div>
                <div className="flex-1 overflow-hidden">
                    <Table
                        columns={columns}
                        data={filteredAssets}
                        title=""
                        emptyMessage="No assets yet. Click 'Upload Asset' to add your first file!"
                    />
                </div>
            </div>
        </div>
    );
};

export default AssetsView;
