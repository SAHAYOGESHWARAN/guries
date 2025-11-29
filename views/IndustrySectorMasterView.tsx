import React, { useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { IndustrySectorItem } from '../types';

const INDUSTRIES = ['All Industries', 'Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education'];
const COUNTRIES = ['All Countries', 'United States', 'United Kingdom', 'Canada', 'Australia'];
const STATUSES = ['All Status', 'Active', 'Inactive'];

const IndustrySectorMasterView: React.FC = () => {
    // ... (logic kept same) ...
    const { data: industries, create, update, remove } = useData<IndustrySectorItem>('industrySectors');
    
    const [searchQuery, setSearchQuery] = useState('');
    const [industryFilter, setIndustryFilter] = useState('All Industries');
    const [countryFilter, setCountryFilter] = useState('All Countries');
    const [statusFilter, setStatusFilter] = useState('All Status');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<IndustrySectorItem | null>(null);
    const [formData, setFormData] = useState<Partial<IndustrySectorItem>>({
        industry: '', sector: '', application: '', country: 'United States', status: 'Active'
    });

    const filteredData = industries.filter(item => {
        const matchesSearch = item.industry.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.sector.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesIndustry = industryFilter === 'All Industries' || item.industry === industryFilter;
        const matchesCountry = countryFilter === 'All Countries' || item.country === countryFilter;
        const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter;
        
        return matchesSearch && matchesIndustry && matchesCountry && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const color = status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        return <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${color}`}>{status}</span>;
    };

    const handleEdit = (item: IndustrySectorItem) => {
        setEditingItem(item);
        setFormData(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if(confirm('Delete this industry/sector?')) await remove(id);
    };

    const handleSave = async () => {
        if (editingItem) {
            await update(editingItem.id, formData);
        } else {
            await create(formData as any);
        }
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ industry: '', sector: '', application: '', country: 'United States', status: 'Active' });
    };

    const handleExport = () => {
        exportToCSV(filteredData, 'industry_sector_master_export');
    };

    const columns = [
        { 
            header: '', 
            accessor: (item: IndustrySectorItem) => (
                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4" />
            ),
            className: "w-8"
        },
        { header: 'Industry', accessor: 'industry' as keyof IndustrySectorItem, className: 'font-bold text-slate-800' },
        { header: 'Sector', accessor: 'sector' as keyof IndustrySectorItem, className: 'text-slate-600' },
        { header: 'Application', accessor: 'application' as keyof IndustrySectorItem, className: 'text-sm' },
        { header: 'Country', accessor: 'country' as keyof IndustrySectorItem },
        { 
            header: 'Status', 
            accessor: (item: IndustrySectorItem) => getStatusBadge(item.status)
        },
        {
            header: 'Actions',
            accessor: (item: IndustrySectorItem) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleEdit(item)} className="text-slate-400 hover:text-blue-600">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-600">Del</button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 h-full overflow-y-auto w-full pr-1">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Industry / Sector Master</h1>
                    <p className="text-slate-500 mt-1">Manage industry classifications, sectors, and business applications</p>
                </div>
                <div className="flex space-x-3">
                    <button 
                        onClick={handleExport}
                        className="bg-white text-slate-600 border border-slate-300 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-50 shadow-sm transition-colors"
                    >
                        Export
                    </button>
                    <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 shadow-sm">
                        Add Industry
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <input type="search" className="block w-full p-2.5 border border-gray-300 rounded-lg" placeholder="Search industries..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <div className="flex flex-wrap gap-2">
                        <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5">{INDUSTRIES.map(i => <option key={i}>{i}</option>)}</select>
                        <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5">{COUNTRIES.map(c => <option key={c}>{c}</option>)}</select>
                    </div>
                </div>
            </div>

            <Table columns={columns} data={filteredData} title="Industry & Sector Registry" />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Edit Industry" : "Add Industry"}>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700">Industry</label><input type="text" value={formData.industry} onChange={(e) => setFormData({...formData, industry: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Sector</label><input type="text" value={formData.sector} onChange={(e) => setFormData({...formData, sector: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Application</label><input type="text" value={formData.application} onChange={(e) => setFormData({...formData, application: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700">Country</label><select value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2">{COUNTRIES.filter(c => c !== 'All Countries').map(c => <option key={c}>{c}</option>)}</select></div>
                        <div><label className="block text-sm font-medium text-gray-700">Status</label><select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="mt-1 block w-full border border-gray-300 rounded-md p-2"><option>Active</option><option>Inactive</option></select></div>
                    </div>
                    <div className="flex justify-end pt-4"><button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save</button></div>
                </div>
            </Modal>
        </div>
    );
};

export default IndustrySectorMasterView;