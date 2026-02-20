
import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { db } from '../utils/storage';
import { dataCache } from './useDataCache';

// Use environment variable or default to relative path for production
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

// Map frontend collection names to API endpoints and socket events
const RESOURCE_MAP: Record<string, { endpoint: string, event: string }> = {
    tasks: { endpoint: 'tasks', event: 'task' },
    projects: { endpoint: 'projects', event: 'project' },
    campaigns: { endpoint: 'campaigns', event: 'campaign' },
    assetLibrary: { endpoint: 'assets', event: 'assetLibrary' },
    content: { endpoint: 'content', event: 'content' },
    smm: { endpoint: 'smm', event: 'smm_post' },
    graphics: { endpoint: 'graphics', event: 'graphic' },
    users: { endpoint: 'users', event: 'user' },
    roles: { endpoint: 'roles', event: 'role' }, // Added Role
    teams: { endpoint: 'teams', event: 'team' },
    teamMembers: { endpoint: 'team-members', event: 'team_member' },
    services: { endpoint: 'services', event: 'service' },
    subServices: { endpoint: 'sub-services', event: 'sub_service' },
    servicePages: { endpoint: 'service-pages', event: 'service_page' },
    keywords: { endpoint: 'keywords', event: 'keyword' },
    backlinkSources: { endpoint: 'backlink-sources', event: 'backlink_source' },
    backlinks: { endpoint: 'backlinks', event: 'backlink' },
    submissions: { endpoint: 'submissions', event: 'submission' },
    okrs: { endpoint: 'okrs', event: 'okr' },
    competitors: { endpoint: 'competitors', event: 'competitor' },
    competitorBacklinks: { endpoint: 'competitor-backlinks', event: 'competitor_backlink' },
    urlErrors: { endpoint: 'url-errors', event: 'url_error' },
    onPageSeoAudits: { endpoint: 'on-page-seo-audits', event: 'on_page_seo_audit' },
    toxicUrls: { endpoint: 'toxic-backlinks', event: 'toxic_backlink' },
    uxIssues: { endpoint: 'ux-issues', event: 'ux_issue' },
    qc: { endpoint: 'qc-runs', event: 'qc_run' },
    // Read-only view or filtered
    promotionItems: { endpoint: 'promotion-items', event: 'promotion_item' },
    effortTargets: { endpoint: 'effort-targets', event: 'effort_target' },
    performanceTargets: { endpoint: 'performance-targets', event: 'performance_target' },
    goldStandards: { endpoint: 'gold-standards', event: 'gold_standard' },
    industrySectors: { endpoint: 'industry-sectors', event: 'industry_sector' },
    contentTypes: { endpoint: 'content-types', event: 'content_type' },
    brands: { endpoint: 'brands', event: 'brand' },
    personas: { endpoint: 'personas', event: 'persona' },
    forms: { endpoint: 'forms', event: 'form' },
    assetTypes: { endpoint: 'asset-types', event: 'asset_type' },
    assetCategories: { endpoint: 'asset-categories', event: 'asset_category' },
    // Master tables (explicit endpoints)
    'asset-type-master': { endpoint: 'asset-type-master', event: 'asset_type_master' },
    'asset-category-master': { endpoint: 'asset-category-master', event: 'asset_category_master' },
    'asset-formats': { endpoint: 'asset-formats', event: 'asset_format' },
    'asset-format-master': { endpoint: 'asset-formats', event: 'asset_format' },
    platforms: { endpoint: 'platforms', event: 'platform' },
    countries: { endpoint: 'countries', event: 'country' },
    seoErrors: { endpoint: 'seo-errors', event: 'seo_error' },
    workflowStages: { endpoint: 'workflow-stages', event: 'workflow_stage' },
    qcChecklists: { endpoint: 'qc-checklists', event: 'qc_checklist' },
    qcVersions: { endpoint: 'qc-versions', event: 'qc_version' },
    qcWeightageConfigs: { endpoint: 'qc-weightage-configs', event: 'qc_weightage' }, // Added Weightage
    integrations: { endpoint: 'integrations', event: 'integration' },
    logs: { endpoint: 'logs', event: 'log' },
    // HR & AI
    workload: { endpoint: 'hr/workload', event: 'workload' },
    rewards: { endpoint: 'hr/rewards', event: 'reward' },
    evaluations: { endpoint: 'ai/evaluations', event: 'evaluation' },
    dashboardMetrics: { endpoint: 'analytics/dashboard-metrics', event: 'metric' },
    employeeRankings: { endpoint: 'hr/rankings', event: 'ranking' },
    // New Traffic Endpoint
    traffic: { endpoint: 'analytics/traffic', event: 'traffic_update' },
    // Communication
    emails: { endpoint: 'communication/emails', event: 'email' },
    voiceProfiles: { endpoint: 'communication/voice-profiles', event: 'voice_profile' },
    callLogs: { endpoint: 'communication/calls', event: 'call_log' },
    // Knowledge Base
    articles: { endpoint: 'knowledge/articles', event: 'article' },
    // Compliance
    complianceRules: { endpoint: 'compliance/rules', event: 'compliance_rule' },
    complianceAudits: { endpoint: 'compliance/audits', event: 'compliance_audit' },
    // Notifications
    notifications: { endpoint: 'notifications', event: 'notification' }
};

