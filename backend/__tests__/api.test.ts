import request from 'supertest';
import express from 'express';

// Increase timeout to avoid spurious failures when running full suite
(jest as any).setTimeout(10000);

// Mock Express app for testing
const app = express();
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Services endpoints
app.get('/api/services', (req, res) => {
    res.json([
        {
            id: 1,
            service_name: 'Test Service',
            service_code: 'SRV-001',
            status: 'Published',
            slug: 'test-service'
        }
    ]);
});

app.post('/api/services', (req, res) => {
    const { service_name, service_code } = req.body;
    if (!service_name || !service_code) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    res.status(201).json({
        id: 1,
        service_name,
        service_code,
        status: 'Draft',
        created_at: new Date().toISOString()
    });
});

describe('API Health & Services', () => {
    describe('GET /api/health', () => {
        it('should return health status', async () => {
            const res = await request(app).get('/api/health');
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('ok');
            expect(res.body.timestamp).toBeDefined();
        });
    });

    describe('GET /api/services', () => {
        it('should return list of services', async () => {
            const res = await request(app).get('/api/services');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('should have required service fields', async () => {
            const res = await request(app).get('/api/services');
            const service = res.body[0];
            expect(service).toHaveProperty('id');
            expect(service).toHaveProperty('service_name');
            expect(service).toHaveProperty('service_code');
            expect(service).toHaveProperty('status');
        });
    });

    describe('POST /api/services', () => {
        it('should create a new service', async () => {
            const res = await request(app)
                .post('/api/services')
                .send({
                    service_name: 'New Service',
                    service_code: 'SRV-002'
                });
            expect(res.status).toBe(201);
            expect(res.body.service_name).toBe('New Service');
            expect(res.body.service_code).toBe('SRV-002');
            expect(res.body.status).toBe('Draft');
        });

        it('should reject missing required fields', async () => {
            const res = await request(app)
                .post('/api/services')
                .send({ service_name: 'Incomplete' });
            expect(res.status).toBe(400);
            expect(res.body.error).toBeDefined();
        });
    });
});

