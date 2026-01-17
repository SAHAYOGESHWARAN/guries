import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, AlertCircle, CheckCircle, Clock, BarChart3, Activity, Target } from 'lucide-react';

interface WorkloadDistribution {
    member_id: string;
    member_name: string;
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    overdue_tasks: number;
    workload_percentage: number;
    status: string;
}

interface CapacityAnalysis {
    team_id: string;
    team_name: string;
    total_capacity: number;
    utilized_capacity: number;
    available_capacity: number;
    capacity_utilization_percentage: number;
    team_members_count: number;
    avg_workload: number;
}

interface Campaign {
    campaign_id: string;
    campaign_name: string;
    campaign_type: string;
    status: string;
    progress_percentage: number;
    assigned_members: number;
}

interface TaskStatus {
    status: string;
    task_count: number;
    percentage: number;
}

interface PerformanceTrend {
    date_recorded: string;
    completion_rate: number;
    quality_score: number;
    efficiency_score: number;
}

interface MemberPerformance {
    member_id: string;
    member_name: string;
    role: string;
    tasks_assigned: number;
    tasks_completed: number;
    completion_rate: number;
    quality_score: number;
    efficiency_score: number;
}

export default function TeamLeaderDashboard() {
    const [teamId] = useState('TEAM001'); // In real app, get from context/props
    const [workload, setWorkload] = useState<WorkloadDistribution[]>([]);
    const [capacity, setCapacity] = useState<CapacityAnalysis | null>(null);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [taskStatus, setTaskStatus] = useState<TaskStatus[]>([]);
    const [trend, setTrend] = useState<PerformanceTrend[]>([]);
    const [memberPerformance, setMemberPerformance] = useState<MemberPerformance[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchDashboardData();
    }, [teamId]);

    const fetchDashboardData = as