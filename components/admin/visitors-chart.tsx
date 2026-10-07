"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Month = { month: string; visitors: number; pageviews: number };

/** Monthly visitors trend from MonthlyStat — the brand cyan at two strengths. */
export default function VisitorsChart({ data }: { data: Month[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: formatMonth(d.month),
  }));

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb" }}
            tick={{ fontSize: 11, fill: "#6b7280" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(0,174,239,0.07)" }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: 12,
            }}
          />
          <Bar
            dataKey="visitors"
            name="Visitors"
            fill="#00719d"
            radius={[3, 3, 0, 0]}
            maxBarSize={22}
          />
          <Bar
            dataKey="pageviews"
            name="Pageviews"
            fill="#00aeef"
            radius={[3, 3, 0, 0]}
            maxBarSize={22}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatMonth(month: string): string {
  // "2026-08" → "Aug 26"
  const [year, m] = month.split("-");
  const names = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${names[Number(m) - 1] ?? m} ${year.slice(2)}`;
}
