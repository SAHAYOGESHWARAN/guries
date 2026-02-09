import React, { useState, useEffect } from 'react';

// Custom icon components
const Lightbulb = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const CheckCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const XCircle = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const Users = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
);

const TrendingUp = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const Clock = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

interface TaskSuggestion {
    id: number;
    task_id: string;
    task_name: string;
    task_type: string;
    priority: string;
    estimated_hours: number;
    suggested_assignee_id: string;
    suggested_assignee_name: string;
    allocation_reason: string;
    confidence_score: number;
    status: string;
    assigned_date?: string;
    created_at: string;
}

interface AITaskAllocationSuggestionsProps {
    onNavigate?: (view: string, id?: string) => void;
}

const AITaskAllocationSuggestions: React.FC<AITaskAllocationSuggestionsProps> = ({ onNavigate }) => {
    const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'all',
        priority: 'all',
        minConfidence: 0
    });
    const [selectedSuggestion, setSelectedSuggestion] = useState<TaskSuggestion | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchSuggestions();
    }, [filters]);

    const fetchSuggestions = async () => {
        try {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
            const queryParams = new URLSearchParams();
            if (filters.status !== 'all') queryParams.append('status', filters.status);
            if (filters.priority !== 'all') queryParams.append('priority', filters.priority);
            queryParams.append('minConfidence', filters.minConfidence.toString());

            const response = await fetch(`${apiUrl}/workload-allocation/task-suggestions?${queryParams}`);
            const data = await response.json();
            setSuggestions(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptSuggestion = async (suggestionId: number) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
            const response = await fetch(`${apiUrl}/workload-allocation/task-suggestions/${suggestionId}/accept`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                fetchSuggestions();
                setShowModal(false);
            }
        } catch (error) {
            console.error('Error accepting suggestion:', error);
        }
    };

    const handleRejectSuggestion = async (suggestionId: number) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
            const response = await fetch(`${apiUrl}/workload-allocation/task-suggestions/${suggestionId}/reject`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                fetchSuggestions();
                setShowModal(false);
            }
        } catch (error) {
            console.error('Error rejecting suggestion:', error);
        }
    };

    const getConfidenceColor = (score: number) => {
        if (score >= 85) return 'text-emerald-600 bg-emerald-100';
        if (score >= 70) return 'text-blue-600 bg-blue-100';
        if (score >= 50) return 'text-amber-600 bg-amber-100';
        return 'text-red-600 bg-red-100';
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high': return 'bg-red-100 text-red-800 border-red-300';
            case 'medium': return 'bg-amber-100 text-amber-800 border-amber-300';
            case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
            default: return 'bg-slate-100 text-slate-800 border-slate-300';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Suggested':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">Suggested</span>;
            case 'Accepted':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">Accepted</span>;
            case 'Rejected':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
            default:
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">{status}</span>;
        }
    };

    const filteredSuggestions = (suggestions || []).filter(s => {
        if (!s) return false;
        if (filters.status !== 'all' && s.status !== filters.status) return false;
        if (filters.priority !== 'all' && s.priority !== filters.priority) return false;
        if (s.confidence_score < filters.minConfidence) return false;
        return true;
    });

    const stats = {
        total: suggestions.length,
        accepted: suggestions.filter(s => s.status === 'Accepted').length,
        pending: suggestions.filter(s => s.status === 'Suggested').length,
        avgConfidence: suggestions.length > 0
            ? (suggestions.reduce((sum, s) => sum + s.confidence_score, 0) / suggestions.length).toFixed(1)
            : 0
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col overflow-hidden bg-slate-50">
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-300">
                <div className="w-full space-y-6">

                    {/* Header */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Lightbulb className="w-6 h-6 text-indigo-600" />
                            <h1 className="text-2xl font-bold text-slate-900">AI Task Allocation Suggestions</h1>
                        </div>
                        <p className="text-sm text-slate-600">AI-powered task allocation recommendations based on employee capacity, skills, and workload</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg border border-slate-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Total Suggestions</p>
                                    <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                                </div>
                                <Lightbulb className="w-8 h-8 text-indigo-500 opacity-20" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-slate-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Pending Review</p>
                                    <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                                </div>
                                <Clock className="w-8 h-8 text-amber-500 opacity-20" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-slate-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Accepted</p>
                                    <p className="text-2xl font-bold text-emerald-600">{stats.accepted}</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-emerald-500 opacity-20" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-slate-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Avg Confidence</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.avgConfidence}%</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-blue-500 opacity-20" />
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="Suggested">Suggested</option>
                                    <option value="Accepted">Accepted</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                                <select
                                    value={filters.priority}
                                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">All Priorities</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Min Confidence</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={filters.minConfidence}
                                    onChange={(e) => setFilters(prev => ({ ...prev, minConfidence: parseInt(e.target.value) }))}
                                    className="w-full"
                                />
                                <p className="text-xs text-slate-500 mt-1">{filters.minConfidence}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Suggestions List */}
                    <div className="space-y-4">
                        {filteredSuggestions.length === 0 ? (
                            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                                <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-600">No suggestions match your filters</p>
                            </div>
                        ) : (
                            filteredSuggestions.map((suggestion) => (
                                <div key={suggestion.id} className="bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-colors p-4">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-3 mb-2">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-slate-900">{suggestion.task_name}</h3>
                                                    <p className="text-sm text-slate-600 mt-1">{suggestion.allocation_reason}</p>
                                                </div>
                                                {getStatusBadge(suggestion.status)}
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                                                <div className="text-sm">
                                                    <p className="text-slate-600">Task Type</p>
                                                    <p className="font-medium text-slate-900">{suggestion.task_type}</p>
                                                </div>
                                                <div className="text-sm">
                                                    <p className="text-slate-600">Priority</p>
                                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded border ${getPriorityColor(suggestion.priority)}`}>
                                                        {suggestion.priority}
                                                    </span>
                                                </div>
                                                <div className="text-sm">
                                                    <p className="text-slate-600">Est. Hours</p>
                                                    <p className="font-medium text-slate-900">{suggestion.estimated_hours}h</p>
                                                </div>
                                                <div className="text-sm">
                                                    <p className="text-slate-600">Confidence</p>
                                                    <p className={`font-medium px-2 py-1 rounded text-xs ${getConfidenceColor(suggestion.confidence_score)}`}>
                                                        {suggestion.confidence_score}%
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex items-center gap-2 text-sm">
                                                <Users className="w-4 h-4 text-slate-500" />
                                                <span className="text-slate-700">
                                                    Suggested for: <span className="font-semibold">{suggestion.suggested_assignee_name}</span>
                                                </span>
                                            </div>
                                        </div>

                                        {suggestion.status === 'Suggested' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAcceptSuggestion(suggestion.id)}
                                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center gap-2"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleRejectSuggestion(suggestion.id)}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AITaskAllocationSuggestions;
