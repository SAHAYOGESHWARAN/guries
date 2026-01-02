import React, { useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { useData } from '../hooks/useData';
import { getStatusBadge } from '../constants';
import type { ContentRepositoryItem } from '../types';

const PIPELINE_STAGES = ['All', 'idea', 'outline', 'draft', 'qc_pending', 'qc_passed', 'published'];

const ContentRepositoryView: React.FC = () => {
    const { data: content, create: createContent, update: updateContent, remove: deleteContent } = useData<ContentRepositoryItem>('content');

    const [viewMode, setViewMode] = useState<'list' | 'editor' | 'preview'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeStage, setActiveStage] = useState('All');
    const [editingItem, setEditingItem] = useState<ContentRepositoryItem | null>(null);
    const [previewItem, setPreviewItem] = useState<ContentRepositoryItem | null>(null);

    const [formData, setFormData] = useState<Partial<ContentRepositoryItem>>({
        content_title_clean: '',
        asset_type: 'blog',
        status: 'idea',
        h1: '',
        body_content: '',
        thumbnail_url: ''
    });

    const [uploadingFile, setUploadingFile] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const getStageCount = (stage: string) => {
        if (stage === 'All') return content.length;
        return content.filter(c => c.status === stage).length;
    };

    const filteredContent = content.filter(item => {
        const matchesSearch = item.content_title_clean.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStage = activeStage === 'All' || item.status === activeStage;
        return matchesSearch && matchesStage;
    });

    const handleEdit = (item: ContentRepositoryItem) => {
        setEditingItem(item);
        setFormData(item);
        setViewMode('editor');
    };

    const handleView = (item: ContentRepositoryItem) => {
        setPreviewItem(item);
        setViewMode('preview');
    };

    const handleDeleteContent = async (id: number) => {
        if (confirm('Delete content?')) await deleteContent(id);
    };

    const resetForm = () => {
        setFormData({
            content_title_clean: '',
            asset_type: 'blog',
            status: 'idea',
            h1: '',
            body_content: '',
            thumbnail_url: ''
        });
    };

    const handleSave = async () => {
        if (!formData.content_title_clean) {
            alert('Please enter a title for the asset');
            return;
        }

        const now = new Date().toISOString();
        const payload = {
            ...formData,
            updated_at: now,
            created_at: editingItem ? editingItem.created_at : now
        };

        if (editingItem) {
            await updateContent(editingItem.id, payload);
        } else {
            await createContent(payload as any);
        }
        setViewMode('list');
        setEditingItem(null);
        resetForm();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const processFile = (file: File) => {
        setUploadingFile(true);

        // Simulate file upload (in real app, upload to server/cloud storage)
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;

            // Determine asset type from file
            let assetType: 'article' | 'video' | 'graphic' | 'pdf' | 'guide' | 'blog' | 'service_page' = 'article';
            if (file.type.startsWith('image/')) assetType = 'graphic';
            else if (file.type.startsWith('video/')) assetType = 'video';
            else if (file.type === 'application/pdf') assetType = 'pdf';

            // Set form data with file info
            setFormData({
                content_title_clean: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                asset_type: assetType,
                status: 'draft',
                h1: file.name.replace(/\.[^/.]+$/, ""),
                body_content: `Uploaded file: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\nType: ${file.type}`,
                thumbnail_url: file.type.startsWith('image/') ? result : ''
            });

            setUploadingFile(false);
            setViewMode('editor');
        };

        if (file.type.startsWith('image/')) {
            reader.readAsDataURL(file);
        } else {
            reader.readAsText(file);
        }
    };

    const getAssetTypeIcon = (type: string) => {
        const icons: Record<string, string> = {
            'blog': '📝',
            'video': '🎥',
            'pdf': '📄',
            'image': '🖼️',
            'document': '📋',
            'infographic': '📊',
            'case_study': '📖',
            'whitepaper': '📑',
            'ebook': '📚',
            'webinar': '🎓',
        };
        return icons[type?.toLowerCase()] || '📦';
    };

    const getAssetTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'blog': 'bg-blue-500',
            'video': 'bg-red-500',
            'pdf': 'bg-orange-500',
            'image': 'bg-green-500',
            'document': 'bg-purple-500',
            'infographic': 'bg-pink-500',
            'case_study': 'bg-teal-500',
            'whitepaper': 'bg-indigo-500',
        };
        return colors[type?.toLowerCase()] || 'bg-slate-500';
    };

    // PREVIEW MODAL
    if (viewMode === 'preview' && previewItem) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl">{getAssetTypeIcon(previewItem.asset_type)}</span>
                                <div>
                                    <h2 className="text-xl font-bold">{previewItem.content_title_clean}</h2>
                                    <p className="text-sm text-indigo-100 mt-1">Asset ID: {previewItem.id}</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setViewMode('list')}
                            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Preview Image */}
                        {previewItem.thumbnail_url && (
                            <div className="rounded-xl overflow-hidden border-2 border-slate-200 shadow-lg">
                                <img
                                    src={previewItem.thumbnail_url}
                                    alt={previewItem.content_title_clean}
                                    className="w-full h-auto object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                        )}

                        {/* Meta Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Type</div>
                                <div className="text-sm font-bold text-slate-800 capitalize">{previewItem.asset_type?.replace(/_/g, ' ')}</div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Status</div>
                                <div className="text-sm font-bold text-slate-800 capitalize">{previewItem.status?.replace(/_/g, ' ')}</div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-1">QC Score</div>
                                <div className={`text-sm font-bold ${previewItem.ai_qc_report?.score && previewItem.ai_qc_report.score >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {previewItem.ai_qc_report?.score || 'N/A'}
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Word Count</div>
                                <div className="text-sm font-bold text-slate-800">{previewItem.word_count || 0}</div>
                            </div>
                        </div>

                        {/* H1 */}
                        {previewItem.h1 && (
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200">
                                <div className="text-xs text-blue-700 uppercase font-bold mb-2">H1 Heading</div>
                                <h3 className="text-lg font-bold text-slate-900">{previewItem.h1}</h3>
                            </div>
                        )}

                        {/* Body Content */}
                        {previewItem.body_content && (
                            <div className="bg-white rounded-xl p-5 border-2 border-slate-200">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-3">Content</div>
                                <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                                    {previewItem.body_content}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex justify-between items-center">
                        <button
                            onClick={() => setViewMode('list')}
                            className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-white transition-colors"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => handleEdit(previewItem)}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                        >
                            Edit Asset
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // EDITOR VIEW
    if (viewMode === 'editor') {
        return (
            <div className="h-full flex flex-col w-full p-6 animate-fade-in overflow-hidden">
                <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full h-full">
                    <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-slate-50/50 w-full flex-shrink-0">
                        <h2 className="text-lg font-bold text-slate-800">{editingItem ? 'Edit Content' : 'New Content Asset'}</h2>
                        <div className="flex gap-2">
                            <button onClick={() => setViewMode('list')} className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                            <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-blue-700">Save</button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 w-full">
                        <div className="w-full space-y-6">
                            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm w-full space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 w-full">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-2">Title</label>
                                        <input type="text" value={formData.content_title_clean} onChange={(e) => setFormData({ ...formData, content_title_clean: e.target.value })} className="w-full p-2 border border-slate-300 rounded-md text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-2">Asset Type</label>
                                        <select value={formData.asset_type} onChange={(e) => setFormData({ ...formData, asset_type: e.target.value as any })} className="w-full p-2 border border-slate-300 rounded-md text-sm">
                                            <option value="article">Article</option>
                                            <option value="blog">Blog</option>
                                            <option value="video">Video</option>
                                            <option value="graphic">Graphic</option>
                                            <option value="pdf">PDF</option>
                                            <option value="guide">Guide</option>
                                            <option value="service_page">Service Page</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 w-full">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-2">Status</label>
                                        <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full p-2 border border-slate-300 rounded-md text-sm">
                                            {PIPELINE_STAGES.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-2">Thumbnail URL</label>
                                        <input type="text" value={formData.thumbnail_url || ''} onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })} placeholder="https://..." className="w-full p-2 border border-slate-300 rounded-md text-sm font-mono" />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-gray-700 mb-2">H1 Header</label>
                                    <input type="text" value={formData.h1} onChange={(e) => setFormData({ ...formData, h1: e.target.value })} className="w-full p-2 border border-slate-300 rounded-md text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Body Content</label>
                                    <textarea value={formData.body_content} onChange={(e) => setFormData({ ...formData, body_content: e.target.value })} className="w-full p-3 border border-slate-300 rounded-md h-64 font-mono text-sm leading-relaxed" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // LIST VIEW
    return (
        <div className="h-full flex flex-col w-full p-6 animate-fade-in overflow-hidden">
            <div className="flex justify-between items-start flex-shrink-0 w-full mb-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">Assets</h1>
                </div>
                <div className="flex space-x-3">
                    <label className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm flex items-center transition-colors cursor-pointer">
                        <input
                            type="file"
                            onChange={handleFileUpload}
                            className="hidden"
                            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                        />
                        <span className="mr-1 text-base">📤</span> Upload File
                    </label>
                    <button onClick={() => { setEditingItem(null); resetForm(); setViewMode('editor'); }} className="bg-white text-indigo-600 border-2 border-indigo-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-50 shadow-sm flex items-center transition-colors">
                        <span className="mr-1 text-base">+</span> Create Asset
                    </button>
                </div>
            </div>

            {/* Drag and Drop Upload Zone - Show when no content */}
            {content.length === 0 && (
                <div
                    className={`mb-6 border-2 border-dashed rounded-2xl p-12 text-center transition-all ${dragActive
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div className="flex flex-col items-center">
                        <div className="bg-indigo-100 p-6 rounded-full mb-4">
                            <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Drop files here to upload</h3>
                        <p className="text-sm text-slate-600 mb-4">or click the button above to browse</p>
                        <p className="text-xs text-slate-500">Supports: Images, Videos, PDFs, Documents</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-4 flex-1 min-h-0 w-full">
                <div className="flex-1 flex flex-col gap-3 min-w-0 w-full min-h-0">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-200 w-full flex-shrink-0">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input type="text" className="block w-full p-2 pl-10 text-sm text-slate-900 border-none focus:ring-0 placeholder-slate-400" placeholder="Search assets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 w-full flex-shrink-0">
                        {PIPELINE_STAGES.map(stage => (
                            <button key={stage} onClick={() => setActiveStage(stage)} className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap flex items-center space-x-2 ${activeStage === stage ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                                <span className="capitalize">{stage.replace(/_/g, ' ')}</span><span className={`px-1.5 py-0.5 rounded-full text-[9px] ${activeStage === stage ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-100 text-slate-500'}`}>{getStageCount(stage)}</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden w-full h-full">
                        <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-slate-700 font-medium flex items-center gap-2">
                                    <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-bold">
                                        {filteredContent.length}
                                    </span>
                                    <span>assets found</span>
                                </p>
                                {filteredContent.length > 0 && (
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Click on any asset name or preview to view details</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden w-full h-full">
                            <Table
                                columns={[
                                    {
                                        header: 'Preview',
                                        accessor: (item: ContentRepositoryItem) => (
                                            <div className="flex items-center justify-center py-2">
                                                {item.thumbnail_url ? (
                                                    <img
                                                        src={item.thumbnail_url}
                                                        alt={item.content_title_clean}
                                                        className="w-20 h-20 object-cover rounded-xl border-2 border-slate-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                                                        onClick={() => handleView(item)}
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            const parent = target.parentElement;
                                                            if (parent) {
                                                                const fallback = document.createElement('div');
                                                                fallback.className = `w-20 h-20 ${getAssetTypeColor(item.asset_type)} rounded-xl flex items-center justify-center text-3xl shadow-md cursor-pointer`;
                                                                fallback.innerHTML = getAssetTypeIcon(item.asset_type);
                                                                fallback.onclick = () => handleView(item);
                                                                parent.appendChild(fallback);
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        className={`w-20 h-20 ${getAssetTypeColor(item.asset_type)} rounded-xl flex items-center justify-center text-3xl shadow-md hover:shadow-lg transition-shadow cursor-pointer`}
                                                        onClick={() => handleView(item)}
                                                    >
                                                        {getAssetTypeIcon(item.asset_type)}
                                                    </div>
                                                )}
                                            </div>
                                        ),
                                        className: "w-28 text-center"
                                    },
                                    {
                                        header: 'Name',
                                        accessor: (item: ContentRepositoryItem) => (
                                            <div className="group">
                                                <div
                                                    className="font-bold text-slate-900 text-sm hover:text-indigo-600 cursor-pointer transition-colors flex items-center gap-2"
                                                    onClick={() => handleView(item)}
                                                    title="Click to view details"
                                                >
                                                    <span className="line-clamp-2">{item.content_title_clean}</span>
                                                    <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                                    <span className="font-mono">ID: {item.id}</span>
                                                    {item.word_count && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{item.word_count} words</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    },
                                    {
                                        header: 'Type',
                                        accessor: (item: ContentRepositoryItem) => (
                                            <span className={`inline-flex items-center gap-1 text-xs font-bold text-white capitalize px-3 py-1 rounded-full ${getAssetTypeColor(item.asset_type)}`}>
                                                <span>{getAssetTypeIcon(item.asset_type)}</span>
                                                {(item.asset_type || '').replace(/_/g, ' ')}
                                            </span>
                                        )
                                    },
                                    {
                                        header: 'Status',
                                        accessor: (item: ContentRepositoryItem) => (
                                            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${item.status === 'published' ? 'bg-green-100 text-green-700 border border-green-300' :
                                                item.status === 'qc_passed' ? 'bg-blue-100 text-blue-700 border border-blue-300' :
                                                    item.status === 'draft' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                                                        'bg-slate-100 text-slate-700 border border-slate-300'
                                                }`}>
                                                {item.status.replace(/_/g, ' ')}
                                            </span>
                                        )
                                    },
                                    {
                                        header: 'Date',
                                        accessor: (item: ContentRepositoryItem) => (
                                            <span className="text-xs text-slate-600">
                                                {item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                                            </span>
                                        )
                                    },
                                    {
                                        header: 'Actions',
                                        accessor: (item: ContentRepositoryItem) => (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleView(item)}
                                                    className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-all group relative"
                                                    title="View Details"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                        View
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all group relative"
                                                    title="Edit Asset"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                        Edit
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteContent(item.id)}
                                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all group relative"
                                                    title="Delete Asset"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                        Delete
                                                    </span>
                                                </button>
                                            </div>
                                        )
                                    }
                                ]}
                                data={filteredContent}
                                title=""
                                emptyMessage={content.length === 0 ? "No assets yet. Upload your first file or create a new asset to get started!" : "No assets match your search criteria."}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentRepositoryView;
