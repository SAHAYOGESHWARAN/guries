import React, { useState, useEffect } from 'react';

interface EmployeeComparisonDashboardProps {
    onNavigate?: (view: string, id?: string) => void;
}

const EmployeeComparisonDashboard: React.FC<EmployeeComparisonDashboardProps> = ({ onNavigate }) => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('December 2024');

    useEffect(() => {
        fetchEmployeeComparison();
    }, [selectedPeriod]);

    const fetchEmployeeComparison = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/v1/dashboards/employee-comparison');
            const result = await response.json();
            if (result.success) {
                setEmployees(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching employee comparison:', error);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 h-full overflow-auto">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-slate-900">Employee Comparison</h1>
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                    >
                        <option>December 2024</option>
                        <option>November 2024</option>
                        <option>October 2024</option>
                    </select>
                </div>

                {employees.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <p className="text-slate-600">No employee data available for comparison</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-100 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Employee</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Performance</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Score</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {employees.map((emp: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-sm text-slate-900">{emp.name || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{emp.performance || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-900">{emp.score || 0}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {emp.status || 'Active'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeComparisonDashboard;
