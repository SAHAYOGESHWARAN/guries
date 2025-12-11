import React, { useState, useRef, useCallback } from 'react';
import { useData } from '../hooks/useData';
import type { AssetLibraryItem, Service, SubServiceItem } from '../types';

interface UploadAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const UploadAssetModal: React.FC<UploadAssetModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { create: createAsset } = useData<AssetLibraryItem>('assetLibrary');
    const { data: services = [] } = useData<Service>('services');
    const { data: subServices = [] } = useData<SubServiceItem>('subServices');

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
    });

    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
    const [selectedSubServiceIds, setSelectedSubServiceIds] = useState<number[]>([]);

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

    const handleUpload = useCallback(async () => {
        if (!newAsset.name?.trim()) {
            alert('Please enter an asset name');
            return;
        }

        if (!selectedFile && !newAsset.file_url) {
            alert('Please select a file to upload');
            return;
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
                linking_active: false
            };

            await createAsset(assetPayload as AssetLibraryItem);

            // Reset form
            setSelectedFile(null);
            setPreviewUrl('');
            setSelectedServiceId(null);
            setSelectedSubServiceIds([]);
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
            });

            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload asset. Please try again.');
        } finally {
            setIsUploading(false);
        }
    }, [newAsset, selectedFile, createAsset, selectedServiceId, selectedSubServiceIds, services, subServices, onSuccess, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
                                    <p className="text-base font-semibold text-slate-700 mb-2">Drag & drop your files here, or click to browse</p>
                                    <p className="text-sm text-slate-500">Supported formats: PNG, JPG, SVG, PDF, MP4, WEBM, AVIF</p>
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
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>View Vendor History</span>
                        <input type="checkbox" className="ml-2" />
                        <span className="ml-4">Replace Existing Version</span>
                        <input type="checkbox" className="ml-2" />
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            disabled={isUploading}
                            className="px-6 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={isUploading || !newAsset.name?.trim()}
                            className={`px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:shadow-md transition-all flex items-center gap-2 ${isUploading || !newAsset.name?.trim() ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadAssetModal;