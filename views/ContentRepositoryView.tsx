import React, { useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal'; 
import { useData } from '../hooks/useData';
import { getStatusBadge } from '../constants';
import type { ContentRepositoryItem } from '../types';

const PIPELINE_STAGES = ['All', 'idea', 'outline', 'draft', 'qc_pending', 'qc_passed', 'published'];

const ContentRepositoryView: React.FC = () => {
  const { data: content, create: createContent, update: updateContent, remove: deleteContent } = useData<ContentRepositoryItem>('content');
  
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStage, setActiveStage] = useState('All');
  const [editingItem, setEditingItem] = useState<ContentRepositoryItem | null>(null);
  
  const [formData, setFormData] = useState<Partial<ContentRepositoryItem>>({
      content_title_clean: '',
      asset_type: 'blog',
      status: 'idea',
      h1: '',
      body_content: ''
  });

  const getStageCount = (stage: string) => {
      if (stage === 'All') return content.length;
      return content.filter(c => c.status === stage).length;
  };

  const filteredContent = content.filter(item => {
      const matchesSearch = item.content_title_clean.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = activeStage === 'All' || item.status === activeStage;
      return matchesSearch && matchesStage;
  });

  const handleEdit = (item: ContentRepositoryItem) => {
      setEditingItem(item);
      setFormData(item);
      setViewMode('editor');
  };

  const handleDeleteContent = async (id: number) => {
      if(confirm('Delete content?')) await deleteContent(id);
  };

  const resetForm = () => {
      setFormData({ content_title_clean: '', asset_type: 'blog', status: 'idea', h1: '', body_content: '' });
  };

  const handleSave = async () => {
      if (editingItem) {
          await updateContent(editingItem.id, formData);
      } else {
          await createContent(formData as any);
      }
      setViewMode('list');
      setEditingItem(null);
      resetForm();
  };

  if (viewMode === 'editor') {
      return (
          <div className="h-full flex flex-col w-full p-6 animate-fade-in overflow-hidden">
              <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full h-full">
                  <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-slate-50/50 w-full flex-shrink-0">
                      <h2 className="text-lg font-bold text-slate-800">{editingItem ? 'Edit Content' : 'New Content Asset'}</h2>
                      <div className="flex gap-2">
                          <button onClick={() => setViewMode('list')} className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                          <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-blue-700">Save</button>
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 bg-slate-50 w-full">
                      <div className="w-full space-y-4">
                          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm w-full">
                              <div className="grid grid-cols-2 gap-4 mb-4 w-full">
                                  <div>
                                      <label className="block text-xs font-bold text-gray-700 mb-1">Title</label>
                                      <input type="text" value={formData.content_title_clean} onChange={(e) => setFormData({...formData, content_title_clean: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md text-sm" />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                                      <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="w-full p-2 border border-slate-300 rounded-md text-sm">
                                          {PIPELINE_STAGES.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                                      </select>
                                  </div>
                              </div>
                              <div className="mb-4">
                                  <label className="block text-xs font-bold text-gray-700 mb-1">H1 Header</label>
                                  <input type="text" value={formData.h1} onChange={(e) => setFormData({...formData, h1: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md text-sm" />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-700 mb-1">Body Content</label>
                                  <textarea value={formData.body_content} onChange={(e) => setFormData({...formData, body_content: e.target.value})} className="w-full p-3 border border-slate-300 rounded-md h-64 font-mono text-sm leading-relaxed" />
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // LIST VIEW
  return (
    <div className="h-full flex flex-col w-full p-6 animate-fade-in overflow-hidden">
      <div className="flex justify-between items-start flex-shrink-0 w-full mb-4">
        <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Content Repository</h1>
            <p className="text-slate-500 text-xs mt-0.5">Manage assets, link to services, and track production status</p>
        </div>
        <div className="flex space-x-3">
            <button onClick={() => { setEditingItem(null); resetForm(); setViewMode('editor'); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm flex items-center transition-colors">
                <span className="mr-1 text-base">+</span> Add Asset
            </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-1 min-h-0 w-full">
          <div className="flex-1 flex flex-col gap-3 min-w-0 w-full min-h-0">
              <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-200 w-full flex-shrink-0">
                  <input type="text" className="block w-full p-2 pl-3 text-sm text-slate-900 border-none focus:ring-0 placeholder-slate-400" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 w-full flex-shrink-0">
                  {PIPELINE_STAGES.map(stage => (
                      <button key={stage} onClick={() => setActiveStage(stage)} className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap flex items-center space-x-2 ${activeStage === stage ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                          <span>{stage}</span><span className={`px-1.5 py-0.5 rounded-full text-[9px] ${activeStage === stage ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-500'}`}>{getStageCount(stage)}</span>
                      </button>
                  ))}
              </div>
              <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden w-full h-full">
                  <div className="flex-1 overflow-hidden w-full h-full">
                    <Table 
                        columns={[
                            { header: 'Title', accessor: (item: ContentRepositoryItem) => <div className="font-medium text-slate-900 max-w-[200px] truncate text-sm" title={item.content_title_clean}>{item.content_title_clean}</div> },
                            { header: 'Type', accessor: (item: ContentRepositoryItem) => <span className="text-[10px] font-bold text-slate-600 capitalize bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{(item.asset_type || '').replace(/_/g, ' ')}</span> },
                            { header: 'Status', accessor: (item: ContentRepositoryItem) => <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-600`}>{item.status.replace(/_/g, ' ')}</span> },
                            { header: 'QC Score', accessor: (item: ContentRepositoryItem) => <span className={`font-bold text-xs ${item.ai_qc_report?.score && item.ai_qc_report.score >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>{item.ai_qc_report?.score || '-'}</span>, className: "text-center" },
                            { header: 'Actions', accessor: (item: ContentRepositoryItem) => (
                                <div className="flex space-x-2">
                                    <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                                    <button onClick={() => handleDeleteContent(item.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">Del</button>
                                </div>
                            )}
                        ]} 
                        data={filteredContent} 
                        title="" 
                    />
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ContentRepositoryView;