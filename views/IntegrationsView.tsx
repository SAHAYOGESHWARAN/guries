
import React, { useState } from 'react';
import Modal from '../components/Modal';
import { useData } from '../hooks/useData';
import { 
    GoogleIcon, SemrushIcon, AhrefsIcon, 
} from '../constants';
import type { Integration, IntegrationLog } from '../types';

const IntegrationsView: React.FC = () => {
    const { data: integrationsData, update: updateIntegration } = useData<Integration>('integrations');
    const { data: logs, create: createLog } = useData<IntegrationLog>('logs');
    
    // STRICT: Only use data from the backend
    const integrations = integrationsData;

    const [configModal, setConfigModal] = useState<{ open: boolean; integrationId: string | null }>({ open: false, integrationId: null });
    const [isSyncing, setIsSyncing] = useState<Record<string, boolean>>({});
    const [logFilter, setLogFilter] = useState('all');
    
    // Config Form State
    const [configForm, setConfigForm] = useState<any>({
        syncFrequency: 'daily',
        healthThresholds: { maxLatency: 500, alertOnFailure: true },
        apiKeyMetadata: { lastRotated: '2023-10-01', status: 'active' }
    });

    // ... (Helpers and Handlers remain same) ...
    const getIcon = (iconName: string) => {
        switch(iconName) {
            case 'google': return <GoogleIcon />;
            case 'semrush': return <SemrushIcon />;
            case 'ahrefs': return <AhrefsIcon />;
            default: return <div className="text-xl">🔌</div>;
        }
    };

    const getHealthColor = (score: number) => {
        if (score >= 90) return 'bg-green-500';
        if (score >= 70) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const isKeyOld = (dateStr?: string) => {
        if (!dateStr) return false;
        const days = (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 3600 * 24);
        return days > 90;
    };

    const getLatencyColor = (latency: number, threshold: number) => {
        if (latency > threshold) return 'text-red-600';
        if (latency > threshold * 0.8) return 'text-yellow-600';
        return 'text-green-600';
    };

    const latencies: Record<string, number> = {
        // Will be empty if no integrations connected
    };

    const handleToggleConnect = (id: string) => {
        const integration = integrations.find(i => i.id === id);
        if (integration?.connected) {
            setConfigModal({ open: true, integrationId: id });
            setConfigForm(integration.config || configForm);
        } else {
            // Simulate connection flow
            updateIntegration(id, { connected: true, healthScore: 100, syncStatus: 'success' });
        }
    };

    const handleSync = async (id: string) => {
        setIsSyncing(prev => ({ ...prev, [id]: true }));
        await updateIntegration(id, { syncStatus: 'syncing' });
        
        setTimeout(async () => {
            setIsSyncing(prev => ({ ...prev, [id]: false }));
            await updateIntegration(id, { syncStatus: 'success', lastSyncTime: new Date().toISOString() });
            createLog({ integration_id: id, event: 'Manual Sync Completed', status: 'success', timestamp: new Date().toISOString() } as any);
        }, 2000);
    };

    // Filter logs correctly using integration_id (database column name)
    const filteredLogs = logs.filter(log => logFilter === 'all' || (log as any).integration_id === logFilter);

    return (
        <div className="space-y-6 h-full overflow-y-auto w-full pr-1 p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Connectivity Hub</h1>
                <div className="text-sm text-gray-500 flex items-center bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                    <span className="relative flex h-2.5 w-2.5 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    System Status: <span className="font-bold text-green-600 ml-1">OPERATIONAL</span>
                </div>
            </div>

            {/* Integration Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.length > 0 ? integrations.map(integration => {
                    const isOldKey = isKeyOld(integration.config?.apiKeyMetadata?.lastRotated);
                    const isHighLatency = latencies[integration.id] > (integration.config?.healthThresholds?.maxLatency || 500);
                    const isIssue = integration.connected && (isOldKey || isHighLatency);

                    return (
                    <div key={integration.id} className={`bg-white p-6 rounded-lg shadow-md flex flex-col relative hover:shadow-lg transition-all border-2 ${isIssue ? 'border-red-100 ring-1 ring-red-100' : 'border-transparent'}`}>
                        {integration.connected && (
                            <div className="absolute top-4 right-4 flex flex-col items-end space-y-1">
                                <div className="flex items-center space-x-2 bg-gray-50 rounded-full px-2 py-1 border border-gray-200">
                                    <span className={`text-xs font-mono font-bold ${getLatencyColor(latencies[integration.id] || 0, integration.config?.healthThresholds?.maxLatency || 500)}`}>
                                        {latencies[integration.id] ? `${latencies[integration.id]}ms` : 'OK'}
                                    </span>
                                    <div className={`w-1.5 h-1.5 rounded-full ${latencies[integration.id] > (integration.config?.healthThresholds?.maxLatency || 500) ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 flex items-center justify-center mr-4 bg-gray-50 rounded-full border border-gray-100 shadow-sm">
                                {getIcon(integration.icon)}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{integration.name}</h3>
                                <div className="flex items-center space-x-2">
                                     <p className={`text-xs font-semibold ${integration.connected ? 'text-green-600' : 'text-gray-400'}`}>
                                        {integration.connected ? 'Connected' : 'Disconnected'}
                                     </p>
                                </div>
                            </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4 flex-grow leading-relaxed">{integration.description}</p>

                        {integration.connected && (
                            <div className="mb-4 space-y-3">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-500 font-medium">Health Score</span>
                                        <span className="font-bold text-gray-700">{integration.healthScore}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div 
                                            className={`h-1.5 rounded-full transition-all duration-500 ${getHealthColor(integration.healthScore)}`} 
                                            style={{ width: `${integration.healthScore}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex space-x-2 mt-auto pt-2">
                            <button
                                onClick={() => handleToggleConnect(integration.id)}
                                className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
                                    integration.connected
                                        ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                                }`}
                            >
                                {integration.connected ? 'Configure' : 'Connect Integration'}
                            </button>
                            {integration.connected && (
                                <button 
                                    onClick={() => handleSync(integration.id)}
                                    disabled={isSyncing[integration.id]}
                                    className="px-3 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-md hover:bg-blue-100 disabled:opacity-50 transition-colors"
                                    title="Force Sync Now"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isSyncing[integration.id] ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                );
                }) : (
                    <div className="col-span-full p-8 text-center text-gray-500 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                        No integrations configured. Use the Admin Console to add providers.
                    </div>
                )}
            </div>

            {/* Real-Time Activity Log */}
            <div className="bg-gray-900 text-gray-300 rounded-lg p-6 shadow-inner font-mono text-sm border border-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-gray-100 font-bold flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                        Live Event Stream
                    </h3>
                    <select 
                        value={logFilter} 
                        onChange={(e) => setLogFilter(e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                    >
                        <option value="all">All Sources</option>
                        {integrations.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 pr-2">
                    {filteredLogs.length > 0 ? filteredLogs.map(log => (
                        <div key={log.id} className="flex space-x-4 border-b border-gray-800 pb-1 last:border-0 hover:bg-gray-800/50 px-2 py-1 rounded transition-colors">
                            <span className="text-gray-500 w-24 flex-shrink-0 text-xs pt-0.5">{log.timestamp}</span>
                            <span className={`flex-1 text-xs font-bold ${log.status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                                [{log.status.toUpperCase()}]
                            </span>
                            <span className="flex-1 text-blue-300">{integrations.find(i => i.id === (log as any).integration_id)?.name || (log as any).integration_id}</span>
                            <span className="flex-[2] text-white">{log.event}</span>
                        </div>
                    )) : (
                        <div className="text-gray-600 italic text-center py-4">No logs found for selected filter.</div>
                    )}
                </div>
            </div>

            {/* Advanced Config Modal */}
            <Modal 
                isOpen={configModal.open} 
                onClose={() => setConfigModal({ open: false, integrationId: null })} 
                title="Integration Settings"
            >
               <div className="p-4 text-center text-slate-500 italic">Configuration options coming soon...</div>
            </Modal>
        </div>
    );
};

export default IntegrationsView;
