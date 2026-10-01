import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

// In-Memory Shared State & Metrics (simulating MongoDB / Redis live backend)
let systemState = {
  totalUsers: 50000,
  activeUsers: 11200,
  waitingUsers: 38420,
  admittedUsers: 200,
  totalInventory: 1000,
  availableInventory: 320,
  activeHolds: 80,
  confirmedOrders: 600,
  blockedRateLimitedRequests: 540,
  currentConcurrency: 50000,
  health: {
    backend: 'ONLINE',
    redis: 'ONLINE',
    mongoDB: 'ONLINE',
    queue: 'ACTIVE',
    payment: 'ONLINE',
    loadBalancer: 'ONLINE'
  }
};

let admissionConfig = {
  admissionRate: 200,
  activeSessions: 180,
  maxSessions: 200,
  queueSize: 38420,
  backendLoadPercentage: 68.4,
  requestsPerSecond: 4520
};

let eventsStore = [
  {
    eventId: 'EVT-2026-001',
    name: 'College Fest 2026 - Main Night Concert',
    description: 'Annual mega fest flagship concert featuring live performance.',
    date: '2026-10-15T18:00:00.000Z',
    status: 'ACTIVE',
    ticketTypes: [
      {
        typeId: 'TKT-VIP',
        name: 'VIP',
        price: 500,
        totalInventory: 300,
        availableInventory: 120,
        heldInventory: 20,
        soldInventory: 160
      },
      {
        typeId: 'TKT-GEN',
        name: 'GENERAL',
        price: 200,
        totalInventory: 700,
        availableInventory: 200,
        heldInventory: 60,
        soldInventory: 440
      }
    ],
    createdAt: '2026-09-01T10:00:00.000Z'
  }
];

let botLogsStore = [
  {
    id: 'LOG-1001',
    time: '10:20:15',
    sourceIdentifier: 'Session XYZ (IP: 192.168.1.45)',
    ipAddress: '192.168.1.45',
    reason: 'Too many requests (> 100 req/sec)',
    action: 'RATE LIMITED',
    status: 'ACTIVE'
  },
  {
    id: 'LOG-1002',
    time: '10:20:18',
    sourceIdentifier: 'Session ABC (IP: 10.0.4.12)',
    ipAddress: '10.0.4.12',
    reason: 'Suspicious automated script pattern',
    action: 'BLOCKED',
    status: 'ACTIVE'
  }
];

let holdsStore = [
  {
    holdId: 'H1001',
    userId: 'U1001',
    userName: 'Aarav Sharma',
    eventId: 'EVT-2026-001',
    eventName: 'College Fest 2026',
    ticketType: 'VIP',
    quantity: 2,
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
    status: 'ACTIVE'
  }
];

let ordersStore = [
  {
    orderId: 'ORD-9001',
    userId: 'U1120',
    userName: 'Ananya Gupta',
    userEmail: 'ananya@example.com',
    holdId: 'H1004',
    eventId: 'EVT-2026-001',
    eventName: 'College Fest 2026',
    ticketType: 'GENERAL',
    quantity: 2,
    amount: 400,
    paymentStatus: 'SUCCESS',
    orderStatus: 'CONFIRMED',
    idempotencyKey: 'IDEMP-KEY-9001-A1',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  }
];

// -------------------------------------------------------------
// REST API ENDPOINTS CONTRACT IMPLEMENTATION
// -------------------------------------------------------------

// Admin Auth
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    res.json({
      token: 'jwt-admin-secret-token-fairqueue-2026',
      user: {
        userId: 'ADM-001',
        name: 'Lead System Admin',
        email,
        role: 'ADMIN'
      }
    });
  } else {
    res.status(400).json({ error: 'Email and password required' });
  }
});

// Admin Dashboard Overview
app.get('/api/admin/dashboard', (req, res) => {
  res.json(systemState);
});

app.get('/api/admin/metrics', (req, res) => {
  res.json(systemState);
});

// Queue Endpoints
app.get('/api/queue/metrics', (req, res) => {
  res.json({
    totalWaiting: systemState.waitingUsers,
    currentQueuePositionRange: `1 - ${systemState.waitingUsers.toLocaleString()}`,
    currentlyAdmitted: systemState.admittedUsers,
    averageWaitTimeSeconds: 260,
    admissionRatePerBatch: admissionConfig.admissionRate,
    usersEnteringPerSecond: 450,
    usersLeavingPerSecond: admissionConfig.admissionRate,
    queueStatus: 'ACTIVE'
  });
});

