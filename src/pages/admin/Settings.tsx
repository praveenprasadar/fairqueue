import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, User, Sliders, Bell, Shield, CheckCircle2, Save } from 'lucide-react';
import { AdminHeader } from '../../components/layout/AdminHeader';
import { adminApi } from '../../services/api/adminApi';
import { AdminSettings } from '../../types';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      await adminApi.updateSettings(settings);
      showToast('Admin configuration settings saved to API server.');
    } catch (err) {
      showToast('Failed to update settings via API.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#080C14]">
      <AdminHeader
        title="Admin System Settings"
        subtitle="Configure queue boundaries, admin profile, alert channels & backpressure defaults"
        onRefresh={fetchSettings}
        isRefreshing={loading}
      />

      {toastMessage && (
        <div className="mx-6 mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-mono">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="p-6 space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Admin Profile Section */}
          <div className="bg-[#0F172A]/90 border border-slate-800 p-6 rounded-xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2 pb-3 border-b border-slate-800">
              <User className="h-4 w-4 text-cyan-400" />
              ADMIN PROFILE
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Admin Name</label>
                <input
                  type="text"
                  value={settings?.adminProfile.name || ''}
                  onChange={(e) => setSettings(prev => prev ? ({
                    ...prev,
                    adminProfile: { ...prev.adminProfile, name: e.target.value }
                  }) : null)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  value={settings?.adminProfile.email || ''}
                  disabled
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Role Permission</label>
                <input
                  type="text"
                  value={settings?.adminProfile.role || 'ADMIN'}
                  disabled
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-cyan-400 font-bold cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* System & Queue Configuration */}
          <div className="bg-[#0F172A]/90 border border-slate-800 p-6 rounded-xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2 pb-3 border-b border-slate-800">
              <Sliders className="h-4 w-4 text-purple-400" />
              SYSTEM & QUEUE BOUNDARIES
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Max Queue Capacity</label>
                <input
                  type="number"
                  value={settings?.queueConfig.maxQueueCapacity || 100000}
                  onChange={(e) => setSettings(prev => prev ? ({
                    ...prev,
                    queueConfig: { ...prev.queueConfig, maxQueueCapacity: Number(e.target.value) }
                  }) : null)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Hold Duration (Minutes)</label>
                <input
                  type="number"
                  value={settings?.systemConfig.holdDurationMinutes || 10}
                  onChange={(e) => setSettings(prev => prev ? ({
                    ...prev,
                    systemConfig: { ...prev.systemConfig, holdDurationMinutes: Number(e.target.value) }
                  }) : null)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Default Batch Size</label>
                <input
                  type="number"
                  value={settings?.admissionConfig.defaultBatchSize || 200}
                  onChange={(e) => setSettings(prev => prev ? ({
                    ...prev,
                    admissionConfig: { ...prev.admissionConfig, defaultBatchSize: Number(e.target.value) }
                  }) : null)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-[#0F172A]/90 border border-slate-800 p-6 rounded-xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2 pb-3 border-b border-slate-800">
              <Bell className="h-4 w-4 text-emerald-400" />
              NOTIFICATION CHANNELS
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.notificationSettings.emailAlerts ?? true}
                  onChange={(e) => setSettings(prev => prev ? ({
                    ...prev,
                    notificationSettings: { ...prev.notificationSettings, emailAlerts: e.target.checked }
                  }) : null)}
                  className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-slate-200">Email Alerts for System Critical Incidents</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.notificationSettings.slackWebhook ?? true}
                  onChange={(e) => setSettings(prev => prev ? ({
                    ...prev,
                    notificationSettings: { ...prev.notificationSettings, slackWebhook: e.target.checked }
                  }) : null)}
                  className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-slate-200">Slack Webhook Stream for Queue Spikes</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.notificationSettings.criticalAlertSMS ?? true}
                  onChange={(e) => setSettings(prev => prev ? ({
                    ...prev,
                    notificationSettings: { ...prev.notificationSettings, criticalAlertSMS: e.target.checked }
                  }) : null)}
                  className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-slate-200">Emergency SMS Alerts for Inventory Discrepancy</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs rounded-lg shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50 font-mono transition-all"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Configuration Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
