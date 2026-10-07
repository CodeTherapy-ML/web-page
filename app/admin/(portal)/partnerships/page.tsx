import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { deletePartner } from "./actions";
import DeleteButton from "@/components/admin/delete-button";

export const metadata = { title: "Partnerships — CodeTherapy Admin" };

const categories = ["All", "Academic", "Healthcare", "Technology", "NGO"];

export default async function AdminPartnershipsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const category = searchParams.category ?? "All";

  const [partners, counts] = await Promise.all([
    db.partner.findMany({
      where: category !== "All" ? { category } : undefined,
      orderBy: { order: "asc" },
    }),
    db.partner.groupBy({ by: ["category"], _count: { _all: true } }),
  ]);

  const total = counts.reduce((sum, c) => sum + c._count._all, 0);
  const countOf = (cat: string) => counts.find((c) => c.category === cat)?._count._all ?? 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-ink">Global Partnerships</h1>
          <p className="text-sm text-gray-500">
            Coordinate clinical affiliations, corporate technology sponsors, and
            international health organisations.
          </p>
        </div>
        <Link
          href="/admin/partnerships/new"
          className="flex shrink-0 items-center gap-2 rounded-lg bg-admin-azure px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-azure-deep"
        >
          <Plus className="size-4" />
          Add Partner
        </Link>
      </header>

      {/* category tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {categories.map((cat) => {
          const label = cat === "All" ? `All (${total})` : `${cat} (${countOf(cat)})`;
          const href = cat === "All" ? "/admin/partnerships" : `/admin/partnerships?category=${cat}`;
          return (
            <Link
              key={cat}
              href={href}
              className={cn(
                "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                category === cat
                  ? "border-admin-azure font-semibold text-admin-azure"
                  : "border-transparent text-gray-500 hover:text-ink",
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {partners.map((partner) => (
          <article
            key={partner.id}
            className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-azure-soft font-serif text-base font-bold text-azure">
                  {partner.initial}
                </span>
                <div>
                  <h2 className="font-semibold text-ink">{partner.name}</h2>
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold text-gray-500">
                    {partner.category}
                  </span>
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  partner.affiliationStatus === "Active"
                    ? "bg-[#e2f4fd] text-admin-azure"
                    : "bg-[#e7ecf1] text-admin-navy",
                )}
              >
                {partner.affiliationStatus}
              </span>
            </div>

            <p className="text-sm text-gray-500">{partner.body}</p>

            <dl className="flex flex-col gap-1.5 border-t border-gray-100 pt-3 text-xs text-gray-500">
              <div className="flex justify-between">
                <dt>Start Date</dt>
                <dd className="font-semibold text-ink">{partner.startDate || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Primary Contact</dt>
                <dd className="font-semibold text-ink">{partner.contact || "—"}</dd>
              </div>
            </dl>

            <div className="mt-auto flex items-center gap-2">
              <Link
                href={`/admin/partnerships/${partner.id}`}
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-center text-xs font-semibold text-[#1e293b] transition-colors hover:border-admin-azure hover:text-admin-azure"
              >
                Edit
              </Link>
              <Link
                href={`/partnerships`}
                target="_blank"
                className="flex-1 rounded-lg bg-admin-azure px-3 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-azure-deep"
              >
                View
              </Link>
              <DeleteButton
                action={deletePartner}
                id={partner.id}
                title={`Delete ${partner.name}?`}
                description="The partnership is removed from the public page. This cannot be undone."
                ariaLabel={`Delete ${partner.name}`}
                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                Delete
              </DeleteButton>
            </div>
          </article>
        ))}

        {partners.length === 0 && (
          <p className="col-span-full rounded-lg border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
            No partners in this category.
          </p>
        )}
      </div>
    </div>
  );
}
