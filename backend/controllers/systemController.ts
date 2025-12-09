import { Request, Response } from 'express';
import { pool } from '../config/db-sqlite';
import os from 'os';

export const getSystemStats = async (req: any, res: any) => {
    try {
        // DB Health Check
        const start = Date.now();
        await pool.query('SELECT 1');
        const dbLatency = Date.now() - start;

        // System Metrics
        const memoryUsage = (process as any).memoryUsage();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memPercentage = Math.round((usedMem / totalMem) * 100);
        
        // Mock CPU Load (Node.js doesn't give instant CPU % easily without libs, using loadavg)
        const loadAvg = os.loadavg()[0]; // 1 minute load average
        const cpuPercentage = Math.min(100, Math.round(loadAvg * 10)); // Rough approximation for display

        const stats = {
            uptime: (process as any).uptime(),
            timestamp: new Date().toISOString(),
            resources: {
                memory: {
                    used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                    total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                    percentage: memPercentage
                },
                cpu: {
                    load: loadAvg,
                    percentage: cpuPercentage
                }
            },
            health: {
                dbStatus: 'Connected',
                dbLatency: dbLatency,
                apiStatus: 'Operational'
            }
        };

        res.status(200).json(stats);
    } catch (error: any) {
        res.status(500).json({ 
            error: 'System check failed', 
            details: error.message,
            health: { dbStatus: 'Disconnected', apiStatus: 'Degraded' }
        });
    }
};
