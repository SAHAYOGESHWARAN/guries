import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useData } from '../hooks/useData';
import type { AssetLibraryItem, Service, SubServiceItem, AssetCategoryMasterItem, AssetFormat, AssetTypeMasterItem } from '../types';
import AssetCategoryMasterModal from './AssetCategoryMasterModal';
import AssetTypeMasterModal from './AssetTypeMasterModal';
import AssetFormatMasterModal from './AssetFormatMasterModal';

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
        asset_format: '',
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
    const [showFormatModal, setShowFormatModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<AssetCategoryMasterItem | null>(null);
    const [editingType, setEditingType] = useState<AssetTypeMasterItem | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaInputRef = useRef<HTMLInputElement>(null);

    // Data hooks
    const { data: services = [] } = useData<Service>('services');
    const { data: assetCategories = [] } = useData<AssetCategoryMasterItem>('asset-category-master');
    const { data: assetTypes = [] } = useData<AssetTypeMasterItem>('asset-type-master');
    const { data: assetFormats = [] } = useData<AssetFormat>('asset-formats');
    const { create: createAssetCategory } = useData<AssetCategoryMasterItem>('asset-category-master');
    const { create: createAssetType } = useData<AssetTypeMasterItem>('asset-type-master');

    // Filter asset categories by brand
    const filteredAssetCategories = useMemo(() => {
        return assetCategories.filter(cat => cat.status === 'active');
    }, [assetCategories]);

    // Filter asset types by brand
    const filteredAssetTypes = useMemo(() => {
        return assetTypes.filter(type => type.status === 'active');
    }, [assetTypes]);

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
            }
        };
        reader.readAsDataURL(file);
    }, []);

    const handleUpload = useCallback(async (type: 'draft' | 'qc') => {
        // Handle upload logic here
        console.log('Upload type:', type, 'Asset:', newAsset);
        onSuccess?.();
        onClose();
    }, [newAsset, onSuccess, onClose]);

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
                                            value={newAsset.seo_keywords?.join(', ') || newAsset.keywords?.join(', ') || ''}
                                            onChange={(e) => {
                                                const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
                                                setNewAsset({ ...newAsset, seo_keywords: keywords, keywords: keywords });
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

                            {/* Social Media Platform Selection */}
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

                                    {/* TikTok removed per SMM spec */}
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

                                    {/* Media Upload Section */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
                                            <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            📸 Media Upload
                                        </label>
                                        <div
                                            className="border-dashed border-2 border-purple-300 p-6 rounded-lg text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
                                            onClick={() => mediaInputRef.current?.click()}
                                        >
                                            <svg className="w-12 h-12 text-purple-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <div className="text-sm text-purple-600 font-medium">Upload media for your {newAsset.smm_platform} post</div>
                                            <div className="text-xs text-slate-500 mt-1">Images, videos, GIFs supported</div>
                                            <input
                                                ref={mediaInputRef}
                                                type="file"
                                                className="hidden"
                                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'media')}
                                                accept="image/*,video/*,.gif"
                                            />
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
                                            value={newAsset.keywords?.join(', ') || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) })}
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

                                    {/* Description */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                            </svg>
                                            Description
                                        </label>
                                        <textarea
                                            value={newAsset.web_description || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, web_description: e.target.value })}
                                            placeholder="Detailed description of the web content..."
                                            rows={4}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        />
                                    </div>
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

                            {/* Body Content Section */}
                            <div className="mt-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h4 className="text-md font-bold text-slate-800">Body Content</h4>
                                </div>
                                <textarea
                                    value={newAsset.web_body_content || ''}
                                    onChange={(e) => setNewAsset({ ...newAsset, web_body_content: e.target.value })}
                                    placeholder="Enter the main body content for your web page..."
                                    rows={8}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                />
                                <div className="text-xs text-slate-500 mt-1">
                                    {(newAsset.web_body_content || '').split(' ').filter(w => w.length > 0).length} words
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Standard Asset Upload Fields */}
                    <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Asset Upload Details</h3>
                                <p className="text-sm text-slate-600">Configure asset properties and upload files</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-6">
                                {/* Asset Name */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Asset Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newAsset.name || ''}
                                        onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                                        placeholder="Enter asset name..."
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>

                                {/* Content Type (Locked) */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Content Type</label>
                                    <div className="relative">
                                        <select
                                            value={newAsset.application_type || 'web'}
                                            onChange={(e) => {
                                                if (!contentTypeLocked) {
                                                    setNewAsset({ ...newAsset, application_type: e.target.value as any });
                                                }
                                            }}
                                            disabled={contentTypeLocked}
                                            className={`w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${contentTypeLocked ? 'bg-slate-100 cursor-not-allowed' : ''
                                                }`}
                                        >
                                            <option value="web">WEB</option>
                                            <option value="seo">SEO</option>
                                            <option value="smm">SMM</option>
                                        </select>
                                        {contentTypeLocked && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    {contentTypeLocked && (
                                        <div className="text-xs text-slate-500 mt-1">
                                            Content type is locked to your selection
                                        </div>
                                    )}
                                </div>

                                {/* Asset Type (From Master Table) */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Asset Type <span className="text-slate-500 text-xs">(From Master Table)</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            value={newAsset.type || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                                            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">Select type...</option>
                                            {filteredAssetTypes.map(type => (
                                                <option key={type.id} value={type.asset_type_name}>
                                                    {type.asset_type_name} ({type.word_count} words)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Asset Category (From Master Table) */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Asset Category <span className="text-slate-500 text-xs">(From Master Table)</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            value={newAsset.asset_category || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, asset_category: e.target.value })}
                                            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">Select category...</option>
                                            {filteredAssetCategories.map(category => (
                                                <option key={category.id} value={category.category_name}>
                                                    {category.category_name} ({category.word_count} words)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Asset Format removed per requirements */}
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Map Asset to Services */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Map Asset to Services</label>
                                    <select
                                        value={selectedServiceId || ''}
                                        onChange={(e) => setSelectedServiceId(e.target.value ? parseInt(e.target.value) : null)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Select service...</option>
                                        {services.map(service => (
                                            <option key={service.id} value={service.id}>
                                                {service.service_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Repository */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Repository</label>
                                    <select
                                        value={newAsset.repository || 'Content Repository'}
                                        onChange={(e) => setNewAsset({ ...newAsset, repository: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="Content Repository">Content Repository</option>
                                        <option value="Media Repository">Media Repository</option>
                                        <option value="Document Repository">Document Repository</option>
                                        <option value="Template Repository">Template Repository</option>
                                    </select>
                                </div>

                                {/* Quality Scores */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">Quality Scores</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-2">SEO Score</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={newAsset.seo_score || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, seo_score: parseInt(e.target.value) || undefined })}
                                                placeholder="0-100"
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-600 mb-2">Grammar Score</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={newAsset.grammar_score || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, grammar_score: parseInt(e.target.value) || undefined })}
                                                placeholder="0-100"
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-2">
                                        Both scores required for QC submission
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* File Upload Section */}
                        <div className="mt-8">
                            <label className="block text-sm font-semibold text-slate-700 mb-4">File Upload</label>
                            <div
                                className={`border-dashed border-2 p-8 rounded-xl text-center cursor-pointer transition-all ${dragActive
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                                    }`}
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={handleDrag}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                            >
                                {previewUrl ? (
                                    <div className="space-y-4">
                                        <img src={previewUrl} className="mx-auto max-h-40 rounded-lg shadow-md" alt="Preview" />
                                        <div className="text-sm text-slate-700 font-medium">{selectedFile?.name}</div>
                                        <div className="text-xs text-slate-500">
                                            {selectedFile && `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedFile(null);
                                                setPreviewUrl('');
                                                setNewAsset(prev => ({
                                                    ...prev,
                                                    file_url: undefined,
                                                    thumbnail_url: undefined,
                                                    file_size: undefined,
                                                    file_type: undefined
                                                }));
                                            }}
                                            className="text-sm text-red-600 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            Remove File
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-lg font-semibold text-slate-700 mb-2">
                                                Drag & drop your files here, or click to browse
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                Supported formats: PNG, JPG, SVG, PDF, MP4, WEBM, AVIF
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                    accept="image/*,video/*,.pdf,.doc,.docx,.zip,.svg,.webm,.avif"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleUpload('draft')}
                            className="px-6 py-2 text-sm font-medium bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                        >
                            Save Draft
                        </button>
                        <button
                            onClick={() => handleUpload('qc')}
                            disabled={!newAsset.seo_score || !newAsset.grammar_score}
                            className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${newAsset.seo_score && newAsset.grammar_score
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                }`}
                        >
                            Submit to QC
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

                {
                    showFormatModal && (
                        <AssetFormatMasterModal
                            isOpen={showFormatModal}
                            onClose={() => setShowFormatModal(false)}
                            onSuccess={() => {
                                setShowFormatModal(false);
                            }}
                        />
                    )
                }
            </div >
        </div >
    );
};

export default UploadAssetModal;