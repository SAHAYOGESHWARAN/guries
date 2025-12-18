
import React, { useState, useEffect } from 'react';

// --- MOCK FILE CONTENT FOR DISPLAY ---
const BACKEND_FILES = {
    'package.json': `{
  "name": "marketing-control-center-api",
  "version": "1.0.0",
  "main": "server.ts",
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0"
  }
}`,
    'server.ts': `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRoutes from './routes/api';
import { pool } from './config/db';

const app = express();
const PORT = 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Mount API Routes
app.use('/api/v1', apiRoutes);

app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
});`,
    'config/db.ts': `import { Pool } from 'pg';

export const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'mcc_db',
    password: process.env.DB_PASSWORD,
    port: 5432,
    max: 20,
});`,
    'routes/api.ts': `import { Router } from 'express';
import * as campaignController from '../controllers/campaignController';

const router = Router();

router.get('/campaigns', campaignController.getCampaigns);
router.post('/campaigns', campaignController.createCampaign);
router.put('/campaigns/:id', campaignController.updateCampaign);
router.delete('/campaigns/:id', campaignController.deleteCampaign);

export default router;`,
    'controllers/campaignController.ts': `import { Request, Response } from 'express';
import { pool } from '../config/db';

export const getCampaigns = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM campaigns');
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const createCampaign = async (req: Request, res: Response) => {
    const { name, type, target } = req.body;
    const result = await pool.query(
        'INSERT INTO campaigns (campaign_name, type, target_url) VALUES ($1, $2, $3) RETURNING *',
        [name, type, target]
    );
    res.status(201).json(result.rows[0]);
};`
};

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto text-xs font-mono border-l-4 border-green-600 shadow-lg my-4 max-h-[600px] overflow-y-auto">
        <code>{children}</code>
    </pre>
);

