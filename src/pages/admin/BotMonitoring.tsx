import React, { useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck, Ban, CheckCircle2, Lock, Filter, Activity } from 'lucide-react';
import { AdminHeader } from '../../components/layout/AdminHeader';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { adminApi } from '../../services/api/adminApi';
import { BotMetrics, BotRequestLog } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const BotMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<BotMetrics | null>(null);
  const [logs, setLogs] = useState<BotRequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchBotData = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getBotMetrics();
      setMetrics(data.metrics);
      setLogs(data.logs);
    } catch (err) {
      console.error('Failed to load bot metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBotData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBlock = async (ip: string) => {
    try {
      await adminApi.blockIp(ip);
      setLogs(prev =>
        prev.map(l => (l.ipAddress === ip ? { ...l, action: 'BLOCKED', status: 'ACTIVE' } : l))
      );
      showToast(`IP ${ip} blocked via Rate-Limiter API.`);
    } catch (err) {
      showToast(`Failed to block IP ${ip}`);
    }
  };

  const handleUnblock = async (ip: string) => {
    try {
      await adminApi.unblockIp(ip);
      setLogs(prev =>
        prev.map(l => (l.ipAddress === ip ? { ...l, action: 'ALLOWED', status: 'RESOLVED' } : l))
      );
      showToast(`IP ${ip} unblocked via Rate-Limiter API.`);
    } catch (err) {
      showToast(`Failed to unblock IP ${ip}`);
    }
  };

  // Bot chart dataset over time
  const timeData = [
    { time: '10:00', normal: 12000, rateLimited: 80, blocked: 5 },
    { time: '10:05', normal: 24000, rateLimited: 190, blocked: 12 },
    { time: '10:10', normal: 38000, rateLimited: 310, blocked: 22 },
    { time: '10:15', normal: 45210, rateLimited: 420, blocked: 35 },
    { time: '10:20', normal: 44900, rateLimited: 390, blocked: 32 },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#080C14]">
      <AdminHeader
        title="Bot Shield & Rate-Limit Monitoring"
        subtitle="DDoS mitigation, suspicious request patterns & IP firewall rules"
        onRefresh={fetchBotData}
        isRefreshing={loading}
      />

      {toastMessage && (
        <div className="mx-6 mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-mono">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="NORMAL REQUESTS"
            value={metrics?.normalRequests || 45210}
            subtitle="Verified User Traffic"
            icon={ShieldCheck}
            variant="emerald"
          />

          <MetricCard
            title="RATE LIMITED"
            value={metrics?.rateLimitedRequests || 420}
            subtitle="Throttled by Token Bucket"
            icon={Activity}
            variant="amber"
          />

          <MetricCard
            title="CAPTCHA VERIFICATION"
            value={metrics?.verificationRequests || 85}
            subtitle="hCaptcha Challenges"
            icon={Lock}
            variant="blue"
          />

          <MetricCard
            title="BLOCKED REQUESTS"
            value={metrics?.blockedRequests || 35}
            subtitle="Firewalled Malicious IP"
            icon={Ban}
            variant="rose"
          />
        </div>

        {/* Request Pattern Chart over time */}
        <div className="bg-[#0F172A]/90 border border-slate-800 p-5 rounded-xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400" />
                REQUEST BEHAVIOR OVER TIME
              </h3>
              <p className="text-xs text-slate-400">Normal vs Rate-Limited vs Blocked Bot Requests</p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
              REAL-TIME ANOMALY SHIELD
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="normal" stroke="#10b981" fill="url(#colorNormal)" name="Normal" />
                <Area type="monotone" dataKey="rateLimited" stroke="#f59e0b" fill="url(#colorRate)" name="Rate Limited" />
                <Area type="monotone" dataKey="blocked" stroke="#f43f5e" fill="url(#colorBlocked)" name="Blocked" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bot Log Table */}
        <div className="bg-[#0F172A]/90 border border-slate-800 p-5 rounded-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-400" />
              SECURITY AUDIT LOGS & ACTION CONTROLS
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Total Entries: {logs.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Source Identifier</th>
                  <th className="p-3">Detection Reason</th>
                  <th className="p-3">System Action</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40">
                    <td className="p-3 text-slate-400">{log.time}</td>
                    <td className="p-3 font-semibold text-white">{log.sourceIdentifier}</td>
                    <td className="p-3 text-slate-300">{log.reason}</td>
                    <td className="p-3">
                      <StatusBadge status={log.action} size="sm" />
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        log.status === 'ACTIVE' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {log.action === 'BLOCKED' ? (
                        <button
                          onClick={() => handleUnblock(log.ipAddress)}
                          className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold cursor-pointer"
                        >
                          [UNBLOCK]
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBlock(log.ipAddress)}
                          className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-[10px] font-bold cursor-pointer"
                        >
                          [BLOCK]
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
