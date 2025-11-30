
import React, { useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { ChartCard, BarChart } from '../components/Charts';
import { useData } from '../hooks/useData';

const CompetitorBacklinksView: React.FC = () => {
    const { data: backlinks, create: createBacklink, update: updateBacklink } = useData<any>('competitorBacklinks');
    const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
    const [newBacklink, setNewBacklink] = useState({
        domain: '', da: 0, competitor: '', us: 'No', opportunity_score: 50, status: 'Identified'
    });

    const gapData = backlinks;
    const chartData = [
        { id: 1, name: 'Competitor Only', value: backlinks.filter((b: any) => b.us === 'No').length },
        { id: 2, name: 'Shared', value: backlinks.filter((b: any) => b.us === 'Yes').length }
    ];

    const handleCreate = async () => {
        await createBacklink(newBacklink);
        setViewMode('list');
        setNewBacklink({ domain: '', da: 0, competitor: '', us: 'No', opportunity_score: 50, status: 'Identified' });
    };

    const handleOutreach = async (item: any) => {
        await updateBacklink(item.id, { status: 'Outreach Sent' });
        alert("Marked as Outreach Sent");
    };

    const columns = [
        { header: 'Domain', accessor: 'domain', className: 'font-bold' },
        { header: 'DA', accessor: 'da' },
        { header: 'Competitor', accessor: 'competitor', className: 'text-slate-600' },
        { header: 'We Have Link?', accessor: (item: any) => <span className={item.us === 'Yes' ? 'text-green-600 font-bold' : 'text-red-400'}>{item.us}</span> },
        { header: 'Status', accessor: (item: any) => <span className="text-xs bg-slate-100 px-2 py-1 rounded">{item.status}</span> },
        { 
            header: 'Action', 
            accessor: (item: any) => (
                <button onClick={() => handleOutreach(item)} className="text-blue-600 text-xs hover:underline font-bold">
                    Start Outreach
                </button>
            ) 
        }
    ];

    if (viewMode === 'create') {
        return (
            <div className="h-full flex flex-col w-full p-6 animate-fade-in">
                <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full">
                    <div className="border-b border-slate-200 px-8 py-5 flex justify-between items-center bg-slate-50/50 w-full">
                        <h2 className="text-2xl font-bold text-slate-800">Add Backlink Gap</h2>
                        <div className="flex gap-3">
                            <button onClick={() => setViewMode('list')} className="px-5 py-2.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50">Cancel</button>
                            <button onClick={handleCreate} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-indigo-700">Save</button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 w-full">
                        <div className="w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Domain</label>
                                    <input type="text" value={newBacklink.domain} onChange={e => setNewBacklink({...newBacklink, domain: e.target.value})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Competitor</label>
                                    <input type="text" value={newBacklink.competitor} onChange={e => setNewBacklink({...newBacklink, competitor: e.target.value})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">DA Score</label>
                                    <input type="number" value={newBacklink.da} onChange={e => setNewBacklink({...newBacklink, da: parseInt(e.target.value)})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">We Have Link?</label>
                                    <select value={newBacklink.us} onChange={e => setNewBacklink({...newBacklink, us: e.target.value})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl bg-white">
                                        <option>Yes</option><option>No</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Opportunity Score</label>
                                    <input type="number" value={newBacklink.opportunity_score} onChange={e => setNewBacklink({...newBacklink, opportunity_score: parseInt(e.target.value)})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col w-full p-6 animate-fade-in">
            <div className="flex justify-between items-start flex-shrink-0 w-full mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Competitor Backlinks</h1>
                    <p className="text-slate-500 mt-1">Analyze backlink gaps and find new opportunities.</p>
                </div>
                <button onClick={() => setViewMode('create')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
                    + Add Analysis Data
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-shrink-0 w-full mb-6">
                <ChartCard title="Gap Analysis Summary" className="w-full">
                    {chartData.length > 0 ? (
                        <BarChart data={chartData} color="bg-indigo-500" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-400">No competitor data available.</div>
                    )}
                </ChartCard>
                <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100 flex items-center justify-center w-full">
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-slate-700 mb-2">Gap Opportunities</h3>
                        <p className="text-5xl font-bold text-indigo-600">{gapData.filter((b:any) => b.us === 'No').length}</p>
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
