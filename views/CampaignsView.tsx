
import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { getStatusBadge } from '../constants';
import Tooltip from '../components/Tooltip';
import type { Campaign, User } from '../types';

interface CampaignsViewProps {
  onCampaignSelect?: (id: number) => void;
}

const CampaignsView: React.FC<CampaignsViewProps> = ({ onCampaignSelect }) => {
  const { data: campaigns, create: createCampaign } = useData<Campaign>('campaigns');
  const { data: users } = useData<User>('users');
  
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  
  const [formCampaign, setFormCampaign] = useState<Partial<Campaign>>({
      campaign_name: '',
      campaign_type: 'Content',
      campaign_status: 'planning',
      target_url: '',
      campaign_start_date: '',
      campaign_end_date: ''
  });

  const filteredCampaigns = campaigns.filter(item => {
      const matchesSearch = item.campaign_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'All Types' || item.campaign_type === typeFilter;
      const matchesStatus = statusFilter === 'All Statuses' || item.campaign_status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateCampaign = async () => {
      await createCampaign({
          ...formCampaign,
          backlinks_planned: 0,
          backlinks_completed: 0,
          project_id: 1, // Defaulting for demo
          brand_id: 1,
          campaign_owner_id: users[0]?.id || 1
      } as any);
      setViewMode('list');
      setFormCampaign({ campaign_name: '', campaign_type: 'Content', campaign_status: 'planning', target_url: '', campaign_start_date: '', campaign_end_date: '' });
  };

  const getTypeColor = (type: string) => {
      switch(type) {
          case 'SEO': return 'text-blue-600 bg-blue-50';
          case 'Content': return 'text-purple-600 bg-purple-50';
          case 'SMM': return 'text-pink-600 bg-pink-50';
          case 'Web': return 'text-indigo-600 bg-indigo-50';
          default: return 'text-gray-600 bg-gray-50';
      }
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'active': return 'border-emerald-200 text-emerald-700 bg-emerald-50';
          case 'planning': return 'border-blue-200 text-blue-700 bg-blue-50';
          case 'completed': return 'border-gray-200 text-gray-700 bg-gray-50';
          default: return 'border-gray-200 text-gray-600 bg-gray-50';
      }
  };

  if (viewMode === 'create') {
      return (
          <div className="h-full flex flex-col w-full p-6 animate-fade-in overflow-hidden">
              <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full h-full">
                  <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-slate-50/50 w-full flex-shrink-0">
                      <div>
                          <h2 className="text-lg font-bold text-slate-800">Launch New Campaign</h2>
                          <p className="text-slate-500 text-xs mt-0.5">Configure campaign parameters and targets</p>
                      </div>
                      <div className="flex gap-2">
                          <button onClick={() => setViewMode('list')} className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                              Cancel
                          </button>
                          <button onClick={handleCreateCampaign} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-700 transition-all">
                              Launch Campaign
                          </button>
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 bg-slate-50 w-full">
                      <div className="w-full space-y-4">
                          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm w-full">
                              <h4 className="font-bold text-slate-800 text-xs uppercase mb-3 border-b border-slate-100 pb-2">Campaign Basics</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                  <div className="space-y-3">
                                      <Tooltip content="The official name of the campaign.">
                                          <div>
                                              <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Name</label>
                                              <input type="text" value={formCampaign.campaign_name} onChange={(e) => setFormCampaign({...formCampaign, campaign_name: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="e.g. Summer Sale Promo" />
                                          </div>
                                      </Tooltip>
                                      <Tooltip content="Type of campaign to categorize metrics.">
                                          <div>
                                              <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Type</label>
                                              <select value={formCampaign.campaign_type} onChange={(e) => setFormCampaign({...formCampaign, campaign_type: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm">
                                                  <option value="Content">Content Marketing</option>
                                                  <option value="SEO">SEO / Link Building</option>
                                                  <option value="SMM">Social Media</option>
                                                  <option value="Web">Website Dev</option>
                                                  <option value="Analytics">Analytics Audit</option>
                                              </select>
                                          </div>
                                      </Tooltip>
                                  </div>
                                  <div className="space-y-3">
                                      <Tooltip content="Current operational status.">
                                          <div>
                                              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                                              <select value={formCampaign.campaign_status} onChange={(e) => setFormCampaign({...formCampaign, campaign_status: e.target.value as any})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm">
                                                  <option value="planning">Planned</option>
                                                  <option value="active">Active</option>
                                                  <option value="on_hold">On Hold</option>
                                                  <option value="completed">Completed</option>
                                              </select>
                                          </div>
                                      </Tooltip>
                                      <Tooltip content="The main URL this campaign is driving traffic to.">
                                          <div>
                                              <label className="block text-xs font-bold text-slate-700 mb-1">Target URL</label>
                                              <input type="text" value={formCampaign.target_url} onChange={(e) => setFormCampaign({...formCampaign, target_url: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="https://..." />
                                          </div>
                                      </Tooltip>
                                  </div>
                              </div>
                          </div>

                          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm w-full">
                              <h4 className="font-bold text-slate-800 text-xs uppercase mb-3 border-b border-slate-100 pb-2">Schedule</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                  <Tooltip content="Date the campaign officially begins.">
                                      <div>
                                          <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                                          <input type="date" value={formCampaign.campaign_start_date} onChange={(e) => setFormCampaign({...formCampaign, campaign_start_date: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
                                      </div>
                                  </Tooltip>
                                  <Tooltip content="Projected completion date.">
                                      <div>
                                          <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                                          <input type="date" value={formCampaign.campaign_end_date} onChange={(e) => setFormCampaign({...formCampaign, campaign_end_date: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
                                      </div>
                                  </Tooltip>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="h-full flex flex-col w-full p-6 animate-fade-in overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0 w-full mb-4">
        <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Campaigns</h1>
            <p className="text-slate-500 mt-0.5 text-xs">Monitor active campaigns, track KPIs, and manage execution.</p>
        </div>
        <div className="flex-shrink-0">
            <button 
                onClick={() => setViewMode('create')} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm font-bold transition-all transform hover:translate-y-[-1px] flex items-center text-xs"
            >
                <span className="mr-1 text-base">+</span> Create Campaign
            </button>
        </div>
      </div>

      {/* Controls Toolbar */}
      <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between flex-shrink-0 w-full mb-4">
          <div className="flex-1 w-full relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input 
                  type="text" 
                  className="block w-full p-2 pl-9 text-sm text-slate-900 border border-slate-300 rounded-lg bg-slate-50 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400" 
                  placeholder="Search campaigns..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <div className="flex flex-col min-w-[120px]">
                  <select 
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg block p-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                  >
                      <option>All Types</option>
                      <option>Content</option>
                      <option>SEO</option>
                      <option>SMM</option>
                      <option>Web</option>
                      <option>Analytics</option>
                  </select>
              </div>
              
              <div className="flex flex-col min-w-[120px]">
                  <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg block p-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                  >
                      <option>All Statuses</option>
                      <option value="active">In Progress</option>
                      <option value="planning">Planned</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                  </select>
              </div>
          </div>
      </div>

      {/* Campaigns Grid */}
      <div className="flex-1 overflow-y-auto pb-8 w-full min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {filteredCampaigns.map(campaign => {
                  const owner = users.find(u => u.id === campaign.campaign_owner_id);
                  const progress = (campaign.tasks_total && campaign.tasks_total > 0) ? Math.round(((campaign.tasks_completed || 0) / campaign.tasks_total) * 100) : 0;

                  return (
                      <div 
                          key={campaign.id} 
                          onClick={() => onCampaignSelect && onCampaignSelect(campaign.id)}
                          className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 cursor-pointer flex flex-col h-full group overflow-hidden relative"
                      >
                          <div className="p-4 flex flex-col h-full">
                              <div className="flex justify-between items-start mb-3">
                                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getTypeColor(campaign.campaign_type)}`}>{campaign.campaign_type}</span>
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(campaign.campaign_status)}`}>{campaign.campaign_status.replace(/_/g, ' ')}</span>
                              </div>
                              <div className="mb-3">
                                  <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1 group-hover:text-indigo-700 transition-colors">{campaign.campaign_name}</h3>
                                  {owner && (
                                      <div className="flex items-center mt-2">
                                          <div className="h-4 w-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600">{owner.name.charAt(0)}</div>
                                          <span className="ml-1.5 text-[10px] font-medium text-slate-500">{owner.name}</span>
                                      </div>
                                  )}
                              </div>
                              <div className="mt-auto pt-3 border-t border-slate-100">
                                  <div className="flex justify-between items-end mb-1">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase">Progress</span>
                                      <span className="text-[10px] font-bold text-indigo-600">{progress}%</span>
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
                                      <div className={`h-1.5 rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${progress}%` }}></div>
                                  </div>
                                  <div className="flex items-center justify-end">
                                       <div className={`flex items-center px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 text-slate-600`}>
                                           <span className="text-[10px] font-bold mr-1">{campaign.kpi_score}</span>
                                           <span className="text-[8px] font-bold uppercase opacity-70">KPI</span>
                                       </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  );
              })}
          </div>
      </div>
    </div>
  );
};

export default CampaignsView;
