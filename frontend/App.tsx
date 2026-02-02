import React, { useState, Suspense, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginView from './views/LoginView';
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
const ServicePagesView = React.lazy(() => import('./views/ServicePagesView'));
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
const BacklinkSourceMasterView = React.lazy(() => import('./views/BacklinkSourceMasterView'));
const UxIssuesView = React.lazy(() => import('./views/UxIssuesView'));
const TasksView = React.lazy(() => import('./views/TasksView'));
const AssetsView = React.lazy(() => import('./views/AssetsView'));
const AssetDetailView = React.lazy(() => import('./views/AssetDetailView'));
const AssetEditView = React.lazy(() => import('./views/AssetEditView'));
const OnPageErrorsView = React.lazy(() => import('./views/OnPageErrorsView'));
const ToxicBacklinksView = React.lazy(() => import('./views/ToxicBacklinksView'));
const PromotionRepositoryView = React.lazy(() => import('./views/PromotionRepositoryView'));
const CompetitorRepositoryView = React.lazy(() => import('./views/CompetitorRepositoryView'));
const CompetitorBacklinksView = React.lazy(() => import('./views/CompetitorBacklinksView'));
const OKRManagementView = React.lazy(() => import('./views/OKRManagementView'));
// Removed - using EmployeeScorecardDashboard instead
// Removed - using EmployeeComparisonDashboard instead
// Master Dashboard Pack - All 8 Dashboards
const PerformanceDashboard = React.lazy(() => import('./views/PerformanceDashboard'));
const EffortDashboard = React.lazy(() => import('./views/EffortDashboard'));
const EmployeeScorecardDashboard = React.lazy(() => import('./views/EmployeeScorecardDashboard'));
const EmployeeComparisonDashboard = React.lazy(() => import('./views/EmployeeComparisonDashboardView'));
const TeamLeaderDashboard = React.lazy(() => import('./views/TeamLeaderDashboard'));
const AIEvaluationEngineView = React.lazy(() => import('./views/AIEvaluationEngineView'));
const RewardPenaltyAutomationView = React.lazy(() => import('./views/RewardPenaltyAutomationView'));
const RewardPenaltyDashboard = React.lazy(() => import('./views/RewardPenaltyDashboard'));
const WorkloadPredictionDashboard = React.lazy(() => import('./views/WorkloadPredictionDashboard'));
const AITaskAllocationSuggestionsView = React.lazy(() => import('./views/AITaskAllocationSuggestionsView'));

const IntegrationsView = React.lazy(() => import('./views/IntegrationsView'));
const DeveloperNotesView = React.lazy(() => import('./views/DeveloperNotesView'));
const GraphicsPlanView = React.lazy(() => import('./views/GraphicsPlanView'));
const QcView = React.lazy(() => import('./views/QcView'));
const AssetQCView = React.lazy(() => import('./views/AssetQCView'));
const AdminQCAssetReviewView = React.lazy(() => import('./views/AdminQCAssetReviewView'));
const QCReviewPage = React.lazy(() => import('./components/QCReviewPage'));
const WebAssetUploadView = React.lazy(() => import('./views/WebAssetUploadView'));
const SeoAssetUploadView = React.lazy(() => import('./views/SeoAssetUploadView'));
const SeoAssetModuleView = React.lazy(() => import('./views/SeoAssetModuleView'));
const SeoAssetsListView = React.lazy(() => import('./views/SeoAssetsListView'));
const SmmAssetUploadView = React.lazy(() => import('./views/SmmAssetUploadView'));
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
  <div className="flex items-center justify-center h-full w-full">
    <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
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
    // Seed admin user to localStorage if not exists
    const existingUsers = localStorage.getItem('users');
    let users = existingUsers ? JSON.parse(existingUsers) : [];

    const adminExists = users.some((u: any) => u.email === 'admin@example.com');
    if (!adminExists) {
      users.push({
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active',
        department: 'Administration',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      });
      localStorage.setItem('users', JSON.stringify(users));
    }

    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  }, []);

  // Listen for hash changes from ServiceMasterView and other components
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove '#'
      if (hash) {
        // Small delay to ensure sessionStorage is set before component renders
        setTimeout(() => {
          setViewState({ view: hash, id: null });
          window.scrollTo(0, 0);
        }, 50);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setViewState({ view: 'dashboard', id: null });
  };

  const handleNavigate = (view: string, id: string | number | null = null) => {
    if (view === 'logout') {
      handleLogout();
    } else {
      setViewState({ view, id });
      window.scrollTo(0, 0);
    }
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
        return viewState.id ? <AssetDetailView assetId={Number(viewState.id)} onNavigateBack={() => handleNavigate('assets')} onNavigate={handleNavigate} /> : <AssetsView onNavigate={handleNavigate} />;
      case 'asset-edit':
        return viewState.id ? <AssetEditView assetId={Number(viewState.id)} onNavigate={handleNavigate} /> : <AssetsView onNavigate={handleNavigate} />;
      case 'asset-qc': return <AssetQCView onNavigate={handleNavigate} />;
      case 'qc-review': return <QCReviewPage />;
      case 'admin-qc-review': return <AdminQCAssetReviewView onNavigate={handleNavigate} />;
      case 'web-asset-upload': return <WebAssetUploadView onNavigate={handleNavigate} />;
      case 'web-asset-edit': return <WebAssetUploadView onNavigate={handleNavigate} editAssetId={viewState.id ? Number(viewState.id) : undefined} />;
      case 'seo-asset-upload': return <SeoAssetUploadView onNavigate={handleNavigate} />;
      case 'seo-asset-edit': return <SeoAssetUploadView onNavigate={handleNavigate} editAssetId={viewState.id ? Number(viewState.id) : undefined} />;
      case 'seo-asset-module': return <SeoAssetModuleView onNavigate={handleNavigate} />;
      case 'seo-asset-module-edit': return <SeoAssetModuleView onNavigate={handleNavigate} editAssetId={viewState.id ? Number(viewState.id) : undefined} />;
      case 'seo-assets': return <SeoAssetsListView onNavigate={handleNavigate} />;
      case 'seo-asset-view': return <SeoAssetsListView onNavigate={handleNavigate} />;
      case 'smm-asset-upload': return <SmmAssetUploadView onNavigate={handleNavigate} />;
      case 'smm-asset-edit': return <SmmAssetUploadView onNavigate={handleNavigate} editAssetId={viewState.id ? Number(viewState.id) : undefined} />;

      // COMMUNICATION & KNOWLEDGE
      case 'communication-hub': return <CommunicationHubView />;
      case 'knowledge-base': return <KnowledgeBaseView />;
      case 'quality-compliance': return <QualityComplianceView />;

      // REPOSITORIES
      case 'content-repository': return <ContentRepositoryView />;
      case 'service-pages': return <ServicePagesView />;
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
      case 'performance-benchmark': return <OKRManagementView />;
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
      case 'backlink-source-master': return <BacklinkSourceMasterView />;
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
      case 'ai-evaluation-engine': return <AIEvaluationEngineView />;
      case 'workload-prediction': return <WorkloadPredictionDashboard onNavigate={handleNavigate} />;
      case 'workload-prediction-dashboard': return <WorkloadPredictionDashboard onNavigate={handleNavigate} />;
      case 'ai-task-allocation': return <AITaskAllocationSuggestionsView onNavigate={handleNavigate} />;
      case 'reward-penalty': return <RewardPenaltyAutomationView />;
      case 'reward-penalty-dashboard': return <RewardPenaltyDashboard onNavigate={handleNavigate} />;
      case 'users': return <UsersView />;
      case 'my-profile': return <UserProfileView onNavigateBack={() => handleNavigate('dashboard')} />;
      case 'profile': return <UserProfileView onNavigateBack={() => handleNavigate('dashboard')} />;

      default: return <DashboardView onNavigate={handleNavigate} />;
    }
  };

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