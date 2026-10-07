import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import ArticlesTable from "@/components/admin/articles-table";

/**
 * `cms-articles-list` — status tabs, keyword + category filters, bulk actions,
 * table. Status filtering is server-side via searchParams; bulk ops are client
 * (selection) + server actions.
 */
export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string; category?: string };
}) {
  const status = searchParams.status ?? "all";
  const q = searchParams.q?.trim();
  const category = searchParams.category?.trim();

  const [posts, counts] = await Promise.all([
    db.post.findMany({
      where: {
        ...(status !== "all" ? { status } : {}),
        ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
        ...(category && category !== "All Categories"
          ? { category: { equals: category } }
          : {}),
      },
      orderBy: { updatedAt: "desc" },
    }),
    db.post.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const total = counts.reduce((sum, c) => sum + c._count._all, 0);
  const countOf = (s: string) => counts.find((c) => c.status === s)?._count._all ?? 0;

  const tabs = [
    { label: `All (${total})`, value: "all" },
    { label: `Published (${countOf("published")})`, value: "published" },
    { label: `Drafts (${countOf("draft")})`, value: "draft" },
    { label: `Under Review (${countOf("underReview")})`, value: "underReview" },
  ];

  const categories = await db.post.findMany({
    select: { category: true },
    distinct: ["category"],
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-ink">Articles</h1>
          <p className="text-sm text-gray-500">
            Manage your articles, drafts, and publication cycles
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex shrink-0 items-center gap-2 rounded-lg bg-admin-azure px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-azure-deep"
        >
          <Plus className="size-4" />
          New Article
        </Link>
      </header>

      {/* -------------------------------------------------- status tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/articles${tab.value === "all" ? "" : `?status=${tab.value}`}`}
            className={cn(
              "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              status === tab.value
                ? "border-admin-azure font-semibold text-admin-azure"
                : "border-transparent text-gray-500 hover:text-ink",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* ------------------------------------------------------ filters */}
      <form className="flex flex-wrap items-center gap-3">
        <label className="flex h-9 w-64 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3">
          <Search className="size-4 shrink-0 text-gray-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Filter by keyword..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
        </label>
        <select
          name="category"
          defaultValue={category ?? "All Categories"}
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-ink outline-none focus:border-admin-azure"
        >
          <option>All Categories</option>
          {categories.map((c) => (
            <option key={c.category}>{c.category}</option>
          ))}
        </select>
        {status !== "all" && <input type="hidden" name="status" value={status} />}
        <button
          type="submit"
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-[#1e293b] transition-colors hover:border-admin-azure hover:text-admin-azure"
        >
          Apply
        </button>
      </form>

      <ArticlesTable posts={posts} />
    </div>
  );
}
