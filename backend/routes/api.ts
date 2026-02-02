
import { Router, Request, Response, NextFunction } from 'express';
import * as campaignController from '../controllers/campaignController';
import * as projectController from '../controllers/projectController';
import * as analyticsController from '../controllers/analyticsController';
import * as configController from '../controllers/configurationController';
import * as brandController from '../controllers/brandController';
import * as effortTargetController from '../controllers/effortTargetController';
import * as goldStandardController from '../controllers/goldStandardController';
import * as performanceTargetController from '../controllers/performanceTargetController';
import * as okrController from '../controllers/okrController';
import * as competitorController from '../controllers/competitorController';
import * as competitorBacklinkController from '../controllers/competitorBacklinkController';
import * as serviceController from '../controllers/serviceController';
import * as resourceController from '../controllers/resourceController';
import * as keywordController from '../controllers/keywordController';
import * as backlinkSourceController from '../controllers/backlinkSourceController';
import * as userController from '../controllers/userController';
import * as teamController from '../controllers/teamController';
import * as qcController from '../controllers/qcController';
import * as taskController from '../controllers/taskController';
import * as assetController from '../controllers/assetController';
import * as contentController from '../controllers/contentController';
import * as smmController from '../controllers/smmController';
import * as servicePageController from '../controllers/servicePageController';
import * as backlinkSubmissionController from '../controllers/backlinkSubmissionController';
import * as toxicBacklinkController from '../controllers/toxicBacklinkController';
import * as uxController from '../controllers/uxController';
import * as promotionController from '../controllers/promotionController';
import * as graphicAssetController from '../controllers/graphicAssetController';
import * as uploadController from '../controllers/uploadController';
import * as urlErrorController from '../controllers/urlErrorController';
import * as onPageSeoAuditController from '../controllers/onPageSeoAuditController';
import * as hrController from '../controllers/hrController';
import * as aiController from '../controllers/aiController';
import * as authController from '../controllers/authController';
import * as integrationsController from '../controllers/integrationsController';
import * as settingsController from '../controllers/settingsController';
import * as dashboardController from '../controllers/dashboardController';
import * as notificationController from '../controllers/notificationController';
import * as communicationController from '../controllers/communicationController';
import * as knowledgeController from '../controllers/knowledgeController';
import * as complianceController from '../controllers/complianceController';
import * as systemController from '../controllers/systemController';
import * as reportController from '../controllers/reportController';
import * as personaController from '../controllers/personaController';
import * as formController from '../controllers/formController';
import * as performanceDashboardController from '../controllers/performanceDashboardController';
import * as effortDashboardController from '../controllers/effortDashboardController';
import * as employeeScorecardController from '../controllers/employeeScorecardController';
import * as employeeComparisonController from '../controllers/employeeComparisonController';
import * as teamLeaderDashboardController from '../controllers/teamLeaderDashboardController';
import * as aiEvaluationController from '../controllers/aiEvaluationController';
import * as rewardPenaltyController from '../controllers/rewardPenaltyController';
import * as workloadPredictionController from '../controllers/workloadPredictionController';
import * as adminController from '../controllers/adminController';
import * as urlController from '../controllers/urlController';

import { requireAdmin, requirePermission, requireQCPermission } from '../middleware/roleAuth';
import assetCategoryRoutes from './assetCategoryRoutes';
import assetFormatRoutes from './assetFormatRoutes';
import assetCategoryMasterRoutes from './assetCategoryMasterRoutes';
import assetTypeMasterRoutes from './assetTypeMasterRoutes';
import industrySectorRoutes from './industrySectorRoutes';
import platformRoutes from './platformRoutes';
import platformMasterRoutes from './platform-master';
import countryMasterRoutes from './country-master';
import seoErrorTypeMasterRoutes from './seo-error-type-master';
import workflowStageMasterRoutes from './workflow-stage-master';
import userManagementRoutes from './user-management';
import auditChecklistRoutes from './audit-checklist';
import qcWeightageRoutes from './qc-weightage';
import analyticsDashboardRoutes from './analytics-dashboard';
import employeeScorecardRoutes from './employee-scorecard';
import employeeComparisonRoutes from './employee-comparison';
import aiEvaluationEngineRoutes from './ai-evaluation-engine';
import rewardPenaltyAutomationRoutes from './reward-penalty-automation';
import aiTaskAllocationRoutes from './ai-task-allocation';
import * as assetUsageController from '../controllers/assetUsageController';
import * as seoAssetController from '../controllers/seoAssetController';
import * as bulkOperationsController from '../controllers/bulkOperationsController';
import qcReviewRoutes from './qcReview';
import assetUploadRoutes from './assetUpload';
import * as assetUploadController from '../controllers/assetUploadController';

