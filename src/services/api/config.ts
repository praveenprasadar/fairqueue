// Centralized API Configuration
// All endpoint paths match the integration contract specifications.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Queue Endpoints
  QUEUE_METRICS: `${API_BASE_URL}/queue/metrics`,
  QUEUE_STATUS: `${API_BASE_URL}/queue/status`,

  // Inventory Endpoints
  INVENTORY: `${API_BASE_URL}/inventory`,
  INVENTORY_METRICS: `${API_BASE_URL}/inventory/metrics`,

  // Holds Endpoints
  HOLDS: `${API_BASE_URL}/holds`,
  HOLD_BY_ID: (id: string) => `${API_BASE_URL}/holds/${id}`,

  // Orders Endpoints
  ORDERS: `${API_BASE_URL}/orders`,
  ORDER_BY_ID: (id: string) => `${API_BASE_URL}/orders/${id}`,

  // Admin Specific Endpoints
  ADMIN_LOGIN: `${API_BASE_URL}/admin/login`,
  ADMIN_DASHBOARD: `${API_BASE_URL}/admin/dashboard`,
  ADMIN_METRICS: `${API_BASE_URL}/admin/metrics`,
  ADMIN_EVENTS: `${API_BASE_URL}/admin/event`,
  ADMIN_EVENT_BY_ID: (id: string) => `${API_BASE_URL}/admin/event/${id}`,
  ADMIN_ADMISSION_CONFIG: `${API_BASE_URL}/admin/admission/config`,
  ADMIN_BOT_METRICS: `${API_BASE_URL}/admin/bot-metrics`,
  ADMIN_BOT_BLOCK: `${API_BASE_URL}/admin/bot/block`,
  ADMIN_BOT_UNBLOCK: `${API_BASE_URL}/admin/bot/unblock`,
  ADMIN_CONCURRENCY: `${API_BASE_URL}/admin/concurrency`,
  ADMIN_LOAD_TEST: `${API_BASE_URL}/admin/load-test`,
  ADMIN_ALERTS: `${API_BASE_URL}/admin/alerts`,
  ADMIN_SETTINGS: `${API_BASE_URL}/admin/settings`,
};
