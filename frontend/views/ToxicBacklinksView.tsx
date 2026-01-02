
import React, { useState } from 'react';
import Table from '../components/Table';
import { useData } from '../hooks/useData';
import type { ToxicBacklink } from '../types';

const ToxicBacklinksView: React.FC = () => {
    const { data: toxicLinks, remove } = useData<ToxicBacklink>('toxicUrls');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredData = toxicLinks.filter(item => item.domain.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleDisavow = (id: number) => {
        alert("Added to Disavow file.");
    };

    const handleIgnore = async (id: number) => {
        await remove(id);
    };

    const columns = [
        { header: 'Domain', accessor: 'domain' as keyof ToxicBacklink, className: 'font-bold' },
        { header: 'Spam Score', accessor: 'spam_score' as keyof ToxicBacklink, className: 'text-red-600 font-bold' },
        { header: 'Anchor Text', accessor: 'anchor_text' as keyof ToxicBacklink, className: 'italic text-slate-500' },
        { header: 'Status', accessor: 'status' as keyof ToxicBacklink },
        {
            header: 'Actions',
            accessor: (item: ToxicBacklink) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleDisavow(item.id)} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded border border-red-200 hover:bg-red-100">Disavow</button>
                    <button onClick={() => handleIgnore(item.id)} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-200 hover:bg-gray-100">Ignore</button>
                </div>
            )
        }
    ];

    return (
        <div className="h-full flex flex-col w-full p-6 animate-fade-in">
            <div className="flex justify-between items-start flex-shrink-0 w-full mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Toxic Backlinks</h1>
                    <p className="text-slate-500 mt-1">Monitor and disavow harmful inbound links.</p>
                </div>
                <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
                    Export Disavow File
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex-shrink-0 w-full mb-6">
                <input 
                    type="search" 
                    className="block w-full p-2.5 border border-gray-300 rounded-lg" 
                    placeholder="Search toxic domains..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} 
                />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200 w-full">
                <div className="flex-1 overflow-hidden w-full">
                    <Table columns={columns} data={filteredData} title="Toxic Link Alerts" />
                </div>
            </div>
        </div>
    );
};

export default ToxicBacklinksView;
