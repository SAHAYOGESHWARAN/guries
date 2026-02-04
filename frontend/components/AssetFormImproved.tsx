import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useData } from '../hooks/useData';
import type { AssetLibraryItem, Service, SubServiceItem, AssetCategory, Task, Campaign, Project, ContentRepositoryItem, AssetCategoryMasterItem, AssetTypeMasterItem, Keyword } from '../types';

interface AssetFormImprovedProps {
    asset?: Partial<AssetLibraryItem>;
    onSave: (asset: Partial<AssetLibraryItem>, submitForQC?: boolean) => Promise<void>;
    onCancel: () => void;
    isUploading: boolean;
    editMode?: boolean;
}

const AssetFormImproved: React.FC<AssetFormImprovedProps> = ({
    asset,
    onSave,
    onCancel,
    isUploading,
    editMode = false
}) => {
    const { data: services = [] } = useData<Service>('services');
    const { data: subServices = [] } = useData<SubServiceItem>('subServices');
    const { data: tasks = [] } = useData<Task>('tasks');
    const { data: campaigns = [] } = useData<Campaign>('campaigns');
    const { data: projects = [] } = useData<Project>('projects');
    const { data: repositoryItems = [] } = useData<ContentRepositoryItem>('content');
    const { data: assetCategories = [] } = useData<AssetCategoryMasterItem>('asset-category-master');
    const { data: assetTypes = [] } = useData<AssetTypeMasterItem>('asset-type-master');
    const { data: keywordsMaster = [] } = useData<Keyword>('keywords');

    const [formData, setFormData] = useState<Partial<AssetLibraryItem>>(asset || {
        name: '',
        application_type: undefined,
        type: 'article',
        asset_category: '',
        repository: 'Content Repository',
        status: 'Draft',
        linked_service_ids: [],
        linked_sub_service_ids: [],
        keywords: [],
        seo_score: undefined,
        grammar_score: undefined
    });

    const [selectedKeywords, setSelectedKeywords] = useState<string[]>(asset?.keywords || []);
    const [linkedTaskId, setLinkedTaskId] = useState<number | null>(asset?.linked_task_id || null);
    const [linkedCampaignId, setLinkedCampaignId] = useState<number | null>(asset?.linked_campaign_id || null);
    const [linkedProjectId, setLinkedProjectId] = useState<number | null>(asset?.linked_project_id || null);
    const [linkedServiceId, setLinkedServiceId] = useState<number | null>(asset?.linked_service_id || null);
    const [linkedSubServiceId, setLinkedSubServiceId] = useState<number | null>(asset?.linked_sub_service_id || null);
    const [linkedRepositoryItemId, setLinkedRepositoryItemId] = useState<number | null>(asset?.linked_repository_item_id || null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState(asset?.thumbnail_url || '');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredSubServices = useMemo(() =>
        linkedServiceId ? subServices.filter(s => Number(s.parent_service_id) === Number(linkedServiceId)) : [],
        [subServices, linkedServiceId]
    );

    // Filter active keywords from master
    const activeKeywords = useMemo(() =>
        keywordsMaster.filter(k => k.status === 'active' || !k.status),
        [keywordsMaster]
    );

    // Handle keyword selection
    const handleKeywordSelect = (keyword: string) => {
        if (!selectedKeywords.includes(keyword)) {
            const newKeywords = [...selectedKeywords, keyword];
            setSelectedKeywords(newKeywords);
            setFormData(prev => ({ ...prev, keywords: newKeywords }));
        }
    };

    const handleKeywordRemove = (keyword: string) => {
        const newKeywords = selectedKeywords.filter(k => k !== keyword);
        setSelectedKeywords(newKeywords);
        setFormData(prev => ({ ...prev, keywords: newKeywords }));
    };

    const handleFileSelect = useCallback((file: File) => {
        setSelectedFile(file);
        setFormData(prev => ({
            ...prev,
            name: prev.name || file.name.replace(/\.[^/.]+$/, ""),
            file_size: file.size,
            file_type: file.type
        }));
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreviewUrl(result);
                setFormData(prev => ({ ...prev, file_url: result, thumbnail_url: result }));
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const handleSubmit = async (submitForQC: boolean = false) => {
        if (!formData.name?.trim()) { alert('Please enter an asset name'); return; }
        if (!formData.application_type) { alert('Please select an application type'); return; }

        let mappedToString = '';
        if (linkedServiceId) {
            const service = services.find(s => s.id === linkedServiceId);
            if (service) {
                mappedToString = service.service_name;
                if (linkedSubServiceId) {
                    const subService = subServices.find(ss => ss.id === linkedSubServiceId);
                    if (subService) mappedToString += ` / ${subService.sub_service_name}`;
                }
            }
        }

        await onSave({
            ...formData,
            date: new Date().toISOString(),
            linked_task_id: linkedTaskId,
            linked_campaign_id: linkedCampaignId,
            linked_project_id: linkedProjectId,
            linked_service_id: linkedServiceId,
            linked_sub_service_id: linkedSubServiceId,
            linked_repository_item_id: linkedRepositoryItemId,
            mapped_to: mappedToString || formData.mapped_to,
            keywords: selectedKeywords,
            status: submitForQC ? 'Pending QC Review' : (formData.status || 'Draft'),
            submitted_by: submitForQC ? 1 : undefined,
            submitted_at: submitForQC ? new Date().toISOString() : undefined,
            linking_active: false
        }, submitForQC);
    };

    const isComplete = formData.name && formData.application_type;
    const hasScores = formData.seo_score && formData.grammar_score;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={onCancel} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900">{editMode ? 'Edit Asset' : 'New Asset'}</h1>
                                <p className="text-sm text-slate-500">Update asset details and settings</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={onCancel} className="h-10 px-5 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">
                                Cancel
                            </button>
                            <button onClick={() => handleSubmit(false)} disabled={isUploading} className="h-10 px-5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                                {isUploading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button onClick={() => handleSubmit(true)} disabled={!hasScores || isUploading} className="h-10 px-5 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                                Submit for QC
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
                {/* Row 1: File Upload + Progress */}
                <div className="grid grid-cols-3 gap-6">
                    {/* File Upload */}
                    <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">File Upload</h3>
                                <p className="text-sm text-slate-500">Upload your asset file</p>
                            </div>
                        </div>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 transition-all"
                        >
                            <input ref={fileInputRef} type="file" className="hidden" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} accept="image/*,video/*,.pdf,.doc,.docx" />
                            {previewUrl ? (
                                <div>
                                    <img src={previewUrl} alt="Preview" className="h-32 mx-auto rounded-lg mb-3 object-cover" />
                                    <p className="text-sm font-medium text-slate-700">{selectedFile?.name || 'Current file'}</p>
                                    <button onClick={e => { e.stopPropagation(); setSelectedFile(null); setPreviewUrl(''); }} className="text-sm text-red-600 mt-2 hover:underline">Remove</button>
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700 mb-1">Drop files here or click to browse</p>
                                    <p className="text-xs text-slate-500 mb-3">PNG, JPG, PDF, MP4 up to 50MB</p>
                                    <div className="flex justify-center gap-2">
                                        {['PNG', 'JPG', 'PDF', 'MP4'].map(f => (
                                            <span key={f} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded">{f}</span>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-slate-900">Progress</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Basic Info</span>
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {isComplete ? 'Complete' : 'Pending'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">AI Scores</span>
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${hasScores ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {hasScores ? 'Complete' : 'Pending'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Ready for QC</span>
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isComplete && hasScores ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {isComplete && hasScores ? 'Ready' : 'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 2: Basic Information */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">Basic Information</h3>
                            <p className="text-sm text-slate-500">Essential asset details</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Asset Title *</label>
                            <input
                                type="text"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter asset name..."
                                className="w-full h-11 px-4 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Asset Type *</label>
                            <select
                                value={formData.type || 'article'}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                className="w-full h-11 px-4 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="article">Article</option>
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                                <option value="document">Document</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Asset Classification - Linked to Master Tables */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">Asset Classification</h3>
                            <p className="text-sm text-slate-500">Link to master tables</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        {/* Asset Category */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Asset Category
                                <span className="ml-2 text-xs text-violet-600">(from Category Master)</span>
                            </label>
                            <select
                                value={formData.asset_category || ''}
                                onChange={e => setFormData({ ...formData, asset_category: e.target.value })}
                                className="w-full h-11 px-4 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-violet-500"
                            >
                                <option value="">Select Category</option>
                                {assetCategories.filter(c => c.status === 'active').map(cat => (
                                    <option key={cat.id} value={cat.category_name}>
                                        {cat.category_name} ({cat.brand})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Asset Type from Master */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Asset Type
                                <span className="ml-2 text-xs text-violet-600">(from Type Master)</span>
                            </label>
                            <select
                                value={formData.type || ''}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                className="w-full h-11 px-4 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-violet-500"
                            >
                                <option value="">Select Type</option>
                                {assetTypes.filter(t => t.status === 'active').map(type => (
                                    <option key={type.id} value={type.asset_type_name}>
                                        {type.asset_type_name} {type.dimensions ? `(${type.dimensions})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Keywords */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Keywords
                                <span className="ml-2 text-xs text-violet-600">(from Keyword Master)</span>
                            </label>
                            {selectedKeywords.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {selectedKeywords.map((kw, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm">
                                            {kw}
                                            <button type="button" onClick={() => handleKeywordRemove(kw)} className="w-4 h-4 hover:bg-violet-200 rounded-full">×</button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            <select
                                value=""
                                onChange={e => e.target.value && handleKeywordSelect(e.target.value)}
                                className="w-full h-11 px-4 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-violet-500"
                            >
                                <option value="">Choose keyword from master...</option>
                                {activeKeywords.filter(kw => !selectedKeywords.includes(kw.keyword)).map(kw => (
                                    <option key={kw.id} value={kw.keyword}>
                                        {kw.keyword} ({kw.keyword_type || 'General'}) - Vol: {kw.search_volume?.toLocaleString() || 0}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Row 3: Map Asset + Status */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Map Asset to Source Work */}
                    <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Map Asset to Source Work</h3>
                                <p className="text-sm text-slate-500">Link to tasks, campaigns, projects and services</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Linked Task</label>
                                <select
                                    value={linkedTaskId || ''}
                                    onChange={e => setLinkedTaskId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full h-11 px-4 border border-slate-300 rounded-lg text-sm bg-white"
                                >
                                    <option value="">Select task</option>
                                    {tasks.map(t => <option key={t.id} value={t.id}>{t.name || t.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Linked Campaign</label>
                                <select
                                    value={linkedCampaignId || ''}
                                    onChange={e => setLinkedCampaignId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full h-11 px-4 border border-slate-300 rounded-lg text-sm bg-white"
                                >
                                    <option value="">Select campaign</option>
                                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.name || c.campaign_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Linked Project</label>
                                <select
                                    value={linkedProjectId || ''}
                                    onChange={e => setLinkedProjectId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full h-11 px-4 border border-slate-300 rounded-lg text-sm bg-white"
                                >
                                    <option value="">Select project</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name || p.project_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Linked Service</label>
                                <select
                                    value={linkedServiceId || ''}
                                    onChange={e => { setLinkedServiceId(e.target.value ? Number(e.target.value) : null); setLinkedSubServiceId(null); }}
                                    className="w-full h-11 px-4 border border-slate-300 rounded-lg text-sm bg-white"
                                >
                                    <option value="">Select service</option>
                                    {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Linked Sub-Service</label>
                                <select
                                    value={linkedSubServiceId || ''}
                                    onChange={e => setLinkedSubServiceId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full h-11 px-4 border border-slate-300 rounded-lg text-sm bg-white"
                                    disabled={!linkedServiceId}
                                >
                                    <option value="">Select sub-service</option>
                                    {filteredSubServices.map(s => <option key={s.id} value={s.id}>{s.sub_service_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Linked Repository</label>
                                <select
                                    value={linkedRepositoryItemId || ''}
                                    onChange={e => setLinkedRepositoryItemId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full h-11 px-4 border border-slate-300 rounded-lg text-sm bg-white"
                                >
                                    <option value="">Select repository item</option>
                                    {repositoryItems.map(r => <option key={r.id} value={r.id}>{r.title || r.content_title_clean}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-slate-900">Status</h3>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Current Status</label>
                            <select
                                value={formData.status || 'Draft'}
                                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full h-11 px-4 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="Draft">Draft</option>
                                <option value="Pending QC Review">Pending QC Review</option>
                                <option value="QC Approved">QC Approved</option>
                                <option value="QC Rejected">QC Rejected</option>
                                <option value="Rework Required">Rework Required</option>
                            </select>
                        </div>
                        <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <p className="text-sm text-amber-800">Status updates automatically based on workflow</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AssetFormImproved;
