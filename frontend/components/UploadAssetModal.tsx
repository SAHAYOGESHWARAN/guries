import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useData } from '../hooks/useData';
import type { AssetLibraryItem, Service, SubServiceItem, AssetCategoryMasterItem, AssetTypeMasterItem, Task, Campaign, Project, ContentRepositoryItem } from '../types';

interface UploadAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    initialData?: Partial<AssetLibraryItem>;
    contentTypeLocked?: boolean;
}

const UploadAssetModal: React.FC<UploadAssetModalProps> = ({ isOpen, onClose, onSuccess, initialData, contentTypeLocked }) => {
    const [asset, setAsset] = useState<Partial<AssetLibraryItem>>(initialData || {
        application_type: 'web', name: '', type: 'article', repository: 'Content', status: 'Draft',
        seo_score: undefined, grammar_score: undefined, web_body_content: '', keywords: []
    });
    const [linkedTaskId, setLinkedTaskId] = useState<number | null>(null);
    const [linkedCampaignId, setLinkedCampaignId] = useState<number | null>(null);
    const [linkedProjectId, setLinkedProjectId] = useState<number | null>(null);
    const [linkedServiceId, setLinkedServiceId] = useState<number | null>(null);
    const [linkedSubServiceId, setLinkedSubServiceId] = useState<number | null>(null);
    const [linkedRepositoryItemId, setLinkedRepositoryItemId] = useState<number | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: services = [] } = useData<Service>('services');
    const { data: subServices = [] } = useData<SubServiceItem>('subServices');
    const { data: assetCategories = [] } = useData<AssetCategoryMasterItem>('asset-category-master');
    const { data: assetTypes = [] } = useData<AssetTypeMasterItem>('asset-type-master');
    const { data: tasks = [] } = useData<Task>('tasks');
    const { data: campaigns = [] } = useData<Campaign>('campaigns');
    const { data: projects = [] } = useData<Project>('projects');
    const { data: repositoryItems = [] } = useData<ContentRepositoryItem>('content');
    const { create: createAsset, update: updateAsset } = useData<AssetLibraryItem>('assetLibrary');

    const filteredSubServices = useMemo(() => linkedServiceId ? subServices.filter(s => Number(s.parent_service_id) === Number(linkedServiceId)) : [], [subServices, linkedServiceId]);
    const isEditMode = !!initialData?.id;

    React.useEffect(() => {
        if (initialData) {
            setAsset(initialData);
            setLinkedTaskId(initialData.linked_task_id || null);
            setLinkedCampaignId(initialData.linked_campaign_id || null);
            setLinkedProjectId(initialData.linked_project_id || null);
            setLinkedServiceId(initialData.linked_service_id || null);
            setLinkedSubServiceId(initialData.linked_sub_service_id || null);
            setLinkedRepositoryItemId(initialData.linked_repository_item_id || null);
            if (initialData.thumbnail_url) setPreviewUrl(initialData.thumbnail_url);
        }
    }, [initialData]);

    const handleFileSelect = useCallback((file: File) => {
        setSelectedFile(file);
        setAsset(prev => ({ ...prev, name: prev.name || file.name.replace(/\.[^/.]+$/, ""), file_size: file.size, file_type: file.type }));
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => { const r = reader.result as string; setPreviewUrl(r); setAsset(prev => ({ ...prev, file_url: r, thumbnail_url: r })); };
            reader.readAsDataURL(file);
        }
    }, []);

    const analyzeContent = useCallback(async () => {
        if (!asset.web_body_content?.trim()) { alert('Please add body content'); return; }
        setIsAnalyzing(true);
        setTimeout(() => {
            setAsset(prev => ({ ...prev, seo_score: Math.round(60 + Math.random() * 30), grammar_score: Math.round(70 + Math.random() * 25) }));
            setIsAnalyzing(false);
        }, 1000);
    }, [asset.web_body_content]);

    const handleSave = useCallback(async (submitForQC = false) => {
        if (!asset.name?.trim()) { alert('Please enter asset name'); return; }
        try {
            const data = { ...asset, status: submitForQC ? 'Pending QC Review' : 'Draft', linked_task_id: linkedTaskId, linked_campaign_id: linkedCampaignId, linked_project_id: linkedProjectId, linked_service_id: linkedServiceId, linked_sub_service_id: linkedSubServiceId, linked_repository_item_id: linkedRepositoryItemId };
            if (initialData?.id) await updateAsset(initialData.id, data);
            else await createAsset(data as AssetLibraryItem);
            onSuccess?.(); onClose();
        } catch { alert('Failed to save'); }
    }, [asset, linkedTaskId, linkedCampaignId, linkedProjectId, linkedServiceId, linkedSubServiceId, linkedRepositoryItemId, initialData, createAsset, updateAsset, onSuccess, onClose]);

    if (!isOpen) return null;

    const isComplete = asset.name && asset.application_type;
    const hasScores = asset.seo_score && asset.grammar_score;

    return (
        <div className="fixed inset-0 z-50 bg-slate-50 overflow-auto">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
                <div className="h-16 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900">{isEditMode ? 'Edit Asset' : 'New Asset'}</h1>
                            <p className="text-sm text-slate-500">Update asset information and settings</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="h-10 px-5 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                        <button onClick={() => handleSave(false)} className="h-10 px-5 text-sm font-medium bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200">Update Asset</button>
                        <button onClick={() => handleSave(false)} className="h-10 px-5 text-sm font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">Save Changes</button>
                        <button onClick={() => handleSave(true)} disabled={!hasScores} className="h-10 px-5 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed">Update & Submit for QC</button>
                    </div>
                </div>
            </header>


            <main className="px-8 py-8 max-w-[1400px] mx-auto">
                {/* Row 1: Upload Cards */}
                <div className="grid grid-cols-3 gap-6 mb-6">
                    {/* File Upload */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                            </div>
                            <span className="text-base font-semibold text-slate-900">File Upload</span>
                        </div>
                        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 transition-all">
                            <input ref={fileInputRef} type="file" className="hidden" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} accept="image/*,video/*,.pdf,.doc,.docx" />
                            {previewUrl ? (
                                <div>
                                    <img src={previewUrl} alt="Preview" className="h-24 mx-auto rounded-lg mb-3 object-cover" />
                                    <p className="text-sm font-medium text-slate-700">{selectedFile?.name}</p>
                                    <button onClick={e => { e.stopPropagation(); setSelectedFile(null); setPreviewUrl(''); }} className="text-xs text-red-600 mt-2">Remove</button>
                                </div>
                            ) : (
                                <>
                                    <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700 mb-1">Drop files here or click to browse</p>
                                    <p className="text-xs text-slate-500">Support for PNG, JPG, PDF, MP4 files upto 50Mb</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <span className="text-base font-semibold text-slate-900">Progress</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between"><span className="text-sm text-slate-600">Basic Info</span><span className={`text-xs font-semibold px-3 py-1 rounded-full ${isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{isComplete ? 'Complete' : 'Pending'}</span></div>
                            <div className="flex items-center justify-between"><span className="text-sm text-slate-600">AI Scores</span><span className={`text-xs font-semibold px-3 py-1 rounded-full ${hasScores ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{hasScores ? 'Complete' : 'Pending'}</span></div>
                            <div className="flex items-center justify-between"><span className="text-sm text-slate-600">Ready for QC</span><span className={`text-xs font-semibold px-3 py-1 rounded-full ${isComplete && hasScores ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{isComplete && hasScores ? 'Ready' : 'Pending'}</span></div>
                        </div>
                    </div>

                    {/* Asset Upload */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <div>
                                <span className="text-base font-semibold text-slate-900">Asset Upload</span>
                                <p className="text-xs text-slate-500">Upload your asset file and preview</p>
                            </div>
                        </div>
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                            </div>
                            <p className="text-sm font-semibold text-slate-700 mb-1">Drop files here or click to browse</p>
                            <p className="text-xs text-slate-500 mb-3">Support for images, videos, documents</p>
                            <div className="flex justify-center gap-2">{['PNG', 'JPG', 'PDF', 'MP4', 'DOC', 'ZIP'].map(f => <span key={f} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded">{f}</span>)}</div>
                        </div>
                    </div>
                </div>


                {/* Row 2: Basic Information */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <span className="text-base font-semibold text-slate-900">Basic Information</span>
                            <p className="text-xs text-slate-500">Essential details and classification</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Asset Application *</label>
                            <div className="relative">
                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded ${asset.application_type === 'web' ? 'bg-emerald-500 text-white' : asset.application_type === 'seo' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'}`}>{(asset.application_type || 'WEB').toUpperCase()}</div>
                                <select value={asset.application_type || 'web'} onChange={e => setAsset({ ...asset, application_type: e.target.value as any })} disabled={contentTypeLocked} className="w-full h-12 pl-16 pr-4 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="web">WEB - Content type is now locked</option>
                                    <option value="seo">SEO</option>
                                    <option value="smm">SMM</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Asset Title *</label>
                            <input type="text" value={asset.name || ''} onChange={e => setAsset({ ...asset, name: e.target.value })} placeholder="Enter asset name..." className="w-full h-12 px-4 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Asset Type *</label>
                            <select value={asset.type || 'article'} onChange={e => setAsset({ ...asset, type: e.target.value })} className="w-full h-12 px-4 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="article">Article</option>
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                                <option value="document">Document</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Row 3: Two Column Layout */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Map Asset to Source Work */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                            </div>
                            <div>
                                <span className="text-base font-semibold text-slate-900">Map Asset to Source Work</span>
                                <p className="text-xs text-slate-500">Link this asset to existing tasks, campaigns, projects and services</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Linked Task</label>
                                <select value={linkedTaskId || ''} onChange={e => setLinkedTaskId(e.target.value ? Number(e.target.value) : null)} className="w-full h-11 px-4 border border-slate-300 rounded-xl text-sm bg-white">
                                    <option value="">Select task</option>
                                    {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Linked Campaign</label>
                                <select value={linkedCampaignId || ''} onChange={e => setLinkedCampaignId(e.target.value ? Number(e.target.value) : null)} className="w-full h-11 px-4 border border-slate-300 rounded-xl text-sm bg-white">
                                    <option value="">Select campaign</option>
                                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Linked Project</label>
                                <select value={linkedProjectId || ''} onChange={e => setLinkedProjectId(e.target.value ? Number(e.target.value) : null)} className="w-full h-11 px-4 border border-slate-300 rounded-xl text-sm bg-white">
                                    <option value="">Select project</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Linked Service</label>
                                <select value={linkedServiceId || ''} onChange={e => { setLinkedServiceId(e.target.value ? Number(e.target.value) : null); setLinkedSubServiceId(null); }} className="w-full h-11 px-4 border border-slate-300 rounded-xl text-sm bg-white">
                                    <option value="">Select service</option>
                                    {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Linked Sub-Service</label>
                                <select value={linkedSubServiceId || ''} onChange={e => setLinkedSubServiceId(e.target.value ? Number(e.target.value) : null)} className="w-full h-11 px-4 border border-slate-300 rounded-xl text-sm bg-white">
                                    <option value="">Select sub-service</option>
                                    {filteredSubServices.map(s => <option key={s.id} value={s.id}>{s.sub_service_name}</option>)}
                                </select>
                                <p className="text-xs text-slate-400 mt-1">Select a service first to see sub-services</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Linked Repository Item</label>
                                <select value={linkedRepositoryItemId || ''} onChange={e => setLinkedRepositoryItemId(e.target.value ? Number(e.target.value) : null)} className="w-full h-11 px-4 border border-slate-300 rounded-xl text-sm bg-white">
                                    <option value="">Select repository</option>
                                    {repositoryItems.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <span className="text-base font-semibold text-slate-900">Status</span>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                            <select value={asset.status || 'Draft'} onChange={e => setAsset({ ...asset, status: e.target.value as any })} className="w-full h-12 px-4 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                                <option value="Draft">Draft</option>
                                <option value="Pending QC Review">Pending QC Review</option>
                                <option value="Approved">Approved</option>
                            </select>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                            <p className="text-sm text-amber-800">Status will be updated automatically based on workflow</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UploadAssetModal;
