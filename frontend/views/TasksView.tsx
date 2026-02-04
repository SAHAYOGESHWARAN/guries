import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { Task, User, Campaign, Project, Service, SubServiceItem } from '../types';

// Avatar component
const Avatar: React.FC<{ name: string; size?: 'sm' | 'md' }> = ({ name, size = 'sm' }) => {
    const initials = name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';
    const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-violet-500'];
    const bgColor = colors[(name?.length || 0) % colors.length];
    const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-sm';
    return (
        <div className={`${sizeClass} rounded-full flex items-center justify-center text-white font-bold ${bgColor}`}>
            {initials}
        </div>
    );
};

// Priority Badge
const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
    const config: Record<string, { bg: string; text: string }> = {
        'High': { bg: 'bg-red-50', text: 'text-red-700' },
        'high': { bg: 'bg-red-50', text: 'text-red-700' },
        'Medium': { bg: 'bg-amber-50', text: 'text-amber-700' },
        'medium': { bg: 'bg-amber-50', text: 'text-amber-700' },
        'Low': { bg: 'bg-blue-50', text: 'text-blue-700' },
        'low': { bg: 'bg-blue-50', text: 'text-blue-700' },
    };
    const c = config[priority] || { bg: 'bg-slate-100', text: 'text-slate-600' };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>{priority}</span>;
};

// Status Badge
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
        'pending': { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Pending' },
        'in_progress': { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'In Progress' },
        'completed': { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Completed' },
        'on_hold': { bg: 'bg-amber-50', text: 'text-amber-700', label: 'On Hold' },
        'cancelled': { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelled' },
    };
    const c = config[status?.toLowerCase()] || { bg: 'bg-slate-100', text: 'text-slate-600', label: status };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>{c.label}</span>;
};

// Progress Stage Badge
const ProgressStageBadge: React.FC<{ stage: string }> = ({ stage }) => {
    const config: Record<string, { bg: string; text: string }> = {
        'Not Started': { bg: 'bg-slate-100', text: 'text-slate-600' },
        'In Progress': { bg: 'bg-indigo-50', text: 'text-indigo-700' },
        'Review': { bg: 'bg-amber-50', text: 'text-amber-700' },
        'Completed': { bg: 'bg-emerald-50', text: 'text-emerald-700' },
    };
    const c = config[stage] || { bg: 'bg-slate-100', text: 'text-slate-600' };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>{stage || 'Not Started'}</span>;
};

// QC Stage Badge
const QcStageBadge: React.FC<{ stage: string }> = ({ stage }) => {
    const config: Record<string, { bg: string; text: string }> = {
        'Pending': { bg: 'bg-slate-100', text: 'text-slate-600' },
        'In Review': { bg: 'bg-amber-50', text: 'text-amber-700' },
        'Approved': { bg: 'bg-emerald-50', text: 'text-emerald-700' },
        'Rejected': { bg: 'bg-red-50', text: 'text-red-700' },
        'Rework': { bg: 'bg-orange-50', text: 'text-orange-700' },
    };
    const c = config[stage] || { bg: 'bg-slate-100', text: 'text-slate-600' };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>{stage || 'Pending'}</span>;
};

// Campaign Type Tag
const CampaignTypeTag: React.FC<{ type: string }> = ({ type }) => {
    const colors: Record<string, string> = {
        'SEO': 'bg-emerald-100 text-emerald-700',
        'Content': 'bg-indigo-100 text-indigo-700',
        'SMM': 'bg-pink-100 text-pink-700',
        'Web': 'bg-cyan-100 text-cyan-700',
        'Backlink': 'bg-violet-100 text-violet-700',
    };
    const colorClass = colors[type] || 'bg-slate-100 text-slate-600';
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>{type || '-'}</span>;
};

const TasksView: React.FC = () => {
    const { data: tasks, create: createTask, refresh } = useData<Task>('tasks');
    const { data: users } = useData<User>('users');
    const { data: campaigns } = useData<Campaign>('campaigns');
    const { data: projects } = useData<Project>('projects');
    const { data: services = [] } = useData<Service>('services');

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');

    const filteredTasks = tasks.filter(task => {
        const taskName = task.name || task.task_name || '';
        const matchesSearch = taskName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || task.status?.toLowerCase() === statusFilter.toLowerCase();
        const matchesPriority = priorityFilter === 'all' || task.priority?.toLowerCase() === priorityFilter.toLowerCase();
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const handleExport = () => {
        exportToCSV(filteredTasks, 'tasks_export');
    };

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

    return (
        <div className="h-full flex flex-col w-full p-6 overflow-hidden bg-slate-50">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage and track all tasks across projects and campaigns.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-white"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 relative">
                    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        placeholder="Search tasks..."
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                </select>
                <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="all">All Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
            </div>

            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto h-full">
                    <table className="w-full min-w-[1400px]">
                        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Task Title</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Project</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Campaign Type</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Sub-Campaign</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Assignee</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Priority</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Due Date</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Progress Stage</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">QC Stage</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Reworks</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Repo Links</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredTasks.length === 0 ? (
                                <tr>
                                    <td colSpan={13} className="px-4 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center">
                                            <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            <p className="text-sm font-medium">No tasks found</p>
                                            <p className="text-xs text-slate-400 mt-1">Create a new task to get started</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTasks.map((task) => {
                                    const assignee = users.find(u => u.id === task.assigned_to);
                                    const project = projects.find(p => p.id === task.project_id);
                                    return (
                                        <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900 text-sm">{task.name || task.task_name || '-'}</div>
                                                {task.description && (
                                                    <div className="text-xs text-slate-500 truncate max-w-[200px]">{task.description}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">
                                                {task.project_name || project?.project_name || project?.name || '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <CampaignTypeTag type={task.campaign_type || ''} />
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{task.sub_campaign || '-'}</td>
                                            <td className="px-4 py-3">
                                                {assignee ? (
                                                    <div className="flex items-center gap-2">
                                                        <Avatar name={assignee.name} />
                                                        <span className="text-sm text-slate-700">{task.assignee_name || assignee.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-slate-400">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3"><PriorityBadge priority={task.priority || 'Medium'} /></td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{formatDate(task.due_date)}</td>
                                            <td className="px-4 py-3"><ProgressStageBadge stage={task.progress_stage || ''} /></td>
                                            <td className="px-4 py-3"><QcStageBadge stage={task.qc_stage || ''} /></td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{task.rework_count || 0}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{task.repo_link_count || 0}</td>
                                            <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-red-600">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TasksView;