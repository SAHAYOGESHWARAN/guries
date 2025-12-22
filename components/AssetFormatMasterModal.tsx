import React, { useState } from 'react';
import { useData } from '../hooks/useData';

interface AssetFormatMasterItem {
    id: number;
    format_name: string;
    format_type: 'image' | 'video' | 'document' | 'audio';
    file_extensions: string[];
    max_file_size_mb: number;
    description?: string;
    application_types: ('web' | 'seo' | 'smm')[];
    status: string;
    created_at?: string;
    updated_at?: string;
}

interface AssetFormatMasterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const AssetFormatMasterModal: React.FC<AssetFormatMasterModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const { create: createAssetFormat } = useData<AssetFormatMasterItem>('asset-formats');

    const [formData, setFormData] = useState({
        format_name: '',
        format_type: 'image' as 'image' | 'video' | 'document' | 'audio',
        file_extensions: [] as string[],
        max_file_size_mb: 10,
        description: '',
        application_types: [] as ('web' | 'seo' | 'smm')[]
    });

    const [extensionInput, setExtensionInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatTypeOptions = [
        { value: 'image', label: 'Image' },
        { value: 'video', label: 'Video' },
        { value: 'document', label: 'Document' },
        { value: 'audio', label: 'Audio' }
    ];

    const applicationTypeOptions = [
        { value: 'web', label: 'WEB' },
        { value: 'seo', label: 'SEO' },
        { value: 'smm', label: 'SMM' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.format_name || !formData.format_type || formData.file_extensions.length === 0 || formData.application_types.length === 0) {
            alert('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            await createAssetFormat({
                ...formData,
                status: 'active'
            });

            // Reset form
            setFormData({
                format_name: '',
                format_type: 'image',
                file_extensions: [],
                max_file_size_mb: 10,
                description: '',
                application_types: []
            });
            setExtensionInput('');

            if (onSuccess) {
                onSuccess();
            }
            onClose();
        } catch (error) {
            console.error('Failed to create asset format:', error);
            alert('Failed to create asset format. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const addExtension = () => {
        if (extensionInput.trim() && !formData.file_extensions.includes(extensionInput.trim())) {
            setFormData(prev => ({
                ...prev,
                file_extensions: [...prev.file_extensions, extensionInput.trim()]
            }));
            setExtensionInput('');
        }
    };

    const removeExtension = (extension: string) => {
        setFormData(prev => ({
            ...prev,
            file_extensions: prev.file_extensions.filter(ext => ext !== extension)
        }));
    };

    const toggleApplicationType = (type: 'web' | 'seo' | 'smm') => {
        setFormData(prev => ({
            ...prev,
            application_types: prev.application_types.includes(type)
                ? prev.application_types.filter(t => t !== type)
                : [...prev.application_types, type]
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-900">Add Asset Format</h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Format Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Format Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.format_name}
                                onChange={(e) => handleInputChange('format_name', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="e.g., JPEG Image, MP4 Video"
                                required
                            />
                        </div>

                        {/* Format Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Format Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.format_type}
                                onChange={(e) => handleInputChange('format_type', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            >
                                {formatTypeOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* File Extensions */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                File Extensions <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={extensionInput}
                                    onChange={(e) => setExtensionInput(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="e.g., .jpg, .png, .mp4"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExtension())}
                                />
                                <button
                                    type="button"
                                    onClick={addExtension}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.file_extensions.map(extension => (
                                    <span
                                        key={extension}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                                    >
                                        {extension}
                                        <button
                                            type="button"
                                            onClick={() => removeExtension(extension)}
                                            className="text-indigo-600 hover:text-indigo-800"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Max File Size */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Max File Size (MB)
                            </label>
                            <input
                                type="number"
                                value={formData.max_file_size_mb}
                                onChange={(e) => handleInputChange('max_file_size_mb', parseInt(e.target.value) || 10)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                min="1"
                                max="1000"
                            />
                        </div>

                        {/* Application Types */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Application Types <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-3">
                                {applicationTypeOptions.map(option => (
                                    <label key={option.value} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.application_types.includes(option.value as 'web' | 'seo' | 'smm')}
                                            onChange={() => toggleApplicationType(option.value as 'web' | 'seo' | 'smm')}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-slate-700">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                rows={3}
                                placeholder="Optional description"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AssetFormatMasterModal;