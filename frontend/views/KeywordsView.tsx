
import React, { useState } from 'react';
import Table from '../components/Table';
import Tooltip from '../components/Tooltip';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { Keyword, Service, SubServiceItem } from '../types';

const INTENTS = ['All Intent', 'Trans', 'Info', 'Nav', 'Comm'];
const TYPES = ['All Types', 'Primary', 'Secondary', 'Branded'];
const COMPETITIONS = ['All Competition', 'High', 'Medium', 'Low'];

const KeywordsView: React.FC = () => {
    const { data: keywords, create, update, remove } = useData<Keyword>('keywords');
    const { data: services = [] } = useData<Service>('services');
    const { data: subServices = [] } = useData<SubServiceItem>('sub-services');

    const [searchQuery, setSearchQuery] = useState('');
    const [intentFilter, setIntentFilter] = useState('All Intent');
    const [typeFilter, setTypeFilter] = useState('All Types');
    const [competitionFilter, setCompetitionFilter] = useState('All Competition');

    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [editingItem, setEditingItem] = useState<Keyword | null>(null);
    const [formData, setFormData] = useState<Partial<Keyword>>({
        keyword: '', keyword_intent: 'Info', keyword_type: 'Primary', search_volume: 0, competition: 'Medium', mapped_service_id: undefined, mapped_sub_service_id: undefined, status: 'active'
    });

    const [filteredSubServices, setFilteredSubServices] = useState<SubServiceItem[]>([]);

    // Handle service selection - filter sub-services
    const handleServiceChange = (serviceId: number | undefined) => {
        setFormData(prev => ({ ...prev, mapped_service_id: serviceId, mapped_sub_service_id: undefined }));

        if (serviceId) {
            const filtered = subServices.filter(sub => sub.parent_service_id === serviceId);
            setFilteredSubServices(filtered);
        } else {
            setFilteredSubServices([]);
        }
    };

    // Get service name by ID
    const getServiceName = (id?: number) => {
        return services.find(s => s.id === id)?.service_name || '';
    };

    // Get sub-service name by ID
    const getSubServiceName = (id?: number) => {
        return subServices.find(s => s.id === id)?.sub_service_name || '';
    };

    const filteredData = keywords.filter(item => {
        const matchesSearch = item.keyword.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesIntent = intentFilter === 'All Intent' || item.intent === intentFilter;
        const matchesType = typeFilter === 'All Types' || item.keyword_type === typeFilter;
        const matchesCompetition = competitionFilter === 'All Competition' || item.competition === competitionFilter;
        return matchesSearch && matchesIntent && matchesType && matchesCompetition;
    });

    const getIntentBadge = (intent?: string) => {
        const styles: Record<string, string> = {
            'Trans': 'bg-green-100 text-green-800',
            'Info': 'bg-blue-100 text-blue-800',
            'Nav': 'bg-orange-100 text-orange-800',
            'Comm': 'bg-purple-100 text-purple-800'
        };
        return <span className={`px-2 py-1 rounded text-xs font-bold ${styles[intent || ''] || 'bg-gray-100'}`}>{intent}</span>;
    };

    const getCompetitionColor = (comp?: string) => {
        if (comp === 'High') return 'text-red-600 font-bold';
        if (comp === 'Medium') return 'text-yellow-600 font-bold';
        return 'text-green-600 font-bold';
    };

    const handleEdit = (item: Keyword) => {
        setEditingItem(item);
        setFormData(item);

        // If editing an item with a service, filter sub-services
        if (item.mapped_service_id) {
            const filtered = subServices.filter(sub => sub.parent_service_id === item.mapped_service_id);
            setFilteredSubServices(filtered);
        }

        setViewMode('form');
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this keyword?')) await remove(id);
    };

    const handleSave = async () => {
        if (editingItem) {
            await update(editingItem.id, { ...formData, updated_at: new Date().toISOString() });
        } else {
            await create({ ...formData, updated_at: new Date().toISOString() } as any);
        }
        setViewMode('list');
        setEditingItem(null);
        setFormData({ keyword: '', keyword_intent: 'Info', keyword_type: 'Primary', search_volume: 0, competition: 'Medium', mapped_service_id: undefined, mapped_sub_service_id: undefined, status: 'active' });
        setFilteredSubServices([]);
    };

    const handleExport = () => {
        exportToCSV(filteredData, 'keywords_master_export');
    };

    const columns = [
        { header: 'Keyword', accessor: 'keyword' as keyof Keyword, className: 'font-medium text-slate-800' },
        { header: 'Intent', accessor: (item: Keyword) => getIntentBadge(item.keyword_intent) },
        { header: 'Type', accessor: 'keyword_type' as keyof Keyword, className: 'text-slate-600' },
        { header: 'Volume', accessor: (item: Keyword) => item.search_volume.toLocaleString(), className: "font-mono text-slate-700" },
        { header: 'Comp', accessor: (item: Keyword) => <span className={getCompetitionColor(item.competition)}>{item.competition}</span> },
        { header: 'Service', accessor: (item: Keyword) => getServiceName(item.mapped_service_id), className: "text-sm text-blue-600" },
        { header: 'Sub-Service', accessor: (item: Keyword) => getSubServiceName(item.mapped_sub_service_id), className: "text-sm text-indigo-600" },
        {
            header: 'Usage',
            accessor: 'usage_count' as keyof Keyword,
            className: "text-center font-bold text-indigo-600",
            tooltip: "Number of times this keyword is used in Services, Sub-services, or Content"
        },
        { header: 'Updated', accessor: 'updated_at' as keyof Keyword, className: "text-xs text-slate-500" },
        {
            header: 'Actions',
            accessor: (item: Keyword) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                </div>
            )
        }
    ];

    if (viewMode === 'form') {
        return (
            <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in w-full">
                <div className="border-b border-slate-200 px-8 py-5 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-2xl font-bold text-slate-800">{editingItem ? "Edit Keyword" : "Add Keyword"}</h2>
                    <div className="flex gap-3">
                        <button onClick={() => setViewMode('list')} className="px-5 py-2.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                        <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors">Save</button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                    <div className="w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <Tooltip content="The search term to track.">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Keyword</label>
                                <input type="text" value={formData.keyword} onChange={(e) => setFormData({ ...formData, keyword: e.target.value })} className="block w-full px-4 py-3 border border-slate-300 rounded-xl" placeholder="e.g. digital marketing services" />
                            </div>
                        </Tooltip>
                        <div className="grid grid-cols-2 gap-6">
                            <Tooltip content="User intent (Informational, Navigational, Transactional).">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Intent</label>
                                    <select value={formData.keyword_intent} onChange={(e) => setFormData({ ...formData, keyword_intent: e.target.value })} className="block w-full px-4 py-3 border border-slate-300 rounded-xl bg-white">
                                        <option>Trans</option><option>Info</option><option>Nav</option><option>Comm</option>
                                    </select>
                                </div>
                            </Tooltip>
                            <Tooltip content="Priority level of the keyword.">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
                                    <select value={formData.keyword_type} onChange={(e) => setFormData({ ...formData, keyword_type: e.target.value })} className="block w-full px-4 py-3 border border-slate-300 rounded-xl bg-white">
                                        <option>Primary</option><option>Secondary</option><option>Branded</option>
                                    </select>
                                </div>
                            </Tooltip>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <Tooltip content="Average monthly searches.">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Search Volume</label>
                                    <input type="number" value={formData.search_volume} onChange={(e) => setFormData({ ...formData, search_volume: parseInt(e.target.value) })} className="block w-full px-4 py-3 border border-slate-300 rounded-xl" />
                                </div>
                            </Tooltip>
                            <Tooltip content="Difficulty to rank for this keyword.">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Competition</label>
                                    <select value={formData.competition} onChange={(e) => setFormData({ ...formData, competition: e.target.value })} className="block w-full px-4 py-3 border border-slate-300 rounded-xl bg-white">
                                        <option>High</option><option>Medium</option><option>Low</option>
                                    </select>
                                </div>
                            </Tooltip>
                        </div>
                        <Tooltip content="Associate this keyword with a specific service offering.">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Map to Service</label>
                                <select value={formData.mapped_service_id || ''} onChange={(e) => handleServiceChange(e.target.value ? parseInt(e.target.value) : undefined)} className="block w-full px-4 py-3 border border-slate-300 rounded-xl bg-white">
                                    <option value="">-- Select Service --</option>
                                    {services.map(service => (
                                        <option key={service.id} value={service.id}>{service.service_name}</option>
                                    ))}
                                </select>
                            </div>
                        </Tooltip>

                        <Tooltip content="Associate this keyword with a specific sub-service (optional).">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Map to Sub-Service</label>
                                <select value={formData.mapped_sub_service_id || ''} onChange={(e) => setFormData({ ...formData, mapped_sub_service_id: e.target.value ? parseInt(e.target.value) : undefined })} className="block w-full px-4 py-3 border border-slate-300 rounded-xl bg-white" disabled={!formData.mapped_service_id}>
                                    <option value="">-- Select Sub-Service --</option>
                                    {filteredSubServices.map(subService => (
                                        <option key={subService.id} value={subService.id}>{subService.sub_service_name}</option>
                                    ))}
                                </select>
                            </div>
                        </Tooltip>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col overflow-hidden bg-slate-50 animate-fade-in">
            <div className="flex justify-between items-start flex-shrink-0">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Keyword Master</h1>
                <div className="flex space-x-3">
                    <button
                        onClick={handleExport}
                        className="bg-white text-slate-600 border border-slate-300 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-50 shadow-sm transition-colors"
                    >
                        Export
                    </button>
                    <button onClick={() => { setEditingItem(null); setViewMode('form'); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 shadow-sm">
                        Add Keyword
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4 flex-shrink-0">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <input type="search" className="block w-full p-2.5 border border-gray-300 rounded-lg" placeholder="Search keywords..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <div className="flex gap-2">
                        <select value={intentFilter} onChange={(e) => setIntentFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5">{INTENTS.map(i => <option key={i}>{i}</option>)}</select>
                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5">{TYPES.map(t => <option key={t}>{t}</option>)}</select>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200">
                <Table columns={columns} data={filteredData} title="Keyword Registry" />
            </div>
        </div>
    );
};

export default KeywordsView;
