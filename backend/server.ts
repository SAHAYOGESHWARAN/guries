
import express from 'express';
import path from 'path';
import { createServer } from 'http';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';
import migrationRoutes from './routes/migration';
import { pool } from './config/db';
import { securityHeaders, httpsRedirect, removeSensitiveHeaders, validateSecurityConfig } from './config/security';
import { initSocket } from './socket';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { initializeDatabase, seedDatabase } from './database/init';

// Load environment variables
dotenv.config();

// Validate security configuration
validateSecurityConfig();

const app = express();
const httpServer = createServer(app);
const PORT = parseInt(process.env.PORT || process.env.API_PORT || '3001', 10);

// Setup Socket.io with restricted CORS
const socketAllowedOrigins = (process.env.SOCKET_CORS_ORIGINS || process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(origin => origin.trim());

const io = initSocket(httpServer, {
    cors: {
        origin: socketAllowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization']
    }
});

// Middleware
app.use(securityHeaders);
app.use(httpsRedirect);
app.use(removeSensitiveHeaders);

// CORS Configuration - Restrict to specific origins
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(origin => origin.trim());

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400
}));

app.use(morgan('dev') as any);
app.use(express.json({ limit: '100mb' }) as any);
app.use(express.urlencoded({ limit: '100mb', extended: true }) as any);

// Initialize PostgreSQL Database
const connectDB = async () => {
    try {
        // Test connection - try Postgres-style first, then fall back to SQLite-compatible query
        try {
            await pool.query('SELECT NOW()');
            console.log('✅ Connected to database (Postgres)');
        } catch (pgErr) {
            // Fallback for SQLite
            await pool.query("SELECT datetime('now')");
            console.log('✅ Connected to database (SQLite)');
        }

        // Initialize schema on startup (development only)
        if (process.env.NODE_ENV !== 'production') {
            try {
                console.log('🔄 Initializing database schema...');
                await initializeDatabase();
                await seedDatabase();
                console.log('✅ Database schema initialized');
            } catch (error: any) {
                console.warn('⚠️  Database initialization skipped:', error.message);
            }
        }
    } catch (err: any) {
        console.error('❌ Database connection failed:', err.message);
        (process as any).exit(1);
    }
};

// Real-time Connection Handler
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// API Routes
app.use('/api/v1', apiRoutes);
app.use('/api/migrations', migrationRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API health endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Backwards-compatible health route used by diagnostics and frontend
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// 404 Handler
app.use(notFoundHandler);

// Global Error Handler (must be last)
app.use(errorHandler);

// Start Server
let serverInstance: any = null;

const startServer = (portToTry: number) => {
    serverInstance = httpServer.listen(portToTry);

    serverInstance.on('listening', () => {
        const isTest = process.env.NODE_ENV === 'test' || typeof process.env.JEST_WORKER_ID !== 'undefined';
        if (!isTest) {
            console.log(`🚀 Server running on port ${portToTry}`);
        }
    });

    serverInstance.on('error', (err: any) => {
        const isTest = process.env.NODE_ENV === 'test' || typeof process.env.JEST_WORKER_ID !== 'undefined';
        if (err && err.code === 'EADDRINUSE') {
            if (isTest) {
                throw err;
            }

            console.warn(`Port ${portToTry} in use, trying ${portToTry + 1}...`);
            setTimeout(() => startServer(portToTry + 1), 200);
        } else {
            console.error('Server error:', err);
            (process as any).exit(1);
        }
    });
};

// Graceful shutdown
const gracefulShutdown = async () => {
    try {
        if (serverInstance && typeof serverInstance.close === 'function') {
            serverInstance.close();
        }
        if (io && typeof (io as any).close === 'function') {
            (io as any).close();
        }
        if (pool && typeof pool.end === 'function') {
            await pool.end();
        }
    } catch (e) {
        // ignore errors during shutdown
    }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('exit', gracefulShutdown);

const isTestEnv = process.env.NODE_ENV === 'test' || typeof process.env.JEST_WORKER_ID !== 'undefined';
connectDB().then(() => {
    if (!isTestEnv) {
        startServer(PORT);
    }
});

export { app, httpServer };

