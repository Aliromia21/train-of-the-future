# Train of the Future

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vuedotjs&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-CC2927?logo=microsoftsqlserver&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![CI](https://github.com/Aliromia21/train-of-the-future/actions/workflows/ci.yml/badge.svg)

A real-time train fleet monitoring platform built with Vue.js 3, Node.js/TypeScript, SQL Server 2022, Python, Swagger/OpenAPI, WebSocket, and Docker.

---

## Quick Start

```bash
git clone https://github.com/Aliromia21/train-of-the-future.git
cd train-of-the-future

# Starting all 4 containers
docker compose up --build -d

# Running database migration just once at start
docker exec -it train-backend node dist/shared/database/migrate.js

# Opening the dashboard
open http://localhost:8080
```

| Service | URL |
|---------|-----|
| Dashboard | http://localhost:8080 |
| API | http://localhost:3000/api |
| Swagger UI | http://localhost:3000/api/docs |
| Health Check | http://localhost:3000/api/health |

---

## Architecture

```
[Python Simulator]
  10 trains × every 5s
        │
        ▼ POST /api/telemetry
[Node.js Backend]
  ├── MERGE → train_telemetry (current state)
  ├── INSERT → telemetry_log (history)
  ├── Alert Engine (Observer Pattern)
  │     ├── OfflineRule
  │     ├── WifiRule
  │     └── SpeedRule
  └── WebSocket broadcast
        │
        ▼ ws://localhost:3001
[Vue.js Dashboard]
  ├── Fleet Cards (live status)
  ├── Leaflet.js Map (live positions)
  ├── Alert Panel (real-time alerts)
  └── Analytics (Chart.js)
```

**Architecture Decision: Modular Monolith**

 Train of the Future uses a Modular Monolith: clear module boundaries with separate controllers, services, and repositories, deployed as a single process. If a module needs independent scaling later, it can be extracted with minimal refactoring because the boundaries are already clean.

---

## Design Patterns

### Repository Pattern
```
Controller → Service → Repository → SQL Server
```
All SQL queries live in `*.repository.ts` files. Services never touch the database directly. Switching from SQL Server to PostgreSQL would only require changing the repository layer.

### Observer Pattern (Alert Engine)
```typescript
alertEngine.registerRule(OfflineRule);   // no data for 60s
alertEngine.registerRule(WifiRule);      // signal < 50%
alertEngine.registerRule(SpeedRule);     // exceeds max_speed

alertEngine.on('alert', (alert) => {
  realtimeService.broadcast({ type: 'ALERT', payload: alert });
});
```
Adding a new alert type = writing one rule object and registering it. No changes to the engine.

### DTO Pattern
```
DB Entity (snake_case)     →    API Response (camelCase)
train_number               →    trainNumber
max_speed                  →    maxSpeed
created_at (Date)          →    createdAt (ISO string)
```

### EventEmitter (Internal Pub/Sub)
everything is in one process, so Node.js EventEmitter is simpler and faster. If the system becomes microservices later, replacing the EventEmitter with Redis Pub/Sub is a nice idea — same interface, different implementation.

---

## Tech Stack

| Layer | Technology 
|-------|------------
| **Backend** | Node.js 20 + Express + TypeScript 
| **Frontend** | Vue.js 3 (Composition API) + Vite
| **Database** | SQL Server 2022 
| **API Docs** | Swagger / OpenAPI 3.0 
| **Real-time** | WebSocket (`ws`) 
| **Simulator** | Python 3.12 
| **Map** | Leaflet.js 
| **Charts** | Chart.js 
| **Validation** | Zod 
| **DevOps** | Docker Compose + GitHub Actions 

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Fleet Dashboard | Done | Real-time train cards with status badges (ONLINE/OFFLINE/MAINTENANCE) |
| Live Map | Done | Leaflet.js interactive map with color-coded train markers |
| Train Detail Page | Done | Speed/WiFi history charts + event log per train |
| Trains REST API | Done | Full CRUD with Swagger documentation |
| Telemetry Ingestion | Done | MERGE upsert (current state) + append-only log (history) |
| WebSocket Live Updates | Done | Server pushes events to all connected clients |
| Alert Engine | Done | Observer pattern — OFFLINE, WIFI_DEGRADED, SPEED_VIOLATION rules |
| Alert Panel | Done | Real-time alert display with severity badges |
| Analytics Endpoints | Done | Fleet summary + daily statistics |
| Statistics Dashboard | Done | Chart.js — status distribution + speed charts |
| Python Simulator | Done | 10 concurrent trains, tunnel zones, offline queue with flush |
| Offline Queue | Done | Simulator queues telemetry in tunnels, flushes on exit |
| Docker Compose | Done | 4 containers — db, backend, frontend, simulator |
| GitHub Actions CI | Done | Lint + test + docker build on every push |
| Rate Limiting | Done | Global 100 req/15min + write 10 req/min |
| Authentication | Planned | JWT-based access control |

---

## API Reference

### Trains

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| `GET` | `/api/health` | System health check | 200 |
| `GET` | `/api/trains` | List all trains | 200 |
| `GET` | `/api/trains/:id` | Get train by ID | 200 / 404 |
| `POST` | `/api/trains` | Create train | 201 / 400 |
| `PUT` | `/api/trains/:id` | Update train | 200 / 404 |
| `DELETE` | `/api/trains/:id` | Delete train | 204 / 404 |

### Telemetry & Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/telemetry` | Receive telemetry from simulator |
| `GET` | `/api/analytics/fleet` | Current fleet summary |
| `GET` | `/api/reports/daily?date=YYYY-MM-DD` | Daily statistics |

**Response format:**
```json
{
  "success": true,
  "data": {},
  "message": "optional"
}
```

Full interactive documentation: `http://localhost:3000/api/docs`

---

## Database Schema

6 tables in SQL Server 2022:

```sql
trains              -- Fleet registry (10 trains seeded)
train_telemetry     -- Current state per train (MERGE/UPSERT)
telemetry_log       -- Historical record (append-only, indexed)
alerts              -- Detected problems (partial index on unresolved)
stations            -- 8 stations (Hannover → Berlin route)
daily_stats         -- Pre-aggregated metrics (O(1) dashboard reads)
```

**Key design decision:** `train_telemetry` (current state) is separated from `telemetry_log` (history). The dashboard always reads `train_telemetry` — max 10 rows, always fast, regardless of how many millions of records are in `telemetry_log`.

---

## Project Structure

```
train-of-the-future/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── trains/           # CRUD — routes, controller, service, repository, mapper
│   │   │   ├── telemetry/        # Ingestion — validator, service, repository
│   │   │   ├── alerts/           # Observer — engine, rules, observer
│   │   │   ├── analytics/        # Reports — controller, service, repository
│   │   │   └── realtime/         # WebSocket — broadcast service
│   │   ├── shared/
│   │   │   ├── config/env.ts     # Environment configuration
│   │   │   ├── database/         # Connection pool, migrations, seed
│   │   │   ├── middleware/       # Error handler, rate limiter, 404
│   │   │   └── types/index.ts    # Shared TypeScript interfaces + DTOs
│   │   ├── app.ts                # Express + Swagger + middleware setup
│   │   └── index.ts              # Bootstrap + WebSocket + graceful shutdown
│   ├── Dockerfile                # Multi-stage build
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TrainCard.vue     # Status card with click navigation
│   │   │   ├── TrainMap.vue      # Leaflet.js live map
│   │   │   └── AlertPanel.vue    # Real-time alert display
│   │   ├── composables/
│   │   │   └── useWebSocket.ts   # Auto-reconnect WebSocket composable
│   │   ├── views/
│   │   │   ├── DashboardView.vue # Fleet overview + map + alerts
│   │   │   ├── TrainDetailView.vue # Per-train charts + event log
│   │   │   └── AnalyticsView.vue # Statistics + Chart.js
│   │   ├── services/api.ts       # Axios client
│   │   └── styles/tokens.css     # CSS design tokens
│   ├── Dockerfile                # Multi-stage build + nginx
│   └── nginx.conf                # SPA fallback + API proxy
├── simulator/
│   └── simulator.py              # 10 trains, tunnel zones, offline queue
├── docker-compose.yml            # 4 containers with health checks
├── .github/workflows/ci.yml      # Lint + test + docker build
└── README.md
```

---

## Development

### Run locally (without Docker)

```bash
# Start only the database
docker compose up db -d

# Backend
cd backend
cp .env.example .env
npm install
npm run migrate
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev

# Simulator (new terminal)
cd simulator
pip install -r requirements.txt
python simulator.py
```

### Run tests

```bash
cd backend
npm test
npm run test:coverage
```

### Lint

```bash
cd backend
npm run lint
```

---

## CI/CD

GitHub Actions runs on every push to `main`:

| Job | What it does |
|-----|-------------|
| `lint-backend` | ESLint on all TypeScript files |
| `test-backend` | Jest integration tests |
| `docker-build` | Verifies all 3 Dockerfiles build successfully |

---


## License

Internal use — all rights reserved.




