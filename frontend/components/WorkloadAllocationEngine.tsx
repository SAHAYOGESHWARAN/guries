import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, TrendingUp, AlertCircle, CheckCircle, Users, Zap } from 'lucide-react';
import WorkloadAllocationModal from './WorkloadAllocationModal';

interface TaskSuggestion {
    id: number;
    task_id: string;
    task_name: string;
    task_type: string;
    priority: string;
    estimated_hours: number;
    suggested_assignee_name: string;
    confidence_score: number;
    status: string;
}

interface WorkloadForecast {
    id: number;
    employee_id: string;
    employee_name: string;
    department: string;
    current_workload: number;
    forecasted_workload: number;
    capacity_hours: number;
    utilization_percentage: number;
    trend: string;
    risk_level: string;
}

interface TeamCapacity {
    id: number;
    team_id: string;
    team_name: string;
    total_capacity: number;
    allocated_capacity: number;
    available_capacity: number;
    utilization_percentage: number;
    team_members: number;
    status: string;
}

interface PredictedOverload {
    id: number;
    employee_id: string;
    employee_name: string;
    department: string;
    current_load: number;
    predicted_load: number;
    capacity: number;
    overload_percentage: number;
    severity: string;
    status: string;
}

export default function WorkloadAllocationEngine() {
    const [activeTab, setActiveTab] = useState('task-suggestions');
    const [taskSuggestions, setTaskSuggestions] = useState<TaskSuggestion[]>([]);
    const [workloadForecasts, setWorkloadForecasts] = useState<WorkloadForecast[]>([]);
    const [teamCapacities, setTeamCapacities] = useState<TeamCapacity[]>([]);
    const [predictedOverloads, setPredictedOverloads] = useState<PredictedOverload[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'task-suggestions') {
                const response = await fetch('/api/workload-allocation-engine/task-suggestions');
                setTaskSuggestions(await response.json());
            } else if (activeTab === 'workload-forecast') {
                const response = await fetch('/api/workload-allocation-engine/workload-forecast');
                setWorkloadForecasts(await response.json());
            } else if (activeTab === 'team-capacity') {
                const response = await fetch('/api/workload-allocation-engine/team-capacity');
                setTeamCapacities(await response.json());
            } else if (activeTab === 'predicted-overloads') {
                const response = await fetch('/api/workload-allocation-engine/predicted-overloads');
                setPredictedOverloads(await response.json());
            }
        } catch (e) {
            console.error('Failed to fetch workload data', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded">
            <div className="flex gap-2 mb-4">
                <button className={`px-3 py-1 rounded ${activeTab === 'task-suggestions' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={() => setActiveTab('task-suggestions')}>Task Suggestions</button>
                <button className={`px-3 py-1 rounded ${activeTab === 'workload-forecast' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={() => setActiveTab('workload-forecast')}>Forecast</button>
                <button className={`px-3 py-1 rounded ${activeTab === 'team-capacity' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={() => setActiveTab('team-capacity')}>Team Capacity</button>
                <button className={`px-3 py-1 rounded ${activeTab === 'predicted-overloads' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={() => setActiveTab('predicted-overloads')}>Predicted Overloads</button>
            </div>

            {loading && <div>Loading...</div>}

            {!loading && activeTab === 'task-suggestions' && (
                <ul className="space-y-2">
                    {taskSuggestions.map(t => <li key={t.id} className="p-2 border rounded">{t.task_name}</li>)}
                </ul>
            )}

            {!loading && activeTab === 'workload-forecast' && (
                <ul className="space-y-2">
                    {workloadForecasts.map(w => <li key={w.id} className="p-2 border rounded">{w.employee_name} — {w.forecasted_workload}</li>)}
                </ul>
            )}

            {!loading && activeTab === 'team-capacity' && (
                <ul className="space-y-2">
                    {teamCapacities.map(tc => <li key={tc.id} className="p-2 border rounded">{tc.team_name} — {tc.available_capacity}</li>)}
                </ul>
            )}

            {!loading && activeTab === 'predicted-overloads' && (
                <ul className="space-y-2">
                    {predictedOverloads.map(po => <li key={po.id} className="p-2 border rounded">{po.employee_name} — {po.predicted_load}</li>)}
                </ul>
            )}
        </div>
    );
}