/**
 * Database Helper - Unified interface for PostgreSQL operations
 * Provides consistent API across all controllers
 */

import { pool } from '../config/db';

export interface QueryResult<T = any> {
    rows: T[];
    rowCount: number;
}

/**
 * Execute SELECT query
 */
export const query = async <T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> => {
    try {
        const result = await pool.query(sql, params);
        return {
            rows: result.rows as T[],
            rowCount: result.rowCount || 0
        };
    } catch (error: any) {
        console.error('Database query error:', error.message, { sql, params });
        throw error;
    }
};

/**
 * Execute INSERT/UPDATE/DELETE query
 */
export const execute = async (sql: string, params: any[] = []): Promise<{ changes: number; lastID?: number }> => {
    try {
        const result = await pool.query(sql, params);
        return {
            changes: result.rowCount || 0,
            lastID: result.rows[0]?.id
        };
    } catch (error: any) {
        console.error('Database execute error:', error.message, { sql, params });
        throw error;
    }
};

/**
 * Get single row
 */
export const queryOne = async <T = any>(sql: string, params: any[] = []): Promise<T | null> => {
    try {
        const result = await pool.query(sql, params);
        return (result.rows[0] as T) || null;
    } catch (error: any) {
        console.error('Database queryOne error:', error.message, { sql, params });
        throw error;
    }
};

/**
 * Begin transaction
 */
export const beginTransaction = async () => {
    try {
        await pool.query('BEGIN TRANSACTION');
    } catch (error: any) {
        console.error('Transaction begin error:', error.message);
        throw error;
    }
};

/**
 * Commit transaction
 */
export const commit = async () => {
    try {
        await pool.query('COMMIT');
    } catch (error: any) {
        console.error('Transaction commit error:', error.message);
        throw error;
    }
};

/**
 * Rollback transaction
 */
export const rollback = async () => {
    try {
        await pool.query('ROLLBACK');
    } catch (error: any) {
        console.error('Transaction rollback error:', error.message);
        throw error;
    }
};

/**
 * Execute transaction with callback
 */
export const transaction = async <T>(callback: () => Promise<T>): Promise<T> => {
    try {
        await beginTransaction();
        const result = await callback();
        await commit();
        return result;
    } catch (error) {
        await rollback();
        throw error;
    }
};

