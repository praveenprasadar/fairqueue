import React from 'react';
import { Wifi, WifiOff, RefreshCw, Shield, AlertTriangle } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { ComponentStatus } from '../../types';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  healthStatus?: ComponentStatus;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  healthStatus = {
    backend: 'ONLINE',
    redis: 'ONLINE',
    mongoDB: 'ONLINE',
    queue: 'ACTIVE',
    payment: 'ONLINE',
    loadBalancer: 'ONLINE'
  },
  onRefresh,
  isRefreshing = false,
}) => {
  const { isConnected } = useSocket();

  const getBadgeColor = (status?: string) => {
    switch (status) {
      case 'ONLINE':
      case 'ACTIVE':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'DEGRADED':
      case 'PAUSED':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'OFFLINE':
      case 'DRAINING':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <header className="bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 sticky top-0 z-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Subtitle */}
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            {title}
          </h1>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        {/* Live System Health Indicators */}
        <div className="flex flex-wrap items-center gap-2">
          {/* System Services Status Chips */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800/80 text-[11px] font-mono">
            <span className="text-slate-500 font-semibold uppercase text-[10px] mr-1">System Health:</span>

            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${getBadgeColor(healthStatus.backend)}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Backend</span>
            </div>

            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${getBadgeColor(healthStatus.redis)}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span>Redis</span>
            </div>

            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${getBadgeColor(healthStatus.mongoDB)}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>MongoDB</span>
            </div>

            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${getBadgeColor(healthStatus.queue)}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Queue</span>
            </div>

            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${getBadgeColor(healthStatus.payment)}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Payment</span>
            </div>

            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${getBadgeColor(healthStatus.loadBalancer)}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span>LB (Nginx)</span>
            </div>
          </div>

          {/* Socket Real-time Indicator */}
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium ${
            isConnected
              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            {isConnected ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-cyan-400" />
                <span>SOCKET LIVE</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-amber-400" />
                <span>REST POLLED</span>
              </>
            )}
          </div>

          {/* Refresh Action */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Data from API"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
