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

    // ========== SECTION 7: Domain Details Popup ==========
    const [showDomainPopup, setShowDomainPopup] = useState(false);
    const [editingDomainIndex, setEditingDomainIndex] = useState<number | null>(null);
    const [domainPopupData, setDomainPopupData] = useState<DomainDetails>({
        domain_name: '',
        url_posted: '',
        seo_self_qc_status: 'Waiting',
        qa_status: 'Pending',
        approval_status: 'Pending'
    });

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
        mapSource: false,
        classification: false,
        seoMetadata: false,
        keywords: false,
        domains: false,
        blogContent: false,
        resourceUpload: false,
        workflow: false,
        versioning: false,
        actions: false
    });

    // Get unique sectors and industries from master data
    const sectors = [...new Set(industrySectors.map((item: any) => item.sector).filter(Boolean))];
    const industries = [...new Set(industrySectors.map((item: any) => item.industry).filter(Boolean))];
    // Use domain types from SEO Asset master endpoint
    const domainTypes = seoAssetDomainTypes;


    // Enable sections based on Asset ID selection
    useEffect(() => {
        if (selectedAssetId) {
            setIsAssetIdLocked(true);
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
    }, [selectedAssetId]);

    // Load existing asset if editing
    useEffect(() => {
        if (editAssetId && existingAssets.length > 0) {
            const existing = existingAssets.find(a => a.id === editAssetId);
            if (existing) {
                setSelectedAssetId(existing.id);
                setIsAssetIdLocked(true);
                setLinkedProjectId(existing.linked_project_id || null);
                setLinkedCampaignId(existing.linked_campaign_id || null);
                setLinkedServiceId(existing.linked_service_id || null);
                setLinkedSubServiceId(existing.linked_sub_service_id || null);
                setLinkedTaskId(existing.linked_task_id || null);
                setLinkedRepositoryId(existing.linked_repository_item_id || null);
                setAssetType(existing.type || '');
                setSeoTitle((existing as any).seo_title || existing.name || '');
                setMetaTitle((existing as any).seo_meta_title || '');
                setDescription((existing as any).seo_description || '');
                setServiceUrl((existing as any).seo_service_url || '');
                setBlogUrl((existing as any).seo_blog_url || '');
                setAnchorText((existing as any).seo_anchor_text || '');
                setBlogContent((existing as any).seo_blog_content || '');
                setVersionNumber(existing.version_number || 'v1.0');
                setVersionHistory(existing.version_history || []);
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
        }
    }, [editAssetId, existingAssets]);

    // Handle Asset ID Selection
    const handleAssetIdSelect = (assetId: number) => {
        if (assetId) {
            setSelectedAssetId(assetId);
            setIsAssetIdLocked(true);
        }
    };

    // Calculate Approval Status automatically based on QC statuses
    const calculateApprovalStatus = (seoQcStatus: string, qaStatus: string): string => {
        if (seoQcStatus === 'Pass' && qaStatus === 'Approved') return 'Approved';
        if (seoQcStatus === 'Fail' || qaStatus === 'Rejected') return 'Rejected';
        return 'Pending';
    };

    // Handle Add Domain button click
    const handleAddDomain = () => {
        setEditingDomainIndex(null);
        setDomainPopupData({
            domain_name: '',
            url_posted: '',
            seo_self_qc_status: 'Waiting',
            qa_status: 'Pending',
            approval_status: 'Pending'
        });
        setShowDomainPopup(true);
    };

    // Handle Domain Click (edit)
    const handleDomainClick = (index: number) => {
        setEditingDomainIndex(index);
        setDomainPopupData({ ...selectedDomains[index] });
        setShowDomainPopup(true);
    };

    // Handle Domain Popup Save
    const handleSaveDomainDetails = () => {
        if (!domainPopupData.domain_name) {
            alert('Please select a domain from Backlink Master');
            return;
        }

        const approvalStatus = calculateApprovalStatus(
            domainPopupData.seo_self_qc_status,
            domainPopupData.qa_status
        );

        const updatedDomain = { ...domainPopupData, approval_status: approvalStatus };

        if (editingDomainIndex !== null) {
            const updated = [...selectedDomains];
            updated[editingDomainIndex] = updatedDomain;
            setSelectedDomains(updated);
        } else {
            setSelectedDomains([...selectedDomains, updatedDomain]);
        }

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

        if (!selectedAssetId) newErrors.assetId = 'Asset ID is required';
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

                    {/* ========== SECTION 1: Asset ID Selection ========== */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">1</div>
                            <h3 className="text-base font-bold text-slate-800">Asset ID Selection</h3>
                        </div>
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-2">
                                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                                Asset ID *
                            </label>
                            <select
                                value={selectedAssetId || ''}
                                onChange={(e) => handleAssetIdSelect(Number(e.target.value))}
                                disabled={isAssetIdLocked}
                                className={`w-full h-11 px-4 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all ${isAssetIdLocked ? 'bg-slate-100 cursor-not-allowed' : 'border-slate-200'
                                    } ${errors.assetId ? 'border-rose-500' : ''}`}
                            >
                                <option value="">Select Asset ID...</option>
                                {existingAssets.map(asset => (
                                    <option key={asset.id} value={asset.id}>
                                        {asset.id} - {asset.name} ({asset.type || 'N/A'})
                                    </option>
                                ))}
                            </select>
                            {errors.assetId && <p className="text-xs text-rose-500 mt-1">{errors.assetId}</p>}
                            {isAssetIdLocked && (
                                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Asset ID is locked (read-only after selection)
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ========== SECTION 2: Map Asset to Source Work ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm ${!sectionsEnabled.mapSource ? disabledSectionClass : ''}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">2</div>
                            <h3 className="text-base font-bold text-slate-800">Map Asset to Source Work</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Linked Project */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Linked Project</label>
                                <select value={linkedProjectId || ''} onChange={(e) => setLinkedProjectId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                                    <option value="">Select Project...</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
                                </select>
                            </div>
                            {/* Linked Campaign */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Linked Campaign</label>
                                <select value={linkedCampaignId || ''} onChange={(e) => setLinkedCampaignId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                                    <option value="">Select Campaign...</option>
                                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.campaign_name}</option>)}
                                </select>
                            </div>
                            {/* Linked Service */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Linked Service</label>
                                <select value={linkedServiceId || ''} onChange={(e) => setLinkedServiceId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                                    <option value="">Select Service...</option>
                                    {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                                </select>
                            </div>
                            {/* Linked Sub-Service */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Linked Sub-Service</label>
                                <select value={linkedSubServiceId || ''} onChange={(e) => setLinkedSubServiceId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                                    <option value="">Select Sub-Service...</option>
                                    {subServices.filter(ss => !linkedServiceId || ss.parent_service_id === linkedServiceId).map(ss => (
                                        <option key={ss.id} value={ss.id}>{ss.sub_service_name}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Linked Task */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Linked Task</label>
                                <select value={linkedTaskId || ''} onChange={(e) => setLinkedTaskId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                                    <option value="">Select Task...</option>
                                    {tasks.map(task => <option key={task.id} value={task.id}>{task.name}</option>)}
                                </select>
                            </div>
                            {/* Linked Repository Item */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Linked Repository Item</label>
                                <select value={linkedRepositoryId || ''} onChange={(e) => setLinkedRepositoryId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                                    <option value="">Select Repository Item...</option>
                                    {repositoryItems.map(r => <option key={r.id} value={r.id}>{r.content_title_clean || `Item #${r.id}`}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>


                    {/* ========== SECTION 3: Asset Classification ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm ${!sectionsEnabled.classification ? disabledSectionClass : ''}`}>
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
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm ${!sectionsEnabled.seoMetadata ? disabledSectionClass : ''}`}>
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
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm ${!sectionsEnabled.keywords ? disabledSectionClass : ''}`}>
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
                            {/* LSI Keywords */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">LSI Keywords</label>
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-32 overflow-y-auto">
                                    {keywords.length === 0 ? (
                                        <p className="text-sm text-slate-400 text-center py-2">No keywords available in master</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {keywords.filter(kw => kw.id !== primaryKeywordId).map(kw => (
                                                <button key={kw.id} type="button"
                                                    onClick={() => setLsiKeywords(prev => prev.includes(kw.id) ? prev.filter(id => id !== kw.id) : [...prev, kw.id])}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${lsiKeywords.includes(kw.id)
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300'
                                                        }`}>
                                                    {kw.keyword}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* ========== SECTION 6: Domain Type & Domain Addition ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm ${!sectionsEnabled.domains ? disabledSectionClass : ''}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">6</div>
                            <h3 className="text-base font-bold text-slate-800">Domain Type & Domain Addition</h3>
                        </div>
                        <div className="space-y-4">
                            {/* Domain Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Domain Type</label>
                                <select value={domainType} onChange={(e) => setDomainType(e.target.value)}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400">
                                    <option value="">Select Domain Type from Backlink Master...</option>
                                    {domainTypes.map((dt: string) => <option key={dt} value={dt}>{dt}</option>)}
                                </select>
                            </div>
                            {/* Add Domain Button & List */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-slate-600">Domains</label>
                                    <button type="button" onClick={handleAddDomain}
                                        className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Domain
                                    </button>
                                </div>
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 min-h-[80px]">
                                    {selectedDomains.length === 0 ? (
                                        <p className="text-sm text-slate-400 text-center py-3">No domains added. Click "+ Add Domain" to add from Backlink Master.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {selectedDomains.map((domain, idx) => (
                                                <div key={idx}
                                                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-pink-300 transition-all">
                                                    <div className="flex-1 cursor-pointer" onClick={() => handleDomainClick(idx)}>
                                                        <p className="text-sm font-medium text-slate-800">{domain.domain_name}</p>
                                                        <p className="text-xs text-slate-500">{domain.url_posted || 'Click to add URL'}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${domain.approval_status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                            domain.approval_status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                                                                'bg-amber-100 text-amber-700'
                                                            }`}>
                                                            {domain.approval_status}
                                                        </span>
                                                        <button onClick={() => handleDeleteDomain(idx)} className="p-1 hover:bg-slate-100 rounded">
                                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ========== SECTION 7: Domain Details Popup (Modal) ========== */}
                    {showDomainPopup && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-rose-500 rounded flex items-center justify-center text-white text-xs font-bold">7</div>
                                        <h3 className="text-base font-bold text-slate-800">Domain Details (Mandatory)</h3>
                                    </div>
                                    <button onClick={() => setShowDomainPopup(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {/* Domain Name */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-2">
                                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>Domain Name *
                                        </label>
                                        {editingDomainIndex !== null ? (
                                            <input type="text" value={domainPopupData.domain_name} disabled
                                                className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-xl text-sm cursor-not-allowed" />
                                        ) : (
                                            <select value={domainPopupData.domain_name}
                                                onChange={(e) => setDomainPopupData({ ...domainPopupData, domain_name: e.target.value })}
                                                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400">
                                                <option value="">Select from Backlink Master...</option>
                                                {backlinkDomains.filter(b => !selectedDomains.some(d => d.domain_name === b.name))
                                                    .map(b => <option key={b.id} value={b.name}>{b.name} (DA: {b.da})</option>)}
                                            </select>
                                        )}
                                    </div>
                                    {/* URL Posted */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-2">URL Posted</label>
                                        <input type="url" value={domainPopupData.url_posted}
                                            onChange={(e) => setDomainPopupData({ ...domainPopupData, url_posted: e.target.value })}
                                            placeholder="https://example.com/posted-url"
                                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400" />
                                    </div>
                                    {/* SEO Self QC Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-2">SEO Self QC Status</label>
                                        <select value={domainPopupData.seo_self_qc_status}
                                            onChange={(e) => setDomainPopupData({ ...domainPopupData, seo_self_qc_status: e.target.value })}
                                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400">
                                            {QC_STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                    </div>
                                    {/* QA Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-2">QA Status</label>
                                        <select value={domainPopupData.qa_status}
                                            onChange={(e) => setDomainPopupData({ ...domainPopupData, qa_status: e.target.value })}
                                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400">
                                            {QA_STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                    </div>
                                    {/* Approval Status (Auto) */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-2">Approval Status (Auto)</label>
                                        <div className={`w-full h-10 px-3 flex items-center rounded-xl text-sm font-medium ${calculateApprovalStatus(domainPopupData.seo_self_qc_status, domainPopupData.qa_status) === 'Approved'
                                            ? 'bg-green-100 text-green-700'
                                            : calculateApprovalStatus(domainPopupData.seo_self_qc_status, domainPopupData.qa_status) === 'Rejected'
                                                ? 'bg-rose-100 text-rose-700'
                                                : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {calculateApprovalStatus(domainPopupData.seo_self_qc_status, domainPopupData.qa_status)}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">Auto-calculated based on QC statuses</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => setShowDomainPopup(false)}
                                        className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={handleSaveDomainDetails}
                                        disabled={!domainPopupData.domain_name}
                                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 transition-all">
                                        Save Domain
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* ========== SECTION 8: Blog Posting - Content Editor (Conditional) ========== */}
                    {isBlogPosting && (
                        <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm ${!sectionsEnabled.blogContent ? disabledSectionClass : ''}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">8</div>
                                <h3 className="text-base font-bold text-slate-800">Blog Posting - Content Editor</h3>
                                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Only for Blog Posting</span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Content Editor</label>
                                <textarea value={blogContent} onChange={(e) => setBlogContent(e.target.value)}
                                    placeholder="Enter your blog content here. Supports headings, formatting, links, and paragraphs..."
                                    rows={12}
                                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-y" />
                                <p className="text-xs text-slate-400 mt-2">Rich text editor for blog content with support for headings, formatting, links, and paragraphs</p>
                            </div>
                        </div>
                    )}

                    {/* ========== SECTION 9: Resource File Upload ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm ${!sectionsEnabled.resourceUpload ? disabledSectionClass : ''}`}>
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
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm ${!sectionsEnabled.workflow ? disabledSectionClass : ''}`}>
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
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm ${!sectionsEnabled.versioning ? disabledSectionClass : ''}`}>
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
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm ${!sectionsEnabled.actions ? disabledSectionClass : ''}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">12</div>
                            <h3 className="text-base font-bold text-slate-800">Actions</h3>
                        </div>
                        <div className="flex gap-4">
                            {/* Save (Draft) */}
                            <button onClick={handleSaveDraft} disabled={isSubmitting}
                                className="flex-1 px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 disabled:opacity-50 transition-all">
                                {isSubmitting ? 'Saving...' : 'Save (Draft)'}
                            </button>
                            {/* Submit */}
                            <button onClick={handleSubmit} disabled={isSubmitting}
                                className="flex-1 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25 disabled:opacity-50 transition-all">
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                            {/* Discard */}
                            <button onClick={handleDiscard} disabled={isSubmitting}
                                className="px-5 py-2.5 text-sm font-medium text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 disabled:opacity-50 transition-all">
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
