import React, { useState, useEffect } from 'react';

// Custom icon components to replace lucide-react
const Brain = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const Database = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>;
const TrendingUp = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const AlertTriangle = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const Target = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" /></svg>;
const Lightbulb = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const RefreshCw = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const Play = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-9V3a1 1 0 011-1h2a1 1 0 011 1v2M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
const History = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

interface AIEvaluationDashboardProps {
    onNavigate?: (view: string, id?: string) => void;
}

const AIEvaluationDashboard: React.FC<AIEvaluationDashboardProps> = ({ onNavigate: _ }) => {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [filters, setFilters] = useState({
        employeeId: 'all',
        teamId: 'all',
        timeRange: 'monthly'
    });

    useEffect(() => {
        fetchDashboardData();
    }, [filters]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`/api/v1/dashboards/ai-evaluation?${queryParams}`);
            const result = await response.json();
            if (result.success) {
                setDashboardData(result.data);
            }
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
                body: JSON.stringify({
                    scope: filters.employeeId === 'all' ? 'team' : 'individual',
                    parameters: filters
                })
            });
            if (response.ok) {
                // Refresh data after generation
                setTimeout(() => {
                    fetchDashboardData();
                    setGenerating(false);
                }, 3000);
            }
        } catch (error) {
            console.error('Error generating evaluation:', error);
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const { inputSources, performanceScores, riskFactors, improvementOpportunities, targetSuggestions, workloadRebalancing, aiReasoning } = dashboardData || {};

    const getDataQualityColor = (quality: number) => {
        if (quality >= 95) return 'text-emerald-600 bg-emerald-100';
        if (quality >= 85) return 'text-blue-600 bg-blue-100';
        if (quality >= 75) return 'text-amber-600 bg-amber-100';
        return 'text-red-600 bg-red-100';
    };

    const getGradeColor = (grade: string) => {
        if (grade.startsWith('A')) return 'text-emerald-600 bg-emerald-100';
        if (grade.startsWith('B')) return 'text-blue-600 bg-blue-100';
        if (grade.startsWith('C')) return 'text-amber-600 bg-amber-100';
        return 'text-red-600 bg-red-100';
    };

    const getRiskColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'border-red-500 bg-red-50';
            case 'medium': return 'border-amber-500 bg-amber-50';
            case 'low': return 'border-blue-500 bg-blue-50';
            default: return 'border-slate-500 bg-slate-50';
        }
    };

    return (
        <div className="h-full w-full flex flex-col overflow-hidden bg-slate-50">
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-300">
                <div className="w-full space-y-6">

                    {/* Header & Controls */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                    🤖 AI Evaluation Engine
                                </h1>
                                <p className="text-sm text-slate-600 mt-1">Automated performance analysis and recommendations</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={generateNewEvaluation}
                                    disabled={generating}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {generating ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Play className="w-4 h-4" />
                                    )}
                                    {generating ? 'Generating...' : 'Generate New Evaluation'}
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors">
                                    <History className="w-4 h-4" />
                                    View History
                                </button>
                            </div>
                        </div>

                        {/* Filters Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <select
                                value={filters.employeeId}
                                onChange={(e) => setFilters(prev => ({ ...prev, employeeId: e.target.value }))}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Employees</option>
                                <option value="1">Sarah Johnson</option>
                                <option value="2">Mike Chen</option>
                                <option value="3">Lisa Rodriguez</option>
                                <option value="4">David Kim</option>
                            </select>

                            <select
                                value={filters.teamId}
                                onChange={(e) => setFilters(prev => ({ ...prev, teamId: e.target.value }))}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Teams</option>
                                <option value="content">Content Team</option>
                                <option value="seo">SEO Team</option>
                                <option value="tech">Tech Team</option>
                                <option value="marketing">Marketing Team</option>
                            </select>

                            <select
                                value={filters.timeRange}
                                onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                            </select>
                        </div>
                    </div>

                    {/* Input Data Sources */}
                    {inputSources && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Database className="w-5 h-5 text-blue-500" />
                                Input Data Sources
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(inputSources).map(([key, source]: [string, any]) => (
                                    <div key={key} className="border border-slate-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-slate-900 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${source.status === 'synced' ? 'bg-emerald-100 text-emerald-700' :
                                                source.status === 'active' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {source.status}
                                            </span>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Records:</span>
                                                <span className="font-medium text-slate-900">{source.recordCount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Quality:</span>
                                                <span className={`font-medium px-2 py-1 rounded-full text-xs ${getDataQualityColor(source.dataQuality)}`}>
                                                    {source.dataQuality}%
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                Last update: {new Date(source.lastUpdate).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI Performance Scores */}
                    {performanceScores && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Brain className="w-5 h-5 text-purple-500" />
                                AI Performance Scores
                            </h2>

                            {/* Overall Score */}
                            <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-6 text-white mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Overall Team Performance</h3>
                                        <div className="flex items-center gap-4">
                                            <div className="text-4xl font-bold">{performanceScores.overall.grade}</div>
                                            <div>
                                                <div className="text-2xl font-bold">{performanceScores.overall.score}%</div>
                                                <div className="text-purple-100 text-sm">
                                                    {performanceScores.overall.change} from last evaluation
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm mb-1">AI Confidence</div>
                                        <div className="text-2xl font-bold">{performanceScores.overall.confidence}%</div>
                                        <div className="flex items-center gap-1 mt-2">
                                            <TrendingUp className="w-4 h-4" />
                                            <span className="text-sm">{performanceScores.overall.trend}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Individual Scores */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                {performanceScores.individual.map((employee: any) => (
                                    <div key={employee.employeeId} className="border border-slate-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold text-slate-900">{employee.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getGradeColor(employee.grade)}`}>
                                                        {employee.grade}
                                                    </span>
                                                    <span className="text-lg font-bold text-slate-900">{employee.score}%</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-xs font-medium px-2 py-1 rounded-full ${employee.riskLevel === 'low' ? 'bg-emerald-100 text-emerald-700' :
                                                    employee.riskLevel === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {employee.riskLevel} risk
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    {employee.confidence}% confidence
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {employee.trend === 'up' ? (
                                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                                <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
                                            )}
                                            <span className="text-sm text-slate-600">{employee.trend} trend</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Team Scores */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {Object.entries(performanceScores.team).map(([teamName, team]: [string, any]) => (
                                    <div key={teamName} className="text-center p-4 bg-slate-50 rounded-lg">
                                        <h3 className="font-semibold text-slate-900 mb-2 capitalize">{teamName.replace(/([A-Z])/g, ' $1').trim()}</h3>
                                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${getGradeColor(team.grade)}`}>
                                            {team.grade}
                                        </div>
                                        <div className="text-xl font-bold text-slate-900">{team.score}%</div>
                                        <div className="text-xs text-slate-500 mt-1">{team.trend} trend</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Risk Factors & Improvement Opportunities */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Risk Factors */}
                        {riskFactors && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                    Risk Factors Analysis
                                </h2>
                                <div className="space-y-4">
                                    {riskFactors.map((risk: any) => (
                                        <div key={risk.id} className={`border-l-4 p-4 rounded-r-lg ${getRiskColor(risk.severity)}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-slate-900">{risk.risk}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${risk.severity === 'high' ? 'bg-red-100 text-red-700' :
                                                        risk.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {risk.severity}
                                                    </span>
                                                    <span className="text-sm font-medium text-slate-600">{risk.probability}%</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-700 mb-2">{risk.impact}</p>
                                            <div className="text-xs text-slate-600 mb-2">Timeline: {risk.timeline}</div>
                                            <div>
                                                <h4 className="text-xs font-semibold text-slate-700 mb-1">Recommendations:</h4>
                                                <ul className="text-xs text-slate-600 space-y-1">
                                                    {risk.recommendations.slice(0, 2).map((rec: string, index: number) => (
                                                        <li key={index} className="flex items-start gap-2">
                                                            <span className="text-blue-500 mt-1">•</span>
                                                            <span>{rec}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Improvement Opportunities */}
                        {improvementOpportunities && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-emerald-500" />
                                    Improvement Opportunities
                                </h2>
                                <div className="space-y-4">
                                    {improvementOpportunities.map((opportunity: any) => (
                                        <div key={opportunity.id} className="border border-slate-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-slate-900">{opportunity.area}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${opportunity.effort === 'Low' ? 'bg-emerald-100 text-emerald-700' :
                                                    opportunity.effort === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {opportunity.effort} Effort
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 mb-3">
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-slate-900">{opportunity.currentScore}%</div>
                                                    <div className="text-xs text-slate-600">Current</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-emerald-600">{opportunity.potentialScore}%</div>
                                                    <div className="text-xs text-slate-600">Potential</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-bold text-blue-600">+{opportunity.gap}%</div>
                                                    <div className="text-xs text-slate-600">Gap</div>
                                                </div>
                                            </div>

                                            <div className="text-sm text-slate-700 mb-2">{opportunity.expectedImpact}</div>
                                            <div className="text-xs text-slate-500">Timeline: {opportunity.timeline}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Target Suggestions & Workload Rebalancing */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Target Suggestions */}
                        {targetSuggestions && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-blue-500" />
                                    AI Target Suggestions
                                </h2>
                                <div className="space-y-4">
                                    {targetSuggestions.map((suggestion: any, index: number) => (
                                        <div key={index} className="border border-slate-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-slate-900">{suggestion.employee}</h3>
                                                <div className="text-right">
                                                    <div className="text-xs text-slate-600">Confidence</div>
                                                    <div className="text-sm font-bold text-slate-900">{suggestion.confidence}%</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <div className="text-xs text-slate-600 mb-1">Current Target</div>
                                                    <div className="text-sm font-medium text-slate-900">{suggestion.currentTarget}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-600 mb-1">Suggested Target</div>
                                                    <div className="text-sm font-medium text-emerald-600">{suggestion.suggestedTarget}</div>
                                                </div>
                                            </div>

                                            <p className="text-sm text-slate-700 mb-2">{suggestion.reasoning}</p>
                                            <div className={`text-xs font-medium px-2 py-1 rounded-full w-fit ${suggestion.riskLevel === 'low' ? 'bg-emerald-100 text-emerald-700' :
                                                suggestion.riskLevel === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {suggestion.riskLevel} risk
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Workload Rebalancing */}
                        {workloadRebalancing && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                                    Workload Rebalancing
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-red-700 mb-2">Immediate Actions</h3>
                                        {workloadRebalancing.immediate.map((action: any, index: number) => (
                                            <div key={index} className="border border-red-200 bg-red-50 rounded-lg p-3 mb-2">
                                                <div className="font-medium text-slate-900 text-sm">{action.action}</div>
                                                <div className="text-sm text-slate-600 mt-1">{action.impact}</div>
                                                <div className="text-xs text-slate-500 mt-1">Timeline: {action.timeline}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-amber-700 mb-2">Short Term (2-4 weeks)</h3>
                                        {workloadRebalancing.shortTerm.map((action: any, index: number) => (
                                            <div key={index} className="border border-amber-200 bg-amber-50 rounded-lg p-3 mb-2">
                                                <div className="font-medium text-slate-900 text-sm">{action.action}</div>
                                                <div className="text-sm text-slate-600 mt-1">{action.impact}</div>
                                                <div className="text-xs text-slate-500 mt-1">Timeline: {action.timeline}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-blue-700 mb-2">Long Term (2-3 months)</h3>
                                        {workloadRebalancing.longTerm.map((action: any, index: number) => (
                                            <div key={index} className="border border-blue-200 bg-blue-50 rounded-lg p-3 mb-2">
                                                <div className="font-medium text-slate-900 text-sm">{action.action}</div>
                                                <div className="text-sm text-slate-600 mt-1">{action.impact}</div>
                                                <div className="text-xs text-slate-500 mt-1">Timeline: {action.timeline}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* AI Reasoning Box */}
                    {aiReasoning && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Brain className="w-5 h-5 text-purple-500" />
                                AI Reasoning & Methodology
                            </h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                                        <h3 className="font-semibold text-purple-900 mb-2">Methodology</h3>
                                        <p className="text-sm text-purple-800">{aiReasoning.methodology}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                                            <div className="text-lg font-bold text-slate-900">{aiReasoning.dataPoints.toLocaleString()}</div>
                                            <div className="text-xs text-slate-600">Data Points</div>
                                        </div>
                                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                                            <div className="text-lg font-bold text-slate-900">{aiReasoning.confidence}%</div>
                                            <div className="text-xs text-slate-600">Confidence</div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-4">
                                        <h3 className="font-semibold text-slate-900 mb-2">Key Insights</h3>
                                        <ul className="space-y-2">
                                            {aiReasoning.keyInsights.map((insight: string, index: number) => (
                                                <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                                                    <span className="text-blue-500 mt-1">•</span>
                                                    <span>{insight}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-slate-900 mb-2">Recommendations</h3>
                                        <ul className="space-y-2">
                                            {aiReasoning.recommendations.map((rec: string, index: number) => (
                                                <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                                                    <span className="text-emerald-500 mt-1">•</span>
                                                    <span>{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-200 text-center">
                                <div className="text-sm text-slate-600">
                                    Next evaluation scheduled for: {new Date(aiReasoning.nextEvaluation).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIEvaluationDashboard;