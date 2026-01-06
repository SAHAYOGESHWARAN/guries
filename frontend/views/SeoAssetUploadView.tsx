import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import MarkdownEditor from '../components/MarkdownEditor';
import type {
    Task, Campaign, Project, Service, SubServiceItem,
    ContentRepositoryItem, User, Keyword, BacklinkSource,
    AssetTypeMasterItem, AssetCategoryMasterItem, AssetLibraryItem
} from '../types';

interface SeoAssetUploadViewProps {
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
    const { data: backlinks = [] } = useData<BacklinkSource>('backlinks');
    const { data: industrySectors = [] } = useData<any>('industry-sectors');

    // ========== STEP 1: Asset ID Selection ==========
    const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
    const [isAssetIdLocked, setIsAssetIdLocked] = useState(false);

    // ========== STEP 2: Map Asset to Source Work ==========
    const [linkedTaskId, setLinkedTaskId] = useState<number | null>(null);
    const [linkedCampaignId, setLinkedCampaignId] = useState<number | null>(null);
    const [linkedProjectId, setLinkedProjectId] = useState<number | null>(null);
    const [linkedServiceId, setLinkedServiceId] = useState<number | null>(null);
    const [linkedSubServiceId, setLinkedSubServiceId] = useState<number | null>(null);
    const [linkedRepositoryId, setLinkedRepositoryId] = useState<number | null>(null);

    // ========== STEP 3: Asset Classification ==========
    const [assetType, setAssetType] = useState('');
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
    const [keywordSearch, setKeywordSearch] = useState('');
    const [showKeywordDropdown, setShowKeywordDropdown] = useState(false);
    const [showLsiDropdown, setShowLsiDropdown] = useState(false);

    // ========== STEP 6: Domain Type & Domain Addition ==========
    const [domainType, setDomainType] = useState('');
    const [selectedDomains, setSelectedDomains] = useState<DomainDetails[]>([]);

    // ========== STEP 7: Domain Details Popup ==========
    const [showDomainPopup, setShowDomainPopup] = useState(false);
    const [editingDomainIndex, setEditingDomainIndex] = useState<number | null>(null);
    const [domainPopupData, setDomainPopupData] = useState<DomainDetails>({
        domain_name: '',
        url_posted: '',
        seo_self_qc_status: 'Waiting',
        qa_status: 'Pending',
        approval_status: 'Pending'
    });

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
    const [errors, setErrors] = useState<Record<string, string>>({});

    const currentUser = user || { id: 1, name: 'Current User' };

    // Sections enabled state - all disabled until Asset ID is selected
    const sectionsEnabled = selectedAssetId !== null;

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

    // Domain types from backlinks master
    const domainTypes = useMemo(() =>
        [...new Set(backlinks.map(b => b.domain_type || b.type).filter(Boolean))],
        [backlinks]
    );

    // Check if Blog Posting type (for conditional content editor)
    const isBlogPosting = assetType.toLowerCase().includes('blog');

    // Filtered keywords for search
    const filteredKeywords = useMemo(() => {
        if (!keywordSearch.trim()) return keywords.slice(0, 20);
        return keywords.filter(k =>
            k.keyword?.toLowerCase().includes(keywordSearch.toLowerCase())
        ).slice(0, 20);
    }, [keywords, keywordSearch]);

    // ========== Handle Asset ID Selection ==========
    const handleAssetIdSelect = (assetId: number) => {
        if (assetId) {
            setSelectedAssetId(assetId);
            setIsAssetIdLocked(true);

            // Pre-fill data from selected asset
            const asset = existingAssets.find(a => a.id === assetId);
            if (asset) {
                setLinkedTaskId(asset.linked_task_id || null);
                setLinkedCampaignId(asset.linked_campaign_id || null);
                setLinkedProjectId(asset.linked_project_id || null);
                setLinkedServiceId(asset.linked_service_id || null);
                setLinkedSubServiceId(asset.linked_sub_service_id || null);
                setLinkedRepositoryId(asset.linked_repository_item_id || null);
                setAssetType(asset.type || '');
                setSeoTitle(asset.name || '');
            }
        }
    };

    // Calculate Approval Status automatically based on QC statuses
    const calculateApprovalStatus = (seoQcStatus: string, qaStatus: string): string => {
        if (seoQcStatus === 'Pass' && qaStatus === 'Approved') return 'Approved';
        if (seoQcStatus === 'Fail' || qaStatus === 'Rejected') return 'Rejected';
        return 'Pending';
    };

