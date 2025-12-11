import React, { useState, useEffect } from 'react';
import { Users, Activity, Clock, AlertTriangle, CheckCircle, TrendingUp, BarChart3, Calendar, Target } from 'lucide-react';

interface TeamLeaderDashboardProps {
    onNavigate?: (view: string, id?: string) => void;
}

const TeamLeaderDashboard: React.FC<TeamLeaderDashboardProps> = ({ onNavigate }) => {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        teamId: 'all',
        timeRange: 'monthly'
    });

    useEffect(() => {
        fetchDashboardData();
    }, [filters]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`/api/v1/dashboards/team-leader?${queryParams}`);
            const result = await response.json();
            if (result.success) {
                setDashboardData(result.data);
            }
        } catch (error) {
            console.error('Error fetching team leader dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskReassignment = async (taskId: string, fromEmployeeId: string, toEmployeeId: string) => {
        try {
            const response = await fetch('/api/v1/dashboards/team-leader/task-assignment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taskId,
                    fromEmployeeId,
                    toEmployeeId,
                    reason: 'Workload balancing'
                })
            });
            if (response.ok) {
                fetchDashboardData(); // Refresh data
            }
        } catch (error) {
            console.error('Error reassigning task:', error);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const { teamSummary, workloadDistribution, teamCapacity, campaignOverview, taskDistribution, performanceTrends, teamAlerts, allocationSuggestions, skillsMatrix } = dashboardData || {};

    const getUtilizationColor = (utilization: number) => {
        if (utilization >= 100) return 'text-red-600 bg-red-100';
        if (utilization >= 85) return 'text-amber-600 bg-amber-100';
        if (utilization >= 60) return 'text-emerald-600 bg-emerald-100';
        return 'text-blue-600 bg-blue-100';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'overloaded': return 'bg-red-500';
            case 'balanced': return 'bg-emerald-500';
            case 'underutilized': return 'bg-blue-500';
            default: return 'bg-slate-400';
        }
    };

    return (
        <div className="h-full w-full flex flex-col overflow-hidden bg-slate-50">
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-300">
                <div className="w-full space-y-6">

                    {/* Header & Filters */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                    👨‍💼 Team Leader Dashboard
                                </h1>
                                <p className="text-sm text-slate-600 mt-1">Team management and capacity planning</p>
                            </div>
                        </div>

                        {/* Filters Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select
                                value={filters.teamId}
                                onChange={(e) => setFilters(prev => ({ ...prev, teamId: e.target.value }))}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Teams</option>
                                <option value="content">Content Team</option>
                                <option value="seo">SEO Team</option>
                                <option value="tech">Tech Team</option>
                                <option value="marketing">Marketing Team</option>
                            </select>

                            <select
                                value={filters.timeRange}
                                onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                            </select>
                        </div>
                    </div>

                    {/* Team Summary Metrics */}
                    {teamSummary && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Team Effort</h3>
                                    <Activity className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-2xl font-bold text-slate-900">{teamSummary.teamEffortScore.value}%</div>
                                    <div className={`flex items-center gap-1 text-xs font-medium ${teamSummary.teamEffortScore.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        <TrendingUp className={`w-3 h-3 ${teamSummary.teamEffortScore.trend === 'down' ? 'rotate-180' : ''}`} />
                                        {teamSummary.teamEffortScore.change}
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 mb-1">Target: {teamSummary.teamEffortScore.target}%</div>
                                <div className="text-xs text-emerald-600 font-medium">Above Target</div>
                                <div className="text-xs text-slate-400 mt-1">
                                    Updated: {new Date(teamSummary.teamEffortScore.lastUpdated).toLocaleTimeString()}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Performance</h3>
                                    <Target className="w-4 h-4 text-purple-500" />
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-2xl font-bold text-slate-900">{teamSummary.teamPerformanceScore.value}%</div>
                                    <div className={`flex items-center gap-1 text-xs font-medium ${teamSummary.teamPerformanceScore.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        <TrendingUp className={`w-3 h-3 ${teamSummary.teamPerformanceScore.trend === 'down' ? 'rotate-180' : ''}`} />
                                        {teamSummary.teamPerformanceScore.change}
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 mb-1">Target: {teamSummary.teamPerformanceScore.target}%</div>
                                <div className="text-xs text-emerald-600 font-medium">Good</div>
                                <div className="text-xs text-slate-400 mt-1">
                                    Updated: {new Date(teamSummary.teamPerformanceScore.lastUpdated).toLocaleTimeString()}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Open Tasks</h3>
                                    <Clock className="w-4 h-4 text-amber-500" />
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-2xl font-bold text-slate-900">{teamSummary.openTasks.value}</div>
                                    <div className={`flex items-center gap-1 text-xs font-medium ${teamSummary.openTasks.trend === 'stable' ? 'text-blue-600' : teamSummary.openTasks.trend === 'up' ? 'text-red-600' : 'text-emerald-600'}`}>
                                        <TrendingUp className={`w-3 h-3 ${teamSummary.openTasks.trend === 'down' ? 'rotate-180' : teamSummary.openTasks.trend === 'stable' ? 'rotate-90' : ''}`} />
                                        {teamSummary.openTasks.change}
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 mb-1">H:{teamSummary.openTasks.priority.high} M:{teamSummary.openTasks.priority.medium} L:{teamSummary.openTasks.priority.low}</div>
                                <div className="text-xs text-slate-600 font-medium">Active</div>
                                <div className="text-xs text-slate-400 mt-1">
                                    Updated: {new Date(teamSummary.openTasks.lastUpdated).toLocaleTimeString()}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Overdue</h3>
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-2xl font-bold text-slate-900">{teamSummary.overdueTasks.value}</div>
                                    <div className={`flex items-center gap-1 text-xs font-medium ${teamSummary.overdueTasks.trend === 'up' ? 'text-red-600' : 'text-emerald-600'}`}>
                                        <TrendingUp className={`w-3 h-3 ${teamSummary.overdueTasks.trend === 'down' ? 'rotate-180' : ''}`} />
                                        {teamSummary.overdueTasks.change}
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 mb-1">Target: {teamSummary.overdueTasks.target}</div>
                                <div className="text-xs text-red-600 font-medium">Needs Attention</div>
                                <div className="text-xs text-slate-400 mt-1">
                                    Updated: {new Date(teamSummary.overdueTasks.lastUpdated).toLocaleTimeString()}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">QC Rejections</h3>
                                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-2xl font-bold text-slate-900">{teamSummary.qcRejections.value}</div>
                                    <div className={`flex items-center gap-1 text-xs font-medium ${teamSummary.qcRejections.trend === 'down' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        <TrendingUp className={`w-3 h-3 ${teamSummary.qcRejections.trend === 'down' ? 'rotate-180' : ''}`} />
                                        {teamSummary.qcRejections.change}
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 mb-1">Target: ≤{teamSummary.qcRejections.target}</div>
                                <div className="text-xs text-emerald-600 font-medium">Improving</div>
                                <div className="text-xs text-slate-400 mt-1">
                                    Updated: {new Date(teamSummary.qcRejections.lastUpdated).toLocaleTimeString()}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Pending Approvals</h3>
                                    <CheckCircle className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-2xl font-bold text-slate-900">{teamSummary.pendingApprovals.value}</div>
                                    <div className={`flex items-center gap-1 text-xs font-medium ${teamSummary.pendingApprovals.trend === 'stable' ? 'text-blue-600' : teamSummary.pendingApprovals.trend === 'up' ? 'text-red-600' : 'text-emerald-600'}`}>
                                        <TrendingUp className={`w-3 h-3 ${teamSummary.pendingApprovals.trend === 'down' ? 'rotate-180' : teamSummary.pendingApprovals.trend === 'stable' ? 'rotate-90' : ''}`} />
                                        {teamSummary.pendingApprovals.change}
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 mb-1">Avg Wait: {teamSummary.pendingApprovals.avgWaitTime}</div>
                                <div className="text-xs text-blue-600 font-medium">Normal</div>
                                <div className="text-xs text-slate-400 mt-1">
                                    Updated: {new Date(teamSummary.pendingApprovals.lastUpdated).toLocaleTimeString()}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Team Size</h3>
                                    <Users className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div className="text-2xl font-bold text-slate-900 mb-1">{teamSummary.teamSize.value}</div>
                                <div className="text-xs text-slate-500 mb-1">Active: {teamSummary.teamSize.active} | On Leave: {teamSummary.teamSize.onLeave}</div>
                                <div className="text-xs text-slate-600 font-medium">Utilization: {teamSummary.teamSize.utilizationRate}%</div>
                                <div className="text-xs text-slate-400 mt-1">
                                    Updated: {new Date(teamSummary.teamSize.lastUpdated).toLocaleTimeString()}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Active Projects</h3>
                                    <BarChart3 className="w-4 h-4 text-purple-500" />
                                </div>
                                <div className="text-2xl font-bold text-slate-900 mb-1">{teamSummary.activeProjects.value}</div>
                                <div className="text-xs text-slate-500 mb-1">On Track: {teamSummary.activeProjects.onTrack} | At Risk: {teamSummary.activeProjects.atRisk}</div>
                                <div className="text-xs text-purple-600 font-medium">Completion: {teamSummary.activeProjects.completionRate}%</div>
                                <div className="text-xs text-slate-400 mt-1">
                                    Updated: {new Date(teamSummary.activeProjects.lastUpdated).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Workload Distribution & Team Capacity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Workload Distribution */}
                        {workloadDistribution && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Workload Distribution</h2>
                                <div className="space-y-4">
                                    {workloadDistribution.map((employee: any) => (
                                        <div key={employee.employeeId} className="border border-slate-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-semibold text-slate-900">{employee.name}</h3>
                                                    <p className="text-sm text-slate-600">{employee.role}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${employee.status === 'overloaded' ? 'bg-red-100 text-red-700' :
                                                    employee.status === 'balanced' ? 'bg-emerald-100 text-emerald-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {employee.status === 'overloaded' ? 'Overloaded' :
                                                        employee.status === 'balanced' ? 'Balanced' : 'Underutilized'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 mb-3">
                                                <div>
                                                    <div className="text-xs text-slate-600 mb-1">Current Tasks</div>
                                                    <div className="text-lg font-bold text-slate-900">{employee.currentTasks}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-600 mb-1">Capacity</div>
                                                    <div className="text-lg font-bold text-slate-900">{employee.capacity}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-600 mb-1">Utilization</div>
                                                    <div className={`text-lg font-bold ${employee.utilization >= 100 ? 'text-red-600' :
                                                        employee.utilization >= 85 ? 'text-amber-600' :
                                                            employee.utilization >= 60 ? 'text-emerald-600' : 'text-blue-600'
                                                        }`}>
                                                        {employee.utilization}%
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                                                <div
                                                    className={`h-2 rounded-full ${getStatusColor(employee.status)}`}
                                                    style={{ width: `${Math.min(employee.utilization, 100)}%` }}
                                                ></div>
                                            </div>

                                            <div className="text-xs text-slate-500">
                                                Next available: {employee.nextAvailable}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Team Capacity Analysis */}
                        {teamCapacity && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Team Capacity Analysis</h2>

                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-slate-700">Current Utilization</span>
                                        <span className="text-lg font-bold text-slate-900">{teamCapacity.utilizationPercentage}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-3">
                                        <div
                                            className="bg-blue-500 h-3 rounded-full"
                                            style={{ width: `${teamCapacity.utilizationPercentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                                        <span>{teamCapacity.currentUtilization}/{teamCapacity.totalCapacity} tasks</span>
                                        <span>{teamCapacity.status}</span>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <h3 className="font-semibold text-blue-900 mb-2">AI Recommendation</h3>
                                    <p className="text-sm text-blue-800">{teamCapacity.recommendation}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                                        <div className="text-lg font-bold text-slate-900 mb-1">{teamCapacity.forecastedCapacity.nextWeek}%</div>
                                        <div className="text-xs font-medium text-slate-600">Next Week</div>
                                    </div>
                                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                                        <div className="text-lg font-bold text-slate-900 mb-1">{teamCapacity.forecastedCapacity.nextMonth}%</div>
                                        <div className="text-xs font-medium text-slate-600">Next Month</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Campaign Overview */}
                    {campaignOverview && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Campaign Overview</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {campaignOverview.map((campaign: any) => (
                                    <div key={campaign.id} className="border border-slate-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-semibold text-slate-900 text-sm">{campaign.name}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${campaign.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                'bg-blue-100 text-blue-700'
                                                }`}>
                                                {campaign.status === 'completed' ? 'Completed' : 'In Progress'}
                                            </span>
                                        </div>

                                        <div className="mb-3">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-600">Progress</span>
                                                <span className="font-medium text-slate-900">{campaign.progress}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full"
                                                    style={{ width: `${campaign.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <span className="text-slate-600">Team:</span>
                                                <span className="font-medium text-slate-900 ml-1">{campaign.assignedMembers}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-600">Tasks:</span>
                                                <span className="font-medium text-slate-900 ml-1">{campaign.tasksCompleted}/{campaign.totalTasks}</span>
                                            </div>
                                        </div>

                                        <div className="mt-2 text-xs">
                                            <span className="text-slate-600">Deadline:</span>
                                            <span className="font-medium text-slate-900 ml-1">{campaign.deadline}</span>
                                        </div>

                                        {campaign.riskLevel !== 'none' && (
                                            <div className={`mt-2 px-2 py-1 rounded text-xs font-medium ${campaign.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                                                campaign.riskLevel === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                Risk: {campaign.riskLevel}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Team Alerts & Allocation Suggestions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Team Alerts */}
                        {teamAlerts && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Team Alerts & Notifications</h2>
                                <div className="space-y-3">
                                    {teamAlerts.map((alert: any) => (
                                        <div key={alert.id} className={`border-l-4 p-4 rounded-r-lg ${alert.type === 'error' ? 'border-red-500 bg-red-50' :
                                            alert.type === 'warning' ? 'border-amber-500 bg-amber-50' :
                                                alert.type === 'success' ? 'border-emerald-500 bg-emerald-50' :
                                                    'border-blue-500 bg-blue-50'
                                            }`}>
                                            <div className="flex items-start gap-3">
                                                {alert.type === 'error' || alert.type === 'warning' ? (
                                                    <AlertTriangle className={`w-5 h-5 mt-0.5 ${alert.type === 'error' ? 'text-red-500' : 'text-amber-500'
                                                        }`} />
                                                ) : alert.type === 'success' ? (
                                                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                                                ) : (
                                                    <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                                                )}
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-slate-900">{alert.message}</p>
                                                    <p className="text-xs text-slate-600 mt-1">
                                                        Priority: {alert.priority} • Action: {alert.actionRequired}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Allocation Suggestions */}
                        {allocationSuggestions && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Resource Allocation Suggestions</h2>
                                <div className="space-y-4">
                                    {allocationSuggestions.map((suggestion: any) => (
                                        <div key={suggestion.suggestion} className="border border-slate-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-medium text-slate-900 text-sm">{suggestion.suggestion}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${suggestion.effort === 'Low' ? 'bg-emerald-100 text-emerald-700' :
                                                    suggestion.effort === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {suggestion.effort} Effort
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 mb-2">{suggestion.impact}</p>
                                            <div className="text-xs text-slate-500">
                                                Timeline: {suggestion.timeline}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Performance Trends & Task Distribution Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Performance Trends</h2>
                            <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                                <span className="text-slate-500 text-sm">Performance Trends Chart (Team Effort, Performance, QC Pass Rate)</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Task Distribution</h2>
                            <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                                <span className="text-slate-500 text-sm">Task Distribution Chart (Assigned vs Completed vs Overdue)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamLeaderDashboard;