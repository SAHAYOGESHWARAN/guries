import React, { useState, useRef } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { useData } from '../hooks/useData';
import { getStatusBadge, SparkIcon } from '../constants';
import { runQuery } from '../utils/gemini';
import type { SmmPost, User } from '../types';

const PIPELINE_STAGES = ['All', 'Draft', 'Scheduled', 'QC Pending', 'Approved', 'Posted', 'Rejected', 'Needs Rework'];

const SmmRepositoryView: React.FC = () => {
  const { data: posts, create: createPost, update: updatePost } = useData<SmmPost>('smm');
  const { data: users } = useData<User>('users');
  
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStage, setActiveStage] = useState('All');
  
  // Filter States
  const [isThisWeekOnly, setIsThisWeekOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState('All Platforms');
  const [filterType, setFilterType] = useState('All Types');

  // Modal States
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Quick Edit
  
  const [selectedPost, setSelectedPost] = useState<SmmPost | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingNew, setIsGeneratingNew] = useState(false);

  const [newPost, setNewPost] = useState<Partial<SmmPost>>({
      title: '', smm_type: 'Image Post', primary_platform: 'LinkedIn', 
      smm_status: 'Draft', caption: '', schedule_date: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getStageCount = (stage: string) => {
      if (stage === 'All') return posts.length;
      return posts.filter(p => p.smm_status === stage).length;
  };

  const filteredPosts = posts.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.caption.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = activeStage === 'All' || item.smm_status === activeStage;
      const matchesPlatform = filterPlatform === 'All Platforms' || item.primary_platform === filterPlatform;
      const matchesType = filterType === 'All Types' || item.smm_type === filterType;
      
      return matchesSearch && matchesStage && matchesPlatform && matchesType;
  });

  const handleCreatePost = async () => {
      await createPost(newPost as any);
      setViewMode('list');
      setNewPost({ title: '', smm_type: 'Image Post', primary_platform: 'LinkedIn', smm_status: 'Draft', caption: '', schedule_date: '' });
  };

  const handleGenerateNewCaption = async () => {
      if (!newPost.title) return;
      setIsGeneratingNew(true);
      try {
          const result = await runQuery(`Write a ${newPost.primary_platform} caption for a post about "${newPost.title}". Tone: Professional.`, { model: 'gemini-2.5-flash' });
          setNewPost(prev => ({ ...prev, caption: result.text }));
      } catch (e) { alert("Failed to generate"); }
      finally { setIsGeneratingNew(false); }
  };

  const handleGenerateCaption = async () => {
      if (!selectedPost) return;
      setIsLoading(true);
      try {
          const result = await runQuery(`Rewrite this caption to be more engaging for ${selectedPost.primary_platform}: "${selectedPost.caption}"`, { model: 'gemini-2.5-flash' });
          setAiResult(result.text);
      } catch (e) { alert("Failed"); }
      finally { setIsLoading(false); }
  };

  const handleSaveCaption = async () => {
      if (selectedPost && aiResult) {
          await updatePost(selectedPost.id, { caption: aiResult });
          setIsModalOpen(false);
          setAiResult(null);
          setSelectedPost(null);
      }
  };

  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Mock bulk upload
      alert("Bulk upload simulation: 5 posts added.");
      setIsBulkModalOpen(false);
  };

  const columns = [
      { header: 'Topic', accessor: 'title' as keyof SmmPost, className: 'font-bold text-slate-800 text-sm' },
      { header: 'Platform', accessor: 'primary_platform' as keyof SmmPost },
      { header: 'Type', accessor: 'smm_type' as keyof SmmPost },
      { header: 'Scheduled', accessor: (item: SmmPost) => item.schedule_date ? new Date(item.schedule_date).toLocaleDateString() : '-' },
      { header: 'Status', accessor: (item: SmmPost) => getStatusBadge(item.smm_status) },
      { 
          header: 'Actions', 
          accessor: (item: SmmPost) => (
              <button 
                  onClick={() => { setSelectedPost(item); setAiResult(item.caption); setIsModalOpen(true); }}
                  className="text-blue-600 font-bold text-xs hover:underline"
              >
                  Quick Edit
              </button>
          )
      }
  ];

  if (viewMode === 'create') {
      return (
          <div className="h-full flex flex-col w-full p-6 animate-fade-in">
              <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in w-full">
                  <div className="border-b border-slate-200 px-8 py-5 flex justify-between items-center bg-slate-50/50 w-full">
                      <div>
                          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Create Social Post</h2>
                          <p className="text-slate-500 text-xs mt-0.5">Compose, preview, and schedule content</p>
                      </div>
                      <div className="flex gap-3">
                          <button onClick={() => setViewMode('list')} className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors uppercase tracking-wide">Cancel</button>
                          <button onClick={handleCreatePost} className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold shadow-md hover:bg-indigo-700 text-xs uppercase tracking-wide transition-colors">Save & Schedule</button>
                      </div>
                  </div>
                  <div className="flex-1 overflow-hidden flex flex-col lg:flex-row w-full">
                      {/* Left: Composer */}
                      <div className="flex-1 p-8 overflow-y-auto border-r border-slate-200 bg-white w-full">
                          <div className="space-y-5 w-full">
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Topic / Working Title</label>
                                  <input type="text" value={newPost.title} onChange={(e) => setNewPost({...newPost, title: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="e.g. Q4 Product Launch Teaser" />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-5 w-full">
                                  <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Platform</label>
                                      <select value={newPost.primary_platform} onChange={(e) => setNewPost({...newPost, primary_platform: e.target.value as any})} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm">
                                          <option>LinkedIn</option><option>Instagram</option><option>YouTube</option><option>Facebook</option><option>Twitter</option>
                                      </select>
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Post Type</label>
                                      <select value={newPost.smm_type} onChange={(e) => setNewPost({...newPost, smm_type: e.target.value as any})} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm">
                                          <option>Image Post</option><option>Carousel</option><option>Video</option><option>Reel</option><option>Story</option>
                                      </select>
                                  </div>
                              </div>

                              <div>
                                  <div className="flex justify-between items-center mb-1.5">
                                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Caption</label>
                                      <button onClick={handleGenerateNewCaption} disabled={!newPost.title || isGeneratingNew} className="text-[10px] text-indigo-600 hover:text-indigo-800 flex items-center font-bold bg-indigo-50 px-2 py-1 rounded transition-colors disabled:opacity-50">
                                          <SparkIcon /> <span className="ml-1">{isGeneratingNew ? 'Generating...' : 'AI Generate'}</span>
                                      </button>
                                  </div>
                                  <textarea value={newPost.caption} onChange={(e) => setNewPost({...newPost, caption: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg h-40 focus:ring-2 focus:ring-indigo-500 text-sm leading-relaxed" placeholder="Write your engaging caption here..." />
                              </div>

                              <div className="grid grid-cols-2 gap-5 w-full">
                                  <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Schedule Date</label>
                                      <input type="datetime-local" value={newPost.schedule_date} onChange={(e) => setNewPost({...newPost, schedule_date: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Assignee</label>
                                      <select value={newPost.assigned_to_id} onChange={(e) => setNewPost({...newPost, assigned_to_id: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm">
                                          <option value={0}>Unassigned</option>
                                          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                      </select>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Right: Preview */}
                      <div className="w-[400px] bg-slate-50 p-8 border-l border-slate-200 hidden lg:block overflow-y-auto flex-shrink-0">
                          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Device Preview</h3>
                          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-sm mx-auto w-full">
                              {/* Mock Social Header */}
                              <div className="p-4 border-b border-slate-100 flex items-center">
                                  <div className="w-8 h-8 bg-slate-200 rounded-full mr-3"></div>
                                  <div>
                                      <div className="h-2 w-24 bg-slate-200 rounded mb-1"></div>
                                      <div className="h-1.5 w-16 bg-slate-100 rounded"></div>
                                  </div>
                              </div>
                              {/* Mock Content */}
                              <div className="h-48 bg-slate-100 flex items-center justify-center text-slate-300 text-sm font-medium">
                                  [Media Placeholder]
                              </div>
                              <div className="p-4 space-y-2">
                                  <div className="text-sm text-slate-800 whitespace-pre-wrap">{newPost.caption || "Caption preview will appear here..."}</div>
                                  <div className="h-px bg-slate-100 my-2"></div>
                                  <div className="flex space-x-4">
                                      <div className="h-4 w-4 bg-slate-200 rounded"></div>
                                      <div className="h-4 w-4 bg-slate-200 rounded"></div>
                                      <div className="h-4 w-4 bg-slate-200 rounded"></div>
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
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">SMM Posting & Scheduling</h1>
            <p className="text-slate-500 mt-1 text-xs">Create, schedule, and manage social media content across all platforms</p>
        </div>
        <div className="flex space-x-3">
            <button 
                onClick={() => setIsThisWeekOnly(!isThisWeekOnly)}
                className={`border px-4 py-2 rounded-lg text-xs font-medium shadow-sm transition-colors ${isThisWeekOnly ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
            >
                {isThisWeekOnly ? 'Viewing: This Week' : 'This Week'}
            </button>
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`border px-4 py-2 rounded-lg text-xs font-medium shadow-sm flex items-center transition-colors ${showFilters ? 'bg-slate-100 text-slate-800' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
            >
                <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                Filters
            </button>
            <button 
                onClick={() => setIsBulkModalOpen(true)}
                className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-medium hover:bg-slate-50 shadow-sm transition-colors"
            >
                Bulk Upload
            </button>
            <button onClick={() => setViewMode('create')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm flex items-center transition-colors">
                <span className="mr-1 text-base">+</span> New Post
            </button>
        </div>
      </div>

      {/* Filter Bar (Toggled) */}
      {showFilters && (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex gap-4 animate-slide-up w-full mb-4">
              <select 
                  value={filterPlatform} 
                  onChange={(e) => setFilterPlatform(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg p-2 min-w-[140px]"
              >
                  <option>All Platforms</option>
                  <option>LinkedIn</option>
                  <option>Instagram</option>
                  <option>YouTube</option>
                  <option>Facebook</option>
                  <option>Twitter</option>
              </select>
              <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-700 text-xs rounded-lg p-2 min-w-[140px]"
              >
                  <option>All Types</option>
                  <option>Image Post</option>
                  <option>Carousel</option>
                  <option>Video</option>
                  <option>Reel</option>
                  <option>Story</option>
              </select>
          </div>
      )}

      <div className="flex-1 flex flex-col gap-4 min-h-0 w-full">
          <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-200 flex-shrink-0 w-full">
              <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <input 
                      type="text" 
                      className="block w-full p-2 pl-9 text-sm text-slate-900 border-none focus:ring-0 placeholder-slate-400" 
                      placeholder="Search by caption, platform, service..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
              </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 flex-shrink-0 w-full">
              {PIPELINE_STAGES.map(stage => {
                  const count = getStageCount(stage);
                  const isActive = activeStage === stage;
                  return (
                      <button
                          key={stage}
                          onClick={() => setActiveStage(stage)}
                          className={`flex-shrink-0 px-4 py-2 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap flex items-center space-x-2 ${
                              isActive 
                                  ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                          }`}
                      >
                          <span>{stage}</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${isActive ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-100 text-slate-500'}`}>
                              {count}
                          </span>
                      </button>
                  );
              })}
          </div>

          <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden w-full">
              <div className="flex-1 overflow-hidden w-full">
                  <Table columns={columns} data={filteredPosts} title="" />
              </div>
          </div>
      </div>

      {/* Bulk Upload Modal */}
      <Modal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} title="Bulk Upload Posts">
          <div className="space-y-6 p-2">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                  <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleBulkFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept=".csv"
                  />
                  <div className="flex flex-col items-center">
                      <svg className="w-10 h-10 text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      <p className="text-sm font-medium text-slate-700">Click to upload CSV</p>
                      <p className="text-xs text-slate-500 mt-1">Format: platform, type, caption, date</p>
                  </div>
              </div>
              <div className="flex justify-end">
                  <button onClick={() => setIsBulkModalOpen(false)} className="text-slate-600 hover:text-slate-800 text-xs font-bold px-4 py-2 uppercase tracking-wide">Cancel</button>
              </div>
          </div>
      </Modal>

      {/* Quick Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Quick Edit Caption">
          <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-600 mb-4">
                  <span className="font-bold">{selectedPost?.title || 'Untitled'}</span> for {selectedPost?.primary_platform}
              </div>
              <textarea 
                  value={aiResult || ''} 
                  onChange={(e) => setAiResult(e.target.value)} 
                  className="w-full p-3 border border-gray-300 rounded-lg h-40 text-sm leading-relaxed"
                  placeholder="Enter caption..."
              />
              <div className="flex justify-between items-center pt-2">
                  <button 
                      onClick={handleGenerateCaption} 
                      disabled={isLoading}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center disabled:opacity-50"
                  >
                      <SparkIcon /> <span className="ml-1">{isLoading ? 'Thinking...' : 'AI Re-write'}</span>
                  </button>
                  <div className="flex space-x-2">
                      <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg uppercase tracking-wide">Cancel</button>
                      <button onClick={handleSaveCaption} className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg uppercase tracking-wide shadow-sm">Save</button>
                  </div>
              </div>
          </div>
      </Modal>
    </div>
  );
};

export default SmmRepositoryView;