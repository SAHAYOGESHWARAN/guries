
import React, { useState } from 'react';
import Table from '../components/Table';
import { useData } from '../hooks/useData';
import type { ServicePageItem, Service } from '../types';

const PIPELINE_STAGES = [
    'All', 'Draft', 'In Progress', 'Published', 'Audit Pending', 'Needs Fix', 
    'QC Pending', 'QC Passed', 'Promoted'
];

const ServicesView: React.FC = () => {
  const { data: servicePages, create: createPage, remove: deletePage, update: updatePage } = useData<ServicePageItem>('servicePages');
  const { data: services } = useData<Service>('services'); // For dropdowns

  const [activeStage, setActiveStage] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Full Frame State
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [editingItem, setEditingItem] = useState<ServicePageItem | null>(null);
  
  const [newPage, setNewPage] = useState<Partial<ServicePageItem>>({
      page_title: '',
      url: '',
      page_type: 'Service Page',
      service_name: '',
      sub_service_name: '',
      primary_keyword: '',
      status: 'Draft'
  });

  const getStageCount = (stage: string) => {
      if (stage === 'All') return servicePages.length;
      return servicePages.filter(i => i.status === stage).length;
  };

  const filteredPages = servicePages.filter(item => {
      const matchesSearch = 
          item.page_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.service_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.sub_service_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.primary_keyword || '').toLowerCase().includes(searchQuery.toLowerCase());
          
      const matchesStage = activeStage === 'All' || item.status === activeStage;
      return matchesSearch && matchesStage;
  });

  const handleCreatePage = async () => {
      if (editingItem) {
          await updatePage(editingItem.id, newPage);
      } else {
          await createPage({
              ...newPage,
              seo_score: 0,
              audit_score: 0,
              last_audit: 'Just created'
          });
      }
      setViewMode('list');
      setEditingItem(null);
      setNewPage({ page_title: '', url: '', page_type: 'Service Page', service_name: '', status: 'Draft' });
  };

  const handleEditClick = (item: ServicePageItem) => {
      setEditingItem(item);
      setNewPage(item);
      setViewMode('form');
  };

  const handleDeletePage = async (id: number) => {
      if (confirm('Delete this service page?')) {
          await deletePage(id);
      }
  };

  const getScoreColor = (score: number) => {
      if (score >= 90) return 'text-green-600 bg-green-50';
      if (score >= 70) return 'text-yellow-600 bg-yellow-50';
      return 'text-red-600 bg-red-50';
  };

  const getStatusBadge = (status: string) => {
      const colors: Record<string, string> = {
          'Published': 'bg-green-100 text-green-800',
          'QC Passed': 'bg-blue-100 text-blue-800',
          'Needs Fix': 'bg-red-100 text-red-800',
          'Audit Pending': 'bg-orange-100 text-orange-800',
          'In Progress': 'bg-yellow-100 text-yellow-800',
          'Promoted': 'bg-purple-100 text-purple-800',
          'Draft': 'bg-gray-100 text-gray-800',
          'QC Pending': 'bg-indigo-100 text-indigo-800'
      };
      return <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${colors[status] || 'bg-gray-100'}`}>{status}</span>;
  };

  const columns = [
    { 
        header: 'Page Title', 
        accessor: (item: ServicePageItem) => (
            <div>
                <div className="font-bold text-slate-800">{item.page_title}</div>
                <span className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded border ${item.page_type === 'Service Page' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                    {item.page_type}
                </span>
            </div>
        )
    },
    { 
        header: 'URL', 
        accessor: (item: ServicePageItem) => (
            <a href={item.url} className="text-xs font-mono text-blue-600 hover:underline block truncate max-w-[150px]" title={item.url}>
                {item.url}
            </a>
        )
    },
    { 
        header: 'Service → Sub-Service', 
        accessor: (item: ServicePageItem) => (
            <div className="flex flex-col text-sm">
                <span className="font-medium text-slate-700">{item.service_name}</span>
                {item.sub_service_name && (
                    <span className="text-slate-500 flex items-center text-xs mt-0.5">
                        <span className="mr-1">→</span> {item.sub_service_name}
                    </span>
                )}
            </div>
        )
    },
    { 
        header: 'SEO Score', 
        accessor: (item: ServicePageItem) => (
            <div className={`text-xs font-bold px-2 py-1 rounded text-center ${getScoreColor(item.seo_score || 0)}`}>
                {item.seo_score}
            </div>
        ),
        className: "text-center"
    },
    { 
        header: 'Audit Score', 
        accessor: (item: ServicePageItem) => (
            <div className={`text-xs font-bold px-2 py-1 rounded text-center ${getScoreColor(item.audit_score || 0)}`}>
                {item.audit_score}
            </div>
        ),
        className: "text-center"
    },
    { 
        header: 'Primary Keyword', 
        accessor: (item: ServicePageItem) => (
            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs border border-slate-200 inline-block max-w-[120px] truncate" title={item.primary_keyword}>
                {item.primary_keyword}
            </span>
        )
    },
    { header: 'Last Audit', accessor: 'last_audit' as keyof ServicePageItem, className: "text-xs text-slate-500" },
    { header: 'Status', accessor: (item: ServicePageItem) => getStatusBadge(item.status) },
    { 
        header: 'Actions', 
        accessor: (item: ServicePageItem) => (
            <div className="flex space-x-2">
                 <button onClick={() => handleEditClick(item)} className="text-slate-400 hover:text-blue-600" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => handleDeletePage(item.id)} className="text-slate-400 hover:text-red-600" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
        )
    }
  ];

  if (viewMode === 'form') {
      return (
          <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in w-full">
              <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-3">
                      <button onClick={() => setViewMode('list')} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-200">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                      </button>
                      <h2 className="text-xl font-bold text-slate-800">{editingItem ? 'Edit Service Page' : 'Add Service Page'}</h2>
                  </div>
                  <div className="flex gap-3">
                      <button onClick={() => setViewMode('list')} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                      <button onClick={handleCreatePage} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors">
                          {editingItem ? 'Save Changes' : 'Create Page'}
                      </button>
                  </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                  <div className="w-full space-y-6">
                      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                          <h4 className="font-bold text-slate-800 text-sm uppercase mb-4">Page Details</h4>
                          <div className="space-y-4">
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">Page Title</label>
                                  <input type="text" value={newPage.page_title} onChange={(e) => setNewPage({...newPage, page_title: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. SEO Services" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">URL Path</label>
                                  <input type="text" value={newPage.url} onChange={(e) => setNewPage({...newPage, url: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="/services/seo" />
                              </div>
                              <div className="grid grid-cols-2 gap-6">
                                  <div>
                                      <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                      <select value={newPage.page_type} onChange={(e) => setNewPage({...newPage, page_type: e.target.value as any})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                                          <option>Service Page</option>
                                          <option>Sub-Service Page</option>
                                      </select>
                                  </div>
                                  <div>
                                      <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                      <select value={newPage.status} onChange={(e) => setNewPage({...newPage, status: e.target.value as any})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                                          {PIPELINE_STAGES.filter(s => s !== 'All').map(s => <option key={s}>{s}</option>)}
                                      </select>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                          <h4 className="font-bold text-slate-800 text-sm uppercase mb-4">Mapping & Strategy</h4>
                          <div className="grid grid-cols-2 gap-6">
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">Parent Service</label>
                                  <input type="text" value={newPage.service_name} onChange={(e) => setNewPage({...newPage, service_name: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" list="services-list" />
                                  <datalist id="services-list">
                                      {services.map(s => <option key={s.id} value={s.service_name} />)}
                                  </datalist>
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">Sub-Service (Optional)</label>
                                  <input type="text" value={newPage.sub_service_name} onChange={(e) => setNewPage({...newPage, sub_service_name: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                              </div>
                          </div>
                          <div className="mt-4">
                              <label className="block text-sm font-medium text-slate-700 mb-1">Primary Keyword</label>
                              <input type="text" value={newPage.primary_keyword} onChange={(e) => setNewPage({...newPage, primary_keyword: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. enterprise seo audit" />
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-6 h-full flex flex-col w-full p-6 animate-fade-in">
      <div className="flex justify-between items-start flex-shrink-0">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Service Page Repository</h1>
            <p className="text-slate-500 mt-1">Store, monitor, audit, and promote all Service and Sub-Service pages</p>
        </div>
        <div className="flex space-x-3">
            <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm flex items-center transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                Filters
            </button>
            <button onClick={() => { setEditingItem(null); setViewMode('form'); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition-colors flex items-center">
                <span className="mr-1 text-lg">+</span> Add Service Page
            </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Search Bar */}
          <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex-shrink-0">
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <input 
                      type="text" 
                      className="block w-full p-2 pl-10 text-sm text-slate-900 border-none focus:ring-0 placeholder-slate-400" 
                      placeholder="Search by Title, URL, Service, Sub-Service, keyword..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
              </div>
          </div>

          {/* Pipeline Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 flex-shrink-0">
              {PIPELINE_STAGES.map(stage => {
                  const count = getStageCount(stage);
                  const isActive = activeStage === stage;
                  return (
                      <button
                          key={stage}
                          onClick={() => setActiveStage(stage)}
                          className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center space-x-2 ${
                              isActive 
                                  ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200' 
                                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                          }`}
                      >
                          <span>{stage}</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-500'}`}>
                              {count}
                          </span>
                      </button>
                  );
              })}
          </div>

          {/* Data Grid */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              <Table columns={columns} data={filteredPages} title="" />
          </div>
      </div>
    </div>
  );
};

export default ServicesView;
