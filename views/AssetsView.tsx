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
    const [viewMode, setViewMode] = useState<'list' | 'upload' | 'edit' | 'qc' | 'mysubmissions'>('list');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [qcMode, setQcMode] = useState(false); // Toggle between user and QC mode
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
        smm_platform: undefined
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
    }, [assets, searchQuery, repositoryFilter, typeFilter, qcMode, currentUser.id]);

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
                grammar_score: undefined
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
            smm_media_type: asset.smm_media_type
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

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        disabled={isUploading}
                                        className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
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
                                                Save as Draft
                                            </>
                                        )}
                                    </button>
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
                                                Submit for QC Review
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
                                    <div className="space-y-4 bg-white rounded-lg p-5 border-2 border-purple-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                            </svg>
                                            <h4 className="font-bold text-purple-900">SMM Application Fields</h4>
                                        </div>

                                        {/* Platform Selector */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Social Media Platform</label>
                                            <select
                                                value={newAsset.smm_platform || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, smm_platform: e.target.value as any })}
                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white cursor-pointer font-medium"
                                            >
                                                <option value="">Select platform...</option>
                                                <option value="facebook_instagram">Facebook / Instagram</option>
                                                <option value="twitter">Twitter</option>
                                                <option value="linkedin">LinkedIn</option>
                                            </select>
                                        </div>

                                        {/* Platform-specific fields */}
                                        {newAsset.smm_platform && (
                                            <div className="space-y-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                                                        {newAsset.smm_platform === 'facebook_instagram' && '📘 Facebook / Instagram'}
                                                        {newAsset.smm_platform === 'twitter' && '🐦 Twitter'}
                                                        {newAsset.smm_platform === 'linkedin' && '💼 LinkedIn'}
                                                    </span>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                                    <textarea
                                                        value={newAsset.smm_description || ''}
                                                        onChange={(e) => setNewAsset({ ...newAsset, smm_description: e.target.value })}
                                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                        placeholder="Enter post description..."
                                                        rows={4}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-2">Hashtags</label>
                                                    <input
                                                        type="text"
                                                        value={newAsset.smm_hashtags || ''}
                                                        onChange={(e) => setNewAsset({ ...newAsset, smm_hashtags: e.target.value })}
                                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                        placeholder="#hashtag1 #hashtag2 #hashtag3"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-2">Media Type</label>
                                                    <select
                                                        value={newAsset.smm_media_type || ''}
                                                        onChange={(e) => setNewAsset({ ...newAsset, smm_media_type: e.target.value as any })}
                                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white cursor-pointer"
                                                    >
                                                        <option value="">Select media type...</option>
                                                        <option value="image">Image</option>
                                                        <option value="video">Video</option>
                                                        <option value="carousel">Carousel</option>
                                                        <option value="gif">GIF</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-2">Media Upload</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="url"
                                                            value={newAsset.smm_media_url || ''}
                                                            onChange={(e) => setNewAsset({ ...newAsset, smm_media_url: e.target.value })}
                                                            className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                            placeholder="https://example.com/media.jpg or upload file"
                                                        />
                                                        <input
                                                            ref={mediaInputRef}
                                                            type="file"
                                                            accept="image/*,video/*,.gif"
                                                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'media')}
                                                            className="hidden"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => mediaInputRef.current?.click()}
                                                            className="px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                            </svg>
                                                            Upload
                                                        </button>
                                                    </div>
                                                    {newAsset.smm_media_url && newAsset.smm_media_url.startsWith('data:') && (
                                                        <div className="mt-2">
                                                            {newAsset.smm_media_type === 'video' ? (
                                                                <video src={newAsset.smm_media_url} controls className="max-h-48 rounded-lg border-2 border-slate-200" />
                                                            ) : (
                                                                <img src={newAsset.smm_media_url} alt="Media preview" className="max-h-48 rounded-lg border-2 border-slate-200" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Preview Button */}
                                                <div className="mt-4 pt-4 border-t-2 border-blue-200">
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
                                                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        Preview {newAsset.smm_platform === 'facebook_instagram' ? 'Facebook/Instagram' : newAsset.smm_platform === 'twitter' ? 'Twitter' : 'LinkedIn'} Post
                                                    </button>
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
            {showPreviewModal && (() => {
                const displayData = {
                    name: newAsset.name || 'Your Page',
                    description: newAsset.smm_description || '',
                    hashtags: newAsset.smm_hashtags || '',
                    media: newAsset.smm_media_url || ''
                };

                return (
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
                                            {newAsset.smm_platform === 'facebook_instagram' && 'Facebook / Instagram'}
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
                                {newAsset.smm_platform === 'facebook_instagram' && (
                                    <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 max-w-[500px] mx-auto">
                                        <div className="p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-[2px]">
                                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                                        <div className="w-[36px] h-[36px] rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                                            {displayData.name?.charAt(0)?.toUpperCase() || 'A'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-1">
                                                        <p className="font-semibold text-[15px] text-slate-900">{displayData.name || 'Your Page'}</p>
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
                                        {(displayData.description || displayData.hashtags) && (
                                            <div className="px-3 pb-2">
                                                {displayData.description && <p className="text-[15px] text-slate-900 whitespace-pre-wrap leading-5 mb-1">{displayData.description}</p>}
                                                {displayData.hashtags && <p className="text-[15px] text-blue-600 font-normal">{displayData.hashtags}</p>}
                                            </div>
                                        )}
                                        {displayData.media && (
                                            <div className="bg-black relative">
                                                {newAsset.smm_media_type === 'video' ? (
                                                    <video src={displayData.media} controls className="w-full max-h-[600px] object-contain" poster={displayData.media} />
                                                ) : (
                                                    <img src={displayData.media} alt="Post content" className="w-full object-cover" style={{ maxHeight: '600px' }} />
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
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">{displayData.name?.charAt(0) || 'A'}</div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-bold text-sm">{displayData.name || 'Your Account'}</p>
                                                    <span className="text-blue-500">✓</span>
                                                    <span className="text-slate-500 text-sm font-normal">@{displayData.name?.toLowerCase().replace(/\s+/g, '') || 'account'}</span>
                                                    <span className="text-slate-500 text-sm">· 2m</span>
                                                </div>

                                                {/* Tweet Text */}
                                                {displayData.description && (
                                                    <p className="text-sm text-slate-900 mb-2 whitespace-pre-wrap">{displayData.description}</p>
                                                )}

                                                {/* Hashtags */}
                                                {displayData.hashtags && (
                                                    <p className="text-sm text-blue-500 mb-2">{displayData.hashtags}</p>
                                                )}

                                                {/* Media */}
                                                {displayData.media && (
                                                    <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200">
                                                        {newAsset.smm_media_type === 'video' ? (
                                                            <video src={displayData.media} controls className="w-full" />
                                                        ) : (
                                                            <img src={displayData.media} alt="Tweet media" className="w-full" />
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
                                                {displayData.name?.charAt(0) || 'A'}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-sm">{displayData.name || 'Your Company'}</p>
                                                <p className="text-xs text-slate-500">1,234 followers</p>
                                                <p className="text-xs text-slate-500">1m · 🌐</p>
                                            </div>
                                            <button className="text-slate-500 hover:bg-slate-100 p-2 rounded">
                                                <span>⋯</span>
                                            </button>
                                        </div>

                                        {/* Post Content */}
                                        <div className="p-4">
                                            {displayData.description && (
                                                <p className="text-sm text-slate-700 whitespace-pre-wrap mb-2">{displayData.description}</p>
                                            )}
                                            {displayData.hashtags && (
                                                <p className="text-sm text-blue-700 mb-2">{displayData.hashtags}</p>
                                            )}
                                        </div>

                                        {/* Media */}
                                        {displayData.media && (
                                            <div className="bg-slate-100">
                                                {newAsset.smm_media_type === 'video' ? (
                                                    <video src={displayData.media} controls className="w-full" />
                                                ) : (
                                                    <img src={displayData.media} alt="Post media" className="w-full" />
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
                );
            })()
            }

            {/* QC Review View */}
            {viewMode === 'qc' && qcReviewAsset && (() => {
                return (
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
                );
            })()
            }

            {/* My Submissions View */}
            {
                viewMode === 'mysubmissions' && (() => {
                    const mySubmissions = assets.filter(asset => asset.submitted_by === currentUser.id);

                    const mySubmissionsColumns = [
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
                                    {getStatusBadge(item.status || 'Draft')}
                                    {item.rework_count && item.rework_count > 0 && (
                                        <div className="text-xs text-orange-600 font-medium">
                                            🔄 Rework: {item.rework_count}
                                        </div>
                                    )}
                                </div>
                            )
                        },
                        {
                            header: 'Date Submitted',
                            accessor: (item: AssetLibraryItem) => (
                                <span className="text-xs text-slate-600">
                                    {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : '-'}
                                </span>
                            )
                        },
                        {
                            header: 'QC Remarks',
                            accessor: (item: AssetLibraryItem) => (
                                <div className="max-w-xs">
                                    {item.qc_remarks ? (
                                        <div className="text-xs text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                                            {item.qc_remarks}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">No remarks yet</span>
                                    )}
                                </div>
                            )
                        },
                        {
                            header: 'QC Score',
                            accessor: (item: AssetLibraryItem) => (
                                <div>
                                    {item.qc_score ? (
                                        <CircularScore
                                            score={item.qc_score}
                                            label="QC"
                                            size="sm"
                                        />
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">Not scored</span>
                                    )}
                                </div>
                            )
                        },
                        {
                            header: 'Actions',
                            accessor: (item: AssetLibraryItem) => (
                                <div className="flex gap-2">
                                    {/* View Button */}
                                    {(item.file_url || item.thumbnail_url) && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const url = item.file_url || item.thumbnail_url;
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
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            title="View Asset"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                    )}

                                    {/* Edit Button - Only for Draft or Rejected status */}
                                    {(item.status === 'Draft' || item.status === 'QC Rejected') && (
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
                                </div>
                            )
                        }
                    ];

                    return (
                        <div className="h-full flex flex-col w-full p-6 overflow-hidden">
                            <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full h-full">
                                <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 w-full flex-shrink-0">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">My Submissions</h2>
                                        <p className="text-slate-600 text-xs mt-0.5">
                                            Track your submitted assets and their QC status
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className="px-4 py-2 text-sm font-medium text-slate-600 border-2 border-slate-300 rounded-lg hover:bg-white transition-colors"
                                    >
                                        Back to Assets
                                    </button>
                                </div>

                                {/* Submission Statistics */}
                                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-slate-100 p-1.5 rounded">
                                                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-lg font-bold text-slate-900">
                                                        {mySubmissions.length}
                                                    </p>
                                                    <p className="text-xs text-slate-600">Total Submissions</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg border border-purple-200 p-3 shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-purple-100 p-1.5 rounded">
                                                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-lg font-bold text-purple-900">
                                                        {mySubmissions.filter(a => a.status === 'Pending QC Review').length}
                                                    </p>
                                                    <p className="text-xs text-purple-600">Pending Review</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg border border-green-200 p-3 shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-green-100 p-1.5 rounded">
                                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-lg font-bold text-green-900">
                                                        {mySubmissions.filter(a => a.status === 'QC Approved').length}
                                                    </p>
                                                    <p className="text-xs text-green-600">Approved</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg border border-red-200 p-3 shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-red-100 p-1.5 rounded">
                                                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-lg font-bold text-red-900">
                                                        {mySubmissions.filter(a => a.status === 'QC Rejected').length}
                                                    </p>
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
                    );
                })()
            }

            {/* List View */}
            {viewMode === 'list' && (
                <div className="h-full flex flex-col w-full p-6 overflow-hidden">
                    <div className="flex justify-between items-start flex-shrink-0 w-full mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assets</h1>
                            <p className="text-slate-600 text-sm mt-1">
                                {qcMode ? 'QC Review Mode - Review assets for quality control' : 'Manage and organize all your marketing assets'}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Upload Button */}
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:shadow-lg transition-all flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Upload Asset
                            </button>

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
                        </div>
                    </div>

                    <div className="relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder={qcMode ? "Search assets pending QC review..." : "Search assets by name, type, repository, or status..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                        />
                    </div>

                    <div className="mb-6 space-y-4">
                        {/* Filters */}
                        <div className="flex gap-4">
                            <select
                                value={repositoryFilter}
                                onChange={(e) => setRepositoryFilter(e.target.value)}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            >
                                {repositories.map(repo => (
                                    <option key={repo} value={repo}>{repo}</option>
                                ))}
                            </select>

                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            >
                                {assetTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Results Summary */}
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-slate-600">
                                {qcMode ? (
                                    <>
                                        Showing <span className="font-bold text-purple-600">{filteredAssets.length}</span> assets pending QC review
                                    </>
                                ) : (
                                    <>
                                        Showing <span className="font-bold text-indigo-600">{filteredAssets.length}</span> assets
                                    </>
                                )}
                            </p>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <Table
                                columns={columns}
                                data={filteredAssets}
                                title=""
                                emptyMessage={qcMode ? "No assets pending QC review." : "No assets yet. Click 'Upload Asset' to add your first file!"}
                                onRowClick={(asset) => onNavigate && onNavigate('asset-detail', asset.id)}
                            />
                        </div>
                    </div>
                </div>
            )}

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

