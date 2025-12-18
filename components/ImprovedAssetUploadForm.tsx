import React, { useState, useRef, useCallback, useMemo } from 'react';
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