import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { API_BASE_URL } from '../constants';

interface ContentType {
    id: number;
    content_type: string;
    category: string;
}

interface AssetType {
    id: number;
    asset_type: string;
    dimension: string;
}

interface RecommendedSize {
    asset_type_id: number;
    recommended_dimension: string;
    file_format: string;
    notes: string;
}

interface SchedulingOption {
    type: string;
    enabled: boolean;
}

interface PlatformMasterModalProps {
    platform: any;
    contentTypes: ContentType[];
    assetTypes: AssetType[];
    onSave: (data: any) => void;
    onClose: () => void;
}

export default function PlatformMasterModal({
    platform,
    contentTypes,
    assetTypes,
    onSave,
    onClose
}: PlatformMasterModalProps) {
    const [formData, setFormData] = useState({
        platform_name: '',
        platform_code: '',
        description: '',
        contentTypeIds: [] as number[],
        assetTypeIds: [] as number[],
        recommendedSizes: [] as RecommendedSize[],
        schedulingOptions: [
            { type: 'Manual', enabled: false },
            { type: 'Auto', enabled: false },
            { type: 'Both', enabled: false }
        ] as SchedulingOption[]
    });

    const [activeTab, setActiveTab] = useState('basic');

    useEffect(() => {
        if (platform) {
            fetchPlatformDetails();
        }
    }, [platform]);

    const fetchPlatformDetails = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/platform-master/${platform.id}`);
            const data = await response.json();
            setFormData({
                platform_name: data.platform_name,
                platform_code: data.platform_code || '',
                description: data.description || '',
                contentTypeIds: data.contentTypes.map((ct: any) => ct.id),
                assetTypeIds: data.assetTypes.map((at: any) => at.id),
                recommendedSizes: data.recommendedSizes,
                schedulingOptions: data.schedulingOptions
            });
        } catch (error) {
            console.error('Error fetching platform details:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleContentTypeToggle = (id: number) => {
        setFormData(prev => ({
            ...prev,
            contentTypeIds: prev.contentTypeIds.includes(id)
                ? prev.contentTypeIds.filter(ct => ct !== id)
                : [...prev.contentTypeIds, id]
        }));
    };

    const handleAssetTypeToggle = (id: number) => {
        setFormData(prev => ({
            ...prev,
            assetTypeIds: prev.assetTypeIds.includes(id)
                ? prev.assetTypeIds.filter(at => at !== id)
                : [...prev.assetTypeIds, id]
        }));
    };

    const handleSchedulingToggle = (type: string) => {
        setFormData(prev => ({
            ...prev,
            schedulingOptions: prev.schedulingOptions.map(opt =>
                opt.type === type ? { ...opt, enabled: !opt.enabled } : opt
            )
        }));
    };

    const handleRecommendedSizeChange = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            recommendedSizes: prev.recommendedSizes.map((size, i) =>
                i === index ? { ...size, [field]: value } : size
            )
        }));
    };

    const addRecommendedSize = () => {
        setFormData(prev => ({
            ...prev,
            recommendedSizes: [
                ...prev.recommendedSizes,
                { asset_type_id: 0, recommended_dimension: '', file_format: '', notes: '' }
            ]
        }));
    };

    const removeRecommendedSize = (index: number) => {
        setFormData(prev => ({
            ...prev,
            recommendedSizes: prev.recommendedSizes.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.platform_name.trim()) {
            alert('Platform name is required');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {platform ? 'Edit Platform' : 'Add New Platform'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b px-6 pt-4">
                    {['basic', 'content', 'assets', 'sizes', 'scheduling'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === tab
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Basic Info Tab */}
                    {activeTab === 'basic' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Platform Name *
                                </label>
                                <input
                                    type="text"
                                    name="platform_name"
                                    value={formData.platform_name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Facebook, Instagram, LinkedIn"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Platform Code
                                </label>
                                <input
                                    type="text"
                                    name="platform_code"
                                    value={formData.platform_code}
                                    onChange={handleInputChange}
                                    placeholder="e.g., FB, IG, LI"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Platform description and details"
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    {/* Content Types Tab */}
                    {activeTab === 'content' && (
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Select Content Types Allowed</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {contentTypes.map(ct => (
                                    <label key={ct.id} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.contentTypeIds.includes(ct.id)}
                                            onChange={() => handleContentTypeToggle(ct.id)}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <div>
                                            <div className="font-medium text-gray-900">{ct.content_type}</div>
                                            <div className="text-xs text-gray-500">{ct.category}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <p className="text-sm text-gray-600 mt-4">
                                Selected: {formData.contentTypeIds.length} content types
                            </p>
                        </div>
                    )}

                    {/* Asset Types Tab */}
                    {activeTab === 'assets' && (
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Link Asset Type Master</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {assetTypes.map(at => (
                                    <label key={at.id} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.assetTypeIds.includes(at.id)}
                                            onChange={() => handleAssetTypeToggle(at.id)}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <div>
                                            <div className="font-medium text-gray-900">{at.asset_type}</div>
                                            <div className="text-xs text-gray-500">{at.dimension}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <p className="text-sm text-gray-600 mt-4">
                                Selected: {formData.assetTypeIds.length} asset types
                            </p>
                        </div>
                    )}

                    {/* Recommended Sizes Tab */}
                    {activeTab === 'sizes' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-900">Recommended Dimensions</h3>
                                <button
                                    type="button"
                                    onClick={addRecommendedSize}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    + Add Size
                                </button>
                            </div>

                            <div className="space-y-4">
                                {formData.recommendedSizes.map((size, index) => (
                                    <div key={index} className="p-4 border rounded-lg">
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Asset Type
                                                </label>
                                                <select
                                                    value={size.asset_type_id}
                                                    onChange={(e) => handleRecommendedSizeChange(index, 'asset_type_id', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">Select Asset Type</option>
                                                    {assetTypes.map(at => (
                                                        <option key={at.id} value={at.id}>{at.asset_type}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Recommended Dimension
                                                </label>
                                                <input
                                                    type="text"
                                                    value={size.recommended_dimension}
                                                    onChange={(e) => handleRecommendedSizeChange(index, 'recommended_dimension', e.target.value)}
                                                    placeholder="e.g., 1200x627px"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    File Format
                                                </label>
                                                <input
                                                    type="text"
                                                    value={size.file_format}
                                                    onChange={(e) => handleRecommendedSizeChange(index, 'file_format', e.target.value)}
                                                    placeholder="e.g., JPG, PNG"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Notes
                                                </label>
                                                <input
                                                    type="text"
                                                    value={size.notes}
                                                    onChange={(e) => handleRecommendedSizeChange(index, 'notes', e.target.value)}
                                                    placeholder="Additional notes"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeRecommendedSize(index)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Scheduling Options Tab */}
                    {activeTab === 'scheduling' && (
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Scheduling Options</h3>
                            <div className="space-y-3">
                                {formData.schedulingOptions.map(option => (
                                    <label key={option.type} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={option.enabled}
                                            onChange={() => handleSchedulingToggle(option.type)}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <div>
                                            <div className="font-medium text-gray-900">{option.type}</div>
                                            <div className="text-xs text-gray-500">
                                                {option.type === 'Manual' && 'Publish now'}
                                                {option.type === 'Auto' && 'Schedule for later'}
                                                {option.type === 'Both' && 'Both manual and scheduled'}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex gap-3 mt-8 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                        >
                            {platform ? 'Update Platform' : 'Add Platform'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
