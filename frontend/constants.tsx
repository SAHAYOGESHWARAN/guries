
import React from 'react';

// Sidebar Navigation Types
export interface NavItem {
    id: string;
    name: string;
    icon: React.ReactNode;
}

export interface NavSection {
    title: string;
    items?: NavItem[];
    item?: NavItem;
}

// --- Icon Components ---
export const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10 0h3a1 1 0 001-1V10l-2-2m0 0l-7-7-7 7" /></svg>;
export const ProjectIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;
export const CampaignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
export const TaskIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
export const AssetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
export const RepoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
export const ServiceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
export const SmmIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>;
export const ErrorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
export const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
export const ConfigIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
export const MasterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
export const KeywordIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>;
export const AnalyticsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
export const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>;
export const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
export const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
export const SparkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 2.043A1 1 0 0112 3v5.429l3.243-2.432a1 1 0 011.514 1.299l-2.432 3.243H20a1 1 0 011 1v2a1 1 0 01-1 1h-5.429l2.432 3.243a1 1 0 01-1.514 1.299L12 14.571V20a1 1 0 01-1.7.707l-8-8a1 1 0 010-1.414l8-8A1 1 0 0111.3 2.043z" clipRule="evenodd" /></svg>;
export const GoogleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.8c3.86 0 6.64 1.63 8.16 3.03l6.09-6.09C34.64 2.84 29.83 0 24 0 14.4 0 6.48 5.49 2.64 13.31l7.38 5.75C11.96 13.31 17.48 9.8 24 9.8z" /><path fill="#34A853" d="M46.36 24.51c0-1.63-.15-3.2-.42-4.69H24v8.88h12.56c-.54 2.84-2.14 5.25-4.6 6.94l7.15 5.56C42.94 38.3 46.36 32.07 46.36 24.51z" /><path fill="#FBBC05" d="M10.02 28.56c-.49-1.48-.77-3.05-.77-4.69s.28-3.2.77-4.69l-7.38-5.75C1.09 16.51 0 20.08 0 23.87s1.09 7.36 2.64 10.43l7.38-5.74z" /><path fill="#EA4335" d="M24 48c5.83 0 10.64-1.93 14.16-5.22l-7.15-5.56c-1.93 1.29-4.38 2.07-7.01 2.07-6.52 0-12.04-4.42-13.98-10.37L2.64 34.16C6.48 42.51 14.4 48 24 48z" /><path fill="none" d="M0 0h48v48H0z" /></svg>;
export const SemrushIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.2 15.6c-.44 0-.8-.36-.8-.8V7.2c0-.44.36-.8.8-.8s.8.36.8.8v9.6c0 .44-.36.8-.8.8zm4.4 0c-.44 0-.8-.36-.8-.8V7.2c0-.44.36-.8.8-.8s.8.36.8.8v9.6c0 .44-.36.8-.8.8z" /></svg>;
export const AhrefsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-teal-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>;
export const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
export const ContentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
export const ApiIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
export const DesignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
export const CodeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;

// --- Navigation Structure ---
export const NAV_ITEMS: NavSection[] = [
    {
        title: 'MAIN',
        items: [
            { id: 'dashboard', name: 'Dashboard', icon: <HomeIcon /> },
            { id: 'projects', name: 'Projects', icon: <ProjectIcon /> },
            { id: 'campaigns', name: 'Campaigns', icon: <CampaignIcon /> },
            { id: 'tasks', name: 'Tasks', icon: <TaskIcon /> },
            { id: 'assets', name: 'Assets', icon: <AssetIcon /> },
            { id: 'asset-qc', name: 'Asset QC Review', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
        ]
    },
    {
        title: 'REPOSITORIES',
        items: [
            { id: 'content-repository', name: 'Content Repository', icon: <ContentIcon /> },
            { id: 'service-pages', name: 'Service Pages', icon: <ServiceIcon /> },
            { id: 'smm-posting', name: 'SMM Posting', icon: <SmmIcon /> },
            { id: 'graphics-plan', name: 'Graphics Plan', icon: <DesignIcon /> },
            { id: 'on-page-errors', name: 'On-Page Errors', icon: <ErrorIcon /> },
            { id: 'backlink-submission', name: 'Backlink Submission', icon: <LinkIcon /> },
            { id: 'toxic-backlinks', name: 'Toxic Backlinks', icon: <ErrorIcon /> },
            { id: 'ux-issues', name: 'UX Issues', icon: <ErrorIcon /> },
            { id: 'promotion-repository', name: 'Promotion Repository', icon: <RepoIcon /> },
            { id: 'competitor-repository', name: 'Competitor Repository', icon: <RepoIcon /> },
            { id: 'competitor-backlinks', name: 'Competitor Backlinks', icon: <LinkIcon /> },
        ]
    },
    {
        title: 'CONFIGURATION',
        items: [
            // Admin Console is the main entry point for admin functions including Role & Permission Matrix
            { id: 'admin-console', name: 'Admin Console', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
            // Removed: Admin Console Config, Role & Permission Matrix, Admin QC Asset Review from Configuration
            // These are now accessed through Admin Console only
            { id: 'integrations', name: 'Integrations', icon: <ApiIcon /> },
            { id: 'performance-benchmark', name: 'Performance & Benchmark', icon: <AnalyticsIcon /> },
            { id: 'competitor-benchmark-master', name: 'Competitor Benchmark Master', icon: <MasterIcon /> },
            { id: 'gold-standard-benchmark', name: 'Gold Standard Benchmark', icon: <MasterIcon /> },
            { id: 'effort-target-config', name: 'Effort Target Configuration', icon: <ConfigIcon /> },
            { id: 'service-sub-service-master', name: 'Service & Sub-Service Master', icon: <MasterIcon /> },
            { id: 'sub-service-master', name: 'Sub-Service Master', icon: <MasterIcon /> },
            { id: 'keyword-master', name: 'Keyword Master', icon: <KeywordIcon /> },
            { id: 'backlink-master', name: 'Backlink Master', icon: <LinkIcon /> },
            { id: 'backlink-source-master', name: 'Backlink Source Master', icon: <LinkIcon /> },
            { id: 'industry-sector-master', name: 'Industry / Sector Master', icon: <MasterIcon /> },
            { id: 'content-type-master', name: 'Content Type Master', icon: <MasterIcon /> },
            { id: 'asset-type-master', name: 'Asset Type Master', icon: <MasterIcon /> },
            { id: 'asset-category-master', name: 'Asset Category Master', icon: <MasterIcon /> },
            { id: 'platform-master', name: 'Platform Master', icon: <MasterIcon /> },
            { id: 'country-master', name: 'Country Master', icon: <MasterIcon /> },
            { id: 'seo-error-type-master', name: 'SEO Error Type Master', icon: <MasterIcon /> },
            { id: 'workflow-stage-master', name: 'Workflow Stage Master', icon: <MasterIcon /> },
            { id: 'user-role-master', name: 'User & Role Master', icon: <UserIcon /> },
            { id: 'audit-checklists', name: 'Audit Checklists', icon: <ConfigIcon /> },
            { id: 'qc-weightage-config', name: 'QC Weightage Configuration', icon: <ConfigIcon /> },
        ]
    },
    {
        title: 'ANALYTICS',
        items: [
            { id: 'kpi-tracking', name: 'KPI Tracking', icon: <AnalyticsIcon /> },
            { id: 'traffic-ranking', name: 'Traffic & Ranking', icon: <AnalyticsIcon /> },
            { id: 'okr-dashboard', name: 'OKR Dashboard', icon: <AnalyticsIcon /> },
            { id: 'individual-performance', name: 'Individual Performance', icon: <AnalyticsIcon /> },
            { id: 'employee-comparison', name: 'Employee Comparison', icon: <AnalyticsIcon /> },
            { id: 'team-leader-dashboard', name: 'Team Leader Dashboard', icon: <AnalyticsIcon /> },
            { id: 'ai-evaluation-engine', name: 'AI Evaluation Engine', icon: <SparkIcon /> },
            { id: 'reward-penalty', name: 'Reward & Penalty', icon: <AnalyticsIcon /> },
            { id: 'workload-prediction', name: 'Workload Prediction', icon: <AnalyticsIcon /> },

            // Master Dashboard Pack - All 8 Dashboards
            { id: 'performance-dashboard', name: '📊 Performance Dashboard', icon: <AnalyticsIcon /> },
            { id: 'effort-dashboard', name: '⚡ Effort Dashboard', icon: <AnalyticsIcon /> },
            { id: 'employee-scorecard-dashboard', name: '👤 Employee Scorecard', icon: <AnalyticsIcon /> },
            { id: 'employee-comparison-dashboard', name: '👥 Employee Comparison', icon: <AnalyticsIcon /> },
            { id: 'team-leader-dashboard-new', name: '👨‍💼 Team Leader Dashboard', icon: <AnalyticsIcon /> },
            { id: 'ai-evaluation-dashboard', name: '🤖 AI Evaluation Engine', icon: <SparkIcon /> },
            { id: 'reward-penalty-dashboard', name: '🏆 Reward & Penalty', icon: <AnalyticsIcon /> },
            { id: 'workload-prediction-dashboard', name: '📈 Workload Prediction', icon: <AnalyticsIcon /> },
            { id: 'ai-task-allocation', name: '💡 AI Task Allocation', icon: <SparkIcon /> },
        ]
    },
    {
        title: 'SYSTEM',
        items: [
            { id: 'backend-source', name: 'Backend Source', icon: <CodeIcon /> },
            { id: 'settings', name: 'Settings', icon: <SettingsIcon /> },
            { id: 'logout', name: 'Logout', icon: <LogoutIcon /> }
        ]
    }
];

// --- Status Badge Utility ---
export const getStatusBadge = (status: string) => {
    if (!status) {
        return (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 whitespace-nowrap">
                UNKNOWN
            </span>
        );
    }
    const statusClasses: { [key: string]: string } = {
        // General
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        completed: 'bg-blue-100 text-blue-800',
        planning: 'bg-indigo-100 text-indigo-800',
        in_progress: 'bg-yellow-100 text-yellow-800',
        on_hold: 'bg-gray-100 text-gray-800',
        live: 'bg-green-100 text-green-800',
        open: 'bg-red-100 text-red-800',
        resolved: 'bg-green-100 text-green-800',
        // Negative
        blocked: 'bg-red-100 text-red-800',
        cancelled: 'bg-red-100 text-red-800',
        failed: 'bg-red-100 text-red-800',
        deprecated: 'bg-red-100 text-red-800',
        removed: 'bg-gray-200 text-gray-800',
        disavowed: 'bg-red-200 text-red-800',
        ignored: 'bg-gray-100 text-gray-600',
        // Backlinks
        trusted: 'bg-green-100 text-green-800',
        avoid: 'bg-yellow-100 text-yellow-800',
        blacklisted: 'bg-red-100 text-red-800',
        test: 'bg-orange-100 text-orange-800',
        // Content
        published: 'bg-blue-100 text-blue-800',
        draft: 'bg-yellow-100 text-yellow-800',
        in_design: 'bg-purple-100 text-purple-800',
        archived: 'bg-gray-100 text-gray-800',
        idea: 'bg-indigo-100 text-indigo-800',
        // QC & Asset Workflow
        under_qc: 'bg-orange-100 text-orange-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        rework: 'bg-yellow-100 text-yellow-800',
        'pending qc review': 'bg-orange-100 text-orange-800',
        'qc approved': 'bg-green-100 text-green-800',
        'qc rejected': 'bg-red-100 text-red-800',
        'rework required': 'bg-yellow-100 text-yellow-800',
        // SMM
        ready_for_design: 'bg-indigo-100 text-indigo-800',
        // Default
        default: 'bg-gray-100 text-gray-800',
    };

    const classes = statusClasses[status.toLowerCase()] || statusClasses.default;

    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${classes} whitespace-nowrap`}>
            {status.replace(/_/g, ' ').toUpperCase()}
        </span>
    );
};
