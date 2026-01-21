/**
 * Database Helper - Unified interface for SQLite operations
 * Provides consistent API across all controllers
 */

import { db } from '../config/db-sqlite';

export interface QueryResult<T = any> {
    rows: T[];
    rowCount: number;
}

/**
 * Execute SELECT query
 */
export const query = <T = any>(sql: string, params: any[] = []): QueryResult<T> => {
    try {
        const stmt = db.prepare(sql);
        const rows = stmt.all(...params) as T[];
        return {
            rows,
            rowCount: rows.length
        };
    } catch (error: any) {
        console.error('Database query error:', error.message, { sql, params });
        throw error;
    }
};

/**
 * Execute INSERT/UPDATE/DELETE query
 */
export const execute = (sql: string, params: any[] = []): { changes: number; lastID?: number } => {
    try {
        const stmt = db.prepare(sql);
        const result = stmt.run(...params);
        return {
            changes: result.changes,
            lastID: result.lastInsertRowid as number
        };
    } catch (error: any) {
        console.error('Database execute error:', error.message, { sql, params });
        throw error;
    }
};

/**
 * Get single row
 */
export const queryOne = <T = any>(sql: string, params: any[] = []): T | null => {
    try {
        const stmt = db.prepare(sql);
        const row = stmt.get(...params) as T | undefined;
        return row || null;
    } catch (error: any) {
        console.error('Database queryOne error:', error.message, { sql, params });
        throw error;
    }
};

/**
 * Begin transaction
 */
export const beginTransaction = () => {
    try {
        db.exec('BEGIN TRANSACTION');
    } catch (error: any) {
        console.error('Transaction begin error:', error.message);
        throw error;
    }
};

/**
 * Commit transaction
 */
export const commit = () => {
    try {
        db.exec('COMMIT');
    } catch (error: any) {
        console.error('Transaction commit error:', error.message);
        throw error;
    }
};

/**
 * Rollback transaction
 */
export const rollback = () => {
    try {
        db.exec('ROLLBACK');
    } catch (error: any) {
        console.error('Transaction rollback error:', error.message);
        throw error;
    }
};

/**
 * Execute transaction with callback
 */
export const transaction = <T>(callback: () => T): T => {
    try {
        beginTransaction();
        const result = callback();
        commit();
        return result;
    } catch (error) {
        rollback();
        throw error;
    }
};
