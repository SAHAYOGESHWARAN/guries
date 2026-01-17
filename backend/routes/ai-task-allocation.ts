import express, { Request, Response } from 'express';
import {
    getTaskSuggestions,
    getTaskSuggestion,
    createTaskSuggestion,
    acceptTaskSuggestion,
    rejectTaskSuggestion,
    getWorkloadForecast,
    getTeamCapacityUtilization,
    getPredictedOverloads,
    getAllocationStats,
    getWorkloadTrendForecast,
    getSkillBasedAllocations,
    getAllocationMetrics,
    bulkCreateSuggestions
} from '../controllers/aiTaskAllocationController';

const router = express.Router();

// Task Allocation Suggestions
router.get('/task-suggestions', getTaskSuggestions);
router.get('/task-suggestions/:suggestionId', getTaskSuggestion);
router.post('/task-suggestions', createTaskSuggestion);
router.put('/task-suggestions/:suggestionId/accept', acceptTaskSuggestion);
router.put('/task-suggestions/:suggestionId/reject', rejectTaskSuggestion);
router.post('/task-suggestions/bulk', bulkCreateSuggestions);

// Workload Forecast
router.get('/workload-forecast', getWorkloadForecast);

// Team Capacity Utilization
router.get('/team-capacity', getTeamCapacityUtilization);

// Predicted Overloads
router.get('/predicted-overloads', getPredictedOverloads);

// Allocation Statistics
router.get('/stats', getAllocationStats);

// Workload Trend Forecast
router.get('/workload-trends', getWorkloadTrendForecast);

// Skill-based Allocations
router.get('/skill-allocations', getSkillBasedAllocations);

// Allocation Performance Metrics
router.get('/metrics', getAllocationMetrics);

export default router;
