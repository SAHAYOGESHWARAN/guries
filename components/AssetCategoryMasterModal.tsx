import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';
import type { AssetCategoryMasterItem } from '../types';

interface AssetCategoryMasterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (category: Partial<AssetCategoryMasterItem>) => void;
    editingCategory?: AssetCategoryMasterItem | null;
}

const AssetCategoryMasterModal: React.FC<AssetCategoryMasterModalProps> = ({
    isOpen,
    onClose,
    onSave,
    editingCategory
}) => {
    const [formData, setFormData] = useState<Partial<AssetCategoryMasterItem>>({
        brand: 'Pubrica',
        category_name: '',
        word_count: 0,
        status: 'active'
    });

    const brands = ['Pubrica', 'Stats work', 'Food Research lab', 'PhD assistance', 'tutors India'];

    useEffect(() => {
        if (editingCategory) {
            setFormData(editingCategory);
        } else {
            setFormData({
                brand: 'Pubrica',
                category_name: '',
                word_count: 0,
                status: 'active'
            });
        }
    }, [editingCategory, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.category_name?.trim()) {
            alert('Asset Category Name is required');
            return;
        }
        if (!formData.word_count || formData.word_count <= 0) {
            alert('Word Count must be greater than 0');
            return;
        }
        onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                {/* Header */}
                <div className="border-b border-slate-200 px-6 py-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                {editingCategory ? 'Edit Asset Category' : 'Add Asset Category'}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">Press Esc to close this panel.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* 1. Brand Dropdown */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Brand
                        </label>
                        <select
                            value={formData.brand || ''}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                            required
                        >
                            {brands.map(brand => (
                                <option key={brand} value={brand}>{brand}</option>
                            ))}
                        </select>
                    </div>

                    {/* 2. Asset Category Name */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Asset Category Name
                        </label>
                        <input
                            type="text"
                            value={formData.category_name || ''}
                            onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                            placeholder="Enter category name"
                            required
                        />
                    </div>

                    {/* 3. Word Count */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Word Count
                        </label>
                        <input
                            type="number"
                            value={formData.word_count || ''}
                            onChange={(e) => setFormData({ ...formData, word_count: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                            placeholder="Enter word count"
                            min="1"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-base shadow-sm"
                        >
                            {editingCategory ? 'Update Asset Category' : 'Submit Asset Category'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssetCategoryMasterModal;