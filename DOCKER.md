# Docker Deployment Guide

This guide covers building and deploying the Family Gifting Dashboard using Docker.

## Quick Start

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## File Structure

```
.
├── docker-compose.yml           # Multi-service orchestration
├── docker-build.sh              # Build verification script
├── services/api/
│   ├── Dockerfile              # FastAPI production image
│   └── .dockerignore           # Excluded files
└── apps/web/
    ├── Dockerfile              # Next.js production image
    └── .dockerignore           # Excluded files
```

## Services

### PostgreSQL Database
- **Image**: postgres:16-alpine
- **Port**: 5432
- **Volume**: postgres_data (persisted)
- **Health Check**: pg_isready every 10s

### FastAPI API
- **Build**: services/api/Dockerfile
- **Port**: 8000
- **Dependencies**: PostgreSQL (healthy)
- **Health Check**: /health endpoint every 30s
- **Startup**: Runs Alembic migrations, then starts uvicorn

### Next.js Web
- **Build**: apps/web/Dockerfile
- **Port**: 3000
- **Dependencies**: API
- **Health Check**: Root endpoint every 30s

## Building Images

### Individual Services

```bash
# Build API
docker build -t gifting-api:latest ./services/api

# Build Web
docker build -t gifting-web:latest ./apps/web
```

### Using docker-compose

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build api
docker-compose build web

# Build with no cache
docker-compose build --no-cache
```

### Using Verification Script

```bash
# Run comprehensive build check
./docker-build.sh
```

## Running Services

### Development (docker-compose)

```bash
# Start all services in background
docker-compose up -d

# Start with live logs
docker-compose up

# Start specific service
docker-compose up api

# Rebuild and start
docker-compose up --build
```

### Production (individual containers)

```bash
# Network
docker network create gifting-network

# PostgreSQL
docker run -d \
  --name gifting-postgres \
  --network gifting-network \
  -e POSTGRES_DB=family_gifting \
  -e POSTGRES_PASSWORD=your-secure-password \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:16-alpine

# API
docker run -d \
  --name gifting-api \
  --network gifting-network \
  -e DATABASE_URL=postgresql://postgres:your-secure-password@gifting-postgres:5432/family_gifting \
  -e JWT_SECRET_KEY=your-secure-jwt-secret \
  -p 8000:8000 \
  gifting-api:latest

# Web
docker run -d \
  --name gifting-web \
  --network gifting-network \
  -e NEXT_PUBLIC_API_URL=http://your-api-host:8000 \
  -e NEXT_PUBLIC_WS_URL=ws://your-api-host:8000 \
  -p 3000:3000 \
  gifting-web:latest
```

## Environment Variables

### API Service

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| DATABASE_URL | PostgreSQL connection string | - | Yes |
| JWT_SECRET_KEY | Secret for JWT signing | - | Yes |
| JWT_ALGORITHM | JWT algorithm | HS256 | No |
| ACCESS_TOKEN_EXPIRE_MINUTES | Token expiry | 1440 | No |
| API_PORT | Server port | 8000 | No |
| CORS_ORIGINS | Allowed origins (comma-separated) | - | Yes |

### Web Service

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| NEXT_PUBLIC_API_URL | API base URL | - | Yes |
| NEXT_PUBLIC_WS_URL | WebSocket URL | - | Yes |
| NODE_ENV | Node environment | production | No |

### Database Service

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| POSTGRES_DB | Database name | family_gifting | No |
| POSTGRES_USER | Database user | postgres | No |
| POSTGRES_PASSWORD | Database password | - | Yes |

## Volume Management

```bash
# List volumes
docker volume ls

# Inspect postgres data volume
docker volume inspect family-shopping-dashboard_postgres_data

# Backup database
docker exec gifting-postgres pg_dump -U postgres family_gifting > backup.sql

# Restore database
docker exec -i gifting-postgres psql -U postgres family_gifting < backup.sql

