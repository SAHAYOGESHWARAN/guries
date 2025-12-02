
import type { 
    User, Team, TeamMember, Brand, Campaign, Project, Keyword, Service, ServiceUrl, UrlError,
    BacklinkSource, BacklinkSubmission, BacklinkCredential, Task, ContentRepositoryItem, 
    GraphicAssetPlan, SmmPost, AssetLibraryItem, Integration, QcRun, QcChecklistItem, 
    CampaignPerformanceKpi, ActivityLog, IntegrationLog, ToxicBacklink, QcChecklistVersion, QcRunItem,
    TeamPerformance, Notification, EffortTarget, GoldStandardMetric, SubServiceItem, IndustrySectorItem,
    ContentTypeItem, AssetTypeItem, PlatformMasterItem, CountryMasterItem, SeoErrorTypeItem, WorkflowStageItem,
    CompetitorBenchmarkItem, OKRItem, UxIssue, ServicePageItem, PerformanceMetric, ProjectImpact, AutoInsight,
    EmployeeMetric, TaskHistory, EmployeeRanking, WeeklyPerformance, PersonaMasterItem, FormMasterItem
} from '../types';

// --- PRODUCTION STATE: EMPTY INITIAL DATA ---
export const mockUsers: User[] = [];
export const mockTeams: Team[] = [];
export const mockTeamMembers: TeamMember[] = [];
export const mockBrands: Brand[] = [];
export const mockProjects: Project[] = [];
export const mockCampaigns: Campaign[] = [];
export const mockKeywords: Keyword[] = [];
export const mockServices: Service[] = [];
export const mockServiceUrls: ServiceUrl[] = [];
export const mockBacklinkSources: BacklinkSource[] = [];
export const mockBacklinkCredentials: BacklinkCredential[] = [];
export const mockBacklinkSubmissions: BacklinkSubmission[] = [];
export const mockContentRepository: ContentRepositoryItem[] = [];
export const mockServicePages: ServicePageItem[] = [];
export const mockSmmRepository: SmmPost[] = [];
export const mockUrlErrors: UrlError[] = [];
export const mockToxicUrls: ToxicBacklink[] = [];
export const mockUxIssues: UxIssue[] = [];
export const mockTasks: Task[] = [];
export const mockCompetitorBenchmarks: CompetitorBenchmarkItem[] = [];
export const mockPerformanceMetrics: PerformanceMetric[] = [];
export const mockProjectImpacts: ProjectImpact[] = [];
export const mockAutoInsights: AutoInsight[] = [];
export const mockEmployeeMetrics: EmployeeMetric[] = [];
export const mockTaskHistory: TaskHistory[] = [];
export const mockEmployeeRankings: EmployeeRanking[] = [];
export const mockWeeklyPerformance: WeeklyPerformance[] = [];
export const mockGraphicsPlan: GraphicAssetPlan[] = [];
export const mockQcRuns: QcRun[] = [];
export const mockQcChecklists: QcChecklistItem[] = [];
export const mockIntegrationLogs: IntegrationLog[] = [];
export const mockIntegrations: Integration[] = [];
export const mockQcChecklistVersions: QcChecklistVersion[] = [];
export const mockQcRunItems: QcRunItem[] = [];
export const mockAssetLibrary: AssetLibraryItem[] = [];
export const mockNotifications: Notification[] = [];
export const mockCampaignKPIs: CampaignPerformanceKpi[] = [];
export const mockEffortTargets: EffortTarget[] = [];
export const mockGoldStandards: GoldStandardMetric[] = [];
export const mockSubServices: SubServiceItem[] = [];
export const mockIndustrySectors: IndustrySectorItem[] = [];
export const mockContentTypes: ContentTypeItem[] = [];
export const mockPersonas: PersonaMasterItem[] = [];
export const mockForms: FormMasterItem[] = [];
export const mockAssetTypes: AssetTypeItem[] = [];
export const mockPlatforms: PlatformMasterItem[] = [];
export const mockCountries: CountryMasterItem[] = [];
export const mockSeoErrors: SeoErrorTypeItem[] = [];
export const mockWorkflowStages: WorkflowStageItem[] = [];
export const mockOkrs: OKRItem[] = [];

// Empty Chart Data placeholders
export const mockTrafficTrend = [];
export const mockLeadsByCampaign = [];
export const mockKeywordsImprovedTrend = [];
export const mockContentVsQc = { qcPassRate: 0, contentOutput: 0 };
export const mockSmmReach = [];
export const mockTeamPerformance: TeamPerformance[] = [];
export const mockEffortVsPerformance = [];
