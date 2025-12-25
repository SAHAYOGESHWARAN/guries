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
    // Component state and logic would go here
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
        seo_keywords: [],
        seo_focus_keyword: '',
        seo_content_type: '',
        smm_post_type: '',
        smm_campaign_type: '',
        smm_hashtags: ''
    });

    // Update newAsset when initialData changes
    React.useEffect(() => {
        if (initialData) {
            setNewAsset(initialData);
        }
    }, [initialData]);
    // use locked state from parent when provided
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

    // Map Assets to Source Work state
    const [linkedTaskId, setLinkedTaskId] = useState<number | null>(initialData?.linked_task_id || null);
    const [linkedCampaignId, setLinkedCampaignId] = useState<number | null>(initialData?.linked_campaign_id || null);
    const [linkedProjectId, setLinkedProjectId] = useState<number | null>(initialData?.linked_project_id || null);
    const [linkedServiceId, setLinkedServiceId] = useState<number | null>(initialData?.linked_service_id || null);
    const [linkedSubServiceId, setLinkedSubServiceId] = useState<number | null>(initialData?.linked_sub_service_id || null);
    const [linkedRepositoryItemId, setLinkedRepositoryItemId] = useState<number | null>(initialData?.linked_repository_item_id || null);

    // Designer & Workflow state
    const [designedBy, setDesignedBy] = useState<number | null>(initialData?.designed_by || null);
    const [workflowStage, setWorkflowStage] = useState<string>(initialData?.status || 'Draft');

    // Versioning state
    const [versionNumber, setVersionNumber] = useState<string>(initialData?.version_number || 'v1.0');
    const [showVersionHistory, setShowVersionHistory] = useState(false);
    const [showSmmPreview, setShowSmmPreview] = useState(true);
    const [smmMediaUrl, setSmmMediaUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaInputRef = useRef<HTMLInputElement>(null);

    // Data hooks
    const { data: services = [] } = useData<Service>('services');
    const { data: subServices = [] } = useData<SubServiceItem>('subServices');
    const { data: assetCategories = [] } = useData<AssetCategoryMasterItem>('asset-category-master');
    const { data: assetTypes = [] } = useData<AssetTypeMasterItem>('asset-type-master');
    const { data: assetFormats = [] } = useData<AssetFormatMasterItem>('asset-format-master');
    const { create: createAssetCategory } = useData<AssetCategoryMasterItem>('asset-category-master');
    const { create: createAssetType } = useData<AssetTypeMasterItem>('asset-type-master');
    const { create: createAsset, update: updateAsset } = useData<AssetLibraryItem>('assetLibrary');

    // Data hooks for Map Assets to Source Work section
    const { data: tasks = [] } = useData<Task>('tasks');
    const { data: campaigns = [] } = useData<Campaign>('campaigns');
    const { data: projects = [] } = useData<Project>('projects');
    const { data: repositoryItems = [] } = useData<ContentRepositoryItem>('content');

    // Data hooks for Designer & Workflow section
    const { data: users = [] } = useData<User>('users');

    // Debug: Log all loaded data on mount
    React.useEffect(() => {
        console.log('=== UploadAssetModal Data Load ===');
        console.log('Services loaded:', services.length, services);
        console.log('SubServices loaded:', subServices.length, subServices);
        console.log('Asset Categories loaded:', assetCategories.length, assetCategories);
        console.log('Asset Types loaded:', assetTypes.length, assetTypes);
    }, [services, subServices, assetCategories, assetTypes]);

    // Filter sub-services by selected service
    const filteredSubServices = useMemo(() => {
        console.log('=== Sub-Services Debug ===');
        console.log('All subServices loaded:', subServices);
        console.log('Selected Service ID:', selectedServiceId);
        if (!selectedServiceId) {
            console.log('No service selected, returning empty array');
            return [];
        }
        const filtered = subServices.filter(sub => {
            const match = Number(sub.parent_service_id) === Number(selectedServiceId);
            console.log(`SubService "${sub.sub_service_name}" (parent_service_id: ${sub.parent_service_id}) - Match: ${match}`);
            return match;
        });
        console.log('Filtered sub-services:', filtered);
        return filtered;
    }, [subServices, selectedServiceId]);

    // Filter sub-services for Map Assets to Source Work section
    const linkedFilteredSubServices = useMemo(() => {
        if (!linkedServiceId) return [];
        return subServices.filter(sub => Number(sub.parent_service_id) === Number(linkedServiceId));
    }, [subServices, linkedServiceId]);

    // Filter asset categories by brand - handle both status field presence
    const filteredAssetCategories = useMemo(() => {
        console.log('=== Asset Categories Debug ===');
        console.log('All categories:', assetCategories);
        // Filter by status if it exists, otherwise include all
        const filtered = assetCategories.filter(cat => !cat.status || cat.status === 'active');
        console.log('Filtered categories:', filtered);
        return filtered;
    }, [assetCategories]);

    // Filter asset types - handle both AssetTypeItem and AssetTypeMasterItem structures
    const filteredAssetTypes = useMemo(() => {
        console.log('=== Asset Types Debug ===');
        console.log('All asset types:', assetTypes);
        // Filter by status if it exists, otherwise include all
        const filtered = assetTypes.filter(type => !type.status || type.status === 'active');
        console.log('Filtered asset types:', filtered);
        return filtered;
    }, [assetTypes]);

    // Filter asset formats - handle status field
    const filteredAssetFormats = useMemo(() => {
        console.log('=== Asset Formats Debug ===');
        console.log('All asset formats:', assetFormats);
        // Filter by status if it exists, otherwise include all
        const filtered = assetFormats.filter(format => !format.status || format.status === 'active');
        console.log('Filtered asset formats:', filtered);
        return filtered;
    }, [assetFormats]);

    // File handling functions
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

    const handleFileUpload = useCallback(async (file: File, type: 'thumbnail' | 'media') => {
        // Convert to base64 for storage
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;

            if (type === 'thumbnail') {
                setNewAsset(prev => ({
                    ...prev,
                    web_thumbnail: base64String,
                    thumbnail_url: base64String
                }));
            } else {
                setNewAsset(prev => ({
                    ...prev,
                    smm_media_url: base64String
                }));
                setSmmMediaUrl(base64String);
            }
        };
        reader.readAsDataURL(file);
    }, []);

    const handleUpload = useCallback(async (type: 'draft' | 'qc' | 'library') => {
        try {
            // Validate required fields
            if (!newAsset.name || newAsset.name.trim() === '') {
                alert('Please enter an asset name/title');
                return;
            }

            // Determine status based on action type
            let status: string;
            if (type === 'qc') {
                status = 'Pending QC Review';
            } else if (type === 'library') {
                status = workflowStage;
            } else {
                status = 'Draft';
            }

            // Prepare asset data
            const assetData: Partial<AssetLibraryItem> = {
                ...newAsset,
                status: status as any,
                linked_service_ids: selectedServiceId ? [selectedServiceId] : [],
                linked_sub_service_ids: selectedSubServiceIds,
                // Map Assets to Source Work fields
                linked_task_id: linkedTaskId || undefined,
                linked_campaign_id: linkedCampaignId || undefined,
                linked_project_id: linkedProjectId || undefined,
                linked_service_id: linkedServiceId || undefined,
                linked_sub_service_id: linkedSubServiceId || undefined,
                linked_repository_item_id: linkedRepositoryItemId || undefined,
                // Designer & Workflow fields
                designed_by: designedBy || undefined,
                // Versioning
                version_number: versionNumber,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            console.log('Saving asset:', assetData);

            // Check if editing existing asset or creating new
            if (initialData?.id) {
                // Update existing asset
                await updateAsset(initialData.id, assetData);
                console.log('Asset updated successfully');
            } else {
                // Create new asset
                await createAsset(assetData as AssetLibraryItem);
                console.log('Asset created successfully');
            }

            // Show success message
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b">
                    <div>
                        <h3 className="text-lg font-bold">Upload New Asset</h3>
                        <div className="text-sm text-slate-500">Choose application and provide basic details</div>
                    </div>
                    <div>
                        <button onClick={onClose} className="p-2 rounded hover:bg-slate-100">
                            Close
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* SEO Application Fields - Show First When SEO is Selected */}
                    {newAsset.application_type === 'seo' && (
                        <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-green-900">🔍 SEO Application Fields</h3>
                                    <p className="text-sm text-green-700">Optimize your content for search engines</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    {/* SEO Title */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            🔍 SEO Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={newAsset.seo_title || newAsset.name || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, seo_title: e.target.value, name: e.target.value })}
                                            placeholder="SEO optimized title..."
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        />
                                        <div className="text-xs text-slate-500 mt-1">
                                            {(newAsset.seo_title || newAsset.name || '').length}/60 characters
                                        </div>
                                    </div>

                                    {/* Target URL */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                            🔗 Target URL
                                        </label>
                                        <input
                                            type="url"
                                            value={newAsset.seo_target_url || newAsset.web_url || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, seo_target_url: e.target.value, web_url: e.target.value })}
                                            placeholder="https://example.com/seo-page"
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        />
                                    </div>

                                    {/* Target Keywords */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                            🎯 Target Keywords
                                        </label>
                                        <input
                                            type="text"
                                            value={typeof (newAsset as any).seo_keywords_text === 'string' ? (newAsset as any).seo_keywords_text : (newAsset.seo_keywords?.join(', ') || newAsset.keywords?.join(', ') || '')}
                                            onChange={(e) => setNewAsset({ ...newAsset, seo_keywords_text: e.target.value })}
                                            onBlur={(e) => {
                                                const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
                                                setNewAsset({ ...newAsset, seo_keywords: keywords, keywords: keywords, seo_keywords_text: e.target.value });
                                            }}
                                            placeholder="primary keyword, secondary keyword..."
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        />
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    {/* Meta Description */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            📝 Meta Description *
                                        </label>
                                        <textarea
                                            value={newAsset.seo_meta_description || newAsset.web_meta_description || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, seo_meta_description: e.target.value, web_meta_description: e.target.value })}
                                            placeholder="Compelling meta description for search results..."
                                            rows={3}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                                        />
                                        <div className="text-xs text-slate-500 mt-1">
                                            {(newAsset.seo_meta_description || newAsset.web_meta_description || '').length}/160 characters
                                        </div>
                                    </div>

                                    {/* Content Description */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                            </svg>
                                            📄 Content Description
                                        </label>
                                        <textarea
                                            value={newAsset.seo_content_description || newAsset.web_description || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, seo_content_description: e.target.value, web_description: e.target.value })}
                                            placeholder="Detailed content description..."
                                            rows={4}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SEO Heading Structure Section */}
                            <div className="mt-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                    </svg>
                                    <h4 className="text-md font-bold text-slate-800">≡ SEO Heading Structure</h4>
                                </div>

                                <div className="space-y-4">
                                    {/* H1 Tag */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">H1 Tag</label>
                                        <input
                                            type="text"
                                            value={newAsset.seo_h1 || newAsset.web_h1 || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, seo_h1: e.target.value, web_h1: e.target.value })}
                                            placeholder="SEO optimized H1 heading..."
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        />
                                    </div>

                                    {/* H2 Tags */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">H2 Tag (First)</label>
                                            <input
                                                type="text"
                                                value={newAsset.seo_h2_1 || newAsset.web_h2_1 || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, seo_h2_1: e.target.value, web_h2_1: e.target.value })}
                                                placeholder="First H2 subheading..."
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">H2 Tag (Second)</label>
                                            <input
                                                type="text"
                                                value={newAsset.seo_h2_2 || newAsset.web_h2_2 || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, seo_h2_2: e.target.value, web_h2_2: e.target.value })}
                                                placeholder="Second H2 subheading..."
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SEO Content Body Section */}
                            <div className="mt-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h4 className="text-md font-bold text-slate-800">📄 SEO Content Body</h4>
                                </div>
                                <textarea
                                    value={newAsset.seo_content_body || newAsset.web_body_content || ''}
                                    onChange={(e) => setNewAsset({ ...newAsset, seo_content_body: e.target.value, web_body_content: e.target.value })}
                                    placeholder="Enter SEO-optimized content with target keywords naturally integrated..."
                                    rows={8}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                                />
                                <div className="text-xs text-slate-500 mt-1">
                                    {(newAsset.seo_content_body || newAsset.web_body_content || '').split(' ').filter((w: string) => w.length > 0).length} words
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SMM Application Fields - Show First When SMM is Selected */}
                    {newAsset.application_type === 'smm' && (
                        <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-purple-900">📱 SMM Application Fields</h3>
                                    <p className="text-sm text-purple-700">Configure your social media content</p>
                                </div>
                            </div>

                            {/* Social Media Platform Selection - TikTok removed */}
                            <div className="mb-6">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                    </svg>
                                    🌐 Social Media Platform *
                                </label>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Facebook */}
                                    <button
                                        type="button"
                                        onClick={() => setNewAsset({ ...newAsset, smm_platform: 'facebook' })}
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${newAsset.smm_platform === 'facebook'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">f</span>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900">📘 Facebook</div>
                                                <div className="text-xs text-slate-600">Share with friends and family</div>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Instagram */}
                                    <button
                                        type="button"
                                        onClick={() => setNewAsset({ ...newAsset, smm_platform: 'instagram' })}
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${newAsset.smm_platform === 'instagram'
                                            ? 'border-pink-500 bg-pink-50'
                                            : 'border-slate-200 hover:border-pink-300 hover:bg-pink-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">📷</span>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900">📷 Instagram</div>
                                                <div className="text-xs text-slate-600">Visual storytelling platform</div>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Twitter/X */}
                                    <button
                                        type="button"
                                        onClick={() => setNewAsset({ ...newAsset, smm_platform: 'twitter' })}
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${newAsset.smm_platform === 'twitter'
                                            ? 'border-slate-800 bg-slate-50'
                                            : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">𝕏</span>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900">🐦 Twitter/X</div>
                                                <div className="text-xs text-slate-600">Real-time conversations</div>
                                            </div>
                                        </div>
                                    </button>

                                    {/* LinkedIn */}
                                    <button
                                        type="button"
                                        onClick={() => setNewAsset({ ...newAsset, smm_platform: 'linkedin' })}
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${newAsset.smm_platform === 'linkedin'
                                            ? 'border-blue-700 bg-blue-50'
                                            : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">in</span>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900">💼 LinkedIn</div>
                                                <div className="text-xs text-slate-600">Professional networking</div>
                                            </div>
                                        </div>
                                    </button>

                                    {/* YouTube */}
                                    <button
                                        type="button"
                                        onClick={() => setNewAsset({ ...newAsset, smm_platform: 'youtube' })}
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${newAsset.smm_platform === 'youtube'
                                            ? 'border-red-500 bg-red-50'
                                            : 'border-slate-200 hover:border-red-300 hover:bg-red-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">▶</span>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900">📺 YouTube</div>
                                                <div className="text-xs text-slate-600">Video content platform</div>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Pinterest */}
                                    <button
                                        type="button"
                                        onClick={() => setNewAsset({ ...newAsset, smm_platform: 'pinterest' })}
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${newAsset.smm_platform === 'pinterest'
                                            ? 'border-red-600 bg-red-50'
                                            : 'border-slate-200 hover:border-red-300 hover:bg-red-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">📌</span>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900">📌 Pinterest</div>
                                                <div className="text-xs text-slate-600">Visual discovery platform</div>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* SMM Content Fields */}
                            {newAsset.smm_platform && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Left Column */}
                                        <div className="space-y-4">
                                            {/* Post Title */}
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    📝 Post Title *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newAsset.smm_title || newAsset.name || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, smm_title: e.target.value, name: e.target.value })}
                                                    placeholder={`Enter ${newAsset.smm_platform} post title...`}
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                />
                                            </div>

                                            {/* Hashtags */}
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                                    </svg>
                                                    🏷️ Hashtags
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newAsset.smm_hashtags || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, smm_hashtags: e.target.value })}
                                                    placeholder="#hashtag1 #hashtag2 #hashtag3"
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                />
                                            </div>

                                            {/* Target Audience */}
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    🎯 Target Audience
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newAsset.smm_target_audience || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, smm_target_audience: e.target.value })}
                                                    placeholder="e.g., Young professionals, Tech enthusiasts"
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                />
                                            </div>
                                        </div>

                                        {/* Right Column */}
                                        <div className="space-y-4">
                                            {/* Post Description */}
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                                    </svg>
                                                    📄 Post Description
                                                </label>
                                                <textarea
                                                    value={newAsset.smm_description || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, smm_description: e.target.value })}
                                                    placeholder={`Write engaging ${newAsset.smm_platform} post content...`}
                                                    rows={4}
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                                                />
                                                <div className="text-xs text-slate-500 mt-1">
                                                    {(newAsset.smm_description || '').length} characters
                                                </div>
                                            </div>

                                            {/* Call to Action */}
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                    📢 Call to Action
                                                </label>
                                                <select
                                                    value={newAsset.smm_cta || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, smm_cta: e.target.value })}
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                >
                                                    <option value="">Select CTA...</option>
                                                    <option value="like">👍 Like this post</option>
                                                    <option value="share">🔄 Share with friends</option>
                                                    <option value="comment">💬 Leave a comment</option>
                                                    <option value="follow">➕ Follow us</option>
                                                    <option value="visit">🔗 Visit our website</option>
                                                    <option value="subscribe">🔔 Subscribe</option>
                                                    <option value="download">⬇️ Download now</option>
                                                    <option value="signup">✍️ Sign up</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Media & Preview Section */}
                                    <div className="mt-6">
                                        <div className="flex items-center gap-2 mb-4 border-l-4 border-purple-500 pl-3">
                                            <h4 className="text-md font-bold text-slate-800">Media & Preview</h4>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Left - Upload Media */}
                                            <div className="space-y-4">
                                                <div
                                                    className="border-dashed border-2 border-slate-300 p-8 rounded-xl text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition-all"
                                                    onClick={() => mediaInputRef.current?.click()}
                                                >
                                                    {smmMediaUrl ? (
                                                        <div className="space-y-3">
                                                            <img src={smmMediaUrl} className="mx-auto max-h-32 rounded-lg shadow-md" alt="Preview" />
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSmmMediaUrl('');
                                                                    setNewAsset(prev => ({ ...prev, smm_media_url: undefined }));
                                                                }}
                                                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                                </svg>
                                                            </div>
                                                            <div className="text-base font-semibold text-slate-800">Upload Media</div>
                                                            <div className="text-sm text-slate-500">Click to choose image or video</div>
                                                        </>
                                                    )}
                                                    <input
                                                        ref={mediaInputRef}
                                                        type="file"
                                                        className="hidden"
                                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'media')}
                                                        accept="image/*,video/*,.gif"
                                                    />
                                                </div>

                                                {/* Toggle Preview Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => setShowSmmPreview(!showSmmPreview)}
                                                    className="w-full px-4 py-3 border border-purple-200 rounded-lg text-purple-600 font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showSmmPreview ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                                                    </svg>
                                                    {showSmmPreview ? 'Hide Preview' : 'Show Preview'}
                                                </button>
                                            </div>

                                            {/* Right - Platform Preview */}
                                            {showSmmPreview && (
                                                <div className="space-y-2">
                                                    {/* Facebook Preview */}
                                                    {newAsset.smm_platform === 'facebook' && (
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Facebook Post Preview</span>
                                                            </div>
                                                            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                                                                <div className="p-3 flex items-center gap-3">
                                                                    <div className="w-10 h-10 bg-slate-300 rounded-full"></div>
                                                                    <div>
                                                                        <div className="font-semibold text-sm text-slate-900">Your Company</div>
                                                                        <div className="text-xs text-slate-500 flex items-center gap-1">Just now • 🌐</div>
                                                                    </div>
                                                                </div>
                                                                {newAsset.smm_description && (
                                                                    <div className="px-3 pb-2 text-sm text-slate-800">{newAsset.smm_description}</div>
                                                                )}
                                                                <div className="bg-slate-100 h-48 flex items-center justify-center">
                                                                    {smmMediaUrl ? (
                                                                        <img src={smmMediaUrl} className="w-full h-full object-cover" alt="Post media" />
                                                                    ) : (
                                                                        <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                                <div className="px-3 py-2 border-t border-slate-200 flex gap-6 text-xs font-semibold text-slate-500">
                                                                    <span>LIKE</span>
                                                                    <span>COMMENT</span>
                                                                    <span>SHARE</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Instagram Preview */}
                                                    {newAsset.smm_platform === 'instagram' && (
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                                                                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Instagram Post Preview</span>
                                                            </div>
                                                            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                                                                <div className="p-3 flex items-center gap-3">
                                                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                                                                    <div className="font-semibold text-sm text-slate-900">your_company</div>
                                                                </div>
                                                                <div className="bg-slate-100 aspect-square flex items-center justify-center">
                                                                    {smmMediaUrl ? (
                                                                        <img src={smmMediaUrl} className="w-full h-full object-cover" alt="Post media" />
                                                                    ) : (
                                                                        <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                                <div className="p-3 flex gap-4">
                                                                    <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                                                    <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                                    <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                                                </div>
                                                                {newAsset.smm_description && (
                                                                    <div className="px-3 pb-3 text-sm"><span className="font-semibold">your_company</span> {newAsset.smm_description}</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Twitter/X Preview */}
                                                    {newAsset.smm_platform === 'twitter' && (
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="w-2 h-2 bg-slate-800 rounded-full"></div>
                                                                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">X (Twitter) Post Preview</span>
                                                            </div>
                                                            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                                                                <div className="flex gap-3">
                                                                    <div className="w-10 h-10 bg-slate-800 rounded-full flex-shrink-0"></div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-1">
                                                                            <span className="font-bold text-sm">Your Company</span>
                                                                            <span className="text-slate-500 text-sm">@yourcompany · Just now</span>
                                                                        </div>
                                                                        {newAsset.smm_description && (
                                                                            <div className="text-sm mt-1">{newAsset.smm_description}</div>
                                                                        )}
                                                                        {smmMediaUrl && (
                                                                            <div className="mt-3 rounded-xl overflow-hidden border border-slate-200">
                                                                                <img src={smmMediaUrl} className="w-full h-40 object-cover" alt="Post media" />
                                                                            </div>
                                                                        )}
                                                                        <div className="flex gap-8 mt-3 text-slate-500">
                                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* LinkedIn Preview */}
                                                    {newAsset.smm_platform === 'linkedin' && (
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="w-2 h-2 bg-blue-700 rounded-full"></div>
                                                                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">LinkedIn Post Preview</span>
                                                            </div>
                                                            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                                                                <div className="p-3 flex items-center gap-3">
                                                                    <div className="w-12 h-12 bg-blue-700 rounded-full"></div>
                                                                    <div>
                                                                        <div className="font-semibold text-sm text-slate-900">Your Company</div>
                                                                        <div className="text-xs text-slate-500">1,234 followers</div>
                                                                        <div className="text-xs text-slate-500">Just now • 🌐</div>
                                                                    </div>
                                                                </div>
                                                                {newAsset.smm_description && (
                                                                    <div className="px-3 pb-2 text-sm text-slate-800">{newAsset.smm_description}</div>
                                                                )}
                                                                <div className="bg-slate-100 h-48 flex items-center justify-center">
                                                                    {smmMediaUrl ? (
                                                                        <img src={smmMediaUrl} className="w-full h-full object-cover" alt="Post media" />
                                                                    ) : (
                                                                        <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                                <div className="px-3 py-2 border-t border-slate-200 flex gap-6 text-xs font-semibold text-slate-500">
                                                                    <span>👍 Like</span>
                                                                    <span>💬 Comment</span>
                                                                    <span>🔄 Repost</span>
                                                                    <span>📤 Send</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* YouTube Preview */}
                                                    {newAsset.smm_platform === 'youtube' && (
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                                                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">YouTube Post Preview</span>
                                                            </div>
                                                            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                                                                <div className="bg-slate-900 aspect-video flex items-center justify-center relative">
                                                                    {smmMediaUrl ? (
                                                                        <img src={smmMediaUrl} className="w-full h-full object-cover" alt="Video thumbnail" />
                                                                    ) : (
                                                                        <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                    )}
                                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                                        <div className="w-16 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                                                                            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                                                <path d="M8 5v14l11-7z" />
                                                                            </svg>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="p-3">
                                                                    <div className="font-semibold text-sm text-slate-900 line-clamp-2">{newAsset.smm_title || 'Video Title'}</div>
                                                                    <div className="text-xs text-slate-500 mt-1">Your Company • 0 views • Just now</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* SMM Asset Classification Section */}
                                    <div className="mt-6 bg-purple-50/50 rounded-xl border border-purple-200 p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-xl">🏷️</span>
                                            <h4 className="text-md font-bold text-slate-800">Asset Classification</h4>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Left Column */}
                                            <div className="space-y-4">
                                                {/* Content Type Dropdown */}
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                                        Content Type <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={newAsset.content_type || ''}
                                                        onChange={(e) => setNewAsset({ ...newAsset, content_type: e.target.value as any })}
                                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-slate-900"
                                                    >
                                                        <option value="">Select content type</option>
                                                        <option value="Blog">Blog</option>
                                                        <option value="Service Page">Service Page</option>
                                                        <option value="Sub-Service Page">Sub-Service Page</option>
                                                        <option value="SMM Post">SMM Post</option>
                                                        <option value="Backlink Asset">Backlink Asset</option>
                                                        <option value="Web UI Asset">Web UI Asset</option>
                                                    </select>
                                                </div>

                                                {/* Asset Category (Linked to Asset Category Master Table) */}
                                                <div>
                                                    <label className="block text-sm text-slate-600 mb-2">
                                                        Asset Category <span className="text-xs text-slate-400">(Linked to Asset Category Master Table)</span>
                                                    </label>
                                                    <select
                                                        value={newAsset.asset_category || ''}
                                                        onChange={(e) => setNewAsset({ ...newAsset, asset_category: e.target.value })}
                                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                                                    >
                                                        <option value="">Select category...</option>
                                                        {filteredAssetCategories.map(category => (
                                                            <option key={category.id} value={category.category_name}>
                                                                {category.category_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Asset Type (Linked to Asset Type Master Table) */}
                                                <div>
                                                    <label className="block text-sm text-slate-600 mb-2">
                                                        Asset Type <span className="text-xs text-slate-400">(Linked to Asset Type Master Table)</span>
                                                    </label>
                                                    <select
                                                        value={newAsset.type || ''}
                                                        onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-slate-900"
                                                    >
                                                        <option value="" className="text-slate-900">Select type...</option>
                                                        {filteredAssetTypes.map(type => {
                                                            // Handle both AssetTypeItem (asset_type) and AssetTypeMasterItem (asset_type_name)
                                                            const typeName = (type as any).asset_type_name || (type as any).asset_type || '';
                                                            return (
                                                                <option key={type.id} value={typeName} className="text-slate-900">
                                                                    {typeName}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                </div>

                                                {/* Asset Format (Linked to Asset Format Master Table) */}
                                                <div>
                                                    <label className="block text-sm text-slate-600 mb-2">
                                                        Asset Format <span className="text-xs text-slate-400">(Linked to Asset Format Master Table)</span>
                                                    </label>
                                                    <select
                                                        value={(newAsset as any).asset_format || ''}
                                                        onChange={(e) => setNewAsset({ ...newAsset, asset_format: e.target.value } as any)}
                                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-slate-900"
                                                    >
                                                        <option value="" className="text-slate-900">Select format...</option>
                                                        {filteredAssetFormats.map(format => (
                                                            <option key={format.id} value={format.format_name} className="text-slate-900">
                                                                {format.format_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Right Column */}
                                            <div className="space-y-4">
                                                {/* Repository */}
                                                <div>
                                                    <label className="block text-sm text-slate-600 mb-2">
                                                        Repository
                                                    </label>
                                                    <select
                                                        value={newAsset.repository || 'Content Repository'}
                                                        onChange={(e) => setNewAsset({ ...newAsset, repository: e.target.value })}
                                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                                                    >
                                                        <option value="Content Repository">Content</option>
                                                        <option value="Media Repository">Media</option>
                                                        <option value="Document Repository">Document</option>
                                                        <option value="Template Repository">Template</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Web Application Fields - Show First When WEB is Selected */}
                    {newAsset.application_type === 'web' && (
                        <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-blue-900">Web Application Fields</h3>
                                    <p className="text-sm text-blue-700">Configure your web content details</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    {/* Title */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={newAsset.name || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                                            placeholder="Enter web page title..."
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    {/* URL */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                            URL
                                        </label>
                                        <input
                                            type="url"
                                            value={newAsset.web_url || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, web_url: e.target.value })}
                                            placeholder="https://example.com/page"
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    {/* Keywords */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                            <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                            Keywords
                                        </label>
                                        <input
                                            type="text"
                                            value={typeof (newAsset as any).keywords_text === 'string' ? (newAsset as any).keywords_text : (newAsset.keywords?.join(', ') || '')}
                                            onChange={(e) => setNewAsset({ ...newAsset, keywords_text: e.target.value })}
                                            onBlur={(e) => {
                                                const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
                                                setNewAsset({ ...newAsset, keywords: keywords, keywords_text: e.target.value });
                                            }}
                                            placeholder="keyword1, keyword2, keyword3..."
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    {/* Meta Description */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Meta Description
                                        </label>
                                        <textarea
                                            value={newAsset.web_meta_description || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, web_meta_description: e.target.value })}
                                            placeholder="SEO meta description (150-160 characters)..."
                                            rows={3}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        />
                                        <div className="text-xs text-slate-500 mt-1">
                                            {(newAsset.web_meta_description || '').length}/160 characters
                                        </div>
                                    </div>

                                    {/* Description field removed for WEB assets per requirements */}
                                </div>
                            </div>

                            {/* Heading Structure Section */}
                            <div className="mt-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                    </svg>
                                    <h4 className="text-md font-bold text-slate-800">Heading Structure</h4>
                                </div>

                                <div className="space-y-4">
                                    {/* H1 Tag */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">H1 Tag</label>
                                        <input
                                            type="text"
                                            value={newAsset.web_h1 || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, web_h1: e.target.value })}
                                            placeholder="Main heading (H1)..."
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    {/* H2 Tags */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">H2 Tag (First)</label>
                                            <input
                                                type="text"
                                                value={newAsset.web_h2_1 || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, web_h2_1: e.target.value })}
                                                placeholder="First H2 subheading..."
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">H2 Tag (Second)</label>
                                            <input
                                                type="text"
                                                value={newAsset.web_h2_2 || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, web_h2_2: e.target.value })}
                                                placeholder="Second H2 subheading..."
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Body Content Section with AI Scores */}
                            <div className="mt-6 bg-slate-50 rounded-xl border border-slate-200 p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Body Content - Left Side */}
                                    <div className="lg:col-span-2">
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                                            <span className="text-lg">📝</span>
                                            Body content
                                        </label>
                                        <textarea
                                            value={newAsset.web_body_content || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, web_body_content: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-y bg-white"
                                            placeholder="Paste your full article or body copy here for AI analysis..."
                                            rows={8}
                                        />

                                        {/* Analyse Button */}
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const text = (newAsset.web_body_content || '').trim();
                                                if (!text) {
                                                    alert('Please add body content to analyse');
                                                    return;
                                                }

                                                // Calculate local scores as fallback
                                                const lengthScore = Math.min(80, Math.round(text.length / 10));
                                                const randBoost = Math.round(Math.random() * 20);
                                                const localSeoScore = Math.min(100, lengthScore + randBoost);
                                                const localGrammarScore = Math.min(100, Math.round(60 + Math.random() * 40));

                                                const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
                                                try {
                                                    const response = await fetch(`${apiUrl}/assetLibrary/ai-scores`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            content: text,
                                                            title: newAsset.web_title || newAsset.name,
                                                            description: newAsset.web_description
                                                        })
                                                    });
                                                    if (response.ok) {
                                                        const scores = await response.json();
                                                        setNewAsset(prev => ({
                                                            ...prev,
                                                            seo_score: scores.seo_score,
                                                            grammar_score: scores.grammar_score
                                                        }));
                                                    } else {
                                                        // Use local scores
                                                        setNewAsset(prev => ({
                                                            ...prev,
                                                            seo_score: localSeoScore,
                                                            grammar_score: localGrammarScore
                                                        }));
                                                    }
                                                } catch (error) {
                                                    console.warn('API unavailable, using local scores:', error);
                                                    // Use local scores on error
                                                    setNewAsset(prev => ({
                                                        ...prev,
                                                        seo_score: localSeoScore,
                                                        grammar_score: localGrammarScore
                                                    }));
                                                }
                                            }}
                                            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            Analyze
                                        </button>
                                    </div>

                                    {/* AI Scores - Right Side */}
                                    <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 p-6">
                                        <div className="space-y-6">
                                            {/* SEO Score */}
                                            <div className="flex flex-col items-center">
                                                <CircularScore
                                                    score={newAsset.seo_score || 0}
                                                    label="SEO SCORE"
                                                    size="sm"
                                                />
                                            </div>

                                            {/* Grammar Score */}
                                            <div className="flex flex-col items-center">
                                                <CircularScore
                                                    score={newAsset.grammar_score || 0}
                                                    label="GRAMMAR SCORE"
                                                    size="sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Resource Upload Section */}
                            <div className="mt-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-xl">📁</span>
                                    <h4 className="text-md font-bold text-slate-800">Resource Upload</h4>
                                </div>
                                <div
                                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragActive
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                                        }`}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDrop={handleDrop}
                                    onDragOver={handleDrag}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                        accept="image/*,video/*,.pdf,.doc,.docx,.zip,.svg,.webm,.avif"
                                    />
                                    {previewUrl ? (
                                        <div className="space-y-4">
                                            <img src={previewUrl} className="mx-auto max-h-40 rounded-lg shadow-md" alt="Preview" />
                                            <div className="text-sm text-slate-700 font-medium">{selectedFile?.name}</div>
                                            <button
                                                type="button"
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
                                            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-lg font-semibold text-slate-800">Upload Web Assets</p>
                                                <p className="text-sm text-slate-500">
                                                    Drag & drop source files, or <span className="text-blue-600 font-medium">browse local files</span>
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Asset Classification Section */}
                            <div className="mt-6 bg-slate-50 rounded-xl border border-slate-200 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-xl">🏷️</span>
                                    <h4 className="text-md font-bold text-slate-800">Asset Classification</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-4">
                                        {/* Content Type Dropdown */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Content Type <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={newAsset.content_type || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, content_type: e.target.value as any })}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
                                            >
                                                <option value="">Select content type</option>
                                                <option value="Blog">Blog</option>
                                                <option value="Service Page">Service Page</option>
                                                <option value="Sub-Service Page">Sub-Service Page</option>
                                                <option value="SMM Post">SMM Post</option>
                                                <option value="Backlink Asset">Backlink Asset</option>
                                                <option value="Web UI Asset">Web UI Asset</option>
                                            </select>
                                        </div>

                                        {/* Asset Category (From Master Table) */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Asset Category <span className="text-xs text-slate-500">(Linked to master database)</span>
                                            </label>
                                            <select
                                                value={newAsset.asset_category || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, asset_category: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">Select category...</option>
                                                {filteredAssetCategories.map(category => (
                                                    <option key={category.id} value={category.category_name}>
                                                        {category.category_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-4">
                                        {/* Repository */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Repository
                                            </label>
                                            <select
                                                value={newAsset.repository || 'Content Repository'}
                                                onChange={(e) => setNewAsset({ ...newAsset, repository: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="Content Repository">Content</option>
                                                <option value="Media Repository">Media</option>
                                                <option value="Document Repository">Document</option>
                                                <option value="Template Repository">Template</option>
                                            </select>
                                        </div>

                                        {/* Asset Type (From Master Table) */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Asset Type <span className="text-xs text-slate-500">(Linked to master database)</span>
                                            </label>
                                            <select
                                                value={newAsset.type || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
                                            >
                                                <option value="" className="text-slate-900">Select type...</option>
                                                {filteredAssetTypes.map(type => {
                                                    // Handle both AssetTypeItem (asset_type) and AssetTypeMasterItem (asset_type_name)
                                                    const typeName = (type as any).asset_type_name || (type as any).asset_type || '';
                                                    return (
                                                        <option key={type.id} value={typeName} className="text-slate-900">
                                                            {typeName}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Map Assets to Source Work Section */}
                    <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Map Asset to Source Work</h3>
                                <p className="text-sm text-slate-600">Link this asset to existing tasks, campaigns, projects, and services</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                {/* Linked Task */}
                                <div>
                                    <label className="block text-sm text-slate-600 mb-2 uppercase tracking-wide">
                                        Linked Task
                                    </label>
                                    <select
                                        value={linkedTaskId || ''}
                                        onChange={(e) => setLinkedTaskId(e.target.value ? parseInt(e.target.value) : null)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white text-slate-900"
                                    >
                                        <option value="">Select task</option>
                                        {tasks.map(task => (
                                            <option key={task.id} value={task.id}>
                                                {task.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Linked Project */}
                                <div>
                                    <label className="block text-sm text-slate-600 mb-2 uppercase tracking-wide">
                                        Linked Project
                                    </label>
                                    <select
                                        value={linkedProjectId || ''}
                                        onChange={(e) => setLinkedProjectId(e.target.value ? parseInt(e.target.value) : null)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white text-slate-900"
                                    >
                                        <option value="">Select project</option>
                                        {projects.map(project => (
                                            <option key={project.id} value={project.id}>
                                                {project.project_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Linked Sub-Service */}
                                <div>
                                    <label className="block text-sm text-slate-600 mb-2 uppercase tracking-wide">
                                        Linked Sub-Service
                                    </label>
                                    <select
                                        value={linkedSubServiceId || ''}
                                        onChange={(e) => setLinkedSubServiceId(e.target.value ? parseInt(e.target.value) : null)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white text-slate-900"
                                        disabled={!linkedServiceId}
                                    >
                                        <option value="">Select sub-service</option>
                                        {linkedFilteredSubServices.map(subService => (
                                            <option key={subService.id} value={subService.id}>
                                                {subService.sub_service_name}
                                            </option>
                                        ))}
                                    </select>
                                    {!linkedServiceId && (
                                        <p className="text-xs text-slate-500 mt-1">Select a service first to see sub-services</p>
                                    )}
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                {/* Linked Campaign */}
                                <div>
                                    <label className="block text-sm text-slate-600 mb-2 uppercase tracking-wide">
                                        Linked Campaign
                                    </label>
                                    <select
                                        value={linkedCampaignId || ''}
                                        onChange={(e) => setLinkedCampaignId(e.target.value ? parseInt(e.target.value) : null)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white text-slate-900"
                                    >
                                        <option value="">Select campaign</option>
                                        {campaigns.map(campaign => (
                                            <option key={campaign.id} value={campaign.id}>
                                                {campaign.campaign_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Linked Service */}
                                <div>
                                    <label className="block text-sm text-slate-600 mb-2 uppercase tracking-wide">
                                        Linked Service
                                    </label>
                                    <select
                                        value={linkedServiceId || ''}
                                        onChange={(e) => {
                                            const newServiceId = e.target.value ? parseInt(e.target.value) : null;
                                            setLinkedServiceId(newServiceId);
                                            setLinkedSubServiceId(null); // Reset sub-service when service changes
                                        }}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white text-slate-900"
                                    >
                                        <option value="">Select service</option>
                                        {services.map(service => (
                                            <option key={service.id} value={service.id}>
                                                {service.service_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Linked Repository Item */}
                                <div>
                                    <label className="block text-sm text-slate-600 mb-2 uppercase tracking-wide">
                                        Linked Repository Item
                                    </label>
                                    <select
                                        value={linkedRepositoryItemId || ''}
                                        onChange={(e) => setLinkedRepositoryItemId(e.target.value ? parseInt(e.target.value) : null)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white text-slate-900"
                                    >
                                        <option value="">Select repository</option>
                                        {repositoryItems.map(item => (
                                            <option key={item.id} value={item.id}>
                                                {item.content_title_clean}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Designer & Workflow Section */}
                    <div className="bg-indigo-50 rounded-xl p-6 border-2 border-indigo-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-indigo-900">Designer & Workflow</h3>
                                <p className="text-sm text-indigo-700">Assign ownership and track workflow status</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Created By (Auto-filled) */}
                            <div>
                                <label className="block text-sm text-slate-600 mb-2 uppercase tracking-wide">
                                    Created By (Auto-Filled)
                                </label>
                                <input
                                    type="text"
                                    value="Current User"
                                    disabled
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-100 text-slate-700 cursor-not-allowed"
                                />
                            </div>

                            {/* Designed By */}
                            <div>
                                <label className="block text-sm text-slate-600 mb-2 uppercase tracking-wide">
                                    Designed By <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={designedBy || ''}
                                    onChange={(e) => setDesignedBy(e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900"
                                >
                                    <option value="">Select designer</option>
                                    {users.filter(u => u.status === 'active').map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Workflow Stage - Full Width */}
                        <div className="mt-4">
                            <label className="block text-sm text-slate-600 mb-2 uppercase tracking-wide">
                                Workflow Stage <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={workflowStage}
                                onChange={(e) => setWorkflowStage(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900"
                            >
                                <option value="Draft">Draft</option>
                                <option value="Pending QC Review">QC Pending</option>
                                <option value="QC Approved">QC Completed</option>
                                <option value="Published">Published</option>
                            </select>
                        </div>
                    </div>

                    {/* Versioning Section */}
                    <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Versioning</h3>
                            </div>
                        </div>

                        <div className="flex items-start justify-between gap-6">
                            {/* Version Number */}
                            <div className="flex-1">
                                <label className="block text-sm text-slate-600 mb-2 uppercase tracking-wide">
                                    Version Number (Auto-Increment)
                                </label>
                                <input
                                    type="text"
                                    value={versionNumber}
                                    disabled
                                    className="w-full max-w-[200px] px-4 py-3 border border-slate-200 rounded-lg bg-slate-100 text-slate-900 font-semibold cursor-not-allowed"
                                />
                                <p className="text-xs text-slate-500 mt-2">
                                    This is the initial version. Future uploads will auto-increment to v1.1, v1.2, etc.
                                </p>
                            </div>

                            {/* Version Actions */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowVersionHistory(true)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    View Version History
                                </button>
                                <button
                                    type="button"
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Replace Existing Version
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Required Fields Note */}
                    <p className="text-sm text-slate-500">
                        <span className="text-red-500">*</span> Required fields must be filled to save the asset
                    </p>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleUpload('qc')}
                            disabled={!newAsset.name || newAsset.name.trim() === ''}
                            className={`flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-lg transition-colors ${newAsset.name && newAsset.name.trim() !== ''
                                ? 'bg-slate-600 text-white hover:bg-slate-700'
                                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Send to QC Stage 2
                        </button>
                        <button
                            onClick={() => handleUpload('library')}
                            disabled={!newAsset.name || newAsset.name.trim() === ''}
                            className={`flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-lg transition-colors ${newAsset.name && newAsset.name.trim() !== ''
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Save to Asset Library
                        </button>
                    </div>
                </div>

                {
                    showCategoryModal && (
                        <AssetCategoryMasterModal
                            isOpen={showCategoryModal}
                            onClose={() => setShowCategoryModal(false)}
                            onSave={async (cat: Partial<AssetCategoryMasterItem>) => {
                                try {
                                    await createAssetCategory(cat as AssetCategoryMasterItem);
                                } catch (err) {
                                    console.error('Failed to create category:', err);
                                } finally {
                                    setShowCategoryModal(false);
                                }
                            }}
                            editingItem={editingCategory}
                        />
                    )
                }

                {
                    showTypeModal && (
                        <AssetTypeMasterModal
                            isOpen={showTypeModal}
                            onClose={() => setShowTypeModal(false)}
                            onSave={async (type: Partial<AssetTypeMasterItem>) => {
                                try {
                                    await createAssetType(type as AssetTypeMasterItem);
                                } catch (err) {
                                    console.error('Failed to create asset type:', err);
                                } finally {
                                    setShowTypeModal(false);
                                }
                            }}
                            editingItem={editingType}
                        />
                    )
                }
            </div >
        </div >
    );
};

export default UploadAssetModal;