
import React, { useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { ChartCard, LineChart, DonutChart } from '../components/Charts';
import { useData } from '../hooks/useData';
import type { Campaign, Task, ContentRepositoryItem, CampaignPerformanceKpi, Project, Service } from '../types';
import { getStatusBadge, SparkIcon } from '../constants';
import { runQuery } from '../utils/gemini';

interface CampaignDetailViewProps {
    campaignId: number;
    onNavigateBack: () => void;
}

const CampaignDetailView: React.FC<CampaignDetailViewProps> = ({ campaignId, onNavigateBack }) => {
    const { data: campaigns, update: updateCampaign } = useData<Campaign>('campaigns');
    const { data: tasks, update: updateTask } = useData<Task>('tasks');
    const { data: content } = useData<ContentRepositoryItem>('content');
    const { data: projects } = useData<Project>('projects');
    const { data: services } = useData<Service>('services');
    const { data: performanceData } = useData<CampaignPerformanceKpi>('campaignPerformance');

    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'assets' | 'analytics'>('overview');
    const [aiInsight, setAiInsight] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isLinkServiceModalOpen, setIsLinkServiceModalOpen] = useState(false);

    const campaign = campaigns.find(c => c.id === campaignId);

    if (!campaign) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <h2 className="text-2xl font-bold text-slate-700">Campaign Not Found</h2>
                <button onClick={onNavigateBack} className="mt-4 text-blue-600 hover:underline">Return to Campaigns</button>
            </div>
        );
    }

    const project = projects.find(p => p.id === campaign.project_id);
    const campaignTasks = tasks.filter(t => t.campaign_id === campaignId);
    const linkedContent = content.filter(c => c.linked_campaign_id === campaignId);
    const linkedServices = services.filter(s => campaign.linked_service_ids?.includes(s.id));

    // KPI Calculation
    const totalBacklinks = campaign.backlinks_planned || 1;
    const currentBacklinks = campaign.backlinks_completed || 0;
    const progress = Math.round((currentBacklinks / totalBacklinks) * 100);

    const tasksCompleted = campaignTasks.filter(t => t.status === 'completed').length;
    const taskProgress = campaignTasks.length > 0 ? Math.round((tasksCompleted / campaignTasks.length) * 100) : 0;

    const relevantKpis = performanceData.filter(k => k.campaign_id === campaignId);
    const trafficData = relevantKpis.filter(k => k.metric_name === 'traffic').map(k => ({ label: k.date, value: k.metric_value }));

    const handleAiAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const prompt = `
            Analyze this marketing campaign:
            Name: ${campaign.campaign_name}
            Type: ${campaign.campaign_type}
            Progress: ${progress}% backlinks, ${taskProgress}% tasks.
            Tasks: ${JSON.stringify(campaignTasks.map(t => t.status))}
            Traffic Trend: ${JSON.stringify(trafficData.slice(-5))}
            
            Provide a brief status report and 1 specific recommendation to improve performance.
          `;
            const result = await runQuery(prompt, { model: 'gemini-2.5-flash' });
            setAiInsight(result.text);
        } catch (e) {
            setAiInsight("Analysis unavailable at this time.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAiGenerateStrategy = async () => {
        setIsAnalyzing(true);
        try {
            const prompt = `Generate a high-level strategy for a ${campaign.campaign_type} campaign named "${campaign.campaign_name}".
          Goal: Increase organic traffic and leads.
          Target URL: ${campaign.target_url || 'General Brand'}
          
          Output markdown:
          - **Objective**
          - **Target Audience**
          - **Key Messaging**
          - **Suggested Channels**`;

            const result = await runQuery(prompt, { model: 'gemini-2.5-flash' });
            setAiInsight(result.text); // Reusing the insight box for strategy output
        } catch (e) { setAiInsight("Strategy generation failed."); }
        finally { setIsAnalyzing(false); }
    };

    const handleTaskStatusToggle = async (task: Task) => {
        const newStatus = task.status === 'completed' ? 'in_progress' : 'completed';
        await updateTask(task.id, { status: newStatus });
    };

    const handleToggleServiceLink = async (serviceId: number) => {
        const currentLinks = campaign.linked_service_ids || [];
        const isLinked = currentLinks.includes(serviceId);
        const newLinks = isLinked
            ? currentLinks.filter(id => id !== serviceId)
            : [...currentLinks, serviceId];

        await updateCampaign(campaign.id, { linked_service_ids: newLinks });
    };

    const handleCreateDraft = async (serviceId: number) => {
        const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
        if (confirm("Create a working copy (draft) of this service page for editing?")) {
            await fetch(`${apiUrl}/content/draft-from-service`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ service_id: serviceId, campaign_id: campaign.id })
            });
            alert("Draft created in Assets tab.");
        }
    };

    const handlePushToMaster = async (contentId: number) => {
        const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
        if (confirm("Are you sure? This will overwrite the live Service Master record with this content.")) {
            await fetch(`${apiUrl}/content/publish-to-service/${contentId}`, {
                method: 'POST'
            });
            alert("Service Master updated successfully.");
        }
    };

    // Columns
    const taskColumns = [
        { header: 'Task Name', accessor: 'name' as keyof Task },
        { header: 'Assignee', accessor: 'primary_owner_id' as keyof Task },
        { header: 'Due', accessor: 'due_date' as keyof Task },
        { header: 'Status', accessor: (item: Task) => getStatusBadge(item.status) },
        {
            header: 'Action',
            accessor: (item: Task) => (
                <button
                    onClick={() => handleTaskStatusToggle(item)}
                    className={`text-xs px-2 py-1 rounded font-bold ${item.status === 'completed' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}
                >
                    {item.status === 'completed' ? 'Reopen' : 'Complete'}
                </button>
            )
        }
    ];

    const assetColumns = [
        { header: 'Title', accessor: 'content_title_clean' as keyof ContentRepositoryItem },
        { header: 'Type', accessor: 'asset_type' as keyof ContentRepositoryItem },
        { header: 'Status', accessor: (item: ContentRepositoryItem) => getStatusBadge(item.status) },
        { header: 'Updated', accessor: (item: ContentRepositoryItem) => new Date(item.last_status_update_at).toLocaleDateString() },
        {
            header: 'Master Sync',
            accessor: (item: ContentRepositoryItem) => {
                if (item.asset_type === 'service_page' && item.linked_service_ids && item.linked_service_ids.length > 0) {
                    if (item.status === 'qc_passed' || item.status === 'ready_to_publish') {
                        return (
                            <button
                                onClick={() => handlePushToMaster(item.id)}
                                className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold hover:bg-green-700 transition-colors"
                            >
                                Push to Master
                            </button>
                        );
                    } else if (item.status === 'published') {
                        return <span className="text-xs text-gray-400 italic"> synced</span>;
                    } else {
                        return <span className="text-xs text-gray-400">QC Pending</span>;
                    }
                }
                return <span className="text-xs text-gray-300">-</span>;
            }
        }
    ];

    return (
        <div className="space-y-6 h-full overflow-y-auto w-full pr-1 p-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button onClick={onNavigateBack} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h1 className="text-2xl font-bold text-slate-800">{campaign.campaign_name}</h1>
                            {getStatusBadge(campaign.campaign_status)}
                        </div>
                        <p className="text-sm text-slate-500">
                            Part of Project: <span className="font-semibold text-blue-600">{project?.project_name || 'Unknown'}</span> • ID: {campaign.id}
                        </p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button onClick={handleAiGenerateStrategy} disabled={isAnalyzing} className="bg-white border border-purple-200 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-50 flex items-center disabled:opacity-50 transition-colors">
                        <SparkIcon /> <span className="ml-2">Generate Strategy</span>
                    </button>
                    <button onClick={handleAiAnalysis} disabled={isAnalyzing} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:opacity-90 flex items-center disabled:opacity-50">
                        <span className="ml-2">{isAnalyzing ? 'Thinking...' : 'AI Status Report'}</span>
                    </button>
                </div>
            </div>

            {aiInsight && (
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg animate-slide-up">
                    <h3 className="text-purple-900 font-bold flex items-center mb-2"><SparkIcon /> <span className="ml-2">Gemini Intelligence</span></h3>
                    <p className="text-purple-800 text-sm whitespace-pre-wrap">{aiInsight}</p>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-8">
                    {['overview', 'tasks', 'assets', 'analytics'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Scope Section */}
                        <div className="md:col-span-2 bg-white rounded-xl shadow-card border border-slate-100 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider">Campaign Scope & Services</h3>
                                <button onClick={() => setIsLinkServiceModalOpen(true)} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 font-medium">
                                    + Link Service
                                </button>
                            </div>
                            {linkedServices.length > 0 ? (
                                <div className="space-y-3">
                                    {linkedServices.map(service => (
                                        <div key={service.id} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
                                            <div>
                                                <p className="font-bold text-slate-700">{service.service_name}</p>
                                                <p className="text-xs text-slate-500">{service.slug}</p>
                                            </div>
                                            <button
                                                onClick={() => handleCreateDraft(service.id)}
                                                className="text-xs bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded hover:bg-slate-100 shadow-sm"
                                            >
                                                Create Working Copy (Draft)
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 italic">No services linked to this campaign yet.</p>
                            )}
                        </div>

                        {/* Key Metrics */}
                        <div className="bg-white p-6 rounded-xl shadow-card border border-slate-100">
                            <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-4">Backlink Progress</h3>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-3xl font-bold text-slate-800">{currentBacklinks}</span>
                                <span className="text-sm text-slate-500">of {totalBacklinks} target</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-card border border-slate-100">
                            <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-4">Task Velocity</h3>
                            <div className="flex items-center">
                                <div className="w-16 h-16">
                                    <DonutChart value={taskProgress} color="text-green-500" size={60} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-slate-800">{tasksCompleted}/{campaignTasks.length}</p>
                                    <p className="text-xs text-slate-500">Tasks Completed</p>
                                </div>
                            </div>
                        </div>

                        {/* Asset Preview */}
                        <div>
                            <div className="bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden h-full">
                                <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/50">
                                    <h3 className="font-bold text-slate-800">Linked Assets ({linkedContent.length})</h3>
                                </div>
                                <div className="p-4 space-y-3">
                                    {linkedContent.slice(0, 4).map(item => (
                                        <div key={item.id} className="flex items-center justify-between text-sm p-2 hover:bg-slate-50 rounded">
                                            <div className="flex items-center">
                                                <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
                                                <span className="truncate max-w-[120px]" title={item.content_title_clean}>{item.content_title_clean}</span>
                                            </div>
                                            {getStatusBadge(item.status)}
                                        </div>
                                    ))}
                                    {linkedContent.length === 0 && <p className="text-center text-slate-400 text-sm py-4">No content linked.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'tasks' && (
                    <Table columns={taskColumns} data={campaignTasks} title="Execution Tasks" />
                )}

                {activeTab === 'assets' && (
                    <Table columns={assetColumns} data={linkedContent} title="Content & Creative Assets" />
                )}

                {activeTab === 'analytics' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Traffic Impact">
                            {trafficData.length > 0 ? (
                                <LineChart data={trafficData} color="text-blue-500" />
                            ) : (
                                <div className="flex items-center justify-center h-40 text-slate-400 italic">No traffic data recorded yet.</div>
                            )}
                        </ChartCard>
                        <div className="bg-white p-6 rounded-xl shadow-card border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Performance Summary</h3>
                            <dl className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <dt className="text-xs text-slate-500 uppercase">Leads Generated</dt>
                                    <dd className="text-2xl font-bold text-slate-800">
                                        {relevantKpis.find(k => k.metric_name === 'leads')?.metric_value || 0}
                                    </dd>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <dt className="text-xs text-slate-500 uppercase">Conv. Rate</dt>
                                    <dd className="text-2xl font-bold text-slate-800">
                                        {relevantKpis.find(k => k.metric_name === 'conversions')?.metric_value || 0}%
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                )}
            </div>

            {/* Link Service Modal */}
            <Modal isOpen={isLinkServiceModalOpen} onClose={() => setIsLinkServiceModalOpen(false)} title="Link Services to Campaign">
                <div className="space-y-4">
                    <div className="p-2 bg-slate-50 rounded border border-slate-200 text-sm text-slate-600">
                        Select services to manage within this campaign. Linking a service allows you to create working drafts.
                    </div>
                    <div className="h-96 overflow-y-auto border border-slate-200 rounded-md">
                        {services.map(service => (
                            <label key={service.id} className="flex items-center p-3 hover:bg-slate-50 border-b border-slate-100 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={campaign.linked_service_ids?.includes(service.id)}
                                    onChange={() => handleToggleServiceLink(service.id)}
                                    className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">{service.service_name}</p>
                                    <p className="text-xs text-gray-500">{service.slug}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                    <div className="flex justify-end pt-2">
                        <button onClick={() => setIsLinkServiceModalOpen(false)} className="bg-slate-200 text-slate-700 px-4 py-2 rounded hover:bg-slate-300 text-sm font-medium">Done</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CampaignDetailView;
