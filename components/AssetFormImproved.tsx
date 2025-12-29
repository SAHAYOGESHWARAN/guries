import React, { useState, useRef, useCallback } from 'react';
import { useData } from '../hooks/useData';
import type { AssetLibraryItem, Service, SubServiceItem, AssetCategory } from '../types';

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

    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
    const [selectedSubServiceIds, setSelectedSubServiceIds] = useState<number[]>([]);
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

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

        const linkedServiceIds = selectedServiceId ? [selectedServiceId] : [];
        let mappedToString = '';
        if (selectedServiceId) {
            const service = services.find(s => s.id === selectedServiceId);
            if (service) {
                mappedToString = service.service_name;
                if (selectedSubServiceIds.length > 0) {
                    const names = selectedSubServiceIds.map(id => subServices.find(ss => ss.id === id)?.sub_service_name).filter(Boolean).join(', ');
                    if (names) mappedToString += ` / ${names}`;
                }
            }
        }

        await onSave({
            ...formData,
            date: new Date().toISOString(),
            linked_service_ids: linkedServiceIds,
            linked_sub_service_ids: selectedSubServiceIds,
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">{editMode ? 'Edit Asset' : 'Edit Asset'}</h1>
                                <p className="text-xs text-gray-500">Update asset information and settings</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={onCancel} className="h-9 px-4 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                            <button onClick={() => handleSubmit(false)} className="h-9 px-4 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200">
                                Update Asset
                            </button>
                            <button onClick={() => handleSubmit(false)} className="h-9 px-4 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                                Save Changes
                            </button>
                            <button
                                onClick={() => handleSubmit(true)}
                                disabled={!hasScores}
                                className="h-9 px-4 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
                            >
                                Update & Submit for QC
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Top Section - File Upload & Asset Upload side by side */}
                <div className="grid grid-cols-12 gap-6 mb-6">
                    {/* Left - File Upload Card */}
                    <div className="col-span-4">
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <span className="font-semibold text-gray-900">File Upload</span>
                            </div>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all"
                            >
                                <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-gray-700 mb-1">Drop files here or click to browse</p>
                                <p className="text-xs text-gray-500">Support for PNG, JPG, PDF, MP4 files upto 50Mb</p>
                            </div>
                        </div>
                    </div>

                    {/* Middle - Progress Card */}
                    <div className="col-span-2">
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="font-semibold text-gray-900">Progress</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Basic Info</span>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${isComplete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {isComplete ? 'Complete' : 'Pending'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">AI Scores</span>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${hasScores ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {hasScores ? 'Complete' : 'Pending'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Ready for QC</span>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${isComplete && hasScores ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {isComplete && hasScores ? 'Ready' : 'Pending'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right - Asset Upload Card */}
                    <div className="col-span-6">
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-900">Asset Upload</span>
                                    <p className="text-xs text-gray-500">Upload your asset file and preview it before submission</p>
                                </div>
                            </div>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-all"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-gray-700 mb-1">Drop files here or click to browse</p>
                                <p className="text-xs text-gray-500 mb-3">Support for images, videos, documents and archives</p>
                                <div className="flex items-center justify-center gap-2">
                                    {['PNG', 'JPG', 'PDF', 'MP4', 'DOC', 'ZIP'].map(fmt => (
                                        <span key={fmt} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">{fmt}</span>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-2">No attachments added</p>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Basic Information Section */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-900">Basic Information</span>
                            <p className="text-xs text-gray-500">Essential details and classification</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        {/* Asset Application */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Asset Application *</label>
                            <div className="relative">
                                <select
                                    value={formData.application_type || ''}
                                    onChange={(e) => setFormData({ ...formData, application_type: e.target.value as any })}
                                    className={`w-full h-11 pl-10 pr-4 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white ${formData.application_type === 'web' ? 'border-green-300 bg-green-50' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select application...</option>
                                    <option value="web">WEB</option>
                                    <option value="seo">SEO</option>
                                    <option value="smm">SMM</option>
                                </select>
                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${formData.application_type === 'web' ? 'bg-green-500 text-white' :
                                        formData.application_type === 'seo' ? 'bg-blue-500 text-white' :
                                            formData.application_type === 'smm' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        {formData.application_type?.toUpperCase() || '?'}
                                    </span>
                                </div>
                                {formData.application_type === 'web' && (
                                    <span className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-amber-600">Content type is now locked</span>
                                )}
                            </div>
                        </div>

                        {/* Asset Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Asset Title *</label>
                            <input
                                type="text"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full h-11 px-4 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="name/rename"
                            />
                        </div>

                        {/* Asset Type */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Asset Type *</label>
                            <select
                                value={formData.type || 'article'}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full h-11 px-4 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                            >
                                <option value="article">Article</option>
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                                <option value="document">Document</option>
                            </select>
                        </div>
                    </div>
                </div>


                {/* Bottom Section - 3 Column Layout */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Left Column - Web Application Fields */}
                    <div className="col-span-4">
                        <div className="bg-white rounded-2xl border border-gray-200 p-5">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-900">Web Application Fields</span>
                                    <p className="text-xs text-gray-500">Configure fields specific to your selected application type</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                                    <input type="text" placeholder="Enter web title..." className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">URL</label>
                                    <input type="text" placeholder="none" className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-gray-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">H1</label>
                                    <input type="text" placeholder="none" className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-gray-50" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">H2 (First)</label>
                                        <input type="text" placeholder="none" className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-gray-50" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">H2 (Second)</label>
                                        <input type="text" placeholder="Second H2 heading" className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-gray-50" />
                                    </div>
                                </div>
                            </div>

                            {/* Body Content & AI Quality */}
                            <div className="mt-5 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Body Content</label>
                                        <div className="h-24 border border-gray-300 rounded-lg bg-white p-2">
                                            <textarea placeholder="none" className="w-full h-full text-sm resize-none border-0 focus:ring-0 p-0"></textarea>
                                        </div>
                                        <button className="mt-3 h-9 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            Analyze Score
                                        </button>
                                    </div>
                                    <div className="w-28 text-center">
                                        <p className="text-xs font-medium text-gray-600 mb-2">AI Quality Scores</p>
                                        <div className="space-y-2">
                                            <div>
                                                <div className="w-14 h-14 mx-auto rounded-full border-4 border-amber-400 flex items-center justify-center bg-amber-50">
                                                    <span className="text-lg font-bold text-amber-600">{formData.seo_score || 71}%</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">SEO SCORE</p>
                                            </div>
                                            <div>
                                                <div className="w-14 h-14 mx-auto rounded-full border-4 border-green-400 flex items-center justify-center bg-green-50">
                                                    <span className="text-lg font-bold text-green-600">{formData.grammar_score || 89}%</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">GRAMMAR SCORE</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Upload Web Asset */}
                            <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-900">Upload Web Asset</span>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Thumbnail/Blog Image</label>
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="https://example.com/img.jpg" className="flex-1 h-9 px-3 border border-gray-300 rounded-lg text-sm" />
                                        <button className="h-9 px-4 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600">Upload</button>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <label className="block text-xs text-gray-600 mb-1">Additional Files</label>
                                    <div className="flex items-center gap-2">
                                        <button className="h-8 px-3 bg-indigo-600 text-white text-xs font-medium rounded-lg">Choose File</button>
                                        <span className="text-xs text-gray-500">No file selected</span>
                                    </div>
                                </div>
                            </div>

                            {/* Asset Classification */}
                            <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-900">Asset Classification</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Content Type *</label>
                                        <select className="w-full h-9 px-2 border border-gray-300 rounded-lg text-sm bg-white">
                                            <option>Select</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Repository</label>
                                        <select className="w-full h-9 px-2 border border-gray-300 rounded-lg text-sm bg-white">
                                            <option>SMM</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Asset Category</label>
                                        <select className="w-full h-9 px-2 border border-gray-300 rounded-lg text-sm bg-white">
                                            <option>Select</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Asset Type</label>
                                        <select className="w-full h-9 px-2 border border-gray-300 rounded-lg text-sm bg-white">
                                            <option>Select</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Middle Column - Map Asset to Source Work */}
                    <div className="col-span-4">
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 h-full">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-900">Map Asset to Source Work</span>
                                    <p className="text-xs text-gray-500">Link this asset to existing tasks, campaigns, projects and services</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">LINKED TASK</label>
                                    <select className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white">
                                        <option>Select task</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">LINKED CAMPAIGN</label>
                                    <select className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white">
                                        <option>Select campa...</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">LINKED PROJECT</label>
                                    <select className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white">
                                        <option>Select project</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">LINKED SERVICE</label>
                                    <select
                                        value={selectedServiceId || ''}
                                        onChange={(e) => setSelectedServiceId(e.target.value ? parseInt(e.target.value) : null)}
                                        className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white"
                                    >
                                        <option value="">Select servic...</option>
                                        {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">LINKED SUB-SERVICE</label>
                                    <select className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white">
                                        <option>Select sub-se...</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Select a service first to see sub-services</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">LINKED REPOSITORY ITEM</label>
                                    <select className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white">
                                        <option>Select reposit...</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Status */}
                    <div className="col-span-4">
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 h-full">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="font-semibold text-gray-900">Status</span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                                    <select
                                        value={formData.status || 'Draft'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white"
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="Pending QC Review">Pending QC Review</option>
                                        <option value="Approved">Approved</option>
                                    </select>
                                </div>

                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                                    <p className="text-sm text-amber-800">
                                        Status will be updated automatically based on workflow
                                    </p>
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
