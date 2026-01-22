import React, { useState } from 'react';
import { useData } from '../hooks/useData';

const SubServiceMasterView: React.FC = () => {
    const { data: subServices = [] } = useData<any>('subServices');
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [isFormLoading, setIsFormLoading] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [searchQuery, setSearchQuery] = useState('');

    const handleCreateClick = () => {
        setIsFormLoading(true);
        setTimeout(() => {
            setFormData({});
            setViewMode('form');
            setIsFormLoading(false);
        }, 50);
    };

    const handleEdit = (item: any) => {
        setIsFormLoading(true);
        setTimeout(() => {
            setFormData(item);
            setViewMode('form');
            setIsFormLoading(false);
        }, 50);
    };

    const filteredData = subServices.filter((item: any) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (viewMode === 'form') {
        return (
            <div className="h-full flex flex-col bg-white">
                {isFormLoading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-sm font-medium text-slate-600">Loading form...</p>
                        </div>
                    </div>
                )}

                <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-white shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">
                        {formData.id ? 'Edit Sub-Service' : 'Add New Sub-Service'}
                    </h2>
                    <button
                        onClick={() => setViewMode('list')}
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    {!isFormLoading ? (
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="bg-white rounded-xl border-2 border-indigo-200 p-6">
                                <h3 className="text-lg font-bold text-indigo-900 mb-4">Sub-Service Details</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
                                        <input
                                            type="text"
                                            value={formData.name || ''}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Sub-service name"
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                                        <textarea
                                            value={formData.description || ''}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Sub-service description"
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-slate-600 font-medium">Loading form...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-slate-50">
            <div className="bg-white border-b border-slate-200 px-8 py-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Sub-Service Master</h1>
                        <p className="text-slate-500 mt-1">Manage sub-services and their configurations</p>
                    </div>
                    <button
                        onClick={handleCreateClick}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <span className="text-lg">+</span> Add New Sub-Service
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-8">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="p-6 border-b border-slate-200">
                        <input
                            type="search"
                            placeholder="Search sub-services..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Description</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-700 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length > 0 ? (
                                    filteredData.map((item: any) => (
                                        <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.name}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{item.description}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                                            No sub-services found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubServiceMasterView;
