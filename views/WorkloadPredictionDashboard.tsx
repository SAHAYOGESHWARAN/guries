import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Users, Target, Lightbulb, CheckCircle, Clock, BarChart3, Activity } from 'lucide-react';

interface WorkloadPredictionDashboardProps {
    onNavigate?: (view: string, id?: string) => void;
}

const WorkloadPredictionDashboard: React.FC<WorkloadPredictionDashboardProps> = ({ onNavigate }) => {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        timeRange: 'monthly',
        department: 'all',
        team: 'all'
    });

    useEffect(() => {
        fetchDashboardData();
    }, [filters]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`/api/v1/dashboards/workload-prediction?${queryParams}`);
            const result = await response.json();
            if (result.success) {
                setDashboardData(result.data);
            }
        } catch (error) {
            console.error('Error fetching workload prediction dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const implementSuggestion = async (suggestionId: string) => {
        try {
            const response = await fetch('/api/v1/dashboards/workload-prediction/implement-suggestion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    suggestionId,
                    approvedBy: 'Team Leader',
                    notes: 'Approved for implementation'
                })
            });
            if (response.ok) {
                fetchDashboardData(); // Refresh data
            }
        } catch (error) {
            console.error('Error implementing suggestion:', error);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const { forecastedTasks, predictedOverloads, resourceGapAlerts, allocationSuggestions, workloadTrendForecast, teamCapacityUtilization } = dashboardData || {};

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'balanced': return 'bg-emerald-500';
            case 'overload': return 'bg-red-500';
            case 'underutilized': return 'bg-blue-500';
            case 'suggested': return 'bg-indigo-500';
            default: return 'bg-slate-400';
        }
    };

    const getUtilizationColor = (utilization: number) => {
        if (utilization >= 100) return 'text-red-600 bg-red-100';
        if (utilization >= 85) return 'text-amber-600 bg-amber-100';
        if (utilization >= 60) return 'text-emerald-600 bg-emerald-100';
        return 'text-blue-600 bg-blue-100';
    };

    const getRiskColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'high': return 'border-red-500 bg-red-50';
            case 'medium': return 'border-amber-500 bg-amber-50';
            case 'low': return 'border-blue-500 bg-blue-50';
            default: return 'border-slate-500 bg-slate-50';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'text-red-600 bg-red-100';
            case 'medium': return 'text-amber-600 bg-amber-100';
            case 'low': return 'text-blue-600 bg-blue-100';
            default: return 'text-slate-600 bg-slate-100';
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
                                    📈 Workload Prediction & Allocation
                                </h1>
                                <p className="text-sm text-slate-600 mt-1">AI-powered capacity planning and resource optimization</p>
                            </div>
                        </div>

                        {/* Filters Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                value={filters.department}
                                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Departments</option>
                                <option value="content">Content Team</option>
                                <option value="seo">SEO Team</option>
                                <option value="tech">Tech Team</option>
                                <option value="marketing">Marketing Team</option>
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

                    {/* Forecasted Tasks per Person */}
                    {forecastedTasks && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-500" />
                                Forecasted Tasks per Person
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {forecastedTasks.map((employee: any) => (
                                    <div key={employee.employeeId} className="border border-slate-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-semibold text-slate-900">{employee.name}</h3>
                                                <p className="text-sm text-slate-600">{employee.role}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${employee.status === 'overload' ? 'bg-red-100 text-red-700' :
                                                    employee.status === 'balanced' ? 'bg-emerald-100 text-emerald-700' :
                                                        'bg-blue-100 text-blue-700'
                                                }`}>
                                                {employee.status === 'overload' ? 'Overload' :
                                                    employee.status === 'balanced' ? 'Balanced' : 'Underutilized'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <div>
                                                <div className="text-xs text-slate-600 mb-1">Current</div>
                                                <div className="text-lg font-bold text-slate-900">{employee.currentUtilization}/{employee.currentCapacity}</div>
                                                <div className={`text-xs font-medium px-2 py-1 rounded-full w-fit ${getUtilizationColor(employee.utilizationPercentage)}`}>
                                                    {employee.utilizationPercentage}%
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-600 mb-1">Next Week</div>
                                                <div className="text-lg font-bold text-slate-900">{employee.forecastedTasks.nextWeek}</div>
                                                <div className={`text-xs font-medium px-2 py-1 rounded-full w-fit ${getUtilizationColor(employee.predictedUtilization.nextWeek)}`}>
                                                    {employee.predictedUtilization.nextWeek}%
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-600">2 Weeks Out:</span>
                                                <span className="font-medium text-slate-900">{employee.forecastedTasks.twoWeeksOut} tasks ({employee.predictedUtilization.twoWeeksOut}%)</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-600">Next Month:</span>
                                                <span className="font-medium text-slate-900">{employee.forecastedTasks.nextMonth} tasks ({employee.predictedUtilization.nextMonth}%)</span>
                                            </div>
                                        </div>

                                        <div className={`mt-3 text-xs font-medium px-2 py-1 rounded-full w-fit ${employee.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                                                employee.riskLevel === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {employee.riskLevel} risk
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Predicted Overload Cases & Resource Gap Alerts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Predicted Overload Cases */}
                        {predictedOverloads && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                    Predicted Overload Cases
                                </h2>
                                <div className="space-y-4">
                                    {predictedOverloads.map((overload: any) => (
                                        <div key={overload.employeeId} className={`border-l-4 p-4 rounded-r-lg ${getRiskColor(overload.riskLevel)}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-slate-900">{overload.name}</h3>
                                                    <p className="text-sm text-slate-600">{overload.role}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(overload.riskLevel)}`}>
                                                    {overload.riskLevel} risk
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                                                <div className="text-center">
                                                    <div className="font-bold text-red-600">+{overload.currentOverload}%</div>
                                                    <div className="text-xs text-slate-600">Current</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-bold text-red-600">+{overload.predictedOverload.nextWeek}%</div>
                                                    <div className="text-xs text-slate-600">Next Week</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-bold text-red-600">+{overload.predictedOverload.nextMonth}%</div>
                                                    <div className="text-xs text-slate-600">Next Month</div>
                                                </div>
                                            </div>

                                            <div className="text-sm text-slate-700 mb-2">{overload.impact}</div>
                                            <div className="text-xs text-slate-600 mb-2">Timeline: {overload.timeline}</div>

                                            <div>
                                                <h4 className="text-xs font-semibold text-slate-700 mb-1">Recommendations:</h4>
                                                <ul className="text-xs text-slate-600 space-y-1">
                                                    {overload.recommendations.slice(0, 2).map((rec: string, index: number) => (
                                                        <li key={index} className="flex items-start gap-2">
                                                            <span className="text-blue-500 mt-1">•</span>
                                                            <span>{rec}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Resource Gap Alerts */}
                        {resourceGapAlerts && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-amber-500" />
                                    Resource Gap Alerts
                                </h2>
                                <div className="space-y-4">
                                    {resourceGapAlerts.map((alert: any) => (
                                        <div key={alert.id} className={`border-l-4 p-4 rounded-r-lg ${getRiskColor(alert.severity)}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-slate-900">{alert.department}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                                                    {alert.severity}
                                                </span>
                                            </div>

                                            <div className="text-sm font-medium text-slate-700 mb-1">{alert.gapType}</div>
                                            <p className="text-sm text-slate-600 mb-2">{alert.description}</p>
                                            <div className="text-sm text-slate-700 mb-2">{alert.impact}</div>
                                            <div className="text-xs text-slate-600 mb-3">Timeline: {alert.timeline}</div>

                                            <div className="mb-3">
                                                <h4 className="text-xs font-semibold text-slate-700 mb-1">Recommendations:</h4>
                                                <ul className="text-xs text-slate-600 space-y-1">
                                                    {alert.recommendations.map((rec: string, index: number) => (
                                                        <li key={index} className="flex items-start gap-2">
                                                            <span className="text-emerald-500 mt-1">•</span>
                                                            <span>{rec}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="text-xs font-medium text-slate-900 bg-slate-100 px-2 py-1 rounded">
                                                Estimated Cost: {alert.estimatedCost}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* AI Task Allocation Suggestions */}
                    {allocationSuggestions && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-yellow-500" />
                                AI Task Allocation Suggestions
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {allocationSuggestions.map((suggestion: any) => (
                                    <div key={suggestion.id} className="border border-slate-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                            'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {suggestion.priority} priority
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${suggestion.effort === 'Low' ? 'bg-emerald-100 text-emerald-700' :
                                                            suggestion.effort === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-red-100 text-red-700'
                                                        }`}>
                                                        {suggestion.effort} effort
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-slate-900 text-sm mb-2">{suggestion.suggestion}</h3>
                                                <p className="text-sm text-slate-600 mb-3">{suggestion.reasoning}</p>
                                            </div>
                                            <div className="text-right ml-4">
                                                <div className="text-sm font-bold text-blue-600">{suggestion.confidence}%</div>
                                                <div className="text-xs text-slate-500">Confidence</div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 rounded-lg p-3 mb-3">
                                            <h4 className="text-xs font-semibold text-slate-700 mb-2">Expected Impact:</h4>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                {Object.entries(suggestion.impact).map(([key, value]: [string, any]) => (
                                                    <div key={key} className="flex justify-between">
                                                        <span className="text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                                        <span className="font-medium text-slate-900">{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="text-xs text-slate-500">Timeline: {suggestion.timeline}</div>
                                            <button
                                                onClick={() => implementSuggestion(suggestion.id.toString())}
                                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Implement
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Team Capacity Utilization */}
                    {teamCapacityUtilization && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-purple-500" />
                                Team Capacity Utilization
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {teamCapacityUtilization.map((team: any, index: number) => (
                                    <div key={index} className="border border-slate-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-semibold text-slate-900">{team.team}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${team.status === 'overload' ? 'bg-red-100 text-red-700' :
                                                    team.status === 'balanced' ? 'bg-emerald-100 text-emerald-700' :
                                                        'bg-blue-100 text-blue-700'
                                                }`}>
                                                {team.status}
                                            </span>
                                        </div>

                                        <div className="mb-3">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-600">Current</span>
                                                <span className="font-medium text-slate-900">{team.currentUtilization}/{team.currentCapacity}</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${getStatusColor(team.status)}`}
                                                    style={{ width: `${Math.min(team.utilizationPercentage, 100)}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-center text-sm font-bold text-slate-900 mt-1">
                                                {team.utilizationPercentage}%
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Next Week:</span>
                                                <span className={`font-medium ${team.forecastedUtilization.nextWeek >= 100 ? 'text-red-600' :
                                                        team.forecastedUtilization.nextWeek >= 85 ? 'text-amber-600' :
                                                            'text-emerald-600'
                                                    }`}>
                                                    {team.forecastedUtilization.nextWeek}%
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Next Month:</span>
                                                <span className={`font-medium ${team.forecastedUtilization.nextMonth >= 100 ? 'text-red-600' :
                                                        team.forecastedUtilization.nextMonth >= 85 ? 'text-amber-600' :
                                                            'text-emerald-600'
                                                    }`}>
                                                    {team.forecastedUtilization.nextMonth}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex items-center gap-1">
                                            {team.trend === 'increasing' ? (
                                                <TrendingUp className="w-4 h-4 text-red-500" />
                                            ) : team.trend === 'decreasing' ? (
                                                <TrendingUp className="w-4 h-4 text-emerald-500 rotate-180" />
                                            ) : (
                                                <Activity className="w-4 h-4 text-blue-500" />
                                            )}
                                            <span className="text-xs text-slate-600 capitalize">{team.trend}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Workload Trend Forecast Chart */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            Workload Trend Forecast
                        </h2>
                        <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                            <span className="text-slate-500 text-sm">Workload Trend Chart (Team Capacity vs Predicted Workload vs Optimal Utilization)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkloadPredictionDashboard;