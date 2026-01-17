import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Download, TrendingUp, AlertCircle, CheckCircle, Award } from 'lucide-react';
import RewardPenaltyModal from './RewardPenaltyModal';

interface BonusTier {
    id: number;
    tier_name: string;
    tier_level: number;
    min_salary: number;
    max_salary: number;
    bonus_percentage: number;
    status: string;
}

interface RewardRecommendation {
    id: number;
    employee_id: string;
    employee_name: string;
    department: string;
    performance_score: number;
    reward_amount: number;
    approval_status: string;
}

interface PenaltyRule {
    id: number;
    rule_name: string;
    violation_category: string;
    severity_level: string;
    penalty_amount: number;
    status: string;
}

export default function RewardPenaltyAutomation() {
    const [activeTab, setActiveTab] = useState('bonus-tiers');
    const [bonusTiers, setBonusTiers] = useState<BonusTier[]>([]);
    const [rewardRecommendations, setRewardRecommendations] = useState<RewardRecommendation[]>([]);
    const [penaltyRules, setPenaltyRules] = useState<PenaltyRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'bonus-tiers') {
                const response = await fetch('/api/reward-penalty-automation/bonus-tiers');
                setBonusTiers(await response.json());
            } else if (activeTab === 'reward-recommendations') {
                const response = await fetch('/api/reward-penalty-automation/reward-recommendations');
                setRewardRecommendations(await response.json());
            } else if (activeTab === 'penalty-rules') {
                const response = await fetch('/api/reward-penalty-automation/penalty-rules');
                setPenaltyRules(await response.json());
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, endpoint: string) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await fetch(`/api/reward-penalty-automation/${endpoint}/${id}`, { method: 'DELETE' });
                fetchData();
            } catch (error) {
                console.error('Error deleting item:', error);
            }
        }
    };

    const handleSave = () => {
        fetchData();
        setShowModal(false);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Reward & Penalty Automation</h1>
                        <p className="text-gray-600 mt-1">Manage bonus criteria, rewards, and penalties</p>
                    </div>
                    <button
                        onClick={() => { setSelectedItem(null); setShowModal(true); }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={20} />
                        Add New
                    </button>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="flex border-b">
                        {['bonus-tiers', 'reward-recommendations', 'penalty-rules'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-3 font-medium transition ${activeTab === tab
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {tab === 'bonus-tiers' && 'Bonus Criteria & Tiers'}
                                {tab === 'reward-recommendations' && 'Reward Recommendations'}
                                {tab === 'penalty-rules' && 'Penalty Rules'}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="text-center text-gray-500 py-8">Loading...</div>
                        ) : (
                            <>
                                {/* Bonus Tiers Tab */}
                                {activeTab === 'bonus-tiers' && (
                                    <div className="space-y-4">
                                        {bonusTiers.length === 0 ? (
                                            <p className="text-gray-500 text-center py-8">No bonus tiers configured</p>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b">
                                                            <th className="text-left py-3 px-4 font-semibold">Tier Name</th>
                                                            <th className="text-right py-3 px-4 font-semibold">Min Salary</th>
                                                            <th className="text-right py-3 px-4 font-semibold">Max Salary</th>
                                                            <th className="text-right py-3 px-4 font-semibold">Bonus %</th>
                                                            <th className="text-center py-3 px-4 font-semibold">Status</th>
                                                            <th className="text-center py-3 px-4 font-semibold">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {bonusTiers.map(tier => (
                                                            <tr key={tier.id} className="border-b hover:bg-gray-50">
                                                                <td className="py-3 px-4 font-medium">{tier.tier_name}</td>
                                                                <td className="py-3 px-4 text-right">₹{tier.min_salary.toLocaleString()}</td>
                                                                <td className="py-3 px-4 text-right">₹{tier.max_salary.toLocaleString()}</td>
                                                                <td className="py-3 px-4 text-right font-semibold text-green-600">{tier.bonus_percentage}%</td>
                                                                <td className="py-3 px-4 text-center">
                                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${tier.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                                        }`}>
                                                                        {tier.status}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-4 text-center">
                                                                    <button
                                                                        onClick={() => handleDelete(tier.id, 'bonus-tiers')}
                                                                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                                                    >
                                                                        <Trash2 size={18} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Reward Recommendations Tab */}
                                {activeTab === 'reward-recommendations' && (
                                    <div className="space-y-4">
                                        {rewardRecommendations.length === 0 ? (
                                            <p className="text-gray-500 text-center py-8">No reward recommendations</p>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {rewardRecommendations.map(rec => (
                                                    <div key={rec.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div>
                                                                <p className="font-semibold text-gray-900">{rec.employee_name}</p>
                                                                <p className="text-sm text-gray-600">{rec.department}</p>
                                                            </div>
                                                            <Award className="text-green-600" size={24} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between">
                                                                <span className="text-sm text-gray-600">Performance Score</span>
                                                                <span className="font-semibold">{rec.performance_score}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-sm text-gray-600">Reward Amount</span>
                                                                <span className="font-semibold text-green-600">₹{rec.reward_amount.toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-sm text-gray-600">Status</span>
                                                                <span className={`px-2 py-1 rounded text-xs font-medium ${rec.approval_status === 'Approved' ? 'bg-green-200 text-green-800' :
                                                                        rec.approval_status === 'Rejected' ? 'bg-red-200 text-red-800' :
                                                                            'bg-yellow-200 text-yellow-800'
                                                                    }`}>
                                                                    {rec.approval_status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Penalty Rules Tab */}
                                {activeTab === 'penalty-rules' && (
                                    <div className="space-y-4">
                                        {penaltyRules.length === 0 ? (
                                            <p className="text-gray-500 text-center py-8">No penalty rules configured</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {penaltyRules.map(rule => (
                                                    <div key={rule.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-gray-900">{rule.rule_name}</p>
                                                                <p className="text-sm text-gray-600 mt-1">{rule.violation_category}</p>
                                                                <div className="mt-3 flex gap-2">
                                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${rule.severity_level === 'High' ? 'bg-red-200 text-red-800' :
                                                                            rule.severity_level === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                                                                                'bg-blue-200 text-blue-800'
                                                                        }`}>
                                                                        {rule.severity_level}
                                                                    </span>
                                                                    <span className="px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-800">
                                                                        ₹{rule.penalty_amount.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDelete(rule.id, 'penalty-rules')}
                                                                className="p-2 text-red-600 hover:bg-red-100 rounded transition"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <RewardPenaltyModal
                        activeTab={activeTab}
                        item={selectedItem}
                        onClose={() => setShowModal(false)}
                        onSave={handleSave}
                    />
                )}
            </div>
        </div>
    );
}
