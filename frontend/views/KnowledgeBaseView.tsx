
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

    const filteredArticles = (articles || []).filter(a => (a.title || '').toLowerCase().includes(searchQuery.toLowerCase()));

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
            <div className="h-full flex flex-col bg-white overflow-hidden animate-fade-in w-full">
                {/* Editor Header */}
                <div className="border-b border-slate-200 px-4 lg:px-6 py-4 bg-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl lg:text-2xl font-bold text-slate-800">
                                {editingItem ? 'Edit Article' : 'New Article'}
                            </h2>
                            <p className="text-slate-500 text-sm mt-1">
                                {editingItem ? 'Update your knowledge base article' : 'Create a new help article'}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setViewMode('list')}
                                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-brand-600 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-brand-700 transition-colors"
                            >
                                {editingItem ? 'Update' : 'Save'} Article
                            </button>
                        </div>
                    </div>
                </div>

                {/* Editor Content */}
                <div className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Article Settings */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Article Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Article Title</label>
                                    <input
                                        type="text"
                                        placeholder="Enter a clear, descriptive title"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                                        <select
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option>General</option>
                                            <option>Technical</option>
                                            <option>Support</option>
                                            <option>Getting Started</option>
                                            <option>Troubleshooting</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                                        <select
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                                            value={formData.language}
                                            onChange={e => setFormData({ ...formData, language: e.target.value })}
                                        >
                                            <option value="en">English</option>
                                            <option value="es">Spanish</option>
                                            <option value="fr">French</option>
                                            <option value="de">German</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                                        <select
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </div>

                                    <div className="flex items-end">
                                        <button
                                            onClick={handleAiTranslate}
                                            disabled={isTranslating}
                                            className="w-full px-4 py-3 bg-brand-50 text-brand-600 rounded-xl text-sm font-medium border border-brand-200 hover:bg-brand-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <SparkIcon />
                                            {isTranslating ? 'Translating...' : 'AI Translate'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Editor */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-800">Article Content</h3>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Supports Markdown formatting
                                </div>
                            </div>

                            <textarea
                                className="w-full h-96 lg:h-[500px] p-4 border border-slate-200 rounded-xl font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                placeholder="# Article Title

Write your article content here using Markdown formatting...

## Section Heading

- Bullet point 1
- Bullet point 2

**Bold text** and *italic text*

[Link text](https://example.com)"
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col animate-fade-in w-full overflow-hidden">
            {/* Mobile Header */}
            <div className="lg:hidden px-4 py-4 bg-white border-b border-slate-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Knowledge Base</h1>
                        <p className="text-slate-500 text-sm mt-1">Help articles and guides</p>
                    </div>
                    <button
                        onClick={() => { setEditingItem(null); setFormData({ title: '', content: '', category: 'General', language: 'en', tags: [], status: 'draft' }); setViewMode('editor'); }}
                        className="bg-brand-600 text-white p-2 rounded-lg shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block px-6 py-6 bg-white border-b border-slate-200">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Knowledge Base</h1>
                        <p className="text-slate-500 mt-2">Multi-language support articles and documentation</p>
                    </div>
                    <button
                        onClick={() => { setEditingItem(null); setFormData({ title: '', content: '', category: 'General', language: 'en', tags: [], status: 'draft' }); setViewMode('editor'); }}
                        className="bg-brand-600 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-sm hover:bg-brand-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Article
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="px-4 lg:px-6 py-4 bg-white border-b border-slate-200">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                            placeholder="Search articles, categories, or content..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                            <option>All Categories</option>
                            <option>General</option>
                            <option>Technical</option>
                            <option>Support</option>
                        </select>
                        <select className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                            <option>All Languages</option>
                            <option>English</option>
                            <option>Spanish</option>
                            <option>French</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Articles Grid/List */}
            <div className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-6">
                {filteredArticles.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                        {filteredArticles.map((article) => (
                            <div key={article.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${article.status === 'published'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {article.status}
                                        </span>
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 uppercase">
                                            {article.language}
                                        </span>
                                    </div>

                                    <h3 className="font-semibold text-slate-900 text-lg mb-2 line-clamp-2">{article.title}</h3>
                                    <p className="text-sm text-slate-600 mb-3">{article.category}</p>

                                    {article.content && (
                                        <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                                            {article.content.substring(0, 150)}...
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {article.created_at ? new Date(article.created_at).toLocaleDateString() : 'No date'}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(article)}
                                                className="text-brand-600 hover:text-brand-700 font-medium text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(article.id)}
                                                className="text-red-600 hover:text-red-700 font-medium text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No articles found</h3>
                        <p className="text-slate-500 mb-6">Get started by creating your first knowledge base article.</p>
                        <button
                            onClick={() => { setEditingItem(null); setFormData({ title: '', content: '', category: 'General', language: 'en', tags: [], status: 'draft' }); setViewMode('editor'); }}
                            className="bg-brand-600 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-sm hover:bg-brand-700 transition-colors"
                        >
                            Create First Article
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KnowledgeBaseView;
