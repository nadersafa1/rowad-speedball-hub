# SpeedballHub - Rowad Club

A comprehensive web application for managing speedball sport data, specifically designed for Rowad club. The platform tracks players, manages test results, and provides analytics for the speedball solo event across different age groups and performance metrics.

## 🚀 One-Command Setup

```bash
git clone <repository-url>
cd rowad-speedball-hub
npm run setup
```

**That's it!** This will:
- ✅ Build and start all containers  
- ✅ Set up the database with migrations
- ✅ Seed realistic test data (25 players, 8 tests, 96 results)
- ✅ Start the development environment

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000  
- **PgAdmin**: http://localhost:8080 (admin@rowad.com / admin123)

## 🛠️ Manual Commands (Optional)

If you prefer step-by-step setup:

```bash
# Start containers only
npm run docker:dev

# Set up database with seed data (run after containers are up)
npm run db:setup

# Individual database commands
npm run db:migrate  # Run migrations only
npm run db:seed     # Seed data only
   npm run db:generate
   npm run db:migrate
   ```

### Production Deployment

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Deploy with Docker Compose**
   ```bash
   npm run docker:prod
   ```

## 🏗️ Architecture

### Monorepo Structure
```
rowad-speedball-hub/
├── apps/
│   ├── frontend/          # Next.js React application
│   └── backend/           # Express.js API server
├── packages/              # Shared packages (future use)
├── docker-compose.dev.yml # Development environment
├── docker-compose.yml     # Production environment
└── README.md
```

### Tech Stack

**Frontend:**
- Next.js 14 (React framework)
- TypeScript
- Tailwind CSS
- React Hook Form + Zod (form handling & validation)
- Zustand (state management)
- Lucide React (icons)

**Backend:**
- Express.js (Node.js web framework)
- TypeScript
- ts-rest (end-to-end type safety)
- Drizzle ORM (database toolkit)
- PostgreSQL (database)
- Express Session (authentication)

**Infrastructure:**
- Docker & Docker Compose
- Nginx (reverse proxy)
- Certbot (SSL certificates)

## 📊 Data Models

### Players
- Personal information (name, date of birth, gender)
- Auto-calculated age and age group
- Performance history and statistics

### Tests
- Three test types based on play/rest time:
  - **Type A**: 60 seconds play, 30 seconds rest
  - **Type B**: 30 seconds play, 30 seconds rest  
  - **Type C**: 30 seconds play, 60 seconds rest

### Test Results
- Four positions per test:
  - Left hand score
  - Right hand score
  - Forehand score
  - Backhand score
- Auto-calculated total score

## 🔐 Authentication

**Admin Access:**
- Email: `admin@rowad.com`
- Password: `Test@1234`
- Full CRUD access to all data

**Public Access:**
- Read-only access to all data
- No authentication required for viewing

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev                    # Start both frontend and backend
npm run dev:frontend          # Start only frontend
npm run dev:backend           # Start only backend

# Building
npm run build                 # Build both applications
npm run start                 # Start production server

# Docker
npm run docker:dev            # Start development environment
npm run docker:dev:down       # Stop development environment
npm run docker:prod           # Start production environment
npm run docker:prod:down      # Stop production environment

# Database
npm run db:generate           # Generate database migrations
npm run db:migrate            # Run database migrations
npm run db:studio             # Open Drizzle Studio

# Code Quality
npm run lint                  # Run linters
npm run type-check            # Run TypeScript checks
```

### Database Management

**Using Drizzle Studio:**
```bash
npm run db:studio
```

**Using PgAdmin (Development):**
- URL: http://localhost:8080
- Email: admin@rowad.com
- Password: admin123

**Manual Database Access:**
```bash
# Connect to development database
docker exec -it speedball-db-dev psql -U postgres -d speedball_hub
```

### API Endpoints

The API follows RESTful conventions with the following main endpoints:

```typescript
// Players
GET    /api/players              // Get all players
GET    /api/players/:id          // Get player by ID
POST   /api/players              // Create player (Admin only)
PUT    /api/players/:id          // Update player (Admin only)
DELETE /api/players/:id          // Delete player (Admin only)

// Tests
GET    /api/tests                // Get all tests
GET    /api/tests/:id            // Get test by ID
POST   /api/tests                // Create test (Admin only)
PUT    /api/tests/:id            // Update test (Admin only)
DELETE /api/tests/:id            // Delete test (Admin only)

// Results
GET    /api/results              // Get all results
GET    /api/results/player/:id   // Get results by player
GET    /api/results/test/:id     // Get results by test
POST   /api/results              // Create result (Admin only)
PUT    /api/results/:id          // Update result (Admin only)
DELETE /api/results/:id          // Delete result (Admin only)

// Authentication
POST   /api/auth/login           // Admin login
POST   /api/auth/logout          // Admin logout
GET    /api/auth/verify          // Verify admin session
```

## 🌐 Frontend Pages

### Public Pages
- **Home Page** (`/`): Overview and navigation
- **Players Archive** (`/players`): Complete list of players with search/filter
- **Tests Archive** (`/tests`): Complete list of tests with filters
- **Player Detail** (`/players/[id]`): Individual player information and history
- **Test Detail** (`/tests/[id]`): Test results with filtering and grouping options

### Admin Pages
- **Admin Dashboard** (`/admin`): Administrative interface for data management

## 🚢 Production Deployment

### 🚀 **READY FOR VPS DEPLOYMENT!**

**Complete production setup with Docker, Nginx, SSL, and automated deployment scripts.**

### Quick Deploy to VPS

```bash
# 1. Clone repository on your VPS
git clone <repository-url>
cd rowad-speedball-hub

# 2. Configure environment
cp env.production.example .env
nano .env  # Update with your secure values

# 3. Deploy with one command
./deploy.sh

# 4. Setup SSL certificates
./ssl-setup.sh
```

### 📋 **Deployment Files Included:**
- ✅ `docker-compose.yml` - Production Docker configuration
- ✅ `Dockerfile.backend` & `Dockerfile.frontend` - Optimized production builds
- ✅ `nginx.conf` - Nginx reverse proxy with SSL and security
- ✅ `deploy.sh` - Automated deployment script
- ✅ `ssl-setup.sh` - SSL certificate setup script
- ✅ `DEPLOYMENT.md` - Complete deployment guide
- ✅ `DEPLOYMENT-CHECKLIST.md` - Step-by-step checklist

### 🌐 **Production Features:**
- ✅ **SSL/HTTPS**: Automatic Let's Encrypt certificates
- ✅ **Security**: Rate limiting, security headers, firewall ready
- ✅ **Performance**: Gzip compression, static caching, optimized builds
- ✅ **Monitoring**: Health checks, logging, error handling
- ✅ **Scalability**: Separate frontend/backend containers

### 🎯 **Production URL:**
**https://rowad.speedballhub.com**

### 📖 **Deployment Documentation:**
- **Quick Start**: See `DEPLOYMENT-CHECKLIST.md`
- **Detailed Guide**: See `DEPLOYMENT.md`
- **Troubleshooting**: Included in deployment docs

### ⚙️ **VPS Requirements:**
- Ubuntu 20.04+ or CentOS 8+
- 2GB RAM minimum (4GB recommended)
- Docker & Docker Compose
- Domain pointing to VPS IP

## 🧪 Testing

(Testing setup will be implemented in Phase 5)

## 📈 Performance

- Target page load times: < 3 seconds
- Database query response times: < 500ms
- Target uptime: 99.9%

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions, contact the development team or create an issue in the repository.

---

**Rowad Club - SpeedballHub**  
*Comprehensive speedball sport data management platform*

