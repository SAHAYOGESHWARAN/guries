/**
 * Rework Indicator Component
 * 
 * Displays a prominent rework indicator for assets that need user attention.
 * Shows rework count and allows users to edit and resubmit.
 */

import React from 'react';
import type { AssetLibraryItem } from '../types';

interface ReworkIndicatorProps {
    asset: AssetLibraryItem;
    onEdit?: (asset: AssetLibraryItem) => void;
    onResubmit?: (asset: AssetLibraryItem) => void;
    compact?: boolean;
}

const ReworkIndicator: React.FC<ReworkIndicatorProps> = ({
    asset,
    onEdit,
    onResubmit,
    compact = false
}) => {
    const isRework = asset.status === 'Rework Required';
    const reworkCount = asset.rework_count || 0;

    if (!isRework) return null;

    if (compact) {
        return (
            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-orange-100 border border-orange-300 rounded-full">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                <span className="text-xs font-bold text-orange-700">REWORK</span>
                {reworkCount > 0 && (
                    <span className="text-xs font-medium text-orange-600">({reworkCount})</span>
                )}
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-4">
                {/* Animated Icon */}
                <div className="flex-shrink-0">
                    <div className="relative">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                        <span className="absolute -top-1 -right-1 flex h-5 w-5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-orange-500 text-white text-xs font-bold items-center justify-center">
                                {reworkCount}
                            </span>
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-bold text-orange-800">Rework Required</h4>
                        <span className="px-2 py-0.5 bg-orange-200 text-orange-800 text-xs font-bold rounded-full">
                            {reworkCount} {reworkCount === 1 ? 'time' : 'times'}
                        </span>
                    </div>
                    <p className="text-sm text-orange-700 mb-3">
                        This asset has been sent back for revisions. Please review the QC feedback and make the necessary updates.
                    </p>

                    {/* QC Remarks if available */}
                    {asset.qc_remarks && (
                        <div className="bg-white/60 rounded-lg p-3 mb-3 border border-orange-200">
                            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">QC Feedback</p>
                            <p className="text-sm text-slate-700">{asset.qc_remarks}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        {onEdit && (
                            <button
                                onClick={() => onEdit(asset)}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Asset
                            </button>
                        )}
                        {onResubmit && (
                            <button
                                onClick={() => onResubmit(asset)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Resubmit for QC
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReworkIndicator;
