import React, { useState } from 'react';
import Table from '../components/Table';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import { getStatusBadge } from '../constants';
import type { Project, User } from '../types';

interface ProjectsViewProps {
  onProjectSelect?: (id: number) => void;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ onProjectSelect }) => {
  const { data: projects, create: createProject } = useData<Project>('projects');
  const { data: users } = useData<User>('users');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  
  // Form State
  const [newProject, setNewProject] = useState<Partial<Project>>({
      project_name: '',
      project_type: 'Marketing',
      project_status: 'planning',
      project_start_date: '',
      project_end_date: '',
      objective: '',
      brand_id: 1,
      project_owner_id: 0
  });

  const filteredProjects = projects.filter(project => 
      project.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.project_type || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
      await createProject(newProject as any);
      setViewMode('list');
      setNewProject({
          project_name: '', project_type: 'Marketing', project_status: 'planning',
          project_start_date: '', project_end_date: '', objective: '', brand_id: 1, project_owner_id: 0
      });
  };

  const handleExport = () => {
      exportToCSV(filteredProjects, 'projects_export');
  };

  const columns = [
      { header: 'Project Name', accessor: 'project_name' as keyof Project, className: 'font-bold text-slate-800 text-sm' },
      { header: 'Type', accessor: 'project_type' as keyof Project, className: 'text-slate-600 text-sm' },
      { header: 'Status', accessor: (item: Project) => getStatusBadge(item.project_status) },
      { 
          header: 'Owner', 
          accessor: (item: Project) => {
              const owner = users.find(u => u.id === item.project_owner_id);
              return owner ? (
                  <div className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold mr-2">
                          {owner.name.charAt(0)}
                      </div>
                      <span className="text-xs">{owner.name}</span>
                  </div>
              ) : <span className="text-slate-400 italic text-xs">Unassigned</span>;
          }
      },
      { header: 'Start Date', accessor: 'project_start_date' as keyof Project, className: 'text-xs' },
      { header: 'End Date', accessor: 'project_end_date' as keyof Project, className: 'text-xs' },
      {
          header: 'Actions',
          accessor: (item: Project) => (
              <button 
                  onClick={() => onProjectSelect && onProjectSelect(item.id)}
                  className="text-indigo-600 hover:text-indigo-900 text-xs font-medium hover:underline"
              >
                  View Dashboard
              </button>
          )
      }
  ];

  if (viewMode === 'create') {
      return (
          <div className="h-full flex flex-col w-full p-6 animate-fade-in overflow-hidden">
              <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full h-full">
                  <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-slate-50/50 w-full flex-shrink-0">
                      <div>
                          <h2 className="text-lg font-bold text-slate-800">Initiate New Project</h2>
                          <p className="text-slate-500 text-xs mt-0.5">Define scope, timeline, and ownership</p>
                      </div>
                      <div className="flex gap-2">
                          <button onClick={() => setViewMode('list')} className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                              Cancel
                          </button>
                          <button onClick={handleCreate} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-bold shadow-sm hover:bg-indigo-700 transition-all text-xs">
                              Launch Project
                          </button>
                      </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 bg-slate-50 w-full">
                      <div className="w-full space-y-4">
                          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm w-full">
                              <h4 className="font-bold text-slate-800 text-xs uppercase mb-3 border-b border-slate-100 pb-2">Core Details</h4>
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
                                  <div className="lg:col-span-2 space-y-3">
                                      <div>
                                          <label className="block text-xs font-bold text-slate-700 mb-1">Project Name</label>
                                          <input 
                                              type="text" 
                                              value={newProject.project_name} 
                                              onChange={(e) => setNewProject({...newProject,project_name: e.target.value})} 
                                              className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" 
                                              placeholder="e.g. Q4 Rebranding Initiative" 
                                          />
                                      </div>
                                      <div className="grid grid-cols-2 gap-4 w-full">
                                          <div>
                                              <label className="block text-xs font-bold text-slate-700 mb-1">Project Type</label>
                                              <select 
                                                  value={newProject.project_type} 
                                                  onChange={(e) => setNewProject({...newProject, project_type: e.target.value})} 
                                                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                                              >
                                                  <option>Marketing</option>
                                                  <option>SEO</option>
                                                  <option>Content Strategy</option>
                                                  <option>Development</option>
                                                  <option>Event</option>
                                              </select>
                                          </div>
                                          <div>
                                              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                                              <select 
                                                  value={newProject.project_status} 
                                                  onChange={(e) => setNewProject({...newProject, project_status: e.target.value as any})} 
                                                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                                              >
                                                  <option value="planning">Planning</option>
                                                  <option value="active">Active</option>
                                                  <option value="on_hold">On Hold</option>
                                              </select>
                                          </div>
                                      </div>
                                  </div>
                                  <div className="space-y-3">
                                      <div>
                                          <label className="block text-xs font-bold text-slate-700 mb-1">Project Owner</label>
                                          <select 
                                              value={newProject.project_owner_id} 
                                              onChange={(e) => setNewProject({...newProject, project_owner_id: parseInt(e.target.value)})} 
                                              className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                                          >
                                              <option value={0}>Select Owner...</option>
                                              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                          </select>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm w-full">
                              <h4 className="font-bold text-slate-800 text-xs uppercase mb-3 border-b border-slate-100 pb-2">Timeline & Strategy</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                  <div>
                                      <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                                      <input 
                                          type="date" 
                                          value={newProject.project_start_date} 
                                          onChange={(e) => setNewProject({...newProject, project_start_date: e.target.value})} 
                                          className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" 
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                                      <input 
                                          type="date" 
                                          value={newProject.project_end_date} 
                                          onChange={(e) => setNewProject({...newProject, project_end_date: e.target.value})} 
                                          className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" 
                                      />
                                  </div>
                              </div>
                              <div className="mt-4 w-full">
                                  <label className="block text-xs font-bold text-slate-700 mb-1">Objective / Description</label>
                                  <textarea 
                                      value={newProject.objective} 
                                      onChange={(e) => setNewProject({...newProject, objective: e.target.value})} 
                                      className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-20 resize-none text-sm"
                                      placeholder="Describe the primary goals and scope of this project..."
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
    <div className="h-full flex flex-col w-full p-6 animate-fade-in overflow-hidden">
        <div className="flex justify-between items-start flex-shrink-0 w-full mb-4">
            <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">Projects</h1>
                <p className="text-slate-500 text-xs mt-0.5">Manage multi-campaign marketing initiatives and timelines.</p>
            </div>
        </div>

        <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between flex-shrink-0 w-full mb-4">
            <div className="flex-1 w-full relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input 
                    type="search" 
                    className="block w-full p-2 pl-9 text-sm text-gray-900 border border-gray-300 rounded-lg bg-slate-50 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400" 
                    placeholder="Search projects..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                <button onClick={handleExport} className="text-slate-600 bg-white border border-slate-300 px-3 py-2 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors flex items-center shadow-sm">
                    <svg className="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Export
                </button>
                <button onClick={() => setViewMode('create')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-md flex items-center">
                    <span className="mr-1 text-base">+</span> Create Project
                </button>
            </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200 w-full min-h-0">
            <div className="flex-1 overflow-hidden w-full h-full">
                <Table columns={columns} data={filteredProjects} title="Active Projects Directory" />
            </div>
        </div>
    </div>
  );
};

export default ProjectsView;