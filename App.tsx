import React, { useState, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginView from './views/LoginView';
import SplashScreen from './components/SplashScreen';
import Chatbot from './components/Chatbot';

// Lazy Load Views
const DashboardView = React.lazy(() => import('./views/DashboardView'));
const CampaignsView = React.lazy(() => import('./views/CampaignsView'));
const KeywordsView = React.lazy(() => import('./views/KeywordsView'));
const ServicesView = React.lazy(() => import('./views/ServicesView'));
const BacklinksView = React.lazy(() => import('./views/BacklinksView'));
const UsersView = React.lazy(() => import('./views/UsersView'));
const ProjectsView = React.lazy(() => import('./views/ProjectsView'));
const ContentRepositoryView = React.lazy(() => import('./views/ContentRepositoryView'));
const SmmRepositoryView = React.lazy(() => import('./views/SmmRepositoryView'));
const ProjectDetailView = React.lazy(() => import('./views/ProjectDetailView'));
const CampaignDetailView = React.lazy(() => import('./views/CampaignDetailView'));
const SettingsView = React.lazy(() => import('./views/SettingsView'));
const ProjectAnalyticsView = React.lazy(() => import('./views/ProjectAnalyticsView'));
const EffortTargetConfigView = React.lazy(() => import('./views/EffortTargetConfigView'));
const GoldStandardBenchmarkView = React.lazy(() => import('./views/GoldStandardBenchmarkView'));
const ServiceMasterView = React.lazy(() => import('./views/ServiceMasterView'));
const SubServiceMasterView = React.lazy(() => import('./views/SubServiceMasterView'));
const BacklinkMasterView = React.lazy(() => import('./views/BacklinkMasterView'));
const IndustrySectorMasterView = React.lazy(() => import('./views/IndustrySectorMasterView'));
const ContentTypeMasterView = React.lazy(() => import('./views/ContentTypeMasterView'));
const AssetTypeMasterView = React.lazy(() => import('./views/AssetTypeMasterView'));
const PlatformMasterView = React.lazy(() => import('./views/PlatformMasterView'));
const CountryMasterView = React.lazy(() => import('./views/CountryMasterView'));
const SeoErrorTypeMasterView = React.lazy(() => import('./views/SeoErrorTypeMasterView'));
const WorkflowStageMasterView = React.lazy(() => import('./views/WorkflowStageMasterView'));
const UserRoleMasterView = React.lazy(() => import('./views/UserRoleMasterView'));
const AuditChecklistMasterView = React.lazy(() => import('./views/AuditChecklistMasterView'));
const QcWeightageConfigView = React.lazy(() => import('./views/QcWeightageConfigView'));
const PerformanceBenchmarkView = React.lazy(() => import('./views/PerformanceBenchmarkView'));
const CompetitorBenchmarkMasterView = React.lazy(() => import('./views/CompetitorBenchmarkMasterView'));
const UxIssuesView = React.lazy(() => import('./views/UxIssuesView'));
const TasksView = React.lazy(() => import('./views/TasksView'));
const AssetsView = React.lazy(() => import('./views/AssetsView'));
const OnPageErrorsView = React.lazy(() => import('./views/OnPageErrorsView'));
const ToxicBacklinksView = React.lazy(() => import('./views/ToxicBacklinksView'));
const PromotionRepositoryView = React.lazy(() => import('./views/PromotionRepositoryView'));
const CompetitorRepositoryView = React.lazy(() => import('./views/CompetitorRepositoryView'));
const CompetitorBacklinksView = React.lazy(() => import('./views/CompetitorBacklinksView'));
const EmployeeScorecardView = React.lazy(() => import('./views/EmployeeScorecardView'));
const EmployeeComparisonView = React.lazy(() => import('./views/EmployeeComparisonView'));
const RewardPenaltyView = React.lazy(() => import('./views/RewardPenaltyView'));
const WorkloadPredictionView = React.lazy(() => import('./views/WorkloadPredictionView'));
const IntegrationsView = React.lazy(() => import('./views/IntegrationsView'));
const DeveloperNotesView = React.lazy(() => import('./views/DeveloperNotesView'));
const GraphicsPlanView = React.lazy(() => import('./views/GraphicsPlanView'));
const QcView = React.lazy(() => import('./views/QcView'));
const TeamLeaderDashboardView = React.lazy(() => import('./views/TeamLeaderDashboardView'));
const AiEvaluationView = React.lazy(() => import('./views/AiEvaluationView'));
const TrafficRankingView = React.lazy(() => import('./views/TrafficRankingView'));
const KpiTrackingView = React.lazy(() => import('./views/KpiTrackingView'));
const CommunicationHubView = React.lazy(() => import('./views/CommunicationHubView'));
const KnowledgeBaseView = React.lazy(() => import('./views/KnowledgeBaseView'));
const QualityComplianceView = React.lazy(() => import('./views/QualityComplianceView'));

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-full w-full min-h-[400px] animate-fade-in">
    <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
    <p className="text-slate-400 text-xs font-semibold mt-4 uppercase tracking-wide">Loading Module...</p>
  </div>
);

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [viewState, setViewState] = useState<{ view: string; id: number | null }>({
    view: 'dashboard',
    id: null,
  });

  const handleLogout = () => {
    setIsAuthenticated(false);
    setViewState({ view: 'dashboard', id: null });
    setIsLoading(false);
  };

  const handleNavigate = (view: string, id: number | null = null) => {
    if (view === 'logout') {
      handleLogout();
    } else {
      setViewState({ view, id });
      window.scrollTo(0, 0);
    }
  };

  const handleSplashComplete = () => {
    setIsLoading(false);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const renderView = () => {
    switch (viewState.view) {
      // MAIN
      case 'dashboard': return <DashboardView onNavigate={handleNavigate} />;
      case 'projects': return <ProjectsView onProjectSelect={(id) => handleNavigate('project-detail', id)} />;
      case 'project-detail':
        return viewState.id ? <ProjectDetailView projectId={viewState.id} onNavigateBack={() => handleNavigate('projects')} /> : <ProjectsView onProjectSelect={(id) => handleNavigate('project-detail', id)} />;
      case 'campaigns': return <CampaignsView onCampaignSelect={(id) => handleNavigate('campaign-detail', id)} />;
      case 'campaign-detail':
        return viewState.id ? <CampaignDetailView campaignId={viewState.id} onNavigateBack={() => handleNavigate('campaigns')} /> : <CampaignsView onCampaignSelect={(id) => handleNavigate('campaign-detail', id)} />;
      case 'tasks': return <TasksView />;
      case 'assets': return <AssetsView />;

      // COMMUNICATION & KNOWLEDGE
      case 'communication-hub': return <CommunicationHubView />;
      case 'knowledge-base': return <KnowledgeBaseView />;
      case 'quality-compliance': return <QualityComplianceView />;

      // REPOSITORIES
      case 'content-repository': return <ContentRepositoryView />;
      case 'service-pages': return <ServicesView />;
      case 'smm-posting': return <SmmRepositoryView />;
      case 'on-page-errors': return <OnPageErrorsView />;
      case 'backlink-submission': return <BacklinksView />;
      case 'toxic-backlinks': return <ToxicBacklinksView />;
      case 'competitor-backlinks': return <CompetitorBacklinksView />;
      case 'ux-issues': return <UxIssuesView />;
      case 'promotion-repository': return <PromotionRepositoryView />;
      case 'competitor-repository': return <CompetitorRepositoryView />;
      case 'graphics-plan': return <GraphicsPlanView />;

      // CONFIGURATION & SETTINGS
      case 'admin-console': return <SettingsView onNavigate={handleNavigate} />;
      case 'integrations': return <IntegrationsView />;
      case 'backend-source': return <DeveloperNotesView />;
      case 'settings': return <SettingsView onNavigate={handleNavigate} />;
      case 'performance-benchmark': return <PerformanceBenchmarkView />;
      case 'service-sub-service-master': return <ServiceMasterView />;
      case 'sub-service-master': return <SubServiceMasterView />;
      case 'keyword-master': return <KeywordsView />;
      case 'backlink-master': return <BacklinkMasterView />;
      case 'industry-sector-master': return <IndustrySectorMasterView />;
      case 'content-type-master': return <ContentTypeMasterView />;
      case 'asset-type-master': return <AssetTypeMasterView />;
      case 'platform-master': return <PlatformMasterView />;
      case 'country-master': return <CountryMasterView />;
      case 'seo-error-type-master': return <SeoErrorTypeMasterView />;
      case 'workflow-stage-master': return <WorkflowStageMasterView />;
      case 'user-role-master': return <UserRoleMasterView />;
      case 'audit-checklists': return <AuditChecklistMasterView />;
      case 'qc-weightage-config': return <QcWeightageConfigView />;
      case 'effort-target-config': return <EffortTargetConfigView />;
      case 'gold-standard-benchmark': return <GoldStandardBenchmarkView />;
      case 'competitor-benchmark-master': return <CompetitorBenchmarkMasterView />;
      case 'qc-dashboard': return <QcView />;

      // ANALYTICS & HR
      case 'performance-dashboard': return <ProjectAnalyticsView />;
      case 'kpi-tracking': return <KpiTrackingView />;
      case 'traffic-ranking': return <TrafficRankingView />;
      case 'okr-dashboard': return <ProjectAnalyticsView />;
      case 'effort-dashboard': return <ProjectAnalyticsView />;
      case 'employee-scorecard': return <EmployeeScorecardView />;
      case 'individual-performance': return <EmployeeScorecardView />;
      case 'employee-comparison': return <EmployeeComparisonView />;
      case 'team-leader-dashboard': return <TeamLeaderDashboardView />;
      case 'ai-evaluation-engine': return <AiEvaluationView />;
      case 'workload-prediction': return <WorkloadPredictionView />;
      case 'reward-penalty': return <RewardPenaltyView />;
      case 'users': return <UsersView />;

      default: return <DashboardView onNavigate={handleNavigate} />;
    }
  };

  if (isLoading) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar - Compact Width */}
      <Sidebar
        currentView={viewState.view}
        setCurrentView={(view) => handleNavigate(view)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 bg-slate-50/50">
        <Header
          onNavigate={(view, id) => handleNavigate(view, id)}
          onLogout={handleLogout}
        />

        {/* Main scroll container set to overflow-hidden to allow views to manage their own scrolling */}
        <main className="flex-1 overflow-hidden relative">
          <div className="h-full w-full">
            <Suspense fallback={<LoadingSpinner />}>
              {renderView()}
            </Suspense>
          </div>
        </main>
      </div>

      <div className="print:hidden z-50">
        <Chatbot />
      </div>
    </div>
  );
};

export default App;