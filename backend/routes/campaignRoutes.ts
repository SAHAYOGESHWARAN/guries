import { Router } from 'express';
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  pullServiceWorkingCopy,
  approveAndUpdateServiceMaster
} from '../controllers/campaignController';

const router = Router();

// GET /api/campaigns - Get all campaigns
router.get('/', getCampaigns);

// GET /api/campaigns/:id - Get single campaign by ID
router.get('/:id', getCampaignById);

// POST /api/campaigns - Create new campaign
router.post('/', createCampaign);

// PUT /api/campaigns/:id - Update campaign
router.put('/:id', updateCampaign);

// DELETE /api/campaigns/:id - Delete campaign
router.delete('/:id', deleteCampaign);

// POST /api/campaigns/:campaignId/pull-service/:serviceId - Pull working copy from Service Master
router.post('/:campaignId/pull-service/:serviceId', pullServiceWorkingCopy);

// POST /api/campaigns/approve-service - Approve and push Campaign changes back to Service Master
router.post('/approve-service', approveAndUpdateServiceMaster);

export default router;
