import React, { useEffect, useState } from 'react';
import { Sliders, Plus, Minus, CheckCircle2, ShieldAlert, Cpu, Activity, Gauge, RefreshCw } from 'lucide-react';
import { AdminHeader } from '../../components/layout/AdminHeader';
import { MetricCard } from '../../components/ui/MetricCard';
import { adminApi } from '../../services/api/adminApi';
import { AdmissionConfig } from '../../types';

export const AdmissionControl: React.FC = () => {
  const [config, setConfig] = useState<AdmissionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputRate, setInputRate] = useState<number>(200);
  const [updating, setUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAdmissionConfig();
      setConfig(data);
      setInputRate(data.admissionRate);
    } catch (err) {
      console.error('Failed to load admission config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpdateRate = async (newRate: number) => {
    if (newRate < 10) newRate = 10;
    if (newRate > 5000) newRate = 5000;

    setUpdating(true);
    try {
      const updated = await adminApi.updateAdmissionRate(newRate);
      setConfig(updated);
      setInputRate(updated.admissionRate);
      showToast(`Admission rate updated to ${newRate} users/batch via API.`);
    } catch (err) {
      showToast('Failed to update admission rate via backend API.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#080C14]">
      <AdminHeader
        title="Admission & Backpressure Control"
        subtitle="Dynamic queue release rate tuning, active session caps & load-shedding control"
        onRefresh={fetchConfig}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <MetricCard
            title="ADMISSION RATE"
            value={`${config?.admissionRate || 200}`}
            subtitle="users / batch"
            icon={Gauge}
            variant="cyan"
          />

          <MetricCard
            title="ACTIVE SESSIONS"
            value={`${config?.activeSessions || 180} / ${config?.maxSessions || 200}`}
            subtitle="Allowed in Checkout"
            icon={Activity}
            variant="emerald"
          />

          <MetricCard
            title="QUEUE SIZE"
            value={config?.queueSize || 38420}
            subtitle="Waiting in Stream"
            icon={Sliders}
            variant="amber"
          />

          <MetricCard
            title="BACKEND LOAD"
            value={`${config?.backendLoadPercentage || 68.4}%`}
            subtitle="CPU & Memory Stress"
            icon={Cpu}
            variant="purple"
          />

          <MetricCard
            title="REQUESTS / SEC"
            value={config?.requestsPerSecond || 4520}
            subtitle="Ingress RPS"
            icon={ShieldAlert}
            variant="blue"
          />
        </div>

        {/* Backpressure Control Tuning Panel */}
        <div className="bg-[#0F172A]/90 border border-slate-800 p-6 rounded-xl shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded font-semibold uppercase">
                BACKPRESSURE GOVERNOR
              </span>
              <h2 className="text-base font-bold text-white mt-1 font-mono">
                ADMISSION BATCH RATE CONTROLLER
              </h2>
              <p className="text-xs text-slate-400">
                Adjust how many waiting users receive booking admission tokens per dispatch cycle
              </p>
            </div>

            <div className="text-right font-mono">
              <span className="text-xs text-slate-400 block">Active Setting:</span>
              <span className="text-xl font-extrabold text-cyan-400">
                {config?.admissionRate || 200} users/batch
              </span>
            </div>
          </div>

          {/* Controls Section */}
          <div className="bg-slate-900/90 p-6 rounded-xl border border-slate-800 space-y-4">
            <label className="block text-xs font-mono text-slate-300 font-semibold">
              Set Batch Release Quantity (Users per cycle)
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleUpdateRate((config?.admissionRate || 200) - 50)}
                  disabled={updating}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 cursor-pointer disabled:opacity-50 transition-colors"
                  title="Decrease by 50"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <input
                  type="number"
                  value={inputRate}
                  onChange={(e) => setInputRate(Number(e.target.value))}
                  min={10}
                  max={5000}
                  step={10}
                  className="w-36 text-center px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-lg font-bold text-cyan-400 font-mono focus:outline-none focus:border-cyan-500"
                />

                <button
                  type="button"
                  onClick={() => handleUpdateRate((config?.admissionRate || 200) + 50)}
                  disabled={updating}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 cursor-pointer disabled:opacity-50 transition-colors"
                  title="Increase by 50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleUpdateRate(inputRate)}
                disabled={updating}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs rounded-lg shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50 font-mono transition-all"
              >
                {updating ? 'UPDATING VIA API...' : '[UPDATE ADMISSION RATE]'}
              </button>
            </div>

            {/* Quick Presets */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="text-slate-500">Quick Presets:</span>
              <button
                onClick={() => handleUpdateRate(50)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 cursor-pointer"
              >
                50 (Conservative / High Load)
              </button>
              <button
                onClick={() => handleUpdateRate(200)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700 cursor-pointer"
              >
                200 (Standard Optimal)
              </button>
              <button
                onClick={() => handleUpdateRate(500)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded border border-slate-700 cursor-pointer"
              >
                500 (Aggressive Rush)
              </button>
              <button
                onClick={() => handleUpdateRate(1000)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded border border-slate-700 cursor-pointer"
              >
                1000 (Maximum Flash Sale)
              </button>
            </div>
          </div>

          {/* System Backpressure Safeguards Explanation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-slate-300">
            <div className="p-4 bg-slate-900/60 rounded-lg border border-slate-800">
              <p className="font-bold text-cyan-400 mb-1">🎯 Purpose of Admission Control</p>
              <p className="text-slate-400">
                Prevents backend database collapse when 50,000 concurrent users hit the checkout API simultaneously. Limits downstream pressure to what MongoDB & Redis transactions can process cleanly.
              </p>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-lg border border-slate-800">
              <p className="font-bold text-emerald-400 mb-1">🔒 API Contract Execution</p>
              <p className="text-slate-400">
                Calls endpoint <code className="text-cyan-300">POST /api/admin/admission/config</code>. The backend updates the Redis rate-limiter token bucket parameter in real-time without server restarts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