    // ========== Domain Handlers ==========
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

    const handleDomainClick = (index: number) => {
        setEditingDomainIndex(index);
        setDomainPopupData({ ...selectedDomains[index] });
        setShowDomainPopup(true);
    };

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

        if (!selectedAssetId) newErrors.assetId = 'Asset ID is required';
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
            linked_sub_service_id: linkedSubServiceId,
            linked_repository_item_id: linkedRepositoryId,
            asset_type: assetType,
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

                    {/* ========== STEP 1: Asset ID Selection ========== */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">1</div>
                            <h3 className="text-base font-bold text-slate-800">Asset ID Selection</h3>
                            <span className="text-xs text-rose-500 font-medium">* Mandatory</span>
                        </div>
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-2">
                                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                                Asset ID (Dropdown - Single Select)
                            </label>
                            <select
                                value={selectedAssetId || ''}
                                onChange={(e) => handleAssetIdSelect(Number(e.target.value))}
                                disabled={isAssetIdLocked}
                                className={`w-full h-11 px-4 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all ${isAssetIdLocked ? 'bg-slate-100 cursor-not-allowed' : 'border-slate-200'} ${errors.assetId ? 'border-rose-500' : ''}`}
                            >
                                <option value="">Select Asset ID...</option>
                                {existingAssets.map(asset => (
                                    <option key={asset.id} value={asset.id}>
                                        {String(asset.id).padStart(4, '0')} - {asset.name} ({asset.type || 'N/A'})
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
                            <p className="text-xs text-slate-400 mt-1">Only Asset IDs already created in the system are displayed. No manual typing allowed.</p>
                        </div>
                    </div>

                    {/* ========== STEP 2: Map Asset to Source Work ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm ${!sectionsEnabled ? disabledSectionClass : ''}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">2</div>
                            <h3 className="text-base font-bold text-slate-800">Map Asset to Source Work</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">Link the selected Asset ID to its originating work/source</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Linked Task</label>
                                <select value={linkedTaskId || ''} onChange={(e) => setLinkedTaskId(e.target.value ? Number(e.target.value) : null)} disabled={!sectionsEnabled}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:opacity-50">
                                    <option value="">Select Task...</option>
                                    {tasks.map(task => <option key={task.id} value={task.id}>{task.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Linked Campaign</label>
                                <select value={linkedCampaignId || ''} onChange={(e) => setLinkedCampaignId(e.target.value ? Number(e.target.value) : null)} disabled={!sectionsEnabled}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:opacity-50">
                                    <option value="">Select Campaign...</option>
                                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.campaign_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Linked Project</label>
                                <select value={linkedProjectId || ''} onChange={(e) => setLinkedProjectId(e.target.value ? Number(e.target.value) : null)} disabled={!sectionsEnabled}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:opacity-50">
                                    <option value="">Select Project...</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Linked Service</label>
                                <select value={linkedServiceId || ''} onChange={(e) => { setLinkedServiceId(e.target.value ? Number(e.target.value) : null); setLinkedSubServiceId(null); }} disabled={!sectionsEnabled}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:opacity-50">
                                    <option value="">Select Service...</option>
                                    {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Linked Sub-Service</label>
                                <select value={linkedSubServiceId || ''} onChange={(e) => setLinkedSubServiceId(e.target.value ? Number(e.target.value) : null)} disabled={!sectionsEnabled || !linkedServiceId}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:opacity-50">
                                    <option value="">{linkedServiceId ? 'Select Sub-Service...' : 'Select a service first'}</option>
                                    {filteredSubServices.map(ss => <option key={ss.id} value={ss.id}>{ss.sub_service_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Linked Repository Item</label>
                                <select value={linkedRepositoryId || ''} onChange={(e) => setLinkedRepositoryId(e.target.value ? Number(e.target.value) : null)} disabled={!sectionsEnabled}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 disabled:opacity-50">
                                    <option value="">Select Repository Item...</option>
                                    {repositoryItems.map(r => <option key={r.id} value={r.id}>{r.content_title_clean || `Item #${r.id}`}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>


                    {/* ========== STEP 3: Asset Classification ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm ${!sectionsEnabled ? disabledSectionClass : ''}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">3</div>
                            <h3 className="text-base font-bold text-slate-800">Asset Classification</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">All fields fetched from Master Database - No hardcoding allowed</p>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Asset Type</label>
                                <select value={assetType} onChange={(e) => setAssetType(e.target.value)} disabled={!sectionsEnabled}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 disabled:opacity-50">
                                    <option value="">Select Asset Type...</option>
                                    {activeAssetTypes.map(type => (
                                        <option key={type.id} value={type.asset_type_name}>{type.asset_type_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Sector</label>
                                <select value={sector} onChange={(e) => setSector(e.target.value)} disabled={!sectionsEnabled}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 disabled:opacity-50">
                                    <option value="">Select Sector...</option>
                                    {sectors.map((s: string, idx: number) => (
                                        <option key={idx} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Industry</label>
                                <select value={industry} onChange={(e) => setIndustry(e.target.value)} disabled={!sectionsEnabled}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 disabled:opacity-50">
                                    <option value="">Select Industry...</option>
                                    {industries.map((ind: string, idx: number) => (
                                        <option key={idx} value={ind}>{ind}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* ========== STEP 4: SEO Metadata Fields & Anchor Text ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm ${!sectionsEnabled ? disabledSectionClass : ''}`}>
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
                                    <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} disabled={!sectionsEnabled}
                                        placeholder="Enter SEO Title" className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 disabled:opacity-50 ${errors.seoTitle ? 'border-rose-500' : 'border-slate-200'}`} />
                                    {errors.seoTitle && <p className="text-xs text-rose-500 mt-1">{errors.seoTitle}</p>}
                                </div>
                                <div>
                                    <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-2">
                                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                                        Meta Title *
                                    </label>
                                    <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} disabled={!sectionsEnabled}
                                        placeholder="Enter Meta Title" className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 disabled:opacity-50 ${errors.metaTitle ? 'border-rose-500' : 'border-slate-200'}`} />
                                    {errors.metaTitle && <p className="text-xs text-rose-500 mt-1">{errors.metaTitle}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-2">
                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                                    Description *
                                </label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} disabled={!sectionsEnabled} rows={3}
                                    placeholder="Enter SEO Description" className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 resize-none disabled:opacity-50 ${errors.description ? 'border-rose-500' : 'border-slate-200'}`} />
                                {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Service URL (Optional)</label>
                                    <input type="url" value={serviceUrl} onChange={(e) => setServiceUrl(e.target.value)} disabled={!sectionsEnabled}
                                        placeholder="https://example.com/service" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 disabled:opacity-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Blog URL (Optional)</label>
                                    <input type="url" value={blogUrl} onChange={(e) => setBlogUrl(e.target.value)} disabled={!sectionsEnabled}
                                        placeholder="https://example.com/blog" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 disabled:opacity-50" />
                                </div>
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-2">
                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                                    Anchor Text *
                                </label>
                                <input type="text" value={anchorText} onChange={(e) => setAnchorText(e.target.value)} disabled={!sectionsEnabled}
                                    placeholder="Enter Anchor Text" className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 disabled:opacity-50 ${errors.anchorText ? 'border-rose-500' : 'border-slate-200'}`} />
                                {errors.anchorText && <p className="text-xs text-rose-500 mt-1">{errors.anchorText}</p>}
                            </div>
                        </div>
                    </div>


                    {/* ========== STEP 5: Keywords ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm ${!sectionsEnabled ? disabledSectionClass : ''}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">5</div>
                            <h3 className="text-base font-bold text-slate-800">Keywords</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">Keywords must integrate with Keyword Master - Manual free-text entry not allowed</p>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Primary Keyword - Integrated Dropdown/Search */}
                            <div className="relative">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-2">
                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                                    Primary Keyword * (Integrated Dropdown/Search)
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={keywordSearch}
                                        onChange={(e) => { setKeywordSearch(e.target.value); setShowKeywordDropdown(true); }}
                                        onFocus={() => setShowKeywordDropdown(true)}
                                        disabled={!sectionsEnabled}
                                        placeholder="Search keywords..."
                                        className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 disabled:opacity-50 ${errors.primaryKeyword ? 'border-rose-500' : 'border-slate-200'}`}
                                    />
                                    {primaryKeywordId && (
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                                {keywords.find(k => k.id === primaryKeywordId)?.keyword}
                                            </span>
                                            <button onClick={() => { setPrimaryKeywordId(null); setKeywordSearch(''); }} className="text-slate-400 hover:text-rose-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {showKeywordDropdown && sectionsEnabled && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                        {filteredKeywords.length > 0 ? filteredKeywords.map(kw => (
                                            <button key={kw.id} onClick={() => { setPrimaryKeywordId(kw.id); setKeywordSearch(''); setShowKeywordDropdown(false); }}
                                                className="w-full px-3 py-2 text-left text-sm hover:bg-amber-50 flex items-center justify-between">
                                                <span>{kw.keyword}</span>
                                                {kw.search_volume && <span className="text-xs text-slate-400">Vol: {kw.search_volume}</span>}
                                            </button>
                                        )) : (
                                            <p className="px-3 py-2 text-sm text-slate-400">No keywords found</p>
                                        )}
                                    </div>
                                )}
                                {errors.primaryKeyword && <p className="text-xs text-rose-500 mt-1">{errors.primaryKeyword}</p>}
                            </div>

                            {/* LSI Keywords - Multi-select */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-slate-600 mb-2">LSI Keywords (Multi-select - Optional)</label>
                                <div className="relative">
                                    <button onClick={() => setShowLsiDropdown(!showLsiDropdown)} disabled={!sectionsEnabled}
                                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-left flex items-center justify-between disabled:opacity-50">
                                        <span className="text-slate-500">{lsiKeywordIds.length > 0 ? `${lsiKeywordIds.length} selected` : 'Select LSI Keywords...'}</span>
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>
                                {showLsiDropdown && sectionsEnabled && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                        {keywords.slice(0, 30).map(kw => (
                                            <button key={kw.id} onClick={() => toggleLsiKeyword(kw.id)}
                                                className={`w-full px-3 py-2 text-left text-sm hover:bg-amber-50 flex items-center gap-2 ${lsiKeywordIds.includes(kw.id) ? 'bg-amber-50' : ''}`}>
                                                <input type="checkbox" checked={lsiKeywordIds.includes(kw.id)} readOnly className="w-4 h-4 text-amber-500 rounded" />
                                                <span>{kw.keyword}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {lsiKeywordIds.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {lsiKeywordIds.map(id => {
                                            const kw = keywords.find(k => k.id === id);
                                            return kw ? (
                                                <span key={id} className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                                    {kw.keyword}
                                                    <button onClick={() => toggleLsiKeyword(id)} className="hover:text-rose-500">×</button>
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                    {/* ========== STEP 6: Domain Type & Domain Addition ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm ${!sectionsEnabled ? disabledSectionClass : ''}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">6</div>
                            <h3 className="text-base font-bold text-slate-800">Domain Type & Domain Addition</h3>
                        </div>
                        <div className="space-y-4">
                            {/* 6.1 Domain Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Domain Type (from Backlink Master)</label>
                                <select value={domainType} onChange={(e) => setDomainType(e.target.value)} disabled={!sectionsEnabled}
                                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 disabled:opacity-50">
                                    <option value="">Select Domain Type...</option>
                                    {domainTypes.map((dt: string, idx: number) => (
                                        <option key={idx} value={dt}>{dt}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 6.2 Domain Addition */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-slate-600">Added Domains (from Backlink Master)</label>
                                    <button onClick={handleAddDomain} disabled={!sectionsEnabled}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500 text-white rounded-lg text-xs font-medium hover:bg-cyan-600 disabled:opacity-50">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Domain
                                    </button>
                                </div>
                                <p className="text-xs text-slate-400 mb-3">Multiple domains allowed per SEO Asset. Click on a domain to edit details.</p>

                                {/* Domain List */}
                                {selectedDomains.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedDomains.map((domain, idx) => (
                                            <div key={idx} onClick={() => handleDomainClick(idx)}
                                                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:border-cyan-400 hover:bg-cyan-50/50 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-700">{domain.domain_name}</p>
                                                        <p className="text-xs text-slate-400">{domain.url_posted || 'No URL posted'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeColor(domain.approval_status || 'Pending')}`}>
                                                        {domain.approval_status || 'Pending'}
                                                    </span>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteDomain(idx); }}
                                                        className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                        </svg>
                                        <p className="text-sm text-slate-400">No domains added yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                    {/* ========== STEP 7: Domain Details Popup ========== */}
                    {showDomainPopup && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl">
                                <div className="bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-4 rounded-t-2xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white text-sm font-bold">7</div>
                                            <h3 className="text-white font-bold">{editingDomainIndex !== null ? 'Edit Domain Details' : 'Add Domain Details'}</h3>
                                        </div>
                                        <button onClick={() => setShowDomainPopup(false)} className="text-white/80 hover:text-white">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="text-cyan-100 text-xs mt-1">Mandatory interaction - Complete all fields</p>
                                </div>
                                <div className="p-6 space-y-4">
                                    {/* Domain Name - from Backlink Master */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-2">Domain Name (from Backlink Master)</label>
                                        <select value={domainPopupData.domain_name} onChange={(e) => setDomainPopupData({ ...domainPopupData, domain_name: e.target.value })}
                                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400">
                                            <option value="">Select Domain...</option>
                                            {backlinks.map(bl => (
                                                <option key={bl.id} value={bl.domain || bl.source_name}>{bl.domain || bl.source_name} (DA: {bl.da || bl.domain_authority || 'N/A'})</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* URL Posted - User Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-2">URL Posted (User Input)</label>
                                        <input type="url" value={domainPopupData.url_posted} onChange={(e) => setDomainPopupData({ ...domainPopupData, url_posted: e.target.value })}
                                            placeholder="https://example.com/posted-url" className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400" />
                                    </div>

                                    {/* SEO Self QC Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-2">SEO Self QC Status</label>
                                        <select value={domainPopupData.seo_self_qc_status} onChange={(e) => setDomainPopupData({ ...domainPopupData, seo_self_qc_status: e.target.value })}
                                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400">
                                            {QC_STATUS_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label} → {opt.displayStatus}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* QA Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-2">QA Status</label>
                                        <select value={domainPopupData.qa_status} onChange={(e) => setDomainPopupData({ ...domainPopupData, qa_status: e.target.value })}
                                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400">
                                            {QA_STATUS_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Auto-calculated Approval Status */}
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                        <p className="text-xs text-slate-500 mb-1">System Display Status (Auto-calculated)</p>
                                        <span className={`inline-block text-sm font-medium px-3 py-1 rounded-full ${getStatusBadgeColor(calculateApprovalStatus(domainPopupData.seo_self_qc_status, domainPopupData.qa_status))}`}>
                                            {calculateApprovalStatus(domainPopupData.seo_self_qc_status, domainPopupData.qa_status)}
                                        </span>
                                        <p className="text-xs text-slate-400 mt-2">Pass + Approved = Approved | Fail/Rejected = Rejected | Otherwise = Pending</p>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                                    <button onClick={() => setShowDomainPopup(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg">Cancel</button>
                                    <button onClick={handleSaveDomainDetails} className="px-4 py-2 text-sm font-medium bg-cyan-500 text-white rounded-lg hover:bg-cyan-600">Save Domain</button>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* ========== STEP 8: Blog Posting - Content Editor (Conditional) ========== */}
                    {isBlogPosting && sectionsEnabled && (
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
                    )}

                    {/* Show placeholder when not Blog Posting */}
                    {!isBlogPosting && sectionsEnabled && (
                        <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm ${disabledSectionClass}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">8</div>
                                <h3 className="text-base font-bold text-slate-800">Blog Posting - Content Editor</h3>
                                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Hidden: Asset Type ≠ Blog Posting</span>
                            </div>
                            <p className="text-sm text-slate-400 text-center py-4">Content editor is only visible when Asset Type = Blog Posting</p>
                        </div>
                    )}

                    {/* ========== STEP 9: Resource File Upload ========== */}
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm ${!sectionsEnabled ? disabledSectionClass : ''}`}>
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
                            <input type="file" multiple onChange={handleFileUpload} className="hidden" id="resource-upload" disabled={!sectionsEnabled} />
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
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm ${!sectionsEnabled ? disabledSectionClass : ''}`}>
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
                                        <button key={u.id} onClick={() => toggleTeamMember(u.id)} disabled={!sectionsEnabled}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${assignedTeamMembers.includes(u.id) ? 'bg-amber-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-400'} disabled:opacity-50`}>
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
                                    <select value={verifiedBy || ''} onChange={(e) => setVerifiedBy(e.target.value ? Number(e.target.value) : null)} disabled={!sectionsEnabled}
                                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 disabled:opacity-50">
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
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm ${!sectionsEnabled ? disabledSectionClass : ''}`}>
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
                            <button onClick={() => setShowVersionHistory(!showVersionHistory)} disabled={!sectionsEnabled}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50">
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
                    <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm ${!sectionsEnabled ? disabledSectionClass : ''}`}>
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
                                className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50">
                                Discard
                            </button>
                            <button onClick={handleSaveDraft} disabled={!sectionsEnabled || isSubmitting}
                                className="px-5 py-2.5 bg-slate-600 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50">
                                {isSubmitting ? 'Saving...' : 'Save (Draft)'}
                            </button>
                            <button onClick={handleSubmit} disabled={!sectionsEnabled || isSubmitting}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50">
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

                </div>
            </div>
        </div>
    );
};

export default SeoAssetUploadView;