// Singleton socket instance to manage connection
let socketInstance: Socket | null = null;
let backendAvailable = true; // Default to true to attempt connection
let backendCheckDone = false;

// Check if running on Vercel (production) - WebSocket not supported
const isVercelProduction = typeof window !== 'undefined' && (
    window.location.hostname.includes('vercel.app') ||
    window.location.hostname.includes('guries')
);

// Reset backend check on page load
if (typeof window !== 'undefined') {
    backendCheckDone = false;
    backendAvailable = true;
}

// Check if backend is available before attempting socket connection
const checkBackendAvailability = async (): Promise<boolean> => {
    if (backendCheckDone) return backendAvailable;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

        // Use GET instead of HEAD for better compatibility
        const response = await fetch(`${API_BASE_URL}/health`, {
            signal: controller.signal,
            method: 'GET'
        });

        clearTimeout(timeoutId);
        backendAvailable = response.ok;
    } catch (e) {
        backendAvailable = false;
    }

    backendCheckDone = true;
    return backendAvailable;
};

const getSocket = () => {
    // Don't create socket on Vercel production - WebSocket not supported
    if (isVercelProduction) {
        return null;
    }

    // Don't create socket if backend is not available
    if (!backendAvailable) {
        return null;
    }

    if (!socketInstance) {
        try {
            socketInstance = io(SOCKET_URL, {
                reconnectionAttempts: 0, // No reconnection attempts
                timeout: 1000,
                autoConnect: false,
                transports: ['websocket', 'polling']
            });

            // Suppress all connection error logs
            socketInstance.on('connect_error', () => {
                backendAvailable = false;
            });

            socketInstance.on('error', () => {
                backendAvailable = false;
            });
        } catch (e) {
            // Silently fail
        }
    }
    return socketInstance;
};

