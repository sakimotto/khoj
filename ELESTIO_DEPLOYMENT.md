# Khoj AI - Elest.io Deployment Guide

## 🚀 Overview

This guide provides step-by-step instructions for deploying Khoj AI on Elest.io with full production capabilities.

## 📋 Prerequisites

- Elest.io account with container deployment access
- Domain name (optional but recommended)
- Basic understanding of Docker and container orchestration

## 🛠️ Architecture

### Service Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Python)      │◄──►│   (PostgreSQL)  │
│   Port 3000     │    │   Port 8000     │    │   Port 5432     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Search        │    │   Additional    │    │   Storage       │
│   (SearxNG)     │    │   Services      │    │   (Volumes)     │
│   Port 8080     │    │   (Terrarium)   │    │   (Persistent)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Configuration Files

### 1. Docker Compose (elestio-compose.yml)
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  khoj-db:
    image: ankane/pgvector:v0.5.1
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-khoj}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_HOST_AUTH_METHOD: trust
    volumes:
      - khoj_db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  # SearxNG Search Engine
  searxng:
    image: searxng/searxng:latest
    volumes:
      - ./searxng-settings.yml:/etc/searxng/settings.yml
    ports:
      - "8080:8080"
    environment:
      - SEARXNG_BIND_ADDRESS=0.0.0.0
      - SEARXNG_PORT=8080
    restart: unless-stopped

  # Terrarium Service
  terrarium:
    image: ghcr.io/rajatkumar/terrarium:latest
    ports:
      - "8089:8089"
    environment:
      - PORT=8089
    restart: unless-stopped

  # Khoj Backend (Python)
  khoj-backend:
    build: .
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@khoj-db:5432/${POSTGRES_DB:-khoj}
      - KHOJ_ENVIRONMENT=production
      - KHOJ_ADMIN_EMAIL=${ADMIN_EMAIL}
      - KHOJ_ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}
      - SEARXNG_URL=http://searxng:8080
      - TERRARIUM_URL=http://terrarium:8089
    volumes:
      - khoj_data:/app/data
      - khoj_models:/app/models
    ports:
      - "8000:8000"
    depends_on:
      khoj-db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  # Khoj Frontend (Next.js)
  khoj-frontend:
    build: 
      context: ./src/interface/web
      dockerfile: Dockerfile
    environment:
      - NEXT_PUBLIC_API_URL=http://khoj-backend:8000
      - NEXT_PUBLIC_WS_URL=ws://khoj-backend:8000
      - NODE_ENV=production
    ports:
      - "3000:3000"
    depends_on:
      - khoj-backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

volumes:
  khoj_db_data:
  khoj_data:
  khoj_models:

networks:
  default:
    driver: bridge
```

### 2. Environment Variables (.env.production)
```bash
# Database Configuration
POSTGRES_DB=khoj
POSTGRES_USER=khoj_user
POSTGRES_PASSWORD=your_secure_password_here

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_secure_admin_password

# AI API Keys (Choose your preferred providers)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key

# Service URLs
SEARXNG_URL=http://searxng:8080
TERRARIUM_URL=http://terrarium:8089

# Application Settings
KHOJ_ENVIRONMENT=production
KHOJ_ADMIN_EMAIL=admin@yourdomain.com
KHOJ_ADMIN_PASSWORD=your_secure_admin_password

# Security Settings
SECRET_KEY=your_very_long_secret_key_here
JWT_SECRET=your_jwt_secret_here
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Optional: Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=noreply@yourdomain.com

# Optional: Storage Configuration
STORAGE_TYPE=local  # or s3 for AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-s3-bucket
```

### 3. Backend Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /app/data /app/models /app/logs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Run the application
CMD ["uvicorn", "khoj.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### 4. Frontend Dockerfile
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["npm", "start"]
```

## 🚀 Deployment Steps

