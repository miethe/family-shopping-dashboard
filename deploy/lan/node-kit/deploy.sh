#!/usr/bin/env bash
# Family Gifting - household instance on rocket-fedora (LAN only). Runs ON the node.
# Repo copy of the node kit (this dir): run `deploy.sh install-units` from here so the node runs this copy. deploy/lan/podman-pod.sh is the simpler rehearsal launcher.
# Run this copy on the node; do not keep a divergent hand-edited copy.
#
#   deploy.sh init-secrets            create ~/.config/family-gifting/env (0600) once; never prints values
#   deploy.sh build <git-sha>         fetch + build images for that exact commit (no restart)
#   deploy.sh up                      create pod/volumes/containers if absent (first deploy)
#   deploy.sh redeploy <git-sha>      backup -> build -> replace api+web containers -> health
#   deploy.sh backup [label]          pg_dump (custom format) + uploads tar to node-local disk
#   deploy.sh restore-test [dump]     restore newest (or given) dump into a throwaway container, compare counts
#   deploy.sh install-units           install systemd --user units (pod start at boot, nightly backup)
#   deploy.sh status | health
#
# Everything is addressed BY NAME (pod "family-gifting", containers "family-gifting-*",
# volumes "family-gifting-pgdata"/"family-gifting-uploads"). No wildcard or unfiltered podman verb.
# Data is household data: `redeploy` always takes a labelled backup first.
set -euo pipefail

POD=family-gifting
ROOT="${FG_ROOT:-$HOME/family-gifting}"
SRC="$ROOT/src"
BACKUPS="$ROOT/backups"
CONF_DIR="$HOME/.config/family-gifting"
ENV_FILE="$CONF_DIR/env"
REPO_URL="https://github.com/miethe/family-shopping-dashboard.git"
PGVOL="${POD}-pgdata"
UPVOL="${POD}-uploads"
PG_IMAGE=docker.io/library/postgres:16-alpine
NGINX_IMAGE=docker.io/library/nginx:stable-alpine
KEEP_NIGHTLY="${FG_KEEP_NIGHTLY:-14}"
HERE="$(cd "$(dirname "$0")" && pwd)"

load_env() {
  [ -f "$ENV_FILE" ] || { echo "missing $ENV_FILE - run: $0 init-secrets" >&2; exit 2; }
  set -a; . "$ENV_FILE"; set +a
  : "${LAN_BIND_IP:?}" "${LAN_PORT:?}" "${POSTGRES_PASSWORD:?}" "${JWT_SECRET_KEY:?}"
}

# The parent retains the lock; Podman and any processes it starts must not.
podman() {
  if [ "${WATCHDOG_MODE:-0}" = 1 ]; then
    timeout -k 2 15 "$(type -P podman)" "$@" 9>&-
  else
    command podman "$@" 9>&-
  fi
}

# Service-owned cgroups can kill conmon and fuse-overlayfs after this script exits.
in_service() {
  [ -r "${FG_CGROUP_FILE:-/proc/self/cgroup}" ] || return 2
  awk -F/ '{for (i=1; i<=NF; i++) if ($i ~ /\.service$/ && $i !~ /^user@[0-9]+\.service$/) found=1} END {exit !found}' "${FG_CGROUP_FILE:-/proc/self/cgroup}"
}

spawn_podman() {
  if in_service; then
    if ! command -v systemd-run >/dev/null 2>&1; then
      echo "ERROR: systemd service cgroup hazard: systemd-run unavailable; refusing unsafe container launch" >&2
      return 1
    fi
    local rc=0
    if [ "${WATCHDOG_MODE:-0}" = 1 ]; then
      timeout -k 2 15 systemd-run --user --scope --quiet --collect -- "$(type -P podman)" "$@" 9>&- || rc=$?
    else
      systemd-run --user --scope --quiet --collect -- "$(type -P podman)" "$@" 9>&- || rc=$?
    fi
    if [ "$rc" -ne 0 ]; then
      echo "ERROR: scoped podman launch failed ($rc); service cgroup cleanup hazard; no unsafe fallback" >&2
      return "$rc"
    fi
  else
    local detection_rc=$?
    if [ "$detection_rc" -ne 1 ]; then
      echo "ERROR: cannot inspect cgroup; refusing unsafe container launch" >&2
      return 1
    fi
    podman "$@"
  fi
}

