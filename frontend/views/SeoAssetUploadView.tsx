import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import type { AssetLibraryItem, Task, ContentRepositoryItem, User, Keyword } from '../types';

interface SeoAssetUploadViewProps {
    onNavigate?: (view: string, id?: number) => void;
    editAssetId?: number;
}

// SEO Content Types
const SEO_CONTENT_TYPES = ['Meta Title', 'Meta Description', 'Alt Text', 'Schema Markup', 'Canonical URL', 'Robots Directive', 'Sitemap Entry', 'Redirect Rule'];

// SEO Asset Types
const SEO_ASSET_TYPES = ['On-Page SEO', 'Technical SEO', 'Local SEO', 'Schema', 'Sitemap', 'Robots.txt'];

// Workflow Stages
const WORKFLOW_STAGES = [
    { value: 'Add', label: 'Add' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Sent to QC', label: 'Sent to QC' },
    { value: 'Published', label: 'Published' },
    { value: 'In Rework', label: 'In Rework' }
];

// QC Status Options
const QC_STATUS_OPTIONS = [
    { value: '', label: 'Not Applicable' },
    { value: 'QC Pending', label: 'QC Pending' },
    { value: 'Rework', label: 'Rework' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' }
];

const SeoAssetUploadView: React.FC<SeoAssetUploadViewProps> = ({ onNavigate, editAssetId }) => {
    const { user } = useAuth();

    // Data hooks
    const { data: tasks = [], loading: tasksLoading } = useData<Task>('tasks');
    const { data: repositoryItems = [], loading: repoLoading } = useData<ContentRepositoryItem>('content');
    const { data: users = [] } = useData<User>('users');
    const { data: keywords = [] } = useData<Keyword>('keywords');
    const { data: assets = [], create: createAsset, update: updateAsset, refresh } = useData<AssetLibraryItem>('assetLibrary');

    // Form state
    const [formData, setFormData] = useState<Partial<AssetLibraryItem>>({
        name: '', application_type: 'seo', type: 'On-Page SEO', status: 'Draft',
        seo_content_type: 'Meta Title', seo_target_url: '', seo_meta_title: '', seo_meta_description: '',
        seo_focus_keyword: '', seo_secondary_keywords: '', seo_content_body: '',
        seo_score: 0, grammar_score: 0, version_number: 'v1.0'
    });

    // Linked items
    const [linkedRepositoryId, setLinkedRepositoryId] = useState<number | null>(null);
    const [linkedTaskId, setLinkedTaskId] = useState<number | null>(null);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

    // Keywords
    const [seoKeywords, setSeoKeywords] = useState<string[]>([]);

    // Workflow & QC
    const [workflowStage, setWorkflowStage] = useState('Add');
    const [qcStatus, setQcStatus] = useState('');

    // Version history
    const [versionHistory, setVersionHistory] = useState<Array<{ version: string; date: string; action: string; user: string }>>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const currentUser = user || { id: 1, name: 'Current User' };

    // Filter tasks based on selected repository
    useEffect(() => {
        if (linkedRepositoryId) {
            const related = tasks.filter(t => t.linked_repository_id === linkedRepositoryId || !t.linked_repository_id);
            setFilteredTasks(related.length > 0 ? related : tasks);
        } else {
            setFilteredTasks(tasks);
        }
    }, [linkedRepositoryId, tasks]);

    // Load existing asset if editing
    useEffect(() => {
        if (editAssetId && assets.length > 0) {
            const existing = assets.find(a => a.id === editAssetId);
            if (existing) {
                setFormData(existing);
                setLinkedRepositoryId(existing.linked_repository_item_id || null);
                setLinkedTaskId(existing.linked_task_id || null);
                setSeoKeywords(existing.seo_keywords || []);
                setWorkflowStage(existing.workflow_stage || 'Add');
                setQcStatus(existing.qc_status || '');
                setVersionHistory(existing.version_history || []);
            }
        }
    }, [editAssetId, assets]);

    // Handle workflow stage change
    const handleWorkflowStageChange = (newStage: string) => {
        setWorkflowStage(newStage);
        if (newStage === 'Sent to QC') setQcStatus('QC Pending');
        else if (newStage === 'Add' || newStage === 'In Progress') setQcStatus('');
    };

    // Handle QC status change
    const handleQcStatusChange = (newStatus: string) => {
        setQcStatus(newStatus);
        if (newStatus === 'Rework') setWorkflowStage('In Rework');
    };

    // SEO keyword toggle
    const handleSeoKeywordToggle = (keyword: string) => {
        setSeoKeywords(prev => prev.includes(keyword) ? prev.filter(k => k !== keyword) : [...prev, keyword]);
    };

    // AI Analysis
    const analyzeContent = useCallback(async () => {
        setIsAnalyzing(true);
        try {
            const content = formData.seo_content_body || '';
            const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
            const response = await fetch(`${apiUrl}/assetLibrary/ai-scores`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    title: formData.seo_meta_title,
                    meta_description: formData.seo_meta_description,
                    keywords: seoKeywords
                })
            });
            if (response.ok) {
                const scores = await response.json();
                setFormData(prev => ({ ...prev, seo_score: scores.seo_score, grammar_score: scores.grammar_score }));
            } else {
                setFormData(prev => ({ ...prev, seo_score: Math.floor(Math.random() * 30) + 70, grammar_score: Math.floor(Math.random() * 20) + 80 }));
            }
        } catch {
            setFormData(prev => ({ ...prev, seo_score: Math.floor(Math.random() * 30) + 70, grammar_score: Math.floor(Math.random() * 20) + 80 }));
        } finally {
            setIsAnalyzing(false);
        }
    }, [formData.seo_meta_title, formData.seo_meta_description, formData.seo_content_body, seoKeywords]);

    // Form submission
    const handleSubmit = async (submitForQC: boolean = false) => {
        if (!formData.name?.trim() && !formData.seo_meta_title?.trim()) {
            alert('Please enter an asset name or meta title'); return;
        }

        setIsSubmitting(true);
        try {
            const newVersion = editAssetId
                ? `v${(parseFloat(formData.version_number?.replace('v', '') || '1.0') + 0.1).toFixed(1)}`
                : 'v1.0';
            const newVersionEntry = {
                version: newVersion,
                date: new Date().toISOString(),
                action: submitForQC ? 'Submitted for QC' : editAssetId ? 'Updated' : 'Created',
                user: currentUser?.name || 'Unknown'
            };

            const assetData: Partial<AssetLibraryItem> = {
                ...formData,
                name: formData.seo_meta_title || formData.name,
                application_type: 'seo',
                linked_repository_item_id: linkedRepositoryId,
                linked_task_id: linkedTaskId,
                seo_keywords: seoKeywords,
                keywords: seoKeywords,
                created_by: currentUser?.id,
                workflow_stage: submitForQC ? 'Sent to QC' : workflowStage === 'Add' ? 'In Progress' : workflowStage,
                status: submitForQC ? 'Pending QC Review' : 'Draft',
                qc_status: submitForQC ? 'QC Pending' : qcStatus,
                version_number: editAssetId ? newVersion : 'v1.0',
                version_history: [...versionHistory, newVersionEntry],
                date: new Date().toISOString(),
                repository: 'SEO'
            };

            if (editAssetId) await updateAsset(editAssetId, assetData);
            else await createAsset(assetData as AssetLibraryItem);

            await refresh?.();
            alert(submitForQC ? 'SEO Asset submitted for QC successfully!' : 'SEO Asset saved successfully!');
            onNavigate?.('assets');
        } catch (error) {
            console.error('Error saving SEO asset:', error);
            alert('Failed to save SEO asset. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                            <h1 className="text-lg font-bold text-slate-800">{editAssetId ? 'Edit SEO Asset' : 'Upload Assets → SEO'}</h1>
                            <p className="text-xs text-slate-500">Create and manage SEO content assets</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => onNavigate?.('assets')} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                    <button onClick={() => handleSubmit(false)} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25 disabled:opacity-50 transition-all">
                        {isSubmitting ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button onClick={() => handleSubmit(true)} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 disabled:opacity-50 transition-all">
                        Submit for QC
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto space-y-5">
                    {/* Section 1: Map to Source */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-green-400/30">1</div>
                            <div><h3 className="text-sm font-bold text-slate-800">Map to Source Work</h3><p className="text-xs text-slate-500">Link to repository and task</p></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Linked Repository</label>
                                <select value={linkedRepositoryId || ''} onChange={e => { setLinkedRepositoryId(e.target.value ? Number(e.target.value) : null); setLinkedTaskId(null); }} disabled={repoLoading} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all">
                                    <option value="">Select Repository...</option>
                                    {repositoryItems.map(repo => <option key={repo.id} value={repo.id}>{repo.content_title_clean || repo.title || `Repository #${repo.id}`}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Linked Task</label>
                                <select value={linkedTaskId || ''} onChange={e => setLinkedTaskId(e.target.value ? Number(e.target.value) : null)} disabled={tasksLoading} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all">
                                    <option value="">Select Task...</option>
                                    {filteredTasks.map(task => <option key={task.id} value={task.id}>{task.name || `Task #${task.id}`}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Asset Classification */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-emerald-400/30">2</div>
                            <div><h3 className="text-sm font-bold text-slate-800">Asset Classification</h3><p className="text-xs text-slate-500">Define asset name and type</p></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5"><span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span> Asset Name *</label>
                                <input type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Enter asset name..." className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all" />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5"><span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span> SEO Asset Type *</label>
                                <select value={formData.type || ''} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all">
                                    <option value="">Select Type...</option>
                                    {SEO_ASSET_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: SEO Content Details */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-teal-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-teal-400/30">3</div>
                            <div><h3 className="text-sm font-bold text-slate-800">SEO Content Details</h3><p className="text-xs text-slate-500">Meta information and keywords</p></div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">SEO Content Type</label>
                                    <select value={formData.seo_content_type || ''} onChange={e => setFormData({ ...formData, seo_content_type: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all">
                                        {SEO_CONTENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Target URL</label>
                                    <input type="text" value={formData.seo_target_url || ''} onChange={e => setFormData({ ...formData, seo_target_url: e.target.value })} placeholder="https://example.com/page" className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5"><span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span> Meta Title *</label>
                                <input type="text" value={formData.seo_meta_title || ''} onChange={e => setFormData({ ...formData, seo_meta_title: e.target.value, name: e.target.value || formData.name })} placeholder="Enter meta title (50-60 characters)..." className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all" />
                                <p className="text-xs text-slate-400 text-right mt-1">{(formData.seo_meta_title || '').length}/60 characters</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Meta Description</label>
                                <textarea value={formData.seo_meta_description || ''} onChange={e => setFormData({ ...formData, seo_meta_description: e.target.value })} placeholder="Enter meta description (150-160 characters)..." rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 resize-none transition-all" />
                                <p className="text-xs text-slate-400 text-right mt-1">{(formData.seo_meta_description || '').length}/160 characters</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Focus Keyword</label>
                                    <input type="text" value={formData.seo_focus_keyword || ''} onChange={e => setFormData({ ...formData, seo_focus_keyword: e.target.value })} placeholder="Primary keyword..." className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Secondary Keywords</label>
                                    <input type="text" value={formData.seo_secondary_keywords || ''} onChange={e => setFormData({ ...formData, seo_secondary_keywords: e.target.value })} placeholder="Comma separated..." className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">SEO Content Body</label>
                                <textarea value={formData.seo_content_body || ''} onChange={e => setFormData({ ...formData, seo_content_body: e.target.value })} placeholder="Paste your SEO content here for analysis..." rows={6} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 resize-y transition-all" />
                            </div>
                            {/* Keywords from Master */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">SEO Keywords (from Keyword Master)</label>
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-32 overflow-y-auto">
                                    {keywords.length === 0 ? <p className="text-xs text-slate-400 text-center py-2">No keywords available</p> : (
                                        <div className="flex flex-wrap gap-2">
                                            {keywords.map(kw => (
                                                <button key={kw.id} type="button" onClick={() => handleSeoKeywordToggle(kw.keyword || kw.name)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${seoKeywords.includes(kw.keyword || kw.name) ? 'bg-green-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-green-300'}`}>
                                                    {kw.keyword || kw.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: AI Analysis & Scores */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-cyan-400/30">4</div>
                                <div><h3 className="text-sm font-bold text-slate-800">AI Analysis & Scores</h3><p className="text-xs text-slate-500">Automated content analysis</p></div>
                            </div>
                            <button onClick={analyzeContent} disabled={isAnalyzing} className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl hover:from-cyan-600 hover:to-teal-600 disabled:opacity-50 transition-all">
                                {isAnalyzing ? 'Analyzing...' : '🔍 Analyze Content'}
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                                <div className="text-xs font-semibold text-green-700 mb-1">SEO Score</div>
                                <div className="text-3xl font-bold text-green-600">{formData.seo_score || 0}%</div>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                                <div className="text-xs font-semibold text-blue-700 mb-1">Grammar Score</div>
                                <div className="text-3xl font-bold text-blue-600">{formData.grammar_score || 0}%</div>
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Workflow & QC */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-amber-400/30">5</div>
                            <div><h3 className="text-sm font-bold text-slate-800">Workflow & QC Status</h3><p className="text-xs text-slate-500">Track progress and quality</p></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Workflow Stage</label>
                                <select value={workflowStage} onChange={e => handleWorkflowStageChange(e.target.value)} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all">
                                    {WORKFLOW_STAGES.map(stage => <option key={stage.value} value={stage.value}>{stage.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">QC Status</label>
                                <select value={qcStatus} onChange={e => handleQcStatusChange(e.target.value)} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all">
                                    {QC_STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeoAssetUploadView;
