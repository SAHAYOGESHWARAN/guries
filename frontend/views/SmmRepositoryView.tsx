import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import type { SmmPost, User, Service, SubServiceItem, Campaign } from '../types';

// Pipeline stages matching the design
const PIPELINE_STAGES = [
    { key: 'All', label: 'All' },
    { key: 'Draft', label: 'Draft' },
    { key: 'Scheduled', label: 'Scheduled' },
    { key: 'QC Pending', label: 'QC Pending' },
    { key: 'Approved', label: 'Approved' },
    { key: 'Posted', label: 'Posted' },
    { key: 'Rejected', label: 'Rejected' },
    { key: 'Needs Rework', label: 'Needs Rework' },
];

const PLATFORMS = [
    { name: 'LinkedIn', icon: '💼' },
    { name: 'Instagram', icon: '📸' },
    { name: 'YouTube', icon: '▶️' },
    { name: 'Facebook', icon: '👤' },
    { name: 'Twitter', icon: '🐦' },
];

const POST_TYPES = ['Image Post', 'Carousel', 'Video', 'Reel', 'Text Post', 'Story'];
const CONTENT_TYPES = ['Promotional', 'Educational', 'Engagement', 'Announcement', 'Behind the Scenes'];

// Platform Icon
const PlatformIcon: React.FC<{ platform: string }> = ({ platform }) => {
    const icons: Record<string, { icon: string; color: string }> = {
        'LinkedIn': { icon: '💼', color: 'text-blue-600' },
        'Instagram': { icon: '📸', color: 'text-pink-600' },
        'YouTube': { icon: '▶️', color: 'text-red-600' },
        'Facebook': { icon: '👤', color: 'text-blue-500' },
        'Twitter': { icon: '🐦', color: 'text-sky-500' },
    };
    const p = icons[platform] || { icon: '📱', color: 'text-slate-600' };
    return <span className={`text-lg ${p.color}`}>{p.icon}</span>;
};

// Post Type Badge
const PostTypeBadge: React.FC<{ type: string }> = ({ type }) => {
    const colors: Record<string, string> = {
        'Carousel': 'bg-indigo-100 text-indigo-700',
        'Reel': 'bg-pink-100 text-pink-700',
        'Video': 'bg-red-100 text-red-700',
        'Image Post': 'bg-emerald-100 text-emerald-700',
        'Text Post': 'bg-slate-100 text-slate-700',
        'Story': 'bg-amber-100 text-amber-700',
    };
    const colorClass = colors[type] || 'bg-slate-100 text-slate-600';
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>{type}</span>;
};


