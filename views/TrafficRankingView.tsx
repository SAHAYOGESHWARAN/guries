
import React from 'react';
import Table from '../components/Table';
import { ChartCard, LineChart } from '../components/Charts';
import { useData } from '../hooks/useData';
import type { Keyword } from '../types';

const TrafficRankingView: React.FC = () => {
    const { data: trafficData } = useData<{ date: string, value: number }>('traffic');
    const { data: keywords } = useData<Keyword>('keywords');
    
    const columns = [
        { header: 'Keyword', accessor: 'keyword' as any, className: 'font-bold' },
        { header: 'Search Vol', accessor: (item: Keyword) => item.search_volume?.toLocaleString() || '-', className: 'text-right' },
        { header: 'Competition', accessor: 'competition' as any, className: 'text-center' },
        { header: 'Status', accessor: 'status' as any, className: 'text-center uppercase text-xs font-bold' }
    ];

    const chartData = trafficData.map(d => ({ label: d.date, value: d.value }));

    return (
        <div className="space-y-6 h-full flex flex-col w-full p-6 animate-fade-in overflow-y-auto">
            <div className="flex justify-between items-start flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Traffic & Rankings</h1>
                    <p className="text-slate-500 mt-1">Organic search performance and keyword positions.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-80">
                    <ChartCard title="Organic Traffic Trend" className="h-full">
                        {chartData.length > 0 ? (
                            <LineChart data={chartData} color="text-indigo-600" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">No traffic data recorded.</div>
                        )}
                    </ChartCard>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Top Movers</h3>
                    <div className="space-y-4 text-center text-slate-500 text-sm italic">
                        {keywords.length === 0 ? "No keywords tracked." : "Tracking active..."}
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <Table columns={columns} data={keywords} title="Keyword Rankings" />
            </div>
        </div>
    );
};

export default TrafficRankingView;
