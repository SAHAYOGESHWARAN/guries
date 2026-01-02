import React, { useState, useMemo } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Timeline from '../components/Timeline';
import { getStatusBadge } from '../constants';
import type { Task, Campaign, Project, User } from '../types';
import { useData } from '../hooks/useData';

interface ProjectDetailViewProps {
  projectId: number;
  onNavigateBack: () => void;
}

const CampaignCard: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
    const progress = campaign.backlinks_planned > 0 
        ? Math.round((campaign.backlinks_completed / campaign.backlinks_planned) * 100) 
        : 0;

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col h-full hover:shadow-md transition-shadow duration-200 group">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800 text-sm pr-2 leading-tight group-hover:text-indigo-600 transition-colors">{campaign.campaign_name}</h3>
                {getStatusBadge(campaign.campaign_status)}
            </div>
            <p className="text-xs text-slate-500 capitalize mb-4">{(campaign.campaign_type || '').replace(/_/g, ' ')}</p>
            
            <div className="mt-auto">
                 <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Progress</span>
                    <span className="text-[10px] font-bold text-indigo-600">{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        </div>
    );
};

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ projectId, onNavigateBack }) => {
  const { data: projects, update: updateProject } = useData<Project>('projects');
  const { data: campaigns } = useData<Campaign>('campaigns');
  const { data: tasks, create: createTask, remove: deleteTask, update: updateTask } = useData<Task>('tasks');
  const { data: users } = useData<User>('users');

  const project = projects.find(p => p.id === projectId);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);

  const [newTask, setNewTask] = useState<Partial<Task>>({
      name: '',
      task_type: 'general',
      campaign_id: 0,
      primary_owner_id: 0,
      due_date: '',
      status: 'not_started'
  });

  const [editProjectForm, setEditProjectForm] = useState<Partial<Project>>({});

  const timelineData = useMemo(() => {
      const projCampaignIds = campaigns.filter(c => c.project_id === projectId).map(c => c.id);
      const projTasks = tasks.filter(t => projCampaignIds.includes(t.campaign_id));

      const items = projTasks.map(t => {
          const dueDate = new Date(t.due_date);
          const startDate = new Date(dueDate);
          startDate.setDate(dueDate.getDate() - 5); 
          
          const user = users.find(u => u.id === t.primary_owner_id);
          const campaign = campaigns.find(c => c.id === t.campaign_id);

          return {
              id: t.id,
              name: t.name,
              start: startDate.toISOString().split('T')[0],
              end: t.due_date,
              status: t.status,
              owner: user?.name,
              ownerAvatar: user?.avatar_url,
              group: campaign?.campaign_name,
              campaignId: t.campaign_id
          };
      });

      const dependencies: { from: number, to: number }[] = [];
      
      projCampaignIds.forEach(cid => {
          const campaignTasks = items.filter(i => i.campaignId === cid)
              .sort((a, b) => new Date(a.end).getTime() - new Date(b.end).getTime());
          
          for(let i = 0; i < campaignTasks.length - 1; i++) {
              dependencies.push({
                  from: campaignTasks[i].id,
                  to: campaignTasks[i+1].id
              });
          }
      });

      return { items, dependencies };
  }, [tasks, campaigns, projectId, users]);

  if (!project) {
    return (
      <div className="space-y-4 p-6 flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold text-slate-800">Project not found</h1>
        <button onClick={onNavigateBack} className="text-indigo-600 hover:underline text-sm">Back to Projects</button>
      </div>
    );
  }

  const projectCampaigns = campaigns.filter(c => c.project_id === projectId);
  const campaignIds = projectCampaigns.map(c => c.id);
  const projectTasks = tasks.filter(t => campaignIds.includes(t.campaign_id));

  const totalPlanned = projectCampaigns.reduce((sum, camp) => sum + camp.backlinks_planned, 0);
  const totalCompleted = projectCampaigns.reduce((sum, camp) => sum + camp.backlinks_completed, 0);
  const progressPercentage = totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0;

  const handleCreateTask = async () => {
      if (!newTask.campaign_id) {
          alert("Please select a campaign.");
          return;
      }
      await createTask({
          ...newTask,
          id: Date.now(),
      });
      setIsTaskModalOpen(false);
      setNewTask({ name: '', task_type: 'general', campaign_id: 0, primary_owner_id: 0, due_date: '', status: 'not_started' });
  };

  const handleDeleteTask = async (id: number) => {
      if(confirm('Delete this task permanently?')) {
          await deleteTask(id);
      }
  };

  const handleToggleTaskStatus = async (task: Task) => {
      const newStatus = task.status === 'completed' ? 'in_progress' : 'completed';
      await updateTask(task.id, { status: newStatus });
  };

  const handleEditProjectClick = () => {
      setEditProjectForm({ ...project });
      setIsEditProjectModalOpen(true);
  };

  const handleSaveProject = async () => {
      await updateProject(projectId, editProjectForm);
      setIsEditProjectModalOpen(false);
  };

  const handlePrintBrief = () => {
      window.print();
  };

  const taskColumns = [
    { header: 'Task Name', accessor: 'name' as keyof Task, className: 'font-medium text-slate-900' },
    {
      header: 'Campaign',
      accessor: (item: Task) => {
        const campaign = campaigns.find(c => c.id === item.campaign_id);
        return campaign ? campaign.campaign_name : '-';
      },
      className: 'text-slate-500'
    },
    {
      header: 'Assigned To',
      accessor: (item: Task) => {
        const user = users.find(u => u.id === item.primary_owner_id);
        return user ? user.name : 'Unassigned';
      }
    },
    { header: 'Due Date', accessor: 'due_date' as keyof Task, className: 'font-mono text-xs' },
    { header: 'Status', accessor: (item: Task) => getStatusBadge(item.status) },
    {
        header: 'Actions',
        accessor: (item: Task) => (
            <div className="flex space-x-2">
                 <button 
                    onClick={() => handleToggleTaskStatus(item)} 
                    className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${item.status === 'completed' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}
                >
                    {item.status === 'completed' ? 'Reopen' : 'Complete'}
                </button>
                <button onClick={() => handleDeleteTask(item.id)} className="text-rose-600 hover:text-rose-800 text-xs font-bold print:hidden">
                    Delete
                </button>
            </div>
        )
    }
  ];

  return (
    <div className="space-y-6 h-full overflow-y-auto w-full pr-1 p-6 animate-fade-in">
      <div className="flex justify-between items-center print:hidden">
        <button onClick={onNavigateBack} className="flex items-center text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm">
            ← Back to Projects
        </button>
        <div className="flex space-x-3">
            <button onClick={handleEditProjectClick} className="bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-50 text-xs font-medium transition-colors">
                Edit Project
            </button>
            <button onClick={handlePrintBrief} className="bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-50 flex items-center text-xs font-medium transition-colors">
                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print Brief
            </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:shadow-none print:border print:border-black">
        <div className="flex justify-between items-start">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide">ID: {project.id}</span>
                    {getStatusBadge(project.project_status)}
                </div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{project.project_name}</h1>
                <p className="text-slate-500 mt-1 capitalize flex items-center text-sm">
                    {(project.project_type || '').replace(/_/g, ' ')}
                    <span className="mx-2 text-slate-300">•</span>
                    <span className="font-mono text-xs">{project.project_start_date} to {project.project_end_date}</span>
                </p>
            </div>
            <div className="text-right hidden md:block print:block">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Project Owner</p>
                <div className="flex items-center justify-end">
                     <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold mr-2 shadow-sm">
                        {users.find(u => u.id === project.project_owner_id)?.name.charAt(0)}
                     </div>
                     <span className="font-medium text-slate-700 text-sm">{users.find(u => u.id === project.project_owner_id)?.name}</span>
                </div>
            </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-100 pt-6">
             <div>
                <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Progress</span>
                    <span className="text-lg font-bold text-indigo-600">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full print:bg-black transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Financial Snapshot</p>
                <div className="flex justify-between items-baseline mt-1">
                    <span className="text-lg font-bold text-slate-800">$12,450</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">On Budget</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Spend: 45% of allocated $28,000</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Risk Assessment</p>
                <div className="flex justify-between items-baseline mt-1">
                    <span className="text-lg font-bold text-slate-800">Low</span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">Stable</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">0 Critical blockers flagged</p>
            </div>
        </div>
    </div>
      
      <div className="animate-fade-in">
          <Timeline 
            items={timelineData.items} 
            dependencies={timelineData.dependencies}
            title="Resource Timeline" 
          />
      </div>

      <div>
        <h2 className="text-base font-bold text-slate-800 mb-3">Active Campaigns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projectCampaigns.length > 0 ? (
            projectCampaigns.map(campaign => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))
          ) : (
            <p className="text-slate-400 p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center w-full col-span-full text-sm">No campaigns found for this project.</p>
          )}
        </div>
      </div>

      <div className="break-inside-avoid">
         <Table 
            columns={taskColumns} 
            data={projectTasks} 
            title="Task Manifest" 
            actionButton={
                <button onClick={() => setIsTaskModalOpen(true)} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 print:hidden shadow-sm transition-colors">
                    + Add Task
                </button>
            }
         />
      </div>

      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create New Task">
          <div className="space-y-4">
              <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Task Name</label>
                  <input 
                    type="text" 
                    value={newTask.name} 
                    onChange={(e) => setNewTask({...newTask, name: e.target.value})} 
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Finalize Keyword List"
                  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Campaign</label>
                      <select 
                        value={newTask.campaign_id} 
                        onChange={(e) => setNewTask({...newTask, campaign_id: parseInt(e.target.value)})} 
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                      >
                          <option value={0}>Select Campaign...</option>
                          {projectCampaigns.map(c => (
                              <option key={c.id} value={c.id}>{c.campaign_name}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                      <select 
                        value={newTask.task_type} 
                        onChange={(e) => setNewTask({...newTask, task_type: e.target.value})} 
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                      >
                          <option value="general">General</option>
                          <option value="content">Content</option>
                          <option value="seo">SEO</option>
                          <option value="backlink_build">Backlink</option>
                          <option value="design">Design</option>
                      </select>
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Assignee</label>
                      <select 
                        value={newTask.primary_owner_id} 
                        onChange={(e) => setNewTask({...newTask, primary_owner_id: parseInt(e.target.value)})} 
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                      >
                          <option value={0}>Unassigned</option>
                          {users.map(u => (
                              <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                      <input 
                        type="date" 
                        value={newTask.due_date} 
                        onChange={(e) => setNewTask({...newTask, due_date: e.target.value})} 
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                  </div>
              </div>
              <div className="flex justify-end pt-4">
                  <button onClick={handleCreateTask} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm transition-colors">
                      Create Task
                  </button>
              </div>
          </div>
      </Modal>

      <Modal isOpen={isEditProjectModalOpen} onClose={() => setIsEditProjectModalOpen(false)} title="Edit Project Details">
           <div className="space-y-4">
              <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project Name</label>
                  <input 
                    type="text" 
                    value={editProjectForm.project_name || ''} 
                    onChange={(e) => setEditProjectForm({...editProjectForm, project_name: e.target.value})} 
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                      <select 
                        value={editProjectForm.project_status || 'planning'} 
                        onChange={(e) => setEditProjectForm({...editProjectForm, project_status: e.target.value as any})} 
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                      >
                          <option value="planning">Planning</option>
                          <option value="active">Active</option>
                          <option value="on_hold">On Hold</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Project Owner</label>
                      <select 
                        value={editProjectForm.project_owner_id || 0} 
                        onChange={(e) => setEditProjectForm({...editProjectForm, project_owner_id: parseInt(e.target.value)})} 
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                      >
                          {users.map(u => (
                              <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                      </select>
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                    <input type="date" value={editProjectForm.project_start_date || ''} onChange={(e) => setEditProjectForm({...editProjectForm, project_start_date: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                    <input type="date" value={editProjectForm.project_end_date || ''} onChange={(e) => setEditProjectForm({...editProjectForm, project_end_date: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                 </div>
              </div>
              <div className="flex justify-end pt-4">
                  <button onClick={handleSaveProject} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm transition-colors">
                      Save Changes
                  </button>
              </div>
           </div>
      </Modal>
    </div>
  );
};

export default ProjectDetailView;