warn_service() {
  if in_service; then
    echo "WARNING: systemd service cgroup cleanup can kill container helpers; scoped launches are in use" >&2
  else
    local detection_rc=$?
    if [ "$detection_rc" -ne 1 ]; then echo "ERROR: cannot inspect cgroup; refusing unsafe container launch" >&2; return 1; fi
  fi
}

# 0 alive, 1 confirmed failure, 2 timeout/unknown.
exec_liveness() {
  local name rc
  for name in "${POD}-api" "${POD}-web"; do
    rc=0; timeout -k 2 15 "$(type -P podman)" exec "$name" true 9>&- >/dev/null 2>&1 || rc=$?
    case "$rc" in 0) ;; 124|137) return 2 ;; *) return 1 ;; esac
  done
}

pg() { podman exec "${POD}-postgres" "$@"; }

probe() {
  curl --max-time 5 -fsS "http://${LAN_BIND_IP}:${LAN_PORT}/health" >/dev/null 2>&1 &&
    curl --max-time 5 -fsS -o /dev/null "http://${LAN_BIND_IP}:${LAN_PORT}/login" >/dev/null 2>&1
}

health() {
  load_env
  for _ in $(seq 1 90); do
    if probe; then
      echo "healthy: http://${LAN_BIND_IP}:${LAN_PORT}/"; return 0
    fi
    sleep 2
  done
  echo "health check did not pass" >&2; return 1
}

run_api() {
  spawn_podman run -d --pod "$POD" --name "${POD}-api" --restart unless-stopped \
    --memory 768m --cpus 1.5 --pids-limit 512 \
    -e "DATABASE_URL=postgresql+psycopg://gifting:${POSTGRES_PASSWORD}@postgres:5432/family_gifting" \
    -e "JWT_SECRET_KEY=${JWT_SECRET_KEY}" -e "CORS_ORIGINS=http://${LAN_BIND_IP}:${LAN_PORT}" \
    -e PUBLIC_API_URL= -e UPLOAD_DIR=/tmp/uploads \
    -e "APPLE_HOUSEHOLD_EMAILS=${APPLE_HOUSEHOLD_EMAILS:-}" -e "HOUSEHOLD_EMAILS=${HOUSEHOLD_EMAILS:-}" \
    -e UVICORN_HOST=127.0.0.1 -e FORWARDED_ALLOW_IPS=127.0.0.1 \
    -v "${UPVOL}:/tmp/uploads" "localhost/${POD}-api:current" >/dev/null
}

run_web() {
  # podman sets HOSTNAME to the pod name, so Next would bind only the pod IP without the override
  spawn_podman run -d --pod "$POD" --name "${POD}-web" --restart unless-stopped \
    --memory 512m --cpus 1.0 --pids-limit 256 \
    "localhost/${POD}-web:current" sh -c 'HOSTNAME=0.0.0.0 exec node server.js' >/dev/null
}

run_gateway() {
  spawn_podman run -d --pod "$POD" --name "${POD}-gateway" \
    --restart unless-stopped --memory 64m --cpus 0.5 \
    -v "$ROOT/nginx.conf:/etc/nginx/conf.d/default.conf:ro,Z" "$NGINX_IMAGE" >/dev/null
}

container_state() { podman inspect --format '{{.State.Status}}' "$1" 2>/dev/null; }

sustained_health() {
  local i name
  for i in 1 2 3; do
    probe || return 1
    [ "$i" -eq 3 ] || sleep 10
  done
  for name in "${POD}-api" "${POD}-web" "${POD}-gateway"; do
    [ "$(container_state "$name")" = running ] || return 1
  done
  exec_liveness
}

watch_status() {
  printf "timestamp=%s\nstate=%s\nlast_action=%s\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1" "$2" > "$ROOT/watchdog.status.tmp"
  mv "$ROOT/watchdog.status.tmp" "$ROOT/watchdog.status"
}

watch_log() {
  printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" >> "$ROOT/watchdog.log"
  tail -n 500 "$ROOT/watchdog.log" > "$ROOT/watchdog.log.tmp"
  mv "$ROOT/watchdog.log.tmp" "$ROOT/watchdog.log"
}

# Return 2 when a state read cannot establish an answer.
watch_unknown() {
  watch_log "WATCHDOG UNKNOWN $1"
  watch_status unknown "$1"
  return 2
}

watch_probe() {
  local rc
  for path in health login; do
    if curl --max-time 5 -fsS "http://${LAN_BIND_IP}:${LAN_PORT}/$path" >/dev/null 2>&1; then :
    else
      rc=$?
      case "$rc" in 28|124|137) return 2 ;; *) return 1 ;; esac
    fi
  done
}

