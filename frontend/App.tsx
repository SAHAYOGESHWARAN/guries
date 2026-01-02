import React, { useState, Suspense, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginView from './views/LoginView';
import SplashScreen from './components/SplashScreen';
import Chatbot from './components/Chatbot';
import { AuthUser } from './hooks/useAuth';

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
const AssetCategoryMasterView = React.lazy(() => import('./views/AssetCategoryMasterView'));
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
const AssetDetailView = React.lazy(() => import('./views/AssetDetailView'));
const OnPageErrorsView = React.lazy(() => import('./views/OnPageErrorsView'));
const ToxicBacklinksView = React.lazy(() => import('./views/ToxicBacklinksView'));
const PromotionRepositoryView = React.lazy(() => import('./views/PromotionRepositoryView'));
const CompetitorRepositoryView = React.lazy(() => import('./views/CompetitorRepositoryView'));
const CompetitorBacklinksView = React.lazy(() => import('./views/CompetitorBacklinksView'));
// Removed - using EmployeeScorecardDashboard instead
// Removed - using EmployeeComparisonDashboard instead
// Master Dashboard Pack - All 8 Dashboards
const PerformanceDashboard = React.lazy(() => import('./views/PerformanceDashboard'));
const EffortDashboard = React.lazy(() => import('./views/EffortDashboard'));
const EmployeeScorecardDashboard = React.lazy(() => import('./views/EmployeeScorecardDashboard'));
const EmployeeComparisonDashboard = React.lazy(() => import('./views/EmployeeComparisonDashboard'));
const TeamLeaderDashboard = React.lazy(() => import('./views/TeamLeaderDashboard'));
const AIEvaluationDashboard = React.lazy(() => import('./views/AIEvaluationDashboard'));
const RewardPenaltyDashboard = React.lazy(() => import('./views/RewardPenaltyDashboard'));
const WorkloadPredictionDashboard = React.lazy(() => import('./views/WorkloadPredictionDashboard'));

const IntegrationsView = React.lazy(() => import('./views/IntegrationsView'));
const DeveloperNotesView = React.lazy(() => import('./views/DeveloperNotesView'));
const GraphicsPlanView = React.lazy(() => import('./views/GraphicsPlanView'));
const QcView = React.lazy(() => import('./views/QcView'));
const AssetQCView = React.lazy(() => import('./views/AssetQCView'));
const AdminQCAssetReviewView = React.lazy(() => import('./views/AdminQCAssetReviewView'));
const TrafficRankingView = React.lazy(() => import('./views/TrafficRankingView'));
const KpiTrackingView = React.lazy(() => import('./views/KpiTrackingView'));
const CommunicationHubView = React.lazy(() => import('./views/CommunicationHubView'));
const KnowledgeBaseView = React.lazy(() => import('./views/KnowledgeBaseView'));
const QualityComplianceView = React.lazy(() => import('./views/QualityComplianceView'));
const UserProfileView = React.lazy(() => import('./views/UserProfileView'));
const AdminConsoleView = React.lazy(() => import('./views/AdminConsoleView'));
const AdminConsoleConfigView = React.lazy(() => import('./views/AdminConsoleConfigView'));
const RolePermissionMatrixView = React.lazy(() => import('./views/RolePermissionMatrixView'));
// Admin Console Config Views
const ObjectiveMasterView = React.lazy(() => import('./views/ObjectiveMasterView'));
const KRAMasterView = React.lazy(() => import('./views/KRAMasterView'));
const KPIMasterView = React.lazy(() => import('./views/KPIMasterView'));
const KPITargetConfigView = React.lazy(() => import('./views/KPITargetConfigView'));
const EffortUnitConfigView = React.lazy(() => import('./views/EffortUnitConfigView'));
const ScoringEngineView = React.lazy(() => import('./views/ScoringEngineView'));
const QCEngineConfigView = React.lazy(() => import('./views/QCEngineConfigView'));
const RepositoryManagerView = React.lazy(() => import('./views/RepositoryManagerView'));
const CompetitorIntelligenceView = React.lazy(() => import('./views/CompetitorIntelligenceView'));
const AutomationNotificationsView = React.lazy(() => import('./views/AutomationNotificationsView'));
const DashboardConfigView = React.lazy(() => import('./views/DashboardConfigView'));

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-full w-full min-h-[400px] animate-fade-in">
    <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
    <p className="text-slate-400 text-xs font-semibold mt-4 uppercase tracking-wide">Loading Module...</p>
  </div>
);

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [viewState, setViewState] = useState<{ view: string; id: string | number | null }>({
    view: 'dashboard',
    id: null,
  });

  // Clear any existing session on mount - always require fresh login
  useEffect(() => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIsAuthenticated(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setViewState({ view: 'dashboard', id: null });
    setIsLoading(false);
  };

  const handleNavigate = (view: string, id: string | number | null = null) => {
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

  const handleLogin = (user: AuthUser) => {
    // Store user in localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const renderView = () => {
    switch (viewState.view) {
      // MAIN
      case 'dashboard': return <DashboardView onNavigate={handleNavigate} />;
      case 'projects': return <ProjectsView onProjectSelect={(id) => handleNavigate('project-detail', id)} />;
      case 'project-detail':
        return viewState.id ? <ProjectDetailView projectId={Number(viewState.id)} onNavigateBack={() => handleNavigate('projects')} /> : <ProjectsView onProjectSelect={(id) => handleNavigate('project-detail', id)} />;
      case 'campaigns': return <CampaignsView onCampaignSelect={(id) => handleNavigate('campaign-detail', id)} />;
      case 'campaign-detail':
        return viewState.id ? <CampaignDetailView campaignId={Number(viewState.id)} onNavigateBack={() => handleNavigate('campaigns')} /> : <CampaignsView onCampaignSelect={(id) => handleNavigate('campaign-detail', id)} />;
      case 'tasks': return <TasksView />;
      case 'assets': return <AssetsView onNavigate={handleNavigate} />;
      case 'asset-detail':
        return viewState.id ? <AssetDetailView assetId={Number(viewState.id)} onNavigateBack={() => handleNavigate('assets')} /> : <AssetsView onNavigate={handleNavigate} />;
      case 'asset-qc': return <AssetQCView onNavigate={handleNavigate} />;
      case 'admin-qc-review': return <AdminQCAssetReviewView onNavigate={handleNavigate} />;

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
      case 'admin-console': return <AdminConsoleView currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'admin-console-config': return <AdminConsoleConfigView onNavigate={handleNavigate} />;
      case 'role-permission-matrix': return <RolePermissionMatrixView onNavigate={handleNavigate} />;
      // Admin Console Config Views
      case 'objective-master': return <ObjectiveMasterView onNavigate={handleNavigate} />;
      case 'kra-master': return <KRAMasterView onNavigate={handleNavigate} />;
      case 'kpi-master': return <KPIMasterView onNavigate={handleNavigate} />;
      case 'kpi-target-config': return <KPITargetConfigView onNavigate={handleNavigate} />;
      case 'effort-unit-config': return <EffortUnitConfigView onNavigate={handleNavigate} />;
      case 'scoring-engine': return <ScoringEngineView onNavigate={handleNavigate} />;
      case 'qc-engine-config': return <QCEngineConfigView onNavigate={handleNavigate} />;
      case 'repository-manager': return <RepositoryManagerView onNavigate={handleNavigate} />;
      case 'competitor-intelligence': return <CompetitorIntelligenceView onNavigate={handleNavigate} />;
      case 'automation-notifications': return <AutomationNotificationsView onNavigate={handleNavigate} />;
      case 'dashboard-config': return <DashboardConfigView onNavigate={handleNavigate} />;
      case 'employee-management': return <AdminConsoleView currentUser={currentUser} onNavigate={handleNavigate} />;
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
      case 'asset-category-master': return <AssetCategoryMasterView />;
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
      case 'kpi-tracking': return <KpiTrackingView />;
      case 'traffic-ranking': return <TrafficRankingView />;
      case 'okr-dashboard': return <ProjectAnalyticsView />;

      // Master Dashboard Pack - All 8 Enhanced Dashboards
      case 'performance-dashboard': return <PerformanceDashboard onNavigate={handleNavigate} />;
      case 'effort-dashboard': return <EffortDashboard onNavigate={handleNavigate} />;
      case 'employee-scorecard': return <EmployeeScorecardDashboard onNavigate={handleNavigate} />;
      case 'employee-scorecard-dashboard': return <EmployeeScorecardDashboard onNavigate={handleNavigate} />;
      case 'individual-performance': return <EmployeeScorecardDashboard onNavigate={handleNavigate} />;
      case 'employee-comparison': return <EmployeeComparisonDashboard onNavigate={handleNavigate} />;
      case 'employee-comparison-dashboard': return <EmployeeComparisonDashboard onNavigate={handleNavigate} />;
      case 'team-leader-dashboard': return <TeamLeaderDashboard onNavigate={handleNavigate} />;
      case 'team-leader-dashboard-new': return <TeamLeaderDashboard onNavigate={handleNavigate} />;
      case 'ai-evaluation-engine': return <AIEvaluationDashboard onNavigate={handleNavigate} />;
      case 'ai-evaluation-dashboard': return <AIEvaluationDashboard onNavigate={handleNavigate} />;
      case 'workload-prediction': return <WorkloadPredictionDashboard onNavigate={handleNavigate} />;
      case 'workload-prediction-dashboard': return <WorkloadPredictionDashboard onNavigate={handleNavigate} />;
      case 'reward-penalty': return <RewardPenaltyDashboard onNavigate={handleNavigate} />;
      case 'reward-penalty-dashboard': return <RewardPenaltyDashboard onNavigate={handleNavigate} />;
      case 'users': return <UsersView />;
      case 'my-profile': return <UserProfileView onNavigateBack={() => handleNavigate('dashboard')} />;
      case 'profile': return <UserProfileView onNavigateBack={() => handleNavigate('dashboard')} />;

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
        currentUser={currentUser}
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