# Kubernetes Deployment

Kubernetes manifests for deploying the Family Gifting Dashboard to homelab.

## Directory Structure

```
k8s/
├── namespace.yaml              # Namespace definition
├── postgres/                   # PostgreSQL database
│   ├── pvc.yaml               # Persistent volume claim (10Gi)
│   ├── statefulset.yaml       # StatefulSet with health probes
│   └── service.yaml           # ClusterIP service
├── api/                        # FastAPI backend
│   ├── configmap.yaml         # Environment configuration
│   ├── deployment.yaml        # Deployment with 2 replicas
│   └── service.yaml           # ClusterIP service
├── web/                        # Next.js frontend
│   ├── configmap.yaml         # Environment configuration
│   ├── deployment.yaml        # Deployment with 2 replicas
│   └── service.yaml           # ClusterIP service
├── secrets.yaml.example        # Template for secrets (copy and fill)
└── kustomization.yaml         # Kustomize configuration
```

## Prerequisites

1. Kubernetes cluster running (K3s, microk8s, or similar)
2. `kubectl` configured to access your cluster
3. Docker images built locally:
   ```bash
   # Build images
   docker build -t gifting-api:latest ./services/api
   docker build -t gifting-web:latest ./apps/web

   # If using K3s, import images
   docker save gifting-api:latest | sudo k3s ctr images import -
   docker save gifting-web:latest | sudo k3s ctr images import -
   ```

## Setup Secrets

1. Copy the secrets template:
   ```bash
   cp k8s/secrets.yaml.example k8s/secrets.yaml
   ```

2. Generate secure passwords:
   ```bash
   # Generate PostgreSQL password
   openssl rand -base64 32

   # Generate JWT secret key
   openssl rand -base64 64
   ```

3. Edit `k8s/secrets.yaml` and fill in the generated values:
   - `POSTGRES_PASSWORD`: Use the first generated password
   - `DATABASE_URL`: Use the same password in the connection string
   - `JWT_SECRET_KEY`: Use the second generated value

4. Apply secrets:
   ```bash
   kubectl apply -f k8s/secrets.yaml
   ```

## Deployment

### Option 1: Deploy Everything with Kustomize (Recommended)

```bash
# Deploy all resources
kubectl apply -k k8s/

# Verify deployment
kubectl get all -n family-gifting

# Watch rollout status
kubectl rollout status deployment/api -n family-gifting
kubectl rollout status deployment/web -n family-gifting
kubectl rollout status statefulset/postgres -n family-gifting
```

### Option 2: Deploy Components Individually

```bash
# 1. Create namespace
kubectl apply -f k8s/namespace.yaml

# 2. Apply secrets
kubectl apply -f k8s/secrets.yaml

# 3. Deploy PostgreSQL
kubectl apply -f k8s/postgres/

# 4. Wait for PostgreSQL to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n family-gifting --timeout=300s

# 5. Deploy API
kubectl apply -f k8s/api/

# 6. Wait for API to be ready
kubectl wait --for=condition=ready pod -l app=api -n family-gifting --timeout=300s

# 7. Deploy Web frontend
kubectl apply -f k8s/web/
```

## Verification

### Check Resources

```bash
# Get all resources
kubectl get all -n family-gifting

# Check pod status
kubectl get pods -n family-gifting

# Check services
kubectl get svc -n family-gifting

# Check persistent volumes
kubectl get pvc -n family-gifting
```

### Check Logs

```bash
# API logs
kubectl logs -f deployment/api -n family-gifting

# Web logs
kubectl logs -f deployment/web -n family-gifting

# PostgreSQL logs
kubectl logs -f statefulset/postgres -n family-gifting

# Follow logs from all pods
kubectl logs -f -l app.kubernetes.io/part-of=family-gifting -n family-gifting
```

### Health Checks

```bash
# Check API health
kubectl port-forward svc/api 8000:8000 -n family-gifting
curl http://localhost:8000/health

# Check web
kubectl port-forward svc/web 3000:3000 -n family-gifting
curl http://localhost:3000
```

## Access Services

### Port Forwarding (for testing)

```bash
# Access API
kubectl port-forward svc/api 8000:8000 -n family-gifting

# Access Web
kubectl port-forward svc/web 3000:3000 -n family-gifting

# Access PostgreSQL (for debugging)
kubectl port-forward svc/postgres 5432:5432 -n family-gifting
```

### Ingress (production)

For production access, configure an Ingress controller:

```yaml
# Example ingress configuration (not included)
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: family-gifting
  namespace: family-gifting
spec:
  rules:
  - host: gifts.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web
            port:
              number: 3000
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 8000
```

## Database Migrations

Run database migrations after deploying:

