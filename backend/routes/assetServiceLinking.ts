import { Router } from 'express';
import {
    linkAssetToServiceStatic,
    getServiceLinkedAssets,
    getSubServiceLinkedAssets,
    isAssetLinkStatic,
    unlinkAssetFromService,
    getAssetStaticLinks,
    getServiceAssetCount
} from '../controllers/assetServiceLinkingController';

const router = Router();

/**
 * Asset-Service Linking Routes
 * Handles static (immutable) and dynamic (mutable) asset-service relationships
 */

// Link asset to service (static - cannot be removed)
router.post('/link-static', linkAssetToServiceStatic);

// Get assets linked to a service
router.get('/services/:service_id/linked-assets', getServiceLinkedAssets);

// Get assets linked to a sub-service
router.get('/sub-services/:sub_service_id/linked-assets', getSubServiceLinkedAssets);

// Check if asset link is static
router.get('/is-static', isAssetLinkStatic);

// Unlink asset from service (only if not static)
router.post('/unlink', unlinkAssetFromService);

// Get all static links for an asset
router.get('/assets/:asset_id/static-links', getAssetStaticLinks);

// Get service asset count
router.get('/services/:service_id/asset-count', getServiceAssetCount);

export default router;
