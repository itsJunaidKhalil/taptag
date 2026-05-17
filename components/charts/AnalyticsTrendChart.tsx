"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type TrendPoint = { label: string; views: number; clicks: number };

export default function AnalyticsTrendChart({ data }: { data: TrendPoint[] }) {
  if (!data.length) return null;

  return (
    <div className="w-full h-56 sm:h-64 -mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200/60 dark:stroke-gray-700/60" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11 }}
            className="text-gray-500"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11 }}
            className="text-gray-500"
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid rgba(0,0,0,0.06)",
              fontSize: "12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="views"
            name="Views"
            stroke="#6366f1"
            fill="url(#viewsGradient)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="clicks"
            name="Clicks"
            stroke="#8b5cf6"
            fill="url(#clicksGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
