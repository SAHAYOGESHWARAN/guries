import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';

interface Checklist {
    id?: number;
    checklist_name: string;
    checklist_type: string;
    checklist_category: string;
    description?: string;
    status?: string;
    scoring_mode: string;
    pass_threshold: number;
    rework_threshold: number;
    auto_fail_required: boolean;
    auto_fail_critical: boolean;
    qc_output_type: string;
}

interface ChecklistItem {
    id?: number;
    item_name: string;
    severity: string;
    is_required: boolean;
    default_score: number;
}

interface AuditChecklistModalProps {
    checklist: Checklist | null;
    onClose: () => void;
    onSave: () => void;
}

const CHECKLIST_TYPES = ['Content', 'SEO', 'Web', 'SMM', 'Analytics', 'Backlink', 'Competitor', 'Repository', 'Other'];
const CHECKLIST_CATEGORIES = ['Editorial', 'Technical SEO', 'Brand & Compliance', 'Promotional'];
const SEVERITY_LEVELS = ['Low', 'Medium', 'High'];
const SCORING_MODES = ['Binary', 'Weighted'];
const QC_OUTPUT_TYPES = ['Percentage', 'Pass/Fail', 'Pass/Rework/Fail'];
const MODULES = ['Content Campaign', 'SEO Campaign', 'Web Developer Campaign', 'SMM Campaign', 'Analytics & Reporting', 'Backlink Campaign', 'Competitor Research'];

export default function AuditChecklistModal({ checklist, onClose, onSave }: AuditChecklistModalProps) {
    const [activeTab, setActiveTab] = useState('basics');
    const [formData, setFormData] = useState<Checklist>({
        checklist_name: '',
        checklist_type: '',
        checklist_category: '',
        description: '',
        status: 'active',
        scoring_mode: 'weighted',
        pass_threshold: 85,
        rework_threshold: 70,
        auto_fail_required: true,
        auto_fail_critical: true,
        qc_output_type: 'percentage'
    });

    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [modules, setModules] = useState<string[]>([]);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (checklist) {
            setFormData(checklist);
            fetchChecklistDetails(checklist.id!);
        }
    }, [checklist]);

    const fetchChecklistDetails = async (id: number) => {
        try {
            const response = await fetch(`/api/audit-checklist/${id}`);
            const data = await response.json();
            setItems(data.items || []);
            setModules(data.modules || []);
            setCampaigns(data.campaigns || []);
        } catch (error) {
            console.error('Error fetching checklist details:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as any;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleAddItem = () => {
        setItems([...items, { item_name: '', severity: 'Medium', is_required: false, default_score: 1 }]);
    };

    const handleUpdateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleToggleModule = (module: string) => {
        setModules(prev =>
            prev.includes(module)
                ? prev.filter(m => m !== module)
                : [...prev, module]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!formData.checklist_name || !formData.checklist_type || !formData.checklist_category) {
                throw new Error('Checklist name, type, and category are required');
            }

            if (items.length === 0) {
                throw new Error('At least one checklist item is required');
            }

            const payload = {
                ...formData,
                items,
                modules,
                campaigns
            };

            const url = checklist ? `/api/audit-checklist/${checklist.id}` : '/api/audit-checklist';
            const method = checklist ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save checklist');
            }

            onSave();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {checklist ? 'Edit Checklist' : 'Add New Checklist'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b bg-gray-50">
                    <button
                        onClick={() => setActiveTab('basics')}
                        className={`px-6 py-3 font-medium transition ${activeTab === 'basics'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Basics
                    </button>
                    <button
                        onClick={() => setActiveTab('items')}
                        className={`px-6 py-3 font-medium transition ${activeTab === 'items'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Checklist Items
                    </button>
                    <button
                        onClick={() => setActiveTab('scoring')}
                        className={`px-6 py-3 font-medium transition ${activeTab === 'scoring'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        QC Scoring & Rules
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Basics Tab */}
                    {activeTab === 'basics' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Checklist Name *
                                </label>
                                <input
                                    type="text"
                                    name="checklist_name"
                                    value={formData.checklist_name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., On-Page SEO Audit"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Checklist Type *
                                    </label>
                                    <select
                                        name="checklist_type"
                                        value={formData.checklist_type}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select type</option>
                                        {CHECKLIST_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Checklist Category *
                                    </label>
                                    <select
                                        name="checklist_category"
                                        value={formData.checklist_category}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select category</option>
                                        {CHECKLIST_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Provide a brief description of this checklist and its purpose..."
                                    rows={4}
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
                    )}

                    {/* Items Tab */}
                    {activeTab === 'items' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Checklist Items</h3>
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                                >
                                    <Plus size={16} />
                                    Add Item
                                </button>
                            </div>

                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                        <div className="flex gap-4 items-start">
                                            <GripVertical size={20} className="text-gray-400 mt-2" />
                                            <div className="flex-1 space-y-3">
                                                <input
                                                    type="text"
                                                    value={item.item_name}
                                                    onChange={(e) => handleUpdateItem(index, 'item_name', e.target.value)}
                                                    placeholder="Item name"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />

                                                <div className="grid grid-cols-3 gap-3">
                                                    <select
                                                        value={item.severity}
                                                        onChange={(e) => handleUpdateItem(index, 'severity', e.target.value)}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        {SEVERITY_LEVELS.map(level => (
                                                            <option key={level} value={level}>{level}</option>
                                                        ))}
                                                    </select>

                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.is_required}
                                                            onChange={(e) => handleUpdateItem(index, 'is_required', e.target.checked)}
                                                            className="w-4 h-4"
                                                        />
                                                        <span className="text-sm text-gray-700">Required</span>
                                                    </label>

                                                    <input
                                                        type="number"
                                                        value={item.default_score}
                                                        onChange={(e) => handleUpdateItem(index, 'default_score', parseInt(e.target.value))}
                                                        placeholder="Default score"
                                                        min="0"
                                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p className="text-sm text-gray-600">Total Items: {items.length}</p>
                        </div>
                    )}

                    {/* Scoring Tab */}
                    {activeTab === 'scoring' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">QC Scoring & Rules</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Scoring Mode
                                    </label>
                                    <select
                                        name="scoring_mode"
                                        value={formData.scoring_mode}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {SCORING_MODES.map(mode => (
                                            <option key={mode} value={mode}>{mode}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        QC Output Type
                                    </label>
                                    <select
                                        name="qc_output_type"
                                        value={formData.qc_output_type}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {QC_OUTPUT_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pass Threshold (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="pass_threshold"
                                        value={formData.pass_threshold}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Rework Threshold (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="rework_threshold"
                                        value={formData.rework_threshold}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-medium text-gray-900">Auto-Fail Conditions</h4>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="auto_fail_required"
                                        checked={formData.auto_fail_required}
                                        onChange={handleInputChange}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-gray-700">If any Required item fails – Auto Fail</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="auto_fail_critical"
                                        checked={formData.auto_fail_critical}
                                        onChange={handleInputChange}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-gray-700">If any Critical severity item fails – Auto Fail</span>
                                </label>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Link to Modules</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {MODULES.map(module => (
                                        <label key={module} className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={modules.includes(module)}
                                                onChange={() => handleToggleModule(module)}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-gray-700 text-sm">{module}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

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
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : checklist ? 'Save Changes' : 'Add Checklist'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
