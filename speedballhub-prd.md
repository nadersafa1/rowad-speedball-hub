# SpeedballHub - Product Requirements Document

## 1. Project Overview

### 1.1 Project Name
SpeedballHub

### 1.2 Project Description
A comprehensive web application for managing speedball sport data, specifically designed for Rowad club. The platform will track players, manage test results, and provide analytics for the speedball solo event across different age groups and performance metrics.

### 1.3 Deployment
- **Domain**: rowad.speedballhub.com
- **Environment**: Production VPS with Docker containerization

## 2. Technical Stack

### 2.1 Architecture
- **Monorepo Structure**: Single repository containing frontend and backend
- **Frontend**: Next.js (React-based framework)
- **Backend**: Express.js (Node.js web framework)
- **Database**: PostgreSQL (Relational database)
- **ORM**: Drizzle (Type-safe database toolkit)
- **API**: ts-rest (End-to-end type safety for REST APIs)
- **Web Server**: Nginx (Reverse proxy and static file serving)
- **SSL**: Certbot (Automatic HTTPS certificate management)
- **Containerization**: Docker with Docker Compose

### 2.2 Development vs Production Setup
- **Development**: Docker Compose without Nginx and Certbot
- **Production**: Complete Docker Compose with all services including Nginx and Certbot

## 3. Data Models & Business Logic

### 3.1 Players
**Core Information:**
- Basic personal information
- Date of Birth (DOB)
- Gender
- Auto-calculated age group based on DOB

**Age Group Classification:**
- Automatically determined from DOB
- Used for filtering and analytics

### 3.2 Tests
**Test Types (Based on Play/Rest Time):**
1. **Type A**: 60 seconds play, 30 seconds rest
2. **Type B**: 30 seconds play, 30 seconds rest  
3. **Type C**: 30 seconds play, 60 seconds rest

**Test Positions:**
Each test involves 4 positions:
- Left hand
- Right hand
- Forehand
- Backhand

### 3.3 Relationships
- **Players ↔ Tests**: Many-to-many relationship
- Players can participate in multiple tests
- Tests can have multiple player results

## 4. User Roles & Authentication

### 4.1 Super Admin
- **Credentials**: admin@rowad.com / Test@1234
- **Permissions**: Full CRUD access to all data
- **Access**: Dashboard with mutation capabilities

### 4.2 Public Users
- **Permissions**: Read-only access
- **Access**: View all data without modification rights
- **No Authentication Required**: Public viewing of all statistics and archives

## 5. Frontend Requirements

### 5.1 Core Pages

#### 5.1.1 Players Archive
- **URL**: `/players`
- **Content**: Complete list of all registered players
- **Features**:
  - Player cards/table with basic info
  - Search and filter functionality
  - Link to individual player pages

#### 5.1.2 Tests Archive  
- **URL**: `/tests`
- **Content**: Complete list of all conducted tests
- **Features**:
  - Test cards/table with test details
  - Filter by test type (60/30, 30/30, 30/60)
  - Link to individual test result pages

#### 5.1.3 Player Detail Page
- **URL**: `/players/[id]`
- **Content**: 
  - Player basic information (name, DOB, gender, age group)
  - Latest test results and performance history
  - Performance charts and statistics
  - Test history timeline

#### 5.1.4 Test Detail Page
- **URL**: `/tests/[id]`
- **Content**:
  - Test information (type, date, conditions)
  - All player results for this specific test
  - **Filtering Options**:
    - Age group
    - Gender
    - Year of birth
  - **Grouping Options**:
    - By age group
    - By gender
    - By performance level

### 5.2 Admin Dashboard
- **URL**: `/admin`
- **Authentication**: Required (admin@rowad.com)
- **Features**:
  - Add/Edit/Delete players
  - Add/Edit/Delete tests
  - Manage test results
  - Data import/export functionality

## 6. Backend Requirements

### 6.1 API Endpoints

#### 6.1.1 Players API
```typescript
GET    /api/players              // Get all players
GET    /api/players/:id          // Get player by ID
POST   /api/players              // Create player (Admin only)
PUT    /api/players/:id          // Update player (Admin only)
DELETE /api/players/:id          // Delete player (Admin only)
```

