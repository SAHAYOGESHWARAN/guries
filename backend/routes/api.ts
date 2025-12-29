
import { Router } from 'express';
import * as campaignController from '../controllers/campaignController';
import * as projectController from '../controllers/projectController';
import * as analyticsController from '../controllers/analyticsController';
import * as configController from '../controllers/configurationController';
import * as brandController from '../controllers/brandController';
import * as benchmarkController from '../controllers/benchmarkController';
import * as competitorController from '../controllers/competitorController';
import * as competitorBacklinkController from '../controllers/competitorBacklinkController';
import * as serviceController from '../controllers/serviceController';
import * as resourceController from '../controllers/resourceController';
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
import assetCategoryRoutes from './assetCategoryRoutes';
import assetFormatRoutes from './assetFormatRoutes';
import assetCategoryMasterRoutes from './assetCategoryMasterRoutes';
import assetTypeMasterRoutes from './assetTypeMasterRoutes';
import * as assetUsageController from '../controllers/assetUsageController';

const router = Router();

// --- System & Auth ---
router.get('/system/stats', systemController.getSystemStats);
router.post('/auth/send-otp', authController.sendOtp as any);
router.post('/auth/verify-otp', authController.verifyOtp as any);

// --- Dashboard & Notifications ---
router.get('/dashboard/stats', dashboardController.getDashboardStats);
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

// --- Asset Library ---
router.get('/assetLibrary', assetController.getAssetLibrary);
router.get('/assetLibrary/:id', assetController.getAssetLibraryItem);
router.post('/assetLibrary', assetController.createAssetLibraryItem);
router.put('/assetLibrary/:id', assetController.updateAssetLibraryItem);
router.delete('/assetLibrary/:id', assetController.deleteAssetLibraryItem);

// --- Asset Categories ---
router.use('/asset-categories', assetCategoryRoutes);

// --- Asset Formats ---
router.use('/asset-formats', assetFormatRoutes);

// --- Asset Category Master ---
router.use('/asset-category-master', assetCategoryMasterRoutes);

// --- Asset Type Master ---
router.use('/asset-type-master', assetTypeMasterRoutes);

// Asset QC Workflow
router.post('/assetLibrary/:id/submit-qc', assetController.submitAssetForQC);
router.get('/assetLibrary/qc/pending', assetController.getAssetsForQC);
router.post('/assetLibrary/:id/qc-review', assetController.reviewAsset);
router.post('/assetLibrary/ai-scores', assetController.generateAIScores);

// User actions during QC review stage
router.put('/assetLibrary/:id/qc-edit', assetController.editAssetInQC);
router.delete('/assetLibrary/:id/qc-delete', assetController.deleteAssetInQC);

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
router.get('/okrs', benchmarkController.getOkrs);
router.post('/okrs', benchmarkController.createOkr);
router.put('/okrs/:id', benchmarkController.updateOkr);
router.delete('/okrs/:id', benchmarkController.deleteOkr);

router.get('/competitors', competitorController.getCompetitors);
router.post('/competitors', competitorController.createCompetitor);
router.put('/competitors/:id', competitorController.updateCompetitor);
router.delete('/competitors/:id', competitorController.deleteCompetitor);

router.get('/competitor-backlinks', competitorBacklinkController.getCompetitorBacklinks);
router.post('/competitor-backlinks', competitorBacklinkController.createCompetitorBacklink);
router.put('/competitor-backlinks/:id', competitorBacklinkController.updateCompetitorBacklink);
router.delete('/competitor-backlinks/:id', competitorBacklinkController.deleteCompetitorBacklink);

router.get('/gold-standards', benchmarkController.getGoldStandards);
router.post('/gold-standards', benchmarkController.createGoldStandard);
router.put('/gold-standards/:id', benchmarkController.updateGoldStandard);
router.delete('/gold-standards/:id', benchmarkController.deleteGoldStandard);

router.get('/effort-targets', benchmarkController.getEffortTargets);
router.post('/effort-targets', benchmarkController.createEffortTarget);
router.put('/effort-targets/:id', benchmarkController.updateEffortTarget);
router.delete('/effort-targets/:id', benchmarkController.deleteEffortTarget);

// --- Personas & Forms ---
router.get('/personas', personaController.getPersonas);
router.post('/personas', personaController.createPersona);
router.put('/personas/:id', personaController.updatePersona);
router.delete('/personas/:id', personaController.deletePersona);

router.get('/forms', formController.getForms);
router.post('/forms', formController.createForm);
router.put('/forms/:id', formController.updateForm);
router.delete('/forms/:id', formController.deleteForm);

// --- Services Master ---
router.get('/services', serviceController.getServices);
router.post('/services', serviceController.createService);
router.put('/services/:id', serviceController.updateService);
router.delete('/services/:id', serviceController.deleteService);

router.get('/sub-services', serviceController.getSubServices);
router.post('/sub-services', serviceController.createSubService);
router.put('/sub-services/:id', serviceController.updateSubService);
router.delete('/sub-services/:id', serviceController.deleteSubService);

// --- Resources (Keywords, Backlinks) ---
router.get('/keywords', resourceController.getKeywords);
router.post('/keywords', resourceController.createKeyword);
router.put('/keywords/:id', resourceController.updateKeyword);
router.delete('/keywords/:id', resourceController.deleteKeyword);

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

// --- Admin Console - Employee Management ---
router.get('/admin/employees', adminController.getEmployees);
router.get('/admin/employees/metrics', adminController.getEmployeeMetrics);
router.post('/admin/employees', adminController.createEmployee);
router.put('/admin/employees/:id', adminController.updateEmployee);
router.post('/admin/employees/:id/reset-password', adminController.resetPassword);
router.post('/admin/employees/:id/deactivate', adminController.deactivateEmployee);
router.post('/admin/employees/:id/activate', adminController.activateEmployee);
router.post('/admin/employees/:id/toggle-status', adminController.toggleEmployeeStatus);
router.delete('/admin/employees/:id', adminController.deleteEmployee);
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

// --- Configuration Masters ---
router.get('/industry-sectors', configController.getIndustries);
router.post('/industry-sectors', configController.createIndustry);
router.put('/industry-sectors/:id', configController.updateIndustry);
router.delete('/industry-sectors/:id', configController.deleteIndustry);

router.get('/content-types', configController.getContentTypes);
router.post('/content-types', configController.createContentType);
router.put('/content-types/:id', configController.updateContentType);
router.delete('/content-types/:id', configController.deleteContentType);

router.get('/asset-types', configController.getAssetTypes);
router.post('/asset-types', configController.createAssetType);
router.put('/asset-types/:id', configController.updateAssetType);
router.delete('/asset-types/:id', configController.deleteAssetType);

router.get('/asset-categories', configController.getAssetCategories);
router.post('/asset-categories', configController.createAssetCategory);
router.put('/asset-categories/:id', configController.updateAssetCategory);
router.delete('/asset-categories/:id', configController.deleteAssetCategory);

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

export default router;
