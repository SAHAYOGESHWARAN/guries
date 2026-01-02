
import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { db } from '../utils/storage';

// Use environment variable or default to relative path for production
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

// Map frontend collection names to API endpoints and socket events
const RESOURCE_MAP: Record<string, { endpoint: string, event: string }> = {
    tasks: { endpoint: 'tasks', event: 'task' },
    projects: { endpoint: 'projects', event: 'project' },
    campaigns: { endpoint: 'campaigns', event: 'campaign' },
    assetLibrary: { endpoint: 'assetLibrary', event: 'assetLibrary' },
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
    promotionItems: { endpoint: 'promotion-items', event: 'content' },
    // Configs & Masters
    effortTargets: { endpoint: 'effort-targets', event: 'effort_target' },
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
        const response = await fetch(`${API_BASE_URL}/users`, {
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
    // Initialize with local storage data immediately if available (Optimistic UI)
    const getInitialData = () => {
        try {
            if (collection === 'promotionItems') {
                const allContent = (db as any)['content']?.getAll() || [];
                return allContent.filter((i: any) => ['qc_passed', 'updated', 'ready_to_publish', 'published'].includes(i.status));
            } else if ((db as any)[collection]) {
                return (db as any)[collection].getAll() || [];
            }
        } catch (e) {
            return [];
        }
        return [];
    };

    const [data, setData] = useState<T[]>(getInitialData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOffline, setIsOffline] = useState(false);

    const resource = RESOURCE_MAP[collection];

    // Load data from local storage (Synchronous helper)
    const loadLocal = useCallback(() => {
        try {
            if (collection === 'promotionItems') {
                const allContent = (db as any)['content']?.getAll() || [];
                const filtered = allContent.filter((i: any) =>
                    ['qc_passed', 'updated', 'ready_to_publish', 'published'].includes(i.status)
                );
                setData(filtered);
            } else if ((db as any)[collection]) {
                const localData = (db as any)[collection].getAll() || [];
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

            console.log(`[useData] Fetching ${collection} from ${API_BASE_URL}/${resource.endpoint}`);

            const response = await fetch(`${API_BASE_URL}/${resource.endpoint}`, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                console.error(`[useData] API Error for ${collection}: ${response.status} ${response.statusText}`);
                throw new Error('API Error');
            }

            const result = await response.json();
            console.log(`[useData] Received ${collection}:`, Array.isArray(result) ? `${result.length} items` : result);

            // Only update data if we got a valid response (prevents flickering)
            if (Array.isArray(result)) {
                setData(result);
                // Also save to localStorage for offline access
                if ((db as any)[collection]) {
                    try {
                        localStorage.setItem((db as any)[collection].key, JSON.stringify(result));
                    } catch (e) {
                        // Ignore localStorage errors
                    }
                }
            }
            setIsOffline(false);
        } catch (err: any) {
            // If fetch fails or times out, we are effectively "offline" or backend is down.
            console.warn(`[useData] Fetch failed for ${collection}:`, err.message);

            // Only log if it's not an abort error
            if (err.name !== 'AbortError') {
                setIsOffline(true);
            }
            // Only load local if we don't have data yet (prevents flickering)
            if (data.length === 0) {
                loadLocal();
            }
        } finally {
            setLoading(false);
        }
    }, [collection, resource, loadLocal, data.length]);

    useEffect(() => {
        // Check backend availability first, then fetch data
        const initializeData = async () => {
            await checkBackendAvailability();
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
            const targetKey = collection === 'promotionItems' ? (db as any)['content']?.key : (db as any)[collection]?.key;

            if (targetKey && customEvent.detail?.key === targetKey) {
                loadLocal();
            }
        };
        window.addEventListener('local-storage-update', handleStorageChange);
        return () => window.removeEventListener('local-storage-update', handleStorageChange);

    }, [collection, resource, fetchData, loadLocal]);

    const create = async (item: any) => {
        console.log(`[useData] Creating ${collection} item:`, item);

        // 1. Optimistic Local Update
        let newItem = item;
        if ((db as any)[collection]) {
            newItem = (db as any)[collection].create(item);
        }

        // 2. Try Backend Sync and return server response if available (for real ID)
        let serverItem = null;
        if (resource && !isOffline) {
            try {
                console.log(`[useData] Sending POST to ${API_BASE_URL}/${resource.endpoint}`);
                const response = await fetch(`${API_BASE_URL}/${resource.endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item),
                });

                if (response.ok) {
                    serverItem = await response.json();
                    console.log(`[useData] Created ${collection} item on server:`, serverItem);
                } else {
                    const errorText = await response.text();
                    console.error(`[useData] Failed to create ${collection}:`, response.status, errorText);
                }
            } catch (e: any) {
                console.error(`[useData] Error creating ${collection}:`, e.message);
                setIsOffline(true);
            }
        }

        // 3. Immediately update state to reflect the new item
        const finalItem = serverItem || newItem;
        setData(prev => [finalItem, ...prev]);

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
                    serverItem = await response.json();
                }
            } catch (e) {
                setIsOffline(true);
            }
        }

        // Use server response if available, otherwise fall back to local update
        const finalItem = serverItem || updatedItem || { ...updates, id };

        // Immediately update state to reflect the changes
        setData(prev => prev.map(item => {
            if ((item as any).id === id) {
                return finalItem;
            }
            return item;
        }));

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

        // Immediately update state to remove the item
        setData(prev => prev.filter(item => (item as any).id !== id));
    };

    // Added refresh method explicitly exposing fetch (with isRefresh flag to prevent flickering)
    const refresh = useCallback(() => fetchData(true), [fetchData]);

    return { data, loading, error: isOffline ? null : error, create, update, remove, refresh };
}
