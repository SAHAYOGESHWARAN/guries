import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import type { ToxicBacklink, User, Service } from '../types';

const SEVERITY_TABS = [
    { key: 'All', label: 'All Toxic Links' },
    { key: 'Critical', label: 'Critical' },
    { key: 'High', label: 'High' },
    { key: 'Medium', label: 'Medium' },
    { key: 'Low', label: 'Low' },
];

const DR_TYPES = [
    'Hacked Site',
    'Adult/Gambling/Pharma',
    'PBN (Private Blog Network)',
    'Foreign Language Unrelated',
    'Comment Spam',
    'Link Farm',
];

const STATUSES = ['Pending', 'Verified Removal', 'Disavowed', 'Submitted', 'Rejected', 'In Review'];

// Severity Badge
const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
    const config: Record<string, { bg: string; text: string; dot: string }> = {
        'Critical': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
        'High': { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
        'Medium': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
        'Low': { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
    };
    const c = config[severity] || config['Medium'];
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
        'Pending': { bg: 'bg-amber-50', text: 'text-amber-700' },
        'Verified Removal': { bg: 'bg-emerald-50', text: 'text-emerald-700' },
        'Disavowed': { bg: 'bg-blue-50', text: 'text-blue-700' },
        'Submitted': { bg: 'bg-indigo-50', text: 'text-indigo-700' },
        'Rejected': { bg: 'bg-red-50', text: 'text-red-700' },
        'In Review': { bg: 'bg-purple-50', text: 'text-purple-700' },
    };
    const c = config[status] || { bg: 'bg-slate-100', text: 'text-slate-600' };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>{status}</span>;
};

// Spam Score Badge
const SpamScoreBadge: React.FC<{ score: number }> = ({ score }) => {
    const color = score >= 60 ? 'text-red-600 bg-red-50' : score >= 30 ? 'text-orange-600 bg-orange-50' : 'text-amber-600 bg-amber-50';
    return <span className={`px-2 py-0.5 rounded text-xs font-bold ${color}`}>{score}%</span>;
};

