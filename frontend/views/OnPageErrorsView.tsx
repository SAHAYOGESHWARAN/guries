
import React, { useState } from 'react';
import Table from '../components/Table';
import Tooltip from '../components/Tooltip';
import { useData } from '../hooks/useData';
import { getStatusBadge } from '../constants';
import type { OnPageSeoAudit, Service, SubServiceItem, Campaign } from '../types';

const SEVERITY_LEVELS = ['All', 'High', 'Medium', 'Low'];
const STATUSES = ['All', 'open', 'in_progress', 'resolved', 'ignored'];
const ERROR_CATEGORIES = ['Content', 'Technical', 'Meta', 'Links', 'Images', 'Schema'];

const OnPageErrorsView: React.FC = () => {
    const { data: audits, create: createAudit, update: updateAudit } = useData<OnPageSeoAudit>('onPageSeoAudits');
    const { data: services } = useData<Service>('services');
    const { data: subServices } = useData<SubServiceItem>('subServices');
    const { data: campaigns } = useData<Campaign>('campaigns');
    
    const [searchQuery, setSearchQuery] = useState('');
    const [severityFilter, setSeverityFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [serviceFilter, setServiceFilter] = useState('All Services');
    
    // Full Frame State
    const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
    
    const [newAudit, setNewAudit] = useState<Partial<OnPageSeoAudit>>({
        service_id: 0, sub_service_id: 0, error_type: 'Missing H1', 
        error_category: 'Content', severity: 'Medium', issue_description: '', 
        current_value: '', recommended_value: '', linked_campaign_id: 0, status: 'open'
    });

    const filteredAudits = audits.filter(item => {
        const matchesSearch = item.error_type.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.issue_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (item.service_id && services.find(s => s.id === item.service_id)?.service_name.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesSeverity = severityFilter === 'All' || item.severity === severityFilter;
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        const matchesCategory = categoryFilter === 'All' || item.error_category === categoryFilter;
        const matchesService = serviceFilter === 'All Services' || 
                              (item.service_id && services.find(s => s.id === item.service_id)?.service_name === serviceFilter);
        return matchesSearch && matchesSeverity && matchesStatus && matchesCategory && matchesService;
    });

    const handleCreate = async () => {
        if (!newAudit.service_id && !newAudit.sub_service_id) {
            alert('Please select a Service or Sub-service');
            return;
        }
        await createAudit({
            ...newAudit,
            service_id: newAudit.service_id || undefined,
            sub_service_id: newAudit.sub_service_id || undefined,
            linked_campaign_id: newAudit.linked_campaign_id || undefined
        } as any);
        setViewMode('list');
        setNewAudit({
            service_id: 0, sub_service_id: 0, error_type: 'Missing H1', 
            error_category: 'Content', severity: 'Medium', issue_description: '', 
            current_value: '', recommended_value: '', linked_campaign_id: 0, status: 'open'
        });
    };

    const handleResolve = async (id: number) => {
        await updateAudit(id, { status: 'resolved', resolved_at: new Date().toISOString() });
    };

    const handleLinkToCampaign = async (id: number, campaignId: number) => {
        await updateAudit(id, { linked_campaign_id: campaignId, status: 'in_progress' });
    };

    const getServiceName = (audit: OnPageSeoAudit) => {
        if (audit.service_id) {
            return services.find(s => s.id === audit.service_id)?.service_name || `Service ID: ${audit.service_id}`;
        }
        if (audit.sub_service_id) {
            const sub = subServices.find(ss => ss.id === audit.sub_service_id);
            return sub ? `${sub.sub_service_name} (Sub-service)` : `Sub-service ID: ${audit.sub_service_id}`;
        }
        return 'N/A';
    };

    const columns = [
        { 
            header: 'Service/Sub-service', 
            accessor: (item: OnPageSeoAudit) => (
                <div>
                    <p className="font-medium text-sm text-slate-800">{getServiceName(item)}</p>
                    {item.service_id && <p className="text-xs text-slate-500">Service</p>}
                    {item.sub_service_id && <p className="text-xs text-slate-500">Sub-service</p>}
                </div>
            )
        },
        { 
            header: 'Error Type', 
            accessor: (item: OnPageSeoAudit) => (
                <div>
                    <p className="font-bold text-slate-700">{item.error_type}</p>
                    <p className="text-xs text-slate-500 uppercase">{item.error_category}</p>
                </div>
            )
        },
        { 
            header: 'Severity', 
            accessor: (item: OnPageSeoAudit) => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                    item.severity === 'High' ? 'bg-red-100 text-red-800' : 
                    item.severity === 'Medium' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                }`}>
                    {item.severity}
                </span>
            ) 
        },
        { 
            header: 'Issue', 
            accessor: (item: OnPageSeoAudit) => (
                <Tooltip content={item.issue_description}>
                    <p className="text-sm text-slate-700 truncate max-w-xs">{item.issue_description}</p>
                </Tooltip>
            )
        },
        { 
            header: 'Campaign', 
            accessor: (item: OnPageSeoAudit) => {
                if (item.linked_campaign_id) {
                    const campaign = campaigns.find(c => c.id === item.linked_campaign_id);
                    return campaign ? (
                        <span className="text-xs text-indigo-600 font-medium">{campaign.campaign_name}</span>
                    ) : `Campaign ID: ${item.linked_campaign_id}`;
                }
                return <span className="text-xs text-slate-400">Not linked</span>;
            }
        },
        { header: 'Status', accessor: (item: OnPageSeoAudit) => getStatusBadge(item.status) },
        { 
            header: 'Actions', 
            accessor: (item: OnPageSeoAudit) => (
                <div className="flex gap-2">
                    {item.status !== 'resolved' && (
                        <>
                            {!item.linked_campaign_id && campaigns.length > 0 && (
                                <select 
                                    onChange={(e) => {
                                        const campaignId = parseInt(e.target.value);
                                        if (campaignId) handleLinkToCampaign(item.id, campaignId);
                                    }}
                                    className="text-xs border border-slate-300 rounded px-2 py-1"
                                    defaultValue=""
                                >
                                    <option value="">Link Campaign</option>
                                    {campaigns.map(c => (
                                        <option key={c.id} value={c.id}>{c.campaign_name}</option>
                                    ))}
                                </select>
                            )}
                            <button 
                                onClick={() => handleResolve(item.id)} 
                                className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                            >
                                Resolve
                            </button>
                        </>
                    )}
                </div>
            ) 
        }
    ];

    if (viewMode === 'create') {
        return (
            <div className="h-full flex flex-col w-full p-6 animate-fade-in">
                <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full">
                    <div className="border-b border-slate-200 px-8 py-5 flex justify-between items-center bg-slate-50/50 w-full">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Log On-Page SEO Issue</h2>
                            <p className="text-slate-500 text-sm mt-1">Create audit issue for a Service or Sub-service</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setViewMode('list')} className="px-5 py-2.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                            <button onClick={handleCreate} className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-red-700 transition-colors">Log Issue</button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 w-full">
                        <div className="w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Service *</label>
                                    <select 
                                        className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500 bg-white" 
                                        value={newAudit.service_id || 0} 
                                        onChange={e => setNewAudit({...newAudit, service_id: parseInt(e.target.value) || 0, sub_service_id: 0})}
                                    >
                                        <option value={0}>Select Service...</option>
                                        {services.map(s => (
                                            <option key={s.id} value={s.id}>{s.service_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Sub-service (Optional)</label>
                                    <select 
                                        className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500 bg-white" 
                                        value={newAudit.sub_service_id || 0} 
                                        onChange={e => setNewAudit({...newAudit, sub_service_id: parseInt(e.target.value) || 0})}
                                        disabled={!newAudit.service_id}
                                    >
                                        <option value={0}>Select Sub-service...</option>
                                        {subServices.filter(ss => ss.parent_service_id === newAudit.service_id).map(ss => (
                                            <option key={ss.id} value={ss.id}>{ss.sub_service_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Error Type</label>
                                    <input 
                                        type="text" 
                                        className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500" 
                                        placeholder="e.g. Missing H1, Weak Meta Description" 
                                        value={newAudit.error_type} 
                                        onChange={e => setNewAudit({...newAudit, error_type: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Error Category</label>
                                    <select 
                                        className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500 bg-white" 
                                        value={newAudit.error_category} 
                                        onChange={e => setNewAudit({...newAudit, error_category: e.target.value as any})}
                                    >
                                        {ERROR_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Severity</label>
                                    <select 
                                        className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500 bg-white" 
                                        value={newAudit.severity} 
                                        onChange={e => setNewAudit({...newAudit, severity: e.target.value as any})}
                                    >
                                        <option>High</option>
                                        <option>Medium</option>
                                        <option>Low</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Link to Campaign (Optional)</label>
                                    <select 
                                        className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-red-500 focus:border-red-500 bg-white" 
                                        value={newAudit.linked_campaign_id || 0} 
                                        onChange={e => setNewAudit({...newAudit, linked_campaign_id: parseInt(e.target.value) || 0})}
                                    >
                                        <option value={0}>No Campaign</option>
                                        {campaigns.map(c => (
                                            <option key={c.id} value={c.id}>{c.campaign_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Issue Description</label>
                                <textarea 
                                    className="block w-full px-4 py-3 border border-slate-300 rounded-xl h-24 focus:ring-red-500 focus:border-red-500 resize-none" 
                                    placeholder="Describe the SEO issue..." 
                                    value={newAudit.issue_description} 
                                    onChange={e => setNewAudit({...newAudit, issue_description: e.target.value})} 
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Current Value (Optional)</label>
                                    <textarea 
                                        className="block w-full px-4 py-3 border border-slate-300 rounded-xl h-20 focus:ring-red-500 focus:border-red-500 resize-none" 
                                        placeholder="What is currently there..." 
                                        value={newAudit.current_value} 
                                        onChange={e => setNewAudit({...newAudit, current_value: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Recommended Value (Optional)</label>
                                    <textarea 
                                        className="block w-full px-4 py-3 border border-slate-300 rounded-xl h-20 focus:ring-red-500 focus:border-red-500 resize-none" 
                                        placeholder="What it should be..." 
                                        value={newAudit.recommended_value} 
                                        onChange={e => setNewAudit({...newAudit, recommended_value: e.target.value})} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col w-full p-6 animate-fade-in">
            <div className="flex justify-between items-start flex-shrink-0 w-full mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">On-Page SEO Audits</h1>
                    <p className="text-slate-500 mt-1">Audit and resolve SEO issues for Services and Sub-services. Fixes happen in Campaigns.</p>
                </div>
                <button onClick={() => setViewMode('create')} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 shadow-sm transition-colors">
                    + Log New Issue
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 flex-shrink-0 w-full mb-6">
                <input 
                    type="search" 
                    className="block w-full md:w-1/3 p-2.5 border border-gray-300 rounded-lg" 
                    placeholder="Search issues..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} 
                />
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5 min-w-[150px]">
                        <option>All Services</option>
                        {services.map(s => (
                            <option key={s.id} value={s.service_name}>{s.service_name}</option>
                        ))}
                    </select>
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5 min-w-[120px]">
                        <option>All Categories</option>
                        {ERROR_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5 min-w-[120px]">
                        {SEVERITY_LEVELS.map(s => <option key={s} value={s}>{s} Severity</option>)}
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5 min-w-[120px]">
                        {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200 w-full">
                <div className="flex-1 overflow-hidden w-full">
                    <Table columns={columns} data={filteredAudits} title={`On-Page SEO Issues (${filteredAudits.length})`} />
                </div>
            </div>
        </div>
    );
};

export default OnPageErrorsView;
