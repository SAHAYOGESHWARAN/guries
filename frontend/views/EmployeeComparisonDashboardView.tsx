import React from 'react';
import EmployeeComparisonDashboard from '../components/EmployeeComparisonDashboard';

interface EmployeeComparisonDashboardViewProps {
    onNavigate?: (view: string, id?: string) => void;
}

export default function EmployeeComparisonDashboardView({ onNavigate }: EmployeeComparisonDashboardViewProps) {
    return <EmployeeComparisonDashboard onNavigate={onNavigate} />;
}
