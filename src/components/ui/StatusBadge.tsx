import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase();

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  if (['ACTIVE', 'ONLINE', 'CONFIRMED', 'SUCCESS', 'ALLOWED', 'SAFE', 'RESOLVED'].includes(normalized)) {
    colorClasses = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  } else if (['PAUSED', 'PENDING', 'HELD', 'EXPIRING', 'WARNING', 'RATE LIMITED', 'VERIFICATION REQUIRED'].includes(normalized)) {
    colorClasses = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  } else if (['STOPPED', 'EXPIRED', 'FAILED', 'BLOCKED', 'CRITICAL', 'CANCELLED', 'OFFLINE'].includes(normalized)) {
    colorClasses = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  } else if (['DRAFT', 'RELEASED', 'INFO', 'DRAINING'].includes(normalized)) {
    colorClasses = 'bg-blue-500/15 text-blue-400 border-blue-500/30';
  }

  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono font-semibold rounded border ${sizeClasses} ${colorClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {normalized}
    </span>
  );
};
