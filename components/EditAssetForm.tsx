import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useData } from '../hooks/useData';
import type { AssetLibraryItem, Service, SubServiceItem, Task, Campaign, Project, ContentRepositoryItem } from '../types';

interface EditAssetFormProps {
    asset: Partial<AssetLibraryItem>;
    onSave: (asset: Partial<AssetLibraryItem>, submitForQC?: boolean) => Promise<void>;
    onCancel: () => void;
    isUploading: boolean;
}

const EditAssetForm: React.FC<EditAssetFormProps> = ({ asset, onSave, onCancel, isUploading }) => {
    const { data: services = [] } = useData<Service>('services');
    const { data: subServices = [] } = useData<SubServiceItem>('subServices');
    const { data: tasks = [] } = useData<Task>('tasks');
    const { data: campaigns = [] } = useData<Campaign>('campaigns');
    const { data: projects = [] } = useData<Project>('projects');
    const { data: repositoryItems = [] } = useData<ContentRepositoryItem>('content');

    const [formData, setFormData] = useState<Partial<AssetLibraryItem>>({
        ...asset,
        name: asset.name || '',
        type: asset.type || 'article',
        status: asset.status || 'Draft',
    });

    const [linkedTaskId, setLinkedTaskId] = useState<number | null>(asset.linked_task_id || null);
    const [linkedCampaignId, setLinkedCampaignId] = useState<number | null>(asset.linked_campaign_id || null);
    const [linkedProjectId, setLinkedProjectId] = useState<number | null>(asset.linked_project_id || null);
    const [linkedServiceId, setLinkedServiceId] = useState<number | null>(asset.linked_service_id || null);
    const [linkedSubServiceId, setLinkedSubServiceId] = useState<number | null>(asset.linked_sub_service_id || null);
    const [linkedRepositoryItemId, setLinkedRepositoryItemId] = useState<number | null>(asset.linked_repository_item_id || null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState(asset.thumbnail_url || asset.file_url || '');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredSubServices = useMemo(() =>
        linkedServiceId ? subServices.filter(s => Number(s.parent_service_id) === Number(linkedServiceId)) : [],
        [subServices, linkedServiceId]
    );

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
        if (!formData.name?.trim()) {
            alert('Please enter an asset name');
            return;
        }

        let mappedToString = '';
        if (linkedServiceId) {
            const service = services.find(s => s.id === linkedServiceId);
            if (service) {
                mappedToString = service.service_name;
                if (linkedSubServiceId) {
                    const subService = subServices.find(ss => ss.id === linkedSubServiceId);
                    if (subService) mappedToString += ` / ${subService.sub_service_name}`;
                }
            }
        }

        await onSave({
            ...formData,
            linked_task_id: linkedTaskId,
            linked_campaign_id: linkedCampaignId,
            linked_project_id: linkedProjectId,
            linked_service_id: linkedServiceId,
            linked_sub_service_id: linkedSubServiceId,
            linked_repository_item_id: linkedRepositoryItemId,
            mapped_to: mappedToString || formData.mapped_to,
            status: submitForQC ? 'Pending QC Review' : (formData.status || 'Draft'),
        }, submitForQC);
    };

    const isComplete = !!formData.name?.trim();

    return (
        <div className="fixed inset-0 z-50 bg-gray-50 overflow-auto">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onCancel}
                            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Edit Asset</h1>
                            <p className="text-sm text-gray-500">Update asset details</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onCancel}
                            disabled={isUploading}
                            className="px-5 h-10 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleSubmit(false)}
                            disabled={isUploading || !isComplete}
                            className="px-5 h-10 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {isUploading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            onClick={() => handleSubmit(true)}
                            disabled={isUploading || !isComplete}
                            className="px-5 h-10 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                        >
                            Submit for QC
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
                {/* File Upload Section */}
                <section className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </span>
                        File Upload
                    </h2>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                            accept="image/*,video/*,.pdf,.doc,.docx"
                        />
                        {previewUrl ? (
                            <div className="space-y-3">
                                <img src={previewUrl} alt="Preview" className="h-40 mx-auto rounded-lg object-cover shadow-md" />
                                <p className="text-sm font-medium text-gray-700">{selectedFile?.name || 'Current file'}</p>
                                <button
                                    onClick={e => { e.stopPropagation(); setSelectedFile(null); setPreviewUrl(''); }}
                                    className="text-sm text-red-600 hover:underline"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-gray-700">Drop files here or click to browse</p>
                                <p className="text-xs text-gray-500">PNG, JPG, PDF, MP4 up to 50MB</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Basic Information */}
                <section className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                        Basic Information
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Asset Title *</label>
                            <input
                                type="text"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter asset name"
                                className="w-full h-11 px-4 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Asset Type</label>
                            <select
                                value={formData.type || 'article'}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                className="w-full h-11 px-4 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="article">Article</option>
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                                <option value="document">Document</option>
                                <option value="graphic">Graphic</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Link to Source Work */}
                <section className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </span>
                        Link to Source Work
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Linked Task</label>
                            <select
                                value={linkedTaskId || ''}
                                onChange={e => setLinkedTaskId(e.target.value ? Number(e.target.value) : null)}
                                className="w-full h-11 px-4 border border-gray-300 rounded-lg text-sm bg-white"
                            >
                                <option value="">Select task</option>
                                {tasks.map(t => <option key={t.id} value={t.id}>{t.name || t.title}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Linked Campaign</label>
                            <select
                                value={linkedCampaignId || ''}
                                onChange={e => setLinkedCampaignId(e.target.value ? Number(e.target.value) : null)}
                                className="w-full h-11 px-4 border border-gray-300 rounded-lg text-sm bg-white"
                            >
                                <option value="">Select campaign</option>
                                {campaigns.map(c => <option key={c.id} value={c.id}>{c.name || c.campaign_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Linked Project</label>
                            <select
                                value={linkedProjectId || ''}
                                onChange={e => setLinkedProjectId(e.target.value ? Number(e.target.value) : null)}
                                className="w-full h-11 px-4 border border-gray-300 rounded-lg text-sm bg-white"
                            >
                                <option value="">Select project</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name || p.project_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Linked Service</label>
                            <select
                                value={linkedServiceId || ''}
                                onChange={e => { setLinkedServiceId(e.target.value ? Number(e.target.value) : null); setLinkedSubServiceId(null); }}
                                className="w-full h-11 px-4 border border-gray-300 rounded-lg text-sm bg-white"
                            >
                                <option value="">Select service</option>
                                {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Linked Sub-Service</label>
                            <select
                                value={linkedSubServiceId || ''}
                                onChange={e => setLinkedSubServiceId(e.target.value ? Number(e.target.value) : null)}
                                className="w-full h-11 px-4 border border-gray-300 rounded-lg text-sm bg-white"
                                disabled={!linkedServiceId}
                            >
                                <option value="">Select sub-service</option>
                                {filteredSubServices.map(s => <option key={s.id} value={s.id}>{s.sub_service_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Linked Repository</label>
                            <select
                                value={linkedRepositoryItemId || ''}
                                onChange={e => setLinkedRepositoryItemId(e.target.value ? Number(e.target.value) : null)}
                                className="w-full h-11 px-4 border border-gray-300 rounded-lg text-sm bg-white"
                            >
                                <option value="">Select repository item</option>
                                {repositoryItems.map(r => <option key={r.id} value={r.id}>{r.title || r.content_title_clean}</option>)}
                            </select>
                        </div>
                    </div>
                </section>

                {/* Status */}
                <section className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                        Status
                    </h2>
                    <div className="max-w-md">
                        <select
                            value={formData.status || 'Draft'}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                            className="w-full h-11 px-4 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            <option value="Draft">Draft</option>
                            <option value="Pending QC Review">Pending QC Review</option>
                            <option value="QC Approved">QC Approved</option>
                            <option value="QC Rejected">QC Rejected</option>
                            <option value="Rework Required">Rework Required</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-2">Status updates automatically based on workflow</p>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default EditAssetForm;
