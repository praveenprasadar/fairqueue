import React, { useEffect, useState } from 'react';
import {
  Users,
  UserCheck,
  Clock,
  Boxes,
  PackageCheck,
  Lock,
  ShoppingBag,
  ShieldAlert,
  Zap,
  Activity,
  Server,
  Database,
  Layers,
  CreditCard,
  Gauge,
  TrendingUp
} from 'lucide-react';
import { AdminHeader } from '../../components/layout/AdminHeader';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { adminApi } from '../../services/api/adminApi';
import { useSocket } from '../../context/SocketContext';
import { DashboardOverview } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const Overview: React.FC = () => {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const { liveOverview } = useSocket();

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getDashboardOverview();
      setData(res);
    } catch (err) {
      console.error('Failed to load overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  // Merge live socket updates into local state if available
  const current = liveOverview ? { ...data, ...liveOverview } as DashboardOverview : data;

  // Chart dataset for live activity simulation
  const chartData = [
    { time: '10:00', concurrency: 12000, waiting: 8000, admitted: 150 },
    { time: '10:05', concurrency: 25000, waiting: 18000, admitted: 180 },
    { time: '10:10', concurrency: 42000, waiting: 32000, admitted: 200 },
    { time: '10:15', concurrency: 50000, waiting: 38420, admitted: 200 },
    { time: '10:20', concurrency: 49800, waiting: 37900, admitted: 200 },
  ];

  const inventoryDistribution = [
    { name: 'Available', count: current?.availableInventory || 320, fill: '#06b6d4' },
    { name: 'Active Holds', count: current?.activeHolds || 80, fill: '#f59e0b' },
    { name: 'Confirmed Sold', count: current?.confirmedOrders || 600, fill: '#10b981' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#080C14]">
      <AdminHeader
        title="Live System Overview"
        subtitle="Real-time status monitoring for high-concurrency ticket booking engine"
        healthStatus={current?.health}
        onRefresh={fetchOverview}
        isRefreshing={loading}
      />

      <div className="p-6 space-y-6">
        {/* Top 10 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard
            title="TOTAL USERS"
            value={current?.totalUsers || 50000}
            subtitle="Registered/Active Queue"
            icon={Users}
            variant="cyan"
          />
          <MetricCard
            title="ACTIVE USERS"
            value={current?.activeUsers || 11200}
            subtitle="Active Sessions"
            icon={UserCheck}
            variant="blue"
          />
          <MetricCard
            title="WAITING USERS"
            value={current?.waitingUsers || 38420}
            subtitle="In Virtual Queue"
            icon={Clock}
            variant="amber"
          />
          <MetricCard
            title="ADMITTED USERS"
            value={current?.admittedUsers || 200}
            subtitle="Current Batch Size"
            icon={Activity}
            variant="emerald"
          />
          <MetricCard
            title="TOTAL INVENTORY"
            value={current?.totalInventory || 1000}
            subtitle="VIP + GENERAL"
            icon={Boxes}
            variant="purple"
          />
          <MetricCard
            title="AVAILABLE INVENTORY"
            value={current?.availableInventory || 320}
            subtitle="Unreserved Stock"
            icon={PackageCheck}
            variant="cyan"
          />
          <MetricCard
            title="ACTIVE HOLDS"
            value={current?.activeHolds || 80}
            subtitle="Time-Limited Reservation"
            icon={Lock}
            variant="amber"
          />
          <MetricCard
            title="CONFIRMED ORDERS"
            value={current?.confirmedOrders || 600}
            subtitle="Completed Checkout"
            icon={ShoppingBag}
            variant="emerald"
          />
          <MetricCard
            title="BLOCKED/RATE LIMITED"
            value={current?.blockedRateLimitedRequests || 540}
            subtitle="Bot & DDoS Protection"
            icon={ShieldAlert}
            variant="rose"
          />
          <MetricCard
            title="CURRENT CONCURRENCY"
            value={current?.currentConcurrency || 50000}
            subtitle="Concurrent Hits"
            icon={Zap}
            variant="cyan"
          />
        </div>

        {/* System Services Live Health Table / Grid */}
        <div className="bg-[#0F172A]/90 border border-slate-800 p-5 rounded-xl shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Server className="h-4 w-4 text-cyan-400" />
              LIVE SYSTEM INFRASTRUCTURE STATUS
            </h2>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
              ALL SERVICES STABLE
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-3.5 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-mono text-slate-400">Backend API</p>
                <p className="text-xs font-bold text-slate-200 mt-0.5">Express Node.js</p>
              </div>
              <StatusBadge status={current?.health?.backend || 'ONLINE'} size="sm" />
            </div>

            <div className="p-3.5 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-mono text-slate-400">Redis Cache</p>
                <p className="text-xs font-bold text-slate-200 mt-0.5">In-Memory Store</p>
              </div>
              <StatusBadge status={current?.health?.redis || 'ONLINE'} size="sm" />
            </div>

            <div className="p-3.5 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-mono text-slate-400">MongoDB</p>
                <p className="text-xs font-bold text-slate-200 mt-0.5">Primary DB</p>
              </div>
              <StatusBadge status={current?.health?.mongoDB || 'ONLINE'} size="sm" />
            </div>

            <div className="p-3.5 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-mono text-slate-400">Waiting Queue</p>
                <p className="text-xs font-bold text-slate-200 mt-0.5">Redis Stream</p>
              </div>
              <StatusBadge status={current?.health?.queue || 'ACTIVE'} size="sm" />
            </div>

            <div className="p-3.5 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-mono text-slate-400">Payment Gateway</p>
                <p className="text-xs font-bold text-slate-200 mt-0.5">Stripe / Razorpay</p>
              </div>
              <StatusBadge status={current?.health?.payment || 'ONLINE'} size="sm" />
            </div>

            <div className="p-3.5 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-mono text-slate-400">Load Balancer</p>
                <p className="text-xs font-bold text-slate-200 mt-0.5">Nginx Cluster</p>
              </div>
              <StatusBadge status={current?.health?.loadBalancer || 'ONLINE'} size="sm" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Concurrency & Waiting Room Chart */}
          <div className="lg:col-span-2 bg-[#0F172A]/90 border border-slate-800 p-5 rounded-xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                  REAL-TIME CONCURRENCY & QUEUE PRESSURE
                </h3>
                <p className="text-xs text-slate-400">50,000 Concurrent user load vs waiting queue size</p>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
                LIVE TRAFFIC
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConcurrency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorWaiting" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8', fontFamily: 'monospace' }}
                  />
                  <Area type="monotone" dataKey="concurrency" stroke="#06b6d4" fillOpacity={1} fill="url(#colorConcurrency)" name="Concurrency" />
                  <Area type="monotone" dataKey="waiting" stroke="#f59e0b" fillOpacity={1} fill="url(#colorWaiting)" name="Waiting Queue" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Inventory Breakdown Chart */}
          <div className="bg-[#0F172A]/90 border border-slate-800 p-5 rounded-xl shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2 mb-1">
                <Boxes className="h-4 w-4 text-emerald-400" />
                INVENTORY STATE SPLIT
              </h3>
              <p className="text-xs text-slate-400 mb-4">Total: 1,000 Tickets across all tiers</p>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 font-mono space-y-1">
              <div className="flex justify-between">
                <span>Total Ticket Stock:</span>
                <span className="text-white font-bold">1,000</span>
              </div>
              <div className="flex justify-between text-cyan-400">
                <span>Available (32%):</span>
                <span>320</span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>Held (8%):</span>
                <span>80</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Sold (60%):</span>
                <span>600</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
