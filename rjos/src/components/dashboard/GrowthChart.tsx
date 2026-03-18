"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface DataPoint {
  date: string;
  minutes: number;
  problems?: number;
}

interface GrowthChartProps {
  data: DataPoint[];
}

export function GrowthChart({ data }: GrowthChartProps) {
  if (data.length === 0) {
    return (
      <div className="relative bg-[var(--paper)] border border-[var(--border)] rounded-[2px] shadow-[var(--shadow-card)] card-lift p-6 mt-4">
        <h3 className="font-[family-name:var(--font-geist-mono)] text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-3)] mb-4">
          EXPEDITION LOG / LAST 30 DAYS
        </h3>
        <div className="flex h-32 items-center justify-center text-[13px] font-[family-name:var(--font-inter)] text-[var(--ink-3)]">
          Log activities to see your growth chart.
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-[var(--paper)] border border-[var(--border)] rounded-[2px] shadow-[var(--shadow-card)] card-lift p-6 mt-4 overflow-hidden">
      {/* Faint map grid lines at 3% opacity */}
      <img
        src="/assets/maps/maps (1).png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-[0.03] pointer-events-none select-none"
      />

      <h3 className="relative z-[1] font-[family-name:var(--font-geist-mono)] text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-3)] mb-4">
        EXPEDITION LOG / LAST 30 DAYS
      </h3>
      <div className="relative z-[1] mt-4 p-4 rounded-[2px]">
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'var(--ink-3)', fontFamily: 'var(--font-geist-mono)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
              tickFormatter={(v: string) => v.slice(5).replace('-', '/')}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--ink-3)', fontFamily: 'var(--font-geist-mono)' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--paper)",
                border: "none",
                borderRadius: "2px",
                fontSize: 12,
                boxShadow: "var(--shadow-card)",
                fontFamily: "var(--font-geist-mono)",
                color: "var(--ink)",
                borderLeft: "3px solid var(--amber)",
                padding: "8px 12px",
              }}
              formatter={(value) => [`${value} min`, "Active Time"]}
              labelStyle={{ color: 'var(--ink-3)', marginBottom: '4px', fontSize: 10 }}
            />
            <Area
              type="monotone"
              dataKey="minutes"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#colorMinutes)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
