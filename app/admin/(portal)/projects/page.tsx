import Image from "next/image";
import Link from "next/link";
import { BookOpen, Plus, Users } from "lucide-react";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

/**
 * `cms-projects-management` — card grid with status pill, completion bar and
 * metrics, all read from Project.
 */
export default async function AdminProjectsPage() {
  const projects = await db.project.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-ink">Projects Management</h1>
          <p className="text-sm text-gray-500">
            Oversee clinical trial pipelines, research datasets, and machine learning
            milestones.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="flex shrink-0 items-center gap-2 rounded-lg bg-admin-azure px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-azure-deep"
        >
          <Plus className="size-4" />
          Add Project
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => {
          const active = project.statusTone === "sage";
          return (
            <article
              key={project.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white"
            >
              <div className="relative h-[160px] w-full shrink-0">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 max-w-[240px] flex-1 flex-col gap-1">
                    <h2 className="truncate text-base font-bold text-[#1e293b]">
                      {project.title}
                    </h2>
                    <p className="line-clamp-2 h-9 text-xs text-[#64748b]">
                      {project.description}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-xl px-2.5 py-1 text-xs font-semibold",
                      active ? "bg-[#cbe9fa] text-admin-azure" : "bg-[#e7ecf1] text-admin-navy",
                    )}
                  >
                    {active ? "Active" : "Under Review"}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-start justify-between text-xs font-semibold">
                    <span className="text-[#1e293b]">Completion</span>
                    <span className="text-admin-azure">{project.completion}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded bg-[#f1f5f9]">
                    <div
                      className="h-full rounded bg-admin-azure"
                      style={{ width: `${project.completion}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="size-3.5" />
                    {project.publications} Publications
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3.5" />
                    {project.teamSize} Team Members
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden>◈</span>
                    {project.partnerCount} Partners
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-xs text-gray-400">
                    Updated{" "}
                    {project.updatedAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="rounded border border-gray-200 px-3 py-1.5 text-xs font-semibold text-[#1e293b] transition-colors hover:border-admin-azure hover:text-admin-azure"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/projects/${project.slug}`}
                      target="_blank"
                      className="rounded bg-admin-azure px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-azure-deep"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        {projects.length === 0 && (
          <p className="col-span-full rounded-lg border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
            No projects yet — add the first one.
          </p>
        )}
      </div>
    </div>
  );
}
