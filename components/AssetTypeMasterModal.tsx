import React, { useState, useEffect } from 'react';
import type { AssetTypeMasterItem } from '../types';

interface AssetTypeMasterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<AssetTypeMasterItem>) => Promise<void>;
    editingItem?: AssetTypeMasterItem | null;
}

const AssetTypeMasterModal: React.FC<AssetTypeMasterModalProps> = ({
    isOpen,
    onClose,
    onSave,
    editingItem
}) => {
    const [formData, setFormData] = useState({
        brand: 'Pubrica',
        asset_type_name: '',
        word_count: 0,
        status: 'active'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const brands = ['Pubrica', 'Stats Work', 'Food Research Lab', 'PhD Assistance', 'Tutors India'];

    useEffect(() => {
        if (editingItem) {
            setFormData({
                brand: editingItem.brand,
                asset_type_name: editingItem.asset_type_name,
                word_count: editingItem.word_count,
                status: editingItem.status
            });
        } else {
            setFormData({
                brand: 'Pubrica',
                asset_type_name: '',
                word_count: 0,
                status: 'active'
            });
        }
    }, [editingItem, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.asset_type_name.trim()) {
            alert('Please enter an asset type name');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Failed to save asset type:', error);
            alert('Failed to save asset type');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-900">
                            {editingItem ? 'Edit Asset Type' : 'Add Asset Type'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Brand *
                            </label>
                            <select
                                value={formData.brand}
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
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Asset Type Name *
                            </label>
                            <input
                                type="text"
                                value={formData.asset_type_name}
                                onChange={(e) => setFormData({ ...formData, asset_type_name: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter asset type name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Word Count *
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.word_count}
                                onChange={(e) => setFormData({ ...formData, word_count: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter word count"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AssetTypeMasterModal;