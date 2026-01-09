import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import type {
    AssetLibraryItem, Task, Campaign, Project, Service, SubServiceItem,
    ContentRepositoryItem, User, Keyword
} from '../types';

interface SeoAssetModuleViewProps {
    onNavigate?: (view: string, id?: number) => void;
    editAssetId?: number;
}

// QC Status Options with Display Mapping
const QC_STATUS_OPTIONS = [
    { value: 'Pass', label: 'Pass', displayStatus: 'Approved' },
    { value: 'Fail', label: 'Fail', displayStatus: 'Rejected' },
    { value: 'Waiting', label: 'Waiting', displayStatus: 'Pending' }
];

const QA_STATUS_OPTIONS = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' }
];

interface DomainDetails {
    id?: number;
    domain_name: string;
    url_posted: string;
    seo_self_qc_status: string;
    qa_status: string;
    approval_status?: string; // Auto-calculated
}

const SeoAssetModuleView: React.FC<SeoAssetModuleViewProps> = ({ onNavigate, editAssetId }) => {
    const { user } = useAuth();
    const currentUser = user || { id: 1, name: 'Current User' };

    // Data hooks for master data
    const { data: tasks = [] } = useData<Task>('tasks');
    const { data: campaigns = [] } = useData<Campaign>('campaigns');
    const { data: projects = [] } = useData<Project>('projects');
    const { data: services = [] } = useData<Service>('services');
    const { data: subServices = [] } = useData<SubServiceItem>('subServices');
    const { data: repositoryItems = [] } = useData<ContentRepositoryItem>('content');
    const { data: users = [] } = useData<User>('users');
    const { data: keywords = [] } = useData<Keyword>('keywords');
    const { data: existingAssets = [] } = useData<AssetLibraryItem>('assetLibrary');
    const { data: industrySectors = [] } = useData<any>('industrySectors');
    const { data: assetTypes = [] } = useData<any>('assetTypes');

    // SEO Asset specific master data (fetched from dedicated endpoints)
    const [backlinkDomains, setBacklinkDomains] = useState<Array<{ id: number; name: string; url: string; da: number }>>([]);
    const [seoAssetDomainTypes, setSeoAssetDomainTypes] = useState<string[]>([]);

    // Fetch SEO Asset master data on mount
    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';

        // Fetch backlink domains
        fetch(`${apiUrl}/seo-assets/master/backlink-domains`)
            .then(res => res.json())
            .then(data => setBacklinkDomains(data || []))
            .catch(() => setBacklinkDomains([]));

        // Fetch domain types
        fetch(`${apiUrl}/seo-assets/master/domain-types`)
            .then(res => res.json())
            .then(data => setSeoAssetDomainTypes(data || []))
            .catch(() => setSeoAssetDomainTypes([]));
    }, []);

    // ========== SECTION 1: Asset ID Selection ==========
    const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
    const [isAssetIdLocked, setIsAssetIdLocked] = useState(false);

    // ========== SECTION 2: Map Asset to Source Work ==========
    const [linkedProjectId, setLinkedProjectId] = useState<number | null>(null);
    const [linkedCampaignId, setLinkedCampaignId] = useState<number | null>(null);
    const [linkedServiceId, setLinkedServiceId] = useState<number | null>(null);
    const [linkedSubServiceId, setLinkedSubServiceId] = useState<number | null>(null);
    const [linkedTaskId, setLinkedTaskId] = useState<number | null>(null);
    const [linkedRepositoryId, setLinkedRepositoryId] = useState<number | null>(null);

    // ========== SECTION 3: Asset Classification ==========
    const [assetType, setAssetType] = useState('');
    const [sector, setSector] = useState('');
    const [industry, setIndustry] = useState('');

    // ========== SECTION 4: SEO Metadata ==========
    const [seoTitle, setSeoTitle] = useState('');
    const [metaTitle, setMetaTitle] = useState('');
    const [description, setDescription] = useState('');
    const [serviceUrl, setServiceUrl] = useState('');
    const [blogUrl, setBlogUrl] = useState('');
    const [anchorText, setAnchorText] = useState('');

    // ========== SECTION 5: Keywords ==========
    const [primaryKeywordId, setPrimaryKeywordId] = useState<number | null>(null);
    const [lsiKeywords, setLsiKeywords] = useState<number[]>([]);

    // ========== SECTION 6: Domain Type & Domain Addition ==========
    const [domainType, setDomainType] = useState('');
    const [selectedDomains, setSelectedDomains] = useState<DomainDetails[]>([]);
    const [domainInputValue, setDomainInputValue] = useState('');

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

    // ========== SECTION 8: Blog Content (Conditional) ==========
    const [blogContent, setBlogContent] = useState('');

    // ========== SECTION 9: Resource File Upload ==========
    const [resourceFiles, setResourceFiles] = useState<Array<{ name: string; url: string }>>([]);

    // ========== SECTION 10: Designer & Workflow ==========
    const [assignedTeamMembers, setAssignedTeamMembers] = useState<number[]>([]);
    const [verifiedBy, setVerifiedBy] = useState<number | null>(null);

    // ========== SECTION 11: Versioning ==========
    const [versionNumber, setVersionNumber] = useState('v1.0');
    const [versionHistory, setVersionHistory] = useState<Array<{ version: string; date: string; action: string; user?: string }>>([]);

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [sectionsEnabled, setSectionsEnabled] = useState({
        mapSource: true,
        classification: true,
        seoMetadata: true,
        keywords: true,
        domains: true,
        blogContent: true,
        resourceUpload: true,
        workflow: true,
        versioning: true,
        actions: true
    });

    // Get unique sectors and industries from master data
    const sectors = [...new Set(industrySectors.map((item: any) => item.sector).filter(Boolean))];
    const industries = [...new Set(industrySectors.map((item: any) => item.industry).filter(Boolean))];
    // Use domain types from SEO Asset master endpoint
    const domainTypes = seoAssetDomainTypes;


    // All sections are always enabled - Asset ID is optional
    useEffect(() => {
        // Enable all sections by default
        setSectionsEnabled({
            mapSource: true,
            classification: true,
            seoMetadata: true,
            keywords: true,
            domains: true,
            blogContent: true,
            resourceUpload: true,
            workflow: true,
            versioning: true,
            actions: true
        });

        // If Asset ID is selected, lock it and auto-fill linked details
        if (selectedAssetId) {
            setIsAssetIdLocked(true);
        }
    }, [selectedAssetId]);

    // Load existing asset if editing
    useEffect(() => {
        if (editAssetId) {
            // Fetch SEO asset data directly from the SEO assets endpoint
            const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
            fetch(`${apiUrl}/seo-assets/${editAssetId}`)
                .then(res => res.json())
                .then(data => {
                    if (data && !data.error) {
                        setSelectedAssetId(data.linked_asset_id || data.id);
                        setIsAssetIdLocked(true);
                        setLinkedProjectId(data.linked_project_id || null);
                        setLinkedCampaignId(data.linked_campaign_id || null);
                        setLinkedServiceId(data.linked_service_id || null);
                        setLinkedSubServiceId(data.linked_sub_service_id || null);
                        setLinkedTaskId(data.linked_task_id || null);
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
                        setLsiKeywords(data.seo_lsi_keywords || data.lsi_keywords || []);

                        // Load classification fields
                        setSector(data.seo_sector_id || data.sector_id || '');
                        setIndustry(data.seo_industry_id || data.industry_id || '');

                        // Load resource files
                        const files = data.resource_files || [];
                        setResourceFiles(Array.isArray(files)
                            ? files.map((url: string) => ({ name: url.split('/').pop() || 'file', url }))
                            : []);

                        // Load workflow fields
                        setAssignedTeamMembers(data.assigned_team_members || []);
                        setVerifiedBy(data.verified_by || null);

                        setSectionsEnabled({
                            mapSource: true,
                            classification: true,
                            seoMetadata: true,
                            keywords: true,
                            domains: true,
                            blogContent: true,
                            resourceUpload: true,
                            workflow: true,
                            versioning: true,
                            actions: true
                        });
                    }
                })
                .catch(err => console.error('Error loading SEO asset:', err));
        }
    }, [editAssetId]);

    // Handle Asset ID Selection
    const handleAssetIdSelect = (assetId: number) => {
        if (assetId) {
            setSelectedAssetId(assetId);
            setIsAssetIdLocked(true);

            // Pre-fill linked data from selected asset
            const selectedAsset = existingAssets.find(a => a.id === assetId);
            if (selectedAsset) {
                setLinkedTaskId(selectedAsset.linked_task_id || null);
                setLinkedCampaignId(selectedAsset.linked_campaign_id || null);
                setLinkedProjectId(selectedAsset.linked_project_id || null);
                setLinkedServiceId(selectedAsset.linked_service_id || null);
                setLinkedSubServiceId(selectedAsset.linked_sub_service_id || null);
                setLinkedRepositoryId(selectedAsset.linked_repository_item_id || null);
                setAssetType(selectedAsset.type || '');
                setSeoTitle(selectedAsset.name || '');
            }
        }
    };

    // Handle Change Selection - Reset linked fields for manual entry
    const handleChangeSelection = () => {
        setIsAssetIdLocked(false);
        setSelectedAssetId(null);
        // Reset linked fields to allow manual entry
        setLinkedTaskId(null);
        setLinkedCampaignId(null);
        setLinkedProjectId(null);
        setLinkedServiceId(null);
        setLinkedSubServiceId(null);
        setLinkedRepositoryId(null);
    };

    // Calculate Approval Status automatically based on QC statuses
    const calculateApprovalStatus = (selfQcStatus: string, qaStatus: string): string => {
        if (selfQcStatus === 'Approved' && qaStatus === 'Pass') return 'Approved';
        if (selfQcStatus === 'Rejected' || qaStatus === 'Fail') return 'Rejected';
        return 'Pending';
    };

    // Handle Add Domain - Just add domain name from Backlink Master
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
            seo_self_qc_status: 'Pending', // Default to Pending
            qa_status: '', // Empty - to be filled by verifier
            approval_status: 'Pending'
        };

        setSelectedDomains([...selectedDomains, newDomain]);
    };

    // Handle Domain Click - Open popup to edit URL and Self QC Status
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

    // Handle Domain Popup Save - Update URL Posted and Self QC Status
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

    // Handle Domain Delete
    const handleDeleteDomain = (index: number) => {
        setSelectedDomains(selectedDomains.filter((_, i) => i !== index));
    };

    // Handle File Upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newFiles: Array<{ name: string; url: string }> = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            await new Promise<void>((resolve) => {
                reader.onload = () => {
                    newFiles.push({
                        name: file.name,
                        url: reader.result as string
                    });
                    resolve();
                };
                reader.readAsDataURL(file);
            });
        }

        setResourceFiles([...resourceFiles, ...newFiles]);
    };

    // Validate form before submission
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Asset ID is optional - no validation required
        if (!seoTitle.trim()) newErrors.seoTitle = 'Title is required';
        if (!metaTitle.trim()) newErrors.metaTitle = 'Meta Title is required';
        if (!description.trim()) newErrors.description = 'Description is required';
        if (!anchorText.trim()) newErrors.anchorText = 'Anchor Text is required';
        if (!primaryKeywordId) newErrors.primaryKeyword = 'Primary Keyword is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    // Save Draft
    const handleSaveDraft = async () => {
        setIsSubmitting(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
            const payload = {
                name: seoTitle || metaTitle,
                linked_asset_id: selectedAssetId,
                linked_project_id: linkedProjectId,
                linked_campaign_id: linkedCampaignId,
                linked_service_id: linkedServiceId,
                linked_sub_service_id: linkedSubServiceId,
                linked_task_id: linkedTaskId,
                linked_repository_item_id: linkedRepositoryId,
                asset_type: assetType,
                sector_id: sector,
                industry_id: industry,
                seo_title: seoTitle,
                seo_meta_title: metaTitle,
                seo_description: description,
                service_url: serviceUrl,
                blog_url: blogUrl,
                anchor_text: anchorText,
                primary_keyword_id: primaryKeywordId,
                lsi_keywords: lsiKeywords,
                domain_type: domainType,
                seo_domains: selectedDomains,
                blog_content: blogContent,
                resource_files: resourceFiles.map(f => f.url),
                assigned_team_members: assignedTeamMembers,
                created_by: currentUser.id,
                verified_by: verifiedBy,
                status: 'Draft'
            };

            const method = editAssetId ? 'PUT' : 'POST';
            const url = editAssetId
                ? `${apiUrl}/seo-assets/${editAssetId}`
                : `${apiUrl}/seo-assets`;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save');
            }

            alert('SEO Asset saved as draft successfully!');
            onNavigate?.('assets');
        } catch (error: any) {
            alert(error.message || 'Failed to save SEO Asset');
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
            const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';

            const payload = {
                name: seoTitle || metaTitle,
                linked_asset_id: selectedAssetId,
                linked_project_id: linkedProjectId,
                linked_campaign_id: linkedCampaignId,
                linked_service_id: linkedServiceId,
                linked_sub_service_id: linkedSubServiceId,
                linked_task_id: linkedTaskId,
                linked_repository_item_id: linkedRepositoryId,
                asset_type: assetType,
                sector_id: sector,
                industry_id: industry,
                seo_title: seoTitle,
                seo_meta_title: metaTitle,
                seo_description: description,
                service_url: serviceUrl,
                blog_url: blogUrl,
                anchor_text: anchorText,
                primary_keyword_id: primaryKeywordId,
                lsi_keywords: lsiKeywords,
                domain_type: domainType,
                seo_domains: selectedDomains,
                blog_content: blogContent,
                resource_files: resourceFiles.map(f => f.url),
                assigned_team_members: assignedTeamMembers,
                created_by: currentUser.id,
                verified_by: verifiedBy,
                status: 'Pending QC Review'
            };

            const method = editAssetId ? 'PUT' : 'POST';
            const url = editAssetId
                ? `${apiUrl}/seo-assets/${editAssetId}`
                : `${apiUrl}/seo-assets`;

            const saveResponse = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!saveResponse.ok) {
                const error = await saveResponse.json();
                throw new Error(error.error || 'Failed to save');
            }

            const savedAsset = await saveResponse.json();

            // Submit for QC
            const submitResponse = await fetch(`${apiUrl}/seo-assets/${savedAsset.id}/submit-qc`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ submitted_by: currentUser.id })
            });

            if (!submitResponse.ok) {
                const error = await submitResponse.json();
                throw new Error(error.error || 'Failed to submit for QC');
            }

            alert('SEO Asset submitted successfully!');
            onNavigate?.('assets');
        } catch (error: any) {
            alert(error.message || 'Failed to submit SEO Asset');
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

    // Check if Blog Posting type
    const isBlogPosting = assetType.toLowerCase().includes('blog');

    // Section disabled style
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
                            <h1 className="text-lg font-bold text-slate-800">{editAssetId ? 'Edit SEO Asset' : 'SEO Asset Module'}</h1>
                            <p className="text-xs text-slate-500">Complete all sections in order</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">

                    {/* ========== SECTION 1: Asset ID Selection (Optional) ========== */}
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
                                disabled={isAssetIdLocked}
                                className={`w-full h-11 px-4 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all ${isAssetIdLocked ? 'bg-slate-100 cursor-not-allowed' : 'border-slate-200'}`}
                            >
                                <option value="">Select Asset ID (Optional)...</option>
                                {existingAssets.map(asset => (
                                    <option key={asset.id} value={asset.id}>
                                        {String(asset.id).padStart(4, '0')} - {asset.name}
                                    </option>
                                ))}
                            </select>
                            {isAssetIdLocked && (
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
                            {!isAssetIdLocked && (
                                <p className="text-xs text-slate-500 mt-2">Select an existing asset to auto-fill linked details, or skip to enter manually</p>
                            )}
                        </div>
                    </div>

                    {/* ========== SECTION 2: Map Asset to Source Work ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm `}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">2</div>
                            <h3 className="text-base font-bold text-slate-800">Map Assets to Source Work</h3>
                        </div>
                        <p className="text-sm text-blue-600 mb-4 ml-11">Link the selected Asset ID to its originating work/source</p>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Linked Task */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Linked Task</label>
                                <select value={linkedTaskId || ''} onChange={(e) => setLinkedTaskId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                                    <option value="">Select Task</option>
                                    {tasks.map(task => <option key={task.id} value={task.id}>{(task as any).task_name || task.name}</option>)}
                                </select>
                            </div>
                            {/* Linked Campaign */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Linked Campaign</label>
                                <select value={linkedCampaignId || ''} onChange={(e) => setLinkedCampaignId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                                    <option value="">Select Campaign</option>
                                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.campaign_name}</option>)}
                                </select>
                            </div>
                            {/* Linked Project */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Linked Project</label>
                                <select value={linkedProjectId || ''} onChange={(e) => setLinkedProjectId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                                    <option value="">Select Project</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
                                </select>
                            </div>
                            {/* Linked Service */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Linked Service</label>
                                <select value={linkedServiceId || ''} onChange={(e) => setLinkedServiceId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                                    <option value="">Select Service</option>
                                    {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                                </select>
                            </div>
                            {/* Linked Sub-Service */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Linked Sub-Service</label>
                                <select value={linkedSubServiceId || ''} onChange={(e) => setLinkedSubServiceId(e.target.value ? Number(e.target.value) : null)}
                                    disabled={!linkedServiceId}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:bg-slate-100 disabled:cursor-not-allowed">
                                    <option value="">{linkedServiceId ? 'Select Sub-Service' : 'Select Service first'}</option>
                                    {subServices.filter(ss => !linkedServiceId || ss.parent_service_id === linkedServiceId).map(ss => (
                                        <option key={ss.id} value={ss.id}>{ss.sub_service_name}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Linked Repository Item */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Linked Repository Item</label>
                                <select value={linkedRepositoryId || ''} onChange={(e) => setLinkedRepositoryId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                                    <option value="">Select Repository</option>
                                    {repositoryItems.map(r => <option key={r.id} value={r.id}>{r.content_title_clean || `Item #${r.id}`}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>


                    {/* ========== SECTION 3: Asset Classification ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm `}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">3</div>
                            <h3 className="text-base font-bold text-slate-800">Asset Classification</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {/* Asset Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Asset Type</label>
                                <select value={assetType} onChange={(e) => setAssetType(e.target.value)}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400">
                                    <option value="">Select Asset Type...</option>
                                    {assetTypes.map((at: any) => <option key={at.id} value={at.asset_type}>{at.asset_type}</option>)}
                                </select>
                            </div>
                            {/* Sector */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Sector</label>
                                <select value={sector} onChange={(e) => setSector(e.target.value)}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400">
                                    <option value="">Select Sector...</option>
                                    {sectors.map((s: string) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            {/* Industry */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Industry</label>
                                <select value={industry} onChange={(e) => setIndustry(e.target.value)}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400">
                                    <option value="">Select Industry...</option>
                                    {industries.map((i: string) => <option key={i} value={i}>{i}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* ========== SECTION 4: SEO Metadata ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm `}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">4</div>
                            <h3 className="text-base font-bold text-slate-800">SEO Metadata</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Title */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-2">
                                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>Title *
                                    </label>
                                    <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)}
                                        placeholder="Enter title..."
                                        className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 ${errors.seoTitle ? 'border-rose-500' : 'border-slate-200'}`} />
                                    {errors.seoTitle && <p className="text-xs text-rose-500 mt-1">{errors.seoTitle}</p>}
                                </div>
                                {/* Meta Title */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-2">
                                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>Meta Title *
                                    </label>
                                    <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
                                        placeholder="Enter meta title..."
                                        className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 ${errors.metaTitle ? 'border-rose-500' : 'border-slate-200'}`} />
                                    {errors.metaTitle && <p className="text-xs text-rose-500 mt-1">{errors.metaTitle}</p>}
                                </div>
                            </div>
                            {/* Description */}
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-2">
                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>Description *
                                </label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter description..." rows={3}
                                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 resize-none ${errors.description ? 'border-rose-500' : 'border-slate-200'}`} />
                                {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Service URL */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Service URL</label>
                                    <input type="url" value={serviceUrl} onChange={(e) => setServiceUrl(e.target.value)}
                                        placeholder="https://example.com/service"
                                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400" />
                                </div>
                                {/* Blog URL */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Blog URL</label>
                                    <input type="url" value={blogUrl} onChange={(e) => setBlogUrl(e.target.value)}
                                        placeholder="https://example.com/blog"
                                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400" />
                                </div>
                            </div>
                            {/* Anchor Text */}
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-2">
                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>Anchor Text *
                                </label>
                                <input type="text" value={anchorText} onChange={(e) => setAnchorText(e.target.value)}
                                    placeholder="Enter anchor text..."
                                    className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 ${errors.anchorText ? 'border-rose-500' : 'border-slate-200'}`} />
                                {errors.anchorText && <p className="text-xs text-rose-500 mt-1">{errors.anchorText}</p>}
                            </div>
                        </div>
                    </div>

                    {/* ========== SECTION 5: Keywords ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm `}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">5</div>
                            <h3 className="text-base font-bold text-slate-800">Keywords</h3>
                            <span className="text-xs text-slate-400">(from Keyword Master - no manual entry)</span>
                        </div>
                        <div className="space-y-4">
                            {/* Primary Keyword */}
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-2">
                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>Primary Keyword *
                                </label>
                                <select value={primaryKeywordId || ''} onChange={(e) => setPrimaryKeywordId(e.target.value ? Number(e.target.value) : null)}
                                    className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 ${errors.primaryKeyword ? 'border-rose-500' : 'border-slate-200'}`}>
                                    <option value="">Select Primary Keyword...</option>
                                    {keywords.map(kw => <option key={kw.id} value={kw.id}>{kw.keyword}</option>)}
                                </select>
                                {errors.primaryKeyword && <p className="text-xs text-rose-500 mt-1">{errors.primaryKeyword}</p>}
                            </div>
                            {/* LSI Keywords - Dropdown from Keyword Master */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">
                                    LSI Keywords <span className="text-slate-400 text-xs">(Optional)</span>
                                </label>
                                {/* Selected LSI Keywords Display */}
                                {lsiKeywords.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {lsiKeywords.map(kwId => {
                                            const kw = keywords.find(k => k.id === kwId);
                                            return kw ? (
                                                <span key={kwId} className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                                    {kw.keyword}
                                                    <button type="button" onClick={() => setLsiKeywords(prev => prev.filter(id => id !== kwId))}
                                                        className="w-4 h-4 flex items-center justify-center hover:bg-orange-200 rounded-full">×</button>
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                )}
                                {/* Dropdown to add LSI Keywords */}
                                <select
                                    value=""
                                    onChange={(e) => {
                                        const kwId = Number(e.target.value);
                                        if (kwId && !lsiKeywords.includes(kwId)) {
                                            setLsiKeywords(prev => [...prev, kwId]);
                                        }
                                    }}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
                                >
                                    <option value="">Add LSI keyword...</option>
                                    {keywords
                                        .filter(kw => kw.id !== primaryKeywordId && !lsiKeywords.includes(kw.id))
                                        .map(kw => (
                                            <option key={kw.id} value={kw.id}>{kw.keyword}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                    </div>


                    {/* ========== SECTION 6: Domain Type & Domain Addition ========== */}
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
                                        {domainTypes.map((dt: string) => <option key={dt} value={dt}>{dt}</option>)}
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
                                                    <button
                                                        onClick={() => handleDomainClick(idx)}
                                                        className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Update Domain & Self QC"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </button>
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
                    </div>

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


                    {/* ========== SECTION 8: Blog Posting - Content Editor (Conditional) ========== */}
                    {isBlogPosting && (
                        <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm `}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">8</div>
                                <h3 className="text-base font-bold text-slate-800">Blog Posting - Content Editor</h3>
                                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Only for Blog Posting</span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">SEO Content Body</label>
                                <textarea value={blogContent} onChange={(e) => setBlogContent(e.target.value)}
                                    placeholder="Enter your blog content here. Supports headings, formatting, links, and paragraphs..."
                                    rows={24}
                                    style={{ minHeight: '400px' }}
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-y leading-relaxed" />
                                <p className="text-xs text-slate-400 mt-2">Rich text editor for blog content with support for headings, formatting, links, and paragraphs</p>
                            </div>
                        </div>
                    )}

                    {/* ========== SECTION 9: Resource File Upload ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm `}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">9</div>
                            <h3 className="text-base font-bold text-slate-800">Resource File Upload</h3>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Multi-file Upload</label>
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-cyan-400 transition-colors">
                                <input type="file" multiple onChange={handleFileUpload} className="hidden" id="resource-upload" />
                                <label htmlFor="resource-upload" className="cursor-pointer">
                                    <svg className="w-10 h-10 mx-auto text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <p className="text-sm text-slate-600 font-medium">Click to upload files</p>
                                    <p className="text-xs text-slate-400 mt-1">Multiple files allowed - linked to Asset ID and Asset Type</p>
                                </label>
                            </div>
                            {resourceFiles.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {resourceFiles.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="text-sm text-slate-600">{file.name}</span>
                                            </div>
                                            <button onClick={() => setResourceFiles(resourceFiles.filter((_, i) => i !== idx))}
                                                className="p-1 hover:bg-slate-200 rounded">
                                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ========== SECTION 10: Designer & Workflow ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm `}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">10</div>
                            <h3 className="text-base font-bold text-slate-800">Designer & Workflow</h3>
                        </div>
                        <div className="space-y-4">
                            {/* Assign Team Members - Multi-select */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Assign Team Members</label>
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-32 overflow-y-auto">
                                    {users.length === 0 ? (
                                        <p className="text-sm text-slate-400 text-center py-2">No users available</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {users.map(u => (
                                                <button key={u.id} type="button"
                                                    onClick={() => setAssignedTeamMembers(prev => prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id])}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${assignedTeamMembers.includes(u.id)
                                                        ? 'bg-amber-500 text-white'
                                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-300'
                                                        }`}>
                                                    {u.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Select multiple team members to assign</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Created By (Auto) */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Created By (Auto)</label>
                                    <input type="text" value={currentUser.name} disabled
                                        className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-xl text-sm cursor-not-allowed" />
                                    <p className="text-xs text-slate-400 mt-1">Auto-populated from logged-in user</p>
                                </div>
                                {/* Verified By (SEO) */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Verified By (SEO)</label>
                                    <select value={verifiedBy || ''} onChange={(e) => setVerifiedBy(e.target.value ? Number(e.target.value) : null)}
                                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400">
                                        <option value="">Select SEO Verifier...</option>
                                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========== SECTION 11: Versioning ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm `}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-gray-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">11</div>
                            <h3 className="text-base font-bold text-slate-800">Versioning</h3>
                        </div>
                        <div className="space-y-4">
                            {/* Auto Version Control */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Auto Version Control</label>
                                <div className="flex items-center gap-3">
                                    <div className="px-4 py-2 bg-gradient-to-r from-slate-100 to-gray-100 rounded-xl">
                                        <span className="text-sm text-slate-500">Current:</span>
                                        <span className="ml-2 text-base font-bold text-slate-800">{versionNumber}</span>
                                    </div>
                                    <p className="text-xs text-slate-400">New version created on every re-submit after rejection</p>
                                </div>
                            </div>
                            {/* Read-only Previous Versions */}
                            {versionHistory.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Previous Versions (Read-only)</label>
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-32 overflow-y-auto">
                                        {versionHistory.map((v, idx) => (
                                            <div key={idx} className={`flex items-center justify-between py-2 ${idx > 0 ? 'border-t border-slate-200' : ''}`}>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-slate-700">{v.version}</span>
                                                    <span className="text-xs text-slate-400">• {v.action}</span>
                                                </div>
                                                <span className="text-xs text-slate-400">{new Date(v.date).toLocaleDateString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Version number auto-incremented by system</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ========== SECTION 12: Actions ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm `}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">12</div>
                            <h3 className="text-base font-bold text-slate-800">Actions</h3>
                        </div>
                        <div className="flex gap-4">
                            {/* Save (Draft) */}
                            <button onClick={handleSaveDraft} disabled={isSubmitting}
                                className="flex-1 px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200  transition-all">
                                {isSubmitting ? 'Saving...' : 'Save (Draft)'}
                            </button>
                            {/* Submit */}
                            <button onClick={handleSubmit} disabled={isSubmitting}
                                className="flex-1 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25  transition-all">
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                            {/* Discard */}
                            <button onClick={handleDiscard} disabled={isSubmitting}
                                className="px-5 py-2.5 text-sm font-medium text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100  transition-all">
                                Discard
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-3">
                            <span className="font-medium">Save:</span> Stores data without validation •
                            <span className="font-medium ml-2">Submit:</span> Triggers validations and workflow •
                            <span className="font-medium ml-2">Discard:</span> Clears unsaved data
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SeoAssetModuleView;
