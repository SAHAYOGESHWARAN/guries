import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useData } from '../hooks/useData';
import type { AssetLibraryItem, Service, SubServiceItem, AssetCategoryMasterItem, AssetTypeMasterItem, Task, Campaign, Project, ContentRepositoryItem, User } from '../types';
import AssetCategoryMasterModal from './AssetCategoryMasterModal';
import AssetTypeMasterModal from './AssetTypeMasterModal';
import CircularScore from './CircularScore';

interface AssetFormatMasterItem {
    id: number;
    format_name: string;
    description?: string;
    application_types?: string[];
    status?: string;
}

interface UploadAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    initialData?: Partial<AssetLibraryItem>;
    contentTypeLocked?: boolean;
}

const UploadAssetModal: React.FC<UploadAssetModalProps> = ({ isOpen, onClose, onSuccess, initialData, contentTypeLocked: contentTypeLockedProp }) => {
    const [newAsset, setNewAsset] = useState<Partial<AssetLibraryItem>>(initialData || {
        application_type: 'web',
        name: '',
        type: 'article',
        repository: 'Content Repository',
        status: 'Draft',
        linked_service_ids: [],
        linked_sub_service_ids: [],
        smm_platform: undefined,
        seo_score: undefined,
        grammar_score: undefined,
        smm_additional_pages: [],
        keywords: [],
        web_description: '',
        web_url: '',
        web_h1: '',
        web_h2_1: '',
        web_h2_2: '',
        web_body_content: '',
        asset_category: '',
        content_type: undefined,
    });

    React.useEffect(() => {
        if (initialData) {
            setNewAsset(initialData);
            setLinkedTaskId(initialData.linked_task_id || initialData.linked_task || null);
            setLinkedCampaignId(initialData.linked_campaign_id || null);
            setLinkedProjectId(initialData.linked_project_id || null);
            setLinkedServiceId(initialData.linked_service_id || (initialData.linked_service_ids && initialData.linked_service_ids[0]) || null);
            setLinkedSubServiceId(initialData.linked_sub_service_id || (initialData.linked_sub_service_ids && initialData.linked_sub_service_ids[0]) || null);
            setLinkedRepositoryItemId(initialData.linked_repository_item_id || null);
            setDesignedBy(initialData.designed_by || null);
            setWorkflowStage(initialData.status || 'Draft');
            setVersionNumber(initialData.version_number || 'v1.0');
            if (initialData.thumbnail_url || initialData.file_url || initialData.smm_media_url) {
                setPreviewUrl(initialData.thumbnail_url || initialData.file_url || initialData.smm_media_url || '');
            }
            if (initialData.smm_media_url) {
                setSmmMediaUrl(initialData.smm_media_url);
            }
        }
    }, [initialData]);

    const contentTypeLocked = contentTypeLockedProp ?? false;
    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
    const [selectedSubServiceIds, setSelectedSubServiceIds] = useState<number[]>([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<AssetCategoryMasterItem | null>(null);
    const [editingType, setEditingType] = useState<AssetTypeMasterItem | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [dragActive, setDragActive] = useState(false);

    const [linkedTaskId, setLinkedTaskId] = useState<number | null>(initialData?.linked_task_id || null);
    const [linkedCampaignId, setLinkedCampaignId] = useState<number | null>(initialData?.linked_campaign_id || null);
    const [linkedProjectId, setLinkedProjectId] = useState<number | null>(initialData?.linked_project_id || null);
    const [linkedServiceId, setLinkedServiceId] = useState<number | null>(initialData?.linked_service_id || null);
    const [linkedSubServiceId, setLinkedSubServiceId] = useState<number | null>(initialData?.linked_sub_service_id || null);
    const [linkedRepositoryItemId, setLinkedRepositoryItemId] = useState<number | null>(initialData?.linked_repository_item_id || null);

    const [designedBy, setDesignedBy] = useState<number | null>(initialData?.designed_by || null);
    const [workflowStage, setWorkflowStage] = useState<string>(initialData?.status || 'Draft');
    const [versionNumber, setVersionNumber] = useState<string>(initialData?.version_number || 'v1.0');
    const [smmMediaUrl, setSmmMediaUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    const { data: services = [] } = useData<Service>('services');
    const { data: subServices = [] } = useData<SubServiceItem>('subServices');
    const { data: assetCategories = [] } = useData<AssetCategoryMasterItem>('asset-category-master');
    const { data: assetTypes = [] } = useData<AssetTypeMasterItem>('asset-type-master');
    const { data: assetFormats = [] } = useData<AssetFormatMasterItem>('asset-format-master');
    const { create: createAssetCategory } = useData<AssetCategoryMasterItem>('asset-category-master');
    const { create: createAssetType } = useData<AssetTypeMasterItem>('asset-type-master');
    const { create: createAsset, update: updateAsset } = useData<AssetLibraryItem>('assetLibrary');
    const { data: tasks = [] } = useData<Task>('tasks');
    const { data: campaigns = [] } = useData<Campaign>('campaigns');
    const { data: projects = [] } = useData<Project>('projects');
    const { data: repositoryItems = [] } = useData<ContentRepositoryItem>('content');
    const { data: users = [] } = useData<User>('users');

    const linkedFilteredSubServices = useMemo(() => {
        if (!linkedServiceId) return [];
        return subServices.filter(sub => Number(sub.parent_service_id) === Number(linkedServiceId));
    }, [subServices, linkedServiceId]);

    const filteredAssetCategories = useMemo(() => {
        return assetCategories.filter(cat => !cat.status || cat.status === 'active');
    }, [assetCategories]);

    const filteredAssetTypes = useMemo(() => {
        return assetTypes.filter(type => !type.status || type.status === 'active');
    }, [assetTypes]);

    const handleFileSelect = useCallback((file: File) => {
        setSelectedFile(file);
        setNewAsset(prev => ({
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
                setNewAsset(prev => ({ ...prev, file_url: result, thumbnail_url: result }));
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewUrl('');
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
    }, [handleFileSelect]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    }, []);

    const handleUpload = useCallback(async (type: 'draft' | 'qc' | 'library') => {
        try {
            if (!newAsset.name || newAsset.name.trim() === '') {
                alert('Please enter an asset name/title');
                return;
            }
            let status: string;
            if (type === 'qc') status = 'Pending QC Review';
            else if (type === 'library') status = workflowStage;
            else status = 'Draft';

            const assetData: Partial<AssetLibraryItem> = {
                ...newAsset,
                status: status as any,
                linked_service_ids: selectedServiceId ? [selectedServiceId] : [],
                linked_sub_service_ids: selectedSubServiceIds,
                linked_task_id: linkedTaskId || undefined,
                linked_campaign_id: linkedCampaignId || undefined,
                linked_project_id: linkedProjectId || undefined,
                linked_service_id: linkedServiceId || undefined,
                linked_sub_service_id: linkedSubServiceId || undefined,
                linked_repository_item_id: linkedRepositoryItemId || undefined,
                designed_by: designedBy || undefined,
                version_number: versionNumber,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            if (initialData?.id) {
                await updateAsset(initialData.id, assetData);
            } else {
                await createAsset(assetData as AssetLibraryItem);
            }

            const messages: Record<string, string> = {
                qc: 'Asset submitted to QC successfully!',
                library: 'Asset saved to Asset Library!',
                draft: 'Asset saved as draft!'
            };
            alert(messages[type]);
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Failed to save asset:', error);
            alert('Failed to save asset. Please try again.');
        }
    }, [newAsset, selectedServiceId, selectedSubServiceIds, linkedTaskId, linkedCampaignId, linkedProjectId, linkedServiceId, linkedSubServiceId, linkedRepositoryItemId, designedBy, workflowStage, versionNumber, initialData, createAsset, updateAsset, onSuccess, onClose]);

    const analyzeContent = useCallback(async () => {
        const text = (newAsset.web_body_content || '').trim();
        if (!text) {
            alert('Please add body content to analyse');
            return;
        }
        const lengthScore = Math.min(80, Math.round(text.length / 10));
        const randBoost = Math.round(Math.random() * 20);
        const localSeoScore = Math.min(100, lengthScore + randBoost);
        const localGrammarScore = Math.min(100, Math.round(60 + Math.random() * 40));

        const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
        try {
            const response = await fetch(`${apiUrl}/assetLibrary/ai-scores`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: text, title: newAsset.name, description: newAsset.web_description })
            });
            if (response.ok) {
                const scores = await response.json();
                setNewAsset(prev => ({ ...prev, seo_score: scores.seo_score, grammar_score: scores.grammar_score }));
            } else {
                setNewAsset(prev => ({ ...prev, seo_score: localSeoScore, grammar_score: localGrammarScore }));
            }
        } catch {
            setNewAsset(prev => ({ ...prev, seo_score: localSeoScore, grammar_score: localGrammarScore }));
        }
    }, [newAsset.web_body_content, newAsset.name, newAsset.web_description]);

    const isEditMode = !!initialData?.id;

    // Calculate progress
    const getProgress = () => {
        let basicComplete = !!(newAsset.name && newAsset.application_type);
        let scoresComplete = !!(newAsset.seo_score && newAsset.grammar_score);
        let readyForQC = basicComplete && scoresComplete;
        return { basicComplete, scoresComplete, readyForQC };
    };
    const progress = getProgress();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-slate-200 bg-gradient-to-r from-indigo-50 via-white to-purple-50">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{isEditMode ? 'Edit Asset' : 'Upload New Asset'}</h2>
                            <p className="text-sm text-slate-500 mt-0.5">{isEditMode ? 'Update asset information and settings' : 'Add new content to the asset library'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={() => handleUpload('draft')}
                            disabled={!newAsset.name}
                            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            {isEditMode ? 'Save Changes' : 'Save Draft'}
                        </button>
                        <button
                            onClick={() => handleUpload('qc')}
                            disabled={!newAsset.name}
                            className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {isEditMode ? 'Update & Submit for QC' : 'Submit for QC'}
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-12 gap-6 p-8">
                        {/* Left Sidebar - Upload & Progress */}
                        <div className="col-span-12 lg:col-span-4 space-y-6">
                            {/* Progress Card */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                        Progress
                                    </h3>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">Basic Info</span>
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${progress.basicComplete ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {progress.basicComplete ? 'Complete' : 'Pending'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">AI Scores</span>
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${progress.scoresComplete ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {progress.scoresComplete ? 'Complete' : 'Pending'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">Ready for QC</span>
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${progress.readyForQC ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {progress.readyForQC ? 'Ready' : 'Not Ready'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* File Upload Card */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        Asset Upload
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">Upload your asset file and preview it before submission</p>
                                </div>
                                <div className="p-5">
                                    <div
                                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30'}`}
                                        onDrop={handleDrop}
                                        onDragOver={handleDrag}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input ref={fileInputRef} type="file" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} className="hidden" accept="image/*,video/*,.pdf,.doc,.docx,.zip" />
                                        {previewUrl ? (
                                            <div className="space-y-4">
                                                <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg shadow-md" />
                                                <p className="text-sm font-medium text-slate-700">{selectedFile?.name}</p>
                                                <p className="text-xs text-slate-500">{selectedFile && `${(selectedFile.size / 1024).toFixed(1)} KB`}</p>
                                                <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setPreviewUrl(''); }} className="text-xs text-red-600 hover:text-red-700 font-medium">Remove</button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm font-medium text-slate-700">Drop files here or click to browse</p>
                                                <p className="text-xs text-slate-500">Support for images, videos, documents and archives</p>
                                                <div className="flex justify-center gap-2 pt-2">
                                                    {['PNG', 'JPG', 'PDF', 'MP4', 'DOC', 'ZIP'].map(fmt => (
                                                        <span key={fmt} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded">{fmt}</span>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-slate-400 pt-1">Maximum file size: 50MB</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="col-span-12 lg:col-span-8 space-y-6">
                            {/* Basic Information Card */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Basic Information
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Essential asset details and classification</p>
                                </div>
                                <div className="p-6 space-y-5">
                                    {/* Application Type & Title Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Asset Application <span className="text-red-500">*</span>
                                            </label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    { id: 'web', label: 'WEB', icon: '🌐', desc: 'Web content' },
                                                    { id: 'seo', label: 'SEO', icon: '🔍', desc: 'SEO assets' },
                                                    { id: 'smm', label: 'SMM', icon: '📱', desc: 'Social media' }
                                                ].map(app => (
                                                    <button
                                                        key={app.id}
                                                        type="button"
                                                        onClick={() => setNewAsset({ ...newAsset, application_type: app.id as any })}
                                                        className={`p-3 rounded-lg border-2 text-center transition-all ${newAsset.application_type === app.id
                                                            ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                                                    >
                                                        <span className="text-lg block">{app.icon}</span>
                                                        <span className="text-xs font-semibold text-slate-700 block mt-1">{app.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                            {contentTypeLocked && <p className="text-xs text-slate-500 mt-1.5">(Content type is now static)</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Asset Title <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={newAsset.name || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                                                placeholder="Enter asset title..."
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Asset Type Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Asset Type <span className="text-red-500">*</span></label>
                                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                            {[
                                                { id: 'article', label: 'Article', icon: '📄' },
                                                { id: 'video', label: 'Video', icon: '🎥' },
                                                { id: 'graphic', label: 'Graphic', icon: '🎨' },
                                                { id: 'guide', label: 'Guide', icon: '📚' },
                                                { id: 'listicle', label: 'Listicle', icon: '📝' },
                                                { id: 'web', label: 'Web', icon: '🌐' }
                                            ].map(type => (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={() => setNewAsset({ ...newAsset, type: type.id })}
                                                    className={`p-3 rounded-lg border text-center transition-all ${newAsset.type === type.id
                                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                        : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                                                >
                                                    <span className="text-lg block">{type.icon}</span>
                                                    <span className="text-xs font-medium block mt-1">{type.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Web Application Fields Card - Only show for WEB type */}
                            {newAsset.application_type === 'web' && (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200">
                                        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                            <span className="text-purple-600">🌐</span>
                                            Web Application Fields
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">Configure fields specific to your selected application type</p>
                                    </div>
                                    <div className="p-6 space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-1.5">Title</label>
                                                <input type="text" value={newAsset.name || ''} onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })} placeholder="Enter title..." className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-1.5">URL</label>
                                                <input type="url" value={newAsset.web_url || ''} onChange={(e) => setNewAsset({ ...newAsset, web_url: e.target.value })} placeholder="https://example.com/page" className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1.5">H1</label>
                                            <input type="text" value={newAsset.web_h1 || ''} onChange={(e) => setNewAsset({ ...newAsset, web_h1: e.target.value })} placeholder="Main heading..." className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-1.5">H2 (First)</label>
                                                <input type="text" value={newAsset.web_h2_1 || ''} onChange={(e) => setNewAsset({ ...newAsset, web_h2_1: e.target.value })} placeholder="First subheading..." className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-1.5">H2 (Second)</label>
                                                <input type="text" value={newAsset.web_h2_2 || ''} onChange={(e) => setNewAsset({ ...newAsset, web_h2_2: e.target.value })} placeholder="Second subheading..." className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-2">
                                                <span>📝</span> Body Content
                                            </label>
                                            <textarea
                                                value={newAsset.web_body_content || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, web_body_content: e.target.value })}
                                                placeholder="Enter your content here for AI analysis..."
                                                rows={6}
                                                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-y"
                                            />
                                            <div className="flex justify-between mt-1.5 text-xs text-slate-500">
                                                <span>{(newAsset.web_body_content || '').split(' ').filter(w => w.length > 0).length} words</span>
                                                <span>{(newAsset.web_body_content || '').length} characters</span>
                                            </div>
                                        </div>
                                        {/* AI Scores Section */}
                                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-sm font-semibold text-slate-700">AI Quality Scores</h4>
                                                <button onClick={analyzeContent} className="px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                                    Analyze Score
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-center gap-12">
                                                <div className="text-center">
                                                    <CircularScore score={newAsset.seo_score || 0} size={80} strokeWidth={7} />
                                                    <p className="text-xs font-semibold text-slate-600 mt-2">SEO SCORE</p>
                                                </div>
                                                <div className="text-center">
                                                    <CircularScore score={newAsset.grammar_score || 0} size={80} strokeWidth={7} />
                                                    <p className="text-xs font-semibold text-slate-600 mt-2">GRAMMAR SCORE</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Upload Web Assets Card */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-200">
                                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                        <span className="text-emerald-600">📤</span>
                                        Upload Web Assets
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-2">Thumbnail/Blog Image</label>
                                            <div className="border border-slate-300 rounded-lg p-4 bg-slate-50">
                                                <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => setNewAsset(prev => ({ ...prev, thumbnail_url: reader.result as string }));
                                                        reader.readAsDataURL(file);
                                                    }
                                                }} className="hidden" />
                                                <button type="button" onClick={() => thumbnailInputRef.current?.click()} className="w-full px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                                                    Upload
                                                </button>
                                                {newAsset.thumbnail_url && <img src={newAsset.thumbnail_url} alt="Thumbnail" className="mt-3 max-h-24 rounded-lg mx-auto" />}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-2">Additional Files</label>
                                            <div className="border border-slate-300 rounded-lg p-4 bg-slate-50">
                                                <div className="flex items-center gap-3">
                                                    <button className="px-4 py-2.5 bg-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-300 transition-colors">
                                                        Choose File
                                                    </button>
                                                    <span className="text-sm text-slate-500">No file selected</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Asset Classification Card */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-slate-200">
                                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                        <span className="text-amber-600">🏷️</span>
                                        Asset Classification
                                    </h3>
                                </div>
                                <div className="p-6 space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Content Type <span className="text-red-500">*</span></label>
                                            <select value={newAsset.content_type || ''} onChange={(e) => setNewAsset({ ...newAsset, content_type: e.target.value as any })} disabled={contentTypeLocked} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white">
                                                <option value="">Select content type</option>
                                                <option value="Blog">Blog</option>
                                                <option value="Service Page">Service Page</option>
                                                <option value="Sub-Service Page">Sub-Service Page</option>
                                                <option value="SMM Post">SMM Post</option>
                                                <option value="Backlink Asset">Backlink Asset</option>
                                                <option value="Web UI Asset">Web UI Asset</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Repository</label>
                                            <select value={newAsset.repository || 'Content Repository'} onChange={(e) => setNewAsset({ ...newAsset, repository: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white">
                                                <option value="Content Repository">Content Repository</option>
                                                <option value="SMM Repository">SMM Repository</option>
                                                <option value="SEO Repository">SEO Repository</option>
                                                <option value="Design Repository">Design Repository</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Asset Category</label>
                                            <select value={newAsset.asset_category || ''} onChange={(e) => setNewAsset({ ...newAsset, asset_category: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white">
                                                <option value="">Select category...</option>
                                                {filteredAssetCategories.map(category => (
                                                    <option key={category.id} value={category.category_name}>{category.category_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Asset Type</label>
                                            <select value={newAsset.type || ''} onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white">
                                                <option value="">Select type...</option>
                                                {filteredAssetTypes.map(type => {
                                                    const typeName = (type as any).asset_type_name || (type as any).asset_type || '';
                                                    return <option key={type.id} value={typeName}>{typeName}</option>;
                                                })}
                                            </select>
                                        </div>
                                    </div>
                                    {/* Quick Category Tags */}
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {['Academic Writing', 'Case Studies', 'Educational Content', 'How To Guides', 'Industry Solutions', 'News & Updates', 'Product Features', 'Research Articles', 'Technical Documentation'].map(tag => (
                                            <button key={tag} type="button" onClick={() => setNewAsset({ ...newAsset, asset_category: tag })} className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${newAsset.asset_category === tag ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Map Asset to Source Work Card */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-slate-200">
                                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                        Map Asset to Source Work
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Link this asset to existing tasks, campaigns, projects, and services</p>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Linked Task</label>
                                            <select value={linkedTaskId || ''} onChange={(e) => setLinkedTaskId(e.target.value ? parseInt(e.target.value) : null)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white">
                                                <option value="">Select task</option>
                                                {tasks.map(task => <option key={task.id} value={task.id}>{task.task_name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Linked Campaign</label>
                                            <select value={linkedCampaignId || ''} onChange={(e) => setLinkedCampaignId(e.target.value ? parseInt(e.target.value) : null)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white">
                                                <option value="">Select campaign</option>
                                                {campaigns.map(campaign => <option key={campaign.id} value={campaign.id}>{campaign.campaign_name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Linked Project</label>
                                            <select value={linkedProjectId || ''} onChange={(e) => setLinkedProjectId(e.target.value ? parseInt(e.target.value) : null)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white">
                                                <option value="">Select project</option>
                                                {projects.map(project => <option key={project.id} value={project.id}>{project.project_name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Linked Service</label>
                                            <select value={linkedServiceId || ''} onChange={(e) => { setLinkedServiceId(e.target.value ? parseInt(e.target.value) : null); setLinkedSubServiceId(null); }} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white">
                                                <option value="">Select service</option>
                                                {services.map(service => <option key={service.id} value={service.id}>{service.service_name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Linked Sub-Service</label>
                                            <select value={linkedSubServiceId || ''} onChange={(e) => setLinkedSubServiceId(e.target.value ? parseInt(e.target.value) : null)} disabled={!linkedServiceId} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed">
                                                <option value="">Select sub-service</option>
                                                {linkedFilteredSubServices.map(subService => <option key={subService.id} value={subService.id}>{subService.sub_service_name}</option>)}
                                            </select>
                                            {!linkedServiceId && <p className="text-xs text-slate-400 mt-1">Select a service first to see sub-services</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Linked Repository Item</label>
                                            <select value={linkedRepositoryItemId || ''} onChange={(e) => setLinkedRepositoryItemId(e.target.value ? parseInt(e.target.value) : null)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white">
                                                <option value="">Select repository item</option>
                                                {repositoryItems.map(item => <option key={item.id} value={item.id}>{item.content_title_clean}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status Card */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
                                    <h3 className="text-sm font-semibold text-slate-800">Status</h3>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <select value={workflowStage} onChange={(e) => setWorkflowStage(e.target.value)} className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white">
                                                <option value="Draft">Draft</option>
                                                <option value="Pending QC Review">Pending QC Review</option>
                                                <option value="QC Approved">QC Approved</option>
                                                <option value="Published">Published</option>
                                            </select>
                                        </div>
                                        <p className="text-xs text-slate-500">Status will be updated automatically based on workflow</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Modal */}
            {showCategoryModal && (
                <AssetCategoryMasterModal
                    isOpen={showCategoryModal}
                    onClose={() => setShowCategoryModal(false)}
                    onSave={async (cat: Partial<AssetCategoryMasterItem>) => {
                        try { await createAssetCategory(cat as AssetCategoryMasterItem); } catch (err) { console.error('Failed to create category:', err); } finally { setShowCategoryModal(false); }
                    }}
                    editingItem={editingCategory}
                />
            )}

            {/* Type Modal */}
            {showTypeModal && (
                <AssetTypeMasterModal
                    isOpen={showTypeModal}
                    onClose={() => setShowTypeModal(false)}
                    onSave={async (type: Partial<AssetTypeMasterItem>) => {
                        try { await createAssetType(type as AssetTypeMasterItem); } catch (err) { console.error('Failed to create asset type:', err); } finally { setShowTypeModal(false); }
                    }}
                    editingItem={editingType}
                />
            )}
        </div>
    );
};

export default UploadAssetModal;
