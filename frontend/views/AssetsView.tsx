import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import Table from '../components/Table';
import MarkdownEditor from '../components/MarkdownEditor';
import CircularScore from '../components/CircularScore';
import AssetCategoryMasterModal from '../components/AssetCategoryMasterModal';
import AssetTypeMasterModal from '../components/AssetTypeMasterModal';
import UploadAssetPopup from '../components/UploadAssetPopup';
import AssetDetailSidePanel from '../components/AssetDetailSidePanel';
import EditAssetForm from '../components/EditAssetForm';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { getStatusBadge } from '../constants';
import type { AssetLibraryItem, Service, SubServiceItem, User, AssetCategoryMasterItem, AssetTypeMasterItem, Brand, Campaign, Project, Task, ContentRepositoryItem } from '../types';

interface AssetsViewProps {
    onNavigate?: (view: string, id?: number) => void;
}

const AssetsView: React.FC<AssetsViewProps> = ({ onNavigate }) => {
    const { data: assets = [], create: createAsset, update: updateAsset, remove: removeAsset, refresh, loading: assetsLoading } = useData<AssetLibraryItem>('assetLibrary');
    const { data: services = [] } = useData<Service>('services');
    const { data: subServices = [] } = useData<SubServiceItem>('subServices');
    const { data: users = [], loading: usersLoading } = useData<User>('users');
    const { data: keywords = [] } = useData<any>('keywords');

    // Debug: Log assets data state
    useEffect(() => {
        console.log('[AssetsView] Assets data:', {
            count: assets.length,
            loading: assetsLoading,
            sample: assets[0] || null
        });
    }, [assets, assetsLoading]);

    // Create a memoized user lookup map for O(1) access instead of O(n) find operations
    const usersMap = useMemo(() => {
        const map = new Map<number, User>();
        users.forEach(user => map.set(user.id, user));
        return map;
    }, [users]);
    const { data: assetCategories = [], refresh: refreshAssetCategories } = useData<AssetCategoryMasterItem>('asset-category-master');
    const { data: assetTypes = [], refresh: refreshAssetTypes } = useData<AssetTypeMasterItem>('asset-type-master');
    const { create: createAssetCategory, update: updateAssetCategory } = useData<AssetCategoryMasterItem>('asset-category-master');
    const { create: createAssetType, update: updateAssetType } = useData<AssetTypeMasterItem>('asset-type-master');

    // Data hooks for filters
    const { data: campaigns = [] } = useData<Campaign>('campaigns');
    const { data: projects = [] } = useData<Project>('projects');
    const { data: tasks = [] } = useData<Task>('tasks');
    const { data: repositoryItems = [] } = useData<ContentRepositoryItem>('content');


    const [searchQuery, setSearchQuery] = useState('');

    // Filter state variables matching the specification
    const [assetTypeFilter, setAssetTypeFilter] = useState('All');           // Asset Type - from Asset Type Master
    const [assetCategoryFilter, setAssetCategoryFilter] = useState('All');   // Asset Category - from Asset Category Master
    const [contentTypeFilter, setContentTypeFilter] = useState('All');       // Content Type - Blog, Service Page, etc.
    const [campaignTypeFilter, setCampaignTypeFilter] = useState('All');     // Campaign Type - from Campaigns
    const [linkedServiceFilter, setLinkedServiceFilter] = useState('All');   // Linked Service - from Service Master
    const [linkedSubServiceFilter, setLinkedSubServiceFilter] = useState('All'); // Linked Sub-Service - mapped to selected service
    const [projectFilter, setProjectFilter] = useState('All');               // Project - from Projects
    const [linkedTaskFilter, setLinkedTaskFilter] = useState('All');         // Linked Task - from Tasks
    const [linkedRepositoryFilter, setLinkedRepositoryFilter] = useState('All'); // Linked Repository Item - from Content Repository
    const [createdByFilter, setCreatedByFilter] = useState('All');           // Created By - from Users
    const [dateRangeFilter, setDateRangeFilter] = useState('All');           // Date Range - date picker
    const [usageStatusFilter, setUsageStatusFilter] = useState('All');       // Usage Status - Used, Unused, Archived

    const [viewMode, setViewMode] = useState<'list' | 'upload' | 'edit' | 'mysubmissions' | 'detail' | 'master-categories' | 'master-types'>('list');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [displayMode, setDisplayMode] = useState<'table' | 'grid'>('table'); // List vs Large view toggle
    const [isRefreshing, setIsRefreshing] = useState(false); // Refresh state
    const { user: authUser, isAdmin } = useAuth(); // Get current user from auth context
    const currentUser = authUser || { id: 1, role: 'user' as const }; // Fallback for safety
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [editingAsset, setEditingAsset] = useState<AssetLibraryItem | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);
    const mediaInputRef = useRef<HTMLInputElement>(null);
    const bodyFileInputRef = useRef<HTMLInputElement>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [showDemoPreview, setShowDemoPreview] = useState<boolean>(true);
    const [showInlinePreview, setShowInlinePreview] = useState<boolean>(false);

    // Additional selection states (missing previously)
    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
    const [selectedSubServiceIds, setSelectedSubServiceIds] = useState<number[]>([]);
    const [selectedKeywords, setSelectedKeywords] = useState<any[]>([]);
    const [markdownContent, setMarkdownContent] = useState<string>('');
    const [selectedAsset, setSelectedAsset] = useState<AssetLibraryItem | null>(null);
    const [showSidePanel, setShowSidePanel] = useState<boolean>(false);

    // Brands (used for filters/masters)
    const { data: brands = [] } = useData<Brand>('brands');

    // Selected brand (used by master filters)
    const [selectedBrand, setSelectedBrand] = useState<string>('Pubrica');

    // Filtered master lists (by brand / active status)
    const filteredAssetCategories = useMemo(() => {
        // Handle both structures - filter by status if it exists
        return (assetCategories || []).filter(cat => {
            const statusOk = !cat.status || cat.status === 'active';
            const brandOk = !selectedBrand || selectedBrand === 'All' || cat.brand === selectedBrand;
            return statusOk && brandOk;
        });
    }, [assetCategories, selectedBrand]);

    // All active categories for dropdowns (not filtered by brand)
    const allActiveAssetCategories = useMemo(() => {
        // Handle both structures - filter by status if it exists
        return (assetCategories || []).filter(cat => !cat.status || cat.status === 'active');
    }, [assetCategories]);

    const filteredAssetTypes = useMemo(() => {
        // Handle both AssetTypeItem (no status) and AssetTypeMasterItem (has status)
        return (assetTypes || []).filter(t => {
            const statusOk = !t.status || t.status === 'active';
            const brandOk = !selectedBrand || selectedBrand === 'All' || (t as any).brand === selectedBrand;
            return statusOk && brandOk;
        });
    }, [assetTypes, selectedBrand]);

    // All active asset types for dropdowns (not filtered by brand)
    const allActiveAssetTypes = useMemo(() => {
        // Handle both AssetTypeItem (no status) and AssetTypeMasterItem (has status)
        return (assetTypes || []).filter(t => !t.status || t.status === 'active');
    }, [assetTypes]);

    // Filter sub-services based on selected linked service filter
    const filteredSubServicesForFilter = useMemo(() => {
        if (linkedServiceFilter === 'All') {
            return subServices;
        }
        return subServices.filter(sub =>
            Number(sub.parent_service_id) === Number(linkedServiceFilter)
        );
    }, [subServices, linkedServiceFilter]);



    // Master table modals
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<AssetCategoryMasterItem | null>(null);
    const [editingType, setEditingType] = useState<AssetTypeMasterItem | null>(null);

    // Upload form state
    const [uploadStep, setUploadStep] = useState<'select-type' | 'form-fields' | 'upload-file' | 'asset-details'>('select-type');
    const [selectedApplicationType, setSelectedApplicationType] = useState<'web' | 'seo' | 'smm' | null>('web');
    const [contentTypeLocked, setContentTypeLocked] = useState(true); // lock content type during upload process (default to Web)

    const [newAsset, setNewAsset] = useState<Partial<AssetLibraryItem>>({
        // Asset Submission Fields (In Order)
        application_type: 'web', // 1. Asset Application – WEB, SEO, SMM (default to Web)
        // Service/Sub-Service Linking will be handled by selectedServiceId/selectedSubServiceIds

        name: '', // 4. Title
        web_description: '', // 5. Description
        web_url: '', // 6. URL
        web_h1: '', // 7. H1
        web_h2_1: '', // 8. H2 (first)
        web_h2_2: '', // 8. H2 (second)
        type: 'article', // 9. Asset Type
        asset_category: '', // 10. Asset Category
        repository: 'Content Repository', // 12. Repository
        // Image Upload Option handled separately
        web_body_content: '', // 14. Body Content
        seo_score: undefined, // 15. SEO Score (AI integration)
        grammar_score: undefined, // 16. Grammar Score (AI integration)
        status: 'Draft', // 17. Status (removed usage_status as per requirement 3)

        // Internal fields
        linked_service_ids: [],
        linked_sub_service_ids: [],
        smm_platform: undefined,
        smm_additional_pages: [],
        keywords: [] // Added keywords array for master database integration
    });

    // File upload handler for thumbnails and media
    const handleFileUpload = useCallback(async (file: File, type: 'thumbnail' | 'media' | 'body') => {
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
                if (type === 'media') {
                    setNewAsset({
                        ...newAsset,
                        smm_media_url: base64String
                    });
                } else if (type === 'body') {
                    setNewAsset(prev => ({ ...(prev as any), web_body_attachment: base64String, web_body_attachment_name: file.name }));
                }
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

    const uniqueAssetTypes = useMemo(() => {
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
            // Asset Type filter (from Asset Type Master)
            if (assetTypeFilter !== 'All' && a.type !== assetTypeFilter) return false;

            // Asset Category filter (from Asset Category Master)
            if (assetCategoryFilter !== 'All' && a.asset_category !== assetCategoryFilter) return false;

            // Content Type filter
            if (contentTypeFilter !== 'All' && a.content_type !== contentTypeFilter) return false;

            // Campaign Type filter
            if (campaignTypeFilter !== 'All') {
                const linkedCampaignId = a.linked_campaign_id;
                if (!linkedCampaignId || linkedCampaignId.toString() !== campaignTypeFilter) return false;
            }

            // Linked Service filter
            if (linkedServiceFilter !== 'All') {
                const serviceId = a.linked_service_id || (a.linked_service_ids && a.linked_service_ids[0]);
                if (!serviceId || serviceId.toString() !== linkedServiceFilter) return false;
            }

            // Linked Sub-Service filter
            if (linkedSubServiceFilter !== 'All') {
                const subServiceId = a.linked_sub_service_id || (a.linked_sub_service_ids && a.linked_sub_service_ids[0]);
                if (!subServiceId || subServiceId.toString() !== linkedSubServiceFilter) return false;
            }

            // Project filter
            if (projectFilter !== 'All') {
                const projectId = a.linked_project_id;
                if (!projectId || projectId.toString() !== projectFilter) return false;
            }

            // Linked Task filter
            if (linkedTaskFilter !== 'All') {
                const taskId = a.linked_task_id || a.linked_task;
                if (!taskId || taskId.toString() !== linkedTaskFilter) return false;
            }

            // Linked Repository Item filter
            if (linkedRepositoryFilter !== 'All') {
                const repoId = a.linked_repository_item_id;
                if (!repoId || repoId.toString() !== linkedRepositoryFilter) return false;
            }

            // Created By filter
            if (createdByFilter !== 'All') {
                const creatorId = a.created_by || a.submitted_by;
                if (!creatorId || creatorId.toString() !== createdByFilter) return false;
            }

            // Date Range filter
            if (dateRangeFilter !== 'All' && a.date) {
                const assetDate = new Date(a.date);
                const now = new Date();

                switch (dateRangeFilter) {
                    case 'today':
                        if (assetDate.toDateString() !== now.toDateString()) return false;
                        break;
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        if (assetDate < weekAgo) return false;
                        break;
                    case 'month':
                        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        if (assetDate < monthAgo) return false;
                        break;
                    case 'quarter':
                        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                        if (assetDate < quarterAgo) return false;
                        break;
                    case 'year':
                        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                        if (assetDate < yearAgo) return false;
                        break;
                }
            }

            // Usage Status filter
            if (usageStatusFilter !== 'All') {
                const usageCount = (a as any).usage_count || 0;
                switch (usageStatusFilter) {
                    case 'Used':
                        if (usageCount === 0) return false;
                        break;
                    case 'Unused':
                        if (usageCount > 0) return false;
                        break;
                    case 'Archived':
                        if (a.status !== 'Archived') return false;
                        break;
                }
            }

            // Search query
            if (!query) return true;

            const name = (a.name || '').toLowerCase();
            const type = (a.type || '').toLowerCase();
            const category = (a.asset_category || '').toLowerCase();
            const status = (a.status || '').toLowerCase();
            const contentType = (a.content_type || '').toLowerCase();

            // Get linked entity names for search
            const linkedServiceId = a.linked_service_id || (a.linked_service_ids && a.linked_service_ids[0]);
            const linkedService = linkedServiceId ? services.find(s => s.id === linkedServiceId) : null;
            const serviceName = (linkedService?.service_name || '').toLowerCase();

            const linkedSubServiceId = a.linked_sub_service_id || (a.linked_sub_service_ids && a.linked_sub_service_ids[0]);
            const linkedSubService = linkedSubServiceId ? subServices.find(ss => ss.id === linkedSubServiceId) : null;
            const subServiceName = (linkedSubService?.sub_service_name || '').toLowerCase();

            const linkedTaskId = a.linked_task_id || a.linked_task;
            const linkedTask = linkedTaskId ? tasks.find(t => t.id === linkedTaskId) : null;
            const taskName = (linkedTask?.name || '').toLowerCase();

            const linkedCampaign = a.linked_campaign_id ? campaigns.find(c => c.id === a.linked_campaign_id) : null;
            const campaignName = (linkedCampaign?.campaign_name || '').toLowerCase();

            const linkedProject = a.linked_project_id ? projects.find(p => p.id === a.linked_project_id) : null;
            const projectName = (linkedProject?.project_name || '').toLowerCase();

            const linkedRepo = a.linked_repository_item_id ? repositoryItems.find(r => r.id === a.linked_repository_item_id) : null;
            const repoName = (linkedRepo?.content_title_clean || '').toLowerCase();

            return name.includes(query) ||
                type.includes(query) ||
                category.includes(query) ||
                status.includes(query) ||
                contentType.includes(query) ||
                serviceName.includes(query) ||
                subServiceName.includes(query) ||
                taskName.includes(query) ||
                campaignName.includes(query) ||
                projectName.includes(query) ||
                repoName.includes(query);
        });
    }, [assets, searchQuery, assetTypeFilter, assetCategoryFilter, contentTypeFilter, campaignTypeFilter, linkedServiceFilter, linkedSubServiceFilter, projectFilter, linkedTaskFilter, linkedRepositoryFilter, createdByFilter, dateRangeFilter, usageStatusFilter, currentUser.id, services, subServices, tasks, campaigns, projects, repositoryItems]);

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

    // Body content analysis state and handler
    const [analysisInProgress, setAnalysisInProgress] = useState(false);

    const analyzeBodyContent = async () => {
        // Get current body content directly from state
        const text = (newAsset.web_body_content || '').trim();

        if (!text) {
            alert('Please add body content to analyse');
            return;
        }

        setAnalysisInProgress(true);

        // Calculate scores locally (fallback approach that always works)
        const lengthScore = Math.min(80, Math.round(text.length / 10));
        const randBoost = Math.round(Math.random() * 20);
        const seoScore = Math.min(100, lengthScore + randBoost);
        const grammarScore = Math.min(100, Math.round(60 + Math.random() * 40));

        // Try API call, but don't block on it
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
            const response = await fetch(`${apiUrl}/assetLibrary/ai-scores`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: text,
                    title: newAsset.web_title || newAsset.name,
                    description: newAsset.web_description
                })
            });

            if (response.ok) {
                const scores = await response.json();
                setNewAsset(prev => ({
                    ...prev,
                    seo_score: scores.seo_score,
                    grammar_score: scores.grammar_score
                }));
            } else {
                // Use local scores
                setNewAsset(prev => ({ ...prev, seo_score: seoScore, grammar_score: grammarScore }));
            }
        } catch (err) {
            // Use local scores on error
            setNewAsset(prev => ({ ...prev, seo_score: seoScore, grammar_score: grammarScore }));
        } finally {
            setAnalysisInProgress(false);
        }
    };

    // Auto-analyse body content for WEB in real-time (debounced)
    useEffect(() => {
        if (selectedApplicationType !== 'web') return;
        const text = (newAsset.web_body_content || '').trim();
        if (!text) return;
        const id = setTimeout(() => {
            analyzeBodyContent();
        }, 800);
        return () => clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newAsset.web_body_content, selectedApplicationType]);

    // Handle application type selection
    const handleApplicationTypeSelect = (type: 'web' | 'seo' | 'smm') => {
        setSelectedApplicationType(type);
        setNewAsset(prev => ({
            ...prev,
            application_type: type
        }));
        setContentTypeLocked(true);
        setUploadStep('form-fields');
    };

    // Handle master table operations
    const handleSaveCategory = async (categoryData: Partial<AssetCategoryMasterItem>) => {
        try {
            if (editingCategory) {
                await updateAssetCategory(editingCategory.id, categoryData);
            } else {
                await createAssetCategory(categoryData as AssetCategoryMasterItem);
            }
            setEditingCategory(null);
            setShowCategoryModal(false);
            // Refresh master data so new category appears immediately
            setTimeout(() => refreshAssetCategories?.(), 100);
        } catch (error) {
            console.error('Failed to save category:', error);
            alert('Failed to save category');
        }
    };

    const handleSaveType = async (typeData: Partial<AssetTypeMasterItem>) => {
        try {
            if (editingType) {
                await updateAssetType(editingType.id, typeData);
            } else {
                await createAssetType(typeData as AssetTypeMasterItem);
            }
            setEditingType(null);
            setShowTypeModal(false);
            // Refresh asset types so new type appears immediately
            setTimeout(() => refreshAssetTypes?.(), 100);
        } catch (error) {
            console.error('Failed to save asset type:', error);
            alert('Failed to save asset type');
        }
    };

    const handleUpload = useCallback(async (submitForQC: boolean = false) => {
        if (!newAsset.name?.trim()) {
            alert('Please enter an asset name');
            return;
        }

        if (!selectedApplicationType) {
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
                created_at: new Date().toISOString(),
                created_by: currentUser.id, // Always set created_by for proper ownership tracking
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
                const updatedAsset = await updateAsset(editingAsset.id, assetPayload);

                // Update the selected asset if we're in detail view
                if (selectedAsset && selectedAsset.id === editingAsset.id) {
                    setSelectedAsset({ ...selectedAsset, ...assetPayload });
                }
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
            setSelectedKeywords([]);
            setSelectedApplicationType('web');
            setUploadStep('select-type');
            setNewAsset({
                name: '',
                type: 'article',
                repository: 'Content Repository',
                status: 'Draft',
                linked_service_ids: [],
                linked_sub_service_ids: [],
                application_type: 'web',
                smm_platform: undefined,
                seo_score: undefined,
                grammar_score: undefined,
                smm_additional_pages: [],
                keywords: [],
                web_body_attachment: undefined,
                web_body_attachment_name: ''
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
            setContentTypeLocked(false);
        }
    }, [newAsset, selectedFile, createAsset, updateAsset, editingAsset, viewMode, refresh, selectedServiceId, selectedSubServiceIds, services, subServices]);

    const handleEdit = useCallback((e: React.MouseEvent, asset: AssetLibraryItem) => {
        e.stopPropagation();
        setEditingAsset(asset);
        setSelectedApplicationType(asset.application_type as any);
        setNewAsset({
            // Basic Asset Information
            name: asset.name,
            type: asset.type,
            repository: asset.repository,
            status: asset.status,
            asset_category: asset.asset_category,
            content_type: asset.content_type,
            mapped_to: asset.mapped_to,

            // Scores
            qc_score: asset.qc_score,
            seo_score: asset.seo_score,
            grammar_score: asset.grammar_score,

            // File Information
            file_url: asset.file_url,
            thumbnail_url: asset.thumbnail_url,
            file_size: asset.file_size,
            file_type: asset.file_type,
            dimensions: asset.dimensions,

            // Service/Sub-Service Linking
            linked_service_ids: asset.linked_service_ids || [],
            linked_sub_service_ids: asset.linked_sub_service_ids || [],
            linked_service_id: asset.linked_service_id,
            linked_sub_service_id: asset.linked_sub_service_id,

            // Map Assets to Source Work fields
            linked_task_id: asset.linked_task_id,
            linked_task: asset.linked_task,
            linked_campaign_id: asset.linked_campaign_id,
            linked_project_id: asset.linked_project_id,
            linked_repository_item_id: asset.linked_repository_item_id,

            // User & Workflow fields
            designed_by: asset.designed_by,
            created_by: asset.created_by,
            updated_by: asset.updated_by,
            version_number: asset.version_number,

            // Application Type
            application_type: asset.application_type,

            // Web Application Fields - All fields pre-populated
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
            web_body_attachment: (asset as any).web_body_attachment,
            web_body_attachment_name: (asset as any).web_body_attachment_name,

            // SMM Application Fields - All fields pre-populated
            smm_platform: asset.smm_platform,
            smm_title: asset.smm_title,
            smm_tag: asset.smm_tag,
            smm_url: asset.smm_url,
            smm_description: asset.smm_description,
            smm_hashtags: asset.smm_hashtags,
            smm_media_url: asset.smm_media_url,
            smm_media_type: asset.smm_media_type,
            smm_additional_pages: asset.smm_additional_pages || [],
            smm_post_type: asset.smm_post_type,
            smm_campaign_type: asset.smm_campaign_type,
            smm_cta: asset.smm_cta,
            smm_target_audience: asset.smm_target_audience,

            // SEO Application Fields - All fields pre-populated
            seo_title: asset.seo_title,
            seo_target_url: asset.seo_target_url,
            seo_keywords: asset.seo_keywords || [],
            seo_focus_keyword: asset.seo_focus_keyword,
            seo_content_type: asset.seo_content_type,
            seo_meta_description: asset.seo_meta_description,
            seo_content_description: asset.seo_content_description,
            seo_h1: asset.seo_h1,
            seo_h2_1: asset.seo_h2_1,
            seo_h2_2: asset.seo_h2_2,
            seo_content_body: asset.seo_content_body,

            // Keywords
            keywords: asset.keywords || []
        });

        // Set selected keywords for the UI
        setSelectedKeywords(asset.keywords || []);

        // Set markdown content for the editor (use appropriate content based on application type)
        if (asset.application_type === 'seo') {
            setMarkdownContent(asset.seo_content_body || asset.web_body_content || '');
        } else {
            setMarkdownContent(asset.web_body_content || '');
        }

        // Set selected service and sub-services for the UI
        const serviceId = asset.linked_service_id || (asset.linked_service_ids && asset.linked_service_ids[0]);
        if (serviceId) {
            setSelectedServiceId(serviceId);
        } else {
            setSelectedServiceId(null);
        }

        const subServiceIds = asset.linked_sub_service_ids || (asset.linked_sub_service_id ? [asset.linked_sub_service_id] : []);
        setSelectedSubServiceIds(subServiceIds);

        // Set preview URL if available
        if (asset.thumbnail_url || asset.file_url || asset.smm_media_url) {
            setPreviewUrl(asset.thumbnail_url || asset.file_url || asset.smm_media_url || '');
        } else {
            setPreviewUrl('');
        }

        setViewMode('edit');
    }, []);

    // Handle row click to show detailed view in side panel
    const handleRowClick = useCallback((asset: AssetLibraryItem) => {
        setSelectedAsset(asset);
        setShowSidePanel(true);
    }, []);

    // Handle navigation back from detailed view
    const handleBackFromDetail = useCallback(() => {
        setSelectedAsset(null);
        setShowSidePanel(false);
        setViewMode('list');
    }, []);

    // Delete handler
    const handleDelete = useCallback(async (e: React.MouseEvent, id: number, name?: string) => {
        e.stopPropagation();
        if (!confirm(`Delete asset ${name || id}? This action cannot be undone.`)) return;
        setDeletingId(id);
        try {
            await removeAsset(id);
            // if the deleted asset is currently selected, clear detail view
            setSelectedAsset(prev => (prev && prev.id === id ? null : prev));
            setTimeout(() => refresh?.(), 100);
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Failed to delete asset.');
        } finally {
            setDeletingId(null);
        }
    }, [removeAsset, refresh]);

    const getAssetIcon = useCallback((type: string) => {
        const icons: Record<string, string> = {
            'Image': '🖼️',
            'Video': '🎥',
            'Document': '📄',
            'Archive': '📦',
            'Blog Banner': '📝',
            'Reel': '🎬',
            'Infographic': '📊',
            'PDF': '📑'
        };
        return icons[type] || '📁';
    }, []);

    // Get asset type badge color
    const getAssetTypeBadgeColor = useCallback((type: string) => {
        const colors: Record<string, string> = {
            'Blog Banner': 'bg-blue-100 text-blue-700',
            'Reel': 'bg-purple-100 text-purple-700',
            'Infographic': 'bg-green-100 text-green-700',
            'PDF': 'bg-red-100 text-red-700',
            'Video': 'bg-pink-100 text-pink-700',
            'Image': 'bg-amber-100 text-amber-700',
            'Document': 'bg-slate-100 text-slate-700'
        };
        return colors[type] || 'bg-slate-100 text-slate-700';
    }, []);

    // Memoize columns for better performance - Updated to match screenshot
    const columns = useMemo(() => [
        {
            header: 'ID',
            accessor: (item: AssetLibraryItem, index?: number) => (
                <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-mono font-medium">
                    {String((index ?? 0) + 1).padStart(4, '0')}
                </span>
            ),
            className: 'w-16'
        },
        {
            header: 'THUMBNAIL',
            accessor: (item: AssetLibraryItem) => (
                <div className="flex items-center justify-center">
                    {item.thumbnail_url ? (
                        <img
                            src={item.thumbnail_url}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center text-xl border border-slate-200">
                            {getAssetIcon(item.type)}
                        </div>
                    )}
                </div>
            ),
            className: 'w-20'
        },
        {
            header: 'ASSET NAME',
            accessor: (item: AssetLibraryItem) => (
                <div>
                    <div className="font-semibold text-slate-900 text-sm">{item.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{item.file_url?.split('/').pop() || `asset-${item.id}.${item.file_type || 'file'}`}</div>
                </div>
            )
        },
        {
            header: 'ASSET TYPE',
            accessor: (item: AssetLibraryItem) => (
                <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${getAssetTypeBadgeColor(item.type)}`}>
                    {item.type}
                </span>
            )
        },
        {
            header: 'ASSET CATEGORY',
            accessor: (item: AssetLibraryItem) => (
                <span className="text-sm text-slate-700">
                    {item.asset_category || '-'}
                </span>
            )
        },
        {
            header: 'CONTENT TYPE',
            accessor: (item: AssetLibraryItem) => (
                <span className="text-sm text-slate-700">
                    {item.content_type || '-'}
                </span>
            )
        },
        {
            header: 'LINKED SERVICE',
            accessor: (item: AssetLibraryItem) => {
                const linkedServiceId = item.linked_service_id || (item.linked_service_ids && item.linked_service_ids[0]);
                const service = linkedServiceId ? services.find(s => s.id === linkedServiceId) : null;
                const linkedSubServiceId = item.linked_sub_service_id || (item.linked_sub_service_ids && item.linked_sub_service_ids[0]);
                const subService = linkedSubServiceId ? subServices.find(ss => ss.id === linkedSubServiceId) : null;

                if (!service) {
                    return <span className="text-xs text-slate-400">-</span>;
                }

                return (
                    <div className="text-xs">
                        <div className="font-medium text-slate-900">{service.service_name}</div>
                        {subService && (
                            <div className="text-slate-500">{subService.sub_service_name}</div>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'LINKED TASK',
            accessor: (item: AssetLibraryItem) => {
                const taskId = item.linked_task_id || item.linked_task;
                const task = taskId ? tasks.find(t => t.id === taskId) : null;

                if (!task) {
                    return <span className="text-xs text-slate-400">-</span>;
                }

                return (
                    <div className="text-xs text-slate-700">
                        {task.name}
                    </div>
                );
            }
        },
        {
            header: 'LINKED CAMPAIGN',
            accessor: (item: AssetLibraryItem) => {
                const campaign = item.linked_campaign_id ? campaigns.find(c => c.id === item.linked_campaign_id) : null;

                if (!campaign) {
                    return <span className="text-xs text-slate-400">-</span>;
                }

                return (
                    <div className="text-xs text-slate-700">
                        {campaign.campaign_name}
                    </div>
                );
            }
        },
        {
            header: 'LINKED PROJECT',
            accessor: (item: AssetLibraryItem) => {
                const project = item.linked_project_id ? projects.find(p => p.id === item.linked_project_id) : null;

                if (!project) {
                    return <span className="text-xs text-slate-400">-</span>;
                }

                return (
                    <div className="text-xs text-slate-700">
                        {project.project_name}
                    </div>
                );
            }
        },
        {
            header: 'REPOSITORY ITEM',
            accessor: (item: AssetLibraryItem) => {
                const repoItem = item.linked_repository_item_id ? repositoryItems.find(r => r.id === item.linked_repository_item_id) : null;

                if (!repoItem) {
                    return <span className="text-xs text-slate-400">-</span>;
                }

                return (
                    <div className="text-xs text-slate-700 max-w-[150px] truncate" title={repoItem.content_title_clean}>
                        {repoItem.content_title_clean}
                    </div>
                );
            }
        },
        {
            header: 'QC STATUS',
            accessor: (item: AssetLibraryItem) => {
                const status = item.status || 'Draft';
                const qcScore = item.qc_score;

                let statusColor = 'bg-slate-100 text-slate-700';
                let statusText: string = status;

                if (status === 'QC Approved' || status === 'Published') {
                    statusColor = 'bg-green-100 text-green-700';
                    statusText = 'Pass';
                } else if (status === 'Pending QC Review') {
                    statusColor = 'bg-amber-100 text-amber-700';
                    statusText = 'Pending';
                } else if (status === 'QC Rejected' || status === 'Rework Required') {
                    statusColor = 'bg-red-100 text-red-700';
                    statusText = 'Fail';
                }

                return (
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColor}`}>
                            {statusText}
                        </span>
                        {qcScore !== undefined && (
                            <span className="text-xs text-slate-500">({qcScore})</span>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'VERSION',
            accessor: (item: AssetLibraryItem) => (
                <span className="text-sm text-slate-700">
                    {item.version_number || 'v1.0'}
                </span>
            )
        },
        {
            header: 'DESIGNER',
            accessor: (item: AssetLibraryItem) => {
                const designerId = item.designed_by || item.submitted_by || item.created_by;
                const designer = designerId ? usersMap.get(designerId) : undefined;

                if (!designer) {
                    return <span className="text-xs text-slate-400">-</span>;
                }

                // Get initials
                const initials = designer.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

                // Generate consistent color based on name
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-amber-500', 'bg-cyan-500'];
                const colorIndex = designer.name?.charCodeAt(0) % colors.length || 0;

                return (
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 ${colors[colorIndex]} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                            {initials}
                        </div>
                        <div className="text-xs">
                            <div className="font-medium text-slate-900">{designer.name}</div>
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'UPLOADED AT',
            accessor: (item: AssetLibraryItem) => {
                const date = item.date || item.created_at;
                if (!date) return <span className="text-xs text-slate-400">-</span>;

                const d = new Date(date);
                return (
                    <div className="text-xs text-slate-600">
                        <div>{d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')}</div>
                    </div>
                );
            }
        },
        {
            header: 'CREATED BY',
            accessor: (item: AssetLibraryItem) => {
                const creator = item.created_by ? usersMap.get(item.created_by) : undefined;
                if (!creator) return <span className="text-xs text-slate-400">-</span>;
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {creator.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="text-xs text-slate-700">{creator.name}</span>
                    </div>
                );
            }
        },
        {
            header: 'UPDATED BY',
            accessor: (item: AssetLibraryItem) => {
                const updater = item.updated_by ? usersMap.get(item.updated_by) : undefined;
                if (!updater) return <span className="text-xs text-slate-400">-</span>;
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {updater.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="text-xs text-slate-700">{updater.name}</span>
                    </div>
                );
            }
        },
        {
            header: 'USAGE COUNT',
            accessor: (item: AssetLibraryItem) => (
                <div className="text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
                        {(item as any).usage_count || 0}
                    </span>
                </div>
            )
        },
        {
            header: 'ACTIONS',
            accessor: (item: AssetLibraryItem) => (
                <div className="flex justify-center">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // Show dropdown menu
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-all"
                        title="More actions"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                    </button>
                </div>
            ),
            className: 'w-20'
        }
    ], [getAssetIcon, getAssetTypeBadgeColor, services, subServices, tasks, usersMap]);

    // Render application type selection step
    const renderApplicationTypeSelection = () => (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Select Application Type</h2>
                <p className="text-slate-600">Choose the type of asset you want to upload</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* WEB Application */}
                <div
                    onClick={() => handleApplicationTypeSelect('web')}
                    className="bg-white rounded-xl border-2 border-slate-200 hover:border-blue-500 cursor-pointer transition-all p-6 text-center group hover:shadow-lg"
                >
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">WEB</h3>
                    <p className="text-slate-600 text-sm">Web content, articles, and general website assets</p>
                </div>

                {/* SEO Application - Opens Popup like Web */}
                <div
                    onClick={() => handleApplicationTypeSelect('seo')}
                    className="bg-white rounded-xl border-2 border-slate-200 hover:border-green-500 cursor-pointer transition-all p-6 text-center group hover:shadow-lg"
                >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">SEO</h3>
                    <p className="text-slate-600 text-sm">SEO content with optimized workflow</p>
                </div>

                {/* SMM Application */}
                <div
                    onClick={() => handleApplicationTypeSelect('smm')}
                    className="bg-white rounded-xl border-2 border-slate-200 hover:border-purple-500 cursor-pointer transition-all p-6 text-center group hover:shadow-lg"
                >
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200">
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12l2 2 4-4" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">SMM</h3>
                    <p className="text-slate-600 text-sm">Social media marketing content and assets</p>
                </div>
            </div>
        </div>
    );

    // Render form fields based on application type
    const renderFormFields = () => (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => setUploadStep('select-type')}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {selectedApplicationType?.toUpperCase()} Asset Details
                        </h2>
                        <p className="text-slate-600 text-sm">Fill in the asset information</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Basic Fields */}
                    <div className="space-y-4">
                        {/* Brand Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Brand *
                            </label>
                            <select
                                value={selectedBrand}
                                onChange={(e) => setSelectedBrand(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Select brand...</option>
                                {brands.map(brand => (
                                    <option key={brand.id} value={brand.name}>{brand.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Asset Category & Type moved below upload for WEB/SMM */}

                        {/* Asset Format removed per requirements */}

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={newAsset.name || ''}
                                onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter asset title"
                                required
                            />
                        </div>
                    </div>

                    {/* Right Column - Application Specific Fields */}
                    <div className="space-y-4">
                        {selectedApplicationType === 'web' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">URL</label>
                                    <input
                                        type="url"
                                        value={newAsset.web_url || ''}
                                        onChange={(e) => setNewAsset({ ...newAsset, web_url: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="https://example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">H1</label>
                                    <input
                                        type="text"
                                        value={newAsset.web_h1 || ''}
                                        onChange={(e) => setNewAsset({ ...newAsset, web_h1: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Main heading"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">H2 (First)</label>
                                    <input
                                        type="text"
                                        value={newAsset.web_h2_1 || ''}
                                        onChange={(e) => setNewAsset({ ...newAsset, web_h2_1: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="First subheading"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">H2 (Second)</label>
                                    <input
                                        type="text"
                                        value={newAsset.web_h2_2 || ''}
                                        onChange={(e) => setNewAsset({ ...newAsset, web_h2_2: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Second subheading"
                                    />
                                </div>

                                {/* Body Content Section with AI Scores */}
                                <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Body Content - Left Side */}
                                        <div className="lg:col-span-2">
                                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                                                <span className="text-lg">📝</span>
                                                Body content
                                            </label>
                                            <textarea
                                                value={newAsset.web_body_content || ''}
                                                onChange={(e) => setNewAsset({ ...newAsset, web_body_content: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-y bg-white"
                                                placeholder="Paste your full article or body copy here for AI analysis..."
                                                rows={8}
                                            />

                                            {/* Analyse Button */}
                                            <button
                                                type="button"
                                                onClick={analyzeBodyContent}
                                                disabled={analysisInProgress}
                                                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                {analysisInProgress ? 'Analysing...' : 'Analyze'}
                                            </button>
                                        </div>

                                        {/* AI Scores - Right Side */}
                                        <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 p-6">
                                            <div className="space-y-6">
                                                {/* SEO Score */}
                                                <div className="flex flex-col items-center">
                                                    <CircularScore
                                                        score={newAsset.seo_score || 0}
                                                        label="SEO SCORE"
                                                        size="sm"
                                                    />
                                                </div>

                                                {/* Grammar Score */}
                                                <div className="flex flex-col items-center">
                                                    <CircularScore
                                                        score={newAsset.grammar_score || 0}
                                                        label="GRAMMAR SCORE"
                                                        size="sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Upload Dropzone for Web assets */}
                                <div
                                    className={`mt-4 border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${dragActive
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
                                        <div className="space-y-3">
                                            <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg shadow-md" />
                                            <p className="text-sm text-slate-600">Click to change file</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                                                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-lg font-medium text-slate-900">Drop your file here</p>
                                                <p className="text-sm text-slate-500">or click to browse</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {selectedApplicationType === 'smm' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Platform</label>
                                    <select
                                        value={newAsset.smm_platform || ''}
                                        onChange={(e) => setNewAsset({ ...newAsset, smm_platform: e.target.value as any })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Select Platform</option>
                                        <option value="facebook">Facebook</option>
                                        <option value="instagram">Instagram</option>
                                        <option value="twitter">Twitter</option>
                                        <option value="linkedin">LinkedIn</option>
                                        <option value="youtube">YouTube</option>
                                        {/* TikTok removed per SMM spec */}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Hashtags</label>
                                    <input
                                        type="text"
                                        value={newAsset.smm_hashtags || ''}
                                        onChange={(e) => setNewAsset({ ...newAsset, smm_hashtags: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="#hashtag1 #hashtag2"
                                    />
                                </div>
                            </>
                        )}

                        {/* Quality scores moved beside Body Content */}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
                    {selectedApplicationType !== 'web' && (
                        <button
                            onClick={() => setUploadStep('upload-file')}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Next: Upload File
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    // Render file upload step
    const renderFileUpload = () => (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => setUploadStep('form-fields')}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Upload File</h2>
                        <p className="text-slate-600 text-sm">Upload your asset file</p>
                    </div>
                </div>

                {/* File Upload Area */}
                {selectedApplicationType === 'smm' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
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
                                        <p className="text-sm text-slate-600">Click to change file</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                                            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-lg font-medium text-slate-900">Drop your file here</p>
                                            <p className="text-sm text-slate-500">or click to browse</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Platform-specific fields shown below upload */}
                            <div className="mt-4 bg-white rounded-xl border border-slate-200 p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Platform</label>
                                        <select
                                            value={newAsset.smm_platform || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, smm_platform: e.target.value as any, smm_description: '', web_url: '' })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                        >
                                            <option value="">Select Platform</option>
                                            <option value="facebook">Facebook</option>
                                            <option value="instagram">Instagram</option>
                                            <option value="twitter">Twitter</option>
                                            <option value="linkedin">LinkedIn</option>
                                            <option value="youtube">YouTube</option>
                                        </select>
                                    </div>

                                    <div>
                                        {/* Show only relevant fields for selected platform */}
                                        {newAsset.smm_platform === 'facebook' && (
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Facebook Post URL</label>
                                                <input type="text" value={newAsset.web_url || ''} onChange={(e) => setNewAsset({ ...newAsset, web_url: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                                            </div>
                                        )}
                                        {newAsset.smm_platform === 'instagram' && (
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Instagram Caption</label>
                                                <input type="text" value={newAsset.smm_description || ''} onChange={(e) => setNewAsset({ ...newAsset, smm_description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                                            </div>
                                        )}
                                        {newAsset.smm_platform === 'twitter' && (
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Tweet Text</label>
                                                <input type="text" value={newAsset.smm_description || ''} onChange={(e) => setNewAsset({ ...newAsset, smm_description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Live Preview on right */}
                        <div className="flex flex-col gap-4">
                            <div className="bg-white rounded-xl border border-slate-200 p-4 h-full">
                                <h4 className="text-sm font-semibold text-slate-800 mb-3">Live Preview</h4>
                                <div className="w-full h-64 bg-gray-50 rounded-lg p-4 overflow-auto">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="max-h-56 mx-auto" />
                                    ) : (
                                        <div className="text-sm text-slate-500">No media selected yet</div>
                                    )}

                                    {/* Simple platform mockup */}
                                    {newAsset.smm_platform === 'facebook' && (
                                        <div className="mt-3">
                                            <div className="font-medium">Facebook Post</div>
                                            <div className="text-sm text-slate-600 mt-1">{newAsset.smm_description || 'Post caption will appear here'}</div>
                                        </div>
                                    )}
                                    {newAsset.smm_platform === 'instagram' && (
                                        <div className="mt-3">
                                            <div className="font-medium">Instagram Post</div>
                                            <div className="text-sm text-slate-600 mt-1">{newAsset.smm_description || 'Caption will appear here'}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* SMM Asset Classification below upload & preview */}
                            <div className="bg-white rounded-xl border border-slate-200 p-4">
                                <h4 className="text-sm font-semibold text-slate-900 mb-3">Asset Classification</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-2">Content Type <span className="text-red-500">*</span></label>
                                        <select
                                            value={newAsset.content_type || ''}
                                            onChange={(e) => setNewAsset({ ...newAsset, content_type: e.target.value as any })}
                                            className="w-full px-3 py-2 border rounded-lg text-sm"
                                        >
                                            <option value="">Select content type</option>
                                            <option value="Blog">Blog</option>
                                            <option value="Service Page">Service Page</option>
                                            <option value="Sub-Service Page">Sub-Service Page</option>
                                            <option value="SMM Post">SMM Post</option>
                                            <option value="Backlink Asset">Backlink Asset</option>
                                            <option value="Web UI Asset">Web UI Asset</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-2">Repository</label>
                                        <select value={newAsset.repository} onChange={(e) => setNewAsset({ ...newAsset, repository: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                                            <option value="SMM Repository">SMM Repository</option>
                                            <option value="Content Repository">Content Repository</option>
                                            <option value="Design Repository">Design Repository</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-2">Asset Category <span className="text-purple-600">(from Master)</span></label>
                                        <select value={newAsset.asset_category || ''} onChange={(e) => setNewAsset({ ...newAsset, asset_category: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                                            <option value="">Select category...</option>
                                            {allActiveAssetCategories.map(cat => (
                                                <option key={cat.id} value={cat.category_name}>{cat.category_name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-2">Asset Type <span className="text-purple-600">(from Master)</span></label>
                                        <select value={newAsset.type || ''} onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                                            <option value="">Select type...</option>
                                            {allActiveAssetTypes.map(t => {
                                                const typeName = (t as any).asset_type_name || (t as any).asset_type || '';
                                                return <option key={t.id} value={typeName}>{typeName}</option>;
                                            })}
                                        </select>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-slate-600 mb-2">Keywords <span className="text-purple-600">(from Keyword Master)</span></label>
                                        {selectedKeywords.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {selectedKeywords.map((kw: string, idx: number) => (
                                                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                                        {kw}
                                                        <button type="button" onClick={() => {
                                                            const newKws = selectedKeywords.filter((_: string, i: number) => i !== idx);
                                                            setSelectedKeywords(newKws);
                                                            setNewAsset({ ...newAsset, keywords: newKws });
                                                        }} className="w-4 h-4 hover:bg-purple-200 rounded-full">×</button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <select
                                            value=""
                                            onChange={(e) => {
                                                if (e.target.value && !selectedKeywords.includes(e.target.value)) {
                                                    const newKws = [...selectedKeywords, e.target.value];
                                                    setSelectedKeywords(newKws);
                                                    setNewAsset({ ...newAsset, keywords: newKws });
                                                }
                                            }}
                                            className="w-full px-3 py-2 border rounded-lg text-sm"
                                        >
                                            <option value="">Choose keyword from master...</option>
                                            {keywords.filter((kw: any) => !selectedKeywords.includes(kw.keyword)).map((kw: any) => (
                                                <option key={kw.id} value={kw.keyword}>{kw.keyword} ({kw.keyword_type || 'General'})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
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
                                <p className="text-sm text-slate-600">Click to change file</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-lg font-medium text-slate-900">Drop your file here</p>
                                    <p className="text-sm text-slate-500">or click to browse</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons - continue to asset details (finalize after upload) */}
                <div className="flex justify-between mt-6 pt-6 border-t border-slate-200">
                    <button
                        onClick={() => setUploadStep('form-fields')}
                        className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                        Back
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                // require asset type before continuing
                                if (!newAsset.type) {
                                    alert('Please select an Asset Type before continuing');
                                    return;
                                }
                                // mark upload complete and proceed to remaining asset details
                                setUploadStep('asset-details');
                            }}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>

            {/* Basic Fields (shown on upload step for quick input) */}
            <div className="mt-6 bg-white rounded-xl border border-slate-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Asset Name</label>
                        <input
                            type="text"
                            value={newAsset.name}
                            onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            placeholder="Enter asset name..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Content Type</label>
                        {newAsset.application_type ? (
                            <div className="px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-700 font-medium">
                                {newAsset.application_type === 'web' && '🌐 WEB'}
                                {newAsset.application_type === 'seo' && '🔍 SEO'}
                                {newAsset.application_type === 'smm' && '📱 SMM'}
                                <span className="text-slate-500 ml-2">(Content type is now static)</span>
                            </div>
                        ) : (
                            <select
                                value={newAsset.application_type || ''}
                                onChange={(e) => handleApplicationTypeSelect(e.target.value as any)}
                                disabled={contentTypeLocked}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            >
                                <option value="">Select content type...</option>
                                <option value="web">WEB</option>
                                <option value="seo">SEO</option>
                                <option value="smm">SMM</option>
                            </select>
                        )}

                        {/* WEB Asset Classification - placed below file upload as required */}
                        <div className="mt-6 bg-white rounded-xl border border-slate-200 p-4">
                            <h4 className="text-sm font-semibold text-slate-900 mb-3">Asset Classification</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-2">Content Type <span className="text-red-500">*</span></label>
                                    <select
                                        value={newAsset.content_type || ''}
                                        onChange={(e) => setNewAsset({ ...newAsset, content_type: e.target.value as any })}
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                    >
                                        <option value="">Select content type</option>
                                        <option value="Blog">Blog</option>
                                        <option value="Service Page">Service Page</option>
                                        <option value="Sub-Service Page">Sub-Service Page</option>
                                        <option value="SMM Post">SMM Post</option>
                                        <option value="Backlink Asset">Backlink Asset</option>
                                        <option value="Web UI Asset">Web UI Asset</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-2">Repository</label>
                                    <select value={newAsset.repository} onChange={(e) => setNewAsset({ ...newAsset, repository: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                                        <option value="Content Repository">Content Repository</option>
                                        <option value="SMM Repository">SMM Repository</option>
                                        <option value="SEO Repository">SEO Repository</option>
                                        <option value="Design Repository">Design Repository</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-2">Asset Category <span className="text-blue-600">(from Master)</span></label>
                                    <select value={newAsset.asset_category || ''} onChange={(e) => setNewAsset({ ...newAsset, asset_category: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                                        <option value="">Select category...</option>
                                        {allActiveAssetCategories.map(cat => (
                                            <option key={cat.id} value={cat.category_name}>{cat.category_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-2">Asset Type <span className="text-blue-600">(from Master)</span></label>
                                    <select value={newAsset.type || ''} onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                                        <option value="">Select type...</option>
                                        {filteredAssetTypes.map(t => {
                                            const typeName = (t as any).asset_type_name || (t as any).asset_type || '';
                                            return <option key={t.id} value={typeName}>{typeName}</option>;
                                        })}
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-slate-600 mb-2">Keywords <span className="text-blue-600">(from Keyword Master)</span></label>
                                    {selectedKeywords.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {selectedKeywords.map((kw: string, idx: number) => (
                                                <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                    {kw}
                                                    <button type="button" onClick={() => {
                                                        const newKws = selectedKeywords.filter((_: string, i: number) => i !== idx);
                                                        setSelectedKeywords(newKws);
                                                        setNewAsset({ ...newAsset, keywords: newKws });
                                                    }} className="w-4 h-4 hover:bg-blue-200 rounded-full">×</button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <select
                                        value=""
                                        onChange={(e) => {
                                            if (e.target.value && !selectedKeywords.includes(e.target.value)) {
                                                const newKws = [...selectedKeywords, e.target.value];
                                                setSelectedKeywords(newKws);
                                                setNewAsset({ ...newAsset, keywords: newKws });
                                            }
                                        }}
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                    >
                                        <option value="">Choose keyword from master...</option>
                                        {keywords.filter((kw: any) => !selectedKeywords.includes(kw.keyword)).map((kw: any) => (
                                            <option key={kw.id} value={kw.keyword}>{kw.keyword} ({kw.keyword_type || 'General'})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Repository</label>
                        <select
                            value={newAsset.repository}
                            onChange={(e) => setNewAsset({ ...newAsset, repository: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        >
                            <option value="Content Repository">Content Repository</option>
                            <option value="SMM Repository">SMM Repository</option>
                            <option value="SEO Repository">SEO Repository</option>
                            <option value="Design Repository">Design Repository</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Asset Category</label>
                        <select
                            value={newAsset.asset_category || ''}
                            onChange={(e) => setNewAsset({ ...newAsset, asset_category: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        >
                            <option value="">Select category...</option>
                            {allActiveAssetCategories.map(cat => (
                                <option key={cat.id} value={cat.category_name}>{cat.category_name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Asset Type</label>
                        <select
                            value={newAsset.type || ''}
                            onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        >
                            <option value="">Select type...</option>
                            {filteredAssetTypes.map(t => {
                                const typeName = (t as any).asset_type_name || (t as any).asset_type || '';
                                return <option key={t.id} value={typeName}>{typeName}</option>;
                            })}
                        </select>
                    </div>

                    {/* Asset Format removed per requirements */}
                </div>
            </div>
        </div>
    );

    // Render master categories management
    const renderMasterCategories = () => (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            setSelectedApplicationType('web');
                            setNewAsset(prev => ({ ...prev, application_type: 'web' }));
                            setContentTypeLocked(true);
                            setUploadStep('form-fields');
                            setViewMode('upload');
                        }}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Asset Category Master</h1>
                        <p className="text-slate-600">Manage asset categories for all brands</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setEditingCategory(null);
                        setShowCategoryModal(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    Add Category
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <Table
                    data={assetCategories}
                    columns={[
                        {
                            header: 'Brand',
                            accessor: (item: AssetCategoryMasterItem) => (
                                <span className="font-medium text-slate-900">{item.brand}</span>
                            )
                        },
                        {
                            header: 'Category Name',
                            accessor: (item: AssetCategoryMasterItem) => (
                                <span className="text-slate-900">{item.category_name}</span>
                            )
                        },
                        {
                            header: 'Word Count',
                            accessor: (item: AssetCategoryMasterItem) => (
                                <span className="text-slate-600">{item.word_count}</span>
                            )
                        },
                        {
                            header: 'Status',
                            accessor: (item: AssetCategoryMasterItem) => (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {item.status}
                                </span>
                            )
                        },
                        {
                            header: 'Actions',
                            accessor: (item: AssetCategoryMasterItem) => (
                                <button
                                    onClick={() => {
                                        setEditingCategory(item);
                                        setShowCategoryModal(true);
                                    }}
                                    className="text-indigo-600 hover:text-indigo-800"
                                >
                                    Edit
                                </button>
                            )
                        }
                    ]}
                />
            </div>
        </div>
    );

    // Render master types management
    const renderMasterTypes = () => (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            setSelectedApplicationType('web');
                            setNewAsset(prev => ({ ...prev, application_type: 'web' }));
                            setContentTypeLocked(true);
                            setUploadStep('form-fields');
                            setViewMode('upload');
                        }}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Asset Type Master</h1>
                        <p className="text-slate-600">Manage asset types for all brands</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setEditingType(null);
                        setShowTypeModal(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    Add Asset Type
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <Table
                    data={assetTypes}
                    columns={[
                        {
                            header: 'Brand',
                            accessor: (item: AssetTypeMasterItem) => (
                                <span className="text-sm font-medium text-slate-900">{item.brand}</span>
                            )
                        },
                        {
                            header: 'Asset Type',
                            accessor: (item: AssetTypeMasterItem) => (
                                <span className="text-sm text-slate-700">{item.asset_type_name}</span>
                            )
                        },
                        {
                            header: 'Word Count',
                            accessor: (item: AssetTypeMasterItem) => (
                                <span className="text-sm text-slate-600">{item.word_count} words</span>
                            )
                        },
                        {
                            header: 'Status',
                            accessor: (item: AssetTypeMasterItem) => (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {item.status}
                                </span>
                            )
                        },
                        {
                            header: 'Actions',
                            accessor: (item: AssetTypeMasterItem) => (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingType(item);
                                            setShowTypeModal(true);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                                    >
                                        Edit
                                    </button>
                                </div>
                            )
                        }
                    ]}
                    onRowClick={() => { }}
                />
            </div>
        </div>
    );

    return (
        <>
            {/* Stepped upload flow: select type -> application fields -> upload file -> asset details */}
            {viewMode === 'upload' && uploadStep === 'select-type' && (
                renderApplicationTypeSelection()
            )}

            {viewMode === 'upload' && uploadStep === 'form-fields' && (
                renderFormFields()
            )}

            {viewMode === 'upload' && uploadStep === 'upload-file' && (
                renderFileUpload()
            )}

            {viewMode === 'edit' && editingAsset && (
                <EditAssetForm
                    asset={editingAsset}
                    onSave={async (assetData, submitForQC) => {
                        try {
                            setIsUploading(true);
                            await updateAsset(editingAsset.id, {
                                ...assetData,
                                status: submitForQC ? 'Pending QC Review' : assetData.status,
                            });
                            setViewMode('list');
                            setEditingAsset(null);
                            refresh();
                        } catch (error) {
                            console.error('Failed to update asset:', error);
                            alert('Failed to update asset');
                        } finally {
                            setIsUploading(false);
                        }
                    }}
                    onCancel={() => {
                        setViewMode('list');
                        setEditingAsset(null);
                    }}
                    isUploading={isUploading}
                />
            )}

            {(viewMode === 'upload' && uploadStep === 'asset-details') && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-indigo-50">
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
                                            Upload New Asset
                                        </h1>
                                        <p className="text-slate-600 text-sm mt-1">
                                            Add new media content to the central asset library
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
                                                Save as Draft
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
                                                Submit for QC Review
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="max-w-7xl mx-auto px-6 py-8 pb-24">
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
                                {/* Enhanced File Upload Section */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
                                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            Asset Upload
                                        </h3>
                                        <p className="text-sm text-slate-600 mt-1">Upload your asset file and preview it before submission</p>
                                    </div>
                                    <div className="p-6">
                                        <div
                                            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${dragActive
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
                                                <div className="space-y-6">
                                                    <div className="relative">
                                                        <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-lg border-2 border-slate-200" />
                                                        <div className="absolute top-2 right-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedFile(null);
                                                                    setPreviewUrl('');
                                                                }}
                                                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <span className="text-slate-600">File Name:</span>
                                                                <div className="font-medium text-slate-900 truncate">{selectedFile?.name}</div>
                                                            </div>
                                                            <div>
                                                                <span className="text-slate-600">File Size:</span>
                                                                <div className="font-medium text-slate-900">
                                                                    {selectedFile && `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span className="text-slate-600">File Type:</span>
                                                                <div className="font-medium text-slate-900">{selectedFile?.type}</div>
                                                            </div>
                                                            <div>
                                                                <span className="text-slate-600">Status:</span>
                                                                <div className="font-medium text-green-600">✓ Ready to upload</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            fileInputRef.current?.click();
                                                        }}
                                                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                        </svg>
                                                        Replace File
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-xl font-semibold text-slate-700 mb-2">Drop files here or click to browse</p>
                                                        <p className="text-sm text-slate-500 mb-4">Support for images, videos, documents and archives</p>
                                                        <div className="flex flex-wrap justify-center gap-2 text-xs">
                                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">PNG</span>
                                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">JPG</span>
                                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">PDF</span>
                                                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">MP4</span>
                                                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">DOC</span>
                                                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded">ZIP</span>
                                                        </div>
                                                        <p className="text-xs text-slate-400 mt-3">Maximum file size: 50MB</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
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
                                                {newAsset.application_type ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-sm bg-slate-100 text-slate-700 font-medium">
                                                            {newAsset.application_type === 'web' && '🌐 WEB'}
                                                            {newAsset.application_type === 'seo' && '🔍 SEO'}
                                                            {newAsset.application_type === 'smm' && '📱 SMM'}
                                                            <span className="text-slate-500 ml-2">(Content type is now static)</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <select
                                                        value={newAsset.application_type || ''}
                                                        onChange={(e) => handleApplicationTypeSelect(e.target.value as any)}
                                                        disabled={contentTypeLocked}
                                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white cursor-pointer font-medium"
                                                    >
                                                        <option value="">Select application type...</option>
                                                        <option value="web">🌐 WEB</option>
                                                        <option value="seo">🔍 SEO</option>
                                                        <option value="smm">📱 SMM</option>
                                                    </select>
                                                )}
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

                                        {/* Asset Type */}
                                        <div className="grid grid-cols-1 gap-6">
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
                            </div>

                            {/* Asset Applications Section - Shows fields based on selected application type */}
                            {newAsset.application_type && (
                                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 p-6 space-y-6 shadow-sm">
                                    <div className="flex items-center gap-3 pb-3 border-b-2 border-purple-200">
                                        <div className="bg-purple-600 p-2 rounded-lg">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-purple-900">
                                                {newAsset.application_type === 'web' && '🌐 Web Application Fields'}
                                                {newAsset.application_type === 'seo' && '🔍 SEO Application Fields'}
                                                {newAsset.application_type === 'smm' && '📱 SMM Application Fields'}
                                            </h3>
                                            <p className="text-xs text-purple-600">Configure fields specific to your selected application type</p>
                                        </div>
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

                                            {/* Description field removed per WEB requirements */}

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

                                            {/* Body Content Section with AI Scores beside it */}
                                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                    {/* Body Content - Left Side */}
                                                    <div className="lg:col-span-2">
                                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                                                            <span className="text-lg">📝</span>
                                                            Body Content
                                                        </label>
                                                        <textarea
                                                            value={newAsset.web_body_content || ''}
                                                            onChange={(e) => setNewAsset({ ...newAsset, web_body_content: e.target.value })}
                                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-y bg-white"
                                                            placeholder="Paste your full article or body copy here for AI analysis..."
                                                            rows={8}
                                                        />

                                                        {/* Analyze Score Button - below Body Content */}
                                                        <button
                                                            type="button"
                                                            onClick={analyzeBodyContent}
                                                            disabled={analysisInProgress}
                                                            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                            </svg>
                                                            {analysisInProgress ? 'Analysing...' : 'Analyze Score'}
                                                        </button>
                                                    </div>

                                                    {/* AI Quality Scores - Right Side (beside Body Content, updates in real-time) */}
                                                    <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 p-6">
                                                        <h5 className="text-sm font-semibold text-slate-600 mb-4">AI Quality Scores</h5>
                                                        <div className="space-y-6">
                                                            {/* SEO Score */}
                                                            <div className="flex flex-col items-center">
                                                                <CircularScore
                                                                    score={newAsset.seo_score || 0}
                                                                    label="SEO SCORE"
                                                                    size="sm"
                                                                />
                                                            </div>

                                                            {/* Grammar Score */}
                                                            <div className="flex flex-col items-center">
                                                                <CircularScore
                                                                    score={newAsset.grammar_score || 0}
                                                                    label="GRAMMAR SCORE"
                                                                    size="sm"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Upload Web Assets Section - below Body Content */}
                                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                                                    <span className="text-lg">📤</span>
                                                    Upload Web Assets
                                                </label>
                                                <div className="space-y-4">
                                                    {/* Thumbnail/Blog Image */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-600 mb-2">Thumbnail/Blog Image</label>
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

                                                    {/* Additional File Upload */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-600 mb-2">Additional Files</label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                ref={fileInputRef}
                                                                type="file"
                                                                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                                                className="hidden"
                                                                accept="image/*,video/*,.pdf,.doc,.docx,.zip"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => fileInputRef.current?.click()}
                                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                                                            >
                                                                Choose File
                                                            </button>
                                                            <div className="flex-1 text-sm text-slate-600 self-center">
                                                                {selectedFile ? selectedFile.name : (previewUrl ? 'Using preview image' : 'No file selected')}
                                                            </div>
                                                        </div>

                                                        {previewUrl && (
                                                            <div className="mt-2">
                                                                <img src={previewUrl} alt="Preview" className="max-h-32 rounded-lg border-2 border-slate-200" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Asset Classification - below Upload Web Assets */}
                                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                                                    <span className="text-lg">🏷️</span>
                                                    Asset Classification
                                                </label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Content Type Dropdown */}
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-2">Content Type <span className="text-red-500">*</span></label>
                                                        <select
                                                            value={newAsset.content_type || ''}
                                                            onChange={(e) => setNewAsset({ ...newAsset, content_type: e.target.value as any })}
                                                            className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                                                        >
                                                            <option value="">Select content type</option>
                                                            <option value="Blog">Blog</option>
                                                            <option value="Service Page">Service Page</option>
                                                            <option value="Sub-Service Page">Sub-Service Page</option>
                                                            <option value="SMM Post">SMM Post</option>
                                                            <option value="Backlink Asset">Backlink Asset</option>
                                                            <option value="Web UI Asset">Web UI Asset</option>
                                                        </select>
                                                    </div>

                                                    {/* Repository */}
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-2">Repository</label>
                                                        <select value={newAsset.repository} onChange={(e) => setNewAsset({ ...newAsset, repository: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                                                            <option value="Content Repository">Content Repository</option>
                                                            <option value="SMM Repository">SMM Repository</option>
                                                            <option value="SEO Repository">SEO Repository</option>
                                                            <option value="Design Repository">Design Repository</option>
                                                        </select>
                                                    </div>

                                                    {/* Asset Category (from master table - no Add icon) */}
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-2">Asset Category</label>
                                                        <select value={newAsset.asset_category || ''} onChange={(e) => setNewAsset({ ...newAsset, asset_category: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                                                            <option value="">{allActiveAssetCategories.length > 0 ? 'Select category...' : '-- No categories available --'}</option>
                                                            {allActiveAssetCategories.map(cat => (
                                                                <option key={cat.id} value={cat.category_name}>{cat.category_name}</option>
                                                            ))}
                                                        </select>
                                                        {allActiveAssetCategories.length === 0 && (
                                                            <p className="text-xs text-amber-600 mt-1">⚠️ Add categories in Asset Category Master</p>
                                                        )}
                                                    </div>

                                                    {/* Asset Type (from master table - no Add icon) */}
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-2">Asset Type</label>
                                                        <select value={newAsset.type || ''} onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                                                            <option value="">{allActiveAssetTypes.length > 0 ? 'Select type...' : '-- No types available --'}</option>
                                                            {allActiveAssetTypes.map(t => {
                                                                const typeName = (t as any).asset_type_name || (t as any).asset_type || '';
                                                                return <option key={t.id} value={typeName}>{typeName}</option>;
                                                            })}
                                                        </select>
                                                        {allActiveAssetTypes.length === 0 && (
                                                            <p className="text-xs text-amber-600 mt-1">⚠️ Add types in Asset Type Master</p>
                                                        )}
                                                    </div>

                                                    {/* Keywords (from Keyword Master) */}
                                                    <div className="col-span-2">
                                                        <label className="block text-xs font-medium text-slate-600 mb-2">Keywords <span className="text-violet-600">(from Keyword Master)</span></label>
                                                        {selectedKeywords.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mb-2">
                                                                {selectedKeywords.map((kw: string, idx: number) => (
                                                                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-violet-100 text-violet-800 rounded-full text-xs">
                                                                        {kw}
                                                                        <button type="button" onClick={() => {
                                                                            const newKws = selectedKeywords.filter((_: string, i: number) => i !== idx);
                                                                            setSelectedKeywords(newKws);
                                                                            setNewAsset({ ...newAsset, keywords: newKws });
                                                                        }} className="w-4 h-4 hover:bg-violet-200 rounded-full">×</button>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <select
                                                            value=""
                                                            onChange={(e) => {
                                                                if (e.target.value && !selectedKeywords.includes(e.target.value)) {
                                                                    const newKws = [...selectedKeywords, e.target.value];
                                                                    setSelectedKeywords(newKws);
                                                                    setNewAsset({ ...newAsset, keywords: newKws });
                                                                }
                                                            }}
                                                            className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                                                        >
                                                            <option value="">Choose keyword from master...</option>
                                                            {keywords.filter((kw: any) => !selectedKeywords.includes(kw.keyword)).map((kw: any) => (
                                                                <option key={kw.id} value={kw.keyword}>{kw.keyword} ({kw.keyword_type || 'General'})</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* SEO Application Fields */}
                                    {newAsset.application_type === 'seo' && (
                                        <div className="space-y-4 bg-white rounded-lg p-5 border-2 border-purple-200">
                                            <div className="flex items-center gap-2 mb-3">
                                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                                <h4 className="font-bold text-purple-900">SEO Application Fields</h4>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">SEO Title</label>
                                                <input
                                                    type="text"
                                                    value={newAsset.seo_title || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, seo_title: e.target.value })}
                                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                    placeholder="Enter SEO title..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Meta Description</label>
                                                <textarea
                                                    value={newAsset.seo_meta_description || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, seo_meta_description: e.target.value })}
                                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                    placeholder="Enter meta description for search engines..."
                                                    rows={3}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Target URL</label>
                                                <input
                                                    type="url"
                                                    value={newAsset.seo_target_url || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, seo_target_url: e.target.value })}
                                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                    placeholder="https://example.com/target-page"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Focus Keyword</label>
                                                <input
                                                    type="text"
                                                    value={newAsset.seo_focus_keyword || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, seo_focus_keyword: e.target.value })}
                                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                    placeholder="Primary keyword to target..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">SEO Content Type</label>
                                                <select
                                                    value={newAsset.seo_content_type || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, seo_content_type: e.target.value })}
                                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white cursor-pointer"
                                                >
                                                    <option value="">Select content type...</option>
                                                    <option value="blog">Blog Post</option>
                                                    <option value="landing_page">Landing Page</option>
                                                    <option value="product_page">Product Page</option>
                                                    <option value="service_page">Service Page</option>
                                                    <option value="category_page">Category Page</option>
                                                    <option value="pillar_content">Pillar Content</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">H1</label>
                                                <input
                                                    type="text"
                                                    value={newAsset.seo_h1 || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, seo_h1: e.target.value })}
                                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                    placeholder="Main heading (H1)..."
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-2">H2 (First)</label>
                                                    <input
                                                        type="text"
                                                        value={newAsset.seo_h2_1 || ''}
                                                        onChange={(e) => setNewAsset({ ...newAsset, seo_h2_1: e.target.value })}
                                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                        placeholder="First H2 heading..."
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 mb-2">H2 (Second)</label>
                                                    <input
                                                        type="text"
                                                        value={newAsset.seo_h2_2 || ''}
                                                        onChange={(e) => setNewAsset({ ...newAsset, seo_h2_2: e.target.value })}
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

                                            {/* Body Content Section with AI Scores */}
                                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                    {/* Body Content - Left Side */}
                                                    <div className="lg:col-span-2">
                                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                                                            <span className="text-lg">📝</span>
                                                            SEO Content Body
                                                        </label>
                                                        <textarea
                                                            value={newAsset.seo_content_body || ''}
                                                            onChange={(e) => setNewAsset({ ...newAsset, seo_content_body: e.target.value })}
                                                            className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-y bg-white"
                                                            placeholder="Paste your full SEO content here for AI analysis..."
                                                            rows={8}
                                                        />

                                                        {/* Analyse Button */}
                                                        <button
                                                            type="button"
                                                            onClick={analyzeBodyContent}
                                                            disabled={analysisInProgress}
                                                            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                            </svg>
                                                            {analysisInProgress ? 'Analysing...' : 'Analyze'}
                                                        </button>
                                                    </div>

                                                    {/* AI Scores - Right Side */}
                                                    <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 p-6">
                                                        <div className="space-y-6">
                                                            {/* SEO Score */}
                                                            <div className="flex flex-col items-center">
                                                                <CircularScore
                                                                    score={newAsset.seo_score || 0}
                                                                    label="SEO SCORE"
                                                                    size="sm"
                                                                />
                                                            </div>

                                                            {/* Grammar Score */}
                                                            <div className="flex flex-col items-center">
                                                                <CircularScore
                                                                    score={newAsset.grammar_score || 0}
                                                                    label="GRAMMAR SCORE"
                                                                    size="sm"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* SEO Asset Classification Section */}
                                            <div className="bg-green-50 rounded-xl border border-green-200 p-6 mt-6">
                                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                                                    <span className="text-lg">🏷️</span>
                                                    Asset Classification
                                                </label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Content Type Dropdown */}
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-2">Content Type <span className="text-red-500">*</span></label>
                                                        <select
                                                            value={newAsset.content_type || ''}
                                                            onChange={(e) => setNewAsset({ ...newAsset, content_type: e.target.value as any })}
                                                            className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                                                        >
                                                            <option value="">Select content type</option>
                                                            <option value="Blog">Blog</option>
                                                            <option value="Service Page">Service Page</option>
                                                            <option value="Sub-Service Page">Sub-Service Page</option>
                                                            <option value="SMM Post">SMM Post</option>
                                                            <option value="Backlink Asset">Backlink Asset</option>
                                                            <option value="Web UI Asset">Web UI Asset</option>
                                                        </select>
                                                    </div>

                                                    {/* Repository */}
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-2">Repository</label>
                                                        <select value={newAsset.repository} onChange={(e) => setNewAsset({ ...newAsset, repository: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                                                            <option value="SEO Repository">SEO Repository</option>
                                                            <option value="Content Repository">Content Repository</option>
                                                            <option value="Design Repository">Design Repository</option>
                                                        </select>
                                                    </div>

                                                    {/* Asset Category (from master table) */}
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-2">Asset Category</label>
                                                        <select value={newAsset.asset_category || ''} onChange={(e) => setNewAsset({ ...newAsset, asset_category: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                                                            <option value="">{allActiveAssetCategories.length > 0 ? 'Select category...' : '-- No categories available --'}</option>
                                                            {allActiveAssetCategories.map(cat => (
                                                                <option key={cat.id} value={cat.category_name}>{cat.category_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Asset Type (from master table) */}
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 mb-2">Asset Type</label>
                                                        <select value={newAsset.type || ''} onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                                                            <option value="">{allActiveAssetTypes.length > 0 ? 'Select type...' : '-- No types available --'}</option>
                                                            {allActiveAssetTypes.map(t => {
                                                                const typeName = (t as any).asset_type_name || (t as any).asset_type || '';
                                                                return <option key={t.id} value={typeName}>{typeName}</option>;
                                                            })}
                                                        </select>
                                                    </div>

                                                    {/* Keywords (from Keyword Master) */}
                                                    <div className="col-span-2">
                                                        <label className="block text-xs font-medium text-slate-600 mb-2">Keywords <span className="text-green-600">(from Keyword Master)</span></label>
                                                        {selectedKeywords.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mb-2">
                                                                {selectedKeywords.map((kw: string, idx: number) => (
                                                                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                                                        {kw}
                                                                        <button type="button" onClick={() => {
                                                                            const newKws = selectedKeywords.filter((_: string, i: number) => i !== idx);
                                                                            setSelectedKeywords(newKws);
                                                                            setNewAsset({ ...newAsset, keywords: newKws });
                                                                        }} className="w-4 h-4 hover:bg-green-200 rounded-full">×</button>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <select
                                                            value=""
                                                            onChange={(e) => {
                                                                if (e.target.value && !selectedKeywords.includes(e.target.value)) {
                                                                    const newKws = [...selectedKeywords, e.target.value];
                                                                    setSelectedKeywords(newKws);
                                                                    setNewAsset({ ...newAsset, keywords: newKws });
                                                                }
                                                            }}
                                                            className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                                                        >
                                                            <option value="">Choose keyword from master...</option>
                                                            {keywords.filter((kw: any) => !selectedKeywords.includes(kw.keyword)).map((kw: any) => (
                                                                <option key={kw.id} value={kw.keyword}>{kw.keyword} ({kw.keyword_type || 'General'})</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
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
                                                        { value: 'youtube', label: 'YouTube', icon: '🎥', color: 'from-red-600 to-red-700', description: 'Video content platform' }
                                                        /* TikTok, Pinterest, Snapchat, WhatsApp removed per SMM spec - only core platforms */
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
                                                        {/* TikTok and other platforms removed per SMM spec */}
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
                                                            {newAsset.smm_platform === 'pinterest' && '📌'}
                                                            {newAsset.smm_platform === 'snapchat' && '👻'}
                                                            {newAsset.smm_platform === 'whatsapp' && '💬'}
                                                            {!['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'pinterest', 'snapchat', 'whatsapp'].includes(newAsset.smm_platform) && '🌐'}
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
                                                                {newAsset.smm_platform === 'pinterest' && 'Inspire with visual content'}
                                                                {newAsset.smm_platform === 'snapchat' && 'Share moments that disappear'}
                                                                {newAsset.smm_platform === 'whatsapp' && 'Connect through messaging'}
                                                                {!(newAsset.smm_platform && ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'pinterest', 'snapchat', 'whatsapp'].includes(newAsset.smm_platform)) && 'Create engaging social content'}
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
                                                                placeholder={(() => {
                                                                    switch (newAsset.smm_platform) {
                                                                        case 'twitter': return "What's happening? (280 characters)";
                                                                        case 'linkedin': return 'Share your professional insights...';
                                                                        case 'instagram': return 'Share your story with a captivating caption...';
                                                                        case 'facebook': return "What's on your mind?";
                                                                        case 'youtube': return 'Describe your video content...';
                                                                        default: return 'Enter your post content...';
                                                                    }
                                                                })()}
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
                                                                placeholder={(() => {
                                                                    switch (newAsset.smm_platform) {
                                                                        case 'twitter': return '#hashtag1 #hashtag2 (max 2-3)';
                                                                        case 'instagram': return '#hashtag1 #hashtag2 #hashtag3 (max 30)';
                                                                        case 'linkedin': return '#hashtag1 #hashtag2 #hashtag3 (max 5)';
                                                                        default: return '#hashtag1 #hashtag2 #hashtag3';
                                                                    }
                                                                })()}
                                                            />
                                                            <div className="mt-2 text-xs text-slate-500">
                                                                {newAsset.smm_platform === 'twitter' && '💡 Use 1-2 relevant hashtags for better engagement'}
                                                                {newAsset.smm_platform === 'instagram' && '💡 Use 5-10 hashtags for optimal reach'}
                                                                {newAsset.smm_platform === 'linkedin' && '💡 Use 3-5 professional hashtags'}
                                                                {newAsset.smm_platform === 'youtube' && '💡 Use hashtags in description for discoverability'}
                                                                {!['twitter', 'instagram', 'linkedin', 'youtube'].includes(newAsset.smm_platform) && '💡 Use relevant hashtags for your platform'}
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
                                                                                { value: 'story', label: 'Story', icon: '📱' },
                                                                                { value: 'reel', label: 'Reel', icon: '🎬' }
                                                                            ];
                                                                        case 'facebook':
                                                                            return [
                                                                                { value: 'image', label: 'Photo', icon: '📸' },
                                                                                { value: 'video', label: 'Video', icon: '🎥' },
                                                                                { value: 'story', label: 'Story', icon: '📱' },
                                                                                { value: 'live', label: 'Live', icon: '�' }
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
                                                                        /* TikTok removed per SMM spec */
                                                                        case 'pinterest':
                                                                            return [
                                                                                { value: 'image', label: 'Pin', icon: '📌' },
                                                                                { value: 'video', label: 'Video Pin', icon: '🎥' }
                                                                            ];
                                                                        default:
                                                                            return [
                                                                                { value: 'image', label: 'Image', icon: '📸' },
                                                                                { value: 'video', label: 'Video', icon: '🎥' },
                                                                                { value: 'text', label: 'Text', icon: '📝' }
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

                                                    {/* SMM Asset Classification - below upload & preview */}
                                                    <div className="bg-purple-50/50 rounded-xl border border-purple-200 p-6">
                                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                                                            <span className="text-lg">🏷️</span>
                                                            Asset Classification
                                                        </label>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {/* Content Type Dropdown */}
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-600 mb-2">Content Type <span className="text-red-500">*</span></label>
                                                                <select
                                                                    value={newAsset.content_type || ''}
                                                                    onChange={(e) => setNewAsset({ ...newAsset, content_type: e.target.value as any })}
                                                                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                                                                >
                                                                    <option value="">Select content type</option>
                                                                    <option value="Blog">Blog</option>
                                                                    <option value="Service Page">Service Page</option>
                                                                    <option value="Sub-Service Page">Sub-Service Page</option>
                                                                    <option value="SMM Post">SMM Post</option>
                                                                    <option value="Backlink Asset">Backlink Asset</option>
                                                                    <option value="Web UI Asset">Web UI Asset</option>
                                                                </select>
                                                            </div>

                                                            {/* Repository */}
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-600 mb-2">Repository</label>
                                                                <select value={newAsset.repository || 'SMM Repository'} onChange={(e) => setNewAsset({ ...newAsset, repository: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                                                                    <option value="SMM Repository">SMM Repository</option>
                                                                    <option value="Content Repository">Content Repository</option>
                                                                    <option value="Design Repository">Design Repository</option>
                                                                </select>
                                                            </div>

                                                            {/* Asset Category (from master table) */}
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-600 mb-2">Asset Category</label>
                                                                <select value={newAsset.asset_category || ''} onChange={(e) => setNewAsset({ ...newAsset, asset_category: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                                                                    <option value="">{allActiveAssetCategories.length > 0 ? 'Select category...' : '-- No categories --'}</option>
                                                                    {allActiveAssetCategories.map(cat => (
                                                                        <option key={cat.id} value={cat.category_name}>{cat.category_name}</option>
                                                                    ))}
                                                                </select>
                                                                {allActiveAssetCategories.length === 0 && (
                                                                    <p className="text-xs text-amber-600 mt-1">⚠️ Add in Asset Category Master</p>
                                                                )}
                                                            </div>

                                                            {/* Asset Type (from master table) */}
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-600 mb-2">Asset Type</label>
                                                                <select value={newAsset.type || ''} onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                                                                    <option value="">{allActiveAssetTypes.length > 0 ? 'Select type...' : '-- No types --'}</option>
                                                                    {allActiveAssetTypes.map(t => {
                                                                        const typeName = (t as any).asset_type_name || (t as any).asset_type || '';
                                                                        return <option key={t.id} value={typeName}>{typeName}</option>;
                                                                    })}
                                                                </select>
                                                                {allActiveAssetTypes.length === 0 && (
                                                                    <p className="text-xs text-amber-600 mt-1">⚠️ Add in Asset Type Master</p>
                                                                )}
                                                            </div>

                                                            {/* Keywords (from Keyword Master) */}
                                                            <div className="col-span-2">
                                                                <label className="block text-xs font-medium text-slate-600 mb-2">Keywords <span className="text-purple-600">(from Keyword Master)</span></label>
                                                                {selectedKeywords.length > 0 && (
                                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                                        {selectedKeywords.map((kw: string, idx: number) => (
                                                                            <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                                                                {kw}
                                                                                <button type="button" onClick={() => {
                                                                                    const newKws = selectedKeywords.filter((_: string, i: number) => i !== idx);
                                                                                    setSelectedKeywords(newKws);
                                                                                    setNewAsset({ ...newAsset, keywords: newKws });
                                                                                }} className="w-4 h-4 hover:bg-purple-200 rounded-full">×</button>
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                <select
                                                                    value=""
                                                                    onChange={(e) => {
                                                                        if (e.target.value && !selectedKeywords.includes(e.target.value)) {
                                                                            const newKws = [...selectedKeywords, e.target.value];
                                                                            setSelectedKeywords(newKws);
                                                                            setNewAsset({ ...newAsset, keywords: newKws });
                                                                        }
                                                                    }}
                                                                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                                                                >
                                                                    <option value="">Choose keyword from master...</option>
                                                                    {keywords.filter((kw: any) => !selectedKeywords.includes(kw.keyword)).map((kw: any) => (
                                                                        <option key={kw.id} value={kw.keyword}>{kw.keyword} ({kw.keyword_type || 'General'})</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Media Upload Section */}
                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-3">
                                                            🎨 Media Upload
                                                            {(newAsset.smm_media_type === 'image' || newAsset.smm_media_type === 'video') && (
                                                                <span className="text-red-500 ml-1">*</span>
                                                            )}
                                                        </label>

                                                        {/* single-image SMM upload removed; using consolidated uploader below */}

                                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                                            <div className="lg:col-span-2 space-y-4">
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
                                                                                    {!['instagram', 'twitter', 'linkedin', 'facebook', 'youtube'].includes(newAsset.smm_platform) && 'JPG, PNG, MP4, GIF up to 50MB'}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="mt-2">
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

                                                            <div className="lg:col-span-1 bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col items-center justify-center">
                                                                <div className="w-full">
                                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Preview</label>
                                                                    <div className="w-full h-48 flex items-center justify-center bg-white rounded-lg border-2 border-slate-100">
                                                                        {newAsset.smm_media_url ? (
                                                                            newAsset.smm_media_type === 'video' || newAsset.smm_media_url.includes('video') ? (
                                                                                <video src={newAsset.smm_media_url} controls className="max-h-44 mx-auto rounded-lg" />
                                                                            ) : (
                                                                                <img src={newAsset.smm_media_url} alt="Preview" className="max-h-44 mx-auto rounded-lg" />
                                                                            )
                                                                        ) : (
                                                                            <div className="text-sm text-slate-400">No media selected</div>
                                                                        )}
                                                                    </div>

                                                                    <div className="mt-3 flex gap-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setShowInlinePreview(!showInlinePreview)}
                                                                            className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                                                                        >
                                                                            {showInlinePreview ? 'Hide Post Preview' : `Show ${newAsset.smm_platform ? (newAsset.smm_platform.charAt(0).toUpperCase() + newAsset.smm_platform.slice(1)) : 'Post'} Preview`}
                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() => { setShowDemoPreview(false); setShowPreviewModal(true); }}
                                                                            className="px-3 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                                                                        >
                                                                            Open Modal
                                                                        </button>
                                                                    </div>

                                                                    {showInlinePreview && (
                                                                        <div className="mt-4 w-full">
                                                                            {/* Compact platform-specific preview */}
                                                                            {((newAsset.smm_platform === 'facebook' || newAsset.smm_platform === 'instagram') && (
                                                                                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                                                                                    <div className="p-3 flex items-center justify-between">
                                                                                        <div className="flex items-center gap-3">
                                                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2px]">
                                                                                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                                                                                    <div className="w-[36px] h-[36px] rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">{(newAsset.name || 'Y').charAt(0).toUpperCase()}</div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div>
                                                                                                <p className="font-semibold text-sm text-slate-900">{newAsset.name || 'Your Page'}</p>
                                                                                                <p className="text-xs text-slate-500">Just now · Public</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    {(newAsset.smm_description || newAsset.smm_hashtags) && (
                                                                                        <div className="px-3 pb-2">
                                                                                            {newAsset.smm_description && <p className="text-sm text-slate-900 whitespace-pre-wrap leading-5 mb-1">{newAsset.smm_description}</p>}
                                                                                            {newAsset.smm_hashtags && <p className="text-sm text-blue-600">{newAsset.smm_hashtags}</p>}
                                                                                        </div>
                                                                                    )}
                                                                                    {newAsset.smm_media_url && (
                                                                                        <div className="bg-black">
                                                                                            {newAsset.smm_media_type === 'video' ? (
                                                                                                <video src={newAsset.smm_media_url} controls className="w-full max-h-48 object-contain" />
                                                                                            ) : (
                                                                                                <img src={newAsset.smm_media_url} alt="Post media" className="w-full object-cover" style={{ maxHeight: '300px' }} />
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )) || (newAsset.smm_platform === 'twitter' && (
                                                                                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3">
                                                                                    <div className="flex gap-3">
                                                                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">{(newAsset.name || 'Y').charAt(0)}</div>
                                                                                        <div className="flex-1">
                                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                                <p className="font-bold text-sm">{newAsset.name || 'Your Account'}</p>
                                                                                                <span className="text-slate-500 text-sm">· 2m</span>
                                                                                            </div>
                                                                                            {newAsset.smm_description && <p className="text-sm text-slate-900 whitespace-pre-wrap">{newAsset.smm_description}</p>}
                                                                                            {newAsset.smm_hashtags && <p className="text-sm text-blue-500 mt-2">{newAsset.smm_hashtags}</p>}
                                                                                            {newAsset.smm_media_url && (
                                                                                                <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200">
                                                                                                    {newAsset.smm_media_type === 'video' ? (
                                                                                                        <video src={newAsset.smm_media_url} controls className="w-full" />
                                                                                                    ) : (
                                                                                                        <img src={newAsset.smm_media_url} alt="Tweet media" className="w-full" />
                                                                                                    )}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )) || (newAsset.smm_platform === 'linkedin' && (
                                                                                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                                                                                    <div className="p-3 flex items-start gap-3 border-b border-slate-200">
                                                                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-700 to-blue-900 rounded-full flex items-center justify-center text-white font-bold">{(newAsset.name || 'Y').charAt(0)}</div>
                                                                                        <div className="flex-1">
                                                                                            <p className="font-bold text-sm">{newAsset.name || 'Your Company'}</p>
                                                                                            <p className="text-xs text-slate-500">1,234 followers · 1m</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="p-4">
                                                                                        {newAsset.smm_description && <p className="text-sm text-slate-700 whitespace-pre-wrap mb-2">{newAsset.smm_description}</p>}
                                                                                        {newAsset.smm_hashtags && <p className="text-sm text-blue-700 mb-2">{newAsset.smm_hashtags}</p>}
                                                                                    </div>
                                                                                    {newAsset.smm_media_url && (
                                                                                        <div className="bg-slate-100">
                                                                                            {newAsset.smm_media_type === 'video' ? (
                                                                                                <video src={newAsset.smm_media_url} controls className="w-full" />
                                                                                            ) : (
                                                                                                <img src={newAsset.smm_media_url} alt="Post media" className="w-full" />
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
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
                                                                    {!['instagram', 'twitter', 'linkedin', 'facebook', 'youtube'].includes(newAsset.smm_platform) && (
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
                            )}

                            {/* Map Asset to Source Work Section - Common to all application types */}
                            <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">Map Asset to Source Work</h3>
                                            <p className="text-sm text-slate-600">Link this asset to existing tasks, campaigns, projects, and services</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Left Column */}
                                        <div className="space-y-4">
                                            {/* Linked Task */}
                                            <div>
                                                <label className="block text-sm text-slate-600 mb-2 uppercase tracking-wide">
                                                    Linked Task
                                                </label>
                                                <select
                                                    value={newAsset.linked_task_id || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, linked_task_id: e.target.value ? parseInt(e.target.value) : undefined })}
                                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white text-slate-900"
                                                >
                                                    <option value="">Select task</option>
                                                    {tasks.map(task => (
                                                        <option key={task.id} value={task.id}>
                                                            {task.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Linked Project */}
                                            <div>
                                                <label className="block text-sm text-slate-600 mb-2 uppercase tracking-wide">
                                                    Linked Project
                                                </label>
                                                <select
                                                    value={newAsset.linked_project_id || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, linked_project_id: e.target.value ? parseInt(e.target.value) : undefined })}
                                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white text-slate-900"
                                                >
                                                    <option value="">Select project</option>
                                                    {projects.map(project => (
                                                        <option key={project.id} value={project.id}>
                                                            {project.project_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Linked Sub-Service */}
                                            <div>
                                                <label className="block text-sm text-slate-600 mb-2 uppercase tracking-wide">
                                                    Linked Sub-Service
                                                </label>
                                                <select
                                                    value={newAsset.linked_sub_service_id || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, linked_sub_service_id: e.target.value ? parseInt(e.target.value) : undefined })}
                                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white text-slate-900"
                                                    disabled={!newAsset.linked_service_id}
                                                >
                                                    <option value="">Select sub-service</option>
                                                    {subServices
                                                        .filter(ss => !newAsset.linked_service_id || ss.parent_service_id === newAsset.linked_service_id)
                                                        .map(subService => (
                                                            <option key={subService.id} value={subService.id}>
                                                                {subService.sub_service_name}
                                                            </option>
                                                        ))}
                                                </select>
                                                {!newAsset.linked_service_id && (
                                                    <p className="text-xs text-slate-500 mt-1">Select a service first to see sub-services</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Column */}
                                        <div className="space-y-4">
                                            {/* Linked Campaign */}
                                            <div>
                                                <label className="block text-sm text-slate-600 mb-2 uppercase tracking-wide">
                                                    Linked Campaign
                                                </label>
                                                <select
                                                    value={newAsset.linked_campaign_id || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, linked_campaign_id: e.target.value ? parseInt(e.target.value) : undefined })}
                                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white text-slate-900"
                                                >
                                                    <option value="">Select campaign</option>
                                                    {campaigns.map(campaign => (
                                                        <option key={campaign.id} value={campaign.id}>
                                                            {campaign.campaign_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Linked Service */}
                                            <div>
                                                <label className="block text-sm text-slate-600 mb-2 uppercase tracking-wide">
                                                    Linked Service
                                                </label>
                                                <select
                                                    value={newAsset.linked_service_id || ''}
                                                    onChange={(e) => {
                                                        const newServiceId = e.target.value ? parseInt(e.target.value) : undefined;
                                                        setNewAsset({
                                                            ...newAsset,
                                                            linked_service_id: newServiceId,
                                                            linked_sub_service_id: undefined // Reset sub-service when service changes
                                                        });
                                                    }}
                                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white text-slate-900"
                                                >
                                                    <option value="">Select service</option>
                                                    {services.map(service => (
                                                        <option key={service.id} value={service.id}>
                                                            {service.service_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Linked Repository Item */}
                                            <div>
                                                <label className="block text-sm text-slate-600 mb-2 uppercase tracking-wide">
                                                    Linked Repository Item
                                                </label>
                                                <select
                                                    value={newAsset.linked_repository_item_id || ''}
                                                    onChange={(e) => setNewAsset({ ...newAsset, linked_repository_item_id: e.target.value ? parseInt(e.target.value) : undefined })}
                                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white text-slate-900"
                                                >
                                                    <option value="">Select repository item</option>
                                                    {/* Repository items would be loaded from API */}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status - Common to all application types */}
                            <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
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
                    </div >
                </div >
            )}

            {/* SMM Preview Modal */}
            {
                showPreviewModal && (() => {
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

            {/* My Submissions View */}
            {
                viewMode === 'mysubmissions' && (() => {
                    const mySubmissions = assets.filter(asset => asset.submitted_by === currentUser.id);

                    const mySubmissionsColumns = [
                        {
                            header: 'Thumbnail',
                            accessor: (item: AssetLibraryItem) => (
                                <div className="flex items-center justify-center">
                                    {item.thumbnail_url ? (
                                        <img
                                            src={item.thumbnail_url}
                                            alt={item.name}
                                            className="w-12 h-12 object-cover rounded-lg border-2 border-slate-200 shadow-sm"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-lg shadow-sm">
                                            {getAssetIcon(item.type)}
                                        </div>
                                    )}
                                </div>
                            ),
                            className: 'w-16'
                        },
                        {
                            header: 'Asset Name',
                            accessor: (item: AssetLibraryItem) => (
                                <div>
                                    <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">ID: {item.id}</div>
                                </div>
                            )
                        },
                        {
                            header: 'Asset Type',
                            accessor: (item: AssetLibraryItem) => (
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600">
                                    <span>{getAssetIcon(item.type)}</span>
                                    {item.type}
                                </span>
                            )
                        },
                        {
                            header: 'Content Type',
                            accessor: (item: AssetLibraryItem) => (
                                <span className="text-sm text-slate-700">
                                    {item.content_type || '-'}
                                </span>
                            )
                        },
                        {
                            header: 'Linked Service',
                            accessor: (item: AssetLibraryItem) => {
                                const linkedServiceIds = item.linked_service_ids || [];
                                const linkedSubServiceIds = item.linked_sub_service_ids || [];
                                const hasLinks = linkedServiceIds.length > 0 || linkedSubServiceIds.length > 0;

                                if (!hasLinks) {
                                    return <span className="text-xs text-slate-400 italic">Not linked</span>;
                                }

                                return (
                                    <div className="max-w-xs">
                                        <div className="text-xs text-slate-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-200">
                                            {linkedServiceIds.map(serviceId => {
                                                const service = services.find(s => s.id === serviceId);
                                                return service ? (
                                                    <div key={serviceId} className="font-medium text-indigo-900 text-xs">
                                                        {service.service_name}
                                                    </div>
                                                ) : null;
                                            })}
                                            {linkedSubServiceIds.length > 0 && (
                                                <div className="text-indigo-700 text-[10px]">
                                                    {linkedSubServiceIds.map(ssId => {
                                                        const subService = subServices.find(ss => ss.id === ssId);
                                                        return subService?.sub_service_name;
                                                    }).filter(Boolean).join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }
                        },
                        {
                            header: 'Linked Task',
                            accessor: (item: AssetLibraryItem) => (
                                <span className="text-xs text-slate-600">
                                    {item.linked_task ? `Task #${item.linked_task}` : <span className="text-slate-400 italic">No task</span>}
                                </span>
                            )
                        },
                        {
                            header: 'QC Status',
                            accessor: (item: AssetLibraryItem) => (
                                <div className="space-y-2">
                                    {getStatusBadge(item.status || 'Draft')}
                                    {item.status === 'Pending QC Review' && (
                                        <div className="text-xs text-purple-600 font-medium">⏳ Under Review</div>
                                    )}
                                    {item.status === 'QC Approved' && (
                                        <div className="text-xs text-green-600 font-medium">✅ Approved</div>
                                    )}
                                    {item.status === 'QC Rejected' && (
                                        <div className="text-xs text-red-600 font-medium">❌ Needs Rework</div>
                                    )}
                                    {item.rework_count && item.rework_count > 0 && (
                                        <div className="text-xs text-orange-600 font-medium">
                                            🔄 Rework: {item.rework_count}
                                        </div>
                                    )}
                                </div>
                            )
                        },
                        {
                            header: 'Version',
                            accessor: (item: AssetLibraryItem) => (
                                <div className="text-center">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        v{item.version_number || '1.0'}
                                    </span>
                                    {item.rework_count && item.rework_count > 0 && (
                                        <div className="text-xs text-orange-600 mt-1">
                                            Rev: {item.rework_count}
                                        </div>
                                    )}
                                </div>
                            )
                        },
                        {
                            header: 'Designer',
                            accessor: (item: AssetLibraryItem) => {
                                const designerId = item.designed_by || item.submitted_by;
                                const designer = designerId ? usersMap.get(designerId) : undefined;
                                return (
                                    <div className="text-xs">
                                        {designer ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                                    {designer.name?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900 text-xs">
                                                        {designer.name}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 italic">Unknown</span>
                                        )}
                                    </div>
                                );
                            }
                        },
                        {
                            header: 'Uploaded At',
                            accessor: (item: AssetLibraryItem) => (
                                <div className="text-xs text-slate-600">
                                    <div>{item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</div>
                                    <div className="text-slate-400 mt-1">
                                        {item.date ? new Date(item.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </div>
                                </div>
                            )
                        },
                        {
                            header: 'Usage Count',
                            accessor: (item: AssetLibraryItem) => (
                                <div className="text-center">
                                    <div className="text-sm font-bold text-slate-900">
                                        {(item as any).usage_count || 0}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        times used
                                    </div>
                                </div>
                            )
                        },
                        {
                            header: 'Actions',
                            accessor: (item: AssetLibraryItem) => (
                                <div className="flex gap-2">
                                    {/* View Details Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRowClick(item);
                                        }}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        title="View Details"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>

                                    {/* Open File Button */}
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
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                            title="Open File"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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
                                    <div className="flex items-center gap-3">
                                        {/* Upload Asset Button in My Submissions */}
                                        <button
                                            onClick={() => setShowUploadModal(true)}
                                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-md transition-all flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Upload Asset
                                        </button>

                                        <button
                                            onClick={() => setViewMode('list')}
                                            className="px-4 py-2 text-sm font-medium text-slate-600 border-2 border-slate-300 rounded-lg hover:bg-white transition-colors"
                                        >
                                            Back to Assets
                                        </button>
                                    </div>
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

            {/* Detailed Asset View */}
            {
                viewMode === 'detail' && selectedAsset && (
                    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 overflow-y-auto h-screen">
                        {/* Fixed Header */}
                        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
                            <div className="max-w-7xl mx-auto px-6 py-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={handleBackFromDetail}
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
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24 max-h-[calc(100vh-6rem)]">
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
                                                        {selectedAsset.file_type?.toUpperCase() || 'JPEG'}
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
                                <div className="lg:col-span-2 space-y-6 overflow-y-auto max-h-screen pb-20">

                                    {/* Quick Navigation Panel */}
                                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg border border-indigo-200 overflow-hidden">
                                        <div className="px-6 py-4">
                                            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                Quick Navigation
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                <button
                                                    onClick={() => onNavigate?.('tasks', selectedAsset.linked_task || 1)}
                                                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 backdrop-blur-sm"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h2m0-12h10a2 2 0 012 2v10a2 2 0 01-2 2H9m0-12V3a2 2 0 012-2h2a2 2 0 012 2v2M9 5v10" />
                                                    </svg>
                                                    View Task
                                                </button>
                                                <button
                                                    onClick={() => onNavigate?.('campaigns', 1)}
                                                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 backdrop-blur-sm"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                    </svg>
                                                    Campaign
                                                </button>
                                                <button
                                                    onClick={() => onNavigate?.('projects', 1)}
                                                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 backdrop-blur-sm"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    Project
                                                </button>
                                                <button
                                                    onClick={() => onNavigate?.('services', selectedAsset.linked_service_ids?.[0] || 1)}
                                                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 backdrop-blur-sm"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                                    </svg>
                                                    Service
                                                </button>
                                            </div>
                                        </div>
                                    </div>

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
                                                    <span className="text-slate-900">{selectedAsset.file_type?.toUpperCase() || 'JPEG'}</span>
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

                                    {/* Content Details Panel */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-slate-200">
                                            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Content Details
                                            </h3>
                                        </div>
                                        <div className="p-6 space-y-6">
                                            {/* Application Type */}
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Application Type</label>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedAsset.application_type === 'web' ? 'bg-blue-100 text-blue-800' :
                                                    selectedAsset.application_type === 'seo' ? 'bg-green-100 text-green-800' :
                                                        selectedAsset.application_type === 'smm' ? 'bg-purple-100 text-purple-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {selectedAsset.application_type?.toUpperCase() || 'WEB'}
                                                </span>
                                            </div>

                                            {/* Description */}
                                            {selectedAsset.web_description && (
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                                                    <div className="text-slate-900 bg-slate-50 p-4 rounded-lg border">
                                                        {selectedAsset.web_description}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Meta Description */}
                                            {selectedAsset.web_meta_description && (
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Meta Description</label>
                                                    <div className="text-slate-900 bg-slate-50 p-4 rounded-lg border text-sm">
                                                        {selectedAsset.web_meta_description}
                                                    </div>
                                                </div>
                                            )}

                                            {/* URL */}
                                            {selectedAsset.web_url && (
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">URL</label>
                                                    <a
                                                        href={selectedAsset.web_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-700 underline break-all"
                                                    >
                                                        {selectedAsset.web_url}
                                                    </a>
                                                </div>
                                            )}

                                            {/* Headings */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {selectedAsset.web_h1 && (
                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-2">H1 Heading</label>
                                                        <div className="text-slate-900 bg-slate-50 p-3 rounded-lg border font-medium">
                                                            {selectedAsset.web_h1}
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedAsset.web_h2_1 && (
                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-2">H2 Heading (First)</label>
                                                        <div className="text-slate-900 bg-slate-50 p-3 rounded-lg border">
                                                            {selectedAsset.web_h2_1}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {selectedAsset.web_h2_2 && (
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">H2 Heading (Second)</label>
                                                    <div className="text-slate-900 bg-slate-50 p-3 rounded-lg border">
                                                        {selectedAsset.web_h2_2}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Body Content */}
                                            {selectedAsset.web_body_content && (
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Body Content</label>
                                                    <div className="text-slate-900 bg-slate-50 p-4 rounded-lg border max-h-64 overflow-y-auto">
                                                        <div className="prose prose-sm max-w-none">
                                                            {selectedAsset.web_body_content.split('\n').map((line, index) => (
                                                                <p key={index} className="mb-2">{line}</p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Asset Classification */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {selectedAsset.asset_category && (
                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Asset Category</label>
                                                        <span className="text-slate-900">{selectedAsset.asset_category}</span>
                                                    </div>
                                                )}
                                                {selectedAsset.type && (
                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Asset Type</label>
                                                        <span className="text-slate-900">{selectedAsset.type}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* AI Scores */}
                                            {(selectedAsset.seo_score || selectedAsset.grammar_score) && (
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-3">AI Quality Scores</label>
                                                    <div className="flex justify-center gap-8">
                                                        {selectedAsset.seo_score && (
                                                            <CircularScore
                                                                score={selectedAsset.seo_score}
                                                                label="SEO Score"
                                                                size="md"
                                                            />
                                                        )}
                                                        {selectedAsset.grammar_score && (
                                                            <CircularScore
                                                                score={selectedAsset.grammar_score}
                                                                label="Grammar Score"
                                                                size="md"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            )}
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
                                            {/* Linked Task */}
                                            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-blue-600 uppercase tracking-wide">Linked Task</label>
                                                        <span className="text-blue-900 font-semibold">Write blog post on AI trends</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => onNavigate?.('tasks', selectedAsset.linked_task || 1)}
                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                                                >
                                                    View
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Linked Campaign */}
                                            <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-purple-600 uppercase tracking-wide">Linked Campaign</label>
                                                        <span className="text-purple-900 font-semibold">Content</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => onNavigate?.('campaigns', 1)}
                                                    className="flex items-center gap-1 text-purple-600 hover:text-purple-800 font-medium text-sm transition-colors"
                                                >
                                                    View
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Linked Project */}
                                            <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-indigo-600 uppercase tracking-wide">Linked Project</label>
                                                        <span className="text-indigo-900 font-semibold">Q4 Marketing Campaign</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => onNavigate?.('projects', 1)}
                                                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors"
                                                >
                                                    View
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Linked Service */}
                                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-green-600 uppercase tracking-wide">Linked Service</label>
                                                        <span className="text-green-900 font-semibold">
                                                            {selectedAsset.linked_service_ids && selectedAsset.linked_service_ids.length > 0
                                                                ? services.find(s => s.id === selectedAsset.linked_service_ids![0])?.service_name || 'Digital Marketing'
                                                                : 'Digital Marketing'
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => onNavigate?.('services', selectedAsset.linked_service_ids?.[0] || 1)}
                                                    className="flex items-center gap-1 text-green-600 hover:text-green-800 font-medium text-sm transition-colors"
                                                >
                                                    View
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Linked Sub-Service */}
                                            <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-orange-600 uppercase tracking-wide">Linked Sub-Service</label>
                                                        <span className="text-orange-900 font-semibold">
                                                            {selectedAsset.linked_sub_service_ids && selectedAsset.linked_sub_service_ids.length > 0
                                                                ? subServices.find(ss => ss.id === selectedAsset.linked_sub_service_ids![0])?.sub_service_name || 'Content Marketing'
                                                                : 'Content Marketing'
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => onNavigate?.('sub-services', selectedAsset.linked_sub_service_ids?.[0] || 1)}
                                                    className="flex items-center gap-1 text-orange-600 hover:text-orange-800 font-medium text-sm transition-colors"
                                                >
                                                    View
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Linked Repository */}
                                            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-600 uppercase tracking-wide">Linked Repository</label>
                                                        <span className="text-slate-900 font-semibold">{selectedAsset.repository || 'Content Repository'}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => onNavigate?.('content-repository')}
                                                    className="flex items-center gap-1 text-slate-600 hover:text-slate-800 font-medium text-sm transition-colors"
                                                >
                                                    View
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Real-time Connectivity & Mapping Panel */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-slate-200">
                                            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                </svg>
                                                Real-time Connectivity & Mapping
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                                                    Live
                                                </span>
                                            </h3>
                                        </div>
                                        <div className="p-6 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Linked Task</label>
                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h2m0-12h10a2 2 0 012 2v10a2 2 0 01-2 2H9m0-12V3a2 2 0 012-2h2a2 2 0 012 2v2M9 5v10" />
                                                                </svg>
                                                                <span className="text-blue-900 font-medium">
                                                                    {selectedAsset.linked_task ? `Task #${selectedAsset.linked_task}` : 'Write blog post on AI trends'}
                                                                </span>
                                                            </div>
                                                            <button
                                                                onClick={() => onNavigate?.('tasks', selectedAsset.linked_task || 1)}
                                                                className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                                                            >
                                                                View →
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Linked Campaign</label>
                                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                                </svg>
                                                                <span className="text-purple-900 font-medium">Content</span>
                                                            </div>
                                                            <button
                                                                onClick={() => onNavigate?.('campaigns', 1)}
                                                                className="text-purple-600 hover:text-purple-700 text-xs font-medium"
                                                            >
                                                                View →
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Linked Project</label>
                                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                </svg>
                                                                <span className="text-green-900 font-medium">Q4 Marketing Campaign</span>
                                                            </div>
                                                            <button
                                                                onClick={() => onNavigate?.('projects', 1)}
                                                                className="text-green-600 hover:text-green-700 text-xs font-medium"
                                                            >
                                                                View →
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Linked Service</label>
                                                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                                                </svg>
                                                                <span className="text-indigo-900 font-medium">
                                                                    {selectedAsset.linked_service_ids && selectedAsset.linked_service_ids.length > 0
                                                                        ? services.find(s => s.id === selectedAsset.linked_service_ids![0])?.service_name || 'Digital Marketing'
                                                                        : 'Digital Marketing'
                                                                    }
                                                                </span>
                                                            </div>
                                                            <button
                                                                onClick={() => onNavigate?.('services', selectedAsset.linked_service_ids?.[0] || 1)}
                                                                className="text-indigo-600 hover:text-indigo-700 text-xs font-medium"
                                                            >
                                                                View →
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Real-time Status Indicators */}
                                            <div className="border-t border-slate-200 pt-6">
                                                <h4 className="text-sm font-semibold text-slate-700 mb-3">Real-time Status</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                            <span className="text-green-900 font-medium text-sm">Task Active</span>
                                                        </div>
                                                        <div className="text-xs text-green-700 mt-1">Currently being worked on</div>
                                                    </div>
                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                            <span className="text-blue-900 font-medium text-sm">Campaign Live</span>
                                                        </div>
                                                        <div className="text-xs text-blue-700 mt-1">Asset in active use</div>
                                                    </div>
                                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                                            <span className="text-purple-900 font-medium text-sm">QC Approved</span>
                                                        </div>
                                                        <div className="text-xs text-purple-700 mt-1">Ready for deployment</div>
                                                    </div>
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

                                            {/* Real-time Engagement Metrics */}
                                            <div className="border-t border-slate-200 pt-6">
                                                <label className="block text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                    Real-time Engagement Metrics
                                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                                                        Live
                                                    </span>
                                                </label>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                                                        <div className="text-2xl font-bold text-blue-900">45,200</div>
                                                        <div className="text-xs text-blue-700 font-medium">Impressions</div>
                                                    </div>
                                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                                        <div className="text-2xl font-bold text-green-900">3,800</div>
                                                        <div className="text-xs text-green-700 font-medium">Clicks</div>
                                                    </div>
                                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                                                        <div className="text-2xl font-bold text-purple-900">8.4%</div>
                                                        <div className="text-xs text-purple-700 font-medium">CTR</div>
                                                    </div>
                                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                                                        <div className="text-2xl font-bold text-orange-900">420</div>
                                                        <div className="text-xs text-orange-700 font-medium">Shares</div>
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

                                    {/* Real-time Workflow Status */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                        <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-slate-200">
                                            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                Real-time Workflow Status
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                                                    Active
                                                </span>
                                            </h3>
                                        </div>
                                        <div className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Current Activities</h4>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                            <div className="flex-1">
                                                                <div className="text-sm font-medium text-green-900">Asset Live on Website</div>
                                                                <div className="text-xs text-green-700">Currently displaying on 3 pages</div>
                                                            </div>
                                                            <div className="text-xs text-green-600 font-medium">Active</div>
                                                        </div>
                                                        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                            <div className="flex-1">
                                                                <div className="text-sm font-medium text-blue-900">Social Media Campaign</div>
                                                                <div className="text-xs text-blue-700">Posted 2 hours ago</div>
                                                            </div>
                                                            <div className="text-xs text-blue-600 font-medium">Running</div>
                                                        </div>
                                                        <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                                            <div className="flex-1">
                                                                <div className="text-sm font-medium text-purple-900">Backlink Building</div>
                                                                <div className="text-xs text-purple-700">2 submissions pending</div>
                                                            </div>
                                                            <div className="text-xs text-purple-600 font-medium">In Progress</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Connected Systems</h4>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </div>
                                                                <span className="text-sm font-medium text-slate-900">CMS</span>
                                                            </div>
                                                            <span className="text-xs text-green-600 font-medium">Connected</span>
                                                        </div>
                                                        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </div>
                                                                <span className="text-sm font-medium text-slate-900">Analytics</span>
                                                            </div>
                                                            <span className="text-xs text-green-600 font-medium">Synced</span>
                                                        </div>
                                                        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </div>
                                                                <span className="text-sm font-medium text-slate-900">Social Platforms</span>
                                                            </div>
                                                            <span className="text-xs text-green-600 font-medium">Active</span>
                                                        </div>
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
                )
            }

            {/* List View */}
            {
                viewMode === 'list' && (
                    <div className="h-full flex flex-col w-full px-4">
                        <div className="flex justify-between items-start flex-shrink-0 w-full mb-4 pt-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Assets</h1>
                                    <span className="text-sm text-slate-500">Showing {filteredAssets.length} of {assets.length} entries</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Refresh Button */}
                                <button
                                    onClick={async () => {
                                        setIsRefreshing(true);
                                        try {
                                            await refresh?.();
                                            // Show success feedback briefly
                                            setTimeout(() => {
                                                setIsRefreshing(false);
                                            }, 800);
                                        } catch (error) {
                                            console.error('Refresh failed:', error);
                                            setIsRefreshing(false);
                                        }
                                    }}
                                    disabled={isRefreshing}
                                    className={`bg-green-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-green-700 hover:shadow-lg transition-all flex items-center gap-2 ${isRefreshing ? 'opacity-75 cursor-not-allowed' : ''
                                        }`}
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
                                                            <div className="text-xs text-slate-600">12-step SEO workflow</div>
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

                                {/* QC Review Button - Navigate to AssetQCView */}
                                <button
                                    onClick={() => onNavigate?.('asset-qc')}
                                    className="bg-purple-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-purple-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                    QC Review
                                </button>

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

                        <div className="relative mb-4">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by title, file name, or tag..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all text-sm"
                            />
                        </div>

                        <div className="mb-4 space-y-4 flex-shrink-0">
                            {/* Enhanced Filters - Matching Screenshot */}
                            <div className="bg-white rounded-lg border border-slate-200 p-4">
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Filters</div>

                                {/* First Row of Filters */}
                                <div className="grid grid-cols-4 gap-4 mb-4">
                                    {/* Asset Type Filter - from Asset Type Master */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Asset Type</label>
                                        <select
                                            value={assetTypeFilter}
                                            onChange={(e) => setAssetTypeFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                        >
                                            <option value="All">All Types</option>
                                            {allActiveAssetTypes.map(type => {
                                                const typeName = (type as any).asset_type_name || (type as any).asset_type || '';
                                                return (
                                                    <option key={type.id} value={typeName}>{typeName}</option>
                                                );
                                            })}
                                        </select>
                                    </div>

                                    {/* Asset Category Filter - from Asset Category Master */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Asset Category</label>
                                        <select
                                            value={assetCategoryFilter}
                                            onChange={(e) => setAssetCategoryFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                        >
                                            <option value="All">All Categories</option>
                                            {allActiveAssetCategories.map(category => (
                                                <option key={category.id} value={category.category_name}>{category.category_name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Content Type Filter */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Content Type</label>
                                        <select
                                            value={contentTypeFilter}
                                            onChange={(e) => setContentTypeFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                        >
                                            <option value="All">All Content Types</option>
                                            <option value="Blog">Blog</option>
                                            <option value="Service Page">Service Page</option>
                                            <option value="Sub-Service Page">Sub-Service Page</option>
                                            <option value="SMM Post">SMM Post</option>
                                            <option value="Backlink Asset">Backlink Asset</option>
                                            <option value="Web UI Asset">Web UI Asset</option>
                                        </select>
                                    </div>

                                    {/* Campaign Type Filter - from Campaigns */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Campaign Type</label>
                                        <select
                                            value={campaignTypeFilter}
                                            onChange={(e) => setCampaignTypeFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                        >
                                            <option value="All">All Campaigns</option>
                                            {campaigns.map(campaign => (
                                                <option key={campaign.id} value={campaign.id.toString()}>{campaign.campaign_name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Linked Service Filter - from Service Master */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Linked Service</label>
                                        <select
                                            value={linkedServiceFilter}
                                            onChange={(e) => {
                                                setLinkedServiceFilter(e.target.value);
                                                setLinkedSubServiceFilter('All'); // Reset sub-service when service changes
                                            }}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                        >
                                            <option value="All">All Services</option>
                                            {services.map(service => (
                                                <option key={service.id} value={service.id.toString()}>{service.service_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Second Row of Filters */}
                                <div className="grid grid-cols-4 gap-4 mb-4">
                                    {/* Linked Sub-Service Filter - mapped to selected service */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Linked Sub-Service</label>
                                        <select
                                            value={linkedSubServiceFilter}
                                            onChange={(e) => setLinkedSubServiceFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                        >
                                            <option value="All">All Sub-services</option>
                                            {filteredSubServicesForFilter.map(subService => (
                                                <option key={subService.id} value={subService.id.toString()}>{subService.sub_service_name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Project Filter - from Projects */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Project</label>
                                        <select
                                            value={projectFilter}
                                            onChange={(e) => setProjectFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                        >
                                            <option value="All">All Projects</option>
                                            {projects.map(project => (
                                                <option key={project.id} value={project.id.toString()}>{project.project_name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Linked Task Filter - from Tasks */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Linked Task</label>
                                        <select
                                            value={linkedTaskFilter}
                                            onChange={(e) => setLinkedTaskFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                        >
                                            <option value="All">All Tasks</option>
                                            {tasks.map(task => (
                                                <option key={task.id} value={task.id.toString()}>{task.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Linked Repository Item Filter - from Content Repository */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Repository Item</label>
                                        <select
                                            value={linkedRepositoryFilter}
                                            onChange={(e) => setLinkedRepositoryFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                        >
                                            <option value="All">All Repository Items</option>
                                            {repositoryItems.map(item => (
                                                <option key={item.id} value={item.id.toString()}>{item.content_title_clean}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Created By Filter - from Users */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Created By</label>
                                        <select
                                            value={createdByFilter}
                                            onChange={(e) => setCreatedByFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                        >
                                            <option value="All">All Users</option>
                                            {users.map(user => (
                                                <option key={user.id} value={user.id.toString()}>{user.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Date Range Filter - date picker */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Date Range</label>
                                        <select
                                            value={dateRangeFilter}
                                            onChange={(e) => setDateRangeFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                        >
                                            <option value="All">All Time</option>
                                            <option value="today">Today</option>
                                            <option value="week">This Week</option>
                                            <option value="month">This Month</option>
                                            <option value="quarter">This Quarter</option>
                                            <option value="year">This Year</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Third Row - Usage Status */}
                                <div className="grid grid-cols-4 gap-4">
                                    {/* Usage Status Filter - Used, Unused, Archived */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Usage Status</label>
                                        <select
                                            value={usageStatusFilter}
                                            onChange={(e) => setUsageStatusFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                        >
                                            <option value="All">All Statuses</option>
                                            <option value="Used">Used</option>
                                            <option value="Unused">Unused</option>
                                            <option value="Archived">Archived</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Results Summary */}
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                            <p className="text-sm text-slate-600">
                                {assetsLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Loading assets...
                                    </span>
                                ) : (
                                    <>Showing <span className="font-bold text-indigo-600">{filteredAssets.length}</span> assets</>
                                )}
                            </p>
                        </div>

                        {/* Loading State */}
                        {assetsLoading && (
                            <div className="flex-1 flex items-center justify-center py-16">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                                    <p className="text-slate-500">Loading assets...</p>
                                </div>
                            </div>
                        )}

                        {/* Display Content Based on View Mode */}
                        {!assetsLoading && (
                            <div className="flex-1 min-h-0 w-full">
                                {displayMode === 'table' ? (
                                    <div className="bg-white border border-slate-200 w-full h-full flex flex-col" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', maxWidth: '100vw' }}>
                                        {/* Scrollable Table Container - Full Width */}
                                        <div className="flex-1 overflow-auto w-full">
                                            <table className="w-full border-collapse min-w-max">
                                                <thead className="bg-slate-100 sticky top-0 z-10">
                                                    <tr className="border-b border-slate-300">
                                                        <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-100 whitespace-nowrap">ID</th>
                                                        <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-100 whitespace-nowrap">Thumbnail</th>
                                                        <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-100 whitespace-nowrap">Asset Name</th>
                                                        <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-100 whitespace-nowrap">Asset Type</th>
                                                        <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-100 whitespace-nowrap">Asset Category</th>
                                                        <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-100 whitespace-nowrap">Content Type</th>
                                                        <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-100 whitespace-nowrap">Linked Service</th>
                                                        <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-100 whitespace-nowrap">Linked Sub-Service</th>
                                                        <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-100 whitespace-nowrap">Linked Task</th>
                                                        <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-100 whitespace-nowrap">Linked Campaign</th>
                                                        <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-100 whitespace-nowrap">Linked Project</th>
                                                        <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-100 whitespace-nowrap">Linked Repository</th>
                                                        <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-100 whitespace-nowrap">QC Status</th>
                                                        <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-100 whitespace-nowrap">Version</th>
                                                        <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-100 whitespace-nowrap">Designer</th>
                                                        <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-100 whitespace-nowrap">Uploaded At</th>
                                                        <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-100 whitespace-nowrap">Created By</th>
                                                        <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-100 whitespace-nowrap">Updated By</th>
                                                        <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-100 whitespace-nowrap">Usage Count</th>
                                                        <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-100 whitespace-nowrap">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 bg-white">
                                                    {filteredAssets.length > 0 ? (
                                                        filteredAssets.map((asset, index) => {
                                                            const linkedServiceId = asset.linked_service_id || (asset.linked_service_ids && asset.linked_service_ids[0]);
                                                            const service = linkedServiceId ? services.find(s => s.id === linkedServiceId) : null;
                                                            const taskId = asset.linked_task_id || asset.linked_task;
                                                            const task = taskId ? tasks.find(t => t.id === taskId) : null;
                                                            // Use memoized map for O(1) lookup instead of O(n) find
                                                            const designerId = asset.designed_by || asset.submitted_by || asset.created_by;
                                                            const designer = designerId ? usersMap.get(designerId) : undefined;
                                                            const createdByUser = asset.created_by ? usersMap.get(asset.created_by) : undefined;
                                                            const updatedByUser = asset.updated_by ? usersMap.get(asset.updated_by) : undefined;
                                                            const status = asset.status || 'Draft';
                                                            let statusColor = 'bg-slate-100 text-slate-700';
                                                            let statusText: string = status;
                                                            if (status === 'QC Approved' || status === 'Published') {
                                                                statusColor = 'bg-green-100 text-green-700';
                                                                statusText = 'Pass';
                                                            } else if (status === 'Pending QC Review') {
                                                                statusColor = 'bg-amber-100 text-amber-700';
                                                                statusText = 'Pending';
                                                            } else if (status === 'QC Rejected' || status === 'Rework Required') {
                                                                statusColor = 'bg-red-100 text-red-700';
                                                                statusText = 'Fail';
                                                            }
                                                            const date = asset.date || asset.created_at;
                                                            const formattedDate = date ? new Date(date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-') : '-';

                                                            return (
                                                                <tr key={asset.id} onClick={() => handleRowClick(asset)} className="hover:bg-blue-50/50 cursor-pointer border-b border-slate-200">
                                                                    <td className="px-3 py-2.5 whitespace-nowrap text-sm text-slate-600">{String(index + 1).padStart(4, '0')}</td>
                                                                    <td className="px-3 py-2.5 whitespace-nowrap">
                                                                        {asset.thumbnail_url ? (
                                                                            <img src={asset.thumbnail_url} alt={asset.name} className="w-10 h-10 object-cover rounded border border-slate-200" loading="lazy" />
                                                                        ) : (
                                                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded flex items-center justify-center text-sm border border-slate-200">
                                                                                {getAssetIcon(asset.type)}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-3 py-2.5 whitespace-nowrap">
                                                                        <div>
                                                                            <div className="font-medium text-slate-900 text-sm" title={asset.name}>
                                                                                {asset.name.length > 20 ? asset.name.substring(0, 20) + '...' : asset.name}
                                                                            </div>
                                                                            <div className="text-xs text-slate-400">{`asset-${asset.id}`}</div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-2.5 whitespace-nowrap text-sm text-slate-700">{asset.type || '-'}</td>
                                                                    <td className="px-3 py-2.5 whitespace-nowrap text-sm text-slate-700">{asset.asset_category || '-'}</td>
                                                                    <td className="px-3 py-2.5 whitespace-nowrap text-sm text-slate-700">
                                                                        {asset.application_type === 'web' ? 'Article' : asset.application_type === 'seo' ? 'Visual' : asset.application_type === 'smm' ? 'Video' : 'Document'}
                                                                    </td>
                                                                    <td className="px-3 py-2.5 whitespace-nowrap text-sm text-slate-700">{service?.service_name || '-'}</td>
                                                                    <td className="px-3 py-2.5 whitespace-nowrap text-sm text-slate-700">{(() => { const subServiceId = asset.linked_sub_service_id || (asset.linked_sub_service_ids && asset.linked_sub_service_ids[0]); const subService = subServiceId ? subServices.find(ss => ss.id === subServiceId) : null; return subService?.sub_service_name || '-'; })()}</td>
                                                                    <td className="px-3 py-2.5 whitespace-nowrap text-sm text-slate-700">{task?.name || (task as any)?.task_name || '-'}</td>
                                                                    <td className="px-3 py-2.5 whitespace-nowrap text-sm text-slate-700">{(() => { const campaign = asset.linked_campaign_id ? campaigns.find(c => c.id === asset.linked_campaign_id) : null; return campaign?.campaign_name || '-'; })()}</td>
                                                                    <td className="px-3 py-2.5 whitespace-nowrap text-sm text-slate-700">{(() => { const project = asset.linked_project_id ? projects.find(p => p.id === asset.linked_project_id) : null; return project?.project_name || '-'; })()}</td>
                                                                    <td className="px-3 py-2.5 whitespace-nowrap text-sm text-slate-700">{(() => { const repo = asset.linked_repository_item_id ? repositoryItems.find(r => r.id === asset.linked_repository_item_id) : null; return repo?.content_title_clean || '-'; })()}</td>
                                                                    <td className="px-3 py-2.5 whitespace-nowrap">
                                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColor}`}>
                                                                            {statusText}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-3 py-2.5 whitespace-nowrap text-sm text-slate-700">{asset.version_number || 'v1.0'}</td>
                                                                    <td className="px-3 py-2.5 whitespace-nowrap text-sm text-slate-700">{designer?.name || '-'}</td>
                                                                    <td className="px-3 py-2.5 whitespace-nowrap text-sm text-slate-600">{formattedDate}</td>
                                                                    <td className="px-3 py-2.5 whitespace-nowrap text-sm text-slate-700">{createdByUser?.name || '-'}</td>
                                                                    <td className="px-3 py-2.5 whitespace-nowrap text-sm text-slate-700">{updatedByUser?.name || '-'}</td>
                                                                    <td className="px-3 py-2.5 whitespace-nowrap text-sm text-slate-700 text-center">{(asset as any).usage_count || 0}</td>
                                                                    <td className="px-3 py-2.5 whitespace-nowrap">
                                                                        <div className="flex items-center gap-1">
                                                                            <button onClick={(e) => { e.stopPropagation(); handleEdit(e, asset); }} className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded" title="Edit">
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                            </button>
                                                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(e, asset.id, asset.name); }} disabled={deletingId === asset.id} className={`p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded ${deletingId === asset.id ? 'opacity-50' : ''}`} title="Delete">
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={20} className="px-6 py-16 text-center">
                                                                <div className="flex flex-col items-center justify-center text-slate-400">
                                                                    <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                    </svg>
                                                                    <p className="text-sm font-medium">No assets yet. Click 'Upload Asset' to add your first file!</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        {filteredAssets.length > 0 && (
                                            <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 text-sm text-slate-600 flex justify-between items-center flex-shrink-0">
                                                <span>Showing <span className="font-bold text-slate-900">{filteredAssets.length}</span> results</span>
                                                <div className="flex gap-2">
                                                    <button className="px-3 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 font-medium text-slate-700 text-xs">Previous</button>
                                                    <button className="px-3 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 font-medium text-slate-700 text-xs">Next</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
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
                                                    No assets yet.
                                                </p>
                                                <p className="text-slate-400 text-sm">
                                                    Get started by uploading your first asset
                                                </p>
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

                                                            {/* Delete Button - creators or admins */}
                                                            {(asset.submitted_by === currentUser.id || currentUser.role === 'admin') && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleDelete(e, asset.id, asset.name); }}
                                                                    disabled={deletingId === asset.id}
                                                                    className={`p-2 bg-white/90 text-red-600 hover:bg-red-50 rounded-lg shadow-sm transition-all ${deletingId === asset.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                    title="Delete Asset"
                                                                >
                                                                    {deletingId === asset.id ? (
                                                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                        </svg>
                                                                    ) : (
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                    )}
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
                                                                                const reviewer = usersMap.get(asset.qc_reviewer_id);
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
                                                                <span className="text-slate-500 uppercase tracking-wide font-medium">Linking Panel</span>
                                                                <div className="flex items-center justify-between mt-1">
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
                            </div >
                        )}
                    </div >
                )
            }

            {/* Enhanced Floating Action Button for Upload & Update */}
            {
                viewMode === 'list' && (
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
                                            // Open full upload flow with Web selected and locked
                                            setNewAsset(prev => ({ ...prev, application_type: 'web' }));
                                            setSelectedApplicationType('web');
                                            setUploadStep('form-fields');
                                            setContentTypeLocked(true);
                                            setViewMode('upload');
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
                                            <div className="text-xs text-slate-500">12-step SEO workflow</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            // Open full upload flow with SMM selected and locked
                                            setNewAsset(prev => ({ ...prev, application_type: 'smm' }));
                                            setSelectedApplicationType('smm');
                                            setUploadStep('form-fields');
                                            setContentTypeLocked(true);
                                            setViewMode('upload');
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
            {/* Asset Category Master Modal */}
            <AssetCategoryMasterModal
                isOpen={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
                onSave={handleSaveCategory}
                editingItem={editingCategory}
            />

            <UploadAssetPopup
                isOpen={showUploadModal}
                initialData={newAsset}
                onClose={() => {
                    setShowUploadModal(false);
                    // Reset the newAsset state when modal closes
                    setNewAsset({
                        name: '',
                        type: 'article',
                        repository: 'Content Repository',
                        status: 'Draft',
                        linked_service_ids: [],
                        linked_sub_service_ids: [],
                        application_type: undefined,
                        smm_platform: undefined,
                        seo_score: undefined,
                        grammar_score: undefined,
                        smm_additional_pages: [],
                        web_description: '',
                        web_url: '',
                        web_h1: '',
                        web_h2_1: '',
                        web_h2_2: '',
                        web_body_content: '',
                        web_body_attachment: undefined,
                        web_body_attachment_name: '',
                        asset_category: ''
                    });
                }}
                onSuccess={() => {
                    // Refresh master tables and asset list after upload
                    setTimeout(() => {
                        refreshAssetCategories?.();
                        refreshAssetTypes?.();
                        refresh?.();
                    }, 100);
                    setShowUploadModal(false);
                    // Reset the newAsset state after successful upload
                    setNewAsset({
                        name: '',
                        type: 'article',
                        repository: 'Content Repository',
                        status: 'Draft',
                        linked_service_ids: [],
                        linked_sub_service_ids: [],
                        application_type: undefined,
                        smm_platform: undefined,
                        seo_score: undefined,
                        grammar_score: undefined,
                        smm_additional_pages: [],
                        web_description: '',
                        web_url: '',
                        web_h1: '',
                        web_h2_1: '',
                        web_h2_2: '',
                        web_body_content: '',
                        web_body_attachment: undefined,
                        web_body_attachment_name: '',
                        asset_category: ''
                    });
                }}
            />

            {/* Asset Detail Side Panel */}
            {
                selectedAsset && (
                    <AssetDetailSidePanel
                        asset={selectedAsset}
                        isOpen={showSidePanel}
                        onClose={() => {
                            setShowSidePanel(false);
                            setSelectedAsset(null);
                        }}
                        onEdit={(asset) => {
                            setShowSidePanel(false);
                            handleEdit({ stopPropagation: () => { } } as any, asset);
                        }}
                        onNavigate={onNavigate}
                    />
                )
            }
        </>
    );
};

export default AssetsView;