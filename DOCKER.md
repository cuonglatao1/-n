# Docker Deployment Guide

This guide explains how to build and run the Canvas LLM Platform using Docker.

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB of available RAM

## 🏗️ Architecture

The platform consists of 4 services:

1. **PostgreSQL** - Primary database (port 5432)
2. **Redis** - Caching and session storage (port 6379)
3. **API** - NestJS backend (port 3001)
4. **Web** - Next.js frontend (port 3000)

## 🚀 Quick Start

### 1. Build and Run All Services

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up --build -d
```

### 2. Run Individual Services

```bash
# Start only database services
docker-compose up postgres redis

# Start API (includes dependencies)
docker-compose up api

# Start Web (includes all dependencies)
docker-compose up web
```

### 3. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# JWT Secrets (REQUIRED for production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Database (optional, defaults provided)
POSTGRES_DB=canvas_llm
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# API URL for frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🏗️ Building Images Individually

### API Image

```bash
# From project root
docker build -f apps/api/dockerfile -t canvas-llm-api .
```

### Web Image

```bash
# From project root
docker build -f apps/web/dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:3001 \
  -t canvas-llm-web .
```

## 🔍 Health Checks

All services include health checks:

- **PostgreSQL**: `http://localhost:5432` (pg_isready)
- **Redis**: `http://localhost:6379` (redis-cli ping)
- **API**: `http://localhost:3001/health`
- **Web**: `http://localhost:3000/api/health`

Test health endpoints:

```bash
curl http://localhost:3001/health
curl http://localhost:3000/api/health
```

## 🛠️ Database Migrations

Run Prisma migrations in the API container:

```bash
# Apply migrations
docker-compose exec api npx prisma migrate deploy

# Seed database
docker-compose exec api npm run prisma:seed

# Open Prisma Studio
docker-compose exec api npx prisma studio
```

## 🧹 Cleanup

```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Full cleanup
docker-compose down -v --rmi all
```

## 📊 Service Dependencies

```
web → api → postgres
           → redis
```

Services start in order with health check dependencies:
1. PostgreSQL and Redis start first
2. API waits for healthy database
3. Web waits for healthy API

## 🐛 Troubleshooting

### Build Issues

```bash
# Clean build with no cache
docker-compose build --no-cache

# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune -a
```

### Connection Issues

```bash
# Check if services are running
docker-compose ps

# Check service logs
docker-compose logs api
docker-compose logs postgres

# Restart a service
docker-compose restart api
```

### Database Issues

```bash
# Reset database
docker-compose down postgres
docker volume rm canvas-llm_postgres_data
docker-compose up postgres

# Access PostgreSQL shell
docker-compose exec postgres psql -U postgres -d canvas_llm
```

## 📝 Production Deployment

### Security Checklist

- [ ] Change default PostgreSQL password
- [ ] Set strong JWT secrets
- [ ] Use HTTPS/TLS for external access
- [ ] Configure proper CORS settings
- [ ] Set up container resource limits
- [ ] Enable container restart policies
- [ ] Configure log rotation
- [ ] Set up monitoring and alerts

### Resource Limits

Add to `docker-compose.yml`:

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Reverse Proxy Setup (Nginx)

```nginx
# API endpoint
location /api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

# Frontend
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
- name: Build and Push Docker Images
  run: |
    docker build -f apps/api/dockerfile -t myregistry/canvas-llm-api:${{ github.sha }} .
    docker build -f apps/web/dockerfile -t myregistry/canvas-llm-web:${{ github.sha }} .
    docker push myregistry/canvas-llm-api:${{ github.sha }}
    docker push myregistry/canvas-llm-web:${{ github.sha }}
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Docker Best Practices](https://docs.nestjs.com/recipes/deployment)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)

