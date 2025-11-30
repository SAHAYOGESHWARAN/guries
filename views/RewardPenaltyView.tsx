
import React from 'react';
import Table from '../components/Table';
import { useData } from '../hooks/useData';
import type { RewardRecommendation } from '../types';

const RewardPenaltyView: React.FC = () => {
    const { data: recommendations, update } = useData<RewardRecommendation>('rewards');

    const handleAction = async (id: number, status: string) => {
        if(confirm(`Are you sure you want to ${status} this reward?`)) {
            await update(id, { status });
        }
    };

    const columns = [
        { header: 'Employee', accessor: 'name' as keyof RewardRecommendation, className: 'font-bold' },
        { header: 'Tier', accessor: 'tier' as keyof RewardRecommendation, className: 'text-purple-700 font-medium' },
        { header: 'Score', accessor: 'score' as keyof RewardRecommendation, className: 'text-center' },
        { header: 'Bonus', accessor: (item: RewardRecommendation) => `$${item.recommendedBonus.toLocaleString()}`, className: 'text-green-600 font-bold' },
        { 
            header: 'Reason', 
            accessor: (item: RewardRecommendation) => Array.isArray(item.achievements) ? item.achievements.join(', ') : item.achievements, 
            className: 'text-xs text-slate-500' 
        },
        { 
            header: 'Status', 
            accessor: (item: RewardRecommendation) => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                    item.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                    item.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                }`}>
                    {item.status}
                </span>
            )
        },
        {
            header: 'Action',
            accessor: (item: RewardRecommendation) => (
                <div className="flex space-x-2">
                    {item.status === 'Pending' ? (
                        <>
                            <button onClick={() => handleAction(item.id, 'Approved')} className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">Approve</button>
                            <button onClick={() => handleAction(item.id, 'Rejected')} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300">Reject</button>
                        </>
                    ) : <span className="text-xs text-gray-400">Closed</span>}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 h-full flex flex-col w-full p-6 animate-fade-in">
            <div className="flex justify-between items-start flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Reward & Penalty System</h1>
                    <p className="text-slate-500 mt-1">Automated bonus recommendations based on performance tiers.</p>
                </div>
            </div>

            <div className="flex-1 overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200">
                <Table columns={columns} data={recommendations} title="Monthly Reward Recommendations" />
            </div>
        </div>
    );
};

export default RewardPenaltyView;
