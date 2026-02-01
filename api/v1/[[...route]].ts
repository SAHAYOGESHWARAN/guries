import { VercelRequest, VercelResponse } from '@vercel/node';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Initialize Express app
const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'HEAD', 'OPTIONS', 'PATCH', 'DELETE', 'POST', 'PUT'],
    allowedHeaders: ['X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Content-Type', 'Date', 'X-Api-Version', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production'
    });
});

// API Routes - Import from backend controllers
// These will be implemented based on your existing backend structure

// Example: QC Review endpoints
app.get('/api/v1/qc-reviews', (req, res) => {
    res.json({ message: 'QC Reviews endpoint', data: [] });
});

app.post('/api/v1/qc-reviews', (req, res) => {
    res.json({ message: 'Create QC Review', data: req.body });
});

// Example: Assets endpoints
app.get('/api/v1/assets', (req, res) => {
    res.json({ message: 'Assets endpoint', data: [] });
});

app.post('/api/v1/assets', (req, res) => {
    res.json({ message: 'Create Asset', data: req.body });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        path: req.path,
        method: req.method
    });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        status: err.status || 500
    });
});

// Vercel serverless handler
export default (req: VercelRequest, res: VercelResponse) => {
    return app(req, res);
};
