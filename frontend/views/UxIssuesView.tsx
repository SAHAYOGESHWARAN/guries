import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import type { UxIssue, User, Service } from '../types';

const SEVERITY_TABS = [
    { key: 'All', label: 'All Issues' },
    { key: 'Critical', label: 'Critical' },
    { key: 'High', label: 'High' },
    { key: 'Medium', label: 'Medium' },
    { key: 'Low', label: 'Low' },
];

const ISSUE_TYPES = [
    'Button not clickable',
    'Rage clicks',
    'Form abandonment',
    'Scroll depth issue',
    'Dead clicks',
    'Element overlapping',
    'Layout shift',
    'Slow interaction',
];

const DEVICES = ['Desktop', 'Mobile', 'Tablet'];
const SOURCES = ['Microsoft Clarity', 'Hotjar', 'GA4 Engagement', 'BrowserStack Test', 'Manual Report'];
const STATUSES = ['Pending', 'Assigned', 'Dev Fix Applied', 'In Progress', 'Resolved', 'Reopened'];

// Severity Badge
const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
    const config: Record<string, { bg: string; text: string }> = {
        'Critical': { bg: 'bg-purple-100', text: 'text-purple-700' },
        'High': { bg: 'bg-orange-100', text: 'text-orange-700' },
        'Medium': { bg: 'bg-amber-100', text: 'text-amber-700' },
        'Low': { bg: 'bg-slate-100', text: 'text-slate-600' },
    };
    const c = config[severity] || config['Medium'];
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>{severity}</span>;
};

// Status Badge
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, { bg: string; text: string }> = {
        'Pending': { bg: 'bg-amber-50', text: 'text-amber-700' },
        'Assigned': { bg: 'bg-blue-50', text: 'text-blue-700' },
        'Dev Fix Applied': { bg: 'bg-indigo-50', text: 'text-indigo-700' },
        'In Progress': { bg: 'bg-cyan-50', text: 'text-cyan-700' },
        'Resolved': { bg: 'bg-emerald-50', text: 'text-emerald-700' },
        'Reopened': { bg: 'bg-red-50', text: 'text-red-700' },
    };
    const c = config[status] || { bg: 'bg-slate-100', text: 'text-slate-600' };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>{status}</span>;
};

// Issue Type Badge
const IssueTypeBadge: React.FC<{ type: string }> = ({ type }) => {
    const colors: Record<string, string> = {
        'Button not clickable': 'bg-red-100 text-red-700',
        'Rage clicks': 'bg-orange-100 text-orange-700',
        'Form abandonment': 'bg-purple-100 text-purple-700',
        'Scroll depth issue': 'bg-cyan-100 text-cyan-700',
        'Dead clicks': 'bg-slate-100 text-slate-700',
        'Element overlapping': 'bg-pink-100 text-pink-700',
        'Layout shift': 'bg-amber-100 text-amber-700',
        'Slow interaction': 'bg-indigo-100 text-indigo-700',
    };
    const colorClass = colors[type] || 'bg-slate-100 text-slate-600';
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>{type}</span>;
};

