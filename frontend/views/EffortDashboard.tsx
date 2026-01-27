import React, { useState, useEffect } from 'react';

// Custom icon components to replace lucide-react
const Activity = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const Users = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>;
const Clock = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CheckCircle = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const AlertCircle = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TrendingUp = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const BarChart3 = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;

interface EffortDashboardProps {
    onNavigate?: (view: string, id?: string) => void;
}

const EffortDashboard: React.FC<EffortDashboardProps> = ({ onNavigate }) => {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        department: 'all',
        timeRange: 'monthly',
        team: 'all'
    });

    useEffect(() => {
        fetchDashboardData();
    }, [filters]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`/api/v1/dashboards/effort?${queryParams}`);
            const result = await response.json();
            if (result.success) {
                setDashboardData(result.data);
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Error fetching effort dashboard:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const { summaryCards, targetVsActual, teamHeatmap, qcPerformance, slaMisses, workloadTrends } = dashboardData || {};

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'on-track': return 'bg-emerald-500';
            case 'overworked': return 'bg-blue-500';
            case 'under-performance': return 'bg-red-500';
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
                                    ⚡ Effort Dashboard
                                </h1>
                                <p className="text-sm text-slate-600 mt-1">Work Completion & Productivity Analytics</p>
                            </div>
                        </div>

                        {/* Filters Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <select
                                value={filters.department}
                                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Departments</option>
                                <option value="content">Content Team</option>
                                <option value="seo">SEO Team</option>
                                <option value="web">Web Team</option>
                                <option value="smm">SMM Team</option>
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

                            <select
                                value={filters.team}
                                onChange={(e) => setFilters(prev => ({ ...prev, team: e.target.value }))}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Teams</option>
                                <option value="team-a">Team A</option>
                                <option value="team-b">Team B</option>
                                <option value="team-c">Team C</option>
                            </select>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    {summaryCards && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Effort Completion</h3>
                                    <Activity className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-2xl font-bold text-slate-900">{summaryCards.effortCompletion.value}%</div>
                                    <div className={`flex items-center gap-1 text-xs font-medium ${summaryCards.effortCompletion.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        <TrendingUp className={`w-3 h-3 ${summaryCards.effortCompletion.trend === 'down' ? 'rotate-180' : ''}`} />
                                        {summaryCards.effortCompletion.change}
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 mb-1">Target: {summaryCards.effortCompletion.target}%</div>
                                <div className={`text-xs font-medium ${summaryCards.effortCompletion.status === 'excellent' ? 'text-emerald-600' : 'text-blue-600'}`}>
                                    {summaryCards.effortCompletion.status === 'excellent' ? 'Excellent' : 'Good'}
                                </div>
                                <div className="text-xs text-slate-400 mt-1">
                                    Updated: {new Date(summaryCards.effortCompletion.lastUpdated).toLocaleTimeString()}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Tasks Completed</h3>
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-2xl font-bold text-slate-900">{summaryCards.totalTasksCompleted.value}</div>
                                    <div className={`flex items-center gap-1 text-xs font-medium ${summaryCards.totalTasksCompleted.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        <TrendingUp className={`w-3 h-3 ${summaryCards.totalTasksCompleted.trend === 'down' ? 'rotate-180' : ''}`} />
                                        {summaryCards.totalTasksCompleted.change}
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 mb-1">Target: {summaryCards.totalTasksCompleted.target}</div>
                                <div className="text-xs text-emerald-600 font-medium">On Track</div>
                                <div className="text-xs text-slate-400 mt-1">
                                    Updated: {new Date(summaryCards.totalTasksCompleted.lastUpdated).toLocaleTimeString()}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Rework %</h3>
                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-2xl font-bold text-slate-900">{summaryCards.reworkPercentage.value}%</div>
                                    <div className={`flex items-center gap-1 text-xs font-medium ${summaryCards.reworkPercentage.trend === 'down' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        <TrendingUp className={`w-3 h-3 ${summaryCards.reworkPercentage.trend === 'down' ? 'rotate-180' : ''}`} />
                                        {summaryCards.reworkPercentage.change}
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 mb-1">Target: {summaryCards.reworkPercentage.target}%</div>
                                <div className="text-xs text-emerald-600 font-medium">Below Target</div>
                                <div className="text-xs text-slate-400 mt-1">
                                    Updated: {new Date(summaryCards.reworkPercentage.lastUpdated).toLocaleTimeString()}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">QC Pass %</h3>
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-2xl font-bold text-slate-900">{summaryCards.qcPassPercentage.value}%</div>
                                    <div className={`flex items-center gap-1 text-xs font-medium ${summaryCards.qcPassPercentage.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        <TrendingUp className={`w-3 h-3 ${summaryCards.qcPassPercentage.trend === 'down' ? 'rotate-180' : ''}`} />
                                        {summaryCards.qcPassPercentage.change}
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 mb-1">Target: {summaryCards.qcPassPercentage.target}%</div>
                                <div className="text-xs text-emerald-600 font-medium">Excellent</div>
                                <div className="text-xs text-slate-400 mt-1">
                                    Updated: {new Date(summaryCards.qcPassPercentage.lastUpdated).toLocaleTimeString()}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">TAT Compliance</h3>
                                    <Clock className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-2xl font-bold text-slate-900">{summaryCards.tatCompliance.value}%</div>
                                    <div className={`flex items-center gap-1 text-xs font-medium ${summaryCards.tatCompliance.trend === 'up' ? 'text-emerald-600' : summaryCards.tatCompliance.trend === 'stable' ? 'text-blue-600' : 'text-red-600'}`}>
                                        <TrendingUp className={`w-3 h-3 ${summaryCards.tatCompliance.trend === 'down' ? 'rotate-180' : summaryCards.tatCompliance.trend === 'stable' ? 'rotate-90' : ''}`} />
                                        {summaryCards.tatCompliance.change}
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 mb-1">Target: {summaryCards.tatCompliance.target}%</div>
                                <div className="text-xs text-blue-600 font-medium">On Track</div>
                                <div className="text-xs text-slate-400 mt-1">
                                    Updated: {new Date(summaryCards.tatCompliance.lastUpdated).toLocaleTimeString()}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Workload Prediction</h3>
                                    <TrendingUp className="w-4 h-4 text-purple-500" />
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-lg font-bold text-slate-900">{summaryCards.workloadPrediction.value}</div>
                                    <div className="text-sm font-medium text-purple-600">{summaryCards.workloadPrediction.utilizationPercentage}%</div>
                                </div>
                                <div className="text-xs text-slate-500 mb-1">Next Week: {summaryCards.workloadPrediction.nextWeekForecast}</div>
                                <div className="text-xs text-emerald-600 font-medium">Optimal</div>
                                <div className="text-xs text-slate-400 mt-1">
                                    Updated: {new Date(summaryCards.workloadPrediction.lastUpdated).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Target vs Actual Bar Graph */}
                    {targetVsActual && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Target vs Actual Performance by Role</h2>
                            <div className="space-y-6">
                                {targetVsActual.map((role: any, index: number) => (
                                    <div key={index} className="border border-slate-200 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-semibold text-slate-900">{role.role}</h3>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${role.performance >= 95 ? 'bg-emerald-100 text-emerald-700' :
                                                role.performance >= 85 ? 'bg-blue-100 text-blue-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {role.performance}% Performance
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {role.targetWordCount > 0 && (
                                                <div>
                                                    <div className="text-xs text-slate-600 mb-1">Word Count</div>
                                                    <div className="text-sm font-medium text-slate-900">
                                                        {role.deliveredWordCount.toLocaleString()} / {role.targetWordCount.toLocaleString()}
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                                                        <div
                                                            className="bg-blue-500 h-2 rounded-full"
                                                            style={{ width: `${Math.min((role.deliveredWordCount / role.targetWordCount) * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}

                                            {role.targetBacklinks > 0 && (
                                                <div>
                                                    <div className="text-xs text-slate-600 mb-1">Backlinks</div>
                                                    <div className="text-sm font-medium text-slate-900">
                                                        {role.completedBacklinks} / {role.targetBacklinks}
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                                                        <div
                                                            className="bg-emerald-500 h-2 rounded-full"
                                                            style={{ width: `${Math.min((role.completedBacklinks / role.targetBacklinks) * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}

                                            {role.targetPosts > 0 && (
                                                <div>
                                                    <div className="text-xs text-slate-600 mb-1">Posts</div>
                                                    <div className="text-sm font-medium text-slate-900">
                                                        {role.publishedPosts} / {role.targetPosts}
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                                                        <div
                                                            className="bg-purple-500 h-2 rounded-full"
                                                            style={{ width: `${Math.min((role.publishedPosts / role.targetPosts) * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}

                                            {role.targetFixes > 0 && (
                                                <div>
                                                    <div className="text-xs text-slate-600 mb-1">Fixes</div>
                                                    <div className="text-sm font-medium text-slate-900">
                                                        {role.completedFixes} / {role.targetFixes}
                                                    </div>
                                                    <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                                                        <div
                                                            className="bg-orange-500 h-2 rounded-full"
                                                            style={{ width: `${Math.min((role.completedFixes / role.targetFixes) * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Team Performance Heatmap */}
                    {teamHeatmap && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Team Performance Heatmap</h2>
                            <div className="overflow-x-auto">
                                <div className="min-w-full">
                                    <div className="grid grid-cols-7 gap-2 mb-4">
                                        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Employee</div>
                                        {teamHeatmap[0]?.weeks.map((week: any) => (
                                            <div key={week.week} className="text-xs font-semibold text-slate-600 uppercase tracking-wide text-center">
                                                {week.week}
                                            </div>
                                        ))}
                                    </div>

                                    {teamHeatmap.map((employee: any, index: number) => (
                                        <div key={index} className="grid grid-cols-7 gap-2 mb-2 items-center">
                                            <div className="text-sm font-medium text-slate-900">
                                                <div>{employee.employee}</div>
                                                <div className="text-xs text-slate-500">{employee.role}</div>
                                            </div>
                                            {employee.weeks.map((week: any, weekIndex: number) => (
                                                <div key={weekIndex} className="text-center">
                                                    <div
                                                        className={`w-full h-12 rounded-lg flex items-center justify-center text-white text-xs font-medium ${getStatusColor(week.status)}`}
                                                        title={`${week.week}: ${week.score}% - ${week.status}`}
                                                    >
                                                        {week.score}%
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-200">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                                    <span className="text-xs text-slate-600">On Track</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                    <span className="text-xs text-slate-600">Overworked</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                                    <span className="text-xs text-slate-600">Under-performance</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* QC Performance & SLA Misses */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* QC Performance Chart */}
                        {qcPerformance && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">QC Performance by Stage</h2>
                                <div className="space-y-4">
                                    {Object.entries(qcPerformance).map(([key, stage]: [string, any]) => (
                                        <div key={key} className="border border-slate-200 rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-semibold text-slate-900">{stage.name}</h3>
                                                <span className={`text-sm font-medium ${stage.trend === 'up' ? 'text-emerald-600' :
                                                    stage.trend === 'down' ? 'text-red-600' : 'text-slate-600'
                                                    }`}>
                                                    {stage.trend === 'up' ? '↗' : stage.trend === 'down' ? '↘' : '→'} {stage.trend}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-xs text-slate-600 mb-1">Average Score</div>
                                                    <div className="text-xl font-bold text-slate-900">{stage.averageScore}%</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-600 mb-1">Pass Rate</div>
                                                    <div className="text-xl font-bold text-slate-900">{stage.passRate}%</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* SLA Misses Log */}
                        {slaMisses && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">SLA Misses Log</h2>
                                <div className="space-y-4">
                                    {slaMisses.map((miss: any, index: number) => (
                                        <div key={index} className="border border-slate-200 rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-semibold text-slate-900">{miss.role}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${miss.delays === 0 ? 'bg-emerald-100 text-emerald-700' :
                                                    miss.delays <= 2 ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {miss.delays} delays
                                                </span>
                                            </div>
                                            {miss.reasons.length > 0 && (
                                                <div>
                                                    <div className="text-xs text-slate-600 mb-1">Reasons:</div>
                                                    <ul className="text-sm text-slate-700 space-y-1">
                                                        {miss.reasons.map((reason: string, reasonIndex: number) => (
                                                            <li key={reasonIndex} className="flex items-start gap-2">
                                                                <span className="text-slate-400 mt-1">•</span>
                                                                <span>{reason}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {miss.delays === 0 && (
                                                <div className="text-sm text-emerald-600 font-medium">Perfect SLA compliance!</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Workload Trends Chart Placeholder */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Workload Trends</h2>
                        <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                            <span className="text-slate-500 text-sm">Workload Trends Chart (Planned vs Actual vs Efficiency)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EffortDashboard;