import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface AdminConsoleConfigViewProps {
    onNavigate?: (view: string, id?: number | null) => void;
}

// Configuration card data
const configurationCards = [
    // Row 1 - OKR/KPI/Performance
    {
        id: 'objective-master',
        title: 'Objective Master',
        description: 'Define organizational objectives and align them with strategic goals across departments.',
        icon: '◎',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        category: 'okr'
    },
    {
        id: 'kra-master',
        title: 'KRA Master',
        description: 'Configure Key Result Areas to measure team and individual performance outcomes.',
        icon: '📈',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        category: 'okr'
    },
    {
        id: 'kpi-master',
        title: 'KPI Master',
        description: 'Set up Key Performance Indicators to track progress and measure success metrics.',
        icon: '📊',
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-600',
        category: 'okr'
    },
    // Row 2 - Targets & Scoring
    {
        id: 'kpi-target-config',
        title: 'KPI Target Configuration',
        description: 'Define target values, thresholds, and benchmarks for each KPI across time periods.',
        icon: '◎',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        category: 'scoring'
    },
    {
        id: 'effort-unit-config',
        title: 'Effort Unit Configuration',
        description: 'Configure how effort and time are measured across tasks, campaigns, and projects.',
        icon: '⚡',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        category: 'scoring'
    },
    {
        id: 'scoring-engine',
        title: 'Scoring Engine',
        description: 'Set up scoring algorithms, weightages, and calculation rules for performance evaluation.',
        icon: '🎯',
        iconBg: 'bg-pink-100',
        iconColor: 'text-pink-600',
        category: 'scoring'
    },
    // Row 3 - QC & Repository
    {
        id: 'qc-engine',
        title: 'QC Engine',
        description: 'Configure quality control workflows, audit checklists, and approval processes.',
        icon: '🔍',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        category: 'qc'
    },
    {
        id: 'repository-manager',
        title: 'Repository Manager',
        description: 'Manage content repositories, asset libraries, and knowledge base configurations.',
        icon: '📚',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        category: 'repository'
    },
    {
        id: 'competitor-intelligence',
        title: 'Competitor Intelligence Configuration',
        description: 'Set up competitor tracking, analysis frameworks, and intelligence gathering rules.',
        icon: '🔎',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        category: 'intelligence'
    },
    // Row 4 - Security & Automation
    {
        id: 'role-permission-matrix',
        title: 'Role & Permission Matrix',
        description: 'Define user roles, access levels, and permission rules across the platform.',
        icon: '👥',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        category: 'security'
    },
    {
        id: 'automation-notifications',
        title: 'Automation & Notifications',
        description: 'Configure automated workflows, alerts, and notification preferences for all users.',
        icon: '🔔',
        iconBg: 'bg-violet-100',
        iconColor: 'text-violet-600',
        category: 'automation'
    },
    {
        id: 'dashboard-config',
        title: 'Dashboard Configuration',
        description: 'Customize dashboard layouts, widgets, and data visualization preferences.',
        icon: '⊞',
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-600',
        category: 'dashboard'
    }
];

const AdminConsoleConfigView: React.FC<AdminConsoleConfigViewProps> = ({ onNavigate }) => {
    const { user, isAdmin, hasPermission } = useAuth();
    const canAccessAdminConsole = hasPermission('canViewAdminConsole');

    // Access denied for non-admin users
    if (!canAccessAdminConsole) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-50">
                <div className="text-center p-8 max-w-md">
                    <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
                    <p className="text-slate-600">You don't have permission to access the Admin Console Configuration.</p>
                    <p className="text-slate-500 text-sm mt-2">Only administrators can manage system configurations.</p>
                    <button
                        onClick={() => onNavigate?.('dashboard')}
                        className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const handleConfigureClick = (cardId: string) => {
        // Map card IDs to actual view routes
        const viewMap: Record<string, string> = {
            'objective-master': 'objective-master',
            'kra-master': 'kra-master',
            'kpi-master': 'kpi-master',
            'kpi-target-config': 'kpi-target-config',
            'effort-unit-config': 'effort-unit-config',
            'scoring-engine': 'scoring-engine',
            'qc-engine': 'qc-engine-config',
            'repository-manager': 'repository-manager',
            'competitor-intelligence': 'competitor-intelligence',
            'role-permission-matrix': 'role-permission-matrix',
            'automation-notifications': 'automation-notifications',
            'dashboard-config': 'dashboard-config'
        };

        const targetView = viewMap[cardId] || cardId;
        onNavigate?.(targetView, null);
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 animate-fade-in overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Admin Console</h1>
                        <p className="text-slate-500 text-sm mt-1">Set the foundation for OKR, KPI, QC, scoring, repositories, and security.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wide">
                            Admin Only
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {/* Configuration Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {configurationCards.map((card) => (
                        <div
                            key={card.id}
                            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-indigo-200 transition-all group"
                        >
                            {/* Icon */}
                            <div className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <span className={`text-2xl ${card.iconColor}`}>{card.icon}</span>
                            </div>

                            {/* Title */}
                            <h3 className="text-base font-bold text-slate-800 mb-2">{card.title}</h3>

                            {/* Description */}
                            <p className="text-sm text-slate-500 mb-4 line-clamp-2">{card.description}</p>

                            {/* Configure Button */}
                            <button
                                onClick={() => handleConfigureClick(card.id)}
                                className="text-indigo-600 text-sm font-semibold hover:text-indigo-700 transition-colors flex items-center gap-1"
                            >
                                Configure
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminConsoleConfigView;
