/**
 * In-Memory Data Store for Vercel Serverless Functions
 * Stores data during the session for demo/testing purposes
 * Note: Data will be lost when the function instance is recycled
 */

interface StoredData {
    [key: string]: any[];
}

// Global data store (persists during function instance lifetime)
const dataStore: StoredData = {
    assets: [],
    keywords: [],
    projects: [],
    tasks: [],
    campaigns: [],
    services: [
        { id: 1, service_name: 'SEO Services', status: 'active' },
        { id: 2, service_name: 'Content Creation', status: 'active' }
    ],
    users: [
        { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin' }
    ],
    'asset-category-master': [],
    'asset-type-master': [],
    'sub-services': [],
    brands: [],
    content: [],
    notifications: []
};

let nextId: { [key: string]: number } = {
    assets: 1,
    keywords: 3,
    projects: 1,
    tasks: 1,
    campaigns: 1,
    'asset-category-master': 1,
    'asset-type-master': 1,
    'sub-services': 1,
    brands: 1,
    content: 1,
    notifications: 1
};

export function getAll(collection: string): any[] {
    return dataStore[collection] || [];
}

export function create(collection: string, data: any): any {
    if (!dataStore[collection]) {
        dataStore[collection] = [];
    }

    const id = nextId[collection] || 1;
    nextId[collection] = id + 1;

    const newItem = {
        ...data,
        id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    dataStore[collection].push(newItem);
    console.log(`[DataStore] Created ${collection} item:`, newItem);
    return newItem;
}

export function update(collection: string, id: number, data: any): any {
    if (!dataStore[collection]) {
        dataStore[collection] = [];
    }

    const index = dataStore[collection].findIndex(item => item.id === id);
    if (index === -1) {
        throw new Error(`Item with id ${id} not found in ${collection}`);
    }

    const updated = {
        ...dataStore[collection][index],
        ...data,
        id,
        updated_at: new Date().toISOString()
    };

    dataStore[collection][index] = updated;
    console.log(`[DataStore] Updated ${collection} item:`, updated);
    return updated;
}

export function remove(collection: string, id: number): boolean {
    if (!dataStore[collection]) {
        return false;
    }

    const index = dataStore[collection].findIndex(item => item.id === id);
    if (index === -1) {
        return false;
    }

    dataStore[collection].splice(index, 1);
    console.log(`[DataStore] Deleted ${collection} item with id ${id}`);
    return true;
}

export function getById(collection: string, id: number): any {
    if (!dataStore[collection]) {
        return null;
    }

    return dataStore[collection].find(item => item.id === id) || null;
}
