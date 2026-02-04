
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

type PoolLike = {
    query: (sql: string, params?: any[]) => Promise<{ rows?: any[]; info?: any }>;
    end: () => Promise<void> | void;
    on?: (evt: string, cb: any) => void;
};

let pool: any;

if ((process.env.DB_CLIENT || '').toLowerCase() === 'pg' || process.env.USE_PG === 'true') {
    // Use Postgres Pool when explicitly requested
    const { Pool } = require('pg');
    const pgPool = new Pool({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'mcc_db',
        password: process.env.DB_PASSWORD || 'password',
        port: parseInt(process.env.DB_PORT || '5432'),
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });

    pgPool.on('error', (err: any) => {
        console.error('Unexpected Postgres pool error', err);
        if (process.env.NODE_ENV === 'production') (process as any).exit(-1);
    });

    pool = pgPool as any;
} else if (process.env.NODE_ENV === 'production') {
    // Use mock database for production to ensure compatibility
    console.log('🔄 Using mock database for production deployment');
    const mockPool = require('./mockDb').mockPool;
    pool = mockPool;
} else {
    // Use mock database for development/testing
    const mockPool = require('./mockDb').mockPool;
    pool = mockPool;
}

export { pool };

