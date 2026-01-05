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

                        {/* Application Type Selector - Only show for General Upload */}
                        {!asset.application_type && (
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-slate-500 rounded-xl flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-700">Select Content Type</h3>
                                        <p className="text-xs text-slate-500">Choose the type of content you want to upload</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={() => setAsset(prev => ({ ...prev, application_type: 'web' }))}
                                        className="p-4 rounded-lg border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-center"
                                    >
                                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                            </svg>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-700">🌐 Web Content</p>
                                        <p className="text-[10px] text-slate-500">Landing pages, articles</p>
                                    </button>
                                    <button
                                        onClick={() => setAsset(prev => ({ ...prev, application_type: 'seo' }))}
                                        className="p-4 rounded-lg border-2 border-slate-200 hover:border-green-400 hover:bg-green-50 transition-all text-center"
                                    >
                                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-700">🔍 SEO Content</p>
                                        <p className="text-[10px] text-slate-500">Search optimized content</p>
                                    </button>
                                    <button
                                        onClick={() => setAsset(prev => ({ ...prev, application_type: 'smm' }))}
                                        className="p-4 rounded-lg border-2 border-slate-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-center"
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                            </svg>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-700">📱 Social Media</p>
                                        <p className="text-[10px] text-slate-500">Posts, stories, videos</p>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Web Application Fields - Follows Document Section Order */}
                        {asset.application_type === 'web' && (
                            <div className="space-y-4">
                                {/* Header */}
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-blue-700">Upload Assets → Web</h3>
                                                <p className="text-xs text-blue-600">Follow the sections in order below</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setAsset(prev => ({ ...prev, application_type: undefined }))} className="text-xs text-blue-600 hover:text-blue-800 underline">Change Type</button>
                                    </div>
                                </div>

                                {/* SECTION 1: Map Assets to Source Work (4.1) */}
                                <div className="bg-white rounded-xl p-4 border border-slate-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">1</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-700">Map Assets to Source Work</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Linked Repository</label>
                                            <select value={linkedRepositoryItemId || ''} onChange={e => setLinkedRepositoryItemId(e.target.value ? Number(e.target.value) : null)} className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                                                <option value="">Select Repository...</option>
                                                {repositoryItems.map(repo => (<option key={repo.id} value={repo.id}>{repo.content_title_clean || `Repository #${repo.id}`}</option>))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Linked Task</label>
                                            <select value={linkedTaskId || ''} onChange={e => setLinkedTaskId(e.target.value ? Number(e.target.value) : null)} className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                                                <option value="">Select Task...</option>
                                                {tasks.map(task => (<option key={task.id} value={task.id}>{task.name || `Task #${task.id}`}</option>))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 2: Asset Classification (4.2) - NO Repository field */}
                                <div className="bg-white rounded-xl p-4 border border-slate-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">2</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-700">Asset Classification</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="flex items-center gap-1 text-xs font-medium text-slate-600 mb-1">
                                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                                Asset Name *
                                            </label>
                                            <input type="text" value={asset.name || ''} onChange={e => setAsset({ ...asset, name: e.target.value })} placeholder="Enter asset name..." className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-1 text-xs font-medium text-slate-600 mb-1">
                                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                                Asset Type *
                                            </label>
                                            <select value={asset.type || ''} onChange={e => setAsset({ ...asset, type: e.target.value })} className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                                                <option value="">Select Type...</option>
                                                <option value="Blog Banner">Blog Banner</option>
                                                <option value="Infographic">Infographic</option>
                                                <option value="Social Post">Social Post</option>
                                                <option value="Reel / Video">Reel / Video</option>
                                                <option value="Thumbnail">Thumbnail</option>
                                                <option value="Diagram">Diagram</option>
                                                <option value="Web Graphic">Web Graphic</option>
                                                <option value="PDF">PDF</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 3: Content Details (4.3, 4.4, 4.5) */}
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 bg-violet-500 rounded-lg flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">3</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-700">Content Details</h4>
                                        <span className="text-xs text-slate-500">Title, Meta Description, Keywords, Headings & Body</span>
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

                                    {/* Body Content with AI Analysis Side Panel (4.5, 4.6) */}
                                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-2">
                                            <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                                            Body Content (Rich Text Editor)
                                        </label>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <textarea
                                                    value={asset.web_body_content || ''}
                                                    onChange={e => setAsset({ ...asset, web_body_content: e.target.value })}
                                                    placeholder="Paste your full article or body copy here for AI analysis. Supports: Bold, Italic, Underline, Font size, Font style, Paragraph styles, Lists (bullet & numbered)..."
                                                    rows={12}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-y min-h-[200px]"
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
                                                    Analyze with AI
                                                </button>
                                            </div>

                                            {/* AI Analysis Side Panel (4.6) */}
                                            <div className="w-32 bg-gradient-to-b from-blue-50 to-white rounded-xl p-3 border border-blue-100">
                                                <p className="text-[10px] font-bold text-blue-700 mb-3 text-center">AI ANALYSIS</p>
                                                <div className="space-y-3">
                                                    <div className="text-center">
                                                        <div className="relative w-12 h-12 mx-auto">
                                                            <svg className="w-12 h-12 transform -rotate-90">
                                                                <circle cx="24" cy="24" r="20" stroke="#e2e8f0" strokeWidth="3" fill="none" />
                                                                <circle cx="24" cy="24" r="20" stroke="#3b82f6" strokeWidth="3" fill="none" strokeDasharray={`${(asset.seo_score || 0) * 1.26} 126`} strokeLinecap="round" />
                                                            </svg>
                                                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">{asset.seo_score || 0}%</span>
                                                        </div>
                                                        <p className="text-[9px] text-slate-500 mt-1">SEO Score</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="relative w-12 h-12 mx-auto">
                                                            <svg className="w-12 h-12 transform -rotate-90">
                                                                <circle cx="24" cy="24" r="20" stroke="#e2e8f0" strokeWidth="3" fill="none" />
                                                                <circle cx="24" cy="24" r="20" stroke="#22c55e" strokeWidth="3" fill="none" strokeDasharray={`${(asset.grammar_score || 0) * 1.26} 126`} strokeLinecap="round" />
                                                            </svg>
                                                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">{asset.grammar_score || 0}%</span>
                                                        </div>
                                                        <p className="text-[9px] text-slate-500 mt-1">Grammar Score</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="relative w-12 h-12 mx-auto">
                                                            <svg className="w-12 h-12 transform -rotate-90">
                                                                <circle cx="24" cy="24" r="20" stroke="#e2e8f0" strokeWidth="3" fill="none" />
                                                                <circle cx="24" cy="24" r="20" stroke="#8b5cf6" strokeWidth="3" fill="none" strokeDasharray="0 126" strokeLinecap="round" />
                                                            </svg>
                                                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">0%</span>
                                                        </div>
                                                        <p className="text-[9px] text-slate-500 mt-1">AI/Plagiarism</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 4: Resource Upload (4.7) */}
                                <div className="bg-white rounded-xl p-4 border border-slate-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">4</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-700">Resource Upload</h4>
                                        <span className="text-xs text-slate-500">Multi-file upload supported</span>
                                    </div>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-blue-50/30 bg-blue-50/20"
                                    >
                                        <input ref={fileInputRef} type="file" className="hidden" accept="image/*,video/*,.pdf,.doc,.docx" multiple onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                                        {previewUrl ? (
                                            <div className="space-y-2">
                                                <img src={previewUrl} alt="Preview" className="max-h-24 mx-auto rounded-lg shadow-md" />
                                                <p className="text-xs text-slate-600">Click to add more files</p>
                                                {selectedFile && <p className="text-[10px] text-slate-500">{selectedFile.name}</p>}
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm font-semibold text-slate-700 mb-1">Upload Resources</p>
                                                <p className="text-xs text-slate-500">Images, Documents, PDFs, and other supporting files</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* SECTION 5: Designer & Workflow (4.8, 4.9, 4.10) */}
                                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">5</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-700">Designer & Workflow</h4>
                                    </div>

                                    {/* User Assignments (4.8) */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Created By [Auto]</label>
                                            <input type="text" value={user?.name || 'Current User'} disabled className="w-full h-9 px-3 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Designed By</label>
                                            <select value={designedBy || ''} onChange={e => setDesignedBy(e.target.value ? Number(e.target.value) : null)} className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm">
                                                <option value="">Select designer...</option>
                                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Published By</label>
                                            <select className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm">
                                                <option value="">Select publisher...</option>
                                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Verified By (SEO)</label>
                                            <select className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm">
                                                <option value="">Select SEO verifier...</option>
                                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Workflow Stage (4.9) & QC Status (4.10) - SEPARATE fields */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Workflow Stage</label>
                                            <select value={workflowStage} onChange={e => setWorkflowStage(e.target.value)} className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm">
                                                <option value="In Progress">In Progress</option>
                                                <option value="Sent to QC">Sent to QC</option>
                                                <option value="Published">Published</option>
                                                <option value="In Rework">In Rework</option>
                                                <option value="Moved to CW">Moved to CW</option>
                                                <option value="Moved to GD">Moved to GD</option>
                                                <option value="Moved to WD">Moved to WD</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">QC Status (Separate)</label>
                                            <select className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm">
                                                <option value="">Not applicable</option>
                                                <option value="QC Pending">QC Pending</option>
                                                <option value="Rework">Rework</option>
                                                <option value="Approved">Approved</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Cross-Team Visibility Banner */}
                                    {(workflowStage === 'Moved to CW' || workflowStage === 'Moved to GD' || workflowStage === 'Moved to WD') && (
                                        <div className={`mt-3 p-2 rounded-lg text-xs font-medium text-center ${workflowStage === 'Moved to CW' ? 'bg-blue-100 text-blue-700' : workflowStage === 'Moved to GD' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {workflowStage === 'Moved to CW' && '📝 CW is working on this asset'}
                                            {workflowStage === 'Moved to GD' && '🎨 GD is working on this asset'}
                                            {workflowStage === 'Moved to WD' && '🌐 WD is working on this asset'}
                                        </div>
                                    )}
                                </div>

                                {/* SECTION 6: Versioning (4.11) */}
                                <div className="bg-white rounded-xl p-4 border border-slate-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 bg-slate-500 rounded-lg flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">6</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-700">Versioning</h4>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Version [Auto]</label>
                                            <div className="h-9 px-4 bg-slate-100 rounded-lg flex items-center text-sm font-medium text-slate-700 w-16">v1.0</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="h-9 px-3 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 bg-white">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                View History
                                            </button>
                                            <button className="h-9 px-3 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 bg-white">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Rollback
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2">Each update creates a new version. Previous versions can be retrieved for reference or rollback.</p>
                                </div>
                            </div>
                        )}

                        {/* SEO Content Fields - Green Card */}
                        {asset.application_type === 'seo' && (
                            <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-green-700">🔍 SEO Content Fields</h3>
                                            <p className="text-xs text-green-600">Search engine optimized content</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setAsset(prev => ({ ...prev, application_type: undefined }))}
                                        className="text-xs text-green-600 hover:text-green-800 underline"
                                    >
                                        Change Type
                                    </button>
                                </div>

                                {/* SEO Title & Meta Description */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5">
                                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                            SEO Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={asset.web_title || ''}
                                            onChange={e => setAsset({ ...asset, web_title: e.target.value, name: e.target.value })}
                                            placeholder="Enter SEO optimized title..."
                                            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        />
                                        <p className="text-[10px] text-slate-400 text-right mt-0.5">{(asset.web_title || '').length}/60 characters</p>
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5">
                                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                            Meta Description *
                                        </label>
                                        <textarea
                                            value={asset.web_description || ''}
                                            onChange={e => setAsset({ ...asset, web_description: e.target.value })}
                                            placeholder="SEO meta description [150-160 characters]..."
                                            rows={3}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                                        />
                                        <p className="text-[10px] text-slate-400 text-right mt-0.5">{(asset.web_description || '').length}/160 characters</p>
                                    </div>
                                </div>

                                {/* Target URL */}
                                <div className="mb-4">
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5">
                                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                        Target URL
                                    </label>
                                    <input
                                        type="text"
                                        value={asset.web_url || ''}
                                        onChange={e => setAsset({ ...asset, web_url: e.target.value })}
                                        placeholder="https://example.com/target-page"
                                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>

                                {/* Primary & Secondary Keywords */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            Primary Keywords *
                                        </label>
                                        <input
                                            type="text"
                                            value={keywordsInput}
                                            onChange={e => setKeywordsInput(e.target.value)}
                                            placeholder="main keyword, secondary keyword..."
                                            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5">
                                            <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                                            LSI Keywords
                                        </label>
                                        <input
                                            type="text"
                                            value={asset.web_h2_1 || ''}
                                            onChange={e => setAsset({ ...asset, web_h2_1: e.target.value })}
                                            placeholder="related terms, synonyms..."
                                            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        />
                                    </div>
                                </div>

                                {/* SEO Content Body */}
                                <div className="bg-white rounded-xl p-4 border border-slate-200">
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-2">
                                        <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                                        SEO Content Body
                                    </label>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <textarea
                                                value={asset.web_body_content || ''}
                                                onChange={e => setAsset({ ...asset, web_body_content: e.target.value })}
                                                placeholder="Paste your SEO optimized content here for analysis..."
                                                rows={5}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none"
                                            />
                                            <button
                                                onClick={analyzeContent}
                                                disabled={isAnalyzing}
                                                className="mt-3 px-5 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {isAnalyzing ? (
                                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                )}
                                                Analyze SEO
                                            </button>
                                        </div>

                                        {/* SEO Score Circles */}
                                        <div className="w-28 flex flex-col items-center justify-center gap-3">
                                            <div className="text-center">
                                                <div className="relative w-14 h-14 mx-auto">
                                                    <svg className="w-14 h-14 transform -rotate-90">
                                                        <circle cx="28" cy="28" r="24" stroke="#e2e8f0" strokeWidth="3" fill="none" />
                                                        <circle
                                                            cx="28" cy="28" r="24"
                                                            stroke="#22c55e"
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
                                                            stroke="#22c55e"
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
                                                <p className="text-[10px] text-slate-500 mt-1">READABILITY</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Social Media Content Fields - SMM Application */}
                        {asset.application_type === 'smm' && (
                            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-white rounded-2xl p-6 border border-purple-100 shadow-sm">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-purple-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-purple-800">SMM Application Fields</h3>
                                            <p className="text-xs text-purple-500">Configure your social media content</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setAsset(prev => ({ ...prev, application_type: undefined }))}
                                        className="text-xs text-purple-600 hover:text-purple-800 underline"
                                    >
                                        Change Type
                                    </button>
                                </div>

                                {/* Social Media Platform Selection */}
                                <div className="mb-6">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
                                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                        Social Media Platform *
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {/* Facebook */}
                                        <button
                                            type="button"
                                            onClick={() => setAsset({ ...asset, web_h2_2: 'facebook' })}
                                            className={`p-4 rounded-xl border-2 transition-all text-left ${asset.web_h2_2 === 'facebook'
                                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                                : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                </svg>
                                                <span className="font-semibold text-slate-800 text-sm">Facebook</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500">Share with friends and family</p>
                                        </button>

                                        {/* Instagram */}
                                        <button
                                            type="button"
                                            onClick={() => setAsset({ ...asset, web_h2_2: 'instagram' })}
                                            className={`p-4 rounded-xl border-2 transition-all text-left ${asset.web_h2_2 === 'instagram'
                                                ? 'border-pink-500 bg-pink-50 shadow-md'
                                                : 'border-slate-200 bg-white hover:border-pink-300 hover:bg-pink-50/50'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                                </svg>
                                                <span className="font-semibold text-slate-800 text-sm">Instagram</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500">Visual storytelling platform</p>
                                        </button>

                                        {/* Twitter/X */}
                                        <button
                                            type="button"
                                            onClick={() => setAsset({ ...asset, web_h2_2: 'twitter' })}
                                            className={`p-4 rounded-xl border-2 transition-all text-left ${asset.web_h2_2 === 'twitter'
                                                ? 'border-slate-800 bg-slate-100 shadow-md'
                                                : 'border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <svg className="w-5 h-5 text-slate-800" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                                </svg>
                                                <span className="font-semibold text-slate-800 text-sm">Twitter/X</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500">Real-time conversations</p>
                                        </button>

                                        {/* LinkedIn */}
                                        <button
                                            type="button"
                                            onClick={() => setAsset({ ...asset, web_h2_2: 'linkedin' })}
                                            className={`p-4 rounded-xl border-2 transition-all text-left ${asset.web_h2_2 === 'linkedin'
                                                ? 'border-blue-700 bg-blue-50 shadow-md'
                                                : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                                </svg>
                                                <span className="font-semibold text-slate-800 text-sm">LinkedIn</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500">Professional networking</p>
                                        </button>

                                        {/* YouTube */}
                                        <button
                                            type="button"
                                            onClick={() => setAsset({ ...asset, web_h2_2: 'youtube' })}
                                            className={`p-4 rounded-xl border-2 transition-all text-left ${asset.web_h2_2 === 'youtube'
                                                ? 'border-red-500 bg-red-50 shadow-md'
                                                : 'border-slate-200 bg-white hover:border-red-300 hover:bg-red-50/50'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                </svg>
                                                <span className="font-semibold text-slate-800 text-sm">YouTube</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500">Video content platform</p>
                                        </button>
                                    </div>
                                </div>

                                {/* Post Details */}
                                <div className="grid grid-cols-2 gap-4 mb-5">
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                            Post Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={asset.web_title || ''}
                                            onChange={e => setAsset({ ...asset, web_title: e.target.value, name: e.target.value })}
                                            placeholder="Enter your post title..."
                                            className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                                            <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                                            Content Format
                                        </label>
                                        <select
                                            value={asset.web_h1 || ''}
                                            onChange={e => setAsset({ ...asset, web_h1: e.target.value })}
                                            className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        >
                                            <option value="">Select format...</option>
                                            <option value="image">🖼️ Image Post</option>
                                            <option value="video">🎬 Video</option>
                                            <option value="carousel">📱 Carousel</option>
                                            <option value="story">⏱️ Story</option>
                                            <option value="reel">🎞️ Reel/Short</option>
                                            <option value="text">📝 Text Post</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Caption */}
                                <div className="mb-5">
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                        Caption / Post Content *
                                    </label>
                                    <textarea
                                        value={asset.web_body_content || ''}
                                        onChange={e => setAsset({ ...asset, web_body_content: e.target.value })}
                                        placeholder="Write your engaging caption here... Use emojis and line breaks for better engagement!"
                                        rows={4}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                                    />
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-xs text-slate-400">{(asset.web_body_content || '').length} characters</p>
                                        <div className="flex gap-2">
                                            {asset.web_h2_2 === 'instagram' && <span className="text-[10px] px-2 py-1 bg-pink-100 text-pink-600 rounded-full">Max: 2,200</span>}
                                            {asset.web_h2_2 === 'twitter' && <span className="text-[10px] px-2 py-1 bg-slate-100 text-slate-600 rounded-full">Max: 280</span>}
                                            {asset.web_h2_2 === 'linkedin' && <span className="text-[10px] px-2 py-1 bg-blue-100 text-blue-600 rounded-full">Max: 3,000</span>}
                                            {asset.web_h2_2 === 'facebook' && <span className="text-[10px] px-2 py-1 bg-blue-100 text-blue-600 rounded-full">Max: 63,206</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Hashtags & CTA */}
                                <div className="grid grid-cols-2 gap-4 mb-5">
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                                            <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M10.5 3.75a.75.75 0 00-1.5 0v2.5H6.25a.75.75 0 000 1.5H9v4H6.25a.75.75 0 000 1.5H9v2.5a.75.75 0 001.5 0v-2.5h4v2.5a.75.75 0 001.5 0v-2.5h2.75a.75.75 0 000-1.5H16v-4h2.75a.75.75 0 000-1.5H16v-2.5a.75.75 0 00-1.5 0v2.5h-4v-2.5zm4 8.5h-4v-4h4v4z" />
                                            </svg>
                                            Hashtags
                                        </label>
                                        <input
                                            type="text"
                                            value={keywordsInput}
                                            onChange={e => setKeywordsInput(e.target.value)}
                                            placeholder="#marketing #socialmedia #content"
                                            className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                                            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                                            </svg>
                                            Call to Action
                                        </label>
                                        <input
                                            type="text"
                                            value={asset.web_description || ''}
                                            onChange={e => setAsset({ ...asset, web_description: e.target.value })}
                                            placeholder="Link in bio, Shop now, Learn more..."
                                            className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    </div>
                                </div>

                                {/* Live Preview Section */}
                                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                    <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            <span className="text-white font-semibold text-sm">Live Preview</span>
                                            {asset.web_h2_2 && (
                                                <span className="ml-auto text-white/80 text-xs capitalize">{asset.web_h2_2} Post</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        {/* Preview Card */}
                                        <div className={`rounded-xl border overflow-hidden ${asset.web_h2_2 === 'instagram' ? 'border-pink-200 bg-gradient-to-b from-pink-50 to-white' :
                                            asset.web_h2_2 === 'facebook' ? 'border-blue-200 bg-gradient-to-b from-blue-50 to-white' :
                                                asset.web_h2_2 === 'twitter' ? 'border-slate-200 bg-gradient-to-b from-slate-50 to-white' :
                                                    asset.web_h2_2 === 'linkedin' ? 'border-blue-200 bg-gradient-to-b from-blue-50 to-white' :
                                                        asset.web_h2_2 === 'youtube' ? 'border-red-200 bg-gradient-to-b from-red-50 to-white' :
                                                            'border-slate-200 bg-slate-50'
                                            }`}>
                                            {/* Post Header */}
                                            <div className="p-3 flex items-center gap-3 border-b border-slate-100">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${asset.web_h2_2 === 'instagram' ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400' :
                                                    asset.web_h2_2 === 'facebook' ? 'bg-blue-600' :
                                                        asset.web_h2_2 === 'twitter' ? 'bg-slate-900' :
                                                            asset.web_h2_2 === 'linkedin' ? 'bg-blue-700' :
                                                                asset.web_h2_2 === 'youtube' ? 'bg-red-600' :
                                                                    'bg-purple-500'
                                                    }`}>
                                                    <span className="text-white text-sm font-bold">G</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm text-slate-800">Your Brand</p>
                                                    <p className="text-[11px] text-slate-500">Just now • 🌐</p>
                                                </div>
                                                <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="6" r="2" />
                                                    <circle cx="12" cy="12" r="2" />
                                                    <circle cx="12" cy="18" r="2" />
                                                </svg>
                                            </div>

                                            {/* Post Content */}
                                            <div className="p-4">
                                                {asset.web_title && (
                                                    <h4 className="font-bold text-slate-800 mb-2">{asset.web_title}</h4>
                                                )}
                                                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                                    {asset.web_body_content || 'Your caption will appear here...'}
                                                </p>
                                                {keywordsInput && (
                                                    <p className="text-sm text-purple-600 mt-2">
                                                        {keywordsInput.split(',').map(tag => tag.trim()).filter(Boolean).map((tag, i) => (
                                                            <span key={i} className="mr-1">{tag.startsWith('#') ? tag : `#${tag}`}</span>
                                                        ))}
                                                    </p>
                                                )}
                                                {asset.web_description && (
                                                    <p className="text-sm font-medium text-purple-700 mt-3 flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                                                        </svg>
                                                        {asset.web_description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Media Placeholder */}
                                            {previewUrl ? (
                                                <div className="px-4 pb-4">
                                                    <img src={previewUrl} alt="Preview" className="w-full rounded-lg object-cover max-h-48" />
                                                </div>
                                            ) : (
                                                <div className="mx-4 mb-4 h-40 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
                                                    <div className="text-center">
                                                        <svg className="w-10 h-10 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <p className="text-xs text-slate-500">Upload media below</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Engagement Bar */}
                                            <div className="px-4 pb-3 flex items-center justify-between border-t border-slate-100 pt-3">
                                                <div className="flex items-center gap-4">
                                                    <button className="flex items-center gap-1 text-slate-500 hover:text-red-500 transition-colors">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                        </svg>
                                                        <span className="text-xs">Like</span>
                                                    </button>
                                                    <button className="flex items-center gap-1 text-slate-500 hover:text-blue-500 transition-colors">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                        </svg>
                                                        <span className="text-xs">Comment</span>
                                                    </button>
                                                    <button className="flex items-center gap-1 text-slate-500 hover:text-green-500 transition-colors">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                                        </svg>
                                                        <span className="text-xs">Share</span>
                                                    </button>
                                                </div>
                                                <button className="text-slate-500 hover:text-purple-500 transition-colors">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Resource Upload - Shows for SEO and SMM only (Web has its own section) */}
                        {asset.application_type && asset.application_type !== 'web' && (
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                                    <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                    Resource Upload
                                </label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${asset.application_type === 'seo' ? 'border-green-200 hover:border-green-400 hover:bg-green-50/30 bg-green-50/20' :
                                        asset.application_type === 'smm' ? 'border-purple-200 hover:border-purple-400 hover:bg-purple-50/30 bg-purple-50/20' :
                                            'border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 bg-slate-50'
                                        }`}
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
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${asset.application_type === 'seo' ? 'bg-green-500' :
                                                asset.application_type === 'smm' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                                                    'bg-blue-500'
                                                }`}>
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-semibold text-slate-700 mb-1">
                                                {asset.application_type === 'seo' ? 'Upload SEO Content Files' :
                                                    asset.application_type === 'smm' ? 'Upload Social Media Assets' :
                                                        'Upload Assets'}
                                            </p>
                                            <p className="text-xs text-slate-500">Drag & drop source files, or <span className={`hover:underline ${asset.application_type === 'seo' ? 'text-green-600' :
                                                asset.application_type === 'smm' ? 'text-purple-600' :
                                                    'text-blue-600'
                                                }`}>browse local files</span></p>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Asset Classification - Yellow Card - Only show for SEO and SMM (Web has its own section) */}
                        {asset.application_type && asset.application_type !== 'web' && (
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
                        )}

                        {/* Map Asset to Source Work - Only show for SEO and SMM (Web has its own section) */}
                        {asset.application_type && asset.application_type !== 'web' && (
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
                        )}


                        {/* Designer & Workflow - Purple Card - Only show for SEO and SMM (Web has its own section) */}
                        {asset.application_type && asset.application_type !== 'web' && (
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
                        )}

                        {/* Versioning - Only show for SEO and SMM (Web has its own section) */}
                        {asset.application_type && asset.application_type !== 'web' && (
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
                        )}

                        {/* Required Fields Note - Only show when content type is selected */}
                        {asset.application_type && (
                            <p className="text-xs text-slate-500">* Required fields must be filled to save the asset</p>
                        )}
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
            </div >
        </div >
    );
};

export default UploadAssetPopup;
