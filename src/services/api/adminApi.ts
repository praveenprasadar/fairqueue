import { API_ENDPOINTS } from './config';
import {
  DashboardOverview,
  Event,
  InventoryItem,
  QueueMetrics,
  AdmissionConfig,
  BotMetrics,
  BotRequestLog,
  Hold,
  Order,
  ConcurrencyMetrics,
  CheckoutReliability,
  LoadTestResults,
  SystemAlert,
  AdminSettings,
  User
} from '../../types';

// Generic fetch wrapper with Authorization token header
async function apiFetch<T>(url: string, options: RequestInit = {}, fallbackData?: T): Promise<T> {
  const token = localStorage.getItem('fairqueue_admin_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`[API Call to ${url} failed. Using dev fallback if available]`, error);
    if (fallbackData !== undefined) {
      return fallbackData;
    }
    throw error;
  }
}

// Dev Fallback Datasets (used when backend API is offline during initial UI dev)
export const MOCK_OVERVIEW: DashboardOverview = {
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

export const MOCK_EVENTS: Event[] = [
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
  },
  {
    eventId: 'EVT-2026-002',
    name: 'Hackathon 2026 Grand Finale',
    description: 'National Level Hackathon award ceremony and developer conference.',
    date: '2026-11-20T09:00:00.000Z',
    status: 'DRAFT',
    ticketTypes: [
      {
        typeId: 'TKT-HACK-PASS',
        name: 'PASS',
        price: 0,
        totalInventory: 500,
        availableInventory: 500,
        heldInventory: 0,
        soldInventory: 0
      }
    ],
    createdAt: '2026-09-10T14:00:00.000Z'
  }
];

export const MOCK_INVENTORY: InventoryItem[] = [
  {
    productId: 'P-VIP-01',
    eventId: 'EVT-2026-001',
    eventName: 'College Fest 2026',
    ticketType: 'VIP',
    price: 500,
    totalStock: 300,
    availableStock: 120,
    heldStock: 20,
    soldStock: 160
  },
  {
    productId: 'P-GEN-01',
    eventId: 'EVT-2026-001',
    eventName: 'College Fest 2026',
    ticketType: 'GENERAL',
    price: 200,
    totalStock: 700,
    availableStock: 200,
    heldStock: 60,
    soldStock: 440
  }
];

export const MOCK_QUEUE: QueueMetrics = {
  totalWaiting: 38420,
  currentQueuePositionRange: '1 - 38,420',
  currentlyAdmitted: 200,
  averageWaitTimeSeconds: 260, // 4m 20s
  admissionRatePerBatch: 200,
  usersEnteringPerSecond: 450,
  usersLeavingPerSecond: 200,
  queueStatus: 'ACTIVE'
};

export const MOCK_ADMISSION: AdmissionConfig = {
  admissionRate: 200,
  activeSessions: 180,
  maxSessions: 200,
  queueSize: 38420,
  backendLoadPercentage: 68.4,
  requestsPerSecond: 4520
};

export const MOCK_BOT_METRICS: BotMetrics = {
  normalRequests: 45210,
  rateLimitedRequests: 420,
  verificationRequests: 85,
  blockedRequests: 35
};

export const MOCK_BOT_LOGS: BotRequestLog[] = [
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
  },
  {
    id: 'LOG-1003',
    time: '10:20:22',
    sourceIdentifier: 'Session DEF (IP: 172.16.0.88)',
    ipAddress: '172.16.0.88',
    reason: 'hCaptcha token validation required',
    action: 'VERIFICATION REQUIRED',
    status: 'ACTIVE'
  },
  {
    id: 'LOG-1004',
    time: '10:20:25',
    sourceIdentifier: 'Session GHI (IP: 192.168.1.99)',
    ipAddress: '192.168.1.99',
    reason: 'Rapid booking attempts',
    action: 'RATE LIMITED',
    status: 'RESOLVED'
  }
];

