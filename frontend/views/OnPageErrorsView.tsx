import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import type { OnPageSeoAudit, Service, SubServiceItem, User } from '../types';

// Severity tabs
const SEVERITY_TABS = [
    { key: 'All', label: 'All Errors' },
    { key: 'Critical', label: 'Critical' },
    { key: 'High', label: 'High' },
    { key: 'Medium', label: 'Medium' },
    { key: 'Low', label: 'Low' },
];

const ERROR_CATEGORIES = ['Content', 'Technical', 'Meta', 'Links', 'Images', 'Schema'];
const STATUSES = ['Open', 'In Progress', 'Resolved', 'Ignored'];

// Severity Badge
const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
    const config: Record<string, { bg: string; text: string; dot: string }> = {
        'Critical': { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
        'High': { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
        'Medium': { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
        'Low': { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
    };
    const c = config[severity] || { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
            {severity}
        </span>
    );
};

// Status Badge
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, { bg: string; text: string }> = {
        'Open': { bg: 'bg-red-50', text: 'text-red-700' },
        'In Progress': { bg: 'bg-amber-50', text: 'text-amber-700' },
        'Resolved': { bg: 'bg-emerald-50', text: 'text-emerald-700' },
        'Ignored': { bg: 'bg-slate-100', text: 'text-slate-600' },
    };
    const c = config[status] || { bg: 'bg-slate-100', text: 'text-slate-600' };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>{status}</span>;
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

const OnPageErrorsView: React.FC = () => {
    const { data: audits, create: createAudit, update: updateAudit, refresh } = useData<OnPageSeoAudit>('onPageSeoAudits');
    const { data: services } = useData<Service>('services');
    const { data: subServices } = useData<SubServiceItem>('subServices');
    const { data: users } = useData<User>('users');

    const [searchQuery, setSearchQuery] = useState('');
    const [activeSeverity, setActiveSeverity] = useState('All');
    const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        url: '',
        error_type: '',
        error_category: 'Technical',
        severity: 'Medium',
        issue_description: '',
        service_id: '',
        sub_service_id: '',
        assigned_to_id: '',
        status: 'Open',
    });

    const getSeverityCount = (severity: string) => {
        if (severity === 'All') return audits.length;
        return audits.filter(a => a.severity === severity).length;
    };

    const filteredAudits = useMemo(() => {
        return audits.filter(item => {
            const matchesSearch =
                item.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.error_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.issue_description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesSeverity = activeSeverity === 'All' || item.severity === activeSeverity;
            return matchesSearch && matchesSeverity;
        });
    }, [audits, searchQuery, activeSeverity]);

    // Group errors by URL for list view
    const groupedByUrl = useMemo(() => {
        const groups: Record<string, OnPageSeoAudit[]> = {};
        filteredAudits.forEach(audit => {
            const url = audit.url || 'Unknown URL';
            if (!groups[url]) groups[url] = [];
            groups[url].push(audit);
        });
        return groups;
    }, [filteredAudits]);

    const handleCreate = async () => {
        if (!formData.error_type || !formData.issue_description) {
            alert('Please fill in required fields');
            return;
        }
        setIsSubmitting(true);
        try {
            await createAudit({
                url: formData.url || null,
                error_type: formData.error_type,
                error_category: formData.error_category as any,
                severity: formData.severity as any,
                issue_description: formData.issue_description,
                service_id: formData.service_id ? parseInt(formData.service_id) : null,
                sub_service_id: formData.sub_service_id ? parseInt(formData.sub_service_id) : null,
                assigned_to_id: formData.assigned_to_id ? parseInt(formData.assigned_to_id) : null,
                status: formData.status as any,
            } as any);
            setShowCreateModal(false);
            resetForm();
            refresh();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Failed to create error:', error);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            url: '', error_type: '', error_category: 'Technical', severity: 'Medium',
            issue_description: '', service_id: '', sub_service_id: '', assigned_to_id: '', status: 'Open',
        });
    };

    const handleStatusChange = async (id: number, newStatus: string) => {
        await updateAudit(id, { status: newStatus });
        refresh();
    };

    const formatTimeAgo = (dateStr?: string) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays > 0) return `${diffDays}d ago`;
        if (diffHours > 0) return `${diffHours}h ago`;
        if (diffMins > 0) return `${diffMins}m ago`;
        return 'Just now';
    };

    const getServiceMapping = (audit: OnPageSeoAudit) => {
        if (audit.service_name && audit.sub_service_name) {
            return `${audit.service_name} → ${audit.sub_service_name}`;
        }
        if (audit.service_name) return audit.service_name;
        if (audit.sub_service_name) return audit.sub_service_name;
        return '-';
    };

    // Create Error Modal
    const renderCreateModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Log On-Page Error</h2>
                        <p className="text-sm text-slate-500">Report a new SEO issue for tracking</p>
                    </div>
                    <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="p-2 hover:bg-slate-100 rounded-lg">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Page URL *</label>
                        <input
                            type="text"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                            placeholder="https://example.com/page-url"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Error Type *</label>
                            <input
                                type="text"
                                value={formData.error_type}
                                onChange={(e) => setFormData({ ...formData, error_type: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                placeholder="e.g., Missing H1, Broken Link"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Category</label>
                            <select
                                value={formData.error_category}
                                onChange={(e) => setFormData({ ...formData, error_category: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                            >
                                {ERROR_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Severity</label>
                            <select
                                value={formData.severity}
                                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                            >
                                <option value="Critical">Critical</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                            >
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Description *</label>
                        <textarea
                            value={formData.issue_description}
                            onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 h-24 resize-none"
                            placeholder="Describe the SEO issue in detail..."
                        />
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                        <h3 className="font-semibold text-slate-900 mb-3">Service Mapping</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Service</label>
                                <select
                                    value={formData.service_id}
                                    onChange={(e) => setFormData({ ...formData, service_id: e.target.value, sub_service_id: '' })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                                >
                                    <option value="">Select service</option>
                                    {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Sub-Service</label>
                                <select
                                    value={formData.sub_service_id}
                                    onChange={(e) => setFormData({ ...formData, sub_service_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                                    disabled={!formData.service_id}
                                >
                                    <option value="">Select sub-service</option>
                                    {subServices.filter(ss => ss.parent_service_id === parseInt(formData.service_id)).map(ss => (
                                        <option key={ss.id} value={ss.id}>{ss.sub_service_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Assign To</label>
                        <select
                            value={formData.assigned_to_id}
                            onChange={(e) => setFormData({ ...formData, assigned_to_id: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                        >
                            <option value="">Select team member</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>

                    <p className="text-xs text-slate-500">* Required fields</p>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={() => { setShowCreateModal(false); resetForm(); }}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={isSubmitting || !formData.error_type || !formData.issue_description}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Creating...' : 'Log Error'}
                    </button>
                </div>
            </div>
        </div>
    );

    // List View - Grouped by URL
    const renderListView = () => (
        <div className="space-y-4">
            {Object.entries(groupedByUrl).map(([url, errors]) => (
                <div key={url} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* URL Header */}
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-slate-900 text-sm truncate max-w-md">{url}</p>
                                <p className="text-xs text-slate-500">{errors.length} error{errors.length !== 1 ? 's' : ''} found</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {errors.some(e => e.severity === 'Critical') && (
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">Critical</span>
                            )}
                            {errors.some(e => e.severity === 'High') && (
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">High</span>
                            )}
                        </div>
                    </div>

                    {/* Errors List */}
                    <div className="divide-y divide-slate-100">
                        {errors.map(error => (
                            <div key={error.id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <SeverityBadge severity={error.severity} />
                                            <span className="font-medium text-slate-900 text-sm">{error.error_type}</span>
                                            <span className="text-xs text-slate-400 uppercase">{error.error_category}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 line-clamp-2">{error.issue_description}</p>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <StatusBadge status={error.status} />
                                        {error.assigned_to_name && (
                                            <div className="flex items-center gap-2">
                                                <Avatar name={error.assigned_to_name} />
                                                <span className="text-xs text-slate-600">{error.assigned_to_name}</span>
                                            </div>
                                        )}
                                        <span className="text-xs text-slate-400">{formatTimeAgo(error.updated_at)}</span>
                                        <div className="flex items-center gap-1">
                                            <select
                                                value={error.status}
                                                onChange={(e) => handleStatusChange(error.id, e.target.value)}
                                                className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
                                            >
                                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            {Object.keys(groupedByUrl).length === 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">No errors found</h3>
                    <p className="text-slate-500 text-sm">All pages are looking good! Import errors or log a new issue.</p>
                </div>
            )}
        </div>
    );

    // Table View
    const renderTableView = () => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">URL</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Error Type</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Severity</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-64">Description</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Service Mapping</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Assigned To</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Updated</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredAudits.map(error => (
                            <tr key={error.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                        </div>
                                        <span className="text-sm text-slate-700 truncate max-w-[200px]" title={error.url || '-'}>
                                            {error.url || '-'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{error.error_type}</p>
                                        <p className="text-xs text-slate-400 uppercase">{error.error_category}</p>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <SeverityBadge severity={error.severity} />
                                </td>
                                <td className="px-4 py-3">
                                    <p className="text-sm text-slate-600 line-clamp-2" title={error.issue_description}>
                                        {error.issue_description}
                                    </p>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-slate-600">{getServiceMapping(error)}</span>
                                </td>
                                <td className="px-4 py-3">
                                    {error.assigned_to_name ? (
                                        <div className="flex items-center gap-2">
                                            <Avatar name={error.assigned_to_name} />
                                            <span className="text-sm text-slate-700">{error.assigned_to_name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-slate-400">Unassigned</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <StatusBadge status={error.status} />
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-slate-500">{formatTimeAgo(error.updated_at)}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={error.status}
                                            onChange={(e) => handleStatusChange(error.id, e.target.value)}
                                            className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
                                        >
                                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredAudits.length === 0 && (
                            <tr>
                                <td colSpan={9} className="px-4 py-12 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <p className="text-slate-500">No errors found</p>
                                    </div>
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
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">On-Page Error Repository</h1>
                            <p className="text-sm text-slate-500">Track and resolve SEO issues across all pages</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Import Errors
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Log New Error
                    </button>
                </div>
            </div>

            {/* Search and Severity Tabs */}
            <div className="mb-4 space-y-3">
                <div className="relative max-w-md">
                    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                        placeholder="Search by URL, error type, or description..."
                    />
                </div>

                {/* Severity Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {SEVERITY_TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveSeverity(tab.key)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeSeverity === tab.key
                                ? 'bg-red-100 text-red-700'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {tab.label}
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeSeverity === tab.key ? 'bg-red-200 text-red-800' : 'bg-slate-200 text-slate-600'
                                }`}>
                                {getSeverityCount(tab.key)}
                            </span>
                        </button>
                    ))}
                    <div className="flex-1" />
                    {/* View Toggle */}
                    <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                            title="List View"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Table View"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {viewMode === 'list' ? renderListView() : renderTableView()}
            </div>
        </div>
    );
};

export default OnPageErrorsView;
