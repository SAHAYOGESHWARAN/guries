import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

interface DashboardData {
    summary: {
        completion: number;
        pass_rate: number;
        total_tasks: number;
        qc_compliance: number;
        rework: number;
    };
    byDepartment: Array<{ department: string; completion: number }>;
    trends: Array<{ week_number: number; effort_percentage: number }>;
    heatmap: Array<{ team_name: string; week_number: number; performance_percentage: number }>;
    qcStages: Array<{ stage_name: string; score_percentage: number }>;
    sla: Array<{ team_name: string; missed_count: number; delay_days: number }>;
}

export default function EffortAnalyticsDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [department, setDepartment] = useState('All Departments');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/analytics-dashboard/effort-dashboard');
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

    const getStatusColor = (value: number, threshold: number = 80) => {
        if (value >= threshold) return 'text-green-600';
        if (value >= threshold - 10) return 'text-orange-600';
        return 'text-red-600';
    };

    const getStatusBg = (value: number, threshold: number = 80) => {
        if (value >= threshold) return 'bg-green-50';
        if (value >= threshold - 10) return 'bg-orange-50';
        return 'bg-red-50';
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Effort Analytics Dashboard</h1>
                        <p className="text-gray-600 mt-1">Track team productivity and effort metrics</p>
                    </div>
                    <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option>All Departments</option>
                        {data.byDepartment.map(dept => (
                            <option key={dept.department} value={dept.department}>
                                {dept.department}
                            </option>
                        ))}
                    </select>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-5 gap-4 mb-6">
                    <div className={`${getStatusBg(data.summary.completion)} rounded-lg p-4 border border-gray-200`}>
                        <p className="text-sm text-gray-600 mb-1">Effort Completion %</p>
                        <p className={`text-3xl font-bold ${getStatusColor(data.summary.completion)}`}>
                            {Math.round(data.summary.completion)}%
                        </p>
                        <p className="text-xs text-gray-500 mt-2">On Track</p>
                    </div>

                    <div className={`${getStatusBg(data.summary.pass_rate)} rounded-lg p-4 border border-gray-200`}>
                        <p className="text-sm text-gray-600 mb-1">Effort Pass %</p>
                        <p className={`text-3xl font-bold ${getStatusColor(data.summary.pass_rate)}`}>
                            {Math.round(data.summary.pass_rate)}%
                        </p>
                        <p className="text-xs text-gray-500 mt-2">On Track</p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Total Tasks Completed</p>
                        <p className="text-3xl font-bold text-blue-600">{data.summary.total_tasks}</p>
                        <p className="text-xs text-gray-500 mt-2">Good</p>
                    </div>

                    <div className={`${getStatusBg(data.summary.qc_compliance)} rounded-lg p-4 border border-gray-200`}>
                        <p className="text-sm text-gray-600 mb-1">QC Compliance %</p>
                        <p className={`text-3xl font-bold ${getStatusColor(data.summary.qc_compliance)}`}>
                            {Math.round(data.summary.qc_compliance)}%
                        </p>
                        <p className="text-xs text-gray-500 mt-2">On Track</p>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Rework %</p>
                        <p className="text-3xl font-bold text-orange-600">{Math.round(data.summary.rework)}%</p>
                        <p className="text-xs text-gray-500 mt-2">Warning</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Team Performance Heatmap */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Performance Heatmap</h2>
                        <div className="space-y-2">
                            {data.heatmap.slice(0, 5).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <span className="text-sm text-gray-600 w-24">{item.team_name}</span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                                        <div
                                            className={`h-full ${item.performance_percentage >= 80
                                                    ? 'bg-green-500'
                                                    : item.performance_percentage >= 60
                                                        ? 'bg-yellow-500'
                                                        : 'bg-red-500'
                                                }`}
                                            style={{ width: `${item.performance_percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 w-12">
                                        {Math.round(item.performance_percentage)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* QC Performance by Stage */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">QC Performance by Stage</h2>
                        <div className="space-y-3">
                            {data.qcStages.map((stage, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">{stage.stage_name}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-32 bg-gray-200 rounded-full h-4 overflow-hidden">
                                            <div
                                                className="h-full bg-green-500"
                                                style={{ width: `${stage.score_percentage}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 w-12">
                                            {Math.round(stage.score_percentage)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SLA Misses and Effort Trends */}
                <div className="grid grid-cols-2 gap-6">
                    {/* SLA Misses/Delays */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">SLA Misses / Delays</h2>
                        <div className="space-y-3">
                            {data.sla.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-700">{item.team_name}</span>
                                    <div className="flex gap-4">
                                        <span className="text-sm font-medium text-red-600">
                                            {item.missed_count} missed
                                        </span>
                                        <span className="text-sm font-medium text-orange-600">
                                            {item.delay_days} days
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Effort Trends */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Effort Trends (Last 12 Weeks)</h2>
                        <div className="flex items-end gap-2 h-40">
                            {data.trends.map((trend, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center">
                                    <div
                                        className="w-full bg-blue-500 rounded-t"
                                        style={{ height: `${(trend.effort_percentage / 100) * 120}px` }}
                                    />
                                    <span className="text-xs text-gray-600 mt-2">W{trend.week_number}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