// DR Badge
const DRBadge: React.FC<{ dr?: number }> = ({ dr }) => {
    if (!dr) return <span className="text-slate-400 text-xs">-</span>;
    const color = dr >= 50 ? 'text-emerald-600' : dr >= 30 ? 'text-amber-600' : 'text-red-600';
    return <span className={`font-semibold ${color}`}>{dr}</span>;
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

const ToxicBacklinksView: React.FC = () => {
    const { data: toxicLinks, create: createToxicLink, update: updateToxicLink, remove: deleteToxicLink, refresh } = useData<ToxicBacklink>('toxicUrls');
    const { data: users } = useData<User>('users');
    const { data: services } = useData<Service>('services');

    const [searchQuery, setSearchQuery] = useState('');
    const [activeSeverity, setActiveSeverity] = useState('All');
    const [viewMode, setViewMode] = useState<'list' | 'domain'>('list');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        domain: '',
        toxic_url: '',
        landing_page: '',
        anchor_text: '',
        spam_score: '',
        dr: '',
        dr_type: '',
        severity: 'Medium',
        status: 'Pending',
        assigned_to_id: '',
        service_id: '',
        notes: '',
    });

    const getSeverityCount = (severity: string) => {
        if (severity === 'All') return toxicLinks.length;
        return toxicLinks.filter(t => t.severity === severity).length;
    };

    const filteredLinks = toxicLinks.filter(item => {
        const matchesSearch =
            item.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.toxic_url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.anchor_text?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSeverity = activeSeverity === 'All' || item.severity === activeSeverity;
        return matchesSearch && matchesSeverity;
    });

    // Group by domain for domain view
    const groupedByDomain = filteredLinks.reduce((acc, item) => {
        const domain = item.domain || 'Unknown';
        if (!acc[domain]) {
            acc[domain] = [];
        }
        acc[domain].push(item);
        return acc;
    }, {} as Record<string, ToxicBacklink[]>);

    const handleCreate = async () => {
        if (!formData.domain || !formData.toxic_url) {
            alert('Please fill in required fields (Domain and Toxic URL)');
            return;
        }
        setIsSubmitting(true);
        try {
            await createToxicLink({
                domain: formData.domain,
                toxic_url: formData.toxic_url,
                landing_page: formData.landing_page || null,
                anchor_text: formData.anchor_text,
                spam_score: formData.spam_score ? parseInt(formData.spam_score) : 0,
                dr: formData.dr ? parseInt(formData.dr) : null,
                dr_type: formData.dr_type || null,
                severity: formData.severity as any,
                status: formData.status,
                assigned_to_id: formData.assigned_to_id ? parseInt(formData.assigned_to_id) : null,
                service_id: formData.service_id ? parseInt(formData.service_id) : null,
                notes: formData.notes || null,
            } as any);
            setShowCreateModal(false);
            resetForm();
            refresh();
        } catch (error) {
            console.error('Failed to create toxic backlink:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDisavow = async (id: number) => {
        try {
            await updateToxicLink(id, {
                status: 'Disavowed',
                disavow_date: new Date().toISOString()
            } as any);
            refresh();
        } catch (error) {
            console.error('Failed to disavow:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this toxic backlink?')) {
            try {
                await deleteToxicLink(id);
                refresh();
            } catch (error) {
                console.error('Failed to delete:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            domain: '', toxic_url: '', landing_page: '', anchor_text: '',
            spam_score: '', dr: '', dr_type: '', severity: 'Medium',
            status: 'Pending', assigned_to_id: '', service_id: '', notes: '',
        });
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    };


    // Create Modal
    const renderCreateModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Add Toxic Backlink</h2>
                        <p className="text-sm text-slate-500">Record a harmful backlink for monitoring and removal</p>
                    </div>
                    <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="p-2 hover:bg-slate-100 rounded-lg">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Domain *</label>
                            <input
                                type="text"
                                value={formData.domain}
                                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                placeholder="spam-network-abc.net"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Toxic URL *</label>
                            <input
                                type="text"
                                value={formData.toxic_url}
                                onChange={(e) => setFormData({ ...formData, toxic_url: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                placeholder="https://spam-network-abc.net/links/page123"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Landing Page</label>
                            <input
                                type="text"
                                value={formData.landing_page}
                                onChange={(e) => setFormData({ ...formData, landing_page: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                placeholder="/services/enterprise-development"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Anchor Text</label>
                            <input
                                type="text"
                                value={formData.anchor_text}
                                onChange={(e) => setFormData({ ...formData, anchor_text: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                placeholder="click here for SEO"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Spam Score</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.spam_score}
                                onChange={(e) => setFormData({ ...formData, spam_score: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                placeholder="0-100"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">DR (Domain Rating)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.dr}
                                onChange={(e) => setFormData({ ...formData, dr: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                placeholder="0-100"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">DR Type</label>
                            <select
                                value={formData.dr_type}
                                onChange={(e) => setFormData({ ...formData, dr_type: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                            >
                                <option value="">Select type</option>
                                {DR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Assigned To</label>
                            <select
                                value={formData.assigned_to_id}
                                onChange={(e) => setFormData({ ...formData, assigned_to_id: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
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
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                            >
                                <option value="">Select service</option>
                                {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 h-20 resize-none"
                            placeholder="Additional notes about this toxic backlink..."
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
                        disabled={isSubmitting || !formData.domain || !formData.toxic_url}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Adding...' : 'Add Toxic Link'}
                    </button>
                </div>
            </div>
        </div>
    );


    // Domain Group View
    const renderDomainView = () => (
        <div className="space-y-4">
            {Object.entries(groupedByDomain).map(([domain, links]) => {
                const avgSpamScore = Math.round(links.reduce((sum, l) => sum + (l.spam_score || 0), 0) / links.length);
                const highestSeverity = links.reduce((highest, l) => {
                    const order = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
                    return (order[l.severity as keyof typeof order] || 0) > (order[highest as keyof typeof order] || 0) ? l.severity : highest;
                }, 'Low');

                return (
                    <div key={domain} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 bg-red-50 border-b border-red-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-red-900">{domain}</h3>
                                        <p className="text-xs text-red-600">{links.length} toxic link{links.length > 1 ? 's' : ''} found</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-center">
                                        <p className="text-xs text-slate-500">Avg Spam</p>
                                        <SpamScoreBadge score={avgSpamScore} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-slate-500">Severity</p>
                                        <SeverityBadge severity={highestSeverity} />
                                    </div>
                                    <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700">
                                        View All
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {links.slice(0, 3).map(link => (
                                <div key={link.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-blue-600 truncate">{link.toxic_url}</p>
                                        <p className="text-xs text-slate-500">Anchor: <span className="italic">{link.anchor_text || '-'}</span></p>
                                    </div>
                                    <div className="flex items-center gap-3 ml-4">
                                        <SpamScoreBadge score={link.spam_score} />
                                        <StatusBadge status={link.status} />
                                    </div>
                                </div>
                            ))}
                            {links.length > 3 && (
                                <div className="p-2 text-center">
                                    <button className="text-xs text-red-600 hover:text-red-800 font-medium">
                                        + {links.length - 3} more links
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
            {Object.keys(groupedByDomain).length === 0 && (
                <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">
                    No toxic backlinks found
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
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Backlink</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Toxic URL</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Landing Page</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Anchor Text</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Spam Score</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">DR</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">DR Type</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Severity</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Assigned To</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Last Updated</th>
                            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredLinks.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3">
                                    <span className="font-medium text-red-700 text-sm">{item.domain}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-blue-600 truncate block max-w-[200px]" title={item.toxic_url}>
                                        {item.toxic_url}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-slate-600 truncate block max-w-[150px]">
                                        {item.landing_page || '-'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-slate-500 italic truncate block max-w-[120px]">
                                        {item.anchor_text || '-'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <SpamScoreBadge score={item.spam_score} />
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <DRBadge dr={item.dr} />
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-xs text-slate-600 truncate block max-w-[120px]">
                                        {item.dr_type || '-'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <SeverityBadge severity={item.severity} />
                                </td>
                                <td className="px-4 py-3">
                                    {item.assigned_to_name ? (
                                        <div className="flex items-center gap-2">
                                            <Avatar name={item.assigned_to_name} />
                                            <span className="text-sm text-slate-700">{item.assigned_to_name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-slate-400">-</span>
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
                                        <button
                                            onClick={() => handleDisavow(item.id)}
                                            className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 font-medium"
                                        >
                                            Disavow
                                        </button>
                                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredLinks.length === 0 && (
                            <tr>
                                <td colSpan={12} className="px-4 py-12 text-center text-slate-500">
                                    No toxic backlinks found
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
                            <h1 className="text-2xl font-bold text-slate-900">Toxic Backlink Repository</h1>
                            <p className="text-sm text-slate-500">Monitor database for spammy and harmful backlinks for removal</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <select className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white">
                        <option>This Week</option>
                        <option>This Month</option>
                        <option>All Time</option>
                    </select>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg transition-colors ${showFilters
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'text-slate-600 border-slate-300 hover:bg-white'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filters
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Import Toxic Links
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-white">
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
                        Add Toxic Link
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
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                            placeholder="Search by URL, page, anchor text..."
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
                    <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                        <span className="text-xs text-slate-500 mr-2">View:</span>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${viewMode === 'list' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'
                                }`}
                        >
                            List View
                        </button>
                        <button
                            onClick={() => setViewMode('domain')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${viewMode === 'domain' ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:bg-slate-100'
                                }`}
                        >
                            Domain Group View
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {viewMode === 'list' ? renderListView() : renderDomainView()}
            </div>
        </div>
    );
};

export default ToxicBacklinksView;
