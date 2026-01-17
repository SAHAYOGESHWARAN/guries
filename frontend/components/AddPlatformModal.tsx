import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import type { PlatformMasterItem } from '../types';

interface AddPlatformModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<PlatformMasterItem>) => Promise<void>;
    editingItem?: PlatformMasterItem | null;
    isLoading?: boolean;
}

const SCHEDULING_OPTIONS = ['Manual', 'Auto', 'Both'];
const STATUS_OPTIONS = ['active', 'inactive'];

const AddPlatformModal: React.FC<AddPlatformModalProps> = ({
    isOpen,
    onClose,
    onSave,
    editingItem,
    isLoading = false
}) => {
    const [formData, setFormData] = useState<Partial<PlatformMasterItem>>({
        platform_name: '',
        recommended_size: '',
        scheduling: 'Manual',
        status: 'active'
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (editingItem) {
            setFormData(editingItem);
        } else {
            setFormData({
                platform_name: '',
                recommended_size: '',
                scheduling: 'Manual',
                status: 'active'
            });
        }
        setErrors({});
    }, [editingItem, isOpen]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.platform_name || !formData.platform_name.trim()) {
            newErrors.platform_name = 'Platform name is required';
        }

        if (formData.platform_name && formData.platform_name.length > 255) {
            newErrors.platform_name = 'Platform name must be less than 255 characters';
        }

        if (!formData.scheduling) {
            newErrors.scheduling = 'Scheduling option is required';
        }

        if (!formData.status) {
            newErrors.status = 'Status is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving platform:', error);
            setErrors({ submit: 'Failed to save platform. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (field: keyof PlatformMasterItem, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingItem ? 'Edit Platform' : 'Add New Platform'}
        >
            <form onSubmit={handleSubmit} className="space-y-5 p-6">
                {/* Error Alert */}
                {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
                        <div className="text-red-600 text-sm font-medium flex-1">{errors.submit}</div>
                    </div>
                )}

                {/* Platform Name */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Platform Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.platform_name || ''}
                        onChange={(e) => handleInputChange('platform_name', e.target.value)}
                        placeholder="e.g., Facebook, Instagram, LinkedIn"
                        className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${errors.platform_name
                                ? 'border-red-300 bg-red-50 focus:ring-red-500'
                                : 'border-slate-300 bg-white focus:ring-brand-500'
                            } focus:outline-none focus:ring-2`}
                        disabled={isLoading || isSaving}
                    />
                    {errors.platform_name && (
                        <p className="text-red-600 text-xs mt-1">{errors.platform_name}</p>
                    )}
                </div>

                {/* Recommended Dimensions */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Recommended Dimensions
                    </label>
                    <input
                        type="text"
                        value={formData.recommended_size || ''}
                        onChange={(e) => handleInputChange('recommended_size', e.target.value)}
                        placeholder="e.g., 1200x627px"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                        disabled={isLoading || isSaving}
                    />
                    <p className="text-xs text-slate-500 mt-1">Optional: Specify recommended image dimensions for this platform</p>
                </div>

                {/* Scheduling Options */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Scheduling Options <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                        {SCHEDULING_OPTIONS.map(option => (
                            <label key={option} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="scheduling"
                                    value={option}
                                    checked={formData.scheduling === option}
                                    onChange={(e) => handleInputChange('scheduling', e.target.value)}
                                    className="w-4 h-4 text-brand-600 border-slate-300 focus:ring-brand-500"
                                    disabled={isLoading || isSaving}
                                />
                                <span className="text-sm text-slate-700">
                                    {option === 'Manual' && 'Manual - Publish now'}
                                    {option === 'Auto' && 'Auto - Scheduled publishing'}
                                    {option === 'Both' && 'Both - Manual and scheduled'}
                                </span>
                            </label>
                        ))}
                    </div>
                    {errors.scheduling && (
                        <p className="text-red-600 text-xs mt-1">{errors.scheduling}</p>
                    )}
                </div>

                {/* Status */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Status <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.status || 'active'}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${errors.status
                                ? 'border-red-300 bg-red-50 focus:ring-red-500'
                                : 'border-slate-300 bg-white focus:ring-brand-500'
                            } focus:outline-none focus:ring-2`}
                        disabled={isLoading || isSaving}
                    >
                        {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                        ))}
                    </select>
                    {errors.status && (
                        <p className="text-red-600 text-xs mt-1">{errors.status}</p>
                    )}
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-700">
                        <strong>Tip:</strong> Platforms define where content can be published. Configure content types and asset types after creating the platform.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                        disabled={isLoading || isSaving}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg font-medium text-sm hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        disabled={isLoading || isSaving}
                    >
                        {isSaving && (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        {editingItem ? 'Update Platform' : 'Create Platform'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddPlatformModal;