const router = Router();

// Async handler wrapper for Express routes
const asyncHandler = (fn: (req: any, res: any, next?: any) => Promise<any>) =>
    (req: any, res: any, next: any) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };

// --- System & Auth ---
router.get('/system/stats', systemController.getSystemStats);
router.post('/auth/login', authController.login as any);
router.post('/auth/send-otp', authController.sendOtp as any);
router.post('/auth/verify-otp', authController.verifyOtp as any);

// --- Dashboard & Notifications ---
router.get('/dashboard/stats', dashboardController.getDashboardStats);
router.get('/dashboard/upcoming-tasks', dashboardController.getUpcomingTasks);
router.get('/dashboard/recent-activity', dashboardController.getRecentActivity);

router.get('/notifications', notificationController.getNotifications);
router.post('/notifications', notificationController.createNotification);
router.put('/notifications/:id/read', notificationController.markAsRead);
router.put('/notifications/read-all', notificationController.markAllAsRead);
router.delete('/notifications/:id', notificationController.deleteNotification);

// --- Campaigns ---
router.get('/campaigns', campaignController.getCampaigns);
router.get('/campaigns/:id', campaignController.getCampaignById);
router.post('/campaigns', campaignController.createCampaign);
router.put('/campaigns/:id', campaignController.updateCampaign);
router.delete('/campaigns/:id', campaignController.deleteCampaign);
router.post('/campaigns/:campaignId/pull-service/:serviceId', campaignController.pullServiceWorkingCopy);
router.post('/campaigns/approve-and-update-master', campaignController.approveAndUpdateServiceMaster);

// --- Projects ---
router.get('/projects', projectController.getProjects);
router.get('/projects/:id', projectController.getProjectById);
router.post('/projects', projectController.createProject);
router.put('/projects/:id', projectController.updateProject);
router.delete('/projects/:id', projectController.deleteProject);

// --- Tasks ---
router.get('/tasks', taskController.getTasks);
router.post('/tasks', taskController.createTask);
router.put('/tasks/:id', taskController.updateTask);
router.delete('/tasks/:id', taskController.deleteTask);

// --- Assets ---
router.get('/assets', assetController.getAssets);
router.post('/assets', assetController.createAsset);
router.put('/assets/:id', assetController.updateAsset);
router.delete('/assets/:id', assetController.deleteAsset);

// --- Asset Linking ---
router.get('/services/:serviceId/assets', asyncHandler(assetController.getServiceAssets));
router.get('/sub-services/:subServiceId/assets', asyncHandler(assetController.getSubServiceAssets));
router.post('/assets/link-to-service', asyncHandler(assetController.linkAssetToService));
router.post('/assets/unlink-from-service', asyncHandler(assetController.unlinkAssetFromService));

// --- Asset Library ---
router.get('/assetLibrary', asyncHandler(assetController.getAssetLibrary));
router.get('/assetLibrary/:id', asyncHandler(assetController.getAssetLibraryItem));
router.post('/assetLibrary', asyncHandler(assetController.createAssetLibraryItem));
router.put('/assetLibrary/:id', asyncHandler(assetController.updateAssetLibraryItem));
router.delete('/assetLibrary/:id', asyncHandler(assetController.deleteAssetLibraryItem));

// --- Asset Categories ---
router.use('/asset-categories', assetCategoryRoutes);

// --- Asset Formats ---
router.use('/asset-formats', assetFormatRoutes);

// --- Asset Category Master ---
router.use('/asset-category-master', assetCategoryMasterRoutes);

// --- Asset Type Master ---
router.use('/asset-type-master', assetTypeMasterRoutes);