export const MOCK_HOLDS: Hold[] = [
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
  },
  {
    holdId: 'H1002',
    userId: 'U1042',
    userName: 'Priya Patel',
    eventId: 'EVT-2026-001',
    eventName: 'College Fest 2026',
    ticketType: 'GENERAL',
    quantity: 4,
    createdAt: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 1 * 60 * 1000).toISOString(),
    status: 'EXPIRING'
  },
  {
    holdId: 'H1003',
    userId: 'U1089',
    userName: 'Rohan Mehta',
    eventId: 'EVT-2026-001',
    eventName: 'College Fest 2026',
    ticketType: 'VIP',
    quantity: 1,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: 'EXPIRED'
  },
  {
    holdId: 'H1004',
    userId: 'U1120',
    userName: 'Ananya Gupta',
    eventId: 'EVT-2026-001',
    eventName: 'College Fest 2026',
    ticketType: 'GENERAL',
    quantity: 2,
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    status: 'CONFIRMED'
  }
];

export const MOCK_ORDERS: Order[] = [
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
  },
  {
    orderId: 'ORD-9002',
    userId: 'U1015',
    userName: 'Vikram Singh',
    userEmail: 'vikram@example.com',
    holdId: 'H0998',
    eventId: 'EVT-2026-001',
    eventName: 'College Fest 2026',
    ticketType: 'VIP',
    quantity: 2,
    amount: 1000,
    paymentStatus: 'SUCCESS',
    orderStatus: 'CONFIRMED',
    idempotencyKey: 'IDEMP-KEY-9002-B2',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    orderId: 'ORD-9003',
    userId: 'U1050',
    userName: 'Kavya Reddy',
    userEmail: 'kavya@example.com',
    holdId: 'H0995',
    eventId: 'EVT-2026-001',
    eventName: 'College Fest 2026',
    ticketType: 'GENERAL',
    quantity: 1,
    amount: 200,
    paymentStatus: 'FAILED',
    orderStatus: 'FAILED',
    idempotencyKey: 'IDEMP-KEY-9003-C3',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  }
];

export const MOCK_CONCURRENCY: ConcurrencyMetrics = {
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
};

export const MOCK_CHECKOUT: CheckoutReliability = {
  totalCheckoutRequests: 50000,
  retryRequests: 120,
  duplicateRequests: 120,
  uniqueOrders: 600,
  duplicateOrdersCreated: 0
};

export const MOCK_LOAD_TEST: LoadTestResults = {
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
};

export const MOCK_ALERTS: SystemAlert[] = [
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
    id: 'ALT-103',
    timestamp: '10:15:00',
    severity: 'INFO',
    message: 'Ticket Sale officially started for College Fest 2026.',
    status: 'RESOLVED',
    source: 'Event Controller'
  },
  {
    id: 'ALT-104',
    timestamp: '10:10:45',
    severity: 'CRITICAL',
    message: 'Spike in blocked rate-limited bot requests detected from IP subnet 192.168.1.x.',
    status: 'ACTIVE',
    source: 'Rate Limiter / Bot Shield'
  }
];

export const MOCK_SETTINGS: AdminSettings = {
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
};

