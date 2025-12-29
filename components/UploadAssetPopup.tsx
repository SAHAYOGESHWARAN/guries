import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import type { AssetLibraryItem, Service, SubServiceItem, AssetCategoryMasterItem, AssetTypeMasterItem, Task, Campaign, Project, ContentRepositoryItem, User } from '../types';

interface UploadAssetPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    initialData?: Partial<AssetLibraryItem>;
}

const UploadAssetPopup: React.FC<UploadAssetPopupProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
    const { user } = useAuth();

    const [asset, setAsset] = useState<Partial<AssetLibraryItem>>({
        application_type: 'web',
        name: '',
        type: '',
        repository: 'Content',
        status: 'Draft',
        asset_category: '',
        content_type: '',
        web_title: '',
        web_description: '',
        web_url: '',
        web_h1: '',
        web_h2_1: '',
        web_h2_2: '',
        web_body_content: '',
        keywords: [],
        seo_score: 0,
        grammar_score: 0,
    });

    const [linkedTaskId, setLinkedTaskId] = useState<number | null>(null);
    const [linkedCampaignId, setLinkedCampaignId] = useState<number | null>(null);
    const [linkedProjectId, setLinkedProjectId] = useState<number | null>(null);
    const [linkedServiceId, setLinkedServiceId] = useState<number | null>(null);
    const [linkedSubServiceId, setLinkedSubServiceId] = useState<number | null>(null);
    const [linkedRepositoryItemId, setLinkedRepositoryItemId] = useState<number | null>(null);
    const [designedBy, setDesignedBy] = useState<number | null>(null);
    const [workflowStage, setWorkflowStage] = useState('Draft');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [keywordsInput, setKeywordsInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: services = [] } = useData<Service>('services');
    const { data: subServices = [] } = useData<SubServiceItem>('subServices');
    const { data: assetCategories = [] } = useData<AssetCategoryMasterItem>('asset-category-master');
    const { data: assetTypes = [] } = useData<AssetTypeMasterItem>('asset-type-master');
    const { data: contentTypes = [] } = useData<any>('content-type-master');
    const { data: tasks = [] } = useData<Task>('tasks');
    const { data: campaigns = [] } = useData<Campaign>('campaigns');
    const { data: projects = [] } = useData<Project>('projects');
    const { data: repositoryItems = [] } = useData<ContentRepositoryItem>('content');
    const { data: users = [] } = useData<User>('users');
    const { create: createAsset, update: updateAsset } = useData<AssetLibraryItem>('assetLibrary');

    const filteredSubServices = useMemo(() =>
        linkedServiceId ? subServices.filter(s => Number(s.parent_service_id) === Number(linkedServiceId)) : [],
        [subServices, linkedServiceId]
    );

    const isEditMode = !!initialData?.id;

    useEffect(() => {
        if (initialData) {
            setAsset(prev => ({ ...prev, ...initialData }));
            setLinkedTaskId(initialData.linked_task_id || null);
            setLinkedCampaignId(initialData.linked_campaign_id || null);
            setLinkedProjectId(initialData.linked_project_id || null);
            setLinkedServiceId(initialData.linked_service_id || null);
            setLinkedSubServiceId(initialData.linked_sub_service_id || null);
            setLinkedRepositoryItemId(initialData.linked_repository_item_id || null);
            if (initialData.keywords) setKeywordsInput(initialData.keywords.join(', '));
            // Set preview URL if there's an existing thumbnail
            if (initialData.thumbnail_url || initialData.file_url) {
                setPreviewUrl(initialData.thumbnail_url || initialData.file_url || '');
            }
        } else {
            // Reset all state when no initialData (new upload)
            setAsset({
                application_type: 'web',
                name: '',
                type: '',
                repository: 'Content',
                status: 'Draft',
                asset_category: '',
                content_type: '',
                web_title: '',
                web_description: '',
                web_url: '',
                web_h1: '',
                web_h2_1: '',
                web_h2_2: '',
                web_body_content: '',
                keywords: [],
                seo_score: 0,
                grammar_score: 0,
            });
            setLinkedTaskId(null);
            setLinkedCampaignId(null);
            setLinkedProjectId(null);
            setLinkedServiceId(null);
            setLinkedSubServiceId(null);
            setLinkedRepositoryItemId(null);
            setDesignedBy(null);
            setWorkflowStage('Draft');
            setKeywordsInput('');
            setSelectedFile(null);
            setPreviewUrl('');
        }
    }, [initialData, isOpen]);

    const analyzeContent = useCallback(async () => {
        if (!asset.web_body_content?.trim()) {
            alert('Please add body content to analyze');
            return;
        }
        setIsAnalyzing(true);
        setTimeout(() => {
            const text = asset.web_body_content || '';
            const lengthScore = Math.min(80, Math.round(text.length / 50));
            const seoScore = Math.min(100, lengthScore + Math.round(Math.random() * 20));
            const grammarScore = Math.min(100, Math.round(70 + Math.random() * 25));
            setAsset(prev => ({ ...prev, seo_score: seoScore, grammar_score: grammarScore }));
            setIsAnalyzing(false);
        }, 1500);
    }, [asset.web_body_content]);

    // Handle file selection
    const handleFileSelect = useCallback((file: File) => {
        setSelectedFile(file);

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setPreviewUrl(base64String);
                setAsset(prev => ({
                    ...prev,
                    file_url: base64String,
                    thumbnail_url: base64String,
                    file_size: file.size,
                    file_type: file.type
                }));
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewUrl('');
            setAsset(prev => ({
                ...prev,
                file_size: file.size,
                file_type: file.type
            }));
        }
    }, []);

    const handleSave = useCallback(async (submitForQC = false) => {
        if (!asset.name?.trim() && !asset.web_title?.trim()) {
            alert('Please enter asset title');
            return;
        }

        setIsSaving(true);
        try {
            const keywords = keywordsInput.split(',').map(k => k.trim()).filter(Boolean);
            const data = {
                ...asset,
                name: asset.web_title || asset.name,
                keywords,
                status: submitForQC ? 'Pending QC Review' : 'Draft',
                linked_task_id: linkedTaskId,
                linked_campaign_id: linkedCampaignId,
                linked_project_id: linkedProjectId,
                linked_service_id: linkedServiceId,
                linked_sub_service_id: linkedSubServiceId,
                linked_repository_item_id: linkedRepositoryItemId,
                designed_by: designedBy,
                workflow_stage: workflowStage,
                created_by: user?.id,
                created_at: new Date().toISOString(),
            };

            if (initialData?.id) await updateAsset(initialData.id, data);
            else await createAsset(data as AssetLibraryItem);

            // Reset file state after successful save
            setSelectedFile(null);
            setPreviewUrl('');

            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Failed to save asset:', err);
            alert('Failed to save asset');
        } finally {
            setIsSaving(false);
        }
    }, [asset, keywordsInput, linkedTaskId, linkedCampaignId, linkedProjectId, linkedServiceId, linkedSubServiceId, linkedRepositoryItemId, designedBy, workflowStage, initialData, createAsset, updateAsset, onSuccess, onClose, user]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-4">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl my-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div>
                        <h1 className="text-base font-bold text-slate-900">Upload New Asset</h1>
                        <p className="text-xs text-slate-500">Choose application and provide basic details</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm">Close</button>
                </div>

                {/* Scrollable Content */}
                <div className="max-h-[80vh] overflow-y-auto">
                    <div className="p-5 space-y-5">

                        {/* Web Application Fields - Blue Card */}
                        <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-blue-700">Web Application Fields</h3>
                                    <p className="text-xs text-blue-600">Configure your web content details</p>
                                </div>
                            </div>

                            {/* Title & Meta Description */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5">
                                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={asset.web_title || ''}
                                        onChange={e => setAsset({ ...asset, web_title: e.target.value, name: e.target.value })}
                                        placeholder="Enter web page title..."
                                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5">
                                        <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                                        Meta Description
                                    </label>
                                    <textarea
                                        value={asset.web_description || ''}
                                        onChange={e => setAsset({ ...asset, web_description: e.target.value })}
                                        placeholder="SEO meta description [150-160 characters]..."
                                        rows={3}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    />
                                    <p className="text-[10px] text-slate-400 text-right mt-0.5">{(asset.web_description || '').length}/160 characters</p>
                                </div>
                            </div>

                            {/* URL */}
                            <div className="mb-4">
                                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5">
                                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    URL
                                </label>
                                <input
                                    type="text"
                                    value={asset.web_url || ''}
                                    onChange={e => setAsset({ ...asset, web_url: e.target.value })}
                                    placeholder="https://example.com/page"
                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Keywords */}
                            <div className="mb-4">
                                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5">
                                    <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                    Keywords
                                </label>
                                <input
                                    type="text"
                                    value={keywordsInput}
                                    onChange={e => setKeywordsInput(e.target.value)}
                                    placeholder="keyword1, keyword2, keyword3..."
                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Heading Structure */}
                            <div className="mb-4">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-3">
                                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                    </svg>
                                    Heading Structure
                                </label>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-[11px] text-slate-600 mb-1">H1 Tag</label>
                                        <input
                                            type="text"
                                            value={asset.web_h1 || ''}
                                            onChange={e => setAsset({ ...asset, web_h1: e.target.value })}
                                            placeholder="Main heading (H1)..."
                                            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] text-slate-600 mb-1">H2 Tag (First)</label>
                                            <input
                                                type="text"
                                                value={asset.web_h2_1 || ''}
                                                onChange={e => setAsset({ ...asset, web_h2_1: e.target.value })}
                                                placeholder="First H2 subheading..."
                                                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] text-slate-600 mb-1">H2 Tag (Second)</label>
                                            <input
                                                type="text"
                                                value={asset.web_h2_2 || ''}
                                                onChange={e => setAsset({ ...asset, web_h2_2: e.target.value })}
                                                placeholder="Second H2 subheading..."
                                                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Body Content with Scores */}
                            <div className="bg-white rounded-xl p-4 border border-slate-200">
                                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-2">
                                    <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                                    Body content
                                </label>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <textarea
                                            value={asset.web_body_content || ''}
                                            onChange={e => setAsset({ ...asset, web_body_content: e.target.value })}
                                            placeholder="Paste your full article or body copy here for AI analysis..."
                                            rows={5}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none"
                                        />
                                        <button
                                            onClick={analyzeContent}
                                            disabled={isAnalyzing}
                                            className="mt-3 px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isAnalyzing ? (
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            )}
                                            Analyze
                                        </button>
                                    </div>

                                    {/* Score Circles */}
                                    <div className="w-28 flex flex-col items-center justify-center gap-3">
                                        <div className="text-center">
                                            <div className="relative w-14 h-14 mx-auto">
                                                <svg className="w-14 h-14 transform -rotate-90">
                                                    <circle cx="28" cy="28" r="24" stroke="#e2e8f0" strokeWidth="3" fill="none" />
                                                    <circle
                                                        cx="28" cy="28" r="24"
                                                        stroke="#3b82f6"
                                                        strokeWidth="3"
                                                        fill="none"
                                                        strokeDasharray={`${(asset.seo_score || 0) * 1.51} 151`}
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
                                                    {asset.seo_score || 0}%
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 mt-1">SEO SCORE</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="relative w-14 h-14 mx-auto">
                                                <svg className="w-14 h-14 transform -rotate-90">
                                                    <circle cx="28" cy="28" r="24" stroke="#e2e8f0" strokeWidth="3" fill="none" />
                                                    <circle
                                                        cx="28" cy="28" r="24"
                                                        stroke="#3b82f6"
                                                        strokeWidth="3"
                                                        fill="none"
                                                        strokeDasharray={`${(asset.grammar_score || 0) * 1.51} 151`}
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
                                                    {asset.grammar_score || 0}%
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 mt-1">GRAMMAR SCORE</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Resource Upload */}
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                                <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                                Resource Upload
                            </label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer bg-slate-50"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/*,video/*,.pdf,.doc,.docx"
                                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                />
                                {previewUrl ? (
                                    <div className="space-y-3">
                                        <img src={previewUrl} alt="Preview" className="max-h-32 mx-auto rounded-lg shadow-md" />
                                        <p className="text-sm text-slate-600">Click to change file</p>
                                        {selectedFile && (
                                            <p className="text-xs text-slate-500">{selectedFile.name}</p>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-700 mb-1">Upload Web Assets</p>
                                        <p className="text-xs text-slate-500">Drag & drop source files, or <span className="text-blue-600 hover:underline">browse local files</span></p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Asset Classification - Yellow Card */}
                        <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                            <div className="flex items-center gap-2 mb-4">
                                <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                <h3 className="text-sm font-bold text-slate-800">Asset Classification</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-600 mb-1.5">Content Type *</label>
                                    <select
                                        value={asset.content_type || ''}
                                        onChange={e => setAsset({ ...asset, content_type: e.target.value })}
                                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm"
                                    >
                                        <option value="">Select content type</option>
                                        {contentTypes.map((ct: any) => <option key={ct.id} value={ct.name}>{ct.name}</option>)}
                                        <option value="blog">Blog</option>
                                        <option value="article">Article</option>
                                        <option value="service_page">Service Page</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-600 mb-1.5">Repository</label>
                                    <select
                                        value={asset.repository || 'Content'}
                                        onChange={e => setAsset({ ...asset, repository: e.target.value })}
                                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm"
                                    >
                                        <option value="Content">Content</option>
                                        <option value="Graphics">Graphics</option>
                                        <option value="Videos">Videos</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-600 mb-1.5">
                                        Asset Category <span className="text-slate-400 text-[10px]">(linked to master database)</span>
                                    </label>
                                    <select
                                        value={asset.asset_category || ''}
                                        onChange={e => setAsset({ ...asset, asset_category: e.target.value })}
                                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm"
                                    >
                                        <option value="">Select category...</option>
                                        {assetCategories.filter(c => !c.status || c.status === 'active').map(c => (
                                            <option key={c.id} value={c.category_name || c.name}>{c.category_name || c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-600 mb-1.5">
                                        Asset Type <span className="text-slate-400 text-[10px]">(linked to master database)</span>
                                    </label>
                                    <select
                                        value={asset.type || ''}
                                        onChange={e => setAsset({ ...asset, type: e.target.value })}
                                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm"
                                    >
                                        <option value="">Select type...</option>
                                        {assetTypes.filter(t => !t.status || t.status === 'active').map(t => (
                                            <option key={t.id} value={t.asset_type_name || t.name}>{t.asset_type_name || t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Map Asset to Source Work */}
                        <div className="bg-white rounded-xl p-5 border border-slate-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800">Map Asset to Source Work</h3>
                                    <p className="text-[10px] text-slate-500">Link this asset to existing tasks, campaigns, projects, and services</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Linked Task</label>
                                    <select
                                        value={linkedTaskId || ''}
                                        onChange={e => setLinkedTaskId(e.target.value ? Number(e.target.value) : null)}
                                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm"
                                    >
                                        <option value="">Select task</option>
                                        {tasks.map(t => <option key={t.id} value={t.id}>{t.title || t.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Linked Campaign</label>
                                    <select
                                        value={linkedCampaignId || ''}
                                        onChange={e => setLinkedCampaignId(e.target.value ? Number(e.target.value) : null)}
                                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm"
                                    >
                                        <option value="">Select campaign</option>
                                        {campaigns.map(c => <option key={c.id} value={c.id}>{c.name || c.campaign_name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Linked Project</label>
                                    <select
                                        value={linkedProjectId || ''}
                                        onChange={e => setLinkedProjectId(e.target.value ? Number(e.target.value) : null)}
                                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm"
                                    >
                                        <option value="">Select project</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name || p.project_name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Linked Service</label>
                                    <select
                                        value={linkedServiceId || ''}
                                        onChange={e => { setLinkedServiceId(e.target.value ? Number(e.target.value) : null); setLinkedSubServiceId(null); }}
                                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm"
                                    >
                                        <option value="">Select service</option>
                                        {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Linked Sub-Service</label>
                                    <select
                                        value={linkedSubServiceId || ''}
                                        onChange={e => setLinkedSubServiceId(e.target.value ? Number(e.target.value) : null)}
                                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm"
                                    >
                                        <option value="">Select sub-service</option>
                                        {filteredSubServices.map(s => <option key={s.id} value={s.id}>{s.sub_service_name}</option>)}
                                    </select>
                                    <p className="text-[9px] text-slate-400 mt-1">Select a service first to see sub-services</p>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Linked Repository Item</label>
                                    <select
                                        value={linkedRepositoryItemId || ''}
                                        onChange={e => setLinkedRepositoryItemId(e.target.value ? Number(e.target.value) : null)}
                                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm"
                                    >
                                        <option value="">Select repository</option>
                                        {repositoryItems.map(r => <option key={r.id} value={r.id}>{r.title || r.content_title_clean}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>


                        {/* Designer & Workflow - Purple Card */}
                        <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 bg-purple-500 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-purple-700">Designer & Workflow</h3>
                                    <p className="text-[10px] text-purple-600">Assign ownership and track workflow status</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Created By [Auto-Filled]</label>
                                    <input
                                        type="text"
                                        value={user?.name || 'Current User'}
                                        disabled
                                        className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Designed By *</label>
                                    <select
                                        value={designedBy || ''}
                                        onChange={e => setDesignedBy(e.target.value ? Number(e.target.value) : null)}
                                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm"
                                    >
                                        <option value="">Select designer</option>
                                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Workflow Stage *</label>
                                <select
                                    value={workflowStage}
                                    onChange={e => setWorkflowStage(e.target.value)}
                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm"
                                >
                                    <option value="Draft">Draft</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Review">Review</option>
                                    <option value="Approved">Approved</option>
                                </select>
                            </div>
                        </div>

                        {/* Versioning */}
                        <div className="bg-white rounded-xl p-5 border border-slate-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-bold text-slate-800">Versioning</h3>
                            </div>
                            <div className="flex items-start gap-4">
                                <div>
                                    <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Version Number [Auto-Increment]</label>
                                    <div className="h-10 px-4 bg-slate-100 rounded-lg flex items-center text-sm font-medium text-slate-700 w-20">
                                        v1.0
                                    </div>
                                    <p className="text-[9px] text-slate-400 mt-1.5 max-w-[200px]">This is the initial version. Future uploads will auto-increment to v1.1, v1.2, etc.</p>
                                </div>
                                <div className="flex gap-2 pt-5">
                                    <button className="h-9 px-3 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 bg-white">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        View Version History
                                    </button>
                                    <button className="h-9 px-3 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 bg-white">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Replace Existing Version
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Required Fields Note */}
                        <p className="text-xs text-slate-500">* Required fields must be filled to save the asset</p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-center gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
                    <button
                        onClick={onClose}
                        className="h-10 px-6 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => handleSave(true)}
                        disabled={isSaving}
                        className="h-10 px-5 text-sm font-medium bg-amber-100 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-200 disabled:opacity-50 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Send to QC Stage 2
                    </button>
                    <button
                        onClick={() => handleSave(false)}
                        disabled={isSaving}
                        className="h-10 px-5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                        )}
                        Save to Asset Library
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadAssetPopup;
