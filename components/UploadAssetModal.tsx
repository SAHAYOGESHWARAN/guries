import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useData } from '../hooks/useData';
import type { AssetLibraryItem, Service, SubServiceItem } from '../types';

interface UploadAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    initialData?: Partial<AssetLibraryItem>;
}

const UploadAssetModal: React.FC<UploadAssetModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
    const { create: createAsset } = useData<AssetLibraryItem>('assetLibrary');
    const { data: services = [] } = useData<Service>('services');
    const { data: subServices = [] } = useData<SubServiceItem>('subServices');

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaInputRef = useRef<HTMLInputElement>(null);

    const [newAsset, setNewAsset] = useState<Partial<AssetLibraryItem>>({
        name: '',
        type: 'article',
        asset_category: '',
        asset_format: '',
        repository: 'Content Repository',
        usage_status: 'Available',
        status: 'Draft',
        application_type: undefined,
        keywords: [],
        linked_service_ids: [],
        linked_sub_service_ids: [],
        // Web/SEO specific fields
        web_title: '',
        web_description: '',
        web_meta_description: '',
        web_keywords: '',
        web_url: '',
        web_h1: '',
        web_h2_1: '',
        web_h2_2: '',
        web_body_content: '',
        web_thumbnail: '',
        seo_score: undefined,
        grammar_score: undefined,
        ...initialData, // Apply initial data if provided
    });

    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);

    // Update state when initialData changes or modal opens
    React.useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setNewAsset(prev => ({
                    name: '',
                    type: 'article',
                    asset_category: '',
                    asset_format: '',
                    repository: 'Content Repository',
                    usage_status: 'Available',
                    status: 'Draft',
                    application_type: undefined,
                    keywords: [],
                    linked_service_ids: [],
                    linked_sub_service_ids: [],
                    web_title: '',
                    web_description: '',
                    web_meta_description: '',
                    web_keywords: '',
                    web_url: '',
                    web_h1: '',
                    web_h2_1: '',
                    web_h2_2: '',
                    web_body_content: '',
                    web_thumbnail: '',
                    seo_score: undefined,
                    grammar_score: undefined,
                    ...initialData
                }));
            }
        }
    }, [initialData, isOpen]);

    // Reset state when modal closes
    React.useEffect(() => {
        if (!isOpen) {
            setSelectedFile(null);
            setPreviewUrl('');
            setSelectedServiceId(null);
            setSelectedSubServiceIds([]);
            setViewVendorHistory(false);
            setReplaceExistingVersion(false);
        }
    }, [isOpen]);
    const [selectedSubServiceIds, setSelectedSubServiceIds] = useState<number[]>([]);

    // Footer options state
    const [viewVendorHistory, setViewVendorHistory] = useState(false);
    const [replaceExistingVersion, setReplaceExistingVersion] = useState(false);
    const [uploadMode, setUploadMode] = useState<'draft' | 'qc'>('qc');

    // Helper function to check if asset is ready for QC submission
    const isQcReady = useMemo(() => {
        if (!newAsset.name?.trim() || !newAsset.application_type) return false;

        // Check if file is provided (for new uploads)
        if (!selectedFile && !newAsset.file_url) return false;

        // Application-specific validation
        if (newAsset.application_type === 'web' || newAsset.application_type === 'seo') {
            return newAsset.web_title?.trim() && newAsset.web_description?.trim();
        }

        if (newAsset.application_type === 'smm') {
            return newAsset.smm_platform && newAsset.smm_description?.trim() && newAsset.smm_media_type;
        }

        return true;
    }, [newAsset, selectedFile]);

    // File upload handler for SMM media
    const handleFileUpload = useCallback((file: File, type: 'thumbnail' | 'media') => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            if (type === 'media') {
                setNewAsset({
                    ...newAsset,
                    smm_media_url: base64String
                });
            }
        };
        reader.readAsDataURL(file);
    }, [newAsset]);

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

    const handleUpload = useCallback(async (uploadMode: 'draft' | 'qc' = 'qc') => {
        // Basic validation for all uploads
        if (!newAsset.name?.trim()) {
            alert('Please enter an asset name');
            return;
        }

        // File validation - more lenient for drafts
        if (!selectedFile && !newAsset.file_url && uploadMode === 'qc') {
            alert('Please select a file to upload for QC submission');
            return;
        }

        // QC-specific validation (stricter requirements)
        if (uploadMode === 'qc') {
            // Application type is required for QC
            if (!newAsset.application_type) {
                alert('Please select an application type (WEB, SEO, or SMM) for QC submission');
                return;
            }

            // Web/SEO-specific validation for QC
            if (newAsset.application_type === 'web' || newAsset.application_type === 'seo') {
                if (!newAsset.web_title?.trim()) {
                    alert('Please enter a title for QC submission');
                    return;
                }
                if (!newAsset.web_description?.trim()) {
                    alert('Please enter a description for QC submission');
                    return;
                }
            }

            // SMM-specific validation for QC
            if (newAsset.application_type === 'smm') {
                if (!newAsset.smm_platform) {
                    alert('Please select a social media platform for QC submission');
                    return;
                }
                if (!newAsset.smm_description?.trim()) {
                    alert('Please enter a post caption/description for QC submission');
                    return;
                }
                if (!newAsset.smm_media_type) {
                    alert('Please select a content type for QC submission');
                    return;
                }
            }

            // AI scores validation for QC (optional but recommended)
            if (newAsset.seo_score && (newAsset.seo_score < 0 || newAsset.seo_score > 100)) {
                alert('SEO score must be between 0-100');
                return;
            }
            if (newAsset.grammar_score && (newAsset.grammar_score < 0 || newAsset.grammar_score > 100)) {
                alert('Grammar score must be between 0-100');
                return;
            }
        }

        // Draft validation (more lenient)
        if (uploadMode === 'draft') {
            // For drafts, we only need basic info
            // Application type validation is relaxed for drafts
            if (newAsset.application_type === 'smm' && newAsset.smm_platform && !newAsset.smm_media_type) {
                alert('Please select a content type when platform is selected');
                return;
            }
        }

        setIsUploading(true);
        try {
            // Build the linked IDs from the selected service and sub-services
            const linkedServiceIds = selectedServiceId ? [selectedServiceId] : [];
            const linkedSubServiceIds = selectedSubServiceIds;

            // Build mapped_to display string
            let mappedToString = '';
            if (selectedServiceId) {
                const service = services.find(s => s.id === selectedServiceId);
                if (service) {
                    mappedToString = service.service_name;
                    if (selectedSubServiceIds.length > 0) {
                        const subServiceNames = selectedSubServiceIds
                            .map(id => subServices.find(ss => ss.id === id)?.sub_service_name)
                            .filter(Boolean)
                            .join(', ');
                        if (subServiceNames) {
                            mappedToString += ` / ${subServiceNames}`;
                        }
                    }
                }
            }

            const assetPayload = {
                ...newAsset,
                date: new Date().toISOString(),
                linked_service_ids: linkedServiceIds,
                linked_sub_service_ids: linkedSubServiceIds,
                mapped_to: mappedToString || newAsset.mapped_to,
                linking_active: false,
                status: uploadMode === 'qc' ? 'Pending QC Review' : 'Draft',
                submitted_by: uploadMode === 'qc' ? 1 : undefined, // TODO: Get from auth context
                submitted_at: uploadMode === 'qc' ? new Date().toISOString() : undefined,
                // Add vendor history and version replacement flags
                vendor_history_viewed: viewVendorHistory,
                is_version_replacement: replaceExistingVersion
            };

            await createAsset(assetPayload as AssetLibraryItem);

            // Show success message based on upload mode
            if (uploadMode === 'qc') {
                alert(`✅ Asset "${newAsset.name}" has been successfully submitted to QC Queue for review!`);
            } else {
                alert(`✅ Asset "${newAsset.name}" has been saved as draft successfully!`);
            }

            // Reset form
            setSelectedFile(null);
            setPreviewUrl('');
            setSelectedServiceId(null);
            setSelectedSubServiceIds([]);
            setViewVendorHistory(false);
            setReplaceExistingVersion(false);
            setNewAsset({
                name: '',
                type: 'article',
                asset_category: '',
                asset_format: '',
                repository: 'Content Repository',
                usage_status: 'Available',
                status: 'Draft',
                application_type: undefined,
                keywords: [],
                linked_service_ids: [],
                linked_sub_service_ids: [],
                // Web/SEO specific fields
                web_title: '',
                web_description: '',
                web_meta_description: '',
                web_keywords: '',
                web_url: '',
                web_h1: '',
                web_h2_1: '',
                web_h2_2: '',
                web_body_content: '',
                web_thumbnail: '',
                seo_score: undefined,
                grammar_score: undefined,
            });

            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Upload failed:', error);
            const errorMessage = uploadMode === 'qc'
                ? 'Failed to submit asset to QC Queue. Please check your inputs and try again.'
                : 'Failed to save asset as draft. Please try again.';
            alert(`❌ ${errorMessage}`);
        } finally {
            setIsUploading(false);
        }
    }, [newAsset, selectedFile, createAsset, selectedServiceId, selectedSubServiceIds, services, subServices, onSuccess, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto ${newAsset.application_type === 'smm' ? 'max-w-6xl' : 'max-w-4xl'
                }`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Upload New Asset</h2>
                            <p className="text-sm text-slate-600">Add new media content to the central asset library</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* File Upload Area */}
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${dragActive
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50'
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

                        {/* Hidden file input for SMM media */}
                        <input
                            ref={mediaInputRef}
                            type="file"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'media')}
                            className="hidden"
                            accept="image/*,video/*"
                        />

                        {previewUrl ? (
                            <div className="space-y-4">
                                <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-md" />
                                <div className="text-center">
                                    <p className="text-sm font-medium text-slate-700">{selectedFile?.name}</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {selectedFile && `${(selectedFile.size / 1024).toFixed(2)} KB`}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedFile(null);
                                        setPreviewUrl('');
                                    }}
                                    className="text-sm text-red-600 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    Remove File
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-base font-semibold text-slate-700 mb-2">
                                        {newAsset.application_type === 'smm'
                                            ? 'Upload your social media content'
                                            : 'Drag & drop your files here, or click to browse'
                                        }
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {newAsset.application_type === 'smm'
                                            ? 'Select a platform and content type below for specific upload options'
                                            : 'Supported formats: PNG, JPG, SVG, PDF, MP4, WEBM, AVIF'
                                        }
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            {/* Asset Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Asset Name
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newAsset.name}
                                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    placeholder="Enter asset name..."
                                />
                            </div>

                            {/* Content Type */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Content Type</label>
                                <select
                                    value={newAsset.application_type || ''}
                                    onChange={(e) => setNewAsset({ ...newAsset, application_type: e.target.value as any })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white cursor-pointer"
                                >
                                    <option value="">Select content type...</option>
                                    <option value="web">WEB</option>
                                    <option value="seo">SEO</option>
                                    <option value="smm">SMM</option>
                                </select>
                            </div>

                            {/* Asset Category */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Asset Category</label>
                                <input
                                    type="text"
                                    value={newAsset.asset_category || ''}
                                    onChange={(e) => setNewAsset({ ...newAsset, asset_category: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    placeholder="Enter asset category..."
                                />
                            </div>

                            {/* Asset Format */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Asset Format</label>
                                <select
                                    value={newAsset.asset_format || ''}
                                    onChange={(e) => setNewAsset({ ...newAsset, asset_format: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white cursor-pointer"
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
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            {/* Map Asset to Source Work */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Map Asset to Source Work</label>
                                <select
                                    value={selectedServiceId || ''}
                                    onChange={(e) => {
                                        const serviceId = e.target.value ? parseInt(e.target.value) : null;
                                        setSelectedServiceId(serviceId);
                                        setSelectedSubServiceIds([]);
                                    }}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white cursor-pointer"
                                >
                                    <option value="">Select service...</option>
                                    {services.map(service => (
                                        <option key={service.id} value={service.id}>
                                            {service.service_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Sub-Services */}
                            {selectedServiceId && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Sub-Services</label>
                                    <div className="border border-slate-300 rounded-lg p-3 max-h-32 overflow-y-auto bg-slate-50">
                                        {subServices
                                            .filter(ss => ss.parent_service_id === selectedServiceId)
                                            .map(subService => (
                                                <label key={subService.id} className="flex items-center gap-2 p-1 hover:bg-white rounded cursor-pointer transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSubServiceIds.includes(subService.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedSubServiceIds([...selectedSubServiceIds, subService.id]);
                                                            } else {
                                                                setSelectedSubServiceIds(selectedSubServiceIds.filter(id => id !== subService.id));
                                                            }
                                                        }}
                                                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                                    />
                                                    <span className="text-sm text-slate-700">{subService.sub_service_name}</span>
                                                </label>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Repository */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Repository</label>
                                <select
                                    value={newAsset.repository}
                                    onChange={(e) => setNewAsset({ ...newAsset, repository: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white cursor-pointer"
                                >
                                    <option value="Content Repository">Content Repository</option>
                                    <option value="SMM Repository">SMM Repository</option>
                                    <option value="SEO Repository">SEO Repository</option>
                                    <option value="Design Repository">Design Repository</option>
                                </select>
                            </div>

                            {/* Usage Status */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Usage Status</label>
                                <select
                                    value={newAsset.usage_status}
                                    onChange={(e) => setNewAsset({ ...newAsset, usage_status: e.target.value as any })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white cursor-pointer"
                                >
                                    <option value="Available">Available</option>
                                    <option value="In Use">In Use</option>
                                    <option value="Archived">Archived</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Keywords */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Keywords</label>
                        <input
                            type="text"
                            value={newAsset.keywords?.join(', ') || ''}
                            onChange={(e) => {
                                const keywordArray = e.target.value.split(',').map(k => k.trim()).filter(k => k.length > 0);
                                setNewAsset({ ...newAsset, keywords: keywordArray });
                            }}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            placeholder="Enter keywords separated by commas..."
                        />
                    </div>

                    {/* Web Application Fields */}
                    {newAsset.application_type === 'web' && (
                        <div className="space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 shadow-sm">
                            <div className="flex items-center gap-3 pb-4 border-b-2 border-blue-200">
                                <div className="bg-blue-600 p-2 rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s1.343-9 3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-blue-900">🌐 Web Application Fields</h4>
                                    <p className="text-sm text-blue-600">Configure your web content details</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            📝 Title
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={newAsset.web_title || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, web_title: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="Enter web page title..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            🔗 URL
                                        </label>
                                        <input
                                            type="url"
                                            value={newAsset.web_url || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, web_url: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="https://example.com/page"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            🏷️ Keywords
                                        </label>
                                        <input
                                            type="text"
                                            value={newAsset.web_keywords || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, web_keywords: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="keyword1, keyword2, keyword3..."
                                        />
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            📄 Meta Description
                                        </label>
                                        <textarea
                                            value={newAsset.web_meta_description || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, web_meta_description: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="SEO meta description (150-160 characters)..."
                                            rows={3}
                                            maxLength={160}
                                        />
                                        <div className="text-xs text-slate-500 mt-1 text-right">
                                            {(newAsset.web_meta_description || '').length}/160 characters
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            📋 Description
                                        </label>
                                        <textarea
                                            value={newAsset.web_description || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, web_description: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="Detailed description of the web content..."
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Heading Structure */}
                            <div className="space-y-4">
                                <h5 className="font-bold text-slate-800 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                    </svg>
                                    Heading Structure
                                </h5>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        H1 Tag
                                    </label>
                                    <input
                                        type="text"
                                        value={newAsset.web_h1 || ''}
                                        onChange={(e) => setNewAsset({ ...newAsset, web_h1: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="Main heading (H1)..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            H2 Tag (First)
                                        </label>
                                        <input
                                            type="text"
                                            value={newAsset.web_h2_1 || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, web_h2_1: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="First H2 subheading..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            H2 Tag (Second)
                                        </label>
                                        <input
                                            type="text"
                                            value={newAsset.web_h2_2 || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, web_h2_2: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="Second H2 subheading..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Body Content */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Body Content
                                </label>
                                <textarea
                                    value={newAsset.web_body_content || ''}
                                    onChange={(e) => setNewAsset({ ...newAsset, web_body_content: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    placeholder="Enter the main body content for your web page..."
                                    rows={6}
                                />
                                <div className="text-xs text-slate-500 mt-1">
                                    💡 You can use Markdown formatting for rich text content
                                </div>
                            </div>

                            {/* AI Quality Check */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                                <h6 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    AI Quality Check
                                </h6>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-2">SEO Score (0-100)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={newAsset.seo_score || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, seo_score: parseInt(e.target.value) || undefined })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                            placeholder="0-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-2">Grammar Score (0-100)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={newAsset.grammar_score || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, grammar_score: parseInt(e.target.value) || undefined })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                            placeholder="0-100"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        try {
                                            // Simulate AI analysis
                                            const seoScore = Math.floor(Math.random() * 30) + 70; // 70-100
                                            const grammarScore = Math.floor(Math.random() * 20) + 80; // 80-100

                                            setNewAsset({
                                                ...newAsset,
                                                seo_score: seoScore,
                                                grammar_score: grammarScore
                                            });
                                        } catch (error) {
                                            console.error('Failed to generate AI scores:', error);
                                        }
                                    }}
                                    className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    Analyze Quality
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SEO Application Fields (same as Web) */}
                    {newAsset.application_type === 'seo' && (
                        <div className="space-y-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 shadow-sm">
                            <div className="flex items-center gap-3 pb-4 border-b-2 border-green-200">
                                <div className="bg-green-600 p-2 rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-green-900">🔍 SEO Application Fields</h4>
                                    <p className="text-sm text-green-600">Optimize your content for search engines</p>
                                </div>
                            </div>

                            {/* Same fields as web but with SEO focus */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            📝 SEO Title
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={newAsset.web_title || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, web_title: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                            placeholder="SEO optimized title..."
                                            maxLength={60}
                                        />
                                        <div className="text-xs text-slate-500 mt-1 text-right">
                                            {(newAsset.web_title || '').length}/60 characters
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            🔗 Target URL
                                        </label>
                                        <input
                                            type="url"
                                            value={newAsset.web_url || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, web_url: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                            placeholder="https://example.com/seo-page"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            🎯 Target Keywords
                                        </label>
                                        <input
                                            type="text"
                                            value={newAsset.web_keywords || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, web_keywords: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                            placeholder="primary keyword, secondary keyword..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            📄 Meta Description
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <textarea
                                            value={newAsset.web_meta_description || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, web_meta_description: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                            placeholder="Compelling meta description for search results..."
                                            rows={3}
                                            maxLength={160}
                                        />
                                        <div className="text-xs text-slate-500 mt-1 text-right">
                                            {(newAsset.web_meta_description || '').length}/160 characters
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            📋 Content Description
                                        </label>
                                        <textarea
                                            value={newAsset.web_description || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, web_description: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                            placeholder="Detailed content description..."
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Same heading structure and body content as web */}
                            <div className="space-y-4">
                                <h5 className="font-bold text-slate-800 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                    </svg>
                                    SEO Heading Structure
                                </h5>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">H1 Tag</label>
                                    <input
                                        type="text"
                                        value={newAsset.web_h1 || ''}
                                        onChange={(e) => setNewAsset({ ...newAsset, web_h1: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                        placeholder="SEO optimized H1 heading..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">H2 Tag (First)</label>
                                        <input
                                            type="text"
                                            value={newAsset.web_h2_1 || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, web_h2_1: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                            placeholder="First H2 subheading..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">H2 Tag (Second)</label>
                                        <input
                                            type="text"
                                            value={newAsset.web_h2_2 || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, web_h2_2: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                            placeholder="Second H2 subheading..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    SEO Content Body
                                </label>
                                <textarea
                                    value={newAsset.web_body_content || ''}
                                    onChange={(e) => setNewAsset({ ...newAsset, web_body_content: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                    placeholder="SEO optimized content with target keywords..."
                                    rows={6}
                                />
                                <div className="text-xs text-slate-500 mt-1">
                                    💡 Include target keywords naturally throughout the content
                                </div>
                            </div>

                            {/* AI Quality Check - same as web */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                <h6 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    SEO Quality Analysis
                                </h6>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-2">SEO Score (0-100)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={newAsset.seo_score || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, seo_score: parseInt(e.target.value) || undefined })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="0-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-2">Grammar Score (0-100)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={newAsset.grammar_score || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, grammar_score: parseInt(e.target.value) || undefined })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            placeholder="0-100"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        try {
                                            const seoScore = Math.floor(Math.random() * 30) + 70;
                                            const grammarScore = Math.floor(Math.random() * 20) + 80;

                                            setNewAsset({
                                                ...newAsset,
                                                seo_score: seoScore,
                                                grammar_score: grammarScore
                                            });
                                        } catch (error) {
                                            console.error('Failed to generate AI scores:', error);
                                        }
                                    }}
                                    className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    Analyze SEO Quality
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SMM Application Fields */}
                    {newAsset.application_type === 'smm' && (
                        <div className="space-y-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 shadow-sm">
                            <div className="flex items-center gap-3 pb-4 border-b-2 border-purple-200">
                                <div className="bg-purple-600 p-2 rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-purple-900">📱 SMM Application Fields</h4>
                                    <p className="text-sm text-purple-600">Configure your social media content</p>
                                </div>
                            </div>

                            {/* Platform Selector */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">
                                    🌐 Social Media Platform
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                    {[
                                        { value: 'facebook', label: 'Facebook', icon: '📘', color: 'from-blue-600 to-blue-700', description: 'Share with friends and family' },
                                        { value: 'instagram', label: 'Instagram', icon: '📷', color: 'from-pink-500 to-purple-600', description: 'Visual storytelling platform' },
                                        { value: 'twitter', label: 'Twitter/X', icon: '🐦', color: 'from-sky-400 to-blue-500', description: 'Real-time conversations' },
                                        { value: 'linkedin', label: 'LinkedIn', icon: '💼', color: 'from-blue-700 to-blue-800', description: 'Professional networking' },
                                        { value: 'youtube', label: 'YouTube', icon: '🎥', color: 'from-red-600 to-red-700', description: 'Video content platform' },
                                        { value: 'tiktok', label: 'TikTok', icon: '🎵', color: 'from-black to-gray-800', description: 'Short-form video content' }
                                    ].map((platform) => (
                                        <button
                                            key={platform.value}
                                            type="button"
                                            onClick={() => setNewAsset({ ...newAsset, smm_platform: platform.value as any })}
                                            className={`p-3 rounded-xl border-2 transition-all text-left hover:scale-105 ${newAsset.smm_platform === platform.value
                                                ? `bg-gradient-to-r ${platform.color} text-white border-transparent shadow-lg`
                                                : 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-md'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg">{platform.icon}</span>
                                                <span className={`font-bold text-xs ${newAsset.smm_platform === platform.value ? 'text-white' : 'text-slate-800'
                                                    }`}>
                                                    {platform.label}
                                                </span>
                                            </div>
                                            <p className={`text-xs ${newAsset.smm_platform === platform.value ? 'text-white/90' : 'text-slate-500'
                                                }`}>
                                                {platform.description}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Platform-specific fields */}
                            {newAsset.smm_platform && (
                                <div className="space-y-4 bg-white rounded-xl p-4 border-2 border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm">
                                            {newAsset.smm_platform === 'facebook' && '📘'}
                                            {newAsset.smm_platform === 'instagram' && '📷'}
                                            {newAsset.smm_platform === 'twitter' && '🐦'}
                                            {newAsset.smm_platform === 'linkedin' && '💼'}
                                            {newAsset.smm_platform === 'youtube' && '🎥'}
                                            {newAsset.smm_platform === 'tiktok' && '🎵'}
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-slate-800 capitalize">
                                                {newAsset.smm_platform === 'twitter' ? 'Twitter/X' : newAsset.smm_platform} Content
                                            </h5>
                                            <p className="text-xs text-slate-600">
                                                {newAsset.smm_platform === 'facebook' && 'Engage with your Facebook community'}
                                                {newAsset.smm_platform === 'instagram' && 'Share visual stories on Instagram'}
                                                {newAsset.smm_platform === 'twitter' && 'Join real-time conversations'}
                                                {newAsset.smm_platform === 'linkedin' && 'Connect with professionals'}
                                                {newAsset.smm_platform === 'youtube' && 'Create engaging video content'}
                                                {newAsset.smm_platform === 'tiktok' && 'Create viral short-form videos'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Content Fields */}
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                                📝 Post Caption/Description
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <textarea
                                                value={newAsset.smm_description || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, smm_description: e.target.value })}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                placeholder={
                                                    newAsset.smm_platform === 'twitter' ? 'What\'s happening? (280 characters)' :
                                                        newAsset.smm_platform === 'linkedin' ? 'Share your professional insights...' :
                                                            newAsset.smm_platform === 'instagram' ? 'Share your story with a captivating caption...' :
                                                                newAsset.smm_platform === 'facebook' ? 'What\'s on your mind?' :
                                                                    newAsset.smm_platform === 'youtube' ? 'Describe your video content...' :
                                                                        newAsset.smm_platform === 'tiktok' ? 'Add a catchy description for your video...' :
                                                                            'Enter your post content...'
                                                }
                                                rows={4}
                                                maxLength={
                                                    newAsset.smm_platform === 'twitter' ? 280 :
                                                        newAsset.smm_platform === 'instagram' ? 2200 :
                                                            newAsset.smm_platform === 'linkedin' ? 3000 :
                                                                undefined
                                                }
                                            />
                                            {newAsset.smm_platform === 'twitter' && (
                                                <div className="text-xs text-slate-500 mt-1 text-right">
                                                    {(newAsset.smm_description || '').length}/280 characters
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                                🏷️ Hashtags & Tags
                                            </label>
                                            <input
                                                type="text"
                                                value={newAsset.smm_hashtags || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, smm_hashtags: e.target.value })}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                placeholder={
                                                    newAsset.smm_platform === 'twitter' ? '#hashtag1 #hashtag2 (max 2-3)' :
                                                        newAsset.smm_platform === 'instagram' ? '#hashtag1 #hashtag2 #hashtag3 (max 30)' :
                                                            newAsset.smm_platform === 'linkedin' ? '#hashtag1 #hashtag2 #hashtag3 (max 5)' :
                                                                newAsset.smm_platform === 'tiktok' ? '#hashtag1 #hashtag2 #hashtag3 (trending tags)' :
                                                                    '#hashtag1 #hashtag2 #hashtag3'
                                                }
                                            />
                                            <div className="mt-1 text-xs text-slate-500">
                                                {newAsset.smm_platform === 'twitter' && '💡 Use 1-2 relevant hashtags for better engagement'}
                                                {newAsset.smm_platform === 'instagram' && '💡 Use 5-10 hashtags for optimal reach'}
                                                {newAsset.smm_platform === 'linkedin' && '💡 Use 3-5 professional hashtags'}
                                                {newAsset.smm_platform === 'tiktok' && '💡 Mix trending and niche hashtags'}
                                                {newAsset.smm_platform === 'youtube' && '💡 Use hashtags in description for discoverability'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Type Selection */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-3">
                                            🎬 Content Type
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {(() => {
                                                const getMediaTypes = (platform: string) => {
                                                    switch (platform) {
                                                        case 'instagram':
                                                            return [
                                                                { value: 'image', label: 'Photo', icon: '📸' },
                                                                { value: 'video', label: 'Video', icon: '🎥' },
                                                                { value: 'carousel', label: 'Carousel', icon: '🎠' },
                                                                { value: 'story', label: 'Story', icon: '📱' }
                                                            ];
                                                        case 'facebook':
                                                            return [
                                                                { value: 'image', label: 'Photo', icon: '📸' },
                                                                { value: 'video', label: 'Video', icon: '🎥' },
                                                                { value: 'carousel', label: 'Carousel', icon: '🎠' },
                                                                { value: 'story', label: 'Story', icon: '📱' }
                                                            ];
                                                        case 'twitter':
                                                            return [
                                                                { value: 'text', label: 'Tweet', icon: '💬' },
                                                                { value: 'image', label: 'Photo', icon: '📸' },
                                                                { value: 'video', label: 'Video', icon: '🎥' },
                                                                { value: 'gif', label: 'GIF', icon: '🎭' }
                                                            ];
                                                        case 'linkedin':
                                                            return [
                                                                { value: 'text', label: 'Post', icon: '📝' },
                                                                { value: 'image', label: 'Image', icon: '📸' },
                                                                { value: 'video', label: 'Video', icon: '🎥' },
                                                                { value: 'article', label: 'Article', icon: '📰' }
                                                            ];
                                                        case 'youtube':
                                                            return [
                                                                { value: 'video', label: 'Video', icon: '🎥' },
                                                                { value: 'short', label: 'Short', icon: '📱' }
                                                            ];
                                                        case 'tiktok':
                                                            return [
                                                                { value: 'video', label: 'Video', icon: '🎥' }
                                                            ];
                                                        default:
                                                            return [
                                                                { value: 'image', label: 'Image', icon: '📸' },
                                                                { value: 'video', label: 'Video', icon: '🎥' },
                                                                { value: 'text', label: 'Text', icon: '📝' }
                                                            ];
                                                    }
                                                };

                                                return getMediaTypes(newAsset.smm_platform).map((type) => (
                                                    <button
                                                        key={type.value}
                                                        type="button"
                                                        onClick={() => {
                                                            // Set the media type
                                                            setNewAsset({ ...newAsset, smm_media_type: type.value as any });

                                                            // If it's a media type that requires file upload, trigger file dialog
                                                            if (['image', 'video', 'carousel', 'gif'].includes(type.value)) {
                                                                // Small delay to allow state update, then trigger file input
                                                                setTimeout(() => {
                                                                    if (mediaInputRef.current) {
                                                                        // Set the accept attribute based on media type
                                                                        if (type.value === 'video') {
                                                                            mediaInputRef.current.accept = 'video/*';
                                                                        } else if (type.value === 'image' || type.value === 'carousel') {
                                                                            mediaInputRef.current.accept = 'image/*';
                                                                        } else if (type.value === 'gif') {
                                                                            mediaInputRef.current.accept = 'image/gif';
                                                                        } else {
                                                                            mediaInputRef.current.accept = 'image/*,video/*';
                                                                        }
                                                                        mediaInputRef.current.click();
                                                                    }
                                                                }, 100);
                                                            }
                                                        }}
                                                        className={`p-3 rounded-lg border-2 transition-all text-center hover:scale-105 cursor-pointer relative ${newAsset.smm_media_type === type.value
                                                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                                                            : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                                                            }`}
                                                    >
                                                        <div className="text-2xl mb-2">{type.icon}</div>
                                                        <div className={`text-xs font-bold mb-1 ${newAsset.smm_media_type === type.value ? 'text-white' : 'text-slate-700'
                                                            }`}>
                                                            {type.label}
                                                        </div>

                                                        {/* Upload indicator for media types */}
                                                        {['image', 'video', 'carousel', 'gif'].includes(type.value) && (
                                                            <div className={`text-xs ${newAsset.smm_media_type === type.value ? 'text-white/80' : 'text-slate-500'
                                                                }`}>
                                                                📁 Click to upload
                                                            </div>
                                                        )}

                                                        {/* Selected indicator */}
                                                        {newAsset.smm_media_type === type.value && (
                                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </button>
                                                ));
                                            })()}
                                        </div>

                                        {/* Media Upload Section - Only show for media types */}
                                        {newAsset.smm_media_type && ['image', 'video', 'carousel', 'gif'].includes(newAsset.smm_media_type) && (
                                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                                <h6 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                    Upload {newAsset.smm_media_type === 'carousel' ? 'Images' : newAsset.smm_media_type.charAt(0).toUpperCase() + newAsset.smm_media_type.slice(1)}
                                                </h6>

                                                {newAsset.smm_media_url ? (
                                                    <div className="space-y-3">
                                                        {newAsset.smm_media_type === 'video' ? (
                                                            <video
                                                                src={newAsset.smm_media_url}
                                                                controls
                                                                className="w-full max-h-48 rounded-lg border border-slate-200"
                                                            />
                                                        ) : (
                                                            <img
                                                                src={newAsset.smm_media_url}
                                                                alt="Uploaded media"
                                                                className="w-full max-h-48 object-cover rounded-lg border border-slate-200"
                                                            />
                                                        )}
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (mediaInputRef.current) {
                                                                        mediaInputRef.current.click();
                                                                    }
                                                                }}
                                                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                                </svg>
                                                                Replace
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setNewAsset({ ...newAsset, smm_media_url: '' })}
                                                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                                                        onClick={() => {
                                                            if (mediaInputRef.current) {
                                                                mediaInputRef.current.click();
                                                            }
                                                        }}
                                                    >
                                                        <div className="text-4xl mb-2">
                                                            {newAsset.smm_media_type === 'video' && '🎥'}
                                                            {newAsset.smm_media_type === 'image' && '📸'}
                                                            {newAsset.smm_media_type === 'carousel' && '🎠'}
                                                            {newAsset.smm_media_type === 'gif' && '🎭'}
                                                        </div>
                                                        <p className="text-sm font-medium text-slate-700 mb-1">
                                                            Click to upload {newAsset.smm_media_type === 'carousel' ? 'images' : newAsset.smm_media_type}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {newAsset.smm_platform === 'instagram' && newAsset.smm_media_type === 'image' && 'JPG, PNG up to 10MB'}
                                                            {newAsset.smm_platform === 'instagram' && newAsset.smm_media_type === 'video' && 'MP4 up to 100MB, max 60s'}
                                                            {newAsset.smm_platform === 'twitter' && newAsset.smm_media_type === 'image' && 'JPG, PNG up to 5MB'}
                                                            {newAsset.smm_platform === 'twitter' && newAsset.smm_media_type === 'video' && 'MP4 up to 512MB, max 2:20'}
                                                            {newAsset.smm_platform === 'linkedin' && newAsset.smm_media_type === 'image' && 'JPG, PNG up to 20MB'}
                                                            {newAsset.smm_platform === 'linkedin' && newAsset.smm_media_type === 'video' && 'MP4 up to 5GB, max 10min'}
                                                            {newAsset.smm_platform === 'youtube' && 'MP4, MOV up to 256GB, max 12h'}
                                                            {newAsset.smm_platform === 'tiktok' && 'MP4, MOV up to 287MB, 15s-10min'}
                                                            {!['instagram', 'twitter', 'linkedin', 'youtube', 'tiktok'].includes(newAsset.smm_platform || '') && 'Supported formats: JPG, PNG, MP4, GIF'}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Preview Section */}
                                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                                        <h6 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Live Preview
                                        </h6>
                                        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                                                    {newAsset.smm_platform === 'facebook' && '📘'}
                                                    {newAsset.smm_platform === 'instagram' && '📷'}
                                                    {newAsset.smm_platform === 'twitter' && '🐦'}
                                                    {newAsset.smm_platform === 'linkedin' && '💼'}
                                                    {newAsset.smm_platform === 'youtube' && '🎥'}
                                                    {newAsset.smm_platform === 'tiktok' && '🎵'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-slate-800">Your Brand</div>
                                                    <div className="text-xs text-slate-500">Just now</div>
                                                </div>
                                            </div>

                                            {(previewUrl || newAsset.smm_media_url) && (
                                                <div className="mb-3">
                                                    {newAsset.smm_media_type === 'video' && newAsset.smm_media_url ? (
                                                        <video
                                                            src={newAsset.smm_media_url}
                                                            controls
                                                            className="w-full max-h-48 object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={previewUrl || newAsset.smm_media_url}
                                                            alt="Preview"
                                                            className="w-full max-h-48 object-cover rounded-lg"
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            <div className="text-sm text-slate-800 mb-2">
                                                {newAsset.smm_description || `Your ${newAsset.smm_platform} post content will appear here...`}
                                            </div>

                                            {newAsset.smm_hashtags && (
                                                <div className="text-sm text-blue-600">
                                                    {newAsset.smm_hashtags}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                                                <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                    Like
                                                </button>
                                                <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                    Comment
                                                </button>
                                                <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                                    </svg>
                                                    Share
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Platform-specific Tips */}
                                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="text-yellow-600 mt-0.5">💡</div>
                                            <div>
                                                <h6 className="font-bold text-yellow-800 mb-2">
                                                    {newAsset.smm_platform?.charAt(0).toUpperCase() + newAsset.smm_platform?.slice(1)} Best Practices
                                                </h6>
                                                <ul className="text-sm text-yellow-700 space-y-1">
                                                    {newAsset.smm_platform === 'instagram' && (
                                                        <>
                                                            <li>• Use high-quality, visually appealing images</li>
                                                            <li>• Post consistently at optimal times (11 AM - 1 PM)</li>
                                                            <li>• Use 5-10 relevant hashtags for better reach</li>
                                                        </>
                                                    )}
                                                    {newAsset.smm_platform === 'twitter' && (
                                                        <>
                                                            <li>• Keep tweets concise and engaging</li>
                                                            <li>• Use 1-2 hashtags maximum</li>
                                                            <li>• Tweet during peak hours (9 AM - 3 PM)</li>
                                                        </>
                                                    )}
                                                    {newAsset.smm_platform === 'linkedin' && (
                                                        <>
                                                            <li>• Share professional insights and industry news</li>
                                                            <li>• Post during business hours (8 AM - 6 PM)</li>
                                                            <li>• Use 3-5 professional hashtags</li>
                                                        </>
                                                    )}
                                                    {newAsset.smm_platform === 'facebook' && (
                                                        <>
                                                            <li>• Share engaging, community-focused content</li>
                                                            <li>• Use Facebook-native video for better reach</li>
                                                            <li>• Encourage comments and shares</li>
                                                        </>
                                                    )}
                                                    {newAsset.smm_platform === 'youtube' && (
                                                        <>
                                                            <li>• Create compelling thumbnails and titles</li>
                                                            <li>• Upload consistently (2-3 times per week)</li>
                                                            <li>• Use relevant keywords in description</li>
                                                        </>
                                                    )}
                                                    {newAsset.smm_platform === 'tiktok' && (
                                                        <>
                                                            <li>• Create vertical videos (9:16 aspect ratio)</li>
                                                            <li>• Hook viewers in the first 3 seconds</li>
                                                            <li>• Use trending sounds and hashtags</li>
                                                        </>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Enhanced Footer */}
                <div className="border-t border-slate-200 bg-slate-50 rounded-b-2xl">
                    {/* Options Row */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                        <div className="flex items-center gap-6 text-sm">
                            {/* View Vendor History */}
                            <label className="flex items-center gap-2 text-slate-600 hover:text-slate-800 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={viewVendorHistory}
                                    onChange={(e) => setViewVendorHistory(e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                />
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">View Vendor History</span>
                            </label>

                            {/* Replace Existing Version */}
                            <label className="flex items-center gap-2 text-slate-600 hover:text-slate-800 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={replaceExistingVersion}
                                    onChange={(e) => setReplaceExistingVersion(e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                />
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span className="font-medium">Replace Existing Version</span>
                            </label>
                        </div>

                        {/* QC Readiness Indicator */}
                        {!isUploading && (
                            <div className="flex items-center gap-2 text-sm">
                                {isQcReady ? (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-medium">✅ Ready for QC Queue</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-amber-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <span className="font-medium">⚠️ Complete required fields for QC</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Upload Progress Indicator */}
                        {isUploading && (
                            <div className="flex items-center gap-2 text-sm text-indigo-600">
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="font-medium">Processing upload...</span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                            {/* Cancel Button */}
                            <button
                                onClick={onClose}
                                disabled={isUploading}
                                className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel
                            </button>

                            {/* Upload Asset as Draft Button */}
                            <button
                                onClick={() => handleUpload('draft')}
                                disabled={isUploading || !newAsset.name?.trim()}
                                className={`px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2 ${isUploading || !newAsset.name?.trim() ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Save as Draft
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Update Asset Button (for existing assets) */}
                            <button
                                onClick={() => handleUpload('draft')}
                                disabled={isUploading || !newAsset.name?.trim()}
                                className={`px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg hover:shadow-md transition-all flex items-center gap-2 ${isUploading || !newAsset.name?.trim() ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isUploading ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Update Asset
                                    </>
                                )}
                            </button>

                            {/* Save to QC Queue Button (Primary) */}
                            <button
                                onClick={() => handleUpload('qc')}
                                disabled={isUploading || !isQcReady}
                                className={`px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:shadow-md transition-all flex items-center gap-2 ${isUploading || !isQcReady ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                title={!isQcReady ? 'Please complete all required fields for QC submission' : 'Submit asset to QC Queue'}
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
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        Save to QC Queue
                                    </>
                                )}
                            </button>

                            {/* Quick Upload Dropdown */}
                            <div className="relative group">
                                <button
                                    disabled={isUploading}
                                    className="px-3 py-2 text-sm font-medium text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                    </svg>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Quick Actions Dropdown */}
                                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="p-2">
                                        <div className="text-xs font-semibold text-slate-600 px-2 py-1 border-b border-slate-100 mb-1">
                                            Quick Actions
                                        </div>

                                        <button
                                            onClick={() => {
                                                setViewVendorHistory(true);
                                                handleUpload('qc');
                                            }}
                                            disabled={isUploading || !newAsset.name?.trim()}
                                            className="w-full flex items-center gap-2 px-2 py-2 text-left hover:bg-slate-50 rounded-md transition-colors text-sm disabled:opacity-50"
                                        >
                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>Upload with History</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setReplaceExistingVersion(true);
                                                handleUpload('qc');
                                            }}
                                            disabled={isUploading || !newAsset.name?.trim()}
                                            className="w-full flex items-center gap-2 px-2 py-2 text-left hover:bg-slate-50 rounded-md transition-colors text-sm disabled:opacity-50"
                                        >
                                            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            <span>Replace & Upload</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setViewVendorHistory(true);
                                                setReplaceExistingVersion(true);
                                                handleUpload('qc');
                                            }}
                                            disabled={isUploading || !newAsset.name?.trim()}
                                            className="w-full flex items-center gap-2 px-2 py-2 text-left hover:bg-slate-50 rounded-md transition-colors text-sm disabled:opacity-50"
                                        >
                                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            <span>Full Replace & Upload</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadAssetModal;