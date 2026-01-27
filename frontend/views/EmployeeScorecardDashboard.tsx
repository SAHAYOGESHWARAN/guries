import React, { useState, useEffect } from 'react';

// Custom icon components to replace lucide-react
const User = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const Award = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>;
const TrendingUp = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const TrendingDown = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>;
const Calendar = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const Clock = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CheckCircle = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const AlertCircle = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const Star = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
const Target = ({ className = "w-5 h-5" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" /></svg>;

interface EmployeeScorecardDashboardProps {
    onNavigate?: (view: string, id?: string) => void;
}

const EmployeeScorecardDashboard: React.FC<EmployeeScorecardDashboardProps> = ({ onNavigate }) => {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [employeeList, setEmployeeList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState('1');
    const [selectedPeriod, setSelectedPeriod] = useState('December 2024');

    useEffect(() => {
        fetchEmployeeList();
    }, []);

    useEffect(() => {
        if (selectedEmployee) {
            fetchEmployeeScorecard();
        }
    }, [selectedEmployee, selectedPeriod]);

    const fetchEmployeeList = async () => {
        try {
            const response = await fetch('/api/v1/dashboards/employees');
            const result = await response.json();
            if (result.success) {
                setEmployeeList(result.data);
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Error fetching employee list:', error);
            }
        }
    };

    const fetchEmployeeScorecard = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/v1/dashboards/employee-scorecard?employeeId=${selectedEmployee}&month=${selectedPeriod}`);
            const result = await response.json();
            if (result.success) {
                setDashboardData(result.data);
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Error fetching employee scorecard:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const { employeeInfo, summaryScores, kpiContributions, contributionChart, qcHistory, attendanceMetrics, aiFeedback, performanceTrends } = dashboardData || {};

    return (
        <div className="h-full w-full flex flex-col overflow-hidden bg-slate-50">
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
                <div className="w-full">

                    {/* Left Sidebar - Employee Selection */}
                    <div className="flex">
                        <div className="w-80 bg-white border-r border-slate-200 h-screen overflow-y-auto">
                            <div className="p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">👤 Employee Scorecard</h2>

                                {/* Employee Info */}
                                {employeeInfo && (
                                    <div className="bg-slate-50 rounded-lg p-4 mb-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                {employeeInfo.name.split(' ').map((n: string) => n[0]).join('')}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900">{employeeInfo.name}</h3>
                                                <p className="text-sm text-slate-600">{employeeInfo.role}</p>
                                                <p className="text-xs text-slate-500">{employeeInfo.department}</p>
                                            </div>
                                        </div>

                                        {/* Period Selector */}
                                        <select
                                            value={selectedPeriod}
                                            onChange={(e) => setSelectedPeriod(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="December 2024">December 2024</option>
                                            <option value="November 2024">November 2024</option>
                                            <option value="October 2024">October 2024</option>
                                            <option value="Q4 2024">Q4 2024</option>
                                        </select>
                                    </div>
                                )}

                                {/* Employee List */}
                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">All Employees</h3>
                                    {employeeList.map((employee) => (
                                        <button
                                            key={employee.id}
                                            onClick={() => setSelectedEmployee(employee.id.toString())}
                                            className={`w-full text-left p-3 rounded-lg transition-colors ${selectedEmployee === employee.id.toString()
                                                ? 'bg-blue-100 border border-blue-200'
                                                : 'hover:bg-slate-100'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium text-slate-900 text-sm">{employee.name}</div>
                                                    <div className="text-xs text-slate-600">{employee.role}</div>
                                                    <div className="text-xs text-slate-500">{employee.department}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-semibold text-slate-900">{employee.compositeScore}%</div>
                                                    <div className="text-xs text-slate-500">Score</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 p-6 space-y-6">

                            {/* Summary Score Section */}
                            {summaryScores && (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                    <h2 className="text-lg font-bold text-slate-900 mb-4">Summary Score</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                <div className="text-3xl font-bold text-blue-600">{summaryScores.effortScore.value}%</div>
                                                <div className={`flex items-center gap-1 text-xs font-medium ${summaryScores.effortScore.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    <TrendingUp className={`w-3 h-3 ${summaryScores.effortScore.trend === 'down' ? 'rotate-180' : ''}`} />
                                                    {summaryScores.effortScore.change}
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-slate-700">Effort Score</div>
                                            <div className="text-xs text-slate-500 mt-1">Target: {summaryScores.effortScore.target}%</div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                Updated: {new Date(summaryScores.effortScore.lastUpdated).toLocaleTimeString()}
                                            </div>
                                        </div>
                                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                <div className="text-3xl font-bold text-purple-600">{summaryScores.performanceScore.value}%</div>
                                                <div className={`flex items-center gap-1 text-xs font-medium ${summaryScores.performanceScore.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    <TrendingUp className={`w-3 h-3 ${summaryScores.performanceScore.trend === 'down' ? 'rotate-180' : ''}`} />
                                                    {summaryScores.performanceScore.change}
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-slate-700">Performance Score</div>
                                            <div className="text-xs text-slate-500 mt-1">Target: {summaryScores.performanceScore.target}%</div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                Updated: {new Date(summaryScores.performanceScore.lastUpdated).toLocaleTimeString()}
                                            </div>
                                        </div>
                                        <div className="text-center p-4 bg-emerald-50 rounded-lg">
                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                <div className="text-3xl font-bold text-emerald-600">{summaryScores.qcScore.value}%</div>
                                                <div className={`flex items-center gap-1 text-xs font-medium ${summaryScores.qcScore.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    <TrendingUp className={`w-3 h-3 ${summaryScores.qcScore.trend === 'down' ? 'rotate-180' : ''}`} />
                                                    {summaryScores.qcScore.change}
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-slate-700">QC Score</div>
                                            <div className="text-xs text-slate-500 mt-1">Target: {summaryScores.qcScore.target}%</div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                Updated: {new Date(summaryScores.qcScore.lastUpdated).toLocaleTimeString()}
                                            </div>
                                        </div>
                                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                <div className="text-3xl font-bold text-orange-600">{summaryScores.punctualityScore.value}%</div>
                                                <div className={`flex items-center gap-1 text-xs font-medium ${summaryScores.punctualityScore.trend === 'up' ? 'text-emerald-600' : summaryScores.punctualityScore.trend === 'stable' ? 'text-blue-600' : 'text-red-600'}`}>
                                                    <TrendingUp className={`w-3 h-3 ${summaryScores.punctualityScore.trend === 'down' ? 'rotate-180' : summaryScores.punctualityScore.trend === 'stable' ? 'rotate-90' : ''}`} />
                                                    {summaryScores.punctualityScore.change}
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-slate-700">Punctuality Score</div>
                                            <div className="text-xs text-slate-500 mt-1">Target: {summaryScores.punctualityScore.target}%</div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                Updated: {new Date(summaryScores.punctualityScore.lastUpdated).toLocaleTimeString()}
                                            </div>
                                        </div>
                                        <div className="text-center border-l border-slate-200 pl-4 p-4 bg-slate-50 rounded-lg">
                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                <div className="text-3xl font-bold text-slate-900">{summaryScores.compositeScore.value}%</div>
                                                <div className={`flex items-center gap-1 text-xs font-medium ${summaryScores.compositeScore.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    <TrendingUp className={`w-3 h-3 ${summaryScores.compositeScore.trend === 'down' ? 'rotate-180' : ''}`} />
                                                    {summaryScores.compositeScore.change}
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-slate-700">Composite Score</div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                Rank #{summaryScores.compositeScore.ranking} of {summaryScores.compositeScore.totalEmployees}
                                            </div>
                                            <div className="text-xs text-emerald-600 font-medium mt-1">
                                                {summaryScores.compositeScore.monthlyGrowth} monthly growth
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                Updated: {new Date(summaryScores.compositeScore.lastUpdated).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* KPI Contribution Section */}
                            {kpiContributions && (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                    <h2 className="text-lg font-bold text-slate-900 mb-4">KPI Contribution</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                <div className="text-2xl font-bold text-blue-600">{kpiContributions.keywordsImproved.value}</div>
                                                <div className={`flex items-center gap-1 text-xs font-medium ${kpiContributions.keywordsImproved.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    <TrendingUp className={`w-3 h-3 ${kpiContributions.keywordsImproved.trend === 'down' ? 'rotate-180' : ''}`} />
                                                    {kpiContributions.keywordsImproved.change}
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-slate-700">Keywords Improved</div>
                                            <div className="text-xs text-slate-500 mt-1">Target: {kpiContributions.keywordsImproved.target}</div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                Updated: {new Date(kpiContributions.keywordsImproved.lastUpdated).toLocaleTimeString()}
                                            </div>
                                        </div>
                                        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                <div className="text-2xl font-bold text-purple-600">{kpiContributions.contentPublished.value}</div>
                                                <div className={`flex items-center gap-1 text-xs font-medium ${kpiContributions.contentPublished.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    <TrendingUp className={`w-3 h-3 ${kpiContributions.contentPublished.trend === 'down' ? 'rotate-180' : ''}`} />
                                                    {kpiContributions.contentPublished.change}
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-slate-700">Content Published</div>
                                            <div className="text-xs text-slate-500 mt-1">Target: {kpiContributions.contentPublished.target}</div>
                                            <div className="text-xs text-slate-500 mt-1">{kpiContributions.contentPublished.wordCount.toLocaleString()} words</div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                Updated: {new Date(kpiContributions.contentPublished.lastUpdated).toLocaleTimeString()}
                                            </div>
                                        </div>
                                        <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                                            <div className="text-2xl font-bold text-slate-600 mb-1">{kpiContributions.backlinksBuilt.value}</div>
                                            <div className="text-sm font-medium text-slate-700">Backlinks Built</div>
                                            <div className="text-xs text-slate-500 mt-1">{kpiContributions.backlinksBuilt.note}</div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                Updated: {new Date(kpiContributions.backlinksBuilt.lastUpdated).toLocaleTimeString()}
                                            </div>
                                        </div>
                                        <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                <div className="text-2xl font-bold text-orange-600">{kpiContributions.errorsFixed.value}</div>
                                                <div className={`flex items-center gap-1 text-xs font-medium ${kpiContributions.errorsFixed.trend === 'down' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    <TrendingUp className={`w-3 h-3 ${kpiContributions.errorsFixed.trend === 'down' ? 'rotate-180' : ''}`} />
                                                    {kpiContributions.errorsFixed.change}
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-slate-700">Errors Fixed</div>
                                            <div className="text-xs text-slate-500 mt-1">Target: {kpiContributions.errorsFixed.target}</div>
                                            <div className="text-xs text-emerald-600 mt-1">{kpiContributions.errorsFixed.note}</div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                Updated: {new Date(kpiContributions.errorsFixed.lastUpdated).toLocaleTimeString()}
                                            </div>
                                        </div>
                                        <div className="text-center p-4 bg-rose-50 rounded-lg border border-rose-200">
                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                <div className="text-2xl font-bold text-rose-600">{kpiContributions.engagementMetricsImproved.value}</div>
                                                <div className={`flex items-center gap-1 text-xs font-medium ${kpiContributions.engagementMetricsImproved.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    <TrendingUp className={`w-3 h-3 ${kpiContributions.engagementMetricsImproved.trend === 'down' ? 'rotate-180' : ''}`} />
                                                    {kpiContributions.engagementMetricsImproved.change}
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-slate-700">Engagement Improved</div>
                                            <div className="text-xs text-slate-500 mt-1">Target: {kpiContributions.engagementMetricsImproved.target}</div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                Updated: {new Date(kpiContributions.engagementMetricsImproved.lastUpdated).toLocaleTimeString()}
                                            </div>
                                        </div>
                                        <div className="text-center p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                <div className="text-2xl font-bold text-cyan-600">{kpiContributions.smmPostsCreated.value}</div>
                                                <div className={`flex items-center gap-1 text-xs font-medium ${kpiContributions.smmPostsCreated.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    <TrendingUp className={`w-3 h-3 ${kpiContributions.smmPostsCreated.trend === 'down' ? 'rotate-180' : ''}`} />
                                                    {kpiContributions.smmPostsCreated.change}
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-slate-700">SMM Posts Created</div>
                                            <div className="text-xs text-slate-500 mt-1">Target: {kpiContributions.smmPostsCreated.target}</div>
                                            <div className="text-xs text-slate-500 mt-1">Engagement: {kpiContributions.smmPostsCreated.engagementRate}%</div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                Updated: {new Date(kpiContributions.smmPostsCreated.lastUpdated).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Contribution Summary */}
                                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white mb-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold mb-1">Total KPI Contribution</h3>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-3xl font-bold">{kpiContributions.totalContribution.value}</div>
                                                    <div className="flex items-center gap-1 text-sm font-medium">
                                                        <TrendingUp className="w-4 h-4" />
                                                        {kpiContributions.totalContribution.change}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm mb-1">Efficiency Score</div>
                                                <div className="text-2xl font-bold">{kpiContributions.totalContribution.efficiency}%</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contribution Chart Placeholder */}
                                    <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                                        <span className="text-slate-500 text-sm">Contribution Chart (This Month vs Target vs Previous Month)</span>
                                    </div>
                                </div>
                            )}

                            {/* QC History & Attendance */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                {/* QC History */}
                                {qcHistory && (
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                        <h2 className="text-lg font-bold text-slate-900 mb-4">QC Performance History</h2>
                                        <div className="space-y-3 max-h-80 overflow-y-auto">
                                            {qcHistory.map((qc: any) => (
                                                <div key={qc.id} className="border border-slate-200 rounded-lg p-3">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-medium text-slate-900 text-sm">{qc.taskName}</h3>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${qc.status === 'passed' ? 'bg-emerald-100 text-emerald-700' :
                                                            'bg-red-100 text-red-700'
                                                            }`}>
                                                            {qc.status === 'passed' ? 'Passed' : 'Rework'}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-4 gap-2 mb-2">
                                                        <div className="text-center">
                                                            <div className="text-sm font-semibold text-slate-900">{qc.stage1Score}%</div>
                                                            <div className="text-xs text-slate-500">Stage 1</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-sm font-semibold text-slate-900">{qc.stage2Score}%</div>
                                                            <div className="text-xs text-slate-500">Stage 2</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-sm font-semibold text-slate-900">{qc.stage3Score}%</div>
                                                            <div className="text-xs text-slate-500">Stage 3</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-sm font-bold text-blue-600">{qc.finalScore}%</div>
                                                            <div className="text-xs text-slate-500">Final</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-slate-600">{qc.feedback}</div>
                                                    <div className="text-xs text-slate-400 mt-1">{qc.submissionDate}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Attendance & Discipline Metrics */}
                                {attendanceMetrics && (
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                        <h2 className="text-lg font-bold text-slate-900 mb-4">Attendance & Discipline</h2>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="text-center p-3 bg-slate-50 rounded-lg">
                                                    <div className="text-xl font-bold text-slate-900 mb-1">{attendanceMetrics.taskDelays}</div>
                                                    <div className="text-sm font-medium text-slate-700">Task Delays</div>
                                                </div>
                                                <div className="text-center p-3 bg-slate-50 rounded-lg">
                                                    <div className="text-xl font-bold text-slate-900 mb-1">{attendanceMetrics.reworkCount}</div>
                                                    <div className="text-sm font-medium text-slate-700">Rework Count</div>
                                                </div>
                                            </div>

                                            <div className="border border-slate-200 rounded-lg p-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium text-slate-700">SLA Compliance</span>
                                                    <span className="text-lg font-bold text-emerald-600">{attendanceMetrics.slaCompliance}%</span>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-2">
                                                    <div
                                                        className="bg-emerald-500 h-2 rounded-full"
                                                        style={{ width: `${attendanceMetrics.slaCompliance}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-slate-600">On-time Delivery:</span>
                                                    <span className="font-semibold text-slate-900 ml-2">{attendanceMetrics.onTimeDelivery}/28</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-600">Avg Delivery:</span>
                                                    <span className="font-semibold text-slate-900 ml-2">{attendanceMetrics.averageDeliveryTime}</span>
                                                </div>
                                            </div>

                                            <div className="text-center p-3 bg-emerald-50 rounded-lg">
                                                <div className="text-sm font-semibold text-emerald-700">Punctuality Rating</div>
                                                <div className="text-lg font-bold text-emerald-600">{attendanceMetrics.punctualityRating}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* AI Feedback Section */}
                            {aiFeedback && (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Star className="w-5 h-5 text-yellow-500" />
                                        AI Feedback & Recommendations
                                    </h2>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                        <p className="text-sm text-slate-700 leading-relaxed">{aiFeedback.summary}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <h3 className="font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" />
                                                Strengths
                                            </h3>
                                            <ul className="space-y-2">
                                                {aiFeedback.strengths.map((strength: string, index: number) => (
                                                    <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                                                        <span className="text-emerald-500 mt-1">•</span>
                                                        <span>{strength}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-amber-700 mb-3 flex items-center gap-2">
                                                <Target className="w-4 h-4" />
                                                Areas for Improvement
                                            </h3>
                                            <ul className="space-y-2">
                                                {aiFeedback.improvements.map((improvement: string, index: number) => (
                                                    <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                                                        <span className="text-amber-500 mt-1">•</span>
                                                        <span>{improvement}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                                                <Award className="w-4 h-4" />
                                                Recommendations
                                            </h3>
                                            <ul className="space-y-2">
                                                {aiFeedback.recommendations.map((recommendation: string, index: number) => (
                                                    <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                                                        <span className="text-blue-500 mt-1">•</span>
                                                        <span>{recommendation}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                                        <h4 className="font-semibold text-slate-900 mb-2">Next Cycle Target</h4>
                                        <p className="text-sm text-slate-700">{aiFeedback.nextCycleTarget}</p>
                                    </div>
                                </div>
                            )}

                            {/* Performance Trends Chart Placeholder */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Performance Trends (Last 6 Months)</h2>
                                <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                                    <span className="text-slate-500 text-sm">Performance Trends Chart (Composite, QC, Effort Scores)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeScorecardDashboard;