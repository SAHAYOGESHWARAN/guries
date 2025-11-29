
import React, { useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { useData } from '../hooks/useData';
import { SparkIcon } from '../constants';
import { runQuery } from '../utils/gemini';
import type { Email, VoiceProfile, CallLog } from '../types';

const CommunicationHubView: React.FC = () => {
    const { data: emails, create: createEmail } = useData<Email>('emails');
    const { data: voiceProfiles, create: createVoiceProfile } = useData<VoiceProfile>('voiceProfiles');
    const { data: callLogs } = useData<CallLog>('callLogs');

    const [activeTab, setActiveTab] = useState<'Email' | 'Voice' | 'Calls'>('Email');
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    
    // Email Form
    const [newEmail, setNewEmail] = useState<Partial<Email>>({ subject: '', recipient: '', status: 'draft' });
    
    // Voice Form
    const [newVoice, setNewVoice] = useState<Partial<VoiceProfile>>({ name: '', language: 'en-US', gender: 'Female', provider: 'ElevenLabs' });

    // AI Analysis
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');

    const handleCreateEmail = async () => {
        await createEmail({ ...newEmail, scheduled_at: new Date().toISOString() });
        setIsEmailModalOpen(false);
        setNewEmail({ subject: '', recipient: '', status: 'draft' });
    };

    const handleCreateVoice = async () => {
        await createVoiceProfile({ ...newVoice, voice_id: `generated-${Date.now()}` });
        setIsVoiceModalOpen(false);
        setNewVoice({ name: '', language: 'en-US', gender: 'Female', provider: 'ElevenLabs' });
    };

    const handleAnalyzeCall = async (log: CallLog) => {
        setIsAnalyzing(true);
        try {
            const prompt = `Analyze this call log summary: "${log.summary || 'No summary available.'}"
            Determine customer sentiment and suggest next best action.`;
            const result = await runQuery(prompt, { model: 'gemini-2.5-flash' });
            setAnalysisResult(result.text);
        } catch (e) {
            setAnalysisResult("Analysis failed.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col animate-fade-in w-full">
            <div className="flex justify-between items-start flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Communication Hub</h1>
                    <p className="text-slate-500 mt-1">Unified center for Email Automation, Voice AI, and Call Intelligence</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 flex-shrink-0">
                <nav className="-mb-px flex space-x-8">
                    {['Email', 'Voice', 'Calls'].map(tab => (
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
                {activeTab === 'Email' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button onClick={() => setIsEmailModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm">
                                Compose Email
                            </button>
                        </div>
                        <Table 
                            columns={[
                                { header: 'Subject', accessor: 'subject' as keyof Email, className: 'font-medium' },
                                { header: 'Recipient', accessor: 'recipient' as keyof Email },
                                { header: 'Status', accessor: (item: Email) => <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${item.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{item.status}</span> },
                                { header: 'Date', accessor: (item: Email) => new Date(item.created_at).toLocaleDateString() }
                            ]}
                            data={emails}
                            title="Campaign Emails"
                        />
                    </div>
                )}

                {activeTab === 'Voice' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button onClick={() => setIsVoiceModalOpen(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 shadow-sm flex items-center">
                                <SparkIcon /> <span className="ml-2">New AI Voice</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {voiceProfiles.map(voice => (
                                <div key={voice.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl">🎙️</div>
                                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{voice.provider}</span>
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800">{voice.name}</h3>
                                    <p className="text-sm text-slate-500 mb-4">{voice.language} • {voice.gender}</p>
                                    <button className="w-full border border-purple-200 text-purple-700 py-2 rounded-lg text-sm font-medium hover:bg-purple-50">Generate Script</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'Calls' && (
                    <div className="space-y-6">
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <h3 className="font-bold text-slate-700 mb-2 flex items-center"><SparkIcon /> <span className="ml-2">Call Sentiment Analysis</span></h3>
                            <div className="h-32 flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                {isAnalyzing ? 'Analyzing transcript...' : analysisResult || 'Select a call to analyze sentiment trends.'}
                            </div>
                        </div>
                        <Table 
                            columns={[
                                { header: 'Customer', accessor: 'customer_phone' as keyof CallLog },
                                { header: 'Duration', accessor: (item: CallLog) => `${Math.floor(item.duration / 60)}m ${item.duration % 60}s` },
                                { header: 'Sentiment', accessor: (item: CallLog) => <span className={`font-bold ${item.sentiment === 'Positive' ? 'text-green-600' : 'text-red-600'}`}>{item.sentiment}</span> },
                                { header: 'Date', accessor: (item: CallLog) => new Date(item.start_time).toLocaleString() },
                                { 
                                    header: 'Actions', 
                                    accessor: (item: CallLog) => (
                                        <button onClick={() => handleAnalyzeCall(item)} className="text-blue-600 hover:underline text-xs font-bold">Analyze</button>
                                    )
                                }
                            ]}
                            data={callLogs}
                            title="Call Logs"
                        />
                    </div>
                )}
            </div>

            {/* Modals */}
            <Modal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} title="Compose Email">
                <div className="space-y-4">
                    <input type="text" placeholder="Recipient" className="w-full p-2 border rounded" value={newEmail.recipient} onChange={e => setNewEmail({...newEmail, recipient: e.target.value})} />
                    <input type="text" placeholder="Subject" className="w-full p-2 border rounded" value={newEmail.subject} onChange={e => setNewEmail({...newEmail, subject: e.target.value})} />
                    <div className="flex justify-end pt-4"><button onClick={handleCreateEmail} className="bg-blue-600 text-white px-4 py-2 rounded">Send</button></div>
                </div>
            </Modal>

            <Modal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} title="Create Voice Profile">
                <div className="space-y-4">
                    <input type="text" placeholder="Name" className="w-full p-2 border rounded" value={newVoice.name} onChange={e => setNewVoice({...newVoice, name: e.target.value})} />
                    <select className="w-full p-2 border rounded" value={newVoice.language} onChange={e => setNewVoice({...newVoice, language: e.target.value})}>
                        <option>en-US</option><option>en-GB</option><option>es-ES</option>
                    </select>
                    <div className="flex justify-end pt-4"><button onClick={handleCreateVoice} className="bg-purple-600 text-white px-4 py-2 rounded">Create Profile</button></div>
                </div>
            </Modal>
        </div>
    );
};

export default CommunicationHubView;
