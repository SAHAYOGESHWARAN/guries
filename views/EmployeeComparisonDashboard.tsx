import React, { useState, useEffect } from 'react';

// Custom icon components to replace lucide-react
const Trophy = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>;
const TrendingUp = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const TrendingDown = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>;
const Users = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>;
const Award = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>;
const AlertTriangle = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const Star = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;

interface EmployeeComparisonDashboardProps {
    onNavigate?: (view: string, id?: string) => void;
}

const EmployeeComparisonDashboard: React.FC<EmployeeComparisonDashboardProps> = ({ onNavigate }) => {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        department: 'all',
        timeRange: 'monthly',
        sortBy: 'compositeScore'
    });

    useEffect(() => {
        fetchDashboardData();
    }, [filters]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`/api/v1/dashboards/employee-comparison?${queryParams}`);
            const result = await response.json();
            if (result.success) {
                setDashboardData(result.data);
            }
        } catch (error) {
            console.error('Error fetching employee comparison dashboard:', error);
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

    const { bestPerformer, employeeRankings, comparisonMatrix, weeklyHeatmap, radarChartData, underperformingEmployees, departmentSummary } = dashboardData || {};

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'excellent': return 'bg-emerald-500';
            case 'good': return 'bg-blue-500';
            case 'average': return 'bg-amber-500';
            default: return 'bg-slate-400';
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <TrendingUp className="w-4 h-4 text-emerald-500" />;
            case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
            default: return <div className="w-4 h-4 bg-slate-400 rounded-full"></div>;
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
                                    👥 Employee Comparison
                                </h1>
                                <p className="text-sm text-slate-600 mt-1">Performance comparison and ranking analysis</p>
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

                            <select
                                value={filters.sortBy}
                                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="compositeScore">Composite Score</option>
                                <option value="qcScore">QC Score</option>
                                <option value="effortScore">Effort Score</option>
                                <option value="performanceScore">Performance Score</option>
                            </select>
                        </div>
                    </div>

                    {/* Best Performer of the Month */}
                    {bestPerformer && (
                        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                        <Trophy className="w-10 h-10 text-white" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Star className="w-5 h-5" />
                                        <span className="text-sm font-semibold uppercase tracking-wide">Best Performer of the Month</span>
                                        <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                                            {bestPerformer.streak} month streak
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-bold mb-1">{bestPerformer.name}</h2>
                                    <p className="text-yellow-100 mb-2">{bestPerformer.role} • {bestPerformer.department}</p>
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="text-3xl font-bold">{bestPerformer.compositeScore}%</div>
                                        <div className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded-full">
                                            {bestPerformer.improvement}
                                        </div>
                                        <div className="text-sm bg-emerald-500 bg-opacity-80 px-2 py-1 rounded-full">
                                            Rewards: {bestPerformer.totalRewards}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 text-xs">
                                        <div className="text-center">
                                            <div className="font-bold">{bestPerformer.performanceMetrics.consistency}%</div>
                                            <div className="text-yellow-200">Consistency</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-bold">{bestPerformer.performanceMetrics.innovation}%</div>
                                            <div className="text-yellow-200">Innovation</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-bold">{bestPerformer.performanceMetrics.collaboration}%</div>
                                            <div className="text-yellow-200">Collaboration</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-bold">{bestPerformer.performanceMetrics.leadership}%</div>
                                            <div className="text-yellow-200">Leadership</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    <div className="text-right">
                                        <h3 className="text-sm font-semibold mb-2">Key Achievements</h3>
                                        <ul className="text-sm space-y-1">
                                            {bestPerformer.achievements.slice(0, 4).map((achievement: string, index: number) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <span className="text-yellow-200 mt-1">•</span>
                                                    <span>{achievement}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="text-xs text-yellow-200 mt-2">
                                            Updated: {new Date(bestPerformer.lastUpdated).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Employee Rankings Table */}
                    {employeeRankings && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Employee Rankings</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Rank</th>
                                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Employee</th>
                                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Department</th>
                                            <th className="text-right py-3 px-4 font-semibold text-slate-700">Composite Score</th>
                                            <th className="text-right py-3 px-4 font-semibold text-slate-700">QC Score</th>
                                            <th className="text-right py-3 px-4 font-semibold text-slate-700">Effort Score</th>
                                            <th className="text-right py-3 px-4 font-semibold text-slate-700">Performance Score</th>
                                            <th className="text-right py-3 px-4 font-semibold text-slate-700">Tasks</th>
                                            <th className="text-center py-3 px-4 font-semibold text-slate-700">Risk</th>
                                            <th className="text-center py-3 px-4 font-semibold text-slate-700">Trend</th>
                                            <th className="text-right py-3 px-4 font-semibold text-slate-700">Change</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employeeRankings.map((employee: any) => (
                                            <tr key={employee.employeeId} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        {employee.rank <= 3 && (
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${employee.rank === 1 ? 'bg-yellow-500' :
                                                                employee.rank === 2 ? 'bg-slate-400' :
                                                                    'bg-amber-600'
                                                                }`}>
                                                                {employee.rank}
                                                            </div>
                                                        )}
                                                        {employee.rank > 3 && (
                                                            <span className="font-semibold text-slate-600">#{employee.rank}</span>
                                                        )}
                                                        {employee.monthsInTop3 && employee.monthsInTop3 >= 3 && (
                                                            <span title={`${employee.monthsInTop3} months in top 3`}>
                                                                <Star className="w-3 h-3 text-yellow-500" />
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <div className="font-medium text-slate-900">{employee.name}</div>
                                                        <div className="text-xs text-slate-500">{employee.role}</div>
                                                        {employee.averageRating && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                                                <span className="text-xs text-slate-600">{employee.averageRating}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-slate-600">{employee.department}</td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="font-bold text-slate-900">{employee.compositeScore}%</div>
                                                    {employee.lastUpdated && (
                                                        <div className="text-xs text-slate-400">
                                                            {new Date(employee.lastUpdated).toLocaleTimeString()}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right text-slate-700">{employee.qcScore}%</td>
                                                <td className="py-3 px-4 text-right text-slate-700">{employee.effortScore}%</td>
                                                <td className="py-3 px-4 text-right text-slate-700">{employee.performanceScore}%</td>
                                                <td className="py-3 px-4 text-right">
                                                    {employee.completedTasks && employee.totalTasks && (
                                                        <div>
                                                            <div className="text-sm font-medium text-slate-900">
                                                                {employee.completedTasks}/{employee.totalTasks}
                                                            </div>
                                                            <div className="text-xs text-slate-500">
                                                                {Math.round((employee.completedTasks / employee.totalTasks) * 100)}%
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {employee.riskLevel && (
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${employee.riskLevel === 'low' ? 'bg-emerald-100 text-emerald-700' :
                                                            employee.riskLevel === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-red-100 text-red-700'
                                                            }`}>
                                                            {employee.riskLevel}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-center">{getTrendIcon(employee.trend)}</td>
                                                <td className={`py-3 px-4 text-right font-medium ${employee.change.startsWith('+') ? 'text-emerald-600' :
                                                    employee.change.startsWith('-') ? 'text-red-600' : 'text-slate-600'
                                                    }`}>
                                                    {employee.change}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Performance Comparison Matrix & Weekly Heatmap */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Performance Comparison Matrix */}
                        {comparisonMatrix && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Performance Comparison Matrix</h2>
                                <div className="overflow-x-auto">
                                    <div className="min-w-full">
                                        <div className="grid grid-cols-5 gap-2 mb-2 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                            <div>Employee</div>
                                            <div className="text-center">Composite</div>
                                            <div className="text-center">QC</div>
                                            <div className="text-center">Effort</div>
                                            <div className="text-center">Performance</div>
                                        </div>
                                        {comparisonMatrix.employees.slice(0, 6).map((employee: string, index: number) => (
                                            <div key={index} className="grid grid-cols-5 gap-2 mb-2 items-center">
                                                <div className="text-sm font-medium text-slate-900 truncate">{employee}</div>
                                                <div className="text-center">
                                                    <div className="text-sm font-semibold text-slate-900">
                                                        {comparisonMatrix.metrics[0].values[index]}%
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-sm font-semibold text-slate-900">
                                                        {comparisonMatrix.metrics[1].values[index]}%
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-sm font-semibold text-slate-900">
                                                        {comparisonMatrix.metrics[2].values[index]}%
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-sm font-semibold text-slate-900">
                                                        {comparisonMatrix.metrics[3].values[index]}%
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Weekly Performance Heatmap */}
                        {weeklyHeatmap && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Weekly Performance Heatmap</h2>
                                <div className="space-y-3">
                                    {weeklyHeatmap.map((employee: any, index: number) => (
                                        <div key={index} className="border border-slate-200 rounded-lg p-3">
                                            <div className="text-sm font-medium text-slate-900 mb-2">{employee.employee}</div>
                                            <div className="grid grid-cols-4 gap-2">
                                                {employee.weeks.map((week: any, weekIndex: number) => (
                                                    <div key={weekIndex} className="text-center">
                                                        <div
                                                            className={`w-full h-8 rounded flex items-center justify-center text-white text-xs font-medium ${getStatusColor(week.status)}`}
                                                            title={`${week.week}: ${week.score}% - ${week.status}`}
                                                        >
                                                            {week.score}%
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-1">{week.week}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Legend */}
                                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                                        <span className="text-xs text-slate-600">Excellent (90%+)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                        <span className="text-xs text-slate-600">Good (80-89%)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-amber-500 rounded"></div>
                                        <span className="text-xs text-slate-600">Average (70-79%)</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Radar Chart & Department Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Radar Chart Placeholder */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Top 5 Performers Comparison</h2>
                            <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                                <span className="text-slate-500 text-sm">Radar Chart (QC, Effort, Performance, Punctuality, Innovation, Collaboration)</span>
                            </div>
                        </div>

                        {/* Department Summary */}
                        {departmentSummary && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Department Performance Summary</h2>
                                <div className="space-y-4">
                                    {departmentSummary.map((dept: any, index: number) => (
                                        <div key={index} className="border border-slate-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-slate-900">{dept.department}</h3>
                                                <div className="flex items-center gap-2">
                                                    {getTrendIcon(dept.trend)}
                                                    <span className="text-sm font-medium text-slate-600">{dept.trend}</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <div className="text-slate-600">Avg Score</div>
                                                    <div className="font-semibold text-slate-900">{dept.averageScore}%</div>
                                                </div>
                                                <div>
                                                    <div className="text-slate-600">Team Size</div>
                                                    <div className="font-semibold text-slate-900">{dept.employeeCount} members</div>
                                                </div>
                                                <div>
                                                    <div className="text-slate-600">Top Performer</div>
                                                    <div className="font-semibold text-slate-900">{dept.topPerformer}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Underperforming Employees Alert */}
                    {underperformingEmployees && underperformingEmployees.length > 0 && (
                        <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Underperforming Employees Alert
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {underperformingEmployees.map((employee: any) => (
                                    <div key={employee.employeeId} className="border border-red-200 bg-red-50 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-semibold text-slate-900">{employee.name}</h3>
                                                <p className="text-sm text-slate-600">{employee.role} • {employee.department}</p>
                                            </div>
                                            <span className="text-lg font-bold text-red-600">{employee.compositeScore}%</span>
                                        </div>

                                        <div className="mb-3">
                                            <h4 className="text-sm font-semibold text-slate-700 mb-2">Issues Identified:</h4>
                                            <ul className="text-sm text-slate-600 space-y-1">
                                                {employee.issues.map((issue: string, index: number) => (
                                                    <li key={index} className="flex items-start gap-2">
                                                        <span className="text-red-500 mt-1">•</span>
                                                        <span>{issue}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-700 mb-2">Recommended Actions:</h4>
                                            <ul className="text-sm text-slate-600 space-y-1">
                                                {employee.recommendedActions.slice(0, 2).map((action: string, index: number) => (
                                                    <li key={index} className="flex items-start gap-2">
                                                        <span className="text-blue-500 mt-1">•</span>
                                                        <span>{action}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeComparisonDashboard;