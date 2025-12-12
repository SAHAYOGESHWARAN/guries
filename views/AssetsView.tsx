import React, { useState, useRef, useMemo, useCallback } from 'react';
import Table from '../components/Table';
import MarkdownEditor from '../components/MarkdownEditor';
import CircularScore from '../components/CircularScore';
import UploadAssetModal from '../components/UploadAssetModal';
import { useData } from '../hooks/useData';
import { getStatusBadge } from '../constants';
import type { AssetLibraryItem, Service, SubServiceItem, User } from '../types';

interface AssetsViewProps {
    onNavigate?: (view: string, id?: number) => void;
}

const AssetsView: React.FC<AssetsViewProps> = ({ onNavigate }) => {
    const { data: assets = [], create: createAsset, update: updateAsset, remove: removeAsset, refresh } = useData<AssetLibraryItem>('assetLibrary');
    const { data: services = [] } = useData<Service>('services');
    const { data: subServices = [] } = useData<SubServiceItem>('subServices');
    const { data: users = [] } = useData<User>('users');

    const [searchQuery, setSearchQuery] = useState('');
    const [repositoryFilter, setRepositoryFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [contentTypeFilter, setContentTypeFilter] = useState('All');
    const [viewMode, setViewMode] = useState<'list' | 'upload' | 'edit' | 'qc' | 'mysubmissions' | 'detail'>('list');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [qcMode, setQcMode] = useState(false); // Toggle between user and QC mode
    const [displayMode, setDisplayMode] = useState<'table' | 'grid'>('table'); // List vs Large view toggle
    const [isRefreshing, setIsRefreshing] = useState(false); // Refresh state
    const [currentUser] = useState({ id: 1, role: 'user' }); // TODO: Get from auth context
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [editingAsset, setEditingAsset] = useState<AssetLibraryItem | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [newAsset, setNewAsset] = useState<Partial<AssetLibraryItem>>({
        // Asset Submission Fields (In Order)
        application_type: undefined, // 1. Asset Application – WEB, SEO, SMM
        // Service/Sub-Service Linking will be handled by selectedServiceId/selectedSubServiceIds
        keywords: [], // 3. Keywords – Link with keyword master table
        name: '', // 4. Title
        web_description: '', // 5. Description
        web_url: '', // 6. URL
        web_h1: '', // 7. H1
        web_h2_1: '', // 8. H2 (first)
        web_h2_2: '', // 8. H2 (second)
        type: 'article', // 9. Asset Type
        asset_category: '', // 10. Asset Category
        asset_format: '', // 11. Asset Format
        repository: 'Content Repository', // 12. Repository
        // Image Upload Option handled separately
        web_body_content: '', // 14. Body Content
        seo_score: undefined, // 15. SEO Score (AI integration)
        grammar_score: undefined, // 16. Grammar Score (AI integration)
        usage_status: 'Available', // 17. Usage Status
        status: 'Draft', // 18. Status

        // Internal fields
        linked_service_ids: [],
        linked_sub_service_ids: [],
        smm_platform: undefined,
        smm_additional_pages: []
    });

    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
    const [selectedSubServiceIds, setSelectedSubServiceIds] = useState<number[]>([]);

    // Markdown editor state
    const [markdownContent, setMarkdownContent] = useState('');
    const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
    const markdownTextareaRef = useRef<HTMLTextAreaElement>(null);

    // File upload refs
    const thumbnailInputRef = useRef<HTMLInputElement>(null);
    const mediaInputRef = useRef<HTMLInputElement>(null);

    // Preview modal state
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showDemoPreview, setShowDemoPreview] = useState(true);

    // QC Review state
    const [qcReviewAsset, setQcReviewAsset] = useState<AssetLibraryItem | null>(null);
    const [qcScore, setQcScore] = useState<number | undefined>(undefined);
    const [qcRemarks, setQcRemarks] = useState('');
    const [checklistCompleted, setChecklistCompleted] = useState(false);

    // Detailed view state
    const [selectedAsset, setSelectedAsset] = useState<AssetLibraryItem | null>(null);

    // Auto-refresh on mount to ensure latest data
    React.useEffect(() => {
        refresh?.();
    }, []);

    // Calculate markdown stats
    const markdownStats = useMemo(() => {
        const text = markdownContent || '';
        const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
        const characters = text.length;
        const lines = text.split('\n').length;
        const readTime = Math.ceil(words / 200); // Average reading speed: 200 words/min

        return { words, characters, lines, readTime };
    }, [markdownContent]);

    // Markdown formatting helpers
    const insertMarkdown = useCallback((before: string, after: string = '') => {
        const textarea = markdownTextareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = markdownContent.substring(start, end);
        const newText = markdownContent.substring(0, start) + before + selectedText + after + markdownContent.substring(end);

        setMarkdownContent(newText);
        setNewAsset({ ...newAsset, web_body_content: newText });

        // Restore focus and selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 0);
    }, [markdownContent, newAsset]);

    // File upload handler for thumbnails and media
    const handleFileUpload = useCallback(async (file: File, type: 'thumbnail' | 'media') => {
        // Convert to base64 for storage
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;

            if (type === 'thumbnail') {
                setNewAsset({
                    ...newAsset,
                    web_thumbnail: base64String,
                    thumbnail_url: base64String
                });
            } else {
                setNewAsset({
                    ...newAsset,
                    smm_media_url: base64String
                });
            }
        };
        reader.readAsDataURL(file);
    }, [newAsset]);

    // Get unique repositories and types
    const repositories = useMemo(() => {
        const repos = new Set<string>();
        assets.forEach(a => {
            if (a.repository) repos.add(a.repository);
        });
        return ['All', ...Array.from(repos).sort()];
    }, [assets]);

    const assetTypes = useMemo(() => {
        const types = new Set<string>();
        assets.forEach(a => {
            if (a.type) types.add(a.type);
        });
        return ['All', ...Array.from(types).sort()];
    }, [assets]);

    // Memoize filtered assets for better performance
    const filteredAssets = useMemo(() => {
        const query = (searchQuery || '').toLowerCase().trim();

        return assets.filter(a => {
            // QC Mode filter - only show assets pending QC review
            if (qcMode && a.status !== 'Pending QC Review') return false;

            // User Mode filter - show all except those in QC review (unless user is the creator)
            if (!qcMode && a.status === 'Pending QC Review' && a.submitted_by !== currentUser.id) return false;

            // Repository filter
            if (repositoryFilter !== 'All' && a.repository !== repositoryFilter) return false;

            // Type filter
            if (typeFilter !== 'All' && a.type !== typeFilter) return false;

            // Content Type filter
            if (contentTypeFilter !== 'All' && a.application_type !== contentTypeFilter) return false;

            // Search query
            if (!query) return true;

            const name = (a.name || '').toLowerCase();
            const type = (a.type || '').toLowerCase();
            const repository = (a.repository || '').toLowerCase();
            const status = (a.usage_status || '').toLowerCase();

            return name.includes(query) ||
                type.includes(query) ||
                repository.includes(query) ||
                status.includes(query);
        });
    }, [assets, searchQuery, repositoryFilter, typeFilter, contentTypeFilter, qcMode, currentUser.id]);

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

    const handleUpload = useCallback(async (submitForQC: boolean = false) => {
        if (!newAsset.name?.trim()) {
            alert('Please enter an asset name');
            return;
        }

        if (!newAsset.application_type) {
            alert('Please select an application type (WEB, SEO, or SMM)');
            return;
        }

        if (!selectedFile && !newAsset.file_url && viewMode !== 'edit') {
            alert('Please select a file to upload');
            return;
        }

        // If submitting for QC, validate required scores
        if (submitForQC) {
            if (!newAsset.seo_score || newAsset.seo_score < 0 || newAsset.seo_score > 100) {
                alert('SEO score (0-100) is required for submission');
                return;
            }
            if (!newAsset.grammar_score || newAsset.grammar_score < 0 || newAsset.grammar_score > 100) {
                alert('Grammar score (0-100) is required for submission');
                return;
            }
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
                status: submitForQC ? 'Pending QC Review' : (newAsset.status || 'Draft'),
                submitted_by: submitForQC ? currentUser.id : undefined,
                submitted_at: submitForQC ? new Date().toISOString() : undefined,
                linking_active: false // Linking only becomes active after QC approval
            };

            if (viewMode === 'edit' && editingAsset) {
                // Update existing asset
                await updateAsset(editingAsset.id, assetPayload);
            } else {
                // Create new asset
                await createAsset(assetPayload as AssetLibraryItem);
            }

            // Reset form
            setSelectedFile(null);
            setPreviewUrl('');
            setEditingAsset(null);
            setSelectedServiceId(null);
            setSelectedSubServiceIds([]);
            setNewAsset({
                name: '',
                type: 'Image',
                repository: 'Content Repository',
                usage_status: 'Available',
                status: 'Draft',
                linked_service_ids: [],
                linked_sub_service_ids: [],
                application_type: undefined,
                smm_platform: undefined,
                keywords: [],
                seo_score: undefined,
                grammar_score: undefined,
                smm_additional_pages: []
            });

            // Switch to list view immediately
            setViewMode('list');

            // Show success message
            if (submitForQC) {
                alert('Asset submitted for QC review successfully!');
            }

            // Force refresh to ensure data is up to date
            setTimeout(() => refresh?.(), 100);
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save asset. Please try again.');
        } finally {
            setIsUploading(false);
        }
    }, [newAsset, selectedFile, createAsset, updateAsset, editingAsset, viewMode, refresh, selectedServiceId, selectedSubServiceIds, services, subServices]);

    const handleEdit = useCallback((e: React.MouseEvent, asset: AssetLibraryItem) => {
        e.stopPropagation();
        setEditingAsset(asset);
        setNewAsset({
            name: asset.name,
            type: asset.type,
            repository: asset.repository,
            usage_status: asset.usage_status,
            status: asset.status,
            asset_category: asset.asset_category,
            asset_format: asset.asset_format,
            mapped_to: asset.mapped_to,
            qc_score: asset.qc_score,
            seo_score: asset.seo_score,
            grammar_score: asset.grammar_score,
            keywords: asset.keywords || [],
            file_url: asset.file_url,
            thumbnail_url: asset.thumbnail_url,
            file_size: asset.file_size,
            file_type: asset.file_type,
            linked_service_ids: asset.linked_service_ids || [],
            linked_sub_service_ids: asset.linked_sub_service_ids || [],
            application_type: asset.application_type,
            web_title: asset.web_title,
            web_description: asset.web_description,
            web_meta_description: asset.web_meta_description,
            web_keywords: asset.web_keywords,
            web_url: asset.web_url,
            web_h1: asset.web_h1,
            web_h2_1: asset.web_h2_1,
            web_h2_2: asset.web_h2_2,
            web_thumbnail: asset.web_thumbnail,
            web_body_content: asset.web_body_content,
            smm_platform: asset.smm_platform,
            smm_description: asset.smm_description,
            smm_hashtags: asset.smm_hashtags,
            smm_media_url: asset.smm_media_url,
            smm_media_type: asset.smm_media_type,
            smm_additional_pages: asset.smm_additional_pages || []
        });

        // Set selected service and sub-services for the UI
        if (asset.linked_service_ids && asset.linked_service_ids.length > 0) {
            setSelectedServiceId(asset.linked_service_ids[0]);
        }
        setSelectedSubServiceIds(asset.linked_sub_service_ids || []);
        if (asset.thumbnail_url || asset.file_url) {
            setPreviewUrl(asset.thumbnail_url || asset.file_url || '');
        }
        setViewMode('edit');
    }, []);

    const handleDelete = useCallback(async (e: React.MouseEvent, id: number, name: string) => {
        e.stopPropagation();

        if (deletingId !== null) return;

        if (!window.confirm(`Delete "${name}"?`)) return;

        setDeletingId(id);
        try {
            await removeAsset(id);
            // Force refresh after delete to ensure UI is updated
            setTimeout(() => refresh?.(), 100);
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete asset. Please try again.');
        } finally {
            setDeletingId(null);
        }
    }, [deletingId, removeAsset, refresh]);

    // QC Review Functions
    const handleQcReview = useCallback((asset: AssetLibraryItem) => {
        setQcReviewAsset(asset);
        setQcScore(asset.qc_score);
        setQcRemarks(asset.qc_remarks || '');
        setChecklistCompleted(false);
        setViewMode('qc');
    }, []);

    const handleQcSubmit = useCallback(async (approved: boolean) => {
        if (!qcReviewAsset) return;

        if (!qcScore || qcScore < 0 || qcScore > 100) {
            alert('Please enter a valid QC score (0-100)');
            return;
        }

        if (!checklistCompleted) {
            alert('Please complete the QC checklist before submitting');
            return;
        }

        try {
            const updatedAsset = {
                ...qcReviewAsset,
                status: approved ? 'QC Approved' : 'QC Rejected',
                qc_score: qcScore || 0,
                qc_remarks: qcRemarks,
                qc_reviewer_id: currentUser.id,
                qc_reviewed_at: new Date().toISOString(),
                linking_active: approved, // Only activate linking after approval
                rework_count: approved ? (qcReviewAsset?.rework_count || 0) : ((qcReviewAsset?.rework_count || 0) + 1)
            };

            await updateAsset(qcReviewAsset?.id || 0, updatedAsset);

            // Reset QC state
            setQcReviewAsset(null);
            setQcScore(undefined);
            setQcRemarks('');
            setChecklistCompleted(false);
            setViewMode('list');

            // Show success message
            alert(`Asset ${approved ? 'approved' : 'rejected'} successfully!`);

            // Force refresh
            setTimeout(() => refresh?.(), 100);
        } catch (error) {
            console.error('QC review failed:', error);
            alert('Failed to submit QC review. Please try again.');
        }
    }, [qcReviewAsset, qcScore, qcRemarks, checklistCompleted, currentUser.id, updateAsset, refresh]);

    // Handle row click to show detailed view
    const handleRowClick = useCallback((asset: AssetLibraryItem) => {
        setSelectedAsset(asset);
        setViewMode('detail');
    }, []);

    const getAssetIcon = useCallback((type: string) => {
        const icons: Record<string, string> = {
            'Image': '�️',
            'Video': '🎥',
            'Document': '📄',
            'Archive': '📦'
        };
        return icons[type] || '📁';
    }, []);

    // Memoize columns for better performance
    const columns = useMemo(() => [
        {
            header: 'Preview',
            accessor: (item: AssetLibraryItem) => (
                <div className="flex items-center justify-center">
                    {item.thumbnail_url ? (
                        <img
                            src={item.thumbnail_url}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg border-2 border-slate-200 shadow-sm"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-2xl shadow-sm">
                            {getAssetIcon(item.type)}
                        </div>
                    )}
                </div>
            ),
            className: 'w-24'
        },
        {
            header: 'Name',
            accessor: (item: AssetLibraryItem) => (
                <div>
                    <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">ID: {item.id}</div>
                </div>
            )
        },
        {
            header: 'Type',
            accessor: (item: AssetLibraryItem) => (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600">
                    <span>{getAssetIcon(item.type)}</span>
                    {item.type}
                </span>
            )
        },
        {
            header: 'Repository',
            accessor: (item: AssetLibraryItem) => (
                <span className="text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                    {item.repository}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: (item: AssetLibraryItem) => (
                <div className="space-y-2">
                    <div className="flex flex-col gap-1">
                        {getStatusBadge(item.status || 'Draft')}
                        {item.status === 'Pending QC Review' && (
                            <div className="text-xs text-purple-600 font-medium">
                                ⏳ Awaiting QC Review
                            </div>
                        )}
                        {item.status === 'QC Approved' && item.linking_active && (
                            <div className="text-xs text-green-600 font-medium">
                                ✅ Linked & Active
                            </div>
                        )}
                        {item.status === 'QC Rejected' && (
                            <div className="text-xs text-red-600 font-medium">
                                ❌ Rework Required
                            </div>
                        )}
                        {item.rework_count && item.rework_count > 0 && (
                            <div className="text-xs text-orange-600 font-medium">
                                🔄 Rework: {item.rework_count}
                            </div>
                        )}
                    </div>
                    <div className="text-xs text-slate-500">
                        Usage: {getStatusBadge(item.usage_status)}
                    </div>
                </div>
            )
        },
        {
            header: 'Scores',
            accessor: (item: AssetLibraryItem) => (
                <div className="flex gap-2">
                    {item.seo_score && (
                        <CircularScore
                            score={item.seo_score}
                            label="SEO"
                            size="sm"
                        />
                    )}
                    {item.grammar_score && (
                        <CircularScore
                            score={item.grammar_score}
                            label="Grammar"
                            size="sm"
                        />
                    )}
                    {item.qc_score && (
                        <CircularScore
                            score={item.qc_score}
                            label="QC"
                            size="sm"
                        />
                    )}
                    {!item.seo_score && !item.grammar_score && !item.qc_score && (
                        <span className="text-xs text-slate-400 italic">No scores</span>
                    )}
                </div>
            )
        },
        {
            header: 'Workflow',
            accessor: (item: AssetLibraryItem) => {
                const getWorkflowStage = () => {
                    switch (item.status) {
                        case 'Draft':
                            return { stage: 1, total: 4, label: 'Draft', color: 'bg-slate-400' };
                        case 'Pending QC Review':
                            return { stage: 2, total: 4, label: 'QC Review', color: 'bg-purple-500' };
                        case 'QC Approved':
                            return { stage: 3, total: 4, label: 'Approved', color: 'bg-green-500' };
                        case 'QC Rejected':
                            return { stage: 2, total: 4, label: 'Rework', color: 'bg-red-500' };
                        default:
                            return { stage: 1, total: 4, label: 'Draft', color: 'bg-slate-400' };
                    }
                };

                const workflow = getWorkflowStage();

                return (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                                {Array.from({ length: workflow.total }, (_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full ${i < workflow.stage ? workflow.color : 'bg-slate-200'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs font-medium text-slate-700">
                                {workflow.stage}/{workflow.total}
                            </span>
                        </div>
                        <div className="text-xs text-slate-600">{workflow.label}</div>
                        {item.linking_active && (
                            <div className="text-xs text-green-600 font-bold">🔗 Linked</div>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Linked To',
            accessor: (item: AssetLibraryItem) => {
                const linkedServiceIds = item.linked_service_ids || [];
                const linkedSubServiceIds = item.linked_sub_service_ids || [];
                const hasLinks = linkedServiceIds.length > 0 || linkedSubServiceIds.length > 0;

                if (!hasLinks) {
                    return <span className="text-xs text-slate-400 italic">Not linked</span>;
                }

                return (
                    <div className="max-w-xs">
                        <div className="text-xs text-slate-700 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-200">
                            <div className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                <div className="space-y-1">
                                    {linkedServiceIds.map(serviceId => {
                                        const service = services.find(s => s.id === serviceId);
                                        return service ? (
                                            <div key={serviceId} className="font-medium text-indigo-900">
                                                {service.service_name}
                                            </div>
                                        ) : null;
                                    })}
                                    {linkedSubServiceIds.length > 0 && (
                                        <div className="text-indigo-700 text-[11px]">
                                            {linkedSubServiceIds.map(ssId => {
                                                const subService = subServices.find(ss => ss.id === ssId);
                                                return subService?.sub_service_name;
                                            }).filter(Boolean).join(', ')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Date',
            accessor: (item: AssetLibraryItem) => (
                <span className="text-xs text-slate-600">
                    {item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: (item: AssetLibraryItem) => (
                <div className="flex gap-2">
                    {(item.file_url || item.thumbnail_url) && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const url = item.file_url || item.thumbnail_url;
                                if (url) {
                                    // Check if it's a base64 data URL
                                    if (url.startsWith('data:')) {
                                        // Open in new window for base64 images
                                        const win = window.open();
                                        if (win) {
                                            win.document.write(`<img src="${url}" style="max-width:100%; height:auto;" />`);
                                        }
                                    } else {
                                        // Open regular URL in new tab
                                        window.open(url, '_blank', 'noopener,noreferrer');
                                    }
                                }
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="View Asset"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                    )}

                    {/* QC Review Button - Only for QC personnel and Pending QC Review status */}
                    {item.status === 'Pending QC Review' && currentUser.role === 'qc' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleQcReview(item);
                            }}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                            title="QC Review"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                    )}

                    {/* Edit Button - Only for creators or if status allows editing */}
                    {(item.status === 'Draft' || item.status === 'Rework Required' || item.submitted_by === currentUser.id) && (
                        <button
                            onClick={(e) => handleEdit(e, item)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Edit"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                    )}

                    {/* Delete Button - Only for creators or admins */}
                    {(item.submitted_by === currentUser.id || currentUser.role === 'admin') && (
                        <button
                            onClick={(e) => handleDelete(e, item.id, item.name)}
                            disabled={deletingId === item.id}
                            className={`p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all ${deletingId === item.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Delete"
                        >
                            {deletingId === item.id ? (
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            )}
                        </button>
                    )}
                </div>
            )
        }
    ], [getAssetIcon, handleEdit, handleDelete, deletingId]);

    // My Submissions logic
    const mySubmissions = useMemo(() => {
        return assets.filter(asset => asset.submitted_by === currentUser.id);
    }, [assets, currentUser.id]);

    const mySubmissionsColumns = useMemo(() => [
        {
            header: 'Title',
            accessor: (item: AssetLibraryItem) => (
                <div>
                    <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">ID: {item.id}</div>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: (item: AssetLibraryItem) => (
                <div className="space-y-2">
                    <div className="flex flex-col gap-1">
                        {getStatusBadge(item.status || 'Draft')}
                        {item.status === 'Pending QC Review' && (
                            <div className="text-xs text-purple-600 font-medium">
                                ⏳ Awaiting QC Review
                            </div>
                        )}
                        {item.status === 'QC Approved' && (
                            <div className="text-xs text-green-600 font-medium">
                                ✅ Approved
                            </div>
                        )}
                        {item.status === 'QC Rejected' && (
                            <div className="text-xs text-red-600 font-medium">
                                ❌ Needs Rework
                            </div>
                        )}
                    </div>
                </div>
            )
        },
        {
            header: 'Submitted',
            accessor: (item: AssetLibraryItem) => (
                <span className="text-xs text-slate-600">
                    {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : '-'}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: (item: AssetLibraryItem) => (
                <div className="flex gap-2">
                    <button
                        onClick={(e) => handleEdit(e, item)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Edit"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                </div>
            )
        }
    ], [handleEdit]);

    // SMM Preview Modal logic
    const smmPreviewData = useMemo(() => ({
        name: newAsset.name || 'Your Page',
        description: newAsset.smm_description || '',
        hashtags: newAsset.smm_hashtags || '',
        media: newAsset.smm_media_url || ''
    }), [newAsset.name, newAsset.smm_description, newAsset.smm_hashtags, newAsset.smm_media_url]);

    return (
        <>
            {(viewMode === 'upload' || viewMode === 'edit') && (
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
                    {/* Fixed Header */}
                    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
                        <div className="max-w-7xl mx-auto px-6 py-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setViewMode('list')}
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
                                            {viewMode === 'edit' ? 'Edit Asset' : 'Upload New Asset'}
                                        </h1>
                                        <p className="text-slate-600 text-sm mt-1">
                                            {viewMode === 'edit' ? 'Update asset information and settings' : 'Add new media content to the central asset library'}
                                        </p>
                                    </div>
                                </div>

                                {/* Enhanced Action Buttons */}
                                <div className="flex items-center gap-3">
                                    {/* Cancel Button */}
                                    <button
                                        onClick={() => setViewMode('list')}
                                        disabled={isUploading}
                                        className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Cancel
                                    </button>

                                    {/* Update Asset Button (for edit mode) */}
                                    {viewMode === 'edit' && (
                                        <button
                                            onClick={() => handleUpload(false)}
                                            disabled={isUploading}
                                            className={`bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all text-sm flex items-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isUploading ? (
                                                <>
                                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    Update Asset
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {/* Save as Draft Button */}
                                    <button
                                        onClick={() => handleUpload(false)}
                                        disabled={isUploading}
                                        className={`bg-slate-600 text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-slate-700 transition-colors text-sm flex items-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isUploading ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                {viewMode === 'edit' ? 'Save Changes' : 'Save as Draft'}
                                            </>
                                        )}
                                    </button>

                                    {/* Submit for QC Review Button */}
                                    <button
                                        onClick={() => handleUpload(true)}
                                        disabled={isUploading || !newAsset.seo_score || !newAsset.grammar_score}
                                        className={`bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all text-sm flex items-center gap-2 ${isUploading || !newAsset.seo_score || !newAsset.grammar_score ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isUploading ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {viewMode === 'edit' ? 'Update & Submit for QC' : 'Submit for QC Review'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Left Column - File Upload & Preview */}
                            <div className="lg:col-span-1 space-y-6">
                                {/* File Upload Area */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        File Upload
                                    </h3>

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
                                                    <p className="text-base font-semibold text-slate-700 mb-2">Drop files here or click to browse</p>
                                                    <p className="text-sm text-slate-500">Support for PNG, JPG, PDF, MP4 files up to 50MB</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        Progress
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-600">Basic Info</span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${newAsset.name && newAsset.application_type ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {newAsset.name && newAsset.application_type ? 'Complete' : 'Pending'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-600">AI Scores</span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${newAsset.seo_score && newAsset.grammar_score ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {newAsset.seo_score && newAsset.grammar_score ? 'Complete' : 'Pending'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-600">Ready for QC</span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${newAsset.name && newAsset.application_type && newAsset.seo_score && newAsset.grammar_score ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {newAsset.name && newAsset.application_type && newAsset.seo_score && newAsset.grammar_score ? 'Ready' : 'Not Ready'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Form Fields */}
                            <div className="lg:col-span-2 space-y-8">
                                <div
                                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${dragActive
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/50'
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
                                            <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-lg" />
                                            <p className="text-sm font-medium text-slate-700">{selectedFile?.name}</p>
                                            <p className="text-xs text-slate-500">
                                                {selectedFile && `${(selectedFile.size / 1024).toFixed(2)} KB`}
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedFile(null);
                                                    setPreviewUrl('');
                                                }}
                                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                                            >
                                                Remove File
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                                                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-base font-semibold text-slate-700 mb-1">Click to upload or drag and drop</p>
                                                <p className="text-sm text-slate-500">PNG, JPG, PDF, MP4 up to 50MB</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Basic Information Section */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-slate-200">
                                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Basic Information
                                        </h3>
                                        <p className="text-sm text-slate-600 mt-1">Essential asset details and classification</p>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        {/* 1. Asset Application & Title */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                                    Asset Application
                                                    <span className="text-red-500 ml-1">*</span>
                                                </label>
                                                <select
                                                    value={newAsset.application_type || ''}
                                                    onChange={(e) => setNewAsset({
                                                        ...newAsset,
                                                        application_type: e.target.value as any,
                                                        smm_platform: undefined
                                                    })}
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white cursor-pointer font-medium"
                                                >
                                                    <option value="">Select application type...</option>
                                                    <option value="web">🌐 WEB</option>
                                                    <option value="seo">🔍 SEO</option>
                                                    <option value="smm">📱 SMM</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                                    Asset Title
                                                    <span className="text-red-500 ml-1">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newAsset.name}
                                                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                                    placeholder="Enter a descriptive title for your asset..."
                                                />
                                            </div>
                                        </div>

                                        {/* Service Linking */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                                Service Linking
                                            </label>
                                            <select
                                                value={selectedServiceId || ''}
                                                onChange={(e) => {
                                                    const serviceId = e.target.value ? parseInt(e.target.value) : null;
                                                    setSelectedServiceId(serviceId);
                                                    setSelectedSubServiceIds([]);
                                                }}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white cursor-pointer"
                                            >
                                                <option value="">Select a service...</option>
                                                {services.map(service => (
                                                    <option key={service.id} value={service.id}>
                                                        {service.service_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {selectedServiceId && (
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                                    Sub-Service Linking
                                                </label>
                                                <div className="border border-slate-300 rounded-lg p-4 max-h-48 overflow-y-auto bg-slate-50">
                                                    {subServices
                                                        .filter(ss => ss.parent_service_id === selectedServiceId)
                                                        .map(subService => (
                                                            <label key={subService.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
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

                                        {/* Keywords & Asset Type */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                                    Keywords
                                                </label>
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

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                                    Asset Type
                                                    <span className="text-red-500 ml-1">*</span>
                                                </label>
                                                <select
                                                    value={newAsset.type}
                                                    onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white cursor-pointer"
                                                >
                                                    <option value="article">📄 Article</option>
                                                    <option value="video">🎥 Video</option>
                                                    <option value="graphic">🎨 Graphic</option>
                                                    <option value="guide">📚 Guide</option>
                                                    <option value="listicle">📝 Listicle</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content Details Section */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
                                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Content Details
                                        </h3>
                                        <p className="text-sm text-slate-600 mt-1">Descriptions, URLs, and content structure</p>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        {/* Description */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-3">Description</label>
                                            <textarea
                                                value={newAsset.web_description || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, web_description: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                placeholder="Enter a detailed description of your asset..."
                                                rows={4}
                                            />
                                        </div>

                                        {/* Meta Description & URL */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                                    Meta Description
                                                    <span className="text-xs font-normal text-slate-500 ml-2">(SEO, 150-160 chars)</span>
                                                </label>
                                                <textarea
                                                    value={newAsset.web_meta_description || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, web_meta_description: e.target.value })}
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                    placeholder="Enter SEO meta description..."
                                                    rows={3}
                                                    maxLength={160}
                                                />
                                                <div className="text-xs text-slate-500 mt-1 text-right">
                                                    {(newAsset.web_meta_description || '').length}/160 characters
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-3">URL</label>
                                                <input
                                                    type="url"
                                                    value={newAsset.web_url || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, web_url: e.target.value })}
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                    placeholder="https://example.com/page"
                                                />
                                            </div>
                                        </div>

                                        {/* H1 Heading */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-3">H1 Heading</label>
                                            <input
                                                type="text"
                                                value={newAsset.web_h1 || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, web_h1: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                placeholder="Enter the main heading (H1) for your content..."
                                            />
                                        </div>

                                        {/* H2 Headings */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-3">H2 Heading (First)</label>
                                                <input
                                                    type="text"
                                                    value={newAsset.web_h2_1 || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, web_h2_1: e.target.value })}
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                    placeholder="First H2 subheading..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-3">H2 Heading (Second)</label>
                                                <input
                                                    type="text"
                                                    value={newAsset.web_h2_2 || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, web_h2_2: e.target.value })}
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                    placeholder="Second H2 subheading..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Asset Classification Section */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-slate-200">
                                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                            Asset Classification
                                        </h3>
                                        <p className="text-sm text-slate-600 mt-1">Category, format, and repository settings</p>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        {/* Asset Category & Format */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                                    Asset Category
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newAsset.asset_category || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, asset_category: e.target.value })}
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                                    placeholder="e.g., what science can do"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                                    Asset Format
                                                </label>
                                                <select
                                                    value={newAsset.asset_format || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, asset_format: e.target.value })}
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white cursor-pointer"
                                                >
                                                    <option value="">Select format...</option>
                                                    <option value="image">📷 Image</option>
                                                    <option value="video">🎥 Video</option>
                                                    <option value="pdf">📄 PDF</option>
                                                    <option value="doc">📝 Document</option>
                                                    <option value="ppt">📊 Presentation</option>
                                                    <option value="infographic">📈 Infographic</option>
                                                    <option value="ebook">📚 eBook</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Repository & Usage Status */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-3">Repository</label>
                                                <select
                                                    value={newAsset.repository}
                                                    onChange={(e) => setNewAsset({ ...newAsset, repository: e.target.value })}
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white cursor-pointer"
                                                >
                                                    <option value="Content Repository">📁 Content Repository</option>
                                                    <option value="SMM Repository">📱 SMM Repository</option>
                                                    <option value="SEO Repository">🔍 SEO Repository</option>
                                                    <option value="Design Repository">🎨 Design Repository</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-3">Usage Status</label>
                                                <select
                                                    value={newAsset.usage_status}
                                                    onChange={(e) => setNewAsset({ ...newAsset, usage_status: e.target.value as any })}
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white cursor-pointer"
                                                >
                                                    <option value="Available">✅ Available</option>
                                                    <option value="In Use">🔄 In Use</option>
                                                    <option value="Archived">📦 Archived</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Quality Scores Section */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-slate-200">
                                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                            AI Quality Scores
                                        </h3>
                                        <p className="text-sm text-slate-600 mt-1">Required for QC submission - AI-powered content analysis</p>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        {/* Score Display */}
                                        {(newAsset.seo_score || newAsset.grammar_score) && (
                                            <div className="flex justify-center gap-8 py-4">
                                                {newAsset.seo_score && (
                                                    <CircularScore
                                                        score={newAsset.seo_score}
                                                        label="SEO Score"
                                                        size="md"
                                                        showEmbedButton={true}
                                                    />
                                                )}
                                                {newAsset.grammar_score && (
                                                    <CircularScore
                                                        score={newAsset.grammar_score}
                                                        label="Grammar Score"
                                                        size="md"
                                                        showEmbedButton={true}
                                                    />
                                                )}
                                            </div>
                                        )}

                                        {/* Score Input Fields */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                                    SEO Score (0-100)
                                                    <span className="text-red-500 ml-1">*</span>
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={newAsset.seo_score || ''}
                                                        onChange={(e) => setNewAsset({ ...newAsset, seo_score: parseInt(e.target.value) || undefined })}
                                                        className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                                        placeholder="0-100"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            try {
                                                                const response = await fetch('/api/v1/assetLibrary/ai-scores', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({
                                                                        content: newAsset.web_body_content || newAsset.smm_description,
                                                                        keywords: newAsset.web_keywords || newAsset.keywords,
                                                                        title: newAsset.web_title || newAsset.name,
                                                                        description: newAsset.web_description || newAsset.smm_description
                                                                    })
                                                                });
                                                                if (response.ok) {
                                                                    const scores = await response.json();
                                                                    setNewAsset({
                                                                        ...newAsset,
                                                                        seo_score: scores.seo_score,
                                                                        grammar_score: scores.grammar_score
                                                                    });
                                                                }
                                                            } catch (error) {
                                                                console.error('Failed to generate AI scores:', error);
                                                            }
                                                        }}
                                                        className="px-4 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                        </svg>
                                                        Generate
                                                    </button>
                                                </div>
                                                {newAsset.seo_score && (
                                                    <div className={`mt-2 text-xs font-medium ${newAsset.seo_score >= 80 ? 'text-green-600' : newAsset.seo_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                        {newAsset.seo_score >= 80 ? '✓ Excellent SEO' : newAsset.seo_score >= 60 ? '⚠ Good SEO' : '✗ Needs SEO improvement'}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                                    Grammar Score (0-100)
                                                    <span className="text-red-500 ml-1">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={newAsset.grammar_score || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, grammar_score: parseInt(e.target.value) || undefined })}
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                                    placeholder="0-100"
                                                />
                                                {newAsset.grammar_score && (
                                                    <div className={`mt-2 text-xs font-medium ${newAsset.grammar_score >= 90 ? 'text-green-600' : newAsset.grammar_score >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                        {newAsset.grammar_score >= 90 ? '✓ Excellent grammar' : newAsset.grammar_score >= 70 ? '⚠ Good grammar' : '✗ Needs grammar improvement'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Info Note */}
                                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                            <p className="text-sm text-green-800">
                                                <strong>Note:</strong> SEO and Grammar scores are mandatory before submitting for QC review.
                                                Use the "Generate" button to get AI-powered scores based on your content.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* 13. Image Upload Option */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        13. Image Upload Option
                                        <span className="text-xs font-normal text-slate-500 ml-2">(Preview option based on SMM)</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={newAsset.web_thumbnail || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, web_thumbnail: e.target.value })}
                                            className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                            placeholder="https://example.com/image.jpg or upload file"
                                        />
                                        <input
                                            ref={thumbnailInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'thumbnail')}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => thumbnailInputRef.current?.click()}
                                            className="px-4 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Upload
                                        </button>
                                    </div>
                                    {newAsset.web_thumbnail && newAsset.web_thumbnail.startsWith('data:') && (
                                        <div className="mt-2">
                                            <img src={newAsset.web_thumbnail} alt="Thumbnail preview" className="max-h-32 rounded-lg border-2 border-slate-200" />
                                        </div>
                                    )}
                                </div>

                                {/* 14. Body Content */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">14. Body Content</label>
                                    <MarkdownEditor
                                        value={newAsset.web_body_content || ''}
                                        onChange={(value) => setNewAsset({ ...newAsset, web_body_content: value })}
                                    />
                                </div>

                                {/* 17. Usage Status */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">17. Usage Status</label>
                                    <select
                                        value={newAsset.usage_status}
                                        onChange={(e) => setNewAsset({ ...newAsset, usage_status: e.target.value as any })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white cursor-pointer"
                                    >
                                        <option value="Available">Available</option>
                                        <option value="In Use">In Use</option>
                                        <option value="Archived">Archived</option>
                                    </select>
                                </div>

                                {/* 18. Status */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">18. Status</label>
                                    <select
                                        value={newAsset.status || 'Draft'}
                                        onChange={(e) => setNewAsset({ ...newAsset, status: e.target.value as any })}
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white cursor-pointer"
                                        disabled
                                    >
                                        <option value="Draft">Draft</option>
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1">Status will be updated automatically based on workflow</p>
                                </div>
                            </div>

                            {/* Asset Applications Section */}
                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 p-6 space-y-6 shadow-sm">
                                <div className="flex items-center gap-3 pb-3 border-b-2 border-purple-200">
                                    <div className="bg-purple-600 p-2 rounded-lg">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-purple-900">Asset Applications</h3>
                                        <p className="text-xs text-purple-600">Configure how this asset will be used</p>
                                    </div>
                                </div>

                                {/* Application Type Selector */}
                                <div>
                                    <label className="block text-sm font-bold text-purple-900 mb-2">Application Type</label>
                                    <select
                                        value={newAsset.application_type || ''}
                                        onChange={(e) => setNewAsset({
                                            ...newAsset,
                                            application_type: e.target.value as any,
                                            smm_platform: undefined // Reset SMM platform when changing application type
                                        })}
                                        className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white cursor-pointer font-medium"
                                    >
                                        <option value="">Select application type...</option>
                                        <option value="web">Web</option>
                                        <option value="seo">SEO</option>
                                        <option value="smm">SMM (Social Media Marketing)</option>
                                    </select>
                                </div>

                                {/* Web Application Fields */}
                                {newAsset.application_type === 'web' && (
                                    <div className="space-y-4 bg-white rounded-lg p-5 border-2 border-purple-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                            </svg>
                                            <h4 className="font-bold text-purple-900">Web Application Fields</h4>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                                            <input
                                                type="text"
                                                value={newAsset.web_title || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, web_title: e.target.value })}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                placeholder="Enter web title..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                            <textarea
                                                value={newAsset.web_description || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, web_description: e.target.value })}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                placeholder="Enter web description..."
                                                rows={3}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Keywords</label>
                                            <input
                                                type="text"
                                                value={newAsset.web_keywords || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, web_keywords: e.target.value })}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                placeholder="Enter keywords (comma separated)..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">URL</label>
                                            <input
                                                type="url"
                                                value={newAsset.web_url || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, web_url: e.target.value })}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                placeholder="https://example.com/page"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">H1</label>
                                            <input
                                                type="text"
                                                value={newAsset.web_h1 || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, web_h1: e.target.value })}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                placeholder="Main heading (H1)..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">H2 (First)</label>
                                                <input
                                                    type="text"
                                                    value={newAsset.web_h2_1 || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, web_h2_1: e.target.value })}
                                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                    placeholder="First H2 heading..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">H2 (Second)</label>
                                                <input
                                                    type="text"
                                                    value={newAsset.web_h2_2 || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, web_h2_2: e.target.value })}
                                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                    placeholder="Second H2 heading..."
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Thumbnail/Blog Image</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="url"
                                                    value={newAsset.web_thumbnail || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, web_thumbnail: e.target.value })}
                                                    className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                    placeholder="https://example.com/image.jpg or upload file"
                                                />
                                                <input
                                                    ref={thumbnailInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'thumbnail')}
                                                    className="hidden"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => thumbnailInputRef.current?.click()}
                                                    className="px-4 py-3 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    Upload
                                                </button>
                                            </div>
                                            {newAsset.web_thumbnail && newAsset.web_thumbnail.startsWith('data:') && (
                                                <div className="mt-2">
                                                    <img src={newAsset.web_thumbnail} alt="Thumbnail preview" className="max-h-32 rounded-lg border-2 border-slate-200" />
                                                </div>
                                            )}
                                        </div>

                                        <MarkdownEditor
                                            value={newAsset.web_body_content || ''}
                                            onChange={(value) => setNewAsset({ ...newAsset, web_body_content: value })}
                                        />
                                    </div>
                                )}

                                {/* SEO Application Fields (same as Web) */}
                                {newAsset.application_type === 'seo' && (
                                    <div className="space-y-4 bg-white rounded-lg p-5 border-2 border-purple-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            <h4 className="font-bold text-purple-900">SEO Application Fields</h4>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                                            <input
                                                type="text"
                                                value={newAsset.web_title || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, web_title: e.target.value })}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                placeholder="Enter SEO title..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                            <textarea
                                                value={newAsset.web_description || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, web_description: e.target.value })}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                placeholder="Enter SEO description..."
                                                rows={3}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Keywords</label>
                                            <input
                                                type="text"
                                                value={newAsset.web_keywords || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, web_keywords: e.target.value })}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                placeholder="Enter keywords (comma separated)..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">URL</label>
                                            <input
                                                type="url"
                                                value={newAsset.web_url || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, web_url: e.target.value })}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                placeholder="https://example.com/page"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">H1</label>
                                            <input
                                                type="text"
                                                value={newAsset.web_h1 || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, web_h1: e.target.value })}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                placeholder="Main heading (H1)..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">H2 (First)</label>
                                                <input
                                                    type="text"
                                                    value={newAsset.web_h2_1 || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, web_h2_1: e.target.value })}
                                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                    placeholder="First H2 heading..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">H2 (Second)</label>
                                                <input
                                                    type="text"
                                                    value={newAsset.web_h2_2 || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, web_h2_2: e.target.value })}
                                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                    placeholder="Second H2 heading..."
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Thumbnail/Blog Image</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="url"
                                                    value={newAsset.web_thumbnail || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, web_thumbnail: e.target.value })}
                                                    className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                    placeholder="https://example.com/image.jpg or upload file"
                                                />
                                                <input
                                                    ref={thumbnailInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'thumbnail')}
                                                    className="hidden"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => thumbnailInputRef.current?.click()}
                                                    className="px-4 py-3 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    Upload
                                                </button>
                                            </div>
                                            {newAsset.web_thumbnail && newAsset.web_thumbnail.startsWith('data:') && (
                                                <div className="mt-2">
                                                    <img src={newAsset.web_thumbnail} alt="Thumbnail preview" className="max-h-32 rounded-lg border-2 border-slate-200" />
                                                </div>
                                            )}
                                        </div>

                                        <MarkdownEditor
                                            value={newAsset.web_body_content || ''}
                                            onChange={(value) => setNewAsset({ ...newAsset, web_body_content: value })}
                                        />
                                    </div>
                                )}

                                {/* SMM Application Fields */}
                                {newAsset.application_type === 'smm' && (
                                    <div className="space-y-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 shadow-sm">
                                        <div className="flex items-center gap-3 pb-4 border-b-2 border-purple-200">
                                            <div className="bg-purple-600 p-2 rounded-lg">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                                </svg>
                                            </div>
                                            <div>

                                                <h4 className="text-lg font-bold text-purple-900">📱 SMM Application Fields</h4>
                                                <p className="text-sm text-purple-600">Configure your social media content</p>
                                            </div>
                                        </div>

                                        {/* Platform Selector - Enhanced */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-3">
                                                🌐 Social Media Platform
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                                                {[
                                                    { value: 'facebook', label: 'Facebook', icon: '📘', color: 'from-blue-600 to-blue-700', description: 'Share with friends and family' },
                                                    { value: 'instagram', label: 'Instagram', icon: '📷', color: 'from-pink-500 to-purple-600', description: 'Visual storytelling platform' },
                                                    { value: 'twitter', label: 'Twitter/X', icon: '🐦', color: 'from-sky-400 to-blue-500', description: 'Real-time conversations' },
                                                    { value: 'linkedin', label: 'LinkedIn', icon: '💼', color: 'from-blue-700 to-blue-800', description: 'Professional networking' },
                                                    { value: 'youtube', label: 'YouTube', icon: '🎥', color: 'from-red-600 to-red-700', description: 'Video content platform' },
                                                    { value: 'tiktok', label: 'TikTok', icon: '🎵', color: 'from-black to-gray-800', description: 'Short-form video content' },
                                                    { value: 'pinterest', label: 'Pinterest', icon: '📌', color: 'from-red-500 to-pink-500', description: 'Visual discovery engine' },
                                                    { value: 'snapchat', label: 'Snapchat', icon: '👻', color: 'from-yellow-400 to-yellow-500', description: 'Ephemeral content sharing' },
                                                    { value: 'whatsapp', label: 'WhatsApp', icon: '💬', color: 'from-green-500 to-green-600', description: 'Messaging and status updates' }
                                                ].map((platform) => (
                                                    <button
                                                        key={platform.value}
                                                        type="button"
                                                        onClick={() => setNewAsset({ ...newAsset, smm_platform: platform.value as any })}
                                                        className={`p-4 rounded-xl border-2 transition-all text-left hover:scale-105 ${newAsset.smm_platform === platform.value
                                                            ? `bg-gradient-to-r ${platform.color} text-white border-transparent shadow-lg`
                                                            : 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-md'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="text-2xl">{platform.icon}</span>
                                                            <span className={`font-bold text-sm ${newAsset.smm_platform === platform.value ? 'text-white' : 'text-slate-800'
                                                                }`}>
                                                                {platform.label}
                                                            </span>
                                                        </div>
                                                        <p className={`text-xs ${newAsset.smm_platform === platform.value ? 'text-white/90' : 'text-slate-500'
                                                            }`}>
                                                            {platform.description}
                                                        </p>
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Fallback dropdown for additional platforms */}
                                            <div className="mt-4">
                                                <label className="block text-xs font-medium text-slate-600 mb-2">Or select from dropdown:</label>
                                                <select
                                                    value={newAsset.smm_platform || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, smm_platform: e.target.value as any })}
                                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white cursor-pointer font-medium"
                                                >
                                                    <option value="">Select platform...</option>
                                                    <option value="facebook">📘 Facebook</option>
                                                    <option value="instagram">📷 Instagram</option>
                                                    <option value="twitter">🐦 Twitter/X</option>
                                                    <option value="linkedin">💼 LinkedIn</option>
                                                    <option value="youtube">🎥 YouTube</option>
                                                    <option value="tiktok">🎵 TikTok</option>
                                                    <option value="pinterest">📌 Pinterest</option>
                                                    <option value="snapchat">👻 Snapchat</option>
                                                    <option value="whatsapp">💬 WhatsApp</option>
                                                    <option value="telegram">✈️ Telegram</option>
                                                    <option value="discord">🎮 Discord</option>
                                                    <option value="reddit">🤖 Reddit</option>
                                                    <option value="tumblr">📝 Tumblr</option>
                                                    <option value="other">🌐 Other Platform</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Platform-specific fields */}
                                        {newAsset.smm_platform && (
                                            <div className="space-y-6 bg-white rounded-xl p-6 border-2 border-slate-200 shadow-sm">
                                                <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg">
                                                        {newAsset.smm_platform === 'facebook' && '📘'}
                                                        {newAsset.smm_platform === 'instagram' && '📷'}
                                                        {newAsset.smm_platform === 'twitter' && '�'}
                                                        {newAsset.smm_platform === 'linkedin' && '💼'}
                                                        {newAsset.smm_platform === 'youtube' && '🎥'}
                                                        {newAsset.smm_platform === 'tiktok' && '🎵'}
                                                        {newAsset.smm_platform === 'pinterest' && '📌'}
                                                        {newAsset.smm_platform === 'snapchat' && '👻'}
                                                        {newAsset.smm_platform === 'whatsapp' && '💬'}
                                                        {!['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'pinterest', 'snapchat', 'whatsapp'].includes(newAsset.smm_platform) && '🌐'}
                                                    </div>
                                                    <div>
                                                        <h5 className="text-lg font-bold text-slate-800 capitalize">
                                                            {newAsset.smm_platform === 'twitter' ? 'Twitter/X' : newAsset.smm_platform} Content
                                                        </h5>
                                                        <p className="text-sm text-slate-600">
                                                            {newAsset.smm_platform === 'facebook' && 'Engage with your Facebook community'}
                                                            {newAsset.smm_platform === 'instagram' && 'Share visual stories on Instagram'}
                                                            {newAsset.smm_platform === 'twitter' && 'Join real-time conversations'}
                                                            {newAsset.smm_platform === 'linkedin' && 'Connect with professionals'}
                                                            {newAsset.smm_platform === 'youtube' && 'Create engaging video content'}
                                                            {newAsset.smm_platform === 'tiktok' && 'Create viral short-form videos'}
                                                            {newAsset.smm_platform === 'pinterest' && 'Inspire with visual content'}
                                                            {newAsset.smm_platform === 'snapchat' && 'Share moments that disappear'}
                                                            {newAsset.smm_platform === 'whatsapp' && 'Connect through messaging'}
                                                            {!['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'pinterest', 'snapchat', 'whatsapp'].includes(newAsset.smm_platform) && 'Create engaging social content'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Content Fields */}
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                                            📝 Post Caption/Description
                                                            <span className="text-red-500 ml-1">*</span>
                                                        </label>
                                                        <textarea
                                                            value={newAsset.smm_description || ''}
                                                            onChange={(e) => setNewAsset({ ...newAsset, smm_description: e.target.value })}
                                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                            placeholder={
                                                                newAsset.smm_platform === 'twitter' ? 'What\'s happening? (280 characters)' :
                                                                    newAsset.smm_platform === 'linkedin' ? 'Share your professional insights...' :
                                                                        newAsset.smm_platform === 'instagram' ? 'Share your story with a captivating caption...' :
                                                                            newAsset.smm_platform === 'facebook' ? 'What\'s on your mind?' :
                                                                                newAsset.smm_platform === 'youtube' ? 'Describe your video content...' :
                                                                                    newAsset.smm_platform === 'tiktok' ? 'Add a catchy description for your video...' :
                                                                                        'Enter your post content...'
                                                            }
                                                            rows={5}
                                                            maxLength={
                                                                newAsset.smm_platform === 'twitter' ? 280 :
                                                                    newAsset.smm_platform === 'instagram' ? 2200 :
                                                                        newAsset.smm_platform === 'linkedin' ? 3000 :
                                                                            undefined
                                                            }
                                                        />
                                                        {newAsset.smm_platform === 'twitter' && (
                                                            <div className="text-xs text-slate-500 mt-1 text-right">
                                                                {(newAsset.smm_description || '').length}/280 characters
                                                            </div>
                                                        )}
                                                        {newAsset.smm_platform === 'instagram' && (
                                                            <div className="text-xs text-slate-500 mt-1 text-right">
                                                                {(newAsset.smm_description || '').length}/2,200 characters
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                                            🏷️ Hashtags & Tags
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={newAsset.smm_hashtags || ''}
                                                            onChange={(e) => setNewAsset({ ...newAsset, smm_hashtags: e.target.value })}
                                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                            placeholder={
                                                                newAsset.smm_platform === 'twitter' ? '#hashtag1 #hashtag2 (max 2-3)' :
                                                                    newAsset.smm_platform === 'instagram' ? '#hashtag1 #hashtag2 #hashtag3 (max 30)' :
                                                                        newAsset.smm_platform === 'linkedin' ? '#hashtag1 #hashtag2 #hashtag3 (max 5)' :
                                                                            newAsset.smm_platform === 'tiktok' ? '#hashtag1 #hashtag2 #hashtag3 (trending tags)' :
                                                                                '#hashtag1 #hashtag2 #hashtag3'
                                                            }
                                                        />
                                                        <div className="mt-2 text-xs text-slate-500">
                                                            {newAsset.smm_platform === 'twitter' && '💡 Use 1-2 relevant hashtags for better engagement'}
                                                            {newAsset.smm_platform === 'instagram' && '💡 Use 5-10 hashtags for optimal reach'}
                                                            {newAsset.smm_platform === 'linkedin' && '💡 Use 3-5 professional hashtags'}
                                                            {newAsset.smm_platform === 'tiktok' && '💡 Mix trending and niche hashtags'}
                                                            {newAsset.smm_platform === 'youtube' && '💡 Use hashtags in description for discoverability'}
                                                            {!['twitter', 'instagram', 'linkedin', 'tiktok', 'youtube'].includes(newAsset.smm_platform) && '💡 Use relevant hashtags for your platform'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-3">
                                                        🎬 Content Type
                                                        <span className="text-red-500 ml-1">*</span>
                                                    </label>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                        {(() => {
                                                            const getMediaTypes = (platform: string) => {
                                                                switch (platform) {
                                                                    case 'instagram':
                                                                        return [
                                                                            { value: 'image', label: 'Photo', icon: '📸' },
                                                                            { value: 'video', label: 'Video', icon: '🎥' },
                                                                            { value: 'carousel', label: 'Carousel', icon: '🎠' },
                                                                            { value: 'story', label: 'Story', icon: '📱' },
                                                                            { value: 'reel', label: 'Reel', icon: '🎬' }
                                                                        ];
                                                                    case 'facebook':
                                                                        return [
                                                                            { value: 'image', label: 'Photo', icon: '📸' },
                                                                            { value: 'video', label: 'Video', icon: '🎥' },
                                                                            { value: 'carousel', label: 'Carousel', icon: '🎠' },
                                                                            { value: 'story', label: 'Story', icon: '📱' },
                                                                            { value: 'live', label: 'Live', icon: '🔴' }
                                                                        ];
                                                                    case 'twitter':
                                                                        return [
                                                                            { value: 'text', label: 'Tweet', icon: '💬' },
                                                                            { value: 'image', label: 'Photo', icon: '📸' },
                                                                            { value: 'video', label: 'Video', icon: '🎥' },
                                                                            { value: 'gif', label: 'GIF', icon: '🎭' }
                                                                        ];
                                                                    case 'linkedin':
                                                                        return [
                                                                            { value: 'text', label: 'Post', icon: '📝' },
                                                                            { value: 'image', label: 'Image', icon: '📸' },
                                                                            { value: 'video', label: 'Video', icon: '🎥' },
                                                                            { value: 'document', label: 'Document', icon: '📄' },
                                                                            { value: 'article', label: 'Article', icon: '📰' }
                                                                        ];
                                                                    case 'youtube':
                                                                        return [
                                                                            { value: 'video', label: 'Video', icon: '🎥' },
                                                                            { value: 'short', label: 'Short', icon: '📱' },
                                                                            { value: 'live', label: 'Live Stream', icon: '🔴' }
                                                                        ];
                                                                    case 'tiktok':
                                                                        return [
                                                                            { value: 'video', label: 'Video', icon: '🎥' },
                                                                            { value: 'live', label: 'Live', icon: '🔴' }
                                                                        ];
                                                                    case 'pinterest':
                                                                        return [
                                                                            { value: 'image', label: 'Pin', icon: '📌' },
                                                                            { value: 'video', label: 'Video Pin', icon: '🎥' },
                                                                            { value: 'carousel', label: 'Carousel', icon: '🎠' }
                                                                        ];
                                                                    default:
                                                                        return [
                                                                            { value: 'image', label: 'Image', icon: '📸' },
                                                                            { value: 'video', label: 'Video', icon: '🎥' },
                                                                            { value: 'text', label: 'Text', icon: '📝' },
                                                                            { value: 'carousel', label: 'Carousel', icon: '🎠' }
                                                                        ];
                                                                }
                                                            };

                                                            return getMediaTypes(newAsset.smm_platform).map((type) => (
                                                                <button
                                                                    key={type.value}
                                                                    type="button"
                                                                    onClick={() => setNewAsset({ ...newAsset, smm_media_type: type.value as any })}
                                                                    className={`p-3 rounded-lg border-2 transition-all text-center hover:scale-105 ${newAsset.smm_media_type === type.value
                                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                                                                        : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                                                                        }`}
                                                                >
                                                                    <div className="text-2xl mb-1">{type.icon}</div>
                                                                    <div className={`text-xs font-bold ${newAsset.smm_media_type === type.value ? 'text-white' : 'text-slate-700'
                                                                        }`}>
                                                                        {type.label}
                                                                    </div>
                                                                </button>
                                                            ));
                                                        })()}
                                                    </div>
                                                </div>

                                                {/* Media Upload Section */}
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-3">
                                                        🎨 Media Upload
                                                        {(newAsset.smm_media_type === 'image' || newAsset.smm_media_type === 'video' || newAsset.smm_media_type === 'carousel') && (
                                                            <span className="text-red-500 ml-1">*</span>
                                                        )}
                                                    </label>

                                                    {/* SMM Pages Upload Button - Enhanced for Multiple Pages */}
                                                    {(newAsset.smm_media_type === 'carousel' || newAsset.smm_media_type === 'image') && (
                                                        <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <div className="bg-purple-600 p-2 rounded-lg">
                                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-lg font-bold text-purple-900">📱 SMM Pages Upload</h4>
                                                                    <p className="text-sm text-purple-600">Upload multiple pages/images for your SMM content</p>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const input = document.createElement('input');
                                                                        input.type = 'file';
                                                                        input.multiple = true;
                                                                        input.accept = 'image/*';
                                                                        input.onchange = (e) => {
                                                                            const files = (e.target as HTMLInputElement).files;
                                                                            if (files && files.length > 0) {
                                                                                // Handle multiple files for carousel
                                                                                const fileArray = Array.from(files);
                                                                                Promise.all(fileArray.map(file => {
                                                                                    return new Promise<string>((resolve) => {
                                                                                        const reader = new FileReader();
                                                                                        reader.onloadend = () => resolve(reader.result as string);
                                                                                        reader.readAsDataURL(file);
                                                                                    });
                                                                                })).then(base64Array => {
                                                                                    // Store first image as main media, others as additional pages
                                                                                    setNewAsset({
                                                                                        ...newAsset,
                                                                                        smm_media_url: base64Array[0],
                                                                                        smm_additional_pages: base64Array.slice(1)
                                                                                    });
                                                                                });
                                                                            }
                                                                        };
                                                                        input.click();
                                                                    }}
                                                                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 hover:scale-105"
                                                                >
                                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                                    </svg>
                                                                    Upload Multiple Pages
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const input = document.createElement('input');
                                                                        input.type = 'file';
                                                                        input.accept = 'image/*';
                                                                        input.onchange = (e) => {
                                                                            const file = (e.target as HTMLInputElement).files?.[0];
                                                                            if (file) {
                                                                                handleFileUpload(file, 'media');
                                                                            }
                                                                        };
                                                                        input.click();
                                                                    }}
                                                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 hover:scale-105"
                                                                >
                                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                    Upload Single Image
                                                                </button>
                                                            </div>

                                                            {/* Display uploaded pages */}
                                                            {(newAsset.smm_additional_pages && newAsset.smm_additional_pages.length > 0) && (
                                                                <div className="mt-4">
                                                                    <p className="text-sm font-bold text-purple-900 mb-2">
                                                                        📄 Additional Pages ({newAsset.smm_additional_pages.length})
                                                                    </p>
                                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                                        {newAsset.smm_additional_pages.map((page, index) => (
                                                                            <div key={index} className="relative group">
                                                                                <img
                                                                                    src={page}
                                                                                    alt={`Page ${index + 2}`}
                                                                                    className="w-full h-20 object-cover rounded-lg border-2 border-purple-200"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        const updatedPages = [...(newAsset.smm_additional_pages || [])];
                                                                                        updatedPages.splice(index, 1);
                                                                                        setNewAsset({
                                                                                            ...newAsset,
                                                                                            smm_additional_pages: updatedPages
                                                                                        });
                                                                                    }}
                                                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                >
                                                                                    ×
                                                                                </button>
                                                                                <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                                                                    {index + 2}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="mt-3 text-xs text-purple-700 bg-purple-100 p-3 rounded-lg">
                                                                <p className="font-bold mb-1">💡 SMM Pages Upload Tips:</p>
                                                                <ul className="space-y-1">
                                                                    <li>• Upload multiple images for carousel posts</li>
                                                                    <li>• Recommended: 1080x1080px for Instagram, 1200x630px for Facebook</li>
                                                                    <li>• Maximum 10 images per carousel</li>
                                                                    <li>• Supported formats: JPG, PNG, WebP</li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Standard Upload Area */}
                                                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer"
                                                        onClick={() => mediaInputRef.current?.click()}>
                                                        <input
                                                            ref={mediaInputRef}
                                                            type="file"
                                                            accept={
                                                                newAsset.smm_media_type === 'video' ? 'video/*' :
                                                                    newAsset.smm_media_type === 'image' ? 'image/*' :
                                                                        'image/*,video/*,.gif'
                                                            }
                                                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'media')}
                                                            className="hidden"
                                                        />

                                                        {newAsset.smm_media_url && newAsset.smm_media_url.startsWith('data:') ? (
                                                            <div className="space-y-3">
                                                                {newAsset.smm_media_type === 'video' || newAsset.smm_media_url.includes('video') ? (
                                                                    <video src={newAsset.smm_media_url} controls className="max-h-48 mx-auto rounded-lg border-2 border-slate-200 shadow-sm" />
                                                                ) : (
                                                                    <img src={newAsset.smm_media_url} alt="Media preview" className="max-h-48 mx-auto rounded-lg border-2 border-slate-200 shadow-sm" />
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setNewAsset({ ...newAsset, smm_media_url: '' });
                                                                    }}
                                                                    className="text-sm text-red-600 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                                                                >
                                                                    Remove Media
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                                                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                                    </svg>
                                                                </div>
                                                                <div>
                                                                    <p className="text-base font-semibold text-slate-700 mb-2">
                                                                        Drop your {newAsset.smm_media_type || 'media'} here or click to browse
                                                                    </p>
                                                                    <p className="text-sm text-slate-500">
                                                                        {newAsset.smm_platform === 'instagram' && 'JPG, PNG up to 10MB • Videos up to 60s'}
                                                                        {newAsset.smm_platform === 'twitter' && 'JPG, PNG, GIF up to 5MB • Videos up to 2:20'}
                                                                        {newAsset.smm_platform === 'linkedin' && 'JPG, PNG up to 20MB • Videos up to 10min'}
                                                                        {newAsset.smm_platform === 'facebook' && 'JPG, PNG up to 25MB • Videos up to 240min'}
                                                                        {newAsset.smm_platform === 'youtube' && 'Videos up to 15min (or longer with verification)'}
                                                                        {newAsset.smm_platform === 'tiktok' && 'Videos 15s-10min • 9:16 aspect ratio recommended'}
                                                                        {!['instagram', 'twitter', 'linkedin', 'facebook', 'youtube', 'tiktok'].includes(newAsset.smm_platform) && 'JPG, PNG, MP4, GIF up to 50MB'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* URL Input Alternative */}
                                                    <div className="mt-4">
                                                        <label className="block text-xs font-medium text-slate-600 mb-2">Or paste media URL:</label>
                                                        <input
                                                            type="url"
                                                            value={newAsset.smm_media_url && !newAsset.smm_media_url.startsWith('data:') ? newAsset.smm_media_url : ''}
                                                            onChange={(e) => setNewAsset({ ...newAsset, smm_media_url: e.target.value })}
                                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                            placeholder="https://example.com/media.jpg"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Scheduling & Additional Options */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                                            📅 Schedule Post (Optional)
                                                        </label>
                                                        <input
                                                            type="datetime-local"
                                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                        />
                                                        <p className="text-xs text-slate-500 mt-1">Leave empty to save as draft</p>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                                            🎯 Target Audience (Optional)
                                                        </label>
                                                        <select className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white cursor-pointer">
                                                            <option value="">All Followers</option>
                                                            <option value="location">By Location</option>
                                                            <option value="age">By Age Group</option>
                                                            <option value="interests">By Interests</option>
                                                            <option value="custom">Custom Audience</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Call-to-Action */}
                                                {(newAsset.smm_platform === 'facebook' || newAsset.smm_platform === 'instagram' || newAsset.smm_platform === 'linkedin') && (
                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                                            🔗 Call-to-Action (Optional)
                                                        </label>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {[
                                                                { value: 'learn_more', label: 'Learn More' },
                                                                { value: 'shop_now', label: 'Shop Now' },
                                                                { value: 'sign_up', label: 'Sign Up' },
                                                                { value: 'download', label: 'Download' },
                                                                { value: 'contact_us', label: 'Contact Us' },
                                                                { value: 'book_now', label: 'Book Now' }
                                                            ].map((cta) => (
                                                                <button
                                                                    key={cta.value}
                                                                    type="button"
                                                                    className="p-2 text-sm border-2 border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-center"
                                                                >
                                                                    {cta.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="flex gap-4 pt-6 border-t-2 border-slate-200">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            // Validate that user has entered some content
                                                            if (!newAsset.smm_description && !newAsset.smm_media_url) {
                                                                alert('Please add a description or upload media to preview your post.');
                                                                return;
                                                            }
                                                            // Show real content immediately, no demo delay
                                                            setShowDemoPreview(false);
                                                            setShowPreviewModal(true);
                                                        }}
                                                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        Preview {newAsset.smm_platform?.charAt(0).toUpperCase() + newAsset.smm_platform?.slice(1)} Post
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold shadow-md hover:bg-green-700 transition-all flex items-center gap-2"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                        </svg>
                                                        AI Optimize
                                                    </button>
                                                </div>

                                                {/* Platform-specific Tips */}
                                                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="text-yellow-600 mt-0.5">💡</div>
                                                        <div>
                                                            <h6 className="font-bold text-yellow-800 mb-2">
                                                                {newAsset.smm_platform?.charAt(0).toUpperCase() + newAsset.smm_platform?.slice(1)} Best Practices
                                                            </h6>
                                                            <ul className="text-sm text-yellow-700 space-y-1">
                                                                {newAsset.smm_platform === 'instagram' && (
                                                                    <>
                                                                        <li>• Use high-quality, visually appealing images</li>
                                                                        <li>• Post consistently at optimal times (11 AM - 1 PM)</li>
                                                                        <li>• Use 5-10 relevant hashtags for better reach</li>
                                                                        <li>• Include a clear call-to-action in your caption</li>
                                                                    </>
                                                                )}
                                                                {newAsset.smm_platform === 'twitter' && (
                                                                    <>
                                                                        <li>• Keep tweets concise and engaging</li>
                                                                        <li>• Use 1-2 hashtags maximum</li>
                                                                        <li>• Tweet during peak hours (9 AM - 3 PM)</li>
                                                                        <li>• Include visuals to increase engagement by 150%</li>
                                                                    </>
                                                                )}
                                                                {newAsset.smm_platform === 'linkedin' && (
                                                                    <>
                                                                        <li>• Share professional insights and industry news</li>
                                                                        <li>• Post during business hours (8 AM - 6 PM)</li>
                                                                        <li>• Use 3-5 professional hashtags</li>
                                                                        <li>• Engage with comments to boost visibility</li>
                                                                    </>
                                                                )}
                                                                {newAsset.smm_platform === 'facebook' && (
                                                                    <>
                                                                        <li>• Share engaging, community-focused content</li>
                                                                        <li>• Post when your audience is most active</li>
                                                                        <li>• Use Facebook-native video for better reach</li>
                                                                        <li>• Encourage comments and shares</li>
                                                                    </>
                                                                )}
                                                                {newAsset.smm_platform === 'youtube' && (
                                                                    <>
                                                                        <li>• Create compelling thumbnails and titles</li>
                                                                        <li>• Upload consistently (2-3 times per week)</li>
                                                                        <li>• Use relevant keywords in description</li>
                                                                        <li>• Engage with comments within first hour</li>
                                                                    </>
                                                                )}
                                                                {newAsset.smm_platform === 'tiktok' && (
                                                                    <>
                                                                        <li>• Create vertical videos (9:16 aspect ratio)</li>
                                                                        <li>• Hook viewers in the first 3 seconds</li>
                                                                        <li>• Use trending sounds and hashtags</li>
                                                                        <li>• Post 1-4 times daily for best results</li>
                                                                    </>
                                                                )}
                                                                {!['instagram', 'twitter', 'linkedin', 'facebook', 'youtube', 'tiktok'].includes(newAsset.smm_platform) && (
                                                                    <>
                                                                        <li>• Know your platform's optimal posting times</li>
                                                                        <li>• Use platform-appropriate content formats</li>
                                                                        <li>• Engage with your community regularly</li>
                                                                        <li>• Monitor analytics to improve performance</li>
                                                                    </>
                                                                )}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Fields 15 & 16: AI Scores Section - Required for Submission */}
                            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border-2 border-green-200 p-6 space-y-4 shadow-sm">
                                <div className="flex items-center gap-3 pb-3 border-b-2 border-green-200">
                                    <div className="bg-green-600 p-2 rounded-lg">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-green-900">15 & 16. AI Quality Scores</h3>
                                        <p className="text-xs text-green-600">Required for QC submission</p>
                                    </div>
                                </div>

                                {/* Score Display Section */}
                                {(newAsset.seo_score || newAsset.grammar_score) && (
                                    <div className="flex justify-center gap-8 py-4">
                                        {newAsset.seo_score && (
                                            <CircularScore
                                                score={newAsset.seo_score}
                                                label="SEO Score"
                                                size="md"
                                                showEmbedButton={true}
                                            />
                                        )}
                                        {newAsset.grammar_score && (
                                            <CircularScore
                                                score={newAsset.grammar_score}
                                                label="Grammar Score"
                                                size="md"
                                                showEmbedButton={true}
                                            />
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            15. SEO Score (0-100) - AI Integration
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={newAsset.seo_score || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, seo_score: parseInt(e.target.value) || undefined })}
                                                className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                                placeholder="0-100"
                                            />
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    try {
                                                        const response = await fetch('/api/v1/assetLibrary/ai-scores', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                content: newAsset.web_body_content || newAsset.smm_description,
                                                                keywords: newAsset.web_keywords || newAsset.keywords,
                                                                title: newAsset.web_title || newAsset.name,
                                                                description: newAsset.web_description || newAsset.smm_description
                                                            })
                                                        });
                                                        if (response.ok) {
                                                            const scores = await response.json();
                                                            setNewAsset({
                                                                ...newAsset,
                                                                seo_score: scores.seo_score,
                                                                grammar_score: scores.grammar_score
                                                            });
                                                        }
                                                    } catch (error) {
                                                        console.error('Failed to generate AI scores:', error);
                                                    }
                                                }}
                                                className="px-4 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                </svg>
                                                Generate AI Scores
                                            </button>
                                        </div>
                                        {newAsset.seo_score && (
                                            <div className={`mt-2 text-xs font-bold ${newAsset.seo_score >= 80 ? 'text-green-600' : newAsset.seo_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                {newAsset.seo_score >= 80 ? '✓ Excellent SEO' : newAsset.seo_score >= 60 ? '⚠ Good SEO' : '✗ Needs SEO improvement'}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            16. Grammar Score (0-100) - AI Integration
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={newAsset.grammar_score || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, grammar_score: parseInt(e.target.value) || undefined })}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                            placeholder="0-100"
                                        />
                                        {newAsset.grammar_score && (
                                            <div className={`mt-2 text-xs font-bold ${newAsset.grammar_score >= 90 ? 'text-green-600' : newAsset.grammar_score >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                {newAsset.grammar_score >= 90 ? '✓ Excellent grammar' : newAsset.grammar_score >= 70 ? '⚠ Good grammar' : '✗ Needs grammar improvement'}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-green-200">
                                    <p className="text-xs text-slate-600">
                                        <strong>Note:</strong> SEO and Grammar scores are mandatory before submitting for QC review.
                                        Use the "Generate" button to get AI-powered scores based on your content.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SMM Preview Modal */}
            {showPreviewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowPreviewModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <div>
                                    <h3 className="text-lg font-bold">Social Media Post Preview</h3>
                                    <p className="text-xs text-blue-100">
                                        {(newAsset.smm_platform === 'facebook' || newAsset.smm_platform === 'instagram') && 'Facebook / Instagram'}
                                        {newAsset.smm_platform === 'twitter' && 'Twitter'}
                                        {newAsset.smm_platform === 'linkedin' && 'LinkedIn'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setShowPreviewModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            {(newAsset.smm_platform === 'facebook' || newAsset.smm_platform === 'instagram') && (
                                <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 max-w-[500px] mx-auto">
                                    <div className="p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-[2px]">
                                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                                    <div className="w-[36px] h-[36px] rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                                        {smmPreviewData.name?.charAt(0)?.toUpperCase() || 'A'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-1">
                                                    <p className="font-semibold text-[15px] text-slate-900">{smmPreviewData.name || 'Your Page'}</p>
                                                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <span>Just now</span>
                                                    <span>·</span>
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="text-slate-500 hover:bg-slate-100 rounded-full p-2">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                            </svg>
                                        </button>
                                    </div>
                                    {(smmPreviewData.description || smmPreviewData.hashtags) && (
                                        <div className="px-3 pb-2">
                                            {smmPreviewData.description && <p className="text-[15px] text-slate-900 whitespace-pre-wrap leading-5 mb-1">{smmPreviewData.description}</p>}
                                            {smmPreviewData.hashtags && <p className="text-[15px] text-blue-600 font-normal">{smmPreviewData.hashtags}</p>}
                                        </div>
                                    )}
                                    {smmPreviewData.media && (
                                        <div className="bg-black relative">
                                            {newAsset.smm_media_type === 'video' ? (
                                                <video src={smmPreviewData.media} controls className="w-full max-h-[600px] object-contain" poster={smmPreviewData.media} />
                                            ) : newAsset.smm_media_type === 'carousel' && newAsset.smm_additional_pages && newAsset.smm_additional_pages.length > 0 ? (
                                                <div className="relative">
                                                    {/* Carousel Display */}
                                                    <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                                        <div className="flex-shrink-0 w-full snap-center">
                                                            <img src={smmPreviewData.media} alt="Post content 1" className="w-full object-cover" style={{ maxHeight: '600px' }} />
                                                        </div>
                                                        {newAsset.smm_additional_pages.map((page, index) => (
                                                            <div key={index} className="flex-shrink-0 w-full snap-center">
                                                                <img src={page} alt={`Post content ${index + 2}`} className="w-full object-cover" style={{ maxHeight: '600px' }} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {/* Carousel Indicators */}
                                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                                        <div className="w-2 h-2 bg-white rounded-full opacity-100"></div>
                                                        {newAsset.smm_additional_pages.map((_, index) => (
                                                            <div key={index} className="w-2 h-2 bg-white rounded-full opacity-50"></div>
                                                        ))}
                                                    </div>
                                                    {/* Page Counter */}
                                                    <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                                                        1/{newAsset.smm_additional_pages.length + 1}
                                                    </div>
                                                </div>
                                            ) : (
                                                <img src={smmPreviewData.media} alt="Post content" className="w-full object-cover" style={{ maxHeight: '600px' }} />
                                            )}
                                        </div>
                                    )}
                                    <div className="px-3 py-2">
                                        <div className="flex items-center justify-between text-[13px] text-slate-600">
                                            <div className="flex items-center gap-1">
                                                <div className="flex -space-x-1">
                                                    <div className="w-[18px] h-[18px] rounded-full bg-blue-500 flex items-center justify-center border-2 border-white"><span className="text-white text-[10px]">👍</span></div>
                                                    <div className="w-[18px] h-[18px] rounded-full bg-red-500 flex items-center justify-center border-2 border-white"><span className="text-white text-[10px]">❤️</span></div>
                                                    <div className="w-[18px] h-[18px] rounded-full bg-yellow-400 flex items-center justify-center border-2 border-white"><span className="text-white text-[10px]">😊</span></div>
                                                </div>
                                                <span className="ml-1">1.2K</span>
                                            </div>
                                            <div className="flex items-center gap-2"><span>89 comments</span><span>·</span><span>24 shares</span></div>
                                        </div>
                                    </div>
                                    <div className="border-t border-slate-200 px-2 py-1">
                                        <div className="flex items-center justify-around">
                                            <button className="flex-1 flex items-center justify-center gap-2 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors font-semibold text-[15px]">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                                                Like
                                            </button>
                                            <button className="flex-1 flex items-center justify-center gap-2 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors font-semibold text-[15px]">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                Comment
                                            </button>
                                            <button className="flex-1 flex items-center justify-center gap-2 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors font-semibold text-[15px]">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                                Share
                                            </button>
                                        </div>
                                    </div>
                                    <div className="border-t border-slate-200 px-3 py-2 bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white text-xs font-bold">U</div>
                                            <div className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2"><p className="text-sm text-slate-400">Write a comment...</p></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {newAsset.smm_platform === 'twitter' && (
                                <div className="border-2 border-slate-200 rounded-2xl overflow-hidden bg-white shadow-lg">
                                    <div className="p-4 flex gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">{smmPreviewData.name?.charAt(0) || 'A'}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-bold text-sm">{smmPreviewData.name || 'Your Account'}</p>
                                                <span className="text-blue-500">✓</span>
                                                <span className="text-slate-500 text-sm font-normal">@{smmPreviewData.name?.toLowerCase().replace(/\s+/g, '') || 'account'}</span>
                                                <span className="text-slate-500 text-sm">· 2m</span>
                                            </div>

                                            {/* Tweet Text */}
                                            {smmPreviewData.description && (
                                                <p className="text-sm text-slate-900 mb-2 whitespace-pre-wrap">{smmPreviewData.description}</p>
                                            )}

                                            {/* Hashtags */}
                                            {smmPreviewData.hashtags && (
                                                <p className="text-sm text-blue-500 mb-2">{smmPreviewData.hashtags}</p>
                                            )}

                                            {/* Media */}
                                            {smmPreviewData.media && (
                                                <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200">
                                                    {newAsset.smm_media_type === 'video' ? (
                                                        <video src={smmPreviewData.media} controls className="w-full" />
                                                    ) : (
                                                        <img src={smmPreviewData.media} alt="Tweet media" className="w-full" />
                                                    )}
                                                </div>
                                            )}

                                            {/* Engagement */}
                                            <div className="flex justify-between mt-3 text-slate-500 text-sm">
                                                <button className="flex items-center gap-2 hover:text-blue-500">
                                                    <span>💬</span> 24
                                                </button>
                                                <button className="flex items-center gap-2 hover:text-green-500">
                                                    <span>🔁</span> 12
                                                </button>
                                                <button className="flex items-center gap-2 hover:text-red-500">
                                                    <span>❤️</span> 156
                                                </button>
                                                <button className="flex items-center gap-2 hover:text-blue-500">
                                                    <span>📊</span> 2.1K
                                                </button>
                                                <button className="flex items-center gap-2 hover:text-blue-500">
                                                    <span>↗️</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {newAsset.smm_platform === 'linkedin' && (
                                <div className="border-2 border-slate-200 rounded-lg overflow-hidden bg-white shadow-lg">
                                    {/* LinkedIn Header */}
                                    <div className="p-4 flex items-start gap-3 border-b border-slate-200">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-700 to-blue-900 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                            {smmPreviewData.name?.charAt(0) || 'A'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm">{smmPreviewData.name || 'Your Company'}</p>
                                            <p className="text-xs text-slate-500">1,234 followers</p>
                                            <p className="text-xs text-slate-500">1m · 🌐</p>
                                        </div>
                                        <button className="text-slate-500 hover:bg-slate-100 p-2 rounded">
                                            <span>⋯</span>
                                        </button>
                                    </div>

                                    {/* Post Content */}
                                    <div className="p-4">
                                        {smmPreviewData.description && (
                                            <p className="text-sm text-slate-700 whitespace-pre-wrap mb-2">{smmPreviewData.description}</p>
                                        )}
                                        {smmPreviewData.hashtags && (
                                            <p className="text-sm text-blue-700 mb-2">{smmPreviewData.hashtags}</p>
                                        )}
                                    </div>

                                    {/* Media */}
                                    {smmPreviewData.media && (
                                        <div className="bg-slate-100">
                                            {newAsset.smm_media_type === 'video' ? (
                                                <video src={smmPreviewData.media} controls className="w-full" />
                                            ) : (
                                                <img src={smmPreviewData.media} alt="Post media" className="w-full" />
                                            )}
                                        </div>
                                    )}

                                    {/* Engagement Bar */}
                                    <div className="p-4 border-t border-slate-200">
                                        <div className="flex justify-between text-xs text-slate-600 mb-3">
                                            <span>👍 💡 ❤️ 89</span>
                                            <span>12 comments · 5 reposts</span>
                                        </div>
                                        <div className="flex justify-around border-t border-slate-200 pt-3">
                                            <button className="flex flex-col items-center gap-1 text-slate-600 hover:bg-slate-100 px-4 py-2 rounded text-xs">
                                                <span className="text-lg">👍</span> Like
                                            </button>
                                            <button className="flex flex-col items-center gap-1 text-slate-600 hover:bg-slate-100 px-4 py-2 rounded text-xs">
                                                <span className="text-lg">💬</span> Comment
                                            </button>
                                            <button className="flex flex-col items-center gap-1 text-slate-600 hover:bg-slate-100 px-4 py-2 rounded text-xs">
                                                <span className="text-lg">🔁</span> Repost
                                            </button>
                                            <button className="flex flex-col items-center gap-1 text-slate-600 hover:bg-slate-100 px-4 py-2 rounded text-xs">
                                                <span className="text-lg">↗️</span> Send
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 rounded-b-2xl flex justify-end gap-3">
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* QC Review View */}
            {viewMode === 'qc' && qcReviewAsset && (
                <div className="h-full flex flex-col w-full p-6 overflow-hidden">
                    <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full h-full">
                        <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-gradient-to-r from-purple-50 to-indigo-50 w-full flex-shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">QC Review</h2>
                                <p className="text-slate-600 text-xs mt-0.5">
                                    Review asset for quality control approval
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {/* Quick Upload Button in QC View */}
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    className="px-4 py-2 text-sm font-medium text-indigo-600 border-2 border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
                                    title="Upload New Asset"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Upload Asset
                                </button>

                                <button
                                    onClick={() => {
                                        setQcReviewAsset(null);
                                        setViewMode('list');
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 border-2 border-slate-300 rounded-lg hover:bg-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleQcSubmit(false)}
                                    disabled={!qcScore || !checklistCompleted}
                                    className={`bg-red-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-red-700 transition-colors text-sm ${!qcScore || !checklistCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    Reject Asset
                                </button>
                                <button
                                    onClick={() => handleQcSubmit(true)}
                                    disabled={!qcScore || !checklistCompleted}
                                    className={`bg-green-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-green-700 transition-colors text-sm ${!qcScore || !checklistCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    Approve Asset
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 w-full">
                            <div className="max-w-4xl mx-auto space-y-6">
                                {/* Asset Information (Read-Only) */}
                                <div className="bg-white rounded-xl border-2 border-slate-200 p-6 shadow-sm">
                                    <div className="flex items-center gap-3 pb-4 border-b-2 border-slate-200 mb-6">
                                        <div className="bg-indigo-600 p-2 rounded-lg">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-indigo-900">Asset Information</h3>
                                            <p className="text-xs text-indigo-600">Read-only view for QC review</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Asset Name</label>
                                            <div className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-sm text-slate-700">
                                                {qcReviewAsset?.name || 'N/A'}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Application Type</label>
                                            <div className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-sm text-slate-700 uppercase">
                                                {qcReviewAsset?.application_type || 'Not specified'}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Asset Type</label>
                                            <div className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-sm text-slate-700">
                                                {qcReviewAsset?.type || 'N/A'}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Asset Category</label>
                                            <div className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-sm text-slate-700">
                                                {qcReviewAsset?.asset_category || 'Not specified'}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Keywords</label>
                                            <div className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-sm text-slate-700">
                                                {qcReviewAsset?.keywords?.join(', ') || 'No keywords'}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Repository</label>
                                            <div className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-sm text-slate-700">
                                                {qcReviewAsset?.repository || 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Scores Display */}
                                    {(qcReviewAsset?.seo_score || qcReviewAsset?.grammar_score) && (
                                        <div className="mt-6 pt-6 border-t-2 border-slate-200">
                                            <h4 className="text-sm font-bold text-slate-700 mb-4">AI Quality Scores</h4>
                                            <div className="flex justify-center gap-8">
                                                {qcReviewAsset?.seo_score && qcReviewAsset.seo_score > 0 && (
                                                    <CircularScore
                                                        score={qcReviewAsset.seo_score}
                                                        label="SEO Score"
                                                        size="md"
                                                    />
                                                )}
                                                {qcReviewAsset?.grammar_score && qcReviewAsset.grammar_score > 0 && (
                                                    <CircularScore
                                                        score={qcReviewAsset.grammar_score}
                                                        label="Grammar Score"
                                                        size="md"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Content Preview */}
                                    {qcReviewAsset?.web_body_content && (
                                        <div className="mt-6 pt-6 border-t-2 border-slate-200">
                                            <h4 className="text-sm font-bold text-slate-700 mb-4">Body Content</h4>
                                            <div className="max-h-64 overflow-y-auto bg-slate-50 border-2 border-slate-200 rounded-lg p-4">
                                                <div className="prose prose-sm max-w-none text-slate-700">
                                                    {qcReviewAsset?.web_body_content?.split('\n').map((line, index) => (
                                                        <p key={index} className="mb-2">{line}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Media Preview */}
                                    {(qcReviewAsset?.thumbnail_url || qcReviewAsset?.file_url) && (
                                        <div className="mt-6 pt-6 border-t-2 border-slate-200">
                                            <h4 className="text-sm font-bold text-slate-700 mb-4">Asset Preview</h4>
                                            <div className="flex justify-center">
                                                <img
                                                    src={qcReviewAsset?.thumbnail_url || qcReviewAsset?.file_url || ''}
                                                    alt="Asset preview"
                                                    className="max-h-64 rounded-lg border-2 border-slate-200 shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* QC Input Section */}
                                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 p-6 shadow-sm">
                                    <div className="flex items-center gap-3 pb-4 border-b-2 border-purple-200 mb-6">
                                        <div className="bg-purple-600 p-2 rounded-lg">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-purple-900">QC Review Input</h3>
                                            <p className="text-xs text-purple-600">Provide your quality control assessment</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* QC Score */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                                QC Score (0-100)
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={qcScore || ''}
                                                onChange={(e) => setQcScore(parseInt(e.target.value) || undefined)}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                placeholder="Enter QC score (0-100)"
                                            />
                                            {qcScore && qcScore > 0 && (
                                                <div className={`mt-2 text-xs font-bold ${qcScore >= 80 ? 'text-green-600' : qcScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                    {qcScore >= 80 ? '✓ Excellent quality' : qcScore >= 60 ? '⚠ Good quality' : '✗ Needs improvement'}
                                                </div>
                                            )}
                                        </div>

                                        {/* Checklist Completion */}
                                        <div>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={checklistCompleted}
                                                    onChange={(e) => setChecklistCompleted(e.target.checked)}
                                                    className="w-5 h-5 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                                                />
                                                <span className="text-sm font-bold text-slate-700">
                                                    QC Checklist Completed
                                                    <span className="text-red-500 ml-1">*</span>
                                                </span>
                                            </label>
                                            <p className="text-xs text-slate-500 mt-1 ml-8">
                                                Confirm that all quality control checks have been completed
                                            </p>
                                        </div>

                                        {/* QC Remarks */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                                QC Remarks / Comments
                                            </label>
                                            <textarea
                                                value={qcRemarks}
                                                onChange={(e) => setQcRemarks(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                placeholder="Enter your QC remarks and comments..."
                                                rows={4}
                                            />
                                            <p className="text-xs text-slate-500 mt-1">
                                                Provide detailed feedback for the asset creator
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Workflow Information */}
                                <div className="bg-white rounded-xl border-2 border-slate-200 p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">Workflow Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-bold text-slate-700">Submitted by:</span>
                                            <span className="ml-2 text-slate-600">
                                                {users.find(u => u.id === qcReviewAsset?.submitted_by)?.name || 'Unknown'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-bold text-slate-700">Submitted at:</span>
                                            <span className="ml-2 text-slate-600">
                                                {qcReviewAsset?.submitted_at ? new Date(qcReviewAsset.submitted_at).toLocaleString() : 'Unknown'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-bold text-slate-700">Current status:</span>
                                            <span className="ml-2">{getStatusBadge(qcReviewAsset?.status || 'Draft')}</span>
                                        </div>
                                        <div>
                                            <span className="font-bold text-slate-700">Rework count:</span>
                                            <span className="ml-2 text-slate-600">{qcReviewAsset?.rework_count || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* My Submissions View */}
            {viewMode === 'mysubmissions' && (
                <div className="h-full flex flex-col w-full p-6 overflow-hidden">
                    <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full h-full">
                        <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-gradient-to-r from-green-50 to-emerald-50 w-full flex-shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">My Submissions</h2>
                                <p className="text-slate-600 text-xs mt-0.5">
                                    Track your submitted assets and their review status
                                </p>
                            </div>
                            <button
                                onClick={() => setViewMode('list')}
                                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Back to Assets"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        </div>

                        {/* Stats Cards */}
                        <div className="p-6 border-b border-slate-200 bg-slate-50">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Total</p>
                                            <p className="text-2xl font-bold text-slate-900">{mySubmissions.length}</p>
                                        </div>
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Pending</p>
                                            <p className="text-2xl font-bold text-purple-600">{mySubmissions.filter(a => a.status === 'Pending QC Review').length}</p>
                                        </div>
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Approved</p>
                                            <p className="text-2xl font-bold text-green-600">{mySubmissions.filter(a => a.status === 'QC Approved').length}</p>
                                        </div>
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Rejected</p>
                                            <p className="text-2xl font-bold text-red-600">{mySubmissions.filter(a => a.status === 'QC Rejected').length}</p>
                                            <p className="text-xs text-red-600">Needs Rework</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <Table
                                columns={mySubmissionsColumns}
                                data={mySubmissions}
                                title=""
                                emptyMessage="You haven't submitted any assets yet. Upload and submit an asset to see it here!"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed Asset View */}
            {viewMode === 'detail' && selectedAsset && (
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
                    {/* Fixed Header */}
                    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
                        <div className="max-w-7xl mx-auto px-6 py-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                        title="Back to Assets"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                                                {selectedAsset.status === 'QC Approved' ? 'Approved' : 'QC'}
                                            </span>
                                            <h1 className="text-2xl font-bold text-slate-900">{selectedAsset.name || 'AI Trends 2025 Banner'}</h1>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-600">
                                            <span>ai-trends-banner.jpg</span>
                                            <span>•</span>
                                            <span>Asset ID: {selectedAsset.id}</span>
                                            <span>•</span>
                                            <span>{selectedAsset.date ? new Date(selectedAsset.date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : new Date().toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3">
                                    {(selectedAsset.file_url || selectedAsset.thumbnail_url) && (
                                        <button
                                            onClick={() => {
                                                const url = selectedAsset.file_url || selectedAsset.thumbnail_url;
                                                if (url) {
                                                    if (url.startsWith('data:')) {
                                                        const win = window.open();
                                                        if (win) {
                                                            win.document.write(`<img src="${url}" style="max-width:100%; height:auto;" />`);
                                                        }
                                                    } else {
                                                        window.open(url, '_blank', 'noopener,noreferrer');
                                                    }
                                                }
                                            }}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            Large Preview
                                        </button>
                                    )}

                                    <button
                                        onClick={() => {
                                            const url = selectedAsset.file_url || selectedAsset.thumbnail_url;
                                            if (url) {
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.download = selectedAsset.name || 'asset';
                                                link.click();
                                            }
                                        }}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download
                                    </button>

                                    {(selectedAsset.status === 'Draft' || selectedAsset.status === 'QC Rejected' || selectedAsset.submitted_by === currentUser.id) && (
                                        <button
                                            onClick={() => handleEdit({ stopPropagation: () => { } } as any, selectedAsset)}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-indigo-700 transition-colors text-sm flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Replace
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleEdit({ stopPropagation: () => { } } as any, selectedAsset)}
                                        className="bg-slate-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-slate-700 transition-colors text-sm flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit Asset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Left Column - Asset Preview */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-slate-200">
                                        <h3 className="text-lg font-semibold text-slate-900">Asset Preview</h3>
                                    </div>
                                    <div className="p-6">
                                        {selectedAsset.thumbnail_url ? (
                                            <div className="space-y-4">
                                                <img
                                                    src={selectedAsset.thumbnail_url}
                                                    alt={selectedAsset.name}
                                                    className="w-full rounded-lg border-2 border-slate-200 shadow-sm"
                                                />
                                                <div className="text-center">
                                                    <div className="text-sm font-medium text-slate-700">{selectedAsset.name}</div>
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        {selectedAsset.file_size ? `${(selectedAsset.file_size / (1024 * 1024)).toFixed(1)} MB` : '2.4 MB'}
                                                        {selectedAsset.file_type && ` • ${selectedAsset.file_type.toUpperCase()}`}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-3xl mx-auto mb-4">
                                                    {getAssetIcon(selectedAsset.type)}
                                                </div>
                                                <div className="text-sm font-medium text-slate-700">{selectedAsset.name}</div>
                                                <div className="text-xs text-slate-500 mt-1">No preview available</div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Version History */}
                                    <div className="border-t border-slate-200 p-6">
                                        <h4 className="text-sm font-semibold text-slate-900 mb-3">Version History</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-600">Current</span>
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                                    {selectedAsset.version_number || 'v1.2'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metadata */}
                                    <div className="border-t border-slate-200 p-6">
                                        <h4 className="text-sm font-semibold text-slate-900 mb-3">Metadata</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Asset ID</span>
                                                <span className="text-slate-900 font-medium">{selectedAsset.id}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Type</span>
                                                <span className="text-slate-900 font-medium">{selectedAsset.type || 'Blog Banner'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Content Type</span>
                                                <span className="text-slate-900 font-medium">{selectedAsset.asset_category || 'Article'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Dimensions</span>
                                                <span className="text-slate-900 font-medium">1920x1080</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Size</span>
                                                <span className="text-slate-900 font-medium">
                                                    {selectedAsset.file_size ? `${(selectedAsset.file_size / (1024 * 1024)).toFixed(1)} MB` : '2.4 MB'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Format</span>
                                                <span className="text-slate-900 font-medium">
                                                    {selectedAsset.asset_format?.toUpperCase() || selectedAsset.file_type?.toUpperCase() || 'JPEG'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Version</span>
                                                <span className="text-slate-900 font-medium">{selectedAsset.version_number || 'v1.2'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Created By</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                        EW
                                                    </div>
                                                    <span className="text-slate-900 font-medium">Emily Watson</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Updated By</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                        JS
                                                    </div>
                                                    <span className="text-slate-900 font-medium">John Smith</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Asset Details */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* Asset Information Panel */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
                                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Asset Information
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Asset ID</label>
                                                <span className="text-slate-900 font-medium">{selectedAsset.id}</span>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Type</label>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{getAssetIcon(selectedAsset.type)}</span>
                                                    <span className="text-slate-900 font-medium">{selectedAsset.type || 'Blog Banner'}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Content Type</label>
                                                <span className="text-slate-900">{selectedAsset.asset_category || 'Article'}</span>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Dimensions</label>
                                                <span className="text-slate-900">1920x1080</span>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Size</label>
                                                <span className="text-slate-900">
                                                    {selectedAsset.file_size ? `${(selectedAsset.file_size / (1024 * 1024)).toFixed(1)} MB` : '2.4 MB'}
                                                </span>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Format</label>
                                                <span className="text-slate-900">{selectedAsset.asset_format?.toUpperCase() || selectedAsset.file_type?.toUpperCase() || 'JPEG'}</span>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Version</label>
                                                <span className="text-slate-900">{selectedAsset.version_number || 'v1.2'}</span>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Created By</label>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                        EW
                                                    </div>
                                                    <span className="text-slate-900">Emily Watson</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Updated By</label>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                        JS
                                                    </div>
                                                    <span className="text-slate-900">John Smith</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mapping & Links */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-slate-200">
                                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                            Mapping & Links
                                        </h3>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Linked Task</label>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                <span className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">Write blog post on AI trends</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Linked Campaign</label>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                                <span className="text-slate-900 font-medium">Content</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Linked Project</label>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                <span className="text-slate-900 font-medium">Q4 Marketing Campaign</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Linked Service</label>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                                </svg>
                                                <span className="text-slate-900 font-medium">Digital Marketing</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Linked Sub-Service</label>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="text-slate-900 font-medium">Content Marketing</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Linked Repository</label>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                                                </svg>
                                                <span className="text-slate-900 font-medium">{selectedAsset.repository || 'Content Repository'}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-3">Keywords Tagged</label>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedAsset.keywords && selectedAsset.keywords.length > 0 ? (
                                                    selectedAsset.keywords.map((keyword, index) => (
                                                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                                            {keyword}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <>
                                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">AI</span>
                                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Technology</span>
                                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Blog</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* QC Panel */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-slate-200">
                                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            QC Panel
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                            <div className="text-center">
                                                <div className="relative inline-flex items-center justify-center">
                                                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                                                        <path
                                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                            fill="none"
                                                            stroke="#e5e7eb"
                                                            strokeWidth="3"
                                                        />
                                                        <path
                                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                            fill="none"
                                                            stroke="#10b981"
                                                            strokeWidth="3"
                                                            strokeDasharray={`${(selectedAsset.qc_score || 96)}, 100`}
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="text-center">
                                                            <div className="text-2xl font-bold text-green-600">
                                                                {selectedAsset.qc_score || 96}
                                                            </div>
                                                            <div className="text-xs text-slate-500">/ 100</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-sm font-medium text-slate-700 mt-2">QC Score</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="w-20 h-20 mx-auto mb-2 flex items-center justify-center">
                                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${selectedAsset.status === 'QC Approved' ? 'bg-green-100' :
                                                        selectedAsset.status === 'QC Rejected' ? 'bg-red-100' : 'bg-green-100'
                                                        }`}>
                                                        {selectedAsset.status === 'QC Approved' || selectedAsset.status !== 'QC Rejected' ? (
                                                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={`text-lg font-bold mb-1 ${selectedAsset.status === 'QC Approved' ? 'text-green-600' :
                                                    selectedAsset.status === 'QC Rejected' ? 'text-red-600' : 'text-green-600'
                                                    }`}>
                                                    {selectedAsset.status === 'QC Approved' ? 'Pass' : selectedAsset.status === 'QC Rejected' ? 'Fail' : 'Pass'}
                                                </div>
                                                <div className="text-sm font-medium text-slate-700">Status</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="w-20 h-20 mx-auto mb-2 flex items-center justify-center">
                                                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                                                        SJ
                                                    </div>
                                                </div>
                                                <div className="text-sm font-medium text-slate-900 mb-1">Sarah Johnson</div>
                                                <div className="text-sm font-medium text-slate-700">Reviewer</div>
                                            </div>
                                        </div>

                                        <div className="mb-6 text-center">
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">QC Date</label>
                                            <span className="text-slate-900 font-medium">
                                                {selectedAsset.qc_reviewed_at ? new Date(selectedAsset.qc_reviewed_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }) : 'December 2, 2025'}
                                            </span>
                                        </div>

                                        {/* QC Checklist & Scoring */}
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-slate-900 text-lg">QC Checklist & Scoring</h4>

                                            <div className="space-y-3">
                                                <div className="flex justify-between items-start p-4 bg-green-50 rounded-lg border border-green-200">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            <div className="font-semibold text-slate-900">Image Resolution & Quality</div>
                                                        </div>
                                                        <div className="text-sm text-slate-600 ml-7">Perfect 1920x1080 resolution, crisp and clear</div>
                                                    </div>
                                                    <div className="text-right ml-4">
                                                        <div className="font-bold text-green-600 text-lg">20/20</div>
                                                        <div className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded">Pass</div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-start p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                                                            </svg>
                                                            <div className="font-semibold text-slate-900">Brand Guidelines Compliance</div>
                                                        </div>
                                                        <div className="text-sm text-slate-600 ml-7">Colors match brand palette, minor typography adjustment needed</div>
                                                    </div>
                                                    <div className="text-right ml-4">
                                                        <div className="font-bold text-yellow-600 text-lg">18/20</div>
                                                        <div className="text-xs text-yellow-600 font-medium bg-yellow-100 px-2 py-1 rounded">Pass</div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-start p-4 bg-green-50 rounded-lg border border-green-200">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            <div className="font-semibold text-slate-900">Text Readability</div>
                                                        </div>
                                                        <div className="text-sm text-slate-600 ml-7">Excellent contrast and font sizing</div>
                                                    </div>
                                                    <div className="text-right ml-4">
                                                        <div className="font-bold text-green-600 text-lg">20/20</div>
                                                        <div className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded">Pass</div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-start p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                                                            </svg>
                                                            <div className="font-semibold text-slate-900">File Optimization</div>
                                                        </div>
                                                        <div className="text-sm text-slate-600 ml-7">Good compression, could be optimized further by 200KB</div>
                                                    </div>
                                                    <div className="text-right ml-4">
                                                        <div className="font-bold text-yellow-600 text-lg">18/20</div>
                                                        <div className="text-xs text-yellow-600 font-medium bg-yellow-100 px-2 py-1 rounded">Pass</div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-start p-4 bg-green-50 rounded-lg border border-green-200">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            <div className="font-semibold text-slate-900">Mobile Responsiveness Check</div>
                                                        </div>
                                                        <div className="text-sm text-slate-600 ml-7">Scales perfectly on mobile devices</div>
                                                    </div>
                                                    <div className="text-right ml-4">
                                                        <div className="font-bold text-green-600 text-lg">20/20</div>
                                                        <div className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded">Pass</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Usage Panel */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-slate-200">
                                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            Usage Panel
                                        </h3>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                                                </svg>
                                                Website URLs
                                            </label>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <div className="text-blue-600 hover:text-blue-700 cursor-pointer text-sm font-medium">
                                                                {selectedAsset.web_url || 'https://example.com/blog/ai-trends-2025'}
                                                            </div>
                                                            <div className="text-xs text-slate-500">Primary URL</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => window.open(selectedAsset.web_url || 'https://example.com/blog/ai-trends-2025', '_blank')}
                                                        className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <div className="text-green-600 hover:text-green-700 cursor-pointer text-sm font-medium">
                                                                https://example.com/resources/ai-guide
                                                            </div>
                                                            <div className="text-xs text-slate-500">Resource Guide</div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => window.open('https://example.com/resources/ai-guide', '_blank')}
                                                        className="text-green-600 hover:text-green-700 p-2 hover:bg-green-100 rounded-lg transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                                </svg>
                                                Social Media Posts
                                            </label>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                                            <span className="text-white text-xs font-bold">in</span>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-slate-900">LinkedIn</div>
                                                            <div className="text-xs text-slate-500">Professional Network</div>
                                                        </div>
                                                    </div>
                                                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View Post
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-sky-50 to-sky-100 rounded-lg border border-sky-200">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                                                            <span className="text-white text-xs font-bold">𝕏</span>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-slate-900">Twitter</div>
                                                            <div className="text-xs text-slate-500">Microblogging Platform</div>
                                                        </div>
                                                    </div>
                                                    <button className="bg-sky-500 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-sky-600 transition-colors flex items-center gap-2">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View Post
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                </svg>
                                                Backlink Submissions
                                            </label>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-slate-900">techblog.com</div>
                                                            <div className="text-xs text-slate-500">Technology Blog</div>
                                                        </div>
                                                    </div>
                                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Approved
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-slate-900">innovation.net</div>
                                                            <div className="text-xs text-slate-500">Innovation Network</div>
                                                        </div>
                                                    </div>
                                                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Pending
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                                Engagement Metrics
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </div>
                                                    <div className="text-2xl font-bold text-blue-600">45,200</div>
                                                    <div className="text-xs text-slate-600 font-medium">Impressions</div>
                                                </div>
                                                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                                                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                                        </svg>
                                                    </div>
                                                    <div className="text-2xl font-bold text-purple-600">3,800</div>
                                                    <div className="text-xs text-slate-600 font-medium">Clicks</div>
                                                </div>
                                                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                                                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                        </svg>
                                                    </div>
                                                    <div className="text-2xl font-bold text-green-600">8.4%</div>
                                                    <div className="text-xs text-slate-600 font-medium">CTR</div>
                                                </div>
                                                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                                                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                                        </svg>
                                                    </div>
                                                    <div className="text-2xl font-bold text-orange-600">420</div>
                                                    <div className="text-xs text-slate-600 font-medium">Shares</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                                                        Performance Summary
                                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Excellent</span>
                                                    </h4>
                                                    <p className="text-sm text-green-800 leading-relaxed">
                                                        High engagement with <span className="font-semibold">8.4% CTR</span>, performing <span className="font-semibold">24% above</span> campaign average.
                                                        Strong social media presence with consistent backlink approvals driving quality traffic.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-slate-200">
                                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                            </svg>
                                            Quick Actions
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <button
                                                onClick={() => {
                                                    if (onNavigate) {
                                                        onNavigate('tasks', selectedAsset.id);
                                                    }
                                                }}
                                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl font-medium shadow-sm hover:shadow-lg transition-all flex items-center gap-3 group"
                                            >
                                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 011-1h2a2 2 0 011 1v2m-4 0a2 2 0 01-2-2m0 0V4a2 2 0 012-2h2a2 2 0 012 2v2" />
                                                    </svg>
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-semibold">Open in Task</div>
                                                    <div className="text-xs opacity-90">View linked tasks</div>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => handleEdit({ stopPropagation: () => { } } as any, selectedAsset)}
                                                className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-6 py-4 rounded-xl font-medium shadow-sm hover:shadow-lg transition-all flex items-center gap-3 group"
                                            >
                                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-semibold">Edit Asset</div>
                                                    <div className="text-xs opacity-90">Modify details</div>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => {
                                                    const url = selectedAsset.file_url || selectedAsset.thumbnail_url;
                                                    if (url) {
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.download = selectedAsset.name || 'asset';
                                                        link.click();
                                                    }
                                                }}
                                                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl font-medium shadow-sm hover:shadow-lg transition-all flex items-center gap-3 group"
                                            >
                                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-semibold">Download</div>
                                                    <div className="text-xs opacity-90">Save locally</div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <>
                    <div className="h-full flex flex-col w-full overflow-hidden">
                        {/* Enhanced Header Section */}
                        <div className="bg-gradient-to-r from-slate-50 via-white to-indigo-50 border-b border-slate-200 shadow-sm">
                            <div className="max-w-7xl mx-auto px-6 py-6">
                                {/* Title Row */}
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl shadow-lg">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Assets</h1>
                                            <p className="text-slate-600 text-sm mt-1 flex items-center gap-2">
                                                {qcMode ? (
                                                    <>
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            QC Review Mode
                                                        </span>
                                                        Review assets for quality control
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                                            </svg>
                                                            Management Mode
                                                        </span>
                                                        Manage and organize all your marketing assets
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Primary Actions */}
                                    <div className="flex items-center gap-3">
                                        {/* Refresh Button */}
                                        <button
                                            onClick={async () => {
                                                setIsRefreshing(true);
                                                try {
                                                    await refresh?.();
                                                    setTimeout(() => setIsRefreshing(false), 800);
                                                } catch (error) {
                                                    console.error('Refresh failed:', error);
                                                    setIsRefreshing(false);
                                                }
                                            }}
                                            disabled={isRefreshing}
                                            className={`bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 hover:shadow-md transition-all flex items-center gap-2 ${isRefreshing ? 'opacity-75 cursor-not-allowed' : ''}`}
                                            title="Refresh Assets Data"
                                        >
                                            {isRefreshing ? (
                                                <>
                                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Refreshing...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    Refresh
                                                </>
                                            )}
                                        </button>

                                        {/* Upload Asset Button */}
                                        <button
                                            onClick={() => setShowUploadModal(true)}
                                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:shadow-md transition-all flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Upload Asset
                                        </button>
                                    </div>
                                </div>

                                {/* Control Bar */}
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    {/* Left Side - View Controls */}
                                    <div className="flex items-center gap-3">
                                        {/* View Mode Toggle */}
                                        <div className="bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                                            <button
                                                onClick={() => setDisplayMode('table')}
                                                className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${displayMode === 'table'
                                                    ? 'bg-indigo-600 text-white shadow-sm'
                                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                                    }`}
                                                title="List View"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                                </svg>
                                                List
                                            </button>
                                            <button
                                                onClick={() => setDisplayMode('grid')}
                                                className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${displayMode === 'grid'
                                                    ? 'bg-indigo-600 text-white shadow-sm'
                                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                                    }`}
                                                title="Grid View"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                </svg>
                                                Large
                                            </button>
                                        </div>

                                        {/* Mode Toggle */}
                                        <div className="bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                                            <button
                                                onClick={() => setQcMode(false)}
                                                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${!qcMode
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                                    }`}
                                            >
                                                User Mode
                                            </button>
                                            <button
                                                onClick={() => setQcMode(true)}
                                                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${qcMode
                                                    ? 'bg-purple-600 text-white shadow-sm'
                                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                                    }`}
                                            >
                                                QC Mode
                                            </button>
                                        </div>

                                        {/* My Submissions Button */}
                                        <button
                                            onClick={() => setViewMode('mysubmissions')}
                                            className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 hover:shadow-md transition-all flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            My Submissions
                                        </button>
                                    </div>

                                    {/* Right Side - Quick Actions */}
                                    <div className="flex items-center gap-3">
                                        {/* Quick Upload Toolbar */}
                                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                                            <span className="text-xs font-medium text-slate-600">Quick Upload:</span>
                                            <button
                                                onClick={() => {
                                                    setNewAsset(prev => ({ ...prev, application_type: 'web' }));
                                                    setShowUploadModal(true);
                                                }}
                                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                                                title="Upload Web Content"
                                            >
                                                🌐 Web
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setNewAsset(prev => ({ ...prev, application_type: 'seo' }));
                                                    setShowUploadModal(true);
                                                }}
                                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                                                title="Upload SEO Content"
                                            >
                                                🔍 SEO
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setNewAsset(prev => ({ ...prev, application_type: 'smm' }));
                                                    setShowUploadModal(true);
                                                }}
                                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
                                                title="Upload Social Media Content"
                                            >
                                                📱 SMM
                                            </button>
                                        </div>

                                        {/* Quick Update Toolbar */}
                                        <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg px-3 py-2 shadow-sm">
                                            <span className="text-xs font-medium text-orange-700">Quick Update:</span>
                                            <button
                                                onClick={() => {
                                                    const recentAsset = assets.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                                                    if (recentAsset) {
                                                        handleEdit({ stopPropagation: () => { } } as any, recentAsset);
                                                    } else {
                                                        alert('No assets available to update');
                                                    }
                                                }}
                                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-md transition-colors"
                                                title="Update Most Recent Asset"
                                            >
                                                🔄 Recent
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const pendingAssets = assets.filter(a => a.status === 'Draft' || a.status === 'QC Rejected');
                                                    if (pendingAssets.length > 0) {
                                                        handleEdit({ stopPropagation: () => { } } as any, pendingAssets[0]);
                                                    } else {
                                                        alert('No assets pending updates');
                                                    }
                                                }}
                                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-md transition-colors"
                                                title="Update Pending Assets"
                                            >
                                                ⏳ Pending
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const assetName = prompt('Enter asset name or ID to update:');
                                                    if (assetName) {
                                                        const asset = assets.find(a =>
                                                            a.name.toLowerCase().includes(assetName.toLowerCase()) ||
                                                            a.id.toString() === assetName
                                                        );
                                                        if (asset) {
                                                            handleEdit({ stopPropagation: () => { } } as any, asset);
                                                        } else {
                                                            alert('Asset not found');
                                                        }
                                                    }
                                                }}
                                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-md transition-colors"
                                                title="Search & Update Asset"
                                            >
                                                🔍 Search
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-6 overflow-hidden">
                            {/* Search Bar */}
                            <div className="relative mb-6">
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder={qcMode ? "Search assets pending QC review..." : "Search assets by name, type, repository, or status..."}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all shadow-sm"
                                />
                            </div>

                            {/* Filters Section */}
                            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-6">
                                <div className="flex flex-wrap gap-4 items-center">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                        </svg>
                                        <span className="text-sm font-medium text-slate-700">Filters:</span>
                                    </div>

                                    <select
                                        value={repositoryFilter}
                                        onChange={(e) => setRepositoryFilter(e.target.value)}
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white min-w-[150px]"
                                    >
                                        {repositories.map(repo => (
                                            <option key={repo} value={repo}>
                                                {repo === 'All' ? '📁 All Repositories' : `📁 ${repo}`}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white min-w-[120px]"
                                    >
                                        {assetTypes.map(type => (
                                            <option key={type} value={type}>
                                                {type === 'All' ? '🏷️ All Types' : `🏷️ ${type}`}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        value={contentTypeFilter}
                                        onChange={(e) => setContentTypeFilter(e.target.value)}
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white min-w-[140px]"
                                    >
                                        <option value="All">📋 All Content</option>
                                        <option value="web">🌐 Web Content</option>
                                        <option value="seo">🔍 SEO Content</option>
                                        <option value="smm">📱 Social Media</option>
                                    </select>

                                    {/* Clear Filters Button */}
                                    <button
                                        onClick={() => {
                                            setRepositoryFilter('All');
                                            setTypeFilter('All');
                                            setContentTypeFilter('All');
                                            setSearchQuery('');
                                        }}
                                        className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Clear All
                                    </button>
                                </div>
                            </div>

                            {/* Refresh Button */}
                            <button
                                onClick={async () => {
                                    setIsRefreshing(true);
                                    try {
                                        await refresh?.();
                                    } finally {
                                        setIsRefreshing(false);
                                    }
                                }}
                                disabled={isRefreshing}
                                className={`bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 hover:shadow-md transition-all flex items-center gap-2 ${isRefreshing ? 'opacity-75 cursor-not-allowed' : ''}`}
                                title="Refresh Assets Data"
                            >
                                {isRefreshing ? (
                                    <>
                                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Refreshing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Refresh
                                    </>
                                )}
                            </button>

                            {/* Enhanced Upload Button with Content Type Selection */}
                            <div className="relative group">
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Upload Asset
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Quick Content Type Dropdown */}
                                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="p-4">
                                        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            Quick Upload by Content Type
                                        </h3>

                                        <div className="space-y-2">
                                            {/* WEB Content */}
                                            <button
                                                onClick={() => {
                                                    setNewAsset(prev => ({ ...prev, application_type: 'web' }));
                                                    setShowUploadModal(true);
                                                }}
                                                className="w-full p-3 text-left rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group/item"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s1.343-9 3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-slate-900 text-sm">🌐 Web Content</div>
                                                        <div className="text-xs text-slate-600">Landing pages, web articles, blog posts</div>
                                                    </div>
                                                    <svg className="w-4 h-4 text-slate-400 group-hover/item:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </button>

                                            {/* SEO Content */}
                                            <button
                                                onClick={() => {
                                                    setNewAsset(prev => ({ ...prev, application_type: 'seo' }));
                                                    setShowUploadModal(true);
                                                }}
                                                className="w-full p-3 text-left rounded-lg border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all group/item"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-slate-900 text-sm">🔍 SEO Content</div>
                                                        <div className="text-xs text-slate-600">Search optimized content, meta descriptions</div>
                                                    </div>
                                                    <svg className="w-4 h-4 text-slate-400 group-hover/item:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </button>

                                            {/* SMM Content */}
                                            <button
                                                onClick={() => {
                                                    setNewAsset(prev => ({ ...prev, application_type: 'smm' }));
                                                    setShowUploadModal(true);
                                                }}
                                                className="w-full p-3 text-left rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all group/item"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-slate-900 text-sm">📱 Social Media</div>
                                                        <div className="text-xs text-slate-600">Posts, stories, videos for social platforms</div>
                                                    </div>
                                                    <svg className="w-4 h-4 text-slate-400 group-hover/item:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </button>

                                            {/* General Upload */}
                                            <div className="border-t border-slate-200 pt-2 mt-3">
                                                <button
                                                    onClick={() => {
                                                        setNewAsset(prev => ({ ...prev, application_type: undefined }));
                                                        setShowUploadModal(true);
                                                    }}
                                                    className="w-full p-3 text-left rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all group/item"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-r from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
                                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-semibold text-slate-900 text-sm">📁 General Upload</div>
                                                            <div className="text-xs text-slate-600">Choose content type during upload</div>
                                                        </div>
                                                        <svg className="w-4 h-4 text-slate-400 group-hover/item:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* View Mode Toggle */}
                            <div className="bg-slate-100 p-1 rounded-lg flex">
                                <button
                                    onClick={() => setDisplayMode('table')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${displayMode === 'table'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    title="List View"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                    List
                                </button>
                                <button
                                    onClick={() => setDisplayMode('grid')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${displayMode === 'grid'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    title="Large View"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                    Large
                                </button>
                            </div>

                            {/* Mode Toggle */}
                            <div className="bg-slate-100 p-1 rounded-lg flex">
                                <button
                                    onClick={() => setQcMode(false)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${!qcMode
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    User Mode
                                </button>
                                <button
                                    onClick={() => setQcMode(true)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${qcMode
                                        ? 'bg-white text-purple-600 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    QC Mode
                                </button>
                            </div>

                            {/* My Submissions Button */}
                            <button
                                onClick={() => setViewMode('mysubmissions')}
                                className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                My Submissions
                            </button>

                            {/* Quick Upload Toolbar */}
                            <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-2 shadow-sm">
                                <span className="text-xs font-medium text-slate-600 px-2">Quick Upload:</span>

                                <button
                                    onClick={() => {
                                        setNewAsset(prev => ({ ...prev, application_type: 'web' }));
                                        setShowUploadModal(true);
                                    }}
                                    className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                    title="Upload Web Content"
                                >
                                    🌐 Web
                                </button>

                                <button
                                    onClick={() => {
                                        setNewAsset(prev => ({ ...prev, application_type: 'seo' }));
                                        setShowUploadModal(true);
                                    }}
                                    className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                    title="Upload SEO Content"
                                >
                                    🔍 SEO
                                </button>

                                <button
                                    onClick={() => {
                                        setNewAsset(prev => ({ ...prev, application_type: 'smm' }));
                                        setShowUploadModal(true);
                                    }}
                                    className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                                    title="Upload Social Media Content"
                                >
                                    📱 SMM
                                </button>
                            </div>

                            {/* Quick Update Toolbar */}
                            <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 p-2 shadow-sm">
                                <span className="text-xs font-medium text-orange-700 px-2">Quick Update:</span>

                                <button
                                    onClick={() => {
                                        // Find the most recent asset to update
                                        const recentAsset = assets.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                                        if (recentAsset) {
                                            handleEdit({ stopPropagation: () => { } } as any, recentAsset);
                                        } else {
                                            alert('No assets available to update');
                                        }
                                    }}
                                    className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors"
                                    title="Update Most Recent Asset"
                                >
                                    🔄 Recent
                                </button>

                                <button
                                    onClick={() => {
                                        // Find assets pending updates (drafts or rejected)
                                        const pendingAssets = assets.filter(a => a.status === 'Draft' || a.status === 'QC Rejected');
                                        if (pendingAssets.length > 0) {
                                            handleEdit({ stopPropagation: () => { } } as any, pendingAssets[0]);
                                        } else {
                                            alert('No assets pending updates');
                                        }
                                    }}
                                    className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors"
                                    title="Update Pending Assets"
                                >
                                    ⏳ Pending
                                </button>

                                <button
                                    onClick={() => {
                                        // Show a modal or dropdown to select asset to update
                                        const assetName = prompt('Enter asset name or ID to update:');
                                        if (assetName) {
                                            const asset = assets.find(a =>
                                                a.name.toLowerCase().includes(assetName.toLowerCase()) ||
                                                a.id.toString() === assetName
                                            );
                                            if (asset) {
                                                handleEdit({ stopPropagation: () => { } } as any, asset);
                                            } else {
                                                alert('Asset not found');
                                            }
                                        }
                                    }}
                                    className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors"
                                    title="Search & Update Asset"
                                >
                                    🔍 Search
                                </button>
                            </div>
                        </div>
                    </div>



                    <div className="mb-6 space-y-4">
                        {/* Enhanced Filters */}
                        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                            <div className="flex flex-wrap gap-4 items-center">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    <span className="text-sm font-medium text-slate-700">Filters:</span>
                                </div>

                                <select
                                    value={repositoryFilter}
                                    onChange={(e) => setRepositoryFilter(e.target.value)}
                                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white min-w-[150px]"
                                >
                                    {repositories.map(repo => (
                                        <option key={repo} value={repo}>
                                            {repo === 'All' ? '📁 All Repositories' : `📁 ${repo}`}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white min-w-[120px]"
                                >
                                    {assetTypes.map(type => (
                                        <option key={type} value={type}>
                                            {type === 'All' ? '🏷️ All Types' : `🏷️ ${type}`}
                                        </option>
                                    ))}
                                </select>

                                {/* Content Type Filter */}
                                <select
                                    value={contentTypeFilter}
                                    onChange={(e) => setContentTypeFilter(e.target.value)}
                                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white min-w-[140px]"
                                >
                                    <option value="All">📋 All Content</option>
                                    <option value="web">🌐 Web Content</option>
                                    <option value="seo">🔍 SEO Content</option>
                                    <option value="smm">📱 Social Media</option>
                                </select>

                                {/* Clear Filters Button */}
                                {(repositoryFilter !== 'All' || typeFilter !== 'All' || contentTypeFilter !== 'All' || searchQuery) && (
                                    <button
                                        onClick={() => {
                                            setRepositoryFilter('All');
                                            setTypeFilter('All');
                                            setContentTypeFilter('All');
                                            setSearchQuery('');
                                        }}
                                        className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Results Summary */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <p className="text-sm text-slate-600">
                                    {qcMode ? (
                                        <>
                                            Showing <span className="font-bold text-purple-600">{filteredAssets.length}</span> assets pending QC review
                                        </>
                                    ) : (
                                        <>
                                            Showing <span className="font-bold text-indigo-600">{filteredAssets.length}</span> assets
                                            {(repositoryFilter !== 'All' || typeFilter !== 'All' || contentTypeFilter !== 'All' || searchQuery) && (
                                                <span className="text-slate-500"> (filtered from {assets.length} total)</span>
                                            )}
                                        </>
                                    )}
                                </p>

                                {/* Content Type Indicators */}
                                {!qcMode && assets.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500">Content Types:</span>
                                        <div className="flex gap-1">
                                            {(() => {
                                                const webCount = assets.filter(a => a.application_type === 'web').length;
                                                const seoCount = assets.filter(a => a.application_type === 'seo').length;
                                                const smmCount = assets.filter(a => a.application_type === 'smm').length;

                                                return (
                                                    <>
                                                        {webCount > 0 && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                                                                🌐 {webCount}
                                                            </span>
                                                        )}
                                                        {seoCount > 0 && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                                                                🔍 {seoCount}
                                                            </span>
                                                        )}
                                                        {smmCount > 0 && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                                                                📱 {smmCount}
                                                            </span>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                )}

                                {/* Last Updated Indicator */}
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Updated {new Date().toLocaleTimeString()}</span>
                                </div>
                            </div>

                            {/* Sort Options */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500">Sort by:</span>
                                <select className="px-3 py-1 border border-slate-300 rounded-lg text-sm bg-white">
                                    <option>Date (Newest)</option>
                                    <option>Date (Oldest)</option>
                                    <option>Name (A-Z)</option>
                                    <option>Name (Z-A)</option>
                                    <option>Status</option>
                                    <option>Type</option>
                                </select>
                            </div>
                        </div>

                        {/* Display Content Based on View Mode */}
                        <div className="flex-1 overflow-hidden">
                            {displayMode === 'table' ? (
                                <Table
                                    columns={columns}
                                    data={filteredAssets}
                                    title=""
                                    emptyMessage={qcMode ? "No assets pending QC review." : "No assets yet. Click 'Upload Asset' to add your first file!"}
                                    onRowClick={handleRowClick}
                                />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredAssets.length === 0 ? (
                                        <div className="col-span-full text-center py-12">
                                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                            </div>
                                            <p className="text-slate-500 text-lg font-medium mb-4">
                                                {qcMode ? "No assets pending QC review." : "No assets yet."}
                                            </p>
                                            {!qcMode && (
                                                <div className="space-y-4">
                                                    <p className="text-slate-400 text-sm">
                                                        Get started by uploading your first asset
                                                    </p>

                                                    {/* Quick Upload Options */}
                                                    <div className="flex flex-wrap justify-center gap-3 max-w-md mx-auto">
                                                        <button
                                                            onClick={() => {
                                                                setNewAsset(prev => ({ ...prev, application_type: 'web' }));
                                                                setShowUploadModal(true);
                                                            }}
                                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                                        >
                                                            🌐 Web Content
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setNewAsset(prev => ({ ...prev, application_type: 'seo' }));
                                                                setShowUploadModal(true);
                                                            }}
                                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                                                        >
                                                            🔍 SEO Content
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setNewAsset(prev => ({ ...prev, application_type: 'smm' }));
                                                                setShowUploadModal(true);
                                                            }}
                                                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                                                        >
                                                            📱 Social Media
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        filteredAssets.map((asset) => (
                                            <div
                                                key={asset.id}
                                                onClick={() => handleRowClick(asset)}
                                                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group"
                                            >
                                                {/* Asset Preview */}
                                                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                                    {asset.thumbnail_url ? (
                                                        <img
                                                            src={asset.thumbnail_url}
                                                            alt={asset.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                                                            <span className="text-4xl text-white">
                                                                {getAssetIcon(asset.type)}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Status Badge */}
                                                    <div className="absolute top-3 left-3">
                                                        {getStatusBadge(asset.status || 'Draft')}
                                                    </div>

                                                    {/* Enhanced Actions Overlay */}
                                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                        {(asset.file_url || asset.thumbnail_url) && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const url = asset.file_url || asset.thumbnail_url;
                                                                    if (url) {
                                                                        if (url.startsWith('data:')) {
                                                                            const win = window.open();
                                                                            if (win) {
                                                                                win.document.write(`<img src="${url}" style="max-width:100%; height:auto;" />`);
                                                                            }
                                                                        } else {
                                                                            window.open(url, '_blank', 'noopener,noreferrer');
                                                                        }
                                                                    }
                                                                }}
                                                                className="p-2 bg-white/90 backdrop-blur-sm text-blue-600 hover:bg-white rounded-lg shadow-sm transition-all"
                                                                title="View Asset"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </button>
                                                        )}

                                                        {/* Update Asset Button - More Prominent */}
                                                        {(asset.status === 'Draft' || asset.status === 'QC Rejected' || asset.submitted_by === currentUser.id) && (
                                                            <button
                                                                onClick={(e) => handleEdit(e, asset)}
                                                                className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 rounded-lg shadow-md hover:shadow-lg transition-all"
                                                                title="Update Asset"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Quick Update Badge */}
                                                    {(asset.status === 'Draft' || asset.status === 'QC Rejected') && (
                                                        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                                </svg>
                                                                Update Ready
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Asset Info */}
                                                <div className="p-4 space-y-3">
                                                    {/* Asset Name & ID */}
                                                    <div className="flex items-start justify-between">
                                                        <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 flex-1">
                                                            {asset.name}
                                                        </h3>
                                                        <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                                                            ID: {asset.id}
                                                        </span>
                                                    </div>

                                                    {/* Campaign/Project Name */}
                                                    {asset.web_title && (
                                                        <div className="text-sm text-slate-700 font-medium">
                                                            {asset.web_title}
                                                        </div>
                                                    )}

                                                    {/* Service Linking */}
                                                    <div className="space-y-1">
                                                        {asset.linked_service_ids && asset.linked_service_ids.length > 0 && (
                                                            <div className="text-xs">
                                                                <span className="text-slate-500 uppercase tracking-wide font-medium">Linked Service</span>
                                                                <div className="text-slate-700 font-medium">
                                                                    {asset.linked_service_ids.map(serviceId => {
                                                                        const service = services.find(s => s.id === serviceId);
                                                                        return service?.service_name;
                                                                    }).filter(Boolean).join(', ')}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {asset.linked_sub_service_ids && asset.linked_sub_service_ids.length > 0 && (
                                                            <div className="text-xs">
                                                                <span className="text-slate-500 uppercase tracking-wide font-medium">Linked Sub-Service</span>
                                                                <div className="text-slate-700 font-medium">
                                                                    {asset.linked_sub_service_ids.map(ssId => {
                                                                        const subService = subServices.find(ss => ss.id === ssId);
                                                                        return subService?.sub_service_name;
                                                                    }).filter(Boolean).join(', ')}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {asset.repository && (
                                                            <div className="text-xs">
                                                                <span className="text-slate-500 uppercase tracking-wide font-medium">Linked Repository</span>
                                                                <div className="text-slate-700 font-medium">{asset.repository}</div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Keywords */}
                                                    {asset.keywords && asset.keywords.length > 0 && (
                                                        <div className="text-xs">
                                                            <span className="text-slate-500 uppercase tracking-wide font-medium">Keywords Tagged</span>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {asset.keywords.slice(0, 3).map((keyword, index) => (
                                                                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                                                                        {keyword}
                                                                    </span>
                                                                ))}
                                                                {asset.keywords.length > 3 && (
                                                                    <span className="text-xs text-slate-500">+{asset.keywords.length - 3} more</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* QC Panel */}
                                                    {asset.qc_score && (
                                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">QC Panel</span>
                                                                <div className="flex items-center gap-2">
                                                                    <CircularScore
                                                                        score={asset.qc_score}
                                                                        label=""
                                                                        size="xs"
                                                                    />
                                                                    <span className="text-xs font-bold text-slate-700">
                                                                        {asset.qc_score}/100
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                                <div>
                                                                    <span className="text-slate-500 uppercase tracking-wide font-medium">Status</span>
                                                                    <div className={`font-medium ${asset.qc_score >= 80 ? 'text-green-600' : asset.qc_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                                        {asset.qc_score >= 80 ? '✓ Pass' : asset.qc_score >= 60 ? '⚠ Review' : '✗ Fail'}
                                                                    </div>
                                                                </div>

                                                                {asset.qc_reviewed_at && (
                                                                    <div>
                                                                        <span className="text-slate-500 uppercase tracking-wide font-medium">QC Date</span>
                                                                        <div className="text-slate-700 font-medium">
                                                                            {new Date(asset.qc_reviewed_at).toLocaleDateString('en-US', {
                                                                                year: 'numeric',
                                                                                month: '2-digit',
                                                                                day: '2-digit'
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Reviewer Info */}
                                                            {asset.qc_reviewer_id && (
                                                                <div className="mt-2 text-xs">
                                                                    <span className="text-slate-500 uppercase tracking-wide font-medium">Reviewer</span>
                                                                    <div className="text-slate-700 font-medium">
                                                                        {(() => {
                                                                            const reviewer = users.find(u => u.id === asset.qc_reviewer_id);
                                                                            return reviewer ? reviewer.name : 'Unknown Reviewer';
                                                                        })()}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Type and Repository Tags */}
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-indigo-700 bg-indigo-100">
                                                            <span>{getAssetIcon(asset.type)}</span>
                                                            {asset.type}
                                                        </span>
                                                        {asset.application_type && (
                                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${asset.application_type === 'web' ? 'bg-blue-100 text-blue-700' :
                                                                asset.application_type === 'seo' ? 'bg-green-100 text-green-700' :
                                                                    asset.application_type === 'smm' ? 'bg-purple-100 text-purple-700' :
                                                                        'bg-slate-100 text-slate-700'
                                                                }`}>
                                                                {asset.application_type === 'web' && '🌐 WEB'}
                                                                {asset.application_type === 'seo' && '🔍 SEO'}
                                                                {asset.application_type === 'smm' && '📱 SMM'}
                                                                {!['web', 'seo', 'smm'].includes(asset.application_type) && asset.application_type.toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* AI Scores */}
                                                    {(asset.seo_score || asset.grammar_score) && (
                                                        <div className="flex gap-2">
                                                            {asset.seo_score && (
                                                                <CircularScore
                                                                    score={asset.seo_score}
                                                                    label="SEO"
                                                                    size="xs"
                                                                />
                                                            )}
                                                            {asset.grammar_score && (
                                                                <CircularScore
                                                                    score={asset.grammar_score}
                                                                    label="Grammar"
                                                                    size="xs"
                                                                />
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Usage Panel */}
                                                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                                                        <div className="text-xs">
                                                            <span className="text-slate-500 uppercase tracking-wide font-medium">Usage Panel</span>
                                                            <div className="flex items-center justify-between mt-1">
                                                                <span className="text-slate-700 font-medium">Status: {asset.usage_status}</span>
                                                                {asset.linking_active && (
                                                                    <span className="text-green-600 font-medium text-xs">🔗 Active</span>
                                                                )}
                                                            </div>
                                                            {asset.date && (
                                                                <div className="text-slate-500 text-xs mt-1">
                                                                    Created: {new Date(asset.date).toLocaleDateString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric'
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Enhanced Floating Action Button for Upload & Update */}
            {viewMode === 'list' && (
                <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
                    {/* Update Asset FAB */}
                    <div className="relative group">
                        <button
                            onClick={() => {
                                const recentAsset = assets.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                                if (recentAsset) {
                                    handleEdit({ stopPropagation: () => { } } as any, recentAsset);
                                } else {
                                    alert('No assets available to update');
                                }
                            }}
                            className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group-hover:scale-110"
                            title="Quick Update Asset"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>

                        {/* Update Action Menu */}
                        <div className="absolute bottom-0 right-14 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                            <div className="bg-white rounded-lg shadow-xl border border-slate-200 p-2 min-w-[220px]">
                                <div className="text-xs font-semibold text-orange-700 px-3 py-2 border-b border-slate-100">
                                    Quick Update
                                </div>

                                <button
                                    onClick={() => {
                                        const recentAsset = assets.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                                        if (recentAsset) {
                                            handleEdit({ stopPropagation: () => { } } as any, recentAsset);
                                        }
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-orange-50 rounded-md transition-colors text-sm"
                                >
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                        🔄
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900">Recent Asset</div>
                                        <div className="text-xs text-slate-500">Update latest asset</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        const pendingAssets = assets.filter(a => a.status === 'Draft' || a.status === 'QC Rejected');
                                        if (pendingAssets.length > 0) {
                                            handleEdit({ stopPropagation: () => { } } as any, pendingAssets[0]);
                                        } else {
                                            alert('No assets pending updates');
                                        }
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-orange-50 rounded-md transition-colors text-sm"
                                >
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                        ⏳
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900">Pending Updates</div>
                                        <div className="text-xs text-slate-500">Drafts & rejected assets</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Upload Asset FAB */}
                    <div className="relative group">
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group-hover:scale-110"
                            title="Quick Upload"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>

                        {/* Upload Action Menu */}
                        <div className="absolute bottom-0 right-16 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                            <div className="bg-white rounded-lg shadow-xl border border-slate-200 p-2 min-w-[200px]">
                                <div className="text-xs font-semibold text-slate-600 px-3 py-2 border-b border-slate-100">
                                    Quick Upload
                                </div>

                                <button
                                    onClick={() => {
                                        setNewAsset(prev => ({ ...prev, application_type: 'web' }));
                                        setShowUploadModal(true);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-blue-50 rounded-md transition-colors text-sm"
                                >
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        🌐
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900">Web Content</div>
                                        <div className="text-xs text-slate-500">Landing pages, articles</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        setNewAsset(prev => ({ ...prev, application_type: 'seo' }));
                                        setShowUploadModal(true);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-green-50 rounded-md transition-colors text-sm"
                                >
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        🔍
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900">SEO Content</div>
                                        <div className="text-xs text-slate-500">Optimized content</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        setNewAsset(prev => ({ ...prev, application_type: 'smm' }));
                                        setShowUploadModal(true);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-purple-50 rounded-md transition-colors text-sm"
                                >
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                        📱
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900">Social Media</div>
                                        <div className="text-xs text-slate-500">Posts, stories, videos</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Upload Asset Modal */}
            <UploadAssetModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onSuccess={() => {
                    refresh?.();
                    setShowUploadModal(false);
                }}
            />
        </>
    );
};

export default AssetsView;

