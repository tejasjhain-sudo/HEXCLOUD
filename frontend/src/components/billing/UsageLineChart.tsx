import React from 'react';

interface UsageLineChartProps {
  title: string;
  labels: string[];
  values: number[];
  unit?: string;
  color?: string;
  max?: number;
}

export const UsageLineChart: React.FC<UsageLineChartProps> = ({
  title,
  labels,
  values,
  unit = '%',
  color = '#6366f1',
  max = 100,
}) => {
  const w = 400;
  const h = 120;
  const pad = 8;
  const points = values.map((v, i) => {
    const x = pad + (i / Math.max(1, values.length - 1)) * (w - pad * 2);
    const y = h - pad - (Math.min(max, v) / max) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  const area = values.length
    ? `M ${pad},${h - pad} L ${points.split(' ').join(' L ')} L ${w - pad},${h - pad} Z`
    : '';

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-slate-700">{title}</span>
        <span className="text-[10px] font-mono text-slate-500">
          {values.length ? `${values[values.length - 1]}${unit}` : '—'}
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-28" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {area && <path d={area} fill={`url(#grad-${title})`} />}
        <polyline fill="none" stroke={color} strokeWidth="2.5" points={points} />
      </svg>
      <div className="flex justify-between text-[9px] text-slate-400 font-mono">
        <span>{labels[0]}</span>
        <span>{labels[labels.length - 1]}</span>
      </div>
    </div>
  );
};