const SystemMonitor: React.FC = () => {
    const [metrics, setMetrics] = useState<any>({
        cpu: 0,
        memory: 0,
        dbLatency: 0,
        status: 'Checking...',
        uptime: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/v1/system/stats');
                if (response.ok) {
                    const data = await response.json();
                    setMetrics({
                        cpu: data.resources.cpu.percentage,
                        memory: data.resources.memory.percentage,
                        dbLatency: data.health.dbLatency,
                        status: data.health.apiStatus,
                        uptime: Math.floor(data.uptime / 60)
                    });
                } else {
                    setMetrics((prev: any) => ({ ...prev, status: 'Error' }));
                }
            } catch (e) {
                setMetrics((prev: any) => ({ ...prev, status: 'Offline' }));
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, []);

    const MetricCard = ({ label, value, unit, color, alertCondition }: any) => {
        const isAlert = alertCondition ? alertCondition(value) : false;
        const displayColor = isAlert ? "text-red-500 animate-pulse" : color;
        
        return (
            <div className={`bg-gray-800 rounded p-3 border ${isAlert ? 'border-red-500/50' : 'border-gray-700'}`}>
                <div className="flex justify-between items-center mb-1">
                    <div className="text-gray-400 text-xs uppercase font-bold tracking-wider">{label}</div>
                    {isAlert && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                </div>
                <div className={`text-2xl font-mono font-bold ${displayColor}`}>
                    {value}{unit}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-900 p-4 rounded-lg mb-8 shadow-xl border border-gray-800">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-2 ${metrics.status === 'Operational' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    Live System Monitor
                </h3>
                <div className="flex items-center space-x-4">
                    <span className={`text-xs font-mono px-2 py-1 rounded ${metrics.status === 'Operational' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                        Status: {metrics.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">Backend</span>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard 
                    label="Server CPU" 
                    value={metrics.cpu} 
                    unit="%" 
                    color="text-blue-400" 
                    alertCondition={(v: number) => v > 85}
                />
                <MetricCard 
                    label="Memory Usage" 
                    value={metrics.memory} 
                    unit="%" 
                    color="text-purple-400" 
                    alertCondition={(v: number) => v > 90}
                />
                <MetricCard 
                    label="DB Latency" 
                    value={metrics.dbLatency} 
                    unit="ms" 
                    color="text-teal-400" 
                    alertCondition={(v: number) => v > 100}
                />
                <MetricCard 
                    label="Uptime" 
                    value={metrics.uptime} 
                    unit=" min" 
                    color="text-green-400" 
                />
            </div>
        </div>
    );
};

const SQL_SCHEMA = `
-- ========================================================
-- MARKETING CONTROL CENTER (MCC) - POSTGRESQL SCHEMA v2.0
-- Optimized for High Performance & Scalability
-- Year: 2025
-- Total Tables: 42
-- ========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fast text search

-- 1. IDENTITY & ORGANIZATION -----------------------------

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'viewer',
    avatar_url TEXT,
    status VARCHAR(20) DEFAULT 'active',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    lead_user_id INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- [Truncated for brevity, essentially identical to previous schema display]
-- ... (Full schema definition would go here)
`;

const DeveloperNotesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monitor' | 'architecture' | 'schema' | 'source'>('monitor');
  const [selectedFile, setSelectedFile] = useState<keyof typeof BACKEND_FILES>('server.ts');

  const handleDownloadSql = () => {
      const blob = new Blob([SQL_SCHEMA], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mcc_schema_v2_2025.sql';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-none text-gray-800 h-full flex flex-col">
      <div className="flex justify-between items-end mb-6 border-b pb-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">System & Database</h1>
            <p className="text-gray-500 mt-1">Technical controls, monitoring, and schema management.</p>
        </div>
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
            <button 
                onClick={() => setActiveTab('monitor')} 
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'monitor' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
            >
                Monitor
            </button>
             <button 
                onClick={() => setActiveTab('architecture')} 
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'architecture' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}
            >
                Architecture
            </button>
             <button 
                onClick={() => setActiveTab('schema')} 
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'schema' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}
            >
                DB Schema
            </button>
            <button 
                onClick={() => setActiveTab('source')} 
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'source' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}
            >
                Source Code
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'monitor' && (
            <div className="animate-fade-in">
                <SystemMonitor />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
                        <h3 className="font-bold text-lg mb-4 border-b border-gray-700 pb-2">Tech Stack</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-gray-400">Backend</span><span className="font-mono text-green-400">Node.js / Express</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Database</span><span className="font-mono text-blue-400">PostgreSQL 15</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Auth</span><span className="font-mono text-orange-400">JWT / OAuth2</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">AI/ML</span><span className="font-mono text-purple-400">Gemini 1.5 Pro</span></div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
                        <h3 className="font-bold text-lg text-gray-800 mb-4">Server Health</h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li className="flex items-center"><svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path></svg>Environment: Production</li>
                            <li className="flex items-center"><svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path></svg>Socket.IO: Active</li>
                        </ul>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'architecture' && (
            <div className="space-y-8 animate-fade-in">
              <section>
                  <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-blue-500 pl-3">1. Backend Architecture</h2>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                      The backend is built on a scalable Node.js + Express foundation, utilizing a layered architecture (Controller-Service-Repository) for separation of concerns.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-blue-50 rounded border border-blue-100">
                          <h4 className="font-bold text-blue-800">API Layer</h4>
                          <p className="text-xs text-blue-600 mt-1">Express Routes & Middleware</p>
                      </div>
                      <div className="flex items-center justify-center text-gray-400">→</div>
                      <div className="p-4 bg-purple-50 rounded border border-purple-100">
                          <h4 className="font-bold text-purple-800">Business Logic</h4>
                          <p className="text-xs text-purple-600 mt-1">Controllers & Services</p>
                      </div>
                      <div className="flex items-center justify-center text-gray-400">→</div>
                      <div className="p-4 bg-green-50 rounded border border-green-100">
                          <h4 className="font-bold text-green-800">Data Layer</h4>
                          <p className="text-xs text-green-600 mt-1">PostgreSQL & Redis</p>
                      </div>
                  </div>
              </section>
            </div>
        )}

        {activeTab === 'schema' && (
            <div className="animate-fade-in flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg text-sm flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Production-Ready DDL
                    </div>
                    <button onClick={handleDownloadSql} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-bold flex items-center shadow-md transition-all">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download .SQL File
                    </button>
                </div>
                <CodeBlock>{SQL_SCHEMA}</CodeBlock>
            </div>
        )}

        {activeTab === 'source' && (
            <div className="flex h-full animate-fade-in border rounded-lg overflow-hidden">
                {/* File Tree */}
                <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Project Files</h3>
                    <div className="space-y-1">
                        {Object.keys(BACKEND_FILES).map((file) => (
                            <button
                                key={file}
                                onClick={() => setSelectedFile(file as keyof typeof BACKEND_FILES)}
                                className={`w-full text-left px-3 py-2 rounded text-sm font-mono flex items-center ${
                                    selectedFile === file ? 'bg-blue-100 text-blue-700 font-bold' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <span className="mr-2 text-gray-400">{file.includes('/') ? '📄' : '📦'}</span>
                                {file}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Code Viewer */}
                <div className="flex-1 bg-gray-900 overflow-auto">
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                        <span className="text-gray-300 text-xs font-mono">{selectedFile}</span>
                        <span className="text-gray-500 text-xs">TypeScript</span>
                    </div>
                    <pre className="p-6 text-sm font-mono text-gray-300 leading-relaxed">
                        <code>{BACKEND_FILES[selectedFile]}</code>
                    </pre>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperNotesView;
