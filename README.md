# Marketing Control Center


**Developed by**: sahayogeshwaran

---

## Overview

The Marketing Control Center is a comprehensive enterprise-level marketing management platform designed to streamline marketing operations, content management, campaign tracking, and team collaboration.

## Features

- 📊 **Dashboard & Analytics** - Real-time statistics and KPIs
- 📁 **Project Management** - Complete project lifecycle management
- 🎯 **Campaign Tracking** - Campaign planning and execution
- 📝 **Content Management** - Content repository with pipeline stages
- 🔗 **SEO & Backlinks** - Keyword and backlink management
- 📱 **Social Media** - SMM post creation and scheduling
- ✅ **Quality Control** - QC runs and compliance auditing
- 👥 **HR Management** - Employee performance and workload tracking
- ⚙️ **Configuration** - Comprehensive master tables
- 💬 **Communication Hub** - Email, voice, and knowledge base
- 🔌 **Integrations** - Third-party API integrations
- 🔄 **Real-time Updates** - Socket.IO powered live synchronization

## Technology Stack

### Frontend
- React 18.2.0
- TypeScript 5.0.2
- Vite 4.4.5
- Tailwind CSS 3.3.3
- Socket.IO Client

### Backend
- Node.js
- Express 4.18.2
- TypeScript 5.1.6
- PostgreSQL 14+
- Socket.IO 4.7.2

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd guires-marketing-control-center
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   ```

3. **Set up database**
   ```bash
   createdb mcc_db
   psql -U postgres -d mcc_db -f backend/db/schema.sql
   ```

4. **Configure environment variables**
   ```bash
   # Run setup script to create .env files
   npm run setup
   
   # Or manually:
   # Backend: Copy example and edit
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Frontend: Copy example and edit
   cd ..
   cp .env.example .env
   # Edit .env with your Google Gemini API key
   ```
   
   **Required API Keys**:
   - **Google Gemini AI**: Get from https://aistudio.google.com/app/apikey
   - **Twilio** (Optional): For OTP/SMS - Get from https://console.twilio.com/
   
   See **[ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)** for detailed setup instructions.

5. **Run the application**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

## Project Structure

```
guires-marketing-control-center/
├── frontend/
│   ├── views/          # 60+ page components
│   ├── components/     # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   └── utils/          # Utility functions
├── backend/
│   ├── controllers/    # 34+ controller files
│   ├── routes/         # API route definitions
│   ├── config/         # Configuration files
│   └── db/             # Database schema
└── database/
    └── schema.sql       # PostgreSQL schema
```

## Documentation

- **[PROJECT_REPORT.md](./PROJECT_REPORT.md)** - Comprehensive project report
- **[TESTING_DOCUMENTATION.md](./TESTING_DOCUMENTATION.md)** - Complete testing guide
- **[QUICK_TEST_GUIDE.md](./QUICK_TEST_GUIDE.md)** - Quick testing reference
- **[TEST_SUMMARY.md](./TEST_SUMMARY.md)** - Test results summary

## API Documentation

Base URL: `http://localhost:3001/api/v1`

### Key Endpoints
- `GET /dashboard/stats` - Dashboard statistics
- `GET /projects` - List projects
- `GET /campaigns` - List campaigns
- `GET /tasks` - List tasks
- `GET /content` - List content
- `GET /users` - List users

See [PROJECT_REPORT.md](./PROJECT_REPORT.md) for complete API documentation.

## Testing

### Run Automated Tests
```bash
node test-project.js
```

### Manual Testing
Follow the guide in [TESTING_DOCUMENTATION.md](./TESTING_DOCUMENTATION.md)

## Features Overview

### 60+ Frontend Pages
- Dashboard, Projects, Campaigns, Tasks, Assets
- Content Repository, Service Pages, SMM Posting
- Graphics Plan, On-Page Errors, Backlinks
- All Master Tables and Configuration Pages
- Analytics, HR, Communication, Knowledge Base

### 100+ API Endpoints
- Complete CRUD operations
- Analytics and reporting
- HR and employee management
- Communication and integrations
- Master table management

### 40+ Database Tables
- Complete PostgreSQL schema
- Proper relationships and constraints
- Indexes for performance
- JSON fields for flexibility

## Development

### Scripts
- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Consistent naming conventions

## Contributing

This project is developed and maintained by sahayogeshwaran.

## License

Private project - All rights reserved.

## Support

For issues or questions:
1. Check the documentation files
2. Review the testing guides
3. Contact the development team

---

**Version**: 2.5.0  
**Developed by**: sahayogeshwaran  


