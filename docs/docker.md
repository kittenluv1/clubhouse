# Docker Dev Environment

Runs the Next.js dev server in a container while connecting to your existing hosted Supabase project. Useful for a consistent Node environment across machines without any local DB setup.

---

## Architecture

```
Browser
  │
  ▼
Next.js :3000  (Docker container, node:20-alpine)
  │
  └──▶  Hosted Supabase  (auth, DB, REST — unchanged)
```

The container reads `.env.local` directly, so it uses the same Supabase project as your normal local dev. No local Postgres, no Kong, no GoTrue.

### How hot-reload works

The project directory is bind-mounted into the container at `/app`. Changes to `src/` reflect immediately. A named volume pins `/app/node_modules` so the container's Linux binaries are never overwritten by the host's macOS `node_modules`.

---

## Setup

### Prerequisites

- Docker Desktop installed and running
- `.env.local` already set up (same as normal local dev)

### Start

```bash
docker compose up --build
```

First boot takes ~30–60s (image pull + `npm ci`). Subsequent starts are faster:

```bash
docker compose up
```

App is at `http://localhost:3000`.

---

## Day-to-day usage

```bash
# Start
docker compose up

# Start in background
docker compose up -d

# View logs
docker compose logs -f next

# Rebuild image (needed after package.json changes)
docker compose up --build

# Stop
docker compose down
```

---

## Files

| File | Purpose |
|------|---------|
| `Dockerfile.dev` | `node:20-alpine` image — installs deps, binds source, starts dev server |
| `docker-compose.yml` | Single `next` service — reads `.env.local`, mounts project directory |
| `.dockerignore` | Excludes `node_modules`, `.next`, `.env*`, `.git` from build context |
