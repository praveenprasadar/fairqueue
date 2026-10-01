import React, { useEffect, useState } from 'react';
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle2, Filter } from 'lucide-react';
import { AdminHeader } from '../../components/layout/AdminHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { adminApi } from '../../services/api/adminApi';
import { SystemAlert, AlertSeverity } from '../../types';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolve = (id: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, status: 'RESOLVED' } : a))
    );
  };

  const filteredAlerts = alerts.filter(a =>
    severityFilter === 'ALL' ? true : a.severity === severityFilter
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#080C14]">
      <AdminHeader
        title="System Alerts & Notifications"
        subtitle="Real-time threshold breaches, inventory warnings & infrastructure alerts"
        onRefresh={fetchAlerts}
        isRefreshing={loading}
      />

      <div className="p-6 space-y-6">
        {/* Filter Bar */}
        <div className="bg-[#0F172A]/90 border border-slate-800 p-4 rounded-xl shadow-xl flex items-center justify-between">
          <div className="flex items-center space-x-2 font-mono text-xs">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-slate-300 font-semibold">Filter by Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer font-mono"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="WARNING">WARNING</option>
              <option value="INFO">INFO</option>
            </select>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
            <span className="text-rose-400 font-bold">
              Critical: {alerts.filter(a => a.severity === 'CRITICAL').length}
            </span>
            <span className="text-amber-400 font-bold">
              Warning: {alerts.filter(a => a.severity === 'WARNING').length}
            </span>
            <span className="text-cyan-400 font-bold">
              Info: {alerts.filter(a => a.severity === 'INFO').length}
            </span>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="bg-[#0F172A]/90 border border-slate-800 p-5 rounded-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Bell className="h-4 w-4 text-cyan-400" />
              SYSTEM ALERTS LOG
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Total Logged: {filteredAlerts.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Source Subsystem</th>
                  <th className="p-3">Alert Message</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredAlerts.map((alt) => (
                  <tr key={alt.id} className="hover:bg-slate-900/40">
                    <td className="p-3 text-slate-400">{alt.timestamp}</td>
                    <td className="p-3">
                      <StatusBadge status={alt.severity} size="sm" />
                    </td>
                    <td className="p-3 text-slate-300 font-semibold">{alt.source || 'System'}</td>
                    <td className="p-3 text-white font-sans">{alt.message}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        alt.status === 'ACTIVE' ? 'bg-amber-500/10 text-amber-400 font-bold' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {alt.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {alt.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleResolve(alt.id)}
                          className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold cursor-pointer inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Resolve</span>
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
