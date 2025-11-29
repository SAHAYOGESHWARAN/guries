
import React, { useState } from 'react';
import Table from '../components/Table';
import { useData } from '../hooks/useData';
import { getStatusBadge } from '../constants';
import type { UxIssue } from '../types';

const UxIssuesView: React.FC = () => {
    const { data: issues, create: createIssue } = useData<UxIssue>('uxIssues');
    const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
    const [newIssue, setNewIssue] = useState<Partial<UxIssue>>({ title: '', url: '', severity: 'Medium', device: 'Desktop', status: 'Open' });

    const handleCreate = async () => {
        await createIssue(newIssue as any);
        setViewMode('list');
        setNewIssue({ title: '', url: '', severity: 'Medium', device: 'Desktop', status: 'Open' });
    };

    const columns = [
        { header: 'Issue', accessor: 'title' as keyof UxIssue, className: 'font-bold' },
        { header: 'Page', accessor: 'url' as keyof UxIssue, className: 'text-xs text-blue-600' },
        { header: 'Device', accessor: 'device' as keyof UxIssue },
        { header: 'Severity', accessor: (item: UxIssue) => <span className={`font-bold ${item.severity === 'High' ? 'text-red-600' : 'text-yellow-600'}`}>{item.severity}</span> },
        { header: 'Status', accessor: (item: UxIssue) => getStatusBadge(item.status) }
    ];

    if (viewMode === 'create') {
        return (
            <div className="h-full flex flex-col w-full p-6 animate-fade-in">
                <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full">
                    <div className="border-b border-slate-200 px-8 py-5 flex justify-between items-center bg-slate-50/50 w-full">
                        <h2 className="text-2xl font-bold text-slate-800">Report UX Issue</h2>
                        <div className="flex gap-3">
                            <button onClick={() => setViewMode('list')} className="px-5 py-2.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                            <button onClick={handleCreate} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-indigo-700">Submit Report</button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 w-full">
                        <div className="w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 w-full">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Issue Title</label>
                                <input type="text" placeholder="e.g. Mobile Menu overlapping" className="block w-full px-4 py-3 border border-slate-300 rounded-xl" value={newIssue.title} onChange={e => setNewIssue({...newIssue, title: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Page URL</label>
                                <input type="text" placeholder="https://..." className="block w-full px-4 py-3 border border-slate-300 rounded-xl" value={newIssue.url} onChange={e => setNewIssue({...newIssue, url: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Device</label>
                                    <select className="block w-full px-4 py-3 border border-slate-300 rounded-xl" value={newIssue.device} onChange={e => setNewIssue({...newIssue, device: e.target.value})}>
                                        <option>Desktop</option><option>Mobile</option><option>Tablet</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Severity</label>
                                    <select className="block w-full px-4 py-3 border border-slate-300 rounded-xl" value={newIssue.severity} onChange={e => setNewIssue({...newIssue, severity: e.target.value})}>
                                        <option>High</option><option>Medium</option><option>Low</option>
                                    </select>
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
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">UX Issues</h1>
                    <p className="text-slate-500 mt-1">Track usability problems and visual bugs.</p>
                </div>
                <button onClick={() => setViewMode('create')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
                    + Report Issue
                </button>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200 w-full">
                <div className="flex-1 overflow-hidden w-full">
                    <Table columns={columns} data={issues} title="Issue Log" />
                </div>
            </div>
        </div>
    );
};

export default UxIssuesView;
