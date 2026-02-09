/**
 * User Asset Submissions Component
 * 
 * Shows assets submitted by the current user with clear status indicators.
 * Highlights assets that need rework with prominent visual cues.
 */

import React, { useState, useEffect } from 'react';
import ReworkIndicator from './ReworkIndicator';
import { getStatusBadge } from '../constants';
import type { AssetLibraryItem, User } from '../types';

interface UserAssetSubmissionsProps {
    currentUserId: number;
    onEdit?: (asset: AssetLibraryItem) => void;
    onResubmit?: (asset: AssetLibraryItem) => void;
    onViewDetails?: (asset: AssetLibraryItem) => void;
}

const UserAssetSubmissions: React.FC<UserAssetSubmissionsProps> = ({
    currentUserId,
    onEdit,
    onResubmit,
    onViewDetails
}) => {
    const [submissions, setSubmissions] = useState<AssetLibraryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'rework' | 'pending' | 'approved' | 'rejected'>('all');

    useEffect(() => {
        fetchSubmissions();
    }, [currentUserId]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/v1/assetLibrary');
            if (response.ok) {
                const data = await response.json();
                // Filter to only show assets submitted by current user
                const userSubmissions = (data || []).filter((asset: AssetLibraryItem) =>
                    asset.submitted_by === currentUserId || asset.created_by === currentUserId
                );
                setSubmissions(userSubmissions);
            }
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSubmissions = (submissions || []).filter(asset => {
        if (!asset) return false;
        switch (filter) {
            case 'rework':
                return asset.status === 'Rework Required';
            case 'pending':
                return asset.status === 'Pending QC Review';
            case 'approved':
                return asset.status === 'QC Approved';
            case 'rejected':
                return asset.status === 'QC Rejected';
            default:
                return true;
        }
    });

    const reworkCount = (submissions || []).filter(a => a.status === 'Rework Required').length;
    const pendingCount = (submissions || []).filter(a => a.status === 'Pending QC Review').length;
    const approvedCount = (submissions || []).filter(a => a.status === 'QC Approved').length;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'QC Approved':
                return <span className="text-green-500">✓</span>;
            case 'Pending QC Review':
                return <span className="text-amber-500">⏳</span>;
            case 'Rework Required':
                return <span className="text-orange-500">↻</span>;
            case 'QC Rejected':
                return <span className="text-red-500">✗</span>;
            default:
                return <span className="text-slate-400">○</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-slate-500">Loading your submissions...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`p-4 rounded-xl border-2 transition-all ${filter === 'all'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                >
                    <div className="text-2xl font-bold text-slate-900">{submissions.length}</div>
                    <div className="text-sm text-slate-600">Total Submissions</div>
                </button>

                <button
                    onClick={() => setFilter('rework')}
                    className={`p-4 rounded-xl border-2 transition-all ${filter === 'rework'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-orange-600">{reworkCount}</div>
                        {reworkCount > 0 && (
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                            </span>
                        )}
                    </div>
                    <div className="text-sm text-orange-700">Needs Rework</div>
                </button>

                <button
                    onClick={() => setFilter('pending')}
                    className={`p-4 rounded-xl border-2 transition-all ${filter === 'pending'
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                >
                    <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
                    <div className="text-sm text-amber-700">Pending Review</div>
                </button>

                <button
                    onClick={() => setFilter('approved')}
                    className={`p-4 rounded-xl border-2 transition-all ${filter === 'approved'
                        ? 'border-green-500 bg-green-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                >
                    <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                    <div className="text-sm text-green-700">Approved</div>
                </button>
            </div>

            {/* Rework Alert Banner */}
            {reworkCount > 0 && filter !== 'rework' && (
                <div
                    onClick={() => setFilter('rework')}
                    className="bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-300 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <span className="text-2xl">⚠️</span>
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 text-white text-xs font-bold items-center justify-center">
                                    {reworkCount}
                                </span>
                            </span>
                        </div>
                        <div>
                            <p className="font-bold text-orange-800">
                                You have {reworkCount} asset{reworkCount > 1 ? 's' : ''} that need{reworkCount === 1 ? 's' : ''} rework
                            </p>
                            <p className="text-sm text-orange-700">Click to view and update them</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Submissions List */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="font-bold text-slate-900">
                        {filter === 'all' ? 'All Submissions' :
                            filter === 'rework' ? 'Assets Needing Rework' :
                                filter === 'pending' ? 'Pending QC Review' :
                                    filter === 'approved' ? 'Approved Assets' : 'Rejected Assets'}
                    </h3>
                </div>

                {filteredSubmissions.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">📄</span>
                        </div>
                        <p className="text-slate-500">No submissions found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredSubmissions.map(asset => (
                            <div
                                key={asset.id}
                                className={`p-4 hover:bg-slate-50 transition-colors ${asset.status === 'Rework Required' ? 'bg-orange-50/50' : ''
                                    }`}
                            >
                                {/* Rework Indicator for assets needing rework */}
                                {asset.status === 'Rework Required' && (
                                    <div className="mb-3">
                                        <ReworkIndicator
                                            asset={asset}
                                            onEdit={onEdit}
                                            onResubmit={onResubmit}
                                        />
                                    </div>
                                )}

                                {/* Asset Info Row */}
                                {asset.status !== 'Rework Required' && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                                {getStatusIcon(asset.status || 'Draft')}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-slate-900">{asset.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-slate-500">
                                                        {asset.type} • {asset.application_type?.toUpperCase()}
                                                    </span>
                                                    {getStatusBadge(asset.status || 'Draft')}
                                                    {asset.qc_score && (
                                                        <span className="text-xs text-slate-500">
                                                            Score: {asset.qc_score}/100
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {onViewDetails && (
                                                <button
                                                    onClick={() => onViewDetails(asset)}
                                                    className="px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
                                                >
                                                    View
                                                </button>
                                            )}
                                            {asset.status === 'Pending QC Review' && onEdit && (
                                                <button
                                                    onClick={() => onEdit(asset)}
                                                    className="px-3 py-1.5 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserAssetSubmissions;
