# Quick Deployment Guide

## Prerequisites Checklist

- [ ] Kubernetes cluster running (K3s/microk8s/etc)
- [ ] `kubectl` configured and working
- [ ] Docker images built locally

## One-Time Setup

### 1. Build Docker Images

```bash
# From project root
docker build -t gifting-api:latest ./services/api
docker build -t gifting-web:latest ./apps/web

# If using K3s, import images
docker save gifting-api:latest | sudo k3s ctr images import -
docker save gifting-web:latest | sudo k3s ctr images import -
```

### 2. Create Secrets

```bash
# Copy template
cp k8s/secrets.yaml.example k8s/secrets.yaml

# Generate secure passwords
echo "PostgreSQL password: $(openssl rand -base64 32)"
echo "JWT secret: $(openssl rand -base64 64)"

# Edit k8s/secrets.yaml with generated values
# DO NOT commit secrets.yaml to git
```

## Deploy

### Quick Deploy (All at Once)

```bash
# Create secrets
kubectl apply -f k8s/secrets.yaml

# Deploy everything
kubectl apply -k k8s/

# Watch deployment
kubectl get pods -n family-gifting -w
```

### Step-by-Step Deploy

```bash
# 1. Namespace
kubectl apply -f k8s/namespace.yaml

# 2. Secrets
kubectl apply -f k8s/secrets.yaml

# 3. PostgreSQL
kubectl apply -f k8s/postgres/
kubectl wait --for=condition=ready pod -l app=postgres -n family-gifting --timeout=300s

# 4. API
kubectl apply -f k8s/api/
kubectl wait --for=condition=ready pod -l app=api -n family-gifting --timeout=300s

# 5. Web
kubectl apply -f k8s/web/
```

## Verify

```bash
# Check all resources
kubectl get all -n family-gifting

# Check logs
kubectl logs -f deployment/api -n family-gifting
kubectl logs -f deployment/web -n family-gifting

# Test health endpoints
kubectl port-forward svc/api 8000:8000 -n family-gifting
curl http://localhost:8000/health

kubectl port-forward svc/web 3000:3000 -n family-gifting
curl http://localhost:3000
```

## Common Operations

### View Logs

```bash
# API
kubectl logs -f deployment/api -n family-gifting

# Web
kubectl logs -f deployment/web -n family-gifting

# PostgreSQL
kubectl logs -f statefulset/postgres -n family-gifting

# All pods
kubectl logs -f -l app.kubernetes.io/part-of=family-gifting -n family-gifting
```

### Access Services

```bash
# Port forward API
kubectl port-forward svc/api 8000:8000 -n family-gifting

# Port forward Web
kubectl port-forward svc/web 3000:3000 -n family-gifting

# Port forward PostgreSQL (for debugging)
kubectl port-forward svc/postgres 5432:5432 -n family-gifting
```

### Update Deployment

```bash
# Rebuild and reimport images
docker build -t gifting-api:latest ./services/api
docker save gifting-api:latest | sudo k3s ctr images import -

# Restart deployment to use new image
kubectl rollout restart deployment/api -n family-gifting

# Watch rollout
kubectl rollout status deployment/api -n family-gifting
```

### Scale

```bash
# Scale API
kubectl scale deployment/api --replicas=3 -n family-gifting

# Scale Web
kubectl scale deployment/web --replicas=3 -n family-gifting
```

### Database Operations

```bash
# Run migrations
kubectl exec -it deployment/api -n family-gifting -- uv run alembic upgrade head

# Access PostgreSQL shell
kubectl exec -it statefulset/postgres -n family-gifting -- psql -U postgres family_gifting

# Backup database
kubectl exec -it statefulset/postgres -n family-gifting -- \
  pg_dump -U postgres family_gifting > backup-$(date +%Y%m%d-%H%M%S).sql

# Restore database
kubectl exec -i statefulset/postgres -n family-gifting -- \
  psql -U postgres family_gifting < backup.sql
```

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -n family-gifting

# Describe pod
kubectl describe pod <pod-name> -n family-gifting

# Check events
kubectl get events -n family-gifting --sort-by='.lastTimestamp'

# Check logs (including previous container if crashed)
kubectl logs <pod-name> -n family-gifting --previous
```

### Database Connection Issues

```bash
# Check if PostgreSQL is ready
kubectl exec -it statefulset/postgres -n family-gifting -- pg_isready

# Test connection from API pod
kubectl exec -it deployment/api -n family-gifting -- \
  psql postgresql://postgres:PASSWORD@postgres:5432/family_gifting -c "SELECT 1"

# Check DNS resolution
kubectl exec -it deployment/api -n family-gifting -- nslookup postgres
```

### Image Pull Issues

```bash
# Check if images exist (K3s)
sudo k3s ctr images ls | grep gifting

# Reimport images
docker save gifting-api:latest | sudo k3s ctr images import -
docker save gifting-web:latest | sudo k3s ctr images import -

# Restart deployments
kubectl rollout restart deployment/api -n family-gifting
kubectl rollout restart deployment/web -n family-gifting
```

### Health Probe Failures

```bash
# Check health endpoint from inside pod
kubectl exec -it deployment/api -n family-gifting -- curl localhost:8000/health

# Check probe configuration
kubectl describe pod <pod-name> -n family-gifting | grep -A 10 "Liveness\|Readiness"

# Increase probe delays if needed
kubectl edit deployment/api -n family-gifting
```

## Cleanup

### Delete Everything

```bash
# Delete all resources
kubectl delete -k k8s/

# Or delete namespace (faster)
kubectl delete namespace family-gifting
```

### Keep Data (Delete Deployments Only)

```bash
# Delete deployments/statefulsets
kubectl delete deployment --all -n family-gifting
kubectl delete statefulset --all -n family-gifting

# PVC is preserved
kubectl get pvc -n family-gifting
```

## Health Check Endpoints

| Service | Endpoint | Expected Response |
|---------|----------|-------------------|
| API | `GET /health` | `{"status": "healthy", "db": "connected"}` |
| Web | `GET /` | HTTP 200 (Next.js page) |
| PostgreSQL | `pg_isready -U postgres` | `accepting connections` |

## Resource Usage

| Service | Pods | Memory Request | Memory Limit | CPU Request | CPU Limit |
|---------|------|----------------|--------------|-------------|-----------|
| API | 2 | 256Mi | 512Mi | 100m | 500m |
| Web | 2 | 128Mi | 256Mi | 50m | 200m |
| PostgreSQL | 1 | 256Mi | 512Mi | 100m | 500m |
| **Total** | **5** | **~640Mi** | **~1.25Gi** | **~250m** | **~1200m** |

## Network Architecture

```
Internet/LAN
    |
    v
[Ingress] (optional)
    |
    +-----> web:3000 (Next.js)
    |           |
    |           v
    +-----> api:8000 (FastAPI)
                |
                v
            postgres:5432
```

## Secrets Management

**CRITICAL**: Never commit `k8s/secrets.yaml` to git!

Generate secure values:
```bash
# PostgreSQL password (32 bytes)
openssl rand -base64 32

# JWT secret (64 bytes)
openssl rand -base64 64
```

Update secrets:
```bash
# Edit secrets
kubectl edit secret api-secrets -n family-gifting

# Restart deployments to pick up changes
kubectl rollout restart deployment/api -n family-gifting
```

## Monitoring

```bash
# Resource usage
kubectl top pods -n family-gifting
kubectl top nodes

# Watch pod status
watch kubectl get pods -n family-gifting

# Stream events
kubectl get events -n family-gifting -w

# Check all resources
kubectl get all,pvc,secrets,configmaps -n family-gifting
```
