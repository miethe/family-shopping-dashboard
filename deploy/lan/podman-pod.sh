#!/usr/bin/env bash
# LAN stack for podman hosts without the compose plugin (podman 4.x).
# Same topology as compose.lan.yml: one pod, gateway is the only published port.
#   ./deploy/lan/podman-pod.sh up|stop|start|status|remove-all
# Settings come from .env.lan (LAN_BIND_IP, LAN_PORT, LAN_ORIGIN, POSTGRES_PASSWORD,
# JWT_SECRET_KEY) in the repository root. Everything is named; nothing is matched by
# wildcard, so "remove-all" can only touch the objects below.
set -euo pipefail
cd "$(dirname "$0")/../.."
POD="${POD_NAME:-family-gifting-rehearsal}"
PGVOL="${POD}-pgdata"
UPVOL="${POD}-uploads"
set -a; . ./.env.lan; set +a
: "${LAN_BIND_IP:?}" "${LAN_PORT:?}" "${LAN_ORIGIN:?}" "${POSTGRES_PASSWORD:?}" "${JWT_SECRET_KEY:?}"

case "${1:-}" in
  up)
    podman build -t "${POD}-api" ./services/api
    podman build -t "${POD}-web" --build-arg NEXT_PUBLIC_API_URL=/api/v1 --build-arg NEXT_PUBLIC_WS_URL=/ws ./apps/web
    podman pod exists "$POD" || podman pod create --name "$POD" \
      --publish "${LAN_BIND_IP}:${LAN_PORT}:80" \
      --add-host postgres:127.0.0.1 --add-host api:127.0.0.1 --add-host web:127.0.0.1
    podman volume exists "$PGVOL" || podman volume create "$PGVOL"
    podman volume exists "$UPVOL" || podman volume create "$UPVOL"
    podman container exists "${POD}-postgres" || podman run -d --pod "$POD" --name "${POD}-postgres" --restart unless-stopped \
      -e POSTGRES_DB=family_gifting -e POSTGRES_USER=gifting -e "POSTGRES_PASSWORD=${POSTGRES_PASSWORD}" \
      -v "${PGVOL}:/var/lib/postgresql/data" docker.io/library/postgres:16-alpine
    for _ in $(seq 1 60); do podman exec "${POD}-postgres" pg_isready -U gifting -d family_gifting >/dev/null 2>&1 && break; sleep 2; done
    podman container exists "${POD}-api" || podman run -d --pod "$POD" --name "${POD}-api" --restart unless-stopped \
      -e "DATABASE_URL=postgresql+psycopg://gifting:${POSTGRES_PASSWORD}@postgres:5432/family_gifting" \
      -e "JWT_SECRET_KEY=${JWT_SECRET_KEY}" -e "CORS_ORIGINS=${LAN_ORIGIN}" -e PUBLIC_API_URL= -e UPLOAD_DIR=/tmp/uploads \
      -v "${UPVOL}:/tmp/uploads" "localhost/${POD}-api"
    podman container exists "${POD}-web" || podman run -d --pod "$POD" --name "${POD}-web" --restart unless-stopped "localhost/${POD}-web" \
      sh -c 'HOSTNAME=0.0.0.0 exec node server.js'  # podman sets HOSTNAME to the pod name, so Next would bind only the pod IP
    podman container exists "${POD}-gateway" || podman run -d --pod "$POD" --name "${POD}-gateway" --restart unless-stopped \
      -v "$PWD/deploy/lan/nginx.conf:/etc/nginx/conf.d/default.conf:ro,Z" docker.io/library/nginx:stable-alpine
    for _ in $(seq 1 90); do curl -fsS "http://${LAN_BIND_IP}:${LAN_PORT}/health" 2>/dev/null && echo && exit 0; sleep 2; done
    echo "health check did not pass" >&2; exit 1 ;;
  stop)   podman pod stop "$POD" ;;
  start)  podman pod start "$POD" ;;
  status) podman pod ps --filter "name=^${POD}\$"; podman ps --pod --filter "pod=${POD}" --format '{{.Names}} {{.Status}}' ;;
  remove-all)
    podman pod rm -f "$POD"
    podman volume rm "$PGVOL" "$UPVOL"
    podman image rm "localhost/${POD}-api" "localhost/${POD}-web" ;;
  *) echo "usage: $0 up|stop|start|status|remove-all" >&2; exit 2 ;;
esac
