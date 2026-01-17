import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { API_BASE_URL } from '../constants';

interface SeoErrorTypeModalProps {
    errorType: any;
    categories: string[];
    onSave: (data: any) => void;
    onClose: () => void;
}

const PREDEFINED_ERROR_TYPES = [
    'On-page',
    'Technical SEO',
    'Schema Errors',
    'Meta Tag Missing',
    'Image Alt Missing',
    'LCP Issue',
    'CLS Issue',
    'HTML Errors',
    'Content Thin',
    'Redirect Loops',
    'Broken Links'
];

const CATEGORIES = [
    'On-page',
    'Technical SEO',
    'Schema Errors',
    'Content'
];

export default function SeoErrorTypeModal({
    errorType,
    categories,
    onSave,
    onClose
}: SeoErrorTypeModalProps) {
    const [formData, setFormData] = useState({
        error_type: '',
        category: '',
        severity_level: 'Medium',
        description: '',
        status: 'active'
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPredefined, setShowPredefined] = useState(false);

    useEffect(() => {
        if (errorType) {
            setFormData({
                error_type: errorType.error_type,
                category: errorType.category,
                severity_level: errorType.severity_level,
                description: errorType.description,
                status: errorType.status
            });
        }
    }, [errorType]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.error_type.trim()) {
            newErrors.error_type = 'Error type is required';
        }
        if (!formData.category.trim()) {
            newErrors.category = 'Category is required';
        }
        if (!formData.severity_level.trim()) {
            newErrors.severity_level = 'Severity level is required';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handlePredefinedSelect = (type: string) => {
        setFormData(prev => ({
            ...prev,
            error_type: type
        }));
        setShowPredefined(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {errorType ? 'Edit SEO Error Type' : 'Add SEO Error Type'}
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                            Create a new SEO error type with category and severity level
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Error Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Error Type *
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="error_type"
                                value={formData.error_type}
                                onChange={handleInputChange}
                                placeholder="e.g., Meta Tag Missing"
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.error_type ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {!errorType && (
                                <button
                                    type="button"
                                    onClick={() => setShowPredefined(!showPredefined)}
                                    className="absolute right-3 top-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    Quick Select
                                </button>
                            )}
                        </div>
                        {errors.error_type && <p className="text-red-500 text-xs mt-1">{errors.error_type}</p>}

                        {/* Predefined Types */}
                        {showPredefined && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-xs font-medium text-gray-700 mb-2">Quick Select Predefined Types:</p>
                                <div className="flex flex-wrap gap-2">
                                    {PREDEFINED_ERROR_TYPES.map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => handlePredefinedSelect(type)}
                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200"
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category *
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.category ? 'border-red-500' : 'border-gray-300'
                                }`}
                        >
                            <option value="">Select category</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                    </div>

                    {/* Severity Level */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Severity Level *
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {['Low', 'Medium', 'High'].map(level => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, severity_level: level }))}
                                    className={`p-3 rounded-lg border-2 text-center font-medium transition-all ${formData.severity_level === level
                                            ? level === 'High'
                                                ? 'border-red-500 bg-red-50'
                                                : level === 'Medium'
                                                    ? 'border-yellow-500 bg-yellow-50'
                                                    : 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                >
                                    <div className="text-lg mb-1">
                                        {level === 'High' ? '🔴' : level === 'Medium' ? '🟡' : '🔵'}
                                    </div>
                                    <div className={`text-sm ${level === 'High'
                                            ? 'text-red-700'
                                            : level === 'Medium'
                                                ? 'text-yellow-700'
                                                : 'text-blue-700'
                                        }`}>
                                        {level}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                        {level === 'High' ? 'Critical' : level === 'Medium' ? 'Should fix' : 'Minor issues'}
                                    </div>
                                </button>
                            ))}
                        </div>
                        {errors.severity_level && <p className="text-red-500 text-xs mt-1">{errors.severity_level}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Provide a detailed description of this error type and its impact..."
                            rows={4}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Status
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value="active"
                                    checked={formData.status === 'active'}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm font-medium text-gray-700">Active</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value="inactive"
                                    checked={formData.status === 'inactive'}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-gray-600"
                                />
                                <span className="text-sm font-medium text-gray-700">Inactive</span>
                            </label>
                        </div>
                    </div>

                    {/* Guidelines */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800 font-medium mb-2">Error Type Guidelines:</p>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• High severity errors should be prioritized for immediate fixes</li>
                            <li>• Medium severity errors should be addressed in regular maintenance</li>
                            <li>• Low severity errors can be optimized over time</li>
                            <li>• Inactive error types won't be tracked during SEO audits</li>
                        </ul>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 pt-6 border-t">
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
                            {errorType ? 'Update Error Type' : 'Add Error Type'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
