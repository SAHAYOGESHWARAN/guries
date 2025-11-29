
import React from 'react';
import Table from '../components/Table';
import { useData } from '../hooks/useData';
import { SparkIcon } from '../constants';
import type { WorkloadForecast } from '../types';

const WorkloadPredictionView: React.FC = () => {
    const { data: workload } = useData<WorkloadForecast>('workload');

    const columns = [
        { header: 'Employee', accessor: 'name' as keyof WorkloadForecast, className: 'font-bold' },
        { header: 'Role', accessor: 'role' as keyof WorkloadForecast },
        { header: 'Current Load', accessor: 'currentLoad' as keyof WorkloadForecast, className: 'text-center' },
        { header: 'Predicted Load', accessor: 'predictedLoad' as keyof WorkloadForecast, className: 'text-center font-bold' },
        { 
            header: 'Utilization', 
            accessor: (item: WorkloadForecast) => (
                <div className="w-24">
                    <div className="text-xs mb-1 text-right">{item.utilization}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${item.utilization > 100 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(item.utilization, 100)}%` }}></div>
                    </div>
                </div>
            ) 
        },
        { 
            header: 'Risk', 
            accessor: (item: WorkloadForecast) => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${item.riskLevel === 'High' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {item.riskLevel}
                </span>
            ) 
        }
    ];

    return (
        <div className="space-y-6 h-full flex flex-col w-full p-6 animate-fade-in">
            <div className="flex justify-between items-start flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Workload Prediction</h1>
                    <p className="text-slate-500 mt-1">AI-driven capacity planning and burnout prevention.</p>
                </div>
                <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg flex items-center border border-purple-100 shadow-sm">
                    <SparkIcon />
                    <span className="ml-2 font-bold text-sm">AI Insight: 2 employees at risk of burnout next week.</span>
                </div>
            </div>

            <div className="flex-1 overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200">
                <Table columns={columns} data={workload} title="Capacity Forecast" />
            </div>
        </div>
    );
};

export default WorkloadPredictionView;
