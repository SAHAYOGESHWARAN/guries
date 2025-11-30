
import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';

interface ChecklistConfig {
    id: number;
    name: string;
    type: string;
    weight: number;
    mandatory: boolean;
    stage: string;
    asset_type?: string;
}

const ASSET_TYPES = ['Service Page', 'Blog Post', 'Landing Page', 'Whitepaper', 'SMM Post'];
const STAGES = ['Draft', 'Review', 'Pre-Publish', 'Post-Publish'];

const QcWeightageConfigView: React.FC = () => {
    const { data: allConfigs, create, update, remove } = useData<ChecklistConfig>('qcWeightageConfigs');
    
    const [selectedAssetType, setSelectedAssetType] = useState('Service Page');
    const [totalWeight, setTotalWeight] = useState(0);
    const [isValid, setIsValid] = useState(true);

    const checklists = allConfigs.filter(c => c.asset_type === selectedAssetType);

    useEffect(() => {
        const total = checklists.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
        setTotalWeight(total);
        setIsValid(total === 100);
    }, [checklists]);

    const handleWeightChange = async (id: number, val: string) => {
        const newWeight = parseInt(val) || 0;
        await update(id, { weight: newWeight });
    };

    const handleMandatoryToggle = async (item: ChecklistConfig) => {
        await update(item.id, { mandatory: !item.mandatory });
    };

    const handleStageChange = async (id: number, val: string) => {
        await update(id, { stage: val });
    };

    const handleDelete = async (id: number) => {
        if(confirm("Remove this checklist from weightage?")) await remove(id);
    };

    const handleAddChecklist = async () => {
        await create({
            name: 'New Checklist Item',
            type: 'Content',
            weight: 0,
            mandatory: false,
            stage: 'Draft',
            asset_type: selectedAssetType
        } as any);
    };

    const handleExport = () => {
        exportToCSV(checklists, `qc_weightage_${selectedAssetType.replace(/\s+/g, '_')}`);
    };

    return (
        <div className="space-y-6 h-full overflow-y-auto w-full pr-1">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">QC Weightage Configuration</h1>
                    <p className="text-slate-500 mt-1">Define how different QC checklists contribute to the final QC score per asset type.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={handleExport}
                        className="text-slate-600 hover:text-indigo-600 bg-white border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
                    >
                        Export
                    </button>
                </div>
            </div>

            {/* Configuration Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                    <div className="w-full md:w-1/3">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Select Asset Type *</label>
                        <select 
                            value={selectedAssetType} 
                            onChange={(e) => setSelectedAssetType(e.target.value)}
                            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                        >
                            {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        {checklists.length > 0 && (
                            isValid ? (
                                <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                                    <span className="font-bold mr-2">Configuration Valid</span>
                                    <span className="text-sm">Total weight equals 100% ✓</span>
                                </div>
                            ) : (
                                <div className="flex items-center text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200 animate-pulse">
                                    <span className="font-bold mr-2">Configuration Invalid</span>
                                    <span className="text-sm">Total weight: {totalWeight}% (Must be 100%)</span>
                                </div>
                            )
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Checklist Weightage</h3>
                    <button onClick={handleAddChecklist} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Checklist
                    </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Checklist Name</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Checklist Type</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Weight (%)</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Mandatory?</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Applies To Stage</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {checklists.length > 0 ? checklists.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input 
                                            type="text" 
                                            value={item.name}
                                            onChange={(e) => update(item.id, { name: e.target.value })}
                                            className="text-sm font-medium text-slate-900 border-none bg-transparent focus:ring-0 w-full"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select 
                                            value={item.type}
                                            onChange={(e) => update(item.id, { type: e.target.value })}
                                            className="text-xs px-2 py-1 rounded font-medium border-none bg-transparent"
                                        >
                                            <option value="Content">Content</option>
                                            <option value="SEO">SEO</option>
                                            <option value="Web">Web</option>
                                            <option value="Analytics">Analytics</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <input 
                                                type="number" 
                                                min="0" 
                                                max="100"
                                                value={item.weight} 
                                                onChange={(e) => handleWeightChange(item.id, e.target.value)}
                                                className="w-16 p-1 text-right border border-slate-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <span className="ml-1 text-sm text-slate-500">%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <input 
                                            type="checkbox" 
                                            checked={item.mandatory} 
                                            onChange={() => handleMandatoryToggle(item)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select 
                                            value={item.stage}
                                            onChange={(e) => handleStageChange(item.id, e.target.value)}
                                            className="block w-full p-1 text-sm border border-slate-300 rounded bg-white focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                                        No checklists configured for this asset type. Click "Add Checklist" to begin.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-slate-50">
                            <tr>
                                <td colSpan={2} className="px-6 py-3 text-right text-sm font-bold text-slate-700">Total Weight</td>
                                <td className="px-6 py-3 text-left">
                                    <span className={`font-bold text-sm ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                                        {totalWeight}%
                                    </span>
                                </td>
                                <td colSpan={3}></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default QcWeightageConfigView;