### Step 1: Prepare Your Environment
1. **Create Elest.io Account**: Sign up at [elest.io](https://elest.io)
2. **Create New Project**: Set up a new container deployment project
3. **Configure Domain**: Set up your domain name and SSL certificates

### Step 2: Repository Setup
1. **Fork/Clone Repository**: 
   ```bash
   git clone https://github.com/yourusername/khoj.git
   cd khoj
   ```

2. **Create Deployment Branch**:
   ```bash
   git checkout -b elestio-deployment
   ```

3. **Add Configuration Files**: Add the Docker files and configuration from above

### Step 3: Environment Configuration
1. **Create Production Environment File**:
   ```bash
   cp .env.example .env.production
   ```

2. **Update Configuration**: Edit `.env.production` with your actual values

3. **Secure Sensitive Data**: Use Elest.io secrets management for API keys and passwords

### Step 4: Build and Deploy
1. **Upload to Repository**: Commit and push your configuration
   ```bash
   git add .
   git commit -m "Add Elest.io deployment configuration"
   git push origin elestio-deployment
   ```

2. **Connect to Elest.io**: Link your repository to Elest.io deployment

3. **Configure Build Settings**: Set up build context and environment variables

4. **Deploy**: Start the deployment process

### Step 5: Post-Deployment Configuration

#### 1. Database Migration
```bash
# Connect to your deployed backend container
elestro exec khoj-backend -- python -m khoj.database.migrate
```

#### 2. Admin User Setup
```bash
# Create admin user
elestro exec khoj-backend -- python -m khoj.admin.create_admin \
  --email admin@yourdomain.com \
  --password your_secure_password
```

#### 3. Initial Configuration
Access the admin panel at `https://yourdomain.com/admin` to configure:
- Default AI models
- User permissions
- Content sources
- Search settings

## 🔧 Monitoring and Maintenance

### Health Monitoring
- **Application Health**: Monitor `/api/health` endpoints
- **Database Health**: Check PostgreSQL connection and performance
- **Service Dependencies**: Monitor SearxNG and Terrarium availability

### Log Management
```bash
# View application logs
elestro logs khoj-backend
elestro logs khoj-frontend

# Monitor specific services
elestro logs searxng
elestro logs terrarium
```

### Backup Strategy
1. **Database Backups**: Automated daily PostgreSQL dumps
2. **File Storage**: Backup user uploads and processed documents
3. **Configuration**: Version control all configuration files

### Updates and Maintenance
1. **Regular Updates**: Keep all dependencies updated
2. **Security Patches**: Apply security updates promptly
3. **Performance Monitoring**: Monitor resource usage and optimize

## 🛡️ Security Considerations

### Network Security
- **HTTPS Only**: All traffic encrypted with SSL/TLS
- **CORS Configuration**: Properly configured for your domain
- **Rate Limiting**: Implement API rate limiting
- **Firewall Rules**: Restrict access to necessary ports only

### Application Security
- **Input Validation**: Sanitize all user inputs
- **SQL Injection Prevention**: Use parameterized queries
- **XSS Protection**: Proper content security headers
- **Authentication**: Strong password requirements

### Data Protection
- **Encryption at Rest**: Encrypt sensitive data in database
- **Secure API Keys**: Use environment variables for secrets
- **Audit Logging**: Log all administrative actions
- **Data Retention**: Implement proper data retention policies

## 📊 Performance Optimization

### Scaling Recommendations
1. **Horizontal Scaling**: Deploy multiple backend instances
2. **Load Balancing**: Use Elest.io load balancer
3. **Caching**: Implement Redis for session and data caching
4. **CDN**: Use CDN for static assets

### Resource Monitoring
- **CPU Usage**: Monitor backend processing load
- **Memory Usage**: Track memory consumption patterns
- **Database Performance**: Monitor query performance
- **Storage Usage**: Track file storage growth

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check database health
elestro exec khoj-db -- pg_isready -U postgres

# View database logs
elestro logs khoj-db
```

#### 2. Frontend Build Issues
```bash
# Check build logs
elestro logs khoj-frontend

# Rebuild frontend
elestro rebuild khoj-frontend
```

#### 3. AI API Issues
- **Check API Keys**: Verify all AI service API keys
- **Rate Limits**: Monitor API usage and rate limits
- **Service Status**: Check AI service provider status

#### 4. Search Service Issues
```bash
# Check SearxNG status
elestro logs searxng

# Test search functionality
curl http://localhost:8080/search?q=test
```

## 📞 Support

For deployment issues:
1. **Check Logs**: Always start with service logs
2. **Health Endpoints**: Test all health check endpoints
3. **Configuration**: Verify all environment variables
4. **Network**: Ensure all services can communicate
5. **Documentation**: Refer to official Khoj documentation

---

**Ready for Production**: This configuration provides a robust, scalable, and secure deployment of Khoj AI on Elest.io with full production capabilities.