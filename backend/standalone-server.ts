import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// In-memory storage
const projects: any[] = [];
const tasks: any[] = [];
const users: any[] = [
    {
        id: 1,
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
        status: 'active'
    }
];

// Auth endpoints
app.post('/api/v1/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.password !== password) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (user.status === 'inactive') {
        return res.status(403).json({ success: false, error: 'User account is inactive' });
    }

    res.json({
        success: true,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status
        },
        token: 'mock-jwt-token-' + Date.now()
    });
});

app.post('/api/admin/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === 'admin');

    if (!user || user.password !== password) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (user.status === 'inactive') {
        return res.status(403).json({ success: false, error: 'User account is inactive' });
    }

    res.json({
        success: true,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status
        },
        token: 'mock-jwt-token-' + Date.now()
    });
});

// Projects endpoints
app.get('/api/v1/projects', (req, res) => {
    res.json({ success: true, data: projects, message: 'Projects retrieved successfully' });
});

app.post('/api/v1/projects', (req, res) => {
    const project = { id: Date.now(), ...req.body, created_at: new Date(), updated_at: new Date() };
    projects.push(project);
    res.json({ success: true, data: project, message: 'Project created successfully' });
});

app.get('/api/v1/projects/:id', (req, res) => {
    const project = projects.find(p => p.id === parseInt(req.params.id));
    if (!project) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: project });
});

app.put('/api/v1/projects/:id', (req, res) => {
    const project = projects.find(p => p.id === parseInt(req.params.id));
    if (!project) return res.status(404).json({ success: false, error: 'Not found' });
    Object.assign(project, req.body, { updated_at: new Date() });
    res.json({ success: true, data: project, message: 'Project updated successfully' });
});

app.delete('/api/v1/projects/:id', (req, res) => {
    const index = projects.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ success: false, error: 'Not found' });
    projects.splice(index, 1);
    res.json({ success: true, message: 'Project deleted successfully' });
});

// Tasks endpoints
app.get('/api/v1/tasks', (req, res) => {
    res.json({ success: true, data: tasks, message: 'Tasks retrieved successfully' });
});

app.post('/api/v1/tasks', (req, res) => {
    const task = { id: Date.now(), ...req.body, created_at: new Date(), updated_at: new Date() };
    tasks.push(task);
    res.json({ success: true, data: task, message: 'Task created successfully' });
});

app.get('/api/v1/tasks/:id', (req, res) => {
    const task = tasks.find(t => t.id === parseInt(req.params.id));
    if (!task) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: task });
});

app.put('/api/v1/tasks/:id', (req, res) => {
    const task = tasks.find(t => t.id === parseInt(req.params.id));
    if (!task) return res.status(404).json({ success: false, error: 'Not found' });
    Object.assign(task, req.body, { updated_at: new Date() });
    res.json({ success: true, data: task, message: 'Task updated successfully' });
});

app.delete('/api/v1/tasks/:id', (req, res) => {
    const index = tasks.findIndex(t => t.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ success: false, error: 'Not found' });
    tasks.splice(index, 1);
    res.json({ success: true, message: 'Task deleted successfully' });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
    console.log(`✅ Projects: http://localhost:${PORT}/api/v1/projects`);
    console.log(`✅ Tasks: http://localhost:${PORT}/api/v1/tasks`);
});

export { app };
