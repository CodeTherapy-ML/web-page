import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminTopbar from "@/components/admin/admin-topbar";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// Admin pages render per-request (session + DB state) — never prerendered,
// which also keeps `next build` working before DATABASE_URL exists.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — CodeTherapy",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  const [versionSetting, newLeads] = await Promise.all([
    db.setting.findUnique({ where: { key: "cmsVersion" } }),
    db.lead.count({ where: { status: "new" } }),
  ]);

  const version =
    (versionSetting?.value as string | undefined) ?? "v1.4.2";

  return (
    <div className="flex min-h-screen bg-gray-100 font-admin">
      <AdminSidebar version={version} newLeads={newLeads} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar name={session.name} role={session.role} newLeads={newLeads} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
