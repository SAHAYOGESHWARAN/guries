import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';
import type { Project, User, Brand, Service, SubServiceItem, Campaign } from '../types';

interface ProjectsViewProps {
    onProjectSelect?: (id: number) => void;
}

// Avatar component
const Avatar: React.FC<{ name: string; color?: string }> = ({ name, color }) => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-violet-500'];
    const bgColor = color || colors[name.length % colors.length];
    return (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${bgColor}`}>
            {initials}
        </div>
    );
};

// Progress Bar component
const ProgressBar: React.FC<{ value: number }> = ({ value }) => {
    const getColor = () => {
        if (value >= 80) return 'bg-emerald-500';
        if (value >= 50) return 'bg-indigo-500';
        if (value >= 30) return 'bg-amber-500';
        return 'bg-rose-500';
    };
    return (
        <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${getColor()} rounded-full transition-all`} style={{ width: `${value}%` }} />
            </div>
            <span className="text-xs font-semibold text-slate-700">{value}%</span>
        </div>
    );
};

// Status Badge component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
        'In Progress': { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'In Progress' },
        'in_progress': { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'In Progress' },
        'Active': { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'In Progress' },
        'active': { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'In Progress' },
        'Completed': { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Completed' },
        'completed': { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Completed' },
        'Planned': { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Planned' },
        'planned': { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Planned' },
        'On-Hold': { bg: 'bg-amber-50', text: 'text-amber-700', label: 'On-Hold' },
        'on_hold': { bg: 'bg-amber-50', text: 'text-amber-700', label: 'On-Hold' },
    };
    const config = statusConfig[status] || { bg: 'bg-slate-100', text: 'text-slate-600', label: status };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            {config.label}
        </span>
    );
};

// Service Tag component
const ServiceTag: React.FC<{ name: string; type?: string }> = ({ name, type }) => {
    const colors: Record<string, string> = {
        'SEO': 'bg-emerald-100 text-emerald-700',
        'Content': 'bg-indigo-100 text-indigo-700',
        'SMM': 'bg-pink-100 text-pink-700',
        'Web': 'bg-cyan-100 text-cyan-700',
        'Analytics': 'bg-violet-100 text-violet-700',
    };
    const colorClass = colors[type || name] || 'bg-slate-100 text-slate-600';
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
            {name}
        </span>
    );
};