// --- Industry / Sector Master ---
router.use('/industry-sectors', industrySectorRoutes);

// --- Platforms Master ---
router.use('/platforms', platformRoutes);
router.use('/platform-master', platformMasterRoutes);

// --- Countries Master ---
router.use('/country-master', countryMasterRoutes);

// --- SEO Error Type Master ---
router.use('/seo-error-type-master', seoErrorTypeMasterRoutes);

// --- Workflow Stage Master ---
router.use('/workflow-stage-master', workflowStageMasterRoutes);

// --- User Management ---
router.use('/user-management', userManagementRoutes);

// --- Audit Checklist ---
router.use('/audit-checklist', auditChecklistRoutes);

// --- QC Weightage Configuration ---
router.use('/qc-weightage', qcWeightageRoutes);

// --- Analytics Dashboard ---
router.use('/analytics-dashboard', analyticsDashboardRoutes);

// --- Employee Scorecard ---
router.use('/employee-scorecard', employeeScorecardRoutes);

// --- Employee Comparison Dashboard ---
router.use('/employee-comparison', employeeComparisonRoutes);

// --- AI Evaluation Engine ---
router.use('/ai-evaluation-engine', aiEvaluationEngineRoutes);

// --- Reward & Penalty Automation ---
router.use('/reward-penalty-automation', rewardPenaltyAutomationRoutes);

// Asset QC Workflow
router.post('/assetLibrary/:id/submit-qc', asyncHandler(assetController.submitAssetForQC));
router.get('/assetLibrary/qc/pending', asyncHandler(assetController.getAssetsForQC));
// QC Review - Admin only (permission enforced at both middleware and controller level)
router.post('/assetLibrary/:id/qc-review', asyncHandler(assetController.reviewAsset));
router.post('/assetLibrary/ai-scores', asyncHandler(assetController.generateAIScores));

// Admin QC Asset Review - Admin only endpoints
router.get('/admin/qc/assets', requireAdmin, asyncHandler(assetController.getAssetsForQC));
router.get('/admin/qc/audit-log', requireAdmin, asyncHandler(async (req, res) => {
    // Get QC audit log for admin review
    const { pool } = require('../config/db-sqlite');
    const result = await pool.query(`
        SELECT qal.*, u.name as reviewer_name, a.asset_name 
        FROM qc_audit_log qal
        LEFT JOIN users u ON qal.user_id = u.id
        LEFT JOIN assets a ON qal.asset_id = a.id
        ORDER BY qal.created_at DESC
        LIMIT 100
    `);
    res.status(200).json(result.rows);
}));

// User actions during QC review stage
router.put('/assetLibrary/:id/qc-edit', asyncHandler(assetController.editAssetInQC));
router.delete('/assetLibrary/:id/qc-delete', asyncHandler(assetController.deleteAssetInQC));

// Get QC reviews for an asset (for side panel display)
router.get('/assetLibrary/:id/qc-reviews', asyncHandler(assetController.getAssetQCReviews));

// --- SEO Asset Module (12-Step Workflow) ---
// SEO Asset Master Data Endpoints (must come before parameterized routes)
router.get('/seo-assets/master/existing-assets', seoAssetController.getExistingAssetIds);
router.get('/seo-assets/master/sectors', seoAssetController.getSectors);
router.get('/seo-assets/master/industries', seoAssetController.getIndustries);
router.get('/seo-assets/master/domain-types', seoAssetController.getDomainTypes);
router.get('/seo-assets/master/backlink-domains', seoAssetController.getBacklinkDomains);
router.get('/seo-assets/master/asset-types', seoAssetController.getSeoAssetTypes);

// CRUD Operations
router.get('/seo-assets', seoAssetController.getSeoAssets);
router.get('/seo-assets/:id', seoAssetController.getSeoAssetById);
router.post('/seo-assets', seoAssetController.createSeoAsset);
router.put('/seo-assets/:id', seoAssetController.updateSeoAsset);
router.delete('/seo-assets/:id', seoAssetController.deleteSeoAsset);

// SEO Asset Workflow
router.post('/seo-assets/:id/submit-qc', seoAssetController.submitSeoAssetForQC);
router.post('/seo-assets/:id/qc-review', seoAssetController.reviewSeoAsset);
router.get('/seo-assets/:id/version-history', seoAssetController.getSeoAssetVersionHistory);

