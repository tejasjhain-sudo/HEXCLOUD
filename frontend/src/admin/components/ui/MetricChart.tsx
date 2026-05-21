import React, { useMemo } from 'react';
import type { MetricPoint } from '../../types/admin';

interface MetricChartProps {
  data: MetricPoint[];
  label: string;
  unit?: string;
  color?: string;
  height?: number;
}

export const MetricChart: React.FC<MetricChartProps> = ({
  data,
  label,
  unit = '%',
  color = '#22d3ee',
  height = 120,
}) => {
  const { path, area, latest, min, max } = useMemo(() => {
    if (!data.length) return { path: '', area: '', latest: 0, min: 0, max: 100 };
    const vals = data.map((d) => d.v);
    const minV = Math.min(...vals) * 0.9;
    const maxV = Math.max(...vals) * 1.05;
    const w = 280;
    const h = height - 20;
    const pts = data.map((d, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((d.v - minV) / (maxV - minV)) * h;
      return `${x},${y}`;
    });
    const line = `M ${pts.join(' L ')}`;
    const areaPath = `${line} L ${w},${h} L 0,${h} Z`;
    return {
      path: line,
      area: areaPath,
      latest: vals[vals.length - 1],
      min: Math.round(minV),
      max: Math.round(maxV),
    };
  }, [data, height]);

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs font-semibold text-slate-400">{label}</span>
        <span className="text-lg font-bold text-white tabular-nums">
          {latest.toFixed(1)}
          <span className="text-xs text-slate-500 font-normal ml-0.5">{unit}</span>
        </span>
      </div>
      <svg viewBox={`0 0 280 ${height}`} className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((p) => (
          <line
            key={p}
            x1="0"
            y1={height * p}
            x2="280"
            y2={height * p}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
          />
        ))}
        <path d={area} fill={`url(#grad-${label})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className="flex justify-between text-[10px] text-slate-600 mt-1 font-mono">
        <span>min {min}</span>
        <span>max {max}</span>
      </div>
    </div>
  );
};
