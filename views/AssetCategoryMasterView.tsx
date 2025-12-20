import React, { useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import AddAssetCategoryModal from '../components/AddAssetCategoryModal';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { AssetCategoryMasterItem } from '../types';

const BRANDS = ['Pubrica', 'Stats work', 'Food Research lab', 'PhD assistance', 'tutors India'];

const AssetCategoryMasterView: React.FC = () => {
    const { data: assetCategories = [], create, update, remove } = useData<AssetCategoryMasterItem>('asset-category-master');
    const [searchQuery, setSearchQuery] = useState('');
    const [brandFilter, setBrandFilter] = useState('All Brands');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<AssetCategoryMasterItem | null>(null);
    const [formData, setFormData] = useState<Partial<AssetCategoryMasterItem>>({
        brand: 'Pubrica',
        category_name: '',
        word_count: 0,
        status: 'active'
    });

    const filteredData = assetCategories.filter(item => {
        const matchesSearch = item.category_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBrand = brandFilter === 'All Brands' || item.brand === brandFilter;
        return matchesSearch && matchesBrand;
    });

    const getStatusBadge = (status: string) => {
        let color = 'bg-gray-100 text-gray-800';
        if (status === 'active') color = 'bg-green-100 text-green-800';
        else if (status === 'inactive') color = 'bg-red-100 text-red-800';
        return <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${color}`}>{status}</span>;
    };

    const getBrandBadge = (brand: string) => {
        const colors: Record<string, string> = {
            'Pubrica': 'bg-blue-100 text-blue-800',
            'Stats work': 'bg-purple-100 text-purple-800',
            'Food Research lab': 'bg-green-100 text-green-800',
            'PhD assistance': 'bg-orange-100 text-orange-800',
            'tutors India': 'bg-pink-100 text-pink-800'
        };
        return <span className={`px-2 py-1 rounded text-xs font-bold ${colors[brand] || 'bg-gray-100 text-gray-800'}`}>{brand}</span>;
    };

    const handleEdit = (item: AssetCategoryMasterItem) => {
        setEditingItem(item);
        setFormData(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this asset category?')) await remove(id);
    };

    const handleSave = async () => {
        if (!formData.brand || !formData.category_name) {
            alert('Please fill in all required fields');
            return;
        }

        const payload = {
            ...formData,
            word_count: formData.word_count || 0,
            updated_at: new Date().toISOString()
        };

        if (editingItem) {
            await update(editingItem.id, payload);
        } else {
            await create(payload as any);
        }
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ brand: 'Pubrica', category_name: '', word_count: 0, status: 'active' });
    };

    const handleExport = () => {
        exportToCSV(filteredData, 'asset_category_master_export');
    };

    const columns = [
        {
            header: 'Brand',
            accessor: (item: AssetCategoryMasterItem) => getBrandBadge(item.brand),
            className: 'font-bold'
        },
        {
            header: 'Asset Category Name',
            accessor: 'category_name' as keyof AssetCategoryMasterItem,
            className: 'font-bold text-slate-800'
        },
        {
            header: 'Word Count',
            accessor: 'word_count' as keyof AssetCategoryMasterItem,
            className: 'text-center font-mono text-slate-600'
        },
        {
            header: 'Status',
            accessor: (item: AssetCategoryMasterItem) => getStatusBadge(item.status)
        },
        {
            header: 'Updated',
            accessor: (item: AssetCategoryMasterItem) => item.updated_at ? new Date(item.updated_at).toLocaleDateString() : '-',
            className: "text-xs text-slate-500"
        },
        {
            header: 'Actions',
            accessor: (item: AssetCategoryMasterItem) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">Del</button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 h-full overflow-y-auto w-full pr-1">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Asset Category Master</h1>
                    <p className="text-slate-500 mt-1">Configure asset categories by brand with word count specifications.</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={handleExport}
                        className="bg-white text-slate-600 border border-slate-300 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-50 shadow-sm transition-colors"
                    >
                        Export
                    </button>
                    <button
                        onClick={() => {
                            setEditingItem(null);
                            setFormData({ brand: 'Pubrica', category_name: '', word_count: 0, status: 'active' });
                            setIsModalOpen(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 shadow-sm"
                    >
                        Add Asset Category
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <input
                        type="search"
                        className="block w-full p-2.5 border border-gray-300 rounded-lg"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <select
                        value={brandFilter}
                        onChange={(e) => setBrandFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5 min-w-[200px]"
                    >
                        <option>All Brands</option>
                        {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>
            </div>

            <Table columns={columns} data={filteredData} title="Asset Category Registry" />

            <AddAssetCategoryModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
                editingCategory={editingItem}
                onSave={async (payload) => {
                    const data = { ...payload, word_count: payload.word_count || 0, updated_at: new Date().toISOString() };
                    if (editingItem) {
                        await update(editingItem.id, data as any);
                    } else {
                        await create(data as any);
                    }
                }}
            />
        </div>
    );
};

export default AssetCategoryMasterView;
