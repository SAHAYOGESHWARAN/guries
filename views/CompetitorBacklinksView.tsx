
import React from 'react';
import Table from '../components/Table';
import { ChartCard, BarChart } from '../components/Charts';

const CompetitorBacklinksView: React.FC = () => {
    // In production, this would fetch from a `competitor_backlink_gaps` table populated by an SEO tool integration
    const gapData: any[] = []; 
    const chartData: any[] = [];

    const columns = [
        { header: 'Domain', accessor: 'domain' as any, className: 'font-bold' },
        { header: 'DA', accessor: 'da' as any },
        { header: 'Competitor Has Link?', accessor: (item: any) => <span className="text-red-600 font-bold">{item.competitor}</span> },
        { header: 'We Have Link?', accessor: (item: any) => <span className={item.us === 'Yes' ? 'text-green-600 font-bold' : 'text-slate-400'}>{item.us}</span> },
        { header: 'Action', accessor: () => <button className="text-blue-600 text-xs hover:underline">Outreach</button> }
    ];

    return (
        <div className="h-full flex flex-col w-full p-6 animate-fade-in">
            <div className="flex justify-between items-start flex-shrink-0 w-full mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Competitor Backlinks</h1>
                    <p className="text-slate-500 mt-1">Analyze backlink gaps and find new opportunities.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-shrink-0 w-full mb-6">
                <ChartCard title="Total Backlinks Comparison" className="w-full">
                    {chartData.length > 0 ? (
                        <BarChart data={chartData} color="bg-indigo-500" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-400">No competitor data available.</div>
                    )}
                </ChartCard>
                <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100 flex items-center justify-center w-full">
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-slate-700 mb-2">Gap Opportunities</h3>
                        <p className="text-5xl font-bold text-indigo-600">{gapData.length}</p>
                        <p className="text-xs text-slate-500 mt-2">High DA domains linking to competitors but not us</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200 w-full">
                <div className="flex-1 overflow-hidden w-full">
                    <Table columns={columns} data={gapData} title="Backlink Gap Analysis" emptyMessage="No backlink gaps found or analysis not run." />
                </div>
            </div>
        </div>
    );
};

export default CompetitorBacklinksView;