// Avatar component
const Avatar: React.FC<{ name: string }> = ({ name }) => {
    const initials = name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';
    const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
    const bgColor = colors[(name?.length || 0) % colors.length];
    return (
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${bgColor}`}>
            {initials}
        </div>
    );
};

// Sample placeholder images for cards
const PLACEHOLDER_IMAGES = [
    'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=400&h=300&fit=crop',
];

const UxIssuesView: React.FC = () => {
    const { data: issues, create: createIssue, update: updateIssue, remove: deleteIssue, refresh } = useData<UxIssue>('uxIssues');
    const { data: users } = useData<User>('users');
    const { data: services } = useData<Service>('services');

    const [searchQuery, setSearchQuery] = useState('');
    const [activeSeverity, setActiveSeverity] = useState('All');
    const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        issue_type: '',
        device: 'Desktop',
        severity: 'Medium',
        source: '',
        description: '',
        assigned_to_id: '',
        service_id: '',
        screenshot_url: '',
    });

    const getSeverityCount = (severity: string) => {
        if (severity === 'All') return issues.length;
        return issues.filter(i => i.severity === severity).length;
    };

    const filteredIssues = issues.filter(item => {
        const matchesSearch =
            item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.issue_type?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSeverity = activeSeverity === 'All' || item.severity === activeSeverity;
        return matchesSearch && matchesSeverity;
    });

    const handleCreate = async () => {
        if (!formData.title || !formData.url) {
            alert('Please fill in required fields (Title and URL)');
            return;
        }
        setIsSubmitting(true);
        try {
            await createIssue({
                title: formData.title,
                url: formData.url,
                issue_type: formData.issue_type || 'Manual Report',
                device: formData.device,
                severity: formData.severity as any,
                source: formData.source || 'Manual Report',
                description: formData.description || null,
                assigned_to_id: formData.assigned_to_id ? parseInt(formData.assigned_to_id) : null,
                service_id: formData.service_id ? parseInt(formData.service_id) : null,
                screenshot_url: formData.screenshot_url || null,
                status: 'Pending',
            } as any);
            setShowCreateModal(false);
            resetForm();
            refresh();
        } catch (error) {
            console.error('Failed to create UX issue:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this UX issue?')) {
            try {
                await deleteIssue(id);
                refresh();
            } catch (error) {
                console.error('Failed to delete:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            title: '', url: '', issue_type: '', device: 'Desktop',
            severity: 'Medium', source: '', description: '',
            assigned_to_id: '', service_id: '', screenshot_url: '',
        });
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    };

    const getPlaceholderImage = (id: number) => {
        return PLACEHOLDER_IMAGES[id % PLACEHOLDER_IMAGES.length];
    };


    // Create Modal
    const renderCreateModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Create New UX Issue</h2>
                        <p className="text-sm text-slate-500">Report a UX problem from heatmaps or session recordings</p>
                    </div>
                    <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="p-2 hover:bg-slate-100 rounded-lg">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Issue Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            placeholder="e.g., CTA Button Not Clickable on Mobile"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">URL *</label>
                        <input
                            type="text"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            placeholder="/products/nutraceutical-supplements"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Issue Type</label>
                            <select
                                value={formData.issue_type}
                                onChange={(e) => setFormData({ ...formData, issue_type: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                            >
                                <option value="">Select type</option>
                                {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Device</label>
                            <select
                                value={formData.device}
                                onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                            >
                                {DEVICES.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Severity</label>
                            <select
                                value={formData.severity}
                                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                            >
                                <option value="Critical">Critical</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Source</label>
                            <select
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                            >
                                <option value="">Select source</option>
                                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Assigned To</label>
                            <select
                                value={formData.assigned_to_id}
                                onChange={(e) => setFormData({ ...formData, assigned_to_id: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                            >
                                <option value="">Select assignee</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Service</label>
                            <select
                                value={formData.service_id}
                                onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                            >
                                <option value="">Select service</option>
                                {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Screenshot URL</label>
                        <input
                            type="text"
                            value={formData.screenshot_url}
                            onChange={(e) => setFormData({ ...formData, screenshot_url: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 h-20 resize-none"
                            placeholder="Describe the UX issue in detail..."
                        />
                    </div>

                    <p className="text-xs text-slate-500">* Required fields</p>
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={() => { setShowCreateModal(false); resetForm(); }}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={isSubmitting || !formData.title || !formData.url}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Creating...' : 'Create UX Issue'}
                    </button>
                </div>
            </div>
        </div>
    );


    // Card View
    const renderCardView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIssues.map(item => (
                <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {/* Image */}
                    <div className="relative h-40 bg-slate-100">
                        <img
                            src={item.screenshot_url || getPlaceholderImage(item.id)}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = getPlaceholderImage(item.id);
                            }}
                        />
                        <div className="absolute top-2 right-2">
                            <SeverityBadge severity={item.severity} />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        <h3 className="font-semibold text-slate-900 text-sm mb-2 line-clamp-2">{item.title}</h3>

                        <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2">
                                <IssueTypeBadge type={item.issue_type || 'Manual Report'} />
                            </div>
                            <p className="text-xs text-blue-600 truncate">{item.url}</p>
                            <p className="text-xs text-slate-500">
                                {item.device} • {item.source || 'Manual Report'}
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                {item.assigned_to_name ? (
                                    <>
                                        <Avatar name={item.assigned_to_name} />
                                        <span className="text-xs text-slate-600 truncate max-w-[80px]">{item.assigned_to_name}</span>
                                    </>
                                ) : (
                                    <span className="text-xs text-slate-400">Unassigned</span>
                                )}
                            </div>
                            <StatusBadge status={item.status} />
                        </div>
                    </div>
                </div>
            ))}
            {filteredIssues.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">
                    No UX issues found
                </div>
            )}
        </div>
    );

    // List View (Table)
    const renderListView = () => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1400px]">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Issue Title</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">URL</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Issue Type</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Device</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Severity</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Source</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Screenshot</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Assigned To</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Last Updated</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredIssues.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3">
                                    <span className="font-medium text-slate-900 text-sm">{item.title}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-blue-600 truncate block max-w-[180px]" title={item.url}>
                                        {item.url}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <IssueTypeBadge type={item.issue_type || 'Manual Report'} />
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-slate-600">{item.device}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <SeverityBadge severity={item.severity} />
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-slate-600">{item.source || '-'}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {item.screenshot_url ? (
                                        <button className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    ) : (
                                        <span className="text-slate-400 text-xs">-</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {item.assigned_to_name ? (
                                        <div className="flex items-center gap-2">
                                            <Avatar name={item.assigned_to_name} />
                                            <span className="text-sm text-slate-700">{item.assigned_to_name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-slate-400">Unassigned</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <StatusBadge status={item.status} />
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-slate-500">{formatDate(item.updated_at)}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1">
                                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Edit">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredIssues.length === 0 && (
                            <tr>
                                <td colSpan={11} className="px-4 py-12 text-center text-slate-500">
                                    No UX issues found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );


    return (
        <div className="h-full flex flex-col w-full p-6 overflow-hidden bg-slate-50">
            {showCreateModal && renderCreateModal()}

            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Heatmap & UX Issue Repository</h1>
                            <p className="text-sm text-slate-500">Central hub for UX problems from Heatmaps, Session Recordings & GA4 signals</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <select className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white">
                        <option>This Week</option>
                        <option>This Month</option>
                        <option>All Time</option>
                    </select>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filters
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Import
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New UX Issue
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export
                    </button>
                </div>
            </div>

            {/* Search and Severity Tabs */}
            <div className="mb-4 space-y-3">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                            placeholder="Search by URL, issue name, category..."
                        />
                    </div>
                </div>

                {/* Severity Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {SEVERITY_TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveSeverity(tab.key)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeSeverity === tab.key
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {tab.label}
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeSeverity === tab.key ? 'bg-purple-200 text-purple-800' : 'bg-slate-200 text-slate-600'
                                }`}>
                                {getSeverityCount(tab.key)}
                            </span>
                        </button>
                    ))}
                    <div className="flex-1" />
                    <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${viewMode === 'list' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'
                                }`}
                        >
                            List View
                        </button>
                        <button
                            onClick={() => setViewMode('card')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${viewMode === 'card' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'
                                }`}
                        >
                            Card View
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {viewMode === 'list' ? renderListView() : renderCardView()}
            </div>
        </div>
    );
};

export default UxIssuesView;
