import React, { useState, useRef } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { getStatusBadge } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV, parseCSV } from '../utils/csvHelper';
import type { PerformanceTarget } from '../types';

const PerformanceTargetConfigView: React.FC = () => {
    const { data: performanceTargets, create, update, remove } = useData<PerformanceTarget>('performanceTargets');

    const [filters, setFilters] = useState({ department: 'All', cycleType: 'All' });
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PerformanceTarget | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<Partial<PerformanceTarget>>({
        target_level: 'Brand-level (per business)',
        department_function: '',
        kpi_name: '',
        metric_type: '',
        unit: '',
        direction: 'Higher is better',
        baseline_value: '',
        target_value: '',
        cycle_type: 'Monthly',
        review_frequency: 'Monthly'
    });

    const filteredData = (performanceTargets || []).filter(item => {
        if (!item) return false;
        const matchesSearch = (item.kpi_name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = filters.department === 'All' || item.department_function === filters.department;
        const matchesCycle = filters.cycleType === 'All' || item.cycle_type === filters.cycleType;
        return matchesSearch && matchesDept && matchesCycle;
    });

    const handleEdit = (item: PerformanceTarget) => {
        setEditingItem(item);
        setFormData(item);
        setActiveTab(0);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this performance target?')) {
            await remove(id);
        }
    };

    const handleSave = async () => {
        if (editingItem) {
            await update(editingItem.id, formData);
        } else {
            await create(formData as any);
        }
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({
            target_level: 'Brand-level (per business)',
            department_function: '',
            kpi_name: '',
            metric_type: '',
            unit: '',
            direction: 'Higher is better',
            baseline_value: '',
            target_value: '',
            cycle_type: 'Monthly',
            review_frequency: 'Monthly'
        });
    };

    const columns = [
        { header: 'KPI Name', accessor: 'kpi_name' as keyof PerformanceTarget, className: 'font-bold' },
        { header: 'Department', accessor: 'department_function' as keyof PerformanceTarget },
        { header: 'Metric Type', accessor: 'metric_type' as keyof PerformanceTarget },
        { header: 'Unit', accessor: 'unit' as keyof PerformanceTarget },
        { header: 'Baseline', accessor: 'baseline_value' as keyof PerformanceTarget, className: 'text-sm' },
        { header: 'Target', accessor: 'target_value' as keyof PerformanceTarget, className: 'text-sm font-semibold' },
        { header: 'Cycle', accessor: 'cycle_type' as keyof PerformanceTarget },
        { header: 'Review Freq', accessor: 'review_frequency' as keyof PerformanceTarget },
        {
            header: 'Actions',
            accessor: (item: PerformanceTarget) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 h-full overflow-y-auto w-full pr-1 animate-fade-in">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Performance Target Configuration</h1>
                    <p className="text-slate-500 mt-1">Define performance expectations and success metrics</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={filters.department}
                        onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                        className="bg-slate-50 border border-slate-200 text-sm rounded-lg p-2"
                    >
                        <option>All Departments</option>
                        <option>SEO</option>
                        <option>SMM</option>
                        <option>Content</option>
                    </select>
                    <select
                        value={filters.cycleType}
                        onChange={(e) => setFilters({ ...filters, cycleType: e.target.value })}
                        className="bg-slate-50 border border-slate-200 text-sm rounded-lg p-2"
                    >
                        <option>All Cycles</option>
                        <option>Monthly</option>
                        <option>Quarterly</option>
                        <option>Annually</option>
                    </select>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <input
                        type="search"
                        className="block flex-1 md:w-64 p-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50"
                        placeholder="Search KPI..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        onClick={() => {
                            setEditingItem(null);
                            setFormData({
                                target_level: 'Brand-level (per business)',
                                department_function: '',
                                kpi_name: '',
                                metric_type: '',
                                unit: '',
                                direction: 'Higher is better',
                                baseline_value: '',
                                target_value: '',
                                cycle_type: 'Monthly',
                                review_frequency: 'Monthly'
                            });
                            setActiveTab(0);
                            setIsModalOpen(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700"
                    >
                        + Add Performance Target
                    </button>
                </div>
            </div>

            <Table columns={columns} data={filteredData} title="Performance Targets" />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Edit Performance Target" : "Add Performance Target"}>
                <div className="space-y-4">
                    <div className="flex border-b border-gray-200">
                        {['Target Scope', 'KPI & Metric', 'Baseline & Target', 'Benchmark', 'Validation', 'Governance'].map((tab, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveTab(idx)}
                                className={`px-4 py-2 text-sm font-medium ${activeTab === idx ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="max-h-96 overflow-y-auto space-y-4">
                        {activeTab === 0 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium">Target Level</label>
                                    <select value={formData.target_level} onChange={(e) => setFormData({ ...formData, target_level: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                        <option>Brand-level (per business)</option>
                                        <option>Department-level</option>
                                        <option>Individual-level</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Brand / Website</label>
                                    <input type="text" value={formData.brand_name} onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="e.g., Tutors India" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Department / Function</label>
                                    <select value={formData.department_function} onChange={(e) => setFormData({ ...formData, department_function: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                        <option value="">Select...</option>
                                        <option>SEO</option>
                                        <option>SMM</option>
                                        <option>Content</option>
                                        <option>Development</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Applies To</label>
                                    <select value={formData.applies_to} onChange={(e) => setFormData({ ...formData, applies_to: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                        <option>All services</option>
                                        <option>Specific services</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {activeTab === 1 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium">KPI Name</label>
                                    <input type="text" value={formData.kpi_name} onChange={(e) => setFormData({ ...formData, kpi_name: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="e.g., Organic Sessions" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium">Metric Type</label>
                                        <select value={formData.metric_type} onChange={(e) => setFormData({ ...formData, metric_type: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                            <option>Traffic</option>
                                            <option>Engagement</option>
                                            <option>Conversion</option>
                                            <option>Retention</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Unit</label>
                                        <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                            <option>Sessions</option>
                                            <option>%</option>
                                            <option>Count</option>
                                            <option>Minutes</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Direction</label>
                                    <select value={formData.direction} onChange={(e) => setFormData({ ...formData, direction: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                        <option>Higher is better</option>
                                        <option>Lower is better</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Examples</label>
                                    <textarea value={formData.examples} onChange={(e) => setFormData({ ...formData, examples: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" rows={2} placeholder="e.g., Bounce Rate - Lower is better" />
                                </div>
                            </div>
                        )}

                        {activeTab === 2 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium">Baseline Value</label>
                                    <input type="text" value={formData.baseline_value} onChange={(e) => setFormData({ ...formData, baseline_value: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="e.g., 10000 sessions / 45% bounce rate" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Current Performance</label>
                                    <input type="text" value={formData.current_performance} onChange={(e) => setFormData({ ...formData, current_performance: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Target Value</label>
                                    <input type="text" value={formData.target_value} onChange={(e) => setFormData({ ...formData, target_value: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="e.g., 15000 sessions / bounce < 35%" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium">Tolerance Min</label>
                                        <input type="text" value={formData.tolerance_min} onChange={(e) => setFormData({ ...formData, tolerance_min: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Tolerance Max</label>
                                        <input type="text" value={formData.tolerance_max} onChange={(e) => setFormData({ ...formData, tolerance_max: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium">Cycle Type</label>
                                        <select value={formData.cycle_type} onChange={(e) => setFormData({ ...formData, cycle_type: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                            <option>Monthly</option>
                                            <option>Quarterly</option>
                                            <option>Annually</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Period From</label>
                                        <input type="date" value={formData.period_from} onChange={(e) => setFormData({ ...formData, period_from: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 3 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium">Gold Standard Metric</label>
                                    <input type="text" value={formData.gold_standard_value} onChange={(e) => setFormData({ ...formData, gold_standard_value: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Competitor Benchmark</label>
                                    <input type="text" value={formData.competitor_benchmark} onChange={(e) => setFormData({ ...formData, competitor_benchmark: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium">Your Target</label>
                                        <input type="text" value={formData.your_target} onChange={(e) => setFormData({ ...formData, your_target: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Your Current</label>
                                        <input type="text" value={formData.your_current} onChange={(e) => setFormData({ ...formData, your_current: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Competitor Current</label>
                                        <input type="text" value={formData.competitor_current} onChange={(e) => setFormData({ ...formData, competitor_current: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 4 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium">Data Source</label>
                                    <select value={formData.data_source} onChange={(e) => setFormData({ ...formData, data_source: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                        <option>GA4</option>
                                        <option>Manual</option>
                                        <option>API</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="flex items-center mt-2">
                                        <input type="checkbox" checked={formData.auto_evaluate} onChange={(e) => setFormData({ ...formData, auto_evaluate: e.target.checked })} className="rounded" />
                                        <span className="ml-2 text-sm">Auto-Evaluate</span>
                                    </label>
                                </div>
                                <div>
                                    <label className="flex items-center mt-2">
                                        <input type="checkbox" checked={formData.auto_calculate_score} onChange={(e) => setFormData({ ...formData, auto_calculate_score: e.target.checked })} className="rounded" />
                                        <span className="ml-2 text-sm">Auto-Calculate Performance Score</span>
                                    </label>
                                </div>
                                <div>
                                    <label className="flex items-center mt-2">
                                        <input type="checkbox" checked={formData.trigger_alert_70_percent} onChange={(e) => setFormData({ ...formData, trigger_alert_70_percent: e.target.checked })} className="rounded" />
                                        <span className="ml-2 text-sm">Trigger alert if &lt; 70% of Target achieved</span>
                                    </label>
                                </div>
                                <div>
                                    <label className="flex items-center mt-2">
                                        <input type="checkbox" checked={formData.trigger_alert_110_percent} onChange={(e) => setFormData({ ...formData, trigger_alert_110_percent: e.target.checked })} className="rounded" />
                                        <span className="ml-2 text-sm">Trigger alert if 110% (overperformance)</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {activeTab === 5 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium">Owner</label>
                                    <select value={formData.owner_id} onChange={(e) => setFormData({ ...formData, owner_id: parseInt(e.target.value) || undefined })} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                        <option value="">Select...</option>
                                        <option value="1">Admin User</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Reviewer</label>
                                    <select value={formData.reviewer_id} onChange={(e) => setFormData({ ...formData, reviewer_id: parseInt(e.target.value) || undefined })} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                        <option value="">Select...</option>
                                        <option value="1">Admin User</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Review Frequency</label>
                                    <select value={formData.review_frequency} onChange={(e) => setFormData({ ...formData, review_frequency: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                                        <option>Monthly</option>
                                        <option>Quarterly</option>
                                        <option>Annually</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Responsible Roles</label>
                                    <input type="text" value={formData.responsible_roles} onChange={(e) => setFormData({ ...formData, responsible_roles: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="e.g., SEO Lead, Writer, Developer" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button onClick={() => setIsModalOpen(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50">Cancel</button>
                        <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save Target</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PerformanceTargetConfigView;
