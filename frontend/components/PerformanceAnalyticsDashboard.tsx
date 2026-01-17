import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPIMetric {
    id: number;
    metric_name: string;
    metric_type: string;
    benchmark: number;
    current_value: number;
    target_value: number;
    delta: number;
    percentage_changed: number;
    gold_standard: number;
    competitor_avg: number;
    trend: string;
    status: string;
}

interface Keyword {
    keyword: string;
    rank_position: number;
    search_volume: number;
    traffic_count: number;
    conversion_count: number;
}

interface DashboardData {
    summary: {
        kpi_achievement: number;
        ranking_improvement: number;
        performance_score: number;
        engagement_score: number;
        traffic_growth: number;
        conversion_score: number;
    };
    kpiMetrics: KPIMetric[];
    topKeywords: Keyword[];
}

export default function PerformanceAnalyticsDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [department, setDepartment] = useState('All Departments');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/analytics-dashboard/performance-dashboard');
            const dashboardData = await response.json();
            setData(dashboardData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Loading dashboard...</div>;
    }

    if (!data) {
        return <div className="p-6 text-center text-gray-500">No data available</div>;
    }

    const getTrendIcon = (trend: string) => {
        return trend === 'up' ? (
            <TrendingUp className="text-green-600" size={18} />
        ) : trend === 'down' ? (
            <TrendingDown className="text-red-600" size={18} />
        ) : null;
    };

    const getStatusColor = (status: string) => {
        return status === 'on-track' ? 'text-green-600' : 'text-red-600';
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
                        <p className="text-gray-600 mt-1">Track KPI achievement and performance metrics</p>
                    </div>
                    <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option>All Departments</option>
                        <option>Marketing</option>
                        <option>Content</option>
                        <option>SEO</option>
                    </select>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-6 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">KPI Achievement %</p>
                        <p className="text-2xl font-bold text-green-600">{Math.round(data.summary.kpi_achievement)}%</p>
                        <p className="text-xs text-gray-500 mt-2">On Track</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Ranking Improvement</p>
                        <p className="text-2xl font-bold text-blue-600">{data.summary.ranking_improvement}</p>
                        <p className="text-xs text-gray-500 mt-2">Positions</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Performance Score %</p>
                        <p className="text-2xl font-bold text-blue-600">{Math.round(data.summary.performance_score)}%</p>
                        <p className="text-xs text-gray-500 mt-2">On Track</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Engagement Score</p>
                        <p className="text-2xl font-bold text-purple-600">{Math.round(data.summary.engagement_score)}%</p>
                        <p className="text-xs text-gray-500 mt-2">On Track</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Traffic Growth</p>
                        <p className="text-2xl font-bold text-green-600">+{Math.round(data.summary.traffic_growth)}%</p>
                        <p className="text-xs text-gray-500 mt-2">Last cycle</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Conversion Score</p>
                        <p className="text-2xl font-bold text-orange-600">{Math.round(data.summary.conversion_score)}%</p>
                        <p className="text-xs text-gray-500 mt-2">Warning</p>
                    </div>
                </div>

                {/* KPI Analytics Table */}
                <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold text-gray-900">KPI Analytics</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Metric Type</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Benchmark</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Current</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Target</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Delta</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">% Changed</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Gold Standard</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Competitor Avg</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Trend</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.kpiMetrics.map((metric) => (
                                    <tr key={metric.id} className="border-b hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{metric.metric_type}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{metric.benchmark}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{metric.current_value}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{metric.target_value}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{metric.delta}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{Math.round(metric.percentage_changed)}%</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{metric.gold_standard}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{metric.competitor_avg}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                {getTrendIcon(metric.trend)}
                                                <span className="text-xs text-gray-600">{metric.trend}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${metric.status === 'on-track'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {metric.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Keywords */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Keyword Top 10 Count (Last 6 Weeks)</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Keyword</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rank Position</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Search Volume</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Traffic Count</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Conversion Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topKeywords.map((keyword, idx) => (
                                    <tr key={idx} className="border-b hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{keyword.keyword}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{keyword.rank_position}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{keyword.search_volume}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{keyword.traffic_count}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{keyword.conversion_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
