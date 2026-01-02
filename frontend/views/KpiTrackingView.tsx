
import React from 'react';
import { useData } from '../hooks/useData';
import { ChartCard } from '../components/Charts';
import type { PerformanceMetric } from '../types';

const KpiTrackingView: React.FC = () => {
    const { data: metrics } = useData<PerformanceMetric>('dashboardMetrics');

    return (
        <div className="space-y-6 h-full flex flex-col w-full p-6 animate-fade-in overflow-y-auto">
            <div className="flex justify-between items-start flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">KPI Tracking</h1>
                    <p className="text-slate-500 mt-1">Real-time performance metrics against targets.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics.map(kpi => (
                    <div key={kpi.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">{kpi.kpi_name}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${kpi.status === 'On Track' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {kpi.status}
                            </span>
                        </div>
                        <div className="flex items-end space-x-2 mb-2">
                            <span className="text-3xl font-bold text-slate-800">{kpi.current}</span>
                            <span className="text-sm text-slate-400 mb-1">/ {kpi.target}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                            <div 
                                className={`h-2 rounded-full ${kpi.percent_achieved >= 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                                style={{ width: `${Math.min(kpi.percent_achieved, 100)}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>vs Baseline: {kpi.baseline}</span>
                            <span className={kpi.delta.includes('+') ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{kpi.delta}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KpiTrackingView;
