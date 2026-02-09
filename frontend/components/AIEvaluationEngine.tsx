import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Download, TrendingUp, AlertCircle, Lightbulb, CheckCircle, BarChart3 } from 'lucide-react';
import AIEvaluationModal from './AIEvaluationModal';

interface EvaluationReport {
    id: number;
    report_id: string;
    evaluation_date: string;
    evaluation_period: string;
    total_records: number;
    status: string;
    created_at: string;
    updated_at: string;
}

interface AIEvaluationEngineProps {
    onNavigate?: (view: string, id?: string) => void;
}

export default function AIEvaluationEngine({ onNavigate }: AIEvaluationEngineProps) {
    const [reports, setReports] = useState<EvaluationReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState<EvaluationReport | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPeriod, setFilterPeriod] = useState('all');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/ai-evaluation-engine/reports');
            const data = await response.json();
            setReports(data);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddReport = () => {
        setSelectedReport(null);
        setShowModal(true);
    };

    const handleEditReport = (report: EvaluationReport) => {
        setSelectedReport(report);
        setShowModal(true);
    };

    const handleDeleteReport = async (reportId: string) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            try {
                await fetch(`/api/ai-evaluation-engine/reports/${reportId}`, { method: 'DELETE' });
                fetchReports();
            } catch (error) {
                console.error('Error deleting report:', error);
            }
        }
    };

    const handleSaveReport = () => {
        fetchReports();
        setShowModal(false);
    };

    const filteredReports = (reports || []).filter(report => {
        if (!report) return false;
        const matchesSearch = (report.report_id || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPeriod = filterPeriod === 'all' || report.evaluation_period === filterPeriod;
        return matchesSearch && matchesPeriod;
    });

    const periods = [...new Set((reports || []).map(r => r.evaluation_period))];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">AI Automatic Evaluation Engine</h1>
                        <p className="text-gray-600 mt-1">Generate and manage AI-powered performance evaluations</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                            <Download size={20} />
                            Export
                        </button>
                        <button
                            onClick={handleAddReport}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus size={20} />
                            New Report
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search by report ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <select
                            value={filterPeriod}
                            onChange={(e) => setFilterPeriod(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Periods</option>
                            {periods.map(period => (
                                <option key={period} value={period}>{period}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Reports Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full text-center text-gray-500 py-8">Loading reports...</div>
                    ) : filteredReports.length === 0 ? (
                        <div className="col-span-full text-center text-gray-500 py-8">No reports found</div>
                    ) : (
                        filteredReports.map((report) => (
                            <div key={report.report_id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                                {/* Report Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{report.report_id}</h3>
                                        <p className="text-sm text-gray-600">{report.evaluation_period}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditReport(report)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteReport(report.report_id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Report Stats */}
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Total Records</span>
                                        <span className="text-lg font-semibold text-blue-600">{report.total_records}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Status</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${report.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {report.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Date</span>
                                        <span className="text-sm text-gray-900">
                                            {new Date(report.evaluation_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {/* View Details Button */}
                                <button
                                    onClick={() => handleEditReport(report)}
                                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
                                >
                                    View Details
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Modal */}
                {showModal && (
                    <AIEvaluationModal
                        report={selectedReport}
                        onClose={() => setShowModal(false)}
                        onSave={handleSaveReport}
                    />
                )}
            </div>
        </div>
    );
}
