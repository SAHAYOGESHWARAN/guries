
import express from 'express';
import path from 'path';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';
import migrationRoutes from './routes/migration';
import { db, initDatabase } from './config/db-sqlite';
import { initSocket } from './socket';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = parseInt(process.env.PORT || '3003', 10);

// Setup Socket.io
const io = initSocket(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

// Middleware
app.use(helmet() as any);
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(morgan('dev') as any);
app.use(express.json({ limit: '100mb' }) as any); // Increased limit for file uploads
app.use(express.urlencoded({ limit: '100mb', extended: true }) as any);

// Initialize SQLite Database
const connectDB = async () => {
    try {
        initDatabase();
        console.log('✅ Connected to SQLite Database');
    } catch (err) {
        console.error('❌ Database initialization failed:', err);
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

// Global Error Handling
app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start Server
const startServer = (portToTry: number) => {
    const server = httpServer.listen(portToTry);

    server.on('listening', () => {
        console.log(`🚀 Server running on port ${portToTry}`);
    });

    server.on('error', (err: any) => {
        if (err && err.code === 'EADDRINUSE') {
            console.warn(`Port ${portToTry} in use, trying ${portToTry + 1}...`);
            // try next port
            setTimeout(() => startServer(portToTry + 1), 200);
        } else {
            console.error('Server error:', err);
            (process as any).exit(1);
        }
    });
};

connectDB().then(() => {
    startServer(PORT);
});
