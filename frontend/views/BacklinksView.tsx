
import React, { useState } from 'react';
import Table from '../components/Table';
import { useData } from '../hooks/useData';
import type { BacklinkSubmission, BacklinkSource, User } from '../types';

const PIPELINE_STAGES = ['All', 'Pending', 'Submitted', 'Verified', 'Rejected', 'Expired'];

const BacklinksView: React.FC = () => {
  const { data: submissions, create: createSubmission } = useData<BacklinkSubmission>('submissions');
  const { data: sources } = useData<BacklinkSource>('backlinks');
  const { data: users } = useData<User>('users');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeStage, setActiveStage] = useState('All');
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [newSubmission, setNewSubmission] = useState<Partial<BacklinkSubmission>>({
      backlink_source_id: 0,
      target_url: '',
      anchor_text_used: '',
      content_used: '',
      owner_id: 0,
      submission_status: 'Pending'
  });

  const getStageCount = (stage: string) => {
      if (stage === 'All') return submissions.length;
      return submissions.filter(s => s.submission_status === stage).length;
  };

  const filteredSubmissions = submissions.filter(item => {
      const source = sources.find(s => s.id === item.backlink_source_id);
      const matchesSearch = 
          item.target_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.anchor_text_used.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (source?.domain || '').toLowerCase().includes(searchQuery.toLowerCase());
          
      const matchesStage = activeStage === 'All' || item.submission_status === activeStage;
      return matchesSearch && matchesStage;
  });

  const handleSubmit = async () => {
      if (!newSubmission.backlink_source_id) return alert("Select a source");
      await createSubmission({
          ...newSubmission,
          submitted_at: new Date().toISOString()
      } as any);
      setViewMode('list');
      setNewSubmission({ backlink_source_id: 0, target_url: '', anchor_text_used: '', content_used: '', owner_id: 0, submission_status: 'Pending' });
  };

  const columns = [
      { 
          header: 'Domain Source', 
          accessor: (item: BacklinkSubmission) => {
              const source = sources.find(s => s.id === item.backlink_source_id);
              return <span className="font-bold text-slate-700">{source?.domain || 'Unknown'}</span>;
          }
      },
      { header: 'Target URL', accessor: 'target_url' as keyof BacklinkSubmission, className: "text-xs text-blue-600 truncate max-w-[150px]" },
      { header: 'Anchor Text', accessor: 'anchor_text_used' as keyof BacklinkSubmission, className: "italic text-slate-600" },
      { 
          header: 'Status', 
          accessor: (item: BacklinkSubmission) => (
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                  item.submission_status === 'Verified' ? 'bg-green-100 text-green-800' :
                  item.submission_status === 'Rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
              }`}>
                  {item.submission_status}
              </span>
          )
      },
      { header: 'Date', accessor: (item: BacklinkSubmission) => new Date(item.submitted_at).toLocaleDateString() }
  ];

  if (viewMode === 'create') {
      return (
          <div className="h-full flex flex-col w-full p-6 animate-fade-in">
              <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full">
                  <div className="border-b border-slate-200 px-8 py-5 flex justify-between items-center bg-slate-50/50 w-full">
                      <h2 className="text-2xl font-bold text-slate-800">Record Backlink Submission</h2>
                      <div className="flex gap-3">
                          <button onClick={() => setViewMode('list')} className="px-5 py-2.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50">Cancel</button>
                          <button onClick={handleSubmit} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-blue-700">Save Submission</button>
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 bg-slate-50 w-full">
                      <div className="w-full space-y-6">
                          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 w-full">
                              <div>
                                  <label className="block text-sm font-bold text-slate-700 mb-2">Backlink Source</label>
                                  <select 
                                    value={newSubmission.backlink_source_id} 
                                    onChange={(e) => setNewSubmission({...newSubmission, backlink_source_id: parseInt(e.target.value)})} 
                                    className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                  >
                                      <option value={0}>Select Domain...</option>
                                      {sources.map(s => (
                                          <option key={s.id} value={s.id}>{s.domain} ({s.platform_type})</option>
                                      ))}
                                  </select>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                  <div>
                                      <label className="block text-sm font-bold text-slate-700 mb-2">Target URL</label>
                                      <input type="text" value={newSubmission.target_url} onChange={(e) => setNewSubmission({...newSubmission, target_url: e.target.value})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="/services/..." />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-slate-700 mb-2">Anchor Text</label>
                                      <input type="text" value={newSubmission.anchor_text_used} onChange={(e) => setNewSubmission({...newSubmission, anchor_text_used: e.target.value})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                                  </div>
                              </div>

                              <div>
                                  <label className="block text-sm font-bold text-slate-700 mb-2">Content Used</label>
                                  <input type="text" value={newSubmission.content_used} onChange={(e) => setNewSubmission({...newSubmission, content_used: e.target.value})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Title of content or article..." />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                  <div>
                                      <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                                      <select value={newSubmission.submission_status} onChange={(e) => setNewSubmission({...newSubmission, submission_status: e.target.value as any})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                          {PIPELINE_STAGES.filter(s => s !== 'All').map(s => <option key={s}>{s}</option>)}
                                      </select>
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-slate-700 mb-2">SEO Owner</label>
                                      <select value={newSubmission.owner_id} onChange={(e) => setNewSubmission({...newSubmission, owner_id: parseInt(e.target.value)})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                          <option value={0}>Select Owner...</option>
                                          {users.map(u => (
                                              <option key={u.id} value={u.id}>{u.name}</option>
                                          ))}
                                      </select>
                                  </div>
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
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Backlink Submission</h1>
            <p className="text-slate-500 mt-1">Manage backlink opportunities, submissions, and verification</p>
        </div>
        <div className="flex space-x-3">
            <button onClick={() => setViewMode('create')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm flex items-center transition-colors">
                <span className="mr-1 text-lg">+</span> Submit Backlink
            </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 min-h-0 w-full">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex-shrink-0 w-full">
              <input 
                  type="text" 
                  className="block w-full p-2 pl-3 text-sm text-slate-900 border-none focus:ring-0 placeholder-slate-400" 
                  placeholder="Search by domain, opportunity, anchor text, keyword..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 flex-shrink-0 w-full">
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

          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden w-full">
              <div className="flex-1 overflow-hidden w-full">
                  <Table columns={columns} data={filteredSubmissions} title="" />
              </div>
          </div>
      </div>
    </div>
  );
};

export default BacklinksView;
