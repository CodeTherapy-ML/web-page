import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  Edit3,
  ExternalLink,
  FolderPlus,
  Mail,
  Plus,
  Upload,
} from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { cn } from "@/lib/utils";

/**
 * `cms-dashboard-overview` — every figure and row comes from the database:
 * post counts by status, project count, recent posts, new leads (topbar).
 * Visitors + trend deltas live in the Setting table until analytics exist.
 */
export default async function AdminDashboardPage() {
  const session = await requireAdmin();
  const firstName = session.name.split(" ")[0];

  const now = new Date();
  const days30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const days60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [published, drafts, underReview, activeProjects, recent, newLeads, settings, views] =
    await Promise.all([
      db.post.count({ where: { status: "published" } }),
      db.post.count({ where: { status: "draft" } }),
      db.post.count({ where: { status: "underReview" } }),
      db.project.count(),
      db.post.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
      db.lead.count({ where: { status: "new" } }),
      db.setting.findMany(),
      db.pageView.groupBy({ by: ["anonId"], where: { createdAt: { gte: days30 } } }),
    ]);

  const get = (key: string, fallback: string) =>
    String(settings.find((s) => s.key === key)?.value ?? fallback);

  // Previous 30-day window, for the visitors trend.
  const viewsPrev = await db.pageView.groupBy({
    by: ["anonId"],
    where: { createdAt: { gte: days60, lt: days30 } },
  });

  const monthlyVisitors = views.length;
  const prevVisitors = viewsPrev.length;
  const visitorsDelta =
    prevVisitors > 0
      ? `${(((monthlyVisitors - prevVisitors) / prevVisitors) * 100).toFixed(1)}%`
      : "+0%"

  const kpis = [
    {
      label: "Published Articles",
      value: published,
      delta: get("publishedDelta", "+0"),
      tone: "sage" as const,
    },
    {
      label: "Draft Articles",
      value: drafts,
      delta: get("draftDelta", "0"),
      tone: "clay" as const,
    },
    {
      label: "Active Projects",
      value: activeProjects,
      delta: get("projectsDelta", "0"),
      tone: "clay" as const,
    },
    {
      label: "Monthly Visitors",
      value: monthlyVisitors,
      delta: visitorsDelta,
      tone: "sage" as const,
    },
  ];

  const statusPill: Record<string, string> = {
    published: "bg-[#e2f4fd] text-admin-azure",
    underReview: "bg-[#cbe9fa] text-admin-azure",
    draft: "bg-[#e7ecf1] text-admin-navy",
  };
  const statusLabel: Record<string, string> = {
    published: "Published",
    underReview: "Under Review",
    draft: "Draft",
  };

  const days = calendarDays(new Date());

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ---------------------------------------------- welcome header */}
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-ink">Welcome back, {firstName}</h1>
        <p className="text-sm text-gray-500">
          Today is {format(new Date(), "EEEE, MMMM d, yyyy")} · Systems Operational
        </p>
      </header>

      {/* ---------------------------------------------------------- kpis */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="flex min-h-[120px] flex-col justify-between gap-3 rounded-lg border border-gray-200 bg-white p-5"
          >
            <p className="text-[13px] font-medium text-gray-500">{kpi.label}</p>
            <div className="flex items-baseline justify-between">
              <p className="text-[28px] font-bold text-ink">{kpi.value}</p>
              <span
                className={cn(
                  "flex items-center gap-1 rounded px-1.5 py-1 text-[11px] font-semibold",
                  kpi.tone === "sage" ? "bg-[#e2f4fd] text-admin-azure" : "bg-[#e7ecf1] text-admin-navy",
                )}
              >
                {kpi.delta.startsWith("-") ? (
                  <ArrowDown className="size-3" />
                ) : (
                  <ArrowUp className="size-3" />
                )}
                {kpi.delta.replace(/^\+/, "")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------------------------------------------- split rows */}
      <div className="flex flex-col gap-5 xl:flex-row">
        {/* -------------------------------------------- recent articles */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-ink">Recent Articles</h2>
            <Link
              href="/admin/articles"
              className="px-2.5 py-1.5 text-[13px] font-semibold text-admin-azure hover:underline"
            >
              View all articles
            </Link>
          </div>
          <div className="flex flex-col">
            {recent.map((post) => (
              <div
                key={post.id}
                className="flex items-center gap-4 border-t border-gray-200 py-3 first:border-t-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{post.title}</p>
                  <p className="text-xs text-gray-500">{post.authorName}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "rounded px-2 py-1 text-xs font-semibold",
                      statusPill[post.status],
                    )}
                  >
                    {statusLabel[post.status]}
                  </span>
                  <span className="w-[90px] text-[13px] text-gray-500">{post.date}</span>
                  <Link
                    href={`/admin/articles/${post.id}`}
                    aria-label={`Edit ${post.title}`}
                    className="rounded bg-gray-100 px-2 py-1 text-gray-500 transition-colors hover:text-ink"
                  >
                    <Edit3 className="size-3.5" />
                  </Link>
                </div>
              </div>
            ))}
            {recent.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-500">
                No articles yet — create the first one.
              </p>
            )}
          </div>
        </div>

        {/* ----------------------------------------- quick actions + calendar */}
        <div className="flex w-full flex-col gap-5 xl:w-[320px] xl:shrink-0">
          <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-[15px] font-bold text-ink">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              <Link
                href="/admin/articles/new"
                className="flex items-center gap-2.5 rounded-md bg-admin-azure px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-azure-deep"
              >
                <Plus className="size-4" />
                <span className="flex-1">New Article</span>
              </Link>
              <Link
                href="/admin/projects/new"
                className="flex items-center gap-2.5 rounded-md border border-gray-200 px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-admin-azure hover:text-admin-azure"
              >
                <FolderPlus className="size-4" />
                <span className="flex-1">New Project</span>
              </Link>
              <Link
                href="/admin/media"
                className="flex items-center gap-2.5 rounded-md border border-gray-200 px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-admin-azure hover:text-admin-azure"
              >
                <Upload className="size-4" />
                <span className="flex-1">Upload Media</span>
              </Link>
              <Link
                href="/admin/messages"
                className="flex items-center gap-2.5 rounded-md border border-gray-200 px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-admin-azure hover:text-admin-azure"
              >
                <Mail className="size-4" />
                <span className="flex-1">Messages</span>
                {newLeads > 0 && (
                  <span className="rounded-full bg-admin-azure px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {newLeads}
                  </span>
                )}
              </Link>
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-2.5 rounded-md border border-gray-200 px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-admin-azure hover:text-admin-azure"
              >
                <ExternalLink className="size-4" />
                <span className="flex-1">View Public Site</span>
              </Link>
            </div>
          </div>

          {/* ---------------------------------------------------- calendar */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="mb-3 font-bold text-ink">
              {format(new Date(), "MMMM yyyy")}
            </p>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <span key={`${d}-${i}`} className="py-1">
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[13px]">
              {days.map((day, i) => {
                const isToday = day?.toDateString() === new Date().toDateString();
                return (
                  <span
                    key={i}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full",
                      day && "text-ink",
                      !day && "text-transparent",
                      isToday && "bg-admin-azure font-bold text-white",
                    )}
                  >
                    {day ? day.getDate() : 0}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Leading/trailing blanks so the grid starts on Sunday and covers the month. */
function calendarDays(now: Date): (Date | null)[] {
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const startDay = first.getDay(); // 0 = Sunday, matching the design's header
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(now.getFullYear(), now.getMonth(), d));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
