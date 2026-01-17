import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, Search, Download, Share2 } from 'lucide-react';
import EmployeeScorecardModal from './EmployeeScorecardModal';

interface Scorecard {
    id: number;
    employee_id: string;
    employee_name: string;
    department: string;
    position: string;
    reporting_manager: string;
    effort_score: number;
    qc_score: number;
    contribution_score: number;
    performance_rating: string;
    performance_rating_percentage: number;
    self_rating_score: number;
    uniformity_score: number;
    created_at: string;
    updated_at: string;
}

export default function EmployeePerformanceScorecard() {
    const [scorecards, setScorecards] = useState<Scorecard[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedScorecard, setSelectedScorecard] = useState<Scorecard | null>(null);
    const [filterDepartment, setFilterDepartment] = useState('all');

    useEffect(() => {
        fetchScorecards();
    }, []);

    const fetchScorecards = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/employee-scorecard');
            const data = await response.json();
            setScorecards(data);
        } catch (error) {
            console.error('Error fetching scorecards:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddScorecard = () => {
        setSelectedScorecard(null);
        setShowModal(true);
    };

    const handleEditScorecard = (scorecard: Scorecard) => {
        setSelectedScorecard(scorecard);
        setShowModal(true);
    };

    const handleDeleteScorecard = async (employeeId: string) => {
        if (window.confirm('Are you sure you want to delete this scorecard?')) {
            try {
                await fetch(`/api/employee-scorecard/${employeeId}`, { method: 'DELETE' });
                fetchScorecards();
            } catch (error) {
                console.error('Error deleting scorecard:', error);
            }
        }
    };

    const handleSaveScorecard = () => {
        fetchScorecards();
        setShowModal(false);
    };

    const filteredScorecards = scorecards.filter(scorecard => {
        const matchesSearch = scorecard.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            scorecard.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = filterDepartment === 'all' || scorecard.department === filterDepartment;
        return matchesSearch && matchesDept;
    });

    const departments = [...new Set(scorecards.map(s => s.department))];

    const getRatingColor = (rating: string) => {
        switch (rating) {
            case 'Excellent': return 'bg-green-100 text-green-800';
            case 'Good': return 'bg-blue-100 text-blue-800';
            case 'Average': return 'bg-yellow-100 text-yellow-800';
            case 'Below Average': return 'bg-orange-100 text-orange-800';
            case 'Poor': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Employee Performance Scorecards</h1>
                        <p className="text-gray-600 mt-1">Track and manage employee performance metrics</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                            <Download size={20} />
                            Export
                        </button>
                        <button
                            onClick={handleAddScorecard}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus size={20} />
                            Add Scorecard
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name or employee ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <select
                            value={filterDepartment}
                            onChange={(e) => setFilterDepartment(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Scorecards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full text-center text-gray-500 py-8">Loading scorecards...</div>
                    ) : filteredScorecards.length === 0 ? (
                        <div className="col-span-full text-center text-gray-500 py-8">No scorecards found</div>
                    ) : (
                        filteredScorecards.map((scorecard) => (
                            <div key={scorecard.employee_id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                                {/* Employee Info */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{scorecard.employee_name}</h3>
                                        <p className="text-sm text-gray-600">{scorecard.employee_id}</p>
                                        <p className="text-sm text-gray-600">{scorecard.position}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditScorecard(scorecard)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteScorecard(scorecard.employee_id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Performance Metrics */}
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Effort Score</span>
                                        <span className="text-lg font-semibold text-blue-600">{scorecard.effort_score.toFixed(1)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">QC Score</span>
                                        <span className="text-lg font-semibold text-green-600">{scorecard.qc_score.toFixed(1)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Contribution Score</span>
                                        <span className="text-lg font-semibold text-purple-600">{scorecard.contribution_score.toFixed(1)}</span>
                                    </div>
                                </div>

                                {/* Performance Rating */}
                                <div className="flex items-center justify-between pt-4 border-t">
                                    <span className="text-sm text-gray-600">Rating</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRatingColor(scorecard.performance_rating)}`}>
                                        {scorecard.performance_rating}
                                    </span>
                                </div>

                                {/* View Details Button */}
                                <button
                                    onClick={() => handleEditScorecard(scorecard)}
                                    className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
                                >
                                    View Details
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Modal */}
                {showModal && (
                    <EmployeeScorecardModal
                        scorecard={selectedScorecard}
                        onClose={() => setShowModal(false)}
                        onSave={handleSaveScorecard}
                    />
                )}
            </div>
        </div>
    );
}
