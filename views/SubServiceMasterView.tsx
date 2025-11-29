
import React, { useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal'; // Kept for asset picker
import { getStatusBadge, SparkIcon } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { SubServiceItem, Service, ContentRepositoryItem } from '../types';
import { runQuery } from '../utils/gemini';

const STATUSES = ['All Status', 'Published', 'Draft', 'Archived'];

const SubServiceMasterView: React.FC = () => {
    const { data: subServices, create, update, remove } = useData<SubServiceItem>('subServices');
    const { data: services } = useData<Service>('services');
    const { data: contentAssets, update: updateContentAsset } = useData<ContentRepositoryItem>('content');
    
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [parentFilter, setParentFilter] = useState('All Parent Services');
    const [statusFilter, setStatusFilter] = useState('All Status');

    const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);
    
    const [activeTab, setActiveTab] = useState<'Core' | 'Content' | 'SEO' | 'SMM' | 'Linking'>('Core');
    const [editingItem, setEditingItem] = useState<SubServiceItem | null>(null);
    const [isAiSuggesting, setIsAiSuggesting] = useState(false);

    const [formData, setFormData] = useState<Partial<SubServiceItem>>({
        sub_service_name: '', parent_service_id: 0, slug: '', full_url: '', description: '', status: 'Draft',
        h1: '', h2_list: [], h3_list: [], body_content: '',
        meta_title: '', meta_description: '', focus_keywords: [],
        og_title: '', og_description: '', og_image_url: '',
        assets_linked: 0
    });

    const [tempH2, setTempH2] = useState('');
    const [tempKeyword, setTempKeyword] = useState('');

    const filteredData = subServices.filter(item => {
        const matchesSearch = item.sub_service_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (item.slug || '').toLowerCase().includes(searchQuery.toLowerCase());
        const parentName = services.find(s => s.id === item.parent_service_id)?.service_name || '';
        const matchesParent = parentFilter === 'All Parent Services' || parentName === parentFilter;
        const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter;
        
        return matchesSearch && matchesParent && matchesStatus;
    });

    const handleEdit = (item: SubServiceItem) => {
        setEditingItem(item);
        setFormData({
            ...item,
            h2_list: item.h2_list || [],
            h3_list: item.h3_list || [],
            focus_keywords: item.focus_keywords || (item.keywords ? item.keywords : [])
        });
        setActiveTab('Core');
        setViewMode('form');
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this sub-service?')) await remove(id);
    };

    const handleSave = async () => {
        const payload = {
            ...formData,
            updated_at: new Date().toISOString(),
            keywords: formData.focus_keywords
        };

        if (editingItem) {
            await update(editingItem.id, payload);
        } else {
            await create(payload as any);
        }
        
        setViewMode('list');
        setEditingItem(null);
        resetForm();
    };

    const resetForm = () => {
        setFormData({ 
            sub_service_name: '', parent_service_id: 0, slug: '', full_url: '', description: '', status: 'Draft',
            h1: '', h2_list: [], h3_list: [], body_content: '',
            meta_title: '', meta_description: '', focus_keywords: [],
            og_title: '', og_description: '', og_image_url: '', assets_linked: 0
        });
        setActiveTab('Core');
    };

    const handleSlugChange = (val: string) => {
        const slug = val.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
        const parent = services.find(s => s.id === formData.parent_service_id);
        const parentSlug = parent ? parent.slug : 'service';
        setFormData(prev => ({ ...prev, slug, full_url: `/services/${parentSlug}/${slug}` }));
    };

    const addToList = (field: keyof SubServiceItem, value: string, setter: any) => {
        if (!value.trim()) return;
        setFormData(prev => ({
            ...prev,
            [field]: [...(prev[field] as string[] || []), value]
        }));
        setter('');
    };

    const removeFromList = (field: keyof SubServiceItem, index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: (prev[field] as string[]).filter((_, i) => i !== index)
        }));
    };

    const handleToggleAssetLink = async (asset: ContentRepositoryItem) => {
        if (!editingItem) return;
        const currentLinks = asset.linked_sub_service_ids || [];
        const isLinked = currentLinks.includes(editingItem.id);
        
        const newLinks = isLinked 
            ? currentLinks.filter(id => id !== editingItem.id)
            : [...currentLinks, editingItem.id];
            
        await updateContentAsset(asset.id, { linked_sub_service_ids: newLinks });
    };

    const linkedAssets = editingItem ? contentAssets.filter(a => a.linked_sub_service_ids?.includes(editingItem.id)) : [];

    const handleAiSuggest = async () => {
        if (!formData.sub_service_name) return alert("Enter Sub-Service Name first");
        setIsAiSuggesting(true);
        try {
            const prompt = `Generate content structure for a sub-service page named "${formData.sub_service_name}".
            Context: Parent service is "${services.find(s => s.id === formData.parent_service_id)?.service_name || 'General'}".
            Return JSON: {
                "h1": "Catchy H1",
                "description": "Short summary (2 sentences)",
                "h2s": ["H2 1", "H2 2"],
                "meta_title": "SEO Title",
                "meta_description": "SEO Description"
            }`;
            const res = await runQuery(prompt, { model: 'gemini-2.5-flash' });
            const jsonMatch = res.text.match(/\{[\s\S]*\}/);
            const json = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
            
            if (json.h1) {
                setFormData(prev => ({
                    ...prev,
                    h1: json.h1,
                    description: json.description || prev.description,
                    h2_list: json.h2s || [],
                    meta_title: json.meta_title,
                    meta_description: json.meta_description
                }));
            }
        } catch (e) { alert("AI Suggestion failed."); } 
        finally { setIsAiSuggesting(false); }
    };

    if (viewMode === 'form') {
        return (
            <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in w-full">
                <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <button onClick={() => { setViewMode('list'); setEditingItem(null); }} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <h2 className="text-xl font-bold text-slate-800">{editingItem ? `Edit Sub-Service: ${editingItem.sub_service_name}` : 'Create Sub-Service'}</h2>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => { setViewMode('list'); setEditingItem(null); }} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                        <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors">Save</button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="border-b border-slate-200 px-6 bg-white sticky top-0 z-10">
                        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                            {['Core', 'Content', 'SEO', 'SMM', 'Linking'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === tab
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 space-y-8">
                        {activeTab === 'Core' && (
                            <div className="w-full space-y-6">
                                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Service Name</label>
                                            <input type="text" value={formData.sub_service_name} onChange={(e) => { setFormData({...formData, sub_service_name: e.target.value}); handleSlugChange(e.target.value); }} className="block w-full border border-gray-300 rounded-md p-2.5" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Service</label>
                                            <select value={formData.parent_service_id} onChange={(e) => setFormData({...formData, parent_service_id: parseInt(e.target.value)})} className="block w-full border border-gray-300 rounded-md p-2.5">
                                                <option value={0}>Select Parent...</option>
                                                {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 mt-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                            <input type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="block w-full border border-gray-300 rounded-md p-2.5" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full URL</label>
                                            <input type="text" value={formData.full_url} readOnly className="block w-full border border-gray-200 bg-gray-50 rounded-md p-2.5 text-gray-500" />
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="block w-full border border-gray-300 rounded-md p-2.5 h-24" />
                                    </div>
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="block w-full border border-gray-300 rounded-md p-2.5">
                                            {STATUSES.filter(s => s !== 'All Status').map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Content' && (
                            <div className="w-full space-y-6">
                                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex justify-between items-center">
                                    <div className="flex items-center text-indigo-800 font-bold"><SparkIcon /> <span className="ml-2">AI Content Assistant</span></div>
                                    <button onClick={handleAiSuggest} disabled={isAiSuggesting} className="bg-white text-indigo-600 px-4 py-2 rounded shadow-sm text-sm font-medium hover:bg-indigo-50 disabled:opacity-50">
                                        {isAiSuggesting ? 'Thinking...' : 'Auto-Generate Structure'}
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">H1 Heading</label>
                                    <input type="text" value={formData.h1} onChange={(e) => setFormData({...formData, h1: e.target.value})} className="block w-full border border-gray-300 rounded-md p-2.5" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">H2 Headings</label>
                                    <div className="flex gap-2 mb-2">
                                        <input type="text" value={tempH2} onChange={(e) => setTempH2(e.target.value)} className="flex-1 border border-gray-300 rounded-md p-2.5" placeholder="Add H2..." />
                                        <button onClick={() => addToList('h2_list', tempH2, setTempH2)} className="bg-slate-200 px-4 rounded text-slate-700 font-bold hover:bg-slate-300">+</button>
                                    </div>
                                    <div className="space-y-1">
                                        {formData.h2_list?.map((h2, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-slate-200">
                                                <span className="text-sm">{h2}</span>
                                                <button onClick={() => removeFromList('h2_list', idx)} className="text-red-500 hover:text-red-700">×</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Body Content</label>
                                    <textarea value={formData.body_content} onChange={(e) => setFormData({...formData, body_content: e.target.value})} className="block w-full border border-gray-300 rounded-md p-2.5 h-64 font-mono text-sm" placeholder="# Markdown content..." />
                                </div>
                            </div>
                        )}

                        {activeTab === 'SEO' && (
                            <div className="w-full space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                                    <input type="text" value={formData.meta_title} onChange={(e) => setFormData({...formData, meta_title: e.target.value})} className="block w-full border border-gray-300 rounded-md p-2.5" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                                    <textarea value={formData.meta_description} onChange={(e) => setFormData({...formData, meta_description: e.target.value})} className="block w-full border border-gray-300 rounded-md p-2.5 h-24" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Focus Keywords</label>
                                    <div className="flex gap-2 mb-2">
                                        <input type="text" value={tempKeyword} onChange={(e) => setTempKeyword(e.target.value)} className="flex-1 border border-gray-300 rounded-md p-2.5" placeholder="Add Keyword..." />
                                        <button onClick={() => addToList('focus_keywords', tempKeyword, setTempKeyword)} className="bg-slate-200 px-4 rounded text-slate-700 font-bold hover:bg-slate-300">+</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.focus_keywords?.map((k, idx) => (
                                            <span key={idx} className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-sm flex items-center border border-indigo-100">
                                                {k} <button onClick={() => removeFromList('focus_keywords', idx)} className="ml-2 text-indigo-400 hover:text-indigo-900 font-bold">×</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Linking' && (
                            <div className="w-full space-y-6">
                                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-slate-800">Linked Assets</h3>
                                        <button onClick={() => setIsAssetPickerOpen(true)} className="text-sm text-blue-600 hover:underline">+ Link Assets</button>
                                    </div>
                                    <div className="space-y-2">
                                        {linkedAssets.length > 0 ? linkedAssets.map(asset => (
                                            <div key={asset.id} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
                                                <div>
                                                    <p className="font-medium text-sm text-slate-800">{asset.content_title_clean}</p>
                                                    <p className="text-xs text-slate-500 uppercase">{asset.asset_type}</p>
                                                </div>
                                                <button onClick={() => handleToggleAssetLink(asset)} className="text-red-500 text-xs font-bold hover:underline">Unlink</button>
                                            </div>
                                        )) : <p className="text-sm text-slate-400 italic">No assets linked.</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 h-full overflow-y-auto w-full p-6 animate-fade-in">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Sub-Service Master</h1>
                    <p className="text-slate-500 mt-1">Manage child services and their specific content/SEO configurations</p>
                </div>
                <button onClick={() => { setEditingItem(null); resetForm(); setViewMode('form'); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors">
                    + Add Sub-Service
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
                <input type="search" className="block w-full md:w-1/3 p-2.5 border border-gray-300 rounded-lg" placeholder="Search sub-services..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <select value={parentFilter} onChange={(e) => setParentFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5">
                    <option>All Parent Services</option>
                    {services.map(s => <option key={s.id} value={s.service_name}>{s.service_name}</option>)}
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <Table 
                columns={[
                    { header: 'Sub-Service Name', accessor: 'sub_service_name' as keyof SubServiceItem, className: 'font-bold text-slate-800' },
                    { 
                        header: 'Parent Service', 
                        accessor: (item: SubServiceItem) => {
                            const parent = services.find(s => s.id === item.parent_service_id);
                            return <span className="text-slate-600 text-sm">{parent?.service_name || '-'}</span>;
                        } 
                    },
                    { header: 'Slug', accessor: 'slug' as keyof SubServiceItem, className: 'font-mono text-xs text-slate-500' },
                    { header: 'Status', accessor: (item: SubServiceItem) => getStatusBadge(item.status) },
                    { 
                        header: 'Linked Assets', 
                        accessor: (item: SubServiceItem) => {
                            const count = contentAssets.filter(a => a.linked_sub_service_ids?.includes(item.id)).length;
                            return <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full text-xs font-bold">{count}</span>;
                        },
                        className: "text-center"
                    },
                    {
                        header: 'Actions',
                        accessor: (item: SubServiceItem) => (
                            <div className="flex space-x-2">
                                <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Del</button>
                            </div>
                        )
                    }
                ]}
                data={filteredData}
                title="Sub-Service Registry"
            />

            {/* Asset Picker Modal */}
            <Modal isOpen={isAssetPickerOpen} onClose={() => setIsAssetPickerOpen(false)} title="Link Assets">
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 mb-2">Select assets to link to {editingItem?.sub_service_name}</p>
                    <div className="h-64 overflow-y-auto border border-slate-200 rounded p-2">
                        {contentAssets.map(asset => (
                            <label key={asset.id} className="flex items-center p-2 hover:bg-slate-50 cursor-pointer border-b border-slate-50">
                                <input 
                                    type="checkbox" 
                                    checked={asset.linked_sub_service_ids?.includes(editingItem?.id || 0)} 
                                    onChange={() => handleToggleAssetLink(asset)}
                                    className="rounded text-blue-600 mr-3"
                                />
                                <span className="text-sm truncate">{asset.content_title_clean}</span>
                            </label>
                        ))}
                    </div>
                    <div className="flex justify-end">
                        <button onClick={() => setIsAssetPickerOpen(false)} className="bg-slate-200 text-slate-700 px-4 py-2 rounded hover:bg-slate-300 text-sm font-medium">Done</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SubServiceMasterView;