app.get('/api/queue/status', (req, res) => {
  res.json({ status: 'ACTIVE', queueSize: systemState.waitingUsers });
});

// Inventory Endpoints
app.get('/api/inventory', (req, res) => {
  const inventoryItems = eventsStore.flatMap(evt =>
    evt.ticketTypes.map(tt => ({
      productId: `P-${tt.typeId}`,
      eventId: evt.eventId,
      eventName: evt.name,
      ticketType: tt.name,
      price: tt.price,
      totalStock: tt.totalInventory,
      availableStock: tt.availableInventory,
      heldStock: tt.heldInventory,
      soldStock: tt.soldInventory
    }))
  );
  res.json(inventoryItems);
});

app.get('/api/inventory/metrics', (req, res) => {
  res.json({
    total: systemState.totalInventory,
    available: systemState.availableInventory,
    held: systemState.activeHolds,
    sold: systemState.confirmedOrders
  });
});

// Event Management
app.get('/api/admin/event', (req, res) => {
  res.json(eventsStore);
});

app.post('/api/admin/event', (req, res) => {
  const newEvt = {
    eventId: `EVT-${Date.now()}`,
    name: req.body.name || 'New Event',
    description: req.body.description || '',
    date: req.body.date || new Date().toISOString(),
    status: 'DRAFT',
    ticketTypes: req.body.ticketTypes || [],
    createdAt: new Date().toISOString()
  };
  eventsStore.unshift(newEvt);
  res.status(201).json(newEvt);
});

