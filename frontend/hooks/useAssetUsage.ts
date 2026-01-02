/**
 * Custom hook for fetching and managing asset usage data
 */

import { useState, useEffect, useCallback } from 'react';
import type { AssetUsageData, AssetWebsiteUsage, AssetSocialMediaUsage, AssetBacklinkUsage, AssetEngagementMetrics } from '../types';

const API_BASE = '/api/v1';

interface UseAssetUsageReturn {
    usageData: AssetUsageData | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    addWebsiteUsage: (data: Partial<AssetWebsiteUsage>) => Promise<void>;
    deleteWebsiteUsage: (usageId: number) => Promise<void>;
    addSocialMediaUsage: (data: Partial<AssetSocialMediaUsage>) => Promise<void>;
    updateSocialMediaUsage: (usageId: number, data: Partial<AssetSocialMediaUsage>) => Promise<void>;
    deleteSocialMediaUsage: (usageId: number) => Promise<void>;
    addBacklinkUsage: (data: Partial<AssetBacklinkUsage>) => Promise<void>;
    updateBacklinkUsage: (usageId: number, data: Partial<AssetBacklinkUsage>) => Promise<void>;
    deleteBacklinkUsage: (usageId: number) => Promise<void>;
    updateEngagementMetrics: (data: Partial<AssetEngagementMetrics>) => Promise<void>;
}

export function useAssetUsage(assetId: number | undefined): UseAssetUsageReturn {
    const [usageData, setUsageData] = useState<AssetUsageData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsageData = useCallback(async () => {
        if (!assetId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/assetLibrary/${assetId}/usage`);
            if (!response.ok) {
                throw new Error('Failed to fetch usage data');
            }
            const data = await response.json();
            setUsageData(data);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching asset usage:', err);
        } finally {
            setLoading(false);
        }
    }, [assetId]);

    useEffect(() => {
        fetchUsageData();
    }, [fetchUsageData]);

    // Website Usage Methods
    const addWebsiteUsage = async (data: Partial<AssetWebsiteUsage>) => {
        if (!assetId) return;
        try {
            const response = await fetch(`${API_BASE}/assetLibrary/${assetId}/usage/website`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to add website usage');
            await fetchUsageData();
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const deleteWebsiteUsage = async (usageId: number) => {
        if (!assetId) return;
        try {
            const response = await fetch(`${API_BASE}/assetLibrary/${assetId}/usage/website/${usageId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete website usage');
            await fetchUsageData();
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    // Social Media Usage Methods
    const addSocialMediaUsage = async (data: Partial<AssetSocialMediaUsage>) => {
        if (!assetId) return;
        try {
            const response = await fetch(`${API_BASE}/assetLibrary/${assetId}/usage/social`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to add social media usage');
            await fetchUsageData();
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const updateSocialMediaUsage = async (usageId: number, data: Partial<AssetSocialMediaUsage>) => {
        if (!assetId) return;
        try {
            const response = await fetch(`${API_BASE}/assetLibrary/${assetId}/usage/social/${usageId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to update social media usage');
            await fetchUsageData();
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const deleteSocialMediaUsage = async (usageId: number) => {
        if (!assetId) return;
        try {
            const response = await fetch(`${API_BASE}/assetLibrary/${assetId}/usage/social/${usageId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete social media usage');
            await fetchUsageData();
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    // Backlink Usage Methods
    const addBacklinkUsage = async (data: Partial<AssetBacklinkUsage>) => {
        if (!assetId) return;
        try {
            const response = await fetch(`${API_BASE}/assetLibrary/${assetId}/usage/backlinks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to add backlink usage');
            await fetchUsageData();
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const updateBacklinkUsage = async (usageId: number, data: Partial<AssetBacklinkUsage>) => {
        if (!assetId) return;
        try {
            const response = await fetch(`${API_BASE}/assetLibrary/${assetId}/usage/backlinks/${usageId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to update backlink usage');
            await fetchUsageData();
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const deleteBacklinkUsage = async (usageId: number) => {
        if (!assetId) return;
        try {
            const response = await fetch(`${API_BASE}/assetLibrary/${assetId}/usage/backlinks/${usageId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete backlink usage');
            await fetchUsageData();
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    // Engagement Metrics Methods
    const updateEngagementMetrics = async (data: Partial<AssetEngagementMetrics>) => {
        if (!assetId) return;
        try {
            const response = await fetch(`${API_BASE}/assetLibrary/${assetId}/usage/metrics`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to update engagement metrics');
            await fetchUsageData();
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    return {
        usageData,
        loading,
        error,
        refetch: fetchUsageData,
        addWebsiteUsage,
        deleteWebsiteUsage,
        addSocialMediaUsage,
        updateSocialMediaUsage,
        deleteSocialMediaUsage,
        addBacklinkUsage,
        updateBacklinkUsage,
        deleteBacklinkUsage,
        updateEngagementMetrics
    };
}

export default useAssetUsage;
