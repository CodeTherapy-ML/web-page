import { ArrowDown, ArrowUp } from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import VisitorsChart from "@/components/admin/visitors-chart";

export const metadata = { title: "Analytics — CodeTherapy Admin" };

/** Self-hosted analytics — every figure queries PageView / MonthlyStat directly. */
export default async function AdminAnalyticsPage() {
  const now = new Date();
  const days30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const days60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const where30 = { createdAt: { gte: days30 } };
  const wherePrev30 = { createdAt: { gte: days60, lt: days30 } };

  const [visitors30, visitorsPrev, pageviews30, pageviewsPrev, monthlyStats, browsers, oses, countries, topPages] =
    await Promise.all([
      db.pageView.groupBy({ by: ["anonId"], where: where30 }),
      db.pageView.groupBy({ by: ["anonId"], where: wherePrev30 }),
      db.pageView.count({ where: where30 }),
      db.pageView.count({ where: wherePrev30 }),
      db.monthlyStat.findMany({ orderBy: { month: "asc" } }),
      db.pageView.groupBy({ by: ["browser"], where: where30, _count: { _all: true } }),
      db.pageView.groupBy({ by: ["os"], where: where30, _count: { _all: true } }),
      db.pageView.groupBy({ by: ["country"], where: where30, _count: { _all: true } }),
      db.pageView.groupBy({ by: ["path"], where: where30, _count: { _all: true } }),
    ]);

  const sortedTopPages = [...topPages]
    .sort((a, b) => b._count._all - a._count._all)
    .slice(0, 10);
  const maxPageCount = sortedTopPages[0]?._count._all ?? 1;

  const browsersSorted = [...browsers]
    .filter((b) => b.browser)
    .sort((a, b) => b._count._all - a._count._all);
  const osSorted = [...oses].filter((o) => o.os).sort((a, b) => b._count._all - a._count._all);
  const countriesSorted = [...countries]
    .filter((c) => c.country)
    .sort((a, b) => b._count._all - a._count._all);

  const maxCountry = countriesSorted[0]?._count._all ?? 1;

  const visitorsDelta = deltaPct(visitors30.length, visitorsPrev.length);
  const pageviewsDelta = deltaPct(pageviews30, pageviewsPrev);

  const kpis = [
    { label: "Visitors (30 days)", value: visitors30.length, delta: visitorsDelta },
    { label: "Pageviews (30 days)", value: pageviews30, delta: pageviewsDelta },
    { label: "Months of history", value: monthlyStats.length, delta: null },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-ink">Analytics</h1>
        <p className="text-sm text-gray-500">
          Self-hosted pageview tracking — visitors, devices, locations and top pages.
          Raw rows are pruned after 6 months; monthly totals are kept forever.
        </p>
      </header>

      {/* -------------------------------------------------------- kpis */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="flex min-h-[96px] flex-col justify-between gap-2 rounded-lg border border-gray-200 bg-white p-5"
          >
            <p className="text-[13px] font-medium text-gray-500">{kpi.label}</p>
            <div className="flex items-baseline justify-between">
              <p className="text-[28px] font-bold text-ink">{kpi.value.toLocaleString()}</p>
              {kpi.delta && (
                <span
                  className={cn(
                    "flex items-center gap-1 rounded px-1.5 py-1 text-[11px] font-semibold",
                    kpi.delta.negative
                      ? "bg-[#e7ecf1] text-admin-navy"
                      : "bg-[#e2f4fd] text-admin-azure",
                  )}
                >
                  {kpi.delta.negative ? (
                    <ArrowDown className="size-3" />
                  ) : (
                    <ArrowUp className="size-3" />
                  )}
                  {kpi.delta.text}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ------------------------------------------------------ trend */}
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-bold text-ink">Monthly Trend</h2>
        {monthlyStats.length > 0 ? (
          <VisitorsChart data={monthlyStats} />
        ) : (
          <p className="py-10 text-center text-sm text-gray-500">
            No history yet — monthly aggregates appear once the first 6-month
            retention pass runs.
          </p>
        )}
      </section>

      {/* ---------------------------------------- breakdown columns */}
      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <BreakdownCard title="Devices — browsers" rows={browsersSorted.map((b) => ({ label: b.browser ?? "Unknown", count: b._count._all }))} max={pageviews30} />
          <BreakdownCard title="Devices — operating systems" rows={osSorted.map((o) => ({ label: o.os ?? "Unknown", count: o._count._all }))} max={pageviews30} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <BreakdownCard
            title="Countries"
            rows={countriesSorted.map((c) => ({
              label: c.country ? countryName(c.country) : "Unknown",
              count: c._count._all,
            }))}
            max={maxCountry}
          />

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-bold text-ink">Top Pages</h2>
            <div className="flex flex-col gap-2">
              {sortedTopPages.map((page) => (
                <div key={page.path} className="flex items-center gap-3 text-sm">
                  <span className="w-64 truncate text-ink-soft">{page.path || "/"}</span>
                  <span className="h-2 min-w-0 flex-1 overflow-hidden rounded bg-gray-100">
                    <span
                      className="block h-full rounded bg-admin-azure"
                      style={{ width: `${(page._count._all / maxPageCount) * 100}%` }}
                    />
                  </span>
                  <span className="w-10 shrink-0 text-right text-xs font-semibold text-ink">
                    {page._count._all}
                  </span>
                </div>
              ))}
              {sortedTopPages.length === 0 && (
                <p className="py-6 text-center text-sm text-gray-500">
                  No pageviews recorded yet.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function BreakdownCard({
  title,
  rows,
  max,
}: {
  title: string;
  rows: { label: string; count: number }[];
  max: number;
}) {
  const safeMax = Math.max(max, 1);
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-4 font-bold text-ink">{title}</h2>
      <div className="flex flex-col gap-2.5">
        {rows.slice(0, 8).map((row) => (
          <div key={row.label} className="flex items-center gap-3 text-sm">
            <span className="w-32 shrink-0 truncate text-ink-soft">{row.label}</span>
            <span className="h-2 min-w-0 flex-1 overflow-hidden rounded bg-gray-100">
              <span
                className="block h-full rounded bg-admin-navy"
                style={{ width: `${(row.count / safeMax) * 100}%` }}
              />
            </span>
            <span className="w-10 shrink-0 text-right text-xs font-semibold text-ink">
              {row.count}
            </span>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-500">No data yet.</p>
        )}
      </div>
    </section>
  );
}

/** Percentage change vs the previous 30-day window, for the KPI badges. */
function deltaPct(current: number, previous: number): {
  text: string;
  negative: boolean;
} {
  if (previous === 0) {
    return { text: current > 0 ? "new" : "0%", negative: false };
  }
  const pct = ((current - previous) / previous) * 100;
  const rounded = Math.abs(pct) < 0.05 ? 0 : pct;
  return {
    text: `${rounded >= 0 ? "+" : ""}${rounded.toFixed(1)}%`,
    negative: rounded < 0,
  };
}

/** ISO country codes → readable names for the common cases. */
function countryName(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}
