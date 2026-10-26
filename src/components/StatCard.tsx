import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  trend?: {
    text: string;
    positive?: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-[#1B1E21] border border-[#303438] flex flex-col justify-between transition-all hover:border-[#FFD166]/30">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium text-[#A3A8AE] tracking-wide uppercase">
          {label}
        </span>
        <div className="w-8 h-8 rounded-lg bg-[#22262A] border border-[#303438] flex items-center justify-center shrink-0 text-[#FFD166]">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F7F7F5] tabular-nums font-mono">
          {value}
        </div>
        {(subtext || trend) && (
          <div className="mt-1.5 flex items-center gap-2 text-xs text-[#A3A8AE]">
            {trend && (
              <span
                className={`font-semibold tabular-nums ${
                  trend.positive ? 'text-[#72D6A0]' : 'text-[#FFD166]'
                }`}
              >
                {trend.text}
              </span>
            )}
            {subtext && <span>{subtext}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
