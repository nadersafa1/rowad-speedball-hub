#!/bin/bash

# SSL Certificate Setup Script for SpeedballHub
set -e

echo "🔒 Setting up SSL certificates for SpeedballHub..."

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
if [ -z "$DOMAIN" ] || [ -z "$SSL_EMAIL" ]; then
    echo -e "${RED}❌ Error: DOMAIN and SSL_EMAIL must be set in .env file${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Setting up SSL for domain: $DOMAIN${NC}"
echo -e "${GREEN}✅ Using email: $SSL_EMAIL${NC}"

# Create SSL directory
mkdir -p ssl

# Create temporary nginx config for initial certificate request
echo -e "${YELLOW}📝 Creating temporary nginx configuration...${NC}"
cat > nginx-temp.conf << EOF
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name $DOMAIN;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 200 'SSL setup in progress...';
            add_header Content-Type text/plain;
        }
    }
}
EOF

# Stop existing nginx if running
echo -e "${YELLOW}🛑 Stopping existing nginx...${NC}"
docker-compose stop nginx || true

# Start nginx with temporary config
echo -e "${YELLOW}🚀 Starting nginx with temporary configuration...${NC}"
docker run -d --name nginx-temp \
    -p 80:80 \
    -v $(pwd)/nginx-temp.conf:/etc/nginx/nginx.conf \
    -v $(pwd)/ssl:/etc/letsencrypt \
    -v certbot_data:/var/www/certbot \
    nginx:alpine

# Wait for nginx to start
sleep 5

# Request SSL certificate
echo -e "${YELLOW}🔐 Requesting SSL certificate from Let's Encrypt...${NC}"
docker run --rm \
    -v $(pwd)/ssl:/etc/letsencrypt \
    -v certbot_data:/var/www/certbot \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $SSL_EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d $DOMAIN

# Stop temporary nginx
echo -e "${YELLOW}🛑 Stopping temporary nginx...${NC}"
docker stop nginx-temp
docker rm nginx-temp

# Clean up temporary config
rm nginx-temp.conf

# Start the full application
echo -e "${YELLOW}🚀 Starting full application with SSL...${NC}"
docker-compose up -d

# Wait for services to start
sleep 10

# Test SSL
echo -e "${YELLOW}🔍 Testing SSL configuration...${NC}"
if curl -f -k https://$DOMAIN > /dev/null 2>&1; then
    echo -e "${GREEN}✅ SSL is working correctly!${NC}"
    echo -e "${GREEN}🌐 Your application is now available at: https://$DOMAIN${NC}"
else
    echo -e "${RED}❌ SSL test failed. Check the logs:${NC}"
    docker-compose logs nginx
    exit 1
fi

# Set up automatic renewal
echo -e "${YELLOW}⏰ Setting up automatic SSL renewal...${NC}"
cat > ssl-renew.sh << 'EOF'
#!/bin/bash
# SSL Certificate Renewal Script
docker run --rm \
    -v $(pwd)/ssl:/etc/letsencrypt \
    -v certbot_data:/var/www/certbot \
    certbot/certbot renew --quiet

# Reload nginx to use new certificates
docker-compose exec nginx nginx -s reload
EOF

chmod +x ssl-renew.sh

echo -e "${GREEN}🎉 SSL setup completed successfully!${NC}"
echo -e "${GREEN}🌐 Your application is now available at: https://$DOMAIN${NC}"
echo -e "${YELLOW}📝 Note: Add './ssl-renew.sh' to your crontab to automatically renew certificates${NC}"
echo -e "${YELLOW}📝 Example crontab entry (runs twice daily):${NC}"
echo -e "${YELLOW}0 12,0 * * * /path/to/your/project/ssl-renew.sh${NC}"
