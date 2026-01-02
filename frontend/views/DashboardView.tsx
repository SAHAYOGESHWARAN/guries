import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';
import { SparkIcon } from '../constants';
import { runQuery } from '../utils/gemini';
import { LineChart, DonutChart } from '../components/Charts';
import type { Campaign, Task, Notification } from '../types';

// --- Local Components ---

const StatCard: React.FC<{ label: string; value: string | number; trend?: string; trendUp?: boolean; colorClass?: string; icon: React.ReactNode }> = ({ label, value, trend, trendUp, colorClass, icon }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between hover:shadow-md transition-all duration-300 h-full group">
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 group-hover:text-brand-600 transition-colors">{label}</p>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">{value}</h3>
            {trend && (
                <div className={`flex items-center mt-1 text-[10px] font-medium ${trendUp ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'} px-1.5 py-0.5 rounded-full w-fit`}>
                    <span className="mr-1">{trendUp ? '↑' : '↓'}</span> {trend}
                </div>
            )}
        </div>
        <div className={`p-2.5 rounded-lg ${colorClass} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
            {React.cloneElement(icon as React.ReactElement<any>, { className: `w-4 h-4 ${((colorClass || '') as string).replace('bg-', 'text-')}` })} 
        </div>
    </div>
);

const GlassCard: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; className?: string }> = ({ title, subtitle, children, className }) => (
    <div className={`bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex flex-col ${className}`}>
        <div className="mb-4 flex-shrink-0 flex justify-between items-end">
            <div>
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h3>
                {subtitle && <p className="text-[10px] text-slate-500 font-medium mt-0.5">{subtitle}</p>}
            </div>
            <button className="text-slate-400 hover:text-brand-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
            </button>
        </div>
        <div className="flex-1 min-h-0">
            {children}
        </div>
    </div>
);

const QuickAction: React.FC<{ label: string; icon: React.ReactNode; color: string; onClick: () => void }> = ({ label, icon, color, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-50 hover:bg-white border border-slate-200 hover:border-brand-200 hover:shadow-sm transition-all group h-full">
        <div className={`p-2 rounded-full ${color} bg-opacity-10 text-opacity-100 group-hover:scale-110 transition-transform mb-1.5`}>
            {React.cloneElement(icon as React.ReactElement<any>, { className: `w-4 h-4 ${color.replace('bg-', 'text-')}` })}
        </div>
        <span className="font-semibold text-[10px] text-slate-600 group-hover:text-slate-900 text-center">{label}</span>
    </button>
);

const ActivityFeed: React.FC = () => {
    const { data: notifications } = useData<Notification>('notifications');
    return (
        <div className="space-y-0 overflow-y-auto pr-2 h-full scrollbar-thin scrollbar-thumb-slate-200">
            {notifications.slice(0, 10).map((note, i) => (
                <div key={i} className="flex items-start space-x-3 py-2.5 border-b border-slate-50 last:border-0 group hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                    <div className={`w-1.5 h-1.5 mt-1.5 rounded-full flex-shrink-0 ${note.type === 'success' ? 'bg-emerald-500' : note.type === 'warning' ? 'bg-amber-500' : 'bg-brand-500'} ring-2 ring-white`}></div>
                    <div>
                        <p className="text-xs font-medium text-slate-700 leading-snug group-hover:text-brand-700 transition-colors">{note.text}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5 font-medium uppercase tracking-wide">{note.time}</p>
                    </div>
                </div>
            ))}
            {notifications.length === 0 && <p className="text-xs text-slate-400 italic text-center py-8">No recent activity.</p>}
        </div>
    );
};

const DashboardView: React.FC<{ onNavigate?: (view: any, id?: any) => void }> = ({ onNavigate }) => {
  const { data: campaigns } = useData<Campaign>('campaigns');
  const { data: tasks } = useData<Task>('tasks');
  const { data: trafficData } = useData<{ date: string, value: number }>('traffic');
  
  const [commandInput, setCommandInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [timeOfDay, setTimeOfDay] = useState('Morning');

  useEffect(() => {
      const hour = new Date().getHours();
      if (hour < 12) setTimeOfDay('Morning');
      else if (hour < 18) setTimeOfDay('Afternoon');
      else setTimeOfDay('Evening');
  }, []);

  const handleCommand = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!commandInput.trim()) return;
      setIsProcessing(true);
      try {
          const result = await runQuery(commandInput, { model: 'gemini-2.5-flash' });
          setAiResponse(result.text);
      } catch (error) {
          setAiResponse("I'm sorry, I couldn't process that request right now.");
      } finally {
          setIsProcessing(false);
          setCommandInput('');
      }
  };

  const chartData = trafficData && trafficData.length > 0 
    ? trafficData.map(d => ({ label: d.date, value: d.value })) 
    : [{ label: 'Today', value: 0 }];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-slate-50">
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-300">
            <div className="w-full space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 w-full pb-4 border-b border-slate-200">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                            Good {timeOfDay}, <span className="text-brand-600">Guires</span>
                        </h1>
                        <p className="text-xs text-slate-500 font-medium mt-1 max-w-xl">
                            System performance is optimal. <span className="text-emerald-600 font-bold">100% uptime</span>.
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Workspace:</span>
                        <select className="bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded-lg px-2 py-1.5 shadow-sm focus:ring-brand-500 focus:border-brand-500">
                            <option>Global Marketing</option>
                            <option>North America</option>
                            <option>Europe</option>
                        </select>
                    </div>
                </div>

                {/* --- AI Omni-Bar --- */}
                <div className="w-full relative z-30">
                    <div className="relative group w-full mx-auto">
                        <div className="absolute -inset-1 bg-gradient-to-r from-brand-400 to-cyan-400 rounded-2xl opacity-20 group-focus-within:opacity-40 transition duration-500 blur-lg"></div>
                        <div className="relative bg-white rounded-xl shadow-float border border-slate-200 flex items-center p-1.5 transition-all w-full">
                            <div className="pl-3 pr-2 text-brand-600 animate-pulse-subtle">
                                <SparkIcon />
                            </div>
                            <form onSubmit={handleCommand} className="flex-1 w-full">
                                <input 
                                    type="text" 
                                    value={commandInput}
                                    onChange={(e) => setCommandInput(e.target.value)}
                                    placeholder="Ask Athena to analyze trends, draft content, or audit SEO..." 
                                    className="w-full py-2 bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400 font-medium text-sm"
                                />
                            </form>
                            <button 
                                disabled={!commandInput.trim() || isProcessing}
                                className="bg-brand-600 text-white p-2 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                            >
                                <svg className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {isProcessing ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    {/* AI Response Pop-over */}
                    {aiResponse && (
                        <div className="absolute top-full left-0 right-0 mt-3 mx-auto max-w-3xl bg-white border border-brand-100 rounded-2xl shadow-2xl p-6 z-40 animate-slide-in origin-top">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-2 text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
                                    <SparkIcon />
                                    <span className="font-bold text-[10px] uppercase tracking-widest">Analysis Result</span>
                                </div>
                                <button onClick={() => setAiResponse(null)} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="prose prose-sm prose-slate max-w-none text-slate-700 leading-relaxed text-sm">
                                {aiResponse}
                            </div>
                        </div>
                    )}
                </div>

                {/* --- Stats Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    <StatCard 
                        label="Active Campaigns" 
                        value={campaigns.filter(c => c.campaign_status === 'active').length}
                        trend="0%" 
                        trendUp={true}
                        colorClass="bg-brand-500"
                        icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>}
                    />
                    <StatCard 
                        label="Pending Tasks" 
                        value={tasks.filter(t => t.status !== 'completed').length}
                        trend="0%" 
                        trendUp={false}
                        colorClass="bg-amber-500"
                        icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
                    />
                    <StatCard 
                        label="Real-time Traffic" 
                        value={chartData.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()} 
                        trend="Live" 
                        trendUp={true}
                        colorClass="bg-emerald-500"
                        icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                    />
                    <StatCard 
                        label="Conversion Rate" 
                        value="0.0%" 
                        trend="0%" 
                        trendUp={true}
                        colorClass="bg-blue-500"
                        icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                </div>

                {/* --- Main Content Grid --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                    
                    {/* Left: Analytics */}
                    <div className="lg:col-span-2 space-y-6 w-full">
                        <GlassCard title="Performance Trends" subtitle="Traffic (Last 30 Days)" className="w-full h-[320px]">
                            <div className="h-full w-full pt-2">
                                {trafficData.length > 0 ? (
                                    <LineChart data={chartData} color="text-brand-600" />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                                        No traffic data recorded.
                                    </div>
                                )}
                            </div>
                        </GlassCard>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            <GlassCard title="Content Velocity" subtitle="Assets Produced vs Target" className="w-full h-[260px]">
                                <div className="h-full flex items-center justify-center">
                                    <DonutChart value={tasks.filter(t => t.status === 'completed').length > 0 ? 75 : 0} color="text-violet-600" label="On Target" size={120} />
                                </div>
                            </GlassCard>
                            <GlassCard title="Resource Allocation" subtitle="Active Tasks by Department" className="w-full h-[260px]">
                                <div className="h-full flex items-end justify-between px-4 pb-2 space-x-3">
                                    {['SEO', 'Content', 'Dev', 'SMM'].map((dept, i) => (
                                        <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                                            <div className="w-full bg-slate-100 rounded-t-md relative h-[85%] flex items-end overflow-hidden">
                                                <div 
                                                    className="w-full bg-brand-500 opacity-80 group-hover:opacity-100 rounded-t-md transition-all duration-700 ease-out" 
                                                    style={{ height: `${tasks.length > 0 ? 20 + i*10 : 0}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-500 mt-2 uppercase tracking-wide">{dept}</span>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>
                        </div>
                    </div>

                    {/* Right: Actions & Feed */}
                    <div className="space-y-6 w-full flex flex-col">
                        <GlassCard title="Quick Actions" className="w-full">
                            <div className="grid grid-cols-2 gap-3">
                                <QuickAction 
                                    label="New Campaign" 
                                    color="bg-brand-500"
                                    icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
                                    onClick={() => onNavigate && onNavigate('campaigns')}
                                />
                                <QuickAction 
                                    label="Draft Content" 
                                    color="bg-violet-500"
                                    icon={<SparkIcon />}
                                    onClick={() => onNavigate && onNavigate('content-repository')}
                                />
                                <QuickAction 
                                    label="Log Issue" 
                                    color="bg-rose-500"
                                    icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                                    onClick={() => onNavigate && onNavigate('on-page-errors')}
                                />
                                <QuickAction 
                                    label="View KPIs" 
                                    color="bg-emerald-500"
                                    icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                                    onClick={() => onNavigate && onNavigate('kpi-tracking')}
                                />
                            </div>
                        </GlassCard>

                        <GlassCard title="Live Activity" subtitle="Real-time system updates" className="w-full flex-1">
                            <ActivityFeed />
                        </GlassCard>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default DashboardView;