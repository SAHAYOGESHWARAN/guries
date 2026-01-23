import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';
import type { Campaign, Task, Project, User } from '../types';

// Stat Card Component with Trend
const StatCard: React.FC<{
    label: string;
    value: string | number;
    trend?: string;
    trendType?: 'up' | 'down' | 'neutral';
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
}> = ({ label, value, trend, trendType = 'neutral', icon, iconBg, iconColor }) => (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
            <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBg}`}>
                <span className="text-xl">{icon}</span>
            </div>
        </div>
        {trend && (
            <p className={`text-xs font-medium ${trendType === 'up' ? 'text-green-600' :
                    trendType === 'down' ? 'text-red-600' :
                        'text-slate-600'
                }`}>
                {trend}
            </p>
        )}
    </div>
);

const DashboardView: React.FC<{ onNavigate?: (view: any, id?: any) => void }> = ({ onNavigate }) => {
    const { data: campaigns } = useData<Campaign>('campaigns');
    const { data: tasks } = useData<Task>('tasks');
    const { data: projects } = useData<Project>('projects');
    const { data: users } = useData<User>('users');

    // Demo data for consistent display
    const demoStats = {
        activeCampaigns: 24,
        contentPublished: 156,
        tasksCompleted: 89,
        teamMembers: 12
    };

    const demoProjects = [
        {
            id: 1,
            name: 'Q4 Marketing Campaign',
            status: 'In Progress',
            progress: 65,
            dueDate: 'Dec 15, 2024',
            team: ['JD', 'SM', 'MJ']
        },
        {
            id: 2,
            name: 'Product Launch Strategy',
            status: 'QC Pending',
            progress: 85,
            dueDate: 'Dec 20, 2024',
            team: ['EW', 'JD']
        },
        {
            id: 3,
            name: 'SEO Content Optimization',
            status: 'QC Passed',
            progress: 100,
            dueDate: 'Dec 10, 2024',
            team: ['SM', 'AB', 'CD']
        },
        {
            id: 4,
            name: 'Social Media Calendar',
            status: 'Draft',
            progress: 25,
            dueDate: 'Dec 25, 2024',
            team: ['MJ', 'EW']
        }
    ];

    const demoTasks = [
        {
            id: 1,
            title: 'Review campaign metrics',
            priority: 'high',
            dueTime: '2 hours'
        },
        {
            id: 2,
            title: 'Content approval needed',
            priority: 'high',
            dueTime: '4 hours'
        },
        {
            id: 3,
            title: 'Update keyword research',
            priority: 'medium',
            dueTime: '1 day'
        },
        {
            id: 4,
            title: 'Team sync meeting',
            priority: 'low',
            dueTime: '2 days'
        }
    ];

    const demoActivity = [
        {
            id: 1,
            user: 'Jane Smith',
            action: 'completed QC review for',
            target: 'SEO Content Optimization',
            time: '10 minutes ago'
        },
        {
            id: 2,
            user: 'Mike Johnson',
            action: 'created new campaign',
            target: 'Holiday Season Promo',
            time: '1 hour ago'
        }
    ];

    return (
        <div className="h-full w-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">Search campaigns, tasks, content...</p>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            label="Active Campaigns"
                            value={demoStats.activeCampaigns}
                            trend="+12% from last month"
                            trendType="up"
                            iconBg="bg-blue-100"
                            iconColor="text-blue-600"
                            icon="🎯"
                        />
                        <StatCard
                            label="Content Published"
                            value={demoStats.contentPublished}
                            trend="+8% from last month"
                            trendType="up"
                            iconBg="bg-green-100"
                            iconColor="text-green-600"
                            icon="📋"
                        />
                        <StatCard
                            label="Tasks Completed"
                            value={demoStats.tasksCompleted}
                            trend="-3% from last month"
                            trendType="down"
                            iconBg="bg-purple-100"
                            iconColor="text-purple-600"
                            icon="✓"
                        />
                        <StatCard
                            label="Team Members"
                            value={demoStats.teamMembers}
                            trend="+2 this month"
                            trendType="up"
                            iconBg="bg-orange-100"
                            iconColor="text-orange-600"
                            icon="👥"
                        />
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Recent Projects */}
                        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                            <div className="border-b border-slate-200 px-8 py-6 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Recent Projects</h3>
                                    <p className="text-xs text-slate-500 mt-1">Track your ongoing initiatives</p>
                                </div>
                                <button
                                    onClick={() => onNavigate && onNavigate('projects')}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    View all →
                                </button>
                            </div>
                            <div className="p-8 space-y-6">
                                {demoProjects.map((project) => (
                                    <div key={project.id} className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${project.status === 'In Progress' ? 'bg-blue-500' :
                                                            project.status === 'QC Pending' ? 'bg-yellow-500' :
                                                                project.status === 'QC Passed' ? 'bg-green-500' :
                                                                    'bg-slate-400'
                                                        }`}></span>
                                                    <h4 className="font-semibold text-slate-900">{project.name}</h4>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">{project.status}</p>
                                            </div>
                                            <span className="text-sm font-bold text-slate-900">{project.progress}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${project.progress === 100 ? 'bg-green-500' :
                                                        project.progress >= 80 ? 'bg-blue-500' :
                                                            'bg-blue-400'
                                                    }`}
                                                style={{ width: `${project.progress}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {project.team.map((member, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center"
                                                    >
                                                        {member}
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                🕐 {project.dueDate}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upcoming Tasks */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                            <div className="border-b border-slate-200 px-8 py-6">
                                <h3 className="text-lg font-bold text-slate-900">Upcoming Tasks</h3>
                                <p className="text-xs text-slate-500 mt-1">What needs attention</p>
                            </div>
                            <div className="p-8 space-y-4">
                                {demoTasks.map((task) => (
                                    <div key={task.id} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-900">{task.title}</p>
                                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                    🕐 {task.dueTime}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                    task.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-green-100 text-green-700'
                                                }`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="border-b border-slate-200 px-8 py-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
                                <p className="text-xs text-slate-500 mt-1">Latest updates from your team</p>
                            </div>
                            <button
                                onClick={() => onNavigate && onNavigate('tasks')}
                                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                View all →
                            </button>
                        </div>
                        <div className="p-8 space-y-4">
                            {demoActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                                        {activity.user.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-900">
                                            <span className="font-semibold">{activity.user}</span>
                                            {' '}{activity.action}{' '}
                                            <span className="font-semibold">{activity.target}</span>
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
