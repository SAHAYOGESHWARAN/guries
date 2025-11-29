
import type {
    User, Team, TeamMember, Brand, Project, Campaign, Keyword, Service, ServiceUrl,
    BacklinkSource, BacklinkCredential, BacklinkSubmission, ContentRepositoryItem,
    GraphicAssetPlan, SmmPost, Task, QcRun, QcChecklistItem, QcChecklistVersion,
    QcRunItem, CampaignPerformanceKpi, CampaignEffortKpi, ToxicBacklink, UrlError,
    AssetLibraryItem, Notification, Integration, IntegrationLog,
    EffortTarget, GoldStandardMetric, SubServiceItem, IndustrySectorItem, ContentTypeItem,
    AssetTypeItem, PlatformMasterItem, CountryMasterItem, SeoErrorTypeItem, WorkflowStageItem,
    CompetitorBenchmarkItem, OKRItem, UxIssue, ServicePageItem
} from '../types';

const STORAGE_KEYS = {
    // Identity
    USERS: 'mcc_users',
    TEAMS: 'mcc_teams',
    TEAM_MEMBERS: 'mcc_team_members',
    BRANDS: 'mcc_brands',
    // Masters
    KEYWORDS: 'mcc_keywords',
    SERVICES: 'mcc_services',
    SERVICE_URLS: 'mcc_service_urls',
    BACKLINKS: 'mcc_backlinks',
    CREDENTIALS: 'mcc_credentials',
    // New Masters
    EFFORT_TARGETS: 'mcc_effort_targets',
    GOLD_STANDARDS: 'mcc_gold_standards',
    SUB_SERVICES: 'mcc_sub_services',
    INDUSTRY_SECTORS: 'mcc_industry_sectors',
    CONTENT_TYPES: 'mcc_content_types',
    ASSET_TYPES: 'mcc_asset_types',
    PLATFORMS: 'mcc_platforms',
    COUNTRIES: 'mcc_countries',
    SEO_ERRORS: 'mcc_seo_errors',
    WORKFLOW_STAGES: 'mcc_workflow_stages',
    COMPETITORS: 'mcc_competitors',
    OKRS: 'mcc_okrs',
    // Repositories
    CONTENT: 'mcc_content',
    GRAPHICS: 'mcc_graphics',
    SMM: 'mcc_smm',
    UX_ISSUES: 'mcc_ux_issues',
    SERVICE_PAGES: 'mcc_service_pages',
    // Execution
    PROJECTS: 'mcc_projects',
    CAMPAIGNS: 'mcc_campaigns',
    TASKS: 'mcc_tasks',
    SUBMISSIONS: 'mcc_submissions',
    // QC
    QC_VERSIONS: 'mcc_qc_versions',
    QC_CHECKLISTS: 'mcc_qc_checklists',
    QC: 'mcc_qc_runs',
    QC_RUN_ITEMS: 'mcc_qc_run_items',
    // Analytics
    CAMPAIGN_PERFORMANCE: 'mcc_campaign_performance',
    CAMPAIGN_EFFORT: 'mcc_campaign_effort',
    TOXIC_URLS: 'mcc_toxic_urls',
    URL_ERRORS: 'mcc_url_errors',
    ASSET_LIBRARY: 'mcc_asset_library',
    NOTIFICATIONS: 'mcc_notifications',
    // Misc
    LOGS: 'mcc_logs',
    INTEGRATIONS: 'mcc_integrations',
};

// Generic CRUD helper
class DataService<T extends { id: number | string }> {
    public readonly key: string;

    constructor(key: string) {
        this.key = key;
        // Auto-seeding removed for production empty state
    }

    getAll(): T[] {
        const data = localStorage.getItem(this.key);
        try {
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error(`Error parsing data for key ${this.key}`, e);
            return [];
        }
    }

    getById(id: number | string): T | undefined {
        const items = this.getAll();
        return items.find((item) => String(item.id) === String(id));
    }

    create(item: Omit<T, 'id'>): T {
        const items = this.getAll();
        const newId = items.length > 0 
            ? Math.max(...items.map((i: any) => typeof i.id === 'number' ? i.id : 0)) + 1 
            : 1;
        
        const newItem = { ...item, id: newId } as T;
        items.unshift(newItem);
        this.save(items);
        return newItem;
    }

    update(id: number | string, updates: Partial<T>): T | null {
        const items = this.getAll();
        const index = items.findIndex((item) => String(item.id) === String(id));
        if (index === -1) return null;

        items[index] = { ...items[index], ...updates };
        this.save(items);
        return items[index];
    }

    delete(id: number | string): boolean {
        const items = this.getAll();
        const filtered = items.filter((item) => String(item.id) !== String(id));
        if (filtered.length === items.length) return false;
        this.save(filtered);
        return true;
    }

