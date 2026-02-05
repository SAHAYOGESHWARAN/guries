# Guires - Marketing Control Center

A comprehensive enterprise-grade marketing management platform built with React, TypeScript, and Node.js.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Development

Start both servers:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3003/api/v1

### Login Credentials

```
Email: admin@example.com
Password: admin123
```

## 📁 Project Structure

```
guires-marketing-control-center/
├── backend/                 # Express.js API server
│   ├── controllers/        # Route controllers
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── config/            # Configuration files
│   ├── database/          # Database setup
│   └── migrations/        # Database migrations
├── frontend/              # React + Vite application
│   ├── components/        # React components
│   ├── views/            # Page views
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   └── styles/           # CSS styles
├── scripts/              # Utility scripts
└── tools/                # Development tools
```

## 🔧 Available Scripts

### Backend

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build TypeScript to JavaScript
npm start        # Start production server
npm test         # Run tests
```

### Frontend

```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run test     # Run tests
```

## 🗄️ Database

The application uses SQLite for development and can be configured for PostgreSQL in production.

### Database Setup

```bash
cd backend
npm run build
npm start
```

The database will be automatically initialized on first run.

## 🔐 Authentication

- JWT-based authentication
- Admin credentials stored in environment variables
- Secure password hashing with bcryptjs

## 📦 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables:
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `JWT_SECRET`
   - `DB_CLIENT`

4. Deploy

### Environment Variables

Create `.env` files in backend and frontend directories:

**Backend (.env)**
```
NODE_ENV=development
PORT=3003
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<bcrypt_hash>
JWT_SECRET=your-secret-key
DB_CLIENT=sqlite
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env.local)**
```
VITE_API_URL=http://localhost:3003/api/v1
VITE_ENVIRONMENT=development
```

## 🎯 Features

- **Asset Management** - Upload and manage marketing assets
- **SEO Tools** - SEO asset management and optimization
- **Analytics** - Performance tracking and reporting
- **QC Workflow** - Quality control review process
- **User Management** - Role-based access control
- **Real-time Updates** - Socket.io integration
- **Responsive Design** - Mobile-friendly interface

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📚 Documentation

- [API Documentation](./backend/README.md)
- [Frontend Guide](./frontend/README.md)
- [Database Schema](./backend/database/schema.sql)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## 📄 License

Proprietary - All rights reserved

## 📞 Support

For issues and questions, please contact the development team.

---

**Status**: ✅ Ready for Development & Deployment
