import React, { useState, useEffect } from 'react';
import { X, GripVertical, Trash2, Plus } from 'lucide-react';
import { API_BASE_URL } from '../constants';

interface WorkflowStageModalProps {
    workflow: any;
    onSave: (data: any) => void;
    onClose: () => void;
}

const COLOR_OPTIONS = [
    { name: 'blue', label: 'Blue', bg: 'bg-blue-500' },
    { name: 'orange', label: 'Orange', bg: 'bg-orange-500' },
    { name: 'green', label: 'Green', bg: 'bg-green-500' },
    { name: 'purple', label: 'Purple', bg: 'bg-purple-500' },
    { name: 'pink', label: 'Pink', bg: 'bg-pink-500' },
    { name: 'red', label: 'Red', bg: 'bg-red-500' },
    { name: 'indigo', label: 'Indigo', bg: 'bg-indigo-500' },
    { name: 'gray', label: 'Gray', bg: 'bg-gray-500' }
];

export default function WorkflowStageModal({
    workflow,
    onSave,
    onClose
}: WorkflowStageModalProps) {
    const [formData, setFormData] = useState({
        workflow_name: '',
        description: '',
        status: 'active',
        stages: [] as any[]
    });

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (workflow) {
            setFormData({
                workflow_name: workflow.workflow_name,
                description: workflow.description || '',
                status: workflow.status,
                stages: workflow.stages || []
            });
        }
    }, [workflow]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.workflow_name.trim()) {
            newErrors.workflow_name = 'Workflow name is required';
        }
        if (formData.stages.length === 0) {
            newErrors.stages = 'At least one stage is required';
        }

        formData.stages.forEach((stage, index) => {
            if (!stage.stage_title.trim()) {
                newErrors[`stage_${index}`] = 'Stage title is required';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleAddStage = () => {
        setFormData(prev => ({
            ...prev,
            stages: [
                ...prev.stages,
                {
                    stage_title: '',
                    stage_label: '',
                    color_tag: 'blue',
                    mandatory_qc: false
                }
            ]
        }));
    };

    const handleRemoveStage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            stages: prev.stages.filter((_, i) => i !== index)
        }));
    };

    const handleStageChange = (index: number, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            stages: prev.stages.map((stage, i) =>
                i === index ? { ...stage, [field]: value } : stage
            )
        }));
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (index: number) => {
        if (draggedIndex === null || draggedIndex === index) return;

        const newStages = [...formData.stages];
        const draggedStage = newStages[draggedIndex];
        newStages.splice(draggedIndex, 1);
        newStages.splice(index, 0, draggedStage);

        setFormData(prev => ({
            ...prev,
            stages: newStages
        }));
        setDraggedIndex(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {workflow ? 'Edit Workflow' : 'Add Workflow'}
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                            Update workflow stages, colors, and QC requirements
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Workflow Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Workflow Name *
                        </label>
                        <input
                            type="text"
                            name="workflow_name"
                            value={formData.workflow_name}
                            onChange={handleInputChange}
                            placeholder="e.g., Content Production"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.workflow_name ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.workflow_name && <p className="text-red-500 text-xs mt-1">{errors.workflow_name}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Workflow description..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Workflow Stages */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Workflow Stages</h3>
                            <button
                                type="button"
                                onClick={handleAddStage}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                <Plus size={16} />
                                Add Stage
                            </button>
                        </div>

                        {errors.stages && <p className="text-red-500 text-xs mb-2">{errors.stages}</p>}

                        <div className="space-y-3">
                            {formData.stages.map((stage, index) => (
                                <div
                                    key={index}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={handleDragOver}
                                    onDrop={() => handleDrop(index)}
                                    className={`p-4 border rounded-lg ${draggedIndex === index ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <GripVertical size={20} className="text-gray-400 flex-shrink-0 mt-1" />

                                        <div className="flex-1 space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                        Stage Title *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={stage.stage_title}
                                                        onChange={(e) => handleStageChange(index, 'stage_title', e.target.value)}
                                                        placeholder="e.g., Draft"
                                                        className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`stage_${index}`] ? 'border-red-500' : 'border-gray-300'
                                                            }`}
                                                    />
                                                    {errors[`stage_${index}`] && (
                                                        <p className="text-red-500 text-xs mt-1">{errors[`stage_${index}`]}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                        Stage Label
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={stage.stage_label}
                                                        onChange={(e) => handleStageChange(index, 'stage_label', e.target.value)}
                                                        placeholder="e.g., Draft"
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                                    Color Label
                                                </label>
                                                <div className="flex gap-2 flex-wrap">
                                                    {COLOR_OPTIONS.map(color => (
                                                        <button
                                                            key={color.name}
                                                            type="button"
                                                            onClick={() => handleStageChange(index, 'color_tag', color.name)}
                                                            className={`w-8 h-8 rounded-lg ${color.bg} ${stage.color_tag === color.name ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                                                                }`}
                                                            title={color.label}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={stage.mandatory_qc}
                                                    onChange={(e) => handleStageChange(index, 'mandatory_qc', e.target.checked)}
                                                    className="w-4 h-4 text-blue-600 rounded"
                                                />
                                                <span className="text-sm font-medium text-gray-700">Mandatory QC</span>
                                            </label>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveStage(index)}
                                            className="text-red-600 hover:text-red-800 flex-shrink-0"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Status
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value="active"
                                    checked={formData.status === 'active'}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm font-medium text-gray-700">Active</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value="inactive"
                                    checked={formData.status === 'inactive'}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-gray-600"
                                />
                                <span className="text-sm font-medium text-gray-700">Inactive</span>
                            </label>
                        </div>
                    </div>

                    {/* Guidelines */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800 font-medium mb-2">Workflow Guidelines:</p>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Drag and drop stages to reorder them</li>
                            <li>• Each stage should have a unique title and color for easy identification</li>
                            <li>• Enable "Mandatory QC" for stages that require quality control approval</li>
                            <li>• Stage order determines the progression path in campaigns</li>
                        </ul>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                        >
                            {workflow ? 'Update Workflow' : 'Add Workflow'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
