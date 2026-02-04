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
    const [stats, setStats] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [activity, setActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch dashboard data from backend
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const apiUrl = import.meta.env.VITE_API_URL || 'https://guries.vercel.app/api/v1';

                // Fetch stats
                const statsRes = await fetch(`${apiUrl}/dashboard/stats`);
                const statsData = await statsRes.json();
                setStats(statsData);

                // Fetch projects
                const projectsRes = await fetch(`${apiUrl}/projects`);
                const projectsData = await projectsRes.json();
                setProjects(Array.isArray(projectsData) ? projectsData.slice(0, 4) : []);

                // Fetch tasks
                const tasksRes = await fetch(`${apiUrl}/tasks`);
                const tasksData = await tasksRes.json();
                setTasks(Array.isArray(tasksData) ? tasksData.slice(0, 4) : []);

                // Fetch activity (mock data for now)
                setActivity([
                    { id: 1, action: 'Asset created', user: 'John Designer', time: '2 hours ago' },
                    { id: 2, action: 'QC review completed', user: 'Sarah Writer', time: '4 hours ago' }
                ]);
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error('Error fetching dashboard data:', error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();

        // Refresh data every 30 seconds
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const getTrendType = (percent: number): 'up' | 'down' | 'neutral' => {
        if (percent > 0) return 'up';
        if (percent < 0) return 'down';
        return 'neutral';
    };

    const formatTrendText = (percent: number) => {
        if (percent > 0) return `+${percent}% from last month`;
        if (percent < 0) return `${percent}% from last month`;
        return 'No change from last month';
    };

    const getStatusColor = (status: string) => {
        const statusLower = (status || '').toLowerCase();
        if (statusLower.includes('progress') || statusLower === 'in progress') return 'bg-blue-500';
        if (statusLower.includes('pending') || statusLower.includes('qc')) return 'bg-yellow-500';
        if (statusLower.includes('passed') || statusLower.includes('completed')) return 'bg-green-500';
        if (statusLower === 'draft') return 'bg-slate-400';
        return 'bg-slate-400';
    };

    const getPriorityColor = (priority: string) => {
        const priorityLower = (priority || '').toLowerCase();
        if (priorityLower === 'high') return 'bg-red-100 text-red-700';
        if (priorityLower === 'medium') return 'bg-orange-100 text-orange-700';
        return 'bg-green-100 text-green-700';
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-slate-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

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
                            value={stats?.activeCampaigns || 0}
                            trend={formatTrendText(stats?.campaignsTrendPercent || 0)}
                            trendType={getTrendType(stats?.campaignsTrendPercent || 0)}
                            iconBg="bg-blue-100"
                            iconColor="text-blue-600"
                            icon="🎯"
                        />
                        <StatCard
                            label="Content Published"
                            value={stats?.contentPublished || 0}
                            trend={formatTrendText(stats?.contentTrendPercent || 0)}
                            trendType={getTrendType(stats?.contentTrendPercent || 0)}
                            iconBg="bg-green-100"
                            iconColor="text-green-600"
                            icon="📋"
                        />
                        <StatCard
                            label="Tasks Completed"
                            value={stats?.tasksCompleted || 0}
                            trend={formatTrendText(stats?.tasksTrendPercent || 0)}
                            trendType={getTrendType(stats?.tasksTrendPercent || 0)}
                            iconBg="bg-purple-100"
                            iconColor="text-purple-600"
                            icon="✓"
                        />
                        <StatCard
                            label="Team Members"
                            value={stats?.teamMembers || 0}
                            trend="Active team"
                            trendType="neutral"
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
                                {projects.length > 0 ? (
                                    projects.map((project) => (
                                        <div key={project.id} className="space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`}></span>
                                                        <h4 className="font-semibold text-slate-900">{project.name || project.project_name || `Project ${project.id}`}</h4>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1">{project.status || 'Active'}</p>
                                                </div>
                                                <span className="text-sm font-bold text-slate-900">{project.progress || 0}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${(project.progress || 0) === 100 ? 'bg-green-500' :
                                                        (project.progress || 0) >= 80 ? 'bg-blue-500' :
                                                            'bg-blue-400'
                                                        }`}
                                                    style={{ width: `${project.progress || 0}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                                                        P
                                                    </div>
                                                </div>
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    🕐 {formatDate(project.updated_at)}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-slate-500 text-sm">No projects yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upcoming Tasks */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                            <div className="border-b border-slate-200 px-8 py-6">
                                <h3 className="text-lg font-bold text-slate-900">Upcoming Tasks</h3>
                                <p className="text-xs text-slate-500 mt-1">What needs attention</p>
                            </div>
                            <div className="p-8 space-y-4">
                                {tasks.length > 0 ? (
                                    tasks.map((task) => (
                                        <div key={task.id} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-slate-900">{task.name || task.task_name || `Task ${task.id}`}</p>
                                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                        🕐 {formatDate(task.due_date || task.updated_at)}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${getPriorityColor(task.priority)}`}>
                                                    {task.priority || 'normal'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-slate-500 text-sm">No tasks yet</p>
                                    </div>
                                )}
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
                            {activity.length > 0 ? (
                                activity.map((item) => (
                                    <div key={item.id} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                                            {(item.user_name || 'U').split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-900">
                                                <span className="font-semibold">{item.user_name || 'User'}</span>
                                                {' '}{item.action}{' '}
                                                <span className="font-semibold">{item.target || 'item'}</span>
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">{formatDate(item.timestamp)}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-slate-500 text-sm">No recent activity</p>
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
