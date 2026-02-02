import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';

interface Service {
    id: number;
    service_name: string;
    slug: string;
}

interface SubService {
    id: number;
    sub_service_name: string;
    parent_service_id: number;
    slug: string;
}

interface AssetUploadProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (asset: any) => void;
    applicationTypes?: string[];
}

export const AssetUploadWithServiceLink: React.FC<AssetUploadProps> = ({
    isOpen,
    onClose,
    onSuccess,
    applicationTypes = ['WEB', 'SEO', 'SMM']
}) => {
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        asset_category: '',
        asset_format: '',
        application_type: '',
        linked_service_id: '',
        linked_sub_service_id: '',
        file_url: '',
        thumbnail_url: '',
        seo_score: '',
        grammar_score: '',
        keywords: [] as string[]
    });

    const [services, setServices] = useState<Service[]>([]);
    const [subServices, setSubServices] = useState<SubService[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [keywordInput, setKeywordInput] = useState('');

    // Fetch services on mount
    useEffect(() => {
        if (isOpen) {
            fetchServices();
        }
    }, [isOpen]);

    // Fetch sub-services when service changes
    useEffect(() => {
        if (formData.linked_service_id) {
            fetchSubServices(Number(formData.linked_service_id));
        } else {
            setSubServices([]);
            setFormData(prev => ({ ...prev, linked_sub_service_id: '' }));
        }
    }, [formData.linked_service_id]);

    const fetchServices = async () => {
        try {
            const response = await fetch('/api/v1/services');
            if (!response.ok) throw new Error('Failed to fetch services');
            const data = await response.json();
            setServices(data);
        } catch (err) {
            console.error('Error fetching services:', err);
            setError('Failed to load services');
        }
    };

    const fetchSubServices = async (serviceId: number) => {
        try {
            const response = await fetch(`/api/v1/services/${serviceId}/sub-services`);
            if (!response.ok) throw new Error('Failed to fetch sub-services');
            const data = await response.json();
            setSubServices(data);
        } catch (err) {
            console.error('Error fetching sub-services:', err);
            setSubServices([]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddKeyword = () => {
        if (keywordInput.trim()) {
            setFormData(prev => ({
                ...prev,
                keywords: [...prev.keywords, keywordInput.trim()]
            }));
            setKeywordInput('');
        }
    };

    const handleRemoveKeyword = (index: number) => {
        setFormData(prev => ({
            ...prev,
            keywords: prev.keywords.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.name.trim()) {
                throw new Error('Asset name is required');
            }
            if (!formData.application_type) {
                throw new Error('Application type is required');
            }

            const payload = {
                ...formData,
                linked_service_id: formData.linked_service_id ? Number(formData.linked_service_id) : null,
                linked_sub_service_id: formData.linked_sub_service_id ? Number(formData.linked_sub_service_id) : null,
                seo_score: formData.seo_score ? Number(formData.seo_score) : null,
                grammar_score: formData.grammar_score ? Number(formData.grammar_score) : null,
                created_by: (window as any).userId || 1
            };

            const response = await fetch('/api/v1/assets/upload-with-service', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create asset');
            }

            const result = await response.json();
            onSuccess?.(result.asset);

            // Reset form
            setFormData({
                name: '',
                type: '',
                asset_category: '',
                asset_format: '',
                application_type: '',
                linked_service_id: '',
                linked_sub_service_id: '',
                file_url: '',
                thumbnail_url: '',
                seo_score: '',
                grammar_score: '',
                keywords: []
            });

            onClose();
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Upload Asset with Service Link">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Asset Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Asset Name *
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter asset name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                {/* Application Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Application Type *
                    </label>
                    <select
                        name="application_type"
                        value={formData.application_type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">Select application type</option>
                        {applicationTypes.map(type => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Asset Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Asset Type
                    </label>
                    <input
                        type="text"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        placeholder="e.g., Image, Video, Document"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Asset Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Asset Category
                    </label>
                    <input
                        type="text"
                        name="asset_category"
                        value={formData.asset_category}
                        onChange={handleInputChange}
                        placeholder="e.g., Blog, Infographic"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Linked Service */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Link to Service
                    </label>
                    <select
                        name="linked_service_id"
                        value={formData.linked_service_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select a service (optional)</option>
                        {services.map(service => (
                            <option key={service.id} value={service.id}>
                                {service.service_name}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                        This link is static and cannot be removed after creation
                    </p>
                </div>

                {/* Linked Sub-Service */}
                {formData.linked_service_id && subServices.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Link to Sub-Service
                        </label>
                        <select
                            name="linked_sub_service_id"
                            value={formData.linked_sub_service_id}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a sub-service (optional)</option>
                            {subServices.map(subService => (
                                <option key={subService.id} value={subService.id}>
                                    {subService.sub_service_name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* SEO Score */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        SEO Score (0-100)
                    </label>
                    <input
                        type="number"
                        name="seo_score"
                        value={formData.seo_score}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        placeholder="Enter SEO score"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Grammar Score */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grammar Score (0-100)
                    </label>
                    <input
                        type="number"
                        name="grammar_score"
                        value={formData.grammar_score}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        placeholder="Enter grammar score"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Keywords */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Keywords
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                            placeholder="Enter keyword and press Enter"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={handleAddKeyword}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.keywords.map((keyword, index) => (
                            <span
                                key={index}
                                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                            >
                                {keyword}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveKeyword(index)}
                                    className="text-blue-600 hover:text-blue-800 font-bold"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* File URL */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        File URL
                    </label>
                    <input
                        type="url"
                        name="file_url"
                        value={formData.file_url}
                        onChange={handleInputChange}
                        placeholder="https://example.com/file.pdf"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 justify-end pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                    >
                        {loading ? 'Creating...' : 'Create Asset'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
