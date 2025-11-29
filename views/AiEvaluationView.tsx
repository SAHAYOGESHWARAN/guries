
import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { runQuery } from '../utils/gemini';
import { SparkIcon } from '../constants';
import type { User } from '../types';

const AiEvaluationView: React.FC = () => {
    const { data: users } = useData<User>('users');
    const [selectedUser, setSelectedUser] = useState<number>(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [evaluation, setEvaluation] = useState('');

    const handleGenerate = async () => {
        if (!selectedUser) return;
        setIsGenerating(true);
        try {
            const user = users.find(u => u.id === selectedUser);
            const prompt = `Generate a performance evaluation for ${user?.name} (${user?.role}). 
            Key achievements: High output, good quality. 
            Areas for improvement: Time management.
            Tone: Professional and constructive.`;
            
            const result = await runQuery(prompt, { model: 'gemini-3-pro-preview' });
            setEvaluation(result.text);
        } catch (e) {
            setEvaluation('Generation failed.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col w-full p-6 animate-fade-in overflow-y-auto">
            <div className="flex justify-between items-start flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">AI Evaluation Engine</h1>
                    <p className="text-slate-500 mt-1">Generate unbiased performance reviews using Gemini 3 Pro.</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
                        <select 
                            className="w-full p-2.5 border border-gray-300 rounded-lg"
                            value={selectedUser}
                            onChange={e => setSelectedUser(parseInt(e.target.value))}
                        >
                            <option value={0}>Select...</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name} - {u.role}</option>)}
                        </select>
                    </div>
                    <button 
                        onClick={handleGenerate} 
                        disabled={isGenerating || !selectedUser}
                        className="bg-purple-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-md hover:bg-purple-700 disabled:opacity-50 flex items-center w-fit"
                    >
                        <SparkIcon /> <span className="ml-2">{isGenerating ? 'Generating Review...' : 'Generate Evaluation'}</span>
                    </button>
                </div>
            </div>

            {evaluation && (
                <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 prose max-w-none">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Generated Review</h3>
                    <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                        {evaluation}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AiEvaluationView;
    