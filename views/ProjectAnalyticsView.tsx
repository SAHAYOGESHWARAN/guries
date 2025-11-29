
import React, { useState } from 'react';
import Table from '../components/Table';
import { ChartCard, LineChart, DonutChart, BarChart } from '../components/Charts';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { PerformanceMetric, Brand, OKRItem } from '../types';

const ProjectAnalyticsView: React.FC = () => {
    const { data: metrics, refresh } = useData<PerformanceMetric>('dashboardMetrics');
    const { data: brands } = useData<Brand>('brands');
    const { data: okrs } = useData<OKRItem>('okrs');

    const [selectedBrand, setSelectedBrand] = useState('All Brands');
    const [selectedDept, setSelectedDept] = useState('All Departments');
    const [timeRange, setTimeRange] = useState('Monthly');

    // -- Derived Data for Charts --
    
    // Simulate trend data based on metrics (in a real app, this comes from a history table)
    const trafficTrend = [
        { label: 'Jan', value: 12000 },
        { label: 'Feb', value: 15000 },
        { label: 'Mar', value: 14500 },
        { label: 'Apr', value: 18000 },
        { label: 'May', value: 22000 },
        { label: 'Jun', value: 25000 },
    ];

    const okrProgress = okrs.length > 0 
        ? Math.round(okrs.reduce((acc, item) => acc + item.progress, 0) / okrs.length)
        : 0;

    const metricsByStatus = [
        { id: 1, name: 'On Track', value: metrics.filter(m => m.status === 'On Track').length },
        { id: 2, name: 'At Risk', value: metrics.filter(m => m.status === 'Warning').length },
        { id: 3, name: 'Off Track', value: metrics.filter(m => m.status === 'Critical').length },
    ];

    // -- Handlers --

    const handleRefresh = () => {
        refresh();
    };

    const handleExport = () => {
        exportToCSV(metrics, 'performance_metrics_export');
    };

    const handleSaveView = () => {
        alert("View configuration saved to your profile.");
    };

    const columns = [
        { 
            header: 'KPI Name', 
            accessor: (item: PerformanceMetric) => (
                <div>
                    <div className="font-bold text-slate-800">{item.kpi_name}</div>
                    <div className="text-[10px] text-slate-500 uppercase">{item.metric_type}</div>
                </div>
            ) 
        },
        { header: 'Baseline', accessor: 'baseline' as keyof PerformanceMetric, className: 'text-slate-500 font-mono text-xs' },
        { header: 'Target', accessor: 'target' as keyof PerformanceMetric, className: 'font-medium text-slate-700' },
        { 
            header: 'Current', 
            accessor: (item: PerformanceMetric) => (
                <span className="font-bold text-slate-900">{item.current}</span>
            ) 
        },
        { 
            header: 'Delta', 
            accessor: (item: PerformanceMetric) => (
                <span className={`text-xs font-bold ${item.delta.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {item.delta}
                </span>
            ) 
        },
        { 
            header: 'Achievement', 
            accessor: (item: PerformanceMetric) => (
                <div className="w-24">
                    <div className="text-[10px] text-right mb-1 font-medium">{item.percent_achieved}%</div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div 
                            className={`h-1.5 rounded-full ${item.percent_achieved >= 100 ? 'bg-green-500' : item.percent_achieved >= 80 ? 'bg-blue-500' : 'bg-red-500'}`} 
                            style={{ width: `${Math.min(item.percent_achieved, 100)}%` }}
                        ></div>
                    </div>
                </div>
            ) 
        },
        { header: 'Gold Std.', accessor: 'gold_standard' as keyof PerformanceMetric, className: 'text-xs text-amber-600 font-medium' },
        { 
            header: 'Status', 
            accessor: (item: PerformanceMetric) => (
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    item.status === 'On Track' ? 'bg-green-50 text-green-700 border border-green-100' :
                    item.status === 'Warning' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                    'bg-red-50 text-red-700 border border-red-100'
                }`}>
                    {item.status}
                </span>
            ) 
        }
    ];

    return (
        <div className="space-y-6 h-full overflow-y-auto pr-1 p-6 animate-fade-in w-full">
            {/* Header & Controls */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Performance Dashboard</h1>
                        <p className="text-slate-500 mt-1 text-sm">OKR + KPI + Competitor + Gold Standard Analytics</p>
                    </div>
                    <div className="flex space-x-3">
                        <button onClick={handleSaveView} className="bg-white text-slate-600 border border-slate-300 px-4 py-2 rounded-lg font-medium text-xs hover:bg-slate-50 shadow-sm transition-colors">Save View</button>
                        <button onClick={handleExport} className="bg-white text-slate-600 border border-slate-300 px-4 py-2 rounded-lg font-medium text-xs hover:bg-slate-50 shadow-sm transition-colors">Export</button>
                        <button onClick={handleRefresh} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium text-xs hover:bg-indigo-700 shadow-sm transition-colors">Refresh</button>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">Brand Context</label>
                        <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm min-w-[160px] focus:ring-indigo-500 focus:border-indigo-500">
                            <option>All Brands</option>
                            {brands.map(b => <option key={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">Department</label>
                        <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm min-w-[160px] focus:ring-indigo-500 focus:border-indigo-500">
                            <option>All Departments</option>
                            <option>Marketing</option>
                            <option>SEO</option>
                            <option>Content</option>
                            <option>Dev</option>
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">Cycle</label>
                        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm min-w-[140px] focus:ring-indigo-500 focus:border-indigo-500">
                            <option>Monthly</option>
                            <option>Quarterly</option>
                            <option>Yearly</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: 'OKR Achievement', val: `${okrProgress}%`, sub: 'Avg across org', status: okrProgress > 70 ? 'On Track' : 'Lagging', color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Traffic Growth', val: '+24%', sub: 'vs last cycle', status: 'Good', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Ranking Improvement', val: '15', sub: 'Top 10 Keywords', status: 'On Track', color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Engagement Score', val: '88%', sub: '+3%', status: 'On Track', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Conversion Rate', val: '2.4%', sub: '-0.2%', status: 'Warning', color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Cost Per Lead', val: '$45', sub: '-$5', status: 'Excellent', color: 'text-blue-600', bg: 'bg-blue-50' },
                ].map((card, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 truncate group-hover:text-indigo-600 transition-colors">{card.label}</p>
                        <h3 className="text-2xl font-bold text-slate-800 mb-1">{card.val}</h3>
                        <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold ${card.color}`}>{card.sub}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${card.bg} ${card.color}`}>{card.status}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-80">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800 text-sm">Traffic vs Target Trend</h3>
                        <div className="flex gap-2">
                            <span className="flex items-center text-xs text-slate-500"><span className="w-2 h-2 rounded-full bg-indigo-500 mr-1"></span> Actual</span>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <LineChart data={trafficTrend} color="text-indigo-500" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 text-sm mb-4">Metric Health Distribution</h3>
                    <div className="h-64 flex items-center justify-center">
                        {metrics.length > 0 ? (
                            <DonutChart value={Math.round((metrics.filter(m => m.status === 'On Track').length / metrics.length) * 100)} color="text-emerald-500" label="Healthy" size={140} />
                        ) : (
                            <div className="text-slate-400 text-xs italic">No data available</div>
                        )}
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                        {metricsByStatus.map(s => (
                            <div key={s.id} className="text-center">
                                <div className="text-lg font-bold text-slate-800">{s.value}</div>
                                <div className="text-[10px] text-slate-500 uppercase">{s.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* KPI Analytics Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-h-[400px]">
                <Table 
                    columns={columns} 
                    data={metrics} 
                    title="Detailed Performance Metrics" 
                    emptyMessage="No performance metrics tracked. Configure them in the Settings."
                />
            </div>
        </div>
    );
};

export default ProjectAnalyticsView;
