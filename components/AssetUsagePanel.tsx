/**
 * Asset Usage Panel Component
 * 
 * Displays where and how the asset is used, fetched dynamically from usage records.
 * Includes:
 * - Website Usage (URLs)
 * - Social Media Usage (Platform + Post Links)
 * - Backlink Submissions (Domain + Approval Status)
 * - Engagement Metrics (Impressions, Clicks, CTR, Shares)
 * - Performance Summary
 */

import React from 'react';
import { useAssetUsage } from '../hooks/useAssetUsage';
import type { AssetLibraryItem, AssetWebsiteUsage, AssetSocialMediaUsage, AssetBacklinkUsage } from '../types';

interface AssetUsagePanelProps {
    asset: AssetLibraryItem;
    isAdmin?: boolean;
}

const AssetUsagePanel: React.FC<AssetUsagePanelProps> = ({ asset, isAdmin = false }) => {
    const { usageData, loading, error } = useAssetUsage(asset.id);

    // Platform icon/color mapping
    const getPlatformStyle = (platform: string) => {
        const platformLower = platform.toLowerCase();
        switch (platformLower) {
            case 'linkedin':
                return { bg: 'bg-blue-600', icon: 'Li', color: 'text-blue-600' };
            case 'twitter':
            case 'x':
                return { bg: 'bg-sky-500', icon: 'X', color: 'text-sky-500' };
            case 'facebook':
                return { bg: 'bg-blue-700', icon: 'Fb', color: 'text-blue-700' };
            case 'instagram':
                return { bg: 'bg-gradient-to-r from-purple-500 to-pink-500', icon: 'Ig', color: 'text-pink-500' };
            case 'youtube':
                return { bg: 'bg-red-600', icon: 'Yt', color: 'text-red-600' };
            case 'pinterest':
                return { bg: 'bg-red-500', icon: 'Pi', color: 'text-red-500' };
            default:
                return { bg: 'bg-slate-500', icon: platform.charAt(0).toUpperCase(), color: 'text-slate-500' };
        }
    };

    // Approval status badge
    const getApprovalStatusBadge = (status: string) => {
        switch (status) {
            case 'Approved':
                return 'bg-green-100 text-green-700';
            case 'Pending':
                return 'bg-amber-100 text-amber-700';
            case 'Rejected':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    // Format large numbers
    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-slate-500">Loading usage data...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <span className="text-red-600">Error loading usage data: {error}</span>
            </div>
        );
    }

    const websiteUrls = usageData?.website_urls || [];
    const socialPosts = usageData?.social_media_posts || [];
    const backlinks = usageData?.backlink_submissions || [];
    const metrics = usageData?.engagement_metrics || {
        total_impressions: 0,
        total_clicks: 0,
        total_shares: 0,
        ctr_percentage: 0,
        performance_summary: null
    };

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                <h3 className="text-sm font-semibold text-purple-800 flex items-center gap-2">
                    <span>📊</span> Usage Panel
                </h3>
                <p className="text-xs text-purple-600 mt-1">
                    Displays where and how the asset is used, fetched dynamically from usage records
                </p>
            </div>

            {/* Website URLs Section */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <span className="text-lg">🌐</span> Website URLs
                    </h3>
                </div>
                <div className="p-4">
                    {websiteUrls.length > 0 ? (
                        <div className="space-y-2">
                            {websiteUrls.map((usage: AssetWebsiteUsage) => (
                                <div key={usage.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className="text-indigo-500">🔗</span>
                                        <a
                                            href={usage.website_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm truncate"
                                            title={usage.website_url}
                                        >
                                            {usage.website_url}
                                        </a>
                                    </div>
                                    <a
                                        href={usage.website_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-400 hover:text-slate-600 p-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-4">
                            No website URLs linked to this asset yet.
                        </p>
                    )}
                </div>
            </div>

            {/* Social Media Posts Section */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <span className="text-lg">📱</span> Social Media Posts
                    </h3>
                </div>
                <div className="p-4">
                    {socialPosts.length > 0 ? (
                        <div className="space-y-2">
                            {socialPosts.map((post: AssetSocialMediaUsage) => {
                                const platformStyle = getPlatformStyle(post.platform_name);
                                return (
                                    <div key={post.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${platformStyle.bg}`}>
                                                {platformStyle.icon}
                                            </div>
                                            <div>
                                                <span className="font-medium text-slate-900">{post.platform_name}</span>
                                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${post.status === 'Published' ? 'bg-green-100 text-green-700' :
                                                        post.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-slate-100 text-slate-700'
                                                    }`}>
                                                    {post.status}
                                                </span>
                                            </div>
                                        </div>
                                        {post.post_url ? (
                                            <a
                                                href={post.post_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                            >
                                                View Post
                                            </a>
                                        ) : (
                                            <span className="text-slate-400 text-sm">No link</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-4">
                            No social media posts linked to this asset yet.
                        </p>
                    )}
                </div>
            </div>

            {/* Backlink Submissions Section */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <span className="text-lg">🔗</span> Backlink Submissions
                    </h3>
                </div>
                <div className="p-4">
                    {backlinks.length > 0 ? (
                        <div className="space-y-2">
                            {backlinks.map((backlink: AssetBacklinkUsage) => (
                                <div key={backlink.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-500">🔗</span>
                                        <span className="font-medium text-slate-900">{backlink.domain_name}</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getApprovalStatusBadge(backlink.approval_status)}`}>
                                        {backlink.approval_status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-4">
                            No backlink submissions for this asset yet.
                        </p>
                    )}
                </div>
            </div>

            {/* Engagement Metrics Section */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <span className="text-lg">📈</span> Engagement Metrics
                    </h3>
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Impressions */}
                        <div className="text-center p-4 bg-indigo-50 rounded-lg">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <span className="text-indigo-500">📊</span>
                                <span className="text-xs text-indigo-600 uppercase tracking-wide font-medium">Impressions</span>
                            </div>
                            <div className="text-2xl font-bold text-indigo-700">
                                {formatNumber(metrics.total_impressions)}
                            </div>
                        </div>

                        {/* Clicks */}
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <span className="text-green-500">👆</span>
                                <span className="text-xs text-green-600 uppercase tracking-wide font-medium">Clicks</span>
                            </div>
                            <div className="text-2xl font-bold text-green-700">
                                {formatNumber(metrics.total_clicks)}
                            </div>
                        </div>

                        {/* CTR */}
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <span className="text-purple-500">📈</span>
                                <span className="text-xs text-purple-600 uppercase tracking-wide font-medium">CTR</span>
                            </div>
                            <div className="text-2xl font-bold text-purple-700">
                                {typeof metrics.ctr_percentage === 'number' ? metrics.ctr_percentage.toFixed(1) : '0'}%
                            </div>
                        </div>

                        {/* Shares */}
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <span className="text-orange-500">🔄</span>
                                <span className="text-xs text-orange-600 uppercase tracking-wide font-medium">Shares</span>
                            </div>
                            <div className="text-2xl font-bold text-orange-700">
                                {formatNumber(metrics.total_shares)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Summary Section */}
            {metrics.performance_summary && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 overflow-hidden">
                    <div className="bg-blue-100/50 px-4 py-3 border-b border-blue-200">
                        <h3 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                            <span className="text-lg">📋</span> Performance Summary
                        </h3>
                    </div>
                    <div className="p-4">
                        <p className="text-sm text-blue-800">{metrics.performance_summary}</p>
                    </div>
                </div>
            )}

            {/* Keywords Section */}
            {asset.keywords && asset.keywords.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <span className="text-lg">🏷️</span> Keywords Tagged
                        </h3>
                    </div>
                    <div className="p-4">
                        <div className="flex flex-wrap gap-2">
                            {asset.keywords.map((keyword, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium flex items-center gap-1"
                                >
                                    <span className="text-indigo-400">◇</span>
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Actions Section */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <span className="text-lg">⬇️</span> Actions
                    </h3>
                </div>
                <div className="p-4 flex flex-wrap gap-3">
                    {(asset.file_url || asset.thumbnail_url) && (
                        <>
                            <button
                                onClick={() => {
                                    const url = asset.file_url || asset.thumbnail_url;
                                    if (url) {
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = asset.name || 'asset';
                                        link.click();
                                    }
                                }}
                                className="flex-1 min-w-[140px] px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download
                            </button>
                            <button
                                onClick={() => {
                                    const url = asset.file_url || asset.thumbnail_url;
                                    if (url) {
                                        if (url.startsWith('data:')) {
                                            const win = window.open();
                                            if (win) {
                                                win.document.write(`<img src="${url}" style="max-width:100%; height:auto;" />`);
                                            }
                                        } else {
                                            window.open(url, '_blank', 'noopener,noreferrer');
                                        }
                                    }
                                }}
                                className="flex-1 min-w-[140px] px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View Full Size
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssetUsagePanel;
