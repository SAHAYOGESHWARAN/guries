import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { API_BASE_URL } from '../constants';

interface CountryMasterModalProps {
    country: any;
    regions: string[];
    onSave: (data: any) => void;
    onClose: () => void;
}

const LANGUAGES = [
    'English',
    'Spanish',
    'French',
    'German',
    'Italian',
    'Portuguese',
    'Dutch',
    'Russian',
    'Chinese',
    'Japanese',
    'Korean',
    'Arabic',
    'Hindi',
    'Turkish',
    'Polish',
    'Swedish',
    'Norwegian',
    'Danish',
    'Finnish',
    'Greek'
];

const COUNTRIES_LIST = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
    'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden',
    'Norway', 'Denmark', 'Finland', 'Poland', 'Czech Republic', 'Hungary', 'Romania',
    'Portugal', 'Greece', 'Ireland', 'New Zealand', 'Singapore', 'India', 'Japan',
    'South Korea', 'China', 'Brazil', 'Mexico', 'Argentina', 'Chile', 'Colombia',
    'Peru', 'Venezuela', 'South Africa', 'Egypt', 'Nigeria', 'Kenya', 'UAE',
    'Saudi Arabia', 'Israel', 'Turkey', 'Russia', 'Ukraine', 'Thailand', 'Vietnam',
    'Philippines', 'Indonesia', 'Malaysia', 'Pakistan', 'Bangladesh'
];

export default function CountryMasterModal({
    country,
    regions,
    onSave,
    onClose
}: CountryMasterModalProps) {
    const [formData, setFormData] = useState({
        country_name: '',
        iso_code: '',
        region: '',
        default_language: '',
        allowed_for_backlinks: false,
        allowed_for_content_targeting: false,
        allowed_for_smm_targeting: false,
        status: 'active'
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (country) {
            setFormData({
                country_name: country.country_name,
                iso_code: country.iso_code,
                region: country.region,
                default_language: country.default_language || '',
                allowed_for_backlinks: !!country.allowed_for_backlinks,
                allowed_for_content_targeting: !!country.allowed_for_content_targeting,
                allowed_for_smm_targeting: !!country.allowed_for_smm_targeting,
                status: country.status
            });
        }
    }, [country]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.country_name.trim()) {
            newErrors.country_name = 'Country name is required';
        }
        if (!formData.iso_code.trim()) {
            newErrors.iso_code = 'ISO code is required';
        } else if (formData.iso_code.length > 10) {
            newErrors.iso_code = 'ISO code must be 10 characters or less';
        }
        if (!formData.region.trim()) {
            newErrors.region = 'Region is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as any;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleCheckboxChange = (field: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: !prev[field as keyof typeof formData]
        }));
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
                            {country ? 'Edit Country' : 'Add New Country'}
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                            Update country settings and targeting configurations
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Country Name *
                                </label>
                                <select
                                    name="country_name"
                                    value={formData.country_name}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.country_name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select country</option>
                                    {COUNTRIES_LIST.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                {errors.country_name && <p className="text-red-500 text-xs mt-1">{errors.country_name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ISO Code *
                                </label>
                                <input
                                    type="text"
                                    name="iso_code"
                                    value={formData.iso_code}
                                    onChange={handleInputChange}
                                    placeholder="e.g., US, GB, CA"
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.iso_code ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors.iso_code && <p className="text-red-500 text-xs mt-1">{errors.iso_code}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Region *
                                </label>
                                <select
                                    name="region"
                                    value={formData.region}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.region ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select region</option>
                                    <option value="North America">North America</option>
                                    <option value="South America">South America</option>
                                    <option value="Europe">Europe</option>
                                    <option value="Asia">Asia</option>
                                    <option value="Africa">Africa</option>
                                    <option value="Oceania">Oceania</option>
                                    <option value="Middle East">Middle East</option>
                                </select>
                                {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Default Language
                                </label>
                                <select
                                    name="default_language"
                                    value={formData.default_language}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select language</option>
                                    {LANGUAGES.map(lang => (
                                        <option key={lang} value={lang}>{lang}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Targeting Permissions */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Targeting Permissions</h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.allowed_for_backlinks}
                                    onChange={() => handleCheckboxChange('allowed_for_backlinks')}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">Allowed for Backlinks?</div>
                                    <div className="text-xs text-gray-500">Enable backlink targeting for this country</div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.allowed_for_content_targeting}
                                    onChange={() => handleCheckboxChange('allowed_for_content_targeting')}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">Allowed for Content Targeting?</div>
                                    <div className="text-xs text-gray-500">Enable content localization and targeting for this country</div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.allowed_for_smm_targeting}
                                    onChange={() => handleCheckboxChange('allowed_for_smm_targeting')}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">Allowed for SMM Targeting?</div>
                                    <div className="text-xs text-gray-500">Enable social media marketing targeting for this country</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
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

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Country Configuration:</strong> Targeting permissions control which services and campaigns can operate in this country. Ensure compliance with local regulations when enabling targeting options.
                        </p>
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
                            {country ? 'Update Country' : 'Add Country'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