// SEO Asset Domain Management (Step 6 & 7)
router.get('/seo-assets/:assetId/domains', seoAssetController.getSeoAssetDomains);
router.post('/seo-assets/:assetId/domains', seoAssetController.addSeoAssetDomain);
router.put('/seo-assets/:assetId/domains/:domainId', seoAssetController.updateSeoAssetDomain);
router.delete('/seo-assets/:assetId/domains/:domainId', seoAssetController.deleteSeoAssetDomain);

// --- Asset Usage Tracking ---
// Get all usage data for an asset
router.get('/assetLibrary/:assetId/usage', assetUsageController.getAssetAllUsage);

// Website Usage
router.get('/assetLibrary/:assetId/usage/website', assetUsageController.getAssetWebsiteUsage);
router.post('/assetLibrary/:assetId/usage/website', assetUsageController.addAssetWebsiteUsage);
router.delete('/assetLibrary/:assetId/usage/website/:usageId', assetUsageController.deleteAssetWebsiteUsage);

// Social Media Usage
router.get('/assetLibrary/:assetId/usage/social', assetUsageController.getAssetSocialMediaUsage);
router.post('/assetLibrary/:assetId/usage/social', assetUsageController.addAssetSocialMediaUsage);
router.put('/assetLibrary/:assetId/usage/social/:usageId', assetUsageController.updateAssetSocialMediaUsage);
router.delete('/assetLibrary/:assetId/usage/social/:usageId', assetUsageController.deleteAssetSocialMediaUsage);

// Backlink Usage
router.get('/assetLibrary/:assetId/usage/backlinks', assetUsageController.getAssetBacklinkUsage);
router.post('/assetLibrary/:assetId/usage/backlinks', assetUsageController.addAssetBacklinkUsage);
router.put('/assetLibrary/:assetId/usage/backlinks/:usageId', assetUsageController.updateAssetBacklinkUsage);
router.delete('/assetLibrary/:assetId/usage/backlinks/:usageId', assetUsageController.deleteAssetBacklinkUsage);

// Engagement Metrics
router.get('/assetLibrary/:assetId/usage/metrics', assetUsageController.getAssetEngagementMetrics);
router.put('/assetLibrary/:assetId/usage/metrics', assetUsageController.updateAssetEngagementMetrics);

// --- Content Repository ---
router.get('/content', contentController.getContent);
router.post('/content', contentController.createContent);
router.put('/content/:id', contentController.updateContent);
router.delete('/content/:id', contentController.deleteContent);
router.post('/content/draft-from-service', contentController.createDraftFromService);
router.post('/content/publish-to-service/:id', contentController.publishToService);

// --- Service Page Repository ---
router.get('/service-pages', servicePageController.getServicePages);
router.post('/service-pages', servicePageController.createServicePage);
router.put('/service-pages/:id', servicePageController.updateServicePage);
router.delete('/service-pages/:id', servicePageController.deleteServicePage);

// --- SMM ---
router.get('/smm', smmController.getSmmPosts);
router.post('/smm', smmController.createSmmPost);
router.put('/smm/:id', smmController.updateSmmPost);
router.delete('/smm/:id', smmController.deleteSmmPost);

// --- Graphics Plan ---
router.get('/graphics', graphicAssetController.getGraphicAssets);
router.post('/graphics', graphicAssetController.createGraphicAsset);
router.put('/graphics/:id', graphicAssetController.updateGraphicAsset);
router.delete('/graphics/:id', graphicAssetController.deleteGraphicAsset);

// --- Uploads (simple base64 uploader)
router.post('/uploads', uploadController.uploadBase64);

// --- Teams ---
router.get('/teams', teamController.getTeams);
router.post('/teams', teamController.createTeam);
router.put('/teams/:id', teamController.updateTeam);
router.delete('/teams/:id', teamController.deleteTeam);

// --- Analytics ---
router.get('/analytics/traffic', analyticsController.getTrafficData);
router.get('/analytics/kpi', analyticsController.getKPISummary);
router.get('/analytics/dashboard-metrics', analyticsController.getDashboardMetrics);

