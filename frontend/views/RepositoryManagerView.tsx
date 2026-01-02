import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface Repository {
    id: number;
    repo_name: string;
    description: string;
    type: string;
    storage_path: string;
    max_size_gb: number;
    used_size_gb: number;
    file_types: string;
    status: string;
}

interface RepositoryManagerViewProps {
    onNavigate?: (view: string, id?: number | null) => void;
}

const RepositoryManagerView: React.FC<RepositoryManagerViewProps> = ({ onNavigate }) => {
    const { hasPermission } = useAuth();
    const canAccess = hasPermission('canViewAdminConsole');

    const [repos, setRepos] = useState<Repository[]>([
        { id: 1, repo_name: 'Content Repository', description: 'Blog posts, articles, and written content', type: 'Content', storage_path: '/storage/content', max_size_gb: 100, used_size_gb: 45.2, file_types: 'doc,docx,pdf,txt', status: 'Active' },
        { id: 2, repo_name: 'Asset Library', description: 'Images, videos, and media files', type: 'Media', storage_path: '/storage/assets', max_size_gb: 500, used_size_gb: 234.8, file_types: 'jpg,png,gif,mp4,webp', status: 'Active' },
        { id: 3, repo_name: 'Design Files', description: 'Source design files and templates', type: 'Design', storage_path: '/storage/design', max_size_gb: 200, used_size_gb: 89.3, file_types: 'psd,ai,fig,sketch', status: 'Active' },
        { id: 4, repo_name: 'Knowledge Base', description: 'Documentation and guides', type: 'Documentation', storage_path: '/storage/kb', max_size_gb: 50, used_size_gb: 12.1, file_types: 'md,html,pdf', status: 'Active' },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Repository | null>(null);
    const [formData, setFormData] = useState({ repo_name: '', description: '', type: 'Content', storage_path: '', max_size_gb: 100, used_size_gb: 0, file_types: '', status: 'Active' });

    if (!canAccess) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-50">
                <div className="text-center p-8">
                    <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
                    <p className="text-slate-600">Only administrators can access this configuration.</p>
                </div>
            </div>
        );
    }

    const handleSave = () => {
        if (editingItem) {
            setRepos(repos.map(r => r.id === editingItem.id ? { ...r, ...formData } : r));
        } else {
            setRepos([...repos, { ...formData, id: Date.now() } as Repository]);
        }
        setShowModal(false);
        setEditingItem(null);
        setFormData({ repo_name: '', description: '', type: 'Content', storage_path: '', max_size_gb: 100, used_size_gb: 0, file_types: '', status: 'Active' });
    };

    const handleEdit = (item: Repository) => {
        setEditingItem(item);
        setFormData(item);
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this repository?')) {
            setRepos(repos.filter(r => r.id !== id));
        }
    };

    const getUsagePercent = (used: number, max: number) => Math.round((used / max) * 100);

    return (
        <div className="h-full flex flex-col bg-slate-50 animate-fade-in overflow-hidden">
            <div className="bg-white border-b border-slate-200 px-6 py-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => onNavigate?.('admin-console-config')} className="p-2 hover:bg-slate-100 rounded-lg">
                            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <span className="text-xl">📚</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Repository Manager</h1>
                            <p className="text-slate-500 text-sm">Manage content repositories, asset libraries, and knowledge base</p>
                        </div>
                    </div>
                    <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Repository
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {repos.map(repo => (
                        <div key={repo.id} className="bg-white rounded-xl border border-slate-200 p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-slate-800">{repo.repo_name}</h3>
                                    <p className="text-sm text-slate-500">{repo.description}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${repo.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{repo.status}</span>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-600">Storage Used</span>
                                        <span className="font-medium text-slate-800">{repo.used_size_gb} / {repo.max_size_gb} GB</span>
                                    </div>
                                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${getUsagePercent(repo.used_size_gb, repo.max_size_gb) > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${getUsagePercent(repo.used_size_gb, repo.max_size_gb)}%` }}></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Type: <span className="text-slate-700">{repo.type}</span></span>
                                    <span className="text-slate-500">Files: <span className="text-slate-700">{repo.file_types}</span></span>
                                </div>
                                <div className="flex gap-2 pt-2 border-t border-slate-100">
                                    <button onClick={() => handleEdit(repo)} className="flex-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">Edit</button>
                                    <button onClick={() => handleDelete(repo.id)} className="flex-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">{editingItem ? 'Edit Repository' : 'Add Repository'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Repository Name</label>
                                <input type="text" value={formData.repo_name} onChange={e => setFormData({ ...formData, repo_name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" rows={2}></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                                        <option value="Content">Content</option>
                                        <option value="Media">Media</option>
                                        <option value="Design">Design</option>
                                        <option value="Documentation">Documentation</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Max Size (GB)</label>
                                    <input type="number" value={formData.max_size_gb} onChange={e => setFormData({ ...formData, max_size_gb: Number(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Allowed File Types (comma-separated)</label>
                                <input type="text" value={formData.file_types} onChange={e => setFormData({ ...formData, file_types: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="jpg,png,pdf,doc" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RepositoryManagerView;