    private save(items: T[]) {
        localStorage.setItem(this.key, JSON.stringify(items));
        window.dispatchEvent(new CustomEvent('local-storage-update', { detail: { key: this.key } }));
    }
}

// Export specific services
export const db = {
    // Identity
    users: new DataService<User>(STORAGE_KEYS.USERS),
    teams: new DataService<Team>(STORAGE_KEYS.TEAMS),
    teamMembers: new DataService<TeamMember>(STORAGE_KEYS.TEAM_MEMBERS), 
    brands: new DataService<Brand>(STORAGE_KEYS.BRANDS),
    // Masters
    keywords: new DataService<Keyword>(STORAGE_KEYS.KEYWORDS),
    services: new DataService<Service>(STORAGE_KEYS.SERVICES),
    serviceUrls: new DataService<ServiceUrl>(STORAGE_KEYS.SERVICE_URLS),
    backlinks: new DataService<BacklinkSource>(STORAGE_KEYS.BACKLINKS),
    credentials: new DataService<BacklinkCredential>(STORAGE_KEYS.CREDENTIALS),
    effortTargets: new DataService<EffortTarget>(STORAGE_KEYS.EFFORT_TARGETS),
    goldStandards: new DataService<GoldStandardMetric>(STORAGE_KEYS.GOLD_STANDARDS),
    subServices: new DataService<SubServiceItem>(STORAGE_KEYS.SUB_SERVICES),
    industrySectors: new DataService<IndustrySectorItem>(STORAGE_KEYS.INDUSTRY_SECTORS),
    contentTypes: new DataService<ContentTypeItem>(STORAGE_KEYS.CONTENT_TYPES),
    assetTypes: new DataService<AssetTypeItem>(STORAGE_KEYS.ASSET_TYPES),
    platforms: new DataService<PlatformMasterItem>(STORAGE_KEYS.PLATFORMS),
    countries: new DataService<CountryMasterItem>(STORAGE_KEYS.COUNTRIES),
    seoErrors: new DataService<SeoErrorTypeItem>(STORAGE_KEYS.SEO_ERRORS),
    workflowStages: new DataService<WorkflowStageItem>(STORAGE_KEYS.WORKFLOW_STAGES),
    competitors: new DataService<CompetitorBenchmarkItem>(STORAGE_KEYS.COMPETITORS),
    okrs: new DataService<OKRItem>(STORAGE_KEYS.OKRS),
    // Repositories
    content: new DataService<ContentRepositoryItem>(STORAGE_KEYS.CONTENT),
    graphics: new DataService<GraphicAssetPlan>(STORAGE_KEYS.GRAPHICS),
    smm: new DataService<SmmPost>(STORAGE_KEYS.SMM),
    uxIssues: new DataService<UxIssue>(STORAGE_KEYS.UX_ISSUES),
    servicePages: new DataService<ServicePageItem>(STORAGE_KEYS.SERVICE_PAGES),
    // Execution
    projects: new DataService<Project>(STORAGE_KEYS.PROJECTS),
    campaigns: new DataService<Campaign>(STORAGE_KEYS.CAMPAIGNS),
    tasks: new DataService<Task>(STORAGE_KEYS.TASKS),
    submissions: new DataService<BacklinkSubmission>(STORAGE_KEYS.SUBMISSIONS),
    // QC
    qc: new DataService<QcRun>(STORAGE_KEYS.QC),
    qcChecklists: new DataService<QcChecklistItem>(STORAGE_KEYS.QC_CHECKLISTS),
    qcVersions: new DataService<QcChecklistVersion>(STORAGE_KEYS.QC_VERSIONS),
    qcRunItems: new DataService<QcRunItem>(STORAGE_KEYS.QC_RUN_ITEMS),
    // Analytics
    toxicUrls: new DataService<ToxicBacklink>(STORAGE_KEYS.TOXIC_URLS),
    urlErrors: new DataService<UrlError>(STORAGE_KEYS.URL_ERRORS),
    assetLibrary: new DataService<AssetLibraryItem>(STORAGE_KEYS.ASSET_LIBRARY),
    notifications: new DataService<Notification>(STORAGE_KEYS.NOTIFICATIONS),
    campaignPerformance: new DataService<CampaignPerformanceKpi>(STORAGE_KEYS.CAMPAIGN_PERFORMANCE),
    campaignEffort: new DataService<CampaignEffortKpi>(STORAGE_KEYS.CAMPAIGN_EFFORT),
    // Misc
    logs: new DataService<IntegrationLog>(STORAGE_KEYS.LOGS),
    integrations: new DataService<Integration>(STORAGE_KEYS.INTEGRATIONS),
};