// --- Reports ---
router.get('/reports/today', reportController.getTodayReport);

// --- Promotion & Errors ---
router.get('/promotion-items', promotionController.getPromotionItems);
router.post('/promotion-items', promotionController.createPromotionItem);
router.put('/promotion-items/:id', promotionController.updatePromotionItem);
router.delete('/promotion-items/:id', promotionController.deletePromotionItem);
router.get('/url-errors', urlErrorController.getUrlErrors);
router.post('/url-errors', urlErrorController.createUrlError);
router.put('/url-errors/:id', urlErrorController.updateUrlError);
router.delete('/url-errors/:id', urlErrorController.deleteUrlError);

// --- On-page SEO Audits ---
router.get('/on-page-seo-audits', onPageSeoAuditController.getOnPageSeoAudits);
router.post('/on-page-seo-audits', onPageSeoAuditController.createOnPageSeoAudit);
router.put('/on-page-seo-audits/:id', onPageSeoAuditController.updateOnPageSeoAudit);
router.delete('/on-page-seo-audits/:id', onPageSeoAuditController.deleteOnPageSeoAudit);
router.get('/on-page-seo-audits/service/:serviceId', onPageSeoAuditController.getAuditsByService);
router.get('/on-page-seo-audits/sub-service/:subServiceId', onPageSeoAuditController.getAuditsBySubService);

// --- Benchmarks & Competitors ---
router.get('/okrs', okrController.getOKRs);
router.post('/okrs', okrController.createOKR);
router.put('/okrs/:id', okrController.updateOKR);
router.delete('/okrs/:id', okrController.deleteOKR);

router.get('/competitors', competitorController.getCompetitors);
router.post('/competitors', competitorController.createCompetitor);
router.put('/competitors/:id', competitorController.updateCompetitor);
router.delete('/competitors/:id', competitorController.deleteCompetitor);

router.get('/competitor-backlinks', competitorBacklinkController.getCompetitorBacklinks);
router.post('/competitor-backlinks', competitorBacklinkController.createCompetitorBacklink);
router.put('/competitor-backlinks/:id', competitorBacklinkController.updateCompetitorBacklink);
router.delete('/competitor-backlinks/:id', competitorBacklinkController.deleteCompetitorBacklink);

router.get('/gold-standards', goldStandardController.getGoldStandards);
router.post('/gold-standards', goldStandardController.createGoldStandard);
router.put('/gold-standards/:id', goldStandardController.updateGoldStandard);
router.delete('/gold-standards/:id', goldStandardController.deleteGoldStandard);

router.get('/effort-targets', effortTargetController.getEffortTargets);
router.post('/effort-targets', effortTargetController.createEffortTarget);
router.put('/effort-targets/:id', effortTargetController.updateEffortTarget);
router.delete('/effort-targets/:id', effortTargetController.deleteEffortTarget);

router.get('/performance-targets', performanceTargetController.getPerformanceTargets);
router.post('/performance-targets', performanceTargetController.createPerformanceTarget);
router.put('/performance-targets/:id', performanceTargetController.updatePerformanceTarget);
router.delete('/performance-targets/:id', performanceTargetController.deletePerformanceTarget);

// --- Personas & Forms ---
router.get('/personas', asyncHandler(personaController.getPersonas));
router.post('/personas', asyncHandler(personaController.createPersona));
router.put('/personas/:id', asyncHandler(personaController.updatePersona));
router.delete('/personas/:id', asyncHandler(personaController.deletePersona));

router.get('/forms', asyncHandler(formController.getForms));
router.post('/forms', asyncHandler(formController.createForm));
router.put('/forms/:id', asyncHandler(formController.updateForm));
router.delete('/forms/:id', asyncHandler(formController.deleteForm));

// --- Services Master ---
router.get('/services', serviceController.getServices);
router.post('/services', serviceController.createService);
router.put('/services/:id', serviceController.updateService);
router.delete('/services/:id', serviceController.deleteService);

router.get('/sub-services', serviceController.getSubServices);
router.get('/sub-services/parent/:parentServiceId', serviceController.getSubServicesByParent);
router.post('/sub-services', serviceController.createSubService);
router.put('/sub-services/:id', serviceController.updateSubService);
router.delete('/sub-services/:id', serviceController.deleteSubService);

