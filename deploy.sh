#!/bin/bash

# SpeedballHub Production Deployment Script
set -e

echo "🚀 Starting SpeedballHub deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo -e "${YELLOW}Please copy env.production.example to .env and update the values${NC}"
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
required_vars=("DB_PASSWORD" "SESSION_SECRET" "DOMAIN")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Error: $var is not set in .env file${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ Environment variables validated${NC}"

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker compose down

# Remove old images (optional - uncomment if you want to force rebuild)
# echo -e "${YELLOW}🗑️  Removing old images...${NC}"
# docker compose down --rmi all

# Build and start services
echo -e "${YELLOW}🏗️  Building and starting services...${NC}"
docker compose up --build -d

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 30

# Check if services are healthy
echo -e "${YELLOW}🔍 Checking service health...${NC}"

# Check backend health
if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    docker compose logs backend
    exit 1
fi

# Check frontend health (through nginx)
if curl -f -k https://${DOMAIN}/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend health check failed (this is normal if SSL is not set up yet)${NC}"
fi

# Generate and run database migrations
echo -e "${YELLOW}🗃️  Generating database migrations...${NC}"
docker compose exec backend npm run db:generate || echo "No schema changes to generate"

echo -e "${YELLOW}🗃️  Running database migrations...${NC}"
docker compose exec backend npm run db:migrate

# Optional: Seed database (uncomment if needed)
# echo -e "${YELLOW}🌱 Seeding database...${NC}"
# docker compose exec backend npm run db:seed

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your application should be available at: https://${DOMAIN}${NC}"
echo -e "${YELLOW}📝 Note: If this is the first deployment, you may need to set up SSL certificates${NC}"
echo -e "${YELLOW}📝 Run './ssl-setup.sh' to configure SSL certificates${NC}"
