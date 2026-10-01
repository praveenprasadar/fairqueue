export type UserRole = 'ADMIN' | 'USER';

export interface User {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
}

export type EventStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'STOPPED';

export interface TicketType {
  typeId: string;
  name: string;
  price: number;
  totalInventory: number;
  availableInventory: number;
  heldInventory: number;
  soldInventory: number;
}

export interface Event {
  eventId: string;
  name: string;
  description?: string;
  date: string;
  status: EventStatus;
  ticketTypes: TicketType[];
  createdAt: string;
}

export interface InventoryItem {
  productId: string;
  eventId: string;
  eventName: string;
  ticketType: string;
  price: number;
  totalStock: number;
  availableStock: number;
  heldStock: number;
  soldStock: number;
}

export interface QueueMetrics {
  totalWaiting: number;
  currentQueuePositionRange: string;
  currentlyAdmitted: number;
  averageWaitTimeSeconds: number;
  admissionRatePerBatch: number;
  usersEnteringPerSecond: number;
  usersLeavingPerSecond: number;
  queueStatus: 'ACTIVE' | 'PAUSED' | 'DRAINING';
}

export interface AdmissionConfig {
  admissionRate: number; // users per batch
  activeSessions: number;
  maxSessions: number;
  queueSize: number;
  backendLoadPercentage: number;
  requestsPerSecond: number;
}

export interface BotMetrics {
  normalRequests: number;
  rateLimitedRequests: number;
  verificationRequests: number;
  blockedRequests: number;
}

export interface BotRequestLog {
  id: string;
  time: string;
  sourceIdentifier: string;
  ipAddress: string;
  reason: string;
  action: 'RATE LIMITED' | 'BLOCKED' | 'VERIFICATION REQUIRED' | 'ALLOWED';
  status: 'ACTIVE' | 'RESOLVED';
}

export type HoldStatus = 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'CONFIRMED' | 'RELEASED';

export interface Hold {
  holdId: string;
  userId: string;
  userName?: string;
  eventId: string;
  eventName: string;
  ticketType: string;
  quantity: number;
  createdAt: string;
  expiresAt: string;
  status: HoldStatus;
}

export type OrderStatus = 'PENDING' | 'HELD' | 'CONFIRMED' | 'FAILED' | 'EXPIRED' | 'CANCELLED';

export interface Order {
  orderId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  holdId: string;
  eventId: string;
  eventName: string;
  ticketType: string;
  quantity: number;
  amount: number;
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
  orderStatus: OrderStatus;
  idempotencyKey: string;
  createdAt: string;
}

export interface ConcurrencyMetrics {
  concurrentRequests: number;
  activeUsers: number;
  reservationAttempts: number;
  successfulAllocations: number;
  failedReservations: number;
  availableInventory: number;
  activeHolds: number;
  confirmedOrders: number;
  oversoldCount: number;
  duplicateOrdersCount: number;
  zeroOversellingSafe: boolean;
}

export interface CheckoutReliability {
  totalCheckoutRequests: number;
  retryRequests: number;
  duplicateRequests: number;
  uniqueOrders: number;
  duplicateOrdersCreated: number;
}

export interface LoadTestResults {
  virtualUsers: number;
  totalRequests: number;
  requestsPerSecond: number;
  averageResponseTimeMs: number;
  p95LatencyMs: number;
  errorRatePercentage: number;
  successfulReservations: number;
  overselling: number;
  duplicateOrders: number;
  testDurationSeconds: number;
  chartData: {
    timestamp: string;
    requestRate: number;
    responseTimeMs: number;
    errorRate: number;
    activeVUs: number;
  }[];
}

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface SystemAlert {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  message: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  source?: string;
}

export interface AdminSettings {
  adminProfile: {
    name: string;
    email: string;
    role: string;
    lastLogin: string;
  };
  systemConfig: {
    maintenanceMode: boolean;
    debugLogging: boolean;
    maxConcurrentSessions: number;
    holdDurationMinutes: number;
  };
  admissionConfig: {
    defaultBatchSize: number;
    batchIntervalSeconds: number;
    autoBackpressureEnabled: boolean;
  };
  queueConfig: {
    maxQueueCapacity: number;
    tokenExpirySeconds: number;
  };
  notificationSettings: {
    emailAlerts: boolean;
    slackWebhook: boolean;
    criticalAlertSMS: boolean;
  };
}

export interface ComponentStatus {
  backend: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  redis: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  mongoDB: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  queue: 'ACTIVE' | 'PAUSED' | 'DRAINING' | 'OFFLINE';
  payment: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  loadBalancer: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
}

export interface DashboardOverview {
  totalUsers: number;
  activeUsers: number;
  waitingUsers: number;
  admittedUsers: number;
  totalInventory: number;
  availableInventory: number;
  activeHolds: number;
  confirmedOrders: number;
  blockedRateLimitedRequests: number;
  currentConcurrency: number;
  health: ComponentStatus;
}
