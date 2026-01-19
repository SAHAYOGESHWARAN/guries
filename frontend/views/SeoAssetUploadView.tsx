import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import MarkdownEditor from '../components/MarkdownEditor';
import type {
    Task, Campaign, Project, Service, SubServiceItem,
    ContentRepositoryItem, User, Keyword,
    AssetTypeMasterItem, AssetCategoryMasterItem, AssetLibraryItem
} from '../types';

interface SeoAssetUploadViewProps {
    onNavigate?: (view: string, id?: number) => void;
    editAssetId?: number;
}

// Self QC Status Options (User can update after adding domain)
const SELF_QC_STATUS_OPTIONS = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' }
];

// QA Status Options (Verifier only - Pass/Fail)
const QA_STATUS_OPTIONS = [
    { value: '', label: 'Not Reviewed' },
    { value: 'Pass', label: 'Pass' },
    { value: 'Fail', label: 'Fail' }
];

interface DomainDetails {
    id?: number;
    domain_name: string;
    url_posted: string;
    seo_self_qc_status: string;
    qa_status: string;
    approval_status?: string;
}

const SeoAssetUploadView: React.FC<SeoAssetUploadViewProps> = ({ onNavigate, editAssetId }) => {
    const { user } = useAuth();
    const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';

    // Data hooks for master tables
    const { data: tasks = [] } = useData<Task>('tasks');
    const { data: campaigns = [] } = useData<Campaign>('campaigns');
    const { data: projects = [] } = useData<Project>('projects');
    const { data: services = [] } = useData<Service>('services');
    const { data: subServices = [] } = useData<SubServiceItem>('subServices');
    const { data: repositoryItems = [] } = useData<ContentRepositoryItem>('content');
    const { data: users = [] } = useData<User>('users');
    const { data: keywords = [] } = useData<Keyword>('keywords');
    const { data: assetTypes = [] } = useData<AssetTypeMasterItem>('asset-type-master');
    const { data: assetCategories = [] } = useData<AssetCategoryMasterItem>('asset-category-master');
    const { data: existingAssets = [] } = useData<AssetLibraryItem>('assetLibrary');
    const { data: industrySectors = [] } = useData<any>('industrySectors');

    // SEO Asset specific master data (fetched from dedicated endpoints)
    const [backlinkDomains, setBacklinkDomains] = useState<Array<{ id: number; name: string; url: string; da: number }>>([]);
    const [seoAssetDomainTypes, setSeoAssetDomainTypes] = useState<string[]>([]);

    // Fetch SEO Asset master data on mount
    useEffect(() => {
        // Fetch backlink domains from SEO-specific endpoint
        fetch(`${apiUrl}/seo-assets/master/backlink-domains`)
            .then(res => res.json())
            .then(data => setBacklinkDomains(data || []))
            .catch(() => setBacklinkDomains([]));

        // Fetch domain types from SEO-specific endpoint
        fetch(`${apiUrl}/seo-assets/master/domain-types`)
            .then(res => res.json())
            .then(data => setSeoAssetDomainTypes(data || []))
            .catch(() => setSeoAssetDomainTypes([]));
    }, [apiUrl]);

    // ========== STEP 1: Asset ID Selection ==========
    const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
    const [isAssetIdLocked, setIsAssetIdLocked] = useState(false);
    const [isManualEntryMode, setIsManualEntryMode] = useState(false); // True when user skips Asset ID selection

    // ========== STEP 2: Map Asset to Source Work ==========
    const [linkedTaskId, setLinkedTaskId] = useState<number | null>(null);
    const [linkedCampaignId, setLinkedCampaignId] = useState<number | null>(null);
    const [linkedProjectId, setLinkedProjectId] = useState<number | null>(null);
    const [linkedServiceId, setLinkedServiceId] = useState<number | null>(null);
    const [linkedSubServiceIds, setLinkedSubServiceIds] = useState<number[]>([]);
    const [linkedRepositoryId, setLinkedRepositoryId] = useState<number | null>(null);

    // ========== STEP 3: Asset Classification ==========
    const [assetType, setAssetType] = useState('');
    const [assetCategory, setAssetCategory] = useState('');
    const [sector, setSector] = useState('');
    const [industry, setIndustry] = useState('');

    // ========== STEP 4: SEO Metadata Fields & Anchor Text ==========
    const [seoTitle, setSeoTitle] = useState('');
    const [metaTitle, setMetaTitle] = useState('');
    const [description, setDescription] = useState('');
    const [serviceUrl, setServiceUrl] = useState('');
    const [blogUrl, setBlogUrl] = useState('');
    const [anchorText, setAnchorText] = useState('');

    // ========== STEP 5: Keywords ==========
    const [primaryKeywordId, setPrimaryKeywordId] = useState<number | null>(null);
    const [lsiKeywordIds, setLsiKeywordIds] = useState<number[]>([]);

    // ========== STEP 6: Domain Type & Domain Addition ==========
    const [domainType, setDomainType] = useState('');
    const [selectedDomains, setSelectedDomains] = useState<DomainDetails[]>([]);
    const [showDomainDropdown, setShowDomainDropdown] = useState(false);
    const [selectedDomainToAdd, setSelectedDomainToAdd] = useState('');

    // ========== Domain Update & Self QC Popup ==========
    const [showDomainPopup, setShowDomainPopup] = useState(false);
    const [editingDomainIndex, setEditingDomainIndex] = useState<number | null>(null);
    const [domainPopupData, setDomainPopupData] = useState<DomainDetails>({
        domain_name: '',
        url_posted: '',
        seo_self_qc_status: 'Pending',
        qa_status: '',
        approval_status: 'Pending'
    });

    // ========== Verifier QA Review Popup ==========
    const [showQAReviewPopup, setShowQAReviewPopup] = useState(false);
    const [qaReviewDomainIndex, setQAReviewDomainIndex] = useState<number | null>(null);
    const [qaReviewVerdict, setQAReviewVerdict] = useState<'Pass' | 'Fail' | ''>('');

    // ========== STEP 8: Blog Content (Conditional) ==========
    const [blogContent, setBlogContent] = useState('');

    // ========== STEP 9: Resource File Upload ==========
    const [resourceFiles, setResourceFiles] = useState<File[]>([]);
    const [dragActive, setDragActive] = useState(false);

    // ========== STEP 10: Designer & Workflow ==========
    const [assignedTeamMembers, setAssignedTeamMembers] = useState<number[]>([]);
    const [verifiedBy, setVerifiedBy] = useState<number | null>(null);

    // ========== STEP 11: Versioning ==========
    const [versionNumber, setVersionNumber] = useState('v1.0');
    const [showVersionHistory, setShowVersionHistory] = useState(false);
    const [versionHistory, setVersionHistory] = useState<Array<{ version: string; date: string; action: string }>>([]);

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingAsset, setIsFetchingAsset] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const currentUser = user || { id: 1, name: 'Current User' };

    // Sections are always enabled - Asset ID is optional
    const sectionsEnabled = true;

    // Linked fields are read-only when Asset ID is selected (not in manual entry mode)
    const linkedFieldsReadOnly = isAssetIdLocked && !isManualEntryMode;

    // Filter sub-services based on selected service
    const filteredSubServices = useMemo(() =>
        linkedServiceId
            ? subServices.filter(ss => ss.parent_service_id === linkedServiceId)
            : [],
        [linkedServiceId, subServices]
    );

    // Active asset types from master
    const activeAssetTypes = useMemo(() =>
        assetTypes.filter(t => t.status === 'active'),
        [assetTypes]
    );

    // Get unique sectors and industries from master
    const sectors = useMemo(() =>
        [...new Set(industrySectors.map((item: any) => item.sector).filter(Boolean))],
        [industrySectors]
    );

    const industries = useMemo(() =>
        [...new Set(industrySectors.map((item: any) => item.industry).filter(Boolean))],
        [industrySectors]
    );

    // Domain types from SEO Asset master endpoint
    const domainTypes = seoAssetDomainTypes;

    // Check if Blog Posting type (for conditional content editor)
    const isBlogPosting = assetType.toLowerCase().includes('blog');

    // ========== Handle Asset ID Selection ==========
    const handleAssetIdSelect = async (assetId: number) => {
        if (assetId) {
            setSelectedAssetId(assetId);
            setIsAssetIdLocked(true);
            setIsFetchingAsset(true);

            // Pre-fill data from selected asset - first try from local cache
            const asset = existingAssets.find(a => a.id === assetId);
            if (asset) {
                // Auto-fetch all linked details from the asset
                setLinkedTaskId(asset.linked_task_id || asset.linked_task || null);
                setLinkedCampaignId(asset.linked_campaign_id || null);
                setLinkedProjectId(asset.linked_project_id || null);
                setLinkedServiceId(asset.linked_service_id || (asset.linked_service_ids && asset.linked_service_ids[0]) || null);
                setLinkedSubServiceIds(asset.linked_sub_service_ids || []);
                setLinkedRepositoryId(asset.linked_repository_item_id || null);
                setAssetType(asset.type || asset.asset_type || '');
                setAssetCategory(asset.asset_category || '');
                setSeoTitle(asset.name || asset.seo_title || '');
            }

            // Also fetch from API for complete data
            try {
                const response = await fetch(`${apiUrl}/assetLibrary/${assetId}`);
                if (response.ok) {
                    const fullAsset = await response.json();
                    // Update with complete data from API
                    setLinkedTaskId(fullAsset.linked_task_id || fullAsset.linked_task || null);
                    setLinkedCampaignId(fullAsset.linked_campaign_id || null);
                    setLinkedProjectId(fullAsset.linked_project_id || null);
                    setLinkedServiceId(fullAsset.linked_service_id || (fullAsset.linked_service_ids && fullAsset.linked_service_ids[0]) || null);
                    setLinkedSubServiceIds(fullAsset.linked_sub_service_ids || []);
                    setLinkedRepositoryId(fullAsset.linked_repository_item_id || null);
                    if (fullAsset.type || fullAsset.asset_type) setAssetType(fullAsset.type || fullAsset.asset_type);
                    if (fullAsset.asset_category) setAssetCategory(fullAsset.asset_category);
                    if (fullAsset.name || fullAsset.seo_title) setSeoTitle(fullAsset.name || fullAsset.seo_title);
                }
            } catch (err) {
                console.log('Using cached asset data');
            } finally {
                setIsFetchingAsset(false);
            }
        }
    };

    // Handle Change Selection - Reset linked fields for manual entry
    const handleChangeSelection = () => {
        setIsAssetIdLocked(false);
        setSelectedAssetId(null);
        setIsManualEntryMode(false);
        // Reset linked fields to allow manual entry
        setLinkedTaskId(null);
        setLinkedCampaignId(null);
        setLinkedProjectId(null);
        setLinkedServiceId(null);
        setLinkedSubServiceIds([]);
        setLinkedRepositoryId(null);
    };

    // Handle Skip Asset ID - Enable manual entry mode
    const handleSkipAssetId = () => {
        setIsManualEntryMode(true);
        setSelectedAssetId(null);
        setIsAssetIdLocked(false);
        // Reset linked fields for fresh manual entry
        setLinkedTaskId(null);
        setLinkedCampaignId(null);
        setLinkedProjectId(null);
        setLinkedServiceId(null);
        setLinkedSubServiceIds([]);
        setLinkedRepositoryId(null);
    };

    // Load existing SEO asset if editing
    useEffect(() => {
        if (editAssetId) {
            // Fetch the SEO asset data
            fetch(`${apiUrl}/seo-assets/${editAssetId}`)
                .then(res => res.json())
                .then(data => {
                    if (data && !data.error) {
                        setSelectedAssetId(data.linked_asset_id || data.id);
                        setIsAssetIdLocked(true);
                        setLinkedTaskId(data.linked_task_id || null);
                        setLinkedCampaignId(data.linked_campaign_id || null);
                        setLinkedProjectId(data.linked_project_id || null);
                        setLinkedServiceId(data.linked_service_id || null);
                        setLinkedSubServiceIds(data.linked_sub_service_ids || []);
                        setLinkedRepositoryId(data.linked_repository_item_id || null);
                        setAssetType(data.asset_type || data.type || '');
                        setSeoTitle(data.seo_title || data.name || '');
                        setMetaTitle(data.seo_meta_title || '');
                        setDescription(data.seo_description || '');
                        setServiceUrl(data.seo_service_url || data.service_url || '');
                        setBlogUrl(data.seo_blog_url || data.blog_url || '');
                        setAnchorText(data.seo_anchor_text || data.anchor_text || '');
                        setBlogContent(data.seo_blog_content || data.blog_content || '');
                        setVersionNumber(data.version_number || 'v1.0');
                        setVersionHistory(data.version_history || []);

                        // Load domain-related fields
                        setDomainType(data.seo_domain_type || data.domain_type || '');
                        setSelectedDomains(data.seo_domains || []);

                        // Load keyword fields
                        setPrimaryKeywordId(data.seo_primary_keyword_id || data.primary_keyword_id || null);
                        setLsiKeywordIds(data.seo_lsi_keywords || data.lsi_keywords || []);

                        // Load classification fields
                        setSector(data.seo_sector_id || data.sector_id || '');
                        setIndustry(data.seo_industry_id || data.industry_id || '');

                        // Load workflow fields
                        setAssignedTeamMembers(data.assigned_team_members || []);
                        setVerifiedBy(data.verified_by || null);
                    }
                })
                .catch(err => console.error('Error loading SEO asset:', err));
        }
    }, [editAssetId, apiUrl]);

    // Calculate Approval Status automatically based on Self QC and QA statuses
    // Approved: Self QC = Approved AND QA = Pass
    // Rejected: Self QC = Rejected OR QA = Fail
    // Pending: All other cases (waiting for review)
    const calculateApprovalStatus = (selfQcStatus: string, qaStatus: string): string => {
        if (selfQcStatus === 'Approved' && qaStatus === 'Pass') return 'Approved';
        if (selfQcStatus === 'Rejected' || qaStatus === 'Fail') return 'Rejected';
        return 'Pending';
    };

    // Check if current user is a verifier (can update QA Status)
    const isVerifier = verifiedBy === currentUser.id;

    // ========== Domain Handlers ==========
    // Add domain from dropdown selection
    const handleAddDomainFromDropdown = (domainName: string) => {
        if (!domainName) return;

        // Check if domain already added
        if (selectedDomains.some(d => d.domain_name === domainName)) {
            alert('This domain is already added');
            return;
        }

        const newDomain: DomainDetails = {
            domain_name: domainName,
            url_posted: '',
            seo_self_qc_status: 'Pending',
            qa_status: '',
            approval_status: 'Pending'
        };

        setSelectedDomains([...selectedDomains, newDomain]);
        setSelectedDomainToAdd('');
        setShowDomainDropdown(false);
    };

    // Click on domain to edit URL Posted and Self QC Status
    const handleDomainClick = (index: number) => {
        setEditingDomainIndex(index);
        setDomainPopupData({ ...selectedDomains[index] });
        setShowDomainPopup(true);
    };

    // Open QA Review popup (for verifier)
    const handleOpenQAReview = (index: number) => {
        setQAReviewDomainIndex(index);
        setQAReviewVerdict(selectedDomains[index].qa_status as 'Pass' | 'Fail' | '' || '');
        setShowQAReviewPopup(true);
    };

    // Submit QA Review verdict
    const handleSubmitQAVerdict = () => {
        if (qaReviewDomainIndex === null || !qaReviewVerdict) return;

        const domain = selectedDomains[qaReviewDomainIndex];
        const approvalStatus = calculateApprovalStatus(domain.seo_self_qc_status, qaReviewVerdict);

        const updatedDomain = {
            ...domain,
            qa_status: qaReviewVerdict,
            approval_status: approvalStatus
        };
        const updated = [...selectedDomains];
        updated[qaReviewDomainIndex] = updatedDomain;
        setSelectedDomains(updated);

        setShowQAReviewPopup(false);
        setQAReviewDomainIndex(null);
        setQAReviewVerdict('');
    };

    // Save URL Posted and Self QC Status for domain
    const handleSaveDomainDetails = () => {
        if (editingDomainIndex === null) return;

        const approvalStatus = calculateApprovalStatus(
            domainPopupData.seo_self_qc_status,
            domainPopupData.qa_status
        );

        const updatedDomain = { ...domainPopupData, approval_status: approvalStatus };
        const updated = [...selectedDomains];
        updated[editingDomainIndex] = updatedDomain;
        setSelectedDomains(updated);

        setShowDomainPopup(false);
        setEditingDomainIndex(null);
    };

    const handleDeleteDomain = (index: number) => {
        setSelectedDomains(selectedDomains.filter((_, i) => i !== index));
    };


    // ========== File Upload Handlers ==========
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setResourceFiles([...resourceFiles, ...Array.from(e.target.files)]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files) {
            setResourceFiles([...resourceFiles, ...Array.from(e.dataTransfer.files)]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleFileRemove = (index: number) => {
        setResourceFiles(resourceFiles.filter((_, i) => i !== index));
    };

    // ========== Team Member Selection ==========
    const toggleTeamMember = (userId: number) => {
        if (assignedTeamMembers.includes(userId)) {
            setAssignedTeamMembers(assignedTeamMembers.filter(id => id !== userId));
        } else {
            setAssignedTeamMembers([...assignedTeamMembers, userId]);
        }
    };

    // ========== LSI Keywords Selection ==========
    const toggleLsiKeyword = (keywordId: number) => {
        if (lsiKeywordIds.includes(keywordId)) {
            setLsiKeywordIds(lsiKeywordIds.filter(id => id !== keywordId));
        } else {
            setLsiKeywordIds([...lsiKeywordIds, keywordId]);
        }
    };

    // ========== Form Validation ==========
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Asset ID is optional - user can select or skip
        // No validation for assetId - it's not mandatory
        if (!seoTitle.trim()) newErrors.seoTitle = 'Title is required';
        if (!metaTitle.trim()) newErrors.metaTitle = 'Meta Title is required';
        if (!description.trim()) newErrors.description = 'Description is required';
        if (!anchorText.trim()) newErrors.anchorText = 'Anchor Text is required';
        if (!primaryKeywordId) newErrors.primaryKeyword = 'Primary Keyword is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ========== Build Payload ==========
    const buildPayload = (status: string) => {
        return {
            name: seoTitle || metaTitle,
            linked_asset_id: selectedAssetId,
            linked_task_id: linkedTaskId,
            linked_campaign_id: linkedCampaignId,
            linked_project_id: linkedProjectId,
            linked_service_id: linkedServiceId,
            linked_sub_service_ids: linkedSubServiceIds,
            linked_repository_item_id: linkedRepositoryId,
            asset_type: assetType,
            asset_category: assetCategory,
            type: assetType,
            sector_id: sector,
            industry_id: industry,
            seo_title: seoTitle,
            seo_meta_title: metaTitle,
            seo_description: description,
            meta_description: description,
            service_url: serviceUrl,
            blog_url: blogUrl,
            anchor_text: anchorText,
            primary_keyword_id: primaryKeywordId,
            lsi_keywords: lsiKeywordIds,
            domain_type: domainType,
            seo_domains: selectedDomains,
            blog_content: blogContent,
            body_content: blogContent,
            assigned_team_members: assignedTeamMembers,
            created_by: currentUser.id,
            verified_by: verifiedBy,
            version_number: versionNumber,
            status,
            application_type: 'seo'
        };
    };

    // ========== STEP 12: Actions ==========
    // Save Draft
    const handleSaveDraft = async () => {
        setIsSubmitting(true);
        try {
            const payload = buildPayload('Draft');

            const response = await fetch(`${apiUrl}/seo-assets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('SEO Asset saved as draft successfully!');
                onNavigate?.('assets');
            } else {
                const error = await response.json();
                alert(`Error: ${error.message || 'Failed to save'}`);
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save SEO Asset');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Submit for QC/Approval
    const handleSubmit = async () => {
        if (!validateForm()) {
            alert('Please complete all required fields before submitting');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = buildPayload('Pending QC Review');

            const response = await fetch(`${apiUrl}/seo-assets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('SEO Asset submitted for QC successfully!');
                onNavigate?.('assets');
            } else {
                const error = await response.json();
                alert(`Error: ${error.message || 'Failed to submit'}`);
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Failed to submit SEO Asset');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Discard
    const handleDiscard = () => {
        if (confirm('Are you sure you want to discard all changes?')) {
            onNavigate?.('assets');
        }
    };

    // Get status badge color
    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-700';
            case 'Rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-amber-100 text-amber-700';
        }
    };

    // Disabled section style
    const disabledSectionClass = "opacity-50 pointer-events-none";

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/40">
            {/* Header */}
            <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => onNavigate?.('assets')} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800">SEO Asset Module</h1>
                            <p className="text-xs text-slate-500">Complete all 12 steps in order</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">

                    {/* ========== STEP 1: Asset ID Selection (Optional) ========== */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">1</div>
                            <h3 className="text-base font-bold text-slate-800">Asset ID Selection</h3>
                            <span className="text-xs text-blue-500 font-medium bg-blue-50 px-2 py-0.5 rounded">Optional</span>
                        </div>
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-2">
                                Asset ID
                                <span className="text-xs text-slate-400">(Select to auto-fill linked details, or skip for manual entry)</span>
                            </label>
                            <select
                                value={selectedAssetId || ''}
                                onChange={(e) => handleAssetIdSelect(Number(e.target.value))}
                                disabled={isAssetIdLocked || isManualEntryMode}
                                className={`w-full h-11 px-4 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all ${(isAssetIdLocked || isManualEntryMode) ? 'bg-slate-100 cursor-not-allowed' : 'border-slate-200'}`}
                            >
                                <option value="">Select Asset ID (Optional)...</option>
                                {existingAssets.map(asset => (
                                    <option key={asset.id} value={asset.id}>
                                        {String(asset.id).padStart(4, '0')} - {asset.name}
                                    </option>
                                ))}
                            </select>

                            {/* Loading State */}
                            {isFetchingAsset && (
                                <div className="flex items-center gap-2 mt-2">
                                    <svg className="animate-spin w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="text-xs text-blue-600">Fetching linked details...</p>
                                </div>
                            )}

                            {/* Asset ID Locked State */}
                            {isAssetIdLocked && !isManualEntryMode && !isFetchingAsset && (
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-green-600 flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Asset ID selected. Linked details auto-filled from asset.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleChangeSelection}
                                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                                    >
                                        Change Selection
                                    </button>
                                </div>
                            )}

                            {/* Manual Entry Mode State */}
                            {isManualEntryMode && (
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-amber-600 flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Manual entry mode. Enter all details manually.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleChangeSelection}
                                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                                    >
                                        Select Asset ID Instead
                                    </button>
                                </div>
                            )}

                            {/* Skip Option - Only show when not locked and not in manual mode */}
                            {!isAssetIdLocked && !isManualEntryMode && (
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-slate-500">Select an existing asset to auto-fill linked details, or skip to enter manually</p>
                                    <button
                                        type="button"
                                        onClick={handleSkipAssetId}
                                        className="text-xs text-amber-600 hover:text-amber-800 underline"
                                    >
                                        Skip & Enter Manually
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ========== STEP 2: Map Asset to Source Work ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm `}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">2</div>
                            <h3 className="text-base font-bold text-slate-800">Map Assets to Source Work</h3>
                            {isFetchingAsset && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded flex items-center gap-1">
                                    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading...
                                </span>
                            )}
                            {linkedFieldsReadOnly && !isFetchingAsset && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">Auto-filled from Asset</span>
                            )}
                            {isManualEntryMode && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">Manual Entry</span>
                            )}
                        </div>
                        <p className="text-sm text-blue-600 mb-4 ml-11">
                            {isFetchingAsset
                                ? 'Fetching linked details from asset...'
                                : linkedFieldsReadOnly
                                    ? 'Linked details fetched from selected Asset ID (read-only)'
                                    : 'Link the selected Asset ID to its originating work/source'}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">
                                    Linked Task
                                    {linkedFieldsReadOnly && linkedTaskId && <span className="text-green-500 ml-1">✓</span>}
                                </label>
                                {linkedFieldsReadOnly ? (
                                    <div className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-xl text-sm flex items-center text-slate-700">
                                        {isFetchingAsset ? <span className="text-slate-400">Loading...</span> : linkedTaskId ? (tasks.find(t => t.id === linkedTaskId) as any)?.task_name || tasks.find(t => t.id === linkedTaskId)?.name || `Task #${linkedTaskId}` : <span className="text-slate-400">Not linked</span>}
                                    </div>
                                ) : (
                                    <select value={linkedTaskId || ''} onChange={(e) => setLinkedTaskId(e.target.value ? Number(e.target.value) : null)}
                                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 ">
                                        <option value="">Select Task...</option>
                                        {tasks.map(task => <option key={task.id} value={task.id}>{(task as any).task_name || task.name}</option>)}
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">
                                    Linked Campaign
                                    {linkedFieldsReadOnly && linkedCampaignId && <span className="text-green-500 ml-1">✓</span>}
                                </label>
                                {linkedFieldsReadOnly ? (
                                    <div className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-xl text-sm flex items-center text-slate-700">
                                        {linkedCampaignId ? campaigns.find(c => c.id === linkedCampaignId)?.campaign_name || `Campaign #${linkedCampaignId}` : <span className="text-slate-400">Not linked</span>}
                                    </div>
                                ) : (
                                    <select value={linkedCampaignId || ''} onChange={(e) => setLinkedCampaignId(e.target.value ? Number(e.target.value) : null)}
                                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 ">
                                        <option value="">Select Campaign...</option>
                                        {campaigns.map(c => <option key={c.id} value={c.id}>{c.campaign_name}</option>)}
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">
                                    Linked Project
                                    {linkedFieldsReadOnly && linkedProjectId && <span className="text-green-500 ml-1">✓</span>}
                                </label>
                                {linkedFieldsReadOnly ? (
                                    <div className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-xl text-sm flex items-center text-slate-700">
                                        {linkedProjectId ? projects.find(p => p.id === linkedProjectId)?.project_name || `Project #${linkedProjectId}` : <span className="text-slate-400">Not linked</span>}
                                    </div>
                                ) : (
                                    <select value={linkedProjectId || ''} onChange={(e) => setLinkedProjectId(e.target.value ? Number(e.target.value) : null)}
                                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 ">
                                        <option value="">Select Project...</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">
                                    Linked Service
                                    {linkedFieldsReadOnly && linkedServiceId && <span className="text-green-500 ml-1">✓</span>}
                                </label>
                                {linkedFieldsReadOnly ? (
                                    <div className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-xl text-sm flex items-center text-slate-700">
                                        {linkedServiceId ? services.find(s => s.id === linkedServiceId)?.service_name || `Service #${linkedServiceId}` : <span className="text-slate-400">Not linked</span>}
                                    </div>
                                ) : (
                                    <select value={linkedServiceId || ''} onChange={(e) => { setLinkedServiceId(e.target.value ? Number(e.target.value) : null); setLinkedSubServiceIds([]); }}
                                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 ">
                                        <option value="">Select Service...</option>
                                        {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">
                                    Linked Sub-Services
                                    {linkedFieldsReadOnly && linkedSubServiceIds.length > 0 && <span className="text-green-500 ml-1">✓</span>}
                                </label>
                                {linkedFieldsReadOnly ? (
                                    <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-700">
                                        {linkedSubServiceIds.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {linkedSubServiceIds.map(id => (
                                                    <span key={id} className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                                        {subServices.find(ss => ss.id === id)?.sub_service_name || `Sub-Service #${id}`}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-slate-400">Not linked</span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {!linkedServiceId ? (
                                            <p className="text-xs text-slate-400 bg-slate-50 p-2 rounded">Select a service first</p>
                                        ) : filteredSubServices.length === 0 ? (
                                            <p className="text-xs text-slate-400 bg-slate-50 p-2 rounded">No sub-services available</p>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-2">
                                                {filteredSubServices.map(ss => (
                                                    <label key={ss.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded hover:bg-blue-50 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={linkedSubServiceIds.includes(ss.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setLinkedSubServiceIds([...linkedSubServiceIds, ss.id]);
                                                                } else {
                                                                    setLinkedSubServiceIds(linkedSubServiceIds.filter(id => id !== ss.id));
                                                                }
                                                            }}
                                                            disabled={!sectionsEnabled}
                                                            className="w-4 h-4 text-blue-600 rounded"
                                                        />
                                                        <span className="text-xs text-slate-700">{ss.sub_service_name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">
                                    Linked Repository Item
                                    {linkedFieldsReadOnly && linkedRepositoryId && <span className="text-green-500 ml-1">✓</span>}
                                </label>
                                {linkedFieldsReadOnly ? (
                                    <div className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-xl text-sm flex items-center text-slate-700">
                                        {linkedRepositoryId ? repositoryItems.find(r => r.id === linkedRepositoryId)?.content_title_clean || `Repository #${linkedRepositoryId}` : <span className="text-slate-400">Not linked</span>}
                                    </div>
                                ) : (
                                    <select value={linkedRepositoryId || ''} onChange={(e) => setLinkedRepositoryId(e.target.value ? Number(e.target.value) : null)}
                                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 ">
                                        <option value="">Select Repository Item...</option>
                                        {repositoryItems.map(r => <option key={r.id} value={r.id}>{r.content_title_clean || `Item #${r.id}`}</option>)}
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>


                    {/* ========== STEP 3: Asset Classification ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm `}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">3</div>
                            <h3 className="text-base font-bold text-slate-800">Asset Classification</h3>
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">From Master Database</span>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Asset Type * <span className="text-slate-400 text-xs">(Master)</span></label>
                                <select value={assetType} onChange={(e) => setAssetType(e.target.value)}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 ">
                                    <option value="">Select type...</option>
                                    {activeAssetTypes.map(type => (
                                        <option key={type.id} value={type.asset_type_name}>{type.asset_type_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Asset Category * <span className="text-slate-400 text-xs">(Master)</span></label>
                                <select value={assetCategory} onChange={(e) => setAssetCategory(e.target.value)}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 ">
                                    <option value="">Select category...</option>
                                    {assetCategories.filter(cat => (cat as any).is_active !== false && (cat as any).status !== 'inactive').map(category => (
                                        <option key={category.id} value={category.category_name}>{category.category_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Sector * <span className="text-slate-400 text-xs">(Master)</span></label>
                                <select value={sector} onChange={(e) => setSector(e.target.value)}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 ">
                                    <option value="">Select sector...</option>
                                    {sectors.map((s: string, idx: number) => (
                                        <option key={idx} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Industry * <span className="text-slate-400 text-xs">(Master)</span></label>
                                <select value={industry} onChange={(e) => setIndustry(e.target.value)}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 ">
                                    <option value="">Select industry...</option>
                                    {industries.map((ind: string, idx: number) => (
                                        <option key={idx} value={ind}>{ind}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* ========== STEP 4: SEO Metadata Fields & Anchor Text ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm `}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">4</div>
                            <h3 className="text-base font-bold text-slate-800">SEO Metadata Fields & Anchor Text</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-2">
                                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                                        Title *
                                    </label>
                                    <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)}
                                        placeholder="Enter SEO Title" className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400  ${errors.seoTitle ? 'border-rose-500' : 'border-slate-200'}`} />
                                    {errors.seoTitle && <p className="text-xs text-rose-500 mt-1">{errors.seoTitle}</p>}
                                </div>
                                <div>
                                    <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-2">
                                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                                        Meta Title *
                                    </label>
                                    <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
                                        placeholder="Enter Meta Title" className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400  ${errors.metaTitle ? 'border-rose-500' : 'border-slate-200'}`} />
                                    {errors.metaTitle && <p className="text-xs text-rose-500 mt-1">{errors.metaTitle}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-2">
                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                                    Description *
                                </label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                                    placeholder="Enter SEO Description" className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 resize-none  ${errors.description ? 'border-rose-500' : 'border-slate-200'}`} />
                                {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Service URL (Optional)</label>
                                    <input type="url" value={serviceUrl} onChange={(e) => setServiceUrl(e.target.value)}
                                        placeholder="https://example.com/service" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 " />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Blog URL (Optional)</label>
                                    <input type="url" value={blogUrl} onChange={(e) => setBlogUrl(e.target.value)}
                                        placeholder="https://example.com/blog" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 " />
                                </div>
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-2">
                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                                    Anchor Text *
                                </label>
                                <input type="text" value={anchorText} onChange={(e) => setAnchorText(e.target.value)}
                                    placeholder="Enter Anchor Text" className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400  ${errors.anchorText ? 'border-rose-500' : 'border-slate-200'}`} />
                                {errors.anchorText && <p className="text-xs text-rose-500 mt-1">{errors.anchorText}</p>}
                            </div>
                        </div>
                    </div>


                    {/* ========== STEP 5: Keywords ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm `}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">5</div>
                            <h3 className="text-base font-bold text-slate-800">Keywords</h3>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">From Keyword Master</span>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            {/* Primary Keyword - From Keyword Master */}
                            <div className="relative">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-2">
                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                                    Primary Keyword *
                                </label>
                                <select
                                    value={primaryKeywordId || ''}
                                    onChange={(e) => setPrimaryKeywordId(e.target.value ? Number(e.target.value) : null)}

                                    className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400  ${errors.primaryKeyword ? 'border-rose-500' : 'border-slate-200'}`}
                                >
                                    <option value="">Select from Keyword Master...</option>
                                    {keywords.map(kw => (
                                        <option key={kw.id} value={kw.id}>
                                            {kw.keyword}{kw.keyword_type ? ` (${kw.keyword_type})` : ''}{kw.search_volume ? ` - Vol: ${kw.search_volume.toLocaleString()}` : ''}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-400 mt-1">No manual entry - select from master only</p>
                                {errors.primaryKeyword && <p className="text-xs text-rose-500 mt-1">{errors.primaryKeyword}</p>}
                            </div>

                            {/* LSI Keywords - Multi-select Dropdown from Keyword Master */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">
                                    LSI Keywords <span className="text-slate-400 text-xs">(Optional)</span>
                                </label>
                                {/* Selected LSI Keywords Display */}
                                {lsiKeywordIds.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {lsiKeywordIds.map(id => {
                                            const kw = keywords.find(k => k.id === id);
                                            return kw ? (
                                                <span key={id} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                                    {kw.keyword}
                                                    {kw.keyword_type && <span className="text-purple-400">({kw.keyword_type})</span>}
                                                    <button type="button" onClick={() => toggleLsiKeyword(id)}
                                                        className="w-4 h-4 flex items-center justify-center hover:bg-purple-200 rounded-full">×</button>
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                )}
                                {/* Dropdown to add LSI Keywords from Keyword Master */}
                                <select
                                    value=""
                                    onChange={(e) => {
                                        const kwId = Number(e.target.value);
                                        if (kwId && !lsiKeywordIds.includes(kwId)) {
                                            toggleLsiKeyword(kwId);
                                        }
                                    }}

                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 "
                                >
                                    <option value="">Add LSI keyword from master...</option>
                                    {keywords
                                        .filter(kw => kw.id !== primaryKeywordId && !lsiKeywordIds.includes(kw.id))
                                        .map(kw => (
                                            <option key={kw.id} value={kw.id}>
                                                {kw.keyword}{kw.keyword_type ? ` (${kw.keyword_type})` : ''}{kw.search_volume ? ` - Vol: ${kw.search_volume.toLocaleString()}` : ''}
                                            </option>
                                        ))
                                    }
                                </select>
                                <p className="text-xs text-slate-400 mt-1">Select from Keyword Master only - no manual entry</p>
                            </div>
                        </div>
                    </div>


                    {/* ========== STEP 6: Domain Type & Domain Addition ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm `}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">6</div>
                            <h3 className="text-base font-bold text-slate-800">Domain Type & Domain Addition</h3>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded">From Backlink Master</span>
                        </div>
                        <div className="space-y-4">
                            {/* Domain Type Dropdown + Add Domain Button - Same Row */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Domain Type</label>
                                <div className="flex gap-4 items-center">
                                    <select
                                        value={domainType}
                                        onChange={(e) => setDomainType(e.target.value)}
                                        className="flex-1 h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                    >
                                        <option value="">Select domain type...</option>
                                        {domainTypes.map((dt: string, idx: number) => (
                                            <option key={idx} value={dt}>{dt}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => {
                                            if (domainType) {
                                                const domainName = `${domainType}-${Date.now()}`;
                                                handleAddDomainFromDropdown(domainName);
                                            }
                                        }}
                                        disabled={!domainType}
                                        className="flex items-center gap-2 h-11 px-6 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Domain
                                    </button>
                                </div>
                            </div>

                            {/* Managed Assets Table */}
                            {selectedDomains.length > 0 && (
                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            <span className="text-sm font-semibold text-slate-700">Managed Assets</span>
                                        </div>
                                        <span className="text-xs text-slate-500">Total Domains: {selectedDomains.length}</span>
                                    </div>

                                    {/* Table Header */}
                                    <div className="bg-slate-50 rounded-t-xl border border-slate-200 border-b-0">
                                        <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                            <div className="col-span-3">Domain Details</div>
                                            <div className="col-span-3">Posted URL</div>
                                            <div className="col-span-2 text-center">Self QC</div>
                                            <div className="col-span-2 text-center">QA Status</div>
                                            <div className="col-span-2 text-center">Actions</div>
                                        </div>
                                    </div>

                                    {/* Table Body */}
                                    <div className="border border-slate-200 rounded-b-xl overflow-hidden divide-y divide-slate-100">
                                        {selectedDomains.map((domain, idx) => (
                                            <div key={idx} className="grid grid-cols-12 gap-2 px-4 py-3 items-center bg-white hover:bg-slate-50/50 transition-colors">
                                                {/* Domain Details */}
                                                <div className="col-span-3">
                                                    <button
                                                        onClick={() => handleDomainClick(idx)}
                                                        className="text-left hover:text-blue-600 transition-colors"
                                                    >
                                                        <p className="text-sm font-medium text-blue-600 hover:underline">{domain.domain_name}</p>
                                                        <p className="text-xs text-slate-400">{domainType || 'Guest Post'}</p>
                                                    </button>
                                                </div>

                                                {/* Posted URL */}
                                                <div className="col-span-3">
                                                    {domain.url_posted ? (
                                                        <a href={domain.url_posted} target="_blank" rel="noopener noreferrer"
                                                            className="text-xs text-blue-500 hover:underline truncate block max-w-[180px]">
                                                            {domain.url_posted}
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">Not posted yet</span>
                                                    )}
                                                </div>

                                                {/* Self QC Status */}
                                                <div className="col-span-2 text-center">
                                                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${domain.seo_self_qc_status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                        domain.seo_self_qc_status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                                                            'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {domain.seo_self_qc_status === 'Pending' && (
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        )}
                                                        {domain.seo_self_qc_status || 'Pending'}
                                                    </span>
                                                </div>

                                                {/* QA Status */}
                                                <div className="col-span-2 text-center">
                                                    <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium border ${domain.qa_status === 'Pass' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        domain.qa_status === 'Fail' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                            'bg-slate-50 text-slate-600 border-slate-200'
                                                        }`}>
                                                        {domain.qa_status === 'Pass' ? 'Pass' :
                                                            domain.qa_status === 'Fail' ? 'Fail' :
                                                                'Review Pending'}
                                                    </span>
                                                </div>

                                                {/* Actions */}
                                                <div className="col-span-2 flex items-center justify-center gap-2">
                                                    {/* Clock icon - Edit Domain Details & Self QC */}
                                                    <button
                                                        onClick={() => handleDomainClick(idx)}
                                                        className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Update Domain & Self QC"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </button>
                                                    {/* Profile icon - QA Verifier Review */}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleOpenQAReview(idx); }}
                                                        className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="QA Verifier Review"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Empty State */}
                            {selectedDomains.length === 0 && (
                                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 mt-4">
                                    <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                    <p className="text-sm text-slate-500 font-medium">No domains added yet</p>
                                    <p className="text-xs text-slate-400 mt-1">Select a domain type and enter a domain URL to add.</p>
                                </div>
                            )}
                        </div>
                    </div >


                    {/* ========== Domain Update & Self QC Popup ========== */}
                    {showDomainPopup && editingDomainIndex !== null && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden">
                                {/* Header */}
                                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800">Domain Update & Self QC</h3>
                                            <p className="text-xs text-slate-500">Domain: {domainPopupData.domain_name}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowDomainPopup(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-5">
                                    {/* Posted URL */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Posted URL <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="url"
                                            value={domainPopupData.url_posted}
                                            onChange={(e) => setDomainPopupData({ ...domainPopupData, url_posted: e.target.value })}
                                            placeholder="https://guires.com/"
                                            className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                        />
                                        <p className="text-xs text-slate-400 mt-1.5">Include http:// or https:// for direct linking.</p>
                                    </div>

                                    {/* Self QC Status */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-3">Self QC Status</label>
                                        <div className="flex gap-3">
                                            {/* Pending */}
                                            <button
                                                type="button"
                                                onClick={() => setDomainPopupData({ ...domainPopupData, seo_self_qc_status: 'Pending' })}
                                                className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${domainPopupData.seo_self_qc_status === 'Pending'
                                                    ? 'border-amber-400 bg-amber-50 text-amber-700'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                                    }`}
                                            >
                                                Pending
                                            </button>
                                            {/* Approved */}
                                            <button
                                                type="button"
                                                onClick={() => setDomainPopupData({ ...domainPopupData, seo_self_qc_status: 'Approved' })}
                                                className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${domainPopupData.seo_self_qc_status === 'Approved'
                                                    ? 'border-green-400 bg-green-50 text-green-700'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                                    }`}
                                            >
                                                {domainPopupData.seo_self_qc_status === 'Approved' && (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                                Approved
                                            </button>
                                            {/* Rejected */}
                                            <button
                                                type="button"
                                                onClick={() => setDomainPopupData({ ...domainPopupData, seo_self_qc_status: 'Rejected' })}
                                                className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${domainPopupData.seo_self_qc_status === 'Rejected'
                                                    ? 'border-rose-400 bg-rose-50 text-rose-700'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                                    }`}
                                            >
                                                Rejected
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowDomainPopup(false)}
                                        className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveDomainDetails}
                                        className="px-5 py-2.5 text-sm font-medium bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                                    >
                                        Update Entry
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========== Verifier QA Review Popup ========== */}
                    {showQAReviewPopup && qaReviewDomainIndex !== null && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden">
                                {/* Header */}
                                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800">Verifier QA Review</h3>
                                            <p className="text-xs text-slate-500">{selectedDomains[qaReviewDomainIndex]?.domain_name}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowQAReviewPopup(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-5">
                                    {/* Info Card */}
                                    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Type</span>
                                            <span className="text-sm font-medium text-slate-700">{domainType || 'Guest Post'}</span>
                                        </div>
                                        <div className="border-t border-slate-200"></div>
                                        <div>
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Posted URL</span>
                                            <a
                                                href={selectedDomains[qaReviewDomainIndex]?.url_posted || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block text-sm text-blue-600 hover:underline mt-1 truncate"
                                            >
                                                {selectedDomains[qaReviewDomainIndex]?.url_posted || 'Not posted yet'}
                                            </a>
                                        </div>
                                        <div className="border-t border-slate-200"></div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Self QC Result</span>
                                            <span className={`text-sm font-semibold ${selectedDomains[qaReviewDomainIndex]?.seo_self_qc_status === 'Approved' ? 'text-green-600' :
                                                selectedDomains[qaReviewDomainIndex]?.seo_self_qc_status === 'Rejected' ? 'text-rose-600' :
                                                    'text-amber-600'
                                                }`}>
                                                {selectedDomains[qaReviewDomainIndex]?.seo_self_qc_status || 'Pending'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Final Verification Status */}
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 text-center mb-4">Final Verification Status</h4>
                                        <div className="flex gap-4">
                                            {/* Pass Button */}
                                            <button
                                                type="button"
                                                onClick={() => setQAReviewVerdict('Pass')}
                                                className={`flex-1 py-6 px-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${qaReviewVerdict === 'Pass'
                                                    ? 'border-green-400 bg-green-50'
                                                    : 'border-slate-200 bg-white hover:border-green-300 hover:bg-green-50/50'
                                                    }`}
                                            >
                                                <svg className={`w-8 h-8 ${qaReviewVerdict === 'Pass' ? 'text-green-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                                </svg>
                                                <span className={`text-sm font-semibold ${qaReviewVerdict === 'Pass' ? 'text-green-700' : 'text-slate-600'}`}>Pass</span>
                                            </button>
                                            {/* Fail Button */}
                                            <button
                                                type="button"
                                                onClick={() => setQAReviewVerdict('Fail')}
                                                className={`flex-1 py-6 px-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${qaReviewVerdict === 'Fail'
                                                    ? 'border-rose-400 bg-rose-50'
                                                    : 'border-slate-200 bg-white hover:border-rose-300 hover:bg-rose-50/50'
                                                    }`}
                                            >
                                                <svg className={`w-8 h-8 ${qaReviewVerdict === 'Fail' ? 'text-rose-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                                                </svg>
                                                <span className={`text-sm font-semibold ${qaReviewVerdict === 'Fail' ? 'text-rose-700' : 'text-slate-600'}`}>Fail</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
                                    <button
                                        onClick={() => { setShowQAReviewPopup(false); setQAReviewVerdict(''); }}
                                        className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        onClick={handleSubmitQAVerdict}
                                        disabled={!qaReviewVerdict}
                                        className="px-5 py-2.5 text-sm font-medium bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-colors  disabled:cursor-not-allowed"
                                    >
                                        Submit Verdict
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* ========== STEP 8: Blog Posting - Content Editor (Conditional) ========== */}
                    {
                        isBlogPosting && sectionsEnabled && (
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">8</div>
                                    <h3 className="text-base font-bold text-slate-800">Blog Posting - Content Editor</h3>
                                    <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">Conditional: Asset Type = Blog Posting</span>
                                </div>
                                <p className="text-xs text-slate-500 mb-4">Rich text editor with headings, formatting, links, and paragraphs support</p>
                                <div className="border border-slate-200 rounded-xl overflow-hidden">
                                    <MarkdownEditor
                                        value={blogContent}
                                        onChange={setBlogContent}
                                        placeholder="Write your blog content here with full formatting support..."
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-2">Word count: {blogContent.split(/\s+/).filter(Boolean).length} words</p>
                            </div>
                        )
                    }

                    {/* Show placeholder when not Blog Posting */}
                    {
                        !isBlogPosting && sectionsEnabled && (
                            <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm ${disabledSectionClass}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">8</div>
                                    <h3 className="text-base font-bold text-slate-800">Blog Posting - Content Editor</h3>
                                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Hidden: Asset Type ≠ Blog Posting</span>
                                </div>
                                <p className="text-sm text-slate-400 text-center py-4">Content editor is only visible when Asset Type = Blog Posting</p>
                            </div>
                        )
                    }

                    {/* ========== STEP 9: Resource File Upload ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm `}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">9</div>
                            <h3 className="text-base font-bold text-slate-800">Resource File Upload</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">Multiple files allowed - Files linked to Asset ID and Asset Type</p>
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive ? 'border-pink-400 bg-pink-50' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                            <input type="file" multiple onChange={handleFileUpload} className="hidden" id="resource-upload" />
                            <label htmlFor="resource-upload" className={`cursor-pointer ${!sectionsEnabled ? 'pointer-events-none' : ''}`}>
                                <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-7 h-7 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <p className="text-sm text-slate-600">
                                    <span className="font-semibold text-pink-500">Drag & drop</span> files, or <span className="font-semibold text-pink-500">browse</span>
                                </p>
                                <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX, TXT, Images up to 10MB each</p>
                            </label>
                        </div>

                        {resourceFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {resourceFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">{file.name}</p>
                                                <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleFileRemove(idx)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>


                    {/* ========== STEP 10: Designer & Workflow ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm `}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">10</div>
                            <h3 className="text-base font-bold text-slate-800">Designer & Workflow</h3>
                        </div>
                        <div className="space-y-4">
                            {/* Assign Team Members - Multi-select */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Assign Team Members (Multi-select - All Users)</label>
                                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]">
                                    {users.filter(u => u.status === 'active').map(u => (
                                        <button key={u.id} onClick={() => toggleTeamMember(u.id)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${assignedTeamMembers.includes(u.id) ? 'bg-amber-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-400'} `}>
                                            {u.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Created By - Auto */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Created By (Auto - Logged-in User)</label>
                                    <input type="text" value={currentUser.name || `User #${currentUser.id}`} disabled
                                        className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-600" />
                                </div>

                                {/* Verified By (SEO) */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Verified By (SEO) - All Users</label>
                                    <select value={verifiedBy || ''} onChange={(e) => setVerifiedBy(e.target.value ? Number(e.target.value) : null)}
                                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 ">
                                        <option value="">Select Verifier...</option>
                                        {users.filter(u => u.status === 'active').map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========== STEP 11: Versioning ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm `}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center text-white text-sm font-bold">11</div>
                            <h3 className="text-base font-bold text-slate-800">Versioning</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">Track changes across submissions - New version created on every re-submit after rejection</p>
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Version Number (Auto-Increment)</label>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-bold text-slate-800">{versionNumber}</span>
                                    <span className="text-xs text-slate-400">Previous versions remain read-only</span>
                                </div>
                            </div>
                            <button onClick={() => setShowVersionHistory(!showVersionHistory)}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium ">
                                View Version History
                            </button>
                        </div>

                        {showVersionHistory && (
                            <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <h4 className="text-sm font-semibold text-slate-700 mb-3">Version History</h4>
                                {versionHistory.length > 0 ? (
                                    <div className="space-y-2">
                                        {versionHistory.map((v, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-sm">
                                                <span className="font-medium text-slate-600">{v.version}</span>
                                                <span className="text-slate-400">{v.date}</span>
                                                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">{v.action}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400">No previous versions - This is the initial version</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ========== STEP 12: Actions ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm `}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">12</div>
                            <h3 className="text-base font-bold text-slate-800">Actions - Save, Submit, Discard</h3>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 mb-4">
                            <p className="text-xs text-slate-500">
                                <span className="font-semibold">Save (Draft):</span> Stores data without validation completion<br />
                                <span className="font-semibold">Submit:</span> Triggers validations and workflow<br />
                                <span className="font-semibold">Discard:</span> Clears unsaved data
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-3">
                            <button onClick={handleDiscard} disabled={!sectionsEnabled || isSubmitting}
                                className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors ">
                                Discard
                            </button>
                            <button onClick={handleSaveDraft} disabled={!sectionsEnabled || isSubmitting}
                                className="px-5 py-2.5 bg-slate-600 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors ">
                                {isSubmitting ? 'Saving...' : 'Save (Draft)'}
                            </button>
                            <button onClick={handleSubmit} disabled={!sectionsEnabled || isSubmitting}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all ">
                                {isSubmitting ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit (For QC / Approval)
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                </div >
            </div >
        </div >
    );
};

export default SeoAssetUploadView;
