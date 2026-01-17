import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';
import type { Campaign, Task, Project, User } from '../types';

// Stat Card Component
const StatCard: React.FC<{
    label: string;
    value: string | number;
    icon: React.ReactNode;
    iconBg: string;
}> = ({ label, value, icon, iconBg }) => (
    <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
            {icon}
        </div>
        <div className="flex-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
            <p className="text-xl font-bold text-slate-900">{value}</p>
        </div>
    </div>
);

const DashboardView: React.FC<{ onNavigate?: (view: any, id?: any) => void }> = ({ onNavigate }) => {
    const { data: campaigns } = useData<Campaign>('campaigns');
    const { data: tasks } = useData<Task>('tasks');
    const { data: projects } = useData<Project>('projects');
    const { data: users } = useData<User>('users');

    // Calculate stats
    const activeCampaigns = campaigns.filter(c => c.campaign_status === 'active' || c.status === 'active').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const teamMembers = users.length;

    return (
        <div className="h-full w-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">Welcome back to Marketing Control Center</p>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            label="Active Campaigns"
                            value={activeCampaigns}
                            iconBg="bg-blue-100"
                            icon={
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            }
                        />
                        <StatCard
                            label="Total Projects"
                            value={projects.length}
                            iconBg="bg-purple-100"
                            icon={
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            }
                        />
                        <StatCard
                            label="Tasks Completed"
                            value={`${completedTasks}/${totalTasks}`}
                            iconBg="bg-green-100"
                            icon={
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />
                        <StatCard
                            label="Team Members"
                            value={teamMembers}
                            iconBg="bg-orange-100"
                            icon={
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            }
                        />
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Recent Projects */}
                        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200">
                            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-slate-900">Recent Projects</h3>
                                    <p className="text-xs text-slate-500 mt-1">Your active projects</p>
                                </div>
                                <button
                                    onClick={() => onNavigate && onNavigate('projects')}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                >
                                    View all →
                                </button>
                            </div>
                            <div className="p-6">
                                {projects.length > 0 ? (
                                    <div className="space-y-4">
                                        {projects.slice(0, 3).map((project) => (
                                            <div key={project.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-slate-900 text-sm">{project.name || project.project_name || `Project ${project.id}`}</h4>
                                                    <p className="text-xs text-slate-500 mt-1">{project.status || 'Active'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-medium text-slate-900">{project.progress || 0}%</div>
                                                    <div className="w-16 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                                        <div className="h-full bg-blue-500" style={{ width: `${project.progress || 0}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-slate-500 text-sm">No projects yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-lg border border-slate-200">
                            <div className="border-b border-slate-200 px-6 py-4">
                                <h3 className="font-semibold text-slate-900">Quick Stats</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Pending Tasks</span>
                                    <span className="text-lg font-bold text-slate-900">{tasks.filter(t => t.status !== 'completed').length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Completed Tasks</span>
                                    <span className="text-lg font-bold text-slate-900">{completedTasks}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Active Campaigns</span>
                                    <span className="text-lg font-bold text-slate-900">{activeCampaigns}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Team Size</span>
                                    <span className="text-lg font-bold text-slate-900">{teamMembers}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Tasks */}
                    <div className="bg-white rounded-lg border border-slate-200">
                        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-slate-900">Recent Tasks</h3>
                                <p className="text-xs text-slate-500 mt-1">Tasks that need attention</p>
                            </div>
                            <button
                                onClick={() => onNavigate && onNavigate('tasks')}
                                className="text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                                View all →
                            </button>
                        </div>
                        <div className="p-6">
                            {tasks.length > 0 ? (
                                <div className="space-y-3">
                                    {tasks.slice(0, 5).map((task) => (
                                        <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-slate-900 text-sm">{task.name || task.task_name || `Task ${task.id}`}</h4>
                                                <p className="text-xs text-slate-500 mt-1">{task.status || 'Pending'}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                                                }`}>
                                                {task.priority || 'Normal'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-slate-500 text-sm">No tasks yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
