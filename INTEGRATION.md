# FairQueue Admin Dashboard - Integration & Merge Documentation

This document describes how to seamlessly integrate and merge the **Admin Dashboard** (`/admin/*`) with the separately developed **User Dashboard** (`/user/*`).

---

## 1. System Scope & Route Architecture

The Admin Dashboard is completely isolated under `/admin/*` routes to guarantee zero conflict with the User Dashboard:

```
FairQueue Application Routes
├── /admin/login                 --> Admin Authentication Gateway (Role: ADMIN)
└── /admin/dashboard             --> Admin Layout & Navigation Shell
    ├── /admin/dashboard         --> Overview & Health Monitor
    ├── /admin/events            --> Event Creation & Status Transition
    ├── /admin/inventory         --> Inventory Audit (Available + Held + Sold = Total)
    ├── /admin/waiting-room      --> Virtual Redis Queue Metrics
    ├── /admin/admission-control --> Backpressure Tuning (users/batch)
    ├── /admin/bot-monitoring    --> DDoS / Rate-Limiter Log & IP Firewall
    ├── /admin/active-holds      --> Time-Limited Ticket Reservation Audit
    ├── /admin/orders            --> Idempotent Order & Payment Registry
    ├── /admin/concurrency       --> 50k VU Concurrency & Zero Overselling Audit
    ├── /admin/load-testing      --> k6 Load Benchmark Reports
    ├── /admin/alerts            --> System Incidents & Severity Filter
    └── /admin/settings          --> System Configuration & Limits
```

---

## 2. API Contract Endpoints Specification

All Admin Dashboard network calls are isolated inside `src/services/api/adminApi.ts` and configured via `src/services/api/config.ts`. 

To connect to your real shared backend server, update `VITE_API_BASE_URL` in `.env` or `src/services/api/config.ts`:

### Shared Queue Endpoints
- `GET /api/queue/metrics`: Returns `{ totalWaiting, currentQueuePositionRange, currentlyAdmitted, averageWaitTimeSeconds, admissionRatePerBatch, usersEnteringPerSecond, usersLeavingPerSecond, queueStatus }`
- `GET /api/queue/status`: Returns `{ status, queueSize }`

### Shared Inventory Endpoints
- `GET /api/inventory`: Returns array of `InventoryItem` (`{ productId, eventId, eventName, ticketType, price, totalStock, availableStock, heldStock, soldStock }`)
- `GET /api/inventory/metrics`: Returns overall stock summary

### Shared Ticket Holds Endpoints
- `GET /api/holds`: Returns array of active `Hold` entities
- `GET /api/holds/:id`: Returns single hold details

### Shared Orders Endpoints
- `GET /api/orders`: Returns array of `Order` entities
- `GET /api/orders/:id`: Returns single order details with `idempotencyKey`

### Admin Management Endpoints
- `POST /api/admin/login`: Admin auth credentials check
- `GET /api/admin/dashboard`: Live system overview & component health
- `POST /api/admin/event`: Create new ticketed event & tier inventory
- `PATCH /api/admin/event/:id`: Update event status (`ACTIVE`, `PAUSED`, `STOPPED`)
- `POST /api/admin/admission/config`: Update queue admission batch rate
- `GET /api/admin/bot-metrics`: Retrieve rate limiter & bot firewall logs
- `POST /api/admin/bot/block`: Firewalls specified IP address
- `POST /api/admin/bot/unblock`: Unblocks specified IP address
- `GET /api/admin/concurrency`: Returns 50k VU concurrency & zero-overselling validation
- `GET /api/admin/load-test`: Returns k6 benchmark performance reports

---

## 3. Real-Time Socket.IO Subscriptions

The Admin Dashboard subscribes to the following WebSocket events emitted by `server.js`:

- `metrics:update`: Pushes updated system metrics (`totalUsers`, `activeUsers`, `waitingUsers`, `health`).
- `queue:update`: Pushes live queue depth and flow rate (`usersEnteringPerSecond`, `usersLeavingPerSecond`).
- `concurrency:update`: Pushes live concurrency and zero overselling stats.

---

## 4. How to Merge with User Dashboard

When merging the User Dashboard repository:

1. **Copy the `/admin` components and routes**: Place `src/pages/admin/` and `src/components/layout/` into the merged app.
2. **Mount the Route Group**: Add `<Route path="/admin/*" element={<AdminLayout />} />` to the main React Router setup.
3. **Shared Backend**: Connect both User Dashboard and Admin Dashboard to the same Express API server and Socket.IO connection.
4. **No Code Rewrites Required**: Because all API calls are isolated in `src/services/api/adminApi.ts`, simply point `API_BASE_URL` to your production backend.

---

## 5. Verification Commands

Run the full stack locally:
```bash
# Install dependencies
npm install

# Start Express Server + Socket.IO + Vite Dev Server concurrently
npm start
```
- Vite Admin UI: `http://localhost:5173/admin/login`
- Express API Server: `http://localhost:5000/api/admin/dashboard`
