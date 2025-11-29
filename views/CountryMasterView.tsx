import React, { useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { getStatusBadge } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { CountryMasterItem } from '../types';

const REGIONS = ['All Regions', 'North America', 'Europe', 'Oceania', 'Asia'];
const STATUSES = ['All Status', 'Active', 'Inactive'];

const CountryMasterView: React.FC = () => {
    // ... (logic kept same) ...
    const { data: countries, create, update, remove } = useData<CountryMasterItem>('countries');
    const [searchQuery, setSearchQuery] = useState('');
    const [regionFilter, setRegionFilter] = useState('All Regions');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CountryMasterItem | null>(null);
    const [formData, setFormData] = useState<Partial<CountryMasterItem>>({
        country_name: '', code: '', region: 'North America', has_backlinks: false, has_content: false, has_smm: false, status: 'Active'
    });

    const filteredData = countries.filter(item => {
        const matchesSearch = item.country_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRegion = regionFilter === 'All Regions' || item.region === regionFilter;
        return matchesSearch && matchesRegion;
    });

    const getBooleanIcon = (value: boolean) => {
        return value ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-200 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        );
    };

    const handleEdit = (item: CountryMasterItem) => {
        setEditingItem(item);
        setFormData(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if(confirm('Delete this country?')) await remove(id);
    };

    const handleSave = async () => {
        if (editingItem) {
            await update(editingItem.id, formData);
        } else {
            await create(formData as any);
        }
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ country_name: '', code: '', region: 'North America', has_backlinks: false, has_content: false, has_smm: false, status: 'Active' });
    };

    const handleExport = () => {
        exportToCSV(filteredData, 'country_master_export');
    };

    const columns = [
        { header: 'Country Name', accessor: 'country_name' as keyof CountryMasterItem, className: 'font-bold text-slate-800' },
        { header: 'Code', accessor: 'code' as keyof CountryMasterItem, className: "font-mono text-xs font-bold text-slate-600" },
        { header: 'Region', accessor: 'region' as keyof CountryMasterItem },
        { header: 'Backlinks', accessor: (item: CountryMasterItem) => getBooleanIcon(item.has_backlinks), className: "text-center" },
        { header: 'Content', accessor: (item: CountryMasterItem) => getBooleanIcon(item.has_content), className: "text-center" },
        { header: 'SMM', accessor: (item: CountryMasterItem) => getBooleanIcon(item.has_smm), className: "text-center" },
        { header: 'Status', accessor: (item: CountryMasterItem) => getStatusBadge(item.status) },
        {
            header: 'Actions',
            accessor: (item: CountryMasterItem) => (
                <div className="flex space-x-2 justify-end">
                    <button onClick={() => handleEdit(item)} className="text-slate-400 hover:text-blue-600">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-600">Del</button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 h-full overflow-y-auto w-full pr-1">
            <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Country Master</h1>
                <div className="flex space-x-3">
                    <button 
                        onClick={handleExport}
                        className="bg-white text-slate-600 border border-slate-300 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-50 shadow-sm transition-colors"
                    >
                        Export
                    </button>
                    <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 shadow-sm">Add Country</button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <input type="search" className="block w-full p-2.5 border border-gray-300 rounded-lg" placeholder="Search countries..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5">{REGIONS.map(r => <option key={r} value={r}>{r}</option>)}</select>
                </div>
            </div>

            <Table columns={columns} data={filteredData} title="Country Registry" />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Edit Country" : "Add Country"}>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700">Country Name</label><input type="text" value={formData.country_name} onChange={(e) => setFormData({...formData, country_name: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700">Code</label><input type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Region</label><select value={formData.region} onChange={(e) => setFormData({...formData, region: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2">{REGIONS.filter(r => r !== 'All Regions').map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                    </div>
                    <div className="flex space-x-4">
                        <label className="flex items-center"><input type="checkbox" checked={formData.has_backlinks} onChange={(e) => setFormData({...formData, has_backlinks: e.target.checked})} className="mr-2" /> Backlinks</label>
                        <label className="flex items-center"><input type="checkbox" checked={formData.has_content} onChange={(e) => setFormData({...formData, has_content: e.target.checked})} className="mr-2" /> Content</label>
                        <label className="flex items-center"><input type="checkbox" checked={formData.has_smm} onChange={(e) => setFormData({...formData, has_smm: e.target.checked})} className="mr-2" /> SMM</label>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700">Status</label><select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="mt-1 block w-full border border-gray-300 rounded-md p-2"><option>Active</option><option>Inactive</option></select></div>
                    <div className="flex justify-end pt-4"><button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save</button></div>
                </div>
            </Modal>
        </div>
    );
};

export default CountryMasterView;