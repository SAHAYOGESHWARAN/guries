import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Filter, Download, RefreshCw, Target, Award, AlertTriangle, Info } from 'lucide-react';

interface PerformanceDashboardProps {
    onNavigate?: (view: string, id?: string) => void;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ onNavigate }) => {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        brand: 'all',
        department: 'all',
        timeRange: 'monthly',
        kpiCategory: 'all',
        campaign: 'all',
        contributor: 'all'
    });

    useEffect(() => {
        fetchDashboardData();
    }, [filters]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`/api/v1/dashboards/performance?${queryParams}`);
            const result = await response.json();
            if (result.success) {
                setDashboardData(result.data);
            }
        } catch (error) {
            console.error('Error fetching performance dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await fetch('/api/v1/dashboards/performance/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filters)
            });
            // Handle export download
        } catch (error) {
            console.error('Error exporting data:', error);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const { summaryWidgets, kpiAnalytics, projectImpact, alerts, chartData } = dashboardData || {};

    return (
        <div className="h-full w-full flex flex-col overflow-hidden bg-slate-50">
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-300">
                <div className="w-full space-y-6">

                    {/* Header & Filters */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                    📊 Performance Dashboard
                                </h1>
                                <p className="text-sm text-slate-600 mt-1">OKR + KPI + Competitor + Gold Standard Analysis</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleExport}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Export
                                </button>
                                <button
                                    onClick={fetchDashboardData}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {/* Filters Row */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <select
                                value={filters.brand}
                                onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Brands</option>
                                <option value="tutors-india">Tutors India</option>
                                <option value="frl">FRL</option>
                                <option value="pubrica">Pubrica</option>
                                <option value="statswork">Statswork</option>
                            </select>

                            <select
                                value={filters.department}
                                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Departments</option>
                                <option value="seo">SEO Team</option>
                                <option value="content">Content Team</option>
                                <option value="web">Web Team</option>
                                <option value="smm">SMM Team</option>
                            </select>

                            <select
                                value={filters.timeRange}
                                onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="custom">Custom Range</option>
                            </select>

                            <select
                                value={filters.kpiCategory}
                                onChange={(e) => setFilters(prev => ({ ...prev, kpiCategory: e.target.value }))}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All KPI Categories</option>
                                <option value="traffic">Traffic</option>
                                <option value="ranking">Ranking</option>
                                <option value="engagement">Engagement</option>
                                <option value="conversion">Conversion</option>
                                <option value="technical">Technical</option>
                            </select>

                            <select
                                value={filters.campaign}
                                onChange={(e) => setFilters(prev => ({ ...prev, campaign: e.target.value }))}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Campaigns</option>
                                <option value="q1-2025">Q1 2025 Strategy</option>
                                <option value="seo-cleanup">SEO Cleanup</option>
                                <option value="content-opt">Content Optimization</option>
                            </select>

                            <input
                                type="text"
                                placeholder="Search KPI, metric, URL..."
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Enhanced Performance Summary Widgets */}
                    {summaryWidgets && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">OKR Achievement</h3>
                                    <Target className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-2xl font-bold text-slate-900">{summaryWidgets.okrAchievement?.value || summaryWidgets.okrAchievement}%</div>
                                    {summaryWidgets.okrAchievement?.trend === 'up' ? (
                                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    ) : summaryWidgets.okrAchievement?.trend === 'down' ? (
                                        <TrendingDown className="w-4 h-4 text-red-500" />
                                    ) : null}
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${(summaryWidgets.okrAchievement?.status || 'on-track') === 'on-track' || (summaryWidgets.okrAchievement?.status || 'on-track') === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
                                        (summaryWidgets.okrAchievement?.status || 'on-track') === 'warning' ? 'bg-amber-100 text-amber-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {(summaryWidgets.okrAchievement?.status || 'on-track') === 'on-track' ? 'On Track' :
                                            (summaryWidgets.okrAchievement?.status || 'on-track') === 'warning' ? 'Warning' :
                                                (summaryWidgets.okrAchievement?.status || 'on-track') === 'excellent' ? 'Excellent' : 'Off Track'}
                                    </div>
                                    {summaryWidgets.okrAchievement?.change && (
                                        <div className="text-xs text-slate-500">{summaryWidgets.okrAchievement.change}</div>
                                    )}
                                </div>
                                {summaryWidgets.okrAchievement?.target && (
                                    <>
                                        <div className="w-full bg-slate-200 rounded-full h-1 mt-2">
                                            <div
                                                className="bg-blue-500 h-1 rounded-full"
                                                style={{ width: `${Math.min((summaryWidgets.okrAchievement.value / summaryWidgets.okrAchievement.target) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            Target: {summaryWidgets.okrAchievement.target}%
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Performance Score</h3>
                                    <Award className="w-4 h-4 text-purple-500" />
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-2xl font-bold text-slate-900">{summaryWidgets.performanceScore?.value || summaryWidgets.performanceScore}%</div>
                                    {summaryWidgets.performanceScore?.trend === 'up' ? (
                                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    ) : summaryWidgets.performanceScore?.trend === 'down' ? (
                                        <TrendingDown className="w-4 h-4 text-red-500" />
                                    ) : null}
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${(summaryWidgets.performanceScore?.status || 'warning') === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
                                        (summaryWidgets.performanceScore?.status || 'warning') === 'warning' ? 'bg-amber-100 text-amber-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {(summaryWidgets.performanceScore?.status || 'warning') === 'excellent' ? 'Excellent' :
                                            (summaryWidgets.performanceScore?.status || 'warning') === 'warning' ? 'Above Average' : 'Below Average'}
                                    </div>
                                    {summaryWidgets.performanceScore?.change && (
                                        <div className="text-xs text-slate-500">{summaryWidgets.performanceScore.change}</div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Traffic Growth</h3>
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-2xl font-bold text-slate-900">+{summaryWidgets.trafficGrowth?.value || summaryWidgets.trafficGrowth}%</div>
                                    {summaryWidgets.trafficGrowth?.trend === 'up' ? (
                                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    ) : summaryWidgets.trafficGrowth?.trend === 'down' ? (
                                        <TrendingDown className="w-4 h-4 text-red-500" />
                                    ) : null}
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="text-xs text-emerald-600 font-medium">vs Last Cycle</div>
                                    {summaryWidgets.trafficGrowth?.change && (
                                        <div className="text-xs text-slate-500">{summaryWidgets.trafficGrowth.change}</div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Ranking Improvement</h3>
                                    <TrendingUp className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-2xl font-bold text-slate-900">+{summaryWidgets.rankingImprovement?.value || summaryWidgets.rankingImprovement}</div>
                                    {summaryWidgets.rankingImprovement?.trend === 'up' ? (
                                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    ) : summaryWidgets.rankingImprovement?.trend === 'down' ? (
                                        <TrendingDown className="w-4 h-4 text-red-500" />
                                    ) : null}
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="text-xs text-emerald-600 font-medium">Top 10 Keywords</div>
                                    {summaryWidgets.rankingImprovement?.change && (
                                        <div className="text-xs text-slate-500">{summaryWidgets.rankingImprovement.change}</div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Engagement Score</h3>
                                    <Target className="w-4 h-4 text-orange-500" />
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-2xl font-bold text-slate-900">{summaryWidgets.engagementScore?.value || summaryWidgets.engagementScore}%</div>
                                    {summaryWidgets.engagementScore?.trend === 'up' ? (
                                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    ) : summaryWidgets.engagementScore?.trend === 'down' ? (
                                        <TrendingDown className="w-4 h-4 text-red-500" />
                                    ) : null}
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${(summaryWidgets.engagementScore?.status || 'warning') === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
                                        (summaryWidgets.engagementScore?.status || 'warning') === 'warning' ? 'bg-amber-100 text-amber-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {(summaryWidgets.engagementScore?.status || 'warning') === 'excellent' ? 'Excellent' :
                                            (summaryWidgets.engagementScore?.status || 'warning') === 'warning' ? 'Needs Attention' : 'Critical'}
                                    </div>
                                    {summaryWidgets.engagementScore?.change && (
                                        <div className="text-xs text-slate-500">{summaryWidgets.engagementScore.change}</div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Conversion Score</h3>
                                    <Award className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-2xl font-bold text-slate-900">{summaryWidgets.conversionScore?.value || summaryWidgets.conversionScore}%</div>
                                    {summaryWidgets.conversionScore?.trend === 'up' ? (
                                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    ) : summaryWidgets.conversionScore?.trend === 'down' ? (
                                        <TrendingDown className="w-4 h-4 text-red-500" />
                                    ) : null}
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="text-xs text-emerald-600 font-medium">Excellent</div>
                                    {summaryWidgets.conversionScore?.change && (
                                        <div className="text-xs text-slate-500">{summaryWidgets.conversionScore.change}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* KPI Analytics Grid */}
                    {kpiAnalytics && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">KPI Analytics Grid</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left py-3 px-4 font-semibold text-slate-700">KPI Name</th>
                                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Brand</th>
                                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Type</th>
                                            <th className="text-right py-3 px-4 font-semibold text-slate-700">Baseline</th>
                                            <th className="text-right py-3 px-4 font-semibold text-slate-700">Current</th>
                                            <th className="text-right py-3 px-4 font-semibold text-slate-700">Target</th>
                                            <th className="text-right py-3 px-4 font-semibold text-slate-700">Delta</th>
                                            <th className="text-right py-3 px-4 font-semibold text-slate-700">% Achieved</th>
                                            <th className="text-right py-3 px-4 font-semibold text-slate-700">Gold Standard</th>
                                            <th className="text-right py-3 px-4 font-semibold text-slate-700">Competitor Avg</th>
                                            <th className="text-center py-3 px-4 font-semibold text-slate-700">Trend</th>
                                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Owner</th>
                                            <th className="text-center py-3 px-4 font-semibold text-slate-700">Status</th>
                                            <th className="text-center py-3 px-4 font-semibold text-slate-700">Last Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {kpiAnalytics.map((kpi: any) => (
                                            <tr key={kpi.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" title={`Data Source: ${kpi.dataSource || 'N/A'} | Priority: ${kpi.priority || 'N/A'} | Frequency: ${kpi.frequency || 'N/A'}`}>
                                                <td className="py-3 px-4">
                                                    <div className="font-medium text-slate-900">{kpi.kpiName}</div>
                                                    {kpi.unit && <div className="text-xs text-slate-500">Unit: {kpi.unit}</div>}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                                                        {kpi.brand || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${kpi.metricType === 'Traffic' ? 'bg-blue-100 text-blue-700' :
                                                            kpi.metricType === 'Ranking' ? 'bg-purple-100 text-purple-700' :
                                                                kpi.metricType === 'Engagement' ? 'bg-orange-100 text-orange-700' :
                                                                    kpi.metricType === 'Conversion' ? 'bg-emerald-100 text-emerald-700' :
                                                                        kpi.metricType === 'Technical' ? 'bg-red-100 text-red-700' :
                                                                            'bg-slate-100 text-slate-700'
                                                        }`}>
                                                        {kpi.metricType}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right text-slate-600">{kpi.baseline?.toLocaleString() || 'N/A'}</td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="font-semibold text-slate-900">{kpi.current?.toLocaleString() || 'N/A'}</div>
                                                    {kpi.trendPercentage && (
                                                        <div className={`text-xs ${kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                            {kpi.trendPercentage}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right text-slate-600">{kpi.target?.toLocaleString() || 'N/A'}</td>
                                                <td className={`py-3 px-4 text-right font-medium ${(kpi.delta || 0) > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {(kpi.delta || 0) > 0 ? '+' : ''}{kpi.delta?.toLocaleString() || '0'}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="font-semibold text-slate-900">{kpi.percentAchieved || 0}%</div>
                                                    <div className="w-full bg-slate-200 rounded-full h-1 mt-1">
                                                        <div
                                                            className={`h-1 rounded-full ${(kpi.percentAchieved || 0) >= 90 ? 'bg-emerald-500' : (kpi.percentAchieved || 0) >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                            style={{ width: `${Math.min(kpi.percentAchieved || 0, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-right text-blue-600 font-medium">{kpi.goldStandard?.toLocaleString() || 'N/A'}</td>
                                                <td className="py-3 px-4 text-right text-purple-600 font-medium">{kpi.competitorAvg?.toLocaleString() || 'N/A'}</td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {kpi.trend === 'up' ? (
                                                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                                                        ) : (
                                                            <TrendingDown className="w-4 h-4 text-red-500" />
                                                        )}
                                                        {kpi.sparklineData && (
                                                            <div className="w-12 h-6 flex items-end gap-px">
                                                                {kpi.sparklineData.slice(-6).map((value: number, index: number) => (
                                                                    <div
                                                                        key={index}
                                                                        className={`w-1 ${kpi.trend === 'up' ? 'bg-emerald-400' : 'bg-red-400'} opacity-70`}
                                                                        style={{ height: `${(value / Math.max(...kpi.sparklineData)) * 20 + 4}px` }}
                                                                    ></div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-left">
                                                    <div className="text-sm font-medium text-slate-900">{kpi.owner || 'Unassigned'}</div>
                                                    <div className="text-xs text-slate-500">{kpi.department || 'N/A'}</div>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${kpi.status === 'on-track' ? 'bg-emerald-100 text-emerald-700' :
                                                            kpi.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-red-100 text-red-700'
                                                        }`}>
                                                        {kpi.status === 'on-track' ? 'On Track' :
                                                            kpi.status === 'warning' ? 'Warning' : 'Off Track'}
                                                    </span>
                                                    {kpi.alerts && kpi.alerts.length > 0 && (
                                                        <div className="text-xs text-amber-600 mt-1">
                                                            {kpi.alerts.length} alert{kpi.alerts.length > 1 ? 's' : ''}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-center text-xs text-slate-500">
                                                    {kpi.lastUpdated ? new Date(kpi.lastUpdated).toLocaleDateString() : 'N/A'}
                                                    <br />
                                                    {kpi.lastUpdated ? new Date(kpi.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Project Impact & Alerts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Project Impact */}
                        {projectImpact && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Project Impact</h2>
                                <div className="space-y-4">
                                    {projectImpact.map((project: any) => (
                                        <div key={project.id} className="border border-slate-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-slate-900">{project.project}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {project.status === 'completed' ? 'Completed' : 'In Progress'}
                                                </span>
                                            </div>
                                            <div className="text-sm text-slate-600 mb-2">
                                                <span className="font-medium">{project.kpiMoved}</span> {project.direction.toLowerCase()} by{' '}
                                                <span className="font-semibold text-emerald-600">+{project.liftPercent}%</span>
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                Responsible: {project.responsibleTeam}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Alerts Panel */}
                        {alerts && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Alerts & Insights</h2>
                                <div className="space-y-3">
                                    {alerts.map((alert: any) => (
                                        <div key={alert.id} className={`border-l-4 p-4 rounded-r-lg ${alert.type === 'error' ? 'border-red-500 bg-red-50' :
                                            alert.type === 'warning' ? 'border-amber-500 bg-amber-50' :
                                                'border-blue-500 bg-blue-50'
                                            }`}>
                                            <div className="flex items-start gap-3">
                                                {alert.type === 'error' ? (
                                                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                                                ) : alert.type === 'warning' ? (
                                                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                                                ) : (
                                                    <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                                                )}
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-slate-900">{alert.message}</p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Severity: {alert.severity} • {new Date(alert.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Visual Charts Placeholder */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Visual Charts</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="h-48 bg-slate-100 rounded-lg flex items-center justify-center">
                                <span className="text-slate-500 text-sm">Traffic vs Target vs Gold Standard</span>
                            </div>
                            <div className="h-48 bg-slate-100 rounded-lg flex items-center justify-center">
                                <span className="text-slate-500 text-sm">Keyword Top 10 Count (6 weeks)</span>
                            </div>
                            <div className="h-48 bg-slate-100 rounded-lg flex items-center justify-center">
                                <span className="text-slate-500 text-sm">Keywords vs Ranking Heatmap</span>
                            </div>
                            <div className="h-48 bg-slate-100 rounded-lg flex items-center justify-center">
                                <span className="text-slate-500 text-sm">Engagement Trend</span>
                            </div>
                            <div className="h-48 bg-slate-100 rounded-lg flex items-center justify-center">
                                <span className="text-slate-500 text-sm">Conversion Funnel</span>
                            </div>
                            <div className="h-48 bg-slate-100 rounded-lg flex items-center justify-center">
                                <span className="text-slate-500 text-sm">Technical Score Trend</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceDashboard;