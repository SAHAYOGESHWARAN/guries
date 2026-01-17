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
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    useEffect(() => {
        fetchData();
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
                setPredictedOverloads(a