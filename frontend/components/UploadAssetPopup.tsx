import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import type { AssetLibraryItem, Service, SubServiceItem, AssetCategoryMasterItem, AssetTypeMasterItem, Task, Campaign, Project, ContentRepositoryItem, User, Keyword, BacklinkSource } from '../types';

// Domain Details Popup for SEO Step 7
interface DomainDetail {
    id: number;
    domain_name: string;
    url_posted: string;
    seo_self_qc_status: 'Pass' | 'Fail' | 'Waiting' | '';
    qa_status: 'Approved' | 'Rejected' | 'Pending' | '';
}

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

    // Web Keywords from Keyword Master
    const [webSelectedKeywords, setWebSelectedKeywords] = useState<string[]>([]);

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
    const { data: existingAssets = [] } = useData<AssetLibraryItem>('assetLibrary');
    const { create: createAsset, update: updateAsset } = useData<AssetLibraryItem>('assetLibrary');

    // SEO-specific data hooks
    const { data: keywordsMaster = [] } = useData<Keyword>('keywords');
    const { data: backlinksMaster = [] } = useData<BacklinkSource>('backlinks');

    // State for SEO Asset ID selection
    const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
    const [isAssetIdLocked, setIsAssetIdLocked] = useState(false);

    // SEO Step 4: Metadata fields
    const [seoTitle, setSeoTitle] = useState('');
    const [seoMetaTitle, setSeoMetaTitle] = useState('');
    const [seoDescription, setSeoDescription] = useState('');
    const [seoServiceUrl, setSeoServiceUrl] = useState('');
    const [seoBlogUrl, setSeoBlogUrl] = useState('');
    const [seoAnchorText, setSeoAnchorText] = useState('');

    // SEO Step 5: Keywords
    const [seoPrimaryKeyword, setSeoPrimaryKeyword] = useState<string>('');
    const [seoLsiKeywords, setSeoLsiKeywords] = useState<string[]>([]);

    // SEO Step 6: Domain Type & Domains
    const [seoDomainType, setSeoDomainType] = useState('');
    const [seoAddedDomains, setSeoAddedDomains] = useState<DomainDetail[]>([]);

    // SEO Step 7: Domain Details Popup
    const [isDomainPopupOpen, setIsDomainPopupOpen] = useState(false);
    const [editingDomainIndex, setEditingDomainIndex] = useState<number | null>(null);
    const [domainPopupData, setDomainPopupData] = useState<DomainDetail>({
        id: 0,
        domain_name: '',
        url_posted: '',
        seo_self_qc_status: '',
        qa_status: ''
    });

    // SEO Step 10: Team assignment
    const [seoAssignedTeamMembers, setSeoAssignedTeamMembers] = useState<number[]>([]);
    const [seoVerifiedBy, setSeoVerifiedBy] = useState<number | null>(null);

    // SEO Step 11: Versioning
    const [seoVersion, setSeoVersion] = useState('1.0');

    // SMM-specific state variables for 6-step workflow
    const [smmSelectedAssetId, setSmmSelectedAssetId] = useState<number | null>(null);
    const [isSmmAssetIdLocked, setIsSmmAssetIdLocked] = useState(false);
    const [smmLinkedTaskId, setSmmLinkedTaskId] = useState<number | null>(null);
    const [smmLinkedCampaignId, setSmmLinkedCampaignId] = useState<number | null>(null);
    const [smmLinkedProjectId, setSmmLinkedProjectId] = useState<number | null>(null);
    const [smmLinkedServiceId, setSmmLinkedServiceId] = useState<number | null>(null);
    const [smmLinkedSubServiceId, setSmmLinkedSubServiceId] = useState<number | null>(null);
    const [smmLinkedRepositoryItemId, setSmmLinkedRepositoryItemId] = useState<number | null>(null);
    const [smmPlatform, setSmmPlatform] = useState<string>('');
    const [smmPostTitle, setSmmPostTitle] = useState('');
    const [smmContentFormat, setSmmContentFormat] = useState('image');
    const [smmCaption, setSmmCaption] = useState('');
    const [smmHashtags, setSmmHashtags] = useState('');
    const [smmCta, setSmmCta] = useState('');
    const [smmDesignedBy, setSmmDesignedBy] = useState<number | null>(null);
    const [smmVerifiedBy, setSmmVerifiedBy] = useState<number | null>(null);
    const [smmVersion, setSmmVersion] = useState('1.0');
    const [smmResourceFiles, setSmmResourceFiles] = useState<File[]>([]);
    const [smmPreviewUrls, setSmmPreviewUrls] = useState<string[]>([]);

    // SMM filtered sub-services
    const smmFilteredSubServices = useMemo(() =>
        smmLinkedServiceId ? subServices.filter(s => Number(s.parent_service_id) === Number(smmLinkedServiceId)) : [],
        [subServices, smmLinkedServiceId]
    );

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
            if (initialData.keywords) {
                setKeywordsInput(initialData.keywords.join(', '));
                setWebSelectedKeywords(initialData.keywords);
            }
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
            setWebSelectedKeywords([]);
            setSelectedFile(null);
            setPreviewUrl('');
            setSelectedAssetId(null);
            setIsAssetIdLocked(false);
            // Reset SMM state
            setSmmSelectedAssetId(null);
            setIsSmmAssetIdLocked(false);
            setSmmLinkedTaskId(null);
            setSmmLinkedCampaignId(null);
            setSmmLinkedProjectId(null);
            setSmmLinkedServiceId(null);
            setSmmLinkedSubServiceId(null);
            setSmmLinkedRepositoryItemId(null);
            setSmmPlatform('');
            setSmmPostTitle('');
            setSmmContentFormat('image');
            setSmmCaption('');
            setSmmHashtags('');
            setSmmCta('');
            setSmmDesignedBy(null);
            setSmmVerifiedBy(null);
            setSmmVersion('1.0');
            setSmmResourceFiles([]);
            setSmmPreviewUrls([]);
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

    // Handle SMM multi-file selection
    const handleSmmFileSelect = useCallback((files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files);
        setSmmResourceFiles(prev => [...prev, ...newFiles]);

        // Create previews for images
        newFiles.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setSmmPreviewUrls(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            }
        });
    }, []);

    // Remove SMM file
    const removeSmmFile = useCallback((index: number) => {
        setSmmResourceFiles(prev => prev.filter((_, i) => i !== index));
        setSmmPreviewUrls(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleSave = useCallback(async (submitForQC = false) => {
        if (!asset.name?.trim() && !asset.web_title?.trim()) {
            alert('Please enter asset title');
            return;
        }

        setIsSaving(true);
        try {
            // Use webSelectedKeywords for web, or parse keywordsInput for backward compatibility
            const keywords = asset.application_type === 'web' ? webSelectedKeywords : keywordsInput.split(',').map(k => k.trim()).filter(Boolean);
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

                                {/* SECTION 2: Asset Classification (4.2) - From Master Database */}
                                <div className="bg-white rounded-xl p-4 border border-slate-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">2</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-700">Asset Classification</h4>
                                        <span className="text-[10px] text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">From Master Database</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="flex items-center gap-1 text-xs font-medium text-slate-600 mb-1">
                                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                                Asset Category * <span className="text-[10px] text-slate-400">(Master)</span>
                                            </label>
                                            <select value={asset.asset_category || ''} onChange={e => setAsset({ ...asset, asset_category: e.target.value })} className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                                                <option value="">Select Category...</option>
                                                {assetCategories.filter(c => !c.status || c.status === 'active').map(cat => (
                                                    <option key={cat.id} value={cat.category_name || cat.name}>{cat.category_name || cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-1 text-xs font-medium text-slate-600 mb-1">
                                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                                Asset Type * <span className="text-[10px] text-slate-400">(Master)</span>
                                            </label>
                                            <select value={asset.type || ''} onChange={e => setAsset({ ...asset, type: e.target.value })} className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                                                <option value="">Select Type...</option>
                                                {assetTypes.filter(t => !t.status || t.status === 'active').map(type => (
                                                    <option key={type.id} value={type.asset_type_name || type.name}>{type.asset_type_name || type.name}</option>
                                                ))}
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

                                    {/* Keywords - From Keyword Master */}
                                    <div className="mb-4">
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5">
                                            <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                                                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                                            </svg>
                                            Keywords
                                            <span className="text-[10px] text-blue-600 bg-blue-100 px-2 py-0.5 rounded ml-1">From Keyword Master</span>
                                        </label>
                                        <select
                                            onChange={e => {
                                                if (e.target.value && !webSelectedKeywords.includes(e.target.value)) {
                                                    setWebSelectedKeywords([...webSelectedKeywords, e.target.value]);
                                                }
                                                e.target.value = '';
                                            }}
                                            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select keyword from master...</option>
                                            {keywordsMaster.filter(k => (k.status === 'active' || !k.status) && !webSelectedKeywords.includes(k.keyword)).map(kw => (
                                                <option key={kw.id} value={kw.keyword}>{kw.keyword} {kw.search_volume ? `(Vol: ${kw.search_volume})` : ''}</option>
                                            ))}
                                        </select>
                                        {webSelectedKeywords.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {webSelectedKeywords.map((kw, idx) => (
                                                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                        {kw}
                                                        <button onClick={() => setWebSelectedKeywords(webSelectedKeywords.filter((_, i) => i !== idx))} className="hover:text-blue-900 ml-0.5">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <p className="text-[10px] text-slate-400 mt-1">Select keywords from Keyword Master table</p>
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

                        {/* SEO Content Fields - Complete 12-Step Workflow */}
                        {asset.application_type === 'seo' && (
                            <div className="space-y-4">
                                {/* Header */}
                                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-green-700">🔍 Upload Assets → SEO</h3>
                                                <p className="text-xs text-green-600">Complete 12-step workflow - Follow sections in order</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setAsset(prev => ({ ...prev, application_type: undefined }))} className="text-xs text-green-600 hover:text-green-800 underline">Change Type</button>
                                    </div>
                                </div>

                                {/* STEP 1: Asset ID Selection - MANDATORY */}
                                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">1</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-indigo-700">Asset ID Selection</h4>
                                        <span className="text-xs text-red-500 font-medium">* Required</span>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            Asset ID <span className="text-red-500">*</span>
                                            <span className="text-slate-400 ml-1">(Select from existing assets)</span>
                                        </label>
                                        <select
                                            value={selectedAssetId || ''}
                                            onChange={e => {
                                                const id = e.target.value ? Number(e.target.value) : null;
                                                setSelectedAssetId(id);
                                                if (id) {
                                                    setIsAssetIdLocked(true);
                                                    // Pre-fill data from selected asset
                                                    const selectedAsset = existingAssets.find(a => a.id === id);
                                                    if (selectedAsset) {
                                                        setAsset(prev => ({
                                                            ...prev,
                                                            name: selectedAsset.name || '',
                                                            type: selectedAsset.type || '',
                                                            asset_category: selectedAsset.asset_category || '',
                                                            content_type: selectedAsset.content_type || '',
                                                        }));
                                                        setLinkedTaskId(selectedAsset.linked_task_id || null);
                                                        setLinkedCampaignId(selectedAsset.linked_campaign_id || null);
                                                        setLinkedProjectId(selectedAsset.linked_project_id || null);
                                                        setLinkedServiceId(selectedAsset.linked_service_id || null);
                                                        setLinkedSubServiceId(selectedAsset.linked_sub_service_id || null);
                                                        setLinkedRepositoryItemId(selectedAsset.linked_repository_item_id || null);
                                                    }
                                                }
                                            }}
                                            disabled={isAssetIdLocked}
                                            className={`w-full h-10 px-3 border rounded-lg text-sm ${isAssetIdLocked ? 'bg-slate-100 border-slate-300 text-slate-600 cursor-not-allowed' : 'bg-white border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'}`}
                                        >
                                            <option value="">-- Select Asset ID --</option>
                                            {existingAssets.map(a => (
                                                <option key={a.id} value={a.id}>
                                                    {String(a.id).padStart(4, '0')} - {a.name || 'Untitled Asset'}
                                                </option>
                                            ))}
                                        </select>
                                        {isAssetIdLocked && (
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-xs text-green-600 flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Asset ID locked. All sections are now enabled.
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        setIsAssetIdLocked(false);
                                                        setSelectedAssetId(null);
                                                    }}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                                                >
                                                    Change Selection
                                                </button>
                                            </div>
                                        )}
                                        {!selectedAssetId && (
                                            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                Please select an Asset ID to enable all sections below
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* STEP 2: Map Assets to Source Work */}
                                <div className={`bg-blue-50 rounded-xl p-4 border border-blue-100 ${!selectedAssetId ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${selectedAssetId ? 'bg-blue-500' : 'bg-slate-400'}`}>
                                            <span className="text-white text-xs font-bold">2</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-blue-700">Map Assets to Source Work</h4>
                                        {!selectedAssetId && <span className="text-xs text-slate-400">(Select Asset ID first)</span>}
                                    </div>
                                    <p className="text-xs text-blue-600 mb-3">Link the selected Asset ID to its originating work/source</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Linked Task</label>
                                            <select value={linkedTaskId || ''} onChange={e => setLinkedTaskId(e.target.value ? Number(e.target.value) : null)} disabled={!selectedAssetId} className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100 disabled:cursor-not-allowed">
                                                <option value="">Select Task</option>
                                                {tasks.map(t => <option key={t.id} value={t.id}>{t.title || t.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Linked Campaign</label>
                                            <select value={linkedCampaignId || ''} onChange={e => setLinkedCampaignId(e.target.value ? Number(e.target.value) : null)} disabled={!selectedAssetId} className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100 disabled:cursor-not-allowed">
                                                <option value="">Select Campaign</option>
                                                {campaigns.map(c => <option key={c.id} value={c.id}>{c.name || c.campaign_name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Linked Project</label>
                                            <select value={linkedProjectId || ''} onChange={e => setLinkedProjectId(e.target.value ? Number(e.target.value) : null)} disabled={!selectedAssetId} className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100 disabled:cursor-not-allowed">
                                                <option value="">Select Project</option>
                                                {projects.map(p => <option key={p.id} value={p.id}>{p.name || p.project_name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Linked Service</label>
                                            <select value={linkedServiceId || ''} onChange={e => { setLinkedServiceId(e.target.value ? Number(e.target.value) : null); setLinkedSubServiceId(null); }} disabled={!selectedAssetId} className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100 disabled:cursor-not-allowed">
                                                <option value="">Select Service</option>
                                                {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Linked Sub-Service</label>
                                            <select value={linkedSubServiceId || ''} onChange={e => setLinkedSubServiceId(e.target.value ? Number(e.target.value) : null)} disabled={!selectedAssetId || !linkedServiceId} className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100 disabled:cursor-not-allowed">
                                                <option value="">{linkedServiceId ? 'Select Sub-Service' : 'Select Service first'}</option>
                                                {filteredSubServices.map(ss => <option key={ss.id} value={ss.id}>{ss.sub_service_name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Linked Repository Item</label>
                                            <select value={linkedRepositoryItemId || ''} onChange={e => setLinkedRepositoryItemId(e.target.value ? Number(e.target.value) : null)} disabled={!selectedAssetId} className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100 disabled:cursor-not-allowed">
                                                <option value="">Select Repository</option>
                                                {repositoryItems.map(r => <option key={r.id} value={r.id}>{r.title || r.content_title_clean}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* STEP 3: Asset Classification - From Master Database */}
                                <div className={`bg-amber-50 rounded-xl p-4 border border-amber-100 ${!selectedAssetId ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${selectedAssetId ? 'bg-amber-500' : 'bg-slate-400'}`}>
                                            <span className="text-white text-xs font-bold">3</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-amber-700">Asset Classification</h4>
                                        <span className="text-[10px] text-amber-600 bg-amber-100 px-2 py-0.5 rounded">From Master Database</span>
                                        {!selectedAssetId && <span className="text-xs text-slate-400 ml-auto">(Select Asset ID first)</span>}
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Asset Type * <span className="text-[10px] text-slate-400">(Master)</span></label>
                                            <select value={asset.type || ''} onChange={e => setAsset({ ...asset, type: e.target.value })} disabled={!selectedAssetId} className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100 disabled:cursor-not-allowed">
                                                <option value="">Select type...</option>
                                                {assetTypes.filter(t => !t.status || t.status === 'active').map(type => <option key={type.id} value={type.asset_type_name || type.name}>{type.asset_type_name || type.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Sector * <span className="text-[10px] text-slate-400">(Master)</span></label>
                                            <select value={asset.asset_category || ''} onChange={e => setAsset({ ...asset, asset_category: e.target.value })} disabled={!selectedAssetId} className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100 disabled:cursor-not-allowed">
                                                <option value="">Select sector...</option>
                                                {assetCategories.filter(c => !c.status || c.status === 'active').map(cat => <option key={cat.id} value={cat.category_name || cat.name}>{cat.category_name || cat.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Industry * <span className="text-[10px] text-slate-400">(Master)</span></label>
                                            <select value={asset.content_type || ''} onChange={e => setAsset({ ...asset, content_type: e.target.value })} disabled={!selectedAssetId} className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100 disabled:cursor-not-allowed">
                                                <option value="">Select industry...</option>
                                                {contentTypes.map((ct: any) => <option key={ct.id} value={ct.name}>{ct.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* STEP 4: SEO Metadata Fields & Anchor Text */}
                                <div className={`bg-green-50 rounded-xl p-4 border border-green-100 ${!selectedAssetId ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${selectedAssetId ? 'bg-green-500' : 'bg-slate-400'}`}>
                                            <span className="text-white text-xs font-bold">4</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-green-700">SEO Metadata Fields & Anchor Text</h4>
                                        {!selectedAssetId && <span className="text-xs text-slate-400">(Select Asset ID first)</span>}
                                    </div>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="flex items-center gap-1 text-xs font-medium text-slate-700 mb-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>Title *</label>
                                                <input type="text" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} disabled={!selectedAssetId} placeholder="Enter title..." className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100" />
                                            </div>
                                            <div>
                                                <label className="flex items-center gap-1 text-xs font-medium text-slate-700 mb-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>Meta Title *</label>
                                                <input type="text" value={seoMetaTitle} onChange={e => setSeoMetaTitle(e.target.value)} disabled={!selectedAssetId} placeholder="Enter meta title..." className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-1 text-xs font-medium text-slate-700 mb-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>Description *</label>
                                            <textarea value={seoDescription} onChange={e => setSeoDescription(e.target.value)} disabled={!selectedAssetId} rows={3} placeholder="Enter SEO description..." className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm resize-none disabled:bg-slate-100" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 mb-1">Service URL <span className="text-slate-400">(Optional)</span></label>
                                                <input type="url" value={seoServiceUrl} onChange={e => setSeoServiceUrl(e.target.value)} disabled={!selectedAssetId} placeholder="https://example.com/service" className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 mb-1">Blog URL <span className="text-slate-400">(Optional)</span></label>
                                                <input type="url" value={seoBlogUrl} onChange={e => setSeoBlogUrl(e.target.value)} disabled={!selectedAssetId} placeholder="https://example.com/blog" className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-1 text-xs font-medium text-slate-700 mb-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>Anchor Text *</label>
                                            <input type="text" value={seoAnchorText} onChange={e => setSeoAnchorText(e.target.value)} disabled={!selectedAssetId} placeholder="Enter anchor text for links..." className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100" />
                                        </div>
                                    </div>
                                </div>

                                {/* STEP 5: Keywords - From Keyword Master */}
                                <div className={`bg-violet-50 rounded-xl p-4 border border-violet-100 ${!selectedAssetId ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${selectedAssetId ? 'bg-violet-500' : 'bg-slate-400'}`}>
                                            <span className="text-white text-xs font-bold">5</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-violet-700">Keywords</h4>
                                        <span className="text-[10px] text-violet-600 bg-violet-100 px-2 py-0.5 rounded">From Keyword Master</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="flex items-center gap-1 text-xs font-medium text-slate-700 mb-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>Primary Keyword *</label>
                                            <select value={seoPrimaryKeyword} onChange={e => setSeoPrimaryKeyword(e.target.value)} disabled={!selectedAssetId} className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100">
                                                <option value="">Select from Keyword Master...</option>
                                                {keywordsMaster.filter(k => k.status === 'active' || !k.status).map(kw => (<option key={kw.id} value={kw.keyword}>{kw.keyword} {kw.search_volume ? `(Vol: ${kw.search_volume})` : ''}</option>))}
                                            </select>
                                            <p className="text-[10px] text-slate-400 mt-1">No manual entry - select from master only</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">LSI Keywords <span className="text-slate-400">(Optional)</span></label>
                                            <select onChange={e => { if (e.target.value && !seoLsiKeywords.includes(e.target.value)) { setSeoLsiKeywords([...seoLsiKeywords, e.target.value]); } e.target.value = ''; }} disabled={!selectedAssetId} className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100">
                                                <option value="">Add LSI keyword...</option>
                                                {keywordsMaster.filter(k => (k.status === 'active' || !k.status) && !seoLsiKeywords.includes(k.keyword)).map(kw => (<option key={kw.id} value={kw.keyword}>{kw.keyword}</option>))}
                                            </select>
                                            {seoLsiKeywords.length > 0 && (<div className="flex flex-wrap gap-1 mt-2">{seoLsiKeywords.map((kw, idx) => (<span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-700 rounded text-xs">{kw}<button onClick={() => setSeoLsiKeywords(seoLsiKeywords.filter((_, i) => i !== idx))} className="hover:text-violet-900">×</button></span>))}</div>)}
                                        </div>
                                    </div>
                                </div>

                                {/* STEP 6: Domain Type & Domain Addition */}
                                <div className={`bg-blue-50 rounded-xl p-4 border border-blue-100 ${!selectedAssetId ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${selectedAssetId ? 'bg-blue-500' : 'bg-slate-400'}`}>
                                            <span className="text-white text-xs font-bold">6</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-blue-700">Domain Type & Domain Addition</h4>
                                        <span className="text-[10px] text-blue-600 bg-blue-100 px-2 py-0.5 rounded">From Backlink Master</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-700 mb-1">Domain Type</label>
                                                <select value={seoDomainType} onChange={e => setSeoDomainType(e.target.value)} disabled={!selectedAssetId} className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100">
                                                    <option value="">Select domain type...</option>
                                                    <option value="guest_post">Guest Post</option>
                                                    <option value="profile_link">Profile Link</option>
                                                    <option value="directory">Directory</option>
                                                    <option value="forum">Forum</option>
                                                    <option value="web_2.0">Web 2.0</option>
                                                </select>
                                            </div>
                                            <div className="flex items-end">
                                                <button onClick={() => { setDomainPopupData({ id: Date.now(), domain_name: '', url_posted: '', seo_self_qc_status: '', qa_status: '' }); setEditingDomainIndex(null); setIsDomainPopupOpen(true); }} disabled={!selectedAssetId} className="h-9 px-4 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Add Domain
                                                </button>
                                            </div>
                                        </div>
                                        {seoAddedDomains.length > 0 && (<div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">{seoAddedDomains.map((domain, idx) => (<div key={domain.id} className="p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer" onClick={() => { setDomainPopupData(domain); setEditingDomainIndex(idx); setIsDomainPopupOpen(true); }}><div><p className="text-sm font-medium text-slate-700">{domain.domain_name || 'Unnamed'}</p><p className="text-xs text-slate-500">{domain.url_posted || 'No URL'}</p></div><div className="flex items-center gap-2"><span className={`px-2 py-0.5 rounded text-xs font-medium ${domain.qa_status === 'Approved' ? 'bg-green-100 text-green-700' : domain.qa_status === 'Rejected' ? 'bg-red-100 text-red-700' : domain.qa_status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{domain.qa_status || 'Not Set'}</span><button onClick={(e) => { e.stopPropagation(); setSeoAddedDomains(seoAddedDomains.filter((_, i) => i !== idx)); }} className="text-slate-400 hover:text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div></div>))}</div>)}
                                    </div>
                                </div>

                                {/* STEP 7: Domain Details Popup */}
                                {isDomainPopupOpen && (<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"><div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-5"><div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold text-slate-800">Domain Details (Step 7)</h3><button onClick={() => setIsDomainPopupOpen(false)} className="text-slate-400 hover:text-slate-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div><div className="space-y-3"><div><label className="block text-xs font-medium text-slate-600 mb-1">Domain Name <span className="text-[10px] text-slate-400">(From Backlink Master)</span></label><select value={domainPopupData.domain_name} onChange={e => setDomainPopupData({ ...domainPopupData, domain_name: e.target.value })} className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm"><option value="">Select domain...</option>{backlinksMaster.filter(b => b.status === 'active' || b.status === 'trusted').map(bl => (<option key={bl.id} value={bl.domain}>{bl.domain} (DA: {bl.da_score})</option>))}</select></div><div><label className="block text-xs font-medium text-slate-600 mb-1">URL Posted</label><input type="url" value={domainPopupData.url_posted} onChange={e => setDomainPopupData({ ...domainPopupData, url_posted: e.target.value })} placeholder="https://..." className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" /></div><div className="grid grid-cols-2 gap-3"><div><label className="block text-xs font-medium text-slate-600 mb-1">SEO Self QC Status</label><select value={domainPopupData.seo_self_qc_status} onChange={e => setDomainPopupData({ ...domainPopupData, seo_self_qc_status: e.target.value as any })} className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm"><option value="">Select...</option><option value="Pass">Pass</option><option value="Fail">Fail</option><option value="Waiting">Waiting</option></select></div><div><label className="block text-xs font-medium text-slate-600 mb-1">QA Status</label><select value={domainPopupData.qa_status} onChange={e => setDomainPopupData({ ...domainPopupData, qa_status: e.target.value as any })} className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm"><option value="">Select...</option><option value="Approved">Approved (Pass)</option><option value="Rejected">Rejected (Fail)</option><option value="Pending">Pending (Waiting)</option></select></div></div>{domainPopupData.qa_status && (<div className={`p-2 rounded-lg text-xs font-medium text-center ${domainPopupData.qa_status === 'Approved' ? 'bg-green-100 text-green-700' : domainPopupData.qa_status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>Display Status: {domainPopupData.qa_status}</div>)}</div><div className="flex justify-end gap-2 mt-4"><button onClick={() => setIsDomainPopupOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button><button onClick={() => { if (editingDomainIndex !== null) { const updated = [...seoAddedDomains]; updated[editingDomainIndex] = domainPopupData; setSeoAddedDomains(updated); } else { setSeoAddedDomains([...seoAddedDomains, domainPopupData]); } setIsDomainPopupOpen(false); }} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editingDomainIndex !== null ? 'Update' : 'Add'} Domain</button></div></div></div>)}

                                {/* STEP 8: Blog Posting Content Editor - Only if Asset Type = Blog */}
                                {asset.type?.toLowerCase().includes('blog') && (<div className={`bg-orange-50 rounded-xl p-4 border border-orange-100 ${!selectedAssetId ? 'opacity-50 pointer-events-none' : ''}`}><div className="flex items-center gap-2 mb-3"><div className={`w-6 h-6 rounded-lg flex items-center justify-center ${selectedAssetId ? 'bg-orange-500' : 'bg-slate-400'}`}><span className="text-white text-xs font-bold">8</span></div><h4 className="text-sm font-bold text-orange-700">Blog Content Editor</h4><span className="text-[10px] text-orange-600 bg-orange-100 px-2 py-0.5 rounded">Asset Type: Blog</span></div><div className="bg-white rounded-lg border border-slate-200 p-3"><div className="flex gap-1 mb-2 pb-2 border-b border-slate-100"><button className="p-1.5 hover:bg-slate-100 rounded text-slate-600"><strong>B</strong></button><button className="p-1.5 hover:bg-slate-100 rounded text-slate-600"><em>I</em></button><button className="p-1.5 hover:bg-slate-100 rounded text-slate-600"><u>U</u></button><span className="w-px bg-slate-200 mx-1"></span><button className="p-1.5 hover:bg-slate-100 rounded text-slate-600 text-xs">H1</button><button className="p-1.5 hover:bg-slate-100 rounded text-slate-600 text-xs">H2</button></div><textarea value={asset.web_body_content || ''} onChange={e => setAsset({ ...asset, web_body_content: e.target.value })} disabled={!selectedAssetId} rows={8} placeholder="Write your blog content here..." className="w-full px-3 py-2 bg-slate-50 border-0 rounded-lg text-sm resize-y min-h-[150px] focus:ring-0 disabled:bg-slate-100" /></div></div>)}

                                {/* STEP 9: Resource File Upload */}
                                <div className={`bg-white rounded-xl p-4 border border-slate-200 ${!selectedAssetId ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${selectedAssetId ? 'bg-amber-500' : 'bg-slate-400'}`}>
                                            <span className="text-white text-xs font-bold">9</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-700">Resource File Upload</h4>
                                        <span className="text-[10px] text-slate-500">Multi-file supported</span>
                                    </div>
                                    <div onClick={() => selectedAssetId && fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${selectedAssetId ? 'border-green-200 hover:border-green-400 cursor-pointer hover:bg-green-50/30 bg-green-50/20' : 'border-slate-200 bg-slate-50 cursor-not-allowed'}`}>
                                        <input ref={fileInputRef} type="file" className="hidden" accept="image/*,video/*,.pdf,.doc,.docx" multiple onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                                        {previewUrl ? (<div className="space-y-2"><img src={previewUrl} alt="Preview" className="max-h-24 mx-auto rounded-lg shadow-md" /><p className="text-xs text-slate-600">Click to add more files</p>{selectedFile && <p className="text-[10px] text-slate-500">{selectedFile.name}</p>}</div>) : (<><div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2"><svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg></div><p className="text-sm font-semibold text-slate-700 mb-1">Upload Resource Files</p><p className="text-xs text-slate-500">Files linked to Asset ID and Asset Type</p></>)}
                                    </div>
                                </div>

                                {/* STEP 10: Designer & Workflow */}
                                <div className={`bg-purple-50 rounded-xl p-4 border border-purple-100 ${!selectedAssetId ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${selectedAssetId ? 'bg-purple-500' : 'bg-slate-400'}`}>
                                            <span className="text-white text-xs font-bold">10</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-purple-700">Designer & Workflow</h4>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Assign Team Members</label>
                                            <select onChange={e => { if (e.target.value && !seoAssignedTeamMembers.includes(Number(e.target.value))) { setSeoAssignedTeamMembers([...seoAssignedTeamMembers, Number(e.target.value)]); } e.target.value = ''; }} disabled={!selectedAssetId} className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100">
                                                <option value="">Add team member...</option>
                                                {users.filter(u => !seoAssignedTeamMembers.includes(u.id)).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                            </select>
                                            {seoAssignedTeamMembers.length > 0 && (<div className="flex flex-wrap gap-1 mt-2">{seoAssignedTeamMembers.map(id => { const u = users.find(user => user.id === id); return u ? (<span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">{u.name}<button onClick={() => setSeoAssignedTeamMembers(seoAssignedTeamMembers.filter(i => i !== id))} className="hover:text-purple-900">×</button></span>) : null; })}</div>)}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Created By [Auto]</label>
                                            <input type="text" value={user?.name || 'Current User'} disabled className="w-full h-9 px-3 bg-slate-100 border border-slate-200 rounded-lg text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Verified By (SEO)</label>
                                            <select value={seoVerifiedBy || ''} onChange={e => setSeoVerifiedBy(e.target.value ? Number(e.target.value) : null)} disabled={!selectedAssetId} className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100">
                                                <option value="">Select verifier...</option>
                                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* STEP 11: Versioning */}
                                <div className={`bg-white rounded-xl p-4 border border-slate-200 ${!selectedAssetId ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${selectedAssetId ? 'bg-slate-500' : 'bg-slate-400'}`}>
                                            <span className="text-white text-xs font-bold">11</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-700">Versioning</h4>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Version [Auto-Increment]</label>
                                            <div className="h-9 px-4 bg-slate-100 rounded-lg flex items-center text-sm font-medium text-slate-700 w-16">v{seoVersion}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="h-9 px-3 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 bg-white">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                View History
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2">New version created on every re-submit after rejection. Previous versions are read-only.</p>
                                </div>

                                {/* STEP 12: Actions - Save, Submit, Discard (shown in footer) */}
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center bg-slate-600`}>
                                            <span className="text-white text-xs font-bold">12</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-700">Actions</h4>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-3">Use the buttons below to save, submit, or discard your work.</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleSave(false)} disabled={isSaving || !selectedAssetId} className="flex-1 h-10 px-4 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 disabled:opacity-50 flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                            Save (Draft)
                                        </button>
                                        <button onClick={() => handleSave(true)} disabled={isSaving || !selectedAssetId} className="flex-1 h-10 px-4 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            Submit for QC
                                        </button>
                                        <button onClick={onClose} className="h-10 px-4 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            Discard
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Social Media Content Fields - SMM Application - Complete 6-Step Workflow */}
                        {asset.application_type === 'smm' && (
                            <div className="space-y-4">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-white rounded-xl p-4 border border-purple-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-purple-700">📱 Upload Assets → SMM</h3>
                                                <p className="text-xs text-purple-600">Complete 6-step workflow - Follow sections in order</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setAsset(prev => ({ ...prev, application_type: undefined }))} className="text-xs text-purple-600 hover:text-purple-800 underline">Change Type</button>
                                    </div>
                                </div>

                                {/* STEP 1: Asset ID Selection - MANDATORY */}
                                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">1</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-indigo-700">Asset ID Selection</h4>
                                        <span className="text-xs text-red-500 font-medium">* Required</span>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            Asset ID <span className="text-red-500">*</span>
                                            <span className="text-slate-400 ml-1">(Select from existing assets)</span>
                                        </label>
                                        <select
                                            value={smmSelectedAssetId || ''}
                                            onChange={e => {
                                                const id = e.target.value ? Number(e.target.value) : null;
                                                setSmmSelectedAssetId(id);
                                                if (id) {
                                                    setIsSmmAssetIdLocked(true);
                                                    // Pre-fill data from selected asset
                                                    const selectedAsset = existingAssets.find(a => a.id === id);
                                                    if (selectedAsset) {
                                                        setAsset(prev => ({
                                                            ...prev,
                                                            name: selectedAsset.name || '',
                                                            type: selectedAsset.type || '',
                                                            asset_category: selectedAsset.asset_category || '',
                                                        }));
                                                        setSmmLinkedTaskId(selectedAsset.linked_task_id || null);
                                                        setSmmLinkedCampaignId(selectedAsset.linked_campaign_id || null);
                                                        setSmmLinkedProjectId(selectedAsset.linked_project_id || null);
                                                        setSmmLinkedServiceId(selectedAsset.linked_service_id || null);
                                                        setSmmLinkedSubServiceId(selectedAsset.linked_sub_service_id || null);
                                                        setSmmLinkedRepositoryItemId(selectedAsset.linked_repository_item_id || null);
                                                    }
                                                }
                                            }}
                                            disabled={isSmmAssetIdLocked}
                                            className={`w-full h-10 px-3 border rounded-lg text-sm ${isSmmAssetIdLocked ? 'bg-slate-100 border-slate-300 text-slate-600 cursor-not-allowed' : 'bg-white border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'}`}
                                        >
                                            <option value="">-- Select Asset ID --</option>
                                            {existingAssets.map(a => (
                                                <option key={a.id} value={a.id}>
                                                    {String(a.id).padStart(4, '0')} - {a.name || 'Untitled Asset'}
                                                </option>
                                            ))}
                                        </select>
                                        {isSmmAssetIdLocked && (
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-xs text-green-600 flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Asset ID locked. All sections are now enabled.
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        setIsSmmAssetIdLocked(false);
                                                        setSmmSelectedAssetId(null);
                                                    }}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                                                >
                                                    Change Selection
                                                </button>
                                            </div>
                                        )}
                                        {!smmSelectedAssetId && (
                                            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                Please select an Asset ID to enable all sections below
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* STEP 2: Map Assets to Source Work */}
                                <div className={`bg-blue-50 rounded-xl p-4 border border-blue-100 ${!smmSelectedAssetId ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${smmSelectedAssetId ? 'bg-blue-500' : 'bg-slate-400'}`}>
                                            <span className="text-white text-xs font-bold">2</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-blue-700">Map Assets to Source Work</h4>
                                        {!smmSelectedAssetId && <span className="text-xs text-slate-400">(Select Asset ID first)</span>}
                                    </div>
                                    <p className="text-xs text-blue-600 mb-3">Link the selected Asset ID to its originating work/source</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Linked Task</label>
                                            <select value={smmLinkedTaskId || ''} onChange={e => setSmmLinkedTaskId(e.target.value ? Number(e.target.value) : null)} disabled={!smmSelectedAssetId} className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100 disabled:cursor-not-allowed">
                                                <option value="">Select Task</option>
                                                {tasks.map(t => <option key={t.id} value={t.id}>{t.title || t.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Linked Campaign</label>
                                            <select value={smmLinkedCampaignId || ''} onChange={e => setSmmLinkedCampaignId(e.target.value ? Number(e.target.value) : null)} disabled={!smmSelectedAssetId} className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100 disabled:cursor-not-allowed">
                                                <option value="">Select Campaign</option>
                                                {campaigns.map(c => <option key={c.id} value={c.id}>{c.name || c.campaign_name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Linked Project</label>
                                            <select value={smmLinkedProjectId || ''} onChange={e => setSmmLinkedProjectId(e.target.value ? Number(e.target.value) : null)} disabled={!smmSelectedAssetId} className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100 disabled:cursor-not-allowed">
                                                <option value="">Select Project</option>
                                                {projects.map(p => <option key={p.id} value={p.id}>{p.name || p.project_name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Linked Service</label>
                                            <select value={smmLinkedServiceId || ''} onChange={e => { setSmmLinkedServiceId(e.target.value ? Number(e.target.value) : null); setSmmLinkedSubServiceId(null); }} disabled={!smmSelectedAssetId} className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100 disabled:cursor-not-allowed">
                                                <option value="">Select Service</option>
                                                {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Linked Sub-Service</label>
                                            <select value={smmLinkedSubServiceId || ''} onChange={e => setSmmLinkedSubServiceId(e.target.value ? Number(e.target.value) : null)} disabled={!smmSelectedAssetId || !smmLinkedServiceId} className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100 disabled:cursor-not-allowed">
                                                <option value="">{smmLinkedServiceId ? 'Select Sub-Service' : 'Select Service first'}</option>
                                                {smmFilteredSubServices.map(ss => <option key={ss.id} value={ss.id}>{ss.sub_service_name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Linked Repository Item</label>
                                            <select value={smmLinkedRepositoryItemId || ''} onChange={e => setSmmLinkedRepositoryItemId(e.target.value ? Number(e.target.value) : null)} disabled={!smmSelectedAssetId} className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100 disabled:cursor-not-allowed">
                                                <option value="">Select Repository</option>
                                                {repositoryItems.map(r => <option key={r.id} value={r.id}>{r.title || r.content_title_clean}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* STEP 3: Asset Classification - From Master Database */}
                                <div className={`bg-amber-50 rounded-xl p-4 border border-amber-100 ${!smmSelectedAssetId ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${smmSelectedAssetId ? 'bg-amber-500' : 'bg-slate-400'}`}>
                                            <span className="text-white text-xs font-bold">3</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-amber-700">Asset Classification</h4>
                                        <span className="text-[10px] text-amber-600 bg-amber-100 px-2 py-0.5 rounded">From Master Database</span>
                                        {!smmSelectedAssetId && <span className="text-xs text-slate-400 ml-auto">(Select Asset ID first)</span>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Asset Type * <span className="text-[10px] text-slate-400">(Master)</span></label>
                                            <select value={asset.type || ''} onChange={e => setAsset({ ...asset, type: e.target.value })} disabled={!smmSelectedAssetId} className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100 disabled:cursor-not-allowed">
                                                <option value="">Select type...</option>
                                                {assetTypes.filter(t => !t.status || t.status === 'active').map(type => <option key={type.id} value={type.asset_type_name || type.name}>{type.asset_type_name || type.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Asset Category * <span className="text-[10px] text-slate-400">(Master)</span></label>
                                            <select value={asset.asset_category || ''} onChange={e => setAsset({ ...asset, asset_category: e.target.value })} disabled={!smmSelectedAssetId} className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100 disabled:cursor-not-allowed">
                                                <option value="">Select category...</option>
                                                {assetCategories.filter(c => !c.status || c.status === 'active').map(cat => <option key={cat.id} value={cat.category_name || cat.name}>{cat.category_name || cat.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>


                                {/* STEP 4: Social Media Configuration */}
                                <div className={`bg-purple-50 rounded-xl p-4 border border-purple-100 ${!smmSelectedAssetId ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${smmSelectedAssetId ? 'bg-purple-500' : 'bg-slate-400'}`}>
                                            <span className="text-white text-xs font-bold">4</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-purple-700">Social Media Configuration</h4>
                                        {!smmSelectedAssetId && <span className="text-xs text-slate-400">(Select Asset ID first)</span>}
                                    </div>

                                    {/* Platform Selection */}
                                    <div className="mb-4">
                                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-3">
                                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                            Social Media Platform *
                                        </label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {/* Facebook */}
                                            <button type="button" onClick={() => setSmmPlatform('facebook')} disabled={!smmSelectedAssetId}
                                                className={`p-3 rounded-lg border-2 transition-all text-center ${smmPlatform === 'facebook' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-slate-200 bg-white hover:border-blue-300'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                                <svg className="w-5 h-5 text-blue-600 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                </svg>
                                                <span className="text-[10px] font-medium text-slate-700">Facebook</span>
                                            </button>
                                            {/* Instagram */}
                                            <button type="button" onClick={() => setSmmPlatform('instagram')} disabled={!smmSelectedAssetId}
                                                className={`p-3 rounded-lg border-2 transition-all text-center ${smmPlatform === 'instagram' ? 'border-pink-500 bg-pink-50 shadow-md' : 'border-slate-200 bg-white hover:border-pink-300'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                                <svg className="w-5 h-5 text-pink-600 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                                </svg>
                                                <span className="text-[10px] font-medium text-slate-700">Instagram</span>
                                            </button>
                                            {/* Twitter/X */}
                                            <button type="button" onClick={() => setSmmPlatform('twitter')} disabled={!smmSelectedAssetId}
                                                className={`p-3 rounded-lg border-2 transition-all text-center ${smmPlatform === 'twitter' ? 'border-slate-800 bg-slate-100 shadow-md' : 'border-slate-200 bg-white hover:border-slate-400'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                                <svg className="w-5 h-5 text-slate-800 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                                </svg>
                                                <span className="text-[10px] font-medium text-slate-700">Twitter/X</span>
                                            </button>
                                            {/* LinkedIn */}
                                            <button type="button" onClick={() => setSmmPlatform('linkedin')} disabled={!smmSelectedAssetId}
                                                className={`p-3 rounded-lg border-2 transition-all text-center ${smmPlatform === 'linkedin' ? 'border-blue-700 bg-blue-50 shadow-md' : 'border-slate-200 bg-white hover:border-blue-400'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                                <svg className="w-5 h-5 text-blue-700 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                                </svg>
                                                <span className="text-[10px] font-medium text-slate-700">LinkedIn</span>
                                            </button>
                                            {/* YouTube */}
                                            <button type="button" onClick={() => setSmmPlatform('youtube')} disabled={!smmSelectedAssetId}
                                                className={`p-3 rounded-lg border-2 transition-all text-center ${smmPlatform === 'youtube' ? 'border-red-500 bg-red-50 shadow-md' : 'border-slate-200 bg-white hover:border-red-300'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                                <svg className="w-5 h-5 text-red-600 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                </svg>
                                                <span className="text-[10px] font-medium text-slate-700">YouTube</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Post Details */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div>
                                            <label className="flex items-center gap-1 text-xs font-medium text-slate-700 mb-1">
                                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>Post Title *
                                            </label>
                                            <input type="text" value={smmPostTitle} onChange={e => setSmmPostTitle(e.target.value)} disabled={!smmSelectedAssetId}
                                                placeholder="Enter post title..." className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100 disabled:cursor-not-allowed" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Content Format</label>
                                            <select value={smmContentFormat} onChange={e => setSmmContentFormat(e.target.value)} disabled={!smmSelectedAssetId}
                                                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100 disabled:cursor-not-allowed">
                                                <option value="image">🖼️ Image Post (Default)</option>
                                                <option value="video">🎬 Video</option>
                                                <option value="carousel">📱 Carousel</option>
                                                <option value="story">⏱️ Story</option>
                                                <option value="reel">🎞️ Reel/Short</option>
                                                <option value="text">📝 Text Post</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Caption */}
                                    <div className="mb-4">
                                        <label className="flex items-center gap-1 text-xs font-medium text-slate-700 mb-1">
                                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>Caption / Post Content *
                                        </label>
                                        <textarea value={smmCaption} onChange={e => setSmmCaption(e.target.value)} disabled={!smmSelectedAssetId}
                                            placeholder="Write your engaging caption here... Use emojis and line breaks for better engagement!" rows={4}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm resize-none disabled:bg-slate-100 disabled:cursor-not-allowed" />
                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-[10px] text-slate-400">{smmCaption.length} / 63,206 characters</p>
                                            <div className="flex gap-1">
                                                {smmPlatform === 'instagram' && <span className="text-[9px] px-1.5 py-0.5 bg-pink-100 text-pink-600 rounded">Max: 2,200</span>}
                                                {smmPlatform === 'twitter' && <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">Max: 280</span>}
                                                {smmPlatform === 'linkedin' && <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">Max: 3,000</span>}
                                                {smmPlatform === 'facebook' && <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">Max: 63,206</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hashtags & CTA */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Hashtags <span className="text-slate-400">(Optional)</span></label>
                                            <input type="text" value={smmHashtags} onChange={e => setSmmHashtags(e.target.value)} disabled={!smmSelectedAssetId}
                                                placeholder="#marketing #socialmedia #content" className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100 disabled:cursor-not-allowed" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Call to Action <span className="text-slate-400">(Optional)</span></label>
                                            <input type="text" value={smmCta} onChange={e => setSmmCta(e.target.value)} disabled={!smmSelectedAssetId}
                                                placeholder="Link in bio, Shop now, Learn more..." className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100 disabled:cursor-not-allowed" />
                                        </div>
                                    </div>

                                    {/* Resource Upload */}
                                    <div className="mb-4">
                                        <label className="block text-xs font-medium text-slate-700 mb-2">Resource Upload <span className="text-slate-400">(Multi-file supported)</span></label>
                                        <div onClick={() => !smmSelectedAssetId ? null : document.getElementById('smm-file-input')?.click()}
                                            className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${smmSelectedAssetId ? 'border-purple-200 hover:border-purple-400 hover:bg-purple-50/30 cursor-pointer' : 'border-slate-200 bg-slate-50 cursor-not-allowed'}`}>
                                            <input id="smm-file-input" type="file" className="hidden" accept="image/*,video/*,.pdf,.doc,.docx" multiple
                                                onChange={(e) => handleSmmFileSelect(e.target.files)} disabled={!smmSelectedAssetId} />
                                            {smmPreviewUrls.length > 0 ? (
                                                <div className="space-y-2">
                                                    <div className="flex flex-wrap gap-2 justify-center">
                                                        {smmPreviewUrls.map((url, idx) => (
                                                            <div key={idx} className="relative">
                                                                <img src={url} alt={`Preview ${idx + 1}`} className="h-16 w-16 object-cover rounded-lg shadow" />
                                                                <button onClick={(e) => { e.stopPropagation(); removeSmmFile(idx); }}
                                                                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">×</button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-slate-600">Click to add more files</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-700">Upload Social Media Assets</p>
                                                    <p className="text-xs text-slate-500">Images, Videos, Documents</p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Live Preview */}
                                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                        <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                <span className="text-white font-semibold text-xs">Live Preview</span>
                                                {smmPlatform && <span className="ml-auto text-white/80 text-[10px] capitalize">{smmPlatform} Post</span>}
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <div className={`rounded-lg border overflow-hidden ${smmPlatform === 'instagram' ? 'border-pink-200 bg-pink-50/50' : smmPlatform === 'facebook' ? 'border-blue-200 bg-blue-50/50' : smmPlatform === 'twitter' ? 'border-slate-200 bg-slate-50' : smmPlatform === 'linkedin' ? 'border-blue-200 bg-blue-50/50' : smmPlatform === 'youtube' ? 'border-red-200 bg-red-50/50' : 'border-slate-200 bg-slate-50'}`}>
                                                <div className="p-3 flex items-center gap-2 border-b border-slate-100">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${smmPlatform === 'instagram' ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400' : smmPlatform === 'facebook' ? 'bg-blue-600' : smmPlatform === 'twitter' ? 'bg-slate-900' : smmPlatform === 'linkedin' ? 'bg-blue-700' : smmPlatform === 'youtube' ? 'bg-red-600' : 'bg-purple-500'}`}>
                                                        <span className="text-white text-xs font-bold">G</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-xs text-slate-800">Your Brand</p>
                                                        <p className="text-[10px] text-slate-500">Just now</p>
                                                    </div>
                                                </div>
                                                <div className="p-3">
                                                    {smmPostTitle && <h4 className="font-bold text-sm text-slate-800 mb-1">{smmPostTitle}</h4>}
                                                    <p className="text-xs text-slate-700 whitespace-pre-wrap">{smmCaption || 'Your caption will appear here...'}</p>
                                                    {smmHashtags && <p className="text-xs text-purple-600 mt-1">{smmHashtags.split(' ').map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}</p>}
                                                    {smmCta && <p className="text-xs font-medium text-purple-700 mt-2">{smmCta}</p>}
                                                </div>
                                                {smmPreviewUrls.length > 0 ? (
                                                    <div className="px-3 pb-3">
                                                        <img src={smmPreviewUrls[0]} alt="Preview" className="w-full rounded-lg object-cover max-h-32" />
                                                    </div>
                                                ) : (
                                                    <div className="mx-3 mb-3 h-24 bg-slate-100 rounded-lg flex items-center justify-center">
                                                        <p className="text-[10px] text-slate-400">Upload media above</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* STEP 5: Designer & Workflow Assignment */}
                                <div className={`bg-green-50 rounded-xl p-4 border border-green-100 ${!smmSelectedAssetId ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${smmSelectedAssetId ? 'bg-green-500' : 'bg-slate-400'}`}>
                                            <span className="text-white text-xs font-bold">5</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-green-700">Designer & Workflow Assignment</h4>
                                        {!smmSelectedAssetId && <span className="text-xs text-slate-400">(Select Asset ID first)</span>}
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Created By <span className="text-slate-400">[Auto]</span></label>
                                            <input type="text" value={user?.name || 'Current User'} disabled className="w-full h-9 px-3 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600" />
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-1 text-xs font-medium text-slate-600 mb-1">
                                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>Designed By *
                                            </label>
                                            <select value={smmDesignedBy || ''} onChange={e => setSmmDesignedBy(e.target.value ? Number(e.target.value) : null)} disabled={!smmSelectedAssetId}
                                                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100 disabled:cursor-not-allowed">
                                                <option value="">Select designer...</option>
                                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-1 text-xs font-medium text-slate-600 mb-1">
                                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>Verified By *
                                            </label>
                                            <select value={smmVerifiedBy || ''} onChange={e => setSmmVerifiedBy(e.target.value ? Number(e.target.value) : null)} disabled={!smmSelectedAssetId}
                                                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm disabled:bg-slate-100 disabled:cursor-not-allowed">
                                                <option value="">Select verifier...</option>
                                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2">User lists fetched from User Master. Workflow status updates automatically based on actions.</p>
                                </div>

                                {/* STEP 6: Versioning Control */}
                                <div className={`bg-slate-50 rounded-xl p-4 border border-slate-200 ${!smmSelectedAssetId ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${smmSelectedAssetId ? 'bg-slate-600' : 'bg-slate-400'}`}>
                                            <span className="text-white text-xs font-bold">6</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-700">Versioning Control</h4>
                                        {!smmSelectedAssetId && <span className="text-xs text-slate-400">(Select Asset ID first)</span>}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Version Number <span className="text-slate-400">[Auto]</span></label>
                                            <div className="h-9 px-4 bg-white border border-slate-200 rounded-lg flex items-center text-sm font-medium text-slate-700 w-20">
                                                v{smmVersion}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-5">
                                            <button disabled={!smmSelectedAssetId} className="h-9 px-3 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 bg-white disabled:opacity-50 disabled:cursor-not-allowed">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                View History
                                            </button>
                                            <button disabled={!smmSelectedAssetId} className="h-9 px-3 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 bg-white disabled:opacity-50 disabled:cursor-not-allowed">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Rollback
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2">First upload starts at v1.0. Every subsequent upload increments automatically. Previous versions remain accessible for audit.</p>
                                </div>

                                {/* SMM Actions - Required fields note */}
                                <p className="text-xs text-slate-500">* Required fields must be filled to save the asset</p>
                            </div>
                        )}

                        {/* Required Fields Note - Only show for Web and SEO */}
                        {asset.application_type && asset.application_type !== 'smm' && (
                            <p className="text-xs text-slate-500">* Required fields must be filled to save the asset</p>
                        )}
                    </div>
                </div>

                {/* Footer Actions - Different for SMM vs Web/SEO */}
                <div className="flex items-center justify-center gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
                    {asset.application_type === 'smm' ? (
                        /* SMM Footer Actions */
                        <>
                            <button
                                onClick={onClose}
                                className="h-10 px-5 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Discard
                            </button>
                            <button
                                onClick={() => handleSave(false)}
                                disabled={isSaving || !smmSelectedAssetId}
                                className="h-10 px-5 text-sm font-medium bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                </svg>
                                Save Draft
                            </button>
                            <button
                                onClick={() => handleSave(true)}
                                disabled={isSaving || !smmSelectedAssetId}
                                className="h-10 px-5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                Submit for QC
                            </button>
                        </>
                    ) : (
                        /* Web/SEO Footer Actions */
                        <>
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UploadAssetPopup;
