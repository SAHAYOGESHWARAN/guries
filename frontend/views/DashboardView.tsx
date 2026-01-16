import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';
import type { Campaign, Task, Project, User } from '../types';

// Stat Card Component
const StatCard: React.FC<{
    label: string;
    value: string | number;
    trend?: string;
    trendUp?: boolean;
    icon: React.ReactNode;
    iconBg: string;
}> = ({ label, value, trend, trendUp, icon, iconBg }) => (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
            {icon}
        </div>
        <div className="flex-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {trend && (
                <p className={`text-xs font-medium ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {trend}
                </p>
            )}
        </div>
    </div>
);

// Avatar Component
const Avatar: React.FC<{ initials: string; color: string }> = ({ initials, color }) => (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${color} border-2 border-white -ml-2 first:ml-0`}>
        {initials}
    </div>
);

// Project Card Component
const ProjectCard: React.FC<{
    name: string;
    status: string;
    statusColor: string;
    progress: number;
    team: { initials: string; color: string }[];
    dueDate: string;
    isExpanded?: boolean;
    onToggle?: () => void;
}> = ({ name, status, statusColor, progress, team, dueDate, isExpanded, onToggle }) => (
    <div className="border-b border-slate-100 last:border-0 py-3">
        <div className="flex items-start gap-2 cursor-pointer" onClick={onToggle}>
            <button className="text-slate-400 hover:text-slate-600 mt-1">
                <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
            <div className="flex-1">
                <h4 className="font-semibold text-slate-900 text-sm">{name}</h4>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${statusColor}`}></span>
                    <span className="text-xs text-slate-600">{status}</span>
                </div>
                <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-500">Progress</span>
                        <span className="text-xs font-medium text-slate-700">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center">
                        {team.map((member, i) => (
                            <Avatar key={i} initials={member.initials} color={member.color} />
                        ))}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {dueDate}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// Task Item Component
const TaskItem: React.FC<{
    title: string;
    timeLeft: string;
    priority: 'high' | 'medium' | 'low';
}> = ({ title, timeLeft, priority }) => {
    const priorityColors = {
        high: 'text-rose-600',
        medium: 'text-amber-600',
        low: 'text-slate-500'
    };

    return (
        <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
            <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-900">{title}</h4>
                <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {timeLeft}
                </div>
            </div>
            <span className={`text-xs font-medium ${priorityColors[priority]}`}>
                {priority}
            </span>
        </div>
    );
};

// Activity Item Component
const ActivityItem: React.FC<{
    user: string;
    action: string;
    target: string;
    time: string;
    dotColor: string;
}> = ({ user, action, target, time, dotColor }) => (
    <div className="flex items-start gap-3 py-2">
        <span className={`w-2 h-2 rounded-full mt-2 ${dotColor}`}></span>
        <div>
            <p className="text-sm text-slate-700">
                <span className="font-semibold text-slate-900">{user}</span>
                {' '}{action}{' '}
                <span className="font-semibold text-slate-900">{target}</span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{time}</p>
        </div>
    </div>
);

const DashboardView: React.FC<{ onNavigate?: (view: any, id?: any) => void }> = ({ onNavigate }) => {
    const { data: campaigns } = useData<Campaign>('campaigns');
    const { data: tasks } = useData<Task>('tasks');
    const { data: projects } = useData<Project>('projects');
    const { data: users } = useData<User>('users');

    const [expandedProject, setExpandedProject] = useState<number | null>(0);

    // Calculate stats
    const activeCampaigns = campaigns.filter(c => c.campaign_status === 'active' || c.status === 'active').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const teamMembers = users.length;

    // Generate team avatars
    const getTeamAvatars = (count: number = 3) => {
        const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
        const initials = ['JD', 'SM', 'MJ', 'EW', 'AB', 'CD'];
        return Array.from({ length: Math.min(count, 3) }, (_, i) => ({
            initials: initials[i % initials.length],
            color: colors[i % colors.length]
        }));
    };

    // Format date
    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return 'No date';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Get status info
    const getStatusInfo = (status: string) => {
        const statusMap: Record<string, { label: string; color: string }> = {
            'active': { label: 'In Progress', color: 'bg-indigo-500' },
            'in_progress': { label: 'In Progress', color: 'bg-indigo-500' },
            'pending': { label: 'QC Pending', color: 'bg-amber-500' },
            'completed': { label: 'QC Passed', color: 'bg-emerald-500' },
            'draft': { label: 'Draft', color: 'bg-slate-400' },
            'on_hold': { label: 'On Hold', color: 'bg-rose-500' }
        };
        return statusMap[status?.toLowerCase()] || { label: status || 'Draft', color: 'bg-slate-400' };
    };

    // Get priority
    const getPriority = (task: Task): 'high' | 'medium' | 'low' => {
        if (task.priority === 'high' || task.priority === 'urgent') return 'high';
        if (task.priority === 'medium') return 'medium';
        return 'low';
    };

    // Get time left
    const getTimeLeft = (dueDate: string | null | undefined) => {
        if (!dueDate) return 'No deadline';
        const now = new Date();
        const due = new Date(dueDate);
        const diffMs = due.getTime() - now.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 0) return 'Overdue';
        if (diffHours < 24) return `${diffHours} hours`;
        return `${diffDays} days`;
    };

    // Sample recent activities
    const recentActivities = [
        { user: 'Jane Smith', action: 'completed QC review for', target: 'SEO Content Optimization', time: '10 minutes ago', dotColor: 'bg-emerald-500' },
        { user: 'Mike Johnson', action: 'created new campaign', target: 'Holiday Season Promo', time: '1 hour ago', dotColor: 'bg-indigo-500' },
        { user: 'Sarah Wilson', action: 'updated task', target: 'Content Review', time: '2 hours ago', dotColor: 'bg-amber-500' },
        { user: 'Alex Chen', action: 'published asset', target: 'Brand Guidelines v2', time: '3 hours ago', dotColor: 'bg-cyan-500' }
    ];

    return (
        <div className="h-full w-full flex flex-col overflow-hidden bg-slate-50">
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            label="ACTIVE CAMPAIGNS"
                            value={activeCampaigns || 24}
                            trend="+12% from last month"
                            trendUp={true}
                            iconBg="bg-amber-100"
                            icon={
                                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                </svg>
                            }
                        />
                        <StatCard
                            label="CONTENT PUBLISHED"
                            value={156}
                            trend="+8% from last month"
                            trendUp={true}
                            iconBg="bg-indigo-100"
                            icon={
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            }
                        />
                        <StatCard
                            label="TASKS COMPLETED"
                            value={completedTasks || 89}
                            trend="-3% from last month"
                            trendUp={false}
                            iconBg="bg-slate-100"
                            icon={
                                <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            }
                        />
                        <StatCard
                            label="TEAM MEMBERS"
                            value={teamMembers || 12}
                            trend="+2 this month"
                            trendUp={true}
                            iconBg="bg-emerald-100"
                            icon={
                                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            }
                        />
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Recent Projects */}
                        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Recent Projects</h3>
                                    <p className="text-sm text-slate-500">Track your ongoing initiatives</p>
                                </div>
                                <button
                                    onClick={() => onNavigate && onNavigate('projects')}
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                >
                                    View all
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-1">
                                {projects.length > 0 ? (
                                    projects.slice(0, 4).map((project, index) => {
                                        const statusInfo = getStatusInfo(project.status);
                                        return (
                                            <ProjectCard
                                                key={project.id}
                                                name={project.name || project.project_name || `Project ${project.id}`}
                                                status={statusInfo.label}
                                                statusColor={statusInfo.color}
                                                progress={project.progress || Math.floor(Math.random() * 60) + 25}
                                                team={getTeamAvatars(3)}
                                                dueDate={formatDate(project.end_date || project.due_date)}
                                                isExpanded={expandedProject === index}
                                                onToggle={() => setExpandedProject(expandedProject === index ? null : index)}
                                            />
                                        );
                                    })
                                ) : (
                                    // Sample projects when no data
                                    <>
                                        <ProjectCard
                                            name="Q4 Marketing Campaign"
                                            status="In Progress"
                                            statusColor="bg-indigo-500"
                                            progress={65}
                                            team={[
                                                { initials: 'JD', color: 'bg-indigo-500' },
                                                { initials: 'SM', color: 'bg-emerald-500' },
                                                { initials: 'MJ', color: 'bg-amber-500' }
                                            ]}
                                            dueDate="Dec 15, 2024"
                                            isExpanded={expandedProject === 0}
                                            onToggle={() => setExpandedProject(expandedProject === 0 ? null : 0)}
                                        />
                                        <ProjectCard
                                            name="Product Launch Strategy"
                                            status="QC Pending"
                                            statusColor="bg-amber-500"
                                            progress={85}
                                            team={[
                                                { initials: 'EW', color: 'bg-rose-500' },
                                                { initials: 'JD', color: 'bg-indigo-500' }
                                            ]}
                                            dueDate="Dec 20, 2024"
                                            isExpanded={expandedProject === 1}
                                            onToggle={() => setExpandedProject(expandedProject === 1 ? null : 1)}
                                        />
                                        <ProjectCard
                                            name="SEO Content Optimization"
                                            status="QC Passed"
                                            statusColor="bg-emerald-500"
                                            progress={100}
                                            team={[
                                                { initials: 'SM', color: 'bg-emerald-500' },
                                                { initials: 'AB', color: 'bg-cyan-500' },
                                                { initials: 'CD', color: 'bg-violet-500' }
                                            ]}
                                            dueDate="Dec 10, 2024"
                                            isExpanded={expandedProject === 2}
                                            onToggle={() => setExpandedProject(expandedProject === 2 ? null : 2)}
                                        />
                                        <ProjectCard
                                            name="Social Media Calendar"
                                            status="Draft"
                                            statusColor="bg-slate-400"
                                            progress={25}
                                            team={[
                                                { initials: 'MJ', color: 'bg-amber-500' },
                                                { initials: 'EW', color: 'bg-rose-500' }
                                            ]}
                                            dueDate="Dec 25, 2024"
                                            isExpanded={expandedProject === 3}
                                            onToggle={() => setExpandedProject(expandedProject === 3 ? null : 3)}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Upcoming Tasks */}
                        <div className="bg-white rounded-xl border border-slate-200 p-5">
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-slate-900">Upcoming Tasks</h3>
                                <p className="text-sm text-slate-500">What needs attention</p>
                            </div>

                            <div>
                                {tasks.length > 0 ? (
                                    tasks
                                        .filter(t => t.status !== 'completed')
                                        .slice(0, 4)
                                        .map((task) => (
                                            <TaskItem
                                                key={task.id}
                                                title={task.name || task.task_name || `Task ${task.id}`}
                                                timeLeft={getTimeLeft(task.due_date)}
                                                priority={getPriority(task)}
                                            />
                                        ))
                                ) : (
                                    // Sample tasks when no data
                                    <>
                                        <TaskItem title="Review campaign metrics" timeLeft="2 hours" priority="high" />
                                        <TaskItem title="Content approval needed" timeLeft="4 hours" priority="high" />
                                        <TaskItem title="Update keyword research" timeLeft="1 day" priority="medium" />
                                        <TaskItem title="Team sync meeting" timeLeft="2 days" priority="low" />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
                                <p className="text-sm text-slate-500">Latest updates from your team</p>
                            </div>
                            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                                View all
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-1">
                            {recentActivities.map((activity, index) => (
                                <ActivityItem
                                    key={index}
                                    user={activity.user}
                                    action={activity.action}
                                    target={activity.target}
                                    time={activity.time}
                                    dotColor={activity.dotColor}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
