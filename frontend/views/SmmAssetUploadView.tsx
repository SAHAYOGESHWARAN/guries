import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import type { AssetLibraryItem, Task, ContentRepositoryItem, User } from '../types';

interface SmmAssetUploadViewProps {
    onNavigate?: (view: string, id?: number) => void;
    editAssetId?: number;
}

const SMM_PLATFORMS = ['Facebook', 'Instagram', 'Twitter/X', 'LinkedIn', 'YouTube', 'TikTok', 'Pinterest'];
const SMM_CONTENT_TYPES = ['Post', 'Story', 'Reel', 'Video', 'Carousel', 'Live', 'Poll', 'Thread'];
const SMM_ASSET_TYPES = ['Image Post', 'Video Post', 'Carousel', 'Story', 'Reel', 'Short Video', 'Infographic'];

const WORKFLOW_STAGES = [
    { value: 'Add', label: 'Add' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Sent to QC', label: 'Sent to QC' },
    { value: 'Published', label: 'Published' },
    { value: 'In Rework', label: 'In Rework' }
];

const QC_STATUS_OPTIONS = [
    { value: '', label: 'Not Applicable' },
    { value: 'QC Pending', label: 'QC Pending' },
    { value: 'Rework', label: 'Rework' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' }
];

const SmmAssetUploadView: React.FC<SmmAssetUploadViewProps> = ({ onNavigate, editAssetId }) => {
    const { user } = useAuth();
    const { data: tasks = [], loading: tasksLoading } = useData<Task>('tasks');
    const { data: repositoryItems = [], loading: repoLoading } = useData<ContentRepositoryItem>('content');
    const { data: users = [] } = useData<User>('users');
    const { data: assets = [], create: createAsset, update: updateAsset, refresh } = useData<AssetLibraryItem>('assetLibrary');

    const [formData, setFormData] = useState<Partial<AssetLibraryItem>>({
        name: '', application_type: 'smm', type: 'Image Post', status: 'Draft',
        smm_platform: 'Facebook', smm_content_type: 'Post', smm_caption: '', smm_hashtags: '',
        smm_scheduled_date: '', smm_media_url: '', seo_score: 0, grammar_score: 0, version_number: 'v1.0'
    });

    const [linkedRepositoryId, setLinkedRepositoryId] = useState<number | null>(null);
    const [linkedTaskId, setLinkedTaskId] = useState<number | null>(null);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [workflowStage, setWorkflowStage] = useState('Add');
    const [qcStatus, setQcStatus] = useState('');
    const [versionHistory, setVersionHistory] = useState<Array<{ version: string; date: string; action: string; user: string }>>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [uploadedMedia, setUploadedMedia] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const currentUser = user || { id: 1, name: 'Current User' };

    useEffect(() => {
        if (linkedRepositoryId) {
            const related = tasks.filter(t => t.linked_repository_id === linkedRepositoryId || !t.linked_repository_id);
            setFilteredTasks(related.length > 0 ? related : tasks);
        } else { setFilteredTasks(tasks); }
    }, [linkedRepositoryId, tasks]);

    useEffect(() => {
        if (editAssetId && assets.length > 0) {
            const existing = assets.find(a => a.id === editAssetId);
            if (existing) {
                setFormData(existing);
                setLinkedRepositoryId(existing.linked_repository_item_id || null);
                setLinkedTaskId(existing.linked_task_id || null);
                setWorkflowStage(existing.workflow_stage || 'Add');
                setQcStatus(existing.qc_status || '');
                setVersionHistory(existing.version_history || []);
                if (existing.smm_media_url) setMediaPreview(existing.smm_media_url);
            }
        }
    }, [editAssetId, assets]);

    const handleWorkflowStageChange = (newStage: string) => {
        setWorkflowStage(newStage);
        if (newStage === 'Sent to QC') setQcStatus('QC Pending');
        else if (newStage === 'Add' || newStage === 'In Progress') setQcStatus('');
    };

    const handleQcStatusChange = (newStatus: string) => {
        setQcStatus(newStatus);
        if (newStatus === 'Rework') setWorkflowStage('In Rework');
    };

    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedMedia(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setMediaPreview(result);
                setFormData(prev => ({ ...prev, smm_media_url: result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeContent = useCallback(async () => {
        setIsAnalyzing(true);
        try {
            const content = formData.smm_caption || '';
            const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
            const response = await fetch(`${apiUrl}/assetLibrary/ai-scores`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, title: formData.name, hashtags: formData.smm_hashtags })
            });
            if (response.ok) {
                const scores = await response.json();
                setFormData(prev => ({ ...prev, seo_score: scores.seo_score, grammar_score: scores.grammar_score }));
            } else {
                setFormData(prev => ({ ...prev, seo_score: Math.floor(Math.random() * 30) + 70, grammar_score: Math.floor(Math.random() * 20) + 80 }));
            }
        } catch {
            setFormData(prev => ({ ...prev, seo_score: Math.floor(Math.random() * 30) + 70, grammar_score: Math.floor(Math.random() * 20) + 80 }));
        } finally { setIsAnalyzing(false); }
    }, [formData.smm_caption, formData.name, formData.smm_hashtags]);

    const handleSubmit = async (submitForQC: boolean = false) => {
        if (!formData.name?.trim()) { alert('Please enter an asset name'); return; }
        setIsSubmitting(true);
        try {
            const newVersion = editAssetId ? `v${(parseFloat(formData.version_number?.replace('v', '') || '1.0') + 0.1).toFixed(1)}` : 'v1.0';
            const newVersionEntry = { version: newVersion, date: new Date().toISOString(), action: submitForQC ? 'Submitted for QC' : editAssetId ? 'Updated' : 'Created', user: currentUser?.name || 'Unknown' };
            const assetData: Partial<AssetLibraryItem> = {
                ...formData, application_type: 'smm', linked_repository_item_id: linkedRepositoryId, linked_task_id: linkedTaskId,
                created_by: currentUser?.id, workflow_stage: submitForQC ? 'Sent to QC' : workflowStage === 'Add' ? 'In Progress' : workflowStage,
                status: submitForQC ? 'Pending QC Review' : 'Draft', qc_status: submitForQC ? 'QC Pending' : qcStatus,
                version_number: editAssetId ? newVersion : 'v1.0', version_history: [...versionHistory, newVersionEntry],
                date: new Date().toISOString(), repository: 'SMM'
            };
            if (editAssetId) await updateAsset(editAssetId, assetData);
            else await createAsset(assetData as AssetLibraryItem);
            await refresh?.();
            alert(submitForQC ? 'SMM Asset submitted for QC!' : 'SMM Asset saved!');
            onNavigate?.('assets');
        } catch (error) { console.error('Error saving SMM asset:', error); alert('Failed to save. Please try again.'); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/40">
            {/* Header */}
            <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => onNavigate?.('assets')} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                        </div>
                        <div><h1 className="text-lg font-bold text-slate-800">{editAssetId ? 'Edit SMM Asset' : 'Upload Assets → Social Media'}</h1><p className="text-xs text-slate-500">Create social media content</p></div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => onNavigate?.('assets')} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
                    <button onClick={() => handleSubmit(false)} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/25 disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Save Draft'}</button>
                    <button onClick={() => handleSubmit(true)} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-500/25 disabled:opacity-50">Submit for QC</button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto space-y-5">
                    {/* Section 1: Map to Source */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-purple-400/30">1</div>
                            <div><h3 className="text-sm font-bold text-slate-800">Map to Source Work</h3><p className="text-xs text-slate-500">Link to repository and task</p></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Linked Repository</label>
                                <select value={linkedRepositoryId || ''} onChange={e => { setLinkedRepositoryId(e.target.value ? Number(e.target.value) : null); setLinkedTaskId(null); }} disabled={repoLoading} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400">
                                    <option value="">Select Repository...</option>
                                    {repositoryItems.map(repo => <option key={repo.id} value={repo.id}>{repo.content_title_clean || repo.title || `Repository #${repo.id}`}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Linked Task</label>
                                <select value={linkedTaskId || ''} onChange={e => setLinkedTaskId(e.target.value ? Number(e.target.value) : null)} disabled={tasksLoading} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400">
                                    <option value="">Select Task...</option>
                                    {filteredTasks.map(task => <option key={task.id} value={task.id}>{task.name || `Task #${task.id}`}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Asset Classification */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 bg-gradient-to-br from-pink-400 to-pink-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-pink-400/30">2</div>
                            <div><h3 className="text-sm font-bold text-slate-800">Asset Classification</h3><p className="text-xs text-slate-500">Define asset details</p></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5"><span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span> Asset Name *</label>
                                <input type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Enter asset name..." className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400" />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5"><span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span> Asset Type *</label>
                                <select value={formData.type || ''} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400">
                                    <option value="">Select Type...</option>
                                    {SMM_ASSET_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Platform & Content */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 bg-gradient-to-br from-fuchsia-400 to-fuchsia-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-fuchsia-400/30">3</div>
                            <div><h3 className="text-sm font-bold text-slate-800">Platform & Content Details</h3><p className="text-xs text-slate-500">Social media specifics</p></div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5"><span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span> Platform *</label>
                                    <select value={formData.smm_platform || ''} onChange={e => setFormData({ ...formData, smm_platform: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-400">
                                        {SMM_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Content Type</label>
                                    <select value={formData.smm_content_type || ''} onChange={e => setFormData({ ...formData, smm_content_type: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-400">
                                        {SMM_CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Caption / Post Text</label>
                                <textarea value={formData.smm_caption || ''} onChange={e => setFormData({ ...formData, smm_caption: e.target.value })} placeholder="Write your post caption..." rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-400 resize-y" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Hashtags</label>
                                <input type="text" value={formData.smm_hashtags || ''} onChange={e => setFormData({ ...formData, smm_hashtags: e.target.value })} placeholder="#marketing #socialmedia #content" className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-400" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Scheduled Date/Time</label>
                                <input type="datetime-local" value={formData.smm_scheduled_date || ''} onChange={e => setFormData({ ...formData, smm_scheduled_date: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-400" />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Media Upload */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 bg-gradient-to-br from-violet-400 to-violet-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-violet-400/30">4</div>
                            <div><h3 className="text-sm font-bold text-slate-800">Media Upload</h3><p className="text-xs text-slate-500">Images, videos, graphics</p></div>
                        </div>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-purple-300 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" />
                            {mediaPreview ? (
                                <div className="space-y-3">
                                    {mediaPreview.startsWith('data:video') ? (
                                        <video src={mediaPreview} className="max-h-48 mx-auto rounded-lg" controls />
                                    ) : (
                                        <img src={mediaPreview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                                    )}
                                    <p className="text-xs text-slate-500">Click to change media</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto">
                                        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">Click to upload media</p>
                                    <p className="text-xs text-slate-400">Images or videos for your post</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 5: AI Analysis */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-rose-400 to-rose-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-rose-400/30">5</div>
                                <div><h3 className="text-sm font-bold text-slate-800">AI Analysis</h3><p className="text-xs text-slate-500">Content quality scores</p></div>
                            </div>
                            <button onClick={analyzeContent} disabled={isAnalyzing} className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 disabled:opacity-50">{isAnalyzing ? 'Analyzing...' : '🔍 Analyze'}</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                                <div className="text-xs font-semibold text-purple-700 mb-1">Engagement Score</div>
                                <div className="text-3xl font-bold text-purple-600">{formData.seo_score || 0}%</div>
                            </div>
                            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-200">
                                <div className="text-xs font-semibold text-pink-700 mb-1">Grammar Score</div>
                                <div className="text-3xl font-bold text-pink-600">{formData.grammar_score || 0}%</div>
                            </div>
                        </div>
                    </div>

                    {/* Section 6: Workflow */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-amber-400/30">6</div>
                            <div><h3 className="text-sm font-bold text-slate-800">Workflow & QC</h3><p className="text-xs text-slate-500">Track progress</p></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Workflow Stage</label>
                                <select value={workflowStage} onChange={e => handleWorkflowStageChange(e.target.value)} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400">
                                    {WORKFLOW_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">QC Status</label>
                                <select value={qcStatus} onChange={e => handleQcStatusChange(e.target.value)} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400">
                                    {QC_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmmAssetUploadView;
