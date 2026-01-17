import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Award, AlertCircle, BarChart3, Users } from 'lucide-react';

interface PerformanceRanking {
    employee_id: string;
    employee_name: string;
    department: string;
    rank_position: number;
    completion_score: number;
    qc_score: number;
    contribution_score: number;
    performance_rating: string;
    trend: string;
}

interface BestPerformer {
    employee_id: string;
    employee_name: string;
    department: string;
    performance_score: number;
    achievement_percentage: number;
    period: string;
}

interface UnderperformingEmployee {
    employee_id: string;
    employee_name: string;
    department: string;
    current_score: number;
    target_score: number;
    gap: number;
    reason: string;
    status: string;
}

interface DepartmentSummary {
    department: string;
    average_performance: number;
    top_performer_name: string;
    underperformer_count: number;
    total_employees: number;
}

export default function EmployeeComparisonDashboard() {
    const [rankings, setRankings] = useState<PerformanceRanking[]>([]);
    const [bestPerformers, setBestPerformers] = useState<BestPerformer[]>([]);
    const [underperformers, setUnderperformers] = useState<UnderperformingEmployee[]>([]);
    const [departmentSummary, setDepartmentSummary] = useState<DepartmentSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ranking');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [rankingRes, bestRes, underRes, deptRes] = await Promise.all([
                fetch('/api/employee-comparison/ranking'),
                fetch('/api/employee-comparison/best-performers'),
                fetch('/api/employee-comparison/underperforming'),
                fetch('/api/employee-comparison/department-summary')
            ]);

            const [rankingData, bestData, underData, deptData] = await Promise.all([
                rankingRes.json(),
                bestRes.json(),
                underRes.json(),
                deptRes.json()
            ]);

            setRankings(rankingData);
            setBestPerformers(bestData);
            setUnderperformers(underData);
            setDepartmentSummary(deptData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRatingColor = (rating: string) => {
        switch (rating) {
            case 'Excellent': return 'bg-green-100 text-green-800';
            case 'Good': return 'bg-blue-100 text-blue-800';
            case 'Average': return 'bg-yellow-100 text-yellow-800';
            case 'Below Average': return 'bg-orange-100 text-orange-800';
            case 'Poor': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTrendIcon = (trend: string) => {
        if (trend === 'Up') return <TrendingUp className="text-green-600" size={18} />;
        if (trend === 'Down') return <TrendingDown className="text-red-600" size={18} />;
        return <TrendingUp className="text-gray-600" size={18} />;
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Employee Comparison Dashboard</h1>
                    <p className="text-gray-600 mt-1">Compare and analyze employee performance across the organization</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Employees</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {departmentSummary.reduce((sum, d) => sum + d.total_employees, 0)}
                                </p>
                            </div>
                            <Users className="text-blue-600" size={32} />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Best Performers</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">{bestPerformers.length}</p>
                            </div>
                            <Award className="text-green-600" size={32} />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Underperformers</p>
                                <p className="text-3xl font-bold text-red-600 mt-2">{underperformers.length}</p>
                            </div>
                            <AlertCircle className="text-red-600" size={32} />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Departments</p>
                                <p className="text-3xl font-bold text-purple-600 mt-2">{departmentSummary.length}</p>
                            </div>
                            <BarChart3 className="text-purple-600" size={32} />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="flex border-b">
                        {['ranking', 'best', 'underperforming', 'departments'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-3 font-medium transition ${activeTab === tab
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {tab === 'ranking' && 'Performance Ranking'}
                                {tab === 'best' && 'Best Performers'}
                                {tab === 'underperforming' && 'Underperforming'}
                                {tab === 'departments' && 'Department Summary'}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="text-center text-gray-500 py-8">Loading dashboard data...</div>
                        ) : (
                            <>
                                {/* Performance Ranking Tab */}
                                {activeTab === 'ranking' && (
                                    <div className="space-y-3">
                                        {rankings.length === 0 ? (
                                            <p className="text-gray-500 text-center py-8">No ranking data available</p>
                                        ) : (
                                            rankings.map((emp, idx) => (
                                                <div key={emp.employee_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                                            {emp.rank_position || idx + 1}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{emp.employee_name}</p>
                                                            <p className="text-sm text-gray-600">{emp.department}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <div className="text-right">
                                                            <p className="text-sm text-gray-600">Completion</p>
                                                            <p className="font-semibold text-gray-900">{emp.completion_score.toFixed(1)}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm text-gray-600">QC Score</p>
                                                            <p className="font-semibold text-gray-900">{emp.qc_score.toFixed(1)}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm text-gray-600">Contribution</p>
                                                            <p className="font-semibold text-gray-900">{emp.contribution_score.toFixed(1)}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRatingColor(emp.performance_rating)}`}>
                                                                {emp.performance_rating}
                                                            </span>
                                                            {getTrendIcon(emp.trend)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* Best Performers Tab */}
                                {activeTab === 'best' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {bestPerformers.length === 0 ? (
                                            <p className="col-span-full text-gray-500 text-center py-8">No best performers data available</p>
                                        ) : (
                                            bestPerformers.map((emp) => (
                                                <div key={emp.employee_id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{emp.employee_name}</p>
                                                            <p className="text-sm text-gray-600">{emp.department}</p>
                                                        </div>
                                                        <Award className="text-green-600" size={24} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-600">Performance Score</span>
                                                            <span className="font-semibold text-green-600">{emp.performance_score.toFixed(1)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-600">Achievement %</span>
                                                            <span className="font-semibold text-green-600">{emp.achievement_percentage.toFixed(1)}%</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-600">Period</span>
                                                            <span className="font-semibold text-gray-900">{emp.period}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* Underperforming Tab */}
                                {activeTab === 'underperforming' && (
                                    <div className="space-y-3">
                                        {underperformers.length === 0 ? (
                                            <p className="text-gray-500 text-center py-8">No underperforming employees detected</p>
                                        ) : (
                                            underperformers.map((emp) => (
                                                <div key={emp.employee_id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{emp.employee_name}</p>
                                                            <p className="text-sm text-gray-600">{emp.department}</p>
                                                        </div>
                                                        <AlertCircle className="text-red-600" size={24} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-600">Current Score</span>
                                                            <span className="font-semibold text-red-600">{emp.current_score.toFixed(1)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-600">Target Score</span>
                                                            <span className="font-semibold text-gray-900">{emp.target_score.toFixed(1)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-600">Gap</span>
                                                            <span className="font-semibold text-red-600">{emp.gap.toFixed(1)}</span>
                                                        </div>
                                                        {emp.reason && (
                                                            <div className="mt-2 pt-2 border-t border-red-200">
                                                                <p className="text-sm text-gray-700"><strong>Reason:</strong> {emp.reason}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* Department Summary Tab */}
                                {activeTab === 'departments' && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Department</th>
                                                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Avg Performance</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Top Performer</th>
                                                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Underperformers</th>
                                                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Total Employees</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {departmentSummary.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="text-center text-gray-500 py-8">No department data available</td>
                                                    </tr>
                                                ) : (
                                                    departmentSummary.map((dept) => (
                                                        <tr key={dept.department} className="border-b hover:bg-gray-50 transition">
                                                            <td className="py-3 px-4 font-medium text-gray-900">{dept.department}</td>
                                                            <td className="py-3 px-4 text-right">
                                                                <span className="font-semibold text-blue-600">{dept.average_performance.toFixed(1)}</span>
                                                            </td>
                                                            <td className="py-3 px-4 text-gray-700">{dept.top_performer_name || '-'}</td>
                                                            <td className="py-3 px-4 text-right">
                                                                <span className={`font-semibold ${dept.underperformer_count > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                                    {dept.underperformer_count}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 text-right font-semibold text-gray-900">{dept.total_employees}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