watch_state() {
  local name="$1" out rc err="$ROOT/watchdog.inspect.err"
  if out="$(podman inspect --format '{{.State.Status}}' "$name" 2>"$err")"; then
    case "$out" in running|exited|stopped|created) printf '%s' "$out" ;; *) return 2 ;; esac
  else
    rc=$?
    if [ "$rc" -ne 124 ] && [ "$rc" -ne 137 ] && grep -Eqi 'no such (container|object)' "$err"; then
      printf '%s' missing
    else
      return 2
    fi
  fi
}

recreate() {
  local name="$1" state="$2"
  watch_log "recreate $name"
  watch_status recovering "recreate $name"
  if [ "$state" != missing ]; then
    podman rm -f "$name" >/dev/null 2>&1 || return 1
  fi
  case "$name" in
    "${POD}-api") run_api ;;
    "${POD}-web") run_web ;;
    "${POD}-gateway") run_gateway ;;
  esac >/dev/null
}

do_watchdog() {
  local failures=0 rc=0 name state pid i
  local -a names states broken
  mkdir -p "$ROOT"
  exec 9>"$ROOT/.deploy.lock"
  flock -n 9 || return 0
  export WATCHDOG_MODE=1
  load_env
  if [ -f "$ROOT/watchdog.failures" ]; then read -r failures < "$ROOT/watchdog.failures" || failures=0; fi
  [[ "$failures" =~ ^[0-9]+$ ]] || failures=0
  # A healthy HTTP response also requires both application filesystems to work.
  for i in 1 2; do
    rc=0; watch_probe || rc=$?
    if [ "$rc" -eq 0 ]; then rc=0; exec_liveness || rc=$?; fi
    if [ "$rc" -eq 0 ]; then
      printf '0\n' > "$ROOT/watchdog.failures"
      watch_status healthy "health probe passed"
      return 0
    fi
    if [ "$rc" -eq 2 ]; then watch_unknown "health curl or exec" || :; return 0; fi
    [ "$i" -eq 2 ] || sleep 3
  done
  names=("${POD}-postgres" "${POD}-api" "${POD}-web" "${POD}-gateway")
  states=() broken=()
  # Observe everything before acting, so an unknown cannot follow an earlier repair.
  for name in "${names[@]}"; do
    if state="$(watch_state "$name")"; then :; else watch_unknown "inspect $name" || :; return 0; fi
    states+=("$state")
    if [ "$state" = running ] && [ "$name" != "${POD}-postgres" ]; then
      if pid="$(podman inspect --format '{{.State.Pid}}' "$name" 2>/dev/null)" && [[ "$pid" =~ ^[1-9][0-9]*$ ]]; then :
      else watch_unknown "inspect pid $name" || :; return 0; fi
      if [ ! -d "${FG_PROC_ROOT:-/proc}/$pid" ]; then broken+=("$name"); continue; fi
      for i in 1 2; do
        rc=0; podman exec "$name" true >/dev/null 2>&1 || rc=$?
        if [ "$rc" -eq 0 ]; then break; fi
        if [ "$rc" -eq 124 ] || [ "$rc" -eq 137 ]; then watch_unknown "exec $name" || :; return 0; fi
        broken+=("$name"); break
      done
    fi
  done
  if [ "$failures" -ge 3 ]; then watch_status gave-up "recovery limit reached"; return 1; fi
  for i in 0 1 2 3; do
    name="${names[$i]}"; state="${states[$i]}"
    if [ "$name" = "${POD}-postgres" ]; then
      if [ "$state" != running ]; then
        watch_log "start $name"; watch_status recovering "start $name"
        if ! spawn_podman start "$name" >/dev/null; then
          watch_log "WATCHDOG POSTGRES DOWN"; watch_status postgres-down "start $name failed"; return 1
        fi
      fi
    elif [ "$state" = exited ] || [ "$state" = stopped ]; then
      watch_log "start $name"; watch_status recovering "start $name"
      spawn_podman start "$name" >/dev/null || rc=1
    elif [ "$state" != running ]; then
      recreate "$name" "$state" || rc=1
    else
      for state in "${broken[@]-}"; do
        [ "$state" != "$name" ] || recreate "$name" running || rc=1
      done
    fi
  done
  if [ "$failures" -eq 1 ]; then
    watch_log "restart ${POD}-gateway"; watch_status recovering "restart ${POD}-gateway"
    spawn_podman restart "${POD}-gateway" >/dev/null || rc=1
  elif [ "$failures" -eq 2 ]; then
    recreate "${POD}-api" "${states[1]}" && recreate "${POD}-web" "${states[2]}" || rc=1
  fi
  if [ "$rc" -eq 0 ]; then
    rc=0; watch_probe || rc=$?
    if [ "$rc" -eq 0 ]; then rc=0; exec_liveness || rc=$?; fi
    if [ "$rc" -eq 0 ]; then printf '0\n' > "$ROOT/watchdog.failures"; watch_status healthy "health probe passed"; return 0; fi
    if [ "$rc" -eq 2 ]; then watch_unknown "health curl or exec" || :; return 0; fi
  fi
  failures=$((failures + 1))
  printf '%s\n' "$failures" > "$ROOT/watchdog.failures"
  watch_log "probe or recovery failed (pass $failures)"
  if [ "$failures" -ge 3 ]; then
    watch_log "WATCHDOG GAVE UP after $failures failed recovery passes"
    watch_status gave-up "recovery limit reached"
  fi
  return 1
}

do_build() {
  local sha="${1:?usage: build <git-sha>}"
  mkdir -p "$ROOT" || return 1
  [ -d "$SRC/.git" ] || git clone -q "$REPO_URL" "$SRC" || return 1
  git -C "$SRC" fetch -q origin '+refs/heads/*:refs/remotes/origin/*' '+refs/pull/*/head:refs/remotes/origin/pr/*' || return 1
  git -C "$SRC" checkout -q --detach "$sha" || return 1
  local full; full="$(git -C "$SRC" rev-parse HEAD)" || return 1
  nice -n 10 podman build -q --cpu-quota 400000 --cpu-period 100000 -t "localhost/${POD}-api:${full:0:12}" "$SRC/services/api" >/dev/null 9>&- || return 1
  nice -n 10 podman build -q --cpu-quota 400000 --cpu-period 100000 -t "localhost/${POD}-web:${full:0:12}" \
    --build-arg NEXT_PUBLIC_API_URL=/api/v1 --build-arg NEXT_PUBLIC_WS_URL=/ws "$SRC/apps/web" >/dev/null 9>&- || return 1
  podman tag "localhost/${POD}-api:${full:0:12}" "localhost/${POD}-api:current" || return 1
  podman tag "localhost/${POD}-web:${full:0:12}" "localhost/${POD}-web:current" || return 1
  install -m 0644 "$SRC/deploy/lan/nginx.conf" "$ROOT/nginx.conf" || return 1
  echo "$full" > "$ROOT/DEPLOYED_SHA.pending" || return 1
  echo "built ${full}"
}

do_up() {
  warn_service
  load_env
  podman pod exists "$POD" || spawn_podman pod create --name "$POD" \
    --publish "${LAN_BIND_IP}:${LAN_PORT}:80" \
    --add-host postgres:127.0.0.1 --add-host api:127.0.0.1 --add-host web:127.0.0.1 >/dev/null
  podman volume exists "$PGVOL" || podman volume create "$PGVOL" >/dev/null
  podman volume exists "$UPVOL" || podman volume create "$UPVOL" >/dev/null
  podman container exists "${POD}-postgres" || spawn_podman run -d --pod "$POD" --name "${POD}-postgres" \
    --restart unless-stopped --memory 512m --cpus 1.0 --pids-limit 256 \
    -e POSTGRES_DB=family_gifting -e POSTGRES_USER=gifting -e "POSTGRES_PASSWORD=${POSTGRES_PASSWORD}" \
    -v "${PGVOL}:/var/lib/postgresql/data" "$PG_IMAGE" >/dev/null
  for _ in $(seq 1 60); do pg pg_isready -U gifting -d family_gifting >/dev/null 2>&1 && break; sleep 2; done
  podman container exists "${POD}-api" || run_api
  podman container exists "${POD}-web" || run_web
  podman container exists "${POD}-gateway" || run_gateway
  health
  exec_liveness || { echo "container filesystem liveness failed or timed out" >&2; return 1; }
  [ -f "$ROOT/DEPLOYED_SHA.pending" ] && mv "$ROOT/DEPLOYED_SHA.pending" "$ROOT/DEPLOYED_SHA" || true
}

validate_dump() {
  local dump="$1" toc
  [ -s "$dump" ] || { echo "backup validation failed: empty dump" >&2; return 1; }
  toc="$(podman exec -i "${POD}-postgres" pg_restore -l < "$dump")" || {
    echo "backup validation failed: pg_restore cannot read $dump" >&2; return 1;
  }
  [ -n "$toc" ] || { echo "backup validation failed: empty table of contents" >&2; return 1; }
}

lock_operations() {
  mkdir -p "$ROOT"
  exec 9>"$ROOT/.deploy.lock"
  flock -w 180 9 || { echo "could not acquire deploy lock within 180 seconds" >&2; exit 1; }
}

do_backup() {
  local label="${1:-nightly}"
  mkdir -p "$BACKUPS" || return 1
  chmod 700 "$BACKUPS" || return 1
  local ts; ts="$(date +%Y%m%dT%H%M%S)"
  local base="$BACKUPS/${POD}-${ts}-${label}"
  pg pg_dump -U gifting -d family_gifting -Fc > "${base}.dump.tmp" || return 1
  mv "${base}.dump.tmp" "${base}.dump" || return 1
  spawn_podman run --rm -v "${UPVOL}:/u:ro" "$PG_IMAGE" tar -C /u -cf - . > "${base}.uploads.tar" || return 1
  chmod 600 "${base}.dump" "${base}.uploads.tar" || return 1
  validate_dump "${base}.dump" || return 1
  if [ "$label" = nightly ]; then
    # prune ONLY nightly files beyond the newest $KEEP_NIGHTLY; labelled (pre-redeploy) backups are kept
    ls -1t "$BACKUPS"/${POD}-*-nightly.dump 2>/dev/null | tail -n +"$((KEEP_NIGHTLY + 1))" | while read -r f; do
      rm -f -- "$f" "${f%.dump}.uploads.tar"
    done
  fi
  echo "${base}.dump"
}

do_restore_test() {
  local dump="${1:-}"
  [ -n "$dump" ] || dump="$(ls -1t "$BACKUPS"/${POD}-*.dump | head -1)"
  [ -s "$dump" ] || { echo "no dump to test" >&2; exit 1; }
  local c="${POD}-restoretest"
  podman container exists "$c" && podman rm -f "$c" >/dev/null
  trap 'podman rm -f family-gifting-restoretest >/dev/null 2>&1 || true' EXIT
  spawn_podman run -d --name "$c" --memory 512m --cpus 1.0 -e POSTGRES_PASSWORD=restoretest \
    -e POSTGRES_USER=gifting -e POSTGRES_DB=family_gifting "$PG_IMAGE" >/dev/null
  for _ in $(seq 1 60); do podman exec "$c" pg_isready -U gifting -d family_gifting >/dev/null 2>&1 && break; sleep 2; done
  sleep 2
  podman exec -i "$c" pg_restore -U gifting -d family_gifting --no-owner < "$dump"
  local q="select (select count(*) from users)||','||(select count(*) from gifts)||','||(select count(*) from alembic_version)"
  local restored live
  restored="$(podman exec "$c" psql -U gifting -d family_gifting -Atc "$q")"
  live="$(pg psql -U gifting -d family_gifting -Atc "$q")"
  echo "restore-test dump=$(basename "$dump") restored(users,gifts,alembic)=${restored} live=${live}"
  [ -n "$restored" ] || { echo "RESTORE FAILED" >&2; return 1; }
}

do_redeploy() {
  local sha="${1:?usage: redeploy <git-sha>}" bk old_api old_web old_sha old_nginx
  warn_service
  load_env
  bk="$(do_backup "pre-redeploy-${sha:0:12}")" || { echo "pre-redeploy backup failed; containers untouched" >&2; exit 1; }
  validate_dump "$bk" || { echo "pre-redeploy backup invalid; containers untouched" >&2; exit 1; }
  echo "pre-redeploy backup: $bk"
  old_api="$(podman image inspect --format '{{.Id}}' "localhost/${POD}-api:current")" || exit 1
  old_web="$(podman image inspect --format '{{.Id}}' "localhost/${POD}-web:current")" || exit 1
  old_sha="$(cat "$ROOT/DEPLOYED_SHA")" || { echo "missing deployed SHA" >&2; exit 1; }
  old_nginx="$(cat "$ROOT/nginx.conf" && printf ' .')" || { echo "missing gateway config; containers untouched" >&2; exit 1; }
  if ! (set -e; do_build "$sha"); then
    printf '%s' "${old_nginx% .}" > "$ROOT/nginx.conf" || { echo "failed to restore gateway config" >&2; exit 3; }
    podman tag "$old_api" "localhost/${POD}-api:current"
    podman tag "$old_web" "localhost/${POD}-web:current"
    rm -f "$ROOT/DEPLOYED_SHA.pending"
    echo "build failed; containers untouched; backup: $bk" >&2
    exit 1
  fi
  local health_rc=1
  if podman rm -f --ignore "${POD}-api" "${POD}-web" >/dev/null 2>&1 && run_api && run_web &&
     spawn_podman restart "${POD}-gateway" >/dev/null && health; then
    health_rc=0; sustained_health || health_rc=$?
    if [ "$health_rc" -eq 0 ]; then
      mv "$ROOT/DEPLOYED_SHA.pending" "$ROOT/DEPLOYED_SHA"
      return
    fi
    if [ "$health_rc" -eq 2 ]; then
      echo "deployment health UNKNOWN: filesystem exec timed out; no automatic rollback; backup: $bk" >&2
      return 2
    fi
  fi
  echo "deployment failed; restoring previous images; database is not automatically restored" >&2
  if printf '%s' "${old_nginx% .}" > "$ROOT/nginx.conf" &&
     podman tag "$old_api" "localhost/${POD}-api:current" &&
     podman tag "$old_web" "localhost/${POD}-web:current" &&
     podman rm -f --ignore "${POD}-api" "${POD}-web" >/dev/null 2>&1 &&
     run_api && run_web && spawn_podman restart "${POD}-gateway" >/dev/null && health; then
    health_rc=0; sustained_health || health_rc=$?
    if [ "$health_rc" -eq 0 ]; then
      rm -f "$ROOT/DEPLOYED_SHA.pending"
      echo "ROLLED BACK to $old_sha; pre-redeploy backup: $bk" >&2
      exit 1
    fi
    if [ "$health_rc" -eq 2 ]; then
      rm -f "$ROOT/DEPLOYED_SHA.pending"
      echo "ROLLBACK UNKNOWN: filesystem exec timed out; backup: $bk" >&2
      exit 2
    fi
  fi
  rm -f "$ROOT/DEPLOYED_SHA.pending"
  echo "ROLLBACK UNHEALTHY; pre-redeploy backup: $bk; database not automatically restored" >&2
  exit 3
}

do_init_secrets() {
  mkdir -p "$CONF_DIR"; chmod 700 "$CONF_DIR"
  if [ -f "$ENV_FILE" ]; then echo "exists: $ENV_FILE (unchanged)"; return 0; fi
  umask 077
  {
    echo "LAN_BIND_IP=${FG_BIND_IP:-10.42.10.76}"
    echo "LAN_PORT=${FG_PORT:-3047}"
    echo "POSTGRES_PASSWORD=$(openssl rand -hex 32)"
    echo "JWT_SECRET_KEY=$(openssl rand -hex 32)"
  } > "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  echo "created: $ENV_FILE (0600; values not printed)"
}

do_install_units() {
  mkdir -p "$HOME/.config/systemd/user"
  for u in family-gifting.service family-gifting-backup.service family-gifting-backup.timer family-gifting-watchdog.service family-gifting-watchdog.timer; do
    install -m 0644 "$HERE/systemd/$u" "$HOME/.config/systemd/user/$u"
  done
  install -m 0755 "$HERE/deploy.sh" "$ROOT/deploy.sh"
  systemctl --user daemon-reload
  systemctl --user enable family-gifting.service family-gifting-backup.timer family-gifting-watchdog.timer
  systemctl --user start family-gifting.service family-gifting-backup.timer family-gifting-watchdog.timer
}

case "${1:-}" in
  _spawn-probe) shift; [ "$#" -eq 2 ] || exit 2; spawn_podman run -d --pull=never --name "$1" --memory 32m "$2" sleep 90 ;;
  init-secrets) do_init_secrets ;;
  build) shift; do_build "$@" ;;
  up) do_up ;;
  redeploy) lock_operations; shift; do_redeploy "$@" ;;
  backup) lock_operations; shift; do_backup "$@" ;;
  restore-test) lock_operations; shift; do_restore_test "$@" ;;
  install-units) do_install_units ;;
  watchdog) do_watchdog ;;
  health) health ;;
  status)
    podman pod ps --filter "name=^${POD}\$"
    podman ps --filter "pod=${POD}" --format '{{.Names}} {{.Status}}'
    echo "deployed: $(cat "$ROOT/DEPLOYED_SHA" 2>/dev/null || echo unknown)" ;;
  *) sed -n '2,14p' "$0"; exit 2 ;;
esac
