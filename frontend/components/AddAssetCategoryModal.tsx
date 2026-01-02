import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import type { AssetCategoryMasterItem } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: Partial<AssetCategoryMasterItem>) => void;
    editingCategory?: AssetCategoryMasterItem | null;
}

const BRANDS = ['Pubrica', 'Stats work', 'Food Research lab', 'PhD assistance', 'tutors India'];

const AddAssetCategoryModal: React.FC<Props> = ({ isOpen, onClose, onSave, editingCategory }) => {
    const [form, setForm] = useState<Partial<AssetCategoryMasterItem>>({
        brand: 'Pubrica',
        category_name: '',
        word_count: 0,
        status: 'active'
    });

    useEffect(() => {
        if (editingCategory) setForm(editingCategory);
        else setForm({ brand: 'Pubrica', category_name: '', word_count: 0, status: 'active' });
    }, [editingCategory, isOpen]);

    const handleSubmit = () => {
        if (!form.category_name || !form.category_name.trim()) {
            alert('Category name is required');
            return;
        }
        onSave({ ...form, word_count: form.word_count || 0, status: form.status || 'active' });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editingCategory ? 'Edit Asset Category' : 'Add Asset Category'}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand <span className="text-red-500">*</span></label>
                    <select
                        value={form.brand}
                        onChange={(e) => setForm({ ...form, brand: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    >
                        {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Asset Category Name <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={form.category_name || ''}
                        onChange={(e) => setForm({ ...form, category_name: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        placeholder="e.g. Research Articles"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Word Count</label>
                    <input
                        type="number"
                        value={form.word_count || 0}
                        onChange={(e) => setForm({ ...form, word_count: parseInt(e.target.value) || 0 })}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        placeholder="e.g. 500"
                        min={0}
                    />
                </div>

                {/* Minimal fields only: Brand, Category Name, Word Count */}

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AddAssetCategoryModal;
