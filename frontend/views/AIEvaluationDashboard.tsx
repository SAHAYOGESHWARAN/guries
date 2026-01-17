import React, { useState, useEffect } from 'react';

const Brain = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const Zap = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const TrendingUp = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const AlertTriangle = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const Target = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" /></svg>;
const Play = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>;
const BarChart = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;

const AIEvaluationDashboard: React.FC = () => {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [filters, setFilters] = useState({ employeeId: 'all', teamId: 'all', timeRange: 'monthly' });

    useEffect(() => {
        fetchDashboardData();
    }, [filters]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`/api/v1/dashboards/ai-evaluation?${queryParams}`);
            const result = await response.json();
            if (result.success) setDashboardData(result.data);
        } catch (error) {
            console.error('Error fetching AI evaluation dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateNewEvaluation = async () => {
        try {
            setGenerating(true);
            const response = await fetch('/api/v1/dashboards/ai-evaluation/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scope: filters.employeeId === 'all' ? 'team' : 'individual', parameters: filters })
            });
            if (response.ok) {
                setTimeout(() => { fetchDashboardData(); setGenerating(false); }, 3000);
            }
        } catch (error) {
            console.error('Error generating evaluation:', error);
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-300">Analyzing performance data...</p>
                </div>
            </div>
        );
    }

    const { performanceScores } = dashboardData || {};

    return (
        <div className="h-full w-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
            {/* Header */}
            <div className="border-b border-slate-700 px-6 py-4 bg-slate-800/50 backdrop-blur">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">AI Evaluation Engine</h1>
                            <p className="text-sm text-slate-400">Intelligent performance analysis & insights</p>
                        </div>
                    </div>
                    <button onClick={generateNewEvaluation} disabled={generating} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all disabled:opacity-50 font-medium">
                        <Play className="w-4 h-4" />
                        {generating ? 'Analyzing...' : 'Run Analysis'}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select value={filters.employeeId} onChange={(e) => setFilters(prev => ({ ...prev, employeeId: e.target.value }))} className="px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                            <option value="all">All Employees</option>
                            <option value="1">Sarah Johnson</option>
                            <option value="2">Mike Chen</option>
                            <option value="3">Lisa Rodriguez</option>
                        </select>
                        <select value={filters.teamId} onChange={(e) => setFilters(prev => ({ ...prev, teamId: e.target.value }))} className="px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                            <option value="all">All Teams</option>
                            <option value="content">Content Team</option>
                            <option value="seo">SEO Team</option>
                            <option value="tech">Tech Team</option>
                        </select>
                        <select value={filters.timeRange} onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))} className="px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                        </select>
                    </div>

                    {/* Main Score Card */}
                    {performanceScores && (
                        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium mb-2">Overall Performance</p>
                                    <div className="flex items-end gap-3">
                                        <div className="text-6xl font-bold">{performanceScores.overall.grade}</div>
                                        <div className="text-3xl font-bold opacity-80">{performanceScores.overall.score}%</div>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-blue-100 text-sm font-medium mb-2">AI Confidence</p>
                                    <div className="text-4xl font-bold">{performanceScores.overall.confidence}%</div>
                                    <div className="flex items-center gap-2 mt-2 text-blue-100">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-sm">{performanceScores.overall.trend}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <p className="text-blue-100 text-sm font-medium mb-2">Status</p>
                                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-lg w-fit">
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                        <span className="font-medium">Active Analysis</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Team Performance Grid */}
                    {performanceScores?.individual && (
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <BarChart className="w-5 h-5 text-blue-400" />
                                Team Performance
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {performanceScores.individual.map((employee: any) => (
                                    <div key={employee.employeeId} className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-xl p-5 hover:border-blue-500 transition-colors">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-white font-semibold">{employee.name}</h3>
                                                <p className="text-slate-400 text-sm mt-1">Performance Score</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-bold text-blue-400">{employee.score}%</div>
                                                <div className={`text-xs font-medium px-2 py-1 rounded-full mt-1 ${employee.riskLevel === 'low' ? 'bg-emerald-500/20 text-emerald-300' : employee.riskLevel === 'medium' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'}`}>
                                                    {employee.riskLevel} risk
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden mb-3">
                                            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${employee.score}%` }}></div>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-400">Grade: <span className="text-white font-medium">{employee.grade}</span></span>
                                            <span className="text-slate-400">Confidence: <span className="text-white font-medium">{employee.confidence}%</span></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-slate-400 text-sm font-medium">Avg Performance</p>
                                <Zap className="w-5 h-5 text-yellow-400" />
                            </div>
                            <p className="text-3xl font-bold text-white">82%</p>
                            <p className="text-xs text-emerald-400 mt-2">↑ 5% from last period</p>
                        </div>
                        <div className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-slate-400 text-sm font-medium">Risk Alerts</p>
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                            </div>
                            <p className="text-3xl font-bold text-white">3</p>
                            <p className="text-xs text-slate-400 mt-2">Requires attention</p>
                        </div>
                        <div className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-slate-400 text-sm font-medium">Opportunities</p>
                                <Target className="w-5 h-5 text-blue-400" />
                            </div>
                            <p className="text-3xl font-bold text-white">7</p>
                            <p className="text-xs text-slate-400 mt-2">Growth potential</p>
                        </div>
                        <div className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-slate-400 text-sm font-medium">Data Points</p>
                                <Brain className="w-5 h-5 text-purple-400" />
                            </div>
                            <p className="text-3xl font-bold text-white">2.4K</p>
                            <p className="text-xs text-slate-400 mt-2">Analyzed</p>
                        </div>
                    </div>

                    {/* Insights Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                Critical Risks
                            </h3>
                            <div className="space-y-3">
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                    <p className="text-white font-medium text-sm">High Workload Detected</p>
                                    <p className="text-slate-300 text-xs mt-2">Team member exceeding capacity by 25%</p>
                                </div>
                                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                                    <p className="text-white font-medium text-sm">Performance Decline</p>
                                    <p className="text-slate-300 text-xs mt-2">15% drop in productivity metrics</p>
                                </div>
                                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                                    <p className="text-white font-medium text-sm">Skill Gap Identified</p>
                                    <p className="text-slate-300 text-xs mt-2">Training needed in advanced analytics</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-emerald-400" />
                                Growth Opportunities
                            </h3>
                            <div className="space-y-3">
                                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                                    <p className="text-white font-medium text-sm">Promotion Ready</p>
                                    <p className="text-slate-300 text-xs mt-2">Sarah Johnson meets all criteria for advancement</p>
                                </div>
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                    <p className="text-white font-medium text-sm">Cross-Training Potential</p>
                                    <p className="text-slate-300 text-xs mt-2">3 team members ready for new skills</p>
                                </div>
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                    <p className="text-white font-medium text-sm">Efficiency Gains</p>
                                    <p className="text-slate-300 text-xs mt-2">Process optimization can save 8 hours/week</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 backdrop-blur border border-slate-600 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-400" />
                            AI Recommendations
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                                <p className="text-white font-medium text-sm mb-2">Immediate Actions</p>
                                <ul className="space-y-2 text-sm text-slate-300">
                                    <li className="flex items-start gap-2"><span className="text-blue-400 mt-1">→</span><span>Redistribute workload to balance team capacity</span></li>
                                    <li className="flex items-start gap-2"><span className="text-blue-400 mt-1">→</span><span>Schedule one-on-one performance reviews</span></li>
                                </ul>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                                <p className="text-white font-medium text-sm mb-2">Strategic Initiatives</p>
                                <ul className="space-y-2 text-sm text-slate-300">
                                    <li className="flex items-start gap-2"><span className="text-emerald-400 mt-1">→</span><span>Implement mentorship program for junior staff</span></li>
                                    <li className="flex items-start gap-2"><span className="text-emerald-400 mt-1">→</span><span>Invest in advanced training modules</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-slate-400 text-sm py-4">
                        <p>Last analysis: {new Date().toLocaleString()} • Next scheduled: Tomorrow at 9:00 AM</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIEvaluationDashboard;
