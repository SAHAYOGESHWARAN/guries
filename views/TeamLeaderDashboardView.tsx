
import React from 'react';
import { useData } from '../hooks/useData';
import { ChartCard, BarChart, DonutChart } from '../components/Charts';
import type { Task } from '../types';

const TeamLeaderDashboardView: React.FC = () => {
    const { data: tasks } = useData<Task>('tasks');
    
    // Calculate simple distribution from real task data
    const taskDist = [
        { id: 1, name: 'Content', value: tasks.filter(t => t.task_type === 'content').length },
        { id: 2, name: 'SEO', value: tasks.filter(t => t.task_type === 'seo').length },
        { id: 3, name: 'Design', value: tasks.filter(t => t.task_type === 'design').length }
    ];

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const velocity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <div className="space-y-6 h-full flex flex-col w-full p-6 animate-fade-in overflow-y-auto">
            <div className="flex justify-between items-start flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Team Leader Dashboard</h1>
                    <p className="text-slate-500 mt-1">Overview of team performance based on active tasks.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                    <h3 className="text-slate-500 font-bold text-sm uppercase mb-2">Completion Rate</h3>
                    <p className="text-5xl font-bold text-indigo-600">{velocity}%</p>
                    <p className="text-xs text-slate-400 mt-2">Based on {totalTasks} total tasks</p>
                </div>
                <ChartCard title="Task Distribution">
                    {totalTasks > 0 ? <BarChart data={taskDist} color="bg-blue-500" /> : <p className="text-center pt-8 text-slate-400">No tasks assigned.</p>}
                </ChartCard>
                <ChartCard title="Status Breakdown">
                    <DonutChart value={velocity} color="text-emerald-500" label="Completed" />
                </ChartCard>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4">Active Sprints</h3>
                <p className="text-sm text-slate-500 italic text-center py-4">Sprint configuration not yet initialized.</p>
            </div>
        </div>
    );
};

export default TeamLeaderDashboardView;
