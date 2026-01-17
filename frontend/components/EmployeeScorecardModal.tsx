import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, TrendingUp } from 'lucide-react';

interface Scorecard {
    id?: number;
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
}

interface PerformanceGoal {
    id?: number;
    goal_name: string;
    goal_description: string;
    target_value: number;
    current_value: number;
    status: string;
    due_date: string;
}

interface EmployeeScorecardModalProps {
    scorecard: Scorecard | null;
    onClose: () => void;
    onSave: () => void;
}

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Product', 'Design'];
const PERFORMANCE_RATINGS = ['Excellent', 'Good', 'Average', 'Below Average', 'Poor', 'Pending'];
const GOAL_STATUSES = ['In Progress', 'Completed', 'On Hold', 'At Risk'];

export default function EmployeeScorecardModal({ scorecard, onClose, onSave }: EmployeeScorecardModalProps) {
    const [activeTab, setActiveTab] = useState('basics');
    const [formData, setFormData] = useState<Scorecard>({
        employee_id: '',
        employee_name: '',
        department: '',
        position: '',
        reporting_manager: '',
        effort_score: 0,
        qc_score: 0,
        contribution_score: 0,
        performance_rating: 'Pending',
        performance_rating_percentage: 0,
        self_rating_score: 0,
        uniformity_score: 0
    });

    const [goals, setGoals] = useState<PerformanceGoal[]>([]);
    const [kpiData, setKpiData] = useState({ tasks_completed: 0, error_rate: 0, rework_percentage: 0 });
    const [attendanceData, setAttendanceData] = useState({ present_days: 0, absent_days: 0, warnings: 0, disciplinary_actions: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (scorecard) {
            setFormData(scorecard);
            fetchScorecardDetails(scorecard.employee_id);
        }
    }, [scorecard]);

    const fetchScorecardDetails = async (employeeId: string) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/employee-scorecard/${employeeId}`);
            const data = await response.json();
            setGoals(data.goals || []);
            setKpiData(data.kpiContribution || { tasks_completed: 0, error_rate: 0, rework_percentage: 0 });
            setAttendanceData(data.attendance || { present_days: 0, absent_days: 0, warnings: 0, disciplinary_actions: 0 });
        } catch (error) {
            console.error('Error fetching scorecard details:', error);
            setError('Failed to load scorecard details');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as any;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleKpiChange = (field: string, value: number) => {
        setKpiData(prev => ({ ...prev, [field]: value }));
    };

    const handleAttendanceChange = (field: string, value: number) => {
        setAttendanceData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddGoal = () => {
        setGoals([...goals, {
            goal_name: '',
            goal_description: '',
            target_value: 0,
            current_value: 0,
            status: 'In Progress',
            due_date: ''
        }]);
    };

    const handleUpdateGoal = (index: number, field: string, value: any) => {
        const newGoals = [...goals];
        newGoals[index] = { ...newGoals[index], [field]: value };
        setGoals(newGoals);
    };

    const handleRemoveGoal = (index: number) => {
        setGoals(goals.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            setError('');

            // Save scorecard
            const method = scorecard ? 'PUT' : 'POST';
            const url = scorecard ? `/api/employee-scorecard/${formData.employee_id}` : '/api/employee-scorecard';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to save scorecard');

            // Save KPI data
            await fetch(`/api/employee-scorecard/${formData.employee_id}/kpi`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(kpiData)
            });

            // Save attendance data
            await fetch(`/api/employee-scorecard/${formData.employee_id}/attendance`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(attendanceData)
            });

            // Save goals
            for (const goal of goals) {
                if (goal.id) {
                    await fetch(`/api/employee-scorecard/${formData.employee_id}/goals/${goal.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(goal)
                    });
                } else {
                    await fetch(`/api/employee-scorecard/${formData.employee_id}/goals`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(goal)
                    });
                }
            }

            onSave();
        } catch (err: any) {
            setError(err.message || 'Failed to save scorecard');
        } finally {
            setLoading(false);
        }
    };

    const calculateOverallScore = () => {
        return ((formData.effort_score + formData.qc_score + formData.contribution_score) / 3).toFixed(1);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">
                            {scorecard ? 'Edit Employee Scorecard' : 'Create Employee Scorecard'}
                        </h2>
                        <p className="text-blue-100 mt-1">Manage employee performance metrics and goals</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-blue-500 rounded transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b bg-gray-50 sticky top-16 z-40">
                    <div className="flex gap-0">
                        {['basics', 'performance', 'kpi', 'attendance', 'goals'].map(tab => (
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
                                    <input
                                        type="text"
                                        name="employee_id"
                                        value={formData.employee_id}
                                        onChange={handleInputChange}
                                        disabled={!!scorecard}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                        placeholder="EMP001"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name *</label>
                                    <input
                                        type="text"
                                        name="employee_name"
                                        value={formData.employee_name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Department</option>
                                        {DEPARTMENTS.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                                    <input
                                        type="text"
                                        name="position"
                                        value={formData.position}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Senior Developer"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Manager</label>
                                <input
                                    type="text"
                                    name="reporting_manager"
                                    value={formData.reporting_manager}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Manager Name"
                                />
                            </div>
                        </div>
                    )}

                    {/* Performance Tab */}
                    {activeTab === 'performance' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Effort Score (0-100)</label>
                                    <input
                                        type="number"
                                        name="effort_score"
                                        value={formData.effort_score}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">QC Score (0-100)</label>
                                    <input
                                        type="number"
                                        name="qc_score"
                                        value={formData.qc_score}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contribution Score (0-100)</label>
                                    <input
                                        type="number"
                                        name="contribution_score"
                                        value={formData.contribution_score}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <TrendingUp className="text-blue-600" size={20} />
                                    <h3 className="font-semibold text-gray-900">Overall Score</h3>
                                </div>
                                <p className="text-3xl font-bold text-blue-600">{calculateOverallScore()}/100</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Performance Rating %</label>
                                    <input
                                        type="number"
                                        name="performance_rating_percentage"
                                        value={formData.performance_rating_percentage}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Self Rating Score</label>
                                    <input
                                        type="number"
                                        name="self_rating_score"
                                        value={formData.self_rating_score}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Uniformity Score</label>
                                    <input
                                        type="number"
                                        name="uniformity_score"
                                        value={formData.uniformity_score}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Performance Rating</label>
                                <select
                                    name="performance_rating"
                                    value={formData.performance_rating}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {PERFORMANCE_RATINGS.map(rating => (
                                        <option key={rating} value={rating}>{rating}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* KPI Tab */}
                    {activeTab === 'kpi' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tasks Completed</label>
                                    <input
                                        type="number"
                                        value={kpiData.tasks_completed}
                                        onChange={(e) => handleKpiChange('tasks_completed', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Error Rate (%)</label>
                                    <input
                                        type="number"
                                        value={kpiData.error_rate}
                                        onChange={(e) => handleKpiChange('error_rate', parseFloat(e.target.value) || 0)}
                                        min="0"
                                        max="100"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rework Percentage (%)</label>
                                    <input
                                        type="number"
                                        value={kpiData.rework_percentage}
                                        onChange={(e) => handleKpiChange('rework_percentage', parseFloat(e.target.value) || 0)}
                                        min="0"
                                        max="100"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Attendance Tab */}
                    {activeTab === 'attendance' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Present Days</label>
                                    <input
                                        type="number"
                                        value={attendanceData.present_days}
                                        onChange={(e) => handleAttendanceChange('present_days', parseInt(e.target.value) || 0)}
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Absent Days</label>
                                    <input
                                        type="number"
                                        value={attendanceData.absent_days}
                                        onChange={(e) => handleAttendanceChange('absent_days', parseInt(e.target.value) || 0)}
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Warnings</label>
                                    <input
                                        type="number"
                                        value={attendanceData.warnings}
                                        onChange={(e) => handleAttendanceChange('warnings', parseInt(e.target.value) || 0)}
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Disciplinary Actions</label>
                                    <input
                                        type="number"
                                        value={attendanceData.disciplinary_actions}
                                        onChange={(e) => handleAttendanceChange('disciplinary_actions', parseInt(e.target.value) || 0)}
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Goals Tab */}
                    {activeTab === 'goals' && (
                        <div className="space-y-4">
                            <button
                                onClick={handleAddGoal}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                <Plus size={20} />
                                Add Goal
                            </button>

                            <div className="space-y-3">
                                {goals.map((goal, index) => (
                                    <div key={index} className="border border-gray-300 rounded-lg p-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-medium text-gray-900">Goal {index + 1}</h4>
                                            <button
                                                onClick={() => handleRemoveGoal(index)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                placeholder="Goal Name"
                                                value={goal.goal_name}
                                                onChange={(e) => handleUpdateGoal(index, 'goal_name', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <select
                                                value={goal.status}
                                                onChange={(e) => handleUpdateGoal(index, 'status', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {GOAL_STATUSES.map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <textarea
                                            placeholder="Goal Description"
                                            value={goal.goal_description}
                                            onChange={(e) => handleUpdateGoal(index, 'goal_description', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            rows={2}
                                        />

                                        <div className="grid grid-cols-3 gap-3">
                                            <input
                                                type="number"
                                                placeholder="Target Value"
                                                value={goal.target_value}
                                                onChange={(e) => handleUpdateGoal(index, 'target_value', parseFloat(e.target.value) || 0)}
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Current Value"
                                                value={goal.current_value}
                                                onChange={(e) => handleUpdateGoal(index, 'current_value', parseFloat(e.target.value) || 0)}
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <input
                                                type="date"
                                                value={goal.due_date}
                                                onChange={(e) => handleUpdateGoal(index, 'due_date', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                        {loading ? 'Saving...' : 'Save Scorecard'}
                    </button>
                </div>
            </div>
        </div>
    );
}
