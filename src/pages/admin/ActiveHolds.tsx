import React, { useEffect, useState } from 'react';
import { Clock, Ticket, AlertCircle, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AdminHeader } from '../../components/layout/AdminHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { adminApi } from '../../services/api/adminApi';
import { Hold } from '../../types';

export const ActiveHolds: React.FC = () => {
  const [holds, setHolds] = useState<Hold[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState<number>(Date.now());

  const fetchHolds = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getActiveHolds();
      setHolds(data);
    } catch (err) {
      console.error('Failed to load active holds:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolds();

    // Visual countdown ticker (forces re-render of remaining time calculations)
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const calculateRemainingSeconds = (expiresAtStr: string) => {
    const diff = Math.floor((new Date(expiresAtStr).getTime() - now) / 1000);
    return diff > 0 ? diff : 0;
  };

  const formatCountdown = (seconds: number) => {
    if (seconds <= 0) return '00:00 (EXPIRED)';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#080C14]">
      <AdminHeader
        title="Active Ticket Holds Audit"
        subtitle="Monitors time-limited Redis inventory holds, TTL countdowns & backend expiration status"
        onRefresh={fetchHolds}
        isRefreshing={loading}
      />

      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono">
          <div className="p-4 bg-[#0F172A]/90 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400">Total Tracked Holds</p>
            <p className="text-2xl font-extrabold text-white mt-1">{holds.length}</p>
          </div>

          <div className="p-4 bg-[#0F172A]/90 rounded-xl border border-amber-500/20">
            <p className="text-xs text-amber-400">Active Pending Checkout</p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">
              {holds.filter(h => h.status === 'ACTIVE' || h.status === 'EXPIRING').length}
            </p>
          </div>

          <div className="p-4 bg-[#0F172A]/90 rounded-xl border border-emerald-500/20">
            <p className="text-xs text-emerald-400">Converted / Confirmed</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">
              {holds.filter(h => h.status === 'CONFIRMED').length}
            </p>
          </div>

          <div className="p-4 bg-[#0F172A]/90 rounded-xl border border-rose-500/20">
            <p className="text-xs text-rose-400">Expired & Released</p>
            <p className="text-2xl font-extrabold text-rose-400 mt-1">
              {holds.filter(h => h.status === 'EXPIRED' || h.status === 'RELEASED').length}
            </p>
          </div>
        </div>

        {/* Holds Table */}
        <div className="bg-[#0F172A]/90 border border-slate-800 p-5 rounded-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              LIVE INVENTORY HOLD REGISTRY
            </h3>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
              REDIS TTL SYNCED
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Hold ID</th>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Event Name</th>
                  <th className="p-3">Ticket Type</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Created At</th>
                  <th className="p-3">Expires At</th>
                  <th className="p-3">Live Countdown</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {holds.map((hold) => {
                  const remSecs = calculateRemainingSeconds(hold.expiresAt);
                  const isExpiring = remSecs > 0 && remSecs <= 120 && hold.status === 'ACTIVE';
                  const isExpired = remSecs === 0 && hold.status !== 'CONFIRMED';

                  return (
                    <tr key={hold.holdId} className="hover:bg-slate-900/40">
                      <td className="p-3 font-bold text-cyan-400">{hold.holdId}</td>
                      <td className="p-3 text-slate-300">{hold.userId} ({hold.userName || 'User'})</td>
                      <td className="p-3 text-white font-sans font-semibold">{hold.eventName}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 text-[10px]">
                          {hold.ticketType}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-white">{hold.quantity}</td>
                      <td className="p-3 text-slate-400">{new Date(hold.createdAt).toLocaleTimeString()}</td>
                      <td className="p-3 text-slate-400">{new Date(hold.expiresAt).toLocaleTimeString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                          hold.status === 'CONFIRMED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : isExpired
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : isExpiring
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                        }`}>
                          {hold.status === 'CONFIRMED' ? 'CONFIRMED ✓' : formatCountdown(remSecs)}
                        </span>
                      </td>
                      <td className="p-3">
                        <StatusBadge
                          status={
                            hold.status === 'CONFIRMED'
                              ? 'CONFIRMED'
                              : isExpired
                              ? 'EXPIRED'
                              : isExpiring
                              ? 'EXPIRING'
                              : hold.status
                          }
                          size="sm"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Backend Authority Policy Box */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono">
          <p className="font-semibold text-cyan-400 flex items-center gap-1.5 mb-1">
            🔒 BACKEND EXPOSURE & TTL AUTHORITY STATEMENT:
          </p>
          <p>
            Ticket hold expirations are driven strictly by Redis key eviction TTL (10-minute expiry window). The frontend timer shown above is for visual monitoring purposes only and does NOT override backend server state.
          </p>
        </div>
      </div>
    </div>
  );
};
