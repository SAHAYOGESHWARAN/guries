import React, { useState, useRef, useCallback } from 'react';
import { useData } from '../hooks/useData';
import type { AssetLibraryItem, Service, SubServiceItem, AssetCategory, AssetFormat } from '../types';

interface ImprovedAssetUploadFormProps {
    asset: Partial<AssetLibraryItem>;
    onAssetChange: (asset: Partial<AssetLibraryItem>) => void;
    onSave: (submitForQC?: boolean) => void;
    onCancel: () => void;
    isUploading: boolean;
    isEdit?: boolean;
}

const ImprovedAssetUploadForm: React.FC<ImprovedAssetUploadFormProps> = ({
    asset,
    onAssetChange,
    onSave,
    onCancel,
    isUploading,
    isEdit = false
}) => {
    const { data: services = [] } = useData<Service>('services');
    const { data: subServices = [] } = useData<SubServiceItem>('subServices');
    const { data: keywords = [] } = useData<any>('keywords');
    const { data: assetCategories = [] } = useData<AssetCategory>('asset-categories');
    const { data: assetFormats = [] } = useData<AssetFormat>('asset-formats');

    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
    const [selectedSubServiceIds, setSelectedSubServiceIds] = useState<number[]>([]);
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>(asset.keywords || []);
    const [previewUrl, setPreviewUrl] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filter asset formats based on selected application type
    const availableFormats = useMemo(() => {
        if (!asset.application_type) return [];
        return assetFormats.filter(format =>
            format.application_types.includes(asset.application_type as any)
        );
    }, [assetFormats, asset.application_type]);

    const handleFileSelect = useCallback((file: File) => {
        onAssetChange({
            ...asset,
            name: asset.name || file.name.replace(/\.[^/.]+$/, ""),
            file_size: file.size,
            file_type: file.type
        });

        // Create preview for images only
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreviewUrl(result);
                onAssetChange({
                    ...asset,
                    file_url: result,
                    thumbnail_url: result
                });
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewUrl('');
        }
    }, [asset, onAssetChange]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
            {/* Header */}
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
                                    {isEdit ? 'Edit Asset' : 'Upload New Asset'}
                                </h1>
                                <p className="text-slate-600 text-sm mt-1">
                                    {isEdit ? 'Update asset information and settings' : 'Add new media content to the central asset library'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImprovedAssetUploadForm;
{/* Main Content */ }
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
                    File Upload
                </h3>

                <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${dragActive
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50'
                        }`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                        className="hidden"
                        accept="image/*,video/*,.pdf,.doc,.docx,.zip"
                    />

                    {previewUrl ? (
                        <div className="space-y-4">
                            <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-md" />
                            <div className="text-center">
                                <p className="text-sm font-medium text-slate-700">{asset.name}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {asset.file_size && `${(asset.file_size / 1024).toFixed(2)} KB`}
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewUrl('');
                                    onAssetChange({ ...asset, file_url: '', thumbnail_url: '' });
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
                                <p className="text-base font-semibold text-slate-700 mb-2">Drop files here or click to browse</p>
                                <p className="text-sm text-slate-500">Support for PNG, JPG, PDF, MP4 files up to 50MB</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Right Column - Form Fields */}
        <div className="lg:col-span-2 space-y-8">

            {/* Basic Asset Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Asset Information
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
                            value={asset.name || ''}
                            onChange={(e) => onAssetChange({ ...asset, name: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            placeholder="Enter asset name..."
                        />
                    </div>

                    {/* Content Type - Static after selection */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Content Type
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                            value={asset.application_type || ''}
                            onChange={(e) => onAssetChange({
                                ...asset,
                                application_type: e.target.value as any,
                                asset_format: '', // Reset format when changing type
                                smm_platform: undefined
                            })}
                            disabled={isEdit && asset.application_type === 'web'} // Make static for WEB after selection
                            className={`w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white cursor-pointer ${isEdit && asset.application_type === 'web' ? 'bg-slate-100 cursor-not-allowed' : ''
                                }`}
                        >
                            <option value="">Select content type...</option>
                            <option value="web">WEB</option>
                            <option value="seo">SEO</option>
                            <option value="smm">SMM</option>
                        </select>
                        {isEdit && asset.application_type === 'web' && (
                            <p className="text-xs text-slate-500 mt-1">Content type cannot be changed after selecting WEB</p>
                        )}
                    </div>

                    {/* Asset Category & Format */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Asset Category - From Master Table */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Asset Category
                            </label>
                            <select
                                value={asset.asset_category || ''}
                                onChange={(e) => onAssetChange({ ...asset, asset_category: e.target.value })}
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

                        {/* Asset Format - Linked with Master */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Asset Format
                            </label>
                            <select
                                value={asset.asset_format || ''}
                                onChange={(e) => onAssetChange({ ...asset, asset_format: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white cursor-pointer"
                                disabled={!asset.application_type}
                            >
                                <option value="">Select asset format...</option>
                                {availableFormats.map((format) => (
                                    <option key={format.id} value={format.format_name}>
                                        {format.format_name} ({format.format_type})
                                    </option>
                                ))}
                            </select>
                            {!asset.application_type && (
                                <p className="text-xs text-slate-500 mt-1">Select content type first to see available formats</p>
                            )}
                        </div>
                    </div>

                    {/* Map Asset to Services (Renamed from "Map Asset to Source Work") */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Map Asset to Services
                        </label>
                        <select
                            value={selectedServiceId || ''}
                            onChange={(e) => {
                                const serviceId = e.target.value ? parseInt(e.target.value) : null;
                                setSelectedServiceId(serviceId);
                                onAssetChange({
                                    ...asset,
                                    linked_service_ids: serviceId ? [serviceId] : []
                                });
                            }}
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

                    {/* Keywords - Integrated with Master Database */}
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
                                                    const newKeywords = e.target.checked
                                                        ? [...selectedKeywords, keyword.keyword]
                                                        : selectedKeywords.filter(k => k !== keyword.keyword);
                                                    setSelectedKeywords(newKeywords);
                                                    onAssetChange({ ...asset, keywords: newKeywords });
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
                                                    const newKeywords = selectedKeywords.filter(k => k !== keyword);
                                                    setSelectedKeywords(newKeywords);
                                                    onAssetChange({ ...asset, keywords: newKeywords });
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
                </div>
            </div>

            {/* SMM Specific - Single Image Upload */}
            {asset.application_type === 'smm' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-6 py-4 border-b border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            SMM Media Upload (Single Image Only)
                        </h3>
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-slate-600 mb-4">Upload a single image for social media marketing</p>
                        {/* Single image upload implementation would go here */}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
                <button
                    onClick={onCancel}
                    disabled={isUploading}
                    className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={() => onSave(false)}
                    disabled={isUploading}
                    className="bg-slate-600 text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-slate-700 transition-colors text-sm disabled:opacity-50"
                >
                    {isUploading ? 'Saving...' : 'Save as Draft'}
                </button>
                <button
                    onClick={() => onSave(true)}
                    disabled={isUploading || !asset.seo_score || !asset.grammar_score}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all text-sm disabled:opacity-50"
                >
                    {isUploading ? 'Submitting...' : 'Submit for QC Review'}
                </button>
            </div>
        </div>
    </div>
</div>
        </div >
    );
};