#### 6.1.2 Tests API
```typescript
GET    /api/tests                // Get all tests
GET    /api/tests/:id            // Get test by ID
POST   /api/tests                // Create test (Admin only)
PUT    /api/tests/:id            // Update test (Admin only)
DELETE /api/tests/:id            // Delete test (Admin only)
```

#### 6.1.3 Results API
```typescript
GET    /api/results              // Get all results
GET    /api/results/player/:id   // Get results by player
GET    /api/results/test/:id     // Get results by test
POST   /api/results              // Create result (Admin only)
PUT    /api/results/:id          // Update result (Admin only)
DELETE /api/results/:id          // Delete result (Admin only)
```

#### 6.1.4 Auth API
```typescript
POST   /api/auth/login           // Admin login
POST   /api/auth/logout          // Admin logout
GET    /api/auth/verify          // Verify admin session
```

### 6.2 Database Schema

#### 6.2.1 Players Table
```sql
- id (Primary Key)
- name (String, Required)
- date_of_birth (Date, Required)
- gender (Enum: Male/Female, Required)
- age_group (Computed field)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### 6.2.2 Tests Table
```sql
- id (Primary Key)
- name (String, Required)
- test_type (Enum: 60_30, 30_30, 30_60, Required)
- date_conducted (Date, Required)
- description (Text, Optional)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### 6.2.3 Test Results Table
```sql
- id (Primary Key)
- player_id (Foreign Key → Players)
- test_id (Foreign Key → Tests)
- left_hand_score (Integer, Required)
- right_hand_score (Integer, Required)
- forehand_score (Integer, Required)
- backhand_score (Integer, Required)
- total_score (Computed field)
- created_at (Timestamp)
- updated_at (Timestamp)
```

## 7. Infrastructure Requirements

### 7.1 Development Environment
```yaml
# docker-compose.dev.yml
services:
  - app (Next.js + Express.js)
  - database (PostgreSQL)
  - pgadmin (Database management)
```

### 7.2 Production Environment
```yaml
# docker-compose.yml
services:
  - frontend (Next.js)
  - backend (Express.js)
  - database (PostgreSQL)
  - nginx (Reverse proxy)
  - certbot (SSL certificates)
```

## 8. Key Features

### 8.1 Data Management
- Complete CRUD operations for players and tests
- Bulk data import/export capabilities
- Data validation and integrity checks

### 8.2 Analytics & Filtering
- Advanced filtering by age group, gender, birth year
- Performance analytics and trends
- Comparative analysis between players

### 8.3 User Experience
- Responsive design for mobile and desktop
- Intuitive navigation between archives and detail pages
- Fast search and filter capabilities

### 8.4 Security
- Simple but effective admin authentication
- Input validation and sanitization
- HTTPS enforcement in production

## 9. Success Metrics

### 9.1 Performance
- Page load times < 3 seconds
- Database query response times < 500ms
- 99.9% uptime

### 9.2 Usability
- Intuitive data entry for admin users
- Clear data visualization for public users
- Mobile-responsive interface

## 10. Implementation Timeline

### Phase 1: Core Setup (Week 1-2)
- Monorepo setup with Next.js and Express.js
- Database schema design and implementation
- Basic Docker containerization

### Phase 2: Data Layer (Week 3-4)
- API development with ts-rest
- Database integration with Drizzle ORM
- CRUD operations implementation

### Phase 3: Frontend Development (Week 5-7)
- Archive pages (players and tests)
- Detail pages with filtering/grouping
- Admin dashboard implementation

### Phase 4: Production Deployment (Week 8)
- Nginx and Certbot configuration
- Production Docker Compose setup
- Domain configuration and SSL setup

### Phase 5: Testing & Optimization (Week 9-10)
- End-to-end testing
- Performance optimization
- Security validation

## 11. Risks & Mitigation

### 11.1 Technical Risks
- **Risk**: Database performance with large datasets
- **Mitigation**: Implement proper indexing and pagination

### 11.2 Security Risks
- **Risk**: Simple authentication might be compromised
- **Mitigation**: Implement rate limiting and secure session management

### 11.3 Deployment Risks
- **Risk**: SSL certificate renewal failures
- **Mitigation**: Monitor certificate expiration and implement automated renewal checks