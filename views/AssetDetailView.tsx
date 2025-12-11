import React, { useState, useEffect } from 'react';
import Tooltip from '../components/Tooltip';
import CircularScore from '../components/CircularScore';
import { getStatusBadge } from '../constants';
import { useData } from '../hooks/useData';
import type { AssetLibraryItem, Service, SubServiceItem, User, Task, Campaign, Project } from '../types';

interface AssetDetailViewProps {
    assetId?: number;
    onNavigateBack?: () => void;
}

const AssetDetailView: React.FC<AssetDetailViewProps> = ({ assetId, onNavigateBack }) => {

    const { data: services = [] } = useData<Service>('services');
    const { data: subServices = [] } = useData<SubServiceItem>('subServices');
    const { data: users = [] } = useData<User>('users');
    const { data: tasks = [] } = useData<Task>('tasks');
    const { data: campaigns = [] } = useData<Campaign>('campaigns');
    const { data: projects = [] } = useData<Project>('projects');

    const [asset, setAsset] = useState<AssetLibraryItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'qc' | 'usage' | 'performance'>('overview');
    const [showPreview, setShowPreview] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Mock engagement data - replace with real data
    const [engagementData] = useState({
        impressions: 45200,
        clicks: 3800,
        ctr: 8.4,
        shares: 420,
        performance_summary: "High engagement with 8.4% CTR, performing 24% above campaign average."
    });

    // Mock QC checklist data
    const [qcChecklist] = useState([
        { item: "Image Resolution & Quality", description: "Perfect 1920x1080 resolution, crisp and clear", score: 20, maxScore: 20, status: "Pass" },
        { item: "Brand Guidelines Compliance", description: "Colors match brand palette, minor typography adjustment needed", score: 18, maxScore: 20, status: "Pass" },
        { item: "Text Readability", description: "Excellent contrast and font sizing", score: 20, maxScore: 20, status: "Pass" },
        { item: "File Optimization", description: "Good compression, could be optimized further by 200KB", score: 18, maxScore: 20, status: "Pass" },
        { item: "Mobile Responsiveness Check", description: "Scales perfectly on mobile devices", score: 20, maxScore: 20, status: "Pass" }
    ]);

    // Mock usage data
    const [usageData] = useState({
        website_urls: [
            "https://example.com/blog/ai-trends-2025",
            "https://example.com/resources/ai-guide"
        ],
        social_posts: [
            { platform: "LinkedIn", url: "#", status: "Published" },
            { platform: "Twitter", url: "#", status: "Published" }
        ],
        backlink_submissions: [
            { domain: "techblog.com", status: "Approved" },
            { domain: "innovation.net", status: "Pending" }
        ]
    });

    useEffect(() => {
        const fetchAsset = async () => {
            if (assetId) {
                setLoading(true);
                try {
                    const response = await fetch(`/api/assetLibrary/${assetId}`);
                    if (response.ok) {
                        const assetData = await response.json();
                        setAsset(assetData);
                    } else {
                        console.error('Failed to fetch asset');
                    }
                } catch (error) {
                    console.error('Error fetching asset:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchAsset();
    }, [assetId]);

    if (loading || !asset) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading asset...</p>
                </div>
            </div>
        );
    }

    const getLinkedService = () => {
        if (asset.linked_service_ids && asset.linked_service_ids.length > 0) {
            return services.find(s => s.id === asset.linked_service_ids[0]);
        }
        return null;
    };

    const getLinkedSubService = () => {
        if (asset.linked_sub_service_ids && asset.linked_sub_service_ids.length > 0) {
            return subServices.find(ss => ss.id === asset.linked_sub_service_ids[0]);
        }
        return null;
    };

    const getLinkedTask = () => {
        if (asset.linked_task) {
            return tasks.find(t => t.id === asset.linked_task);
        }
        return null;
    };

    const getCreatedByUser = () => {
        if (asset.submitted_by) {
            return users.find(u => u.id === asset.submitted_by);
        }
        return null;
    };

    const getQCReviewer = () => {
        if (asset.qc_reviewer_id) {
            return users.find(u => u.id === asset.qc_reviewer_id);
        }
        return null;
    };

    const linkedService = getLinkedService();
    const linkedSubService = getLinkedSubService();
    const linkedTask = getLinkedTask();
    const createdByUser = getCreatedByUser();
    const qcReviewer = getQCReviewer();

    const totalQCScore = qcChecklist.reduce((sum, item) => sum + item.score, 0);
    const maxQCScore = qcChecklist.reduce((sum, item) => sum + item.maxScore, 0);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📋' },
        { id: 'qc', label: 'QC Panel', icon: '✅' },
        { id: 'usage', label: 'Usage Panel', icon: '🔗' },
        { id: 'performance', label: 'Performance', icon: '📊' }
    ];

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => onNavigateBack && onNavigateBack()}
                            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{asset.name}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                {getStatusBadge(asset.status || 'Draft')}
                                <span className="text-sm text-slate-500">•</span>
                                <span className="text-sm text-slate-600">Asset ID: {asset.id}</span>
                                <span className="text-sm text-slate-500">•</span>
                                <span className="text-sm text-slate-600">{asset.type}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowPreview(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Asset Preview
                        </button>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Asset
                        </button>
                        <button className="text-slate-600 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-slate-200 px-6 flex-shrink-0">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all flex items-center gap-2 ${activeTab === tab.id
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto">

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column - Asset Preview */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative">
                                        {asset.thumbnail_url || asset.file_url ? (
                                            <img
                                                src={asset.thumbnail_url || asset.file_url}
                                                alt={asset.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-white text-center">
                                                <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-sm opacity-75">No preview available</p>
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <button
                                                onClick={() => setShowPreview(true)}
                                                className="bg-black bg-opacity-50 text-white p-2 rounded-lg hover:bg-opacity-70 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </button>
                                            <button className="bg-black bg-opacity-50 text-white p-2 rounded-lg hover:bg-opacity-70 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <button className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                                                Large Preview
                                            </button>
                                            <button className="bg-slate-100 text-slate-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
                                                Download
                                            </button>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <button className="text-indigo-600 hover:text-indigo-800 font-medium">Replace</button>
                                            <span className="text-slate-400 mx-2">•</span>
                                            <button className="text-indigo-600 hover:text-indigo-800 font-medium">Version History</button>
                                            <span className="text-slate-400 mx-2">•</span>
                                            <button className="text-indigo-600 hover:text-indigo-800 font-medium">Metadata</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Asset Details */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Basic Information */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <span className="text-xl">📋</span>
                                        Asset Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Asset ID</label>
                                            <p className="text-slate-900 font-mono">{asset.id}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type</label>
                                            <p className="text-slate-900">{asset.type}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Content Type</label>
                                            <p className="text-slate-900">{asset.asset_category || 'Article'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dimensions</label>
                                            <p className="text-slate-900">1920x1080</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Size</label>
                                            <p className="text-slate-900">{asset.file_size ? `${(asset.file_size / 1024 / 1024).toFixed(1)} MB` : '2.4 MB'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Format</label>
                                            <p className="text-slate-900">{asset.file_type || 'JPEG'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Version</label>
                                            <p className="text-slate-900">v1.2</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Repository</label>
                                            <p className="text-slate-900">{asset.repository}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Created/Updated By */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <span className="text-xl">👥</span>
                                        Contributors
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Created By</label>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                    {createdByUser ? createdByUser.name.split(' ').map(n => n[0]).join('') : 'EW'}
                                                </div>
                                                <div>
                                                    <p className="text-slate-900 font-medium">{createdByUser?.name || 'Emily Watson'}</p>
                                                    <p className="text-xs text-slate-500">{asset.submitted_at ? new Date(asset.submitted_at).toLocaleDateString() : '2025-12-01'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Updated By</label>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                    JS
                                                </div>
                                                <div>
                                                    <p className="text-slate-900 font-medium">John Smith</p>
                                                    <p className="text-xs text-slate-500">{asset.updated_at ? new Date(asset.updated_at).toLocaleDateString() : '2025-12-02'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mapping & Links */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <span className="text-xl">🔗</span>
                                        Mapping & Links
                                    </h3>
                                    <div className="space-y-4">
                                        {linkedTask && (
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Linked Task</label>
                                                <p className="text-indigo-600 hover:text-indigo-800 cursor-pointer">{linkedTask.name}</p>
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Linked Campaign</label>
                                            <p className="text-indigo-600 hover:text-indigo-800 cursor-pointer">Content</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Linked Project</label>
                                            <p className="text-indigo-600 hover:text-indigo-800 cursor-pointer">Q4 Marketing Campaign</p>
                                        </div>
                                        {linkedService && (
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Linked Service</label>
                                                <p className="text-indigo-600 hover:text-indigo-800 cursor-pointer">{linkedService.service_name}</p>
                                            </div>
                                        )}
                                        {linkedSubService && (
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Linked Sub-Service</label>
                                                <p className="text-indigo-600 hover:text-indigo-800 cursor-pointer">{linkedSubService.sub_service_name}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Keywords Tagged */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <span className="text-xl">🏷️</span>
                                        Keywords Tagged
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {(asset.keywords || ['AI', 'Technology', 'Blog']).map((keyword, index) => (
                                            <span
                                                key={index}
                                                className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
                                            >
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* QC Panel Tab */}
                    {activeTab === 'qc' && (
                        <div className="space-y-8">
                            {/* QC Score Overview */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <span className="text-xl">✅</span>
                                        QC Panel
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <CircularScore score={asset.qc_score || 96} label="QC Score" size="lg" />
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-green-600">Pass</div>
                                            <div className="text-sm text-slate-500">Status</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reviewer</label>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                {qcReviewer ? qcReviewer.name.split(' ').map(n => n[0]).join('') : 'SJ'}
                                            </div>
                                            <p className="text-slate-900 font-medium">{qcReviewer?.name || 'Sarah Johnson'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">QC Date</label>
                                        <p className="text-slate-900">{asset.qc_reviewed_at ? new Date(asset.qc_reviewed_at).toLocaleDateString() : '2025-12-02'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Score</label>
                                        <p className="text-slate-900 font-bold text-lg">{asset.qc_score || 96} / 100</p>
                                    </div>
                                </div>
                            </div>

                            {/* QC Checklist & Scoring */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <span className="text-xl">📋</span>
                                    QC Checklist & Scoring
                                </h3>
                                <div className="space-y-4">
                                    {qcChecklist.map((item, index) => (
                                        <div key={index} className="border border-slate-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-slate-900">{item.item}</h4>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-bold text-slate-900">{item.score}/{item.maxScore}</span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600">{item.description}</p>
                                            <div className="mt-2">
                                                <div className="w-full bg-slate-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${(item.score / item.maxScore) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Usage Panel Tab */}
                    {activeTab === 'usage' && (
                        <div className="space-y-8">
                            {/* Website URLs */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <span className="text-xl">🌐</span>
                                    Website URLs
                                </h3>
                                <div className="space-y-3">
                                    {usageData.website_urls.map((url, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-medium">
                                                {url}
                                            </a>
                                            <button className="text-slate-400 hover:text-slate-600">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Social Media Posts */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <span className="text-xl">📱</span>
                                    Social Media Posts
                                </h3>
                                <div className="space-y-3">
                                    {usageData.social_posts.map((post, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${post.platform === 'LinkedIn' ? 'bg-blue-600' : 'bg-sky-500'
                                                    }`}>
                                                    {post.platform === 'LinkedIn' ? 'Li' : 'Tw'}
                                                </div>
                                                <span className="font-medium text-slate-900">{post.platform}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${post.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {post.status}
                                                </span>
                                            </div>
                                            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                                                View Post
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Backlink Submissions */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <span className="text-xl">🔗</span>
                                    Backlink Submissions
                                </h3>
                                <div className="space-y-3">
                                    {usageData.backlink_submissions.map((submission, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium text-slate-900">{submission.domain}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${submission.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {submission.status}
                                                </span>
                                            </div>
                                            <button className="text-slate-400 hover:text-slate-600">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Performance Tab */}
                    {activeTab === 'performance' && (
                        <div className="space-y-8">
                            {/* Engagement Metrics */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <span className="text-xl">📊</span>
                                    Engagement Metrics
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-indigo-600 mb-2">
                                            {engagementData.impressions.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Impressions</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-green-600 mb-2">
                                            {engagementData.clicks.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Clicks</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-purple-600 mb-2">
                                            {engagementData.ctr}%
                                        </div>
                                        <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">CTR</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-orange-600 mb-2">
                                            {engagementData.shares}
                                        </div>
                                        <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Shares</div>
                                    </div>
                                </div>
                            </div>

                            {/* Performance Summary */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <span className="text-xl">📈</span>
                                    Performance Summary
                                </h3>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-green-900 mb-1">Excellent Performance</h4>
                                            <p className="text-green-800 text-sm">{engagementData.performance_summary}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Performance Chart Placeholder */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <span className="text-xl">📊</span>
                                    Performance Over Time
                                </h3>
                                <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                                    <div className="text-center text-slate-500">
                                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <p>Performance chart would be displayed here</p>
                                        <p className="text-sm mt-1">Integration with analytics platform required</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white border-t border-slate-200 px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                            Open in Task
                        </button>
                        <span className="text-slate-300">|</span>
                        <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                            Edit Asset
                        </button>
                        <span className="text-slate-300">|</span>
                        <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                            Download
                        </button>
                    </div>
                    <div className="text-xs text-slate-500">
                        Last updated: {asset.updated_at ? new Date(asset.updated_at).toLocaleString() : 'Just now'}
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200">
                            <h3 className="text-lg font-bold text-slate-900">Asset Preview</h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4">
                            {asset.thumbnail_url || asset.file_url ? (
                                <img
                                    src={asset.thumbnail_url || asset.file_url}
                                    alt={asset.name}
                                    className="max-w-full max-h-[70vh] object-contain mx-auto"
                                />
                            ) : (
                                <div className="w-full h-96 bg-slate-100 rounded-lg flex items-center justify-center">
                                    <div className="text-center text-slate-500">
                                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p>No preview available</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetDetailView;