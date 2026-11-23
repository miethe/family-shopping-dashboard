---
title: LAN first-use runbook
date: 2026-11-18
status: rehearsal-required
---

# One address for both phones

This is a deployment candidate, not a deployed instance. Use the standalone `compose.lan.yml` from the repository root, on the owner-selected existing Docker host. Do not combine it with `docker-compose.yml`: that file is the older workstation development setup. The release package uses a new, separate database volume; it does not import or overwrite an existing database.

## Prepare on the selected host

Prerequisite: Docker Engine with Compose v2. Select a private LAN interface reachable from both phones; reserve that address on the home router if needed. Keep the router's WAN forwarding, public tunnels and public DNS unchanged.

```sh
cp .env.lan.example .env.lan
chmod 600 .env.lan
# Generate twice; paste distinct outputs into POSTGRES_PASSWORD and JWT_SECRET_KEY.
openssl rand -hex 32
openssl rand -hex 32
```

Set `LAN_BIND_IP` to that host's actual private LAN IP, `LAN_PORT` to an unused port (default 3030), and `LAN_ORIGIN` to `http://<that-IP>:<that-port>` without a trailing slash. The sample address in the template is not an assigned host. Both secrets must be nonempty; use hexadecimal for the database password because it is embedded in a connection URL. Keep `.env.lan`, uploads, backups and real household data out of Git.

```sh
docker compose --env-file .env.lan -f compose.lan.yml config --quiet
docker compose --env-file .env.lan -f compose.lan.yml up --build --wait --wait-timeout 300
docker compose --env-file .env.lan -f compose.lan.yml ps
```

The API image applies Alembic migrations before serving. The web image uses the repository's pnpm version and builds with `/api/v1` and `/ws`; changing the LAN IP does not require rebuilding browser endpoint addresses. Upload URLs also use the same origin. Only the gateway port is published; PostgreSQL, API and web remain on the Compose network. The database and upload directories use named volumes. The API's upload directory is owned by its non-root runtime user.

The binding is an interface choice, not a firewall or household authorization system. Use the trusted home network; leave remote access to the separate app-ops decision. The current app offers open registration, a shared single-family dataset and no password recovery UI. Do not treat this instance as a multi-household service.

## Prove first use

Before entering real data, use two disposable `example.test` accounts and sample entities:

1. Open `http://<chosen-IP>:3030/health` and verify the JSON says both `status: healthy` and `db: connected`. A 200 response alone is insufficient.
2. On phone A, visit `/register`, create sample account A, then sign out and sign back in at `/login`. Repeat on phone B for sample account B. Use the same address on both, on home Wi-Fi.
3. Add a sample person from People. On Events, expand **Plan an event**, create a sample holiday occurrence, open it, and save money/count allowances for that person.
4. Press the global +, save an `https://example.com/` gift idea with a price, person and event. Confirm it appears in Ideas and the recipient envelope. Change its phase to Bought, In hand and Given. Refresh on phone B and confirm the same saved values.
5. Open Budgets and the person's history; confirm the given gift and spending. Open Calendar view on the event shelf and exercise Upcoming, Month and Season, including a closed occurrence.
6. Upload a sample image through the existing person profile editor; reopen its saved URL through the LAN address. Capture the seeded phone screens using the [evidence checklist](evidence/2026-11/README.md).
7. Run the restart below, then reload on both phones and confirm both account logins, event, allowance, gift phase and uploaded image survive. Record the deployed commit, chosen URL and results in private node evidence.

```sh
docker compose --env-file .env.lan -f compose.lan.yml restart
docker compose --env-file .env.lan -f compose.lan.yml up --wait --wait-timeout 300
```

If the web shell opens but sign-in fails, inspect browser network requests: they should target that same address under `/api/v1`, never the phone's localhost. Inspect API logs for failed migrations. If uploads fail, check the upload volume's ownership. Do not delete a populated volume to make startup pass.

Service-worker caching is limited to public icons and the manifest; API responses, uploads and signed-in pages are always fetched live. Offline editing is not available. LAN HTTP does not enable service workers on phones. A later HTTPS origin requires a separate verified hosting path; Safari's home-screen shortcut is optional, and this cut needs no Apple developer account or native install.

## Preserve data before any upgrade

Keep backups outside the public checkout in a private backup directory. From the repository root, with `BACKUP_DIR` set to that existing private directory:

```sh
docker compose --env-file .env.lan -f compose.lan.yml exec -T postgres pg_dump -U gifting -d family_gifting -Fc > "$BACKUP_DIR/gifting.dump"
docker compose --env-file .env.lan -f compose.lan.yml cp api:/tmp/uploads "$BACKUP_DIR/uploads"
```

Record the current deployed commit privately. Restore into a separate disposable instance and verify the sample journey before relying on a backup. Database restore and container restart have not been rehearsed in this clone, which has no Docker daemon. Do not run `down -v`; it removes the persistent volumes. Stopping with `docker compose --env-file .env.lan -f compose.lan.yml stop` preserves them. A code rollback after a schema migration needs a compatible database backup; changing the image alone does not undo migration state.

## Configuration references

The package follows Docker's [required-value interpolation](https://docs.docker.com/reference/compose-file/interpolation/) and [explicit host-IP port bindings](https://docs.docker.com/reference/compose-file/services/#ports). The gateway forwards WebSocket upgrade headers following [NGINX's official example](https://nginx.org/en/docs/http/websocket.html). These references explain configuration; they are not substitutes for the host rehearsal.