// API Services Export Object
export const adminApi = {
  // Login
  async login(email: string, pass: string): Promise<{ token: string; user: User }> {
    return apiFetch<{ token: string; user: User }>(
      API_ENDPOINTS.ADMIN_LOGIN,
      {
        method: 'POST',
        body: JSON.stringify({ email, password: pass })
      },
      {
        token: 'dev-jwt-admin-token-fairqueue-2026',
        user: {
          userId: 'ADM-001',
          name: 'Lead System Admin',
          email,
          role: 'ADMIN'
        }
      }
    );
  },

  // Overview
  async getDashboardOverview(): Promise<DashboardOverview> {
    return apiFetch<DashboardOverview>(API_ENDPOINTS.ADMIN_DASHBOARD, {}, MOCK_OVERVIEW);
  },

  // Events
  async getEvents(): Promise<Event[]> {
    return apiFetch<Event[]>(API_ENDPOINTS.ADMIN_EVENTS, {}, MOCK_EVENTS);
  },

  async createEvent(eventData: Partial<Event>): Promise<Event> {
    return apiFetch<Event>(
      API_ENDPOINTS.ADMIN_EVENTS,
      { method: 'POST', body: JSON.stringify(eventData) },
      {
        eventId: `EVT-${Date.now()}`,
        name: eventData.name || 'New Event',
        description: eventData.description || '',
        date: eventData.date || new Date().toISOString(),
        status: 'DRAFT',
        ticketTypes: eventData.ticketTypes || [],
        createdAt: new Date().toISOString()
      }
    );
  },

  async updateEventStatus(eventId: string, status: Event['status']): Promise<{ success: boolean; eventId: string; status: Event['status'] }> {
    return apiFetch(
      API_ENDPOINTS.ADMIN_EVENT_BY_ID(eventId),
      { method: 'PATCH', body: JSON.stringify({ status }) },
      { success: true, eventId, status }
    );
  },

  // Inventory
  async getInventory(): Promise<InventoryItem[]> {
    return apiFetch<InventoryItem[]>(API_ENDPOINTS.INVENTORY, {}, MOCK_INVENTORY);
  },

  // Queue & Waiting Room
  async getQueueMetrics(): Promise<QueueMetrics> {
    return apiFetch<QueueMetrics>(API_ENDPOINTS.QUEUE_METRICS, {}, MOCK_QUEUE);
  },

  // Admission Control
  async getAdmissionConfig(): Promise<AdmissionConfig> {
    return apiFetch<AdmissionConfig>(API_ENDPOINTS.ADMIN_ADMISSION_CONFIG, {}, MOCK_ADMISSION);
  },

  async updateAdmissionRate(rate: number): Promise<AdmissionConfig> {
    return apiFetch<AdmissionConfig>(
      API_ENDPOINTS.ADMIN_ADMISSION_CONFIG,
      { method: 'POST', body: JSON.stringify({ admissionRate: rate }) },
      { ...MOCK_ADMISSION, admissionRate: rate }
    );
  },

  // Bot Monitoring
  async getBotMetrics(): Promise<{ metrics: BotMetrics; logs: BotRequestLog[] }> {
    return apiFetch(
      API_ENDPOINTS.ADMIN_BOT_METRICS,
      {},
      { metrics: MOCK_BOT_METRICS, logs: MOCK_BOT_LOGS }
    );
  },

  async blockIp(ip: string): Promise<{ success: boolean; message: string }> {
    return apiFetch(
      API_ENDPOINTS.ADMIN_BOT_BLOCK,
      { method: 'POST', body: JSON.stringify({ ip }) },
      { success: true, message: `IP ${ip} blocked successfully.` }
    );
  },

  async unblockIp(ip: string): Promise<{ success: boolean; message: string }> {
    return apiFetch(
      API_ENDPOINTS.ADMIN_BOT_UNBLOCK,
      { method: 'POST', body: JSON.stringify({ ip }) },
      { success: true, message: `IP ${ip} unblocked successfully.` }
    );
  },

  // Active Holds
  async getActiveHolds(): Promise<Hold[]> {
    return apiFetch<Hold[]>(API_ENDPOINTS.HOLDS, {}, MOCK_HOLDS);
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    return apiFetch<Order[]>(API_ENDPOINTS.ORDERS, {}, MOCK_ORDERS);
  },

  // Concurrency & Zero Overselling
  async getConcurrencyMetrics(): Promise<{ concurrency: ConcurrencyMetrics; checkout: CheckoutReliability }> {
    return apiFetch(
      API_ENDPOINTS.ADMIN_CONCURRENCY,
      {},
      { concurrency: MOCK_CONCURRENCY, checkout: MOCK_CHECKOUT }
    );
  },

  // Load Testing Results
  async getLoadTestResults(): Promise<LoadTestResults> {
    return apiFetch<LoadTestResults>(API_ENDPOINTS.ADMIN_LOAD_TEST, {}, MOCK_LOAD_TEST);
  },

  // Alerts
  async getAlerts(): Promise<SystemAlert[]> {
    return apiFetch<SystemAlert[]>(API_ENDPOINTS.ADMIN_ALERTS, {}, MOCK_ALERTS);
  },

  // Settings
  async getSettings(): Promise<AdminSettings> {
    return apiFetch<AdminSettings>(API_ENDPOINTS.ADMIN_SETTINGS, {}, MOCK_SETTINGS);
  },

  async updateSettings(newSettings: Partial<AdminSettings>): Promise<AdminSettings> {
    return apiFetch<AdminSettings>(
      API_ENDPOINTS.ADMIN_SETTINGS,
      { method: 'POST', body: JSON.stringify(newSettings) },
      { ...MOCK_SETTINGS, ...newSettings }
    );
  }
};
