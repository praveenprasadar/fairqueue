import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNegative?: boolean;
  };
  variant?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple' | 'blue' | 'slate';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'cyan',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'emerald':
        return {
          iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          border: 'border-emerald-500/20',
          glow: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10',
          valueColor: 'text-emerald-400',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          border: 'border-amber-500/20',
          glow: 'hover:border-amber-500/40 hover:shadow-amber-500/10',
          valueColor: 'text-amber-400',
        };
      case 'rose':
        return {
          iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          border: 'border-rose-500/20',
          glow: 'hover:border-rose-500/40 hover:shadow-rose-500/10',
          valueColor: 'text-rose-400',
        };
      case 'purple':
        return {
          iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          border: 'border-purple-500/20',
          glow: 'hover:border-purple-500/40 hover:shadow-purple-500/10',
          valueColor: 'text-purple-400',
        };
      case 'blue':
        return {
          iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          border: 'border-blue-500/20',
          glow: 'hover:border-blue-500/40 hover:shadow-blue-500/10',
          valueColor: 'text-blue-400',
        };
      case 'slate':
        return {
          iconBg: 'bg-slate-800 text-slate-300 border-slate-700',
          border: 'border-slate-800',
          glow: 'hover:border-slate-700 hover:shadow-slate-800/10',
          valueColor: 'text-slate-200',
        };
      default: // cyan
        return {
          iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          border: 'border-cyan-500/20',
          glow: 'hover:border-cyan-500/40 hover:shadow-cyan-500/10',
          valueColor: 'text-cyan-400',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={`bg-[#0F172A]/80 border ${styles.border} ${styles.glow} p-4 rounded-xl shadow-lg transition-all duration-200 flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <h3 className={`text-2xl font-extrabold font-mono mt-1 ${styles.valueColor}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
        </div>
        <div className={`p-2.5 rounded-lg border ${styles.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-400 text-[11px] truncate">{subtitle}</span>}
          {trend && (
            <span
              className={`font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                trend.isPositive
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : trend.isNegative
                  ? 'bg-rose-500/15 text-rose-400'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
