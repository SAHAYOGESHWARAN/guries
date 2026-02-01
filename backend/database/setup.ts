#!/usr/bin/env ts-node
/**
 * Database Setup Script
 * Run this script to initialize the database
 * 
 * Usage:
 *   npm run db:init      - Initialize schema
 *   npm run db:seed      - Seed initial data
 *   npm run db:reset     - Reset database (drop and reinitialize)
 */

import { initializeDatabase, seedDatabase, resetDatabase } from './init';

const command = process.argv[2] || 'init';

const run = async () => {
    try {
        switch (command) {
            case 'init':
                await initializeDatabase();
                break;
            case 'seed':
                await seedDatabase();
                break;
            case 'reset':
                await resetDatabase();
                break;
            default:
                console.log('Unknown command:', command);
                console.log('Available commands: init, seed, reset');
                process.exit(1);
        }
        process.exit(0);
    } catch (error) {
        console.error('Setup failed:', error);
        process.exit(1);
    }
};

run();
