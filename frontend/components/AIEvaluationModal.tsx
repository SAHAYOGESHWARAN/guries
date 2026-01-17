import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';

interface EvaluationReport {
    id?: number;
    report_id: string;
    evaluation_period: string;
    total_records: number;
    status: string;
}

interface AIEvaluationModalProps {
    report: EvaluationReport | null;
    onClose: () => void;
    onSave: () => void;
}

const PERIODS = ['This Month', 'Last Month', 'This Quarter', 'Last Quarter', 'This Year'];
const STATUSES = ['Completed', 'In Progress', 'Pending', 'Failed'];

export default function AIEvaluationModal({ report, onClose, onSave }: AIEvaluationModalProps) {
    const [activeTab, setActiveTab] = useState('basics');
    const [formData, setFormData] = useState<EvaluationReport>({
        report_id: '',
        evaluation_period: 'This Month',
        total_records: 0,
        status: 'Completed'
    });

    const [dataSources, setDataSources] = useState<any[]>([]);
    const [performanceScores, setPerformanceScores] = useState<any[]>([]);
    const [riskFactors, setRiskFactors] = useState<any[]>([]);
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (report) {
            setFormData(report);
            fetchReportDetails(report.report_id);
        }
    }, [report]);

    const fetchReportDetails = async (reportId: string) => {
        try {
            setLoading(true);
            const [sourcesRes, scoresRes, riskRes, oppRes, recRes] = await Promise.all([
                fetch(`/api/ai-evaluation-engine/reports/${reportId}/data-sources`),
                fetch(`/api/ai-evaluation-engine/reports/${reportId}/performance-scores`),
                fetch(`/api/ai-evaluation-engine/reports/${reportId}/risk-factors`),
                fetch(`/api/ai-evaluation-engine/reports/${reportId}/opportunities`),
                fetch(`/api/ai-evaluation-engine/reports/${reportId}/recommendations`)
            ]);

            const [sources, scores, risks, opps, recs] = await Promise.all([
                sourcesRes.json(),
                scoresRes.json(),
                riskRes.json(),
                oppRes.json(),
                recRes.json()
            ]);

            setDataSources(sources);
            setPerformanceScores(scores);
            setRiskFactors(risks);
            setOpportunities(opps);
            setRecommendations(recs);
        } catch (error) {
            console.error('Error fetching report details:', error);
            setError('Failed to load report details');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            setError('');

            const method = report ? 'PUT' : 'POST';
            const url = report
                ? `/api/ai-evaluation-engine/reports/${formData.report_id}`
                : '/api/ai-evaluation-engine/reports';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to save report');

            onSave();
        } catch (err: any) {
            setError(err.message || 'Failed to save report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">
                            {report ? 'Edit Evaluation Report' : 'Create Evaluation Report'}
                        </h2>
                        <p className="text-blue-100 mt-1">Manage AI evaluation data and insights</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-blue-500 rounded transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b bg-gray-50 sticky top-16 z-40">
                    <div className="flex gap-0">
                        {['basics', 'sources', 'performance', 'risks', 'opportunities', 'recommendations'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-3 font-medium transition ${activeTab === tab
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Basics Tab */}
                    {activeTab === 'basics' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Report ID *</label>
                                    <input
                                        type="text"
                                        name="report_id"
                                        value={formData.report_id}
                                        onChange={handleInputChange}
                                        disabled={!!report}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                        placeholder="RPT-2024-001"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Evaluation Period</label>
                                    <select
                                        name="evaluation_period"
                                        value={formData.evaluation_period}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {PERIODS.map(period => (
                                            <option key={period} value={period}>{period}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Records</label>
                                    <input
                                        type="number"
                                        name="total_records"
                                        value={formData.total_records}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {STATUSES.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Data Sources Tab */}
                    {activeTab === 'sources' && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-800">
                                    <strong>Data Sources:</strong> {dataSources.length} sources configured
                                </p>
                            </div>
                            {dataSources.map((source, idx) => (
                                <div key={idx} className="border border-gray-300 rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900">{source.source_name}</p>
                                            <p className="text-sm text-gray-600">Records: {source.record_count}</p>
                                        </div>
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {source.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Performance Scores Tab */}
                    {activeTab === 'performance' && (
                        <div className="space-y-4">
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <p className="text-sm text-green-800">
                                    <strong>Performance Metrics:</strong> {performanceScores.length} metrics tracked
                                </p>
                            </div>
                            {performanceScores.map((score, idx) => (
                                <div key={idx} className="border border-gray-300 rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-900">{score.metric_name}</p>
                                            <p className="text-sm text-gray-600">Trend: {score.trend}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-green-600">{score.score}</p>
                                            <p className="text-xs text-gray-600">/100</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Risk Factors Tab */}
                    {activeTab === 'risks' && (
                        <div className="space-y-4">
                            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                <p className="text-sm text-red-800">
                                    <strong>Risk Factors:</strong> {riskFactors.length} risks identified
                                </p>
                            </div>
                            {riskFactors.map((risk, idx) => (
                                <div key={idx} className="border border-red-300 rounded-lg p-4 bg-red-50">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{risk.risk_factor}</p>
                                            <p className="text-sm text-gray-600 mt-1">{risk.description}</p>
                                            <div className="mt-2 flex gap-2">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${risk.severity === 'High' ? 'bg-red-200 text-red-800' :
                                                        risk.severity === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                                                            'bg-blue-200 text-blue-800'
                                                    }`}>
                                                    {risk.severity}
                                                </span>
                                                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-800">
                                                    {risk.impact_percentage}% Impact
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Opportunities Tab */}
                    {activeTab === 'opportunities' && (
                        <div className="space-y-4">
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                <p className="text-sm text-yellow-800">
                                    <strong>Improvement Opportunities:</strong> {opportunities.length} opportunities identified
                                </p>
                            </div>
                            {opportunities.map((opp, idx) => (
                                <div key={idx} className="border border-yellow-300 rounded-lg p-4 bg-yellow-50">
                                    <div className="flex items-start gap-3">
                                        <Lightbulb className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{opp.opportunity_name}</p>
                                            <p className="text-sm text-gray-600 mt-1">{opp.description}</p>
                                            <div className="mt-2 flex gap-2">
                                                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-200 text-blue-800">
                                                    {opp.priority} Priority
                                                </span>
                                                <span className="px-2 py-1 rounded text-xs font-medium bg-green-200 text-green-800">
                                                    {opp.potential_impact}% Impact
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Recommendations Tab */}
                    {activeTab === 'recommendations' && (
                        <div className="space-y-4">
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <p className="text-sm text-purple-800">
                                    <strong>Recommendations:</strong> {recommendations.length} recommendations provided
                                </p>
                            </div>
                            {recommendations.map((rec, idx) => (
                                <div key={idx} className="border border-purple-300 rounded-lg p-4 bg-purple-50">
                                    <p className="font-medium text-gray-900">{rec.recommendation_text}</p>
                                    <p className="text-sm text-gray-600 mt-2">{rec.category}</p>
                                    <div className="mt-2 flex gap-2">
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-200 text-blue-800">
                                            {rec.priority} Priority
                                        </span>
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-200 text-green-800">
                                            {rec.estimated_impact}% Impact
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t p-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Report'}
                    </button>
                </div>
            </div>
        </div>
    );
}