# Remove volumes (WARNING: deletes data)
docker-compose down -v
```

## Networking

All services communicate via the `gifting-network` bridge network:

```bash
# Inspect network
docker network inspect family-shopping-dashboard_gifting-network

# Services can reach each other by container name:
# - api can connect to postgres via: postgres:5432
# - web can connect to api via: api:8000
```

## Logs & Monitoring

```bash
# View all logs
docker-compose logs

# Follow logs
docker-compose logs -f

# Specific service logs
docker-compose logs api
docker-compose logs web
docker-compose logs postgres

# Last N lines
docker-compose logs --tail=100 api

# Logs since timestamp
docker-compose logs --since 2024-11-27T10:00:00
```

## Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# Manual health check
curl http://localhost:8000/health  # API
curl http://localhost:3000/         # Web
```

Health check configuration:
- **Interval**: 30s
- **Timeout**: 10s
- **Start Period**: 40s (API), 60s (Web)
- **Retries**: 3

## Resource Limits (Kubernetes Ready)

The images are optimized for homelab deployment with minimal resources:

**API**:
- Memory: 256Mi
- CPU: 100m

**Web**:
- Memory: 128Mi
- CPU: 50m

**Database**:
- Memory: 512Mi
- CPU: 250m

## Troubleshooting

### API won't start

```bash
# Check database connection
docker-compose logs postgres

# Check migrations
docker-compose exec api alembic current
docker-compose exec api alembic upgrade head

# Check environment variables
docker-compose exec api env | grep DATABASE_URL
```

### Web build fails

```bash
# Check if standalone output is enabled
grep "output.*standalone" apps/web/next.config.ts

# Clear Next.js cache
rm -rf apps/web/.next
docker-compose build --no-cache web
```

### Database connection issues

```bash
# Verify postgres is healthy
docker-compose ps postgres

# Test connection from API container
docker-compose exec api psql $DATABASE_URL -c "SELECT 1"

# Check network connectivity
docker-compose exec api ping postgres
```

### Out of memory

```bash
# Check resource usage
docker stats

# Increase Docker memory limit (Docker Desktop)
# Preferences → Resources → Memory → 4GB+

# Limit individual service memory
docker-compose.yml:
  api:
    mem_limit: 512m
```

## Security Best Practices

### Production Deployment

1. **Change default passwords**:
   ```bash
   # Never use default postgres password in production
   POSTGRES_PASSWORD=$(openssl rand -base64 32)
   ```

2. **Use secrets management**:
   ```yaml
   # docker-compose.yml
   services:
     api:
       secrets:
         - jwt_secret
         - db_password
   secrets:
     jwt_secret:
       file: ./secrets/jwt_secret.txt
   ```

3. **Don't expose ports unnecessarily**:
   ```yaml
   # Only expose what's needed externally
   postgres:
     # Don't expose 5432 if only internal services need it
     # ports:
     #   - "5432:5432"
   ```

4. **Use non-root users** (already configured):
   - API runs as `appuser` (uid 1000)
   - Web runs as `nextjs` (uid 1001)

5. **Keep images updated**:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build API
        run: docker build -t ghcr.io/yourorg/gifting-api:latest ./services/api

      - name: Build Web
        run: docker build -t ghcr.io/yourorg/gifting-web:latest ./apps/web

      - name: Push images
        run: |
          docker push ghcr.io/yourorg/gifting-api:latest
          docker push ghcr.io/yourorg/gifting-web:latest
```

## Next Steps

After successful Docker deployment:

1. **Kubernetes Deployment**: See k8s/ directory for manifests
2. **Production Secrets**: Configure proper secret management
3. **Monitoring**: Add Prometheus metrics and Grafana dashboards
4. **Backup Strategy**: Implement automated database backups
5. **Reverse Proxy**: Configure Nginx/Traefik for SSL and routing

## References

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/docker/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