// Status Badge
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, { bg: string; text: string }> = {
        'Draft': { bg: 'bg-amber-50', text: 'text-amber-700' },
        'Scheduled': { bg: 'bg-indigo-50', text: 'text-indigo-700' },
        'QC Pending': { bg: 'bg-purple-50', text: 'text-purple-700' },
        'Approved': { bg: 'bg-cyan-50', text: 'text-cyan-700' },
        'Posted': { bg: 'bg-emerald-50', text: 'text-emerald-700' },
        'Rejected': { bg: 'bg-red-50', text: 'text-red-700' },
        'Needs Rework': { bg: 'bg-orange-50', text: 'text-orange-700' },
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

const SmmRepositoryView: React.FC = () => {
    const { data: posts, create: createPost, refresh } = useData<SmmPost>('smm');
    const { data: users } = useData<User>('users');
    const { data: services } = useData<Service>('services');
    const { data: subServices } = useData<SubServiceItem>('subServices');
    const { data: campaigns } = useData<Campaign>('campaigns');

    const [searchQuery, setSearchQuery] = useState('');
    const [activeStage, setActiveStage] = useState('All');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid' | 'calendar'>('table');

    // Form state
    const [formData, setFormData] = useState({
        primary_platform: '',
        content_type: '',
        caption: '',
        hashtags: '',
        service_id: '',
        sub_service_id: '',
        campaign_id: '',
        keywords: '',
        schedule_date: '',
        schedule_time: '',
        assigned_to_id: '',
        smm_type: 'Image Post',
        smm_status: 'Draft',
    });

    const getStageCount = (stage: string) => {
        if (stage === 'All') return posts.length;
        return posts.filter(p => p.smm_status === stage).length;
    };

    const filteredPosts = posts.filter(item => {
        const matchesSearch = item.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.primary_platform?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStage = activeStage === 'All' || item.smm_status === activeStage;
        return matchesSearch && matchesStage;
    });

    const handleCreate = async (isDraft: boolean = false) => {
        if (!formData.primary_platform || !formData.caption) {
            alert('Please fill in required fields');
            return;
        }
        setIsSubmitting(true);
        try {
            await createPost({
                title: formData.caption.substring(0, 50) + '...',
                primary_platform: formData.primary_platform,
                content_type: formData.content_type || null,
                smm_type: formData.smm_type,
                caption: formData.caption,
                hashtags: formData.hashtags || null,
                service_id: formData.service_id ? parseInt(formData.service_id) : null,
                sub_service_id: formData.sub_service_id ? parseInt(formData.sub_service_id) : null,
                campaign_id: formData.campaign_id ? parseInt(formData.campaign_id) : null,
                keywords: formData.keywords || null,
                schedule_date: formData.schedule_date || null,
                schedule_time: formData.schedule_time || null,
                assigned_to_id: formData.assigned_to_id ? parseInt(formData.assigned_to_id) : null,
                smm_status: isDraft ? 'Draft' : 'Scheduled',
            } as any);
            setShowCreateModal(false);
            resetForm();
            refresh();
        } catch (error) {
            console.error('Failed to create post:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            primary_platform: '', content_type: '', caption: '', hashtags: '',
            service_id: '', sub_service_id: '', campaign_id: '', keywords: '',
            schedule_date: '', schedule_time: '', assigned_to_id: '', smm_type: 'Image Post', smm_status: 'Draft',
        });
    };

    const formatSchedule = (date?: string, time?: string) => {
        if (!date) return '-';
        const d = new Date(date);
        const dateStr = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
        return time ? `${dateStr} ${time}` : dateStr;
    };


    // Create Post Modal
    const renderCreateModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Create New Post</h2>
                        <p className="text-sm text-slate-500">Create and schedule social media content</p>
                    </div>
                    <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="p-2 hover:bg-slate-100 rounded-lg">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Choose Platform *</label>
                            <select
                                value={formData.primary_platform}
                                onChange={(e) => setFormData({ ...formData, primary_platform: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="">Select platform</option>
                                {PLATFORMS.map(p => <option key={p.name} value={p.name}>{p.icon} {p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Content Type *</label>
                            <select
                                value={formData.content_type}
                                onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="">Select content type</option>
                                {CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Caption *</label>
                        <textarea
                            value={formData.caption}
                            onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-32 resize-none"
                            placeholder="Write your post caption..."
                        />
                        <div className="text-xs text-slate-400 mt-1">{formData.caption.length} characters</div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Hashtags</label>
                        <input
                            type="text"
                            value={formData.hashtags}
                            onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="#hashtag1 #hashtag2 #hashtag3"
                        />
                    </div>

                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors cursor-pointer">
                        <div className="flex flex-col items-center">
                            <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-sm font-medium text-slate-600">Click to upload or link from repository</p>
                            <p className="text-xs text-slate-400 mt-1">Images, Videos, PDFs up to 50MB</p>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                        <h3 className="font-semibold text-slate-900 mb-3">Content Mapping</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Service Mapping</label>
                                <select
                                    value={formData.service_id}
                                    onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
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
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                >
                                    <option value="">Select sub-service</option>
                                    {subServices.map(s => <option key={s.id} value={s.id}>{s.sub_service_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Campaign</label>
                                <select
                                    value={formData.campaign_id}
                                    onChange={(e) => setFormData({ ...formData, campaign_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                                >
                                    <option value="">Select campaign</option>
                                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.campaign_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Keywords</label>
                                <input
                                    type="text"
                                    value={formData.keywords}
                                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="keyword1, keyword2"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                        <h3 className="font-semibold text-slate-900 mb-3">Schedule Post</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Schedule Date</label>
                                <input
                                    type="date"
                                    value={formData.schedule_date}
                                    onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Schedule Time</label>
                                <input
                                    type="time"
                                    value={formData.schedule_time}
                                    onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                            <span>💡</span>
                            <span>Best posting time for this platform: 10:00 AM - 2:00 PM</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Assign Owner</label>
                        <select
                            value={formData.assigned_to_id}
                            onChange={(e) => setFormData({ ...formData, assigned_to_id: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
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
                        onClick={() => handleCreate(true)}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100"
                    >
                        Create Draft
                    </button>
                    <button
                        onClick={() => handleCreate(false)}
                        disabled={isSubmitting || !formData.primary_platform || !formData.caption}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Creating...' : 'Create & Schedule'}
                    </button>
                </div>
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
                        <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">SMM Posting & Scheduling</h1>
                            <p className="text-sm text-slate-500">Create, schedule, and manage social media content across all platforms</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <select className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white">
                        <option>This Week</option>
                        <option>This Month</option>
                        <option>All Time</option>
                    </select>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filters
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Bulk Upload Content
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Post
                    </button>
                </div>
            </div>

            {/* Search and Stage Tabs */}
            <div className="mb-4 space-y-3">
                <div className="relative max-w-md">
                    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        placeholder="Search by post caption, platform, keyword, asset, campaign..."
                    />
                </div>

                {/* Stage Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {PIPELINE_STAGES.map(stage => (
                        <button
                            key={stage.key}
                            onClick={() => setActiveStage(stage.key)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeStage === stage.key
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {stage.label}
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeStage === stage.key ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-200 text-slate-600'
                                }`}>
                                {getStageCount(stage.key)}
                            </span>
                        </button>
                    ))}
                    <div className="flex-1" />
                    <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`p-2 rounded-lg ${viewMode === 'calendar' ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>


            {/* Table */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto h-full">
                    <table className="w-full min-w-[1200px]">
                        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Platform</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Post Type</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-80">Caption</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Asset</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Service Mapping</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Schedule</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Assigned To</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPosts.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center">
                                            <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                            </svg>
                                            <p className="text-sm font-medium">No posts found</p>
                                            <p className="text-xs text-slate-400 mt-1">Create a new post to get started</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredPosts.map((item) => {
                                    const assignee = users.find(u => u.id === item.assigned_to_id);
                                    const service = services.find(s => s.id === item.service_id);
                                    const subService = subServices.find(s => s.id === item.sub_service_id);

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <PlatformIcon platform={item.primary_platform} />
                                                    <span className="text-sm font-medium text-slate-700">{item.primary_platform}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <PostTypeBadge type={item.smm_type} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm text-slate-700 line-clamp-2 max-w-xs">{item.caption}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">
                                                {item.asset_count ? `${item.asset_count} ${item.asset_count > 1 ? 'assets' : 'asset'}` : 'No assets'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm">
                                                    <div className="font-medium text-slate-700">{item.service_name || service?.service_name || '-'}</div>
                                                    {(item.sub_service_name || subService?.sub_service_name) && (
                                                        <div className="text-xs text-slate-500">{item.sub_service_name || subService?.sub_service_name}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 text-sm text-slate-600">
                                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {formatSchedule(item.schedule_date, item.schedule_time)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={item.smm_status} />
                                            </td>
                                            <td className="px-4 py-3">
                                                {assignee || item.assigned_to_name ? (
                                                    <div className="flex items-center gap-2">
                                                        <Avatar name={item.assigned_to_name || assignee?.name || ''} />
                                                        <span className="text-sm text-slate-700">{item.assigned_to_name || assignee?.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-slate-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700" title="View">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700" title="Edit">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700" title="More">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SmmRepositoryView;