```bash
# Run migrations inside API pod
kubectl exec -it deployment/api -n family-gifting -- uv run alembic upgrade head

# Or use a Job for migrations
kubectl create job --from=cronjob/db-migrate db-migrate-manual -n family-gifting
```

## Scaling

```bash
# Scale API
kubectl scale deployment/api --replicas=3 -n family-gifting

# Scale Web
kubectl scale deployment/web --replicas=3 -n family-gifting

# Check scaling status
kubectl get pods -n family-gifting -w
```

## Updates

### Update Deployment

```bash
# Update image (after rebuilding)
kubectl set image deployment/api api=gifting-api:v2 -n family-gifting

# Or edit deployment
kubectl edit deployment/api -n family-gifting

# Check rollout status
kubectl rollout status deployment/api -n family-gifting

# Rollback if needed
kubectl rollout undo deployment/api -n family-gifting
```

### Update ConfigMap

```bash
# Edit configmap
kubectl edit configmap api-config -n family-gifting

# Restart deployment to pick up changes
kubectl rollout restart deployment/api -n family-gifting
```

## Troubleshooting

### Pods Not Starting

```bash
# Describe pod to see events
kubectl describe pod <pod-name> -n family-gifting

# Check events
kubectl get events -n family-gifting --sort-by='.lastTimestamp'

# Check logs
kubectl logs <pod-name> -n family-gifting
```

### Database Connection Issues

```bash
# Check if postgres is ready
kubectl exec -it statefulset/postgres -n family-gifting -- pg_isready

# Test connection from API pod
kubectl exec -it deployment/api -n family-gifting -- env | grep DATABASE

# Check network connectivity
kubectl exec -it deployment/api -n family-gifting -- nc -zv postgres 5432
```

### Health Probe Failures

```bash
# Check probe configuration
kubectl describe pod <pod-name> -n family-gifting

# Test health endpoint manually
kubectl exec -it deployment/api -n family-gifting -- curl localhost:8000/health

# Check probe logs
kubectl logs <pod-name> -n family-gifting --previous
```

## Cleanup

### Delete Everything

```bash
# Using kustomize
kubectl delete -k k8s/

# Or delete namespace (deletes everything)
kubectl delete namespace family-gifting
```

### Preserve Data (Delete deployments only)

```bash
# Delete deployments but keep PVC
kubectl delete deployment --all -n family-gifting
kubectl delete statefulset --all -n family-gifting

# PVC remains for future use
kubectl get pvc -n family-gifting
```

## Resource Limits

| Service | Memory Request | Memory Limit | CPU Request | CPU Limit |
|---------|---------------|--------------|-------------|-----------|
| API     | 256Mi         | 512Mi        | 100m        | 500m      |
| Web     | 128Mi         | 256Mi        | 50m         | 200m      |
| Postgres| 256Mi         | 512Mi        | 100m        | 500m      |

Total cluster requirements:
- Memory: ~640Mi requested, ~1.25Gi limit
- CPU: ~250m requested, ~1200m limit

## Health Probes Configuration

### API
- **Liveness**: `/health` endpoint, 30s initial delay, 10s interval
- **Readiness**: `/health` endpoint, 10s initial delay, 5s interval

### Web
- **Liveness**: `/` endpoint, 30s initial delay, 10s interval
- **Readiness**: `/` endpoint, 10s initial delay, 5s interval

### PostgreSQL
- **Liveness**: `pg_isready` command, 30s initial delay, 10s interval
- **Readiness**: `pg_isready` command, 10s initial delay, 5s interval

## Security Notes

1. **Never commit secrets.yaml** - it's in .gitignore
2. **Use strong passwords** - generate with `openssl rand -base64 32`
3. **Rotate secrets regularly** - update and restart deployments
4. **Network policies** - consider adding NetworkPolicy resources
5. **RBAC** - configure ServiceAccounts if needed

## Monitoring

### Basic Monitoring

```bash
# Resource usage
kubectl top pods -n family-gifting
kubectl top nodes

# Watch pods
kubectl get pods -n family-gifting -w

# Stream events
kubectl get events -n family-gifting -w
```

### Advanced Monitoring

For production, consider deploying:
- Prometheus for metrics
- Grafana for visualization
- Loki for log aggregation
- Jaeger for distributed tracing

## Backup

### Database Backup

```bash
# Create backup
kubectl exec -it statefulset/postgres -n family-gifting -- \
  pg_dump -U postgres family_gifting > backup.sql

# Restore backup
kubectl exec -i statefulset/postgres -n family-gifting -- \
  psql -U postgres family_gifting < backup.sql
```

### PVC Snapshot

If your storage class supports snapshots:

```bash
# Create snapshot
kubectl create -f - <<EOF
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: postgres-snapshot
  namespace: family-gifting
spec:
  source:
    persistentVolumeClaimName: postgres-pvc
EOF
```
