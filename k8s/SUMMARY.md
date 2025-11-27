# K8s Deployment Summary

## Tasks Completed

- [x] DEPLOY-002: K8s Manifests (1 pt)
- [x] DEPLOY-003: Health Checks (0.5 pt)

## Files Created

```
k8s/
├── namespace.yaml                 # Namespace: family-gifting
├── postgres/
│   ├── pvc.yaml                  # 10Gi persistent volume
│   ├── statefulset.yaml          # Postgres 16, 1 replica, health probes
│   └── service.yaml              # ClusterIP on port 5432
├── api/
│   ├── configmap.yaml            # CORS, API_PORT, environment config
│   ├── deployment.yaml           # FastAPI, 2 replicas, health probes
│   └── service.yaml              # ClusterIP on port 8000
├── web/
│   ├── configmap.yaml            # API URLs, environment config
│   ├── deployment.yaml           # Next.js, 2 replicas, health probes
│   └── service.yaml              # ClusterIP on port 3000
├── secrets.yaml.example          # Template for secrets (DO NOT COMMIT REAL SECRETS)
├── kustomization.yaml            # Kustomize configuration for easy deployment
├── validate.sh                   # Validation script
├── DEPLOY.md                     # Quick deployment guide
├── README.md                     # Comprehensive documentation
└── SUMMARY.md                    # This file
```

## Health Probes Configuration

### PostgreSQL (StatefulSet)
- **Liveness**: `pg_isready -U postgres`
  - Initial delay: 30s
  - Period: 10s
  - Timeout: 5s
  - Failure threshold: 3
- **Readiness**: `pg_isready -U postgres`
  - Initial delay: 10s
  - Period: 5s
  - Timeout: 3s
  - Failure threshold: 2

### API (Deployment)
- **Liveness**: `GET /health` on port 8000
  - Initial delay: 30s
  - Period: 10s
  - Timeout: 5s
  - Failure threshold: 3
- **Readiness**: `GET /health` on port 8000
  - Initial delay: 10s
  - Period: 5s
  - Timeout: 3s
  - Failure threshold: 2

### Web (Deployment)
- **Liveness**: `GET /` on port 3000
  - Initial delay: 30s
  - Period: 10s
  - Timeout: 5s
  - Failure threshold: 3
- **Readiness**: `GET /` on port 3000
  - Initial delay: 10s
  - Period: 5s
  - Timeout: 3s
  - Failure threshold: 2

## Resource Allocation

| Service | Replicas | Memory Request | Memory Limit | CPU Request | CPU Limit |
|---------|----------|----------------|--------------|-------------|-----------|
| PostgreSQL | 1 | 256Mi | 512Mi | 100m | 500m |
| API | 2 | 256Mi | 512Mi | 100m | 500m |
| Web | 2 | 128Mi | 256Mi | 50m | 200m |
| **Total** | **5 pods** | **~640Mi** | **~1.25Gi** | **~250m** | **~1200m** |

## Key Features

### 1. StatefulSet for PostgreSQL
- Persistent storage with PVC (10Gi)
- Stable network identity
- Health probes using `pg_isready`
- Environment variables from secrets

### 2. Deployments for API and Web
- 2 replicas each for high availability
- imagePullPolicy: Never (for homelab local images)
- Health probes on application endpoints
- Environment from ConfigMaps and Secrets
- Init containers to wait for dependencies

### 3. ConfigMaps
- **API ConfigMap**: CORS origins, API port, environment, log level
- **Web ConfigMap**: API URLs, WebSocket URLs, Node environment

### 4. Secrets
- **postgres-secrets**: PostgreSQL password
- **api-secrets**: Database URL, JWT secret key
- Template provided in `secrets.yaml.example`
- Real secrets file (`secrets.yaml`) is gitignored

### 5. Services
- All ClusterIP for internal communication
- postgres:5432
- api:8000
- web:3000

### 6. Init Containers
- API waits for PostgreSQL to be ready
- Web waits for API to be ready
- Ensures proper startup order

### 7. Kustomize Support
- Single command deployment: `kubectl apply -k k8s/`
- Common labels and annotations
- Namespace scoping

## Deployment Steps

### Quick Start

```bash
# 1. Setup secrets
cp k8s/secrets.yaml.example k8s/secrets.yaml
# Edit with real values

# 2. Deploy
kubectl apply -f k8s/secrets.yaml
kubectl apply -k k8s/

# 3. Verify
kubectl get all -n family-gifting
kubectl logs -f deployment/api -n family-gifting
```

### Detailed Steps

See `DEPLOY.md` for comprehensive deployment guide.

## Validation

All manifests validated successfully:

```bash
$ ./validate.sh
========================================
K8s Manifest Validation
========================================

All validations passed!
Manifests are ready for deployment.
========================================

Services:
  - postgres:5432 (ClusterIP)
  - api:8000 (ClusterIP)
  - web:3000 (ClusterIP)

Storage:
  - postgres-pvc (10Gi)

Replicas:
  - postgres: 1 (StatefulSet)
  - api: 2 (Deployment)
  - web: 2 (Deployment)

Total Resources:
  - Memory Request: ~640Mi
  - Memory Limit: ~1.25Gi
  - CPU Request: ~250m
  - CPU Limit: ~1200m
```

## Network Architecture

```
┌─────────────────┐
│   Ingress/LB    │ (optional, for external access)
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼──┐
│ Web  │  │ API │
│ :3000│  │:8000│
└───┬──┘  └──┬──┘
    │        │
    └────┬───┘
         │
    ┌────▼─────┐
    │ Postgres │
    │   :5432  │
    └──────────┘
```

## Security Features

1. **Secrets Management**
   - Sensitive data stored in Kubernetes Secrets
   - Template file for easy setup
   - Real secrets excluded from git

2. **Resource Limits**
   - Memory and CPU limits prevent resource exhaustion
   - Requests ensure minimum resources available

3. **Health Probes**
   - Automatic pod restart on failures
   - Traffic routing only to healthy pods

4. **Network Isolation**
   - ClusterIP services for internal-only access
   - No external exposure by default

## Next Steps

1. **Ingress**: Configure Ingress controller for external access
2. **TLS**: Add TLS certificates for HTTPS
3. **Monitoring**: Deploy Prometheus/Grafana
4. **Backup**: Setup automated database backups
5. **NetworkPolicy**: Add network policies for security
6. **HPA**: Configure Horizontal Pod Autoscaling if needed

## Troubleshooting

### Quick Checks

```bash
# Pod status
kubectl get pods -n family-gifting

# Logs
kubectl logs -f deployment/api -n family-gifting
kubectl logs -f deployment/web -n family-gifting

# Events
kubectl get events -n family-gifting --sort-by='.lastTimestamp'

# Health checks
kubectl port-forward svc/api 8000:8000 -n family-gifting
curl http://localhost:8000/health
```

### Common Issues

1. **Pods not starting**: Check events and logs
2. **Database connection errors**: Verify secrets are correct
3. **Image pull errors**: Import images to K3s/microk8s
4. **Health probe failures**: Check probe endpoints manually

See `README.md` for comprehensive troubleshooting guide.

## Documentation

- **DEPLOY.md**: Quick deployment guide with commands
- **README.md**: Comprehensive documentation with examples
- **validate.sh**: YAML validation and manifest checking

## Standards Compliance

All manifests follow Kubernetes best practices:

- Labels for organization and selection
- Resource requests and limits
- Health probes (liveness and readiness)
- Init containers for dependencies
- ConfigMaps for configuration
- Secrets for sensitive data
- Proper naming conventions
- Namespace isolation
