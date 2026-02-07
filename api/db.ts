// Mock in-memory database for Vercel deployment
// This provides a simple data store without external database dependencies

interface Asset {
  id: number;
  asset_name: string;
  asset_type?: string;
  asset_category?: string;
  asset_format?: string;
  content_type?: string;
  application_type?: string;
  status: string;
  qc_status?: string;
  file_url?: string;
  thumbnail_url?: string;
  file_size?: number;
  file_type?: string;
  seo_score?: number;
  grammar_score?: number;
  keywords?: string;
  workflow_stage: string;
  workflow_log?: string;
  linked_service_id?: number;
  linked_sub_service_id?: number;
  linked_service_ids?: string;
  linked_sub_service_ids?: string;
  static_service_links?: string;
  created_by?: number;
  updated_by?: number;
  repository?: string;
  created_at: string;
  updated_at: string;
}

interface QueryResult {
  rows: any[];
  rowCount: number;
}

// Global in-memory store
const globalForDb = global as any;

class MockPool {
  private assets: Map<number, Asset> = new Map();
  private nextAssetId: number = 1;
  private initialized: boolean = false;

  async query(text: string, params?: any[]): Promise<QueryResult> {
    // SELECT * FROM assets
    if (text.includes('SELECT * FROM assets')) {
      const assets = Array.from(this.assets.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      return { rows: assets, rowCount: assets.length };
    }

    // SELECT COUNT(*) as count FROM assets
    if (text.includes('SELECT COUNT(*) as count FROM assets')) {
      return { rows: [{ count: this.assets.size }], rowCount: 1 };
    }

    // SELECT NOW()
    if (text.includes('SELECT NOW()')) {
      return { rows: [{ now: new Date().toISOString() }], rowCount: 1 };
    }

    // INSERT INTO assets
    if (text.includes('INSERT INTO assets')) {
      const id = this.nextAssetId++;
      const asset: Asset = {
        id,
        asset_name: params?.[0] || 'Untitled',
        asset_type: params?.[1] || null,
        asset_category: params?.[2] || null,
        asset_format: params?.[3] || null,
        status: params?.[5] || 'draft',
        repository: params?.[6] || null,
        application_type: params?.[7] || null,
        content_type: params?.[8] || null,
        file_url: params?.[9] || null,
        thumbnail_url: params?.[10] || null,
        file_size: params?.[11] || null,
        file_type: params?.[12] || null,
        seo_score: params?.[13] || null,
        grammar_score: params?.[14] || null,
        keywords: params?.[15] || null,
        created_by: params?.[16] || null,
        linked_service_id: params?.[17] || null,
        linked_sub_service_id: params?.[18] || null,
        workflow_stage: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.assets.set(id, asset);
      return { rows: [asset], rowCount: 1 };
    }

    // UPDATE assets
    if (text.includes('UPDATE assets')) {
      const id = params?.[2];
      const asset = this.assets.get(id);
      if (asset) {
        if (params?.[0]) asset.asset_name = params[0];
        if (params?.[1]) asset.status = params[1];
        asset.updated_at = new Date().toISOString();
        return { rows: [asset], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    // DELETE FROM assets
    if (text.includes('DELETE FROM assets')) {
      const id = params?.[0];
      if (this.assets.has(id)) {
        this.assets.delete(id);
        return { rows: [{ id }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    }

    // Default response
    return { rows: [], rowCount: 0 };
  }

  async connect() {
    return this;
  }

  release() {
    // No-op for mock
  }
}

export const getPool = (): any => {
  if (!globalForDb.mockPool) {
    console.log('[DB] Creating mock in-memory pool');
    globalForDb.mockPool = new MockPool();
  }
  return globalForDb.mockPool;
};

export const initializeDatabase = async (): Promise<void> => {
  const pool = getPool();
  if (!pool.initialized) {
    console.log('[DB] Mock database initialized');
    pool.initialized = true;
  }
};

export const query = async (text: string, params?: any[]): Promise<any> => {
  const pool = getPool();
  return pool.query(text, params);
};
