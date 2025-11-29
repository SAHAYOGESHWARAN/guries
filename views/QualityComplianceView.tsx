
import React, { useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { useData } from '../hooks/useData';
import { SparkIcon } from '../constants';
import { runQuery } from '../utils/gemini';
import type { ComplianceRule, ComplianceAudit } from '../types';

const QualityComplianceView: React.FC = () => {
    const { data: rules, create: createRule } = useData<ComplianceRule>('complianceRules');
    const { data: audits, create: logAudit } = useData<ComplianceAudit>('complianceAudits');

    const [activeTab, setActiveTab] = useState<'Rules' | 'Audits'>('Rules');
    const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
    const [newRule, setNewRule] = useState<Partial<ComplianceRule>>({ rule_name: '', description: '', severity: 'Medium', category: 'General' });

    // Audit State
    const [isAuditing, setIsAuditing] = useState(false);

    const handleCreateRule = async () => {
        await createRule(newRule as any);
        setIsRuleModalOpen(false);
        setNewRule({ rule_name: '', description: '', severity: 'Medium', category: 'General' });
    };

    const handleRunAudit = async () => {
        setIsAuditing(true);
        // Simulate checking a dummy content piece against rules using AI
        try {
            const prompt = `Audit this content snippet against standard compliance rules (GDPR, Brand Safety): "We guarantee results in 2 days or your money back! Call now." Return JSON: { "score": 60, "violations": ["Overpromising", "Aggressive CTA"] }`;
            const result = await runQuery(prompt, { model: 'gemini-2.5-flash' });
            const json = JSON.parse(result.text.match(/\{[\s\S]*\}/)?.[0] || '{}');
            
            await logAudit({
                target_type: 'Ad Copy',
                target_id: Math.floor(Math.random() * 1000),
                score: json.score || 0,
                violations: json.violations || []
            } as any);
            alert(`Audit Complete. Score: ${json.score}`);
        } catch (e) {
            alert('Audit failed');
        } finally {
            setIsAuditing(false);
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col animate-fade-in w-full">
            <div className="flex justify-between items-start flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Quality Assurance & Compliance</h1>
                    <p className="text-slate-500 mt-1">Automated governance and rule-based auditing</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 flex-shrink-0">
                <nav className="-mb-px flex space-x-8">
                    {['Rules', 'Audits'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex-1 overflow-y-auto">
                {activeTab === 'Rules' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button onClick={() => setIsRuleModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm">
                                + Add Compliance Rule
                            </button>
                        </div>
                        <Table 
                            columns={[
                                { header: 'Rule Name', accessor: 'rule_name' as keyof ComplianceRule, className: 'font-bold' },
                                { header: 'Category', accessor: 'category' as keyof ComplianceRule },
                                { header: 'Severity', accessor: (item: ComplianceRule) => <span className={`font-bold ${item.severity === 'High' ? 'text-red-600' : 'text-yellow-600'}`}>{item.severity}</span> },
                                { header: 'Description', accessor: 'description' as keyof ComplianceRule, className: 'text-sm text-slate-500' }
                            ]}
                            data={rules}
                            title="Active Rules"
                        />
                    </div>
                )}

                {activeTab === 'Audits' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button onClick={handleRunAudit} disabled={isAuditing} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 shadow-sm flex items-center disabled:opacity-50">
                                <SparkIcon /> <span className="ml-2">{isAuditing ? 'Auditing...' : 'Run Simulation'}</span>
                            </button>
                        </div>
                        <Table 
                            columns={[
                                { header: 'Target Type', accessor: 'target_type' as keyof ComplianceAudit },
                                { header: 'ID', accessor: 'target_id' as keyof ComplianceAudit, className: 'font-mono' },
                                { header: 'Score', accessor: (item: ComplianceAudit) => <span className={`font-bold ${item.score >= 80 ? 'text-green-600' : 'text-red-600'}`}>{item.score}/100</span> },
                                { header: 'Violations', accessor: (item: ComplianceAudit) => (item.violations as any)?.join(', ') || 'None' },
                                { header: 'Date', accessor: (item: ComplianceAudit) => new Date(item.audited_at).toLocaleString() }
                            ]}
                            data={audits}
                            title="Audit Logs"
                        />
                    </div>
                )}
            </div>

            <Modal isOpen={isRuleModalOpen} onClose={() => setIsRuleModalOpen(false)} title="Add Compliance Rule">
                <div className="space-y-4">
                    <input type="text" placeholder="Rule Name" className="w-full p-2 border rounded" value={newRule.rule_name} onChange={e => setNewRule({...newRule, rule_name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                        <select className="p-2 border rounded" value={newRule.category} onChange={e => setNewRule({...newRule, category: e.target.value})}>
                            <option>General</option><option>GDPR</option><option>Brand Safety</option><option>Accessibility</option>
                        </select>
                        <select className="p-2 border rounded" value={newRule.severity} onChange={e => setNewRule({...newRule, severity: e.target.value as any})}>
                            <option>High</option><option>Medium</option><option>Low</option>
                        </select>
                    </div>
                    <textarea placeholder="Description" className="w-full p-2 border rounded h-24" value={newRule.description} onChange={e => setNewRule({...newRule, description: e.target.value})} />
                    <div className="flex justify-end pt-4"><button onClick={handleCreateRule} className="bg-blue-600 text-white px-4 py-2 rounded">Save Rule</button></div>
                </div>
            </Modal>
        </div>
    );
};

export default QualityComplianceView;