// --- Resources (Keywords, Backlinks) ---
router.get('/keywords', keywordController.getKeywords);
router.post('/keywords', keywordController.createKeyword);
router.put('/keywords/:id', keywordController.updateKeyword);
router.delete('/keywords/:id', keywordController.deleteKeyword);
router.post('/keywords/link-to-sub-service', keywordController.linkKeywordsToSubService);
router.post('/keywords/unlink-from-sub-service', keywordController.unlinkKeywordsFromSubService);
router.get('/keywords/sub-service/:sub_service_id', keywordController.getSubServiceLinkedKeywords);

router.get('/backlink-sources', backlinkSourceController.getBacklinkSources);
router.post('/backlink-sources', backlinkSourceController.createBacklinkSource);
router.put('/backlink-sources/:id', backlinkSourceController.updateBacklinkSource);
router.delete('/backlink-sources/:id', backlinkSourceController.deleteBacklinkSource);

router.get('/backlinks', resourceController.getBacklinks);
router.post('/backlinks', resourceController.createBacklink);
router.put('/backlinks/:id', resourceController.updateBacklink);
router.delete('/backlinks/:id', resourceController.deleteBacklink);

router.get('/submissions', backlinkSubmissionController.getSubmissions);
router.post('/submissions', backlinkSubmissionController.createSubmission);
router.put('/submissions/:id', backlinkSubmissionController.updateSubmission);
router.delete('/submissions/:id', backlinkSubmissionController.deleteSubmission);

// --- Users & Roles ---
router.get('/users', userController.getUsers);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

router.get('/roles', userController.getRoles);
router.post('/roles', userController.createRole);
router.put('/roles/:id', userController.updateRole);
router.delete('/roles/:id', userController.deleteRole);

// --- Admin Console - Employee Management (Admin only) ---
router.get('/admin/employees', requireAdmin, adminController.getEmployees);
router.get('/admin/employees/metrics', requireAdmin, adminController.getEmployeeMetrics);
router.get('/admin/employees/pending', requireAdmin, adminController.getPendingRegistrations);
router.get('/admin/employees/role/:role', requireAdmin, adminController.getEmployeesByRole);
router.get('/admin/roles/stats', requireAdmin, adminController.getRoleStats);
router.post('/admin/employees', requireAdmin, adminController.createEmployee);
router.put('/admin/employees/:id', requireAdmin, adminController.updateEmployee);
router.post('/admin/employees/:id/reset-password', requireAdmin, adminController.resetPassword);
router.post('/admin/employees/:id/deactivate', requireAdmin, adminController.deactivateEmployee);
router.post('/admin/employees/:id/activate', requireAdmin, adminController.activateEmployee);
router.post('/admin/employees/:id/toggle-status', requireAdmin, adminController.toggleEmployeeStatus);
router.post('/admin/employees/:id/approve', requireAdmin, adminController.approveRegistration);
router.post('/admin/employees/:id/reject', requireAdmin, adminController.rejectRegistration);
router.delete('/admin/employees/:id', requireAdmin, adminController.deleteEmployee);
router.post('/admin/auth/login', adminController.validateLogin);

// --- QC ---
router.get('/qc-runs', qcController.getQcRuns);
router.post('/qc-runs', qcController.createQcRun);
router.put('/qc-runs/:id', qcController.updateQcRun);
router.delete('/qc-runs/:id', qcController.deleteQcRun);

router.get('/qc-checklists', qcController.getChecklists);
router.post('/qc-checklists', qcController.createChecklist);
router.put('/qc-checklists/:id', qcController.updateChecklist);
router.delete('/qc-checklists/:id', qcController.deleteChecklist);

router.get('/qc-versions', qcController.getChecklistVersions);
router.get('/qc-weightage-configs', qcController.getWeightageConfigs);
router.post('/qc-weightage-configs', qcController.createWeightageConfig);
router.put('/qc-weightage-configs/:id', qcController.updateWeightageConfig);
router.delete('/qc-weightage-configs/:id', qcController.deleteWeightageConfig);

// --- QC Review System ---
router.use('/qc-review', qcReviewRoutes);

