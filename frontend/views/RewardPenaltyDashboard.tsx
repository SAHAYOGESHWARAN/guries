import React, { useState, useEffect } from 'react';

// Custom icon components to replace lucide-react
const Award = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>;
const AlertTriangle = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const Settings = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const DollarSign = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>;
const TrendingUp = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const CheckCircle = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const XCircle = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const Clock = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const Star = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
const Target = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" /></svg>;

interface RewardPenaltyDashboardProps {
    onNavigate?: (view: string, id?: string) => void;
}

const RewardPenaltyDashboard: React.FC<RewardPenaltyDashboardProps> = ({ onNavigate }) => {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('rewards');
    const [filters, setFilters] = useState({
        tab: 'rewards',
        timeRange: 'monthly',
        department: 'all'
    });

    useEffect(() => {
        fetchDashboardData();
    }, [filters]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`/api/v1/dashboards/rewards-penalties?${queryParams}`);
            const result = await response.json();
            if (result.success) {
                setDashboardData(result.data);
            }
        } catch (error) {
            console.error('Error fetching rewards & penalties dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const createAutomationRule = async (ruleData: any) => {
        try {
            const response = await fetch('/api/v1/dashboards/rewards-penalties/automation-rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ruleData)
            });
            if (response.ok) {
                fetchDashboardData(); // Refresh data
            }
        } catch (error) {
            console.error('Error creating automation rule:', error);
        }
    };

    const updateApprovalStatus = async (id: string, status: string, comments: string) => {
        try {
            const response = await fetch(`/api/v1/dashboards/rewards-penalties/approvals/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, approverComments: comments })
            });
            if (response.ok) {
                fetchDashboardData(); // Refresh data
            }
        } catch (error) {
            console.error('Error updating approval status:', error);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const { bonusCriteria, rewardRecommendations, penaltyTriggers, automationRules, approvalWorkflow, summaryStats } = dashboardData || {};

    const getTierColor = (tier: string) => {
        if (tier.includes('Tier 1')) return 'border-emerald-500 bg-emerald-50';
        if (tier.includes('Tier 2')) return 'border-blue-500 bg-blue-50';
        if (tier.includes('Tier 3')) return 'border-purple-500 bg-purple-50';
        if (tier.includes('Tier 4')) return 'border-orange-500 bg-orange-50';
        return 'border-teal-500 bg-teal-50';
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'text-red-600 bg-red-100';
            case 'medium': return 'text-amber-600 bg-amber-100';
            case 'low': return 'text-blue-600 bg-blue-100';
            default: return 'text-slate-600 bg-slate-100';
        }
    };

    return (
        <div className="h-full w-full flex flex-col overflow-hidden bg-slate-50">
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-300">
                <div className="w-full space-y-6">

                    {/* Header & Navigation */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                    🏆 Reward & Penalty Dashboard
                                </h1>
                                <p className="text-sm text-slate-600 mt-1">Performance-based rewards and penalty management</p>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex items-center gap-1 mb-6">
                            <button
                                onClick={() => setActiveTab('rewards')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'rewards'
                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                            >
                                <Award className="w-4 h-4 inline mr-2" />
                                Rewards
                            </button>
                            <button
                                onClick={() => setActiveTab('penalties')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'penalties'
                                    ? 'bg-red-100 text-red-700 border border-red-200'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                            >
                                <AlertTriangle className="w-4 h-4 inline mr-2" />
                                Penalties
                            </button>
                            <button
                                onClick={() => setActiveTab('automation')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'automation'
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                            >
                                <Settings className="w-4 h-4 inline mr-2" />
                                Automation Rules
                            </button>
                        </div>

                        {/* Filters Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select
                                value={filters.timeRange}
                                onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                            </select>

                            <select
                                value={filters.department}
                                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Departments</option>
                                <option value="content">Content Team</option>
                                <option value="seo">SEO Team</option>
                                <option value="tech">Tech Team</option>
                                <option value="marketing">Marketing Team</option>
                            </select>
                        </div>
                    </div>

                    {/* Summary Statistics */}
                    {summaryStats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Total Rewards</h3>
                                    <Award className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div className="text-2xl font-bold text-slate-900">{summaryStats.totalRewardsThisMonth}</div>
                                <div className="text-xs text-emerald-600 font-medium">This Month</div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Reward Amount</h3>
                                    <DollarSign className="w-4 h-4 text-green-500" />
                                </div>
                                <div className="text-2xl font-bold text-slate-900">{summaryStats.totalRewardAmount}</div>
                                <div className="text-xs text-green-600 font-medium">Total Value</div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Penalties</h3>
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                </div>
                                <div className="text-2xl font-bold text-slate-900">{summaryStats.totalPenaltiesThisMonth}</div>
                                <div className="text-xs text-red-600 font-medium">This Month</div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Avg Performance</h3>
                                    <TrendingUp className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="text-2xl font-bold text-slate-900">{summaryStats.averagePerformanceScore}%</div>
                                <div className="text-xs text-blue-600 font-medium">Team Average</div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Top Performers</h3>
                                    <Star className="w-4 h-4 text-yellow-500" />
                                </div>
                                <div className="text-2xl font-bold text-slate-900">{summaryStats.topPerformersCount}</div>
                                <div className="text-xs text-yellow-600 font-medium">Above 90%</div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Need Improvement</h3>
                                    <Target className="w-4 h-4 text-orange-500" />
                                </div>
                                <div className="text-2xl font-bold text-slate-900">{summaryStats.underperformersCount}</div>
                                <div className="text-xs text-orange-600 font-medium">Below 80%</div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Active Rules</h3>
                                    <Settings className="w-4 h-4 text-purple-500" />
                                </div>
                                <div className="text-2xl font-bold text-slate-900">{summaryStats.automationRulesActive}</div>
                                <div className="text-xs text-purple-600 font-medium">Automation</div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Pending Approvals</h3>
                                    <Clock className="w-4 h-4 text-amber-500" />
                                </div>
                                <div className="text-2xl font-bold text-slate-900">{summaryStats.pendingApprovals}</div>
                                <div className="text-xs text-amber-600 font-medium">Awaiting Review</div>
                            </div>
                        </div>
                    )}

                    {/* Tab Content */}
                    {activeTab === 'rewards' && (
                        <div className="space-y-6">

                            {/* Bonus Criteria */}
                            {bonusCriteria && (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                    <h2 className="text-lg font-bold text-slate-900 mb-4">Bonus Criteria by Tier</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {bonusCriteria.map((tier: any, index: number) => (
                                            <div key={index} className={`border-l-4 p-4 rounded-r-lg ${getTierColor(tier.tier)}`}>
                                                <h3 className="font-semibold text-slate-900 mb-2">{tier.tier}</h3>
                                                <p className="text-sm text-slate-700 mb-3">{tier.criteria}</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-lg font-bold text-emerald-600">{tier.bonusAmount}</span>
                                                    <span className="text-sm text-slate-600">{tier.eligibleEmployees} eligible</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Reward Recommendations */}
                            {rewardRecommendations && (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                    <h2 className="text-lg font-bold text-slate-900 mb-4">Reward Recommendations (Top 20% Performers)</h2>
                                    <div className="space-y-4">
                                        {rewardRecommendations.map((recommendation: any) => (
                                            <div key={recommendation.id} className="border border-slate-200 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900">{recommendation.name}</h3>
                                                        <p className="text-sm text-slate-600">{recommendation.role}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-lg font-bold text-blue-600">{recommendation.compositeScore}%</span>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${recommendation.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                                'bg-amber-100 text-amber-700'
                                                                }`}>
                                                                {recommendation.priority} priority
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-emerald-600">{recommendation.totalRecommendedAmount}</div>
                                                        <div className="text-sm text-slate-600">Total Recommended</div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <h4 className="font-semibold text-slate-700 mb-2">Achievements</h4>
                                                        <ul className="text-sm text-slate-600 space-y-1">
                                                            {recommendation.achievements.map((achievement: string, index: number) => (
                                                                <li key={index} className="flex items-start gap-2">
                                                                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                                    <span>{achievement}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-semibold text-slate-700 mb-2">Recommended Rewards</h4>
                                                        <div className="space-y-2">
                                                            {recommendation.recommendedRewards.map((reward: any, index: number) => (
                                                                <div key={index} className="flex justify-between items-center text-sm">
                                                                    <span className="text-slate-700">{reward.type}</span>
                                                                    <span className="font-semibold text-emerald-600">{reward.amount}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => updateApprovalStatus(recommendation.id.toString(), 'rejected', 'Not approved')}
                                                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => updateApprovalStatus(recommendation.id.toString(), 'approved', 'Approved for payment')}
                                                        className="px-3 py-1 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'penalties' && (
                        <div className="space-y-6">

                            {/* Penalty Triggers */}
                            {penaltyTriggers && (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                    <h2 className="text-lg font-bold text-slate-900 mb-4">Penalty Triggers for Underperformers</h2>
                                    <div className="space-y-4">
                                        {penaltyTriggers.map((trigger: any) => (
                                            <div key={trigger.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900">{trigger.name}</h3>
                                                        <p className="text-sm text-slate-600">{trigger.role}</p>
                                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${trigger.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                            'bg-amber-100 text-amber-700'
                                                            }`}>
                                                            {trigger.priority} priority
                                                        </span>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${trigger.status === 'action-required' ? 'bg-red-100 text-red-700' :
                                                        'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {trigger.status === 'action-required' ? 'Action Required' : 'Monitoring'}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="font-semibold text-slate-700 mb-2">Violations</h4>
                                                        <div className="space-y-2">
                                                            {trigger.violations.map((violation: any, index: number) => (
                                                                <div key={index} className="border border-slate-200 rounded p-2">
                                                                    <div className="flex justify-between items-start mb-1">
                                                                        <span className="text-sm font-medium text-slate-900">{violation.type}</span>
                                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(violation.severity)}`}>
                                                                            {violation.severity}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-slate-600 mb-1">{violation.description}</p>
                                                                    <div className="text-xs text-slate-500">
                                                                        {violation.occurrences} occurrences • Last: {violation.lastOccurrence}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-semibold text-slate-700 mb-2">Recommended Actions</h4>
                                                        <ul className="space-y-2">
                                                            {trigger.recommendedActions.map((action: any, index: number) => (
                                                                <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                                                                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                                                    <div>
                                                                        <span>{action.action}</span>
                                                                        <div className="text-xs text-slate-500">Timeline: {action.timeline}</div>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'automation' && (
                        <div className="space-y-6">

                            {/* Automation Rules */}
                            {automationRules && (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-lg font-bold text-slate-900">Automated Rule Builder</h2>
                                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                            + Add New Rule
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {automationRules.map((rule: any) => (
                                            <div key={rule.id} className="border border-slate-200 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900">{rule.name}</h3>
                                                        <div className="text-sm text-slate-600 mt-1">
                                                            <span className="font-medium">If:</span> {rule.condition}
                                                        </div>
                                                        <div className="text-sm text-slate-600">
                                                            <span className="font-medium">Then:</span> {rule.action}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${rule.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                            'bg-slate-100 text-slate-700'
                                                            }`}>
                                                            {rule.status}
                                                        </span>
                                                        <div className="text-sm text-slate-600 mt-1">
                                                            Triggered {rule.triggeredCount} times
                                                        </div>
                                                        {rule.lastTriggered && (
                                                            <div className="text-xs text-slate-500">
                                                                Last: {rule.lastTriggered}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-2">
                                                    <button className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                                                        Edit
                                                    </button>
                                                    <button className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                                                        Disable
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Approval Workflow */}
                    {approvalWorkflow && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Approval Workflow</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Type</th>
                                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Employee</th>
                                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Amount/Action</th>
                                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Reason</th>
                                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Submitted By</th>
                                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Approver</th>
                                            <th className="text-center py-3 px-4 font-semibold text-slate-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {approvalWorkflow.map((item: any) => (
                                            <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.type === 'reward' ? 'bg-emerald-100 text-emerald-700' :
                                                        'bg-red-100 text-red-700'
                                                        }`}>
                                                        {item.type}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-medium text-slate-900">{item.employeeName}</td>
                                                <td className="py-3 px-4 font-semibold text-slate-900">{item.amount || item.action}</td>
                                                <td className="py-3 px-4 text-slate-600">{item.reason}</td>
                                                <td className="py-3 px-4 text-slate-600">{item.submittedBy}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                        item.status.includes('pending') ? 'bg-amber-100 text-amber-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {item.status.replace(/-/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-slate-600">{item.approver}</td>
                                                <td className="py-3 px-4 text-center">
                                                    {item.status.includes('pending') && (
                                                        <div className="flex justify-center gap-1">
                                                            <button
                                                                onClick={() => updateApprovalStatus(item.id.toString(), 'approved', 'Approved')}
                                                                className="p-1 text-emerald-600 hover:bg-emerald-100 rounded"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => updateApprovalStatus(item.id.toString(), 'rejected', 'Rejected')}
                                                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RewardPenaltyDashboard;