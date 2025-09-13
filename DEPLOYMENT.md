# 🚀 SpeedballHub Production Deployment Guide

This guide will help you deploy SpeedballHub to your VPS with Docker, Nginx, and SSL certificates.

## 📋 Prerequisites

### VPS Requirements
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: Minimum 20GB
- **CPU**: 2 cores recommended

### Software Requirements
- Docker 20.10+
- Docker Compose 2.0+
- Git
- Domain name pointing to your VPS IP

### Domain Setup
- Ensure `rowad.speedballhub.com` points to your VPS IP address
- DNS propagation may take up to 24 hours

## 🛠️ Step-by-Step Deployment

### Step 1: Prepare Your VPS

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install git -y

# Logout and login again to apply Docker group changes
exit
```

### Step 2: Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-username/rowad-speedball-hub.git
cd rowad-speedball-hub

# Or if uploading manually, ensure all files are in the project directory
```

### Step 3: Configure Environment

```bash
# Copy environment template
cp env.production.example .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**
```bash
# Database Configuration
DB_PASSWORD=your_very_secure_database_password_here

# Session Configuration (generate a secure 32+ character string)
SESSION_SECRET=your_very_secure_session_secret_minimum_32_characters_here

# Domain Configuration
DOMAIN=rowad.speedballhub.com

# Email for SSL certificate
SSL_EMAIL=admin@rowad.com
```

**Generate Secure Passwords:**
```bash
# Generate secure database password
openssl rand -base64 32

# Generate secure session secret
openssl rand -base64 48
```

### Step 4: Deploy Application

```bash
# Make deployment script executable (if not already)
chmod +x deploy.sh ssl-setup.sh

# Run deployment
./deploy.sh
```

The deployment script will:
- ✅ Validate environment variables
- ✅ Stop existing containers
- ✅ Build and start all services
- ✅ Run database migrations
- ✅ Perform health checks

### Step 5: Setup SSL Certificates

```bash
# Setup SSL certificates
./ssl-setup.sh
```

The SSL setup script will:
- ✅ Request Let's Encrypt certificates
- ✅ Configure nginx with SSL
- ✅ Test SSL configuration
- ✅ Set up automatic renewal

### Step 6: Verify Deployment

```bash
# Check all services are running
docker-compose ps

# Check logs if needed
docker-compose logs -f

# Test endpoints
curl https://rowad.speedballhub.com/api/health
curl https://rowad.speedballhub.com
```

## 🔧 Post-Deployment Configuration

### Firewall Setup

```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

### Automatic SSL Renewal

```bash
# Add to crontab for automatic renewal
crontab -e

# Add this line (runs twice daily):
0 12,0 * * * /path/to/your/project/ssl-renew.sh
```

### Database Backup Setup

```bash
# Create backup script
cat > backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/$(whoami)/backups"
mkdir -p $BACKUP_DIR
docker-compose exec -T database pg_dump -U postgres speedball_hub > $BACKUP_DIR/speedball_$(date +%Y%m%d_%H%M%S).sql
# Keep only last 7 days of backups
find $BACKUP_DIR -name "speedball_*.sql" -mtime +7 -delete
EOF

chmod +x backup-db.sh

# Add to crontab (daily backup at 2 AM)
crontab -e
# Add: 0 2 * * * /path/to/your/project/backup-db.sh
```

## 📊 Monitoring & Maintenance

### Check Service Status
```bash
# View running containers
docker-compose ps

# Check resource usage
docker stats

# View logs
docker-compose logs -f [service_name]
```

### Update Application
```bash
# Pull latest changes
git pull origin main

# Redeploy
./deploy.sh
```

### Database Operations
```bash
# Access database
docker-compose exec database psql -U postgres -d speedball_hub

# Run migrations
docker-compose exec backend npm run db:migrate

# Seed database (if needed)
docker-compose exec backend npm run db:seed
```

## 🔍 Troubleshooting

### Common Issues

**1. SSL Certificate Issues**
```bash
# Check certificate status
docker-compose exec nginx nginx -t

# Renew certificates manually
./ssl-renew.sh

# Check certificate expiry
openssl x509 -in ssl/live/rowad.speedballhub.com/cert.pem -text -noout | grep "Not After"
```

**2. Database Connection Issues**
```bash
# Check database logs
docker-compose logs database

# Test database connection
docker-compose exec backend npm run db:test
```

**3. Service Not Starting**
```bash
# Check specific service logs
docker-compose logs [service_name]

# Restart specific service
docker-compose restart [service_name]

# Rebuild and restart
docker-compose up --build -d [service_name]
```

**4. Domain/DNS Issues**
```bash
# Check DNS resolution
nslookup rowad.speedballhub.com

# Test domain connectivity
curl -I http://rowad.speedballhub.com
```

### Performance Optimization

**1. Enable Docker Logging Limits**
```bash
# Add to docker-compose.yml for each service:
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

**2. Monitor Resource Usage**
```bash
# Install htop for system monitoring
sudo apt install htop

# Monitor Docker resources
docker system df
docker system prune -f  # Clean up unused resources
```

## 🛡️ Security Checklist

- ✅ Firewall configured (ports 22, 80, 443 only)
- ✅ SSL certificates installed and auto-renewing
- ✅ Strong database passwords
- ✅ Secure session secrets
- ✅ Rate limiting enabled
- ✅ Security headers configured
- ✅ Regular backups scheduled

## 📞 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables in `.env`
3. Ensure domain DNS is properly configured
4. Check firewall settings
5. Verify SSL certificate status

## 🎉 Success!

Your SpeedballHub application should now be running at:
- **🌐 Website**: https://rowad.speedballhub.com
- **🔐 Admin Panel**: https://rowad.speedballhub.com/admin
- **📊 API Health**: https://rowad.speedballhub.com/api/health

**Default Admin Credentials:**
- Email: `admin@rowad.com`
- Password: `Test@1234`

**Remember to change the admin password after first login!**