// --- Asset Upload with Service Linking ---
router.use('/assets', assetUploadRoutes);

// --- Configuration Masters ---
router.get('/content-types', configController.getContentTypes);
router.post('/content-types', configController.createContentType);
router.put('/content-types/:id', configController.updateContentType);
router.delete('/content-types/:id', configController.deleteContentType);

router.get('/asset-types', configController.getAssetTypes);
router.post('/asset-types', configController.createAssetType);
router.put('/asset-types/:id', configController.updateAssetType);
router.delete('/asset-types/:id', configController.deleteAssetType);

// Asset categories are now handled by assetCategoryRoutes (see line 151)
// Removed duplicate routes that were conflicting

router.get('/platforms', configController.getPlatforms);
router.post('/platforms', configController.createPlatform);
router.put('/platforms/:id', configController.updatePlatform);
router.delete('/platforms/:id', configController.deletePlatform);

router.get('/countries', configController.getCountries);
router.post('/countries', configController.createCountry);
router.put('/countries/:id', configController.updateCountry);
router.delete('/countries/:id', configController.deleteCountry);

router.get('/seo-errors', configController.getSeoErrors);
// Brands (master data)
router.get('/brands', brandController.getBrands);
router.post('/brands', brandController.createBrand);
router.put('/brands/:id', brandController.updateBrand);
router.delete('/brands/:id', brandController.deleteBrand);
router.post('/seo-errors', configController.createSeoError);
router.put('/seo-errors/:id', configController.updateSeoError);
router.delete('/seo-errors/:id', configController.deleteSeoError);

router.get('/workflow-stages', configController.getWorkflowStages);
router.post('/workflow-stages', configController.createWorkflowStage);
router.put('/workflow-stages/:id', configController.updateWorkflowStage);
router.delete('/workflow-stages/:id', configController.deleteWorkflowStage);

// --- Toxic Links & UX ---
router.get('/toxic-backlinks', toxicBacklinkController.getToxicBacklinks);
router.post('/toxic-backlinks', toxicBacklinkController.createToxicBacklink);
router.put('/toxic-backlinks/:id', toxicBacklinkController.updateToxicBacklink);
router.delete('/toxic-backlinks/:id', toxicBacklinkController.deleteToxicBacklink);

router.get('/ux-issues', uxController.getUxIssues);
router.post('/ux-issues', uxController.createUxIssue);
router.put('/ux-issues/:id', uxController.updateUxIssue);
router.delete('/ux-issues/:id', uxController.deleteUxIssue);

// --- HR & AI ---
router.get('/hr/workload', hrController.getWorkloadForecast);
router.get('/hr/rewards', hrController.getRewardRecommendations);
router.put('/hr/rewards/:id', hrController.updateRewardStatus);
router.get('/hr/rankings', hrController.getEmployeeRankings);
router.get('/hr/skills', hrController.getEmployeeSkills);
router.get('/hr/achievements', hrController.getEmployeeAchievements);
router.post('/ai/evaluations', aiController.generateEvaluation);

// --- Integrations & Settings ---
router.get('/integrations', integrationsController.getIntegrations);
router.put('/integrations/:id', integrationsController.updateIntegration);
router.get('/logs', integrationsController.getIntegrationLogs);
router.post('/logs', integrationsController.createLog);

router.get('/settings', settingsController.getSettings);
router.put('/settings/:key', settingsController.updateSetting);
router.post('/settings/maintenance', settingsController.runMaintenance);

// --- Communication & Knowledge ---
router.get('/communication/emails', communicationController.getEmails);
router.post('/communication/emails', communicationController.createEmail);
router.get('/communication/voice-profiles', communicationController.getVoiceProfiles);
router.post('/communication/voice-profiles', communicationController.createVoiceProfile);
router.get('/communication/calls', communicationController.getCallLogs);
router.post('/communication/calls', communicationController.logCall);

router.get('/knowledge/articles', knowledgeController.getArticles);
router.post('/knowledge/articles', knowledgeController.createArticle);
router.put('/knowledge/articles/:id', knowledgeController.updateArticle);
router.delete('/knowledge/articles/:id', knowledgeController.deleteArticle);

