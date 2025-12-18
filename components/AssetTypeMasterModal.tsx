import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';
import type { AssetTypeMasterItem } from '../types';

interface AssetTypeMasterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (assetType: Partial<AssetTypeMasterItem>) => void;
    editingAssetType?: AssetTypeMasterItem | null;
}

const AssetTypeMasterModal: React.FC<AssetTypeMasterModalProps> = ({
    isOpen,
    onClose,
    onSave,
    editingAssetType
}) => {
    const [formData, setFormData] = useState<Partial<AssetTypeMasterItem>>({
        brand: 'Pubrica',
        asset_type_name: '',
        word_count: 0,
        status: 'active'
    });

    const brands = ['Pubrica', 'Stats work', 'Food Research lab', 'PhD assistance', 'tutors India'];

    useEffect(() => {
        if (editingAssetType) {
            setFormData(editingAssetType);
        } else {
            setFormData({
                brand: 'Pubrica',
                asset_type_name: '',
                word_count: 0,
                status: 'active'
            });
        }
    }, [editingAssetType, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.asset_type_name?.trim()) {
            alert('Asset type name is required');
            return;
        }
        onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-900">
                        {editingAssetType ? 'Edit Asset Type' : 'Add Asset Type'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Brand *
                        </label>
                        <select
                            value={formData.brand || ''}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        >
                            {brands.map(brand => (
                                <option key={brand} value={brand}>{brand}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Asset Type Name *
                        </label>
                        <input
                            type="text"
                            value={formData.asset_type_name || ''}
                            onChange={(e) => setFormData({ ...formData, asset_type_name: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter asset type name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Word Count
                        </label>
                        <input
                            type="number"
                            value={formData.word_count || 0}
                            onChange={(e) => setFormData({ ...formData, word_count: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter word count"
                            min="0"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            {editingAssetType ? 'Update' : 'Add'} Asset Type
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssetTypeMasterModal;