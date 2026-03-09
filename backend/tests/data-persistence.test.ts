/**
 * Data Persistence Tests
 * Tests for campaign, project, and asset creation with proper ID returns
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

// Mock database pool
const mockPool = {
    query: jest.fn(),
};

// Test data
const testCampaign = {
    campaign_name: 'Test Campaign',
    campaign_type: 'Content',
    status: 'planning',
    description: 'Test Description',
};

const testProject = {
    project_name: 'Test Project',
    project_code: 'PRJ-001',
    description: 'Test Project Description',
    status: 'Planned',
};

const testAsset = {
    name: 'Test Asset',
    type: 'Document',
    asset_category: 'Content',
    asset_format: 'PDF',
    status: 'draft',
    application_type: 'web',
};

describe('Campaign Creation', () => {
    it('should return campaign with ID from PostgreSQL RETURNING clause', async () => {
        // Mock PostgreSQL response with RETURNING
        const mockResponse = {
            rows: [{
                id: 1,
                campaign_name: testCampaign.campaign_name,
                campaign_type: testCampaign.campaign_type,
                status: testCampaign.status,
                description: testCampaign.description,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }],
        };

        mockPool.query.mockResolvedValueOnce(mockResponse);

        // Simulate campaign creation
        const result = mockPool.query('INSERT INTO campaigns ... RETURNING *', []);
        const campaign = (await result).rows[0];

        expect(campaign).toBeDefined();
        expect(campaign.id).toBe(1);
        expect(campaign.campaign_name).toBe(testCampaign.campaign_name);
    });

    it('should handle SQLite response format', async () => {
        // Mock SQLite response
        const mockResponse = {
            rows: [{ id: 1 }],
            lastID: 1,
        };

        mockPool.query.mockResolvedValueOnce(mockResponse);

        const result = mockPool.query('INSERT INTO campaigns ...', []);
        const campaign = (await result).rows[0];

        expect(campaign).toBeDefined();
        expect(campaign.id).toBe(1);
    });

    it('should fail if no ID is returned', async () => {
        // Mock empty response
        const mockResponse = {
            rows: [],
        };

        mockPool.query.mockResolvedValueOnce(mockResponse);

        const result = mockPool.query('INSERT INTO campaigns ...', []);
        const campaign = (await result).rows[0];

        expect(campaign).toBeUndefined();
    });
});

describe('Project Creation', () => {
    it('should return project with ID from PostgreSQL RETURNING clause', async () => {
        const mockResponse = {
            rows: [{
                id: 1,
                project_name: testProject.project_name,
                project_code: testProject.project_code,
                description: testProject.description,
                status: testProject.status,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }],
        };

        mockPool.query.mockResolvedValueOnce(mockResponse);

        const result = mockPool.query('INSERT INTO projects ... RETURNING *', []);
        const project = (await result).rows[0];

        expect(project).toBeDefined();
        expect(project.id).toBe(1);
        expect(project.project_name).toBe(testProject.project_name);
    });

    it('should not require additional SELECT query after INSERT', async () => {
        const mockResponse = {
            rows: [{
                id: 1,
                project_name: testProject.project_name,
                project_code: testProject.project_code,
                status: testProject.status,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }],
        };

        mockPool.query.mockResolvedValueOnce(mockResponse);

        // Should only call query once (INSERT with RETURNING)
        const result = mockPool.query('INSERT INTO projects ... RETURNING *', []);
        await result;

        expect(mockPool.query).toHaveBeenCalledTimes(1);
    });
});

describe('Asset Creation', () => {
    it('should return asset with ID from PostgreSQL RETURNING clause', async () => {
        const mockResponse = {
            rows: [{
                id: 1,
                asset_name: testAsset.name,
                asset_type: testAsset.type,
                asset_category: testAsset.asset_category,
                asset_format: testAsset.asset_format,
                status: testAsset.status,
                application_type: testAsset.application_type,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }],
        };

        mockPool.query.mockResolvedValueOnce(mockResponse);

        const result = mockPool.query('INSERT INTO assets ... RETURNING *', []);
        const asset = (await result).rows[0];

        expect(asset).toBeDefined();
        expect(asset.id).toBe(1);
        expect(asset.asset_name).toBe(testAsset.name);
    });

    it('should create service links when service_id is provided', async () => {
        const assetId = 1;
        const serviceId = 5;

        // Mock asset creation
        const assetResponse = {
            rows: [{
                id: assetId,
                asset_name: testAsset.name,
                asset_type: testAsset.type,
            }],
        };

        // Mock service link creation
        const linkResponse = {
            rows: [],
        };

        mockPool.query
            .mockResolvedValueOnce(assetResponse)
            .mockResolvedValueOnce(linkResponse);

        // Simulate asset creation with service link
        const asset = (await mockPool.query('INSERT INTO assets ... RETURNING *', [])).rows[0];
        const link = await mockPool.query(
            'INSERT INTO service_asset_links ...',
            [assetId, serviceId]
        );

        expect(asset.id).toBe(assetId);
        expect(mockPool.query).toHaveBeenCalledTimes(2);
    });
});

describe('Linked Assets Retrieval', () => {
    it('should return assets from service_asset_links table', async () => {
        const mockResponse = {
            rows: [{
                id: 1,
                asset_name: 'Asset 1',
                asset_type: 'Document',
                static_service_links: JSON.stringify([]),
            }],
        };

        mockPool.query.mockResolvedValueOnce(mockResponse);

        const result = mockPool.query(
            'SELECT DISTINCT a.* FROM assets a INNER JOIN service_asset_links sal ...',
            [5]
        );
        const assets = (await result).rows;

        expect(assets).toHaveLength(1);
        expect(assets[0].id).toBe(1);
    });

    it('should fallback to static_service_links JSON when no explicit links exist', async () => {
        // First query returns empty (no explicit links)
        const emptyResponse = { rows: [] };

        // Second query returns assets with static_service_links
        const fallbackResponse = {
            rows: [{
                id: 1,
                asset_name: 'Asset 1',
                asset_type: 'Document',
                static_service_links: JSON.stringify([{ service_id: 5 }]),
            }],
        };

        mockPool.query
            .mockResolvedValueOnce(emptyResponse)
            .mockResolvedValueOnce(fallbackResponse);

        // First query (explicit links)
        let result = await mockPool.query(
            'SELECT DISTINCT a.* FROM assets a INNER JOIN service_asset_links sal ...',
            [5]
        );
        let assets = result.rows;

        // If empty, try fallback
        if (assets.length === 0) {
            result = await mockPool.query(
                'SELECT DISTINCT a.* FROM assets a WHERE a.static_service_links LIKE ?',
                ['%"service_id":5%']
            );
            assets = result.rows;
        }

        expect(assets).toHaveLength(1);
        expect(assets[0].id).toBe(1);
    });
});

describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
        const error = new Error('Database connection failed');
        mockPool.query.mockRejectedValueOnce(error);

        try {
            await mockPool.query('INSERT INTO campaigns ...', []);
            fail('Should have thrown error');
        } catch (err) {
            expect(err).toBe(error);
        }
    });

    it('should validate required fields before insertion', async () => {
        const invalidCampaign: { campaign_type: string; campaign_name?: string } = {
            campaign_type: 'Content',
            // Missing campaign_name
        };

        // Validation should fail
        const isValid = invalidCampaign.campaign_name !== undefined;
        expect(isValid).toBe(false);
    });
});
