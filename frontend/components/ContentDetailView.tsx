import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import type { ContentRepositoryItem, User, Service, SubServiceItem } from '../types';
import { useData } from '../hooks/useData';
import RichTextEditor from './RichTextEditor';

interface ContentDetailViewProps {
    content: ContentRepositoryItem | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ContentRepositoryItem) => Promise<void>;
}

type TabType = 'editor' | 'seo' | 'mapping' | 'assets' | 'qc' | 'versions' | 'activity';

const ContentDetailView: React.FC<ContentDetailViewProps> = ({
    content,
    isOpen,
    onClose,
    onSave
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('editor');
    const [formData, setFormData] = useState<ContentRepositoryItem | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const { data: users = [] } = useData<User>('users');
    const { data: services = [] } = useData<Service>('services');
    const { data: subServices = [] } = useData<SubServiceItem>('subServices');

    useEffect(() => {
        if (content) {
            setFormData({ ...content });
            setError(null);
            setSuccess(null);
        }
    }, [content, isOpen]);

    if (!isOpen || !formData) return null;

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setError(null);
            await onSave(formData);
            setSuccess('Content saved successfully');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save content');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFieldChange = (field: keyof ContentRepositoryItem, value: any) => {
        setFormData(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleHeadingChange = (index: number, value: string, type: 'h2' | 'h3' | 'h4') => {
        if (!formData) return;
        const field = `${type}_list` as keyof ContentRepositoryItem;
        const list = (formData[field] as string[] || []).slice();
        list[index] = value;
        handleFieldChange(field, list);
    };

    const addHeading = (type: 'h2' | 'h3' | 'h4') => {
        if (!formData) return;
        const field = `${type}_list` as keyof ContentRepositoryItem;
        const list = (formData[field] as string[] || []).slice();
        list.push('');
        handleFieldChange(field, list);
    };

    const removeHeading = (index: number, type: 'h2' | 'h3' | 'h4') => {
        if (!formData) return;
        const field = `${type}_list` as keyof ContentRepositoryItem;
        const list = (formData[field] as string[] || []).slice();
        list.splice(index, 1);
        handleFieldChange(field, list);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{formData.title || 'New Content'}</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {formData.content_type} • {formData.status}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b bg-gray-50 px-6 overflow-x-auto">
                    {[
                        { id: 'editor', label: 'Content Editor' },
                        { id: 'seo', label: 'SEO Metadata' },
                        { id: 'mapping', label: 'Mapping' },
                        { id: 'assets', label: 'Assets & Links' },
                        { id: 'qc', label: 'QC & Scoring' },
                        { id: 'versions', label: 'Versions' },
                        { id: 'activity', label: 'Activity Log' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Messages */}
                {error && (
                    <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                        {success}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'editor' && (
                        <ContentEditorTab formData={formData} handleFieldChange={handleFieldChange} handleHeadingChange={handleHeadingChange} addHeading={addHeading} removeHeading={removeHeading} />
                    )}
                    {activeTab === 'seo' && (
                        <SEOMetadataTab formData={formData} handleFieldChange={handleFieldChange} />
                    )}
                    {activeTab === 'mapping' && (
                        <MappingTab formData={formData} handleFieldChange={handleFieldChange} services={services} subServices={subServices} />
                    )}
                    {activeTab === 'assets' && (
                        <AssetsLinksTab formData={formData} />
                    )}
                    {activeTab === 'qc' && (
                        <QCScoringTab formData={formData} />
                    )}
                    {activeTab === 'versions' && (
                        <VersionsTab formData={formData} />
                    )}
                    {activeTab === 'activity' && (
                        <ActivityLogTab formData={formData} />
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <Save size={18} />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Content Editor Tab
const ContentEditorTab: React.FC<{
    formData: ContentRepositoryItem;
    handleFieldChange: (field: keyof ContentRepositoryItem, value: any) => void;
    handleHeadingChange: (index: number, value: string, type: 'h2' | 'h3' | 'h4') => void;
    addHeading: (type: 'h2' | 'h3' | 'h4') => void;
    removeHeading: (index: number, type: 'h2' | 'h3' | 'h4') => void;
}> = ({ formData, handleFieldChange, handleHeadingChange, addHeading, removeHeading }) => {
    return (
        <div className="space-y-6">
            {/* H1 */}
            <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">H1 Heading</label>
                <input
                    type="text"
                    value={formData.h1 || ''}
                    onChange={(e) => handleFieldChange('h1', e.target.value)}
                    placeholder="Main heading for the page"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">The primary heading that describes the page content</p>
            </div>

            {/* H2 Headings */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-900">H2 Headings</label>
                    <button
                        onClick={() => addHeading('h2')}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    >
                        + Add H2
                    </button>
                </div>
                <div className="space-y-2">
                    {(formData.h2_list || []).map((h2, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input
                                type="text"
                                value={h2}
                                onChange={(e) => handleHeadingChange(idx, e.target.value, 'h2')}
                                placeholder={`H2 Heading ${idx + 1}`}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={() => removeHeading(idx, 'h2')}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* H3 Headings */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-900">H3 Headings</label>
                    <button
                        onClick={() => addHeading('h3')}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    >
                        + Add H3
                    </button>
                </div>
                <div className="space-y-2">
                    {(formData.h3_list || []).map((h3, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input
                                type="text"
                                value={h3}
                                onChange={(e) => handleHeadingChange(idx, e.target.value, 'h3')}
                                placeholder={`H3 Heading ${idx + 1}`}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={() => removeHeading(idx, 'h3')}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Body Content */}
            <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Body Content</label>
                <textarea
                    value={formData.body_content || ''}
                    onChange={(e) => handleFieldChange('body_content', e.target.value)}
                    placeholder="Write your main content here..."
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <div className="mt-2 text-xs text-gray-500">
                    Word count: {(formData.body_content || '').split(/\s+/).filter(w => w).length} •
                    Reading time: {Math.ceil((formData.body_content || '').split(/\s+/).filter(w => w).length / 200)} min
                </div>
            </div>
        </div>
    );
};

// SEO Metadata Tab
const SEOMetadataTab: React.FC<{
    formData: ContentRepositoryItem;
    handleFieldChange: (field: keyof ContentRepositoryItem, value: any) => void;
}> = ({ formData, handleFieldChange }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Meta Title</label>
                    <input
                        type="text"
                        value={formData.meta_title || ''}
                        onChange={(e) => handleFieldChange('meta_title', e.target.value)}
                        placeholder="Page title for search engines"
                        maxLength={60}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">{(formData.meta_title || '').length}/60 characters</p>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">SEO Score</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={formData.seo_score || 0}
                            onChange={(e) => handleFieldChange('seo_score', parseInt(e.target.value))}
                            min="0"
                            max="100"
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">/100</span>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Meta Description</label>
                <textarea
                    value={formData.meta_description || ''}
                    onChange={(e) => handleFieldChange('meta_description', e.target.value)}
                    placeholder="Page description for search engines"
                    maxLength={160}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">{(formData.meta_description || '').length}/160 characters</p>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Focus Keywords</label>
                <input
                    type="text"
                    value={(formData.focus_keywords || []).join(', ')}
                    onChange={(e) => handleFieldChange('focus_keywords', e.target.value.split(',').map(k => k.trim()))}
                    placeholder="keyword1, keyword2, keyword3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Secondary Keywords</label>
                <input
                    type="text"
                    value={(formData.secondary_keywords || []).join(', ')}
                    onChange={(e) => handleFieldChange('secondary_keywords', e.target.value.split(',').map(k => k.trim()))}
                    placeholder="keyword1, keyword2, keyword3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        </div>
    );
};

// Mapping Tab
const MappingTab: React.FC<{
    formData: ContentRepositoryItem;
    handleFieldChange: (field: keyof ContentRepositoryItem, value: any) => void;
    services: Service[];
    subServices: SubServiceItem[];
}> = ({ formData, handleFieldChange, services, subServices }) => {
    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Linked Service</label>
                <select
                    value={formData.linked_service_id || ''}
                    onChange={(e) => handleFieldChange('linked_service_id', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select a service</option>
                    {services.map(s => (
                        <option key={s.id} value={s.id}>{s.service_name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Linked Sub-Service</label>
                <select
                    value={formData.linked_sub_service_id || ''}
                    onChange={(e) => handleFieldChange('linked_sub_service_id', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select a sub-service</option>
                    {subServices.map(ss => (
                        <option key={ss.id} value={ss.id}>{ss.sub_service_name}</option>
                    ))}
                </select>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Additional mapping options (campaigns, tasks, keywords) can be added here.
                </p>
            </div>
        </div>
    );
};

// Assets & Links Tab
const AssetsLinksTab: React.FC<{ formData: ContentRepositoryItem }> = ({ formData }) => {
    return (
        <div className="space-y-6">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                    <strong>Assets & Links:</strong> Link assets, images, and resources to this content item.
                </p>
            </div>
            <div className="text-center py-8 text-gray-500">
                No assets linked yet. Use the asset linking interface to add resources.
            </div>
        </div>
    );
};

// QC & Scoring Tab
const QCScoringTab: React.FC<{ formData: ContentRepositoryItem }> = ({ formData }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">QC Score</p>
                    <p className="text-2xl font-bold text-gray-900">{formData.qc_score || '-'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Grammar Score</p>
                    <p className="text-2xl font-bold text-gray-900">{formData.grammar_score || '-'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Plagiarism Score</p>
                    <p className="text-2xl font-bold text-gray-900">{formData.plagiarism_score || '-'}</p>
                </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                    QC scores are automatically calculated when content is submitted for review.
                </p>
            </div>
        </div>
    );
};

// Versions Tab
const VersionsTab: React.FC<{ formData: ContentRepositoryItem }> = ({ formData }) => {
    return (
        <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 mb-2">Current Version</p>
                <p className="text-lg text-gray-700">{formData.version_number || 'v1.0'}</p>
            </div>
            <div className="text-center py-8 text-gray-500">
                Version history will be displayed here.
            </div>
        </div>
    );
};

// Activity Log Tab
const ActivityLogTab: React.FC<{ formData: ContentRepositoryItem }> = ({ formData }) => {
    return (
        <div className="space-y-6">
            <div className="text-center py-8 text-gray-500">
                Activity log will be displayed here showing all changes and updates.
            </div>
        </div>
    );
};

export default ContentDetailView;
