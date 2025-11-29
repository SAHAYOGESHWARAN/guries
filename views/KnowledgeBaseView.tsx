
import React, { useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { useData } from '../hooks/useData';
import { SparkIcon } from '../constants';
import { runQuery } from '../utils/gemini';
import type { KnowledgeArticle } from '../types';

const KnowledgeBaseView: React.FC = () => {
    const { data: articles, create: createArticle, update: updateArticle, remove: deleteArticle } = useData<KnowledgeArticle>('articles');
    
    const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingItem, setEditingItem] = useState<KnowledgeArticle | null>(null);
    const [formData, setFormData] = useState<Partial<KnowledgeArticle>>({ title: '', content: '', category: 'General', language: 'en', tags: [], status: 'draft' });
    
    // AI Translation
    const [isTranslating, setIsTranslating] = useState(false);

    const filteredArticles = articles.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleSave = async () => {
        if (editingItem) {
            await updateArticle(editingItem.id, formData);
        } else {
            await createArticle({ ...formData, author_id: 1 } as any);
        }
        setViewMode('list');
        setEditingItem(null);
        setFormData({ title: '', content: '', category: 'General', language: 'en', tags: [], status: 'draft' });
    };

    const handleEdit = (item: KnowledgeArticle) => {
        setEditingItem(item);
        setFormData(item);
        setViewMode('editor');
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete article?')) await deleteArticle(id);
    };

    const handleAiTranslate = async () => {
        if (!formData.content) return;
        setIsTranslating(true);
        try {
            const prompt = `Translate the following markdown content to Spanish (preserve formatting): \n\n${formData.content}`;
            const result = await runQuery(prompt, { model: 'gemini-2.5-flash' });
            setFormData({ ...formData, content: result.text, language: 'es' });
        } catch (e) {
            alert('Translation failed.');
        } finally {
            setIsTranslating(false);
        }
    };

    if (viewMode === 'editor') {
        return (
            <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in w-full">
                <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800">{editingItem ? 'Edit Article' : 'New Article'}</h2>
                    <div className="flex gap-3">
                        <button onClick={() => setViewMode('list')} className="px-4 py-2 text-sm text-slate-600 border rounded-lg">Cancel</button>
                        <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm">Save</button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                    <div className="w-full space-y-6">
                        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                            <div className="space-y-4">
                                <input type="text" placeholder="Article Title" className="w-full text-lg font-bold border-b border-slate-200 pb-2 mb-4 focus:outline-none focus:border-blue-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                                <div className="flex gap-4">
                                    <select className="p-2 border rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                        <option>General</option><option>Technical</option><option>Support</option>
                                    </select>
                                    <select className="p-2 border rounded" value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})}>
                                        <option value="en">English</option><option value="es">Spanish</option><option value="fr">French</option>
                                    </select>
                                    <button onClick={handleAiTranslate} disabled={isTranslating} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded flex items-center font-bold border border-indigo-100">
                                        <SparkIcon /> <span className="ml-2">{isTranslating ? 'Translating...' : 'AI Translate'}</span>
                                    </button>
                                </div>
                                <textarea className="w-full h-96 p-4 border rounded-lg font-mono text-sm leading-relaxed" placeholder="# Markdown Content..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 h-full flex flex-col animate-fade-in w-full">
            <div className="flex justify-between items-start flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Knowledge Base</h1>
                    <p className="text-slate-500 mt-1">Multi-language support articles and documentation</p>
                </div>
                <button onClick={() => { setEditingItem(null); setFormData({ title: '', content: '', category: 'General', language: 'en', tags: [], status: 'draft' }); setViewMode('editor'); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">+ New Article</button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <input type="text" className="w-full p-2 border rounded" placeholder="Search articles..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <Table 
                    columns={[
                        { header: 'Title', accessor: 'title' as keyof KnowledgeArticle, className: 'font-bold' },
                        { header: 'Category', accessor: 'category' as keyof KnowledgeArticle },
                        { header: 'Language', accessor: (item: KnowledgeArticle) => <span className="uppercase text-xs font-bold bg-slate-100 px-2 py-1 rounded">{item.language}</span> },
                        { header: 'Status', accessor: (item: KnowledgeArticle) => <span className={`uppercase text-xs font-bold px-2 py-1 rounded ${item.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{item.status}</span> },
                        { header: 'Actions', accessor: (item: KnowledgeArticle) => (
                            <div className="flex space-x-2">
                                <button onClick={() => handleEdit(item)} className="text-blue-600 font-bold text-xs">Edit</button>
                                <button onClick={() => handleDelete(item.id)} className="text-red-600 font-bold text-xs">Del</button>
                            </div>
                        )}
                    ]}
                    data={filteredArticles}
                    title="Articles"
                />
            </div>
        </div>
    );
};

export default KnowledgeBaseView;
