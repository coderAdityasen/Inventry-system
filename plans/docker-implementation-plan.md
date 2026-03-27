# Docker Implementation Plan for Inventory Management System

## Overview

This project uses Docker and Docker Compose to containerize the entire application stack. You do **NOT** need to manually build Docker images - the Dockerfiles are already defined and will be built automatically by Docker Compose when you run the startup commands.

---

## Architecture

The Docker setup consists of **3 services**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network                          │
│                     inventory-network                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Backend    │  │   Frontend   │  │    MySQL     │      │
│  │   :5000      │  │   :5173      │  │   :3306      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│        ▲                  ▲                  ▲              │
│        │                  │                  │              │
│        └──────────────────┴──────────────────┘              │
│                    Docker Compose                           │
└─────────────────────────────────────────────────────────────┘
```

### Services

| Service   | Container Name       | Port Mapping | Purpose              |
|-----------|---------------------|--------------|---------------------|
| **Backend**  | inventory-backend   | 5000:5000    | Node.js/Express API |
| **Frontend** | inventory-frontend-dev | 5173:80  | React app (Vite dev) |
| **MySQL**    | inventory-mysql     | 3306:3306    | MySQL 8 database    |

---

## Docker Configuration Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Development environment |
| `docker-compose.prod.yml` | Production environment |
| `docker/Dockerfile.backend` | Backend Node.js image |
| `docker/Dockerfile.frontend` | Frontend React + Nginx image |
| `docker/nginx.conf` | Nginx configuration for frontend |

---

## How to Work with Docker

### Option 1: Development Mode (Recommended)

This uses **hot-reloading** - changes to your code will reflect immediately without rebuilding.

```bash
# From project root, run:
npm run dev
```

**What happens:**
1. Docker Compose reads `docker-compose.yml`
2. Builds Backend Docker image (if not built)
3. Builds Frontend Docker image (if not built)
4. Starts all 3 containers
5. Maps volumes so you can edit code live

**Access URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- MySQL: localhost:3306

### Option 2: Development Mode (Rebuild First)

If you want to force a fresh build:

```bash
npm run dev:build
```

---

### Option 3: Production Mode

Builds optimized production images:

```bash
# Build and start production
npm run prod
```

Or to force rebuild:

```bash
npm run prod:build
```

**Production differences:**
- Frontend served via Nginx (port 80)
- Optimized production build
- Different environment variables

---

## Common Docker Commands

### View running containers
```bash
docker ps
```

### View logs
```bash
# All containers
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql

# Follow logs in real-time
docker-compose logs -f
```

### Stop all services
```bash
# Stop running containers (keeps data)
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v
```

### Restart a specific service
```bash
docker-compose restart backend
```

### Access container shell
```bash
docker exec -it inventory-backend sh
docker exec -it inventory-mysql sh
```

---

## Environment Variables

### Development (docker-compose.yml)
Pre-configured with these defaults:
- `NODE_ENV=development`
- `DB_HOST=host.docker.internal` (connects to host MySQL or Docker MySQL)
- `DB_USER=root`
- `DB_PASSWORD=password`
- `DB_NAME=inventory_db`

### Production (docker-compose.prod.yml)
Uses environment variables (you must set these):
- `DB_PASSWORD`
- `DB_ROOT_PASSWORD`
- `API_URL`

---

## Why Volumes are Mounted

The development setup uses **volume mounts** for hot-reloading:

```yaml
volumes:
  - ./backend:/app        # Maps host ./backend to container /app
  - /app/node_modules     # Keeps container's node_modules
```

This means:
- You edit files in your local `backend/` folder
- Changes appear immediately inside the container
- No need to rebuild when changing code

---

## Troubleshooting

### MySQL connection refused
Make sure the MySQL container is running and healthy:
```bash
docker-compose ps
docker-compose logs mysql
```

### Port already in use
If ports 5000, 5173, or 3306 are occupied, modify `docker-compose.yml` to use different ports.

### Clean start
```bash
docker-compose down -v
docker-compose up --build
```

---

## Summary

| Task | Command |
|------|---------|
| **Start development** | `npm run dev` |
| **Rebuild & start** | `npm run dev:build` |
| **Start production** | `npm run prod` |
| **Stop everything** | `docker-compose down` |
| **View logs** | `docker-compose logs -f` |

You do **NOT** need to manually run `docker build`. The Dockerfiles are automatically built when you run the `docker-compose up` commands via the npm scripts.