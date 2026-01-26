import React, { useState, useEffect } from 'react';

interface RewardPenaltyAutomationProps {
    onNavigate?: (view: string, id?: string) => void;
}

const RewardPenaltyAutomation: React.FC<RewardPenaltyAutomationProps> = ({ onNavigate }) => {
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRewardPenaltyRules();
    }, []);

    const fetchRewardPenaltyRules = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/v1/reward-penalty/rules');
            const result = await response.json();
            if (result.success) {
                setRules(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching reward penalty rules:', error);
            setRules([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-slate-50 h-full overflow-auto">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-900">Reward & Penalty Automation</h1>
                    <p className="text-slate-600 mt-2">Manage automated reward and penalty rules</p>
                </div>

                {rules.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <p className="text-slate-600">No automation rules configured</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-100 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Rule Name</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Trigger</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {rules.map((rule: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-sm text-slate-900">{rule.name || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{rule.type || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{rule.trigger || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${rule.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-slate-100 text-slate-800'
                                                    }`}>
                                                    {rule.status || 'Inactive'}
                                                </span>
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
    );
};

export default RewardPenaltyAutomation;
