import React, { useState, useRef, useMemo, useCallback } from 'react';
import Table from '../components/Table';
import { useData } from '../hooks/useData';
import { getStatusBadge } from '../constants';
import type { AssetLibraryItem } from '../types';

const AssetsView: React.FC = () => {
    const { data: assets = [], create: createAsset, remove: removeAsset, refresh } = useData<AssetLibraryItem>('assetLibrary');

    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'upload'>('list');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [newAsset, setNewAsset] = useState<Partial<AssetLibraryItem>>({
        name: '',
        type: 'Image',
        repository: 'Content Repository',
        usage_status: 'Available'
    });

    // Auto-refresh on mount to ensure latest data
    React.useEffect(() => {
        refresh?.();
    }, []);

    // Memoize filtered assets for better performance
    const filteredAssets = useMemo(() => {
        const query = (searchQuery || '').toLowerCase().trim();
        if (!query) return assets;

        return assets.filter(a => {
            const name = (a.name || '').toLowerCase();
            const type = (a.type || '').toLowerCase();
            const repository = (a.repository || '').toLowerCase();
            const status = (a.usage_status || '').toLowerCase();

            return name.includes(query) ||
                type.includes(query) ||
                repository.includes(query) ||
                status.includes(query);
        });
    }, [assets, searchQuery]);

    const handleFileSelect = useCallback((file: File) => {
        setSelectedFile(file);
        setNewAsset(prev => ({
            ...prev,
            name: file.name.replace(/\.[^/.]+$/, ""),
            file_size: file.size,
            file_type: file.type
        }));

        // Create preview for images only
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
        } else {
            setPreviewUrl('');
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    }, [handleFileSelect]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleUpload = useCallback(async () => {
        if (!newAsset.name?.trim()) {
            alert('Please enter an asset name');
            return;
        }

        if (!selectedFile && !newAsset.file_url) {
            alert('Please select a file to upload');
            return;
        }

        setIsUploading(true);
        try {
            const result = await createAsset({
                ...newAsset,
                date: new Date().toISOString()
            } as AssetLibraryItem);

            // Reset form
            setSelectedFile(null);
            setPreviewUrl('');
            setNewAsset({
                name: '',
                type: 'Image',
                repository: 'Content Repository',
                usage_status: 'Available'
            });

            // Switch to list view immediately
            setViewMode('list');

            // Force refresh to ensure data is up to date
            setTimeout(() => refresh?.(), 100);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload asset. Please try again.');
        } finally {
            setIsUploading(false);
        }
    }, [newAsset, selectedFile, createAsset, refresh]);

    const handleDelete = useCallback(async (e: React.MouseEvent, id: number, name: string) => {
        e.stopPropagation();

        if (deletingId !== null) return;

        if (!window.confirm(`Delete "${name}"?`)) return;

        setDeletingId(id);
        try {
            await removeAsset(id);
            // Force refresh after delete to ensure UI is updated
            setTimeout(() => refresh?.(), 100);
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete asset. Please try again.');
        } finally {
            setDeletingId(null);
        }
    }, [deletingId, removeAsset, refresh]);

    const getAssetIcon = useCallback((type: string) => {
        const icons: Record<string, string> = {
            'Image': '�️',
            'Video': '🎥',
            'Document': '📄',
            'Archive': '📦'
        };
        return icons[type] || '📁';
    }, []);

    // Memoize columns for better performance
    const columns = useMemo(() => [
        {
            header: 'Preview',
            accessor: (item: AssetLibraryItem) => (
                <div className="flex items-center justify-center">
                    {item.thumbnail_url ? (
                        <img
                            src={item.thumbnail_url}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg border-2 border-slate-200 shadow-sm"
                            loading="lazy"
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
                    {(item.file_url || item.thumbnail_url) && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const url = item.file_url || item.thumbnail_url;
                                if (url) {
                                    // Check if it's a base64 data URL
                                    if (url.startsWith('data:')) {
                                        // Open in new window for base64 images
                                        const win = window.open();
                                        if (win) {
                                            win.document.write(`<img src="${url}" style="max-width:100%; height:auto;" />`);
                                        }
                                    } else {
                                        // Open regular URL in new tab
                                        window.open(url, '_blank', 'noopener,noreferrer');
                                    }
                                }
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="View Asset"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                    )}
                    <button
                        onClick={(e) => handleDelete(e, item.id, item.name)}
                        disabled={deletingId === item.id}
                        className={`p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all ${deletingId === item.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Delete"
                    >
                        {deletingId === item.id ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        )}
                    </button>
                </div>
            )
        }
    ], [getAssetIcon, handleDelete, deletingId]);

    if (viewMode === 'upload') {
        return (
            <div className="h-full flex flex-col w-full p-6 overflow-hidden">
                <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full h-full">
                    <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50 w-full flex-shrink-0">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Upload New Asset</h2>
                            <p className="text-slate-600 text-xs mt-0.5">Add media to the central library</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('list')}
                                disabled={isUploading}
                                className="px-4 py-2 text-sm font-medium text-slate-600 border-2 border-slate-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className={`bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-indigo-700 transition-colors text-sm flex items-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isUploading ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Uploading...
                                    </>
                                ) : (
                                    'Confirm Upload'
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 w-full">
                        <div className="max-w-3xl mx-auto space-y-6">
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
                                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
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

                            <div className="bg-white rounded-xl border-2 border-slate-200 p-6 space-y-6 shadow-sm">
                                {/* Row 1: Asset Name */}
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

                                {/* Row 2: Asset Type & Category */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Asset Type
                                            <span className="text-xs font-normal text-slate-500 ml-2">(article/video/graphic/guide)</span>
                                        </label>
                                        <select
                                            value={newAsset.type}
                                            onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white cursor-pointer"
                                        >
                                            <option value="article">Article</option>
                                            <option value="video">Video</option>
                                            <option value="graphic">Graphic</option>
                                            <option value="guide">Guide</option>
                                            <option value="listicle">Listicle</option>
                                            <option value="how-to">How To</option>
                                            <option value="Image">Image</option>
                                            <option value="Document">Document</option>
                                            <option value="Archive">Archive</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Asset Category
                                            <span className="text-xs font-normal text-slate-500 ml-2">(e.g., what science can do)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={newAsset.asset_category || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, asset_category: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                            placeholder="e.g., what science can do"
                                        />
                                    </div>
                                </div>

                                {/* Row 3: Asset Format */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Asset Format
                                        <span className="text-xs font-normal text-slate-500 ml-2">(e.g., image, video, pdf)</span>
                                    </label>
                                    <select
                                        value={newAsset.asset_format || ''}
                                        onChange={(e) => setNewAsset({ ...newAsset, asset_format: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white cursor-pointer"
                                    >
                                        <option value="">Select format...</option>
                                        <option value="image">Image</option>
                                        <option value="video">Video</option>
                                        <option value="pdf">PDF</option>
                                        <option value="doc">Document</option>
                                        <option value="ppt">Presentation</option>
                                        <option value="infographic">Infographic</option>
                                        <option value="ebook">eBook</option>
                                    </select>
                                </div>

                                {/* Row 4: Repository */}
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

                                {/* Row 5: Mapped To (Service/Sub-service/Page) */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Mapped To
                                        <span className="text-xs font-normal text-slate-500 ml-2">(Service / Sub-service / Page)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newAsset.mapped_to || ''}
                                        onChange={(e) => setNewAsset({ ...newAsset, mapped_to: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                        placeholder="e.g., Service Name / Sub-service Name / Page Title"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">You can also link this asset to services later from the Services page</p>
                                </div>

                                {/* Row 6: Status & Usage Status */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                                        <select
                                            value={newAsset.status || 'Draft'}
                                            onChange={(e) => setNewAsset({ ...newAsset, status: e.target.value as any })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white cursor-pointer"
                                        >
                                            <option value="Draft">Draft</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="QC">QC</option>
                                            <option value="Approved">Approved</option>
                                            <option value="Published">Published</option>
                                            <option value="Archived">Archived</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Usage Status</label>
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

                                {/* Row 7: QC Score */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        QC Score
                                        <span className="text-xs font-normal text-slate-500 ml-2">(0-100)</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={newAsset.qc_score || ''}
                                        onChange={(e) => setNewAsset({ ...newAsset, qc_score: parseInt(e.target.value) || undefined })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                        placeholder="Enter QC score (0-100)"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Quality control score - will be updated after QC review</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col w-full p-6 overflow-hidden">
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