// --- Compliance ---
router.get('/compliance/rules', complianceController.getRules);
router.post('/compliance/rules', complianceController.createRule);
router.get('/compliance/audits', complianceController.getAudits);
router.post('/compliance/audits', complianceController.logAudit);

// --- Master Dashboard Pack ---
// Performance Dashboard (OKR + KPI + Competitor + Gold Standard)
router.get('/dashboards/performance', performanceDashboardController.getPerformanceDashboard);
router.post('/dashboards/performance/export', performanceDashboardController.exportPerformanceData);

// Effort Dashboard (Work Completion & Productivity)
router.get('/dashboards/effort', effortDashboardController.getEffortDashboard);
router.get('/dashboards/effort/workload-prediction', effortDashboardController.getWorkloadPrediction);

// Employee Scorecard Dashboard (Individual Performance)
router.get('/dashboards/employee-scorecard', employeeScorecardController.getEmployeeScorecard);
router.get('/dashboards/employees', employeeScorecardController.getEmployeeList);

// Employee Comparison Dashboard
router.get('/dashboards/employee-comparison', employeeComparisonController.getEmployeeComparison);
router.get('/dashboards/team-performance-stats', employeeComparisonController.getTeamPerformanceStats);

// Team Leader Dashboard
router.get('/dashboards/team-leader', teamLeaderDashboardController.getTeamLeaderDashboard);
router.post('/dashboards/team-leader/task-assignment', teamLeaderDashboardController.updateTaskAssignment);
router.get('/dashboards/team-leader/capacity-forecast', teamLeaderDashboardController.getTeamCapacityForecast);

// AI Evaluation Engine Dashboard
router.get('/dashboards/ai-evaluation', aiEvaluationController.getAiEvaluation);
router.post('/dashboards/ai-evaluation/generate', aiEvaluationController.generateNewEvaluation);
router.get('/dashboards/ai-evaluation/history', aiEvaluationController.getEvaluationHistory);

// Reward & Penalty Dashboard
router.get('/dashboards/rewards-penalties', rewardPenaltyController.getRewardsPenalties);
router.post('/dashboards/rewards-penalties/automation-rules', rewardPenaltyController.createAutomationRule);
router.put('/dashboards/rewards-penalties/approvals/:id', rewardPenaltyController.updateApprovalStatus);

// Workload Prediction & Allocation Dashboard
router.get('/dashboards/workload-prediction', workloadPredictionController.getWorkloadPrediction);
router.post('/dashboards/workload-prediction/implement-suggestion', workloadPredictionController.implementAllocationSuggestion);
router.get('/dashboards/workload-prediction/capacity-forecast', workloadPredictionController.getCapacityForecast);

// AI Task Allocation Suggestions
router.use('/workload-allocation', aiTaskAllocationRoutes);

// --- BULK OPERATIONS ---
// Bulk Delete
router.delete('/bulk/delete', bulkOperationsController.bulkDelete);

// Bulk Update
router.patch('/bulk/update', bulkOperationsController.bulkUpdate);

// Bulk Status Change
router.patch('/bulk/status', bulkOperationsController.bulkStatusChange);

// Bulk Assign to User
router.patch('/bulk/assign', bulkOperationsController.bulkAssign);

// Bulk Duplicate/Clone
router.post('/bulk/duplicate', bulkOperationsController.bulkDuplicate);

// Bulk Export
router.post('/bulk/export', bulkOperationsController.bulkExport);

// --- URL Management ---
// Check slug existence
router.post('/services/check-slug', asyncHandler(urlController.checkServiceSlugExists));
router.post('/sub-services/check-slug', asyncHandler(urlController.checkSubServiceSlugExists));

// Generate unique slugs
router.post('/services/generate-slug', asyncHandler(urlController.generateUniqueServiceSlug));
router.post('/sub-services/generate-slug', asyncHandler(urlController.generateUniqueSubServiceSlug));

// Validate URL structure
router.post('/urls/validate', asyncHandler(urlController.validateUrlStructureApi));

// Get URL suggestions
router.post('/urls/suggestions', asyncHandler(urlController.getUrlSuggestions));

// Get URL analytics
router.get('/urls/analytics', asyncHandler(urlController.getUrlAnalytics));

export default router;

