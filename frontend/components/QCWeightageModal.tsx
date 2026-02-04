import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../constants';

interface Config {
    id?: number;
    config_name: string;
    description?: string;
    status?: string;
}

interface WeightageItem {
    id?: number;
    checklist_id: number;
    checklist_name?: string;
    checklist_type: string;
    weight_percentage: number;
    is_mandatory: boolean;
    applies_to_stage?: string;
}

interface Checklist {
    id: number;
    checklist_name: string;
    checklist_type: string;
    checklist_category: string;
    status: string;
}

interface QCWeightageModalProps {
    config: Config | null;
    onClose: () => void;
    onSave: () => void;
}

const WORKFLOW_STAGES = ['Draft', 'Review', 'Approved', 'Published', 'Pre-Publish', 'Post-Publish'];

export default function QCWeightageModal({ config, onClose, onSave }: QCWeightageModalProps) {
    const [formData, setFormData] = useState<Config>({
        config_name: '',
        description: '',
        status: 'active'
    });

    const [items, setItems] = useState<WeightageItem[]>([]);
    const [checklists, setChecklists] = useState<Checklist[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [totalWeight, setTotalWeight] = useState(0);

    useEffect(() => {
        if (config) {
            setFormData(config);
            fetchConfigDetails(config.id!);
        }
        fetchChecklists();
    }, [config]);

    useEffect(() => {
        const total = items.reduce((sum, item) => sum + (item.weight_percentage || 0), 0);
        setTotalWeight(total);
    }, [items]);

    const fetchConfigDetails = async (id: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/qc-weightage/${id}`);
            const data = await response.json();
            setItems(data.items || []);
        } catch (error) {
            console.error('Error fetching config details:', error);
        }
    };

    const fetchChecklists = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/qc-weightage/list/checklists`);
            const data = await response.json();
            setChecklists(data);
        } catch (error) {
            console.error('Error fetching checklists:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddItem = () => {
        setItems([...items, {
            checklist_id: 0,
            checklist_type: '',
            weight_percentage: 0,
            is_mandatory: true,
            applies_to_stage: ''
        }]);
    };

    const handleUpdateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        if (field === 'checklist_id') {
            const checklist = checklists.find(c => c.id === parseInt(value));
            newItems[index] = {
                ...newItems[index],
                checklist_id: parseInt(value),
                checklist_name: checklist?.checklist_name,
                checklist_type: checklist?.checklist_type || ''
            };
        } else {
            newItems[index] = { ...newItems[index], [field]: value };
        }
        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!formData.config_name) {
                throw new Error('Config name is required');
            }

            if (items.length === 0) {
                throw new Error('At least one checklist item is required');
            }

            if (totalWeight !== 100) {
                throw new Error(`Total weight must equal 100%, currently ${totalWeight}%`);
            }

            // Validate all items have checklist selected
            if (items.some(item => !item.checklist_id)) {
                throw new Error('All items must have a checklist selected');
            }

            const payload = {
                ...formData,
                items: items.map(item => ({
                    checklist_id: item.checklist_id,
                    checklist_type: item.checklist_type,
                    weight_percentage: item.weight_percentage,
                    is_mandatory: item.is_mandatory,
                    applies_to_stage: item.applies_to_stage || null
                }))
            };

            const url = config ? `${API_BASE_URL}/qc-weightage/${config.id}` : `${API_BASE_URL}/qc-weightage`;
            const method = config ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save config');
            }

            onSave();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const isWeightValid = totalWeight === 100;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {config ? 'Edit QC Weightage Configuration' : 'Add New QC Weightage Configuration'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Configuration Name *
                            </label>
                            <input
                                type="text"
                                name="config_name"
                                value={formData.config_name}
                                onChange={handleInputChange}
                                placeholder="e.g., Content QC Weightage"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe this weightage configuration..."
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="active"
                                        checked={formData.status === 'active'}
                                        onChange={handleInputChange}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-gray-700">Active</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="inactive"
                                        checked={formData.status === 'inactive'}
                                        onChange={handleInputChange}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-gray-700">Inactive</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Checklist Weightage */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Checklist Weightage</h3>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                            >
                                <Plus size={16} />
                                Add Checklist
                            </button>
                        </div>

                        {/* Weight Validation */}
                        <div className={`p-4 rounded-lg flex items-center gap-2 ${isWeightValid
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-orange-50 border border-orange-200'
                            }`}>
                            {isWeightValid ? (
                                <>
                                    <CheckCircle size={20} className="text-green-600" />
                                    <span className="text-green-700">Total weight equals 100% ✓</span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle size={20} className="text-orange-600" />
                                    <span className="text-orange-700">Total weight is {totalWeight}%, must be 100%</span>
                                </>
                            )}
                        </div>

                        {/* Items */}
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                    <div className="grid grid-cols-6 gap-3 items-end">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Checklist *
                                            </label>
                                            <select
                                                value={item.checklist_id}
                                                onChange={(e) => handleUpdateItem(index, 'checklist_id', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            >
                                                <option value="">Select checklist</option>
                                                {checklists.map(checklist => (
                                                    <option key={checklist.id} value={checklist.id}>
                                                        {checklist.checklist_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Type
                                            </label>
                                            <input
                                                type="text"
                                                value={item.checklist_type}
                                                disabled
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Weight (%) *
                                            </label>
                                            <input
                                                type="number"
                                                value={item.weight_percentage}
                                                onChange={(e) => handleUpdateItem(index, 'weight_percentage', parseInt(e.target.value))}
                                                min="0"
                                                max="100"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Stage
                                            </label>
                                            <select
                                                value={item.applies_to_stage || ''}
                                                onChange={(e) => handleUpdateItem(index, 'applies_to_stage', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            >
                                                <option value="">All Stages</option>
                                                {WORKFLOW_STAGES.map(stage => (
                                                    <option key={stage} value={stage}>{stage}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={item.is_mandatory}
                                                    onChange={(e) => handleUpdateItem(index, 'is_mandatory', e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-xs text-gray-700">Mandatory</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="text-sm text-gray-600">Total Items: {items.length}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !isWeightValid}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : config ? 'Save Changes' : 'Add Configuration'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