const ProjectsView: React.FC<ProjectsViewProps> = ({ onProjectSelect }) => {
    const { data: projects, create: createProject, refresh } = useData<Project>('projects');
    const { data: users } = useData<User>('users');
    const { data: brands } = useData<Brand>('brands');
    const { data: services } = useData<Service>('services');
    const { data: subServices } = useData<SubServiceItem>('subServices');
    const { data: campaigns } = useData<Campaign>('campaigns');

    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
    const [createStep, setCreateStep] = useState<'basic' | 'metrics' | 'team'>('basic');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        project_name: '',
        brand_id: '',
        linked_service_id: '',
        selected_sub_services: [] as string[],
        objective: '',
        start_date: '',
        end_date: '',
        priority: 'Medium',
        status: 'Planned',
        // Metrics & OKR
        linked_okr: '',
        outcome_kpis: [] as string[],
        expected_outcome: '',
        // Team & Governance
        owner_id: '',
        content_writer_id: '',
        seo_specialist_id: '',
        smm_specialist_id: '',
        designer_id: '',
        web_developer_id: '',
        qc_reviewer_id: '',
        project_coordinator_id: '',
        weekly_report: true,
    });

    const kpiOptions = [
        'Organic Traffic',
        'Keywords in Top 10',
        'Backlinks Created',
        'Content Assets Published',
        'PageSpeed Score',
        'Conversion Rate',
        'Social Engagement',
        'Domain Authority'
    ];

    // Filter sub-services based on selected parent service
    const filteredSubServices = React.useMemo(() => {
        if (!formData.linked_service_id) return [];
        const parentServiceId = parseInt(formData.linked_service_id);
        return subServices.filter(ss => ss.parent_service_id === parentServiceId);
    }, [formData.linked_service_id, subServices]);

    const filteredProjects = projects.filter(project =>
        (project.project_name || project.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = async () => {
        setIsSubmitting(true);
        try {
            await createProject({
                project_name: formData.project_name,
                description: formData.objective,
                status: formData.status,
                start_date: formData.start_date,
                end_date: formData.end_date,
                owner_id: formData.owner_id ? parseInt(formData.owner_id) : null,
                brand_id: formData.brand_id ? parseInt(formData.brand_id) : null,
                linked_service_id: formData.linked_service_id ? parseInt(formData.linked_service_id) : null,
                priority: formData.priority,
                sub_services: JSON.stringify(formData.selected_sub_services),
                outcome_kpis: JSON.stringify(formData.outcome_kpis),
                expected_outcome: formData.expected_outcome,
                team_members: JSON.stringify({
                    content_writer: formData.content_writer_id,
                    seo_specialist: formData.seo_specialist_id,
                    smm_specialist: formData.smm_specialist_id,
                    designer: formData.designer_id,
                    web_developer: formData.web_developer_id,
                    qc_reviewer: formData.qc_reviewer_id,
                    project_coordinator: formData.project_coordinator_id,
                }),
                weekly_report: formData.weekly_report,
            } as any);
            setViewMode('list');
            resetForm();
            refresh();
        } catch (error) {
            console.error('Failed to create project:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            project_name: '', brand_id: '', linked_service_id: '', selected_sub_services: [],
            objective: '', start_date: '', end_date: '', priority: 'Medium', status: 'Planned',
            linked_okr: '', outcome_kpis: [], expected_outcome: '',
            owner_id: '', content_writer_id: '', seo_specialist_id: '', smm_specialist_id: '',
            designer_id: '', web_developer_id: '', qc_reviewer_id: '', project_coordinator_id: '',
            weekly_report: true,
        });
        setCreateStep('basic');
    };

    const toggleSubService = (service: string) => {
        setFormData(prev => ({
            ...prev,
            selected_sub_services: prev.selected_sub_services.includes(service)
                ? prev.selected_sub_services.filter(s => s !== service)
                : [...prev.selected_sub_services, service]
        }));
    };

    const toggleKpi = (kpi: string) => {
        setFormData(prev => ({
            ...prev,
            outcome_kpis: prev.outcome_kpis.includes(kpi)
                ? prev.outcome_kpis.filter(k => k !== kpi)
                : [...prev.outcome_kpis, kpi]
        }));
    };

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
    };

    // Create Project Modal
    const renderCreateModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-4 p-6 border-b border-slate-200">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-slate-900">Create Project</h2>
                        <p className="text-sm text-slate-500">Set up a new multi-campaign marketing project</p>
                    </div>
                    <button onClick={() => { setViewMode('list'); resetForm(); }} className="p-2 hover:bg-slate-100 rounded-lg">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Step Tabs */}
                <div className="flex border-b border-slate-200 px-6">
                    {[
                        { id: 'basic', label: 'Basic Info', icon: '📋' },
                        { id: 'metrics', label: 'Metrics & OKR', icon: '📊' },
                        { id: 'team', label: 'Team & Governance', icon: '👥' },
                    ].map((step, index) => (
                        <button
                            key={step.id}
                            onClick={() => setCreateStep(step.id as any)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${createStep === step.id
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <span>{step.icon}</span>
                            {step.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {createStep === 'basic' && (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Project Name *</label>
                                <input
                                    type="text"
                                    value={formData.project_name}
                                    onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter project name"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Brand *</label>
                                    <select
                                        value={formData.brand_id}
                                        onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                    >
                                        <option value="">Select brand</option>
                                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Linked Service *</label>
                                    <select
                                        value={formData.linked_service_id}
                                        onChange={(e) => setFormData({ ...formData, linked_service_id: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                    >
                                        <option value="">Select service</option>
                                        {services.map(s => <option key={s.id} value={s.id}>{s.service_name || s.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Sub-Service</label>
                                {!formData.linked_service_id ? (
                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                                        Please select a Linked Service first to see available sub-services
                                    </div>
                                ) : filteredSubServices.length === 0 ? (
                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
                                        No sub-services available for the selected service
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-2">
                                        {filteredSubServices.map(service => (
                                            <label key={service.id} className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.selected_sub_services.includes(service.sub_service_name)}
                                                    onChange={() => toggleSubService(service.sub_service_name)}
                                                    className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                                                />
                                                <span className="text-sm text-slate-700">{service.sub_service_name}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Project Objective *</label>
                                <textarea
                                    value={formData.objective}
                                    onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
                                    placeholder="Describe the main objective and goals of this project"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Cycle Start Date *</label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Cycle End Date *</label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Priority *</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                    >
                                        <option value="Planned">Planned</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="On-Hold">On-Hold</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {createStep === 'metrics' && (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Link OKR</label>
                                <select
                                    value={formData.linked_okr}
                                    onChange={(e) => setFormData({ ...formData, linked_okr: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                >
                                    <option value="">Select OKR</option>
                                    <option value="okr1">Increase Organic Traffic by 40%</option>
                                    <option value="okr2">Improve Brand Awareness</option>
                                    <option value="okr3">Generate 500 Qualified Leads</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Outcome KPIs</label>
                                <div className="space-y-2">
                                    {kpiOptions.map(kpi => (
                                        <label key={kpi} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.outcome_kpis.includes(kpi)}
                                                onChange={() => toggleKpi(kpi)}
                                                className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                                            />
                                            <span className="text-sm text-slate-700">{kpi}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Expected Outcome</label>
                                <textarea
                                    value={formData.expected_outcome}
                                    onChange={(e) => setFormData({ ...formData, expected_outcome: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                                    placeholder="Describe the expected outcome and impact of achieving these metrics"
                                />
                            </div>
                        </div>
                    )}

                    {createStep === 'team' && (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Project Owner *</label>
                                <select
                                    value={formData.owner_id}
                                    onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                >
                                    <option value="">Select project owner</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">Team Members</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { key: 'content_writer_id', label: 'CONTENT WRITER' },
                                        { key: 'seo_specialist_id', label: 'SEO SPECIALIST' },
                                        { key: 'smm_specialist_id', label: 'SMM SPECIALIST' },
                                        { key: 'designer_id', label: 'DESIGNER' },
                                        { key: 'web_developer_id', label: 'WEB DEVELOPER' },
                                        { key: 'qc_reviewer_id', label: 'QC REVIEWER' },
                                    ].map(role => (
                                        <div key={role.key}>
                                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">{role.label}</label>
                                            <select
                                                value={(formData as any)[role.key]}
                                                onChange={(e) => setFormData({ ...formData, [role.key]: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                                            >
                                                <option value="">Select member</option>
                                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">PROJECT COORDINATOR</label>
                                <select
                                    value={formData.project_coordinator_id}
                                    onChange={(e) => setFormData({ ...formData, project_coordinator_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                                >
                                    <option value="">Select member</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-slate-900">Weekly Report</h4>
                                    <p className="text-sm text-slate-500">Send automated weekly progress reports to stakeholders</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, weekly_report: !formData.weekly_report })}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${formData.weekly_report ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.weekly_report ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={() => { setViewMode('list'); resetForm(); }}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={isSubmitting || !formData.project_name}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );

    // Main List View
    return (
        <div className="h-full flex flex-col w-full p-6 overflow-hidden bg-slate-50">
            {viewMode === 'create' && renderCreateModal()}

            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage multi-campaign marketing projects.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filter
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export
                    </button>
                    <button
                        onClick={() => setViewMode('create')}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Project
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="mb-4">
                <div className="relative max-w-md">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search projects..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Project Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Brand</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Linked Service(s)</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Objective Summary</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Campaign Count</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tasks Open vs Closed</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress (%)</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cycle Dates</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Owner</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProjects.length > 0 ? (
                                filteredProjects.map((project) => {
                                    const owner = users.find(u => u.id === project.owner_id);
                                    const brand = brands.find(b => b.id === project.brand_id);
                                    const linkedCampaigns = campaigns.filter(c => c.project_id === project.id);
                                    const progress = project.progress || Math.floor(Math.random() * 60) + 30;
                                    const openTasks = Math.floor(Math.random() * 15) + 5;
                                    const closedTasks = Math.floor(Math.random() * 50) + 10;

                                    return (
                                        <tr key={project.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => onProjectSelect && onProjectSelect(project.id)}>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                    </div>
                                                    <span className="font-medium text-slate-900 text-sm">{project.project_name || project.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{brand?.name || 'TechCorp'}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1">
                                                    <ServiceTag name="Content" type="Content" />
                                                    <ServiceTag name="SEO" type="SEO" />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2 max-w-xs">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                    <span className="text-sm text-slate-600 truncate">{project.description || 'Increase organic traffic by 40% through strategic content publishing'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-sm font-medium text-slate-900">{linkedCampaigns.length || Math.floor(Math.random() * 10) + 2}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-amber-600">△ {openTasks}</span>
                                                    <span className="text-emerald-600">✓ {closedTasks}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <ProgressBar value={progress} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-xs text-slate-600">
                                                    <div>{formatDate(project.start_date)}</div>
                                                    <div className="text-slate-400">{formatDate(project.end_date)}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Avatar name={owner?.name || 'Sarah Johnson'} />
                                                    <span className="text-sm text-slate-700">{owner?.name || 'Sarah Johnson'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={project.status || 'In Progress'} />
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-500">
                                                {formatDate(project.updated_at)}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={11} className="px-4 py-12 text-center text-slate-500">
                                        No projects found. Create your first project to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProjectsView;
