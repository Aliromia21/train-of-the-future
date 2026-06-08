# Train of the Future

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vuedotjs&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-CC2927?logo=microsoftsqlserver&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-010101?logo=socket.io&logoColor=white)

A real-time train fleet monitoring platform designed for enterprise railway operations. The system provides REST APIs for fleet management, live telemetry ingestion, and operational alerting — built for reliability, maintainability, and scale within a modular monolith architecture.

---

## Architecture Overview

The application follows a **Modular Monolith** architecture: a single deployable unit with clearly separated domain modules and strict layer boundaries.

```
HTTP Request
    ↓
Routes          →  Thin routing & OpenAPI documentation
    ↓
Controllers     →  Input validation & HTTP response handling
    ↓
Services        →  Business logic & orchestration
    ↓
Repositories    →  Parameterized database access
    ↓
SQL Server
```

**Design patterns in use:**

| Pattern | Purpose |
|---------|---------|
| **Repository** | Abstracts all data access behind a clean interface |
| **Observer** | Powers real-time alerts and WebSocket event propagation |
| **DTO** | Separates internal database entities from API response shapes |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js, Express.js, TypeScript, Swagger / OpenAPI 3.0 |
| **Frontend** | Vue.js 3 (Composition API), Vite, Axios |
| **Database** | Microsoft SQL Server 2022 |
| **Real-time** | WebSocket (`ws`) |
| **Data Processing** | Python (telemetry simulator & analytics scripts) |
| **Infrastructure** | Docker, Docker Compose, Helmet, CORS, Rate Limiting |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git

### 1. Clone & Install

```bash
git clone <repository-url>
cd train-of-the-future

# Backend dependencies
cd backend && npm install

# Frontend dependencies
cd ../frontend && npm install
```

### 2. Environment Setup

Copy the example environment file and adjust values if needed:

```bash
cd backend
cp .env.example .env
```

Ensure `DB_PASSWORD` matches the password defined in `docker-compose.yml`:

```env
DB_HOST=localhost
DB_PORT=1433
DB_NAME=TrainOfTheFuture
DB_USER=sa
DB_PASSWORD=TrainPass123!
```

### 3. Start the Database

From the project root:

```bash
docker compose up db -d
```

Wait until the SQL Server container is healthy before proceeding.

### 4. Run Migrations & Seed Data

```bash
cd backend
npm run migrate
npm run seed
```

### 5. Start the Backend

```bash
npm run dev
```

The API will be available at:

| Resource | URL |
|----------|-----|
| API base | `http://localhost:3000/api` |
| Health check | `http://localhost:3000/api/health` |
| Swagger UI | `http://localhost:3000/api/docs` |

### 6. Start the Frontend (optional)

```bash
cd frontend
npm run dev
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/health` | System health check | — |
| `GET` | `/api/trains` | List all trains in the fleet | — |
| `GET` | `/api/trains/:id` | Retrieve a single train by ID | — |
| `POST` | `/api/trains` | Create a new train | — |
| `PUT` | `/api/trains/:id` | Update an existing train | — |
| `DELETE` | `/api/trains/:id` | Remove a train from the fleet | — |

**Response format (success):**

```json
{
  "success": true,
  "data": {},
  "message": "optional message"
}
```

Full interactive documentation is available at `/api/docs`.

> **Note:** Authentication is planned for a future release. All endpoints are currently open in development.

---

## Project Structure

```
train-of-the-future/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── trains/          # Fleet CRUD (routes, controller, service, repository)
│   │   │   ├── telemetry/       # Sensor data ingestion (planned)
│   │   │   ├── alerts/          # Operational alerts (planned)
│   │   │   ├── analytics/       # Reports & statistics (planned)
│   │   │   └── realtime/        # WebSocket event hub (planned)
│   │   ├── shared/
│   │   │   ├── config/          # Environment configuration
│   │   │   ├── database/        # Connection, migrations, seed
│   │   │   ├── middleware/      # Error handling, rate limiting, CORS
│   │   │   └── types/           # Shared entities & DTOs
│   │   ├── app.ts               # Express application setup
│   │   └── index.ts             # Server bootstrap
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── views/               # Page-level Vue components
│   │   ├── components/          # Reusable UI components
│   │   ├── services/            # API client layer
│   │   └── composables/         # Shared Vue composition functions
│   ├── Dockerfile
│   └── package.json
├── simulator/                   # Python telemetry data generator
├── docker-compose.yml           # Local development orchestration
└── README.md
```

---

## Patterns Explained

### Repository Pattern

All database interactions are isolated in repository files (e.g. `trainRepository.ts`). Controllers and services never execute SQL directly. Queries are always parameterized to prevent injection and keep the data layer swappable.

### Observer Pattern

Used for real-time event handling: when telemetry data changes or an alert threshold is breached, registered observers (WebSocket subscribers, alert processors) are notified without tight coupling between modules.

### DTO Pattern (Data Transfer Objects)

Database rows use snake_case (`train_number`, `max_speed`). API responses use camelCase (`trainNumber`, `maxSpeed`). A dedicated mapper layer converts between the two, ensuring the internal schema never leaks into the public API contract.

---

## Roadmap

| Module | Status | Description |
|--------|--------|-------------|
| **Trains CRUD** | ✅ Done | Full fleet management REST API with SQL Server |
| **Telemetry** | 🔜 Planned | Ingest live sensor data (speed, GPS, WiFi status, passenger count) |
| **WebSocket** | 🔜 Planned | Real-time fleet updates pushed to connected clients |
| **Alerts** | 🔜 Planned | Threshold-based alerting (offline trains, speed violations, WiFi degradation) |
| **Analytics** | 🔜 Planned | Daily statistics, uptime reports, fleet performance dashboards |
| **Python Simulator** | 🔜 Planned | Generates realistic telemetry streams for development and load testing |
| **Authentication** | 🔜 Planned | JWT-based API access control with role-based permissions |

---

## License

Internal use — all rights reserved.