app.patch('/api/admin/event/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const evt = eventsStore.find(e => e.eventId === id);
  if (evt) {
    evt.status = status;
    res.json({ success: true, eventId: id, status });
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

// Admission Control Config
app.get('/api/admin/admission/config', (req, res) => {
  res.json(admissionConfig);
});

app.post('/api/admin/admission/config', (req, res) => {
  const { admissionRate } = req.body;
  if (admissionRate) {
    admissionConfig.admissionRate = Number(admissionRate);
    systemState.admittedUsers = Number(admissionRate);
    io.emit('metrics:update', systemState);
    res.json(admissionConfig);
  } else {
    res.status(400).json({ error: 'Admission rate required' });
  }
});

// Bot Shield Metrics & Actions
app.get('/api/admin/bot-metrics', (req, res) => {
  res.json({
    metrics: {
      normalRequests: 45210,
      rateLimitedRequests: 420,
      verificationRequests: 85,
      blockedRequests: 35
    },
    logs: botLogsStore
  });
});

app.post('/api/admin/bot/block', (req, res) => {
  const { ip } = req.body;
  botLogsStore.unshift({
    id: `LOG-${Date.now()}`,
    time: new Date().toLocaleTimeString(),
    sourceIdentifier: `IP: ${ip}`,
    ipAddress: ip,
    reason: 'Manual Admin Firewall Block',
    action: 'BLOCKED',
    status: 'ACTIVE'
  });
  res.json({ success: true, message: `IP ${ip} firewalled` });
});

app.post('/api/admin/bot/unblock', (req, res) => {
  const { ip } = req.body;
  botLogsStore = botLogsStore.filter(l => l.ipAddress !== ip);
  res.json({ success: true, message: `IP ${ip} unblocked` });
});

// Active Holds
app.get('/api/holds', (req, res) => {
  res.json(holdsStore);
});

app.get('/api/holds/:id', (req, res) => {
  const hold = holdsStore.find(h => h.holdId === req.params.id);
  hold ? res.json(hold) : res.status(404).json({ error: 'Hold not found' });
});

// Orders
app.get('/api/orders', (req, res) => {
  res.json(ordersStore);
});

app.get('/api/orders/:id', (req, res) => {
  const order = ordersStore.find(o => o.orderId === req.params.id);
  order ? res.json(order) : res.status(404).json({ error: 'Order not found' });
});

// Concurrency & Zero Overselling
app.get('/api/admin/concurrency', (req, res) => {
  res.json({
    concurrency: {
      concurrentRequests: 50000,
      activeUsers: 50000,
      reservationAttempts: 50000,
      successfulAllocations: 600,
      failedReservations: 49400,
      availableInventory: 320,
      activeHolds: 80,
      confirmedOrders: 600,
      oversoldCount: 0,
      duplicateOrdersCount: 0,
      zeroOversellingSafe: true
    },
    checkout: {
      totalCheckoutRequests: 50000,
      retryRequests: 120,
      duplicateRequests: 120,
      uniqueOrders: 600,
      duplicateOrdersCreated: 0
    }
  });
});

// Load Test Results (k6)
app.get('/api/admin/load-test', (req, res) => {
  res.json({
    virtualUsers: 50000,
    totalRequests: 185000,
    requestsPerSecond: 12450,
    averageResponseTimeMs: 42,
    p95LatencyMs: 88,
    errorRatePercentage: 0.02,
    successfulReservations: 1000,
    overselling: 0,
    duplicateOrders: 0,
    testDurationSeconds: 60,
    chartData: [
      { timestamp: '0s', requestRate: 5000, responseTimeMs: 22, errorRate: 0, activeVUs: 10000 },
      { timestamp: '10s', requestRate: 25000, responseTimeMs: 35, errorRate: 0, activeVUs: 25000 },
      { timestamp: '20s', requestRate: 50000, responseTimeMs: 48, errorRate: 0.01, activeVUs: 50000 },
      { timestamp: '30s', requestRate: 48000, responseTimeMs: 44, errorRate: 0.02, activeVUs: 50000 },
      { timestamp: '40s', requestRate: 35000, responseTimeMs: 38, errorRate: 0.01, activeVUs: 40000 },
      { timestamp: '50s', requestRate: 15000, responseTimeMs: 28, errorRate: 0, activeVUs: 20000 },
      { timestamp: '60s', requestRate: 2000, responseTimeMs: 18, errorRate: 0, activeVUs: 5000 },
    ]
  });
});

// Alerts & Settings
app.get('/api/admin/alerts', (req, res) => {
  res.json([
    {
      id: 'ALT-101',
      timestamp: '10:18:22',
      severity: 'WARNING',
      message: 'Queue size exceeded threshold of 35,000 waiting users.',
      status: 'ACTIVE',
      source: 'Redis Waiting Queue'
    },
    {
      id: 'ALT-102',
      timestamp: '10:19:05',
      severity: 'WARNING',
      message: 'VIP Ticket Inventory reached 80% sold status.',
      status: 'ACTIVE',
      source: 'Inventory Service'
    },
    {
      id: 'ALT-104',
      timestamp: '10:10:45',
      severity: 'CRITICAL',
      message: 'Spike in rate-limited bot requests detected from IP subnet 192.168.1.x.',
      status: 'ACTIVE',
      source: 'Rate Limiter'
    }
  ]);
});

app.get('/api/admin/settings', (req, res) => {
  res.json({
    adminProfile: {
      name: 'Lead System Admin',
      email: 'admin@fairqueue.internal',
      role: 'ADMIN',
      lastLogin: new Date().toISOString()
    },
    systemConfig: {
      maintenanceMode: false,
      debugLogging: true,
      maxConcurrentSessions: 50000,
      holdDurationMinutes: 10
    },
    admissionConfig: {
      defaultBatchSize: 200,
      batchIntervalSeconds: 2,
      autoBackpressureEnabled: true
    },
    queueConfig: {
      maxQueueCapacity: 100000,
      tokenExpirySeconds: 300
    },
    notificationSettings: {
      emailAlerts: true,
      slackWebhook: true,
      criticalAlertSMS: true
    }
  });
});

app.post('/api/admin/settings', (req, res) => {
  res.json({ success: true, ...req.body });
});

// -------------------------------------------------------------
// SOCKET.IO REAL-TIME BROADCAST TIMER
// -------------------------------------------------------------
io.on('connection', (socket) => {
  console.log(`⚡ Admin Connected to Sockets: ${socket.id}`);

  // Emit current metrics immediately on connection
  socket.emit('metrics:update', systemState);
  socket.emit('queue:update', { totalWaiting: systemState.waitingUsers });

  socket.on('disconnect', () => {
    console.log(`🔌 Admin Disconnected: ${socket.id}`);
  });
});

// Background heartbeat emitting slight fluctuation updates to demonstrate real-time WebSocket dashboarding
setInterval(() => {
  const deltaQueue = Math.floor(Math.random() * 20) - 10;
  systemState.waitingUsers = Math.max(1000, systemState.waitingUsers + deltaQueue);
  
  io.emit('metrics:update', systemState);
  io.emit('queue:update', {
    totalWaiting: systemState.waitingUsers,
    usersEnteringPerSecond: 450 + Math.floor(Math.random() * 30),
    usersLeavingPerSecond: admissionConfig.admissionRate
  });
}, 3000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 FairQueue Express API Server running on port ${PORT}`);
  console.log(`⚡ Socket.IO Server active on http://localhost:${PORT}`);
});
