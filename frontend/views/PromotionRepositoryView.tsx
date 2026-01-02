
import React from 'react';
import Table from '../components/Table';
import { useData } from '../hooks/useData';
import { getStatusBadge } from '../constants';
import type { ContentRepositoryItem } from '../types';

const PromotionRepositoryView: React.FC = () => {
    // Only fetch items ready for promotion
    const { data: content } = useData<ContentRepositoryItem>('promotionItems'); 

    const columns = [
        { header: 'Title', accessor: 'content_title_clean' as keyof ContentRepositoryItem, className: 'font-bold' },
        { header: 'Type', accessor: 'asset_type' as keyof ContentRepositoryItem },
        { header: 'URL', accessor: (item: ContentRepositoryItem) => <a href={item.full_url} className="text-blue-600 hover:underline text-xs">{item.full_url}</a> },
        { header: 'Channels', accessor: (item: ContentRepositoryItem) => item.promotion_channels?.join(', ') || 'None', className: 'text-xs' },
        { header: 'Status', accessor: (item: ContentRepositoryItem) => getStatusBadge(item.status) },
        { 
            header: 'Actions', 
            accessor: (item: ContentRepositoryItem) => (
                <button className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 font-bold">
                    Create Social Post
                </button>
            )
        }
    ];

    return (
        <div className="h-full flex flex-col w-full p-6 animate-fade-in">
            <div className="flex justify-between items-start flex-shrink-0 w-full mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Promotion Repository</h1>
                    <p className="text-slate-500 mt-1">Assets approved and ready for distribution.</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200 w-full">
                <div className="flex-1 overflow-hidden w-full">
                    <Table columns={columns} data={content} title="Ready to Promote" />
                </div>
            </div>
        </div>
    );
};

export default PromotionRepositoryView;