export function useData<T>(collection: string) {
    // Initialize with cached data first, then local storage
    const getInitialData = () => {
        // Try global cache first
        const cachedData = dataCache.get<T>(collection);
        if (cachedData && cachedData.length > 0) {
            console.log(`[useData] Initializing ${collection} from cache with ${cachedData.length} items`);
            return cachedData;
        }

        // Fall back to local storage
        try {
            if ((db as any)[collection]) {
                const localData = (db as any)[collection].getAll() || [];
                console.log(`[useData] Initializing ${collection} from localStorage with ${localData.length} items`);
                return localData;
            }
        } catch (e) {
            console.warn(`[useData] Failed to initialize ${collection} from localStorage`);
        }
        return [];
    };

    const [data, setData] = useState<T[]>(getInitialData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOffline, setIsOffline] = useState(false);

    const resource = RESOURCE_MAP[collection];

    // Load data from cache or local storage (Synchronous helper)
    const loadLocal = useCallback(() => {
        try {
            // Try cache first
            const cachedData = dataCache.get<T>(collection);
            if (cachedData && cachedData.length > 0) {
                console.log(`[useData] Loading ${collection} from cache with ${cachedData.length} items`);
                setData(cachedData);
                return;
            }

            // Fall back to localStorage
            if ((db as any)[collection]) {
                const localData = (db as any)[collection].getAll() || [];
                console.log(`[useData] Loading ${collection} from localStorage with ${localData.length} items`);
                setData(localData);
            }
        } catch (e) {
            console.warn(`Local load failed for ${collection}`);
        }
    }, [collection]);

    const fetchData = useCallback(async (isRefresh = false) => {
        // If no endpoint (local only) or known offline, just ensure loading is false
        if (!resource) {
            loadLocal();
            setLoading(false);
            return;
        }

        // Don't set loading to true during refresh to prevent flickering
        if (!isRefresh) {
            // Keep existing data while loading initially
        }

        try {
            // Increased timeout for initial fetch
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s max wait

            if (isRefresh) {
                if (process.env.NODE_ENV === 'development') {
                    console.log(`[useData] Refreshing ${collection} from ${API_BASE_URL}/${resource.endpoint}`);
                }
            } else {
                if (process.env.NODE_ENV === 'development') {
                    console.log(`[useData] Fetching ${collection} from ${API_BASE_URL}/${resource.endpoint}`);
                }
            }

            const response = await fetch(`${API_BASE_URL}/${resource.endpoint}`, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                // Silently handle 404 for optional endpoints
                if (response.status === 404) {
                    console.warn(`[useData] Endpoint not found for ${collection} (404) - this is optional`);
                    // Don't clear data on 404, keep existing data
                    loadLocal();
                    setIsOffline(false);
                    setLoading(false);
                    return;
                }
                console.error(`[useData] API Error for ${collection}: ${response.status} ${response.statusText}`);
                throw new Error('API Error');
            }

            const result = await response.json();

            // Handle both array and object responses
            // API returns { success: true, data: [...] } or just [...]
            let dataArray = Array.isArray(result) ? result : (result?.data || result || []);

            if (process.env.NODE_ENV === 'development') {
                if (isRefresh) {
                    console.debug(`[useData] Refreshed ${collection}:`, Array.isArray(dataArray) ? `${dataArray.length} items` : 'non-array');
                } else {
                    console.debug(`[useData] Received ${collection}:`, Array.isArray(dataArray) ? `${dataArray.length} items` : 'non-array');
                }
            }

            // Only update data if we got a valid response (prevents flickering)
            if (Array.isArray(dataArray)) {
                // If API returns empty array but we have cached data, keep the cached data
                if (dataArray.length === 0 && data.length > 0) {
                    // Don't update state, keep existing data
                    setIsOffline(false);
                    setLoading(false);
                    return;
                }

                // Always update on refresh, or if we don't have data yet
                setData(dataArray);

                // Cache the data globally for persistence across routes
                dataCache.set(collection, dataArray);

                // Also save to localStorage for offline access
                if ((db as any)[collection]) {
                    try {
                        localStorage.setItem((db as any)[collection].key, JSON.stringify(dataArray));
                    } catch (e) {
                        // Ignore localStorage errors
                    }
                }
            } else {
                console.warn(`[useData] dataArray is not an array for ${collection}:`, dataArray);
                // Keep existing data if response is invalid
                loadLocal();
            }
            setIsOffline(false);
        } catch (err: any) {
            // If fetch fails or times out, we are effectively "offline" or backend is down.
            console.warn(`[useData] Fetch failed for ${collection}:`, err.message);

            // Only log if it's not an abort error
            if (err.name !== 'AbortError') {
                setIsOffline(true);
            }
            // Load local data to preserve what we have
            loadLocal();
        } finally {
            setLoading(false);
        }
    }, [collection, resource, loadLocal, data.length]);

    useEffect(() => {
        // Check backend availability first, then fetch data
        const initializeData = async () => {
            console.log(`[useData] Initializing data for ${collection}`);
            await checkBackendAvailability();
            console.log(`[useData] Backend available: ${backendAvailable}`);
            fetchData();
        };

        initializeData();

        // Skip socket connection on Vercel production
        if (isVercelProduction) {
            return;
        }

        // Only attempt socket connection if backend is available
        if (!backendAvailable) {
            setIsOffline(true);
            return;
        }

        const socket = getSocket();

        if (resource && socket) {
            // Only try to connect if backend is available
            if (!socket.connected) {
                try {
                    socket.connect();
                } catch (e) {
                    // Silently fail - we're in offline mode
                    setIsOffline(true);
                }
            }

            const handleCreate = (newItem: T) => {
                setData(prev => [newItem, ...prev]);
            };

            const handleUpdate = (updatedItem: T & { id: number | string }) => {
                setData(prev => prev.map(item => (item as any).id === updatedItem.id ? updatedItem : item));
            };

            const handleDelete = ({ id }: { id: number | string }) => {
                setData(prev => prev.filter(item => (item as any).id !== id));
            };

            socket.on(`${resource.event}_created`, handleCreate);
            socket.on(`${resource.event}_updated`, handleUpdate);
            socket.on(`${resource.event}_deleted`, handleDelete);
            socket.on('connect_error', () => {
                setIsOffline(true);
                backendAvailable = false;
                socket.disconnect();
            });

            return () => {
                socket.off(`${resource.event}_created`, handleCreate);
                socket.off(`${resource.event}_updated`, handleUpdate);
                socket.off(`${resource.event}_deleted`, handleDelete);
            };
        }

        // Always listen to local storage events for optimistic UI / offline updates
        const handleStorageChange = (e: Event) => {
            const customEvent = e as CustomEvent;
            const targetKey = (db as any)[collection]?.key;

            if (targetKey && customEvent.detail?.key === targetKey) {
                loadLocal();
            }
        };
        window.addEventListener('local-storage-update', handleStorageChange);
        return () => window.removeEventListener('local-storage-update', handleStorageChange);

    }, [collection, resource, fetchData, loadLocal]);

    const create = async (item: any) => {

        // 1. Optimistic Local Update
        let newItem = item;
        if ((db as any)[collection]) {
            newItem = (db as any)[collection].create(item);
        }

        // 2. Try Backend Sync and return server response if available (for real ID)
        let serverItem = null;
        if (resource && !isOffline) {
            try {
                const response = await fetch(`${API_BASE_URL}/${resource.endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                    console.error(`[useData] API error response:`, errorData);

                    // Create error object with validation errors if present
                    const error: any = new Error(errorData.message || errorData.error || 'Failed to create item');
                    if (errorData.validationErrors) {
                        error.validationErrors = errorData.validationErrors;
                    }
                    throw error;
                }

                const responseData = await response.json();


                // Extract the actual item from various response formats
                // Try: asset (for assets), data (for wrapped responses), or use directly
                let extracted = responseData.asset || responseData.data || responseData;

                // If extracted is still an array, take the first element
                if (Array.isArray(extracted)) {
                    extracted = extracted[0];
                }

                serverItem = extracted;


                // Validate that we got an ID back
                if (!serverItem || typeof serverItem !== 'object') {
                    console.error(`[useData] Server response invalid - not an object:`, responseData);
                    throw new Error('Server did not return valid item');
                }

                // Check all possible ID fields
                const hasId = serverItem.id || serverItem.lastID || serverItem.last_insert_rowid;

                if (!hasId) {
                    console.error(`[useData] Server response missing ID - object keys:`, Object.keys(serverItem), 'Full object:', JSON.stringify(serverItem, null, 2));
                    throw new Error('Server did not return item ID');
                }

                // Use any available ID field
                if (!serverItem.id) {
                    serverItem.id = serverItem.lastID || serverItem.last_insert_rowid;
                }

            } catch (e: any) {
                console.error(`[useData] Error creating ${collection}:`, e.message);
                setIsOffline(true);
                throw e; // Re-throw so caller knows creation failed
            }
        }

        // 3. Immediately update state and persist
        const finalItem = serverItem || newItem;

        // Update cache first
        dataCache.applyOptimisticCreate(collection, finalItem);

        setData(prev => {
            const updated = [finalItem, ...prev];
            // Persist to localStorage for offline/refresh
            if ((db as any)[collection]) {
                try {
                    localStorage.setItem((db as any)[collection].key, JSON.stringify(updated));
                } catch (e) { /* ignore */ }
            }
            return updated;
        });

        return finalItem;
    };

    const update = async (id: number | string, updates: any) => {
        let updatedItem = null;
        if ((db as any)[collection]) {
            updatedItem = (db as any)[collection].update(id, updates);
        }

        // Try backend sync and await the response for proper persistence
        let serverItem = null;
        if (resource && !isOffline) {
            try {
                const response = await fetch(`${API_BASE_URL}/${resource.endpoint}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates),
                });
                if (response.ok) {
                    const json = await response.json();
                    serverItem = json.data ?? json.asset ?? json;
                }
            } catch (e) {
                setIsOffline(true);
            }
        }

        // Use server response if available, otherwise fall back to local update
        const finalItem = serverItem || updatedItem || { ...updates, id };

        // Update cache first
        dataCache.applyOptimisticUpdate(collection, finalItem);

        // Immediately update state and persist
        setData(prev => {
            const updated = prev.map(item => ((item as any).id === id ? finalItem : item));
            if ((db as any)[collection]) {
                try {
                    localStorage.setItem((db as any)[collection].key, JSON.stringify(updated));
                } catch (e) { /* ignore */ }
            }
            return updated;
        });

        return finalItem;
    };

    const remove = async (id: number | string) => {
        if ((db as any)[collection]) {
            (db as any)[collection].delete(id);
        }

        // Await backend delete for proper persistence
        if (resource && !isOffline) {
            try {
                const response = await fetch(`${API_BASE_URL}/${resource.endpoint}/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok && response.status !== 204) {
                    const errorData = await response.json().catch(() => ({ error: 'Delete failed' }));
                    throw new Error(errorData.error || 'Failed to delete');
                }
            } catch (e: any) {
                if (e.message !== 'Failed to fetch') {
                    throw e; // Re-throw non-network errors
                }
                setIsOffline(true);
            }
        }

        // Apply optimistic delete to cache first
        dataCache.applyOptimisticDelete(collection, id);

        // Immediately update state to remove the item
        setData(prev => prev.filter(item => (item as any).id !== id));
    };

    // Added refresh method explicitly exposing fetch (with isRefresh flag to prevent flickering)
    const refresh = useCallback(() => fetchData(true), [fetchData]);

    return { data, loading, error: isOffline ? null : error, create, update, remove, refresh };
}
