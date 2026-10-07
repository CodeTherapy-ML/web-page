import Link from "next/link";
import { Bell, LogOut, Search } from "lucide-react";
import { signOut } from "@/app/admin/actions";

/**
 * `topbar` from cms-dashboard-overview — white, 70px, hairline bottom border.
 * The bell badge is the count of unreviewed leads.
 */
export default function AdminTopbar({
  name,
  role,
  newLeads,
}: {
  name: string;
  role: string;
  newLeads: number;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-[70px] shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
      <label className="flex w-[320px] items-center gap-2.5 rounded-md bg-gray-100 px-3 py-2">
        <Search className="size-4 shrink-0 text-gray-400" />
        <input
          type="search"
          placeholder="Search content, tags, creators..."
          aria-label="Search content, tags, creators"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-gray-400"
        />
      </label>

      <div className="flex items-center gap-5">
        <Link
          href="/admin/messages"
          aria-label={
            newLeads > 0
              ? `${newLeads} unread message${newLeads === 1 ? "" : "s"}`
              : "Messages"
          }
          className="relative flex size-9 items-center justify-center rounded-[18px] bg-gray-100 transition-colors hover:bg-gray-200"
        >
          <Bell className="size-[18px] text-ink-soft" />
          {newLeads > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-lg bg-admin-navy text-[9px] font-bold text-white">
              {newLeads > 9 ? "9+" : newLeads}
            </span>
          )}
        </Link>

        <span className="h-6 w-px bg-gray-200" aria-hidden />

        <div className="flex items-center gap-3">
          <span className="flex size-[38px] items-center justify-center rounded-[19px] bg-gray-200 text-sm font-bold text-ink">
            {initials}
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-ink">{name}</span>
            <span className="text-xs text-gray-500">{role}</span>
          </span>
          <form action={signOut} className="flex items-center">
            <button
              type="submit"
              title="Sign out"
              aria-label="Sign out"
              className="flex size-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-ink"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
