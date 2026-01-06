import React, { useState } from 'react';
import Table from '../components/Table';
import { useData } from '../hooks/useData';
import { getStatusBadge } from '../constants';
import { exportToCSV } from '../utils/csvHelper';
import type { Task, User, Campaign } from '../types';

const TasksView: React.FC = () => {
    const { data: tasks, create: createTask } = useData<Task>('tasks');
    const { data: users } = useData<User>('users');
    const { data: campaigns } = useData<Campaign>('campaigns');

    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'create'>('list');

    // Form State
    const [newTask, setNewTask] = useState<Partial<Task>>({
        name: '',
        task_type: 'general',
        campaign_id: 0,
        primary_owner_id: 0,
        due_date: '',
        status: 'not_started',
        priority: 'Medium'
    });

    const filteredTasks = tasks.filter(t => {
        const taskName = t.name || (t as any).task_name || '';
        return taskName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleCreate = async () => {
        if (!newTask.campaign_id) {
            alert("Please link this task to a campaign.");
            return;
        }
        await createTask({
            ...newTask,
            task_name: newTask.name, // Send as task_name for backend compatibility
            sub_campaign: 'General',
            progress_stage: 'Not Started'
        } as any);
        setViewMode('list');
        setNewTask({ name: '', task_type: 'general', campaign_id: 0, primary_owner_id: 0, due_date: '', status: 'not_started', priority: 'Medium' });
    };

    const handleExport = () => {
        exportToCSV(filteredTasks, 'tasks_export');
    };

    const columns = [
        { header: 'Task', accessor: (item: Task) => (item as any).name || (item as any).task_name || '-', className: 'font-bold text-slate-800 text-sm' },
        {
            header: 'Campaign',
            accessor: (item: Task) => (
                <span className="text-xs text-slate-600">{campaigns.find(c => c.id === item.campaign_id)?.campaign_name || '-'}</span>
            )
        },
        {
            header: 'Assignee',
            accessor: (item: Task) => {
                const u = users.find(user => user.id === item.primary_owner_id);
                return u ? (
                    <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-slate-200 text-[9px] flex items-center justify-center mr-1.5 font-bold text-slate-600">{u.name.charAt(0)}</div>
                        <span className="text-xs">{u.name}</span>
                    </div>
                ) : <span className="text-xs text-slate-400">Unassigned</span>;
            }
        },
        { header: 'Due Date', accessor: 'due_date' as keyof Task, className: 'text-xs text-slate-500' },
        {
            header: 'Priority',
            accessor: (item: Task) => (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.priority === 'High' ? 'bg-red-50 text-red-700' :
                    item.priority === 'Medium' ? 'bg-orange-50 text-orange-700' :
                        'bg-blue-50 text-blue-700'
                    }`}>
                    {item.priority}
                </span>
            )
        },
        { header: 'Status', accessor: (item: Task) => getStatusBadge(item.status) }
    ];

    if (viewMode === 'create') {
        return (
            <div className="h-full flex flex-col w-full p-6 animate-fade-in overflow-hidden">
                <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full h-full">
                    <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-slate-50/50 w-full flex-shrink-0">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Create New Task</h2>
                            <p className="text-slate-500 text-xs mt-0.5">Assign work and set deadlines</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setViewMode('list')} className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleCreate} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-bold shadow-sm hover:bg-indigo-700 transition-all text-xs">
                                Assign Task
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 w-full">
                        <div className="w-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Task Name</label>
                                    <input
                                        type="text"
                                        value={newTask.name}
                                        onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        placeholder="e.g. Write Q3 Blog Post"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Campaign</label>
                                        <select
                                            value={newTask.campaign_id}
                                            onChange={(e) => setNewTask({ ...newTask, campaign_id: parseInt(e.target.value) })}
                                            className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                                        >
                                            <option value={0}>Select Campaign...</option>
                                            {campaigns.map(c => <option key={c.id} value={c.id}>{c.campaign_name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Task Type</label>
                                        <select
                                            value={newTask.task_type}
                                            onChange={(e) => setNewTask({ ...newTask, task_type: e.target.value })}
                                            className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                                        >
                                            <option value="general">General</option>
                                            <option value="content">Content Creation</option>
                                            <option value="seo">SEO Optimization</option>
                                            <option value="design">Graphic Design</option>
                                            <option value="dev">Web Development</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Assignee</label>
                                        <select
                                            value={newTask.primary_owner_id}
                                            onChange={(e) => setNewTask({ ...newTask, primary_owner_id: parseInt(e.target.value) })}
                                            className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                                        >
                                            <option value={0}>Unassigned</option>
                                            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                                        <select
                                            value={newTask.priority}
                                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                                            className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                                        >
                                            <option>Low</option>
                                            <option>Medium</option>
                                            <option>High</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        value={newTask.due_date}
                                        onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
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
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">All Tasks</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Centralized task management across all workflows</p>
                </div>
                <div className="flex space-x-2">
                    <button onClick={handleExport} className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg text-xs font-medium hover:bg-slate-50 shadow-sm transition-colors flex items-center">
                        <svg className="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export
                    </button>
                    <button onClick={() => setViewMode('create')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-md transition-all flex items-center">
                        <span className="mr-1 text-base">+</span> Create Task
                    </button>
                </div>
            </div>

            <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-200 flex-shrink-0 w-full mb-4">
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                        type="search"
                        className="block w-full p-2 pl-9 text-sm text-gray-900 border border-gray-300 rounded-lg bg-slate-50 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm w-full min-h-0">
                <div className="flex-1 overflow-hidden w-full h-full">
                    <Table columns={columns} data={filteredTasks} title="Task Directory" />
                </div>
            </div>
        </div>
    );
};

export default TasksView;