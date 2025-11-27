# K8s Quick Reference

## One-Command Deploy

```bash
# Setup secrets first
cp k8s/secrets.yaml.example k8s/secrets.yaml
# Edit secrets.yaml with real values

# Deploy everything
kubectl apply -f k8s/secrets.yaml && kubectl apply -k k8s/
```

## Common Commands

### Status

```bash
# All resources
kubectl get all -n family-gifting

# Pods only
kubectl get pods -n family-gifting

# Watch pods
kubectl get pods -n family-gifting -w
```

### Logs

```bash
# API logs
kubectl logs -f deployment/api -n family-gifting

# Web logs
kubectl logs -f deployment/web -n family-gifting

# All logs
kubectl logs -f -l app.kubernetes.io/part-of=family-gifting -n family-gifting
```

### Access Services

```bash
# Port forward API
kubectl port-forward svc/api 8000:8000 -n family-gifting

# Port forward Web
kubectl port-forward svc/web 3000:3000 -n family-gifting

# Port forward DB
kubectl port-forward svc/postgres 5432:5432 -n family-gifting
```

### Database

```bash
# Run migrations
kubectl exec -it deployment/api -n family-gifting -- uv run alembic upgrade head

# Access PostgreSQL
kubectl exec -it statefulset/postgres -n family-gifting -- psql -U postgres family_gifting

# Backup database
kubectl exec -it statefulset/postgres -n family-gifting -- \
  pg_dump -U postgres family_gifting > backup.sql
```

### Scaling

```bash
# Scale API
kubectl scale deployment/api --replicas=3 -n family-gifting

# Scale Web
kubectl scale deployment/web --replicas=3 -n family-gifting
```

### Updates

```bash
# Restart deployment
kubectl rollout restart deployment/api -n family-gifting

# Check rollout status
kubectl rollout status deployment/api -n family-gifting

# Rollback
kubectl rollout undo deployment/api -n family-gifting
```

### Debug

```bash
# Describe pod
kubectl describe pod <pod-name> -n family-gifting

# Events
kubectl get events -n family-gifting --sort-by='.lastTimestamp'

# Execute command in pod
kubectl exec -it deployment/api -n family-gifting -- bash

# Test health endpoint
kubectl exec -it deployment/api -n family-gifting -- curl localhost:8000/health
```

### Cleanup

```bash
# Delete everything
kubectl delete -k k8s/

# Or delete namespace
kubectl delete namespace family-gifting
```

## Resource URLs

| Service | Internal URL | Port Forward |
|---------|-------------|--------------|
| API | `http://api.family-gifting.svc.cluster.local:8000` | `localhost:8000` |
| Web | `http://web.family-gifting.svc.cluster.local:3000` | `localhost:3000` |
| PostgreSQL | `postgres.family-gifting.svc.cluster.local:5432` | `localhost:5432` |

## Health Check Endpoints

| Service | Endpoint | Expected |
|---------|----------|----------|
| API | `GET /health` | `{"status": "healthy", "db": "connected"}` |
| Web | `GET /` | HTTP 200 |
| PostgreSQL | `pg_isready -U postgres` | `accepting connections` |

## Resource Limits

| Service | Replicas | Memory | CPU |
|---------|----------|--------|-----|
| API | 2 | 256Mi / 512Mi | 100m / 500m |
| Web | 2 | 128Mi / 256Mi | 50m / 200m |
| PostgreSQL | 1 | 256Mi / 512Mi | 100m / 500m |
| **Total** | **5** | **~640Mi / ~1.25Gi** | **~250m / ~1200m** |

## Files

| File | Purpose |
|------|---------|
| `namespace.yaml` | Namespace definition |
| `postgres/statefulset.yaml` | PostgreSQL StatefulSet |
| `postgres/service.yaml` | PostgreSQL Service |
| `postgres/pvc.yaml` | 10Gi storage |
| `api/deployment.yaml` | FastAPI Deployment |
| `api/service.yaml` | API Service |
| `api/configmap.yaml` | API configuration |
| `web/deployment.yaml` | Next.js Deployment |
| `web/service.yaml` | Web Service |
| `web/configmap.yaml` | Web configuration |
| `secrets.yaml.example` | Secrets template |
| `kustomization.yaml` | Kustomize config |

## Secrets Setup

```bash
# Copy template
cp k8s/secrets.yaml.example k8s/secrets.yaml

# Generate passwords
openssl rand -base64 32  # PostgreSQL password
openssl rand -base64 64  # JWT secret

# Edit and apply
kubectl apply -f k8s/secrets.yaml
```

## Validation

```bash
# Run validation script
./k8s/validate.sh

# Or manual YAML check
python3 -c "import yaml; list(yaml.safe_load_all(open('k8s/namespace.yaml')))"

# Dry-run (requires kubectl)
kubectl apply --dry-run=client -k k8s/
```

## Build and Import Images

```bash
# Build images
docker build -t gifting-api:latest ./services/api
docker build -t gifting-web:latest ./apps/web

# Import to K3s
docker save gifting-api:latest | sudo k3s ctr images import -
docker save gifting-web:latest | sudo k3s ctr images import -

# Or microk8s
docker save gifting-api:latest | microk8s ctr image import -
docker save gifting-web:latest | microk8s ctr image import -
```

## Troubleshooting

| Issue | Check | Fix |
|-------|-------|-----|
| Pods not starting | `kubectl describe pod <name>` | Check events and logs |
| DB connection error | Verify secrets | `kubectl get secret api-secrets -o yaml` |
| Image pull error | Import images | See "Build and Import Images" |
| Health probe failure | Test endpoint | `kubectl exec ... -- curl localhost:8000/health` |
| Out of resources | Check limits | `kubectl top pods -n family-gifting` |

## Documentation

- **DEPLOY.md**: Full deployment guide
- **README.md**: Comprehensive documentation
- **SUMMARY.md**: Implementation summary
- **QUICK_REFERENCE.md**: This file
