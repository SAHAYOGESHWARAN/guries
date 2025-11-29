
import React from 'react';
import Table from '../components/Table';
import { useData } from '../hooks/useData';
import type { EmployeeRanking } from '../types';

const EmployeeComparisonView: React.FC = () => {
    const { data: rankings } = useData<EmployeeRanking>('employeeRankings');

    const columns = [
        { header: 'Rank', accessor: 'rank' as keyof EmployeeRanking, className: 'font-bold text-center' },
        { header: 'Employee', accessor: 'name' as keyof EmployeeRanking, className: 'font-medium' },
        { header: 'Role', accessor: 'role' as keyof EmployeeRanking },
        { header: 'Composite Score', accessor: 'composite_score' as keyof EmployeeRanking, className: 'font-bold text-blue-600 text-center' },
        { header: 'QC Score', accessor: 'qc_score' as keyof EmployeeRanking, className: 'text-center' },
        { header: 'Efficiency', accessor: 'performance_score' as keyof EmployeeRanking, className: 'text-center' },
        { header: 'Trend', accessor: (item: EmployeeRanking) => <span className={item.trend === 'Up' ? 'text-green-500' : 'text-red-500'}>{item.trend === 'Up' ? '↑' : '↓'}</span>, className: "text-center" }
    ];

    return (
        <div className="space-y-6 h-full flex flex-col w-full p-6 animate-fade-in">
            <div className="flex justify-between items-start flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Team Comparison</h1>
                    <p className="text-slate-500 mt-1">Benchmark employee performance metrics.</p>
                </div>
            </div>

            <div className="flex-1 overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200">
                <Table columns={columns} data={rankings} title="Performance Leaderboard" />
            </div>
        </div>
    );
};

export default EmployeeComparisonView;
