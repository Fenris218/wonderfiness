"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatVND } from "@/lib/format";

const COLORS = ["#FF4D1C", "#0B0F14", "#f59e0b", "#10b981", "#6366f1"];

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #E7EAF0",
  boxShadow: "0 8px 24px rgba(11,15,20,.08)",
  fontSize: 12,
} as const;

export function RevenueChart({ data }: { data: { day: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF4D1C" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#FF4D1C" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          width={58}
          tickFormatter={(v) => `${Math.round(Number(v) / 1_000_000)}tr`}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value) => [formatVND(Number(value)), "Doanh thu"]}
          labelStyle={{ color: "#0B0F14", fontWeight: 600 }}
        />
        <Area type="monotone" dataKey="revenue" stroke="#FF4D1C" strokeWidth={2.5} fill="url(#revGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function FunnelChart({ data }: { data: { label: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          width={86}
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} lead`, ""]} />
        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PackagePie({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [`${v} đơn`, String(n)]} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          formatter={(value: string) => <span style={{ fontSize: 11, color: "#64748b" }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function BranchBars({ data }: { data: { name: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <XAxis dataKey="name" tick={{ fontSize: 10.5, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          width={50}
          tickFormatter={(v) => `${Math.round(Number(v) / 1_000_000)}tr`}
        />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatVND(Number(v)), "Doanh thu"]} />
        <Bar dataKey="revenue" fill="#0B0F14" radius={[6, 6, 0, 0]} barSize={26} />
      </BarChart>
    </ResponsiveContainer>
  );
}
