import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useData } from '../hooks/useData';
import type { AssetLibraryItem, Service, SubServiceItem, AssetCategory, AssetFormat } from '../types';

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
    const { data: keywords = [] } = useData<any>('keywords');
    const { data: assetCategories = [] } = useData<AssetCategory>('asset-categories');
    const { data: assetFormats = [] } = useData<AssetFormat>('asset-formats');

    const [formData, setFormData] = useState<Partial<AssetLibraryItem>>(asset || {
        name: '',
        application_type: undefined,
        type: 'article',
        asset_category: '',
        asset_format: '',
        repository: 'Content Repository',
        status: 'Draft',
        linked_service_ids: [],
        linked_sub_service_ids: [],
        keywords: [],
        seo_score: undefined,
        grammar_score: undefined
    });

    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
    const [selectedSubServiceIds, setSelectedSubServiceIds] = useState<number[]>([]);
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [availableFormats, setAvailableFormats] = useState<AssetFormat[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');

    // File upload refs - SMM should have only one image upload
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update available formats when application type changes
    useEffect(() => {
        if (formData.application_type) {
            const filtered = assetFormats.filter(format =>
                format.application_types.includes(formData.application_type!)
            );
            setAvailableFormats(filtered);

            // Reset asset format if current selection is not available for new application type
            if (formData.asset_format && !filtered.some(f => f.format_name === formData.asset_format)) {
                setFormData(prev => ({ ...prev, asset_format: '' }));
            }
        } else {
            setAvailableFormats(assetFormats);
        }
    }, [formData.application_type, assetFormats]);

    const handleFileSelect = useCallback((file: File) => {
        setSelectedFile(file);
        setFormData(prev => ({
            ...prev,
            name: prev.name || file.name.replace(/\.[^/.]+$/, ""),
            file_size: file.size,
            file_type: file.type
        }));

        // Create preview for images only
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreviewUrl(result);
                setFormData(prev => ({
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

    const handleSubmit = async (submitForQC: boolean = false) => {
        if (!formData.name?.trim()) {
            alert('Please enter an asset name');
            return;
        }

        if (!formData.application_type) {
            alert('Please select an application type (WEB, SEO, or SMM)');
            return;
        }

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
            ...formData,
            date: new Date().toISOString(),
            linked_service_ids: linkedServiceIds,
            linked_sub_service_ids: linkedSubServiceIds,
            mapped_to: mappedToString || formData.mapped_to,
            keywords: selectedKeywords,
            status: submitForQC ? 'Pending QC Review' : (formData.status || 'Draft'),
            submitted_by: submitForQC ? 1 : undefined, // TODO: Get from auth context
            submitted_at: submitForQC ? new Date().toISOString() : undefined,
            linking_active: false // Linking only becomes active after QC approval
        };

        await onSave(assetPayload, submitForQC);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
            {/* Fixed Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onCancel}
                                disabled={isUploading}
                                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                                title="Back to Assets"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">
                                    {editMode ? 'Edit Asset' : 'Upload New Asset'}
                                </h1>
                                <p className="text-slate-600 text-sm mt-1">
                                    {editMode ? 'Update asset information and settings' : 'Add new media content to the central asset library'}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onCancel}
                                disabled={isUploading}
                                className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => handleSubmit(false)}
                                disabled={isUploading}
                                className={`bg-slate-600 text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-slate-700 transition-colors text-sm flex items-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isUploading ? 'Saving...' : (editMode ? 'Save Changes' : 'Save as Draft')}
                            </button>

                            <button
                                onClick={() => handleSubmit(true)}
                                disabled={isUploading || !formData.seo_score || !formData.grammar_score}
                                className={`bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all text-sm flex items-center gap-2 ${isUploading || !formData.seo_score || !formData.grammar_score ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isUploading ? 'Submitting...' : (editMode ? 'Update & Submit for QC' : 'Submit for QC Review')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - File Upload & Preview */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* File Upload Area */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                {/* SMM should have only one image upload */}
                                {formData.application_type === 'smm' ? 'Image Upload' : 'File Upload'}
                            </h3>

                            <div
                                className="border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                    className="hidden"
                                    accept={formData.application_type === 'smm' ? 'image/*' : 'image/*,video/*,.pdf,.doc,.docx,.zip'}
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
                                                {formData.application_type === 'smm' ? 'Drop image here or click to browse' : 'Drop files here or click to browse'}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {formData.application_type === 'smm'
                                                    ? 'Support for PNG, JPG files up to 10MB'
                                                    : 'Support for PNG, JPG, PDF, MP4 files up to 50MB'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Form Fields */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Basic Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Basic Information
                                </h3>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Asset Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        Asset Name
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                        placeholder="Enter asset name..."
                                    />
                                </div>

                                {/* Content Type - Make static after choosing WEB */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        Content Type
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <select
                                        value={formData.application_type || ''}
                                        onChange={(e) => setFormData({ ...formData, application_type: e.target.value as any })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white cursor-pointer"
                                        disabled={editMode && formData.application_type === 'web'} // Make static for WEB
                                    >
                                        <option value="">Select content type...</option>
                                        <option value="web">WEB</option>
                                        <option value="seo">SEO</option>
                                        <option value="smm">SMM</option>
                                    </select>
                                    {editMode && formData.application_type === 'web' && (
                                        <p className="text-xs text-slate-500 mt-1">Content type cannot be changed for WEB assets</p>
                                    )}
                                </div>

                                {/* Asset Category & Format */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Asset Category - Convert to master table */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                                            Asset Category
                                        </label>
                                        <select
                                            value={formData.asset_category || ''}
                                            onChange={(e) => setFormData({ ...formData, asset_category: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white cursor-pointer"
                                        >
                                            <option value="">Select asset category...</option>
                                            {assetCategories.map((category) => (
                                                <option key={category.id} value={category.category_name}>
                                                    {category.category_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Asset Format - Link with Asset Master */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                                            Asset Format
                                        </label>
                                        <select
                                            value={formData.asset_format || ''}
                                            onChange={(e) => setFormData({ ...formData, asset_format: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white cursor-pointer"
                                            disabled={!formData.application_type}
                                        >
                                            <option value="">Select asset format...</option>
                                            {availableFormats.map((format) => (
                                                <option key={format.id} value={format.format_name}>
                                                    {format.format_name} ({format.format_type})
                                                </option>
                                            ))}
                                        </select>
                                        {!formData.application_type && (
                                            <p className="text-xs text-slate-500 mt-1">Please select content type first</p>
                                        )}
                                    </div>
                                </div>

                                {/* Map Asset to Services - Renamed from "Map Asset to Source Work" */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        Map Asset to Services
                                    </label>
                                    <select
                                        value={selectedServiceId || ''}
                                        onChange={(e) => setSelectedServiceId(e.target.value ? parseInt(e.target.value) : null)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white cursor-pointer"
                                    >
                                        <option value="">Select service...</option>
                                        {services.map((service) => (
                                            <option key={service.id} value={service.id}>
                                                {service.service_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Keywords - Integrate with master database */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        Keywords
                                    </label>
                                    <div className="border border-slate-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                                        {keywords.length > 0 ? (
                                            <div className="space-y-2">
                                                {keywords.map((keyword: any) => (
                                                    <label key={keyword.id} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedKeywords.includes(keyword.keyword)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedKeywords([...selectedKeywords, keyword.keyword]);
                                                                } else {
                                                                    setSelectedKeywords(selectedKeywords.filter(k => k !== keyword.keyword));
                                                                }
                                                            }}
                                                            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                                        />
                                                        <div className="flex-1">
                                                            <span className="text-sm font-medium text-slate-900">{keyword.keyword}</span>
                                                            {keyword.search_volume && (
                                                                <span className="ml-2 text-xs text-blue-600">
                                                                    {keyword.search_volume} searches/mo
                                                                </span>
                                                            )}
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500 italic">No keywords available in master database</p>
                                        )}
                                    </div>
                                    {selectedKeywords.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-xs text-slate-600 mb-2">Selected keywords:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedKeywords.map((keyword, index) => (
                                                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                                        {keyword}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
                                                            }}
                                                            className="ml-1 text-green-600 hover:text-green-800"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* AI Quality Scores */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                                            SEO Score (0-100)
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={formData.seo_score || ''}
                                            onChange={(e) => setFormData({ ...formData, seo_score: parseInt(e.target.value) || undefined })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                            placeholder="0-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                                            Grammar Score (0-100)
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={formData.grammar_score || ''}
                                            onChange={(e) => setFormData({ ...formData, grammar_score: parseInt(e.target.value) || undefined })}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                            placeholder="0-100"
                                        />
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

export default AssetFormImproved;